/**
 * PaymentProcessorAdapter.ts
 * Adapts the complex PaymentProcessor interface to the simplified interface expected by SubscriptionManager
 */

import { PaymentProcessingInterface } from './SubscriptionManagerInterfaces';
import { PaymentProcessor } from '../PaymentProcessor/PaymentProcessor';
import { PaymentDetails } from '../PaymentProcessor/PaymentProcessorTypes';

/**
 * Adapter that bridges the SubscriptionManager's simplified payment interface
 * with the full PaymentProcessor implementation
 */
export class PaymentProcessorAdapter implements PaymentProcessingInterface {
  private paymentProcessor: PaymentProcessor;

  constructor(paymentProcessor: PaymentProcessor) {
    this.paymentProcessor = paymentProcessor;
  }

  /**
   * Processes a payment for a subscription
   * @param params - Payment parameters
   * @returns Payment result
   */
  async processPayment(params: {
    userId: string;
    planId: string;
    amount: number;
    currency: string;
    paymentMethod: string;
  }): Promise<{
    success: boolean;
    transactionId?: string;
    errorMessage?: string;
  }> {
    try {
      // Convert the simplified parameters to the detailed PaymentDetails structure
      const paymentDetails: PaymentDetails = {
        method: 'card', // Default to card for now - could be enhanced
        amount: params.amount,
        currency: params.currency,
        methodDetails: {
          token: params.paymentMethod, // Treat paymentMethod as a token
          lastFour: params.paymentMethod.slice(-4) || '1234', // Extract last 4 or use default
          expiryMonth: 12, // Default expiry month
          expiryYear: 2025 // Default expiry year
        },
        metadata: {
          planId: params.planId
        }
      };

      // Call the full PaymentProcessor
      const result = await this.paymentProcessor.processPayment(params.userId, paymentDetails);

      return {
        success: result.success,
        transactionId: result.transactionId,
        errorMessage: result.errorMessage
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  }

  /**
   * Cancels a subscription payment
   * @param params - Cancellation parameters
   * @returns Cancellation result
   */
  async cancelSubscription(params: {
    userId: string;
    planId: string;
    immediate: boolean;
  }): Promise<{
    success: boolean;
    errorMessage?: string;
  }> {
    try {
      // For subscription cancellation, we would typically need to:
      // 1. Get the payment records for this user/plan
      // 2. Cancel recurring billing
      // 3. Optionally refund if immediate

      // For now, we'll implement a simplified version
      // In a real implementation, this would interact with payment gateway APIs
      
      // Get payment history to find active subscriptions
      const paymentHistory = await this.paymentProcessor.getPaymentHistory(params.userId);
      
      // Find payments related to this plan
      const planPayments = paymentHistory.filter(payment => 
        payment.planId === params.planId && payment.status === 'completed'
      );

      if (planPayments.length === 0) {
        return {
          success: true, // No active payments to cancel
          errorMessage: undefined
        };
      }

      // If immediate cancellation and refund is requested, refund the most recent payment
      if (params.immediate && planPayments.length > 0) {
        const mostRecentPayment = planPayments[planPayments.length - 1];
        
        try {
          await this.paymentProcessor.refundPayment(
            mostRecentPayment.paymentId, 
            'Immediate subscription cancellation'
          );
        } catch (refundError) {
          // Log but don't fail the cancellation if refund fails
          console.warn(`Refund failed during subscription cancellation: ${refundError}`);
        }
      }

      return {
        success: true,
        errorMessage: undefined
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Subscription cancellation failed'
      };
    }
  }

  /**
   * Updates a payment method for a subscription
   * @param params - Update parameters
   * @returns Update result
   */
  async updatePaymentMethod(params: {
    userId: string;
    paymentMethod: string;
  }): Promise<{
    success: boolean;
    errorMessage?: string;
  }> {
    try {
      // In a real implementation, this would update the payment method
      // with the payment gateway for all active subscriptions
      
      // For now, we'll implement a simplified version that just validates
      // the payment method format
      if (!params.paymentMethod || params.paymentMethod.length < 4) {
        return {
          success: false,
          errorMessage: 'Invalid payment method'
        };
      }

      // In a real implementation, you would:
      // 1. Validate the new payment method with the payment gateway
      // 2. Update all active subscriptions to use the new payment method
      // 3. Handle any validation errors from the gateway

      return {
        success: true,
        errorMessage: undefined
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Payment method update failed'
      };
    }
  }
}