/**
 * /api/create-portal-session.ts
 * 
 * Vercel API route for creating Stripe customer portal sessions
 * Allows users to manage their subscriptions, update payment methods, and view invoices
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
  url?: string;
  error?: string;
  errorCode?: string;
  timestamp: string;
  requestId: string;
}

interface CreatePortalSessionRequest {
  userId: string;
  returnUrl?: string;
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

    const { userId, returnUrl }: CreatePortalSessionRequest = req.body;

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

    // Verify user has permission to create portal session for this user
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
      .select('id, stripe_customer_id, subscription_tier')
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

    // Check if user has a Stripe customer ID
    if (!userData.stripe_customer_id) {
      return res.status(400).json({
        success: false,
        error: 'No active subscription found',
        errorCode: 'NO_SUBSCRIPTION',
        timestamp,
        requestId
      });
    }

    // Check if user has a premium subscription
    if (userData.subscription_tier === 'Free') {
      return res.status(400).json({
        success: false,
        error: 'Customer portal is only available for premium subscribers',
        errorCode: 'PREMIUM_ONLY',
        timestamp,
        requestId
      });
    }

    // Create portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: userData.stripe_customer_id,
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL || req.headers.origin}/dashboard`,
    });

    // Log portal session creation
    await supabase
      .from('subscription_events')
      .insert({
        user_id: userId,
        event_type: 'portal_session_created',
        event_data: {
          portalSessionId: portalSession.id,
          returnUrl: portalSession.return_url
        }
      });

    return res.status(200).json({
      success: true,
      url: portalSession.url,
      timestamp,
      requestId
    });

  } catch (error) {
    console.error('Portal session creation error:', error);
    
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