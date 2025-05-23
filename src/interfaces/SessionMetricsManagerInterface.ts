/**
 * SessionMetricsManagerInterface.ts
 * Generated from APML Interface Definition
 * Module: MetricsSystem
 */

/**
 * 
    Defines the contract for the SessionMetricsManager component that calculates and manages metrics for individual learning sessions.
  
 */
/**
 * SessionConfig
 */
export interface SessionConfig {
  duration?: number; // Target session duration in seconds
  questionCount?: number; // Target number of questions
  learningPathId?: string; // Learning path identifier
  stitchId?: string; // Stitch identifier
}

/**
 * AnswerRecord
 */
export interface AnswerRecord {
  questionId: string; // Question identifier
  isCorrect: boolean; // Whether the answer was correct
  isFirstAttempt: boolean; // Whether this was the first attempt
  responseTime: number; // Response time in milliseconds
  timestamp: string; // ISO date string of the answer
}

/**
 * SessionSummary
 */
export interface SessionSummary {
  sessionId: string; // Session identifier
  userId: string; // User identifier
  duration: number; // Actual session duration in milliseconds
  questionCount: number; // Number of questions answered
  ftcCount: number; // Number of first-time correct answers
  ecCount: number; // Number of eventually correct answers
  incorrectCount: number; // Number of incorrect answers
  ftcPoints: number; // First-time correct points
  ecPoints: number; // Eventually correct points
  basePoints: number; // Base points (FTC + EC)
  consistency: number; // Consistency score (0.0-1.0)
  accuracy: number; // Accuracy score (0.0-1.0)
  speed: number; // Speed score (0.0-1.0)
  bonusMultiplier: number; // Bonus multiplier
  blinkSpeed: number; // Blink speed (ms per FTC answer)
  totalPoints: number; // Total points (base × bonus)
  startTime: string; // ISO date string of session start
  endTime: string; // ISO date string of session end
}

/**
 * Error codes for SessionMetricsManagerInterface
 */
export enum SessionMetricsManagerErrorCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_CONFIG = 'INVALID_CONFIG',
  SESSION_START_FAILED = 'SESSION_START_FAILED',
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  INVALID_ANSWER = 'INVALID_ANSWER',
  SESSION_ENDED = 'SESSION_ENDED',
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  SESSION_ENDED = 'SESSION_ENDED',
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  SESSION_ALREADY_ENDED = 'SESSION_ALREADY_ENDED',
  SUMMARY_GENERATION_FAILED = 'SUMMARY_GENERATION_FAILED',
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  SESSION_NOT_ENDED = 'SESSION_NOT_ENDED',
}

/**
 * SessionMetricsManagerInterface
 */
export interface SessionMetricsManagerInterface {
  /**
   * Starts a new learning session
   * @param userId - User identifier
   * @param sessionConfig - Session configuration
   * @returns Identifier for the new session
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws INVALID_CONFIG if The session configuration is invalid
   * @throws SESSION_START_FAILED if Failed to start the session
   */
  startSession(userId: string, sessionConfig?: SessionConfig): string;

  /**
   * Records an answer during the session
   * @param sessionId - Session identifier
   * @param answer - Answer record
   * @returns Whether the answer was successfully recorded
   * @throws SESSION_NOT_FOUND if The specified session was not found
   * @throws INVALID_ANSWER if The answer record is invalid
   * @throws SESSION_ENDED if The session has already ended
   */
  recordAnswer(sessionId: string, answer: AnswerRecord): boolean;

  /**
   * Gets the current metrics for an active session
   * @param sessionId - Session identifier
   * @returns Current session metrics
   * @throws SESSION_NOT_FOUND if The specified session was not found
   * @throws SESSION_ENDED if The session has already ended
   */
  getCurrentMetrics(sessionId: string): { duration: number; questionCount: number; ftcCount: number; ecCount: number; incorrectCount: number; currentPoints: number };

  /**
   * Ends a session and generates a summary
   * @param sessionId - Session identifier
   * @returns Session summary
   * @throws SESSION_NOT_FOUND if The specified session was not found
   * @throws SESSION_ALREADY_ENDED if The session has already ended
   * @throws SUMMARY_GENERATION_FAILED if Failed to generate session summary
   */
  endSession(sessionId: string): SessionSummary;

  /**
   * Gets the summary for a completed session
   * @param sessionId - Session identifier
   * @returns Session summary
   * @throws SESSION_NOT_FOUND if The specified session was not found
   * @throws SESSION_NOT_ENDED if The session has not ended yet
   */
  getSessionSummary(sessionId: string): SessionSummary;

}

// Export default interface
export default SessionMetricsManagerInterface;
