/**
 * /api/subscription-status/[userId].ts
 * 
 * Vercel API route for checking user subscription status
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
  success?: boolean;
  active: boolean;
  planId?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  status?: string;
  error?: string;
  errorCode?: string;
  timestamp?: string;
  requestId?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse>
) {
  const { userId } = req.query;
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      active: false,
      error: 'Method not allowed',
      errorCode: 'METHOD_NOT_ALLOWED',
      timestamp,
      requestId
    });
  }

  if (typeof userId !== 'string') {
    return res.status(400).json({
      active: false,
      error: 'Invalid user ID',
      errorCode: 'INVALID_USER_ID',
      timestamp,
      requestId
    });
  }

  // Verify authorization
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      active: false,
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

    // Verify user has permission to check subscription for this user
    if (decoded.sub !== userId) {
      return res.status(403).json({
        active: false,
        error: 'Permission denied',
        errorCode: 'PERMISSION_DENIED',
        timestamp,
        requestId
      });
    }

    // Get user data from database
    const { data: userData, error: userError } = await supabase
      .from('app_users')
      .select('id, stripe_customer_id, stripe_subscription_id, subscription_tier, subscription_status, subscription_cancel_at')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return res.status(404).json({
        active: false,
        error: 'User not found',
        errorCode: 'USER_NOT_FOUND',
        timestamp,
        requestId
      });
    }

    // If user doesn't have a subscription, return free tier status
    if (!userData.stripe_subscription_id || userData.subscription_tier === 'Free') {
      return res.status(200).json({
        active: false,
        planId: 'free',
        status: 'inactive'
      });
    }

    // Get detailed subscription info from Stripe
    try {
      const subscription = await stripe.subscriptions.retrieve(userData.stripe_subscription_id);
      
      // Map Stripe status to our status
      const isActive = ['active', 'trialing'].includes(subscription.status);
      
      // Get the plan ID from the subscription items
      const planId = subscription.items.data[0]?.price.id || userData.subscription_tier;

      return res.status(200).json({
        active: isActive,
        planId: mapPriceIdToPlanId(planId),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        status: subscription.status
      });

    } catch (stripeError) {
      // If we can't get info from Stripe, use database info
      console.error('Error fetching subscription from Stripe:', stripeError);
      
      return res.status(200).json({
        active: userData.subscription_status === 'active',
        planId: userData.subscription_tier.toLowerCase(),
        cancelAtPeriodEnd: userData.subscription_status === 'canceling',
        status: userData.subscription_status || 'unknown'
      });
    }

  } catch (error) {
    console.error('Subscription status check error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        active: false,
        error: 'Invalid authentication token',
        errorCode: 'INVALID_TOKEN',
        timestamp,
        requestId
      });
    }
    
    return res.status(500).json({
      active: false,
      error: 'Internal server error',
      errorCode: 'INTERNAL_SERVER_ERROR',
      timestamp,
      requestId
    });
  }
}

/**
 * Map Stripe price IDs to our plan IDs
 */
function mapPriceIdToPlanId(priceId: string): string {
  // This mapping should match your Stripe price IDs
  const priceMap: Record<string, string> = {
    [process.env.STRIPE_PRICE_MONTHLY || 'price_monthly']: 'premium-monthly',
    [process.env.STRIPE_PRICE_QUARTERLY || 'price_quarterly']: 'premium-quarterly',
    [process.env.STRIPE_PRICE_ANNUAL || 'price_annual']: 'premium-annual',
  };

  return priceMap[priceId] || priceId;
}