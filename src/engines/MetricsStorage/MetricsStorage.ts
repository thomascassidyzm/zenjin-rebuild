/**
 * metrics-storage-manager.ts
 * 
 * This manager class provides a higher-level interface for the MetricsStorage component,
 * handling common operations and providing additional functionality for the MetricsSystem module.
 */

import { MetricsStorage, SessionMetrics, LifetimeMetrics, SessionHistoryEntry } from './MetricsStorage';

/**
 * MetricsStorageManager class that provides a higher-level interface for metrics storage operations
 */
export class MetricsStorageManager {
  private metricsStorage: MetricsStorage;
  
  /**
   * Constructor for MetricsStorageManager
   * @param metricsStorage - MetricsStorage instance to use (creates a new one if not provided)
   */
  constructor(metricsStorage?: MetricsStorage) {
    this.metricsStorage = metricsStorage || new MetricsStorage();
  }
  
  /**
   * Save session metrics and update lifetime metrics in a single operation
   * @param sessionMetrics - Session metrics to save
   * @returns Whether the operation was successful
   */
  public async saveSessionAndUpdateLifetime(sessionMetrics: SessionMetrics): Promise<boolean> {
    try {
      // Save session metrics
      await this.metricsStorage.saveSessionMetrics(sessionMetrics.sessionId, sessionMetrics);
      
      // Update lifetime metrics
      await this.metricsStorage.updateLifetimeMetrics(sessionMetrics.userId, sessionMetrics);
      
      return true;
    } catch (error) {
      console.error('Error saving session and updating lifetime metrics:', error);
      throw error;
    }
  }
  
  /**
   * Get recent session history for a user
   * @param userId - User identifier
   * @param limit - Maximum number of sessions to retrieve
   * @returns Array of session history entries
   */
  public async getRecentSessions(userId: string, limit: number = 10): Promise<SessionHistoryEntry[]> {
    return this.metricsStorage.getSessionHistory(userId, limit);
  }
  
  /**
   * Calculate session metrics trends for a user
   * @param userId - User identifier
   * @param sessions - Number of sessions to analyze
   * @returns Trends analysis
   */
  public async calculateSessionTrends(userId: string, sessions: number = 10): Promise<{
    pointsTrend: number;
    accuracyTrend: number;
    speedTrend: number;
    consistencyTrend: number;
    averagePoints: number;
  }> {
    // Get recent sessions
    const history = await this.metricsStorage.getSessionHistory(userId, sessions);
    
    if (history.length < 2) {
      return {
        pointsTrend: 0,
        accuracyTrend: 0,
        speedTrend: 0,
        consistencyTrend: 0,
        averagePoints: history.length ? history[0].totalPoints : 0
      };
    }
    
    // Calculate trends
    const earlierPoints = history[history.length - 1].totalPoints;
    const latestPoints = history[0].totalPoints;
    const pointsTrend = (latestPoints - earlierPoints) / earlierPoints;
    
    // Calculate average points
    const totalPoints = history.reduce((sum, session) => sum + session.totalPoints, 0);
    const averagePoints = totalPoints / history.length;
    
    // Note: For full implementation, we would need to store accuracy, speed, and consistency
    // in the session history to calculate these trends
    
    return {
      pointsTrend,
      accuracyTrend: 0, // Placeholder
      speedTrend: 0, // Placeholder
      consistencyTrend: 0, // Placeholder
      averagePoints
    };
  }
  
  /**
   * Synchronize all pending data with the server
   * @returns Whether the synchronization was successful
   */
  public async synchronizeData(): Promise<boolean> {
    return this.metricsStorage.forceSync();
  }
  
  /**
   * Check if a user has lifetime metrics data
   * @param userId - User identifier
   * @returns Whether the user has lifetime metrics data
   */
  public async hasLifetimeMetrics(userId: string): Promise<boolean> {
    try {
      const metrics = await this.getLifetimeMetrics(userId);
      return !!metrics;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Get lifetime metrics for a user
   * @param userId - User identifier
   * @returns Lifetime metrics or null if not found
   */
  public async getLifetimeMetrics(userId: string): Promise<LifetimeMetrics | null> {
    try {
      // This is not directly exposed in the MetricsStorage interface
      // In a real implementation, we might need to add this method to the interface
      // For now, we're using private method access for demonstration
      return (this.metricsStorage as any).getLifetimeMetricsById(userId);
    } catch (error) {
      console.error('Error getting lifetime metrics:', error);
      return null;
    }
  }
  
  /**
   * Get storage status
   * @returns Storage status information
   */
  public async getStorageStatus(): Promise<{
    sessionCount: number;
    userCount: number;
    syncQueueLength: number;
    cacheSize: number;
    networkStatus: boolean;
  }> {
    return this.metricsStorage.getStorageStatus();
  }
  
  /**
   * Clear all metrics data (for testing purposes)
   * @returns Whether the clear was successful
   */
  public async clearAllData(): Promise<boolean> {
    return this.metricsStorage.clearAllData();
  }
}