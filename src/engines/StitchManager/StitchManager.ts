// StitchManager.ts
/**
 * StitchManager Component
 * 
 * Manages stitches (learning units) within learning paths, implementing the
 * "positions as first class citizens" principle where positions in the learning
 * path tubes exist independently and stitches are assigned to them.
 */

// Error codes for StitchManager
enum StitchManagerErrorCode {
  STITCH_NOT_FOUND = 'STITCH_NOT_FOUND',
  LEARNING_PATH_NOT_FOUND = 'LEARNING_PATH_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  NO_PROGRESS_DATA = 'NO_PROGRESS_DATA',
  INVALID_SESSION_RESULTS = 'INVALID_SESSION_RESULTS',
  INVALID_PERFORMANCE_DATA = 'INVALID_PERFORMANCE_DATA',
  REPOSITIONING_FAILED = 'REPOSITIONING_FAILED',
  NO_STITCHES_AVAILABLE = 'NO_STITCHES_AVAILABLE',
  POSITION_OCCUPIED = 'POSITION_OCCUPIED',
  POSITION_OUT_OF_BOUNDS = 'POSITION_OUT_OF_BOUNDS'
}

// Custom error class for StitchManager
class StitchManagerError extends Error {
  code: StitchManagerErrorCode;
  
  constructor(code: StitchManagerErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = 'StitchManagerError';
  }
}

/**
 * Represents a stitch (learning unit) within a learning path
 */
interface Stitch {
  /** Unique identifier for the stitch */
  id: string;
  
  /** Name of the stitch */
  name: string;
  
  /** Description of the stitch (optional) */
  description?: string;
  
  /** ID of the learning path this stitch belongs to */
  learningPathId: string;
  
  /** Position in the learning path queue */
  position: number;
  
  /** Difficulty level of the stitch (1-5) */
  difficulty: number;
  
  /** IDs of mathematical facts covered in this stitch */
  factIds: string[];
  
  /** IDs of prerequisite stitches (optional) */
  prerequisites?: string[];
  
  /** Additional metadata for the stitch (optional) */
  metadata?: Record<string, any>;
}

/**
 * Represents a user's progress on a specific stitch
 */
interface StitchProgress {
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
  
  /** ISO date string of last attempt (optional) */
  lastAttemptDate?: string;
}

/**
 * Session results for updating stitch progress
 */
interface SessionResults {
  /** Number of correct answers in the session */
  correctCount: number;
  
  /** Total number of questions in the session */
  totalCount: number;
  
  /** Time taken to complete the session in milliseconds */
  completionTime: number;
}

/**
 * Performance data for repositioning a stitch
 */
interface PerformanceData {
  /** Number of correct answers */
  correctCount: number;
  
  /** Total number of questions */
  totalCount: number;
  
  /** Average response time in milliseconds */
  averageResponseTime: number;
}

/**
 * Result of a stitch repositioning operation
 */
interface RepositionResult {
  /** Previous position in the queue */
  previousPosition: number;
  
  /** New position in the queue */
  newPosition: number;
  
  /** Skip number used for repositioning */
  skipNumber: number;
}

/**
 * Learning path structure representation
 * Maps position -> stitch ID
 */
interface LearningPathStructure {
  [position: number]: string | null;
}

/**
 * StitchManager class
 * 
 * Manages stitches within learning paths, implementing the "positions as first class citizens" principle.
 */
class StitchManager {
  // Store stitches by ID for O(1) lookup
  private stitches: Map<string, Stitch> = new Map();
  
  // Store learning path structures (position -> stitch ID)
  private learningPathStructures: Map<string, LearningPathStructure> = new Map();
  
  // Store maximum position for each learning path
  private learningPathMaxPositions: Map<string, number> = new Map();
  
  // Store progress data by user ID and stitch ID
  private progressData: Map<string, Map<string, StitchProgress>> = new Map();
  
  // In-memory data for user's next stitch cache
  private userNextStitchCache: Map<string, Map<string, string>> = new Map();
  
  /**
   * Constructor
   */
  constructor() {
    // Initialize in-memory data structures
  }
  
  /**
   * Gets a stitch by its identifier
   * @param stitchId - Stitch identifier
   * @returns The stitch
   * @throws STITCH_NOT_FOUND if the specified stitch was not found
   */
  getStitchById(stitchId: string): Stitch {
    const stitch = this.stitches.get(stitchId);
    
    if (!stitch) {
      throw new StitchManagerError(
        StitchManagerErrorCode.STITCH_NOT_FOUND,
        `Stitch with ID '${stitchId}' not found`
      );
    }
    
    return { ...stitch };
  }
  
  /**
   * Gets all stitches for a specific learning path
   * @param learningPathId - Learning path identifier
   * @returns Array of stitches in the learning path
   * @throws LEARNING_PATH_NOT_FOUND if the specified learning path was not found
   */
  getStitchesByLearningPath(learningPathId: string): Stitch[] {
    const pathStructure = this.learningPathStructures.get(learningPathId);
    
    if (!pathStructure) {
      throw new StitchManagerError(
        StitchManagerErrorCode.LEARNING_PATH_NOT_FOUND,
        `Learning path with ID '${learningPathId}' not found`
      );
    }
    
    const stitches: Stitch[] = [];
    
    // Iterate through positions and retrieve stitches
    for (const [positionStr, stitchId] of Object.entries(pathStructure)) {
      if (stitchId !== null) {
        const stitch = this.stitches.get(stitchId);
        if (stitch) {
          stitches.push({ ...stitch });
        }
      }
    }
    
    // Sort by position
    stitches.sort((a, b) => a.position - b.position);
    
    return stitches;
  }
  
  /**
   * Gets progress data for a specific stitch and user
   * @param userId - User identifier
   * @param stitchId - Stitch identifier
   * @returns Stitch progress data
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws STITCH_NOT_FOUND if the specified stitch was not found
   * @throws NO_PROGRESS_DATA if no progress data exists for this user and stitch
   */
  getStitchProgress(userId: string, stitchId: string): StitchProgress {
    // Verify stitch exists
    if (!this.stitches.has(stitchId)) {
      throw new StitchManagerError(
        StitchManagerErrorCode.STITCH_NOT_FOUND,
        `Stitch with ID '${stitchId}' not found`
      );
    }
    
    // Verify user exists (in a real implementation, this would check a user database)
    this.verifyUserExists(userId);
    
    // Get user progress map
    const userProgress = this.progressData.get(userId);
    
    if (!userProgress || !userProgress.has(stitchId)) {
      throw new StitchManagerError(
        StitchManagerErrorCode.NO_PROGRESS_DATA,
        `No progress data found for user '${userId}' and stitch '${stitchId}'`
      );
    }
    
    return { ...userProgress.get(stitchId)! };
  }
  
  /**
   * Updates progress data for a specific stitch and user
   * @param userId - User identifier
   * @param stitchId - Stitch identifier
   * @param sessionResults - Results from the learning session
   * @returns Updated stitch progress data
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws STITCH_NOT_FOUND if the specified stitch was not found
   * @throws INVALID_SESSION_RESULTS if the session results are invalid
   */
  updateStitchProgress(
    userId: string,
    stitchId: string,
    sessionResults: SessionResults
  ): StitchProgress {
    // Verify stitch exists
    if (!this.stitches.has(stitchId)) {
      throw new StitchManagerError(
        StitchManagerErrorCode.STITCH_NOT_FOUND,
        `Stitch with ID '${stitchId}' not found`
      );
    }
    
    // Verify user exists
    this.verifyUserExists(userId);
    
    // Validate session results
    this.validateSessionResults(sessionResults);
    
    // Get or create user progress map
    let userProgress = this.progressData.get(userId);
    if (!userProgress) {
      userProgress = new Map<string, StitchProgress>();
      this.progressData.set(userId, userProgress);
    }
    
    // Get or create stitch progress
    let progress = userProgress.get(stitchId);
    if (!progress) {
      progress = {
        userId,
        stitchId,
        completionCount: 0,
        correctCount: 0,
        totalCount: 0,
        masteryLevel: 0
      };
    }
    
    // Update progress data
    progress.completionCount += 1;
    progress.correctCount += sessionResults.correctCount;
    progress.totalCount += sessionResults.totalCount;
    progress.masteryLevel = progress.correctCount / progress.totalCount;
    progress.lastAttemptDate = new Date().toISOString();
    
    // Save updated progress
    userProgress.set(stitchId, progress);
    
    // Clear any cached next stitch for this user and learning path
    const stitch = this.stitches.get(stitchId);
    if (stitch) {
      const userNextStitch = this.userNextStitchCache.get(userId);
      if (userNextStitch) {
        userNextStitch.delete(stitch.learningPathId);
      }
    }
    
    return { ...progress };
  }
  
  /**
   * Repositions a stitch within its learning path based on the Stitch Repositioning Algorithm
   * @param userId - User identifier
   * @param stitchId - Stitch identifier
   * @param performance - Performance data for repositioning
   * @returns Result of the repositioning operation
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws STITCH_NOT_FOUND if the specified stitch was not found
   * @throws INVALID_PERFORMANCE_DATA if the performance data is invalid
   * @throws REPOSITIONING_FAILED if failed to reposition the stitch
   */
  repositionStitch(
    userId: string,
    stitchId: string,
    performance: PerformanceData
  ): RepositionResult {
    // Verify stitch exists
    const stitch = this.stitches.get(stitchId);
    if (!stitch) {
      throw new StitchManagerError(
        StitchManagerErrorCode.STITCH_NOT_FOUND,
        `Stitch with ID '${stitchId}' not found`
      );
    }
    
    // Verify user exists
    this.verifyUserExists(userId);
    
    // Validate performance data
    this.validatePerformanceData(performance);
    
    // Get learning path structure
    const pathStructure = this.learningPathStructures.get(stitch.learningPathId);
    if (!pathStructure) {
      throw new StitchManagerError(
        StitchManagerErrorCode.LEARNING_PATH_NOT_FOUND,
        `Learning path with ID '${stitch.learningPathId}' not found`
      );
    }
    
    // Calculate skip number based on performance
    const skipNumber = this.calculateSkipNumber(performance);
    
    // Store previous position
    const previousPosition = stitch.position;
    
    // Calculate new position
    const newPosition = previousPosition + skipNumber;
    
    // Get the maximum position in the learning path
    const maxPosition = this.learningPathMaxPositions.get(stitch.learningPathId) || 0;
    
    // Update the maximum position if necessary
    if (newPosition > maxPosition) {
      this.learningPathMaxPositions.set(stitch.learningPathId, newPosition);
    }
    
    try {
      // Perform position shifting
      this.shiftPositions(stitch.learningPathId, previousPosition, newPosition);
      
      // Update stitch position
      stitch.position = newPosition;
      
      // Clear any cached next stitch for this user and learning path
      const userNextStitch = this.userNextStitchCache.get(userId);
      if (userNextStitch) {
        userNextStitch.delete(stitch.learningPathId);
      }
      
      return {
        previousPosition,
        newPosition,
        skipNumber
      };
    } catch (error) {
      throw new StitchManagerError(
        StitchManagerErrorCode.REPOSITIONING_FAILED,
        `Failed to reposition stitch: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
  
  /**
   * Gets the next stitch to present to the user in a learning path
   * @param userId - User identifier
   * @param learningPathId - Learning path identifier
   * @returns The next stitch to present
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws LEARNING_PATH_NOT_FOUND if the specified learning path was not found
   * @throws NO_STITCHES_AVAILABLE if no stitches available in the learning path
   */
  getNextStitch(userId: string, learningPathId: string): Stitch {
    // Verify user exists
    this.verifyUserExists(userId);
    
    // Check if learning path exists
    const pathStructure = this.learningPathStructures.get(learningPathId);
    if (!pathStructure) {
      throw new StitchManagerError(
        StitchManagerErrorCode.LEARNING_PATH_NOT_FOUND,
        `Learning path with ID '${learningPathId}' not found`
      );
    }
    
    // Check for cached next stitch
    const userNextStitch = this.userNextStitchCache.get(userId);
    if (userNextStitch && userNextStitch.has(learningPathId)) {
      const nextStitchId = userNextStitch.get(learningPathId);
      if (nextStitchId && this.stitches.has(nextStitchId)) {
        return { ...this.stitches.get(nextStitchId)! };
      }
    }
    
    // Find the next available stitch in the learning path (starting from position 1)
    const maxPosition = this.learningPathMaxPositions.get(learningPathId) || 0;
    let stitchId: string | null = null;
    
    for (let position = 1; position <= maxPosition; position++) {
      const candidateStitchId = pathStructure[position];
      if (candidateStitchId && this.stitches.has(candidateStitchId)) {
        stitchId = candidateStitchId;
        break;
      }
    }
    
    if (!stitchId) {
      throw new StitchManagerError(
        StitchManagerErrorCode.NO_STITCHES_AVAILABLE,
        `No stitches available in learning path '${learningPathId}'`
      );
    }
    
    const stitch = this.stitches.get(stitchId);
    
    if (!stitch) {
      throw new StitchManagerError(
        StitchManagerErrorCode.STITCH_NOT_FOUND,
        `Stitch with ID '${stitchId}' not found`
      );
    }
    
    // Cache the next stitch for this user and learning path
    if (!userNextStitch) {
      this.userNextStitchCache.set(userId, new Map<string, string>());
    }
    this.userNextStitchCache.get(userId)!.set(learningPathId, stitchId);
    
    return { ...stitch };
  }
  
  /**
   * Adds a stitch to the system
   * @param stitch - The stitch to add
   * @throws POSITION_OCCUPIED if the position in the learning path is already occupied
   * @throws LEARNING_PATH_NOT_FOUND if the learning path doesn't exist
   */
  addStitch(stitch: Stitch): void {
    // Create learning path structure if it doesn't exist
    if (!this.learningPathStructures.has(stitch.learningPathId)) {
      this.learningPathStructures.set(stitch.learningPathId, {});
      this.learningPathMaxPositions.set(stitch.learningPathId, 0);
    }
    
    const pathStructure = this.learningPathStructures.get(stitch.learningPathId)!;
    
    // Check if position is already occupied
    if (pathStructure[stitch.position] !== undefined && pathStructure[stitch.position] !== null) {
      throw new StitchManagerError(
        StitchManagerErrorCode.POSITION_OCCUPIED,
        `Position ${stitch.position} in learning path '${stitch.learningPathId}' is already occupied`
      );
    }
    
    // Add stitch to the system
    this.stitches.set(stitch.id, { ...stitch });
    
    // Update learning path structure
    pathStructure[stitch.position] = stitch.id;
    
    // Update maximum position if necessary
    const currentMax = this.learningPathMaxPositions.get(stitch.learningPathId) || 0;
    if (stitch.position > currentMax) {
      this.learningPathMaxPositions.set(stitch.learningPathId, stitch.position);
    }
    
    // Clear any cached next stitches for this learning path
    for (const [userId, userNextStitch] of this.userNextStitchCache.entries()) {
      userNextStitch.delete(stitch.learningPathId);
    }
  }
  
  /**
   * Removes a stitch from the system
   * @param stitchId - ID of the stitch to remove
   * @throws STITCH_NOT_FOUND if the stitch doesn't exist
   */
  removeStitch(stitchId: string): void {
    const stitch = this.stitches.get(stitchId);
    
    if (!stitch) {
      throw new StitchManagerError(
        StitchManagerErrorCode.STITCH_NOT_FOUND,
        `Stitch with ID '${stitchId}' not found`
      );
    }
    
    // Remove stitch from learning path structure
    const pathStructure = this.learningPathStructures.get(stitch.learningPathId);
    if (pathStructure) {
      pathStructure[stitch.position] = null;
    }
    
    // Remove stitch from the system
    this.stitches.delete(stitchId);
    
    // Clear progress data for this stitch
    for (const userProgress of this.progressData.values()) {
      userProgress.delete(stitchId);
    }
    
    // Clear any cached next stitches for this learning path
    for (const [userId, userNextStitch] of this.userNextStitchCache.entries()) {
      if (userNextStitch.get(stitch.learningPathId) === stitchId) {
        userNextStitch.delete(stitch.learningPathId);
      }
    }
  }
  
  /**
   * Gets the stitch at a specific position in a learning path
   * @param learningPathId - ID of the learning path
   * @param position - Position in the learning path
   * @returns The stitch at the specified position, or null if no stitch is at that position
   * @throws LEARNING_PATH_NOT_FOUND if the learning path doesn't exist
   * @throws POSITION_OUT_OF_BOUNDS if the position is out of bounds
   */
  getStitchAtPosition(learningPathId: string, position: number): Stitch | null {
    const pathStructure = this.learningPathStructures.get(learningPathId);
    
    if (!pathStructure) {
      throw new StitchManagerError(
        StitchManagerErrorCode.LEARNING_PATH_NOT_FOUND,
        `Learning path with ID '${learningPathId}' not found`
      );
    }
    
    const maxPosition = this.learningPathMaxPositions.get(learningPathId) || 0;
    
    if (position < 1 || position > maxPosition) {
      throw new StitchManagerError(
        StitchManagerErrorCode.POSITION_OUT_OF_BOUNDS,
        `Position ${position} is out of bounds for learning path '${learningPathId}'`
      );
    }
    
    const stitchId = pathStructure[position];
    
    if (!stitchId) {
      return null;
    }
    
    const stitch = this.stitches.get(stitchId);
    
    if (!stitch) {
      return null;
    }
    
    return { ...stitch };
  }
  
  /**
   * Initializes a learning path with the given ID
   * @param learningPathId - ID of the learning path to initialize
   */
  initializeLearningPath(learningPathId: string): void {
    if (!this.learningPathStructures.has(learningPathId)) {
      this.learningPathStructures.set(learningPathId, {});
      this.learningPathMaxPositions.set(learningPathId, 0);
    }
  }
  
  /**
   * Validates session results
   * @param sessionResults - Results from the learning session
   * @throws INVALID_SESSION_RESULTS if the session results are invalid
   */
  private validateSessionResults(sessionResults: SessionResults): void {
    if (sessionResults.correctCount < 0 ||
        sessionResults.totalCount <= 0 ||
        sessionResults.correctCount > sessionResults.totalCount ||
        sessionResults.completionTime <= 0) {
      throw new StitchManagerError(
        StitchManagerErrorCode.INVALID_SESSION_RESULTS,
        'Invalid session results: correctCount must be non-negative, totalCount must be positive, ' +
        'correctCount must not exceed totalCount, and completionTime must be positive'
      );
    }
  }
  
  /**
   * Validates performance data
   * @param performance - Performance data for repositioning
   * @throws INVALID_PERFORMANCE_DATA if the performance data is invalid
   */
  private validatePerformanceData(performance: PerformanceData): void {
    if (performance.correctCount < 0 ||
        performance.totalCount <= 0 ||
        performance.correctCount > performance.totalCount ||
        performance.averageResponseTime <= 0) {
      throw new StitchManagerError(
        StitchManagerErrorCode.INVALID_PERFORMANCE_DATA,
        'Invalid performance data: correctCount must be non-negative, totalCount must be positive, ' +
        'correctCount must not exceed totalCount, and averageResponseTime must be positive'
      );
    }
  }
  
  /**
   * Verifies that a user exists
   * @param userId - User ID to verify
   * @throws USER_NOT_FOUND if the user doesn't exist
   */
  private verifyUserExists(userId: string): void {
    // In a real implementation, this would check a user database
    // For this example, we'll assume the user exists
    
    // Simulate user verification
    if (userId === '') {
      throw new StitchManagerError(
        StitchManagerErrorCode.USER_NOT_FOUND,
        `User with ID '${userId}' not found`
      );
    }
  }
  
  /**
   * Calculates the skip number based on performance
   * @param performance - Performance data
   * @returns Skip number
   */
  private calculateSkipNumber(performance: PerformanceData): number {
    // Calculate accuracy percentage
    const accuracy = performance.correctCount / performance.totalCount;
    
    // Calculate response time factor (faster responses result in higher skip numbers)
    const responseTimeFactor = 1 - Math.min(1, performance.averageResponseTime / 5000);
    
    // Calculate skip number based on accuracy and response time
    // More accurate and faster responses result in higher skip numbers
    const baseSkip = Math.floor(accuracy * 10);
    const responseTimeBonus = Math.floor(responseTimeFactor * 5);
    
    return Math.max(1, baseSkip + responseTimeBonus);
  }
  
  /**
   * Shifts positions in a learning path to accommodate a stitch repositioning
   * @param learningPathId - ID of the learning path
   * @param previousPosition - Previous position of the stitch
   * @param newPosition - New position of the stitch
   */
  private shiftPositions(learningPathId: string, previousPosition: number, newPosition: number): void {
    const pathStructure = this.learningPathStructures.get(learningPathId)!;
    
    // Get stitch ID at previous position
    const stitchId = pathStructure[previousPosition];
    
    if (!stitchId) {
      throw new StitchManagerError(
        StitchManagerErrorCode.STITCH_NOT_FOUND,
        `No stitch found at position ${previousPosition} in learning path '${learningPathId}'`
      );
    }
    
    // Remove stitch from previous position
    pathStructure[previousPosition] = null;
    
    // Shift remaining stitches FORWARD to fill the gap
    // This ensures position 1 always has the next stitch
    let currentPos = previousPosition;
    const maxPos = this.learningPathMaxPositions.get(learningPathId) || 100;
    
    while (currentPos < maxPos) {
      const nextPos = currentPos + 1;
      if (pathStructure[nextPos]) {
        const nextStitchId = pathStructure[nextPos];
        const nextStitch = this.stitches.get(nextStitchId);
        
        // Move stitch forward by one position
        pathStructure[currentPos] = nextStitchId;
        pathStructure[nextPos] = null;
        
        if (nextStitch) {
          nextStitch.position = currentPos;
        }
        
        currentPos++;
      } else {
        break; // No more stitches to shift
      }
    }
    
    // Place the repositioned stitch at the new position
    pathStructure[newPosition] = stitchId;
    
    // Update repositioned stitch position
    const stitch = this.stitches.get(stitchId);
    if (stitch) {
      stitch.position = newPosition;
    }
  }
}

export {
  StitchManager,
  StitchManagerError,
  StitchManagerErrorCode
};

// Use export type for TypeScript interfaces when isolatedModules is enabled
export type {
  Stitch,
  StitchProgress,
  SessionResults,
  PerformanceData,
  RepositionResult
};
