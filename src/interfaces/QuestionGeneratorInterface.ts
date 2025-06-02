/**
 * QuestionGeneratorInterface.ts
 * Generated from APML Interface Definition
 * Module: LearningEngine
 */


/**
 * Defines the contract for the QuestionGenerator component that generates questions based on the active stitch and user's progress.
 */
/**
 * Question
 */
export interface Question {
  /** Unique identifier for the question */
  id: string;
  /** Mathematical fact identifier */
  factId: string;
  /** The question text to display */
  text: string;
  /** The correct answer */
  correctAnswer: string;
  /** The incorrect answer (distractor) */
  distractor: string;
  /** The boundary level (1-5) this question is testing */
  boundaryLevel: number;
  /** Difficulty rating (0.0-1.0) */
  difficulty?: number;
  /** Additional metadata for the question */
  metadata?: Record<string, any>;
}

/**
 * QuestionGenerationOptions
 */
export interface QuestionGenerationOptions {
  /** Specific boundary level to target */
  boundaryLevel?: number;
  /** Desired difficulty level (0.0-1.0) */
  difficulty?: number;
  /** Fact IDs to exclude from generation */
  excludeFactIds?: string[];
  /** Preferred mathematical operations */
  preferredOperations?: string[];
}

/**
 * Error codes for QuestionGeneratorInterface
 */
export enum QuestionGeneratorErrorCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  STITCH_NOT_FOUND = 'STITCH_NOT_FOUND',
  GENERATION_FAILED = 'GENERATION_FAILED',
  NO_QUESTIONS_AVAILABLE = 'NO_QUESTIONS_AVAILABLE',
  INVALID_COUNT = 'INVALID_COUNT',
  QUESTION_NOT_FOUND = 'QUESTION_NOT_FOUND',
}

/**
 * QuestionGeneratorInterface
 */
export interface QuestionGeneratorInterface {
  /**
   * Generates a question for a specific user and stitch
   * @param userId - User identifier
   * @param stitchId - Stitch identifier
   * @param options - Question generation options
   * @returns Generated question
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws STITCH_NOT_FOUND if The specified stitch was not found
   * @throws GENERATION_FAILED if Failed to generate a question
   */
  generateQuestion(userId: string, stitchId: string, options?: QuestionGenerationOptions): Question;

  /**
   * Gets the next question in the sequence for a user and stitch
   * @param userId - User identifier
   * @param stitchId - Stitch identifier
   * @returns Next question in the sequence
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws STITCH_NOT_FOUND if The specified stitch was not found
   * @throws NO_QUESTIONS_AVAILABLE if No more questions available in the sequence
   */
  getNextQuestion(userId: string, stitchId: string): Question;

  /**
   * Generates a batch of questions for a specific user and stitch
   * @param userId - User identifier
   * @param stitchId - Stitch identifier
   * @param count - Number of questions to generate
   * @param options - Question generation options
   * @returns Array of generated questions
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws STITCH_NOT_FOUND if The specified stitch was not found
   * @throws GENERATION_FAILED if Failed to generate a question
   * @throws INVALID_COUNT if The specified count is invalid
   */
  generateQuestionBatch(userId: string, stitchId: string, count: number, options?: QuestionGenerationOptions): any[];

  /**
   * Gets a question by its identifier
   * @param questionId - Question identifier
   * @returns The question with the specified ID
   * @throws QUESTION_NOT_FOUND if The specified question was not found
   */
  getQuestionById(questionId: string): Question;

}

// Export default interface
export default QuestionGeneratorInterface;
