# PaymentProcessor Implementation Package

## Implementation Goal

Implement the PaymentProcessor component for the Zenjin Maths App that handles payment processing for premium subscriptions. This component is responsible for securely processing payments, managing payment history, and handling refund operations while adhering to PCI DSS compliance standards.

## Interface Definition

```typescript
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
```

## Module Context

The PaymentProcessor is a critical component of the SubscriptionSystem module, which manages subscription tiers (Anonymous, Free, Premium) and controls access to content and features based on the user's subscription level. The SubscriptionSystem module has the following components:

1. **SubscriptionManager**: Manages user subscription tiers and status
2. **ContentAccessController**: Controls access to content based on subscription tier
3. **PaymentProcessor**: Handles payment processing for premium subscriptions
4. **AnonymousUserManager**: Manages anonymous users with temporary access

The PaymentProcessor component is responsible for:
- Processing payments for premium subscriptions
- Maintaining payment history for users
- Handling refund operations
- Ensuring secure payment processing in compliance with PCI DSS standards

### Dependencies

The PaymentProcessor has no direct dependencies on other components within the system, but it is used by:

1. **SubscriptionManager**: To process payments when users upgrade to premium subscriptions

### Payment Processing Flow

The payment processing flow in the Zenjin Maths App is as follows:

1. User selects a premium subscription plan
2. SubscriptionManager collects payment details
3. SubscriptionManager calls PaymentProcessor to process the payment
4. PaymentProcessor securely processes the payment with a payment gateway
5. PaymentProcessor returns the result to SubscriptionManager
6. SubscriptionManager updates the user's subscription based on the payment result

## Implementation Requirements

### Payment Processing

1. **Secure Payment Handling**:
   - All payment processing must follow PCI DSS compliance standards
   - Sensitive payment information must never be stored
   - Payment tokens should be used instead of raw card details
   - All payment data must be transmitted securely

2. **Payment Methods Support**:
   - Credit/debit cards
   - PayPal
   - Apple Pay
   - Google Pay
   - Support for adding new payment methods in the future

3. **Transaction Management**:
   - Generate unique transaction IDs for all payments
   - Maintain accurate transaction records
   - Support for recurring billing for subscription renewals

### Payment History

1. **History Tracking**:
   - Maintain complete payment history for each user
   - Include all relevant payment details in history records
   - Support filtering and sorting of payment history

2. **Receipt Generation**:
   - Generate receipts for all successful payments
   - Provide receipt URLs for users to access their receipts
   - Include all legally required information on receipts

### Refund Processing

1. **Refund Policies**:
   - Support full and partial refunds
   - Enforce refund window limitations
   - Require reason documentation for all refunds

2. **Refund Tracking**:
   - Link refunds to original payments
   - Update payment status when refunded
   - Maintain refund history

### Error Handling

1. **Payment Failures**:
   - Provide clear error messages for payment failures
   - Categorize errors appropriately (e.g., insufficient funds, declined card)
   - Support retry mechanisms for transient failures

2. **Logging and Monitoring**:
   - Log all payment attempts (successful and failed)
   - Monitor for suspicious payment activity
   - Alert on unusual payment patterns

### Performance Requirements

1. **Response Time**:
   - Payment processing must complete within 5 seconds
   - Payment history retrieval must complete within 1 second

2. **Reliability**:
   - Implement idempotent payment operations
   - Handle network interruptions gracefully
   - Ensure payment status consistency

## Mock Inputs and Expected Outputs

### processPayment(userId, paymentDetails)

**Input**:
```json
{
  "userId": "user123",
  "paymentDetails": {
    "method": "card",
    "amount": 4.99,
    "currency": "USD",
    "methodDetails": {
      "token": "tok_visa",
      "lastFour": "4242",
      "expiryMonth": 12,
      "expiryYear": 2025
    },
    "billingInfo": {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "address": {
        "line1": "123 Main St",
        "city": "Anytown",
        "state": "CA",
        "postalCode": "12345",
        "country": "US"
      }
    },
    "metadata": {
      "planId": "premium-monthly",
      "source": "web"
    }
  }
}
```

**Expected Output**:
```json
{
  "success": true,
  "paymentId": "pay_1234567890",
  "transactionId": "txn_1234567890",
  "amount": 4.99,
  "currency": "USD",
  "timestamp": "2025-05-20T15:30:45Z",
  "status": "completed",
  "receiptUrl": "https://receipts.zenjin.com/pay_1234567890"
}
```

### getPaymentHistory(userId)

**Input**:
```json
{
  "userId": "user123"
}
```

**Expected Output**:
```json
[
  {
    "paymentId": "pay_1234567890",
    "userId": "user123",
    "transactionId": "txn_1234567890",
    "amount": 4.99,
    "currency": "USD",
    "timestamp": "2025-05-20T15:30:45Z",
    "status": "completed",
    "method": "card",
    "lastFour": "4242",
    "planId": "premium-monthly",
    "receiptUrl": "https://receipts.zenjin.com/pay_1234567890"
  },
  {
    "paymentId": "pay_0987654321",
    "userId": "user123",
    "transactionId": "txn_0987654321",
    "amount": 12.99,
    "currency": "USD",
    "timestamp": "2025-02-20T10:15:30Z",
    "status": "refunded",
    "method": "paypal",
    "planId": "premium-quarterly",
    "receiptUrl": "https://receipts.zenjin.com/pay_0987654321",
    "refund": {
      "refundId": "ref_0987654321",
      "amount": 12.99,
      "timestamp": "2025-02-25T14:20:10Z",
      "reason": "Customer request - switched to monthly plan"
    }
  }
]
```

### refundPayment(paymentId, reason)

**Input**:
```json
{
  "paymentId": "pay_1234567890",
  "reason": "Customer request - not satisfied with service"
}
```

**Expected Output**:
```json
{
  "success": true,
  "paymentId": "pay_1234567890",
  "transactionId": "txn_1234567890",
  "amount": 4.99,
  "currency": "USD",
  "timestamp": "2025-05-20T16:45:30Z",
  "status": "refunded",
  "receiptUrl": "https://receipts.zenjin.com/pay_1234567890"
}
```

## Validation Criteria

### SS-003: Secure Payment Processing

The PaymentProcessor must securely process payments and handle errors appropriately:

1. **PCI DSS Compliance**:
   - No sensitive payment data should be stored
   - All payment processing should use tokenization
   - Secure transmission of payment data must be ensured

2. **Error Handling**:
   - All payment errors must be properly categorized
   - Clear error messages must be provided
   - Appropriate error codes must be returned

3. **Payment Verification**:
   - All payments must be verified before confirming
   - Duplicate payments must be prevented
   - Fraud detection measures must be implemented

4. **Refund Processing**:
   - Refunds must be processed correctly
   - Refund limits must be enforced
   - Refund history must be maintained

## Usage Example

```typescript
import { PaymentProcessor } from './components/PaymentProcessor';

// Create payment processor
const paymentProcessor = new PaymentProcessor();

// Process a payment
async function processUserPayment(userId: string, planId: string, amount: number) {
  try {
    // Collect payment details from user (in a real app, this would be from a form)
    const paymentDetails = {
      method: 'card',
      amount: amount,
      currency: 'USD',
      methodDetails: {
        token: 'tok_visa', // Token from payment form
        lastFour: '4242',
        expiryMonth: 12,
        expiryYear: 2025
      },
      billingInfo: {
        name: 'John Doe',
        email: 'john.doe@example.com'
      },
      metadata: {
        planId: planId,
        source: 'web'
      }
    };
    
    // Process the payment
    const result = await paymentProcessor.processPayment(userId, paymentDetails);
    
    if (result.success) {
      console.log(`Payment successful! Payment ID: ${result.paymentId}`);
      console.log(`Receipt URL: ${result.receiptUrl}`);
      return result.paymentId;
    } else {
      console.error(`Payment failed: ${result.errorMessage}`);
      return null;
    }
  } catch (error) {
    console.error(`Error processing payment: ${error.message}`);
    return null;
  }
}

// Get payment history
async function getUserPaymentHistory(userId: string) {
  try {
    const history = await paymentProcessor.getPaymentHistory(userId);
    
    console.log(`Payment history for user ${userId}:`);
    history.forEach(payment => {
      console.log(`- ${payment.timestamp}: ${payment.amount} ${payment.currency} (${payment.status})`);
      if (payment.status === 'refunded' && payment.refund) {
        console.log(`  Refunded on ${payment.refund.timestamp}: ${payment.refund.reason}`);
      }
    });
    
    return history;
  } catch (error) {
    console.error(`Error retrieving payment history: ${error.message}`);
    return [];
  }
}

// Process a refund
async function refundUserPayment(paymentId: string, reason: string) {
  try {
    const result = await paymentProcessor.refundPayment(paymentId, reason);
    
    if (result.success) {
      console.log(`Refund successful for payment ${paymentId}`);
      return true;
    } else {
      console.error(`Refund failed: ${result.errorMessage}`);
      return false;
    }
  } catch (error) {
    console.error(`Error processing refund: ${error.message}`);
    return false;
  }
}

// Example usage
async function main() {
  const userId = 'user123';
  const planId = 'premium-monthly';
  const amount = 4.99;
  
  // Process a payment
  const paymentId = await processUserPayment(userId, planId, amount);
  
  if (paymentId) {
    // Get payment history
    await getUserPaymentHistory(userId);
    
    // Process a refund (if needed)
    const refundReason = 'Customer request - changed mind';
    await refundUserPayment(paymentId, refundReason);
    
    // Get updated payment history
    await getUserPaymentHistory(userId);
  }
}

main().catch(console.error);
```

## Implementation Notes

### Payment Gateway Integration

The PaymentProcessor should integrate with a payment gateway to handle actual payment processing:

1. **Gateway Selection**:
   - Choose a reliable payment gateway with good documentation
   - Ensure the gateway supports all required payment methods
   - Consider transaction fees and pricing structure

2. **Integration Approach**:
   - Use the gateway's official SDK or API
   - Implement a gateway adapter pattern for potential future gateway changes
   - Test integration thoroughly in sandbox environment

### Security Considerations

The PaymentProcessor must implement robust security measures:

1. **Data Protection**:
   - Never store sensitive payment data
   - Use tokenization for all payment methods
   - Encrypt all payment-related data in transit and at rest

2. **Authentication and Authorization**:
   - Verify user identity before processing payments
   - Implement proper access controls for payment operations
   - Use secure API keys for gateway communication

3. **Fraud Prevention**:
   - Implement basic fraud detection measures
   - Monitor for suspicious payment patterns
   - Use address verification and CVV validation

### Error Handling Strategy

Implement a comprehensive error handling strategy:

1. **Error Categorization**:
   - Technical errors (network issues, timeouts)
   - Validation errors (invalid card, expired card)
   - Business logic errors (insufficient funds, fraud detection)
   - Gateway errors (gateway down, processing error)

2. **Retry Logic**:
   - Implement retry logic for transient errors
   - Use exponential backoff for retries
   - Set maximum retry attempts

3. **User Feedback**:
   - Provide clear, actionable error messages to users
   - Suggest solutions for common errors
   - Log detailed error information for debugging

### Testing Strategy

Implement a thorough testing strategy:

1. **Unit Testing**:
   - Test all payment processing logic
   - Mock gateway responses for different scenarios
   - Test error handling and edge cases

2. **Integration Testing**:
   - Test integration with the payment gateway in sandbox mode
   - Test all supported payment methods
   - Test refund processing

3. **Security Testing**:
   - Perform security audits of payment processing code
   - Test for common vulnerabilities
   - Verify PCI DSS compliance
