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
 */
export class LearningEngineService {
  private factRepository: FactRepository;
  private contentManager: ContentManager;
  private questionGenerator: QuestionGenerator;
  private distractorGenerator: DistractorGenerator;
  private distinctionManager: DistinctionManager;
  
  // Live Aid Architecture components
  private stitchPopulation: StitchPopulation;
  private stitchPreparation: StitchPreparation;
  private stitchCache: StitchCache;
  private liveAidManager: LiveAidManager;
  
  // Active learning sessions
  private activeSessions: Map<string, LearningSession> = new Map();
  
  // Service state
  private isInitialized: boolean = false;
  
  /**
   * Initialize LearningEngine service with component dependencies
   */
  constructor() {
    this.initializeComponents();
  }
  
  /**
   * Initialize all LearningEngine components
   * @private
   */
  private initializeComponents(): void {
    try {
      // Initialize components in dependency order
      this.factRepository = new FactRepository();
      this.contentManager = new ContentManager(this.factRepository);
      this.distinctionManager = new DistinctionManager();
      this.distractorGenerator = new DistractorGenerator(this.factRepository);
      this.questionGenerator = new QuestionGenerator(
        this.factRepository,
        this.distinctionManager,
        // Mock TripleHelixManager - will be replaced with real integration
        {
          getActiveLearningPath: (userId: string) => ({ id: 'addition', name: 'Addition', difficulty: 1 }),
          getUserCurrentStitch: (userId: string) => null,
          updateUserProgress: () => Promise.resolve()
        } as any,
        this.distractorGenerator
      );
      
      // Initialize Live Aid Architecture components in proper sequence
      this.stitchPopulation = new StitchPopulation(this.factRepository);
      this.stitchPreparation = new StitchPreparation(
        this.factRepository,
        this.distinctionManager,
        this.distractorGenerator,
        this.questionGenerator
      );
      this.stitchCache = new StitchCache();
      this.liveAidManager = new LiveAidManager(
        this.stitchPopulation,
        this.stitchPreparation,
        this.stitchCache
      );
      
      this.isInitialized = true;
      this.log('LearningEngine service initialized successfully with Live Aid Architecture');
    } catch (error) {
      throw new LearningEngineError(
        'LE-INIT-001',
        'Failed to initialize LearningEngine service',
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
        initialQuestions: initialQuestions.slice(0, 3)
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
      
      // Determine if session should continue
      const maxQuestions = session.configuration.maxQuestions || 10;
      const sessionComplete = session.responses.length >= maxQuestions;
      
      // Generate next question if session continues
      let nextQuestion: Question | null = null;
      if (!sessionComplete) {
        try {
          nextQuestion = await this.generateQuestion(sessionId, session.userId);
        } catch (error) {
          // If we can't generate more questions, end the session
          this.log(`Unable to generate next question, ending session: ${sessionId}`);
        }
      }
      
      // Mark session as complete if needed
      if (sessionComplete || !nextQuestion) {
        session.isActive = false;
        this.log(`Learning session completed: ${sessionId}`);
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
      // Generate questions for the learning path concept
      this.log(`Generating 20-question stitch for learning path: ${learningPathId}`);
      
      // Use Live Aid Architecture for Netflix-like question generation
      const tubeId = this.mapLearningPathToTube(learningPathId);
      let readyStitch;
      
      try {
        readyStitch = this.stitchCache.getReadyStitch(userId, tubeId);
        this.log(`Cache hit for ${userId}/${tubeId} - using Live Aid content`);
      } catch (error) {
        this.log(`Cache miss for ${userId}/${tubeId}: ${error.message} - using fallback`);
        readyStitch = null;
      }
      
      if (readyStitch && readyStitch.questions.length > 0) {
        // Convert ReadyStitch questions to LearningEngine Question format
        const questions: Question[] = readyStitch.questions.map((q, index) => ({
          id: q.id,
          factId: q.factId,
          questionText: q.text,
          correctAnswer: q.correctAnswer,
          distractors: q.distractor ? [q.distractor] : [],
          boundaryLevel: q.boundaryLevel || 1,
          difficulty: q.boundaryLevel || 1,
          metadata: {
            learningPathId: learningPathId,
            stitchId: readyStitch.stitchId,
            conceptName: readyStitch.conceptName
          }
        }));
        
        this.log(`Generated ${questions.length} Live Aid questions for ${readyStitch.conceptName}`);
        return questions;
      } else {
        // NEW USERS: Hard-code the first stitch (always the same)
        this.log(`New user ${userId} - generating hard-coded first stitch for ${learningPathId}`);
        return this.generateFirstStitchForNewUser(learningPathId);
      }
      
    } catch (error) {
      this.log(`Failed to generate stitch questions: ${error} - using hard-coded first stitch`);
      // For any error, use the hard-coded first stitch (same for all new users)
      return this.generateFirstStitchForNewUser(learningPathId);
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
        isCorrect: response.isCorrect,
        responseTime: response.responseTime,
        boundaryLevel: question.boundaryLevel
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
   * Generate hard-coded first stitch for new users (always the same)
   * @private
   */
  private generateFirstStitchForNewUser(learningPathId: string): Question[] {
    // First stitch is ALWAYS doubling numbers ending in 0/5 (easiest)
    const doublingQuestions = [
      { question: 'Double 10', answer: '20', distractor: '19' },
      { question: 'Double 15', answer: '30', distractor: '31' },
      { question: 'Double 20', answer: '40', distractor: '39' },
      { question: 'Double 25', answer: '50', distractor: '51' },
      { question: 'Double 30', answer: '60', distractor: '59' },
      { question: 'Double 35', answer: '70', distractor: '71' },
      { question: 'Double 40', answer: '80', distractor: '79' },
      { question: 'Double 45', answer: '90', distractor: '91' },
      { question: 'Double 5', answer: '10', distractor: '11' },
      { question: 'Double 50', answer: '100', distractor: '99' },
      { question: 'Half of 20', answer: '10', distractor: '11' },
      { question: 'Half of 30', answer: '15', distractor: '14' },
      { question: 'Half of 40', answer: '20', distractor: '21' },
      { question: 'Half of 50', answer: '25', distractor: '24' },
      { question: 'Half of 60', answer: '30', distractor: '31' },
      { question: 'Half of 70', answer: '35', distractor: '34' },
      { question: 'Half of 80', answer: '40', distractor: '41' },
      { question: 'Half of 90', answer: '45', distractor: '44' },
      { question: 'Half of 100', answer: '50', distractor: '51' },
      { question: 'Half of 10', answer: '5', distractor: '6' }
    ];

    const questions: Question[] = doublingQuestions.map((q, index) => ({
      id: `first-stitch-q${index + 1}-${Date.now()}`,
      factId: `doubling-0-5-endings-${index + 1}`,
      questionText: q.question,
      correctAnswer: q.answer,
      distractors: [q.distractor],
      boundaryLevel: 1,
      difficulty: 1,
      metadata: {
        learningPathId: learningPathId,
        stitchId: 't1-0001-0001', // First stitch in tube 1
        conceptName: 'doubling_0_5_endings_1',
        hardCoded: true
      }
    }));

    return questions;
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
   * Log service activities
   * @private
   */
  private log(message: string): void {
    console.log(`[LearningEngineService] ${message}`);
  }
}

// Export singleton instance following APML service pattern
export const learningEngineService = new LearningEngineService();