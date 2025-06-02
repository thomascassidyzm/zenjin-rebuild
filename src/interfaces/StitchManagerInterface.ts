/**
 * StitchManagerInterface.ts
 * Generated from APML Interface Definition
 * Module: ProgressionSystem
 */


/**
 * Defines the contract for the StitchManager component that manages stitches (recipes/specifications for dynamic content generation) within tubes.
 * Stitches are specifications that define how to generate dynamic educational content, not containers of facts.
 */
/**
 * Stitch
 */
export interface Stitch {
  /** Unique identifier for the stitch */
  id: string;
  /** Name of the stitch */
  name: string;
  /** Description of the stitch */
  description?: string;
  /** ID of the tube this stitch belongs to (tube1, tube2, or tube3) */
  tubeId: string;
  /** Type of concept (e.g., 'times_table', 'fractions', 'mixed_operations') */
  conceptType: string;
  /** Parameters for content generation (e.g., {operand: 6, range: [1,20]}) */
  conceptParams: Record<string, any>;
  /** IDs of prerequisite stitches */
  prerequisites?: string[];
  /** Additional metadata for the stitch */
  metadata?: Record<string, any>;
}

/**
 * StitchProgress
 */
export interface StitchProgress {
  /** User identifier */
  userId: string;
  /** Stitch identifier */
  stitchId: string;
  /** Number of times the stitch has been completed */
  completionCount: number;
  /** Number of correct answers */
  correctCount: number;
  /** Total number of questions attempted */
  totalCount: number;
  /** Mastery level (0.0-1.0) */
  masteryLevel: number;
  /** ISO date string of last attempt */
  lastAttemptDate?: string;
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
  NO_STITCHES_AVAILABLE = 'NO_STITCHES_AVAILABLE',
}

/**
 * StitchManagerInterface
 */
export interface StitchManagerInterface {
  /**
   * Gets a stitch by its identifier
   * @param stitchId - Stitch identifier
   * @returns The stitch
   * @throws STITCH_NOT_FOUND if The specified stitch was not found
   */
  getStitchById(stitchId: string): Stitch;

  /**
   * Gets all stitches for a specific tube
   * @param tubeId - Tube identifier (tube1, tube2, or tube3)
   * @returns Array of stitches in the tube
   * @throws TUBE_NOT_FOUND if The specified tube was not found
   */
  getStitchesByTube(tubeId: string): any[];

  /**
   * Gets progress data for a specific stitch and user
   * @param userId - User identifier
   * @param stitchId - Stitch identifier
   * @returns Stitch progress data
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws STITCH_NOT_FOUND if The specified stitch was not found
   * @throws NO_PROGRESS_DATA if No progress data exists for this user and stitch
   */
  getStitchProgress(userId: string, stitchId: string): StitchProgress;

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
  updateStitchProgress(userId: string, stitchId: string, sessionResults: Record<string, any>): StitchProgress;

  /**
   * Repositions a stitch within its tube based on the Stitch Repositioning Algorithm
   * @param userId - User identifier
   * @param stitchId - Stitch identifier
   * @param performance - Performance data for repositioning
   * @returns Result of the repositioning operation
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws STITCH_NOT_FOUND if The specified stitch was not found
   * @throws INVALID_PERFORMANCE_DATA if The performance data is invalid
   * @throws REPOSITIONING_FAILED if Failed to reposition the stitch
   */
  repositionStitch(userId: string, stitchId: string, performance: Record<string, any>): { previousPosition: number; newPosition: number; skipNumber: number };

  /**
   * Gets the next stitch to present to the user in a tube
   * @param userId - User identifier
   * @param tubeId - Tube identifier (tube1, tube2, or tube3)
   * @returns The next stitch to present
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws TUBE_NOT_FOUND if The specified tube was not found
   * @throws NO_STITCHES_AVAILABLE if No stitches available in the tube
   */
  getNextStitch(userId: string, tubeId: string): Stitch;

}

// Export default interface
export default StitchManagerInterface;
