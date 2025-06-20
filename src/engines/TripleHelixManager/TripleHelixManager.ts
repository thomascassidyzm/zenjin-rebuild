/**
 * TripleHelixManager Implementation
 * 
 * This class implements the Triple Helix learning model that manages three parallel
 * learning paths and their rotation according to the Live Aid Stage Model, optimizing
 * cognitive resource usage through varied learning experiences in the Zenjin Maths App.
 */

// Import the required interfaces and types
import type { LearningPath, TripleHelixState, TripleHelixManagerInterface } from './TripleHelixTypes';

/**
 * Custom error types for the TripleHelixManager
 */
export class TripleHelixError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TripleHelixError';
  }
}

export class UserNotFoundError extends TripleHelixError {
  constructor(userId: string) {
    super(`User not found: ${userId}`);
    this.name = 'USER_NOT_FOUND';
  }
}

export class NoActivePathError extends TripleHelixError {
  constructor(userId: string) {
    super(`No active learning path exists for user: ${userId}`);
    this.name = 'NO_ACTIVE_PATH';
  }
}

export class NoTripleHelixError extends TripleHelixError {
  constructor(userId: string) {
    super(`No triple helix exists for user: ${userId}`);
    this.name = 'NO_TRIPLE_HELIX';
  }
}

export class RotationFailedError extends TripleHelixError {
  constructor(userId: string, reason: string) {
    super(`Failed to rotate learning paths for user ${userId}: ${reason}`);
    this.name = 'ROTATION_FAILED';
  }
}

export class AlreadyInitializedError extends TripleHelixError {
  constructor(userId: string) {
    super(`Triple helix already initialized for user: ${userId}`);
    this.name = 'ALREADY_INITIALIZED';
  }
}

export class InitializationFailedError extends TripleHelixError {
  constructor(userId: string, reason: string) {
    super(`Failed to initialize triple helix for user ${userId}: ${reason}`);
    this.name = 'INITIALIZATION_FAILED';
  }
}

export class PathNotFoundError extends TripleHelixError {
  constructor(userId: string, pathId: string) {
    super(`Learning path not found: ${pathId} for user: ${userId}`);
    this.name = 'PATH_NOT_FOUND';
  }
}

export class InvalidDifficultyError extends TripleHelixError {
  constructor(difficulty: number) {
    super(`Invalid difficulty level: ${difficulty}. Must be between 1 and 5.`);
    this.name = 'INVALID_DIFFICULTY';
  }
}

/**
 * Implementation of the TripleHelixManager component
 * 
 * This component manages three parallel learning paths according to the Triple Helix
 * learning model, implementing the Live Aid Stage Model where one path is active and
 * two are being prepared. It supports path rotation, independent difficulty adaptation,
 * and persistence of the triple helix state.
 */
export class TripleHelixManager implements TripleHelixManagerInterface {
  // In-memory storage for triple helix states, indexed by userId
  // In a real implementation, this would be replaced with a database or other persistent storage
  private tripleHelixStates: Map<string, TripleHelixState>;
  
  // In-memory storage for user entities
  // In a real implementation, this would be replaced with a user service or database
  private users: Set<string>;
  
  /**
   * Constructor for TripleHelixManager
   */
  constructor() {
    this.tripleHelixStates = new Map<string, TripleHelixState>();
    this.users = new Set<string>();
    
    // Initialize with some mock data for demonstration
    this.users.add('user123');
    this.users.add('user456');
    
    // Set up triple helix for user123 as an example
    const user123State: TripleHelixState = {
      userId: 'user123',
      activePath: {
        id: 'path1',
        name: 'Addition Facts',
        description: 'Basic addition facts from 1+1 to 12+12',
        currentStitchId: 'stitch123',
        nextStitchId: null,
        difficulty: 3,
        status: 'active',
        metadata: {
          category: 'addition',
          lastAccessed: '2025-05-20T12:34:56Z'
        }
      },
      preparingPaths: [
        {
          id: 'path2',
          name: 'Multiplication Facts',
          description: 'Basic multiplication facts from 1×1 to 12×12',
          currentStitchId: null,
          nextStitchId: 'stitch456',
          difficulty: 2,
          status: 'preparing',
          metadata: {
            category: 'multiplication',
            lastAccessed: '2025-05-19T10:11:12Z'
          }
        },
        {
          id: 'path3',
          name: 'Division Facts',
          description: 'Basic division facts',
          currentStitchId: null,
          nextStitchId: 'stitch789',
          difficulty: 4,
          status: 'preparing',
          metadata: {
            category: 'division',
            lastAccessed: '2025-05-18T09:08:07Z'
          }
        }
      ],
      lastRotationTime: '2025-05-15T14:30:00Z',
      rotationCount: 4
    };
    
    this.tripleHelixStates.set('user123', user123State);
  }
  
  /**
   * Validates that a user exists
   * @param userId User identifier
   * @throws USER_NOT_FOUND if the specified user was not found
   */
  private validateUser(userId: string): void {
    if (!this.users.has(userId)) {
      throw new UserNotFoundError(userId);
    }
  }
  
  /**
   * Gets or creates triple helix state for a user (3-Layer Architecture)
   * @param userId User identifier
   * @returns The triple helix state for the user (creates default if not exists)
   */
  private getOrCreateTripleHelix(userId: string): TripleHelixState {
    // 3-Layer Architecture: Auto-create default tube configs for any user
    let tripleHelixState = this.tripleHelixStates.get(userId);
    
    if (!tripleHelixState) {
      // Auto-initialize with default tube configurations
      tripleHelixState = this.initializeTripleHelix(userId);
    }
    
    return tripleHelixState;
  }
  
  /**
   * Validates a difficulty level
   * @param difficulty Difficulty level
   * @throws INVALID_DIFFICULTY if the specified difficulty is invalid
   */
  private validateDifficulty(difficulty: number): void {
    if (difficulty < 1 || difficulty > 5 || !Number.isInteger(difficulty)) {
      throw new InvalidDifficultyError(difficulty);
    }
  }
  
  /**
   * Gets the currently active learning path for a user
   * @param userId User identifier
   * @returns The active learning path
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws NO_ACTIVE_PATH if no active learning path exists for this user
   */
  public getActiveLearningPath(userId: string): LearningPath {
    const tripleHelixState = this.getOrCreateTripleHelix(userId);
    
    if (!tripleHelixState.activePath) {
      throw new NoActivePathError(userId);
    }
    
    return tripleHelixState.activePath;
  }
  
  /**
   * Gets the learning paths being prepared for a user
   * @param userId User identifier
   * @returns Array of learning paths being prepared
   * @throws USER_NOT_FOUND if the specified user was not found
   */
  public getPreparingPaths(userId: string): LearningPath[] {
    const tripleHelixState = this.getOrCreateTripleHelix(userId);
    return tripleHelixState.preparingPaths;
  }
  
  /**
   * Rotates the learning paths, making a prepared path active
   * This implements the core of the Live Aid Stage Model, where one path becomes active
   * while the previously active path moves to the preparing state
   * 
   * @param userId User identifier
   * @returns Result of the rotation operation
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws NO_TRIPLE_HELIX if no triple helix exists for this user
   * @throws ROTATION_FAILED if failed to rotate learning paths
   */
  public rotateLearningPaths(userId: string): {
    previousActivePath: LearningPath;
    newActivePath: LearningPath;
    rotationCount: number;
  } {
    const tripleHelixState = this.getOrCreateTripleHelix(userId);
    
    // Ensure we have preparing paths to rotate to
    if (!tripleHelixState.preparingPaths || tripleHelixState.preparingPaths.length < 1) {
      throw new RotationFailedError(userId, 'No preparing paths available');
    }
    
    // Store the previously active path
    const previousActivePath = { ...tripleHelixState.activePath };
    
    // Take the first preparing path and make it active
    const newActivePath = { ...tripleHelixState.preparingPaths[0] };
    
    // Remove it from the preparing paths
    const remainingPreparingPaths = tripleHelixState.preparingPaths.slice(1);
    
    // Update the previous active path to be preparing
    previousActivePath.status = 'preparing';
    // We need to set a next stitch for the path that was previously active
    previousActivePath.nextStitchId = previousActivePath.currentStitchId;
    previousActivePath.currentStitchId = null;
    
    // Update the new active path
    newActivePath.status = 'active';
    // The next stitch becomes the current stitch for the newly active path
    newActivePath.currentStitchId = newActivePath.nextStitchId;
    newActivePath.nextStitchId = null;
    
    // Increment rotation count
    const rotationCount = tripleHelixState.rotationCount + 1;
    
    // Update the triple helix state
    const updatedState: TripleHelixState = {
      ...tripleHelixState,
      activePath: newActivePath,
      preparingPaths: [...remainingPreparingPaths, previousActivePath],
      lastRotationTime: new Date().toISOString(),
      rotationCount
    };
    
    // Persist the updated state
    this.tripleHelixStates.set(userId, updatedState);
    
    // Return the result of the rotation
    return {
      previousActivePath,
      newActivePath,
      rotationCount
    };
  }
  
  /**
   * Sets up the initial learning paths for a new user
   * Creates the three learning paths and initializes the triple helix state
   * 
   * @param userId User identifier
   * @param initialDifficulty Initial difficulty level (1-5), defaults to 2
   * @param defaultStitches Optional array of default stitches for each tube
   * @returns Initial triple helix state
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws ALREADY_INITIALIZED if triple helix already initialized for this user
   * @throws INITIALIZATION_FAILED if failed to initialize triple helix
   */
  public initializeTripleHelix(
    userId: string,
    initialDifficulty: number = 2,
    defaultStitches?: string[]
  ): TripleHelixState {
    // 3-Layer Architecture: No user validation needed - provide default tube configs for anyone
    // Validate difficulty
    this.validateDifficulty(initialDifficulty);
    
    // Check if triple helix already exists - return existing if found (3-Layer Architecture)
    const existingState = this.tripleHelixStates.get(userId);
    if (existingState) {
      return existingState;
    }
    
    try {
      // Use provided default stitches or fallback to defaults
      const stitches = defaultStitches || ['stitch001', 'stitch002', 'stitch003'];
      
      // Create the three initial learning paths
      const path1: LearningPath = {
        id: 'path1',
        name: 'Addition Facts',
        description: 'Basic addition facts from 1+1 to 12+12',
        currentStitchId: stitches[0],
        difficulty: initialDifficulty,
        status: 'active',
        metadata: {
          category: 'addition',
          lastAccessed: new Date().toISOString()
        }
      };
      
      const path2: LearningPath = {
        id: 'path2',
        name: 'Multiplication Facts',
        description: 'Basic multiplication facts from 1×1 to 12×12',
        nextStitchId: stitches[1],
        difficulty: initialDifficulty,
        status: 'preparing',
        metadata: {
          category: 'multiplication',
          lastAccessed: new Date().toISOString()
        }
      };
      
      const path3: LearningPath = {
        id: 'path3',
        name: 'Division Facts',
        description: 'Basic division facts',
        nextStitchId: stitches[2],
        difficulty: initialDifficulty,
        status: 'preparing',
        metadata: {
          category: 'division',
          lastAccessed: new Date().toISOString()
        }
      };
      
      // Create the initial triple helix state
      const initialState: TripleHelixState = {
        userId,
        activePath: path1,
        preparingPaths: [path2, path3],
        rotationCount: 0
      };
      
      // Persist the initial state
      this.tripleHelixStates.set(userId, initialState);
      
      return initialState;
    } catch (error) {
      throw new InitializationFailedError(userId, error instanceof Error ? error.message : 'Unknown error');
    }
  }
  
  /**
   * Gets the current triple helix state for a user
   * @param userId User identifier
   * @returns Current triple helix state
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws NO_TRIPLE_HELIX if no triple helix exists for this user
   */
  public getTripleHelixState(userId: string): TripleHelixState {
    return this.getOrCreateTripleHelix(userId);
  }
  
  /**
   * Updates the difficulty of a specific learning path
   * This implements the independent adaptation principle of the Triple Helix model,
   * allowing each path to have its own difficulty level
   * 
   * @param userId User identifier
   * @param pathId Learning path identifier
   * @param newDifficulty New difficulty level (1-5)
   * @returns Updated learning path
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws PATH_NOT_FOUND if the specified learning path was not found
   * @throws INVALID_DIFFICULTY if the specified difficulty is invalid
   */
  public updateLearningPathDifficulty(
    userId: string,
    pathId: string,
    newDifficulty: number
  ): LearningPath {
    // Validate difficulty
    this.validateDifficulty(newDifficulty);
    
    // Get triple helix state
    const tripleHelixState = this.getOrCreateTripleHelix(userId);
    
    // Find the path to update
    let pathToUpdate: LearningPath | null = null;
    let isActivePath = false;
    
    // Check if it's the active path
    if (tripleHelixState.activePath.id === pathId) {
      pathToUpdate = tripleHelixState.activePath;
      isActivePath = true;
    } else {
      // Check preparing paths
      const preparingPathIndex = tripleHelixState.preparingPaths.findIndex(
        (path: LearningPath) => path.id === pathId
      );
      
      if (preparingPathIndex >= 0) {
        pathToUpdate = tripleHelixState.preparingPaths[preparingPathIndex];
      }
    }
    
    // If path not found, throw error
    if (!pathToUpdate) {
      throw new PathNotFoundError(userId, pathId);
    }
    
    // Update the difficulty
    const updatedPath: LearningPath = {
      ...pathToUpdate,
      difficulty: newDifficulty,
      metadata: {
        ...pathToUpdate.metadata,
        difficultyUpdated: new Date().toISOString()
      }
    };
    
    // Update the triple helix state
    const updatedState: TripleHelixState = { ...tripleHelixState };
    
    if (isActivePath) {
      updatedState.activePath = updatedPath;
    } else {
      updatedState.preparingPaths = updatedState.preparingPaths.map(
        (path: LearningPath) => (path.id === pathId ? updatedPath : path)
      );
    }
    
    // Persist the updated state
    this.tripleHelixStates.set(userId, updatedState);
    
    return updatedPath;
  }
  
  /**
   * Initialize a user in the system (Live Aid compatibility method)
   * @param userId User identifier
   * @returns Promise<void> for async compatibility
   */
  async initializeUser(userId: string): Promise<void> {
    // Add user to the system if not exists
    if (!this.users.has(userId)) {
      this.users.add(userId);
    }
    
    // Initialize triple helix if not exists - with default tube configurations
    if (!this.tripleHelixStates.has(userId)) {
      await this.initializeTripleHelixWithDefaults(userId);
    }
  }

  /**
   * Initialize triple helix with default tube configurations from database
   * @param userId User identifier
   */
  private async initializeTripleHelixWithDefaults(userId: string): Promise<void> {
    try {
      // Get default tube positions using TubeConfigurationService
      const { tubeConfigurationService } = await import('../../services/TubeConfigurationService');
      const defaultPositions = await tubeConfigurationService.getDefaultTubePositions();
      
      // Initialize with default stitches
      const defaultStitches = ['t1-0001-add', 't2-0001-mult', 't3-0001-sub'];
      if (defaultPositions.length > 0) {
        // Use actual default positions
        defaultStitches[0] = defaultPositions.find(p => p.tube_id === 'tube1')?.stitch_id || 't1-0001-add';
        defaultStitches[1] = defaultPositions.find(p => p.tube_id === 'tube2')?.stitch_id || 't2-0001-mult';
        defaultStitches[2] = defaultPositions.find(p => p.tube_id === 'tube3')?.stitch_id || 't3-0001-sub';
      }
      
      this.initializeTripleHelix(userId, 2, defaultStitches);
    } catch (error) {
      console.warn('Failed to load default tube positions, using fallback:', error);
      // Fallback to default initialization
      this.initializeTripleHelix(userId);
    }
  }
  
  /**
   * Set the active tube for a user (Live Aid compatibility method)
   * @param userId User identifier
   * @param tubeId New active tube ID
   */
  setActiveTube(userId: string, tubeId: string): void {
    // This maps to changing the active path in our learning path model
    const tripleHelixState = this.getOrCreateTripleHelix(userId);
    
    // Find the path that corresponds to this tube
    let targetPath: LearningPath | null = null;
    let targetIndex = -1;
    
    // Check if it's currently a preparing path
    for (let i = 0; i < tripleHelixState.preparingPaths.length; i++) {
      const path = tripleHelixState.preparingPaths[i];
      if (path.id.includes(tubeId)) {
        targetPath = path;
        targetIndex = i;
        break;
      }
    }
    
    if (targetPath) {
      // Move this path to active and current active to preparing
      const currentActive = tripleHelixState.activePath;
      currentActive.status = 'preparing';
      
      targetPath.status = 'active';
      tripleHelixState.activePath = targetPath;
      tripleHelixState.preparingPaths[targetIndex] = currentActive;
      
      // Save updated state
      this.tripleHelixStates.set(userId, tripleHelixState);
    }
  }
  
  /**
   * Get next stitch ID for a tube (Live Aid compatibility method)
   * @param userId User identifier
   * @param tubeId Tube identifier
   * @returns Next stitch ID for the tube
   */
  getNextStitchId(userId: string, tubeId: string): string {
    const tripleHelixState = this.getOrCreateTripleHelix(userId);
    
    // Check active path first
    if (tripleHelixState.activePath.id.includes(tubeId)) {
      return tripleHelixState.activePath.nextStitchId || `${tubeId}-next-stitch`;
    }
    
    // Check preparing paths
    for (const path of tripleHelixState.preparingPaths) {
      if (path.id.includes(tubeId)) {
        return path.nextStitchId || `${tubeId}-next-stitch`;
      }
    }
    
    // Fallback: generate a new stitch ID
    const timestamp = Date.now();
    return `${tubeId}-stitch-${timestamp}`;
  }

  /**
   * Finds a learning path by ID across all paths for a user
   * Helper method for path operations
   * 
   * @param userId User identifier
   * @param pathId Learning path identifier
   * @returns The learning path and its location ('active' or 'preparing')
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws PATH_NOT_FOUND if the specified learning path was not found
   */
  private findLearningPath(userId: string, pathId: string): { 
    path: LearningPath; 
    location: 'active' | 'preparing';
    preparingIndex?: number;
  } {
    const tripleHelixState = this.getOrCreateTripleHelix(userId);
    
    // Check if it's the active path
    if (tripleHelixState.activePath.id === pathId) {
      return {
        path: tripleHelixState.activePath,
        location: 'active'
      };
    }
    
    // Check preparing paths
    const preparingIndex = tripleHelixState.preparingPaths.findIndex(
      (path: any) => path.id === pathId
    );
    
    if (preparingIndex >= 0) {
      return {
        path: tripleHelixState.preparingPaths[preparingIndex],
        location: 'preparing',
        preparingIndex
      };
    }
    
    // Path not found
    throw new PathNotFoundError(userId, pathId);
  }
}

// Export the types for use by other modules
export { LearningPath, TripleHelixState };
