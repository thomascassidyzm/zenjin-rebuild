/**
 * ProgressTrackerUtils.ts
 * 
 * Utility functions for the ProgressTracker component of the
 * Zenjin Maths App rebuild project.
 */

/**
 * Calculates the mastery level for a content item based on session results and previous mastery
 * 
 * @param correctRatio - Ratio of correct answers (0.0-1.0)
 * @param responseTime - Time taken to complete the content in milliseconds
 * @param expectedTime - Expected time to complete the content in milliseconds
 * @param previousMastery - Previous mastery level (0.0-1.0)
 * @param daysSinceLastAttempt - Number of days since the last attempt
 * @returns Updated mastery level (0.0-1.0)
 */
export function calculateMasteryLevel(
  correctRatio: number,
  responseTime: number,
  expectedTime: number,
  previousMastery: number,
  daysSinceLastAttempt: number
): number {
  // Calculate time factor (1.0 for responses faster than expected, decreasing for slower responses)
  const timeFactor = Math.min(1.0, expectedTime / responseTime);
  
  // Calculate current attempt mastery
  const currentAttemptMastery = correctRatio * timeFactor;
  
  // Apply decay to previous mastery based on time since last attempt
  const decayFactor = Math.exp(-0.05 * daysSinceLastAttempt);
  const decayedPreviousMastery = previousMastery * decayFactor;
  
  // Weighted average of previous mastery and current attempt mastery
  // Weight of current attempt increases with more attempts
  const currentAttemptWeight = 0.3;
  const previousMasteryWeight = 0.7;
  
  // Calculate new mastery level and ensure it's in range [0, 1]
  const newMasteryLevel = (currentAttemptMastery * currentAttemptWeight) + 
                          (decayedPreviousMastery * previousMasteryWeight);
  
  return Math.max(0, Math.min(1, newMasteryLevel));
}

/**
 * Calculates the next review date based on mastery level and last attempt date
 * 
 * @param masteryLevel - Mastery level (0.0-1.0)
 * @param lastAttemptDate - Date of the last attempt
 * @returns The next review date
 */
export function calculateNextReviewDate(
  masteryLevel: number,
  lastAttemptDate: Date
): Date {
  // Base interval in days, increases with mastery level
  const baseInterval = Math.pow(masteryLevel * 5, 2);
  
  // Add random variation (±10%) to prevent clustering of reviews
  const variationFactor = 0.9 + (Math.random() * 0.2);
  const interval = baseInterval * variationFactor;
  
  // Calculate next review date
  const nextReviewDate = new Date(lastAttemptDate);
  nextReviewDate.setDate(nextReviewDate.getDate() + Math.ceil(interval));
  
  return nextReviewDate;
}

/**
 * Calculates the days between two dates
 * 
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Number of days between the two dates
 */
export function daysBetweenDates(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const diffDays = Math.abs(Math.round((date1.getTime() - date2.getTime()) / oneDay));
  return diffDays;
}

/**
 * Calculates the overall completion percentage based on path completion percentages
 * 
 * @param pathProgress - Path progress data
 * @param pathWeights - Weights for each path
 * @returns Overall completion percentage (0.0-1.0)
 */
export function calculateOverallCompletion(
  pathProgress: { [pathId: string]: number },
  pathWeights: { [pathId: string]: number }
): number {
  let totalWeight = 0;
  let weightedSum = 0;

  for (const pathId in pathProgress) {
    const weight = pathWeights[pathId] || 1; // Default weight of 1 if not specified
    totalWeight += weight;
    weightedSum += pathProgress[pathId] * weight;
  }

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

/**
 * Validates session results to ensure they are valid
 * 
 * @param sessionResults - Results from a learning session
 * @returns Whether the session results are valid
 */
export function validateSessionResults(sessionResults: {
  correctCount: number;
  totalCount: number;
  completionTime: number;
}): boolean {
  // Check that correctCount is not negative and not greater than totalCount
  if (sessionResults.correctCount < 0 || sessionResults.correctCount > sessionResults.totalCount) {
    return false;
  }

  // Check that totalCount is positive
  if (sessionResults.totalCount <= 0) {
    return false;
  }

  // Check that completionTime is positive
  if (sessionResults.completionTime <= 0) {
    return false;
  }

  return true;
}

/**
 * Determines if a content item is considered "mastered"
 * 
 * @param masteryLevel - Mastery level (0.0-1.0)
 * @returns Whether the content is considered mastered
 */
export function isContentMastered(masteryLevel: number): boolean {
  // Content is considered mastered if mastery level is at least 0.8 (80%)
  return masteryLevel >= 0.8;
}