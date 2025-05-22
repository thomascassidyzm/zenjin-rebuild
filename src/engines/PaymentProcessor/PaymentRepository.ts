// PaymentRepository.ts - Repository implementations

import { PaymentRecord, PaymentRepositoryInterface } from './PaymentProcessorTypes';
import { logger } from './PaymentProcessorLogger';

/**
 * In-memory payment repository implementation
 */
export class InMemoryPaymentRepository implements PaymentRepositoryInterface {
  /** In-memory storage for payment records */
  private paymentRecords: Map<string, PaymentRecord> = new Map();
  
  /** In-memory storage for user existence */
  private users: Set<string> = new Set();

  /**
   * Creates a new instance of the in-memory payment repository
   * @param existingUsers - Optional set of existing user IDs
   */
  constructor(existingUsers?: string[]) {
    if (existingUsers) {
      existingUsers.forEach(userId => this.users.add(userId));
    }
  }

  /**
   * Checks if a user exists
   * @param userId - User identifier
   * @returns Whether the user exists
   */
  async userExists(userId: string): Promise<boolean> {
    return this.users.has(userId);
  }

  /**
   * Adds a user to the repository
   * @param userId - User identifier
   */
  async addUser(userId: string): Promise<void> {
    this.users.add(userId);
  }

  /**
   * Saves a payment record
   * @param paymentRecord - Payment record to save
   */
  async savePaymentRecord(paymentRecord: PaymentRecord): Promise<void> {
    logger.info(`Saving payment record: ${paymentRecord.paymentId}`, { 
      paymentId: paymentRecord.paymentId,
      userId: paymentRecord.userId 
    });
    
    this.paymentRecords.set(paymentRecord.paymentId, { ...paymentRecord });
  }

  /**
   * Gets a payment record by ID
   * @param paymentId - Payment identifier
   * @returns Payment record or null if not found
   */
  async getPaymentRecord(paymentId: string): Promise<PaymentRecord | null> {
    const record = this.paymentRecords.get(paymentId);
    
    if (!record) {
      logger.warn(`Payment record not found: ${paymentId}`);
      return null;
    }
    
    return { ...record };
  }

  /**
   * Gets payment records for a user
   * @param userId - User identifier
   * @returns Payment records for the user
   */
  async getPaymentRecords(userId: string): Promise<PaymentRecord[]> {
    const records: PaymentRecord[] = [];
    
    this.paymentRecords.forEach(record => {
      if (record.userId === userId) {
        records.push({ ...record });
      }
    });
    
    logger.info(`Retrieved ${records.length} payment records for user ${userId}`, { userId });
    
    // Sort by timestamp (newest first)
    return records.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }

  /**
   * Updates a payment record
   * @param paymentRecord - Updated payment record
   */
  async updatePaymentRecord(paymentRecord: PaymentRecord): Promise<void> {
    logger.info(`Updating payment record: ${paymentRecord.paymentId}`, { 
      paymentId: paymentRecord.paymentId,
      status: paymentRecord.status 
    });
    
    if (!this.paymentRecords.has(paymentRecord.paymentId)) {
      throw new Error(`Payment record not found: ${paymentRecord.paymentId}`);
    }
    
    this.paymentRecords.set(paymentRecord.paymentId, { ...paymentRecord });
  }
}

/**
 * Database payment repository implementation
 */
export class DatabasePaymentRepository implements PaymentRepositoryInterface {
  /** Database client */
  private readonly dbClient: any;
  
  /** Payment records collection name */
  private readonly paymentsCollection: string;
  
  /** Users collection name */
  private readonly usersCollection: string;

  /**
   * Creates a new instance of the database payment repository
   * @param dbClient - Database client
   * @param paymentsCollection - Payment records collection name
   * @param usersCollection - Users collection name
   */
  constructor(
    dbClient: any,
    paymentsCollection: string = 'payments',
    usersCollection: string = 'users'
  ) {
    this.dbClient = dbClient;
    this.paymentsCollection = paymentsCollection;
    this.usersCollection = usersCollection;
  }

  /**
   * Checks if a user exists
   * @param userId - User identifier
   * @returns Whether the user exists
   */
  async userExists(userId: string): Promise<boolean> {
    try {
      // In a real implementation, we would query the database
      // const user = await this.dbClient
      //   .collection(this.usersCollection)
      //   .findOne({ _id: userId });
      
      // return !!user;
      
      // Mock implementation
      return true;
    } catch (error) {
      logger.error(`Error checking user existence: ${error.message}`, {
        userId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Saves a payment record
   * @param paymentRecord - Payment record to save
   */
  async savePaymentRecord(paymentRecord: PaymentRecord): Promise<void> {
    try {
      logger.info(`Saving payment record to database: ${paymentRecord.paymentId}`, { 
        paymentId: paymentRecord.paymentId,
        userId: paymentRecord.userId 
      });
      
      // In a real implementation, we would insert into the database
      // await this.dbClient
      //   .collection(this.paymentsCollection)
      //   .insertOne(paymentRecord);
      
      // Mock implementation
    } catch (error) {
      logger.error(`Error saving payment record: ${error.message}`, {
        paymentId: paymentRecord.paymentId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Gets a payment record by ID
   * @param paymentId - Payment identifier
   * @returns Payment record or null if not found
   */
  async getPaymentRecord(paymentId: string): Promise<PaymentRecord | null> {
    try {
      // In a real implementation, we would query the database
      // const record = await this.dbClient
      //   .collection(this.paymentsCollection)
      //   .findOne({ paymentId });
      
      // return record;
      
      // Mock implementation - return a fake record
      return {
        paymentId,
        userId: 'user123',
        transactionId: 'txn_' + paymentId.substring(4),
        amount: 4.99,
        currency: 'USD',
        timestamp: new Date().toISOString(),
        status: 'completed',
        method: 'card',
        lastFour: '4242',
        planId: 'premium-monthly',
        receiptUrl: `https://receipts.zenjin.com/${paymentId}`
      };
    } catch (error) {
      logger.error(`Error retrieving payment record: ${error.message}`, {
        paymentId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Gets payment records for a user
   * @param userId - User identifier
   * @returns Payment records for the user
   */
  async getPaymentRecords(userId: string): Promise<PaymentRecord[]> {
    try {
      // In a real implementation, we would query the database
      // const records = await this.dbClient
      //   .collection(this.paymentsCollection)
      //   .find({ userId })
      //   .sort({ timestamp: -1 })
      //   .toArray();
      
      // return records;
      
      // Mock implementation - return fake records
      const records: PaymentRecord[] = [
        {
          paymentId: 'pay_1234567890',
          userId,
          transactionId: 'txn_1234567890',
          amount: 4.99,
          currency: 'USD',
          timestamp: new Date().toISOString(),
          status: 'completed',
          method: 'card',
          lastFour: '4242',
          planId: 'premium-monthly',
          receiptUrl: 'https://receipts.zenjin.com/pay_1234567890'
        },
        {
          paymentId: 'pay_0987654321',
          userId,
          transactionId: 'txn_0987654321',
          amount: 12.99,
          currency: 'USD',
          timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'refunded',
          method: 'paypal',
          planId: 'premium-quarterly',
          receiptUrl: 'https://receipts.zenjin.com/pay_0987654321',
          refund: {
            refundId: 'ref_0987654321',
            amount: 12.99,
            timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
            reason: 'Customer request - switched to monthly plan'
          }
        }
      ];
      
      return records;
    } catch (error) {
      logger.error(`Error retrieving payment records: ${error.message}`, {
        userId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Updates a payment record
   * @param paymentRecord - Updated payment record
   */
  async updatePaymentRecord(paymentRecord: PaymentRecord): Promise<void> {
    try {
      logger.info(`Updating payment record in database: ${paymentRecord.paymentId}`, { 
        paymentId: paymentRecord.paymentId,
        status: paymentRecord.status 
      });
      
      // In a real implementation, we would update the database
      // const result = await this.dbClient
      //   .collection(this.paymentsCollection)
      //   .updateOne(
      //     { paymentId: paymentRecord.paymentId },
      //     { $set: paymentRecord }
      //   );
      
      // if (result.matchedCount === 0) {
      //   throw new Error(`Payment record not found: ${paymentRecord.paymentId}`);
      // }
      
      // Mock implementation
    } catch (error) {
      logger.error(`Error updating payment record: ${error.message}`, {
        paymentId: paymentRecord.paymentId,
        error: error.message
      });
      throw error;
    }
  }
}

/**
 * Factory for creating payment repositories
 */
export class PaymentRepositoryFactory {
  /**
   * Creates a payment repository
   * @param type - Repository type ('memory' or 'database')
   * @param config - Repository configuration
   * @returns Payment repository
   */
  static createRepository(
    type: string,
    config?: Record<string, any>
  ): PaymentRepositoryInterface {
    switch (type) {
      case 'memory':
        return new InMemoryPaymentRepository(config?.existingUsers);
      case 'database':
        return new DatabasePaymentRepository(
          config?.dbClient,
          config?.paymentsCollection,
          config?.usersCollection
        );
      default:
        throw new Error(`Unsupported repository type: ${type}`);
    }
  }
}