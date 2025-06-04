/**
 * LearningEngineService.ts
 * 
 * APML-compliant service adapter for the LearningEngine module following External Service Integration Protocol.
 * Coordinates between FactRepository, QuestionGenerator, DistractorGenerator, DistinctionManager, and ContentManager
 * to provide unified learning session management and question generation capabilities.
 * 
 * @module LearningEngine
 * @compliance APML Framework v1.4.1 - External Service Integration Protocol
 */

import { v4 as uuidv4 } from 'uuid';

// Import existing LearningEngine components
import { FactRepository } from '../engines/FactRepository/FactRepository';
import { ContentManager } from '../engines/ContentManager/ContentManager';
import { QuestionGenerator } from '../engines/QuestionGenerator/QuestionGenerator';
import { DistractorGenerator } from '../engines/DistractorGenerator/DistractorGenerator';
import { DistinctionManager } from '../engines/DistinctionManager/DistinctionManager';

// Import Live Aid Architecture components
import { StitchPopulation } from '../engines/StitchPopulation/StitchPopulation';
import { StitchPreparation } from '../engines/StitchPreparation/StitchPreparation';
import { StitchCache } from '../engines/StitchCache/StitchCache';
import { LiveAidManager } from '../engines/LiveAidManager/LiveAidManager';
import { TripleHelixManager } from '../engines/TripleHelixManager/TripleHelixManager';

// Import Content Gating types only (no singletons)
import type { ContentGatingResult } from '../engines/ContentGatingEngine';
import type { OfflineContentManager } from '../engines/OfflineContentManager';

// Import interface for dependency injection
import { LearningEngineDependencies, LearningEngineServiceInterface } from '../interfaces/LearningEngineServiceInterface';

// Import component types
import type { 
  MathematicalFact, 
  FactQuery,
  MathematicalFactInput 
} from '../engines/FactRepository/FactRepositoryTypes';
import type { 
  Question as QuestionGeneratorQuestion,
  QuestionRequest 
} from '../interfaces/QuestionGeneratorInterface';
import type { 
  Question as PlayerCardQuestion 
} from '../interfaces/PlayerCardInterface';
import type { DistractorRequest } from '../engines/DistractorGenerator/DistractorGenerator';

/**
 * Configuration options for learning sessions
 */
export interface SessionConfiguration {
  maxQuestions?: number;
  difficultyRange?: [number, number];
  focusAreas?: string[];
  adaptiveDifficulty?: boolean;
}

/**
 * Unified question type for LearningEngine service
 */
export interface Question {
  id: string;
  factId: string;
  questionText: string;
  correctAnswer: string;
  distractors: string[];
  boundaryLevel: number;
  difficulty: number;
  metadata: Record<string, any>;
}

/**
 * User response data structure
 */
export interface UserResponse {
  questionId: string;
  selectedAnswer: string;
  responseTime: number;
  isCorrect: boolean;
  timestamp: string;
}

/**
 * Response feedback structure
 */
export interface ResponseFeedback {
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
  encouragement: string;
  masteryUpdate: Record<string, any>;
}

/**
 * User mastery state information
 */
export interface UserMasteryState {
  userId: string;
  learningPaths: Record<string, any>;
  overallProgress: number;
  strengths: string[];
  improvementAreas: string[];
  lastUpdated: string;
}

/**
 * Learning session data
 */
interface LearningSession {
  id: string;
  userId: string;
  learningPathId: string;
  startTime: string;
  currentQuestionIndex: number;
  questions: Question[];
  responses: UserResponse[];
  configuration: SessionConfiguration;
  isActive: boolean;
}

/**
 * LearningEngine service errors
 */
export class LearningEngineError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'LearningEngineError';
  }
}

/**
 * APML-compliant LearningEngine service adapter
 * 
 * Coordinates all LearningEngine components to provide unified learning session management.
 * Follows External Service Integration Protocol with proper error handling, logging, and isolation.
 * 
 * IMPORTANT: All dependencies are injected, not created internally.
 */
export class LearningEngineService implements LearningEngineServiceInterface {
  // Injected dependencies
  private factRepository: FactRepository;
  private contentManager: ContentManager;
  private questionGenerator: QuestionGenerator;
  private distractorGenerator: DistractorGenerator;
  private distinctionManager: DistinctionManager;
  private stitchPopulation: StitchPopulation;
  private stitchPreparation: StitchPreparation;
  private stitchCache: StitchCache;
  private liveAidManager: LiveAidManager;
  private tripleHelixManager: TripleHelixManager;
  private contentGatingEngine: any;
  private offlineContentManager: any;
  
  // Active learning sessions
  private activeSessions: Map<string, LearningSession> = new Map();
  
  // Service state
  private isInitialized: boolean = false;
  
  /**
   * Initialize LearningEngine service with injected dependencies
   * @param dependencies All required dependencies injected from container
   */
  constructor(dependencies: LearningEngineDependencies) {
    // Assign all injected dependencies
    this.factRepository = dependencies.factRepository;
    this.contentManager = dependencies.contentManager;
    this.questionGenerator = dependencies.questionGenerator;
    this.distractorGenerator = dependencies.distractorGenerator;
    this.distinctionManager = dependencies.distinctionManager;
    this.tripleHelixManager = dependencies.tripleHelixManager;
    this.stitchPopulation = dependencies.stitchPopulation;
    this.stitchPreparation = dependencies.stitchPreparation;
    this.stitchCache = dependencies.stitchCache;
    this.liveAidManager = dependencies.liveAidManager;
    this.contentGatingEngine = dependencies.contentGatingEngine;
    this.offlineContentManager = dependencies.offlineContentManager;
    
    this.initialize();
  }
  
  /**
   * Initialize all LearningEngine components
   * @private
   */
  private initialize(): void {
    try {
      // Validate all dependencies are present
      if (!this.factRepository) throw new Error('FactRepository is required');
      if (!this.contentManager) throw new Error('ContentManager is required');
      if (!this.distinctionManager) throw new Error('DistinctionManager is required');
      if (!this.distractorGenerator) throw new Error('DistractorGenerator is required');
      if (!this.tripleHelixManager) throw new Error('TripleHelixManager is required');
      if (!this.questionGenerator) throw new Error('QuestionGenerator is required');
      if (!this.stitchPopulation) throw new Error('StitchPopulation is required');
      if (!this.stitchPreparation) throw new Error('StitchPreparation is required');
      if (!this.stitchCache) throw new Error('StitchCache is required');
      if (!this.liveAidManager) throw new Error('LiveAidManager is required');
      
      this.isInitialized = true;
      this.log('LearningEngine service initialized successfully with injected dependencies');
    } catch (error) {
      throw new LearningEngineError(
        'LE-INIT-001',
        'Service initialization failed - missing dependencies',
        { error: error instanceof Error ? error.message : String(error) }
      );
    }
  }
  
  /**
   * Initialize a new learning session for a user
   * @param userId User identifier
   * @param learningPathId Learning path identifier  
   * @param sessionConfig Session configuration options
   * @returns Session ID and initial questions
   */
  public async initializeLearningSession(
    userId: string,
    learningPathId: string,
    sessionConfig: SessionConfiguration = {}
  ): Promise<{ sessionId: string; initialQuestions: Question[] }> {
    this.ensureInitialized();
    
    try {
      // Validate inputs
      if (!userId || !learningPathId) {
        throw new LearningEngineError(
          'LE-001', 
          'User ID and learning path ID are required'
        );
      }
      
      // Initialize Live-Aid system for user (sets up 3-tube rotating system)
      try {
        await this.liveAidManager.initializeLiveAidSystem(userId);
        this.log(`Live-Aid system initialized for user: ${userId}`);
      } catch (error) {
        // If already initialized, that's fine - LiveAidManager handles this
        this.log(`Live-Aid system state checked for user: ${userId}`);
      }
      
      // APML Protocol: Create session ID and store EMPTY session FIRST
      const sessionId = uuidv4();
      const startTime = new Date().toISOString();
      
      // Store session IMMEDIATELY with empty questions to establish session contract
      const session: LearningSession = {
        id: sessionId,
        userId,
        learningPathId,
        startTime,
        currentQuestionIndex: 0,
        questions: [], // APML: Start empty to prevent race conditions
        responses: [],
        configuration: sessionConfig,
        isActive: true
      };
      
      this.activeSessions.set(sessionId, session);
      this.log(`Session created and stored: ${sessionId}`);
      
      // APML Protocol: Now generate questions AFTER session exists
      const initialQuestions = await this.generateSessionQuestions(
        userId, 
        learningPathId, 
        sessionConfig
      );
      
      // Update session with questions atomically
      session.questions = initialQuestions;
      
      this.log(`Learning session initialized: ${sessionId} for user: ${userId}`);
      
      return {
        sessionId,
        initialQuestions: initialQuestions
      };
    } catch (error) {
      if (error instanceof LearningEngineError) {
        throw error;
      }
      throw new LearningEngineError(
        'LE-003',
        'Session initialization failed',
        { userId, learningPathId, error: String(error) }
      );
    }
  }
  
  /**
   * Generate a new question based on user's current learning state
   * @param sessionId Active session identifier
   * @param userId User identifier
   * @param questionRequest Question generation parameters
   * @returns Generated question with distractors
   */
  public async generateQuestion(
    sessionId: string,
    userId: string,
    questionRequest?: QuestionRequest
  ): Promise<Question> {
    this.ensureInitialized();
    
    try {
      // APML Protocol: Validate session existence with interface contract
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new LearningEngineError('LE-004', 'Session not found');
      }
      
      // APML Protocol: Validate session is properly initialized
      if (!session.isActive) {
        throw new LearningEngineError('LE-004', 'Session is not active');
      }
      
      // Get user's current boundary level for question targeting (use default fact for overall level)
      const masteryLevel = this.distinctionManager.getCurrentBoundaryLevel(userId, 'default-fact');
      
      // Create question request
      const request: QuestionRequest = {
        userId,
        learningPathId: session.learningPathId,
        difficultyLevel: masteryLevel,
        questionCount: 1,
        ...questionRequest
      };
      
      // Generate question using QuestionGenerator (synchronous)
      const generatorQuestion = this.questionGenerator.generateQuestion(request);
      
      // Convert to unified Question format
      const question: Question = {
        id: generatorQuestion.id,
        factId: generatorQuestion.factId,
        questionText: generatorQuestion.questionText,
        correctAnswer: generatorQuestion.correctAnswer,
        distractors: generatorQuestion.distractors || [],
        boundaryLevel: generatorQuestion.metadata?.boundaryLevel || 1,
        difficulty: generatorQuestion.metadata?.difficulty || 1,
        metadata: generatorQuestion.metadata || {}
      };
      
      // Add question to session
      session.questions.push(question);
      
      this.log(`Question generated: ${question.id} for session: ${sessionId}`);
      
      return question;
    } catch (error) {
      if (error instanceof LearningEngineError) {
        throw error;
      }
      throw new LearningEngineError(
        'LE-005',
        'Question generation failed',
        { sessionId, userId, error: String(error) }
      );
    }
  }
  
  /**
   * Process user's response and update learning state
   * @param sessionId Active session identifier
   * @param questionId Question identifier
   * @param userResponse User's response data
   * @returns Feedback and next question
   */
  public async processUserResponse(
    sessionId: string,
    questionId: string,
    userResponse: UserResponse
  ): Promise<{
    feedback: ResponseFeedback;
    nextQuestion: Question | null;
    sessionComplete: boolean;
  }> {
    this.ensureInitialized();
    
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new LearningEngineError('LE-004', 'Session not found');
      }
      
      // Find the question
      const question = session.questions.find(q => q.id === questionId);
      if (!question) {
        throw new LearningEngineError('LE-008', 'Question not found');
      }
      
      // Validate response
      if (!userResponse.selectedAnswer) {
        throw new LearningEngineError('LE-007', 'Invalid response data');
      }
      
      // Process the response
      const isCorrect = userResponse.selectedAnswer === question.correctAnswer;
      userResponse.isCorrect = isCorrect;
      
      // Add response to session
      session.responses.push(userResponse);
      session.currentQuestionIndex++;
      
      // Update user mastery state
      await this.updateUserMastery(session.userId, question, userResponse);
      
      // Generate feedback
      const feedback: ResponseFeedback = {
        isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: this.generateExplanation(question, isCorrect),
        encouragement: this.generateEncouragement(isCorrect, session.responses.length),
        masteryUpdate: {} // Will be populated by mastery update
      };
      
      // Determine if session should continue based on pre-generated stitch length
      const totalStitchQuestions = session.questions.length;
      const sessionComplete = session.responses.length >= totalStitchQuestions;
      
      // Get next question from pre-generated stitch if session continues
      let nextQuestion: Question | null = null;
      if (!sessionComplete) {
        // Only increment question index for CORRECT answers
        if (userResponse.isCorrect) {
          session.currentQuestionIndex++;
        }
        
        // Get next/current question from stored questions array
        if (session.currentQuestionIndex < session.questions.length) {
          nextQuestion = session.questions[session.currentQuestionIndex];
          this.log(`Serving pre-generated question ${session.currentQuestionIndex + 1}/${session.questions.length} from stitch`);
        } else {
          // All questions in the stitch have been completed
          this.log(`All ${session.questions.length} questions in stitch completed`);
        }
      }
      
      // Mark session as complete if needed
      if (sessionComplete || !nextQuestion) {
        session.isActive = false;
        this.log(`Learning session completed: ${sessionId}`);
        
        // CRITICAL: Trigger tube rotation when session completes (Live-Aid system)
        try {
          const rotationResult = await this.liveAidManager.rotateTubes(
            session.userId, 
            'session_completion'
          );
          this.log(`Tubes rotated for user ${session.userId}: ${rotationResult.rotationId}`);
          this.log(`New active tube: ${rotationResult.newActiveTube}, rotation count: ${rotationResult.rotationCount}`);
        } catch (rotationError) {
          this.log(`Warning: Tube rotation failed for user ${session.userId}: ${rotationError}`);
          // Don't fail the session completion if rotation fails
        }
      }
      
      this.log(`Response processed: ${questionId} - ${isCorrect ? 'correct' : 'incorrect'}`);
      
      return {
        feedback,
        nextQuestion,
        sessionComplete: sessionComplete || !nextQuestion
      };
    } catch (error) {
      if (error instanceof LearningEngineError) {
        throw error;
      }
      throw new LearningEngineError(
        'LE-009',
        'Response processing failed',
        { sessionId, questionId, error: String(error) }
      );
    }
  }
  
  /**
   * Get comprehensive mastery information for a user
   * @param userId User identifier
   * @param learningPathId Learning path filter
   * @returns Complete user mastery information
   */
  public async getUserMasteryState(
    userId: string,
    learningPathId?: string
  ): Promise<UserMasteryState> {
    this.ensureInitialized();
    
    try {
      // Get mastery data from DistinctionManager
      // Note: APML spec only provides per-fact boundary levels, not aggregate mastery
      // This will be addressed when proper user mastery aggregation is implemented
      const masteryLevels = {}; // Placeholder for APML-compliant implementation
      
      // Calculate overall progress
      const totalFacts = Object.keys(masteryLevels).length;
      const masteredFacts = Object.values(masteryLevels).filter(level => level >= 4).length;
      const overallProgress = totalFacts > 0 ? (masteredFacts / totalFacts) * 100 : 0;
      
      // Analyze strengths and improvement areas
      const { strengths, improvementAreas } = this.analyzeMasteryPattern(masteryLevels);
      
      const masteryState: UserMasteryState = {
        userId,
        learningPaths: learningPathId 
          ? { [learningPathId]: masteryLevels }
          : { all: masteryLevels },
        overallProgress,
        strengths,
        improvementAreas,
        lastUpdated: new Date().toISOString()
      };
      
      return masteryState;
    } catch (error) {
      throw new LearningEngineError(
        'LE-010',
        'User mastery data not found',
        { userId, error: String(error) }
      );
    }
  }
  
  /**
   * Get available mathematical facts for a learning context
   * @param learningPathId Learning path identifier
   * @param difficulty Difficulty level filter
   * @param factQuery Additional query filters
   * @returns Available mathematical facts
   */
  public async getAvailableFacts(
    learningPathId: string,
    difficulty?: number,
    factQuery?: FactQuery
  ): Promise<MathematicalFact[]> {
    this.ensureInitialized();
    
    try {
      // Build query for learning path
      const query: FactQuery = {
        operation: this.mapLearningPathToOperation(learningPathId),
        difficulty,
        ...factQuery
      };
      
      // Query facts from repository
      const facts = this.factRepository.queryFacts(query);
      
      this.log(`Retrieved ${facts.length} facts for learning path: ${learningPathId}`);
      
      return facts;
    } catch (error) {
      throw new LearningEngineError(
        'LE-013',
        'No facts match criteria',
        { learningPathId, difficulty, error: String(error) }
      );
    }
  }
  
  /**
   * Update or add mathematical content
   * @param factData Fact data to add/update
   * @param updateMode Update mode: create, update, or upsert
   * @returns Created/updated fact ID and success status
   */
  public async updateContent(
    factData: MathematicalFactInput,
    updateMode: string = 'upsert'
  ): Promise<{ factId: string; success: boolean }> {
    this.ensureInitialized();
    
    try {
      let fact: MathematicalFact;
      
      switch (updateMode) {
        case 'create':
          fact = this.contentManager.createFact(factData);
          break;
        case 'update':
          fact = this.contentManager.updateFact(factData.id!, factData);
          break;
        case 'upsert':
        default:
          // Try update first, then create if not exists
          try {
            fact = this.contentManager.updateFact(factData.id!, factData);
          } catch {
            fact = this.contentManager.createFact(factData);
          }
          break;
      }
      
      this.log(`Content ${updateMode}: ${fact.id}`);
      
      return {
        factId: fact.id,
        success: true
      };
    } catch (error) {
      throw new LearningEngineError(
        'LE-016',
        'Content update failed',
        { factData, updateMode, error: String(error) }
      );
    }
  }
  
  /**
   * Complete a learning session
   * @param sessionId Session identifier
   * @param sessionResults Session completion results
   * @returns Completion status
   */
  public async completeSession(
    sessionId: string,
    sessionResults: any
  ): Promise<boolean> {
    this.ensureInitialized();
    
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new LearningEngineError('LE-019', 'Session not found');
      }
      
      // Mark session as complete
      session.isActive = false;
      session.endTime = new Date().toISOString();
      
      // Log completion
      this.log(`Session completed: ${sessionId}`);
      
      // Clean up session after a delay
      setTimeout(() => {
        this.activeSessions.delete(sessionId);
      }, 5000);
      
      return true;
    } catch (error) {
      this.log(`Failed to complete session: ${error}`);
      return false;
    }
  }
  
  /**
   * Export user learning data or curriculum content
   * @param exportType Export type: user_data, curriculum, or full
   * @param userId User identifier for user_data export
   * @param format Export format: json, csv, or xml
   * @returns Exported data in requested format
   */
  public async exportLearningData(
    exportType: string,
    userId?: string,
    format: string = 'json'
  ): Promise<string> {
    this.ensureInitialized();
    
    try {
      let data: any;
      
      switch (exportType) {
        case 'user_data':
          if (!userId) {
            throw new LearningEngineError('LE-017', 'User ID required for user_data export');
          }
          data = await this.exportUserData(userId);
          break;
        case 'curriculum':
          data = await this.exportCurriculumData();
          break;
        case 'full':
          data = await this.exportFullData();
          break;
        default:
          throw new LearningEngineError('LE-017', 'Invalid export type');
      }
      
      // Format data according to requested format
      return this.formatExportData(data, format);
    } catch (error) {
      if (error instanceof LearningEngineError) {
        throw error;
      }
      throw new LearningEngineError(
        'LE-018',
        'Export generation failed',
        { exportType, userId, format, error: String(error) }
      );
    }
  }
  
  // --- Private Helper Methods ---
  
  /**
   * Ensure service is properly initialized
   * @private
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new LearningEngineError(
        'LE-INIT-002',
        'LearningEngine service not initialized'
      );
    }
  }
  
  /**
   * Generate questions for a new session
   * @private
   */
  private async generateSessionQuestions(
    userId: string,
    learningPathId: string,
    config: SessionConfiguration
  ): Promise<Question[]> {
    try {
      // First, check content gating for the requested learning path
      const tubeId = this.extractTubeIdFromPath(learningPathId);
      const currentStitchId = await this.getCurrentStitchId(userId, tubeId);
      
      // Check if user can access this content
      const contentGatingEngine = await this.getContentGatingEngine();
      const accessResult = await contentGatingEngine.canAccessStitch(userId, currentStitchId, tubeId);
      
      if (!accessResult.hasAccess) {
        // If content is gated, use free alternative or throw gating error
        if (accessResult.freeAlternative) {
          this.log(`Content gated - using free alternative: ${accessResult.freeAlternative.stitchId}`);
          return await this.generateQuestionsForStitch(userId, accessResult.freeAlternative.stitchId, config);
        } else {
          throw new LearningEngineError(
            'LE-GATE-001',
            'Premium subscription required for this content',
            { 
              reason: accessResult.reason,
              suggestedAction: accessResult.suggestedAction,
              stitchId: currentStitchId,
              tubeId 
            }
          );
        }
      }

      // Check if offline content is available (for premium users)
      const offlineContentManager = await this.getOfflineContentManager();
      const offlineStitch = await offlineContentManager.getOfflineStitch(currentStitchId);
      if (offlineStitch.isAvailable) {
        this.log(`Using offline content for stitch: ${currentStitchId}`);
        return await this.generateQuestionsFromOfflineContent(offlineStitch, config);
      }
      
      // Generate questions using LiveAidManager directly
      this.log(`Generating 20-question stitch for learning path: ${learningPathId} using LiveAidManager`);
      
      try {
        // Use injected LiveAidManager to get ready stitch content
        const readyStitch = await this.liveAidManager.getReadyStitch(userId, tubeId);
        
        console.log('🔍 DEBUG: readyStitch from LiveAidManager:', {
          hasStitch: !!readyStitch,
          questionsLength: readyStitch?.questions?.length,
          firstQuestion: readyStitch?.questions?.[0]
        });
        
        if (!readyStitch || !readyStitch.questions || readyStitch.questions.length === 0) {
          throw new Error('No questions generated from LiveAidManager');
        }
        
        this.log(`Generated stitch with ${readyStitch.questions.length} questions from LiveAidManager`);
        
        // Convert ReadyQuestion format to Question format
        const questions: Question[] = readyStitch.questions.map(rq => ({
          id: rq.id,
          questionText: rq.text || 'Question text missing',
          correctAnswer: rq.correctAnswer,
          distractors: [rq.distractor],
          boundaryLevel: rq.boundaryLevel,
          difficulty: 1,
          factId: rq.metadata?.factId || rq.factId,
          metadata: {
            ...rq.metadata,
            learningPathId: learningPathId,
            stitchId: readyStitch.stitchId,
            tubeId: readyStitch.tubeId
          }
        }));
        
        return questions;
      } catch (liveAidError) {
        this.log(`LiveAidManager failed: ${liveAidError}`);
        console.error('🔴 LiveAidManager error details:', liveAidError);
        
        // No fallbacks - enforce APML compliance
        this.log(`❌ APML Violation: LiveAidManager failed and no fallbacks allowed`);
        throw new LearningEngineError(
          'LE-ARCH-001',
          'APML architecture failure: LiveAidManager must work - no fallbacks allowed',
          { userId, learningPathId, originalError: liveAidError.message }
        );
      }
      
    } catch (error) {
      this.log(`❌ APML Violation: Complete failure to generate stitch questions: ${error}`);
      throw error; // No fallbacks - force proper architecture
    }
  }
  
  /**
   * Update user mastery based on response
   * @private
   */
  private async updateUserMastery(
    userId: string,
    question: Question,
    response: UserResponse
  ): Promise<void> {
    try {
      // Update distinction manager with performance data
      const performanceData = {
        correctFirstAttempt: response.isCorrect,
        responseTime: response.responseTime
      };
      
      // Use APML-compliant updateBoundaryLevel method
      this.distinctionManager.updateBoundaryLevel(userId, question.factId, performanceData);
    } catch (error) {
      this.log(`Failed to update user mastery: ${error}`);
    }
  }
  
  /**
   * Generate explanation for answer
   * @private
   */
  private generateExplanation(question: Question, isCorrect: boolean): string {
    if (isCorrect) {
      return `Correct! ${question.questionText} = ${question.correctAnswer}`;
    } else {
      return `The correct answer is ${question.correctAnswer}. ${question.questionText} = ${question.correctAnswer}`;
    }
  }
  
  /**
   * Generate encouraging message
   * @private
   */
  private generateEncouragement(isCorrect: boolean, responseCount: number): string {
    if (isCorrect) {
      const messages = [
        'Great job!', 'Well done!', 'Excellent!', 'Perfect!', 'Outstanding!'
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    } else {
      return 'Keep practicing - you\'re doing great!';
    }
  }
  
  /**
   * Analyze mastery pattern for strengths and improvement areas
   * @private
   */
  private analyzeMasteryPattern(masteryLevels: Record<string, number>): {
    strengths: string[];
    improvementAreas: string[];
  } {
    const strengths: string[] = [];
    const improvementAreas: string[] = [];
    
    // Simple analysis - can be enhanced later
    Object.entries(masteryLevels).forEach(([factId, level]) => {
      if (level >= 4) {
        strengths.push(factId);
      } else if (level <= 2) {
        improvementAreas.push(factId);
      }
    });
    
    return { strengths, improvementAreas };
  }
  
  /**
   * Map learning path to operation type
   * @private
   */
  private mapLearningPathToOperation(learningPathId: string): string | undefined {
    const pathMapping: Record<string, string> = {
      'addition': 'addition',
      'subtraction': 'subtraction', 
      'multiplication': 'multiplication',
      'division': 'division'
    };
    
    return pathMapping[learningPathId];
  }
  
  /**
   * Export user-specific data
   * @private
   */
  private async exportUserData(userId: string): Promise<any> {
    const masteryState = await this.getUserMasteryState(userId);
    const userSessions = Array.from(this.activeSessions.values())
      .filter(session => session.userId === userId);
    
    return {
      userId,
      masteryState,
      sessions: userSessions,
      exportDate: new Date().toISOString()
    };
  }
  
  /**
   * Export curriculum data
   * @private
   */
  private async exportCurriculumData(): Promise<any> {
    // Use ContentManager export functionality
    // Use APML-compliant exportCurriculum signature
    return this.contentManager.exportCurriculum('default-curriculum', 'Auto-exported curriculum data');
  }
  
  /**
   * Export full system data
   * @private
   */
  private async exportFullData(): Promise<any> {
    return {
      curriculum: await this.exportCurriculumData(),
      activeSessions: Array.from(this.activeSessions.values()),
      exportDate: new Date().toISOString()
    };
  }
  
  /**
   * Format export data according to requested format
   * @private
   */
  private formatExportData(data: any, format: string): string {
    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'csv':
        // Simple CSV conversion - can be enhanced
        return this.convertToCSV(data);
      case 'xml':
        // Simple XML conversion - can be enhanced
        return this.convertToXML(data);
      default:
        return JSON.stringify(data, null, 2);
    }
  }
  
  /**
   * Convert data to CSV format
   * @private
   */
  private convertToCSV(data: any): string {
    // Simple implementation - should be enhanced for complex data
    if (Array.isArray(data)) {
      const headers = Object.keys(data[0] || {});
      const csvHeaders = headers.join(',');
      const csvRows = data.map(row => 
        headers.map(header => JSON.stringify(row[header] || '')).join(',')
      );
      return [csvHeaders, ...csvRows].join('\n');
    }
    return JSON.stringify(data);
  }
  
  /**
   * Convert data to XML format
   * @private
   */
  private convertToXML(data: any): string {
    // Simple implementation - should be enhanced for complex data
    return `<?xml version="1.0" encoding="UTF-8"?>\n<data>${JSON.stringify(data)}</data>`;
  }
  

  /**
   * Map learning path to tube ID for Live Aid Architecture
   * @private
   */
  private mapLearningPathToTube(learningPathId: string): 'tube1' | 'tube2' | 'tube3' {
    switch (learningPathId) {
      case 'addition':
      case 'doubling':
      case 'halving':
        return 'tube1'; // Doubling/halving tube
      case 'multiplication':
        return 'tube2'; // Backwards multiplication tube
      case 'division':
      case 'algebra':
        return 'tube3'; // Division-as-algebra tube
      default:
        return 'tube1'; // Default to tube1
    }
  }

  /**
   * Extract tube ID from learning path
   * @private
   */
  private extractTubeIdFromPath(learningPathId: string): string {
    // Learning path might be something like "addition" -> map to tube ID
    // Return format that matches LiveAidManager cache keys
    switch (learningPathId) {
      case 'addition':
      case 'subtraction':
      case 'doubling':
      case 'halving':
        return 'tube1';
      case 'multiplication':
        return 'tube2';
      case 'division':
      case 'algebra':
        return 'tube3';
      default:
        return 'tube1'; // Default tube
    }
  }

  /**
   * Get current stitch ID for user in a tube
   * @private
   */
  private async getCurrentStitchId(userId: string, tubeId: string): Promise<string> {
    // This would normally check user's progression state
    // For now, simulate getting current position
    // Use tube positions to determine stitch ID
    // This is a simplified version - in production, this would track actual progress
    const stitchPosition = 1; // Start at first stitch
    
    // Convert tubeId format for stitch ID (tube1 -> t1)
    const shortTubeId = tubeId.replace('tube', 't');
    const stitchId = `${shortTubeId}-${String(stitchPosition).padStart(4, '0')}-0001`;
    return stitchId;
  }

  /**
   * Generate questions for a specific stitch
   * @private
   */
  private async generateQuestionsForStitch(userId: string, stitchId: string, config: SessionConfiguration): Promise<Question[]> {
    try {
      // Extract tube ID from stitch ID (format: t1-0001-0001)
      const tubeId = stitchId.split('-')[0] as 'tube1' | 'tube2' | 'tube3';
      
      // Use LiveAidManager to get ready stitch content
      const readyStitch = await this.liveAidManager.getReadyStitch(userId, tubeId);
      
      if (!readyStitch || !readyStitch.questions) {
        this.log(`No questions found for stitch: ${stitchId}`);
        return [];
      }
      
      // Convert ReadyQuestion format to Question format
      const questions: Question[] = readyStitch.questions.map(rq => ({
        id: rq.id,
        questionText: rq.text,
        correctAnswer: rq.correctAnswer,
        distractors: [rq.distractor],
        boundaryLevel: rq.boundaryLevel,
        difficulty: 1,
        factId: rq.factId,
        metadata: {
          ...rq.metadata,
          stitchId: readyStitch.stitchId,
          tubeId: readyStitch.tubeId
        }
      }));
      
      return questions;
    } catch (error) {
      this.log(`Failed to generate questions for stitch ${stitchId}: ${error}`);
      return [];
    }
  }

  /**
   * Generate questions from offline content
   * @private
   */
  private async generateQuestionsFromOfflineContent(offlineStitch: any, config: SessionConfiguration): Promise<Question[]> {
    try {
      const questions: Question[] = [];
      
      for (let i = 0; i < Math.min(offlineStitch.facts.length, config.maxQuestions || 20); i++) {
        const fact = offlineStitch.facts[i];
        
        questions.push({
          id: `offline-${fact.id || i}`,
          factId: fact.id || `offline-fact-${i}`,
          questionText: fact.questionText || `What is ${fact.operand1} ${fact.operation} ${fact.operand2}?`,
          correctAnswer: fact.answer || fact.correctAnswer,
          distractors: fact.distractors || [String(parseInt(fact.answer) + 1)],
          boundaryLevel: fact.boundaryLevel || 1,
          difficulty: fact.difficulty || 1,
          metadata: {
            isOffline: true,
            stitchId: offlineStitch.stitchId,
            ...fact.metadata
          }
        });
      }
      
      return questions;
    } catch (error) {
      this.log(`Failed to generate questions from offline content: ${error}`);
      return [];
    }
  }

  /**
   * Log service activities
   * @private
   */
  private log(message: string): void {
    console.log(`[LearningEngineService] ${message}`);
  }
  
  /**
   * Get content gating engine with fallback to dynamic import
   * @private
   */
  private async getContentGatingEngine(): Promise<any> {
    if (this.contentGatingEngine) {
      return this.contentGatingEngine;
    }
    
    // Fallback to dynamic import for backward compatibility
    try {
      const { contentGatingEngine } = await import('../engines/ContentGatingEngine');
      this.contentGatingEngine = contentGatingEngine;
      return contentGatingEngine;
    } catch (error) {
      throw new LearningEngineError(
        'LE-DEP-001',
        'ContentGatingEngine not available',
        { error: String(error) }
      );
    }
  }
  
  /**
   * Get offline content manager with fallback to dynamic import
   * @private
   */
  private async getOfflineContentManager(): Promise<any> {
    if (this.offlineContentManager) {
      return this.offlineContentManager;
    }
    
    // Fallback to dynamic import for backward compatibility
    try {
      const { offlineContentManager } = await import('../engines/OfflineContentManager');
      this.offlineContentManager = offlineContentManager;
      return offlineContentManager;
    } catch (error) {
      throw new LearningEngineError(
        'LE-DEP-002',
        'OfflineContentManager not available',
        { error: String(error) }
      );
    }
  }
}