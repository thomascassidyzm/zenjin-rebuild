/**
 * DistinctionManagerInterface.ts
 * Generated from APML Interface Definition
 * Module: LearningEngine
 */


/**
 * Defines the contract for the DistinctionManager component that manages the five boundary levels of distinction and tracks user mastery at each level.
 */
/**
 * BoundaryLevel
 */
export interface BoundaryLevel {
  /** Boundary level (1-5) */
  level: number;
  /** Name of the boundary level */
  name: string;
  /** Description of the boundary level */
  description: string;
}

/**
 * UserStitchBoundaryLevel
 */
export interface UserStitchBoundaryLevel {
  /** User identifier */
  userId: string;
  /** Stitch identifier */
  stitchId: string;
  /** Current boundary level (1-5) */
  currentLevel: number;
  /** Mastery score for the current level (0.0-1.0) */
  masteryScore: number;
  /** Number of consecutive correct answers */
  consecutiveCorrect: number;
  /** Last response time in milliseconds */
  lastResponseTime?: number;
  /** ISO date string of last attempt */
  lastAttemptDate?: string;
}

/**
 * PerformanceData
 */
export interface PerformanceData {
  /** Whether the answer was correct on first attempt */
  correctFirstAttempt: boolean;
  /** Response time in milliseconds */
  responseTime: number;
  /** Number of consecutive correct answers */
  consecutiveCorrect?: number;
}

/**
 * Error codes for DistinctionManagerInterface
 */
export enum DistinctionManagerErrorCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  STITCH_NOT_FOUND = 'STITCH_NOT_FOUND',
  NO_MASTERY_DATA = 'NO_MASTERY_DATA',
  INVALID_PERFORMANCE_DATA = 'INVALID_PERFORMANCE_DATA',
  INVALID_LEVEL = 'INVALID_LEVEL',
  ALREADY_INITIALIZED = 'ALREADY_INITIALIZED',
  INVALID_ANSWER = 'INVALID_ANSWER',
}

/**
 * DistinctionManagerInterface
 */
export interface DistinctionManagerInterface {
  /**
   * Gets the current boundary level for a user and stitch
   * @param userId - User identifier
   * @param stitchId - Stitch identifier
   * @returns Current boundary level (1-5)
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws STITCH_NOT_FOUND if The specified stitch was not found
   * @throws NO_MASTERY_DATA if No mastery data exists for this user and stitch
   */
  getCurrentBoundaryLevel(userId: string, stitchId: string): number;

  /**
   * Gets detailed mastery data for a user and stitch
   * @param userId - User identifier
   * @param stitchId - Stitch identifier
   * @returns User stitch mastery data
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws STITCH_NOT_FOUND if The specified stitch was not found
   * @throws NO_MASTERY_DATA if No mastery data exists for this user and stitch
   */
  getUserStitchMastery(userId: string, stitchId: string): UserStitchBoundaryLevel;

  /**
   * Updates the boundary level based on user performance
   * @param userId - User identifier
   * @param stitchId - Stitch identifier
   * @param performance - Performance data for the update
   * @returns Result of the update operation
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws STITCH_NOT_FOUND if The specified stitch was not found
   * @throws INVALID_PERFORMANCE_DATA if The performance data is invalid
   */
  updateBoundaryLevel(userId: string, stitchId: string, performance: PerformanceData): { previousLevel: number; newLevel: number; levelChanged: boolean; masteryScore: number };

  /**
   * Gets the description of a specific boundary level
   * @param level - Boundary level (1-5)
   * @returns Boundary level description
   * @throws INVALID_LEVEL if The specified level is invalid
   */
  getBoundaryLevelDescription(level: number): BoundaryLevel;

  /**
   * Gets descriptions of all boundary levels
   * @returns Array of all boundary level descriptions
   */
  getAllBoundaryLevels(): any[];

  /**
   * Initializes mastery data for a user and stitch
   * @param userId - User identifier
   * @param stitchId - Stitch identifier
   * @param initialLevel - Initial boundary level (1-5)
   * @returns Whether the initialization was successful
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws STITCH_NOT_FOUND if The specified stitch was not found
   * @throws INVALID_LEVEL if The specified level is invalid
   * @throws ALREADY_INITIALIZED if Mastery data already exists for this user and stitch
   */
  initializeUserStitchMastery(userId: string, stitchId: string, initialLevel?: number): boolean;

  /**
   * Generates a distractor value for the given stitch based on the current boundary level
   * @param stitchId - Stitch identifier
   * @param boundaryLevel - Current boundary level (1-5)
   * @param correctAnswer - The correct answer to generate a distractor for
   * @returns Generated distractor value
   * @throws STITCH_NOT_FOUND if The specified stitch was not found
   * @throws INVALID_LEVEL if The specified level is invalid
   * @throws INVALID_ANSWER if The correct answer is invalid
   */
  generateDistractor(stitchId: string, boundaryLevel: number, correctAnswer: number): number;

}

// Export default interface
export default DistinctionManagerInterface;
