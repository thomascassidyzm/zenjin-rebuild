/**
 * StripePaymentService
 * Handles Stripe integration for Premium subscriptions
 * 
 * Implements payment processing for Zenjin Maths subscription tiers
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { PaymentProcessingInterface, PaymentRequest, PaymentResult } from '../engines/SubscriptionManager/SubscriptionManagerInterfaces';

// Stripe price IDs (you'll need to create these in your Stripe dashboard)
const STRIPE_PRICE_IDS = {
  'premium-monthly': import.meta.env.VITE_STRIPE_PRICE_MONTHLY || 'price_monthly',
  'premium-quarterly': import.meta.env.VITE_STRIPE_PRICE_QUARTERLY || 'price_quarterly',
  'premium-annual': import.meta.env.VITE_STRIPE_PRICE_ANNUAL || 'price_annual'
};

export class StripePaymentService implements PaymentProcessingInterface {
  private stripe: Stripe | null = null;
  private stripePromise: Promise<Stripe | null>;

  constructor() {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.warn('⚠️ Stripe publishable key not found in environment');
      this.stripePromise = Promise.resolve(null);
    } else {
      this.stripePromise = loadStripe(publishableKey);
    }
  }

  /**
   * Initialize Stripe instance
   */
  private async getStripe(): Promise<Stripe | null> {
    if (!this.stripe) {
      this.stripe = await this.stripePromise;
    }
    return this.stripe;
  }

  /**
   * Process a subscription payment through Stripe
   */
  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const stripe = await this.getStripe();
      if (!stripe) {
        throw new Error('Stripe not initialized');
      }

      // Call your backend to create a checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: request.userId,
          planId: request.planId,
          priceId: STRIPE_PRICE_IDS[request.planId as keyof typeof STRIPE_PRICE_IDS],
          customerEmail: request.paymentDetails?.email,
          successUrl: `${window.location.origin}?page=subscription-success&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}?page=subscription-cancelled`
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        throw error;
      }

      // If we get here, the redirect happened successfully
      return {
        success: true,
        transactionId: sessionId,
        message: 'Redirecting to payment...'
      };

    } catch (error) {
      console.error('Stripe payment error:', error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  }

  /**
   * Create a customer portal session for subscription management
   */
  async createCustomerPortalSession(userId: string): Promise<{ url: string } | null> {
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      return { url };

    } catch (error) {
      console.error('Portal session error:', error);
      return null;
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(request: { userId: string; planId: string; immediate?: boolean }): Promise<PaymentResult> {
    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: request.userId,
          cancelAtPeriodEnd: !request.immediate
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel subscription');
      }

      return {
        success: true,
        message: request.immediate ? 'Subscription cancelled immediately' : 'Subscription will cancel at period end'
      };

    } catch (error) {
      console.error('Subscription cancellation error:', error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Cancellation failed'
      };
    }
  }

  /**
   * Update payment method (redirects to customer portal)
   */
  async updatePaymentMethod(request: PaymentRequest): Promise<PaymentResult> {
    const portalSession = await this.createCustomerPortalSession(request.userId);
    
    if (portalSession?.url) {
      window.location.href = portalSession.url;
      return {
        success: true,
        message: 'Redirecting to payment method update...'
      };
    }

    return {
      success: false,
      errorMessage: 'Failed to open payment method update'
    };
  }

  /**
   * Check subscription status
   */
  async checkSubscriptionStatus(userId: string): Promise<{
    active: boolean;
    planId?: string;
    currentPeriodEnd?: string;
    cancelAtPeriodEnd?: boolean;
  }> {
    try {
      const response = await fetch(`/api/subscription-status/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to check subscription status');
      }

      return await response.json();

    } catch (error) {
      console.error('Subscription status check error:', error);
      return { active: false };
    }
  }
}

// Export singleton instance
export const stripePaymentService = new StripePaymentService();