// StitchManager.test.ts
/**
 * Unit tests for the StitchManager component
 */
import {
  StitchManager,
  Stitch,
  StitchManagerError,
  StitchManagerErrorCode,
  SessionResults,
  PerformanceData
} from './StitchManager';

describe('StitchManager', () => {
  let stitchManager: StitchManager;
  
  // Mock data
  const mockLearningPathId = 'path1';
  const mockUserId = 'user123';
  
  const mockStitch1: Stitch = {
    id: 'stitch121',
    name: 'Counting from 1 to 10',
    learningPathId: mockLearningPathId,
    position: 1,
    difficulty: 1,
    factIds: ['fact1']
  };
  
  const mockStitch2: Stitch = {
    id: 'stitch122',
    name: 'Counting from 10 to 20',
    learningPathId: mockLearningPathId,
    position: 2,
    difficulty: 1,
    factIds: ['fact2']
  };
  
  const mockStitch3: Stitch = {
    id: 'stitch123',
    name: 'Addition of Single-Digit Numbers',
    description: 'Practice adding numbers from 1 to 9',
    learningPathId: mockLearningPathId,
    position: 3,
    difficulty: 2,
    factIds: ['fact1', 'fact2', 'fact3'],
    prerequisites: ['stitch122'],
    metadata: {
      category: 'addition',
      tags: ['basic', 'arithmetic']
    }
  };
  
  beforeEach(() => {
    // Initialize StitchManager before each test
    stitchManager = new StitchManager();
    stitchManager.initializeLearningPath(mockLearningPathId);
    
    // Add stitches to the manager
    stitchManager.addStitch(mockStitch1);
    stitchManager.addStitch(mockStitch2);
    stitchManager.addStitch(mockStitch3);
    
    // Initialize progress data
    const sessionResults: SessionResults = {
      correctCount: 45,
      totalCount: 50,
      completionTime: 240000
    };
    
    stitchManager.updateStitchProgress(mockUserId, mockStitch3.id, sessionResults);
  });
  
  describe('getStitchById', () => {
    it('should get a stitch by ID', () => {
      const stitch = stitchManager.getStitchById(mockStitch3.id);
      expect(stitch).toEqual(mockStitch3);
    });
    
    it('should throw STITCH_NOT_FOUND for non-existent stitch', () => {
      expect(() => {
        stitchManager.getStitchById('non-existent');
      }).toThrow(new StitchManagerError(
        StitchManagerErrorCode.STITCH_NOT_FOUND,
        `Stitch with ID 'non-existent' not found`
      ));
    });
  });
  
  describe('getStitchesByLearningPath', () => {
    it('should get all stitches for a learning path', () => {
      const stitches = stitchManager.getStitchesByLearningPath(mockLearningPathId);
      expect(stitches).toHaveLength(3);
      expect(stitches[0]).toEqual(mockStitch1);
      expect(stitches[1]).toEqual(mockStitch2);
      expect(stitches[2]).toEqual(mockStitch3);
    });
    
    it('should throw LEARNING_PATH_NOT_FOUND for non-existent learning path', () => {
      expect(() => {
        stitchManager.getStitchesByLearningPath('non-existent');
      }).toThrow(new StitchManagerError(
        StitchManagerErrorCode.LEARNING_PATH_NOT_FOUND,
        `Learning path with ID 'non-existent' not found`
      ));
    });
  });
  
  describe('getStitchProgress', () => {
    it('should get progress data for a stitch and user', () => {
      const progress = stitchManager.getStitchProgress(mockUserId, mockStitch3.id);
      expect(progress).toEqual({
        userId: mockUserId,
        stitchId: mockStitch3.id,
        completionCount: 1,
        correctCount: 45,
        totalCount: 50,
        masteryLevel: 0.9,
        lastAttemptDate: expect.any(String)
      });
    });
    
    it('should throw STITCH_NOT_FOUND for non-existent stitch', () => {
      expect(() => {
        stitchManager.getStitchProgress(mockUserId, 'non-existent');
      }).toThrow(new StitchManagerError(
        StitchManagerErrorCode.STITCH_NOT_FOUND,
        `Stitch with ID 'non-existent' not found`
      ));
    });
    
    it('should throw USER_NOT_FOUND for non-existent user', () => {
      expect(() => {
        stitchManager.getStitchProgress('', mockStitch3.id);
      }).toThrow(new StitchManagerError(
        StitchManagerErrorCode.USER_NOT_FOUND,
        `User with ID '' not found`
      ));
    });
    
    it('should throw NO_PROGRESS_DATA for stitch with no progress data', () => {
      expect(() => {
        stitchManager.getStitchProgress(mockUserId, mockStitch1.id);
      }).toThrow(new StitchManagerError(
        StitchManagerErrorCode.NO_PROGRESS_DATA,
        `No progress data found for user '${mockUserId}' and stitch '${mockStitch1.id}'`
      ));
    });
  });
  
  describe('updateStitchProgress', () => {
    it('should update progress data for a stitch and user', () => {
      const sessionResults: SessionResults = {
        correctCount: 18,
        totalCount: 20,
        completionTime: 240000
      };
      
      const progress = stitchManager.updateStitchProgress(mockUserId, mockStitch3.id, sessionResults);
      
      expect(progress).toEqual({
        userId: mockUserId,
        stitchId: mockStitch3.id,
        completionCount: 2,
        correctCount: 63,
        totalCount: 70,
        masteryLevel: 0.9,
        lastAttemptDate: expect.any(String)
      });
    });
    
    it('should create new progress data for a stitch with no existing progress', () => {
      const sessionResults: SessionResults = {
        correctCount: 18,
        totalCount: 20,
        completionTime: 240000
      };
      
      const progress = stitchManager.updateStitchProgress(mockUserId, mockStitch1.id, sessionResults);
      
      expect(progress).toEqual({
        userId: mockUserId,
        stitchId: mockStitch1.id,
        completionCount: 1,
        correctCount: 18,
        totalCount: 20,
        masteryLevel: 0.9,
        lastAttemptDate: expect.any(String)
      });
    });
    
    it('should throw INVALID_SESSION_RESULTS for invalid session results', () => {
      const invalidSessionResults: SessionResults = {
        correctCount: 21,
        totalCount: 20,
        completionTime: 240000
      };
      
      expect(() => {
        stitchManager.updateStitchProgress(mockUserId, mockStitch3.id, invalidSessionResults);
      }).toThrow(new StitchManagerError(
        StitchManagerErrorCode.INVALID_SESSION_RESULTS,
        'Invalid session results: correctCount must be non-negative, totalCount must be positive, ' +
        'correctCount must not exceed totalCount, and completionTime must be positive'
      ));
    });
  });
  
  describe('repositionStitch', () => {
    it('should reposition a stitch within its learning path', () => {
      const performance: PerformanceData = {
        correctCount: 20,
        totalCount: 20,
        averageResponseTime: 1500
      };
      
      const result = stitchManager.repositionStitch(mockUserId, mockStitch3.id, performance);
      
      expect(result.previousPosition).toBe(3);
      expect(result.newPosition).toBe(8);
      expect(result.skipNumber).toBe(5);
      
      // Verify the stitch has been repositioned
      const stitch = stitchManager.getStitchById(mockStitch3.id);
      expect(stitch.position).toBe(8);
      
      // Verify other stitches have shifted correctly
      const stitch1 = stitchManager.getStitchById(mockStitch1.id);
      const stitch2 = stitchManager.getStitchById(mockStitch2.id);
      
      expect(stitch1.position).toBe(2);
      expect(stitch2.position).toBe(3);
    });
    
    it('should throw INVALID_PERFORMANCE_DATA for invalid performance data', () => {
      const invalidPerformance: PerformanceData = {
        correctCount: 21,
        totalCount: 20,
        averageResponseTime: 1500
      };
      
      expect(() => {
        stitchManager.repositionStitch(mockUserId, mockStitch3.id, invalidPerformance);
      }).toThrow(new StitchManagerError(
        StitchManagerErrorCode.INVALID_PERFORMANCE_DATA,
        'Invalid performance data: correctCount must be non-negative, totalCount must be positive, ' +
        'correctCount must not exceed totalCount, and averageResponseTime must be positive'
      ));
    });
  });
  
  describe('getNextStitch', () => {
    it('should get the next stitch to present to the user', () => {
      const nextStitch = stitchManager.getNextStitch(mockUserId, mockLearningPathId);
      expect(nextStitch).toEqual(mockStitch1);
    });
    
    it('should throw LEARNING_PATH_NOT_FOUND for non-existent learning path', () => {
      expect(() => {
        stitchManager.getNextStitch(mockUserId, 'non-existent');
      }).toThrow(new StitchManagerError(
        StitchManagerErrorCode.LEARNING_PATH_NOT_FOUND,
        `Learning path with ID 'non-existent' not found`
      ));
    });
    
    it('should return the cached next stitch if available', () => {
      // Get the next stitch once to cache it
      stitchManager.getNextStitch(mockUserId, mockLearningPathId);
      
      // Remove stitch1 to verify the cache is used
      stitchManager.removeStitch(mockStitch1.id);
      stitchManager.addStitch({
        ...mockStitch1,
        name: 'Modified name'
      });
      
      // Get the next stitch again, should be the cached version
      const nextStitch = stitchManager.getNextStitch(mockUserId, mockLearningPathId);
      expect(nextStitch.name).toBe('Counting from 1 to 10');
    });
  });
  
  describe('addStitch', () => {
    it('should add a new stitch to the system', () => {
      const newStitch: Stitch = {
        id: 'stitch124',
        name: 'Subtraction of Single-Digit Numbers',
        learningPathId: mockLearningPathId,
        position: 4,
        difficulty: 2,
        factIds: ['fact4']
      };
      
      stitchManager.addStitch(newStitch);
      
      const stitch = stitchManager.getStitchById(newStitch.id);
      expect(stitch).toEqual(newStitch);
      
      const stitches = stitchManager.getStitchesByLearningPath(mockLearningPathId);
      expect(stitches).toHaveLength(4);
    });
    
    it('should throw POSITION_OCCUPIED if position is already occupied', () => {
      const conflictStitch: Stitch = {
        id: 'stitch124',
        name: 'Conflicting Stitch',
        learningPathId: mockLearningPathId,
        position: 2, // Conflict with mockStitch2
        difficulty: 2,
        factIds: ['fact4']
      };
      
      expect(() => {
        stitchManager.addStitch(conflictStitch);
      }).toThrow(new StitchManagerError(
        StitchManagerErrorCode.POSITION_OCCUPIED,
        `Position 2 in learning path '${mockLearningPathId}' is already occupied`
      ));
    });
  });
  
  describe('removeStitch', () => {
    it('should remove a stitch from the system', () => {
      stitchManager.removeStitch(mockStitch2.id);
      
      expect(() => {
        stitchManager.getStitchById(mockStitch2.id);
      }).toThrow(new StitchManagerError(
        StitchManagerErrorCode.STITCH_NOT_FOUND,
        `Stitch with ID '${mockStitch2.id}' not found`
      ));
      
      const stitches = stitchManager.getStitchesByLearningPath(mockLearningPathId);
      expect(stitches).toHaveLength(2);
    });
    
    it('should throw STITCH_NOT_FOUND for non-existent stitch', () => {
      expect(() => {
        stitchManager.removeStitch('non-existent');
      }).toThrow(new StitchManagerError(
        StitchManagerErrorCode.STITCH_NOT_FOUND,
        `Stitch with ID 'non-existent' not found`
      ));
    });
  });
  
  describe('getStitchAtPosition', () => {
    it('should get the stitch at a specific position', () => {
      const stitch = stitchManager.getStitchAtPosition(mockLearningPathId, 2);
      expect(stitch).toEqual(mockStitch2);
    });
    
    it('should return null if no stitch at the specified position', () => {
      // Remove stitch2 from position 2
      stitchManager.removeStitch(mockStitch2.id);
      
      const stitch = stitchManager.getStitchAtPosition(mockLearningPathId, 2);
      expect(stitch).toBeNull();
    });
    
    it('should throw POSITION_OUT_OF_BOUNDS for invalid position', () => {
      expect(() => {
        stitchManager.getStitchAtPosition(mockLearningPathId, 100);
      }).toThrow(new StitchManagerError(
        StitchManagerErrorCode.POSITION_OUT_OF_BOUNDS,
        `Position 100 is out of bounds for learning path '${mockLearningPathId}'`
      ));
    });
  });
  
  describe('Position as first-class citizens principle', () => {
    it('should maintain position integrity during operations', () => {
      // First, get all stitches to verify initial state
      const initialStitches = stitchManager.getStitchesByLearningPath(mockLearningPathId);
      expect(initialStitches[0].position).toBe(1);
      expect(initialStitches[1].position).toBe(2);
      expect(initialStitches[2].position).toBe(3);
      
      // Reposition stitch3 (from position 3 to position 8)
      const performance: PerformanceData = {
        correctCount: 20,
        totalCount: 20,
        averageResponseTime: 1500
      };
      
      stitchManager.repositionStitch(mockUserId, mockStitch3.id, performance);
      
      // Get updated stitches
      const updatedStitches = stitchManager.getStitchesByLearningPath(mockLearningPathId);
      
      // Verify stitch positions
      const updatedStitch1 = stitchManager.getStitchById(mockStitch1.id);
      const updatedStitch2 = stitchManager.getStitchById(mockStitch2.id);
      const updatedStitch3 = stitchManager.getStitchById(mockStitch3.id);
      
      expect(updatedStitch1.position).toBe(2);
      expect(updatedStitch2.position).toBe(3);
      expect(updatedStitch3.position).toBe(8);
      
      // Verify each position has exactly one stitch or is null
      const positions = new Set<number>();
      for (const stitch of updatedStitches) {
        expect(positions.has(stitch.position)).toBe(false);
        positions.add(stitch.position);
      }
    });
  });
});
