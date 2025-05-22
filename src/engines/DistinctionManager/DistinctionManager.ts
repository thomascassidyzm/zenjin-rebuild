/**
 * DistinctionManager.tsx
 * 
 * Implementation of the DistinctionManager component for the Zenjin Maths App.
 * This component manages the five boundary levels of distinction and tracks user mastery at each level,
 * forming the core of the distinction-based learning approach.
 * 
 * @module LearningEngine
 */

import { DistinctionManagerInterface } from './interfaces/DistinctionManagerInterface';
import { FactRepositoryInterface } from './interfaces/FactRepositoryInterface';

/**
 * Represents a boundary level in the distinction-based learning model
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
 * Represents a user's mastery data for a specific mathematical fact
 */
export interface UserFactMastery {
  /** User identifier */
  userId: string;
  /** Mathematical fact identifier */
  factId: string;
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
 * Performance data for updating boundary levels
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
 * Result of a boundary level update operation
 */
export interface BoundaryUpdateResult {
  /** Previous boundary level */
  previousLevel: number;
  /** New boundary level */
  newLevel: number;
  /** Whether the level changed */
  levelChanged: boolean;
  /** Updated mastery score */
  masteryScore: number;
}

/**
 * Error codes for the DistinctionManager
 */
export enum DistinctionManagerErrorCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  FACT_NOT_FOUND = 'FACT_NOT_FOUND',
  NO_MASTERY_DATA = 'NO_MASTERY_DATA',
  INVALID_LEVEL = 'INVALID_LEVEL',
  INVALID_PERFORMANCE_DATA = 'INVALID_PERFORMANCE_DATA',
  ALREADY_INITIALIZED = 'ALREADY_INITIALIZED'
}

/**
 * Custom error class for DistinctionManager operations
 */
export class DistinctionManagerError extends Error {
  code: DistinctionManagerErrorCode;

  constructor(code: DistinctionManagerErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = 'DistinctionManagerError';
  }
}

/**
 * Implementation of the DistinctionManager component.
 * Manages the five boundary levels of distinction and tracks user mastery at each level.
 */
export class DistinctionManager implements DistinctionManagerInterface {
  /** Static definition of boundary levels */
  private readonly boundaryLevels: BoundaryLevel[] = [
    {
      level: 1,
      name: 'Category Boundaries',
      description: 'Mathematical answers must be numerical'
    },
    {
      level: 2,
      name: 'Magnitude Boundaries',
      description: 'Awareness of appropriate numerical ranges'
    },
    {
      level: 3,
      name: 'Operation Boundaries',
      description: 'Differentiation between mathematical operations'
    },
    {
      level: 4,
      name: 'Related Fact Boundaries',
      description: 'Distinction between adjacent facts in the same operation'
    },
    {
      level: 5,
      name: 'Near Miss Boundaries',
      description: 'Precise differentiation between very similar numerical answers'
    }
  ];

  /** Factory repository for validating fact IDs */
  private factRepository: FactRepositoryInterface;

  /** In-memory storage for user mastery data */
  private userMasteryData: Map<string, UserFactMastery> = new Map();

  /** 
   * Thresholds for level progression:
   * - masteryThreshold: Minimum mastery score required to progress to next level
   * - consecutiveCorrectThreshold: Minimum consecutive correct answers required to progress to next level
   * - maxResponseTimeMs: Maximum response time (in ms) for considering a response as "fast"
   * - demotionThreshold: Mastery score below which a user will be demoted to the previous level
   * - demotionConsecutiveIncorrect: Number of consecutive incorrect answers that triggers demotion
   */
  private readonly progressionThresholds = {
    masteryThreshold: 0.8,
    consecutiveCorrectThreshold: 3,
    maxResponseTimeMs: {
      1: 5000,  // Level 1: 5 seconds
      2: 4000,  // Level 2: 4 seconds
      3: 3000,  // Level 3: 3 seconds
      4: 2500,  // Level 4: 2.5 seconds
      5: 2000   // Level 5: 2 seconds
    },
    demotionThreshold: 0.3,
    demotionConsecutiveIncorrect: 3
  };

  /**
   * Creates a new instance of the DistinctionManager
   * 
   * @param factRepository The fact repository to use for validating fact IDs
   */
  constructor(factRepository: FactRepositoryInterface) {
    this.factRepository = factRepository;
  }

  /**
   * Gets the current boundary level for a user and fact
   * 
   * @param userId User identifier
   * @param factId Mathematical fact identifier
   * @returns Current boundary level (1-5)
   * @throws {DistinctionManagerError} If user/fact not found or no mastery data exists
   */
  getCurrentBoundaryLevel(userId: string, factId: string): number {
    this.validateUserAndFact(userId, factId);
    
    const masteryData = this.getUserFactMasteryInternal(userId, factId);
    if (!masteryData) {
      throw new DistinctionManagerError(
        DistinctionManagerErrorCode.NO_MASTERY_DATA,
        `No mastery data exists for user ${userId} and fact ${factId}`
      );
    }
    
    return masteryData.currentLevel;
  }

  /**
   * Gets detailed mastery data for a user and fact
   * 
   * @param userId User identifier
   * @param factId Mathematical fact identifier
   * @returns User fact mastery data
   * @throws {DistinctionManagerError} If user/fact not found or no mastery data exists
   */
  getUserFactMastery(userId: string, factId: string): UserFactMastery {
    this.validateUserAndFact(userId, factId);
    
    const masteryData = this.getUserFactMasteryInternal(userId, factId);
    if (!masteryData) {
      throw new DistinctionManagerError(
        DistinctionManagerErrorCode.NO_MASTERY_DATA,
        `No mastery data exists for user ${userId} and fact ${factId}`
      );
    }
    
    // Return a copy to prevent external modification
    return { ...masteryData };
  }

  /**
   * Updates the boundary level based on user performance
   * 
   * @param userId User identifier
   * @param factId Mathematical fact identifier
   * @param performance Performance data for the update
   * @returns Result of the update operation
   * @throws {DistinctionManagerError} If user/fact not found or performance data is invalid
   */
  updateBoundaryLevel(userId: string, factId: string, performance: PerformanceData): BoundaryUpdateResult {
    this.validateUserAndFact(userId, factId);
    this.validatePerformanceData(performance);
    
    const masteryData = this.getUserFactMasteryInternal(userId, factId);
    if (!masteryData) {
      throw new DistinctionManagerError(
        DistinctionManagerErrorCode.NO_MASTERY_DATA,
        `No mastery data exists for user ${userId} and fact ${factId}`
      );
    }
    
    const previousLevel = masteryData.currentLevel;
    let newConsecutiveCorrect = 0;
    
    // Update mastery score based on performance
    if (performance.correctFirstAttempt) {
      // Correct answer increases mastery score
      newConsecutiveCorrect = (masteryData.consecutiveCorrect || 0) + 1;
      
      // Faster response times give a larger boost to mastery score
      const maxResponseTime = this.progressionThresholds.maxResponseTimeMs[masteryData.currentLevel];
      const timeBonus = Math.max(0, Math.min(0.1, (maxResponseTime - performance.responseTime) / maxResponseTime / 10));
      
      masteryData.masteryScore = Math.min(1.0, masteryData.masteryScore + 0.1 + timeBonus);
    } else {
      // Incorrect answer decreases mastery score
      newConsecutiveCorrect = 0;
      masteryData.masteryScore = Math.max(0.0, masteryData.masteryScore - 0.15);
    }
    
    masteryData.consecutiveCorrect = newConsecutiveCorrect;
    masteryData.lastResponseTime = performance.responseTime;
    masteryData.lastAttemptDate = new Date().toISOString();
    
    // Check for level progression/demotion
    let levelChanged = false;
    
    // Check for progression to next level
    if (
      masteryData.currentLevel < 5 && 
      masteryData.masteryScore >= this.progressionThresholds.masteryThreshold && 
      masteryData.consecutiveCorrect >= this.progressionThresholds.consecutiveCorrectThreshold
    ) {
      masteryData.currentLevel++;
      masteryData.masteryScore = 0.5; // Reset mastery score to middle value for new level
      levelChanged = true;
    }
    // Check for demotion to previous level
    else if (
      masteryData.currentLevel > 1 && 
      masteryData.masteryScore <= this.progressionThresholds.demotionThreshold
    ) {
      masteryData.currentLevel--;
      masteryData.masteryScore = 0.7; // Set mastery score higher in the lower level
      levelChanged = true;
    }
    
    // Update in storage
    this.updateUserFactMasteryInternal(masteryData);
    
    return {
      previousLevel,
      newLevel: masteryData.currentLevel,
      levelChanged,
      masteryScore: masteryData.masteryScore
    };
  }

  /**
   * Gets the description of a specific boundary level
   * 
   * @param level Boundary level (1-5)
   * @returns Boundary level description
   * @throws {DistinctionManagerError} If the level is invalid
   */
  getBoundaryLevelDescription(level: number): BoundaryLevel {
    if (level < 1 || level > 5 || !Number.isInteger(level)) {
      throw new DistinctionManagerError(
        DistinctionManagerErrorCode.INVALID_LEVEL,
        `Invalid boundary level: ${level}. Must be an integer between 1 and 5.`
      );
    }
    
    return { ...this.boundaryLevels[level - 1] };
  }

  /**
   * Gets descriptions of all boundary levels
   * 
   * @returns Array of all boundary level descriptions
   */
  getAllBoundaryLevels(): BoundaryLevel[] {
    // Return a deep copy to prevent external modification
    return this.boundaryLevels.map(level => ({ ...level }));
  }

  /**
   * Initializes mastery data for a user and fact
   * 
   * @param userId User identifier
   * @param factId Mathematical fact identifier
   * @param initialLevel Initial boundary level (1-5), defaults to 1
   * @returns Whether the initialization was successful
   * @throws {DistinctionManagerError} If user/fact not found, level is invalid, or already initialized
   */
  initializeUserFactMastery(userId: string, factId: string, initialLevel: number = 1): boolean {
    this.validateUserAndFact(userId, factId);
    
    if (initialLevel < 1 || initialLevel > 5 || !Number.isInteger(initialLevel)) {
      throw new DistinctionManagerError(
        DistinctionManagerErrorCode.INVALID_LEVEL,
        `Invalid initial level: ${initialLevel}. Must be an integer between 1 and 5.`
      );
    }
    
    const key = this.getMasteryKey(userId, factId);
    if (this.userMasteryData.has(key)) {
      throw new DistinctionManagerError(
        DistinctionManagerErrorCode.ALREADY_INITIALIZED,
        `Mastery data already exists for user ${userId} and fact ${factId}`
      );
    }
    
    const newMasteryData: UserFactMastery = {
      userId,
      factId,
      currentLevel: initialLevel,
      masteryScore: 0.5, // Start at 50% mastery
      consecutiveCorrect: 0,
      lastAttemptDate: new Date().toISOString()
    };
    
    this.userMasteryData.set(key, newMasteryData);
    return true;
  }

  /**
   * Validates that the user and fact both exist
   * 
   * @param userId User identifier to validate
   * @param factId Fact identifier to validate
   * @throws {DistinctionManagerError} If user or fact not found
   */
  private validateUserAndFact(userId: string, factId: string): void {
    // In a real implementation, these would validate against a user service and the fact repository
    // For simplicity, we're assuming the user exists if it's a non-empty string
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new DistinctionManagerError(
        DistinctionManagerErrorCode.USER_NOT_FOUND,
        `User ID must be a non-empty string: ${userId}`
      );
    }
    
    // Check if fact exists in the fact repository
    if (!this.factRepository.factExists(factId)) {
      throw new DistinctionManagerError(
        DistinctionManagerErrorCode.FACT_NOT_FOUND,
        `Mathematical fact not found: ${factId}`
      );
    }
  }

  /**
   * Validates performance data for correctness
   * 
   * @param performance Performance data to validate
   * @throws {DistinctionManagerError} If performance data is invalid
   */
  private validatePerformanceData(performance: PerformanceData): void {
    if (typeof performance.correctFirstAttempt !== 'boolean') {
      throw new DistinctionManagerError(
        DistinctionManagerErrorCode.INVALID_PERFORMANCE_DATA,
        'correctFirstAttempt must be a boolean'
      );
    }
    
    if (typeof performance.responseTime !== 'number' || performance.responseTime <= 0) {
      throw new DistinctionManagerError(
        DistinctionManagerErrorCode.INVALID_PERFORMANCE_DATA,
        'responseTime must be a positive number'
      );
    }
    
    if (performance.consecutiveCorrect !== undefined && 
        (typeof performance.consecutiveCorrect !== 'number' || 
         performance.consecutiveCorrect < 0 ||
         !Number.isInteger(performance.consecutiveCorrect))) {
      throw new DistinctionManagerError(
        DistinctionManagerErrorCode.INVALID_PERFORMANCE_DATA,
        'consecutiveCorrect must be a non-negative integer'
      );
    }
  }

  /**
   * Gets the internal key used for storing mastery data
   * 
   * @param userId User identifier
   * @param factId Fact identifier
   * @returns Combined key string
   */
  private getMasteryKey(userId: string, factId: string): string {
    return `${userId}:${factId}`;
  }

  /**
   * Retrieves user fact mastery data from internal storage
   * 
   * @param userId User identifier
   * @param factId Fact identifier
   * @returns User fact mastery data or undefined if not found
   */
  private getUserFactMasteryInternal(userId: string, factId: string): UserFactMastery | undefined {
    const key = this.getMasteryKey(userId, factId);
    return this.userMasteryData.get(key);
  }

  /**
   * Updates user fact mastery data in internal storage
   * 
   * @param masteryData Updated mastery data
   */
  private updateUserFactMasteryInternal(masteryData: UserFactMastery): void {
    const key = this.getMasteryKey(masteryData.userId, masteryData.factId);
    this.userMasteryData.set(key, { ...masteryData });
  }
}
