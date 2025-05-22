/**
 * Test suite for the DistractorGenerator component
 * 
 * This file contains test cases to verify that the DistractorGenerator
 * correctly generates distractors for each boundary level and handles
 * various edge cases appropriately.
 */

import { 
  DistractorGenerator, 
  DistractorRequest,
  InvalidFactError,
  InvalidBoundaryLevelError,
  GenerationFailedError
} from './DistractorGenerator';

describe('DistractorGenerator', () => {
  let distractorGenerator: DistractorGenerator;

  beforeEach(() => {
    distractorGenerator = new DistractorGenerator();
  });

  describe('generateDistractor', () => {
    // Test cases for boundary level 1 (Category)
    test('should generate a category boundary distractor (level 1)', () => {
      const request: DistractorRequest = {
        factId: 'mult-7-8',
        boundaryLevel: 1,
        correctAnswer: '56'
      };

      const distractor = distractorGenerator.generateDistractor(request);

      expect(distractor).toBeDefined();
      expect(distractor.boundaryLevel).toBe(1);
      expect(distractor.value).toBeDefined();
      expect(distractor.explanation).toBeDefined();
      expect(distractor.difficulty).toBeCloseTo(0.2, 1);
      expect(isNaN(Number(distractor.value))).toBe(true); // Should be non-numerical
    });

    // Test cases for boundary level 2 (Magnitude)
    test('should generate a magnitude boundary distractor (level 2)', () => {
      const request: DistractorRequest = {
        factId: 'mult-7-8',
        boundaryLevel: 2,
        correctAnswer: '56'
      };

      const distractor = distractorGenerator.generateDistractor(request);

      expect(distractor).toBeDefined();
      expect(distractor.boundaryLevel).toBe(2);
      expect(distractor.value).toBeDefined();
      expect(distractor.explanation).toBeDefined();
      expect(distractor.difficulty).toBeCloseTo(0.4, 1);
      
      // Should be numerical with significantly different magnitude
      const distractorValue = Number(distractor.value);
      expect(isNaN(distractorValue)).toBe(false);
      
      // Should be either much larger or much smaller than the correct answer
      const ratio = distractorValue / 56;
      expect(ratio < 0.5 || ratio > 2).toBe(true);
    });

    // Test cases for boundary level 3 (Operation)
    test('should generate an operation boundary distractor (level 3)', () => {
      const request: DistractorRequest = {
        factId: 'mult-7-8',
        boundaryLevel: 3,
        correctAnswer: '56'
      };

      const distractor = distractorGenerator.generateDistractor(request);

      expect(distractor).toBeDefined();
      expect(distractor.boundaryLevel).toBe(3);
      expect(distractor.value).toBeDefined();
      expect(distractor.explanation).toBeDefined();
      expect(distractor.difficulty).toBeCloseTo(0.6, 1);
      
      // Should represent a different operation
      expect(distractor.value).toMatch(/^7\s*[+\-÷]\s*8\s*=\s*\d+/);
      
      // Should not contain the multiplication symbol (×)
      expect(distractor.value).not.toContain('×');
    });

    // Test cases for boundary level 4 (Related Fact)
    test('should generate a related fact boundary distractor (level 4)', () => {
      const request: DistractorRequest = {
        factId: 'mult-7-8',
        boundaryLevel: 4,
        correctAnswer: '56'
      };

      const distractor = distractorGenerator.generateDistractor(request);

      expect(distractor).toBeDefined();
      expect(distractor.boundaryLevel).toBe(4);
      expect(distractor.value).toBeDefined();
      expect(distractor.explanation).toBeDefined();
      expect(distractor.difficulty).toBeCloseTo(0.8, 1);
      
      // Should represent a related fact (same operation, slightly different operands)
      const match = distractor.value.match(/^(\d+)\s*([×])\s*(\d+)\s*=\s*(\d+)/);
      expect(match).not.toBeNull();
      
      if (match) {
        const [, operand1, operation, operand2] = match;
        
        // Operands should be slightly different from 7 and 8
        const op1 = Number(operand1);
        const op2 = Number(operand2);
        
        // At least one operand should be different
        expect(op1 !== 7 || op2 !== 8).toBe(true);
        
        // Operands should not be too different
        expect(Math.abs(op1 - 7) <= 3).toBe(true);
        expect(Math.abs(op2 - 8) <= 3).toBe(true);
        
        // Operation should still be multiplication
        expect(operation).toBe('×');
      }
    });

    // Test cases for boundary level 5 (Near Miss)
    test('should generate a near miss boundary distractor (level 5)', () => {
      const request: DistractorRequest = {
        factId: 'mult-7-8',
        boundaryLevel: 5,
        correctAnswer: '56'
      };

      const distractor = distractorGenerator.generateDistractor(request);

      expect(distractor).toBeDefined();
      expect(distractor.boundaryLevel).toBe(5);
      expect(distractor.value).toBeDefined();
      expect(distractor.explanation).toBeDefined();
      expect(distractor.difficulty).toBeCloseTo(0.9, 1);
      
      // Should be a near miss to the correct answer
      const distractorValue = Number(distractor.value);
      expect(isNaN(distractorValue)).toBe(false);
      
      // Should be close to the correct answer
      const difference = Math.abs(distractorValue - 56);
      expect(difference).toBeLessThanOrEqual(5);
      expect(difference).toBeGreaterThan(0); // Should not be the same as the correct answer
    });

    // Error handling test cases
    test('should throw INVALID_FACT error for invalid fact ID', () => {
      const request: DistractorRequest = {
        factId: 'invalid-fact-id',
        boundaryLevel: 1,
        correctAnswer: '56'
      };

      expect(() => distractorGenerator.generateDistractor(request)).toThrow(InvalidFactError);
    });

    test('should throw INVALID_BOUNDARY_LEVEL error for invalid boundary level', () => {
      const request: DistractorRequest = {
        factId: 'mult-7-8',
        boundaryLevel: 6, // Invalid boundary level (should be 1-5)
        correctAnswer: '56'
      };

      expect(() => distractorGenerator.generateDistractor(request)).toThrow(InvalidBoundaryLevelError);
    });

    test('should throw INVALID_FACT error when correct answer does not match the fact', () => {
      const request: DistractorRequest = {
        factId: 'mult-7-8',
        boundaryLevel: 5,
        correctAnswer: '57' // Incorrect answer for 7 × 8
      };

      expect(() => distractorGenerator.generateDistractor(request)).toThrow(InvalidFactError);
    });
  });

  describe('generateMultipleDistractors', () => {
    test('should generate multiple unique distractors', () => {
      const request: DistractorRequest = {
        factId: 'add-24-18',
        boundaryLevel: 3,
        correctAnswer: '42',
        count: 3
      };

      const distractors = distractorGenerator.generateMultipleDistractors(request);

      expect(distractors).toBeDefined();
      expect(distractors.length).toBe(3);
      
      // All distractors should be unique
      const values = distractors.map(d => d.value);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(3);
      
      // All distractors should be for boundary level 3
      expect(distractors.every(d => d.boundaryLevel === 3)).toBe(true);
      
      // All distractors should have explanations
      expect(distractors.every(d => d.explanation !== undefined)).toBe(true);
    });

    test('should throw error when requested count is less than 1', () => {
      const request: DistractorRequest = {
        factId: 'mult-7-8',
        boundaryLevel: 1,
        correctAnswer: '56',
        count: 0 // Invalid count
      };

      expect(() => distractorGenerator.generateMultipleDistractors(request)).toThrow();
    });
  });

  describe('getDistractorExplanation', () => {
    test('should provide explanation for category boundary distractor', () => {
      const explanation = distractorGenerator.getDistractorExplanation(
        'mult-7-8',
        'Fish',
        1
      );

      expect(explanation).toBeDefined();
      expect(explanation).toContain('non-numerical');
      expect(explanation).toContain('Fish');
      expect(explanation).toContain('56');
    });

    test('should provide explanation for magnitude boundary distractor', () => {
      const explanation = distractorGenerator.getDistractorExplanation(
        'mult-7-8',
        '560',
        2
      );

      expect(explanation).toBeDefined();
      expect(explanation).toContain('magnitude');
      expect(explanation).toContain('560');
      expect(explanation).toContain('56');
    });

    test('should provide explanation for operation boundary distractor', () => {
      const explanation = distractorGenerator.getDistractorExplanation(
        'mult-7-8',
        '7 + 8 = 15',
        3
      );

      expect(explanation).toBeDefined();
      expect(explanation).toContain('operation');
      expect(explanation).toContain('addition');
      expect(explanation).toContain('multiplication');
    });

    test('should provide explanation for related fact boundary distractor', () => {
      const explanation = distractorGenerator.getDistractorExplanation(
        'mult-7-8',
        '7 × 9 = 63',
        4
      );

      expect(explanation).toBeDefined();
      expect(explanation).toContain('related fact');
      expect(explanation).toContain('7 × 9 = 63');
      expect(explanation).toContain('changed');
    });

    test('should provide explanation for near miss boundary distractor', () => {
      const explanation = distractorGenerator.getDistractorExplanation(
        'mult-7-8',
        '54',
        5
      );

      expect(explanation).toBeDefined();
      expect(explanation).toContain('near miss');
      expect(explanation).toContain('54');
      expect(explanation).toContain('56');
      expect(explanation).toContain('2'); // Difference
    });
  });

  describe('validateDistractor', () => {
    test('should validate a correct category boundary distractor', () => {
      const result = distractorGenerator.validateDistractor(
        'mult-7-8',
        'Fish',
        1,
        '56'
      );

      expect(result.isValid).toBe(true);
    });

    test('should invalidate an incorrect category boundary distractor', () => {
      const result = distractorGenerator.validateDistractor(
        'mult-7-8',
        '42', // Numerical value, not appropriate for level 1
        1,
        '56'
      );

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('numerical');
    });

    test('should validate a correct magnitude boundary distractor', () => {
      const result = distractorGenerator.validateDistractor(
        'mult-7-8',
        '560', // 10x larger
        2,
        '56'
      );

      expect(result.isValid).toBe(true);
    });

    test('should invalidate an incorrect magnitude boundary distractor', () => {
      const result = distractorGenerator.validateDistractor(
        'mult-7-8',
        '58', // Too close to the correct answer
        2,
        '56'
      );

      expect(result.isValid).toBe(false);
    });

    test('should validate a correct operation boundary distractor', () => {
      const result = distractorGenerator.validateDistractor(
        'mult-7-8',
        '7 + 8 = 15',
        3,
        '56'
      );

      expect(result.isValid).toBe(true);
    });

    test('should invalidate an incorrect operation boundary distractor', () => {
      const result = distractorGenerator.validateDistractor(
        'mult-7-8',
        '7 × 8 = 56', // Same operation, not appropriate for level 3
        3,
        '56'
      );

      expect(result.isValid).toBe(false);
    });

    test('should validate a correct related fact boundary distractor', () => {
      const result = distractorGenerator.validateDistractor(
        'mult-7-8',
        '7 × 9 = 63',
        4,
        '56'
      );

      expect(result.isValid).toBe(true);
    });

    test('should invalidate an incorrect related fact boundary distractor', () => {
      const result = distractorGenerator.validateDistractor(
        'mult-7-8',
        '7 × 8 = 56', // Same fact, not a related fact
        4,
        '56'
      );

      expect(result.isValid).toBe(false);
    });

    test('should validate a correct near miss boundary distractor', () => {
      const result = distractorGenerator.validateDistractor(
        'mult-7-8',
        '54', // Off by 2
        5,
        '56'
      );

      expect(result.isValid).toBe(true);
    });

    test('should invalidate an incorrect near miss boundary distractor', () => {
      const result = distractorGenerator.validateDistractor(
        'mult-7-8',
        '156', // Too far from the correct answer
        5,
        '56'
      );

      expect(result.isValid).toBe(false);
    });
  });

  // Additional test cases for specific operations
  describe('different operations', () => {
    test('should handle addition facts correctly', () => {
      const request: DistractorRequest = {
        factId: 'add-24-18',
        boundaryLevel: 3,
        correctAnswer: '42'
      };

      const distractor = distractorGenerator.generateDistractor(request);
      expect(distractor).toBeDefined();
      expect(distractor.boundaryLevel).toBe(3);
      
      // Should represent a different operation than addition
      expect(distractor.value).toMatch(/^24\s*[×\-÷]\s*18\s*=\s*\d+/);
      expect(distractor.value).not.toContain('+');
    });

    test('should handle subtraction facts correctly', () => {
      const request: DistractorRequest = {
        factId: 'sub-24-18',
        boundaryLevel: 3,
        correctAnswer: '6'
      };

      const distractor = distractorGenerator.generateDistractor(request);
      expect(distractor).toBeDefined();
      expect(distractor.boundaryLevel).toBe(3);
      
      // Should represent a different operation than subtraction
      expect(distractor.value).toMatch(/^24\s*[×+÷]\s*18\s*=\s*\d+/);
      expect(distractor.value).not.toContain('-');
    });

    test('should handle division facts correctly', () => {
      const request: DistractorRequest = {
        factId: 'div-56-8',
        boundaryLevel: 3,
        correctAnswer: '7'
      };

      const distractor = distractorGenerator.generateDistractor(request);
      expect(distractor).toBeDefined();
      expect(distractor.boundaryLevel).toBe(3);
      
      // Should represent a different operation than division
      expect(distractor.value).toMatch(/^56\s*[×+\-]\s*8\s*=\s*\d+/);
      expect(distractor.value).not.toContain('÷');
    });
  });

  // Edge cases
  describe('edge cases', () => {
    test('should handle single-digit operands correctly', () => {
      const request: DistractorRequest = {
        factId: 'add-2-3',
        boundaryLevel: 4,
        correctAnswer: '5'
      };

      const distractor = distractorGenerator.generateDistractor(request);
      expect(distractor).toBeDefined();
      expect(distractor.boundaryLevel).toBe(4);
      
      // Should be a related fact with slightly different operands
      const match = distractor.value.match(/^(\d+)\s*([+])\s*(\d+)\s*=\s*(\d+)/);
      expect(match).not.toBeNull();
    });

    test('should handle zero as an operand', () => {
      const request: DistractorRequest = {
        factId: 'add-0-5',
        boundaryLevel: 4,
        correctAnswer: '5'
      };

      const distractor = distractorGenerator.generateDistractor(request);
      expect(distractor).toBeDefined();
      expect(distractor.boundaryLevel).toBe(4);
    });
  });

  // Performance test
  describe('performance', () => {
    test('should generate distractors quickly (within 50ms)', () => {
      const request: DistractorRequest = {
        factId: 'mult-7-8',
        boundaryLevel: 5,
        correctAnswer: '56'
      };

      const startTime = Date.now();
      distractorGenerator.generateDistractor(request);
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(50); // Less than 50ms
    });

    test('should generate multiple distractors quickly (within 50ms)', () => {
      const request: DistractorRequest = {
        factId: 'mult-7-8',
        boundaryLevel: 3,
        correctAnswer: '56',
        count: 3
      };

      const startTime = Date.now();
      distractorGenerator.generateMultipleDistractors(request);
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(50); // Less than 50ms
    });
  });
});