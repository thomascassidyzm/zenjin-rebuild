# Premium Tier Implementation Guide

## Overview

The Premium Tier implementation for Zenjin Maths provides subscription-based monetization using Stripe. This guide covers the complete implementation including frontend components, backend API endpoints, and payment integration.

## Architecture

### Components

1. **Frontend Components**
   - `SubscriptionUpgrade.tsx` - Modal/page for selecting subscription plans
   - `SubscriptionManagement.tsx` - User's subscription management page
   - `SubscriptionSuccess.tsx` - Success page after payment
   - `SubscriptionCancelled.tsx` - Cancellation page
   - Dashboard upgrade prompt for free users

2. **Services**
   - `StripePaymentService.ts` - Client-side Stripe integration
   - `SubscriptionManager` engine - Subscription state management

3. **API Endpoints**
   - `/api/create-checkout-session` - Creates Stripe checkout session
   - `/api/create-portal-session` - Creates customer portal session
   - `/api/cancel-subscription` - Handles subscription cancellation
   - `/api/subscription-status/[userId]` - Checks subscription status
   - `/api/stripe-webhook` - Handles Stripe webhook events

4. **Database**
   - Additional columns in `app_users` table for Stripe data
   - `subscription_events` table for audit logging
   - `subscription_prices` table for price caching

## Setup Instructions

### 1. Environment Variables

Add these to your `.env` file:

```env
# Stripe Keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (create these in Stripe Dashboard)
VITE_STRIPE_PRICE_MONTHLY=price_...
VITE_STRIPE_PRICE_QUARTERLY=price_...
VITE_STRIPE_PRICE_ANNUAL=price_...
```

### 2. Stripe Dashboard Setup

1. Create a Stripe account at https://stripe.com
2. Create Products and Prices:
   - Product: "Zenjin Maths Premium"
   - Prices:
     - Monthly: $9.99/month
     - Quarterly: $26.99/3 months (10% discount)
     - Annual: $89.99/year (25% discount)
3. Configure webhook endpoint:
   - URL: `https://your-domain.com/api/stripe-webhook`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

### 3. Database Migration

Run the subscription tables migration:

```sql
-- Run in your Supabase SQL editor
\i database/add_stripe_subscription_tables.sql
```

### 4. Deploy API Endpoints

The API endpoints in the `/api` directory are designed for Vercel deployment. They will be automatically deployed when you deploy to Vercel.

## Usage

### User Flow

1. **Free User Sees Upgrade Prompt**
   - Dashboard shows upgrade banner for free users
   - "Upgrade Now" button opens SubscriptionUpgrade modal

2. **Subscription Selection**
   - User selects plan (monthly/quarterly/annual)
   - Clicks "Upgrade Now"
   - Redirected to Stripe Checkout

3. **Payment Processing**
   - User enters payment details on Stripe
   - On success: Redirected to SubscriptionSuccess page
   - On cancel: Redirected to SubscriptionCancelled page

4. **Subscription Management**
   - Premium users can access SubscriptionManagement page
   - Options to update payment method or cancel subscription
   - Shows current plan and renewal date

### Feature Gating

Check user's subscription tier before allowing access to premium features:

```typescript
// Example: Check if user has premium access
const user = userSessionManager.state.user;
const isPremium = user?.subscriptionTier === 'premium';

if (!isPremium) {
  // Show upgrade prompt or limit functionality
}
```

### Premium Features

- Unlimited learning sessions (Free: 3 per day)
- Advanced analytics & progress tracking
- Priority support
- Exclusive learning challenges
- Ad-free experience
- Export data functionality
- API access for integrations

## Testing

### Test Cards

Use these Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires authentication: `4000 0025 0000 3155`

### Test Flow

1. Create a test user account
2. Navigate to Dashboard (should show as "Free" user)
3. Click "Upgrade Now" in the banner
4. Select a plan and click "Upgrade Now"
5. Use test card in Stripe Checkout
6. Verify redirect to success page
7. Verify user now shows as "Premium"
8. Test subscription management features

## Security Considerations

1. **Webhook Verification**
   - Always verify webhook signatures
   - Use `stripe.webhooks.constructEvent()` with webhook secret

2. **User Authorization**
   - Verify user owns the subscription they're managing
   - Use JWT tokens for API authentication

3. **Price IDs**
   - Store price IDs in environment variables
   - Never hardcode prices in frontend code

4. **Error Handling**
   - Log payment errors for debugging
   - Show user-friendly error messages
   - Have fallback behavior for payment failures

## Monitoring

1. **Stripe Dashboard**
   - Monitor successful payments
   - Track failed payments and disputes
   - Review subscription metrics

2. **Application Logs**
   - Log webhook events
   - Track subscription state changes
   - Monitor API endpoint performance

3. **Database Audit Trail**
   - `subscription_events` table tracks all changes
   - Useful for debugging and compliance

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**
   - Verify webhook URL is correct
   - Check webhook secret is set correctly
   - Ensure API endpoint is deployed

2. **Subscription status not updating**
   - Check webhook processing logs
   - Verify database permissions
   - Clear subscription cache

3. **Payment failures**
   - Check Stripe logs for error details
   - Verify price IDs are correct
   - Ensure customer email is valid

### Debug Commands

```bash
# Test webhook locally
stripe listen --forward-to localhost:3000/api/stripe-webhook

# Trigger test events
stripe trigger checkout.session.completed

# Check Stripe CLI logs
stripe logs tail
```

## Revenue Optimization

1. **Pricing Strategy**
   - Annual plan offers best value (25% discount)
   - Quarterly plan for commitment-shy users (10% discount)
   - Monthly for maximum flexibility

2. **Upgrade Prompts**
   - Dashboard banner for free users
   - Feature limitation messages
   - Success milestone prompts

3. **Retention**
   - Email reminders before expiration
   - Win-back campaigns for cancelled users
   - Exclusive premium content updates

## Next Steps

1. Implement email notifications for:
   - Successful subscription
   - Upcoming renewal
   - Payment failures
   - Cancellation confirmation

2. Add admin dashboard for:
   - Subscription metrics
   - Revenue tracking
   - User upgrade/downgrade trends

3. Implement referral program:
   - Discount codes
   - Referral tracking
   - Reward system

4. A/B testing:
   - Different price points
   - Upgrade prompt variations
   - Feature bundling options