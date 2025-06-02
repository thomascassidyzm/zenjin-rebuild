/**
 * PlayerFlowInterface.ts
 * Generated from APML Interface Definition
 * Module: PlayerFlow
 */

import { StitchManagerInterface } from './StitchManagerInterface';

/**
 * Defines the contract for player flow after authentication,
 * managing the learning experience from pre-engagement through session completion.
 */
/**
 * Current state of the player flow
 */
export interface PlayerState {
}

/**
 * Progress tracking for current session
 */
export interface SessionProgress {
  /** Number of questions answered */
  questionsAnswered: number;
  /** Total questions in current stitch */
  totalQuestions: number;
  /** Points earned in session */
  currentPoints: number;
  /** Session start time */
  startTime: string;
}

/**
 * Complete state of player flow
 */
export interface PlayerFlowState {
  /** Current player state */
  currentState: PlayerState;
  /** Type of user */
  userType: string;
  /** ID of current stitch being played */
  currentStitchId?: string;
  /** Progress in current session */
  sessionProgress?: SessionProgress;
  /** Whether content is loading */
  isLoading: boolean;
}

/**
 * Error codes for PlayerFlowInterface
 */
export enum PlayerFlowErrorCode {
  NO_ACTIVE_SESSION = 'NO_ACTIVE_SESSION',
  CONTENT_LOAD_FAILED = 'CONTENT_LOAD_FAILED',
  SESSION_ALREADY_ACTIVE = 'SESSION_ALREADY_ACTIVE',
  INVALID_STATE_TRANSITION = 'INVALID_STATE_TRANSITION',
  USER_NOT_INITIALIZED = 'USER_NOT_INITIALIZED',
}

/**
 * PlayerFlowInterface
 */
export interface PlayerFlowInterface {
  /**
   * Check if big play button should be shown (pre-engagement state)
   * @returns Whether to show big play button
   */
  showBigPlayButton(): boolean;

  /**
   * Start a new learning session
   * @param userId - User identifier
   * @returns Result
   * @throws SESSION_ALREADY_ACTIVE if A session is already active
   * @throws USER_NOT_INITIALIZED if User state not properly initialized
   * @throws CONTENT_LOAD_FAILED if Failed to load learning content
   */
  startLearningSession(userId: string): { sessionId: string; stitchId: string };

  /**
   * Load content for next stitch
   * @param userId - User identifier
   * @returns Result
   * @throws NO_ACTIVE_SESSION if No active session found
   * @throws CONTENT_LOAD_FAILED if Failed to load learning content
   */
  loadNextStitch(userId: string): { stitchId: string; questions: any[] };

  /**
   * Transition from loading to active learning state
   * @returns Whether transition was successful
   * @throws INVALID_STATE_TRANSITION if Invalid state transition attempted
   * @throws CONTENT_LOAD_FAILED if Failed to load learning content
   */
  transitionToActivelearning(): boolean;

  /**
   * Complete the current learning session
   * @param sessionId - Session identifier
   * @returns Result
   * @throws NO_ACTIVE_SESSION if No active session found
   */
  completeSession(sessionId: string): { totalPoints: number; questionsCompleted: number; sessionDuration: number };

  /**
   * Get current player flow state
   * @returns Current player flow state
   */
  getCurrentState(): PlayerFlowState;

  /**
   * Reset player to pre-engagement state
   * @returns Whether reset was successful
   */
  resetToPreEngagement(): boolean;

}

// Export default interface
export default PlayerFlowInterface;
