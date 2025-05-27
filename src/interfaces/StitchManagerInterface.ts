/**
 * StitchManagerInterface.ts
 * Generated from APML Interface Definition
 * Module: ProgressionSystem
 * 
 * UPDATED: Tube-based architecture with position management
 * Following APML Framework v1.4.2 and naming.apml conventions
 */

/**
 * Defines the contract for the StitchManager component that manages stitches (learning units) 
 * within tube positions using the Triple Helix architecture.
 */
/**
 * Enhanced Stitch ID format: tX-YYYY-ZZZZ
 * - X: Tube number (1, 2, 3)
 * - YYYY: Concept code (0001-9999, tube-specific)  
 * - ZZZZ: Creation order within concept (0001-9999)
 */
export type StitchId = string;

/**
 * Tube identifier for Triple Helix system
 */
export type TubeId = 'tube1' | 'tube2' | 'tube3';

/**
 * Logical position within a tube (can exceed number of stitches)
 */
export type LogicalPosition = number;

/**
 * Stitch entity with tube-based architecture
 */
export interface Stitch {
  id: StitchId; // Enhanced format: tX-YYYY-ZZZZ
  name: string; // Human-readable name of the stitch
  description?: string; // Description of the mathematical concept
  tubeId: TubeId; // Which tube this stitch belongs to
  conceptCode: string; // YYYY component (e.g., '0001' for multiplication)
  creationOrder: string; // ZZZZ component (e.g., '0023')
  difficulty: number; // Base difficulty level of the stitch (1-5)
  factIds: string[]; // IDs of mathematical facts covered in this stitch
  prerequisites?: StitchId[]; // IDs of prerequisite stitches
  metadata?: Record<string, any>; // Additional metadata for adaptive parameters
}

/**
 * User's progression data for a specific stitch
 */
export interface StitchProgress {
  userId: string; // User identifier
  stitchId: StitchId; // Enhanced stitch identifier
  skipNumber: 4 | 8 | 15 | 30 | 100 | 1000; // Current skip number in spaced repetition sequence
  boundaryLevel: 1 | 2 | 3 | 4 | 5; // Current boundary level (ratchets up, never resets)
  completions: number; // Total completions (any score)
  consecutivePerfect: number; // Consecutive 20/20 completions for skip progression
  readonly isRetired: boolean; // Whether stitch is retired (skipNumber = 1000)
  lastCompleted?: string; // ISO date string of last completion
  firstCompleted?: string; // ISO date string of first completion
}

/**
 * Session results for updating progress
 */
export interface SessionResults {
  correctCount: number; // Number of correct answers
  totalCount: number; // Total number of questions
  completionTime: number; // Time taken to complete (ms)
  completionDate: string; // ISO date string of completion
}

/**
 * Tube position mapping
 */
export interface TubePositionMap {
  [logicalPosition: LogicalPosition]: StitchId;
}

/**
 * Result of stitch repositioning operation
 */
export interface RepositionResult {
  stitchId: StitchId;
  previousPosition: LogicalPosition;
  newPosition: LogicalPosition;
  skipNumber: number;
  timestamp: string;
}

/**
 * Error codes for StitchManagerInterface
 */
export enum StitchManagerErrorCode {
  STITCH_NOT_FOUND = 'STITCH_NOT_FOUND',
  TUBE_NOT_FOUND = 'TUBE_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  NO_PROGRESS_DATA = 'NO_PROGRESS_DATA',
  INVALID_SESSION_RESULTS = 'INVALID_SESSION_RESULTS',
  INVALID_PERFORMANCE_DATA = 'INVALID_PERFORMANCE_DATA',
  REPOSITIONING_FAILED = 'REPOSITIONING_FAILED',
  NO_STITCHES_IN_TUBE = 'NO_STITCHES_IN_TUBE',
  POSITION_NOT_FOUND = 'POSITION_NOT_FOUND',
  INVALID_TUBE_ID = 'INVALID_TUBE_ID',
  INVALID_POSITION = 'INVALID_POSITION',
  COMPRESSION_FAILED = 'COMPRESSION_FAILED'
}

/**
 * StitchManagerInterface - Tube-based architecture
 * Following APML Framework v1.4.2 principles
 */
export interface StitchManagerInterface {
  /**
   * Gets a stitch by its identifier
   * @param stitchId - Enhanced stitch identifier (tX-YYYY-ZZZZ)
   * @returns The stitch
   * @throws STITCH_NOT_FOUND if The specified stitch was not found
   */
  getStitchById(stitchId: StitchId): Stitch;

  /**
   * Gets the stitch at a specific position in a tube
   * @param tubeId - Tube identifier
   * @param position - Logical position in the tube
   * @returns The stitch at that position
   * @throws TUBE_NOT_FOUND if The specified tube was not found
   * @throws POSITION_NOT_FOUND if No stitch exists at that position
   */
  getStitchAtTubePosition(tubeId: TubeId, position: LogicalPosition): Stitch;

  /**
   * Gets the position map for a specific tube
   * @param tubeId - Tube identifier
   * @returns Position map for the tube
   * @throws TUBE_NOT_FOUND if The specified tube was not found
   */
  getTubePositionMap(tubeId: TubeId): TubePositionMap;

  /**
   * Gets the active stitch for a user (position 1 in active tube)
   * @param userId - User identifier
   * @param tubeId - Active tube identifier
   * @returns The active stitch
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws TUBE_NOT_FOUND if The specified tube was not found
   * @throws NO_STITCHES_IN_TUBE if No stitches exist in the tube
   */
  getActiveStitch(userId: string, tubeId: TubeId): Stitch;

  /**
   * Gets progress data for a specific stitch and user
   * @param userId - User identifier
   * @param stitchId - Stitch identifier
   * @returns Stitch progress data
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws STITCH_NOT_FOUND if The specified stitch was not found
   * @throws NO_PROGRESS_DATA if No progress data exists for this user and stitch
   */
  getStitchProgress(userId: string, stitchId: StitchId): StitchProgress;

  /**
   * Updates progress data for a specific stitch and user
   * @param userId - User identifier
   * @param stitchId - Stitch identifier
   * @param sessionResults - Results from the learning session
   * @returns Updated stitch progress data
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws STITCH_NOT_FOUND if The specified stitch was not found
   * @throws INVALID_SESSION_RESULTS if The session results are invalid
   */
  updateStitchProgress(userId: string, stitchId: StitchId, sessionResults: SessionResults): StitchProgress;

  /**
   * Repositions a stitch within its tube based on the Stitch Repositioning Algorithm
   * @param userId - User identifier
   * @param stitchId - Stitch identifier
   * @param sessionResults - Session results for repositioning
   * @returns Result of the repositioning operation
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws STITCH_NOT_FOUND if The specified stitch was not found
   * @throws INVALID_SESSION_RESULTS if The session results are invalid
   * @throws REPOSITIONING_FAILED if Failed to reposition the stitch
   */
  repositionStitch(userId: string, stitchId: StitchId, sessionResults: SessionResults): RepositionResult;

  /**
   * Compresses position maps to optimize storage (removes gaps)
   * @param tubeId - Tube identifier to compress
   * @returns Compression result
   * @throws TUBE_NOT_FOUND if The specified tube was not found
   * @throws COMPRESSION_FAILED if Failed to compress positions
   */
  compressTubePositions(tubeId: TubeId): { originalPositions: number; compressedPositions: number; gapsRemoved: number };

  /**
   * Initializes default tube position maps for a new user
   * @param userId - User identifier
   * @returns Initial tube position maps
   * @throws USER_NOT_FOUND if The specified user was not found
   */
  initializeUserTubePositions(userId: string): Record<TubeId, TubePositionMap>;

}

// Export default interface
export default StitchManagerInterface;
