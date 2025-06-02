/**
 * UserStateManagerInterface.ts
 * Generated from APML Interface Definition
 * Module: UserManagement
 */

import { PositionManagerInterface } from './PositionManagerInterface';
import { TripleHelixManagerInterface } from './TripleHelixManagerInterface';

/**
 * User's current position maps for all tubes
 */
export interface UserTubePositions {
  tube1: PositionMap;
  tube2: PositionMap;
  tube3: PositionMap;
}

/**
 * User's progress on a specific stitch
 */
export interface StitchProgress {
  /** Current skip number in sequence */
  skip_number: number;
  /** Current distractor difficulty level */
  boundary_level: number;
  last_completed: string;
  total_completions: number;
  /** Number of 20/20 completions */
  perfect_completions: number;
}

/**
 * Complete user state for content system
 */
export interface UserContentState {
  user_id: string;
  tube_positions: UserTubePositions;
  stitch_progress: Record<string, any>;
  triple_helix_state: {
    active_tube: number;
    rotation_count: number;
    last_rotation: string;
  };
  progress_metrics: {
    total_points: number;
    /** First Time Correct points */
    ftc_points: number;
    /** Eventually Correct points */
    ec_points: number;
    total_questions: number;
    total_sessions: number;
  };
  last_sync_time: string;
  /** State version for migrations */
  version: number;
}

/**
 * Error codes for UserStateManagerInterface
 */
export enum UserStateManagerErrorCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  STATE_VERSION_MISMATCH = 'STATE_VERSION_MISMATCH',
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',
  SYNC_CONFLICT = 'SYNC_CONFLICT',
}

/**
 * UserStateManagerInterface
 */
export interface UserStateManagerInterface {
  /**
   * Initialize state for a new user from defaults
   * @param user_id - user_id
   * @param user_type - user_type
   * @returns Initialized user state
   * @throws INITIALIZATION_FAILED if Failed to initialize user state
   */
  initializeNewUser(user_id: string, user_type: string): UserContentState;

  /**
   * Get current state for a user
   * @param user_id - user_id
   * @returns Current user state
   * @throws USER_NOT_FOUND if User does not exist
   */
  getUserState(user_id: string): UserContentState;

  /**
   * Update progress after stitch completion
   * @param user_id - user_id
   * @param stitch_id - stitch_id
   * @param performance - performance
   * @returns Result
   */
  updateStitchProgress(user_id: string, stitch_id: string, performance: Record<string, any>): { new_skip_number: number; new_boundary_level: number; position_changed: boolean; new_position: number };

  /**
   * Rotate tubes after stitch completion
   * @param user_id - user_id
   * @returns Result
   */
  rotateTubes(user_id: string): { previous_active: number; new_active: number; rotation_count: number };

  /**
   * Get current stitch and its progress data
   * @param user_id - user_id
   * @returns Result
   */
  getActiveStitchWithProgress(user_id: string): { stitch_id: string; tube_id: string; logical_position: number; skip_number: number; boundary_level: number };

  /**
   * Migrate user state to new version
   * @param user_id - user_id
   * @param from_version - from_version
   * @param to_version - to_version
   * @returns Migrated user state
   * @throws STATE_VERSION_MISMATCH if User state version incompatible
   */
  migrateUserState(user_id: string, from_version: number, to_version: number): UserContentState;

  /**
   * Sync user state with backend
   * @param user_id - user_id
   * @param local_state - local_state
   * @param force - Force overwrite conflicts
   * @returns Result
   * @throws SYNC_CONFLICT if State sync conflict detected
   */
  syncUserState(user_id: string, local_state: UserContentState, force: boolean): { synced: boolean; conflicts: any[]; server_state: UserContentState };

}

// Export default interface
export default UserStateManagerInterface;
