/**
 * QuestionGeneratorInterface.ts
 * Generated from APML Interface Definition
 * Module: LearningEngine
 */

/**
 * 
    Defines the contract for the QuestionGenerator component that generates questions based on the active learning path and user's progress.
  
 */
/**
 * Question
 */
export interface Question {
  id: string; // Unique identifier for the question
  factId: string; // Mathematical fact identifier
  text: string; // The question text to display
  correctAnswer: string; // The correct answer
  boundaryLevel: number; // The boundary level (1-5) this question is testing
  difficulty?: number; // Difficulty rating (0.0-1.0)
  metadata?: Record<string, any>; // Additional metadata for the question
}

/**
 * QuestionGenerationOptions
 */
export interface QuestionGenerationOptions {
  boundaryLevel?: number; // Specific boundary level to target
  difficulty?: number; // Desired difficulty level (0.0-1.0)
  excludeFactIds?: string[]; // Fact IDs to exclude from generation
  preferredOperations?: string[]; // Preferred mathematical operations
}

/**
 * Error codes for QuestionGeneratorInterface
 */
export enum QuestionGeneratorErrorCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  LEARNING_PATH_NOT_FOUND = 'LEARNING_PATH_NOT_FOUND',
  GENERATION_FAILED = 'GENERATION_FAILED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  LEARNING_PATH_NOT_FOUND = 'LEARNING_PATH_NOT_FOUND',
  NO_QUESTIONS_AVAILABLE = 'NO_QUESTIONS_AVAILABLE',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  LEARNING_PATH_NOT_FOUND = 'LEARNING_PATH_NOT_FOUND',
  GENERATION_FAILED = 'GENERATION_FAILED',
  INVALID_COUNT = 'INVALID_COUNT',
  QUESTION_NOT_FOUND = 'QUESTION_NOT_FOUND',
}

/**
 * QuestionGeneratorInterface
 */
export interface QuestionGeneratorInterface {
  /**
   * Generates a question for a specific user and learning path
   * @param userId - User identifier
   * @param learningPathId - Learning path identifier
   * @param options - Question generation options
   * @returns Generated question
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws LEARNING_PATH_NOT_FOUND if The specified learning path was not found
   * @throws GENERATION_FAILED if Failed to generate a question
   */
  generateQuestion(userId: string, learningPathId: string, options?: QuestionGenerationOptions): Question;

  /**
   * Gets the next question in the sequence for a user and learning path
   * @param userId - User identifier
   * @param learningPathId - Learning path identifier
   * @returns Next question in the sequence
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws LEARNING_PATH_NOT_FOUND if The specified learning path was not found
   * @throws NO_QUESTIONS_AVAILABLE if No more questions available in the sequence
   */
  getNextQuestion(userId: string, learningPathId: string): Question;

  /**
   * Generates a batch of questions for a specific user and learning path
   * @param userId - User identifier
   * @param learningPathId - Learning path identifier
   * @param count - Number of questions to generate
   * @param options - Question generation options
   * @returns Array of generated questions
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws LEARNING_PATH_NOT_FOUND if The specified learning path was not found
   * @throws GENERATION_FAILED if Failed to generate questions
   * @throws INVALID_COUNT if The specified count is invalid
   */
  generateQuestionBatch(userId: string, learningPathId: string, count: number, options?: QuestionGenerationOptions): Question[];

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
