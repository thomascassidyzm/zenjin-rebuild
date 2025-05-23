/**
 * LifetimeMetricsManagerInterface.ts
 * Generated from APML Interface Definition
 * Module: MetricsSystem
 */

/**
 * 
    Defines the contract for the LifetimeMetricsManager component that calculates and manages lifetime metrics across all user sessions.
  
 */
/**
 * LifetimeMetrics
 */
export interface LifetimeMetrics {
  userId: string; // User identifier
  totalSessions: number; // Total number of completed sessions
  totalPoints: number; // Cumulative points across all sessions
  currentBlinkSpeed: number; // User's current BlinkSpeed performance in milliseconds
  evolution: number; // Evolution metric (Total Points / Blink Speed)
  firstSessionDate?: string; // ISO date string of first session
  lastSessionDate?: string; // ISO date string of last session
  streakDays?: number; // Current streak in days
  longestStreakDays?: number; // Longest streak in days
}

/**
 * GlobalRanking
 */
export interface GlobalRanking {
  userId: string; // User identifier
  percentile: number; // Percentile ranking (0-100)
  rank: number; // Numerical rank
  totalUsers: number; // Total number of users
  calculationDate: string; // ISO date string of ranking calculation
  metric?: string; // Metric used for ranking
}

/**
 * Error codes for LifetimeMetricsManagerInterface
 */
export enum LifetimeMetricsManagerErrorCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  NO_METRICS_DATA = 'NO_METRICS_DATA',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_SESSION_SUMMARY = 'INVALID_SESSION_SUMMARY',
  UPDATE_FAILED = 'UPDATE_FAILED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  NO_METRICS_DATA = 'NO_METRICS_DATA',
  CALCULATION_FAILED = 'CALCULATION_FAILED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  NO_RANKING_DATA = 'NO_RANKING_DATA',
  INVALID_LIMIT = 'INVALID_LIMIT',
  INVALID_METRIC = 'INVALID_METRIC',
}

/**
 * LifetimeMetricsManagerInterface
 */
export interface LifetimeMetricsManagerInterface {
  /**
   * Gets lifetime metrics for a user
   * @param userId - User identifier
   * @returns Lifetime metrics for the user
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws NO_METRICS_DATA if No metrics data exists for this user
   */
  getLifetimeMetrics(userId: string): LifetimeMetrics;

  /**
   * Updates lifetime metrics based on session results
   * @param userId - User identifier
   * @param sessionSummary - Session summary data
   * @returns Updated lifetime metrics
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws INVALID_SESSION_SUMMARY if The session summary is invalid
   * @throws UPDATE_FAILED if Failed to update lifetime metrics
   */
  updateLifetimeMetrics(userId: string, sessionSummary: { sessionId: string; ftcPoints: number; ecPoints: number; basePoints: number; bonusMultiplier: number; blinkSpeed: number; totalPoints: number }): LifetimeMetrics;

  /**
   * Calculates the Evolution metric for a user
   * @param userId - User identifier
   * @returns Evolution metric value
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws NO_METRICS_DATA if No metrics data exists for this user
   * @throws CALCULATION_FAILED if Failed to calculate Evolution metric
   */
  calculateEvolution(userId: string): number;

  /**
   * Gets global ranking information for a user
   * @param userId - User identifier
   * @returns Global ranking information
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws NO_RANKING_DATA if No ranking data exists for this user
   */
  getGlobalRanking(userId: string): GlobalRanking;

  /**
   * Gets a list of top-ranked users
   * @param limit - Maximum number of users to return
   * @param metric - Metric to rank by
   * @returns Array of top-ranked users
   * @throws INVALID_LIMIT if The specified limit is invalid
   * @throws INVALID_METRIC if The specified metric is invalid
   */
  getTopRankedUsers(limit?: number, metric?: string): { userId: string; rank: number; metricValue: number };

}

// Export default interface
export default LifetimeMetricsManagerInterface;
