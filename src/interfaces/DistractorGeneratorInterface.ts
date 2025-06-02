/**
 * DistractorGeneratorInterface.ts
 * Generated from APML Interface Definition
 * Module: LearningEngine
 */


/**
 * Defines the contract for the DistractorGenerator component that generates appropriate distractors based on the boundary level and mathematical fact.
 */
/**
 * DistractorRequest
 */
export interface DistractorRequest {
  /** Mathematical fact identifier */
  factId: string;
  /** Boundary level (1-5) */
  boundaryLevel: number;
  /** The correct answer */
  correctAnswer: string;
  /** Number of distractors to generate */
  count?: number;
}

/**
 * Distractor
 */
export interface Distractor {
  /** The distractor value */
  value: string;
  /** The boundary level this distractor targets */
  boundaryLevel: number;
  /** Explanation of why this distractor was chosen */
  explanation?: string;
  /** Difficulty rating (0.0-1.0) */
  difficulty?: number;
}

/**
 * Error codes for DistractorGeneratorInterface
 */
export enum DistractorGeneratorErrorCode {
  INVALID_FACT = 'INVALID_FACT',
  INVALID_BOUNDARY_LEVEL = 'INVALID_BOUNDARY_LEVEL',
  GENERATION_FAILED = 'GENERATION_FAILED',
  INVALID_DISTRACTOR = 'INVALID_DISTRACTOR',
}

/**
 * DistractorGeneratorInterface
 */
export interface DistractorGeneratorInterface {
  /**
   * Generates a distractor based on the boundary level and mathematical fact
   * @param request - Distractor generation request
   * @returns Generated distractor
   * @throws INVALID_FACT if The specified fact is invalid or not found
   * @throws INVALID_BOUNDARY_LEVEL if The specified boundary level is invalid
   * @throws GENERATION_FAILED if Failed to generate a distractor
   */
  generateDistractor(request: DistractorRequest): Distractor;

  /**
   * Generates multiple distractors based on the boundary level and mathematical fact
   * @param request - Distractor generation request
   * @returns Array of generated distractors
   * @throws INVALID_FACT if The specified fact is invalid or not found
   * @throws INVALID_BOUNDARY_LEVEL if The specified boundary level is invalid
   * @throws GENERATION_FAILED if Failed to generate a distractor
   */
  generateMultipleDistractors(request: DistractorRequest): any[];

  /**
   * Gets an explanation for why a distractor was chosen
   * @param factId - Mathematical fact identifier
   * @param distractor - The distractor value
   * @param boundaryLevel - Boundary level (1-5)
   * @returns Explanation of why the distractor was chosen
   * @throws INVALID_FACT if The specified fact is invalid or not found
   * @throws INVALID_DISTRACTOR if The specified distractor is invalid
   * @throws INVALID_BOUNDARY_LEVEL if The specified boundary level is invalid
   */
  getDistractorExplanation(factId: string, distractor: string, boundaryLevel: number): string;

  /**
   * Validates whether a distractor is appropriate for the given boundary level and fact
   * @param factId - Mathematical fact identifier
   * @param distractor - The distractor value
   * @param boundaryLevel - Boundary level (1-5)
   * @param correctAnswer - The correct answer
   * @returns Validation result
   * @throws INVALID_FACT if The specified fact is invalid or not found
   * @throws INVALID_BOUNDARY_LEVEL if The specified boundary level is invalid
   */
  validateDistractor(factId: string, distractor: string, boundaryLevel: number, correctAnswer: string): { isValid: boolean; reason: string };

}

// Export default interface
export default DistractorGeneratorInterface;
