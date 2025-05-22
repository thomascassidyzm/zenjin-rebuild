// PaymentProcessor.ts - Main implementation

import { PaymentProcessingInterface, PaymentDetails, PaymentResult, PaymentRecord } from './PaymentProcessorTypes';
import { PaymentGatewayAdapter } from './PaymentGatewayAdapter';
import { PaymentRepositoryInterface } from './PaymentProcessorTypes';
import { logger } from './PaymentProcessorLogger';
import { validatePaymentDetails } from './PaymentProcessorValidators';
import { formatTimestamp, generateUniqueId } from './PaymentProcessorUtils';
import {
  USER_NOT_FOUND,
  INVALID_PAYMENT_DETAILS,
  PAYMENT_PROCESSING_FAILED,
  PAYMENT_NOT_FOUND,
  ALREADY_REFUNDED,
  REFUND_WINDOW_EXPIRED,
  REFUND_FAILED
} from './PaymentProcessorErrors';

/**
 * Implementation of the PaymentProcessor component that handles payment processing
 * for premium subscriptions in the Zenjin Maths App
 */
export class PaymentProcessor implements PaymentProcessingInterface {
  private paymentGateway: PaymentGatewayAdapter;
  private paymentRepository: PaymentRepositoryInterface;
  private readonly REFUND_WINDOW_DAYS = 30; // Refund window in days

  /**
   * Creates a new instance of the PaymentProcessor
   * @param paymentGateway - The payment gateway adapter to use
   * @param paymentRepository - The payment repository to use
   */
  constructor(
    paymentGateway: PaymentGatewayAdapter,
    paymentRepository: PaymentRepositoryInterface
  ) {
    this.paymentGateway = paymentGateway;
    this.paymentRepository = paymentRepository;
  }

  /**
   * Processes a payment for a user
   * @param userId - User identifier
   * @param paymentDetails - Payment details
   * @returns Result of the payment processing
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws INVALID_PAYMENT_DETAILS if the payment details are invalid
   * @throws PAYMENT_PROCESSING_FAILED if the payment processing failed
   */
  async processPayment(userId: string, paymentDetails: PaymentDetails): Promise<PaymentResult> {
    logger.info(`Processing payment for user ${userId}`, { userId });

    // Check if user exists
    const userExists = await this.paymentRepository.userExists(userId);
    if (!userExists) {
      logger.error(`User not found: ${userId}`, { userId });
      throw new Error(USER_NOT_FOUND);
    }

    // Validate payment details
    const validationError = validatePaymentDetails(paymentDetails);
    if (validationError) {
      logger.error(`Invalid payment details: ${validationError}`, { userId });
      throw new Error(`${INVALID_PAYMENT_DETAILS}: ${validationError}`);
    }

    try {
      // Generate a unique payment ID
      const paymentId = generateUniqueId('pay');

      // Process payment with the gateway
      const gatewayResult = await this.paymentGateway.processPayment(
        paymentId,
        userId,
        paymentDetails
      );

      // Prepare payment result
      const result: PaymentResult = {
        success: gatewayResult.success,
        paymentId: paymentId,
        transactionId: gatewayResult.transactionId,
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        timestamp: formatTimestamp(new Date()),
        status: gatewayResult.success ? 'completed' : 'failed',
        errorCode: gatewayResult.errorCode,
        errorMessage: gatewayResult.errorMessage,
        receiptUrl: gatewayResult.receiptUrl
      };

      // If successful, store payment record
      if (result.success) {
        const paymentRecord: PaymentRecord = {
          paymentId: paymentId,
          userId: userId,
          transactionId: gatewayResult.transactionId!,
          amount: paymentDetails.amount,
          currency: paymentDetails.currency,
          timestamp: result.timestamp,
          status: 'completed',
          method: paymentDetails.method,
          lastFour: paymentDetails.methodDetails.lastFour,
          planId: paymentDetails.metadata?.planId,
          receiptUrl: gatewayResult.receiptUrl
        };

        await this.paymentRepository.savePaymentRecord(paymentRecord);
        logger.info(`Payment processed successfully for user ${userId}`, { 
          userId, 
          paymentId, 
          amount: paymentDetails.amount,
          currency: paymentDetails.currency 
        });
      } else {
        logger.error(`Payment processing failed for user ${userId}`, {
          userId,
          paymentId,
          errorCode: result.errorCode,
          errorMessage: result.errorMessage
        });
      }

      return result;
    } catch (error) {
      logger.error(`Error during payment processing for user ${userId}`, {
        userId,
        error: error.message
      });
      throw new Error(`${PAYMENT_PROCESSING_FAILED}: ${error.message}`);
    }
  }

  /**
   * Gets the payment history for a user
   * @param userId - User identifier
   * @returns Payment history for the user
   * @throws USER_NOT_FOUND if the specified user was not found
   */
  async getPaymentHistory(userId: string): Promise<PaymentRecord[]> {
    logger.info(`Retrieving payment history for user ${userId}`, { userId });

    // Check if user exists
    const userExists = await this.paymentRepository.userExists(userId);
    if (!userExists) {
      logger.error(`User not found: ${userId}`, { userId });
      throw new Error(USER_NOT_FOUND);
    }

    // Get payment history from repository
    try {
      const history = await this.paymentRepository.getPaymentRecords(userId);
      logger.info(`Retrieved ${history.length} payment records for user ${userId}`, { userId });
      return history;
    } catch (error) {
      logger.error(`Error retrieving payment history for user ${userId}`, {
        userId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Refunds a payment
   * @param paymentId - Payment identifier
   * @param reason - Reason for the refund
   * @returns Result of the refund operation
   * @throws PAYMENT_NOT_FOUND if the specified payment was not found
   * @throws REFUND_FAILED if the refund operation failed
   * @throws ALREADY_REFUNDED if the payment has already been refunded
   * @throws REFUND_WINDOW_EXPIRED if the refund window has expired
   */
  async refundPayment(paymentId: string, reason: string): Promise<PaymentResult> {
    logger.info(`Processing refund for payment ${paymentId}`, { paymentId, reason });

    // Get payment record
    const paymentRecord = await this.paymentRepository.getPaymentRecord(paymentId);
    if (!paymentRecord) {
      logger.error(`Payment not found: ${paymentId}`, { paymentId });
      throw new Error(PAYMENT_NOT_FOUND);
    }

    // Check if payment is already refunded
    if (paymentRecord.status === 'refunded') {
      logger.error(`Payment already refunded: ${paymentId}`, { paymentId });
      throw new Error(ALREADY_REFUNDED);
    }

    // Check if refund window has expired
    const paymentDate = new Date(paymentRecord.timestamp);
    const currentDate = new Date();
    const daysDifference = Math.floor(
      (currentDate.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysDifference > this.REFUND_WINDOW_DAYS) {
      logger.error(`Refund window expired for payment ${paymentId}`, { 
        paymentId, 
        daysDifference,
        refundWindowDays: this.REFUND_WINDOW_DAYS 
      });
      throw new Error(REFUND_WINDOW_EXPIRED);
    }

    try {
      // Generate refund ID
      const refundId = generateUniqueId('ref');

      // Process refund with the gateway
      const gatewayResult = await this.paymentGateway.refundPayment(
        paymentRecord.transactionId,
        paymentRecord.amount,
        refundId
      );

      if (!gatewayResult.success) {
        logger.error(`Gateway refund failed for payment ${paymentId}`, {
          paymentId,
          errorCode: gatewayResult.errorCode,
          errorMessage: gatewayResult.errorMessage
        });
        throw new Error(`${REFUND_FAILED}: ${gatewayResult.errorMessage}`);
      }

      // Update payment record with refund information
      const updatedPaymentRecord: PaymentRecord = {
        ...paymentRecord,
        status: 'refunded',
        refund: {
          refundId: refundId,
          amount: paymentRecord.amount,
          timestamp: formatTimestamp(new Date()),
          reason: reason
        }
      };

      // Save updated payment record
      await this.paymentRepository.updatePaymentRecord(updatedPaymentRecord);

      // Prepare result
      const result: PaymentResult = {
        success: true,
        paymentId: paymentId,
        transactionId: paymentRecord.transactionId,
        amount: paymentRecord.amount,
        currency: paymentRecord.currency,
        timestamp: formatTimestamp(new Date()),
        status: 'refunded',
        receiptUrl: paymentRecord.receiptUrl
      };

      logger.info(`Refund processed successfully for payment ${paymentId}`, { 
        paymentId, 
        refundId, 
        amount: paymentRecord.amount 
      });

      return result;
    } catch (error) {
      logger.error(`Error during refund processing for payment ${paymentId}`, {
        paymentId,
        error: error.message
      });
      throw new Error(`${REFUND_FAILED}: ${error.message}`);
    }
  }
}