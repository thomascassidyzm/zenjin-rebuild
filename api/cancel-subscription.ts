/**
 * /api/cancel-subscription.ts
 * 
 * Vercel API route for cancelling Stripe subscriptions
 */

import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

// Initialize Supabase client with service role for admin operations
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface APIResponse {
  success: boolean;
  message?: string;
  error?: string;
  errorCode?: string;
  timestamp: string;
  requestId: string;
}

interface CancelSubscriptionRequest {
  userId: string;
  cancelAtPeriodEnd?: boolean;
  reason?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse>
) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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

  // Verify authorization
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Missing or invalid authorization header',
      errorCode: 'UNAUTHORIZED',
      timestamp,
      requestId
    });
  }

  try {
    // Verify JWT token
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET!) as any;

    const { 
      userId, 
      cancelAtPeriodEnd = true,
      reason 
    }: CancelSubscriptionRequest = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: userId',
        errorCode: 'INVALID_REQUEST',
        timestamp,
        requestId
      });
    }

    // Verify user has permission to cancel subscription for this user
    if (decoded.sub !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Permission denied',
        errorCode: 'PERMISSION_DENIED',
        timestamp,
        requestId
      });
    }

    // Get user data from database
    const { data: userData, error: userError } = await supabase
      .from('app_users')
      .select('id, stripe_customer_id, stripe_subscription_id, subscription_tier')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        errorCode: 'USER_NOT_FOUND',
        timestamp,
        requestId
      });
    }

    // Check if user has an active subscription
    if (!userData.stripe_subscription_id) {
      return res.status(400).json({
        success: false,
        error: 'No active subscription found',
        errorCode: 'NO_SUBSCRIPTION',
        timestamp,
        requestId
      });
    }

    // Cancel the subscription in Stripe
    const subscription = await stripe.subscriptions.update(
      userData.stripe_subscription_id,
      {
        cancel_at_period_end: cancelAtPeriodEnd,
        cancellation_details: {
          comment: reason || 'User requested cancellation',
        },
      }
    );

    // If immediate cancellation, delete the subscription
    if (!cancelAtPeriodEnd) {
      await stripe.subscriptions.cancel(userData.stripe_subscription_id);
    }

    // Update user record in database
    const updateData: any = {
      subscription_status: cancelAtPeriodEnd ? 'canceling' : 'canceled',
      subscription_cancel_at: cancelAtPeriodEnd ? subscription.current_period_end : timestamp,
    };

    if (!cancelAtPeriodEnd) {
      updateData.subscription_tier = 'Free';
      updateData.stripe_subscription_id = null;
    }

    await supabase
      .from('app_users')
      .update(updateData)
      .eq('id', userId);

    // Log cancellation event
    await supabase
      .from('subscription_events')
      .insert({
        user_id: userId,
        event_type: 'subscription_canceled',
        event_data: {
          subscriptionId: userData.stripe_subscription_id,
          cancelAtPeriodEnd,
          reason: reason || 'User requested',
          cancelAt: subscription.cancel_at || subscription.canceled_at
        }
      });

    const message = cancelAtPeriodEnd 
      ? `Subscription will be canceled at the end of the current billing period (${new Date(subscription.current_period_end * 1000).toLocaleDateString()})`
      : 'Subscription has been canceled immediately';

    return res.status(200).json({
      success: true,
      message,
      timestamp,
      requestId
    });

  } catch (error) {
    console.error('Subscription cancellation error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication token',
        errorCode: 'INVALID_TOKEN',
        timestamp,
        requestId
      });
    }
    
    if (error instanceof Stripe.errors.StripeError) {
      return res.status(400).json({
        success: false,
        error: error.message,
        errorCode: `STRIPE_${error.type?.toUpperCase()}`,
        timestamp,
        requestId
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      errorCode: 'INTERNAL_SERVER_ERROR',
      timestamp,
      requestId
    });
  }
}