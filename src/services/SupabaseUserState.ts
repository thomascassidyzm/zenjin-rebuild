/**
 * SupabaseUserState.ts
 * 
 * Implementation of the SupabaseUserStateInterface for managing user state
 * persistence and synchronization through Supabase with real-time updates.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import {
  SupabaseUserStateInterface,
  UserState,
  StateUpdateRequest,
  StateUpdateResult,
  RealtimeSubscription,
  UserStateError,
  UserStateErrorCode
} from './SupabaseUserStateTypes';

/**
 * Implementation of user state management using Supabase
 */
export class SupabaseUserState implements SupabaseUserStateInterface {
  private supabase: SupabaseClient;
  private subscriptions: Map<string, any> = new Map();
  private subscriptionCounter = 0;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * Retrieves the current user state from Supabase
   */
  async getUserState(userId: string): Promise<UserState> {
    try {
      const { data, error } = await this.supabase
        .from('user_state')
        .select(`
          *,
          users!inner(id, user_type, subscription_tier)
        `)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new UserStateError(
            UserStateErrorCode.USER_NOT_FOUND,
            `User state not found for user: ${userId}`
          );
        }
        throw new UserStateError(
          UserStateErrorCode.DATABASE_ERROR,
          `Database error: ${error.message}`,
          error
        );
      }

      if (!data) {
        throw new UserStateError(
          UserStateErrorCode.USER_NOT_FOUND,
          `User state not found for user: ${userId}`
        );
      }

      // Transform database record to UserState interface
      return {
        userId: data.user_id,
        anonymousId: data.users.user_type === 'anonymous' ? data.users.anonymous_id : undefined,
        stitchPositions: data.stitch_positions || {},
        tripleHelixState: data.triple_helix_state || {},
        spacedRepetitionState: data.spaced_repetition_state || {},
        progressMetrics: data.progress_metrics || {},
        lastSyncTime: data.last_sync_time,
        version: data.version,
        subscriptionTier: data.users.subscription_tier
      };
    } catch (error) {
      if (error instanceof UserStateError) {
        throw error;
      }
      throw new UserStateError(
        UserStateErrorCode.DATABASE_ERROR,
        'Failed to retrieve user state',
        error as Error
      );
    }
  }

  /**
   * Updates user state with optimistic locking and conflict resolution
   */
  async updateUserState(updateRequest: StateUpdateRequest): Promise<StateUpdateResult> {
    try {
      const { userId, stateChanges, expectedVersion, syncSource } = updateRequest;

      // Use a transaction to ensure atomic updates with version checking
      const { data, error } = await this.supabase.rpc('update_user_state_with_version', {
        p_user_id: userId,
        p_state_changes: stateChanges,
        p_expected_version: expectedVersion,
        p_sync_source: syncSource
      });

      if (error) {
        if (error.code === 'P0001' && error.message.includes('version_conflict')) {
          throw new UserStateError(
            UserStateErrorCode.VERSION_CONFLICT,
            'State version conflict detected. Another client has modified the state.',
            error
          );
        }
        throw new UserStateError(
          UserStateErrorCode.DATABASE_ERROR,
          `Database error during update: ${error.message}`,
          error
        );
      }

      if (!data || data.length === 0) {
        throw new UserStateError(
          UserStateErrorCode.USER_NOT_FOUND,
          `User not found: ${userId}`
        );
      }

      const updatedRecord = data[0];
      
      // Get complete updated state
      const updatedState = await this.getUserState(userId);

      return {
        success: true,
        newVersion: updatedRecord.version,
        conflictResolution: undefined,
        updatedState,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      if (error instanceof UserStateError) {
        throw error;
      }
      throw new UserStateError(
        UserStateErrorCode.DATABASE_ERROR,
        'Failed to update user state',
        error as Error
      );
    }
  }

  /**
   * Creates initial state for a new user
   */
  async createUserState(
    userId: string, 
    initialState?: object, 
    userType: string = 'anonymous'
  ): Promise<UserState> {
    try {
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
          totalPoints: 0
        },
        ...initialState
      };

      const { data, error } = await this.supabase
        .from('user_state')
        .insert({
          user_id: userId,
          stitch_positions: defaultState.stitch_positions,
          triple_helix_state: defaultState.triple_helix_state,
          spaced_repetition_state: defaultState.spaced_repetition_state,
          progress_metrics: defaultState.progress_metrics,
          version: 1,
          last_sync_time: new Date().toISOString(),
          sync_source: 'initial_creation'
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new UserStateError(
            UserStateErrorCode.USER_ALREADY_EXISTS,
            `User state already exists for user: ${userId}`
          );
        }
        throw new UserStateError(
          UserStateErrorCode.DATABASE_ERROR,
          `Failed to create user state: ${error.message}`,
          error
        );
      }

      return await this.getUserState(userId);
    } catch (error) {
      if (error instanceof UserStateError) {
        throw error;
      }
      throw new UserStateError(
        UserStateErrorCode.DATABASE_ERROR,
        'Failed to create user state',
        error as Error
      );
    }
  }

  /**
   * Migrates anonymous user state to registered user account
   */
  async migrateAnonymousUser(
    anonymousId: string, 
    registeredUserId: string, 
    preserveData: boolean = true
  ): Promise<object> {
    try {
      // Use a stored procedure for atomic migration
      const { data, error } = await this.supabase.rpc('migrate_anonymous_user', {
        p_anonymous_id: anonymousId,
        p_registered_user_id: registeredUserId,
        p_preserve_data: preserveData
      });

      if (error) {
        if (error.message.includes('anonymous_user_not_found')) {
          throw new UserStateError(
            UserStateErrorCode.ANONYMOUS_USER_NOT_FOUND,
            `Anonymous user not found: ${anonymousId}`
          );
        }
        if (error.message.includes('registered_user_exists')) {
          throw new UserStateError(
            UserStateErrorCode.REGISTERED_USER_EXISTS,
            `Registered user already exists: ${registeredUserId}`
          );
        }
        throw new UserStateError(
          UserStateErrorCode.MIGRATION_FAILED,
          `Migration failed: ${error.message}`,
          error
        );
      }

      return {
        success: true,
        migratedData: data,
        anonymousUserId: anonymousId,
        registeredUserId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      if (error instanceof UserStateError) {
        throw error;
      }
      throw new UserStateError(
        UserStateErrorCode.MIGRATION_FAILED,
        'Failed to migrate anonymous user',
        error as Error
      );
    }
  }

  /**
   * Subscribe to real-time state changes
   */
  subscribeToStateChanges(subscription: RealtimeSubscription): string {
    const subscriptionId = `sub_${++this.subscriptionCounter}_${Date.now()}`;
    
    try {
      const channel = this.supabase
        .channel(`user-state-${subscription.userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_state',
            filter: `user_id=eq.${subscription.userId}`
          },
          (payload) => {
            const event = {
              type: payload.eventType,
              status: payload.new || payload.old,
              previousStatus: payload.old,
              timestamp: new Date().toISOString()
            };
            
            try {
              subscription.callback(event);
            } catch (callbackError) {
              console.error('Error in subscription callback:', callbackError);
            }
          }
        )
        .subscribe();

      this.subscriptions.set(subscriptionId, {
        channel,
        subscription,
        userId: subscription.userId
      });

      return subscriptionId;
    } catch (error) {
      throw new UserStateError(
        UserStateErrorCode.SUBSCRIPTION_FAILED,
        'Failed to establish real-time subscription',
        error as Error
      );
    }
  }

  /**
   * Unsubscribe from real-time state changes
   */
  unsubscribeFromStateChanges(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    
    if (!subscription) {
      throw new UserStateError(
        UserStateErrorCode.SUBSCRIPTION_NOT_FOUND,
        `Subscription not found: ${subscriptionId}`
      );
    }

    try {
      subscription.channel.unsubscribe();
      this.subscriptions.delete(subscriptionId);
      return true;
    } catch (error) {
      console.error('Error unsubscribing:', error);
      return false;
    }
  }

  /**
   * Retrieves historical state changes for audit and debugging
   */
  async getStateHistory(
    userId: string, 
    limit: number = 50, 
    startDate?: string
  ): Promise<object[]> {
    try {
      let query = this.supabase
        .from('user_state_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (startDate) {
        query = query.gte('created_at', startDate);
      }

      const { data, error } = await query;

      if (error) {
        throw new UserStateError(
          UserStateErrorCode.DATABASE_ERROR,
          `Failed to retrieve state history: ${error.message}`,
          error
        );
      }

      return data || [];
    } catch (error) {
      if (error instanceof UserStateError) {
        throw error;
      }
      throw new UserStateError(
        UserStateErrorCode.DATABASE_ERROR,
        'Failed to retrieve state history',
        error as Error
      );
    }
  }

  /**
   * Cleanup method to remove all subscriptions
   */
  destroy(): void {
    for (const [subscriptionId] of this.subscriptions) {
      try {
        this.unsubscribeFromStateChanges(subscriptionId);
      } catch (error) {
        console.error(`Error cleaning up subscription ${subscriptionId}:`, error);
      }
    }
    this.subscriptions.clear();
  }
}

export default SupabaseUserState;