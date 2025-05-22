// PaymentProcessorTypes.ts - Interface definitions

/**
 * Represents payment details for processing a payment
 */
export interface PaymentDetails {
  /** Payment method type ('card', 'paypal', 'applepay', 'googlepay') */
  method: string;
  
  /** Payment amount */
  amount: number;
  
  /** Currency code (e.g., 'USD', 'EUR') */
  currency: string;
  
  /** Payment method specific details */
  methodDetails: {
    /** Card token (for card payments) or payment provider token */
    token?: string;
    
    /** Card last four digits (for card payments) */
    lastFour?: string;
    
    /** Card expiry month (for card payments) */
    expiryMonth?: number;
    
    /** Card expiry year (for card payments) */
    expiryYear?: number;
    
    /** Payment provider specific data */
    providerData?: Record<string, any>;
  };
  
  /** Billing information */
  billingInfo?: {
    /** Customer name */
    name?: string;
    
    /** Billing address */
    address?: {
      /** Address line 1 */
      line1?: string;
      
      /** Address line 2 */
      line2?: string;
      
      /** City */
      city?: string;
      
      /** State or province */
      state?: string;
      
      /** Postal code */
      postalCode?: string;
      
      /** Country code */
      country?: string;
    };
    
    /** Customer email */
    email?: string;
  };
  
  /** Metadata for the payment */
  metadata?: Record<string, any>;
}

/**
 * Represents a payment result
 */
export interface PaymentResult {
  /** Whether the payment was successful */
  success: boolean;
  
  /** Payment identifier (if successful) */
  paymentId?: string;
  
  /** Transaction identifier from payment processor */
  transactionId?: string;
  
  /** Error code (if unsuccessful) */
  errorCode?: string;
  
  /** Error message (if unsuccessful) */
  errorMessage?: string;
  
  /** Payment amount */
  amount: number;
  
  /** Currency code */
  currency: string;
  
  /** ISO date string of payment processing time */
  timestamp: string;
  
  /** Payment status ('completed', 'pending', 'failed', 'refunded') */
  status: string;
  
  /** Receipt URL (if available) */
  receiptUrl?: string;
}

/**
 * Represents a payment record in the payment history
 */
export interface PaymentRecord {
  /** Payment identifier */
  paymentId: string;
  
  /** User identifier */
  userId: string;
  
  /** Transaction identifier from payment processor */
  transactionId: string;
  
  /** Payment amount */
  amount: number;
  
  /** Currency code */
  currency: string;
  
  /** ISO date string of payment time */
  timestamp: string;
  
  /** Payment status ('completed', 'pending', 'failed', 'refunded') */
  status: string;
  
  /** Payment method used */
  method: string;
  
  /** Last four digits of payment instrument (if applicable) */
  lastFour?: string;
  
  /** Subscription plan purchased */
  planId?: string;
  
  /** Receipt URL */
  receiptUrl?: string;
  
  /** Refund information (if refunded) */
  refund?: {
    /** Refund identifier */
    refundId: string;
    
    /** Refund amount */
    amount: number;
    
    /** ISO date string of refund time */
    timestamp: string;
    
    /** Reason for refund */
    reason: string;
  };
}

/**
 * Interface for the PaymentProcessor component that handles payment processing for premium subscriptions
 */
export interface PaymentProcessingInterface {
  /**
   * Processes a payment for a user
   * @param userId - User identifier
   * @param paymentDetails - Payment details
   * @returns Result of the payment processing
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws INVALID_PAYMENT_DETAILS if the payment details are invalid
   * @throws PAYMENT_PROCESSING_FAILED if the payment processing failed
   * @throws INSUFFICIENT_FUNDS if the payment method has insufficient funds
   * @throws PAYMENT_METHOD_DECLINED if the payment method was declined
   */
  processPayment(userId: string, paymentDetails: PaymentDetails): Promise<PaymentResult>;
  
  /**
   * Gets the payment history for a user
   * @param userId - User identifier
   * @returns Payment history for the user
   * @throws USER_NOT_FOUND if the specified user was not found
   */
  getPaymentHistory(userId: string): Promise<PaymentRecord[]>;
  
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
  refundPayment(paymentId: string, reason: string): Promise<PaymentResult>;
}

/**
 * Interface for the gateway processing result
 */
export interface GatewayResult {
  /** Whether the operation was successful */
  success: boolean;
  
  /** Transaction identifier from payment processor */
  transactionId?: string;
  
  /** Error code (if unsuccessful) */
  errorCode?: string;
  
  /** Error message (if unsuccessful) */
  errorMessage?: string;
  
  /** Receipt URL (if available) */
  receiptUrl?: string;
}

/**
 * Interface for the payment gateway adapter
 */
export interface PaymentGatewayAdapterInterface {
  /**
   * Processes a payment via the payment gateway
   * @param paymentId - Payment identifier
   * @param userId - User identifier
   * @param paymentDetails - Payment details
   * @returns Result of the gateway operation
   */
  processPayment(
    paymentId: string,
    userId: string,
    paymentDetails: PaymentDetails
  ): Promise<GatewayResult>;
  
  /**
   * Refunds a payment via the payment gateway
   * @param transactionId - Transaction identifier
   * @param amount - Refund amount
   * @param refundId - Refund identifier
   * @returns Result of the gateway operation
   */
  refundPayment(
    transactionId: string,
    amount: number,
    refundId: string
  ): Promise<GatewayResult>;
}

/**
 * Interface for the payment repository
 */
export interface PaymentRepositoryInterface {
  /**
   * Checks if a user exists
   * @param userId - User identifier
   * @returns Whether the user exists
   */
  userExists(userId: string): Promise<boolean>;
  
  /**
   * Saves a payment record
   * @param paymentRecord - Payment record to save
   */
  savePaymentRecord(paymentRecord: PaymentRecord): Promise<void>;
  
  /**
   * Gets a payment record by ID
   * @param paymentId - Payment identifier
   * @returns Payment record or null if not found
   */
  getPaymentRecord(paymentId: string): Promise<PaymentRecord | null>;
  
  /**
   * Gets payment records for a user
   * @param userId - User identifier
   * @returns Payment records for the user
   */
  getPaymentRecords(userId: string): Promise<PaymentRecord[]>;
  
  /**
   * Updates a payment record
   * @param paymentRecord - Updated payment record
   */
  updatePaymentRecord(paymentRecord: PaymentRecord): Promise<void>;
}