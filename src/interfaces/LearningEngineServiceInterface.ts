/**
 * APML v2.2 Learning Engine Service Interface
 * 
 * Design Principles:
 * 1. Dependencies are explicitly declared and injected
 * 2. No internal service creation - all dependencies come from outside
 * 3. Service is stateless except for active sessions
 * 4. All operations are async for consistency
 */

import type { FactRepository } from '../engines/FactRepository/FactRepository';
import type { ContentManager } from '../engines/ContentManager/ContentManager';
import type { QuestionGenerator } from '../engines/QuestionGenerator/QuestionGenerator';
import type { DistractorGenerator } from '../engines/DistractorGenerator/DistractorGenerator';
import type { DistinctionManager } from '../engines/DistinctionManager/DistinctionManager';
import type { StitchPopulation } from '../engines/StitchPopulation/StitchPopulation';
import type { StitchPreparation } from '../engines/StitchPreparation/StitchPreparation';
import type { StitchCache } from '../engines/StitchCache/StitchCache';
import type { LiveAidManager } from '../engines/LiveAidManager/LiveAidManager';
import type { TripleHelixManager } from '../engines/TripleHelixManager/TripleHelixManager';

/**
 * Dependencies required by LearningEngineService
 * All dependencies must be provided during construction
 */
export interface LearningEngineDependencies {
  // Core engine components
  factRepository: FactRepository;
  contentManager: ContentManager;
  questionGenerator: QuestionGenerator;
  distractorGenerator: DistractorGenerator;
  distinctionManager: DistinctionManager;
  tripleHelixManager: TripleHelixManager;
  
  // Live Aid Architecture components
  stitchPopulation: StitchPopulation;
  stitchPreparation: StitchPreparation;
  stitchCache: StitchCache;
  liveAidManager: LiveAidManager;
  
  // External service dependencies
  contentGatingEngine?: any; // Optional for backward compatibility
  offlineContentManager?: any; // Optional for backward compatibility
}

/**
 * Configuration for LearningEngineService
 */
export interface LearningEngineConfiguration {
  enableLiveAid: boolean;
  maxSessionsPerUser: number;
  sessionTimeoutMs: number;
  defaultQuestionCount: number;
}

/**
 * Learning Engine Service Interface
 * Manages learning sessions and coordinates between engine components
 */
export interface LearningEngineServiceInterface {
  /**
   * Initialize a new learning session
   */
  initializeLearningSession(
    userId: string,
    learningPathId: string,
    config?: any
  ): Promise<{
    sessionId: string;
    initialQuestions: any[];
  }>;
  
  /**
   * Generate a question for active session
   */
  generateQuestion(
    sessionId: string,
    userId: string,
    questionRequest?: any
  ): Promise<any>;
  
  /**
   * Process user response
   */
  processUserResponse(
    sessionId: string,
    questionId: string,
    userResponse: any
  ): Promise<{
    feedback: any;
    nextQuestion: any | null;
    sessionComplete: boolean;
  }>;
  
  /**
   * Get user mastery state
   */
  getUserMasteryState(userId: string): Promise<any>;
  
  /**
   * Complete an active session
   */
  completeSession(sessionId: string): Promise<boolean>;
  
  /**
   * Export learning data
   */
  exportLearningData(
    exportType: string,
    userId?: string,
    format?: string
  ): Promise<string>;
}

/**
 * Factory function type for creating LearningEngineService
 * This ensures proper dependency injection
 */
export type LearningEngineServiceFactory = (
  dependencies: LearningEngineDependencies,
  configuration?: LearningEngineConfiguration
) => LearningEngineServiceInterface;