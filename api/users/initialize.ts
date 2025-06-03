/**
 * /api/users/initialize.ts
 * 
 * APML-compliant API endpoint for user initialization
 * Following External Service Integration Protocol
 * Implements UserInitializationInterface.apml contract
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for admin operations
);

interface InitializeUserRequest {
  userId: string;
  email: string;
  displayName?: string;
  userType: 'registered' | 'anonymous';
}

interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
  errorCode?: string;
  timestamp: string;
  requestId: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse>
) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();

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
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET!) as any;

    const { userId, email, displayName, userType }: InitializeUserRequest = req.body;

    if (!userId || !email || !userType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, email, userType',
        errorCode: 'VALIDATION_ERROR',
        timestamp,
        requestId
      });
    }

    // Verify user has permission to initialize this user
    if (decoded.sub !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Permission denied - can only initialize own user record',
        errorCode: 'PERMISSION_DENIED',
        timestamp,
        requestId
      });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (existingUser) {
      // User already exists - fetch their data
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      const { data: userStateData } = await supabase
        .from('user_state')
        .select('*')
        .eq('user_id', userId)
        .single();

      return res.status(200).json({
        success: true,
        data: {
          user: userData,
          userState: userStateData
        },
        timestamp,
        requestId
      });
    }

    // Create user record
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: email,
        display_name: displayName || email.split('@')[0],
        user_type: userType,
        subscription_tier: 'Free',
        created_at: timestamp,
        updated_at: timestamp
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating user:', userError);
      return res.status(500).json({
        success: false,
        error: 'Failed to create user record',
        errorCode: 'DATABASE_ERROR',
        timestamp,
        requestId
      });
    }

    // Get default tube positions from database
    const { data: defaultTubePositions, error: tubePositionsError } = await supabase
      .from('default_tube_positions')
      .select('*')
      .order('tube_id')
      .order('logical_position');

    if (tubePositionsError) {
      console.error('Error fetching default tube positions:', tubePositionsError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch default tube positions',
        errorCode: 'DATABASE_ERROR',
        timestamp,
        requestId
      });
    }

    // Convert default positions to user tube_positions format
    const tubePositions: any = {};
    if (defaultTubePositions) {
      defaultTubePositions.forEach((position: any) => {
        if (!tubePositions[position.tube_id]) {
          tubePositions[position.tube_id] = {};
        }
        tubePositions[position.tube_id][position.logical_position.toString()] = position.stitch_id;
      });
    }

    // Create initial user state with proper tube positions
    const defaultState = {
      tube_positions: tubePositions,
      triple_helix_state: {
        activeTube: 1,
        tubes: {
          tube1: { status: 'live', activeStitchId: null, totalStitches: 0 },
          tube2: { status: 'ready', activeStitchId: null, totalStitches: 0 },
          tube3: { status: 'preparing', activeStitchId: null, totalStitches: 0 }
        },
        rotationCount: 0,
        sessionCount: 0
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

    const { data: newUserState, error: stateError } = await supabase
      .from('user_state')
      .insert({
        user_id: userId,
        tube_positions: defaultState.tube_positions,
        triple_helix_state: defaultState.triple_helix_state,
        spaced_repetition_state: defaultState.spaced_repetition_state,
        progress_metrics: defaultState.progress_metrics,
        version: 1,
        last_sync_time: timestamp,
        sync_source: 'user_initialization',
        created_at: timestamp,
        updated_at: timestamp
      })
      .select()
      .single();

    if (stateError) {
      console.error('Error creating user state:', stateError);
      
      // Clean up user record if state creation failed
      await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      return res.status(500).json({
        success: false,
        error: 'Failed to create user state',
        errorCode: 'DATABASE_ERROR',
        timestamp,
        requestId
      });
    }

    // Return initialized user data
    const responseData = {
      user: {
        id: newUser.id,
        email: newUser.email,
        displayName: newUser.display_name,
        userType: newUser.user_type,
        subscriptionTier: newUser.subscription_tier,
        createdAt: newUser.created_at
      },
      userState: {
        userId: newUserState.user_id,
        tubePositions: newUserState.tube_positions,
        tripleHelixState: newUserState.triple_helix_state,
        spacedRepetitionState: newUserState.spaced_repetition_state,
        progressMetrics: newUserState.progress_metrics,
        version: newUserState.version,
        lastSyncTime: newUserState.last_sync_time
      }
    };

    return res.status(201).json({
      success: true,
      data: responseData,
      timestamp,
      requestId
    });

  } catch (jwtError) {
    console.error('JWT verification failed:', jwtError);
    return res.status(401).json({
      success: false,
      error: 'Invalid authentication token',
      errorCode: 'AUTHENTICATION_FAILED',
      timestamp,
      requestId
    });
  } catch (error) {
    console.error('Error initializing user:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during user initialization',
      errorCode: 'DATABASE_ERROR',
      timestamp,
      requestId
    });
  }
}