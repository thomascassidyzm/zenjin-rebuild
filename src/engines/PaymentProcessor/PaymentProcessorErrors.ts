// PaymentProcessorErrors.ts - Error definitions

/**
 * Error thrown when a user is not found
 */
export const USER_NOT_FOUND = 'USER_NOT_FOUND';

/**
 * Error thrown when payment details are invalid
 */
export const INVALID_PAYMENT_DETAILS = 'INVALID_PAYMENT_DETAILS';

/**
 * Error thrown when payment processing fails
 */
export const PAYMENT_PROCESSING_FAILED = 'PAYMENT_PROCESSING_FAILED';

/**
 * Error thrown when a payment method has insufficient funds
 */
export const INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS';

/**
 * Error thrown when a payment method is declined
 */
export const PAYMENT_METHOD_DECLINED = 'PAYMENT_METHOD_DECLINED';

/**
 * Error thrown when a payment is not found
 */
export const PAYMENT_NOT_FOUND = 'PAYMENT_NOT_FOUND';

/**
 * Error thrown when a refund operation fails
 */
export const REFUND_FAILED = 'REFUND_FAILED';

/**
 * Error thrown when a payment has already been refunded
 */
export const ALREADY_REFUNDED = 'ALREADY_REFUNDED';

/**
 * Error thrown when the refund window has expired
 */
export const REFUND_WINDOW_EXPIRED = 'REFUND_WINDOW_EXPIRED';