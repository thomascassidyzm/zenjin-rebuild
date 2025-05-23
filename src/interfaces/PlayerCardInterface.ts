/**
 * PlayerCardInterface.ts
 * Generated from APML Interface Definition
 * Module: UserInterface
 */

/**
 * 
    Defines the contract for the PlayerCard component that presents questions with binary choices and provides appropriate visual feedback based on user responses.
  
 */
/**
 * Question
 */
export interface Question {
  id: string; // Unique identifier for the question
  text: string; // The question text to display
  correctAnswer: string; // The correct answer
  distractor: string; // The incorrect answer (distractor)
  boundaryLevel: number; // The boundary level (1-5) this question is testing
  factId: string; // The mathematical fact ID this question relates to
}

/**
 * Response
 */
export interface Response {
  questionId: string; // The ID of the question being answered
  selectedAnswer: string; // The answer selected by the user
  isCorrect: boolean; // Whether the selected answer is correct
  responseTime: number; // Time taken to respond in milliseconds
  isFirstAttempt: boolean; // Whether this is the first attempt at answering this question
}

/**
 * FeedbackOptions
 */
export interface FeedbackOptions {
  duration?: number; // Duration of the feedback animation in milliseconds
  intensity?: number; // Intensity of the feedback animation (0.0-1.0)
  sound?: boolean; // Whether to play sound with the feedback
}

/**
 * Error codes for PlayerCardInterface
 */
export enum PlayerCardErrorCode {
  INVALID_QUESTION = 'INVALID_QUESTION',
  PRESENTATION_FAILED = 'PRESENTATION_FAILED',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  FEEDBACK_FAILED = 'FEEDBACK_FAILED',
  INVALID_QUESTION_ID = 'INVALID_QUESTION_ID',
  FEEDBACK_FAILED = 'FEEDBACK_FAILED',
  RESET_FAILED = 'RESET_FAILED',
}

/**
 * PlayerCardInterface
 */
export interface PlayerCardInterface {
  /**
   * Presents a question to the user with binary choices
   * @param question - The question to present
   * @param options - Presentation options
   * @returns Whether the question was successfully presented
   * @throws INVALID_QUESTION if The question object is invalid or incomplete
   * @throws PRESENTATION_FAILED if Failed to present the question due to rendering issues
   */
  presentQuestion(question: Question, options?: { timeout?: number; animation?: string }): boolean;

  /**
   * Handles user response to a question and provides appropriate feedback
   * @param response - The user's response
   * @param feedbackOptions - Options for the feedback animation
   * @returns Result of handling the response
   * @throws INVALID_RESPONSE if The response object is invalid or incomplete
   * @throws FEEDBACK_FAILED if Failed to show feedback due to rendering issues
   */
  handleResponse(response: Response, feedbackOptions?: FeedbackOptions): { processed: boolean; feedbackShown: boolean };

  /**
   * Handles timeout when user doesn't respond within the allocated time
   * @param questionId - ID of the question that timed out
   * @returns Result of handling the timeout
   * @throws INVALID_QUESTION_ID if The question ID is invalid or unknown
   * @throws FEEDBACK_FAILED if Failed to show timeout feedback due to rendering issues
   */
  handleTimeout(questionId: string): { processed: boolean; feedbackShown: boolean };

  /**
   * Resets the PlayerCard to its initial state
   * @returns Whether the reset was successful
   * @throws RESET_FAILED if Failed to reset the PlayerCard
   */
  reset(): boolean;

  /**
   * Event callback when user selects an answer
   * @param callback - Function to handle the event
   * @param callback.response - The user's response data
   */
  onAnswerSelected(callback: (response: Response) => void): void;

}

// Export default interface
export default PlayerCardInterface;
