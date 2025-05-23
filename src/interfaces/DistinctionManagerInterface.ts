/**
 * DistinctionManagerInterface.ts
 * Generated from APML Interface Definition
 * Module: LearningEngine
 */

/**
 * 
    Defines the contract for the DistinctionManager component that manages the five boundary levels of distinction and tracks user mastery at each level.
  
 */
/**
 * BoundaryLevel
 */
export interface BoundaryLevel {
  level: number; // Boundary level (1-5)
  name: string; // Name of the boundary level
  description: string; // Description of the boundary level
}

/**
 * UserFactMastery
 */
export interface UserFactMastery {
  userId: string; // User identifier
  factId: string; // Mathematical fact identifier
  currentLevel: number; // Current boundary level (1-5)
  masteryScore: number; // Mastery score for the current level (0.0-1.0)
  consecutiveCorrect: number; // Number of consecutive correct answers
  lastResponseTime?: number; // Last response time in milliseconds
  lastAttemptDate?: string; // ISO date string of last attempt
}

/**
 * PerformanceData
 */
export interface PerformanceData {
  correctFirstAttempt: boolean; // Whether the answer was correct on first attempt
  responseTime: number; // Response time in milliseconds
  consecutiveCorrect?: number; // Number of consecutive correct answers
}

/**
 * Error codes for DistinctionManagerInterface
 */
export enum DistinctionManagerErrorCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  FACT_NOT_FOUND = 'FACT_NOT_FOUND',
  NO_MASTERY_DATA = 'NO_MASTERY_DATA',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  FACT_NOT_FOUND = 'FACT_NOT_FOUND',
  NO_MASTERY_DATA = 'NO_MASTERY_DATA',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  FACT_NOT_FOUND = 'FACT_NOT_FOUND',
  INVALID_PERFORMANCE_DATA = 'INVALID_PERFORMANCE_DATA',
  INVALID_LEVEL = 'INVALID_LEVEL',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  FACT_NOT_FOUND = 'FACT_NOT_FOUND',
  INVALID_LEVEL = 'INVALID_LEVEL',
  ALREADY_INITIALIZED = 'ALREADY_INITIALIZED',
}

/**
 * DistinctionManagerInterface
 */
export interface DistinctionManagerInterface {
  /**
   * Gets the current boundary level for a user and fact
   * @param userId - User identifier
   * @param factId - Mathematical fact identifier
   * @returns Current boundary level (1-5)
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws FACT_NOT_FOUND if The specified fact was not found
   * @throws NO_MASTERY_DATA if No mastery data exists for this user and fact
   */
  getCurrentBoundaryLevel(userId: string, factId: string): number;

  /**
   * Gets detailed mastery data for a user and fact
   * @param userId - User identifier
   * @param factId - Mathematical fact identifier
   * @returns User fact mastery data
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws FACT_NOT_FOUND if The specified fact was not found
   * @throws NO_MASTERY_DATA if No mastery data exists for this user and fact
   */
  getUserFactMastery(userId: string, factId: string): UserFactMastery;

  /**
   * Updates the boundary level based on user performance
   * @param userId - User identifier
   * @param factId - Mathematical fact identifier
   * @param performance - Performance data for the update
   * @returns Result of the update operation
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws FACT_NOT_FOUND if The specified fact was not found
   * @throws INVALID_PERFORMANCE_DATA if The performance data is invalid
   */
  updateBoundaryLevel(userId: string, factId: string, performance: PerformanceData): { previousLevel: number; newLevel: number; levelChanged: boolean; masteryScore: number };

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
  getAllBoundaryLevels(): BoundaryLevel[];

  /**
   * Initializes mastery data for a user and fact
   * @param userId - User identifier
   * @param factId - Mathematical fact identifier
   * @param initialLevel - Initial boundary level (1-5)
   * @returns Whether the initialization was successful
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws FACT_NOT_FOUND if The specified fact was not found
   * @throws INVALID_LEVEL if The specified initial level is invalid
   * @throws ALREADY_INITIALIZED if Mastery data already exists for this user and fact
   */
  initializeUserFactMastery(userId: string, factId: string, initialLevel?: number): boolean;

}

// Export default interface
export default DistinctionManagerInterface;
