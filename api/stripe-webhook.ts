/**
 * /api/stripe-webhook.ts
 * 
 * Vercel API route for handling Stripe webhook events
 * Processes subscription updates, payment confirmations, and other Stripe events
 */

import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { buffer } from 'micro';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

// Initialize Supabase client with service role for admin operations
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Disable body parsing, need raw body for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

interface APIResponse {
  success: boolean;
  message?: string;
  error?: string;
  errorCode?: string;
  timestamp: string;
  requestId: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse>
) {
  const requestId = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      errorCode: 'METHOD_NOT_ALLOWED',
      timestamp,
      requestId
    });
  }

  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  if (!sig || !webhookSecret) {
    return res.status(400).json({
      success: false,
      error: 'Missing webhook signature or secret',
      errorCode: 'INVALID_WEBHOOK_CONFIG',
      timestamp,
      requestId
    });
  }

  let event: Stripe.Event;
  let rawBody: Buffer;

  try {
    rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).json({
      success: false,
      error: 'Webhook signature verification failed',
      errorCode: 'INVALID_SIGNATURE',
      timestamp,
      requestId
    });
  }

  // Log webhook event
  await supabase
    .from('subscription_events')
    .insert({
      user_id: null, // Will be updated when we process the event
      event_type: `webhook_${event.type}`,
      event_data: {
        stripeEventId: event.id,
        type: event.type,
        created: event.created
      }
    });

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({
      success: true,
      message: `Webhook processed: ${event.type}`,
      timestamp,
      requestId
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({
      success: false,
      error: 'Webhook processing failed',
      errorCode: 'PROCESSING_ERROR',
      timestamp,
      requestId
    });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const planId = session.metadata?.planId;

  if (!userId || !planId) {
    console.error('Missing userId or planId in checkout session metadata');
    return;
  }

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

  // Update user record
  await supabase
    .from('app_users')
    .update({
      stripe_subscription_id: subscription.id,
      subscription_tier: mapPlanIdToTier(planId),
      subscription_status: 'active',
      subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq('id', userId);

  // Log event
  await supabase
    .from('subscription_events')
    .insert({
      user_id: userId,
      event_type: 'subscription_activated',
      event_data: {
        subscriptionId: subscription.id,
        planId,
        sessionId: session.id
      }
    });
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  
  if (!userId) {
    console.error('Missing userId in subscription metadata');
    return;
  }

  const planId = subscription.items.data[0]?.price.id;
  
  await supabase
    .from('app_users')
    .update({
      subscription_status: subscription.status,
      subscription_tier: mapPriceIdToTier(planId),
      subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      subscription_cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
    })
    .eq('id', userId);

  await supabase
    .from('subscription_events')
    .insert({
      user_id: userId,
      event_type: 'subscription_updated',
      event_data: {
        subscriptionId: subscription.id,
        status: subscription.status,
        planId
      }
    });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  
  if (!userId) {
    console.error('Missing userId in subscription metadata');
    return;
  }

  await supabase
    .from('app_users')
    .update({
      stripe_subscription_id: null,
      subscription_tier: 'Free',
      subscription_status: 'canceled',
      subscription_period_end: null,
      subscription_cancel_at: null,
    })
    .eq('id', userId);

  await supabase
    .from('subscription_events')
    .insert({
      user_id: userId,
      event_type: 'subscription_ended',
      event_data: {
        subscriptionId: subscription.id
      }
    });
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!invoice.subscription || !invoice.customer) return;

  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
  const userId = subscription.metadata?.userId;

  if (!userId) return;

  await supabase
    .from('subscription_events')
    .insert({
      user_id: userId,
      event_type: 'payment_succeeded',
      event_data: {
        invoiceId: invoice.id,
        amount: invoice.amount_paid,
        currency: invoice.currency
      }
    });
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription || !invoice.customer) return;

  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
  const userId = subscription.metadata?.userId;

  if (!userId) return;

  await supabase
    .from('subscription_events')
    .insert({
      user_id: userId,
      event_type: 'payment_failed',
      event_data: {
        invoiceId: invoice.id,
        amount: invoice.amount_due,
        currency: invoice.currency,
        attemptCount: invoice.attempt_count
      }
    });

  // Update subscription status if payment failed multiple times
  if (invoice.attempt_count >= 3) {
    await supabase
      .from('app_users')
      .update({
        subscription_status: 'past_due'
      })
      .eq('id', userId);
  }
}

function mapPlanIdToTier(planId: string): string {
  const tierMap: Record<string, string> = {
    'premium-monthly': 'Premium',
    'premium-quarterly': 'Premium',
    'premium-annual': 'Premium',
  };
  return tierMap[planId] || 'Free';
}

function mapPriceIdToTier(priceId: string): string {
  // Map Stripe price IDs to tiers
  if (priceId === process.env.STRIPE_PRICE_MONTHLY ||
      priceId === process.env.STRIPE_PRICE_QUARTERLY ||
      priceId === process.env.STRIPE_PRICE_ANNUAL) {
    return 'Premium';
  }
  return 'Free';
}