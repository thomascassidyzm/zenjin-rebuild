/**
 * StitchGeneratorInterface.ts
 * Generated from APML Interface Definition
 * Module: LearningEngine
 */

import { FactRepositoryInterface } from './FactRepositoryInterface';
import { DistinctionManagerInterface } from './DistinctionManagerInterface';
import { StitchManagerInterface } from './StitchManagerInterface';

/**
 * Recipe for generating questions from a stitch
 */
export interface StitchSpecification {
  /** Stitch identifier (tX-YYYY-ZZZZ format) */
  stitch_id: string;
  /** Type of mathematical concept */
  concept_type: string;
  /** Parameters specific to the concept type */
  concept_params: Record<string, any>;
  /** Current boundary level for distractor generation */
  boundary_level: number;
}

/**
 * A single question with answer and distractor
 */
export interface GeneratedQuestion {
  /** Unique question identifier for this session */
  id: string;
  /** Reference to the underlying fact */
  fact_id: string;
  /** Question text (e.g., '6 × 4') */
  statement: string;
  /** The correct answer */
  correct_answer: string;
  /** The incorrect option based on boundary level */
  distractor: string;
  metadata: {
    boundary_level: number;
    distractor_type: string;
    generation_timestamp: string;
  };
}

/**
 * Result of generating questions for a stitch
 */
export interface GenerationResult {
  stitch_id: string;
  questions: [object Object][];
  /** Time taken to generate questions in milliseconds */
  generation_time_ms: number;
  /** Key for caching this result if needed */
  cache_key: string;
}

/**
 * Error codes for StitchGeneratorInterface
 */
export enum StitchGeneratorErrorCode {
  INSUFFICIENT_FACTS = 'INSUFFICIENT_FACTS',
  INVALID_CONCEPT_TYPE = 'INVALID_CONCEPT_TYPE',
  INVALID_CONCEPT_PARAMS = 'INVALID_CONCEPT_PARAMS',
  GENERATION_TIMEOUT = 'GENERATION_TIMEOUT',
  DISTRACTOR_GENERATION_FAILED = 'DISTRACTOR_GENERATION_FAILED',
}

/**
 * StitchGeneratorInterface
 */
export interface StitchGeneratorInterface {
  /**
   * Generate 20 questions from a stitch specification
   * @param specification - The stitch recipe and parameters
   * @param user_id - User ID for personalization
   * @param shuffle_seed - Optional seed for reproducible shuffling
   * @returns 20 generated questions with distractors
   * @throws INSUFFICIENT_FACTS if Not enough facts available for the specified concept
   * @throws INVALID_CONCEPT_TYPE if Unknown or unsupported concept type
   * @throws INVALID_CONCEPT_PARAMS if Concept parameters are invalid or incomplete
   * @throws GENERATION_TIMEOUT if Question generation exceeded time limit
   * @throws DISTRACTOR_GENERATION_FAILED if Unable to generate appropriate distractors
   */
  generateQuestions(specification: StitchSpecification, user_id: string, shuffle_seed?: number): GenerationResult;

  /**
   * Preload facts into memory for faster generation
   * @param stitch_id - stitch_id
   * @returns True if facts were successfully preloaded
   */
  preloadFactsForStitch(stitch_id: string): Promise<boolean>;

  /**
   * Validate that a stitch can generate enough questions
   * @param specification - specification
   * @returns Result
   */
  validateStitchSpecification(specification: StitchSpecification): { is_valid: boolean; available_facts: number; missing_facts: any[]; warnings: any[] };

}

// Export default interface
export default StitchGeneratorInterface;
