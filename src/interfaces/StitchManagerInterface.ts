/**
 * StitchManagerInterface.ts
 * Generated from APML Interface Definition
 * Module: ProgressionSystem
 */

/**
 * 
    Defines the contract for the StitchManager component that manages stitches (learning units) within learning paths.
  
 */
/**
 * Stitch
 */
export interface Stitch {
  id: string; // Unique identifier for the stitch
  name: string; // Name of the stitch
  description?: string; // Description of the stitch
  learningPathId: string; // ID of the learning path this stitch belongs to
  position: number; // Position in the learning path queue
  difficulty: number; // Difficulty level of the stitch (1-5)
  factIds: string[]; // IDs of mathematical facts covered in this stitch
  prerequisites?: string[]; // IDs of prerequisite stitches
  metadata?: Record<string, any>; // Additional metadata for the stitch
}

/**
 * StitchProgress
 */
export interface StitchProgress {
  userId: string; // User identifier
  stitchId: string; // Stitch identifier
  completionCount: number; // Number of times the stitch has been completed
  correctCount: number; // Number of correct answers
  totalCount: number; // Total number of questions attempted
  masteryLevel: number; // Mastery level (0.0-1.0)
  lastAttemptDate?: string; // ISO date string of last attempt
}

/**
 * Error codes for StitchManagerInterface
 */
export enum StitchManagerErrorCode {
  STITCH_NOT_FOUND = 'STITCH_NOT_FOUND',
  LEARNING_PATH_NOT_FOUND = 'LEARNING_PATH_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  STITCH_NOT_FOUND = 'STITCH_NOT_FOUND',
  NO_PROGRESS_DATA = 'NO_PROGRESS_DATA',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  STITCH_NOT_FOUND = 'STITCH_NOT_FOUND',
  INVALID_SESSION_RESULTS = 'INVALID_SESSION_RESULTS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  STITCH_NOT_FOUND = 'STITCH_NOT_FOUND',
  INVALID_PERFORMANCE_DATA = 'INVALID_PERFORMANCE_DATA',
  REPOSITIONING_FAILED = 'REPOSITIONING_FAILED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  LEARNING_PATH_NOT_FOUND = 'LEARNING_PATH_NOT_FOUND',
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
   * Gets all stitches for a specific learning path
   * @param learningPathId - Learning path identifier
   * @returns Array of stitches in the learning path
   * @throws LEARNING_PATH_NOT_FOUND if The specified learning path was not found
   */
  getStitchesByLearningPath(learningPathId: string): Stitch[];

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
  updateStitchProgress(userId: string, stitchId: string, sessionResults: { correctCount: number; totalCount: number; completionTime: number }): StitchProgress;

  /**
   * Repositions a stitch within its learning path based on the Stitch Repositioning Algorithm
   * @param userId - User identifier
   * @param stitchId - Stitch identifier
   * @param performance - Performance data for repositioning
   * @returns Result of the repositioning operation
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws STITCH_NOT_FOUND if The specified stitch was not found
   * @throws INVALID_PERFORMANCE_DATA if The performance data is invalid
   * @throws REPOSITIONING_FAILED if Failed to reposition the stitch
   */
  repositionStitch(userId: string, stitchId: string, performance: { correctCount: number; totalCount: number; averageResponseTime: number }): { previousPosition: number; newPosition: number; skipNumber: number };

  /**
   * Gets the next stitch to present to the user in a learning path
   * @param userId - User identifier
   * @param learningPathId - Learning path identifier
   * @returns The next stitch to present
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws LEARNING_PATH_NOT_FOUND if The specified learning path was not found
   * @throws NO_STITCHES_AVAILABLE if No stitches available in the learning path
   */
  getNextStitch(userId: string, learningPathId: string): Stitch;

}

// Export default interface
export default StitchManagerInterface;
