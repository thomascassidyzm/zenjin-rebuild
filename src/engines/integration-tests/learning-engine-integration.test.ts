/**
 * Integration tests for the LearningEngine components.
 * 
 * This file tests the interaction between the FactRepository, ContentManager,
 * DistinctionManager, DistractorGenerator, and QuestionGenerator components.
 */

import { FactRepository } from '../FactRepository';
import { ContentManager } from '../ContentManager';
import { DistinctionManager } from '../DistinctionManager';
import { DistractorGenerator } from '../DistractorGenerator';
import { QuestionGenerator } from '../QuestionGenerator';

describe('LearningEngine Integration Tests', () => {
  let factRepository: FactRepository;
  let contentManager: ContentManager;
  let distinctionManager: DistinctionManager;
  let distractorGenerator: DistractorGenerator;
  let questionGenerator: QuestionGenerator;

  beforeEach(() => {
    // Initialize components
    factRepository = new FactRepository();
    contentManager = new ContentManager(factRepository);
    distinctionManager = new DistinctionManager();
    distractorGenerator = new DistractorGenerator();
    questionGenerator = new QuestionGenerator();
  });

  test('Full question generation pipeline', async () => {
    // This test verifies that the components can work together
    // to generate appropriate questions with distractors
    
    // 1. Verify that the FactRepository contains facts
    const multiplicationFacts = factRepository.queryFacts({
      operation: 'multiplication',
      limit: 5
    });
    expect(multiplicationFacts.length).toBeGreaterThan(0);

    // 2. Retrieve a specific fact for testing
    const testFact = factRepository.getFactById('mult-7-8');
    expect(testFact).toBeDefined();
    expect(testFact.operation).toBe('multiplication');
    expect(testFact.operands).toEqual([7, 8]);
    expect(testFact.result).toBe(56);

    // 3. Use ContentManager to update the fact's difficulty
    const updatedFact = contentManager.updateFact('mult-7-8', {
      difficulty: 0.6
    });
    expect(updatedFact.difficulty).toBe(0.6);

    // 4. Generate distractors for the fact
    const distractors = distractorGenerator.generateDistractors(updatedFact, 3);
    expect(distractors.length).toBe(3);
    distractors.forEach(distractor => {
      expect(distractor).not.toBe(updatedFact.result);
    });

    // 5. Generate a question using the fact
    const question = questionGenerator.generateQuestion(updatedFact, distractors);
    expect(question.fact).toEqual(updatedFact);
    expect(question.distractors).toEqual(distractors);
    expect(question.correctAnswer).toBe(updatedFact.result);

    // 6. Check that the question difficulty matches the fact difficulty
    const difficultyLevel = distinctionManager.getDifficultyLevel(updatedFact.difficulty);
    expect(difficultyLevel).toBe(3); // Medium difficulty (0.4-0.6)

    // Complete integration test passed
  });
});