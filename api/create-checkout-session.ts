/**
 * /api/create-checkout-session.ts
 * 
 * Vercel API route for creating Stripe checkout sessions
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
  sessionId?: string;
  error?: string;
  errorCode?: string;
  timestamp: string;
  requestId: string;
}

interface CreateCheckoutSessionRequest {
  userId: string;
  planId: string;
  priceId: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
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
      planId,
      priceId,
      customerEmail,
      successUrl,
      cancelUrl
    }: CreateCheckoutSessionRequest = req.body;

    // Validate required fields
    if (!userId || !planId || !priceId || !successUrl || !cancelUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        errorCode: 'INVALID_REQUEST',
        timestamp,
        requestId
      });
    }

    // Verify user has permission to create session for this user
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
      .select('id, stripe_customer_id, display_name')
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

    // Create or retrieve Stripe customer
    let customerId = userData.stripe_customer_id;
    
    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: customerEmail,
        metadata: {
          userId: userId,
          displayName: userData.display_name || ''
        }
      });
      
      customerId = customer.id;
      
      // Update user record with Stripe customer ID
      await supabase
        .from('app_users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: {
          userId: userId,
          planId: planId
        }
      },
      metadata: {
        userId: userId,
        planId: planId
      }
    });

    // Log checkout session creation
    await supabase
      .from('subscription_events')
      .insert({
        user_id: userId,
        event_type: 'checkout_session_created',
        event_data: {
          sessionId: session.id,
          planId: planId,
          priceId: priceId
        }
      });

    return res.status(200).json({
      success: true,
      sessionId: session.id,
      timestamp,
      requestId
    });

  } catch (error) {
    console.error('Checkout session creation error:', error);
    
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