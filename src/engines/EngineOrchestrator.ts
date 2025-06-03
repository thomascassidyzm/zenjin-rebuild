/**
 * Engine Orchestrator
 * Coordinates between different engines to provide a unified learning experience
 * 
 * UPDATED: Tube-based architecture following APML Framework v1.4.2
 */

import { LearningEngineService } from '../services/LearningEngineService';

// Import updated tube-based interfaces
import { StitchManagerInterface, StitchId, TubeId } from '../interfaces/StitchManagerInterface';
import { TripleHelixManagerInterface, Tube, TripleHelixState, TubeStatus } from '../interfaces/TripleHelixManagerInterface';
import { QuestionGeneratorInterface, StitchContent, StitchContentRequest } from '../interfaces/QuestionGeneratorInterface';
import { Question as PlayerCardQuestion } from '../interfaces/PlayerCardInterface';

// Live Aid Architecture imports (optional enhancement)
import { LiveAidManager } from './LiveAidManager/LiveAidManager';
import { StitchCache } from './StitchCache/StitchCache';
import { StitchPreparation } from './StitchPreparation/StitchPreparation';
import { StitchPopulation } from './StitchPopulation/StitchPopulation';
import { FactRepository } from './FactRepository/FactRepository';
import { DistinctionManager } from './DistinctionManager/DistinctionManager';
import { DistractorGenerator } from './DistractorGenerator/DistractorGenerator';
import { QuestionGenerator } from './QuestionGenerator/QuestionGenerator';

// Temporary implementation until proper components are injected
class TempTripleHelixManager implements TripleHelixManagerInterface {
  private userStates: Map<string, TripleHelixState> = new Map();
  
  constructor() {
    // Initialize default user with tube-based state
    this.initializeTripleHelix('default-user');
  }
  
  getActiveTube(userId: string): Tube {
    const state = this.userStates.get(userId);
    if (!state) throw new Error('USER_NOT_FOUND');
    
    const activeTubeId = state.activeTube;
    return state.tubes[activeTubeId];
  }
  
  getAllTubes(userId: string): { tube1: Tube; tube2: Tube; tube3: Tube } {
    const state = this.userStates.get(userId);
    if (!state) throw new Error('USER_NOT_FOUND');
    return state.tubes;
  }
  
  getTubesByStatus(userId: string, status: TubeStatus): Tube[] {
    const tubes = this.getAllTubes(userId);
    return Object.values(tubes).filter(tube => tube.status === status);
  }
  
  rotateTubes(userId: string) {
    const state = this.userStates.get(userId);
    if (!state) throw new Error('USER_NOT_FOUND');
    
    const currentActive = state.activeTube;
    const tubes = state.tubes;
    
    // Live Aid rotation: LIVE → PREPARING, READY → LIVE, PREPARING → READY
    const tubeIds: TubeId[] = ['tube1', 'tube2', 'tube3'];
    const currentActiveIndex = tubeIds.indexOf(currentActive);
    const newActiveIndex = (currentActiveIndex + 1) % 3;
    const newActiveTubeId = tubeIds[newActiveIndex];
    
    // Update statuses
    tubes[currentActive].status = 'preparing';
    tubes[newActiveTubeId].status = 'live';
    
    // Find the remaining tube and set it to ready
    const remainingTubeId = tubeIds.find(id => id !== currentActive && id !== newActiveTubeId)!;
    tubes[remainingTubeId].status = 'ready';
    
    state.activeTube = newActiveTubeId;
    state.rotationCount++;
    state.lastRotationTime = new Date().toISOString();
    
    console.log(`Tube rotation ${state.rotationCount}: ${currentActive} → ${newActiveTubeId}`);
    
    return {
      previousActiveTube: currentActive,
      newActiveTube: newActiveTubeId,
      rotationCount: state.rotationCount,
      timestamp: state.lastRotationTime!,
      tubeStates: {
        tube1: tubes.tube1.status,
        tube2: tubes.tube2.status,
        tube3: tubes.tube3.status
      }
    };
  }
  
  initializeTripleHelix(userId: string, initialStitches?: StitchId[]): TripleHelixState {
    if (this.userStates.has(userId)) {
      throw new Error('ALREADY_INITIALIZED');
    }
    
    const defaultStitches: StitchId[] = initialStitches || [
      't1-0001-add', 't2-0002-mult', 't3-0003-sub'
    ];
    
    const tripleHelixState: TripleHelixState = {
      userId,
      tubes: {
        tube1: {
          id: 'tube1',
          name: 'Addition Tube',
          status: 'live',
          positionMap: new Map([[1, defaultStitches[0]]]),
          activeStitchId: defaultStitches[0],
          totalStitches: 1
        },
        tube2: {
          id: 'tube2',
          name: 'Multiplication Tube',
          status: 'ready',
          positionMap: new Map([[1, defaultStitches[1]]]),
          activeStitchId: defaultStitches[1],
          totalStitches: 1
        },
        tube3: {
          id: 'tube3',
          name: 'Subtraction Tube',
          status: 'preparing',
          positionMap: new Map([[1, defaultStitches[2]]]),
          activeStitchId: defaultStitches[2],
          totalStitches: 1
        }
      },
      activeTube: 'tube1',
      rotationCount: 0,
      sessionCount: 0
    };
    
    this.userStates.set(userId, tripleHelixState);
    return tripleHelixState;
  }
  
  getTripleHelixState(userId: string): TripleHelixState {
    const state = this.userStates.get(userId);
    if (!state) throw new Error('USER_NOT_FOUND');
    return state;
  }
  
  updateTubePositions(userId: string, tubeId: TubeId, positionMap: Map<number, StitchId>): Tube {
    const state = this.userStates.get(userId);
    if (!state) throw new Error('USER_NOT_FOUND');
    
    const tube = state.tubes[tubeId];
    if (!tube) throw new Error('TUBE_NOT_FOUND');
    
    tube.positionMap = positionMap;
    tube.totalStitches = positionMap.size;
    tube.activeStitchId = positionMap.get(1); // Position 1 is always active
    
    return tube;
  }
  
  prepareBackgroundContent(userId: string): Record<TubeId, { prepared: boolean; stitchCount: number }> {
    const state = this.userStates.get(userId);
    if (!state) throw new Error('USER_NOT_FOUND');
    
    return {
      tube1: { prepared: true, stitchCount: state.tubes.tube1.totalStitches },
      tube2: { prepared: true, stitchCount: state.tubes.tube2.totalStitches },
      tube3: { prepared: true, stitchCount: state.tubes.tube3.totalStitches }
    };
  }
  
  getNextStitchId(userId: string, tubeId: TubeId): StitchId {
    const state = this.userStates.get(userId);
    if (!state) throw new Error('USER_NOT_FOUND');
    
    const tube = state.tubes[tubeId];
    if (!tube) throw new Error('TUBE_NOT_FOUND');
    
    // For now, return the active stitch ID or generate a default one
    if (tube.activeStitchId) {
      return tube.activeStitchId;
    }
    
    // Generate a default stitch ID based on tube
    const conceptMap: Record<TubeId, string> = {
      tube1: 'add',
      tube2: 'mult', 
      tube3: 'sub'
    };
    
    return `${tubeId}-0001-${conceptMap[tubeId]}` as StitchId;
  }
  
  setActiveTube(userId: string, tubeId: TubeId): void {
    const state = this.userStates.get(userId);
    if (!state) throw new Error('USER_NOT_FOUND');
    
    state.activeTube = tubeId;
  }
  
  async initializeUser(userId: string): Promise<void> {
    if (!this.userStates.has(userId)) {
      this.initializeTripleHelix(userId);
    }
  }
}

/**
 * Main orchestrator class that coordinates all engines
 * UPDATED: Tube-based architecture following APML Framework v1.4.2
 */
export class EngineOrchestrator {
  private tripleHelixManager: TempTripleHelixManager;
  private questionGenerator: QuestionGeneratorInterface;
  private learningEngineService: LearningEngineService;
  
  // Live Aid Architecture (optional enhancement)
  private liveAidManager?: LiveAidManager;
  private stitchCache?: StitchCache;
  private stitchPreparation?: StitchPreparation;
  private stitchPopulation?: StitchPopulation;
  private liveAidEnabled: boolean = false;
  
  // Active learning sessions for each user
  private activeSessions: Map<string, string> = new Map();
  
  constructor(
    private contentGatingEngine?: any,
    learningEngineService?: LearningEngineService,
    enableLiveAid: boolean = false
  ) {
    // Initialize tube-based components
    this.tripleHelixManager = new TempTripleHelixManager();
    
    // Accept injected learningEngineService
    if (learningEngineService) {
      this.learningEngineService = learningEngineService;
    } else {
      throw new Error('LearningEngineService is required');
    }
    
    // Optional Live Aid Architecture initialization
    if (enableLiveAid) {
      this.initializeLiveAid();
    }
    
    // Note: questionGenerator will be injected when proper implementation is available
    // For now, we'll handle questions through learningEngineService
    
    console.log(`EngineOrchestrator initialized with tube-based architecture${this.liveAidEnabled ? ' + Live Aid' : ''}`);
  }
  
  /**
   * Initialize a user if they don't exist
   */
  async initializeUser(userId: string): Promise<void> {
    await this.tripleHelixManager.initializeUser(userId);
  }

  /**
   * Generate a question for a user using tube-based architecture
   */
  async generateQuestion(userId: string = 'default-user'): Promise<PlayerCardQuestion> {
    try {
      // Get active tube for user
      const activeTube = this.tripleHelixManager.getActiveTube(userId);
      const activeStitchId = activeTube.activeStitchId;
      
      if (!activeStitchId) {
        throw new Error('NO_ACTIVE_STITCH');
      }
      
      // Check for active session or initialize new one
      let sessionId = this.activeSessions.get(userId);
      
      if (!sessionId) {
        // Initialize session for active stitch
        const sessionData = await this.learningEngineService.initializeLearningSession(
          userId, 
          activeStitchId
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
      // Fallback based on active tube concept
      return this.createFallbackQuestionForTube(userId);
    }
  }
  
  /**
   * Generate multiple questions for active stitch
   */
  async generateMultipleQuestions(count: number, userId: string = 'default-user'): Promise<PlayerCardQuestion[]> {
    try {
      const questions: PlayerCardQuestion[] = [];
      
      for (let i = 0; i < count; i++) {
        try {
          const question = await this.generateQuestion(userId);
          questions.push(question);
        } catch (error) {
          console.warn(`Failed to generate question ${i + 1}/${count}:`, error);
          // Add fallback question for active tube
          questions.push(this.createFallbackQuestionForTube(userId));
        }
      }
      
      return questions;
    } catch (error) {
      console.error('Failed to generate multiple questions:', error);
      // Fallback to generating fallback questions for active tube
      const questions: PlayerCardQuestion[] = [];
      for (let i = 0; i < count; i++) {
        questions.push(this.createFallbackQuestionForTube(userId));
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
   * Get available tubes for user
   */
  getAvailableTubes(userId: string = 'default-user'): Tube[] {
    try {
      const tubes = this.tripleHelixManager.getAllTubes(userId);
      return Object.values(tubes);
    } catch (error) {
      console.error('Failed to get available tubes:', error);
      return [];
    }
  }
  
  /**
   * Get stitch count for active tube
   */
  getStitchCount(userId: string = 'default-user'): number {
    try {
      const activeTube = this.tripleHelixManager.getActiveTube(userId);
      return activeTube.totalStitches;
    } catch (error) {
      console.error('Failed to get stitch count:', error);
      return 0;
    }
  }
  
  /**
   * Converts a question from LearningEngine to PlayerCard format
   */
  private addDistractorToQuestion(question: any): PlayerCardQuestion {
    const correctAnswer = parseInt(question.correctAnswer);
    const distractor = this.generateDistractor(correctAnswer, question.operation || 'addition');
    
    return {
      id: question.id,
      text: question.text || question.questionText,
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
   * Create a fallback question based on active tube
   */
  private createFallbackQuestionForTube(userId: string): PlayerCardQuestion {
    try {
      const activeTube = this.tripleHelixManager.getActiveTube(userId);
      const tubeName = activeTube.name.toLowerCase();
      
      if (tubeName.includes('addition')) {
        return this.createFallbackQuestion('addition');
      } else if (tubeName.includes('multiplication')) {
        return this.createFallbackQuestion('multiplication');
      } else if (tubeName.includes('subtraction')) {
        return this.createFallbackQuestion('subtraction');
      } else if (tubeName.includes('division')) {
        return this.createFallbackQuestion('division');
      }
    } catch (error) {
      console.warn('Could not determine active tube, using addition fallback');
    }
    
    return this.createFallbackQuestion('addition');
  }
  
  /**
   * Create a fallback question for specific concept
   */
  private createFallbackQuestion(concept: string): PlayerCardQuestion {
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
    
    return fallbackQuestions[concept] || fallbackQuestions['addition'];
  }
  
  // Removed initializeLearningPaths - replaced by tube-based initialization
  
  /**
   * Get the current stitch for a user from active tube
   */
  getCurrentStitchId(userId: string = 'default-user'): StitchId | null {
    try {
      const activeTube = this.tripleHelixManager.getActiveTube(userId);
      return activeTube.activeStitchId || null;
    } catch (error) {
      console.error('Failed to get current stitch ID:', error);
      return null;
    }
  }
  
  /**
   * Generate questions for a specific stitch ID (tube-based)
   */
  async generateQuestionsForStitch(stitchId: StitchId, count: number = 20, userId: string = 'default-user'): Promise<PlayerCardQuestion[]> {
    try {
      // Check if Live Aid is enabled and try to get pre-cached questions
      if (this.liveAidEnabled && this.liveAidManager) {
        try {
          const readyStitch = await this.liveAidManager.getReadyStitch(userId);
          
          // Convert ReadyQuestion[] to PlayerCardQuestion[]
          const playerCardQuestions = readyStitch.questions.map(q => ({
            id: q.questionId,
            factId: q.metadata.factId,
            text: q.questionText,
            correctAnswer: q.correctAnswer,
            distractor: q.distractor,
            boundaryLevel: q.metadata.boundaryLevel
          }));
          
          console.log(`Live Aid: Retrieved ${playerCardQuestions.length} pre-cached questions for stitch ${stitchId}`);
          return playerCardQuestions;
          
        } catch (error) {
          console.warn(`Live Aid cache miss for stitch ${stitchId}, falling back to synchronous generation:`, error);
        }
      }
      
      // Fallback: Original synchronous question generation loop
      console.log(`Synchronous generation: Creating ${count} questions for stitch ${stitchId}`);
      const questions: PlayerCardQuestion[] = [];
      
      for (let i = 0; i < count; i++) {
        try {
          const question = await this.generateQuestion(userId);
          question.id = `${stitchId}-q${i}-${Date.now()}`; // Ensure unique IDs
          questions.push(question);
        } catch (error) {
          console.warn(`Failed to generate question ${i + 1}/${count} for stitch ${stitchId}:`, error);
          questions.push(this.createFallbackQuestionForTube(userId));
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
   * Complete a stitch and update tube position (tube-based architecture)
   */
  async completeStitch(userId: string, stitchId: StitchId, sessionResults: any): Promise<any> {
    try {
      // Process session completion with LearningEngine service
      const sessionId = this.activeSessions.get(userId);
      if (sessionId) {
        await this.learningEngineService.completeSession(sessionId, sessionResults);
        this.activeSessions.delete(userId); // Clear active session
      }
      
      console.log(`Stitch ${stitchId} completed for user ${userId}`);
      
      // In full implementation, this would trigger:
      // 1. Spaced repetition repositioning
      // 2. Boundary level updates
      // 3. Tube position compression
      
      return {
        stitchId,
        completed: true,
        sessionResults
      };
    } catch (error) {
      console.error('Failed to complete stitch:', error);
      return null;
    }
  }
  
  /**
   * Get the next stitch after tube rotation
   */
  async getNextStitch(userId: string = 'default-user'): Promise<any> {
    try {
      // Get the active tube (which should be the new one after rotation)
      const activeTube = this.tripleHelixManager.getActiveTube(userId);
      const stitchId = activeTube.activeStitchId || 't1-0001-0001';
      
      // Generate questions for this stitch
      const questions = await this.generateQuestionsForStitch(stitchId, 20, userId);
      
      return {
        stitchId,
        questions,
        tubeId: activeTube.id,
        tubeName: activeTube.name,
        sessionId: `session_${Date.now()}`
      };
    } catch (error) {
      console.error('Failed to get next stitch:', error);
      // Return hardcoded stitch as fallback
      return {
        stitchId: 't1-0001-0001',
        questions: await this.generateQuestionsForStitch('t1-0001-0001', 20, userId),
        sessionId: `session_${Date.now()}`
      };
    }
  }
  
  /**
   * Get stitch progress for a user (tube-based)
   */
  getStitchProgress(userId: string, stitchId: StitchId) {
    try {
      // In full implementation, this would query StitchManagerInterface
      // For now, return basic progress data
      return {
        stitchId,
        userId,
        position: 1, // Logical position in tube
        boundaryLevel: 1,
        lastSeen: new Date().toISOString()
      };
    } catch (error) {
      console.warn(`No progress data for stitch ${stitchId}:`, error);
      return null;
    }
  }
  
  /**
   * Get all stitches for a tube
   */
  getStitchesForTube(userId: string, tubeId: TubeId): StitchId[] {
    try {
      const tubes = this.tripleHelixManager.getAllTubes(userId);
      const tube = tubes[tubeId];
      return Array.from(tube.positionMap.values());
    } catch (error) {
      console.error('Failed to get stitches for tube:', error);
      return [];
    }
  }

  /**
   * Get all stitch positions for backend synchronization (tube-based)
   */
  getAllStitchPositions(userId: string): Record<TubeId, any> {
    try {
      const positions: Record<TubeId, any> = {} as any;
      const tubes = this.tripleHelixManager.getAllTubes(userId);
      
      Object.entries(tubes).forEach(([tubeId, tube]) => {
        positions[tubeId as TubeId] = {
          status: tube.status,
          activeStitchId: tube.activeStitchId,
          totalStitches: tube.totalStitches,
          positionMap: Object.fromEntries(tube.positionMap)
        };
      });
      
      return positions;
    } catch (error) {
      console.error('Failed to get all stitch positions:', error);
      return {} as any;
    }
  }

  /**
   * Get current triple helix state for backend synchronization (tube-based)
   */
  getTripleHelixState(userId: string): TripleHelixState {
    try {
      return this.tripleHelixManager.getTripleHelixState(userId);
    } catch (error) {
      console.error('Failed to get triple helix state:', error);
      // Return fallback state
      return {
        userId,
        tubes: {
          tube1: { id: 'tube1', name: 'Tube 1', status: 'live', positionMap: new Map(), totalStitches: 0 },
          tube2: { id: 'tube2', name: 'Tube 2', status: 'ready', positionMap: new Map(), totalStitches: 0 },
          tube3: { id: 'tube3', name: 'Tube 3', status: 'preparing', positionMap: new Map(), totalStitches: 0 }
        },
        activeTube: 'tube1',
        rotationCount: 0,
        sessionCount: 0
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
   * Get the active tube for a user
   */
  getActiveTube(userId: string = 'default-user'): Tube | null {
    try {
      return this.tripleHelixManager.getActiveTube(userId);
    } catch (error) {
      console.error('Failed to get active tube:', error);
      return null;
    }
  }
  
  /**
   * Rotate tubes for a user (Live Aid Stage Model)
   */
  rotateTripleHelix(userId: string = 'default-user') {
    try {
      const rotationResult = this.tripleHelixManager.rotateTubes(userId);
      
      // If Live Aid is enabled, trigger high-performance rotation
      if (this.liveAidEnabled && this.liveAidManager) {
        this.liveAidManager.rotateTubes(userId, rotationResult.newActiveTube);
      }
      
      return rotationResult;
    } catch (error) {
      console.error('Failed to rotate tubes:', error);
      return null;
    }
  }
  
  /**
   * Initialize Live Aid Architecture (optional enhancement)
   * Follows APML 4-phase implementation sequence
   */
  private initializeLiveAid(): void {
    try {
      // Phase 1: StitchPopulation (curriculum mapping)
      this.stitchPopulation = new StitchPopulation();
      
      // Phase 2: StitchPreparation (background assembly)
      const factRepository = new FactRepository();
      const distinctionManager = new DistinctionManager();
      const distractorGenerator = new DistractorGenerator();
      const questionGenerator = new QuestionGenerator();
      
      this.stitchPreparation = new StitchPreparation(
        factRepository,
        distinctionManager,
        distractorGenerator,
        questionGenerator
      );
      
      // Phase 3: StitchCache (performance optimization)
      this.stitchCache = new StitchCache();
      
      // Phase 4: LiveAidManager (system coordination)
      this.liveAidManager = new LiveAidManager(
        this.stitchPopulation,
        this.stitchPreparation,
        this.stitchCache
      );
      
      this.liveAidEnabled = true;
      console.log('Live Aid Architecture initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize Live Aid Architecture:', error);
      this.liveAidEnabled = false;
    }
  }
  
  /**
   * Generate question with Live Aid enhancement (Netflix-like performance)
   */
  async generateQuestionWithLiveAid(userId: string = 'default-user'): Promise<PlayerCardQuestion> {
    if (!this.liveAidEnabled || !this.liveAidManager) {
      return this.generateQuestion(userId);
    }
    
    try {
      const activeTube = this.tripleHelixManager.getActiveTube(userId);
      const readyStitch = await this.liveAidManager.getReadyStitch(userId, activeTube.id);
      
      if (readyStitch) {
        return this.convertToPlayerCardQuestion(readyStitch.content);
      } else {
        // Fallback to regular generation
        return this.generateQuestion(userId);
      }
    } catch (error) {
      console.error('Live Aid question generation failed, falling back:', error);
      return this.generateQuestion(userId);
    }
  }
  
  /**
   * Get Live Aid performance metrics
   */
  getLiveAidMetrics(userId: string = 'default-user'): any {
    if (!this.liveAidEnabled || !this.stitchCache) {
      return { enabled: false };
    }
    
    return {
      enabled: true,
      cacheHitRate: this.stitchCache.getCacheHitRate(),
      backgroundPreparationStatus: this.stitchPreparation?.getPreparationStatus(userId) || 'unknown',
      readyStitchCount: this.stitchCache.getReadyStitchCount(userId),
      lastRotationTime: this.liveAidManager?.getLastRotationTime(userId) || null
    };
  }
  
  /**
   * Enable or disable Live Aid for runtime switching
   */
  setLiveAidEnabled(enabled: boolean): void {
    if (enabled && !this.liveAidEnabled) {
      this.initializeLiveAid();
    } else if (!enabled) {
      this.liveAidEnabled = false;
      console.log('Live Aid Architecture disabled');
    }
  }
}

// Create a singleton instance with optional Live Aid
export const engineOrchestrator = new EngineOrchestrator(true); // Enable Live Aid for Netflix-like performance