/**
 * Test cases for the TripleHelixManager component
 * 
 * These tests validate the implementation against the requirements
 * specified in the Implementation Package.
 */

import { TripleHelixManager, UserNotFoundError, NoTripleHelixError, 
  AlreadyInitializedError, PathNotFoundError, InvalidDifficultyError } from './TripleHelixManager';

// Mock test environment
describe('TripleHelixManager', () => {
  let tripleHelixManager: TripleHelixManager;

  beforeEach(() => {
    // Create new instance for each test
    tripleHelixManager = new TripleHelixManager();
  });

  // Test getActiveLearningPath
  describe('getActiveLearningPath', () => {
    it('should return the active learning path for a valid user', () => {
      // Given a user with an initialized triple helix
      const userId = 'user123';
      
      // When getting the active learning path
      const activePath = tripleHelixManager.getActiveLearningPath(userId);
      
      // Then it should return the correct path
      expect(activePath).toBeDefined();
      expect(activePath.id).toBe('path1');
      expect(activePath.status).toBe('active');
    });

    it('should throw USER_NOT_FOUND for invalid user', () => {
      // Given an invalid user
      const userId = 'nonexistentUser';
      
      // When getting the active learning path
      // Then it should throw USER_NOT_FOUND
      expect(() => {
        tripleHelixManager.getActiveLearningPath(userId);
      }).toThrow(UserNotFoundError);
    });
  });

  // Test getPreparingPaths
  describe('getPreparingPaths', () => {
    it('should return the preparing paths for a valid user', () => {
      // Given a user with an initialized triple helix
      const userId = 'user123';
      
      // When getting the preparing paths
      const preparingPaths = tripleHelixManager.getPreparingPaths(userId);
      
      // Then it should return the correct paths
      expect(preparingPaths).toBeDefined();
      expect(preparingPaths.length).toBe(2);
      expect(preparingPaths[0].id).toBe('path2');
      expect(preparingPaths[1].id).toBe('path3');
      expect(preparingPaths[0].status).toBe('preparing');
      expect(preparingPaths[1].status).toBe('preparing');
    });

    it('should throw USER_NOT_FOUND for invalid user', () => {
      // Given an invalid user
      const userId = 'nonexistentUser';
      
      // When getting the preparing paths
      // Then it should throw USER_NOT_FOUND
      expect(() => {
        tripleHelixManager.getPreparingPaths(userId);
      }).toThrow(UserNotFoundError);
    });
  });

  // Test rotateLearningPaths
  describe('rotateLearningPaths', () => {
    it('should correctly rotate the learning paths', () => {
      // Given a user with an initialized triple helix
      const userId = 'user123';
      
      // When rotating the learning paths
      const rotationResult = tripleHelixManager.rotateLearningPaths(userId);
      
      // Then it should return the correct result
      expect(rotationResult).toBeDefined();
      expect(rotationResult.previousActivePath.id).toBe('path1');
      expect(rotationResult.newActivePath.id).toBe('path2');
      expect(rotationResult.rotationCount).toBe(5);
      
      // And the triple helix state should be updated
      const state = tripleHelixManager.getTripleHelixState(userId);
      expect(state.activePath.id).toBe('path2');
      expect(state.activePath.status).toBe('active');
      expect(state.preparingPaths.length).toBe(2);
      expect(state.preparingPaths[0].id).toBe('path3');
      expect(state.preparingPaths[1].id).toBe('path1');
      expect(state.preparingPaths[1].status).toBe('preparing');
      expect(state.rotationCount).toBe(5);
    });

    it('should throw USER_NOT_FOUND for invalid user', () => {
      // Given an invalid user
      const userId = 'nonexistentUser';
      
      // When rotating the learning paths
      // Then it should throw USER_NOT_FOUND
      expect(() => {
        tripleHelixManager.rotateLearningPaths(userId);
      }).toThrow(UserNotFoundError);
    });
  });

  // Test initializeTripleHelix
  describe('initializeTripleHelix', () => {
    it('should initialize the triple helix for a new user', () => {
      // Given a valid user without an initialized triple helix
      const userId = 'user456';
      const initialDifficulty = 2;
      
      // When initializing the triple helix
      const initialState = tripleHelixManager.initializeTripleHelix(userId, initialDifficulty);
      
      // Then it should return the correct state
      expect(initialState).toBeDefined();
      expect(initialState.userId).toBe(userId);
      expect(initialState.activePath).toBeDefined();
      expect(initialState.activePath.status).toBe('active');
      expect(initialState.activePath.difficulty).toBe(initialDifficulty);
      expect(initialState.preparingPaths).toBeDefined();
      expect(initialState.preparingPaths.length).toBe(2);
      expect(initialState.rotationCount).toBe(0);
    });

    it('should throw ALREADY_INITIALIZED for user with existing triple helix', () => {
      // Given a user with an already initialized triple helix
      const userId = 'user123';
      
      // When initializing the triple helix
      // Then it should throw ALREADY_INITIALIZED
      expect(() => {
        tripleHelixManager.initializeTripleHelix(userId);
      }).toThrow(AlreadyInitializedError);
    });

    it('should throw INVALID_DIFFICULTY for invalid difficulty', () => {
      // Given a valid user but invalid difficulty
      const userId = 'user456';
      const invalidDifficulty = 6;
      
      // When initializing the triple helix
      // Then it should throw INVALID_DIFFICULTY
      expect(() => {
        tripleHelixManager.initializeTripleHelix(userId, invalidDifficulty);
      }).toThrow(InvalidDifficultyError);
    });
  });

  // Test getTripleHelixState
  describe('getTripleHelixState', () => {
    it('should return the triple helix state for a valid user', () => {
      // Given a user with an initialized triple helix
      const userId = 'user123';
      
      // When getting the triple helix state
      const state = tripleHelixManager.getTripleHelixState(userId);
      
      // Then it should return the correct state
      expect(state).toBeDefined();
      expect(state.userId).toBe(userId);
      expect(state.activePath).toBeDefined();
      expect(state.preparingPaths).toBeDefined();
      expect(state.preparingPaths.length).toBe(2);
      expect(state.rotationCount).toBe(4);
    });

    it('should throw USER_NOT_FOUND for invalid user', () => {
      // Given an invalid user
      const userId = 'nonexistentUser';
      
      // When getting the triple helix state
      // Then it should throw USER_NOT_FOUND
      expect(() => {
        tripleHelixManager.getTripleHelixState(userId);
      }).toThrow(UserNotFoundError);
    });
  });

  // Test updateLearningPathDifficulty
  describe('updateLearningPathDifficulty', () => {
    it('should update the difficulty of the active learning path', () => {
      // Given a user with an initialized triple helix
      const userId = 'user123';
      const pathId = 'path1';
      const newDifficulty = 3;
      
      // When updating the difficulty
      const updatedPath = tripleHelixManager.updateLearningPathDifficulty(
        userId,
        pathId,
        newDifficulty
      );
      
      // Then it should return the updated path
      expect(updatedPath).toBeDefined();
      expect(updatedPath.id).toBe(pathId);
      expect(updatedPath.difficulty).toBe(newDifficulty);
      expect(updatedPath.metadata).toBeDefined();
      expect(updatedPath.metadata.difficultyUpdated).toBeDefined();
      
      // And the triple helix state should be updated
      const state = tripleHelixManager.getTripleHelixState(userId);
      expect(state.activePath.difficulty).toBe(newDifficulty);
    });

    it('should update the difficulty of a preparing learning path', () => {
      // Given a user with an initialized triple helix
      const userId = 'user123';
      const pathId = 'path2';
      const newDifficulty = 4;
      
      // When updating the difficulty
      const updatedPath = tripleHelixManager.updateLearningPathDifficulty(
        userId,
        pathId,
        newDifficulty
      );
      
      // Then it should return the updated path
      expect(updatedPath).toBeDefined();
      expect(updatedPath.id).toBe(pathId);
      expect(updatedPath.difficulty).toBe(newDifficulty);
      
      // And the triple helix state should be updated
      const state = tripleHelixManager.getTripleHelixState(userId);
      expect(state.preparingPaths[0].difficulty).toBe(newDifficulty);
    });

    it('should throw PATH_NOT_FOUND for invalid path', () => {
      // Given a valid user but invalid path
      const userId = 'user123';
      const invalidPathId = 'nonexistentPath';
      const newDifficulty = 3;
      
      // When updating the difficulty
      // Then it should throw PATH_NOT_FOUND
      expect(() => {
        tripleHelixManager.updateLearningPathDifficulty(
          userId,
          invalidPathId,
          newDifficulty
        );
      }).toThrow(PathNotFoundError);
    });

    it('should throw INVALID_DIFFICULTY for invalid difficulty', () => {
      // Given a valid user and path but invalid difficulty
      const userId = 'user123';
      const pathId = 'path1';
      const invalidDifficulty = 0;
      
      // When updating the difficulty
      // Then it should throw INVALID_DIFFICULTY
      expect(() => {
        tripleHelixManager.updateLearningPathDifficulty(
          userId,
          pathId,
          invalidDifficulty
        );
      }).toThrow(InvalidDifficultyError);
    });
  });

  // Test validation criteria PS-001: Correct rotation between paths
  describe('PS-001: Correct rotation between paths', () => {
    it('should maintain one active and two preparing paths after rotation', () => {
      // Given a user with an initialized triple helix
      const userId = 'user123';
      
      // When rotating the learning paths
      tripleHelixManager.rotateLearningPaths(userId);
      
      // Then it should maintain one active and two preparing paths
      const state = tripleHelixManager.getTripleHelixState(userId);
      expect(state.activePath).toBeDefined();
      expect(state.activePath.status).toBe('active');
      expect(state.preparingPaths).toBeDefined();
      expect(state.preparingPaths.length).toBe(2);
      expect(state.preparingPaths.every((path: any) => path.status === 'preparing')).toBe(true);
    });

    it('should follow the correct rotation sequence', () => {
      // Given a user with an initialized triple helix
      const userId = 'user123';
      
      // Store initial state
      const initialState = tripleHelixManager.getTripleHelixState(userId);
      const initialActivePath = initialState.activePath;
      const initialPreparingPaths = [...initialState.preparingPaths];
      
      // When rotating the learning paths twice
      tripleHelixManager.rotateLearningPaths(userId);
      const stateAfterFirstRotation = tripleHelixManager.getTripleHelixState(userId);
      tripleHelixManager.rotateLearningPaths(userId);
      const stateAfterSecondRotation = tripleHelixManager.getTripleHelixState(userId);
      
      // Then it should follow the correct sequence
      // After first rotation:
      expect(stateAfterFirstRotation.activePath.id).toBe(initialPreparingPaths[0].id);
      expect(stateAfterFirstRotation.preparingPaths[0].id).toBe(initialPreparingPaths[1].id);
      expect(stateAfterFirstRotation.preparingPaths[1].id).toBe(initialActivePath.id);
      
      // After second rotation:
      expect(stateAfterSecondRotation.activePath.id).toBe(initialPreparingPaths[1].id);
      expect(stateAfterSecondRotation.preparingPaths[0].id).toBe(initialActivePath.id);
      expect(stateAfterSecondRotation.preparingPaths[1].id).toBe(initialPreparingPaths[0].id);
    });
  });
  
  // Test validation criteria PS-005: Independent difficulty adaptation
  describe('PS-005: Independent difficulty adaptation', () => {
    it('should maintain independent difficulty levels for each path', () => {
      // Given a user with an initialized triple helix
      const userId = 'user123';
      
      // When updating difficulties for different paths
      tripleHelixManager.updateLearningPathDifficulty(userId, 'path1', 5);
      tripleHelixManager.updateLearningPathDifficulty(userId, 'path2', 1);
      tripleHelixManager.updateLearningPathDifficulty(userId, 'path3', 3);
      
      // Then each path should have its own difficulty
      const state = tripleHelixManager.getTripleHelixState(userId);
      expect(state.activePath.difficulty).toBe(5);
      expect(state.preparingPaths[0].difficulty).toBe(1);
      expect(state.preparingPaths[1].difficulty).toBe(3);
    });

    it('should persist difficulty changes after rotation', () => {
      // Given a user with an initialized triple helix and updated difficulties
      const userId = 'user123';
      tripleHelixManager.updateLearningPathDifficulty(userId, 'path1', 5);
      tripleHelixManager.updateLearningPathDifficulty(userId, 'path2', 1);
      
      // Store path IDs for reference
      const path1Id = 'path1';
      const path2Id = 'path2';
      
      // When rotating the learning paths
      tripleHelixManager.rotateLearningPaths(userId);
      
      // Then difficulty changes should persist
      const state = tripleHelixManager.getTripleHelixState(userId);
      
      // Find paths by ID
      const path1 = state.activePath.id === path1Id ? state.activePath : 
                    state.preparingPaths.find((p: any) => p.id === path1Id);
      const path2 = state.activePath.id === path2Id ? state.activePath : 
                    state.preparingPaths.find((p: any) => p.id === path2Id);
      
      expect(path1?.difficulty).toBe(5);
      expect(path2?.difficulty).toBe(1);
    });
  });
});
