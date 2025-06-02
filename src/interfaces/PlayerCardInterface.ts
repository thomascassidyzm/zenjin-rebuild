/**
 * PlayerCardInterface.ts
 * Generated from APML Interface Definition
 * Module: UserInterface
 */


/**
 * Defines the contract for the PlayerCard component that presents questions with binary choices and provides appropriate visual feedback based on user responses.
 */
/**
 * Question
 */
export interface Question {
  /** Unique identifier for the question */
  id: string;
  /** The question text to display */
  text: string;
  /** The correct answer */
  correctAnswer: string;
  /** The incorrect answer (distractor) */
  distractor: string;
  /** The boundary level (1-5) this question is testing */
  boundaryLevel: number;
  /** The mathematical fact ID this question relates to */
  factId?: string;
  /** Additional metadata for the question */
  metadata?: Record<string, any>;
}

/**
 * Response
 */
export interface Response {
  /** The ID of the question being answered */
  questionId: string;
  /** The answer selected by the user */
  selectedAnswer: string;
  /** Whether the selected answer is correct */
  isCorrect: boolean;
  /** Time taken to respond in milliseconds */
  responseTime: number;
  /** Whether this is the first attempt at answering this question */
  isFirstAttempt: boolean;
}

/**
 * FeedbackOptions
 */
export interface FeedbackOptions {
  /** Duration of the feedback animation in milliseconds */
  duration?: number;
  /** Intensity of the feedback animation (0.0-1.0) */
  intensity?: number;
  /** Whether to play sound with the feedback */
  sound?: boolean;
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
  presentQuestion(question: Question, options?: Record<string, any>): boolean;

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
   * @throws FEEDBACK_FAILED if Failed to show feedback due to rendering issues
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
   */
  onAnswerSelected(): Promise<void>;

}

// Export default interface
export default PlayerCardInterface;
