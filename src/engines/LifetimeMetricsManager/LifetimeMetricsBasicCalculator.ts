/**
 * BasicMetricsCalculator
 * 
 * A basic implementation of the MetricsCalculator interface for the Zenjin Maths App.
 * This implementation provides standard calculations for various metrics 
 * such as Evolution, BlinkSpeed, and global rankings.
 */

import { MetricsCalculator } from './MetricsCalculator';

/**
 * BasicMetricsCalculator class
 * 
 * Performs standard calculations for various metrics
 */
export class BasicMetricsCalculator implements MetricsCalculator {
  /**
   * Calculates the Evolution metric
   * 
   * @param totalPoints - Total points
   * @param blinkSpeed - Blink speed in milliseconds
   * @returns Evolution metric value
   */
  public calculateEvolution(totalPoints: number, blinkSpeed: number): number {
    // Avoid division by zero
    if (blinkSpeed <= 0) {
      return 0;
    }
    
    return totalPoints / blinkSpeed;
  }
  
  /**
   * Calculates weighted average blink speed
   * 
   * @param blinkSpeeds - Array of blink speeds
   * @param weights - Array of weights for each blink speed
   * @returns Weighted average blink speed
   */
  public calculateWeightedAverageBlinkSpeed(blinkSpeeds: number[], weights: number[]): number {
    // If no blink speeds, return 0
    if (blinkSpeeds.length === 0) {
      return 0;
    }
    
    // If only one blink speed, return it
    if (blinkSpeeds.length === 1) {
      return blinkSpeeds[0];
    }
    
    // Use provided weights, limited to the number of blink speeds
    const usedWeights = weights.slice(0, blinkSpeeds.length);
    
    // Normalize weights if we have fewer blink speeds than weights
    if (usedWeights.length < blinkSpeeds.length) {
      const weightSum = usedWeights.reduce((sum, weight) => sum + weight, 0);
      usedWeights.forEach((weight, index) => {
        usedWeights[index] = weight / weightSum;
      });
    }
    
    // Calculate weighted average
    let sum = 0;
    for (let i = 0; i < blinkSpeeds.length && i < usedWeights.length; i++) {
      sum += blinkSpeeds[i] * usedWeights[i];
    }
    
    return sum;
  }
  
  /**
   * Calculates percentile ranking
   * 
   * @param rank - Numerical rank (1 is highest)
   * @param totalUsers - Total number of users
   * @returns Percentile ranking (0-100)
   */
  public calculatePercentile(rank: number, totalUsers: number): number {
    if (totalUsers <= 0) {
      return 0;
    }
    
    return (1 - (rank - 1) / totalUsers) * 100;
  }
}
