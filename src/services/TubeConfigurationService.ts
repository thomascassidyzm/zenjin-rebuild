/**
 * Tube Configuration Service
 * Manages default tube positions and user initialization
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { configurationService } from './ConfigurationService';

export interface TubePosition {
  tube_id: string;
  logical_position: number;
  stitch_id: string;
}

export interface UserTubePositions {
  [tubeId: string]: {
    [logicalPosition: string]: string; // stitch_id
  };
}

export interface TubeConfigurationInterface {
  /**
   * Initialize a new user with default tube positions
   */
  initializeUserTubePositions(userId: string): Promise<UserTubePositions>;
  
  /**
   * Get default tube positions from database
   */
  getDefaultTubePositions(): Promise<TubePosition[]>;
  
  /**
   * Convert default positions to user format
   */
  convertToUserFormat(defaultPositions: TubePosition[]): UserTubePositions;
}

export class TubeConfigurationService implements TubeConfigurationInterface {
  private supabase: SupabaseClient;
  private initialized: boolean = false;
  private defaultPositionsCache: TubePosition[] | null = null;

  constructor() {
    this.supabase = null as any; // Will be initialized async
  }

  /**
   * Initialize Supabase client
   */
  private async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const config = await configurationService.getConfiguration();
      this.supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
      this.initialized = true;
      console.log('✅ TubeConfigurationService: Initialization complete');
    } catch (error) {
      console.error('❌ TubeConfigurationService: Initialization failed:', error);
      throw new Error(`TUBE_CONFIG_INIT_FAILED - Failed to initialize TubeConfigurationService: ${error}`);
    }
  }

  /**
   * Get default tube positions from database
   */
  public async getDefaultTubePositions(): Promise<TubePosition[]> {
    await this.initialize();

    // Use cache if available
    if (this.defaultPositionsCache) {
      return this.defaultPositionsCache;
    }

    try {
      const { data, error } = await this.supabase
        .from('default_tube_positions')
        .select('*')
        .order('tube_id')
        .order('logical_position');

      if (error) {
        throw new Error(`DATABASE_ERROR - Failed to fetch default tube positions: ${error.message}`);
      }

      this.defaultPositionsCache = data;
      return data;
    } catch (error) {
      console.error('❌ TubeConfigurationService getDefaultTubePositions error:', error);
      throw new Error(`TUBE_CONFIG_ERROR - Failed to get default tube positions: ${error}`);
    }
  }

  /**
   * Convert default positions to user format
   */
  public convertToUserFormat(defaultPositions: TubePosition[]): UserTubePositions {
    const userTubePositions: UserTubePositions = {};

    defaultPositions.forEach(position => {
      if (!userTubePositions[position.tube_id]) {
        userTubePositions[position.tube_id] = {};
      }
      
      userTubePositions[position.tube_id][position.logical_position.toString()] = position.stitch_id;
    });

    return userTubePositions;
  }

  /**
   * Initialize a new user with default tube positions
   */
  public async initializeUserTubePositions(userId: string): Promise<UserTubePositions> {
    await this.initialize();

    try {
      // Get default positions
      const defaultPositions = await this.getDefaultTubePositions();
      const userTubePositions = this.convertToUserFormat(defaultPositions);

      // Update user_state with default positions
      const { error } = await this.supabase
        .from('user_state')
        .update({
          tube_positions: userTubePositions,
          active_tube: 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        throw new Error(`DATABASE_ERROR - Failed to initialize user tube positions: ${error.message}`);
      }

      console.log(`✅ TubeConfigurationService: Initialized tube positions for user ${userId}`);
      return userTubePositions;
    } catch (error) {
      console.error('❌ TubeConfigurationService initializeUserTubePositions error:', error);
      throw new Error(`TUBE_CONFIG_ERROR - Failed to initialize user tube positions: ${error}`);
    }
  }

  /**
   * Get tube positions for a specific user
   */
  public async getUserTubePositions(userId: string): Promise<UserTubePositions | null> {
    await this.initialize();

    try {
      const { data, error } = await this.supabase
        .from('user_state')
        .select('tube_positions')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // User not found
        }
        throw new Error(`DATABASE_ERROR - Failed to get user tube positions: ${error.message}`);
      }

      return data.tube_positions || null;
    } catch (error) {
      console.error('❌ TubeConfigurationService getUserTubePositions error:', error);
      throw new Error(`TUBE_CONFIG_ERROR - Failed to get user tube positions: ${error}`);
    }
  }

  /**
   * Update user tube positions
   */
  public async updateUserTubePositions(userId: string, tubePositions: UserTubePositions): Promise<void> {
    await this.initialize();

    try {
      const { error } = await this.supabase
        .from('user_state')
        .update({
          tube_positions: tubePositions,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        throw new Error(`DATABASE_ERROR - Failed to update user tube positions: ${error.message}`);
      }

      console.log(`✅ TubeConfigurationService: Updated tube positions for user ${userId}`);
    } catch (error) {
      console.error('❌ TubeConfigurationService updateUserTubePositions error:', error);
      throw new Error(`TUBE_CONFIG_ERROR - Failed to update user tube positions: ${error}`);
    }
  }

  /**
   * Get the current stitch for a user (position 1 of active tube)
   */
  public async getCurrentStitch(userId: string): Promise<string | null> {
    await this.initialize();

    try {
      const { data, error } = await this.supabase
        .from('user_state')
        .select('tube_positions, active_tube')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // User not found
        }
        throw new Error(`DATABASE_ERROR - Failed to get user state: ${error.message}`);
      }

      const { tube_positions, active_tube } = data;
      const tubeId = `tube${active_tube}`;
      
      if (tube_positions && tube_positions[tubeId] && tube_positions[tubeId]['1']) {
        return tube_positions[tubeId]['1'];
      }

      return null; // No stitch at position 1
    } catch (error) {
      console.error('❌ TubeConfigurationService getCurrentStitch error:', error);
      throw new Error(`TUBE_CONFIG_ERROR - Failed to get current stitch: ${error}`);
    }
  }

  /**
   * Clear cache (useful for testing or when default positions change)
   */
  public clearCache(): void {
    this.defaultPositionsCache = null;
  }
}

// Export singleton instance
export const tubeConfigurationService = new TubeConfigurationService();