/**
 * Engine Orchestrator
 * Coordinates between different engines to provide a unified learning experience
 */

import { FactRepository } from './FactRepository/FactRepository';
import { QuestionGenerator } from './QuestionGenerator/QuestionGenerator';
import { Question as QuestionGeneratorQuestion } from '../interfaces/QuestionGeneratorInterface';
import { Question as PlayerCardQuestion } from '../interfaces/PlayerCardInterface';

// Simple mock implementations for engines we don't have yet
class MockDistinctionManager {
  getUserMasteryLevels(userId: string): Record<string, number> {
    return {}; // No mastery data yet - all facts are new
  }
  
  userExists(userId: string): boolean {
    return true; // All users exist for now
  }
  
  getUserMasteryLevel(userId: string, factId: string): number {
    return 0; // All facts start at level 0 (new)
  }
  
  getUserCompletedFacts(userId: string, learningPathId: string): any[] {
    return []; // No completed facts yet
  }
  
  getTimeSinceLastPractice(userId: string, factId: string): number {
    return Date.now(); // All facts are "new" - never practiced
  }
}

class MockTripleHelixManager {
  getUserActiveLearningPath(userId: string): string {
    return 'knowledge-acquisition'; // Default to knowledge acquisition path
  }
  
  learningPathExists(learningPathId: string): boolean {
    return ['addition', 'subtraction', 'multiplication', 'division'].includes(learningPathId);
  }
}

/**
 * Main orchestrator class that coordinates all engines
 */
export class EngineOrchestrator {
  private factRepository: FactRepository;
  private questionGenerator: QuestionGenerator;
  private distinctionManager: MockDistinctionManager;
  private tripleHelixManager: MockTripleHelixManager;
  
  constructor() {
    // Initialize engines
    this.factRepository = new FactRepository();
    this.distinctionManager = new MockDistinctionManager();
    this.tripleHelixManager = new MockTripleHelixManager();
    
    // Initialize question generator with dependencies
    this.questionGenerator = new QuestionGenerator(
      this.factRepository,
      this.distinctionManager,
      this.tripleHelixManager
    );
  }
  
  /**
   * Generate a question for a user and learning path
   */
  generateQuestion(userId: string = 'default-user', learningPathId: string = 'addition'): PlayerCardQuestion {
    try {
      const generatedQuestion = this.questionGenerator.generateQuestion({
        userId,
        learningPathId
      });
      return this.addDistractorToQuestion(generatedQuestion);
    } catch (error) {
      console.error('Failed to generate question:', error);
      // Fallback to a simple question
      return this.createFallbackQuestion(learningPathId);
    }
  }
  
  /**
   * Generate multiple questions
   */
  generateMultipleQuestions(count: number, userId: string = 'default-user', learningPathId: string = 'addition'): PlayerCardQuestion[] {
    try {
      const generatedQuestions = this.questionGenerator.generateMultipleQuestions({
        userId,
        learningPathId,
        count
      });
      return generatedQuestions.map(q => this.addDistractorToQuestion(q));
    } catch (error) {
      console.error('Failed to generate multiple questions:', error);
      // Fallback to generating questions one by one
      const questions: PlayerCardQuestion[] = [];
      for (let i = 0; i < count; i++) {
        questions.push(this.createFallbackQuestion(learningPathId));
      }
      return questions;
    }
  }
  
  /**
   * Get available learning paths
   */
  getAvailableLearningPaths(): string[] {
    return ['addition', 'subtraction', 'multiplication', 'division'];
  }
  
  /**
   * Get facts count for a learning path
   */
  getFactsCount(learningPathId: string): number {
    try {
      const facts = this.factRepository.getFactsByLearningPath(learningPathId);
      return facts.length;
    } catch (error) {
      console.error('Failed to get facts count:', error);
      return 0;
    }
  }
  
  /**
   * Converts a QuestionGenerator question to a PlayerCard question by adding a distractor
   */
  private addDistractorToQuestion(question: QuestionGeneratorQuestion): PlayerCardQuestion {
    const correctAnswer = parseInt(question.correctAnswer);
    const distractor = this.generateDistractor(correctAnswer, question.operation || 'addition');
    
    return {
      id: question.id,
      text: question.text,
      correctAnswer: question.correctAnswer,
      distractor: distractor.toString(),
      boundaryLevel: question.boundaryLevel || 1,
      factId: question.factId
    };
  }
  
  /**
   * Generates a plausible incorrect answer (distractor)
   */
  private generateDistractor(correctAnswer: number, operation: string): number {
    const strategies = [
      () => correctAnswer + 1, // Off by one
      () => correctAnswer - 1, // Off by one (other direction)
      () => correctAnswer + Math.floor(Math.random() * 5) + 1, // Random nearby higher
      () => Math.max(0, correctAnswer - Math.floor(Math.random() * 5) - 1), // Random nearby lower
    ];
    
    // Operation-specific strategies
    if (operation === 'multiplication') {
      strategies.push(() => correctAnswer + correctAnswer / 10); // Common multiplication error
      strategies.push(() => correctAnswer * 2); // Doubling error
    } else if (operation === 'addition') {
      strategies.push(() => correctAnswer - 2); // Subtraction instead of addition
      strategies.push(() => correctAnswer + 2); // Slightly too high
    }
    
    // Choose a random strategy
    const strategy = strategies[Math.floor(Math.random() * strategies.length)];
    let distractor = strategy();
    
    // Ensure distractor is positive and different from correct answer
    distractor = Math.max(0, distractor);
    if (distractor === correctAnswer) {
      distractor = correctAnswer + 1;
    }
    
    return distractor;
  }
  
  /**
   * Create a fallback question if generation fails
   */
  private createFallbackQuestion(learningPathId: string): PlayerCardQuestion {
    const fallbackQuestions: Record<string, PlayerCardQuestion> = {
      'addition': {
        id: 'fallback-add-1',
        factId: 'add-3-4',
        text: 'What is 3 + 4?',
        correctAnswer: '7',
        distractor: '8',
        boundaryLevel: 1
      },
      'subtraction': {
        id: 'fallback-sub-1',
        factId: 'sub-8-3',
        text: 'What is 8 - 3?',
        correctAnswer: '5',
        distractor: '6',
        boundaryLevel: 1
      },
      'multiplication': {
        id: 'fallback-mult-1',
        factId: 'mult-3-4',
        text: 'What is 3 × 4?',
        correctAnswer: '12',
        distractor: '14',
        boundaryLevel: 1
      },
      'division': {
        id: 'fallback-div-1',
        factId: 'div-12-3',
        text: 'What is 12 ÷ 3?',
        correctAnswer: '4',
        distractor: '3',
        boundaryLevel: 1
      }
    };
    
    return fallbackQuestions[learningPathId] || fallbackQuestions['addition'];
  }
}

// Create a singleton instance
export const engineOrchestrator = new EngineOrchestrator();