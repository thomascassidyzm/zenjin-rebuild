/**
 * TripleHelixManagerInterface.ts
 * Generated from APML Interface Definition
 * Module: ProgressionSystem
 * 
 * UPDATED: Tube-based architecture with Live Aid Stage Model
 * Following APML Framework v1.4.2 and naming.apml conventions
 */

/**
 * Defines the contract for the TripleHelixManager component that manages three tubes 
 * with position-based stitches and their rotation according to the Live Aid Stage Model.
 */
/**
 * Import types from StitchManagerInterface
 */
import { StitchId, TubeId, LogicalPosition, TubePositionMap } from './StitchManagerInterface';

/**
 * Tube status in Live Aid Stage Model
 */
export type TubeStatus = 'live' | 'ready' | 'preparing';

/**
 * Tube container with position management
 */
export interface Tube {
  id: TubeId; // Tube identifier (tube1, tube2, tube3)
  name: string; // Human-readable name of the tube
  description?: string; // Description of the tube's focus
  status: TubeStatus; // Current status in Live Aid rotation
  positionMap: TubePositionMap; // Map of logical positions to stitch IDs
  activeStitchId?: StitchId; // Currently active stitch (position 1)
  totalStitches: number; // Total number of stitches in this tube
  metadata?: Record<string, any>; // Additional tube metadata
}

/**
 * Complete Triple Helix state for a user
 */
export interface TripleHelixState {
  userId: string; // User identifier
  tubes: {
    tube1: Tube;
    tube2: Tube;
    tube3: Tube;
  }; // All three tubes with their current states
  activeTube: TubeId; // Which tube is currently LIVE
  lastRotationTime?: string; // ISO date string of last rotation
  rotationCount: number; // Number of rotations performed
  sessionCount: number; // Total learning sessions completed
}

/**
 * Result of tube rotation operation
 */
export interface TubeRotationResult {
  previousActiveTube: TubeId;
  newActiveTube: TubeId;
  rotationCount: number;
  timestamp: string;
  tubeStates: {
    [K in TubeId]: TubeStatus;
  };
}

/**
 * Error codes for TripleHelixManagerInterface
 */
export enum TripleHelixManagerErrorCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  NO_ACTIVE_TUBE = 'NO_ACTIVE_TUBE',
  NO_TRIPLE_HELIX = 'NO_TRIPLE_HELIX',
  ROTATION_FAILED = 'ROTATION_FAILED',
  ALREADY_INITIALIZED = 'ALREADY_INITIALIZED',
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',
  TUBE_NOT_FOUND = 'TUBE_NOT_FOUND',
  INVALID_TUBE_STATUS = 'INVALID_TUBE_STATUS',
  INVALID_TUBE_ID = 'INVALID_TUBE_ID',
  TUBE_PREPARATION_FAILED = 'TUBE_PREPARATION_FAILED'
}

/**
 * TripleHelixManagerInterface - Tube-based architecture with Live Aid Stage Model
 * Following APML Framework v1.4.2 principles
 */
export interface TripleHelixManagerInterface {
  /**
   * Gets the currently active tube for a user (LIVE status)
   * @param userId - User identifier
   * @returns The active tube
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws NO_ACTIVE_TUBE if No active tube exists for this user
   */
  getActiveTube(userId: string): Tube;

  /**
   * Gets all tubes for a user with their current status
   * @param userId - User identifier
   * @returns Object containing all three tubes
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws NO_TRIPLE_HELIX if No triple helix exists for this user
   */
  getAllTubes(userId: string): { tube1: Tube; tube2: Tube; tube3: Tube };

  /**
   * Gets tubes by their status (live, ready, preparing)
   * @param userId - User identifier
   * @param status - Tube status to filter by
   * @returns Array of tubes with the specified status
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws INVALID_TUBE_STATUS if The specified status is invalid
   */
  getTubesByStatus(userId: string, status: TubeStatus): Tube[];

  /**
   * Rotates the tubes according to Live Aid Stage Model
   * LIVE → PREPARING, READY → LIVE, PREPARING → READY
   * @param userId - User identifier
   * @returns Result of the rotation operation
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws NO_TRIPLE_HELIX if No triple helix exists for this user
   * @throws ROTATION_FAILED if Failed to rotate tubes
   */
  rotateTubes(userId: string): TubeRotationResult;

  /**
   * Sets up the initial Triple Helix state for a new user
   * @param userId - User identifier
   * @param initialStitches - Optional initial stitches to populate tubes
   * @returns Initial triple helix state
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws ALREADY_INITIALIZED if Triple helix already initialized for this user
   * @throws INITIALIZATION_FAILED if Failed to initialize triple helix
   */
  initializeTripleHelix(userId: string, initialStitches?: StitchId[]): TripleHelixState;

  /**
   * Gets the current triple helix state for a user
   * @param userId - User identifier
   * @returns Current triple helix state
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws NO_TRIPLE_HELIX if No triple helix exists for this user
   */
  getTripleHelixState(userId: string): TripleHelixState;

  /**
   * Updates a specific tube's position map
   * @param userId - User identifier
   * @param tubeId - Tube identifier
   * @param positionMap - New position map
   * @returns Updated tube
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws TUBE_NOT_FOUND if The specified tube was not found
   */
  updateTubePositions(userId: string, tubeId: TubeId, positionMap: TubePositionMap): Tube;

  /**
   * Prepares content for ready and preparing tubes (Live Aid background preparation)
   * @param userId - User identifier
   * @returns Preparation results for each tube
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws TUBE_PREPARATION_FAILED if Failed to prepare tube content
   */
  prepareBackgroundContent(userId: string): Record<TubeId, { prepared: boolean; stitchCount: number }>;

}

// Export default interface
export default TripleHelixManagerInterface;
