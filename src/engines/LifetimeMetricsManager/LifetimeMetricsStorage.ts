/**
 * MetricsStorage
 * 
 * A component that handles storage and retrieval of metrics data for the Zenjin Maths App.
 * This component is responsible for persisting lifetime metrics, global rankings, 
 * and session data for the MetricsSystem module.
 */

import { LifetimeMetrics, GlobalRanking } from './LifetimeMetricsManager';

/**
 * MetricsStorage interface
 * 
 * Defines the methods for storing and retrieving metrics data
 */
export interface MetricsStorage {
  /**
   * Gets lifetime metrics for a user
   * 
   * @param userId - User identifier
   * @returns Lifetime metrics for the user, or null if not found
   */
  getLifetimeMetrics(userId: string): LifetimeMetrics | null;
  
  /**
   * Saves lifetime metrics for a user
   * 
   * @param metrics - Lifetime metrics to save
   */
  saveLifetimeMetrics(metrics: LifetimeMetrics): void;
  
  /**
   * Gets recent session blink speeds for a user
   * 
   * @param userId - User identifier
   * @param count - Maximum number of recent sessions to return
   * @returns Array of blink speeds from recent sessions, newest first
   */
  getRecentSessionBlinkSpeeds(userId: string, count: number): number[];
  
  /**
   * Gets global ranking information for a user
   * 
   * @param userId - User identifier
   * @returns Global ranking information, or null if not found
   */
  getGlobalRanking(userId: string): GlobalRanking | null;
  
  /**
   * Gets a list of top-ranked users
   * 
   * @param limit - Maximum number of users to return
   * @param metric - Metric to rank by
   * @returns Array of global rankings for top users
   */
  getTopRankedUsers(limit: number, metric: string): GlobalRanking[];
  
  /**
   * Gets lifetime metrics for all users
   * 
   * @returns Array of lifetime metrics for all users
   */
  getAllLifetimeMetrics(): LifetimeMetrics[];
  
  /**
   * Saves global rankings for multiple users
   * 
   * @param rankings - Array of global rankings to save
   * @param metric - Metric used for ranking
   */
  saveGlobalRankings(rankings: GlobalRanking[], metric: string): void;
}
