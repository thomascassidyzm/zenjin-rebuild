/**
 * Type definitions for the TripleHelixManager component
 */

/**
 * Learning path data structure
 * Represents a single learning path in the Triple Helix model
 */
export interface LearningPath {
  /** Unique identifier for the learning path */
  id: string;
  
  /** Name of the learning path */
  name: string;
  
  /** Description of the learning path */
  description?: string;
  
  /** ID of the currently active stitch in this path */
  currentStitchId?: string;
  
  /** ID of the next stitch to be presented in this path */
  nextStitchId?: string;
  
  /** Current difficulty level of the path (1-5) */
  difficulty: number;
  
  /** Status of the path ('active', 'preparing', 'inactive') */
  status: string;
  
  /** Additional metadata for the learning path */
  metadata?: Record<string, any>;
}

/**
 * Triple helix state data structure
 * Represents the complete state of the Triple Helix for a user
 */
export interface TripleHelixState {
  /** User identifier */
  userId: string;
  
  /** Currently active learning path */
  activePath: LearningPath;
  
  /** Learning paths being prepared */
  preparingPaths: LearningPath[];
  
  /** ISO date string of last rotation */
  lastRotationTime?: string;
  
  /** Number of rotations performed */
  rotationCount: number;
}

/**
 * Interface for the TripleHelixManager component
 * Defines the public API for managing the Triple Helix learning model
 */
export interface TripleHelixManagerInterface {
  /**
   * Gets the currently active learning path for a user
   * @param userId User identifier
   * @returns The active learning path
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws NO_ACTIVE_PATH if no active learning path exists for this user
   */
  getActiveLearningPath(userId: string): LearningPath;
  
  /**
   * Gets the learning paths being prepared for a user
   * @param userId User identifier
   * @returns Array of learning paths being prepared
   * @throws USER_NOT_FOUND if the specified user was not found
   */
  getPreparingPaths(userId: string): LearningPath[];
  
  /**
   * Rotates the learning paths, making a prepared path active
   * @param userId User identifier
   * @returns Result of the rotation operation
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws NO_TRIPLE_HELIX if no triple helix exists for this user
   * @throws ROTATION_FAILED if failed to rotate learning paths
   */
  rotateLearningPaths(userId: string): {
    previousActivePath: LearningPath;
    newActivePath: LearningPath;
    rotationCount: number;
  };
  
  /**
   * Sets up the initial learning paths for a new user
   * @param userId User identifier
   * @param initialDifficulty Initial difficulty level (1-5)
   * @returns Initial triple helix state
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws ALREADY_INITIALIZED if triple helix already initialized for this user
   * @throws INITIALIZATION_FAILED if failed to initialize triple helix
   */
  initializeTripleHelix(
    userId: string,
    initialDifficulty?: number
  ): TripleHelixState;
  
  /**
   * Gets the current triple helix state for a user
   * @param userId User identifier
   * @returns Current triple helix state
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws NO_TRIPLE_HELIX if no triple helix exists for this user
   */
  getTripleHelixState(userId: string): TripleHelixState;
  
  /**
   * Updates the difficulty of a specific learning path
   * @param userId User identifier
   * @param pathId Learning path identifier
   * @param newDifficulty New difficulty level (1-5)
   * @returns Updated learning path
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws PATH_NOT_FOUND if the specified learning path was not found
   * @throws INVALID_DIFFICULTY if the specified difficulty is invalid
   */
  updateLearningPathDifficulty(
    userId: string,
    pathId: string,
    newDifficulty: number
  ): LearningPath;
}

// Types are already exported with 'export interface' above