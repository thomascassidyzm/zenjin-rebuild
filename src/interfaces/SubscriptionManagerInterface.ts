/**
 * SubscriptionManagerInterface.ts
 * Generated from APML Interface Definition
 * Module: SubscriptionSystem
 */

/**
 * 
    Defines the contract for the SubscriptionManager component that manages user subscriptions and content access.
  
 */
/**
 * SubscriptionPlan
 */
export interface SubscriptionPlan {
  id: string; // Unique identifier for the subscription plan
  name: string; // Name of the subscription plan
  description?: string; // Description of the subscription plan
  price: number; // Price of the subscription plan
  currency: string; // Currency code (e.g., 'USD', 'EUR')
  billingCycle: string; // Billing cycle ('monthly', 'quarterly', 'annual')
  features?: string[]; // List of features included in the plan
}

/**
 * UserSubscription
 */
export interface UserSubscription {
  userId: string; // User identifier
  planId: string; // Subscription plan identifier
  status: string; // Subscription status ('active', 'canceled', 'expired', 'trial')
  startDate: string; // ISO date string of subscription start
  endDate?: string; // ISO date string of subscription end
  autoRenew: boolean; // Whether the subscription auto-renews
  paymentMethod?: string; // Payment method identifier
  lastBillingDate?: string; // ISO date string of last billing
  nextBillingDate?: string; // ISO date string of next billing
}

/**
 * Error codes for SubscriptionManagerInterface
 */
export enum SubscriptionManagerErrorCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  NO_SUBSCRIPTION = 'NO_SUBSCRIPTION',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  PLAN_NOT_FOUND = 'PLAN_NOT_FOUND',
  PAYMENT_METHOD_INVALID = 'PAYMENT_METHOD_INVALID',
  SUBSCRIPTION_EXISTS = 'SUBSCRIPTION_EXISTS',
  CREATION_FAILED = 'CREATION_FAILED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  NO_SUBSCRIPTION = 'NO_SUBSCRIPTION',
  CANCELLATION_FAILED = 'CANCELLATION_FAILED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  NO_SUBSCRIPTION = 'NO_SUBSCRIPTION',
  PLAN_NOT_FOUND = 'PLAN_NOT_FOUND',
  PAYMENT_METHOD_INVALID = 'PAYMENT_METHOD_INVALID',
  UPDATE_FAILED = 'UPDATE_FAILED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
}

/**
 * SubscriptionManagerInterface
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
  updateSubscription(userId: string, updates: { planId?: string; autoRenew?: boolean; paymentMethod?: string }): UserSubscription;

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
