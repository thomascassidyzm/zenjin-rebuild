/**
 * /api/auth/anonymous.ts
 * 
 * Vercel API route for creating anonymous users with immediate app access
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for admin operations
);

interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
  errorCode?: string;
  timestamp: string;
  requestId: string;
  debug?: any;
}

interface AnonymousUserRequest {
  deviceId?: string;
  initialSessionData?: Record<string, any>;
  ttlHours?: number;
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

  try {
    const { deviceId, initialSessionData, ttlHours = 168 }: AnonymousUserRequest = req.body || {};

    // Generate anonymous user identifiers
    const anonymousId = `anon_${uuidv4().replace(/-/g, '')}`;
    const displayName = `Guest ${anonymousId.slice(-6)}`;
    
    // Calculate expiration time (default 7 days)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + ttlHours);

    // Generate a UUID for the anonymous user
    const userId = uuidv4();

    // Create user record in app_users table (no auth required for anonymous users)
    const { error: userError } = await supabase
      .from('app_users')
      .insert({
        id: userId,
        user_type: 'anonymous',
        anonymous_id: anonymousId,
        display_name: displayName,
        subscription_tier: 'Free',
        expires_at: expiresAt.toISOString(),
        metadata: {
          device_id: deviceId,
          initial_session_data: initialSessionData || {}
        }
      });

    if (userError) {
      console.error('User record creation failed:', userError);
      return res.status(500).json({
        success: false,
        error: 'Failed to create user record',
        errorCode: 'USER_RECORD_CREATION_FAILED',
        timestamp,
        requestId,
        debug: userError.message
      });
    }

    // Create initial user state
    const defaultState = {
      stitch_positions: {},
      triple_helix_state: {
        activeTube: 1,
        currentPath: 'addition',
        rotationCount: 0
      },
      spaced_repetition_state: {
        sequence: [4, 8, 15, 30, 100, 1000],
        globalPosition: 1
      },
      progress_metrics: {
        totalSessions: 0,
        totalQuestions: 0,
        totalCorrect: 0,
        totalPoints: 0,
        lifetimeMetrics: {
          ftcPoints: 0,
          ecPoints: 0,
          basePoints: 0,
          evolution: 0,
          averageBlinkSpeed: 0,
          globalRanking: null
        }
      }
    };

    const { error: stateError } = await supabase
      .from('user_state')
      .insert({
        user_id: userId,
        stitch_positions: defaultState.stitch_positions,
        triple_helix_state: defaultState.triple_helix_state,
        spaced_repetition_state: defaultState.spaced_repetition_state,
        progress_metrics: defaultState.progress_metrics,
        version: 1,
        last_sync_time: timestamp,
        sync_source: 'anonymous_creation'
      });

    if (stateError) {
      console.error('Initial state creation failed:', stateError);
      // Cleanup user record
      await supabase.from('app_users').delete().eq('id', userId);
      
      return res.status(500).json({
        success: false,
        error: 'Failed to create initial user state',
        errorCode: 'INITIAL_STATE_CREATION_FAILED',
        timestamp,
        requestId,
        debug: stateError.message
      });
    }

    // Create a simple JWT token for anonymous users
    const accessToken = jwt.sign(
      { 
        sub: userId,
        user_type: 'anonymous',
        anonymous_id: anonymousId,
        exp: Math.floor(expiresAt.getTime() / 1000)
      },
      process.env.SUPABASE_JWT_SECRET || 'fallback-secret'
    );

    // Return successful response with user data and session
    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: userId,
          anonymousId,
          displayName,
          userType: 'anonymous',
          subscriptionTier: 'Free',
          expiresAt: expiresAt.toISOString(),
          createdAt: timestamp
        },
        session: {
          accessToken,
          userType: 'anonymous',
          expiresAt: Math.floor(expiresAt.getTime() / 1000)
        },
        initialState: defaultState
      },
      timestamp,
      requestId
    });

  } catch (error) {
    console.error('Unexpected error in anonymous user creation:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      errorCode: 'INTERNAL_SERVER_ERROR',
      timestamp,
      requestId,
      debug: error instanceof Error ? error.message : String(error)
    });
  }
}