/**
 * ProgressTrackerInterface.ts
 * Generated from APML Interface Definition
 * Module: ProgressionSystem
 */

/**
 * 
    Defines the contract for the ProgressTracker component that tracks user progress through learning paths and content mastery.
  
 */
/**
 * UserProgress
 */
export interface UserProgress {
  userId: string; // User identifier
  overallCompletion: number; // Overall completion percentage (0.0-1.0)
  pathProgress: Record<string, any>; // Progress for each learning path
  masteredContent: number; // Number of mastered content items
  totalContent: number; // Total number of content items
  lastUpdateDate: string; // ISO date string of last update
}

/**
 * ContentMastery
 */
export interface ContentMastery {
  contentId: string; // Content identifier
  masteryLevel: number; // Mastery level (0.0-1.0)
  attemptsCount: number; // Number of attempts
  lastAttemptDate: string; // ISO date string of last attempt
  nextReviewDate?: string; // ISO date string of next scheduled review
}

/**
 * SessionResults
 */
export interface SessionResults {
  learningPathId: string; // Learning path identifier
  stitchId: string; // Stitch identifier
  correctCount: number; // Number of correct answers
  totalCount: number; // Total number of questions
  completionTime: number; // Time taken to complete in milliseconds
  timestamp?: string; // ISO date string of session completion
}

/**
 * Error codes for ProgressTrackerInterface
 */
export enum ProgressTrackerErrorCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  NO_PROGRESS_DATA = 'NO_PROGRESS_DATA',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_SESSION_RESULTS = 'INVALID_SESSION_RESULTS',
  UPDATE_FAILED = 'UPDATE_FAILED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  CONTENT_NOT_FOUND = 'CONTENT_NOT_FOUND',
  NO_MASTERY_DATA = 'NO_MASTERY_DATA',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  LEARNING_PATH_NOT_FOUND = 'LEARNING_PATH_NOT_FOUND',
  NO_PROGRESS_DATA = 'NO_PROGRESS_DATA',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  ALREADY_INITIALIZED = 'ALREADY_INITIALIZED',
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',
}

/**
 * ProgressTrackerInterface
 */
export interface ProgressTrackerInterface {
  /**
   * Gets overall progress data for a user
   * @param userId - User identifier
   * @returns User progress data
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws NO_PROGRESS_DATA if No progress data exists for this user
   */
  getUserProgress(userId: string): UserProgress;

  /**
   * Updates progress based on session results
   * @param userId - User identifier
   * @param sessionResults - Results from the learning session
   * @returns Updated user progress data
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws INVALID_SESSION_RESULTS if The session results are invalid
   * @throws UPDATE_FAILED if Failed to update progress
   */
  updateProgress(userId: string, sessionResults: SessionResults): UserProgress;

  /**
   * Gets mastery data for specific content
   * @param userId - User identifier
   * @param contentId - Content identifier
   * @returns Content mastery data
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws CONTENT_NOT_FOUND if The specified content was not found
   * @throws NO_MASTERY_DATA if No mastery data exists for this content
   */
  getContentMastery(userId: string, contentId: string): ContentMastery;

  /**
   * Gets detailed progress data for a specific learning path
   * @param userId - User identifier
   * @param learningPathId - Learning path identifier
   * @returns Detailed path progress data
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws LEARNING_PATH_NOT_FOUND if The specified learning path was not found
   * @throws NO_PROGRESS_DATA if No progress data exists for this path
   */
  getPathProgress(userId: string, learningPathId: string): { completion: number; stitchProgress: Record<string, any>; lastUpdateDate: string };

  /**
   * Initializes progress tracking for a new user
   * @param userId - User identifier
   * @returns Whether the initialization was successful
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws ALREADY_INITIALIZED if Progress tracking already initialized for this user
   * @throws INITIALIZATION_FAILED if Failed to initialize progress tracking
   */
  initializeUserProgress(userId: string): boolean;

}

// Export default interface
export default ProgressTrackerInterface;
