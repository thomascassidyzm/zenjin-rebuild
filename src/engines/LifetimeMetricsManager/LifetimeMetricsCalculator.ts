/**
 * MetricsCalculator
 * 
 * A component that performs calculations for various metrics in the Zenjin Maths App.
 * This component is responsible for calculating metrics such as Evolution, BlinkSpeed,
 * and global rankings based on raw data provided by other components.
 */

/**
 * MetricsCalculator interface
 * 
 * Defines the methods for calculating various metrics
 */
export interface MetricsCalculator {
  /**
   * Calculates the Evolution metric
   * 
   * @param totalPoints - Total points
   * @param blinkSpeed - Blink speed in milliseconds
   * @returns Evolution metric value
   */
  calculateEvolution(totalPoints: number, blinkSpeed: number): number;
  
  /**
   * Calculates weighted average blink speed
   * 
   * @param blinkSpeeds - Array of blink speeds
   * @param weights - Array of weights for each blink speed
   * @returns Weighted average blink speed
   */
  calculateWeightedAverageBlinkSpeed(blinkSpeeds: number[], weights: number[]): number;
  
  /**
   * Calculates percentile ranking
   * 
   * @param rank - Numerical rank (1 is highest)
   * @param totalUsers - Total number of users
   * @returns Percentile ranking (0-100)
   */
  calculatePercentile(rank: number, totalUsers: number): number;
}
