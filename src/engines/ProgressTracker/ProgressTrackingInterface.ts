/**
 * ProgressTrackingInterface.ts
 * 
 * Defines the interfaces and types for the ProgressTracker component of the
 * Zenjin Maths App rebuild project.
 */

/**
 * Represents overall progress data for a user
 */
export interface UserProgress {
  /** User identifier */
  userId: string;
  
  /** Overall completion percentage (0.0-1.0) */
  overallCompletion: number;
  
  /** Progress for each learning path */
  pathProgress: {
    [pathId: string]: number; // Completion percentage for the path (0.0-1.0)
  };
  
  /** Number of mastered content items */
  masteredContent: number;
  
  /** Total number of content items */
  totalContent: number;
  
  /** ISO date string of last update */
  lastUpdateDate: string;
}

/**
 * Represents mastery data for a specific content item
 */
export interface ContentMastery {
  /** Content identifier */
  contentId: string;
  
  /** Mastery level (0.0-1.0) */
  masteryLevel: number;
  
  /** Number of attempts */
  attemptsCount: number;
  
  /** ISO date string of last attempt */
  lastAttemptDate: string;
  
  /** ISO date string of next scheduled review (optional) */
  nextReviewDate?: string;
}

/**
 * Represents results from a learning session
 */
export interface SessionResults {
  /** Learning path identifier */
  learningPathId: string;
  
  /** Stitch identifier */
  stitchId: string;
  
  /** Number of correct answers */
  correctCount: number;
  
  /** Total number of questions */
  totalCount: number;
  
  /** Time taken to complete in milliseconds */
  completionTime: number;
  
  /** ISO date string of session completion (defaults to current time) */
  timestamp?: string;
}

/**
 * Represents detailed progress data for a specific learning path
 */
export interface PathProgressDetails {
  /** Overall completion percentage for the path (0.0-1.0) */
  completion: number;
  
  /** Progress for each stitch in the path */
  stitchProgress: {
    [stitchId: string]: {
      /** Mastery level (0.0-1.0) */
      masteryLevel: number;
      
      /** Number of attempts */
      attemptsCount: number;
      
      /** Current position in the queue */
      position: number;
    }
  };
  
  /** ISO date string of last update */
  lastUpdateDate: string;
}

/**
 * Represents the expected time for completing a specific content item
 */
export interface ContentExpectedTime {
  /** Content identifier */
  contentId: string;
  
  /** Expected completion time in milliseconds */
  expectedTime: number;
}

/**
 * Represents the structure of a learning path
 */
export interface LearningPath {
  /** Learning path identifier */
  id: string;
  
  /** Content items (stitches) in this learning path */
  stitches: {
    /** Stitch identifier */
    id: string;
    
    /** Position in the learning path */
    position: number;
  }[];
  
  /** Weight of this path in overall progress calculation */
  weight: number;
}

/**
 * Error codes for the ProgressTracker component
 */
export enum ProgressTrackerError {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  CONTENT_NOT_FOUND = 'CONTENT_NOT_FOUND',
  LEARNING_PATH_NOT_FOUND = 'LEARNING_PATH_NOT_FOUND',
  NO_PROGRESS_DATA = 'NO_PROGRESS_DATA',
  NO_MASTERY_DATA = 'NO_MASTERY_DATA',
  INVALID_SESSION_RESULTS = 'INVALID_SESSION_RESULTS',
  UPDATE_FAILED = 'UPDATE_FAILED',
  ALREADY_INITIALIZED = 'ALREADY_INITIALIZED',
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED'
}

/**
 * Interface for the ProgressTracker component
 */
export interface ProgressTrackingInterface {
  /**
   * Gets overall progress data for a user
   * @param userId - User identifier
   * @returns User progress data
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws NO_PROGRESS_DATA if no progress data exists for this user
   */
  getUserProgress(userId: string): UserProgress;
  
  /**
   * Updates progress based on session results
   * @param userId - User identifier
   * @param sessionResults - Results from the learning session
   * @returns Updated user progress data
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws INVALID_SESSION_RESULTS if the session results are invalid
   * @throws UPDATE_FAILED if failed to update progress
   */
  updateProgress(userId: string, sessionResults: SessionResults): UserProgress;
  
  /**
   * Gets mastery data for specific content
   * @param userId - User identifier
   * @param contentId - Content identifier
   * @returns Content mastery data
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws CONTENT_NOT_FOUND if the specified content was not found
   * @throws NO_MASTERY_DATA if no mastery data exists for this content
   */
  getContentMastery(userId: string, contentId: string): ContentMastery;
  
  /**
   * Gets detailed progress data for a specific learning path
   * @param userId - User identifier
   * @param learningPathId - Learning path identifier
   * @returns Detailed path progress data
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws LEARNING_PATH_NOT_FOUND if the specified learning path was not found
   * @throws NO_PROGRESS_DATA if no progress data exists for this path
   */
  getPathProgress(userId: string, learningPathId: string): PathProgressDetails;
  
  /**
   * Initializes progress tracking for a new user
   * @param userId - User identifier
   * @returns Whether the initialization was successful
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws ALREADY_INITIALIZED if progress tracking already initialized for this user
   * @throws INITIALIZATION_FAILED if failed to initialize progress tracking
   */
  initializeUserProgress(userId: string): boolean;
}