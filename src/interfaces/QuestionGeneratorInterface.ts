/**
 * QuestionGeneratorInterface.ts
 * Generated from APML Interface Definition
 * Module: LearningEngine
 * 
 * UPDATED: Stitch-based content assembly architecture
 * Following APML Framework v1.4.2 and naming.apml conventions
 */

/**
 * Defines the contract for the QuestionGenerator component that assembles complete questions
 * from facts, boundary levels, and distractors for specific stitches.
 */
/**
 * Import types from other interfaces
 */
import { StitchId } from './StitchManagerInterface';

/**
 * Complete question ready for PlayerCard
 */
export interface Question {
  id: string; // Unique identifier for this question instance
  stitchId: StitchId; // Which stitch this question belongs to
  factId: string; // Mathematical fact identifier
  text: string; // Question text to display ("What is 7 × 8?")
  correctAnswer: string; // The correct answer ("56")
  distractor: string; // Single distractor based on boundary level ("15")
  boundaryLevel: number; // Boundary level (1-5) for this question
  difficulty?: number; // Difficulty rating (0.0-1.0)
  metadata?: {
    conceptCode: string; // From stitch ID ("0001")
    operation: string; // Mathematical operation ("multiplication")
    responseTimeTarget?: number; // Expected response time (ms)
  };
}

/**
 * Stitch content request - what the app layer asks for
 */
export interface StitchContentRequest {
  stitchId: StitchId; // Which stitch to generate content for
  userId?: string; // User identifier (for personalization)
  questionCount?: number; // Number of questions requested (adaptive)
  shuffled?: boolean; // Whether to shuffle question order (default: true)
}

/**
 * Complete stitch content ready for PlayerCard
 */
export interface StitchContent {
  stitchId: StitchId; // Stitch identifier
  questions: Question[]; // Array of ready questions (could be 20, 10, 5, etc.)
  metadata: {
    conceptName: string; // Human-readable concept name
    totalQuestions: number; // How many questions in this session
    boundaryLevel: number; // Stitch's current boundary level
    estimatedDuration: number; // Estimated completion time (ms)
    adaptiveParameters?: {
      questionCount: number; // Adaptive question count used
      difficultyRange: [number, number]; // Difficulty range applied
      reasonForAdaptation?: string; // Why this adaptation was made
    };
  };
}

/**
 * Question assembly components (what QuestionGenerator receives)
 */
export interface QuestionAssemblyComponents {
  factId: string; // Mathematical fact identifier
  factText: string; // Question text from fact ("What is 7 × 8?")
  correctAnswer: string; // Correct answer from fact ("56")
  boundaryLevel: number; // Current boundary level for stitch
  distractor: string; // Distractor from DistractorGenerator
  stitchId: StitchId; // Stitch this question belongs to
}

/**
 * Background preparation request (for Live Aid model)
 */
export interface BackgroundPreparationRequest {
  stitchId: StitchId; // Stitch to prepare
  priority: 'live' | 'ready' | 'preparing'; // Preparation priority
  userId: string; // User for personalization
}

/**
 * Error codes for QuestionGeneratorInterface
 */
export enum QuestionGeneratorErrorCode {
  STITCH_NOT_FOUND = 'STITCH_NOT_FOUND',
  FACTS_NOT_AVAILABLE = 'FACTS_NOT_AVAILABLE',
  ASSEMBLY_FAILED = 'ASSEMBLY_FAILED',
  INVALID_BOUNDARY_LEVEL = 'INVALID_BOUNDARY_LEVEL',
  DISTRACTOR_GENERATION_FAILED = 'DISTRACTOR_GENERATION_FAILED',
  CONTENT_PREPARATION_FAILED = 'CONTENT_PREPARATION_FAILED',
  INVALID_QUESTION_COUNT = 'INVALID_QUESTION_COUNT',
  STITCH_CONTENT_EXPIRED = 'STITCH_CONTENT_EXPIRED',
  BACKGROUND_PREPARATION_FAILED = 'BACKGROUND_PREPARATION_FAILED'
}

/**
 * QuestionGeneratorInterface - Clean Assembly Architecture
 * Following APML Framework v1.4.2 principles for content layer separation
 */
export interface QuestionGeneratorInterface {
  /**
   * Generates complete stitch content (primary app layer interface)
   * Assembles facts + boundary level + distractors into ready questions
   * @param request - Stitch content request
   * @returns Complete stitch content ready for PlayerCard
   * @throws STITCH_NOT_FOUND if The specified stitch was not found
   * @throws FACTS_NOT_AVAILABLE if No facts available for the stitch
   * @throws ASSEMBLY_FAILED if Failed to assemble complete content
   */
  generateStitchContent(request: StitchContentRequest): Promise<StitchContent>;

  /**
   * Assembles a single question from provided components
   * Core assembly logic: fact + boundary level + distractor → complete question
   * @param components - All components needed for assembly
   * @returns Assembled question
   * @throws ASSEMBLY_FAILED if Failed to assemble the question
   * @throws INVALID_BOUNDARY_LEVEL if Boundary level is invalid
   */
  assembleQuestion(components: QuestionAssemblyComponents): Question;

  /**
   * Prepares stitch content in background (Live Aid model)
   * Pre-assembles content for ready/preparing tubes
   * @param request - Background preparation request
   * @returns Preparation result with cached content reference
   * @throws STITCH_NOT_FOUND if The specified stitch was not found
   * @throws BACKGROUND_PREPARATION_FAILED if Failed to prepare content
   */
  prepareStitchContent(request: BackgroundPreparationRequest): Promise<{ prepared: boolean; contentId: string }>;

  /**
   * Retrieves cached stitch content (if prepared in background)
   * @param stitchId - Stitch identifier
   * @param userId - User identifier
   * @returns Cached stitch content or null if not prepared
   * @throws STITCH_CONTENT_EXPIRED if Cached content has expired
   */
  getCachedStitchContent(stitchId: StitchId, userId: string): StitchContent | null;

  /**
   * Validates that all required components are available for stitch content generation
   * @param stitchId - Stitch identifier to validate
   * @returns Validation result with missing components (if any)
   */
  validateStitchComponents(stitchId: StitchId): {
    isValid: boolean;
    missingComponents: Array<'facts' | 'boundaryLevel' | 'distractorGenerator'>;
    errorMessage?: string;
  };

}

// Export default interface
export default QuestionGeneratorInterface;
