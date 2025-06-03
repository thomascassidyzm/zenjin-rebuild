# SubscriptionManager Implementation Package

## Implementation Goal

Implement the SubscriptionManager component for the Zenjin Maths App that manages user subscription tiers and status, handling transitions between Anonymous, Free, and Premium tiers. This component is responsible for enforcing subscription tier limitations, processing payments for premium subscriptions, and managing the transition between subscription tiers.

## Interface Definition

```typescript
/**
 * Represents a subscription plan in the system
 */
export interface SubscriptionPlan {
  /** Unique identifier for the subscription plan */
  id: string;
  
  /** Name of the subscription plan */
  name: string;
  
  /** Description of the subscription plan (optional) */
  description?: string;
  
  /** Price of the subscription plan */
  price: number;
  
  /** Currency code (e.g., 'USD', 'EUR') */
  currency: string;
  
  /** Billing cycle ('monthly', 'quarterly', 'annual') */
  billingCycle: string;
  
  /** List of features included in the plan (optional) */
  features?: string[];
}

/**
 * Represents a user's subscription in the system
 */
export interface UserSubscription {
  /** User identifier */
  userId: string;
  
  /** Subscription plan identifier */
  planId: string;
  
  /** Subscription status ('active', 'canceled', 'expired', 'trial') */
  status: string;
  
  /** ISO date string of subscription start */
  startDate: string;
  
  /** ISO date string of subscription end (optional) */
  endDate?: string;
  
  /** Whether the subscription auto-renews */
  autoRenew: boolean;
  
  /** Payment method identifier (optional) */
  paymentMethod?: string;
  
  /** ISO date string of last billing (optional) */
  lastBillingDate?: string;
  
  /** ISO date string of next billing (optional) */
  nextBillingDate?: string;
}

/**
 * Interface for the SubscriptionManager component that manages user subscriptions and content access
 */
export interface SubscriptionManagerInterface {
  /**
   * Gets all available subscription plans
   * @returns Array of subscription plans
   */
  getSubscriptionPlans(): SubscriptionPlan[];
  
  /**
   * Gets the current subscription for a user
   * @param userId - User identifier
   * @returns User's current subscription
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws NO_SUBSCRIPTION if the user has no active subscription
   */
  getUserSubscription(userId: string): UserSubscription;
  
  /**
   * Creates a new subscription for a user
   * @param userId - User identifier
   * @param planId - Subscription plan identifier
   * @param paymentMethod - Payment method identifier (optional)
   * @param autoRenew - Whether the subscription should auto-renew (defaults to true)
   * @returns Created subscription
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws PLAN_NOT_FOUND if the specified plan was not found
   * @throws PAYMENT_METHOD_INVALID if the payment method is invalid
   * @throws SUBSCRIPTION_EXISTS if the user already has an active subscription
   * @throws CREATION_FAILED if failed to create the subscription
   */
  createSubscription(
    userId: string, 
    planId: string, 
    paymentMethod?: string, 
    autoRenew?: boolean
  ): UserSubscription;
  
  /**
   * Cancels a user's subscription
   * @param userId - User identifier
   * @param endImmediately - Whether to end the subscription immediately (defaults to false)
   * @returns Whether the cancellation was successful
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws NO_SUBSCRIPTION if the user has no active subscription
   * @throws CANCELLATION_FAILED if failed to cancel the subscription
   */
  cancelSubscription(userId: string, endImmediately?: boolean): boolean;
  
  /**
   * Updates a user's subscription
   * @param userId - User identifier
   * @param updates - Subscription updates
   * @returns Updated subscription
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws NO_SUBSCRIPTION if the user has no active subscription
   * @throws PLAN_NOT_FOUND if the specified plan was not found
   * @throws PAYMENT_METHOD_INVALID if the payment method is invalid
   * @throws UPDATE_FAILED if failed to update the subscription
   */
  updateSubscription(
    userId: string, 
    updates: {
      planId?: string;
      autoRenew?: boolean;
      paymentMethod?: string;
    }
  ): UserSubscription;
  
  /**
   * Checks if a user has an active subscription
   * @param userId - User identifier
   * @returns Subscription status
   * @throws USER_NOT_FOUND if the specified user was not found
   */
  checkSubscriptionStatus(userId: string): {
    hasActiveSubscription: boolean;
    planId?: string;
    daysRemaining?: number;
  };
}
```

## Module Context

The SubscriptionManager is a critical component of the SubscriptionSystem module, which manages subscription tiers (Anonymous, Free, Premium) and controls access to content and features based on the user's subscription level. The SubscriptionSystem module has the following components:

1. **SubscriptionManager**: Manages user subscription tiers and status
2. **ContentAccessController**: Controls access to content based on subscription tier
3. **PaymentProcessor**: Handles payment processing for premium subscriptions
4. **AnonymousUserManager**: Manages anonymous users with temporary access

The SubscriptionManager component is responsible for:
- Managing the three subscription tiers (Anonymous, Free, Premium)
- Handling subscription creation, updates, and cancellations
- Checking subscription status and providing tier information
- Integrating with the PaymentProcessor for premium subscriptions

### Dependencies

The SubscriptionManager has the following dependencies:

1. **PaymentProcessingInterface**: Used to process payments for premium subscriptions
2. **ContentAccessControllerInterface**: Notified when subscription changes affect content access

### Subscription Tiers

The Zenjin Maths App has three subscription tiers:

1. **Anonymous**:
   - Same as Free tier but with TTL badge
   - Progress only saved on current device
   - Access to 10 stitches per tube (30 total), each with 20 questions × 5 distractor variations

2. **Free**:
   - Access to 10 stitches per tube (30 total), each with 20 questions × 5 distractor variations
   - Progress saved to user account
   - No time limitation

3. **Premium**:
   - Complete access to all content and advanced features
   - Unlimited stitches per tube
   - Advanced analytics and progress tracking
   - Paid subscription with monthly, quarterly, or annual billing options

## Implementation Requirements

### Subscription Management

1. **Tier Management**:
   - The component must correctly manage the three subscription tiers (Anonymous, Free, Premium)
   - Each tier must provide the correct set of features and limitations
   - Transitions between tiers must be handled correctly

2. **Subscription Lifecycle**:
   - Creation of new subscriptions
   - Updates to existing subscriptions (plan changes, payment method changes)
   - Cancellation of subscriptions (immediate or at the end of the billing period)
   - Automatic renewal of subscriptions

3. **Status Checking**:
   - Provide accurate information about a user's current subscription status
   - Calculate days remaining in the current billing cycle
   - Determine if a subscription is active, canceled, or expired

### Payment Integration

1. **Payment Processing**:
   - Integrate with the PaymentProcessingInterface for premium subscriptions
   - Handle payment failures and retries
   - Support different payment methods

2. **Billing Cycles**:
   - Support monthly, quarterly, and annual billing cycles
   - Calculate correct billing dates
   - Handle prorated charges for plan changes

### Error Handling

1. **Validation**:
   - Validate user IDs, plan IDs, and payment methods
   - Check for existing subscriptions before creating new ones
   - Verify subscription existence before updates or cancellations

2. **Error Reporting**:
   - Provide clear error messages for all failure scenarios
   - Log detailed error information for debugging
   - Return appropriate error codes to callers

### Performance Requirements

1. **Response Time**:
   - All subscription operations must complete within 200ms
   - Status checks must complete within 50ms

2. **Concurrency**:
   - Handle multiple concurrent subscription operations
   - Prevent race conditions during subscription updates

## Mock Inputs and Expected Outputs

### getSubscriptionPlans()

**Input**: None

**Expected Output**:
```json
[
  {
    "id": "anonymous",
    "name": "Anonymous",
    "description": "Limited access with no account required",
    "price": 0,
    "currency": "USD",
    "billingCycle": "none",
    "features": [
      "10 stitches per tube (30 total)",
      "Local storage only",
      "Limited time access"
    ]
  },
  {
    "id": "free",
    "name": "Free",
    "description": "Basic access with an account",
    "price": 0,
    "currency": "USD",
    "billingCycle": "none",
    "features": [
      "10 stitches per tube (30 total)",
      "Cloud storage of progress",
      "Unlimited time access"
    ]
  },
  {
    "id": "premium-monthly",
    "name": "Premium (Monthly)",
    "description": "Full access with monthly billing",
    "price": 4.99,
    "currency": "USD",
    "billingCycle": "monthly",
    "features": [
      "Unlimited stitches",
      "Advanced analytics",
      "Priority support"
    ]
  },
  {
    "id": "premium-quarterly",
    "name": "Premium (Quarterly)",
    "description": "Full access with quarterly billing",
    "price": 12.99,
    "currency": "USD",
    "billingCycle": "quarterly",
    "features": [
      "Unlimited stitches",
      "Advanced analytics",
      "Priority support",
      "10% discount over monthly"
    ]
  },
  {
    "id": "premium-annual",
    "name": "Premium (Annual)",
    "description": "Full access with annual billing",
    "price": 39.99,
    "currency": "USD",
    "billingCycle": "annual",
    "features": [
      "Unlimited stitches",
      "Advanced analytics",
      "Priority support",
      "33% discount over monthly"
    ]
  }
]
```

### getUserSubscription(userId)

**Input**:
```json
{
  "userId": "user123"
}
```

**Expected Output**:
```json
{
  "userId": "user123",
  "planId": "premium-monthly",
  "status": "active",
  "startDate": "2025-04-20T10:30:00Z",
  "endDate": null,
  "autoRenew": true,
  "paymentMethod": "pm_card_visa",
  "lastBillingDate": "2025-04-20T10:30:00Z",
  "nextBillingDate": "2025-05-20T10:30:00Z"
}
```

### createSubscription(userId, planId, paymentMethod, autoRenew)

**Input**:
```json
{
  "userId": "user456",
  "planId": "premium-annual",
  "paymentMethod": "pm_card_visa",
  "autoRenew": true
}
```

**Expected Output**:
```json
{
  "userId": "user456",
  "planId": "premium-annual",
  "status": "active",
  "startDate": "2025-05-20T15:45:30Z",
  "endDate": null,
  "autoRenew": true,
  "paymentMethod": "pm_card_visa",
  "lastBillingDate": "2025-05-20T15:45:30Z",
  "nextBillingDate": "2026-05-20T15:45:30Z"
}
```

### cancelSubscription(userId, endImmediately)

**Input**:
```json
{
  "userId": "user123",
  "endImmediately": false
}
```

**Expected Output**:
```json
true
```

### updateSubscription(userId, updates)

**Input**:
```json
{
  "userId": "user123",
  "updates": {
    "planId": "premium-annual",
    "autoRenew": true
  }
}
```

**Expected Output**:
```json
{
  "userId": "user123",
  "planId": "premium-annual",
  "status": "active",
  "startDate": "2025-04-20T10:30:00Z",
  "endDate": null,
  "autoRenew": true,
  "paymentMethod": "pm_card_visa",
  "lastBillingDate": "2025-05-20T16:20:45Z",
  "nextBillingDate": "2026-05-20T16:20:45Z"
}
```

### checkSubscriptionStatus(userId)

**Input**:
```json
{
  "userId": "user123"
}
```

**Expected Output**:
```json
{
  "hasActiveSubscription": true,
  "planId": "premium-monthly",
  "daysRemaining": 30
}
```

## Validation Criteria

### SS-001: Subscription Tier Management

The SubscriptionManager must correctly manage transitions between Anonymous, Free, and Premium tiers:

1. **Anonymous to Free Transition**:
   - When an anonymous user registers, their subscription should be upgraded to Free
   - All progress and settings should be preserved
   - The TTL limitation should be removed

2. **Free to Premium Transition**:
   - When a free user upgrades to Premium, payment processing must be successful
   - Access to premium features should be granted immediately
   - The subscription should be set to auto-renew by default

3. **Premium to Free Transition**:
   - When a premium subscription is canceled, the user should retain premium access until the end of the billing period
   - After the billing period ends, the user should be downgraded to Free
   - Access to premium features should be revoked

4. **Premium Plan Changes**:
   - Users should be able to switch between monthly, quarterly, and annual premium plans
   - Appropriate prorating should be applied when switching plans
   - Billing dates should be updated correctly

### SS-005: Subscription Tier Features

Each subscription tier must provide the correct set of features and limitations:

1. **Anonymous Tier**:
   - Limited to 10 stitches per tube (30 total)
   - Progress saved only on the current device
   - Time-limited access (TTL)

2. **Free Tier**:
   - Limited to 10 stitches per tube (30 total)
   - Progress saved to user account
   - No time limitation

3. **Premium Tier**:
   - Unlimited stitches
   - Advanced analytics and progress tracking
   - Priority support
   - No time or content limitations

## Usage Example

```typescript
import { SubscriptionManager } from './components/SubscriptionManager';
import { PaymentProcessor } from './components/PaymentProcessor';

// Create dependencies
const paymentProcessor = new PaymentProcessor();

// Create subscription manager
const subscriptionManager = new SubscriptionManager(paymentProcessor);

// Get all subscription plans
const plans = subscriptionManager.getSubscriptionPlans();
console.log(`Available plans: ${plans.length}`);
plans.forEach(plan => {
  console.log(`${plan.name}: ${plan.price} ${plan.currency} (${plan.billingCycle})`);
});

// Check subscription status
try {
  const status = subscriptionManager.checkSubscriptionStatus('user123');
  console.log(`Has active subscription: ${status.hasActiveSubscription}`);
  if (status.hasActiveSubscription) {
    console.log(`Current plan: ${status.planId}`);
    console.log(`Days remaining: ${status.daysRemaining}`);
  }
} catch (error) {
  console.error(`Error checking subscription: ${error.message}`);
}

// Create a new subscription
try {
  const subscription = subscriptionManager.createSubscription(
    'user456',
    'premium-monthly',
    'pm_card_visa',
    true
  );
  
  console.log(`New subscription created: ${subscription.planId}`);
  console.log(`Start date: ${subscription.startDate}`);
  console.log(`Next billing: ${subscription.nextBillingDate}`);
} catch (error) {
  console.error(`Error creating subscription: ${error.message}`);
}

// Update subscription
try {
  const updatedSubscription = subscriptionManager.updateSubscription('user123', {
    planId: 'premium-annual',
    autoRenew: true
  });

  console.log(`Updated to plan: ${updatedSubscription.planId}`);
  console.log(`New end date: ${updatedSubscription.endDate}`);
} catch (error) {
  console.error(`Error updating subscription: ${error.message}`);
}

// Cancel subscription
try {
  const canceled = subscriptionManager.cancelSubscription('user123', false);
  console.log(`Subscription canceled: ${canceled}`);
} catch (error) {
  console.error(`Error canceling subscription: ${error.message}`);
}
```

## Implementation Notes

### Subscription State Management

The SubscriptionManager should maintain subscription state using a reliable storage mechanism. For the Zenjin Maths App, this involves:

1. **Local Storage**: For anonymous users and offline operation
2. **Server Storage**: For registered users when online
3. **Synchronization**: To ensure consistency between local and server storage

### Payment Processing Integration

The SubscriptionManager should delegate all payment processing to the PaymentProcessor component:

1. **Payment Creation**: When creating or upgrading subscriptions
2. **Payment Cancellation**: When canceling subscriptions
3. **Payment Updates**: When changing plans or payment methods

### Error Handling Strategy

The SubscriptionManager should implement a comprehensive error handling strategy:

1. **Input Validation**: Validate all inputs before processing
2. **Error Types**: Use specific error types for different failure scenarios
3. **Retry Logic**: Implement retry logic for transient failures
4. **Logging**: Log all errors with appropriate context for debugging

### Security Considerations

The SubscriptionManager must implement appropriate security measures:

1. **Payment Information**: Never store sensitive payment information
2. **Access Control**: Verify user identity before subscription operations
3. **Audit Trail**: Maintain an audit trail of all subscription changes
4. **Rate Limiting**: Implement rate limiting to prevent abuse
