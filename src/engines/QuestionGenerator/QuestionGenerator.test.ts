import { QuestionGenerator } from './QuestionGenerator';
import { QuestionRequest } from './interfaces/QuestionGeneratorInterface';

// Mock implementations for dependencies
const mockFactRepository = {
  getFactById: jest.fn(),
  getFactsByLearningPath: jest.fn(),
  getQuestionTemplates: jest.fn()
};

const mockDistinctionManager = {
  userExists: jest.fn(),
  getUserMasteryLevels: jest.fn(),
  getUserMasteryLevel: jest.fn(),
  getUserCompletedFacts: jest.fn(),
  getTimeSinceLastPractice: jest.fn()
};

const mockTripleHelixManager = {
  learningPathExists: jest.fn(),
  getUserActiveLearningPath: jest.fn()
};

const mockLogger = {
  debug: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn()
};

// Utility function to create mock facts
const createMockFact = (id: string, operand1: number, operand2: number, operation: string) => {
  const operations = {
    'addition': (a: number, b: number) => a + b,
    'subtraction': (a: number, b: number) => a - b,
    'multiplication': (a: number, b: number) => a * b,
    'division': (a: number, b: number) => a / b
  };
  
  const result = operations[operation](operand1, operand2);
  
  return {
    id,
    operand1,
    operand2,
    operation,
    result,
    difficulty: 0.5,
    tags: [operation, 'single-digit']
  };
};

describe('QuestionGenerator', () => {
  let questionGenerator: QuestionGenerator;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create a new QuestionGenerator instance with mock dependencies
    questionGenerator = new QuestionGenerator(
      mockFactRepository as any,
      mockDistinctionManager as any,
      mockTripleHelixManager as any,
      mockLogger as any
    );
    
    // Set up default mock behavior
    mockFactRepository.getFactById.mockImplementation((factId: string) => {
      // Parse fact ID to get components (e.g., "mult-7-8" -> multiplication, 7, 8)
      const parts = factId.split('-');
      const operation = parts[0] === 'mult' ? 'multiplication' : parts[0];
      const operand1 = parseInt(parts[1], 10);
      const operand2 = parseInt(parts[2], 10);
      
      return createMockFact(factId, operand1, operand2, operation);
    });
    
    mockFactRepository.getQuestionTemplates.mockImplementation((operation: string) => {
      return [`What is {{operand1}} ${operation === 'multiplication' ? '×' : operation} {{operand2}}?`];
    });
    
    mockDistinctionManager.userExists.mockReturnValue(true);
    mockTripleHelixManager.learningPathExists.mockReturnValue(true);
  });
  
  describe('generateQuestion', () => {
    it('should generate a question with the correct properties', () => {
      // Setup
      const userId = 'user123';
      const learningPathId = 'multiplication-basic';
      
      mockFactRepository.getFactsByLearningPath.mockReturnValue([
        createMockFact('mult-7-8', 7, 8, 'multiplication')
      ]);
      
      mockDistinctionManager.getUserMasteryLevel.mockReturnValue(4);
      mockDistinctionManager.getTimeSinceLastPractice.mockReturnValue(86400000); // 1 day
      
      // Execute
      const request: QuestionRequest = {
        userId,
        learningPathId
      };
      
      const question = questionGenerator.generateQuestion(request);
      
      // Verify
      expect(question).toBeDefined();
      expect(question.factId).toBe('mult-7-8');
      expect(question.text).toBe('What is 7 × 8?');
      expect(question.correctAnswer).toBe('56');
      expect(question.boundaryLevel).toBe(4);
      expect(question.learningPathId).toBe('multiplication-basic');
      expect(question.operation).toBe('multiplication');
    });
    
    it('should throw USER_NOT_FOUND error when user does not exist', () => {
      // Setup
      mockDistinctionManager.userExists.mockReturnValue(false);
      
      // Execute & Verify
      expect(() => {
        questionGenerator.generateQuestion({
          userId: 'nonexistent',
          learningPathId: 'multiplication-basic'
        });
      }).toThrow('USER_NOT_FOUND');
    });
    
    it('should throw LEARNING_PATH_NOT_FOUND error when learning path does not exist', () => {
      // Setup
      mockTripleHelixManager.learningPathExists.mockReturnValue(false);
      
      // Execute & Verify
      expect(() => {
        questionGenerator.generateQuestion({
          userId: 'user123',
          learningPathId: 'nonexistent'
        });
      }).toThrow('LEARNING_PATH_NOT_FOUND');
    });
    
    it('should throw NO_APPROPRIATE_QUESTIONS error when no eligible facts are found', () => {
      // Setup
      mockFactRepository.getFactsByLearningPath.mockReturnValue([]);
      
      // Execute & Verify
      expect(() => {
        questionGenerator.generateQuestion({
          userId: 'user123',
          learningPathId: 'multiplication-basic'
        });
      }).toThrow('NO_APPROPRIATE_QUESTIONS');
    });
    
    it('should respect preferred operations when generating questions', () => {
      // Setup
      mockDistinctionManager.getUserMasteryLevels.mockReturnValue({
        'mult-7-8': 3,
        'add-5-6': 2
      });
      
      mockTripleHelixManager.getUserActiveLearningPath.mockReturnValue('skill-development');
      
      mockFactRepository.getFactsByLearningPath.mockReturnValue([
        createMockFact('mult-7-8', 7, 8, 'multiplication'),
        createMockFact('add-5-6', 5, 6, 'addition')
      ]);
      
      mockDistinctionManager.getUserMasteryLevel.mockReturnValue(3);
      mockDistinctionManager.getTimeSinceLastPractice.mockReturnValue(86400000); // 1 day
      
      // Execute
      const question = questionGenerator.generateQuestion({
        userId: 'user123',
        learningPathId: 'mixed-operations',
        preferredOperations: ['multiplication']
      });
      
      // Verify
      expect(question.factId).toBe('mult-7-8');
      expect(question.operation).toBe('multiplication');
    });
    
    it('should respect excluded facts when generating questions', () => {
      // Setup
      mockDistinctionManager.getUserMasteryLevels.mockReturnValue({
        'mult-7-8': 3,
        'mult-6-9': 2
      });
      
      mockTripleHelixManager.getUserActiveLearningPath.mockReturnValue('skill-development');
      
      mockFactRepository.getFactsByLearningPath.mockReturnValue([
        createMockFact('mult-7-8', 7, 8, 'multiplication'),
        createMockFact('mult-6-9', 6, 9, 'multiplication')
      ]);
      
      mockDistinctionManager.getUserMasteryLevel.mockReturnValue(2);
      mockDistinctionManager.getTimeSinceLastPractice.mockReturnValue(86400000); // 1 day
      
      // Execute
      const question = questionGenerator.generateQuestion({
        userId: 'user123',
        learningPathId: 'multiplication-basic',
        excludeFactIds: ['mult-7-8']
      });
      
      // Verify
      expect(question.factId).toBe('mult-6-9');
    });
    
    it('should respect maximum difficulty when generating questions', () => {
      // Setup
      mockDistinctionManager.getUserMasteryLevels.mockReturnValue({
        'mult-7-8': 3,
        'mult-2-3': 2
      });
      
      mockTripleHelixManager.getUserActiveLearningPath.mockReturnValue('skill-development');
      
      const hardFact = createMockFact('mult-7-8', 7, 8, 'multiplication');
      hardFact.difficulty = 0.8;
      
      const easyFact = createMockFact('mult-2-3', 2, 3, 'multiplication');
      easyFact.difficulty = 0.3;
      
      mockFactRepository.getFactsByLearningPath.mockReturnValue([hardFact, easyFact]);
      
      mockDistinctionManager.getUserMasteryLevel.mockReturnValue(2);
      mockDistinctionManager.getTimeSinceLastPractice.mockReturnValue(86400000); // 1 day
      
      // Execute
      const question = questionGenerator.generateQuestion({
        userId: 'user123',
        learningPathId: 'multiplication-basic',
        maxDifficulty: 0.5
      });
      
      // Verify
      expect(question.factId).toBe('mult-2-3');
      expect(question.difficulty).toBeLessThanOrEqual(0.5);
    });
  });
  
  describe('generateMultipleQuestions', () => {
    it('should generate the requested number of questions', () => {
      // Setup
      mockDistinctionManager.getUserMasteryLevels.mockReturnValue({
        'mult-7-8': 3,
        'mult-6-9': 3,
        'mult-5-7': 3
      });
      
      mockTripleHelixManager.getUserActiveLearningPath.mockReturnValue('skill-development');
      
      mockFactRepository.getFactsByLearningPath.mockReturnValue([
        createMockFact('mult-7-8', 7, 8, 'multiplication'),
        createMockFact('mult-6-9', 6, 9, 'multiplication'),
        createMockFact('mult-5-7', 5, 7, 'multiplication')
      ]);
      
      mockDistinctionManager.getUserMasteryLevel.mockReturnValue(3);
      mockDistinctionManager.getTimeSinceLastPractice.mockReturnValue(86400000); // 1 day
      
      // Execute
      const questions = questionGenerator.generateMultipleQuestions({
        userId: 'user123',
        learningPathId: 'multiplication-basic',
        count: 3
      });
      
      // Verify
      expect(questions.length).toBe(3);
      expect(questions[0].factId).not.toBe(questions[1].factId); // Should be different questions
      expect(questions[1].factId).not.toBe(questions[2].factId);
      expect(questions[0].factId).not.toBe(questions[2].factId);
    });
    
    it('should not repeat facts within the generated set', () => {
      // Setup
      mockDistinctionManager.getUserMasteryLevels.mockReturnValue({
        'mult-7-8': 3,
        'mult-6-9': 3,
        'mult-5-7': 3
      });
      
      mockTripleHelixManager.getUserActiveLearningPath.mockReturnValue('skill-development');
      
      mockFactRepository.getFactsByLearningPath.mockReturnValue([
        createMockFact('mult-7-8', 7, 8, 'multiplication'),
        createMockFact('mult-6-9', 6, 9, 'multiplication'),
        createMockFact('mult-5-7', 5, 7, 'multiplication')
      ]);
      
      mockDistinctionManager.getUserMasteryLevel.mockReturnValue(3);
      mockDistinctionManager.getTimeSinceLastPractice.mockReturnValue(86400000); // 1 day
      
      // Execute
      const questions = questionGenerator.generateMultipleQuestions({
        userId: 'user123',
        learningPathId: 'multiplication-basic',
        count: 3
      });
      
      // Get unique fact IDs
      const factIds = new Set(questions.map(q => q.factId));
      
      // Verify
      expect(factIds.size).toBe(3); // All 3 questions should have different facts
    });
  });
  
  describe('getNextQuestion', () => {
    it('should return the next appropriate question for the user', () => {
      // Setup
      mockDistinctionManager.getUserMasteryLevels.mockReturnValue({
        'mult-7-8': 3
      });
      
      mockTripleHelixManager.getUserActiveLearningPath.mockReturnValue('skill-development');
      
      mockFactRepository.getFactsByLearningPath.mockReturnValue([
        createMockFact('mult-7-8', 7, 8, 'multiplication')
      ]);
      
      mockDistinctionManager.getUserMasteryLevel.mockReturnValue(3);
      mockDistinctionManager.getTimeSinceLastPractice.mockReturnValue(86400000); // 1 day
      
      // Execute
      const question = questionGenerator.getNextQuestion('user123', 'multiplication-basic');
      
      // Verify
      expect(question).toBeDefined();
      expect(question.factId).toBe('mult-7-8');
      expect(question.learningPathId).toBe('multiplication-basic');
    });
  });
  
  describe('getQuestionSetInfo', () => {
    it('should return correct question set information', () => {
      // Setup
      mockFactRepository.getFactsByLearningPath.mockReturnValue([
        createMockFact('mult-7-8', 7, 8, 'multiplication'),
        createMockFact('mult-6-9', 6, 9, 'multiplication'),
        createMockFact('mult-5-7', 5, 7, 'multiplication'),
        createMockFact('mult-2-3', 2, 3, 'multiplication')
      ]);
      
      mockDistinctionManager.getUserMasteryLevels.mockReturnValue({
        'mult-7-8': 5, // Mastered
        'mult-6-9': 3, // In progress
        'mult-5-7': 2, // In progress
        'mult-2-3': 0  // Not started
      });
      
      mockDistinctionManager.getUserCompletedFacts.mockReturnValue([
        'mult-7-8', 'mult-6-9', 'mult-5-7'
      ]);
      
      // Execute
      const info = questionGenerator.getQuestionSetInfo('user123', 'multiplication-basic');
      
      // Verify
      expect(info.totalQuestions).toBe(4);
      expect(info.completedQuestions).toBe(3);
      expect(info.masteredFacts).toBe(1);
      expect(info.inProgressFacts).toBe(2);
      expect(info.averageBoundaryLevel).toBe(2.5); // (5+3+2+0)/4 = 10/4 = 2.5
    });
    
    it('should throw USER_NOT_FOUND if user does not exist', () => {
      // Setup
      mockDistinctionManager.userExists.mockReturnValue(false);
      
      // Execute & Verify
      expect(() => {
        questionGenerator.getQuestionSetInfo('nonexistent', 'multiplication-basic');
      }).toThrow('USER_NOT_FOUND');
    });
    
    it('should throw LEARNING_PATH_NOT_FOUND if learning path does not exist', () => {
      // Setup
      mockTripleHelixManager.learningPathExists.mockReturnValue(false);
      
      // Execute & Verify
      expect(() => {
        questionGenerator.getQuestionSetInfo('user123', 'nonexistent');
      }).toThrow('LEARNING_PATH_NOT_FOUND');
    });
  });
  
  describe('formatQuestionText', () => {
    it('should correctly format the question text with fact values', () => {
      // Setup
      mockFactRepository.getFactById.mockReturnValue({
        id: 'mult-7-8',
        operand1: 7,
        operand2: 8,
        operation: 'multiplication',
        result: 56,
        difficulty: 0.7,
        tags: ['multiplication', 'single-digit']
      });
      
      // Execute
      const formattedText = questionGenerator.formatQuestionText(
        'mult-7-8',
        'What is {{operand1}} × {{operand2}}?'
      );
      
      // Verify
      expect(formattedText).toBe('What is 7 × 8?');
    });
    
    it('should support additional custom placeholders', () => {
      // Setup
      mockFactRepository.getFactById.mockReturnValue({
        id: 'mult-7-8',
        operand1: 7,
        operand2: 8,
        operation: 'multiplication',
        result: 56,
        difficulty: 0.7,
        tags: ['multiplication', 'single-digit'],
        customValue: 'test'
      });
      
      // Execute
      const formattedText = questionGenerator.formatQuestionText(
        'mult-7-8',
        'This is a {{customValue}} with {{operand1}} × {{operand2}} = {{result}}'
      );
      
      // Verify
      expect(formattedText).toBe('This is a test with 7 × 8 = 56');
    });
    
    it('should throw INVALID_FACT error if fact does not exist', () => {
      // Setup
      mockFactRepository.getFactById.mockReturnValue(null);
      
      // Execute & Verify
      expect(() => {
        questionGenerator.formatQuestionText('nonexistent', 'template');
      }).toThrow('INVALID_FACT');
    });
    
    it('should throw INVALID_TEMPLATE error if template is empty', () => {
      // Setup
      mockFactRepository.getFactById.mockReturnValue({
        id: 'mult-7-8',
        operand1: 7,
        operand2: 8,
        operation: 'multiplication',
        result: 56
      });
      
      // Execute & Verify
      expect(() => {
        questionGenerator.formatQuestionText('mult-7-8', '');
      }).toThrow('INVALID_TEMPLATE');
    });
  });
  
  describe('Triple Helix Learning Model Integration', () => {
    it('should select facts based on knowledge-acquisition path', () => {
      // Setup
      mockDistinctionManager.getUserMasteryLevels.mockReturnValue({
        'mult-7-8': 5, // Mastered
        'mult-6-9': 3, // In progress
        'mult-5-7': 1, // Just started
        'mult-2-3': 0  // Not started
      });
      
      mockTripleHelixManager.getUserActiveLearningPath.mockReturnValue('knowledge-acquisition');
      
      mockFactRepository.getFactsByLearningPath.mockReturnValue([
        createMockFact('mult-7-8', 7, 8, 'multiplication'),
        createMockFact('mult-6-9', 6, 9, 'multiplication'),
        createMockFact('mult-5-7', 5, 7, 'multiplication'),
        createMockFact('mult-2-3', 2, 3, 'multiplication')
      ]);
      
      mockDistinctionManager.getUserMasteryLevel.mockImplementation((userId, factId) => {
        const levels = {
          'mult-7-8': 5,
          'mult-6-9': 3,
          'mult-5-7': 1,
          'mult-2-3': 0
        };
        return levels[factId] || 0;
      });
      
      mockDistinctionManager.getTimeSinceLastPractice.mockReturnValue(86400000); // 1 day
      
      // Execute
      const question = questionGenerator.generateQuestion({
        userId: 'user123',
        learningPathId: 'multiplication-basic'
      });
      
      // Verify
      expect(['mult-5-7', 'mult-2-3'].includes(question.factId)).toBe(true);
      expect(question.boundaryLevel).toBeLessThanOrEqual(2); // Level 0-1 + potential challenge
    });
    
    it('should select facts based on skill-development path', () => {
      // Setup
      mockDistinctionManager.getUserMasteryLevels.mockReturnValue({
        'mult-7-8': 5, // Mastered
        'mult-6-9': 3, // In progress
        'mult-5-7': 2, // In progress
        'mult-2-3': 0  // Not started
      });
      
      mockTripleHelixManager.getUserActiveLearningPath.mockReturnValue('skill-development');
      
      mockFactRepository.getFactsByLearningPath.mockReturnValue([
        createMockFact('mult-7-8', 7, 8, 'multiplication'),
        createMockFact('mult-6-9', 6, 9, 'multiplication'),
        createMockFact('mult-5-7', 5, 7, 'multiplication'),
        createMockFact('mult-2-3', 2, 3, 'multiplication')
      ]);
      
      mockDistinctionManager.getUserMasteryLevel.mockImplementation((userId, factId) => {
        const levels = {
          'mult-7-8': 5,
          'mult-6-9': 3,
          'mult-5-7': 2,
          'mult-2-3': 0
        };
        return levels[factId] || 0;
      });
      
      mockDistinctionManager.getTimeSinceLastPractice.mockReturnValue(86400000); // 1 day
      
      // Execute
      const question = questionGenerator.generateQuestion({
        userId: 'user123',
        learningPathId: 'multiplication-basic'
      });
      
      // Verify
      expect(['mult-6-9', 'mult-5-7'].includes(question.factId)).toBe(true);
      expect(question.boundaryLevel).toBeGreaterThanOrEqual(2);
      expect(question.boundaryLevel).toBeLessThanOrEqual(4);
    });
    
    it('should select facts based on application path', () => {
      // Setup
      mockDistinctionManager.getUserMasteryLevels.mockReturnValue({
        'mult-7-8': 5, // Mastered
        'mult-6-9': 4, // Nearly mastered
        'mult-5-7': 3, // Mid-level
        'mult-2-3': 1  // Just started
      });
      
      mockTripleHelixManager.getUserActiveLearningPath.mockReturnValue('application');
      
      mockFactRepository.getFactsByLearningPath.mockReturnValue([
        createMockFact('mult-7-8', 7, 8, 'multiplication'),
        createMockFact('mult-6-9', 6, 9, 'multiplication'),
        createMockFact('mult-5-7', 5, 7, 'multiplication'),
        createMockFact('mult-2-3', 2, 3, 'multiplication')
      ]);
      
      mockDistinctionManager.getUserMasteryLevel.mockImplementation((userId, factId) => {
        const levels = {
          'mult-7-8': 5,
          'mult-6-9': 4,
          'mult-5-7': 3,
          'mult-2-3': 1
        };
        return levels[factId] || 0;
      });
      
      mockDistinctionManager.getTimeSinceLastPractice.mockReturnValue(86400000); // 1 day
      
      // Execute
      const question = questionGenerator.generateQuestion({
        userId: 'user123',
        learningPathId: 'multiplication-basic'
      });
      
      // Verify
      expect(['mult-7-8', 'mult-6-9', 'mult-5-7'].includes(question.factId)).toBe(true);
      expect(question.boundaryLevel).toBeGreaterThanOrEqual(3);
    });
  });
  
  describe('Performance Testing', () => {
    it('should generate questions within the 30ms performance requirement', () => {
      // Setup
      mockDistinctionManager.getUserMasteryLevels.mockReturnValue({
        'mult-7-8': 3
      });
      
      mockTripleHelixManager.getUserActiveLearningPath.mockReturnValue('skill-development');
      
      mockFactRepository.getFactsByLearningPath.mockReturnValue([
        createMockFact('mult-7-8', 7, 8, 'multiplication')
      ]);
      
      mockDistinctionManager.getUserMasteryLevel.mockReturnValue(3);
      mockDistinctionManager.getTimeSinceLastPractice.mockReturnValue(86400000); // 1 day
      
      // Execute
      const startTime = performance.now();
      questionGenerator.generateQuestion({
        userId: 'user123',
        learningPathId: 'multiplication-basic'
      });
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Verify
      expect(executionTime).toBeLessThan(30); // Should take less than 30ms
    });
  });
});