/**
 * SubscriptionManagerInterface.ts
 * Generated from APML Interface Definition
 * Module: SubscriptionSystem
 */


/**
 * Defines the contract for the SubscriptionManager component that manages user subscriptions and content access.
 */
/**
 * SubscriptionPlan
 */
export interface SubscriptionPlan {
  /** Unique identifier for the subscription plan */
  id: string;
  /** Name of the subscription plan */
  name: string;
  /** Description of the subscription plan */
  description?: string;
  /** Price of the subscription plan */
  price: number;
  /** Currency code (e.g., 'USD', 'EUR') */
  currency: string;
  /** Billing cycle ('monthly', 'quarterly', 'annual') */
  billingCycle: string;
  /** List of features included in the plan */
  features?: string[];
}

/**
 * UserSubscription
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
  /** ISO date string of subscription end */
  endDate?: string;
  /** Whether the subscription auto-renews */
  autoRenew: boolean;
  /** Payment method identifier */
  paymentMethod?: string;
  /** ISO date string of last billing */
  lastBillingDate?: string;
  /** ISO date string of next billing */
  nextBillingDate?: string;
}

/**
 * Error codes for SubscriptionManagerInterface
 */
export enum SubscriptionManagerErrorCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  NO_SUBSCRIPTION = 'NO_SUBSCRIPTION',
  PLAN_NOT_FOUND = 'PLAN_NOT_FOUND',
  PAYMENT_METHOD_INVALID = 'PAYMENT_METHOD_INVALID',
  SUBSCRIPTION_EXISTS = 'SUBSCRIPTION_EXISTS',
  CREATION_FAILED = 'CREATION_FAILED',
  CANCELLATION_FAILED = 'CANCELLATION_FAILED',
  UPDATE_FAILED = 'UPDATE_FAILED',
}

/**
 * SubscriptionManagerInterface
 */
export interface SubscriptionManagerInterface {
  /**
   * Gets all available subscription plans
   * @returns Array of subscription plans
   */
  getSubscriptionPlans(): any[];

  /**
   * Gets the current subscription for a user
   * @param userId - User identifier
   * @returns User's current subscription
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws NO_SUBSCRIPTION if The user has no active subscription
   */
  getUserSubscription(userId: string): UserSubscription;

  /**
   * Creates a new subscription for a user
   * @param userId - User identifier
   * @param planId - Subscription plan identifier
   * @param paymentMethod - Payment method identifier
   * @param autoRenew - Whether the subscription should auto-renew
   * @returns Created subscription
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws PLAN_NOT_FOUND if The specified plan was not found
   * @throws PAYMENT_METHOD_INVALID if The payment method is invalid
   * @throws SUBSCRIPTION_EXISTS if The user already has an active subscription
   * @throws CREATION_FAILED if Failed to create the subscription
   */
  createSubscription(userId: string, planId: string, paymentMethod?: string, autoRenew?: boolean): UserSubscription;

  /**
   * Cancels a user's subscription
   * @param userId - User identifier
   * @param endImmediately - Whether to end the subscription immediately
   * @returns Whether the cancellation was successful
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws NO_SUBSCRIPTION if The user has no active subscription
   * @throws CANCELLATION_FAILED if Failed to cancel the subscription
   */
  cancelSubscription(userId: string, endImmediately?: boolean): boolean;

  /**
   * Updates a user's subscription
   * @param userId - User identifier
   * @param updates - Subscription updates
   * @returns Updated subscription
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws NO_SUBSCRIPTION if The user has no active subscription
   * @throws PLAN_NOT_FOUND if The specified plan was not found
   * @throws PAYMENT_METHOD_INVALID if The payment method is invalid
   * @throws UPDATE_FAILED if Failed to update the subscription
   */
  updateSubscription(userId: string, updates: Record<string, any>): UserSubscription;

  /**
   * Checks if a user has an active subscription
   * @param userId - User identifier
   * @returns Subscription status
   * @throws USER_NOT_FOUND if The specified user was not found
   */
  checkSubscriptionStatus(userId: string): { hasActiveSubscription: boolean; planId: string; daysRemaining: number };

}

// Export default interface
export default SubscriptionManagerInterface;
