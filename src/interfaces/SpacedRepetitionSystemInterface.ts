/**
 * SpacedRepetitionSystemInterface.ts
 * Generated from APML Interface Definition
 * Module: ProgressionSystem
 */

/**
 * 
    Defines the contract for the SpacedRepetitionSystem component that implements the Stitch Repositioning Algorithm for spaced repetition.
  
 */
/**
 * PerformanceData
 */
export interface PerformanceData {
  correctCount: number; // Number of correct answers
  totalCount: number; // Total number of questions
  averageResponseTime: number; // Average response time in milliseconds
  completionDate?: string; // ISO date string of completion
}

/**
 * RepositionResult
 */
export interface RepositionResult {
  stitchId: string; // Stitch identifier
  previousPosition: number; // Previous position in the queue
  newPosition: number; // New position in the queue
  skipNumber: number; // Skip number used for repositioning
  timestamp: string; // ISO date string of repositioning
}

/**
 * Error codes for SpacedRepetitionSystemInterface
 */
export enum SpacedRepetitionSystemErrorCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  STITCH_NOT_FOUND = 'STITCH_NOT_FOUND',
  INVALID_PERFORMANCE_DATA = 'INVALID_PERFORMANCE_DATA',
  REPOSITIONING_FAILED = 'REPOSITIONING_FAILED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  LEARNING_PATH_NOT_FOUND = 'LEARNING_PATH_NOT_FOUND',
  NO_STITCHES_AVAILABLE = 'NO_STITCHES_AVAILABLE',
  INVALID_PERFORMANCE_DATA = 'INVALID_PERFORMANCE_DATA',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  LEARNING_PATH_NOT_FOUND = 'LEARNING_PATH_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  STITCH_NOT_FOUND = 'STITCH_NOT_FOUND',
}

/**
 * SpacedRepetitionSystemInterface
 */
export interface SpacedRepetitionSystemInterface {
  /**
   * Repositions a stitch based on performance using the Stitch Repositioning Algorithm
   * @param userId - User identifier
   * @param stitchId - Stitch identifier
   * @param performance - Performance data for repositioning
   * @returns Result of the repositioning operation
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws STITCH_NOT_FOUND if The specified stitch was not found
   * @throws INVALID_PERFORMANCE_DATA if The performance data is invalid
   * @throws REPOSITIONING_FAILED if Failed to reposition the stitch
   */
  repositionStitch(userId: string, stitchId: string, performance: PerformanceData): RepositionResult;

  /**
   * Gets the next stitch to present to the user in a learning path
   * @param userId - User identifier
   * @param learningPathId - Learning path identifier
   * @returns The next stitch to present
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws LEARNING_PATH_NOT_FOUND if The specified learning path was not found
   * @throws NO_STITCHES_AVAILABLE if No stitches available in the learning path
   */
  getNextStitch(userId: string, learningPathId: string): { id: string; position: number; content: Record<string, any> };

  /**
   * Calculates the skip number based on performance
   * @param performance - Performance data
   * @returns Calculated skip number
   * @throws INVALID_PERFORMANCE_DATA if The performance data is invalid
   */
  calculateSkipNumber(performance: PerformanceData): number;

  /**
   * Gets the current stitch queue for a user and learning path
   * @param userId - User identifier
   * @param learningPathId - Learning path identifier
   * @returns Array of stitches in queue order
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws LEARNING_PATH_NOT_FOUND if The specified learning path was not found
   */
  getStitchQueue(userId: string, learningPathId: string): { id: string; position: number };

  /**
   * Gets the repositioning history for a specific stitch and user
   * @param userId - User identifier
   * @param stitchId - Stitch identifier
   * @param limit - Maximum number of history entries to return
   * @returns Array of repositioning history entries
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws STITCH_NOT_FOUND if The specified stitch was not found
   */
  getRepositioningHistory(userId: string, stitchId: string, limit?: number): RepositionResult[];

}

// Export default interface
export default SpacedRepetitionSystemInterface;
