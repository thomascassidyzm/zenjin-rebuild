/**
 * DistinctionManager.test.tsx
 * 
 * Unit tests for the DistinctionManager component
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  DistinctionManager,
  DistinctionManagerError,
  DistinctionManagerErrorCode,
  PerformanceData
} from './DistinctionManager';
import { FactRepositoryInterface, MathematicalFact, FactQuery } from '../../interfaces/FactRepositoryInterface';

// Mock implementation of FactRepositoryInterface for testing
class MockFactRepository implements FactRepositoryInterface {
  private validFacts: Set<string> = new Set([
    'add-1-1', 'add-2-2', 'add-3-3',
    'sub-5-2', 'sub-8-3', 'sub-9-4',
    'mult-7-8', 'mult-6-6', 'mult-9-9',
    'div-10-2', 'div-12-3', 'div-15-5'
  ]);

  private facts: Map<string, MathematicalFact> = new Map([
    ['add-1-1', { id: 'add-1-1', operation: 'addition', operands: [1, 1], result: 2, difficulty: 0.1 }],
    ['add-2-2', { id: 'add-2-2', operation: 'addition', operands: [2, 2], result: 4, difficulty: 0.15 }],
    ['add-3-3', { id: 'add-3-3', operation: 'addition', operands: [3, 3], result: 6, difficulty: 0.2 }],
    ['sub-5-2', { id: 'sub-5-2', operation: 'subtraction', operands: [5, 2], result: 3, difficulty: 0.2 }],
    ['sub-8-3', { id: 'sub-8-3', operation: 'subtraction', operands: [8, 3], result: 5, difficulty: 0.25 }],
    ['sub-9-4', { id: 'sub-9-4', operation: 'subtraction', operands: [9, 4], result: 5, difficulty: 0.25 }],
    ['mult-7-8', { id: 'mult-7-8', operation: 'multiplication', operands: [7, 8], result: 56, difficulty: 0.5 }],
    ['mult-6-6', { id: 'mult-6-6', operation: 'multiplication', operands: [6, 6], result: 36, difficulty: 0.4 }],
    ['mult-9-9', { id: 'mult-9-9', operation: 'multiplication', operands: [9, 9], result: 81, difficulty: 0.6 }],
    ['div-10-2', { id: 'div-10-2', operation: 'division', operands: [10, 2], result: 5, difficulty: 0.3 }],
    ['div-12-3', { id: 'div-12-3', operation: 'division', operands: [12, 3], result: 4, difficulty: 0.35 }],
    ['div-15-5', { id: 'div-15-5', operation: 'division', operands: [15, 5], result: 3, difficulty: 0.4 }]
  ]);

  getFactById(factId: string): MathematicalFact {
    const fact = this.facts.get(factId);
    if (!fact) {
      throw new Error(`FACT_NOT_FOUND - The specified fact was not found: ${factId}`);
    }
    return fact;
  }

  queryFacts(query: FactQuery): MathematicalFact[] {
    let results = Array.from(this.facts.values());
    
    if (query.operation) {
      results = results.filter(fact => fact.operation === query.operation);
    }
    
    if (query.difficulty) {
      const min = query.difficulty.min ?? 0;
      const max = query.difficulty.max ?? 1;
      results = results.filter(fact => (fact.difficulty ?? 0.5) >= min && (fact.difficulty ?? 0.5) <= max);
    }
    
    if (query.tags) {
      results = results.filter(fact => 
        query.tags!.some(tag => fact.tags?.includes(tag))
      );
    }
    
    const offset = query.offset || 0;
    const limit = query.limit || 100;
    
    return results.slice(offset, offset + limit);
  }

  getRelatedFacts(factId: string, limit?: number): MathematicalFact[] {
    // For testing, just return an empty array
    return [];
  }

  getFactsByOperation(operation: string): MathematicalFact[] {
    return Array.from(this.facts.values()).filter(fact => fact.operation === operation);
  }

  getFactCount(query?: FactQuery): number {
    if (!query) {
      return this.facts.size;
    }
    return this.queryFacts(query).length;
  }

  factExists(factId: string): boolean {
    return this.validFacts.has(factId);
  }
}

describe('DistinctionManager', () => {
  let distinctionManager: DistinctionManager;
  let factRepository: FactRepositoryInterface;

  beforeEach(() => {
    factRepository = new MockFactRepository();
    distinctionManager = new DistinctionManager(factRepository);
  });

  describe('getAllBoundaryLevels', () => {
    it('should return all five boundary levels with correct properties', () => {
      const levels = distinctionManager.getAllBoundaryLevels();
      
      expect(levels).toHaveLength(5);
      expect(levels[0].level).toBe(1);
      expect(levels[0].name).toBe('Category Boundaries');
      expect(levels[4].level).toBe(5);
      expect(levels[4].name).toBe('Near Miss Boundaries');
      
      // Check that all levels have the required properties
      levels.forEach(level => {
        expect(level).toHaveProperty('level');
        expect(level).toHaveProperty('name');
        expect(level).toHaveProperty('description');
      });
    });
    
    it('should return a deep copy that cannot modify the original', () => {
      const levels = distinctionManager.getAllBoundaryLevels();
      const originalDescription = levels[0].description;
      
      // Try to modify the returned object
      levels[0].description = 'Modified description';
      
      // Get the levels again and verify original was not modified
      const newLevels = distinctionManager.getAllBoundaryLevels();
      expect(newLevels[0].description).toBe(originalDescription);
    });
  });

  describe('getBoundaryLevelDescription', () => {
    it('should return the correct boundary level description for valid levels', () => {
      const level1 = distinctionManager.getBoundaryLevelDescription(1);
      expect(level1.name).toBe('Category Boundaries');
      
      const level3 = distinctionManager.getBoundaryLevelDescription(3);
      expect(level3.name).toBe('Operation Boundaries');
      
      const level5 = distinctionManager.getBoundaryLevelDescription(5);
      expect(level5.name).toBe('Near Miss Boundaries');
    });
    
    it('should throw an error for invalid levels', () => {
      expect(() => distinctionManager.getBoundaryLevelDescription(0)).toThrow(DistinctionManagerError);
      expect(() => distinctionManager.getBoundaryLevelDescription(6)).toThrow(DistinctionManagerError);
      expect(() => distinctionManager.getBoundaryLevelDescription(2.5)).toThrow(DistinctionManagerError);
    });
    
    it('should return the correct error code for invalid levels', () => {
      try {
        distinctionManager.getBoundaryLevelDescription(0);
        throw new Error('Expected error was not thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(DistinctionManagerError);
        expect((error as DistinctionManagerError).code).toBe(DistinctionManagerErrorCode.INVALID_LEVEL);
      }
    });
  });

  describe('initializeUserFactMastery', () => {
    it('should initialize mastery data with default level 1', () => {
      const result = distinctionManager.initializeUserFactMastery('user123', 'mult-7-8');
      expect(result).toBe(true);
      
      const mastery = distinctionManager.getUserFactMastery('user123', 'mult-7-8');
      expect(mastery.currentLevel).toBe(1);
      expect(mastery.masteryScore).toBe(0.5);
      expect(mastery.consecutiveCorrect).toBe(0);
    });
    
    it('should initialize mastery data with specified level', () => {
      const result = distinctionManager.initializeUserFactMastery('user123', 'mult-7-8', 3);
      expect(result).toBe(true);
      
      const mastery = distinctionManager.getUserFactMastery('user123', 'mult-7-8');
      expect(mastery.currentLevel).toBe(3);
    });
    
    it('should throw an error for invalid users', () => {
      expect(() => distinctionManager.initializeUserFactMastery('', 'mult-7-8')).toThrow(DistinctionManagerError);
      expect(() => distinctionManager.initializeUserFactMastery('', 'mult-7-8')).toThrow(DistinctionManagerErrorCode.USER_NOT_FOUND);
    });
    
    it('should throw an error for invalid facts', () => {
      expect(() => distinctionManager.initializeUserFactMastery('user123', 'invalid-fact')).toThrow(DistinctionManagerError);
      expect(() => distinctionManager.initializeUserFactMastery('user123', 'invalid-fact')).toThrow(DistinctionManagerErrorCode.FACT_NOT_FOUND);
    });
    
    it('should throw an error for invalid initial levels', () => {
      expect(() => distinctionManager.initializeUserFactMastery('user123', 'mult-7-8', 0)).toThrow(DistinctionManagerError);
      expect(() => distinctionManager.initializeUserFactMastery('user123', 'mult-7-8', 6)).toThrow(DistinctionManagerError);
      expect(() => distinctionManager.initializeUserFactMastery('user123', 'mult-7-8', 2.5)).toThrow(DistinctionManagerError);
    });
    
    it('should throw an error if already initialized', () => {
      distinctionManager.initializeUserFactMastery('user123', 'mult-7-8');
      expect(() => distinctionManager.initializeUserFactMastery('user123', 'mult-7-8')).toThrow(DistinctionManagerError);
      expect(() => distinctionManager.initializeUserFactMastery('user123', 'mult-7-8')).toThrow(DistinctionManagerErrorCode.ALREADY_INITIALIZED);
    });
  });

  describe('getCurrentBoundaryLevel', () => {
    beforeEach(() => {
      distinctionManager.initializeUserFactMastery('user123', 'mult-7-8', 3);
    });
    
    it('should return the current boundary level for a user and fact', () => {
      const level = distinctionManager.getCurrentBoundaryLevel('user123', 'mult-7-8');
      expect(level).toBe(3);
    });
    
    it('should throw an error for non-existent mastery data', () => {
      expect(() => distinctionManager.getCurrentBoundaryLevel('user123', 'add-1-1')).toThrow(DistinctionManagerError);
      expect(() => distinctionManager.getCurrentBoundaryLevel('user123', 'add-1-1')).toThrow(DistinctionManagerErrorCode.NO_MASTERY_DATA);
    });
  });

  describe('getUserFactMastery', () => {
    beforeEach(() => {
      distinctionManager.initializeUserFactMastery('user123', 'mult-7-8', 3);
    });
    
    it('should return the mastery data for a user and fact', () => {
      const mastery = distinctionManager.getUserFactMastery('user123', 'mult-7-8');
      
      expect(mastery.userId).toBe('user123');
      expect(mastery.factId).toBe('mult-7-8');
      expect(mastery.currentLevel).toBe(3);
      expect(mastery.masteryScore).toBe(0.5);
      expect(mastery.consecutiveCorrect).toBe(0);
    });
    
    it('should return a copy that cannot modify the original data', () => {
      const mastery = distinctionManager.getUserFactMastery('user123', 'mult-7-8');
      mastery.currentLevel = 5;
      
      const newMastery = distinctionManager.getUserFactMastery('user123', 'mult-7-8');
      expect(newMastery.currentLevel).toBe(3); // Original should be unchanged
    });
    
    it('should throw an error for non-existent mastery data', () => {
      expect(() => distinctionManager.getUserFactMastery('user123', 'add-1-1')).toThrow(DistinctionManagerError);
      expect(() => distinctionManager.getUserFactMastery('user123', 'add-1-1')).toThrow(DistinctionManagerErrorCode.NO_MASTERY_DATA);
    });
  });

  describe('updateBoundaryLevel', () => {
    beforeEach(() => {
      distinctionManager.initializeUserFactMastery('user123', 'mult-7-8', 3);
    });
    
    it('should increase mastery score for correct answers', () => {
      const performance: PerformanceData = {
        correctFirstAttempt: true,
        responseTime: 2000
      };
      
      const result = distinctionManager.updateBoundaryLevel('user123', 'mult-7-8', performance);
      
      expect(result.masteryScore).toBeGreaterThan(0.5);
      expect(result.levelChanged).toBe(false);
    });
    
    it('should decrease mastery score for incorrect answers', () => {
      const performance: PerformanceData = {
        correctFirstAttempt: false,
        responseTime: 2000
      };
      
      const result = distinctionManager.updateBoundaryLevel('user123', 'mult-7-8', performance);
      
      expect(result.masteryScore).toBeLessThan(0.5);
      expect(result.levelChanged).toBe(false);
    });
    
    it('should increase the boundary level after sufficient mastery', () => {
      // Setup excellent performance
      const performance: PerformanceData = {
        correctFirstAttempt: true,
        responseTime: 1000,
        consecutiveCorrect: 3
      };
      
      // Use multiple updates to reach the promotion threshold
      distinctionManager.updateBoundaryLevel('user123', 'mult-7-8', performance);
      distinctionManager.updateBoundaryLevel('user123', 'mult-7-8', performance);
      distinctionManager.updateBoundaryLevel('user123', 'mult-7-8', performance);
      const result = distinctionManager.updateBoundaryLevel('user123', 'mult-7-8', performance);
      
      expect(result.previousLevel).toBe(3);
      expect(result.newLevel).toBe(4);
      expect(result.levelChanged).toBe(true);
    });
    
    it('should decrease the boundary level after poor performance', () => {
      // First, increase the mastery score a bit so we have room to drop
      distinctionManager.updateBoundaryLevel('user123', 'mult-7-8', {
        correctFirstAttempt: true,
        responseTime: 2000
      });
      
      // Now perform poorly multiple times
      const poorPerformance: PerformanceData = {
        correctFirstAttempt: false,
        responseTime: 5000
      };
      
      // Use multiple updates to reach the demotion threshold
      distinctionManager.updateBoundaryLevel('user123', 'mult-7-8', poorPerformance);
      distinctionManager.updateBoundaryLevel('user123', 'mult-7-8', poorPerformance);
      const result = distinctionManager.updateBoundaryLevel('user123', 'mult-7-8', poorPerformance);
      
      expect(result.previousLevel).toBe(3);
      expect(result.newLevel).toBe(2);
      expect(result.levelChanged).toBe(true);
    });
    
    it('should update consecutive correct answers', () => {
      // Correct answer
      let result = distinctionManager.updateBoundaryLevel('user123', 'mult-7-8', {
        correctFirstAttempt: true,
        responseTime: 2000
      });
      
      const mastery1 = distinctionManager.getUserFactMastery('user123', 'mult-7-8');
      expect(mastery1.consecutiveCorrect).toBe(1);
      
      // Another correct answer
      result = distinctionManager.updateBoundaryLevel('user123', 'mult-7-8', {
        correctFirstAttempt: true,
        responseTime: 2000
      });
      
      const mastery2 = distinctionManager.getUserFactMastery('user123', 'mult-7-8');
      expect(mastery2.consecutiveCorrect).toBe(2);
      
      // Incorrect answer resets consecutive correct count
      result = distinctionManager.updateBoundaryLevel('user123', 'mult-7-8', {
        correctFirstAttempt: false,
        responseTime: 2000
      });
      
      const mastery3 = distinctionManager.getUserFactMastery('user123', 'mult-7-8');
      expect(mastery3.consecutiveCorrect).toBe(0);
    });
    
    it('should throw an error for invalid performance data', () => {
      // Missing correctFirstAttempt
      expect(() => distinctionManager.updateBoundaryLevel('user123', 'mult-7-8', {
        responseTime: 2000
      } as any)).toThrow(DistinctionManagerError);
      
      // Invalid responseTime
      expect(() => distinctionManager.updateBoundaryLevel('user123', 'mult-7-8', {
        correctFirstAttempt: true,
        responseTime: -100
      })).toThrow(DistinctionManagerError);
      
      // Invalid consecutiveCorrect
      expect(() => distinctionManager.updateBoundaryLevel('user123', 'mult-7-8', {
        correctFirstAttempt: true,
        responseTime: 2000,
        consecutiveCorrect: -1
      })).toThrow(DistinctionManagerError);
    });
    
    it('should provide a time bonus for faster responses', () => {
      // Fast response
      const fastResult = distinctionManager.updateBoundaryLevel('user123', 'mult-7-8', {
        correctFirstAttempt: true,
        responseTime: 1000  // Very fast response
      });
      
      // Reset
      distinctionManager.initializeUserFactMastery('user456', 'mult-7-8', 3);
      
      // Slow response
      const slowResult = distinctionManager.updateBoundaryLevel('user456', 'mult-7-8', {
        correctFirstAttempt: true,
        responseTime: 2900  // Slower but still correct response
      });
      
      // Fast response should give higher mastery score increase
      expect(fastResult.masteryScore).toBeGreaterThan(slowResult.masteryScore);
    });
    
    it('should not let mastery score go below 0 or above 1', () => {
      // Push score down with multiple incorrect answers
      for (let i = 0; i < 10; i++) {
        distinctionManager.updateBoundaryLevel('user123', 'mult-7-8', {
          correctFirstAttempt: false,
          responseTime: 2000
        });
      }
      
      const lowMastery = distinctionManager.getUserFactMastery('user123', 'mult-7-8');
      expect(lowMastery.masteryScore).toBeGreaterThanOrEqual(0);
      
      // Reset and initialize new user
      distinctionManager.initializeUserFactMastery('user789', 'mult-7-8', 3);
      
      // Push score up with multiple correct answers
      for (let i = 0; i < 10; i++) {
        distinctionManager.updateBoundaryLevel('user789', 'mult-7-8', {
          correctFirstAttempt: true,
          responseTime: 1000
        });
      }
      
      const highMastery = distinctionManager.getUserFactMastery('user789', 'mult-7-8');
      expect(highMastery.masteryScore).toBeLessThanOrEqual(1);
    });
    
    it('should not promote beyond level 5', () => {
      // Initialize at level 5
      distinctionManager.initializeUserFactMastery('user999', 'mult-7-8', 5);
      
      // Try to promote with excellent performance
      for (let i = 0; i < 5; i++) {
        distinctionManager.updateBoundaryLevel('user999', 'mult-7-8', {
          correctFirstAttempt: true,
          responseTime: 1000,
          consecutiveCorrect: 5
        });
      }
      
      const mastery = distinctionManager.getUserFactMastery('user999', 'mult-7-8');
      expect(mastery.currentLevel).toBe(5); // Should stay at level 5
    });
    
    it('should not demote below level 1', () => {
      // Initialize at level 1
      distinctionManager.initializeUserFactMastery('user111', 'mult-7-8', 1);
      
      // Try to demote with poor performance
      for (let i = 0; i < 5; i++) {
        distinctionManager.updateBoundaryLevel('user111', 'mult-7-8', {
          correctFirstAttempt: false,
          responseTime: 5000
        });
      }
      
      const mastery = distinctionManager.getUserFactMastery('user111', 'mult-7-8');
      expect(mastery.currentLevel).toBe(1); // Should stay at level 1
    });
  });
  
  describe('Performance with large datasets', () => {
    it('should handle initializing many facts for a user', () => {
      const facts = [
        'add-1-1', 'add-2-2', 'add-3-3',
        'sub-5-2', 'sub-8-3', 'sub-9-4',
        'mult-7-8', 'mult-6-6', 'mult-9-9',
        'div-10-2', 'div-12-3', 'div-15-5'
      ];
      
      // Initialize all facts
      facts.forEach(factId => {
        const result = distinctionManager.initializeUserFactMastery('user123', factId);
        expect(result).toBe(true);
      });
      
      // Verify all initializations worked
      facts.forEach(factId => {
        const level = distinctionManager.getCurrentBoundaryLevel('user123', factId);
        expect(level).toBe(1);
      });
    });
    
    it('should handle updating many facts for a user efficiently', () => {
      const facts = [
        'add-1-1', 'add-2-2', 'add-3-3',
        'sub-5-2', 'sub-8-3', 'sub-9-4',
        'mult-7-8', 'mult-6-6', 'mult-9-9',
        'div-10-2', 'div-12-3', 'div-15-5'
      ];
      
      // Initialize all facts
      facts.forEach(factId => {
        distinctionManager.initializeUserFactMastery('user123', factId);
      });
      
      // Update all facts with varied performance
      facts.forEach((factId, index) => {
        const isCorrect = index % 2 === 0;
        const result = distinctionManager.updateBoundaryLevel('user123', factId, {
          correctFirstAttempt: isCorrect,
          responseTime: 2000 + index * 100
        });
        
        // Verify update worked correctly
        if (isCorrect) {
          expect(result.masteryScore).toBeGreaterThan(0.5);
        } else {
          expect(result.masteryScore).toBeLessThan(0.5);
        }
      });
    });
  });
  
  describe('Edge cases', () => {
    it('should handle updates immediately after initialization', () => {
      // Initialize and immediately update
      distinctionManager.initializeUserFactMastery('user123', 'add-1-1');
      
      const result = distinctionManager.updateBoundaryLevel('user123', 'add-1-1', {
        correctFirstAttempt: true,
        responseTime: 1500
      });
      
      expect(result.previousLevel).toBe(1);
      expect(result.newLevel).toBe(1);
      expect(result.masteryScore).toBeGreaterThan(0.5);
    });
  });
});