import {
  SubscriptionManagerInterface,
  SubscriptionPlan,
  UserSubscription,
  PaymentProcessingInterface,
  ContentAccessControllerInterface,
  ERRORS
} from './SubscriptionManagerInterfaces';

/**
 * Implementation of the SubscriptionManager component
 * Manages user subscription tiers and status for the Zenjin Maths App
 */
export class SubscriptionManager implements SubscriptionManagerInterface {
  private subscriptionPlans: SubscriptionPlan[];
  private userSubscriptions: Map<string, UserSubscription>;

  /**
   * Creates a new SubscriptionManager instance
   * @param paymentProcessor - The payment processor to use for premium subscriptions
   * @param contentAccessController - The content access controller to notify of subscription changes
   */
  constructor(
    private paymentProcessor: PaymentProcessingInterface,
    private contentAccessController?: ContentAccessControllerInterface
  ) {
    // Initialize subscription plans
    this.subscriptionPlans = this.initializeSubscriptionPlans();
    this.userSubscriptions = new Map<string, UserSubscription>();
  }

  /**
   * Gets all available subscription plans
   * @returns Array of subscription plans
   */
  public getSubscriptionPlans(): SubscriptionPlan[] {
    return [...this.subscriptionPlans];
  }

  /**
   * Gets the current subscription for a user
   * @param userId - User identifier
   * @returns User's current subscription
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws NO_SUBSCRIPTION if the user has no active subscription
   */
  public getUserSubscription(userId: string): UserSubscription {
    this.validateUserExists(userId);
    
    const subscription = this.userSubscriptions.get(userId);
    if (!subscription) {
      throw new Error(ERRORS.NO_SUBSCRIPTION);
    }
    
    return { ...subscription };
  }

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
  public async createSubscription(
    userId: string,
    planId: string,
    paymentMethod?: string,
    autoRenew: boolean = true
  ): Promise<UserSubscription> {
    try {
      // Validate user, plan, and check for existing subscription
      this.validateUserExists(userId);
      const plan = this.validatePlanExists(planId);
      
      // Check if user already has a subscription
      if (this.userSubscriptions.has(userId)) {
        const existingSubscription = this.userSubscriptions.get(userId)!;
        if (existingSubscription.status === 'active') {
          throw new Error(ERRORS.SUBSCRIPTION_EXISTS);
        }
      }
      
      // Handle payment for premium plans
      if (plan.price > 0) {
        if (!paymentMethod) {
          throw new Error(ERRORS.PAYMENT_METHOD_INVALID);
        }
        
        // Process payment through payment processor
        const paymentResult = await this.paymentProcessor.processPayment({
          userId,
          planId,
          amount: plan.price,
          currency: plan.currency,
          paymentMethod
        });
        
        if (!paymentResult.success) {
          throw new Error(paymentResult.errorMessage || ERRORS.CREATION_FAILED);
        }
      }
      
      // Calculate dates based on billing cycle
      const now = new Date();
      const startDate = now.toISOString();
      const nextBillingDate = this.calculateNextBillingDate(now, plan.billingCycle);
      
      // Create subscription object
      const newSubscription: UserSubscription = {
        userId,
        planId,
        status: 'active',
        startDate,
        autoRenew,
        lastBillingDate: startDate,
        nextBillingDate: nextBillingDate || undefined,
        paymentMethod: paymentMethod || undefined
      };
      
      // Store the subscription
      this.userSubscriptions.set(userId, newSubscription);
      
      // Notify content access controller if available
      if (this.contentAccessController) {
        this.contentAccessController.updateUserAccess(userId, planId);
      }
      
      return { ...newSubscription };
    } catch (error) {
      // Log error and rethrow
      console.error(`Failed to create subscription for user ${userId}:`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(ERRORS.CREATION_FAILED);
    }
  }

  /**
   * Cancels a user's subscription
   * @param userId - User identifier
   * @param endImmediately - Whether to end the subscription immediately (defaults to false)
   * @returns Whether the cancellation was successful
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws NO_SUBSCRIPTION if the user has no active subscription
   * @throws CANCELLATION_FAILED if failed to cancel the subscription
   */
  public async cancelSubscription(userId: string, endImmediately: boolean = false): Promise<boolean> {
    try {
      this.validateUserExists(userId);
      
      const subscription = this.userSubscriptions.get(userId);
      if (!subscription || subscription.status !== 'active') {
        throw new Error(ERRORS.NO_SUBSCRIPTION);
      }
      
      // If premium plan, handle payment cancellation
      const plan = this.getPlanById(subscription.planId);
      if (plan && plan.price > 0 && subscription.paymentMethod) {
        // Process cancellation through payment processor
        const cancellationResult = await this.paymentProcessor.cancelSubscription({
          userId,
          planId: subscription.planId,
          immediate: endImmediately
        });
        
        if (!cancellationResult.success) {
          throw new Error(cancellationResult.errorMessage || ERRORS.CANCELLATION_FAILED);
        }
      }
      
      // Update subscription status
      const updatedSubscription = { ...subscription };
      if (endImmediately) {
        updatedSubscription.status = 'expired';
        updatedSubscription.endDate = new Date().toISOString();
        
        // If ending immediately, downgrade to free plan
        if (this.contentAccessController) {
          this.contentAccessController.updateUserAccess(userId, 'free');
        }
      } else {
        updatedSubscription.status = 'canceled';
        updatedSubscription.autoRenew = false;
        // End date will be the next billing date
        updatedSubscription.endDate = updatedSubscription.nextBillingDate;
      }
      
      // Store updated subscription
      this.userSubscriptions.set(userId, updatedSubscription);
      
      return true;
    } catch (error) {
      console.error(`Failed to cancel subscription for user ${userId}:`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(ERRORS.CANCELLATION_FAILED);
    }
  }

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
  public async updateSubscription(
    userId: string,
    updates: {
      planId?: string;
      autoRenew?: boolean;
      paymentMethod?: string;
    }
  ): Promise<UserSubscription> {
    try {
      this.validateUserExists(userId);
      
      const subscription = this.userSubscriptions.get(userId);
      if (!subscription || subscription.status !== 'active') {
        throw new Error(ERRORS.NO_SUBSCRIPTION);
      }
      
      const updatedSubscription = { ...subscription };
      let planChanged = false;
      
      // Handle plan change if specified
      if (updates.planId && updates.planId !== subscription.planId) {
        const newPlan = this.validatePlanExists(updates.planId);
        const currentPlan = this.getPlanById(subscription.planId);
        
        if (!currentPlan) {
          throw new Error(ERRORS.PLAN_NOT_FOUND);
        }
        
        // Handle payment changes if switching between paid plans or from free to paid
        if (newPlan.price > 0) {
          const paymentMethod = updates.paymentMethod || subscription.paymentMethod;
          if (!paymentMethod) {
            throw new Error(ERRORS.PAYMENT_METHOD_INVALID);
          }
          
          // Calculate prorated amount if switching plans
          let proratedAmount = 0;
          if (currentPlan.price > 0) {
            // Calculate remaining days in current cycle
            const now = new Date();
            const nextBillingDate = subscription.nextBillingDate 
              ? new Date(subscription.nextBillingDate) 
              : now;
            const daysRemaining = Math.max(0, Math.ceil((nextBillingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
            const totalDays = this.getBillingCycleDays(currentPlan.billingCycle);
            
            // Calculate prorated refund for current plan
            const refundAmount = (currentPlan.price * daysRemaining) / totalDays;
            
            // Calculate prorated charge for new plan
            const chargeAmount = (newPlan.price * daysRemaining) / this.getBillingCycleDays(newPlan.billingCycle);
            
            proratedAmount = chargeAmount - refundAmount;
          } else {
            // Switching from free to paid - charge full amount
            proratedAmount = newPlan.price;
          }
          
          // Process payment for plan change
          if (proratedAmount > 0) {
            const paymentResult = await this.paymentProcessor.processPayment({
              userId,
              planId: updates.planId,
              amount: proratedAmount,
              currency: newPlan.currency,
              paymentMethod
            });
            
            if (!paymentResult.success) {
              throw new Error(paymentResult.errorMessage || ERRORS.UPDATE_FAILED);
            }
          }
          
          // Update subscription with new plan details
          updatedSubscription.planId = updates.planId;
          updatedSubscription.paymentMethod = paymentMethod;
          const now = new Date();
          updatedSubscription.lastBillingDate = now.toISOString();
          updatedSubscription.nextBillingDate = this.calculateNextBillingDate(now, newPlan.billingCycle);
          planChanged = true;
        } else {
          // Switching from paid to free
          if (currentPlan.price > 0) {
            // Process cancellation of paid plan
            const cancellationResult = await this.paymentProcessor.cancelSubscription({
              userId,
              planId: subscription.planId,
              immediate: true
            });
            
            if (!cancellationResult.success) {
              throw new Error(cancellationResult.errorMessage || ERRORS.UPDATE_FAILED);
            }
          }
          
          // Update subscription to free plan
          updatedSubscription.planId = updates.planId;
          updatedSubscription.paymentMethod = undefined;
          updatedSubscription.nextBillingDate = undefined;
          planChanged = true;
        }
      }
      
      // Update payment method if specified
      if (updates.paymentMethod && updates.paymentMethod !== subscription.paymentMethod) {
        updatedSubscription.paymentMethod = updates.paymentMethod;
      }
      
      // Update auto-renew if specified
      if (updates.autoRenew !== undefined && updates.autoRenew !== subscription.autoRenew) {
        updatedSubscription.autoRenew = updates.autoRenew;
      }
      
      // Store updated subscription
      this.userSubscriptions.set(userId, updatedSubscription);
      
      // Notify content access controller if plan changed
      if (planChanged && this.contentAccessController) {
        this.contentAccessController.updateUserAccess(userId, updatedSubscription.planId);
      }
      
      return { ...updatedSubscription };
    } catch (error) {
      console.error(`Failed to update subscription for user ${userId}:`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(ERRORS.UPDATE_FAILED);
    }
  }

  /**
   * Checks if a user has an active subscription
   * @param userId - User identifier
   * @returns Subscription status
   * @throws USER_NOT_FOUND if the specified user was not found
   */
  public checkSubscriptionStatus(userId: string): {
    hasActiveSubscription: boolean;
    planId?: string;
    daysRemaining?: number;
  } {
    this.validateUserExists(userId);
    
    const subscription = this.userSubscriptions.get(userId);
    if (!subscription || subscription.status !== 'active') {
      return { hasActiveSubscription: false };
    }
    
    // Calculate days remaining in current billing cycle
    let daysRemaining: number | undefined;
    if (subscription.nextBillingDate) {
      const now = new Date();
      const nextBillingDate = new Date(subscription.nextBillingDate);
      daysRemaining = Math.max(0, Math.ceil((nextBillingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    }
    
    return {
      hasActiveSubscription: true,
      planId: subscription.planId,
      daysRemaining
    };
  }
  
  // Helper methods
  
  /**
   * Initializes the available subscription plans
   * @returns Array of subscription plans
   */
  private initializeSubscriptionPlans(): SubscriptionPlan[] {
    return [
      {
        id: "anonymous",
        name: "Anonymous",
        description: "Limited access with no account required",
        price: 0,
        currency: "USD",
        billingCycle: "none",
        features: [
          "10 stitches per tube (30 total)",
          "Local storage only",
          "Limited time access"
        ]
      },
      {
        id: "free",
        name: "Free",
        description: "Basic access with an account",
        price: 0,
        currency: "USD",
        billingCycle: "none",
        features: [
          "10 stitches per tube (30 total)",
          "Cloud storage of progress",
          "Unlimited time access"
        ]
      },
      {
        id: "premium-monthly",
        name: "Premium (Monthly)",
        description: "Full access with monthly billing",
        price: 4.99,
        currency: "USD",
        billingCycle: "monthly",
        features: [
          "Unlimited stitches",
          "Advanced analytics",
          "Priority support"
        ]
      },
      {
        id: "premium-quarterly",
        name: "Premium (Quarterly)",
        description: "Full access with quarterly billing",
        price: 12.99,
        currency: "USD",
        billingCycle: "quarterly",
        features: [
          "Unlimited stitches",
          "Advanced analytics",
          "Priority support",
          "10% discount over monthly"
        ]
      },
      {
        id: "premium-annual",
        name: "Premium (Annual)",
        description: "Full access with annual billing",
        price: 39.99,
        currency: "USD",
        billingCycle: "annual",
        features: [
          "Unlimited stitches",
          "Advanced analytics",
          "Priority support",
          "33% discount over monthly"
        ]
      }
    ];
  }
  
  /**
   * Validates that a user exists
   * @param userId - User identifier
   * @throws USER_NOT_FOUND if the user doesn't exist
   */
  private validateUserExists(userId: string): void {
    // In a real implementation, this would check a user database
    // For this implementation, we'll assume the user exists if the ID is not empty
    if (!userId) {
      throw new Error(ERRORS.USER_NOT_FOUND);
    }
  }
  
  /**
   * Validates that a subscription plan exists
   * @param planId - Plan identifier
   * @returns The subscription plan
   * @throws PLAN_NOT_FOUND if the plan doesn't exist
   */
  private validatePlanExists(planId: string): SubscriptionPlan {
    const plan = this.getPlanById(planId);
    if (!plan) {
      throw new Error(ERRORS.PLAN_NOT_FOUND);
    }
    return plan;
  }
  
  /**
   * Gets a subscription plan by ID
   * @param planId - Plan identifier
   * @returns The subscription plan or undefined if not found
   */
  private getPlanById(planId: string): SubscriptionPlan | undefined {
    return this.subscriptionPlans.find(plan => plan.id === planId);
  }
  
  /**
   * Calculates the next billing date based on the current date and billing cycle
   * @param currentDate - Current date
   * @param billingCycle - Billing cycle
   * @returns ISO date string of the next billing date or null if no billing cycle
   */
  private calculateNextBillingDate(currentDate: Date, billingCycle: string): string | null {
    const nextDate = new Date(currentDate);
    
    switch (billingCycle) {
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'annual':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      default:
        return null;
    }
    
    return nextDate.toISOString();
  }
  
  /**
   * Gets the number of days in a billing cycle
   * @param billingCycle - Billing cycle
   * @returns Number of days
   */
  private getBillingCycleDays(billingCycle: string): number {
    switch (billingCycle) {
      case 'monthly':
        return 30;
      case 'quarterly':
        return 90;
      case 'annual':
        return 365;
      default:
        return 0;
    }
  }
}

// Create and export singleton instance
// Note: In a real app, you'd inject proper payment processor and content access controller
class MockPaymentProcessor {
  async processPayment(data: any) {
    return { success: true };
  }
  async cancelSubscription(data: any) {
    return { success: true };
  }
}

export const subscriptionManager = new SubscriptionManager(new MockPaymentProcessor());
