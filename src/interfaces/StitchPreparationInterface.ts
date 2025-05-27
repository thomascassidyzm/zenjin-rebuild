/**
 * StitchPreparationInterface.ts
 * Generated from APML Interface Definition
 * Module: LearningEngine
 * 
 * Defines the contract for the StitchPreparation component that handles
 * background assembly of complete, ready-to-stream stitch content.
 * Following APML Framework v1.4.2 and naming.apml conventions
 */

/**
 * Import types from other interfaces
 */
import { StitchId, TubeId } from './StitchManagerInterface';
import { ReadyQuestion, ReadyStitch } from './StitchCacheInterface';
import { ConceptMapping } from './StitchPopulationInterface';

/**
 * Preparation stage tracking
 */
export interface PreparationStage {
  stageName: string; // "fact_selection", "distractor_generation", "question_assembly", "shuffling"
  stageProgress: number; // 0.0 to 1.0 completion for this stage
  stageStartTime: string;
  stageCompleteTime?: string;
  stageErrors?: string[];
}

/**
 * Complete preparation process tracking
 */
export interface PreparationProcess {
  processId: string; // Unique preparation process identifier
  userId: string;
  tubeId: TubeId;
  stitchId: StitchId;
  conceptMapping: ConceptMapping;
  stages: PreparationStage[]; // All preparation stages
  overallProgress: number; // 0.0 to 1.0 overall completion
  startTime: string;
  estimatedCompleteTime: string;
  actualCompleteTime?: string;
  status: 'queued' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  priority: 'high' | 'normal' | 'low';
}

/**
 * Assembly components for a single question
 */
export interface QuestionAssemblyComponents {
  factId: string; // Source mathematical fact
  factText: string; // Raw fact data (operands, operation, result)
  conceptCode: string; // Which concept this belongs to
  userBoundaryLevel: number; // User's current boundary level
  questionFormat: string; // Template for presentation
  targetIndex: number; // Position in final stitch (before shuffle)
}

/**
 * Distractor generation context
 */
export interface DistractorContext {
  correctAnswer: string; // The right answer
  boundaryLevel: number; // User's boundary level (1-5)
  operation: string; // Mathematical operation type
  operands: number[]; // Input numbers used
  conceptType: string; // "doubling", "multiplication", etc.
  previousDistractors: string[]; // Recent distractors to avoid repetition
}

/**
 * Question assembly result
 */
export interface QuestionAssemblyResult {
  question: ReadyQuestion; // Complete assembled question
  assemblyTime: number; // Time taken to assemble (ms)
  assemblySteps: string[]; // Steps performed during assembly
  qualityScore: number; // 0.0 to 1.0 quality assessment
}

/**
 * Batch preparation request
 */
export interface BatchPreparationRequest {
  userId: string;
  requests: {
    tubeId: TubeId;
    stitchId: StitchId;
    priority: 'high' | 'normal' | 'low';
  }[];
  maxConcurrentPreparations: number; // How many to prepare simultaneously
  targetCompletionTime: string; // When all should be ready
}

/**
 * Preparation quality metrics
 */
export interface PreparationQualityMetrics {
  averageAssemblyTime: number; // Average time per question assembly
  distractorQualityScore: number; // Quality of generated distractors
  boundaryLevelAccuracy: number; // Accuracy of boundary level targeting
  shuffleRandomness: number; // Quality of question shuffling
  cacheReadiness: number; // Percentage of stitches ready when needed
}

/**
 * Error codes for StitchPreparationInterface
 */
export enum StitchPreparationErrorCode {
  FACT_SELECTION_FAILED = 'FACT_SELECTION_FAILED',
  DISTRACTOR_GENERATION_FAILED = 'DISTRACTOR_GENERATION_FAILED',
  QUESTION_ASSEMBLY_FAILED = 'QUESTION_ASSEMBLY_FAILED',
  BOUNDARY_LEVEL_ASSESSMENT_FAILED = 'BOUNDARY_LEVEL_ASSESSMENT_FAILED',
  PREPARATION_TIMEOUT = 'PREPARATION_TIMEOUT',
  PREPARATION_CANCELLED = 'PREPARATION_CANCELLED',
  INSUFFICIENT_FACTS = 'INSUFFICIENT_FACTS',
  INVALID_CONCEPT_MAPPING = 'INVALID_CONCEPT_MAPPING',
  ASSEMBLY_QUALITY_TOO_LOW = 'ASSEMBLY_QUALITY_TOO_LOW'
}

/**
 * StitchPreparationInterface - Background Assembly System
 * Following APML Framework v1.4.2 principles for seamless content preparation
 */
export interface StitchPreparationInterface {
  /**
   * Prepares a complete stitch in background with full progress tracking
   * @param userId - User identifier
   * @param tubeId - Target tube
   * @param stitchId - Stitch identifier to prepare
   * @param conceptMapping - How to select and format content
   * @param priority - Preparation priority level
   * @returns Preparation process tracking information
   * @throws FACT_SELECTION_FAILED if Could not select appropriate facts
   * @throws PREPARATION_TIMEOUT if Preparation took too long
   * @throws INVALID_CONCEPT_MAPPING if Concept mapping is invalid
   */
  prepareStitch(
    userId: string, 
    tubeId: TubeId, 
    stitchId: StitchId, 
    conceptMapping: ConceptMapping, 
    priority: 'high' | 'normal' | 'low'
  ): Promise<PreparationProcess>;

  /**
   * Assembles a single ready question from components
   * @param components - All components needed for assembly
   * @param distractorContext - Context for distractor generation
   * @returns Complete assembled question
   * @throws QUESTION_ASSEMBLY_FAILED if Assembly process failed
   * @throws DISTRACTOR_GENERATION_FAILED if Distractor generation failed
   */
  assembleQuestion(
    components: QuestionAssemblyComponents, 
    distractorContext: DistractorContext
  ): Promise<QuestionAssemblyResult>;

  /**
   * Gets current preparation progress for a process
   * @param processId - Preparation process identifier
   * @returns Current process state and progress
   * @throws PREPARATION_CANCELLED if Process was cancelled
   */
  getPreparationProgress(processId: string): PreparationProcess;

  /**
   * Cancels an active preparation process
   * @param processId - Preparation process identifier
   * @returns Cancellation confirmation
   */
  cancelPreparation(processId: string): {
    cancelled: boolean;
    processId: string;
    cancellationTime: string;
    resourcesReleased: boolean;
  };

  /**
   * Handles batch preparation for multiple stitches
   * @param batchRequest - Multiple preparation requests
   * @returns Batch tracking with individual process IDs
   * @throws PREPARATION_TIMEOUT if Batch preparation exceeded time limit
   */
  prepareBatch(batchRequest: BatchPreparationRequest): Promise<{
    batchId: string;
    processIds: string[];
    estimatedBatchCompleteTime: string;
  }>;

  /**
   * Validates that a concept mapping can produce quality content
   * @param conceptMapping - Concept mapping to validate
   * @param userId - User identifier for boundary level context
   * @returns Validation result with quality prediction
   */
  validateConceptPreparation(conceptMapping: ConceptMapping, userId: string): {
    isValid: boolean;
    expectedQuality: number; // 0.0 to 1.0 predicted quality
    availableFactCount: number;
    estimatedPreparationTime: number;
    qualityIssues?: string[];
  };

  /**
   * Optimizes preparation performance based on system load
   * @param currentLoad - Current system load metrics
   * @returns Optimization settings applied
   */
  optimizePreparationPerformance(currentLoad: {
    cpuUsage: number;
    memoryUsage: number;
    activePreparations: number;
  }): {
    optimized: boolean;
    adjustmentsMade: string[];
    expectedPerformanceGain: number;
  };

  /**
   * Gets preparation quality metrics for monitoring
   * @param timeRange - Time range for metrics (optional)
   * @returns Quality metrics for preparation processes
   */
  getPreparationQualityMetrics(timeRange?: {
    startTime: string;
    endTime: string;
  }): PreparationQualityMetrics;

  /**
   * Emergency preparation for immediate use (bypasses normal queue)
   * @param userId - User identifier
   * @param stitchId - Stitch to prepare immediately
   * @param conceptMapping - Content mapping
   * @returns Emergency preparation result
   * @throws PREPARATION_TIMEOUT if Emergency preparation failed
   * @throws ASSEMBLY_QUALITY_TOO_LOW if Quality standards not met
   */
  emergencyPreparation(
    userId: string, 
    stitchId: StitchId, 
    conceptMapping: ConceptMapping
  ): Promise<ReadyStitch>;

}

// Export default interface
export default StitchPreparationInterface;