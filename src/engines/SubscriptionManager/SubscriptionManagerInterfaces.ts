/**
 * Error constants for the SubscriptionManager component
 */
export const ERRORS = {
  USER_NOT_FOUND: 'User not found',
  PLAN_NOT_FOUND: 'Subscription plan not found',
  NO_SUBSCRIPTION: 'No active subscription found for this user',
  PAYMENT_METHOD_INVALID: 'Invalid payment method',
  SUBSCRIPTION_EXISTS: 'User already has an active subscription',
  CREATION_FAILED: 'Failed to create subscription',
  CANCELLATION_FAILED: 'Failed to cancel subscription',
  UPDATE_FAILED: 'Failed to update subscription'
};

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
 * Interface for the payment processing component
 */
export interface PaymentProcessingInterface {
  /**
   * Processes a payment for a subscription
   * @param params - Payment parameters
   * @returns Payment result
   */
  processPayment(params: {
    userId: string;
    planId: string;
    amount: number;
    currency: string;
    paymentMethod: string;
  }): {
    success: boolean;
    transactionId?: string;
    errorMessage?: string;
  };
  
  /**
   * Cancels a subscription payment
   * @param params - Cancellation parameters
   * @returns Cancellation result
   */
  cancelSubscription(params: {
    userId: string;
    planId: string;
    immediate: boolean;
  }): {
    success: boolean;
    errorMessage?: string;
  };
  
  /**
   * Updates a payment method for a subscription
   * @param params - Update parameters
   * @returns Update result
   */
  updatePaymentMethod(params: {
    userId: string;
    paymentMethod: string;
  }): {
    success: boolean;
    errorMessage?: string;
  };
}

/**
 * Interface for the content access controller component
 */
export interface ContentAccessControllerInterface {
  /**
   * Updates a user's access level based on their subscription plan
   * @param userId - User identifier
   * @param planId - Subscription plan identifier
   * @returns Whether the update was successful
   */
  updateUserAccess(userId: string, planId: string): boolean;
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
