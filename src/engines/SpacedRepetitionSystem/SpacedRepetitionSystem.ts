/**
 * SpacedRepetitionSystem.ts
 * 
 * This file implements the SpacedRepetitionSystem component for the Zenjin Maths App.
 * The component is responsible for implementing the Stitch Repositioning Algorithm
 * for spaced repetition, which optimizes learning and memory retention by
 * moving mastered content progressively further back in the learning queue.
 */

/**
 * Performance data for a stitch completion
 */
export type PerformanceData = {
  /** Number of correct answers */
  correctCount: number;
  
  /** Total number of questions */
  totalCount: number;
  
  /** Average response time in milliseconds */
  averageResponseTime: number;
  
  /** ISO date string of completion */
  completionDate?: string;
};

/**
 * Result of a stitch repositioning operation
 */
export type RepositionResult = {
  /** Stitch identifier */
  stitchId: string;
  
  /** Previous position in the queue */
  previousPosition: number;
  
  /** New position in the queue */
  newPosition: number;
  
  /** Skip number used for repositioning */
  skipNumber: number;
  
  /** ISO date string of repositioning */
  timestamp: string;
};

/**
 * Custom error types for the SpacedRepetitionSystem
 */
export enum SpacedRepetitionError {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  STITCH_NOT_FOUND = 'STITCH_NOT_FOUND',
  LEARNING_PATH_NOT_FOUND = 'LEARNING_PATH_NOT_FOUND',
  INVALID_PERFORMANCE_DATA = 'INVALID_PERFORMANCE_DATA',
  REPOSITIONING_FAILED = 'REPOSITIONING_FAILED',
  NO_STITCHES_AVAILABLE = 'NO_STITCHES_AVAILABLE'
}

/**
 * Interface for the SpacedRepetitionSystem component
 */
export interface SpacedRepetitionInterface {
  /**
   * Repositions a stitch based on performance using the Stitch Repositioning Algorithm
   * @param userId User identifier
   * @param stitchId Stitch identifier
   * @param performance Performance data for repositioning
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
  ): RepositionResult;
  
  /**
   * Gets the next stitch to present to the user in a learning path
   * @param userId User identifier
   * @param learningPathId Learning path identifier
   * @returns The next stitch to present
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws LEARNING_PATH_NOT_FOUND if the specified learning path was not found
   * @throws NO_STITCHES_AVAILABLE if no stitches available in the learning path
   */
  getNextStitch(
    userId: string,
    learningPathId: string
  ): {
    id: string;
    position: number;
    content: any;
  };
  
  /**
   * Calculates the skip number based on performance
   * @param performance Performance data
   * @returns Calculated skip number
   * @throws INVALID_PERFORMANCE_DATA if the performance data is invalid
   */
  calculateSkipNumber(performance: PerformanceData): number;
  
  /**
   * Gets the current stitch queue for a user and learning path
   * @param userId User identifier
   * @param learningPathId Learning path identifier
   * @returns Array of stitches in queue order
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws LEARNING_PATH_NOT_FOUND if the specified learning path was not found
   */
  getStitchQueue(
    userId: string,
    learningPathId: string
  ): Array<{
    id: string;
    position: number;
  }>;
  
  /**
   * Gets the repositioning history for a specific stitch and user
   * @param userId User identifier
   * @param stitchId Stitch identifier
   * @param limit Maximum number of history entries to return
   * @returns Array of repositioning history entries
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws STITCH_NOT_FOUND if the specified stitch was not found
   */
  getRepositioningHistory(
    userId: string,
    stitchId: string,
    limit?: number
  ): RepositionResult[];
}

/**
 * Type definition for a stitch in the queue
 */
interface QueueStitch {
  id: string;
  position: number;
  content: any;
}

/**
 * Type definition for user data storage
 */
interface UserData {
  [learningPathId: string]: {
    queue: QueueStitch[];
    repositioningHistory: { [stitchId: string]: RepositionResult[] };
  };
}

/**
 * Implementation of the SpacedRepetitionSystem component
 */
export class SpacedRepetitionSystem implements SpacedRepetitionInterface {
  // In-memory data store for user queues and history
  // In a production environment, this would be replaced with a database
  private userDataStore: { [userId: string]: UserData } = {};

  /**
   * Validates the performance data to ensure it's within valid ranges
   * @param performance Performance data to validate
   * @throws INVALID_PERFORMANCE_DATA if the data is invalid
   */
  private validatePerformanceData(performance: PerformanceData): void {
    if (!performance) {
      throw new Error(SpacedRepetitionError.INVALID_PERFORMANCE_DATA);
    }

    const { correctCount, totalCount, averageResponseTime } = performance;

    // Check if counts are valid numbers and within range
    if (
      typeof correctCount !== 'number' ||
      typeof totalCount !== 'number' ||
      correctCount < 0 ||
      totalCount <= 0 ||
      correctCount > totalCount
    ) {
      throw new Error(SpacedRepetitionError.INVALID_PERFORMANCE_DATA);
    }

    // Check if average response time is valid
    if (
      typeof averageResponseTime !== 'number' ||
      averageResponseTime <= 0
    ) {
      throw new Error(SpacedRepetitionError.INVALID_PERFORMANCE_DATA);
    }
  }

  /**
   * Ensures that user and learning path data exists
   * Creates empty data structures if they don't exist
   * @param userId User identifier
   * @param learningPathId Learning path identifier (optional)
   */
  private ensureUserData(userId: string, learningPathId?: string): void {
    // Create user data if it doesn't exist
    if (!this.userDataStore[userId]) {
      this.userDataStore[userId] = {};
    }

    // If learning path is specified, create data for it if it doesn't exist
    if (learningPathId && !this.userDataStore[userId][learningPathId]) {
      this.userDataStore[userId][learningPathId] = {
        queue: [],
        repositioningHistory: {}
      };
    }
  }

  /**
   * Gets the stitch index in the queue by stitch ID
   * @param userId User identifier
   * @param learningPathId Learning path identifier
   * @param stitchId Stitch identifier
   * @returns Index of the stitch in the queue or -1 if not found
   */
  private getStitchIndex(
    userId: string,
    learningPathId: string,
    stitchId: string
  ): number {
    const userData = this.userDataStore[userId];
    if (!userData || !userData[learningPathId]) {
      return -1;
    }

    return userData[learningPathId].queue.findIndex(stitch => stitch.id === stitchId);
  }

  /**
   * Adds a repositioning entry to the history
   * @param userId User identifier
   * @param learningPathId Learning path identifier
   * @param result Repositioning result to add to history
   */
  private addToHistory(
    userId: string,
    learningPathId: string,
    result: RepositionResult
  ): void {
    const userData = this.userDataStore[userId][learningPathId];
    
    // Initialize history array for this stitch if it doesn't exist
    if (!userData.repositioningHistory[result.stitchId]) {
      userData.repositioningHistory[result.stitchId] = [];
    }

    // Add the result to the history, at the beginning for efficient retrieval
    userData.repositioningHistory[result.stitchId].unshift(result);
  }

  /**
   * Calculates a skip number based on performance data
   * Implements an adaptive algorithm that considers:
   * - Correctness ratio (correct / total)
   * - Response time efficiency
   * - Historical performance (via skip history tracking)
   * 
   * @param performance Performance data for the stitch
   * @param repositioningHistory Optional history of previous repositionings
   * @param queueLength Optional length of the current queue for boundary checks
   * @returns The calculated skip number
   * @throws INVALID_PERFORMANCE_DATA if the performance data is invalid
   */
  public calculateSkipNumber(
    performance: PerformanceData,
    repositioningHistory?: RepositionResult[],
    queueLength?: number
  ): number {
    // Validate the performance data
    this.validatePerformanceData(performance);

    const { correctCount, totalCount, averageResponseTime } = performance;
    
    // Calculate the correctness ratio (0.0 to 1.0)
    const correctnessRatio = correctCount / totalCount;
    
    // Calculate response time factor: faster times give higher values
    // Assuming 3000ms (3s) is average, normalize around that
    // Values will typically range from ~0.5 to ~1.5
    const responseTimeFactor = Math.max(0.5, Math.min(1.5, 3000 / averageResponseTime));
    
    // Base skip calculation combines correctness and response time
    // Perfect score (20/20) gets a significant boost
    let baseSkip: number;
    
    if (correctnessRatio === 1) {
      // Perfect score (e.g., 20/20)
      baseSkip = 5 * responseTimeFactor;
    } else if (correctnessRatio >= 0.9) {
      // Very good (e.g., 18/20 or 19/20)
      baseSkip = 3 * responseTimeFactor;
    } else if (correctnessRatio >= 0.8) {
      // Good (e.g., 16/20)
      baseSkip = 2 * responseTimeFactor;
    } else if (correctnessRatio >= 0.7) {
      // Fair (e.g., 14/20)
      baseSkip = 1.5 * responseTimeFactor;
    } else if (correctnessRatio >= 0.6) {
      // Needs practice (e.g., 12/20)
      baseSkip = 1 * responseTimeFactor;
    } else {
      // Significant struggle (below 12/20)
      // Keep it closer to the front of the queue
      baseSkip = 0.5 * responseTimeFactor;
    }
    
    // Apply historical performance adjustment if we have history
    let historicalFactor = 1.0;
    
    if (repositioningHistory && repositioningHistory.length > 0) {
      // Look at the most recent skip number
      const lastSkip = repositioningHistory[0].skipNumber;
      
      if (correctnessRatio === 1) {
        // Perfect performance: gradually increase the skip number
        historicalFactor = 1.2; // 20% increase
      } else if (correctnessRatio >= 0.9) {
        // Very good: slight increase
        historicalFactor = 1.1; // 10% increase
      } else if (correctnessRatio >= 0.8) {
        // Good: maintain roughly the same skip number
        historicalFactor = 1.0;
      } else if (correctnessRatio >= 0.7) {
        // Fair: slight decrease
        historicalFactor = 0.9; // 10% decrease
      } else {
        // Needs more practice: significant decrease
        historicalFactor = 0.7; // 30% decrease
      }
      
      // Adjust the base skip using the historical factor
      baseSkip = Math.max(1, lastSkip * historicalFactor);
    }
    
    // Round to the nearest integer
    let finalSkip = Math.round(baseSkip);
    
    // Ensure skip number is at least 1
    finalSkip = Math.max(1, finalSkip);
    
    // Ensure skip number doesn't exceed the queue length
    if (queueLength) {
      finalSkip = Math.min(finalSkip, queueLength);
    }
    
    return finalSkip;
  }

  /**
   * Repositions a stitch in the queue based on performance data
   * Implements the Stitch Repositioning Algorithm
   * 
   * @param userId User identifier
   * @param stitchId Stitch identifier
   * @param performance Performance data for repositioning
   * @returns Result of the repositioning operation
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws STITCH_NOT_FOUND if the specified stitch was not found
   * @throws INVALID_PERFORMANCE_DATA if the performance data is invalid
   * @throws REPOSITIONING_FAILED if failed to reposition the stitch
   */
  public repositionStitch(
    userId: string,
    stitchId: string,
    performance: PerformanceData
  ): RepositionResult {
    // Validate the performance data
    this.validatePerformanceData(performance);

    // Check if user exists
    if (!this.userDataStore[userId]) {
      throw new Error(SpacedRepetitionError.USER_NOT_FOUND);
    }

    // Find the learning path containing the stitch
    let learningPathId: string | null = null;
    let stitchIndex: number = -1;

    // Search through all learning paths for the user to find the stitch
    for (const pathId in this.userDataStore[userId]) {
      const index = this.getStitchIndex(userId, pathId, stitchId);
      if (index !== -1) {
        learningPathId = pathId;
        stitchIndex = index;
        break;
      }
    }

    // If stitch not found, throw error
    if (learningPathId === null || stitchIndex === -1) {
      throw new Error(SpacedRepetitionError.STITCH_NOT_FOUND);
    }

    // Get the queue for the learning path
    const queue = this.userDataStore[userId][learningPathId].queue;
    
    // Get the stitch from the queue
    const stitch = queue[stitchIndex];
    
    // Store the previous position
    const previousPosition = stitch.position;

    // Get repositioning history for this stitch
    const history = this.getRepositioningHistory(userId, stitchId);
    
    // Calculate the skip number based on performance and history
    const skipNumber = this.calculateSkipNumber(performance, history, queue.length);

    // Implement the Stitch Repositioning Algorithm:
    
    // 1. Temporarily remove the stitch from the queue
    queue.splice(stitchIndex, 1);
    
    // 2. Shift all stitches in positions 1 through [skip number] down one position
    for (let i = 0; i < queue.length; i++) {
      if (queue[i].position >= 1 && queue[i].position <= skipNumber) {
        queue[i].position += 1;
      }
    }
    
    // 3. Place the completed stitch in the position equal to its skip number
    stitch.position = skipNumber;
    
    // 4. Reinsert the stitch into the queue
    // Find the correct insertion point to maintain sorted order
    let insertIndex = 0;
    while (insertIndex < queue.length && queue[insertIndex].position < skipNumber) {
      insertIndex++;
    }
    queue.splice(insertIndex, 0, stitch);
    
    // Create the repositioning result
    const timestamp = performance.completionDate || new Date().toISOString();
    const result: RepositionResult = {
      stitchId,
      previousPosition,
      newPosition: skipNumber,
      skipNumber,
      timestamp
    };
    
    // Add the result to the repositioning history
    this.addToHistory(userId, learningPathId, result);
    
    return result;
  }

  /**
   * Gets the next stitch to present to the user in a learning path
   * 
   * @param userId User identifier
   * @param learningPathId Learning path identifier
   * @returns The next stitch to present
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws LEARNING_PATH_NOT_FOUND if the specified learning path was not found
   * @throws NO_STITCHES_AVAILABLE if no stitches available in the learning path
   */
  public getNextStitch(
    userId: string,
    learningPathId: string
  ): {
    id: string;
    position: number;
    content: any;
  } {
    // Check if user exists
    if (!this.userDataStore[userId]) {
      throw new Error(SpacedRepetitionError.USER_NOT_FOUND);
    }

    // Check if learning path exists for this user
    if (!this.userDataStore[userId][learningPathId]) {
      throw new Error(SpacedRepetitionError.LEARNING_PATH_NOT_FOUND);
    }

    // Get the queue for the learning path
    const queue = this.userDataStore[userId][learningPathId].queue;
    
    // Check if queue is empty
    if (queue.length === 0) {
      throw new Error(SpacedRepetitionError.NO_STITCHES_AVAILABLE);
    }

    // The next stitch is the one at position 1
    // If there are multiple stitches at position 1 (edge case), select the first one
    const nextStitches = queue.filter(stitch => stitch.position === 1);
    
    if (nextStitches.length === 0) {
      // No stitch with position 1 found - this shouldn't happen with proper queue maintenance
      // Sort the queue by position and return the stitch with the lowest position
      queue.sort((a, b) => a.position - b.position);
      return { ...queue[0] };
    }
    
    // Return a copy of the stitch to prevent modification
    return { ...nextStitches[0] };
  }

  /**
   * Gets the current stitch queue for a user and learning path
   * 
   * @param userId User identifier
   * @param learningPathId Learning path identifier
   * @returns Array of stitches in queue order
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws LEARNING_PATH_NOT_FOUND if the specified learning path was not found
   */
  public getStitchQueue(
    userId: string,
    learningPathId: string
  ): Array<{
    id: string;
    position: number;
  }> {
    // Check if user exists
    if (!this.userDataStore[userId]) {
      throw new Error(SpacedRepetitionError.USER_NOT_FOUND);
    }

    // Check if learning path exists for this user
    if (!this.userDataStore[userId][learningPathId]) {
      throw new Error(SpacedRepetitionError.LEARNING_PATH_NOT_FOUND);
    }

    // Get the queue and return a simplified version with just id and position
    // Sort by position to ensure correct order
    return this.userDataStore[userId][learningPathId].queue
      .slice() // Create a copy of the array
      .sort((a, b) => a.position - b.position)
      .map(stitch => ({
        id: stitch.id,
        position: stitch.position
      }));
  }

  /**
   * Gets the repositioning history for a specific stitch and user
   * 
   * @param userId User identifier
   * @param stitchId Stitch identifier
   * @param limit Maximum number of history entries to return
   * @returns Array of repositioning history entries
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws STITCH_NOT_FOUND if the specified stitch was not found
   */
  public getRepositioningHistory(
    userId: string,
    stitchId: string,
    limit?: number
  ): RepositionResult[] {
    // Check if user exists
    if (!this.userDataStore[userId]) {
      throw new Error(SpacedRepetitionError.USER_NOT_FOUND);
    }

    // Find the learning path containing the stitch
    let learningPathId: string | null = null;
    
    // Search through all learning paths for the user
    for (const pathId in this.userDataStore[userId]) {
      const userData = this.userDataStore[userId][pathId];
      
      // Check if the stitch has history in this learning path
      if (userData.repositioningHistory[stitchId]) {
        learningPathId = pathId;
        break;
      }
      
      // If not in history, check if it's in the queue
      const index = this.getStitchIndex(userId, pathId, stitchId);
      if (index !== -1) {
        learningPathId = pathId;
        break;
      }
    }

    // If stitch not found, throw error
    if (learningPathId === null) {
      throw new Error(SpacedRepetitionError.STITCH_NOT_FOUND);
    }

    // Get the history for this stitch
    const history = this.userDataStore[userId][learningPathId].repositioningHistory[stitchId] || [];
    
    // Apply limit if specified
    return limit ? history.slice(0, limit) : history;
  }

  /**
   * Adds a new stitch to a user's learning path queue
   * This is a helper method not part of the main interface
   * 
   * @param userId User identifier
   * @param learningPathId Learning path identifier
   * @param stitch Stitch to add to the queue
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws LEARNING_PATH_NOT_FOUND if the specified learning path was not found
   */
  public addStitchToQueue(
    userId: string,
    learningPathId: string,
    stitch: { id: string; content: any; position?: number }
  ): void {
    // Ensure user and learning path exist
    this.ensureUserData(userId, learningPathId);

    // Get the queue
    const queue = this.userDataStore[userId][learningPathId].queue;
    
    // If position is not specified, add to the end of the queue
    if (stitch.position === undefined) {
      // Find the highest position in the queue
      let maxPosition = 0;
      for (const existingStitch of queue) {
        maxPosition = Math.max(maxPosition, existingStitch.position);
      }
      
      // Add the new stitch at the next position
      queue.push({
        id: stitch.id,
        content: stitch.content,
        position: maxPosition + 1
      });
    } else {
      // Position is specified, shift existing stitches if needed
      const position = stitch.position;
      
      // Shift all stitches at or after the specified position
      for (const existingStitch of queue) {
        if (existingStitch.position >= position) {
          existingStitch.position += 1;
        }
      }
      
      // Add the new stitch at the specified position
      queue.push({
        id: stitch.id,
        content: stitch.content,
        position
      });
      
      // Sort the queue by position for efficient access
      queue.sort((a, b) => a.position - b.position);
    }
  }

  /**
   * Initializes a learning path for a user with the given stitches
   * This is a helper method not part of the main interface
   * 
   * @param userId User identifier
   * @param learningPathId Learning path identifier
   * @param stitches Array of stitches to add to the queue
   */
  public initializeLearningPath(
    userId: string,
    learningPathId: string,
    stitches: Array<{ id: string; content: any }>
  ): void {
    // Ensure user and learning path exist
    this.ensureUserData(userId, learningPathId);

    // Clear any existing queue
    this.userDataStore[userId][learningPathId].queue = [];
    
    // Add each stitch to the queue with sequential positions
    stitches.forEach((stitch, index) => {
      this.userDataStore[userId][learningPathId].queue.push({
        id: stitch.id,
        content: stitch.content,
        position: index + 1
      });
    });
  }
}
