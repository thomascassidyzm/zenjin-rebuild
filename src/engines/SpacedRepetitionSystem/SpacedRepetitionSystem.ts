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
   * Fixed skip number sequence for spaced repetition
   * This sequence creates optimal spacing intervals for memory retention
   */
  private static readonly SKIP_SEQUENCE = [4, 8, 15, 30, 100, 1000];

  /**
   * Calculates a skip number based on performance data using the fixed sequence
   * Simple rules: <20/20 = reset to 4, =20/20 = advance in sequence
   * @param performance Performance data for the stitch
   * @param repositioningHistory Optional history of previous repositionings
   * @returns The next skip number in the sequence
   * @throws INVALID_PERFORMANCE_DATA if the performance data is invalid
   */
  public calculateSkipNumber(
    performance: PerformanceData,
    repositioningHistory?: RepositionResult[]
  ): number {
    // Validate the performance data
    this.validatePerformanceData(performance);

    const { correctCount, totalCount } = performance;
    
    // Simple rule: Only perfect performance (20/20) advances in sequence
    if (correctCount !== totalCount) {
      // < 20/20: Reset to beginning of sequence
      return SpacedRepetitionSystem.SKIP_SEQUENCE[0]; // 4
    }
    
    // = 20/20: Advance to next position in sequence
    if (!repositioningHistory || repositioningHistory.length === 0) {
      // First time: start with the first skip number
      return SpacedRepetitionSystem.SKIP_SEQUENCE[0]; // 4
    }
    
    // Find the current position in the sequence based on last skip number
    const lastSkip = repositioningHistory[0].skipNumber;
    const currentIndex = SpacedRepetitionSystem.SKIP_SEQUENCE.indexOf(lastSkip);
    
    if (currentIndex === -1) {
      // Last skip wasn't in our sequence, start from beginning
      return SpacedRepetitionSystem.SKIP_SEQUENCE[0]; // 4
    }
    
    // Perfect performance: advance to next in sequence
    const nextIndex = Math.min(currentIndex + 1, SpacedRepetitionSystem.SKIP_SEQUENCE.length - 1);
    return SpacedRepetitionSystem.SKIP_SEQUENCE[nextIndex];
  }

  /**
   * Compresses the position space to handle gaps efficiently
   * @param userId User identifier
   * @param learningPathId Learning path identifier
   */
  private compressPositions(userId: string, learningPathId: string): void {
    const queue = this.userDataStore[userId][learningPathId].queue;
    
    // Sort by current position
    queue.sort((a, b) => a.position - b.position);
    
    // Reassign positions sequentially, maintaining relative order
    // but compressing gaps while preserving the skip sequence structure
    let newPosition = 1;
    
    for (const stitch of queue) {
      if (stitch.position > 0) {
        stitch.position = newPosition;
        newPosition++;
      }
    }
  }

  /**
   * Finds the next available position for inserting a new stitch
   * Prioritizes gaps created by the spaced repetition algorithm
   * @param userId User identifier
   * @param learningPathId Learning path identifier
   * @returns The next available position
   */
  public getNextAvailablePosition(userId: string, learningPathId: string): number {
    const queue = this.userDataStore[userId][learningPathId].queue;
    
    if (queue.length === 0) {
      return 1;
    }
    
    // Get all occupied positions, sorted
    const occupiedPositions = queue
      .map(s => s.position)
      .filter(pos => pos > 0)
      .sort((a, b) => a - b);
    
    // Find the first gap in the sequence
    for (let i = 1; i <= occupiedPositions[occupiedPositions.length - 1]; i++) {
      if (!occupiedPositions.includes(i)) {
        return i; // Found a gap, use it
      }
    }
    
    // No gaps found, append to the end
    return occupiedPositions[occupiedPositions.length - 1] + 1;
  }

  /**
   * Adds a new stitch to the learning path at the next available position
   * @param userId User identifier
   * @param learningPathId Learning path identifier
   * @param newStitch The stitch to add
   */
  public addNewStitch(
    userId: string,
    learningPathId: string,
    newStitch: { id: string; content: any }
  ): void {
    this.ensureUserData(userId, learningPathId);
    
    const nextPosition = this.getNextAvailablePosition(userId, learningPathId);
    
    const queueStitch: QueueStitch = {
      id: newStitch.id,
      position: nextPosition,
      content: newStitch.content
    };
    
    this.userDataStore[userId][learningPathId].queue.push(queueStitch);
    
    // Sort queue to maintain order
    this.userDataStore[userId][learningPathId].queue.sort((a, b) => a.position - b.position);
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
    
    // Calculate the skip number using the fixed sequence
    const skipNumber = this.calculateSkipNumber(performance, history);
    
    // Check if stitch should move based on performance
    const shouldMove = performance.correctCount === performance.totalCount; // 20/20
    
    let newPosition: number;
    
    if (!shouldMove) {
      // < 20/20: Stitch remains at current position (stays active), skip number resets to 4
      newPosition = previousPosition;
      
      // No repositioning needed, just update history with reset skip number
    } else {
      // = 20/20: Implement the Stitch Repositioning Algorithm
      
      // 1. Temporarily assign the completed stitch position -1 (removing from active queue)
      stitch.position = -1;
      
      // 2. Shift all stitches in positions 1 through [skip number] DOWN one position
      // This means position 2→1, 3→2, 4→3, 5→4, etc., leaving position [skip number] vacant
      for (let i = 0; i < queue.length; i++) {
        if (queue[i].position >= 1 && queue[i].position <= skipNumber && queue[i].id !== stitchId) {
          queue[i].position -= 1;
        }
      }
      
      // 3. This creates a vacant slot at the position equal to the stitch's skip number
      // 4. Place the completed stitch in this vacant slot
      stitch.position = skipNumber;
      newPosition = skipNumber;
      
      // Remove any stitches that got shifted to position 0 (they're temporarily out of active rotation)
      const activeQueue = queue.filter(s => s.position > 0);
      
      // Sort by position to maintain order
      activeQueue.sort((a, b) => a.position - b.position);
      
      // Update the queue with the active stitches
      this.userDataStore[userId][learningPathId].queue = activeQueue;
    }
    
    // Create the repositioning result
    const timestamp = performance.completionDate || new Date().toISOString();
    const result: RepositionResult = {
      stitchId,
      previousPosition,
      newPosition,
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
