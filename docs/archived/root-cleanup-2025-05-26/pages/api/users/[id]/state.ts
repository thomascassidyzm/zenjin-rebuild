/**
 * /api/users/[id]/state.ts
 * 
 * Vercel API route for managing user state with conflict resolution
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
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
}

interface StateUpdateRequest {
  stateChanges: Record<string, any>;
  expectedVersion: number;
  syncSource: string;
  timestamp: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse>
) {
  const { id: userId } = req.query;
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();

  if (typeof userId !== 'string') {
    return res.status(400).json({
      success: false,
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

    // Verify user has permission to access this state
    if (decoded.sub !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Permission denied - user can only access their own state',
        errorCode: 'PERMISSION_DENIED',
        timestamp,
        requestId
      });
    }

    if (req.method === 'GET') {
      return await handleGetState(userId, res, requestId, timestamp);
    } else if (req.method === 'PUT') {
      return await handleUpdateState(userId, req.body, res, requestId, timestamp);
    } else {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
        errorCode: 'METHOD_NOT_ALLOWED',
        timestamp,
        requestId
      });
    }

  } catch (jwtError) {
    console.error('JWT verification failed:', jwtError);
    return res.status(401).json({
      success: false,
      error: 'Invalid authentication token',
      errorCode: 'INVALID_TOKEN',
      timestamp,
      requestId
    });
  }
}

async function handleGetState(
  userId: string,
  res: NextApiResponse<APIResponse>,
  requestId: string,
  timestamp: string
) {
  try {
    const { data, error } = await supabase
      .from('user_state')
      .select(`
        *,
        users!inner(id, user_type, subscription_tier, display_name, anonymous_id)
      `)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'User state not found',
          errorCode: 'USER_NOT_FOUND',
          timestamp,
          requestId
        });
      }
      throw error;
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'User state not found',
        errorCode: 'USER_NOT_FOUND',
        timestamp,
        requestId
      });
    }

    // Transform to API response format
    const userState = {
      userId: data.user_id,
      anonymousId: data.users.user_type === 'anonymous' ? data.users.anonymous_id : undefined,
      stitchPositions: data.stitch_positions || {},
      tripleHelixState: data.triple_helix_state || {},
      spacedRepetitionState: data.spaced_repetition_state || {},
      progressMetrics: data.progress_metrics || {},
      lastSyncTime: data.last_sync_time,
      version: data.version,
      subscriptionTier: data.users.subscription_tier,
      user: {
        id: data.users.id,
        userType: data.users.user_type,
        displayName: data.users.display_name,
        subscriptionTier: data.users.subscription_tier
      }
    };

    return res.status(200).json({
      success: true,
      data: userState,
      timestamp,
      requestId
    });

  } catch (error) {
    console.error('Error getting user state:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve user state',
      errorCode: 'DATABASE_ERROR',
      timestamp,
      requestId
    });
  }
}

async function handleUpdateState(
  userId: string,
  body: StateUpdateRequest,
  res: NextApiResponse<APIResponse>,
  requestId: string,
  timestamp: string
) {
  const { stateChanges, expectedVersion, syncSource } = body;

  if (!stateChanges || typeof expectedVersion !== 'number' || !syncSource) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: stateChanges, expectedVersion, syncSource',
      errorCode: 'INVALID_REQUEST_DATA',
      timestamp,
      requestId
    });
  }

  try {
    // Get current state to check version
    const { data: currentState, error: fetchError } = await supabase
      .from('user_state')
      .select('version, *')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          errorCode: 'USER_NOT_FOUND',
          timestamp,
          requestId
        });
      }
      throw fetchError;
    }

    if (!currentState) {
      return res.status(404).json({
        success: false,
        error: 'User state not found',
        errorCode: 'USER_NOT_FOUND',
        timestamp,
        requestId
      });
    }

    // Check for version conflict
    if (currentState.version !== expectedVersion) {
      return res.status(409).json({
        success: false,
        error: `Version conflict: expected ${expectedVersion}, current ${currentState.version}`,
        errorCode: 'VERSION_CONFLICT',
        timestamp,
        requestId,
        data: {
          currentVersion: currentState.version,
          expectedVersion,
          conflictResolution: 'client_must_refresh'
        }
      });
    }

    // Merge state changes with current state
    const updatedState = {
      stitch_positions: { ...currentState.stitch_positions, ...stateChanges.stitchPositions },
      triple_helix_state: { ...currentState.triple_helix_state, ...stateChanges.tripleHelixState },
      spaced_repetition_state: { ...currentState.spaced_repetition_state, ...stateChanges.spacedRepetitionState },
      progress_metrics: { ...currentState.progress_metrics, ...stateChanges.progressMetrics }
    };

    // Update with new version
    const { data: updatedRecord, error: updateError } = await supabase
      .from('user_state')
      .update({
        stitch_positions: updatedState.stitch_positions,
        triple_helix_state: updatedState.triple_helix_state,
        spaced_repetition_state: updatedState.spaced_repetition_state,
        progress_metrics: updatedState.progress_metrics,
        version: expectedVersion + 1,
        last_sync_time: timestamp,
        sync_source: syncSource,
        updated_at: timestamp
      })
      .eq('user_id', userId)
      .eq('version', expectedVersion)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to update user state',
        errorCode: 'UPDATE_FAILED',
        timestamp,
        requestId
      });
    }

    if (!updatedRecord) {
      // This shouldn't happen if we checked version correctly, but handle anyway
      return res.status(409).json({
        success: false,
        error: 'Version conflict detected during update',
        errorCode: 'VERSION_CONFLICT',
        timestamp,
        requestId
      });
    }

    // Get complete updated state for response
    const { data: completeState } = await supabase
      .from('user_state')
      .select(`
        *,
        users!inner(id, user_type, subscription_tier, display_name, anonymous_id)
      `)
      .eq('user_id', userId)
      .single();

    const responseData = {
      success: true,
      newVersion: updatedRecord.version,
      updatedState: {
        userId: completeState.user_id,
        anonymousId: completeState.users.user_type === 'anonymous' ? completeState.users.anonymous_id : undefined,
        stitchPositions: completeState.stitch_positions || {},
        tripleHelixState: completeState.triple_helix_state || {},
        spacedRepetitionState: completeState.spaced_repetition_state || {},
        progressMetrics: completeState.progress_metrics || {},
        lastSyncTime: completeState.last_sync_time,
        version: completeState.version,
        subscriptionTier: completeState.users.subscription_tier
      },
      syncSource: updatedRecord.sync_source,
      timestamp: updatedRecord.updated_at
    };

    return res.status(200).json({
      success: true,
      data: responseData,
      timestamp,
      requestId
    });

  } catch (error) {
    console.error('Error updating user state:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during state update',
      errorCode: 'INTERNAL_SERVER_ERROR',
      timestamp,
      requestId
    });
  }
}