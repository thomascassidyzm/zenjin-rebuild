/**
 * SpacedRepetitionSystem.test.ts
 * 
 * Test suite for the SpacedRepetitionSystem component.
 * Validates the implementation against the requirements and expected behavior.
 */

import {
  SpacedRepetitionSystem,
  PerformanceData,
  SpacedRepetitionError
} from './SpacedRepetitionSystem';

describe('SpacedRepetitionSystem', () => {
  let spacedRepetitionSystem: SpacedRepetitionSystem;

  // Sample data for testing
  const userId = 'user123';
  const learningPathId = 'path1';
  const stitches = [
    { id: 'stitch1', content: { type: 'addition', difficulty: 1, question: '2 + 3 = ?', answer: 5, options: [3, 4, 5, 6] } },
    { id: 'stitch2', content: { type: 'subtraction', difficulty: 1, question: '5 - 2 = ?', answer: 3, options: [2, 3, 4, 5] } },
    { id: 'stitch3', content: { type: 'multiplication', difficulty: 2, question: '3 × 4 = ?', answer: 12, options: [9, 10, 12, 15] } },
    { id: 'stitch4', content: { type: 'division', difficulty: 2, question: '10 ÷ 2 = ?', answer: 5, options: [3, 4, 5, 6] } },
    { id: 'stitch5', content: { type: 'addition', difficulty: 3, question: '18 + 7 = ?', answer: 25, options: [23, 24, 25, 26] } },
    { id: 'stitch6', content: { type: 'subtraction', difficulty: 3, question: '23 - 9 = ?', answer: 14, options: [12, 13, 14, 15] } }
  ];

  // Performance data samples
  const perfectPerformance: PerformanceData = {
    correctCount: 20,
    totalCount: 20,
    averageResponseTime: 1500,
    completionDate: '2025-05-20T14:30:00Z'
  };

  const goodPerformance: PerformanceData = {
    correctCount: 18,
    totalCount: 20,
    averageResponseTime: 2000,
    completionDate: '2025-05-20T14:35:00Z'
  };

  const fairPerformance: PerformanceData = {
    correctCount: 14,
    totalCount: 20,
    averageResponseTime: 2500,
    completionDate: '2025-05-20T14:40:00Z'
  };

  const poorPerformance: PerformanceData = {
    correctCount: 10,
    totalCount: 20,
    averageResponseTime: 3000,
    completionDate: '2025-05-20T14:45:00Z'
  };

  // Set up a fresh system before each test
  beforeEach(() => {
    spacedRepetitionSystem = new SpacedRepetitionSystem();
    // Initialize a learning path with test stitches
    spacedRepetitionSystem.initializeLearningPath(userId, learningPathId, stitches);
  });

  describe('calculateSkipNumber', () => {
    it('should calculate higher skip number for perfect performance', () => {
      const skipNumber = spacedRepetitionSystem.calculateSkipNumber(perfectPerformance);
      expect(skipNumber).toBeGreaterThanOrEqual(5);
    });

    it('should calculate moderate skip number for good performance', () => {
      const skipNumber = spacedRepetitionSystem.calculateSkipNumber(goodPerformance);
      expect(skipNumber).toBeGreaterThanOrEqual(3);
      expect(skipNumber).toBeLessThan(5);
    });

    it('should calculate lower skip number for poor performance', () => {
      const skipNumber = spacedRepetitionSystem.calculateSkipNumber(poorPerformance);
      expect(skipNumber).toBeLessThanOrEqual(2);
    });

    it('should throw error for invalid performance data', () => {
      const invalidPerformance = {
        correctCount: 25, // Invalid: greater than totalCount
        totalCount: 20,
        averageResponseTime: 1500
      };

      expect(() => {
        spacedRepetitionSystem.calculateSkipNumber(invalidPerformance as PerformanceData);
      }).toThrow(SpacedRepetitionError.INVALID_PERFORMANCE_DATA);
    });

    it('should consider previous skip numbers when calculating new skip', () => {
      // First repositioning with perfect performance
      const result1 = spacedRepetitionSystem.repositionStitch(userId, 'stitch1', perfectPerformance);
      
      // Second repositioning with perfect performance should increase skip
      const result2 = spacedRepetitionSystem.repositionStitch(userId, 'stitch1', perfectPerformance);
      
      expect(result2.skipNumber).toBeGreaterThanOrEqual(result1.skipNumber);
    });
  });

  describe('repositionStitch', () => {
    it('should correctly reposition a stitch with perfect performance', () => {
      const result = spacedRepetitionSystem.repositionStitch(userId, 'stitch1', perfectPerformance);
      
      expect(result.stitchId).toBe('stitch1');
      expect(result.previousPosition).toBe(1);
      expect(result.newPosition).toBeGreaterThanOrEqual(5);
      expect(result.skipNumber).toBeGreaterThanOrEqual(5);
      expect(result.timestamp).toBe(perfectPerformance.completionDate);
      
      // Check that queue is updated
      const queue = spacedRepetitionSystem.getStitchQueue(userId, learningPathId);
      const repositionedStitch = queue.find(s => s.id === 'stitch1');
      
      expect(repositionedStitch).toBeDefined();
      expect(repositionedStitch?.position).toBe(result.newPosition);
    });

    it('should correctly reposition a stitch with good performance', () => {
      const result = spacedRepetitionSystem.repositionStitch(userId, 'stitch2', goodPerformance);
      
      expect(result.stitchId).toBe('stitch2');
      expect(result.previousPosition).toBe(2);
      expect(result.newPosition).toBe(result.skipNumber);
      expect(result.skipNumber).toBeGreaterThanOrEqual(3);
      
      // Check that queue is updated
      const queue = spacedRepetitionSystem.getStitchQueue(userId, learningPathId);
      const repositionedStitch = queue.find(s => s.id === 'stitch2');
      
      expect(repositionedStitch).toBeDefined();
      expect(repositionedStitch?.position).toBe(result.newPosition);
    });

    it('should correctly shift other stitches when repositioning', () => {
      // Reposition stitch1 with skip number 5
      spacedRepetitionSystem.repositionStitch(userId, 'stitch1', perfectPerformance);
      
      // Get the updated queue
      const queue = spacedRepetitionSystem.getStitchQueue(userId, learningPathId);
      
      // Check that positions are continuous with no gaps
      const positions = queue.map(s => s.position).sort((a, b) => a - b);
      for (let i = 0; i < positions.length; i++) {
        expect(positions[i]).toBe(i + 1);
      }
      
      // Check that the correct stitch is now at position 1
      const nextStitch = queue.find(s => s.position === 1);
      expect(nextStitch?.id).toBe('stitch2');
    });

    it('should throw error for non-existent user', () => {
      expect(() => {
        spacedRepetitionSystem.repositionStitch('nonexistentUser', 'stitch1', perfectPerformance);
      }).toThrow(SpacedRepetitionError.USER_NOT_FOUND);
    });

    it('should throw error for non-existent stitch', () => {
      expect(() => {
        spacedRepetitionSystem.repositionStitch(userId, 'nonexistentStitch', perfectPerformance);
      }).toThrow(SpacedRepetitionError.STITCH_NOT_FOUND);
    });
  });

  describe('getNextStitch', () => {
    it('should get the stitch at position 1', () => {
      const nextStitch = spacedRepetitionSystem.getNextStitch(userId, learningPathId);
      
      expect(nextStitch.id).toBe('stitch1');
      expect(nextStitch.position).toBe(1);
      expect(nextStitch.content).toBeDefined();
    });

    it('should get the correct next stitch after repositioning', () => {
      // Reposition stitch1
      spacedRepetitionSystem.repositionStitch(userId, 'stitch1', perfectPerformance);
      
      // Get the next stitch
      const nextStitch = spacedRepetitionSystem.getNextStitch(userId, learningPathId);
      
      // Should now be stitch2
      expect(nextStitch.id).toBe('stitch2');
      expect(nextStitch.position).toBe(1);
    });

    it('should throw error for non-existent user', () => {
      expect(() => {
        spacedRepetitionSystem.getNextStitch('nonexistentUser', learningPathId);
      }).toThrow(SpacedRepetitionError.USER_NOT_FOUND);
    });

    it('should throw error for non-existent learning path', () => {
      expect(() => {
        spacedRepetitionSystem.getNextStitch(userId, 'nonexistentPath');
      }).toThrow(SpacedRepetitionError.LEARNING_PATH_NOT_FOUND);
    });
  });

  describe('getStitchQueue', () => {
    it('should return the queue in correct position order', () => {
      const queue = spacedRepetitionSystem.getStitchQueue(userId, learningPathId);
      
      expect(queue.length).toBe(6);
      
      // Check that positions are in ascending order
      for (let i = 0; i < queue.length; i++) {
        expect(queue[i].position).toBe(i + 1);
      }
    });

    it('should return the correct queue after repositioning', () => {
      // Reposition stitch1
      const result = spacedRepetitionSystem.repositionStitch(userId, 'stitch1', perfectPerformance);
      
      // Get the updated queue
      const queue = spacedRepetitionSystem.getStitchQueue(userId, learningPathId);
      
      // Check that stitch1 is now at the new position
      const repositionedStitch = queue.find(s => s.id === 'stitch1');
      expect(repositionedStitch?.position).toBe(result.newPosition);
      
      // Check that positions are continuous with no gaps
      const positions = queue.map(s => s.position).sort((a, b) => a - b);
      for (let i = 0; i < positions.length; i++) {
        expect(positions[i]).toBe(i + 1);
      }
    });

    it('should throw error for non-existent user', () => {
      expect(() => {
        spacedRepetitionSystem.getStitchQueue('nonexistentUser', learningPathId);
      }).toThrow(SpacedRepetitionError.USER_NOT_FOUND);
    });

    it('should throw error for non-existent learning path', () => {
      expect(() => {
        spacedRepetitionSystem.getStitchQueue(userId, 'nonexistentPath');
      }).toThrow(SpacedRepetitionError.LEARNING_PATH_NOT_FOUND);
    });
  });

  describe('getRepositioningHistory', () => {
    it('should return empty array for stitch with no history', () => {
      const history = spacedRepetitionSystem.getRepositioningHistory(userId, 'stitch1');
      expect(history).toEqual([]);
    });

    it('should correctly track repositioning history', () => {
      // Reposition stitch1 multiple times
      const result1 = spacedRepetitionSystem.repositionStitch(userId, 'stitch1', perfectPerformance);
      const result2 = spacedRepetitionSystem.repositionStitch(userId, 'stitch1', goodPerformance);
      
      // Get the history
      const history = spacedRepetitionSystem.getRepositioningHistory(userId, 'stitch1');
      
      // Check that history contains the repositioning results in reverse chronological order
      expect(history.length).toBe(2);
      expect(history[0]).toEqual(result2);
      expect(history[1]).toEqual(result1);
    });

    it('should respect the limit parameter', () => {
      // Reposition stitch1 multiple times
      spacedRepetitionSystem.repositionStitch(userId, 'stitch1', perfectPerformance);
      spacedRepetitionSystem.repositionStitch(userId, 'stitch1', goodPerformance);
      spacedRepetitionSystem.repositionStitch(userId, 'stitch1', fairPerformance);
      
      // Get history with limit
      const history = spacedRepetitionSystem.getRepositioningHistory(userId, 'stitch1', 2);
      
      // Check that only the most recent 2 entries are returned
      expect(history.length).toBe(2);
    });

    it('should throw error for non-existent user', () => {
      expect(() => {
        spacedRepetitionSystem.getRepositioningHistory('nonexistentUser', 'stitch1');
      }).toThrow(SpacedRepetitionError.USER_NOT_FOUND);
    });

    it('should throw error for non-existent stitch', () => {
      expect(() => {
        spacedRepetitionSystem.getRepositioningHistory(userId, 'nonexistentStitch');
      }).toThrow(SpacedRepetitionError.STITCH_NOT_FOUND);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle a complete learning scenario with multiple stitches', () => {
      // Get the first stitch
      const firstStitch = spacedRepetitionSystem.getNextStitch(userId, learningPathId);
      expect(firstStitch.id).toBe('stitch1');
      
      // Complete stitch1 with perfect performance
      spacedRepetitionSystem.repositionStitch(userId, firstStitch.id, perfectPerformance);
      
      // Get the next stitch (should be stitch2)
      const secondStitch = spacedRepetitionSystem.getNextStitch(userId, learningPathId);
      expect(secondStitch.id).toBe('stitch2');
      
      // Complete stitch2 with good performance
      spacedRepetitionSystem.repositionStitch(userId, secondStitch.id, goodPerformance);
      
      // Get the next stitch (should be stitch3)
      const thirdStitch = spacedRepetitionSystem.getNextStitch(userId, learningPathId);
      expect(thirdStitch.id).toBe('stitch3');
      
      // Complete stitch3 with fair performance
      spacedRepetitionSystem.repositionStitch(userId, thirdStitch.id, fairPerformance);
      
      // Get the queue and check positions
      const queue = spacedRepetitionSystem.getStitchQueue(userId, learningPathId);
      
      // Check that positions are continuous with no gaps
      const positions = queue.map(s => s.position).sort((a, b) => a - b);
      for (let i = 0; i < positions.length; i++) {
        expect(positions[i]).toBe(i + 1);
      }
      
      // stitch1 should be positioned further back (higher position)
      const stitch1 = queue.find(s => s.id === 'stitch1');
      const stitch2 = queue.find(s => s.id === 'stitch2');
      const stitch3 = queue.find(s => s.id === 'stitch3');
      
      expect(stitch1?.position).toBeGreaterThan(stitch2?.position || 0);
      expect(stitch2?.position).toBeGreaterThan(stitch3?.position || 0);
    });

    it('should handle repositioning of the same stitch multiple times', () => {
      // Complete stitch1 with perfect performance multiple times
      const result1 = spacedRepetitionSystem.repositionStitch(userId, 'stitch1', perfectPerformance);
      
      // Get the next stitch and complete it to make stitch1 the next up
      let nextStitch = spacedRepetitionSystem.getNextStitch(userId, learningPathId);
      spacedRepetitionSystem.repositionStitch(userId, nextStitch.id, perfectPerformance);
      
      // Get the next stitch and complete it to make stitch1 the next up
      nextStitch = spacedRepetitionSystem.getNextStitch(userId, learningPathId);
      spacedRepetitionSystem.repositionStitch(userId, nextStitch.id, perfectPerformance);
      
      // Get the next stitch and complete it to make stitch1 the next up
      nextStitch = spacedRepetitionSystem.getNextStitch(userId, learningPathId);
      spacedRepetitionSystem.repositionStitch(userId, nextStitch.id, perfectPerformance);
      
      // Get the next stitch and complete it to make stitch1 the next up
      nextStitch = spacedRepetitionSystem.getNextStitch(userId, learningPathId);
      spacedRepetitionSystem.repositionStitch(userId, nextStitch.id, perfectPerformance);
      
      // Complete stitch1 again with perfect performance
      const result2 = spacedRepetitionSystem.repositionStitch(userId, 'stitch1', perfectPerformance);
      
      // The second skip should be larger than the first
      expect(result2.skipNumber).toBeGreaterThan(result1.skipNumber);
      
      // Get the history and check that it shows increasing skip numbers
      const history = spacedRepetitionSystem.getRepositioningHistory(userId, 'stitch1');
      expect(history.length).toBe(2);
      expect(history[0].skipNumber).toBeGreaterThan(history[1].skipNumber);
    });
  });
});
