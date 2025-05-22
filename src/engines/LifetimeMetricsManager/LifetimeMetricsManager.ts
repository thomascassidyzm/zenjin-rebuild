/**
 * LifetimeMetricsManager
 * 
 * A component that calculates and manages lifetime metrics across all user sessions
 * in the Zenjin Maths App. This component aggregates session metrics into lifetime
 * statistics, calculates the Evolution metric, determines global rankings, and provides
 * comprehensive performance data for long-term user progress tracking.
 */

import { MetricsStorage } from './MetricsStorage';
import { MetricsCalculator } from './MetricsCalculator';

// Custom error types
class UserNotFoundError extends Error {
  constructor(userId: string) {
    super(`USER_NOT_FOUND: User ${userId} was not found`);
    this.name = 'UserNotFoundError';
  }
}

class NoMetricsDataError extends Error {
  constructor(userId: string) {
    super(`NO_METRICS_DATA: No metrics data exists for user ${userId}`);
    this.name = 'NoMetricsDataError';
  }
}

class InvalidSessionSummaryError extends Error {
  constructor(message: string) {
    super(`INVALID_SESSION_SUMMARY: ${message}`);
    this.name = 'InvalidSessionSummaryError';
  }
}

class UpdateFailedError extends Error {
  constructor(message: string) {
    super(`UPDATE_FAILED: ${message}`);
    this.name = 'UpdateFailedError';
  }
}

class CalculationFailedError extends Error {
  constructor(message: string) {
    super(`CALCULATION_FAILED: ${message}`);
    this.name = 'CalculationFailedError';
  }
}

class NoRankingDataError extends Error {
  constructor(userId: string) {
    super(`NO_RANKING_DATA: No ranking data exists for user ${userId}`);
    this.name = 'NoRankingDataError';
  }
}

class InvalidLimitError extends Error {
  constructor(limit: number) {
    super(`INVALID_LIMIT: The specified limit ${limit} is invalid`);
    this.name = 'InvalidLimitError';
  }
}

class InvalidMetricError extends Error {
  constructor(metric: string) {
    super(`INVALID_METRIC: The specified metric ${metric} is invalid`);
    this.name = 'InvalidMetricError';
  }
}

/**
 * Lifetime metrics for a user across all sessions
 */
export interface LifetimeMetrics {
  /** User identifier */
  userId: string;
  
  /** Total number of completed sessions */
  totalSessions: number;
  
  /** Cumulative points across all sessions */
  totalPoints: number;
  
  /** User's current BlinkSpeed performance in milliseconds */
  currentBlinkSpeed: number;
  
  /** Evolution metric (Total Points / Blink Speed) */
  evolution: number;
  
  /** ISO date string of first session (optional) */
  firstSessionDate?: string;
  
  /** ISO date string of last session (optional) */
  lastSessionDate?: string;
  
  /** Current streak in days (optional, defaults to 0) */
  streakDays?: number;
  
  /** Longest streak in days (optional, defaults to 0) */
  longestStreakDays?: number;
}

/**
 * Global ranking information for a user
 */
export interface GlobalRanking {
  /** User identifier */
  userId: string;
  
  /** Percentile ranking (0-100) */
  percentile: number;
  
  /** Numerical rank */
  rank: number;
  
  /** Total number of users */
  totalUsers: number;
  
  /** ISO date string of ranking calculation */
  calculationDate: string;
  
  /** Metric used for ranking (optional, defaults to 'evolution') */
  metric?: string;
}

/**
 * Session summary data for updating lifetime metrics
 */
export interface SessionSummary {
  /** Session identifier */
  sessionId: string;
  
  /** First-time correct points */
  ftcPoints: number;
  
  /** Eventually correct points */
  ecPoints: number;
  
  /** Base points */
  basePoints: number;
  
  /** Bonus multiplier */
  bonusMultiplier: number;
  
  /** Blink speed in milliseconds */
  blinkSpeed: number;
  
  /** Total points */
  totalPoints: number;
}

/**
 * Top-ranked user information
 */
export interface RankedUser {
  /** User identifier */
  userId: string;
  
  /** Numerical rank */
  rank: number;
  
  /** Value of the ranking metric */
  metricValue: number;
}

// Configuration for the lifetime metrics manager
interface LifetimeMetricsManagerConfig {
  /** 
   * Number of recent sessions to use for weighted average of BlinkSpeed
   * Default: 5
   */
  blinkSpeedSessionsCount: number;
  
  /** 
   * Weights for recent sessions in BlinkSpeed calculation (newest first)
   * Default: [0.5, 0.25, 0.15, 0.07, 0.03]
   */
  blinkSpeedWeights: number[];
  
  /**
   * Valid metrics for ranking
   * Default: ['evolution', 'totalPoints', 'currentBlinkSpeed', 'streakDays']
   */
  validRankingMetrics: string[];
  
  /**
   * Default metric for ranking
   * Default: 'evolution'
   */
  defaultRankingMetric: string;
}

/**
 * LifetimeMetricsManager class
 * 
 * Manages lifetime metrics and global rankings for users across all sessions
 */
export class LifetimeMetricsManager {
  private metricsStorage: MetricsStorage;
  private metricsCalculator: MetricsCalculator;
  private config: LifetimeMetricsManagerConfig;
  
  /**
   * Constructor for LifetimeMetricsManager
   * 
   * @param metricsStorage - Storage component for metrics data
   * @param metricsCalculator - Calculator component for metrics calculations
   * @param config - Configuration for the lifetime metrics manager
   */
  constructor(
    metricsStorage: MetricsStorage,
    metricsCalculator: MetricsCalculator,
    config?: Partial<LifetimeMetricsManagerConfig>
  ) {
    this.metricsStorage = metricsStorage;
    this.metricsCalculator = metricsCalculator;
    
    // Default configuration
    this.config = {
      blinkSpeedSessionsCount: 5,
      blinkSpeedWeights: [0.5, 0.25, 0.15, 0.07, 0.03],
      validRankingMetrics: ['evolution', 'totalPoints', 'currentBlinkSpeed', 'streakDays'],
      defaultRankingMetric: 'evolution',
      ...config
    };
    
    // Validate configuration
    this.validateConfig();
  }
  
  /**
   * Validates the configuration
   * 
   * @throws Error if the configuration is invalid
   */
  private validateConfig(): void {
    const { blinkSpeedSessionsCount, blinkSpeedWeights } = this.config;
    
    // Validate blinkSpeedSessionsCount
    if (blinkSpeedSessionsCount <= 0) {
      throw new Error('blinkSpeedSessionsCount must be greater than 0');
    }
    
    // Validate blinkSpeedWeights
    if (blinkSpeedWeights.length !== blinkSpeedSessionsCount) {
      throw new Error('blinkSpeedWeights length must match blinkSpeedSessionsCount');
    }
    
    const weightSum = blinkSpeedWeights.reduce((sum, weight) => sum + weight, 0);
    if (Math.abs(weightSum - 1) > 0.001) {
      throw new Error('blinkSpeedWeights must sum to 1');
    }
    
    if (blinkSpeedWeights.some(weight => weight < 0)) {
      throw new Error('blinkSpeedWeights must be non-negative');
    }
  }
  
  /**
   * Gets lifetime metrics for a user
   * 
   * @param userId - User identifier
   * @returns Lifetime metrics for the user
   * @throws UserNotFoundError if the specified user was not found
   * @throws NoMetricsDataError if no metrics data exists for this user
   */
  public getLifetimeMetrics(userId: string): LifetimeMetrics {
    // Validate userId
    if (!userId) {
      throw new UserNotFoundError('');
    }
    
    try {
      // Get metrics from storage
      const metrics = this.metricsStorage.getLifetimeMetrics(userId);
      
      // Check if metrics exist
      if (!metrics) {
        throw new NoMetricsDataError(userId);
      }
      
      return metrics;
    } catch (error) {
      // Re-throw storage errors
      if (error instanceof UserNotFoundError || error instanceof NoMetricsDataError) {
        throw error;
      }
      
      // Wrap other errors
      throw new Error(`Failed to get lifetime metrics: ${error.message}`);
    }
  }
  
  /**
   * Updates lifetime metrics based on session results
   * 
   * @param userId - User identifier
   * @param sessionSummary - Session summary data
   * @returns Updated lifetime metrics
   * @throws UserNotFoundError if the specified user was not found
   * @throws InvalidSessionSummaryError if the session summary is invalid
   * @throws UpdateFailedError if failed to update lifetime metrics
   */
  public updateLifetimeMetrics(userId: string, sessionSummary: SessionSummary): LifetimeMetrics {
    // Validate userId
    if (!userId) {
      throw new UserNotFoundError('');
    }
    
    // Validate session summary
    this.validateSessionSummary(sessionSummary);
    
    try {
      // Get current metrics
      let metrics: LifetimeMetrics;
      
      try {
        metrics = this.getLifetimeMetrics(userId);
      } catch (error) {
        if (error instanceof NoMetricsDataError) {
          // Initialize new metrics if none exist
          metrics = this.initializeLifetimeMetrics(userId);
        } else {
          throw error;
        }
      }
      
      // Get recent session blink speeds for weighted average calculation
      const recentSessionBlinkSpeeds = this.metricsStorage.getRecentSessionBlinkSpeeds(
        userId,
        this.config.blinkSpeedSessionsCount - 1 // -1 because we'll add the current session
      );
      
      // Add current session to the list
      recentSessionBlinkSpeeds.unshift(sessionSummary.blinkSpeed);
      
      // Calculate current blink speed as weighted average
      const currentBlinkSpeed = this.calculateWeightedAverageBlinkSpeed(
        recentSessionBlinkSpeeds
      );
      
      // Update metrics
      const currentDate = new Date().toISOString();
      const updatedMetrics: LifetimeMetrics = {
        ...metrics,
        totalSessions: metrics.totalSessions + 1,
        totalPoints: metrics.totalPoints + sessionSummary.totalPoints,
        currentBlinkSpeed,
        lastSessionDate: currentDate
      };
      
      // Initialize firstSessionDate if not set
      if (!updatedMetrics.firstSessionDate) {
        updatedMetrics.firstSessionDate = currentDate;
      }
      
      // Update streak
      this.updateStreak(updatedMetrics);
      
      // Calculate evolution
      updatedMetrics.evolution = this.calculateEvolutionValue(
        updatedMetrics.totalPoints,
        updatedMetrics.currentBlinkSpeed
      );
      
      // Save updated metrics
      this.metricsStorage.saveLifetimeMetrics(updatedMetrics);
      
      // Update rankings if needed
      this.updateRankingsIfNeeded(userId, updatedMetrics);
      
      return updatedMetrics;
    } catch (error) {
      // Re-throw specific errors
      if (
        error instanceof UserNotFoundError || 
        error instanceof InvalidSessionSummaryError
      ) {
        throw error;
      }
      
      // Wrap other errors
      throw new UpdateFailedError(error.message);
    }
  }
  
  /**
   * Validates a session summary
   * 
   * @param sessionSummary - Session summary to validate
   * @throws InvalidSessionSummaryError if the session summary is invalid
   */
  private validateSessionSummary(sessionSummary: SessionSummary): void {
    if (!sessionSummary) {
      throw new InvalidSessionSummaryError('Session summary is missing');
    }
    
    if (!sessionSummary.sessionId) {
      throw new InvalidSessionSummaryError('Session ID is required');
    }
    
    if (sessionSummary.ftcPoints < 0) {
      throw new InvalidSessionSummaryError('FTC points cannot be negative');
    }
    
    if (sessionSummary.ecPoints < 0) {
      throw new InvalidSessionSummaryError('EC points cannot be negative');
    }
    
    if (sessionSummary.basePoints < 0) {
      throw new InvalidSessionSummaryError('Base points cannot be negative');
    }
    
    if (sessionSummary.bonusMultiplier <= 0) {
      throw new InvalidSessionSummaryError('Bonus multiplier must be positive');
    }
    
    if (sessionSummary.blinkSpeed <= 0) {
      throw new InvalidSessionSummaryError('Blink speed must be positive');
    }
    
    // Validate total points calculation
    const calculatedTotalPoints = sessionSummary.basePoints * sessionSummary.bonusMultiplier;
    const tolerance = 0.001; // Allow for small floating-point differences
    
    if (Math.abs(calculatedTotalPoints - sessionSummary.totalPoints) > tolerance) {
      throw new InvalidSessionSummaryError(
        'Total points calculation is inconsistent'
      );
    }
  }
  
  /**
   * Initializes lifetime metrics for a new user
   * 
   * @param userId - User identifier
   * @returns Initialized lifetime metrics
   */
  private initializeLifetimeMetrics(userId: string): LifetimeMetrics {
    return {
      userId,
      totalSessions: 0,
      totalPoints: 0,
      currentBlinkSpeed: 0,
      evolution: 0,
      streakDays: 0,
      longestStreakDays: 0
    };
  }
  
  /**
   * Calculates weighted average blink speed from recent sessions
   * 
   * @param blinkSpeeds - Array of blink speeds, newest first
   * @returns Weighted average blink speed
   */
  private calculateWeightedAverageBlinkSpeed(blinkSpeeds: number[]): number {
    // If no blink speeds, return 0
    if (blinkSpeeds.length === 0) {
      return 0;
    }
    
    // If only one blink speed, return it
    if (blinkSpeeds.length === 1) {
      return blinkSpeeds[0];
    }
    
    // Get weights, limited to the number of blink speeds
    const weights = this.config.blinkSpeedWeights.slice(0, blinkSpeeds.length);
    
    // Normalize weights if we have fewer blink speeds than configured
    if (weights.length < this.config.blinkSpeedWeights.length) {
      const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
      weights.forEach((weight, index) => {
        weights[index] = weight / weightSum;
      });
    }
    
    // Calculate weighted average
    let sum = 0;
    for (let i = 0; i < blinkSpeeds.length && i < weights.length; i++) {
      sum += blinkSpeeds[i] * weights[i];
    }
    
    return sum;
  }
  
  /**
   * Updates streak information in lifetime metrics
   * 
   * @param metrics - Lifetime metrics to update
   */
  private updateStreak(metrics: LifetimeMetrics): void {
    // Initialize streaks if not set
    if (metrics.streakDays === undefined) {
      metrics.streakDays = 0;
    }
    
    if (metrics.longestStreakDays === undefined) {
      metrics.longestStreakDays = 0;
    }
    
    // If this is the first session, start streak
    if (metrics.totalSessions === 1) {
      metrics.streakDays = 1;
      metrics.longestStreakDays = 1;
      return;
    }
    
    // Check if previous session was within last 24 hours
    const lastSessionDate = new Date(metrics.lastSessionDate || '');
    const currentDate = new Date();
    
    // Calculate difference in days
    const diffTime = Math.abs(currentDate.getTime() - lastSessionDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) {
      // Continue streak if same day or consecutive day
      metrics.streakDays += 1;
      
      // Update longest streak if current streak is longer
      if (metrics.streakDays > metrics.longestStreakDays) {
        metrics.longestStreakDays = metrics.streakDays;
      }
    } else {
      // Reset streak if not consecutive day
      metrics.streakDays = 1;
    }
  }
  
  /**
   * Calculates the Evolution metric for a user
   * 
   * @param userId - User identifier
   * @returns Evolution metric value
   * @throws UserNotFoundError if the specified user was not found
   * @throws NoMetricsDataError if no metrics data exists for this user
   * @throws CalculationFailedError if failed to calculate Evolution metric
   */
  public calculateEvolution(userId: string): number {
    try {
      const metrics = this.getLifetimeMetrics(userId);
      
      return this.calculateEvolutionValue(
        metrics.totalPoints,
        metrics.currentBlinkSpeed
      );
    } catch (error) {
      // Re-throw specific errors
      if (error instanceof UserNotFoundError || error instanceof NoMetricsDataError) {
        throw error;
      }
      
      // Wrap other errors
      throw new CalculationFailedError(error.message);
    }
  }
  
  /**
   * Calculates the Evolution value from total points and blink speed
   * 
   * @param totalPoints - Total points
   * @param blinkSpeed - Blink speed in milliseconds
   * @returns Evolution value
   */
  private calculateEvolutionValue(totalPoints: number, blinkSpeed: number): number {
    // Avoid division by zero
    if (blinkSpeed <= 0) {
      return 0;
    }
    
    return totalPoints / blinkSpeed;
  }
  
  /**
   * Gets global ranking information for a user
   * 
   * @param userId - User identifier
   * @returns Global ranking information
   * @throws UserNotFoundError if the specified user was not found
   * @throws NoRankingDataError if no ranking data exists for this user
   */
  public getGlobalRanking(userId: string): GlobalRanking {
    // Validate userId
    if (!userId) {
      throw new UserNotFoundError('');
    }
    
    try {
      // Get ranking from storage
      const ranking = this.metricsStorage.getGlobalRanking(userId);
      
      // Check if ranking exists
      if (!ranking) {
        throw new NoRankingDataError(userId);
      }
      
      return ranking;
    } catch (error) {
      // Re-throw specific errors
      if (error instanceof UserNotFoundError || error instanceof NoRankingDataError) {
        throw error;
      }
      
      // Wrap other errors
      throw new Error(`Failed to get global ranking: ${error.message}`);
    }
  }
  
  /**
   * Updates rankings if needed
   * 
   * @param userId - User identifier
   * @param metrics - Updated lifetime metrics
   */
  private updateRankingsIfNeeded(userId: string, metrics: LifetimeMetrics): void {
    try {
      // Get current ranking
      let currentRanking: GlobalRanking;
      try {
        currentRanking = this.getGlobalRanking(userId);
      } catch (error) {
        if (error instanceof NoRankingDataError) {
          // If no ranking exists, force recalculation
          this.recalculateGlobalRankings();
          return;
        }
        throw error;
      }
      
      // Check if ranking is from today
      const rankingDate = new Date(currentRanking.calculationDate);
      const currentDate = new Date();
      
      if (
        rankingDate.getDate() !== currentDate.getDate() ||
        rankingDate.getMonth() !== currentDate.getMonth() ||
        rankingDate.getFullYear() !== currentDate.getFullYear()
      ) {
        // Ranking is not from today, recalculate
        this.recalculateGlobalRankings();
      }
    } catch (error) {
      // Log error but don't throw
      console.error(`Failed to update rankings: ${error.message}`);
    }
  }
  
  /**
   * Recalculates global rankings for all users
   */
  public recalculateGlobalRankings(): void {
    try {
      // Get all users with metrics
      const allMetrics = this.metricsStorage.getAllLifetimeMetrics();
      
      // Check if we have any metrics
      if (allMetrics.length === 0) {
        return;
      }
      
      // Recalculate rankings for each valid metric
      for (const metric of this.config.validRankingMetrics) {
        this.recalculateRankingsForMetric(allMetrics, metric);
      }
    } catch (error) {
      // Log error but don't throw
      console.error(`Failed to recalculate global rankings: ${error.message}`);
    }
  }
  
  /**
   * Recalculates rankings for a specific metric
   * 
   * @param allMetrics - Array of lifetime metrics for all users
   * @param metric - Metric to rank by
   */
  private recalculateRankingsForMetric(
    allMetrics: LifetimeMetrics[],
    metric: string
  ): void {
    // Sort users by the specified metric
    const sortedMetrics = [...allMetrics].sort((a, b) => {
      const valueA = this.getMetricValue(a, metric);
      const valueB = this.getMetricValue(b, metric);
      
      // Handle special cases like blink speed (lower is better)
      if (metric === 'currentBlinkSpeed') {
        return valueA - valueB; // Lower blink speed is better
      }
      
      return valueB - valueA; // Higher value is better for other metrics
    });
    
    // Calculate rankings
    const totalUsers = sortedMetrics.length;
    const calculationDate = new Date().toISOString();
    
    const rankings: GlobalRanking[] = sortedMetrics.map((metrics, index) => {
      const rank = index + 1;
      const percentile = this.calculatePercentile(rank, totalUsers);
      
      return {
        userId: metrics.userId,
        percentile,
        rank,
        totalUsers,
        calculationDate,
        metric
      };
    });
    
    // Save rankings
    this.metricsStorage.saveGlobalRankings(rankings, metric);
  }
  
  /**
   * Gets the value of a metric from lifetime metrics
   * 
   * @param metrics - Lifetime metrics
   * @param metric - Metric name
   * @returns Metric value
   */
  private getMetricValue(metrics: LifetimeMetrics, metric: string): number {
    switch (metric) {
      case 'evolution':
        return metrics.evolution;
      case 'totalPoints':
        return metrics.totalPoints;
      case 'currentBlinkSpeed':
        return metrics.currentBlinkSpeed;
      case 'streakDays':
        return metrics.streakDays || 0;
      default:
        return 0;
    }
  }
  
  /**
   * Calculates percentile from rank and total users
   * 
   * @param rank - Numerical rank (1 is highest)
   * @param totalUsers - Total number of users
   * @returns Percentile (0-100)
   */
  private calculatePercentile(rank: number, totalUsers: number): number {
    if (totalUsers <= 0) {
      return 0;
    }
    
    return (1 - (rank - 1) / totalUsers) * 100;
  }
  
  /**
   * Gets a list of top-ranked users
   * 
   * @param limit - Maximum number of users to return (optional, defaults to 10)
   * @param metric - Metric to rank by (optional, defaults to 'evolution')
   * @returns Array of top-ranked users
   * @throws InvalidLimitError if the specified limit is invalid
   * @throws InvalidMetricError if the specified metric is invalid
   */
  public getTopRankedUsers(
    limit: number = 10,
    metric: string = this.config.defaultRankingMetric
  ): RankedUser[] {
    // Validate limit
    if (limit <= 0) {
      throw new InvalidLimitError(limit);
    }
    
    // Validate metric
    if (!this.config.validRankingMetrics.includes(metric)) {
      throw new InvalidMetricError(metric);
    }
    
    try {
      // Get top users from storage
      const topUsers = this.metricsStorage.getTopRankedUsers(limit, metric);
      
      return topUsers.map(ranking => ({
        userId: ranking.userId,
        rank: ranking.rank,
        metricValue: this.getMetricValueFromRanking(ranking)
      }));
    } catch (error) {
      // Wrap error
      throw new Error(`Failed to get top ranked users: ${error.message}`);
    }
  }
  
  /**
   * Gets the metric value from a global ranking
   * 
   * @param ranking - Global ranking
   * @returns Metric value
   */
  private getMetricValueFromRanking(ranking: GlobalRanking): number {
    try {
      const metrics = this.getLifetimeMetrics(ranking.userId);
      return this.getMetricValue(metrics, ranking.metric || this.config.defaultRankingMetric);
    } catch (error) {
      // Return 0 if metrics not found
      return 0;
    }
  }
}
