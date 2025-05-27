/**
 * Engine Orchestrator
 * Coordinates between different engines to provide a unified learning experience
 * 
 * Updated to use real LearningEngine integration instead of mock implementations
 */

import { LearningEngineService, learningEngineService } from '../services/LearningEngineService';
import { StitchManager, Stitch, SessionResults, PerformanceData, RepositionResult } from './StitchManager/StitchManager';
import { StitchLibrary } from './StitchLibrary';

// Learning path interface for Triple Helix system
interface LearningPath {
  id: string;
  name: string;
  description?: string;
  currentStitchId?: string;
  nextStitchId?: string;
  difficulty: number;
  status: string;
  metadata?: Record<string, any>;
}

// Import question types
import { Question as QuestionGeneratorQuestion } from '../interfaces/QuestionGeneratorInterface';
import { Question as PlayerCardQuestion } from '../interfaces/PlayerCardInterface';

// Simplified TripleHelixManager for tube assignment and rotation
class SimpleTripleHelixManager {
  private userStates: Map<string, { activePath: LearningPath; preparingPaths: LearningPath[]; rotationCount: number }> = new Map();
  
  // Three tubes: each learning path is assigned to a specific tube
  private tubeAssignments: Record<string, number> = {
    'addition': 1,
    'multiplication': 2, 
    'subtraction': 3,
    'division': 1 // Cycle back to tube 1
  };
  
  constructor() {
    // Initialize default user with three tubes
    this.initializeUser('default-user');
  }
  
  private initializeUser(userId: string) {
    const activePath: LearningPath = {
      id: 'addition',
      name: 'Addition',
      difficulty: 2,
      status: 'active',
      metadata: { tube: 1 }
    };
    
    const preparingPaths: LearningPath[] = [
      {
        id: 'multiplication',
        name: 'Multiplication', 
        difficulty: 2,
        status: 'preparing',
        metadata: { tube: 2 }
      },
      {
        id: 'subtraction',
        name: 'Subtraction',
        difficulty: 2, 
        status: 'preparing',
        metadata: { tube: 3 }
      }
    ];
    
    this.userStates.set(userId, {
      activePath,
      preparingPaths,
      rotationCount: 0
    });
  }
  
  getUserActiveLearningPath(userId: string): string {
    const state = this.userStates.get(userId);
    return state?.activePath.id || 'addition';
  }
  
  getActiveLearningPath(userId: string): LearningPath {
    const state = this.userStates.get(userId);
    return state?.activePath || { id: 'addition', name: 'Addition', difficulty: 2, status: 'active' };
  }
  
  learningPathExists(learningPathId: string): boolean {
    return ['addition', 'subtraction', 'multiplication', 'division'].includes(learningPathId);
  }
  
  rotateLearningPaths(userId: string) {
    const state = this.userStates.get(userId);
    if (!state) return null;
    
    // Move active path to end of preparing paths
    const newPreparingPaths = [...state.preparingPaths];
    const previousActivePath = { ...state.activePath };
    
    // Move current active to preparing
    previousActivePath.status = 'preparing';
    newPreparingPaths.push(previousActivePath);
    
    // Make first preparing path active
    const newActivePath = newPreparingPaths.shift()!;
    newActivePath.status = 'active';
    
    // Update preparing paths status
    newPreparingPaths.forEach(path => path.status = 'preparing');
    
    const newState = {
      activePath: newActivePath,
      preparingPaths: newPreparingPaths,
      rotationCount: state.rotationCount + 1
    };
    
    this.userStates.set(userId, newState);
    
    console.log(`Tube rotation ${state.rotationCount + 1}: ${previousActivePath.id} → ${newActivePath.id}`);
    
    return {
      previousActivePath: previousActivePath,
      newActivePath: newActivePath,
      rotationCount: newState.rotationCount
    };
  }
  
  getTubeForPath(learningPathId: string): number {
    return this.tubeAssignments[learningPathId] || 1;
  }
}

/**
 * Main orchestrator class that coordinates all engines
 * Updated to use LearningEngineService for proper integration
 */
export class EngineOrchestrator {
  private learningEngineService: LearningEngineService;
  private tripleHelixManager: SimpleTripleHelixManager;
  private stitchManager: StitchManager;
  private stitchLibrary: StitchLibrary;
  
  // Active learning sessions for each user
  private activeSessions: Map<string, string> = new Map();
  
  constructor() {
    // Use the singleton LearningEngineService
    this.learningEngineService = learningEngineService;
    this.tripleHelixManager = new SimpleTripleHelixManager();
    this.stitchManager = new StitchManager();
    
    // Initialize basic stitch management
    this.initializeLearningPaths();
  }
  
  /**
   * Generate a question for a user and learning path
   */
  async generateQuestion(userId: string = 'default-user', learningPathId: string = 'addition'): Promise<PlayerCardQuestion> {
    try {
      // Ensure user has an active learning session
      let sessionId = this.activeSessions.get(userId);
      
      if (!sessionId) {
        // Initialize new learning session
        const sessionData = await this.learningEngineService.initializeLearningSession(
          userId, 
          learningPathId
        );
        sessionId = sessionData.sessionId;
        this.activeSessions.set(userId, sessionId);
        
        // Return first question from initial questions
        if (sessionData.initialQuestions.length > 0) {
          return this.convertToPlayerCardQuestion(sessionData.initialQuestions[0]);
        }
      }
      
      // Generate new question using LearningEngine service
      const question = await this.learningEngineService.generateQuestion(sessionId, userId);
      return this.convertToPlayerCardQuestion(question);
      
    } catch (error) {
      console.error('Failed to generate question:', error);
      // Fallback to a simple question
      return this.createFallbackQuestion(learningPathId);
    }
  }
  
  /**
   * Generate multiple questions
   */
  async generateMultipleQuestions(count: number, userId: string = 'default-user', learningPathId: string = 'addition'): Promise<PlayerCardQuestion[]> {
    try {
      const questions: PlayerCardQuestion[] = [];
      
      for (let i = 0; i < count; i++) {
        try {
          const question = await this.generateQuestion(userId, learningPathId);
          questions.push(question);
        } catch (error) {
          console.warn(`Failed to generate question ${i + 1}/${count}:`, error);
          // Add fallback question
          questions.push(this.createFallbackQuestion(learningPathId));
        }
      }
      
      return questions;
    } catch (error) {
      console.error('Failed to generate multiple questions:', error);
      // Fallback to generating fallback questions
      const questions: PlayerCardQuestion[] = [];
      for (let i = 0; i < count; i++) {
        questions.push(this.createFallbackQuestion(learningPathId));
      }
      return questions;
    }
  }
  
  /**
   * Convert LearningEngine Question to PlayerCard Question format
   */
  private convertToPlayerCardQuestion(question: any): PlayerCardQuestion {
    return {
      id: question.id,
      factId: question.factId,
      text: question.questionText,
      correctAnswer: question.correctAnswer,
      distractor: question.distractors && question.distractors.length > 0 
        ? question.distractors[0] 
        : this.generateSimpleDistractor(question.correctAnswer),
      boundaryLevel: question.boundaryLevel || 1
    };
  }
  
  /**
   * Generate a simple distractor if none provided
   */
  private generateSimpleDistractor(correctAnswer: string): string {
    const num = parseInt(correctAnswer);
    if (!isNaN(num)) {
      // For numbers, add or subtract 1-3
      const adjustment = Math.floor(Math.random() * 3) + 1;
      const newNum = Math.random() > 0.5 ? num + adjustment : Math.max(0, num - adjustment);
      return newNum.toString();
    }
    return correctAnswer + '?'; // Fallback for non-numeric answers
  }
  
  /**
   * Process user response and update learning state
   */
  async processUserResponse(
    userId: string, 
    questionId: string, 
    selectedAnswer: string, 
    responseTime: number
  ): Promise<{ isCorrect: boolean; nextQuestion?: PlayerCardQuestion }> {
    try {
      const sessionId = this.activeSessions.get(userId);
      if (!sessionId) {
        throw new Error('No active session for user');
      }
      
      // Create response data
      const userResponse = {
        questionId,
        selectedAnswer,
        responseTime,
        isCorrect: false, // Will be determined by service
        timestamp: new Date().toISOString()
      };
      
      // Process response with LearningEngine service
      const result = await this.learningEngineService.processUserResponse(
        sessionId,
        questionId,
        userResponse
      );
      
      return {
        isCorrect: result.feedback.isCorrect,
        nextQuestion: result.nextQuestion ? this.convertToPlayerCardQuestion(result.nextQuestion) : undefined
      };
      
    } catch (error) {
      console.error('Failed to process user response:', error);
      return { isCorrect: false };
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
  
  /**
   * Initialize learning paths in the system
   */
  private initializeLearningPaths(): void {
    try {
      // Initialize learning paths
      const learningPaths = ['addition', 'multiplication', 'subtraction', 'division'];
      learningPaths.forEach(pathId => {
        this.stitchManager.initializeLearningPath(pathId);
      });
      
      console.log(`Initialized ${learningPaths.length} learning paths`);
    } catch (error) {
      console.error('Failed to initialize learning paths:', error);
    }
  }
  
  /**
   * Get the current stitch for a user (uses active learning path from Triple Helix)
   */
  getCurrentStitch(userId: string = 'default-user', learningPathId?: string): Stitch | null {
    try {
      // Use active learning path from Triple Helix if no specific path provided
      const activePathId = learningPathId || this.tripleHelixManager.getUserActiveLearningPath(userId);
      return this.stitchManager.getNextStitch(userId, activePathId);
    } catch (error) {
      console.error('Failed to get current stitch:', error);
      return null;
    }
  }
  
  /**
   * Generate questions for a specific stitch (always exactly 20 questions in URN random order)
   */
  generateQuestionsForStitch(stitch: Stitch, count: number = 20): PlayerCardQuestion[] {
    try {
      const questions: PlayerCardQuestion[] = [];
      const targetCount = 20; // Always exactly 20 questions per stitch
      
      // If the stitch doesn't have enough facts, we'll cycle through them to reach 20
      const availableFactIds = stitch.factIds;
      if (availableFactIds.length === 0) {
        console.warn(`Stitch ${stitch.id} has no facts`);
        return [];
      }
      
      // Generate exactly 20 questions, cycling through facts if necessary
      for (let i = 0; i < targetCount; i++) {
        const factId = availableFactIds[i % availableFactIds.length];
        
        try {
          const fact = this.factRepository.getFactById(factId);
          const questionTemplate = this.factRepository.getQuestionTemplates(fact.operation, stitch.difficulty);
          const template = questionTemplate[Math.floor(Math.random() * questionTemplate.length)] || 
                          `What is ${fact.operands[0]} ${this.getOperationSymbol(fact.operation)} ${fact.operands[1]}?`;
          
          // Format the question text
          let questionText = template;
          questionText = questionText.replace(/{{operand1}}/g, fact.operands[0].toString());
          questionText = questionText.replace(/{{operand2}}/g, fact.operands[1].toString());
          
          const correctAnswer = fact.result.toString();
          const distractor = this.generateDistractor(fact.result, fact.operation);
          
          questions.push({
            id: `${stitch.id}-${factId}-${i}-${Date.now()}-${Math.random()}`,
            text: questionText,
            correctAnswer,
            distractor: distractor.toString(),
            boundaryLevel: stitch.difficulty,
            factId: factId
          });
        } catch (error) {
          console.warn(`Failed to generate question for fact ${factId}:`, error);
          // Add a fallback question to maintain count
          questions.push(this.createFallbackQuestion(stitch.learningPathId));
        }
      }
      
      // URN random shuffle - each stitch presentation is in random order
      return this.urnShuffle(questions);
    } catch (error) {
      console.error('Failed to generate questions for stitch:', error);
      return [];
    }
  }
  
  /**
   * Complete a stitch and update progress
   */
  completeStitch(userId: string, stitchId: string, sessionResults: SessionResults): RepositionResult | null {
    try {
      // Update stitch progress
      this.stitchManager.updateStitchProgress(userId, stitchId, sessionResults);
      
      // Calculate performance data
      const performanceData: PerformanceData = {
        correctCount: sessionResults.correctCount,
        totalCount: sessionResults.totalCount,
        averageResponseTime: sessionResults.completionTime / sessionResults.totalCount
      };
      
      // Reposition the stitch based on performance
      const repositionResult = this.stitchManager.repositionStitch(userId, stitchId, performanceData);
      
      console.log(`Stitch ${stitchId} completed. Repositioned from ${repositionResult.previousPosition} to ${repositionResult.newPosition}`);
      
      return repositionResult;
    } catch (error) {
      console.error('Failed to complete stitch:', error);
      return null;
    }
  }
  
  /**
   * Get stitch progress for a user
   */
  getStitchProgress(userId: string, stitchId: string) {
    try {
      return this.stitchManager.getStitchProgress(userId, stitchId);
    } catch (error) {
      console.warn(`No progress data for stitch ${stitchId}:`, error);
      return null;
    }
  }
  
  /**
   * Get all stitches for a learning path
   */
  getStitchesForPath(learningPathId: string): Stitch[] {
    try {
      return this.stitchManager.getStitchesByLearningPath(learningPathId);
    } catch (error) {
      console.error('Failed to get stitches for path:', error);
      return [];
    }
  }

  /**
   * Get all stitch positions for backend synchronization
   */
  getAllStitchPositions(userId: string): Record<string, any> {
    try {
      // Get all learning paths and their stitch positions
      const positions: Record<string, any> = {};
      const learningPaths = ['addition', 'multiplication', 'subtraction', 'division'];
      
      learningPaths.forEach(pathId => {
        try {
          const stitches = this.stitchManager.getStitchesByLearningPath(pathId);
          positions[pathId] = {};
          
          stitches.forEach(stitch => {
            const progress = this.stitchManager.getStitchProgress(userId, stitch.id);
            if (progress) {
              positions[pathId][stitch.id] = {
                position: progress.spacedRepetitionPosition || 0,
                lastSeen: progress.lastSeen,
                masteryLevel: progress.masteryLevel,
                sessionCount: progress.sessionCount
              };
            }
          });
        } catch (error) {
          console.warn(`Failed to get positions for path ${pathId}:`, error);
        }
      });
      
      return positions;
    } catch (error) {
      console.error('Failed to get all stitch positions:', error);
      return {};
    }
  }

  /**
   * Get current triple helix state for backend synchronization
   */
  getTripleHelixState(userId: string): Record<string, any> {
    try {
      const state = this.tripleHelixManager.getHelixState(userId);
      return {
        activeTube: state.activeTube,
        tubeRotationCount: state.tubeRotationCount,
        lastRotationTime: state.lastRotationTime,
        learningPaths: state.learningPaths.map(path => ({
          id: path.id,
          name: path.name,
          isActive: path.isActive,
          completedStitches: path.completedStitches,
          totalStitches: path.totalStitches
        }))
      };
    } catch (error) {
      console.error('Failed to get triple helix state:', error);
      return {
        activeTube: 'addition',
        tubeRotationCount: 0,
        lastRotationTime: new Date().toISOString(),
        learningPaths: []
      };
    }
  }
  
  // Helper methods
  
  private getOperationSymbol(operation: string): string {
    const symbols: Record<string, string> = {
      'addition': '+',
      'subtraction': '-',
      'multiplication': '×',
      'division': '÷'
    };
    return symbols[operation] || operation;
  }
  
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  /**
   * URN random shuffle - each element appears exactly once in random order
   * This is the Fisher-Yates shuffle algorithm (same as shuffleArray but with explicit naming)
   */
  private urnShuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  
  /**
   * Get the active learning path for a user
   */
  getActiveLearningPath(userId: string = 'default-user'): LearningPath | null {
    try {
      return this.tripleHelixManager.getActiveLearningPath(userId);
    } catch (error) {
      console.error('Failed to get active learning path:', error);
      return null;
    }
  }
  
  /**
   * Rotate learning paths for a user
   */
  rotateTripleHelix(userId: string = 'default-user') {
    try {
      return this.tripleHelixManager.rotateLearningPaths(userId);
    } catch (error) {
      console.error('Failed to rotate learning paths:', error);
      return null;
    }
  }
}

// Create a singleton instance
export const engineOrchestrator = new EngineOrchestrator();