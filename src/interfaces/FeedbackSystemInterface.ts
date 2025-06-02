/**
 * FeedbackSystemInterface.ts
 * Generated from APML Interface Definition
 * Module: UserInterface
 */


/**
 * Defines the contract for the FeedbackSystem component that manages visual and interactive feedback for user actions throughout the application.
 */
/**
 * FeedbackTarget
 */
export interface FeedbackTarget {
  /** Unique identifier for the target element */
  id: string;
  /** Type of the target element (e.g., 'button', 'card', 'circle') */
  type?: string;
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
  /** Whether to use haptic feedback (on supported devices) */
  haptic?: boolean;
  /** Animation style to use */
  animation?: string;
}

/**
 * FeedbackResult
 */
export interface FeedbackResult {
  /** Whether the feedback was successfully shown */
  success: boolean;
  /** ID of the target element */
  target: string;
  /** Type of feedback that was shown */
  feedbackType: string;
  /** Actual duration of the feedback in milliseconds */
  duration: number;
}

/**
 * Error codes for FeedbackSystemInterface
 */
export enum FeedbackSystemErrorCode {
  INVALID_TARGET = 'INVALID_TARGET',
  FEEDBACK_FAILED = 'FEEDBACK_FAILED',
  INVALID_FEEDBACK_TYPE = 'INVALID_FEEDBACK_TYPE',
  NO_ACTIVE_FEEDBACK = 'NO_ACTIVE_FEEDBACK',
}

/**
 * FeedbackSystemInterface
 */
export interface FeedbackSystemInterface {
  /**
   * Shows positive feedback for correct answers
   * @param target - The target element to show feedback on
   * @param options - Options for the feedback animation
   * @returns Result of the feedback operation
   * @throws INVALID_TARGET if The target element is invalid or not found
   * @throws FEEDBACK_FAILED if Failed to show feedback due to rendering issues
   */
  showCorrectFeedback(target: FeedbackTarget, options?: FeedbackOptions): FeedbackResult;

  /**
   * Shows negative feedback for incorrect answers
   * @param target - The target element to show feedback on
   * @param options - Options for the feedback animation
   * @returns Result of the feedback operation
   * @throws INVALID_TARGET if The target element is invalid or not found
   * @throws FEEDBACK_FAILED if Failed to show feedback due to rendering issues
   */
  showIncorrectFeedback(target: FeedbackTarget, options?: FeedbackOptions): FeedbackResult;

  /**
   * Shows neutral feedback for no-answer scenarios
   * @param target - The target element to show feedback on
   * @param options - Options for the feedback animation
   * @returns Result of the feedback operation
   * @throws INVALID_TARGET if The target element is invalid or not found
   * @throws FEEDBACK_FAILED if Failed to show feedback due to rendering issues
   */
  showNeutralFeedback(target: FeedbackTarget, options?: FeedbackOptions): FeedbackResult;

  /**
   * Shows timeout feedback when user doesn't respond within the allocated time
   * @param target - The target element to show feedback on
   * @param options - Options for the feedback animation
   * @returns Result of the feedback operation
   * @throws INVALID_TARGET if The target element is invalid or not found
   * @throws FEEDBACK_FAILED if Failed to show feedback due to rendering issues
   */
  showTimeoutFeedback(target: FeedbackTarget, options?: FeedbackOptions): FeedbackResult;

  /**
   * Shows custom feedback with specified parameters
   * @param target - The target element to show feedback on
   * @param feedbackType - Type of feedback to show
   * @param options - Options for the feedback animation
   * @returns Result of the feedback operation
   * @throws INVALID_TARGET if The target element is invalid or not found
   * @throws INVALID_FEEDBACK_TYPE if The specified feedback type is not supported
   * @throws FEEDBACK_FAILED if Failed to show feedback due to rendering issues
   */
  showCustomFeedback(target: FeedbackTarget, feedbackType: string, options?: FeedbackOptions): FeedbackResult;

  /**
   * Cancels any ongoing feedback animations on the specified target
   * @param target - The target element to cancel feedback on
   * @returns Whether the cancellation was successful
   * @throws INVALID_TARGET if The target element is invalid or not found
   * @throws NO_ACTIVE_FEEDBACK if No active feedback to cancel on the target
   */
  cancelFeedback(target: FeedbackTarget): boolean;

}

// Export default interface
export default FeedbackSystemInterface;
