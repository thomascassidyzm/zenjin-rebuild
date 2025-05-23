/**
 * TripleHelixManagerInterface.ts
 * Generated from APML Interface Definition
 * Module: ProgressionSystem
 */

/**
 * 
    Defines the contract for the TripleHelixManager component that manages three parallel learning paths and their rotation according to the Live Aid Stage Model.
  
 */
/**
 * LearningPath
 */
export interface LearningPath {
  id: string; // Unique identifier for the learning path
  name: string; // Name of the learning path
  description?: string; // Description of the learning path
  currentStitchId?: string; // ID of the currently active stitch in this path
  nextStitchId?: string; // ID of the next stitch to be presented in this path
  difficulty: number; // Current difficulty level of the path (1-5)
  status: string; // Status of the path ('active', 'preparing', 'inactive')
  metadata?: Record<string, any>; // Additional metadata for the learning path
}

/**
 * TripleHelixState
 */
export interface TripleHelixState {
  userId: string; // User identifier
  activePath: LearningPath; // Currently active learning path
  preparingPaths: LearningPath[]; // Learning paths being prepared
  lastRotationTime?: string; // ISO date string of last rotation
  rotationCount: number; // Number of rotations performed
}

/**
 * Error codes for TripleHelixManagerInterface
 */
export enum TripleHelixManagerErrorCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  NO_ACTIVE_PATH = 'NO_ACTIVE_PATH',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  NO_TRIPLE_HELIX = 'NO_TRIPLE_HELIX',
  ROTATION_FAILED = 'ROTATION_FAILED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  ALREADY_INITIALIZED = 'ALREADY_INITIALIZED',
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  NO_TRIPLE_HELIX = 'NO_TRIPLE_HELIX',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  PATH_NOT_FOUND = 'PATH_NOT_FOUND',
  INVALID_DIFFICULTY = 'INVALID_DIFFICULTY',
}

/**
 * TripleHelixManagerInterface
 */
export interface TripleHelixManagerInterface {
  /**
   * Gets the currently active learning path for a user
   * @param userId - User identifier
   * @returns The active learning path
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws NO_ACTIVE_PATH if No active learning path exists for this user
   */
  getActiveLearningPath(userId: string): LearningPath;

  /**
   * Gets the learning paths being prepared for a user
   * @param userId - User identifier
   * @returns Array of learning paths being prepared
   * @throws USER_NOT_FOUND if The specified user was not found
   */
  getPreparingPaths(userId: string): LearningPath[];

  /**
   * Rotates the learning paths, making a prepared path active
   * @param userId - User identifier
   * @returns Result of the rotation operation
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws NO_TRIPLE_HELIX if No triple helix exists for this user
   * @throws ROTATION_FAILED if Failed to rotate learning paths
   */
  rotateLearningPaths(userId: string): { previousActivePath: LearningPath; newActivePath: LearningPath; rotationCount: number };

  /**
   * Sets up the initial learning paths for a new user
   * @param userId - User identifier
   * @param initialDifficulty - Initial difficulty level (1-5)
   * @returns Initial triple helix state
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws ALREADY_INITIALIZED if Triple helix already initialized for this user
   * @throws INITIALIZATION_FAILED if Failed to initialize triple helix
   */
  initializeTripleHelix(userId: string, initialDifficulty?: number): TripleHelixState;

  /**
   * Gets the current triple helix state for a user
   * @param userId - User identifier
   * @returns Current triple helix state
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws NO_TRIPLE_HELIX if No triple helix exists for this user
   */
  getTripleHelixState(userId: string): TripleHelixState;

  /**
   * Updates the difficulty of a specific learning path
   * @param userId - User identifier
   * @param pathId - Learning path identifier
   * @param newDifficulty - New difficulty level (1-5)
   * @returns Updated learning path
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws PATH_NOT_FOUND if The specified learning path was not found
   * @throws INVALID_DIFFICULTY if The specified difficulty is invalid
   */
  updateLearningPathDifficulty(userId: string, pathId: string, newDifficulty: number): LearningPath;

}

// Export default interface
export default TripleHelixManagerInterface;
