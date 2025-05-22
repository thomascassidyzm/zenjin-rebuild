/**
 * InMemoryMetricsStorage
 * 
 * An in-memory implementation of the MetricsStorage interface for the Zenjin Maths App.
 * This implementation is primarily for testing and development purposes, and should be
 * replaced with a persistent storage implementation in production.
 */

import { MetricsStorage } from './MetricsStorage';
import { LifetimeMetrics, GlobalRanking, SessionSummary } from './LifetimeMetricsManager';

/**
 * Session data with blink speed
 */
interface SessionData {
  userId: string;
  sessionId: string;
  blinkSpeed: number;
  date: string;
}

/**
 * InMemoryMetricsStorage class
 * 
 * Stores metrics data in memory
 */
export class InMemoryMetricsStorage implements MetricsStorage {
  // In-memory storage
  private lifetimeMetricsMap: Map<string, LifetimeMetrics> = new Map();
  private globalRankingsMap: Map<string, Map<string, GlobalRanking>> = new Map();
  private sessionDataList: SessionData[] = [];
  
  /**
   * Gets lifetime metrics for a user
   * 
   * @param userId - User identifier
   * @returns Lifetime metrics for the user, or null if not found
   */
  public getLifetimeMetrics(userId: string): LifetimeMetrics | null {
    return this.lifetimeMetricsMap.get(userId) || null;
  }
  
  /**
   * Saves lifetime metrics for a user
   * 
   * @param metrics - Lifetime metrics to save
   */
  public saveLifetimeMetrics(metrics: LifetimeMetrics): void {
    this.lifetimeMetricsMap.set(metrics.userId, {...metrics});
  }
  
  /**
   * Gets recent session blink speeds for a user
   * 
   * @param userId - User identifier
   * @param count - Maximum number of recent sessions to return
   * @returns Array of blink speeds from recent sessions, newest first
   */
  public getRecentSessionBlinkSpeeds(userId: string, count: number): number[] {
    // Filter sessions by userId and sort by date (newest first)
    const userSessions = this.sessionDataList
      .filter(session => session.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Get blink speeds from recent sessions
    return userSessions
      .slice(0, count)
      .map(session => session.blinkSpeed);
  }
  
  /**
   * Adds session data
   * 
   * @param userId - User identifier
   * @param sessionId - Session identifier
   * @param blinkSpeed - Blink speed in milliseconds
   * @param date - ISO date string
   */
  public addSessionData(userId: string, sessionId: string, blinkSpeed: number, date: string): void {
    this.sessionDataList.push({
      userId,
      sessionId,
      blinkSpeed,
      date
    });
  }
  
  /**
   * Gets global ranking information for a user
   * 
   * @param userId - User identifier
   * @returns Global ranking information, or null if not found
   */
  public getGlobalRanking(userId: string): GlobalRanking | null {
    // Try to get ranking for default metric (evolution)
    const evolutionRankings = this.globalRankingsMap.get('evolution');
    if (evolutionRankings) {
      const ranking = evolutionRankings.get(userId);
      if (ranking) {
        return ranking;
      }
    }
    
    // Try other metrics if evolution not found
    for (const [metric, rankings] of this.globalRankingsMap.entries()) {
      const ranking = rankings.get(userId);
      if (ranking) {
        return ranking;
      }
    }
    
    return null;
  }
  
  /**
   * Gets a list of top-ranked users
   * 
   * @param limit - Maximum number of users to return
   * @param metric - Metric to rank by
   * @returns Array of global rankings for top users
   */
  public getTopRankedUsers(limit: number, metric: string): GlobalRanking[] {
    const rankings = this.globalRankingsMap.get(metric);
    if (!rankings) {
      return [];
    }
    
    // Convert to array and sort by rank
    return Array.from(rankings.values())
      .sort((a, b) => a.rank - b.rank)
      .slice(0, limit);
  }
  
  /**
   * Gets lifetime metrics for all users
   * 
   * @returns Array of lifetime metrics for all users
   */
  public getAllLifetimeMetrics(): LifetimeMetrics[] {
    return Array.from(this.lifetimeMetricsMap.values());
  }
  
  /**
   * Saves global rankings for multiple users
   * 
   * @param rankings - Array of global rankings to save
   * @param metric - Metric used for ranking
   */
  public saveGlobalRankings(rankings: GlobalRanking[], metric: string): void {
    // Initialize map for metric if not exists
    if (!this.globalRankingsMap.has(metric)) {
      this.globalRankingsMap.set(metric, new Map());
    }
    
    // Get map for metric
    const metricRankings = this.globalRankingsMap.get(metric)!;
    
    // Save rankings
    for (const ranking of rankings) {
      metricRankings.set(ranking.userId, {...ranking});
    }
  }
}
