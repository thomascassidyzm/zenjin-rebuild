# Stripe Integration Guide for Zenjin Maths

This guide explains how to set up and use the Stripe payment integration for subscription management.

## Overview

The Stripe integration provides:
- Subscription checkout flow
- Customer portal for subscription management
- Automatic subscription status updates via webhooks
- Secure server-side payment processing

## Setup Instructions

### 1. Environment Variables

Add these environment variables to your `.env` file (and Vercel environment settings):

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_... # Your webhook endpoint secret
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... # Your Stripe publishable key

# Stripe Price IDs (create these in Stripe Dashboard)
VITE_STRIPE_PRICE_MONTHLY=price_... # Monthly subscription price ID
VITE_STRIPE_PRICE_QUARTERLY=price_... # Quarterly subscription price ID  
VITE_STRIPE_PRICE_ANNUAL=price_... # Annual subscription price ID

# Supabase (should already exist)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

### 2. Database Setup

Run the migration to add Stripe-related tables and columns:

```sql
-- Run the migration file: database/add_stripe_subscription_tables.sql
```

This adds:
- `stripe_customer_id` and `stripe_subscription_id` columns to `app_users`
- `subscription_events` table for tracking all subscription activities
- `subscription_prices` table for caching price information

### 3. Stripe Dashboard Configuration

1. **Create Products and Prices**:
   - Go to Stripe Dashboard > Products
   - Create a product called "Zenjin Maths Premium"
   - Add three prices:
     - Monthly: $9.99/month
     - Quarterly: $26.97/quarter (10% discount)
     - Annual: $95.88/year (20% discount)
   - Copy the price IDs and add them to your environment variables

2. **Configure Customer Portal**:
   - Go to Settings > Billing > Customer portal
   - Enable the portal
   - Configure which features customers can access:
     - Update payment methods
     - Cancel subscriptions
     - View invoices
     - Update billing address

3. **Set up Webhook Endpoint**:
   - Go to Developers > Webhooks
   - Add endpoint: `https://your-domain.vercel.app/api/stripe-webhook`
   - Select events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy the signing secret and add it as `STRIPE_WEBHOOK_SECRET`

## API Endpoints

### 1. Create Checkout Session
**POST** `/api/create-checkout-session`

Creates a Stripe Checkout session for subscription purchase.

```typescript
// Request
{
  userId: string;
  planId: "premium-monthly" | "premium-quarterly" | "premium-annual";
  priceId: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
}

// Response
{
  success: boolean;
  sessionId?: string;
  error?: string;
}
```

### 2. Create Portal Session
**POST** `/api/create-portal-session`

Creates a customer portal session for subscription management.

```typescript
// Request
{
  userId: string;
  returnUrl?: string;
}

// Response
{
  success: boolean;
  url?: string;
  error?: string;
}
```

### 3. Cancel Subscription
**POST** `/api/cancel-subscription`

Cancels a user's subscription.

```typescript
// Request
{
  userId: string;
  cancelAtPeriodEnd?: boolean; // true = cancel at end of billing period
  reason?: string;
}

// Response
{
  success: boolean;
  message?: string;
  error?: string;
}
```

### 4. Check Subscription Status
**GET** `/api/subscription-status/[userId]`

Checks the current subscription status for a user.

```typescript
// Response
{
  active: boolean;
  planId?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  status?: string;
}
```

### 5. Webhook Handler
**POST** `/api/stripe-webhook`

Handles Stripe webhook events. This endpoint is called by Stripe, not your application.

## Frontend Integration

The `StripePaymentService` class handles all frontend payment operations:

```typescript
import { stripePaymentService } from './services/StripePaymentService';

// Start subscription checkout
const result = await stripePaymentService.processPayment({
  userId: currentUser.id,
  planId: 'premium-monthly',
  paymentDetails: { email: userEmail }
});

// Open customer portal
const portal = await stripePaymentService.createCustomerPortalSession(userId);
if (portal?.url) {
  window.location.href = portal.url;
}

// Cancel subscription
const cancelResult = await stripePaymentService.cancelSubscription({
  userId: currentUser.id,
  planId: 'premium-monthly',
  immediate: false // Cancel at period end
});

// Check subscription status
const status = await stripePaymentService.checkSubscriptionStatus(userId);
```

## Security Considerations

1. **Authentication**: All endpoints verify JWT tokens to ensure users can only manage their own subscriptions
2. **Webhook Verification**: Stripe webhooks are verified using the signing secret
3. **Service Role**: Database operations use Supabase service role for admin privileges
4. **HTTPS Only**: Ensure all API calls use HTTPS in production
5. **Environment Variables**: Never commit secret keys to version control

## Testing

### Test Cards
Use these Stripe test cards for development:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires authentication: `4000 0025 0000 3155`

### Test Webhooks
Use Stripe CLI for local webhook testing:
```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

## Troubleshooting

### Common Issues

1. **"Missing webhook signature"**: Ensure `STRIPE_WEBHOOK_SECRET` is set correctly
2. **"Invalid authentication token"**: Check that JWT secret matches between frontend and backend
3. **"No active subscription found"**: User might not have completed checkout
4. **Webhook 400 errors**: Check that raw body parsing is disabled for webhook endpoint

### Debug Logging

Check logs for detailed error information:
- Vercel Functions logs for API errors
- Browser console for frontend errors
- Stripe Dashboard > Developers > Logs for payment issues

## Subscription Lifecycle

1. **User clicks "Subscribe"** → `processPayment()` → Redirect to Stripe Checkout
2. **User completes payment** → Stripe sends `checkout.session.completed` webhook
3. **Webhook handler** → Updates user record with subscription info
4. **User accesses premium content** → Check `subscription_tier` in database
5. **User manages subscription** → Portal session → Stripe handles changes
6. **Subscription renewed/canceled** → Webhooks update database automatically

## Database Schema Reference

### app_users table additions:
- `stripe_customer_id`: Stripe customer identifier
- `stripe_subscription_id`: Active subscription ID
- `subscription_status`: Current status (active, canceled, etc.)
- `subscription_period_end`: When current period ends
- `subscription_cancel_at`: Scheduled cancellation date

### subscription_events table:
- Tracks all subscription-related events
- Useful for debugging and customer support
- Automatically populated by webhooks

## Support

For issues or questions:
1. Check Stripe Dashboard logs
2. Review Vercel Function logs
3. Verify environment variables
4. Test with Stripe CLI locally
5. Contact Stripe support for payment-specific issues