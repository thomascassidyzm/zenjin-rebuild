/**
 * MetricsCalculator
 * 
 * A component that performs calculations for various metrics in the Zenjin Maths App.
 * This component implements the core calculation logic for session metrics, including:
 * - FTCPoints (First Time Correct Points)
 * - ECPoints (Eventually Correct Points)
 * - BasePoints
 * - BonusMultiplier
 * - BlinkSpeed
 * - Evolution
 * 
 * The component provides consistent and accurate metric calculations throughout the system.
 */

// Import types from generated interfaces
import {
  SessionData,
  MetricsResult,
  MetricsCalculatorInterface,
  MetricsCalculatorErrorCode
} from '../../interfaces/MetricsCalculatorInterface';

// Use error codes from the generated interface
const ErrorCode = MetricsCalculatorErrorCode;

/**
 * Custom error class for MetricsCalculator
 */
class MetricsError extends Error {
  constructor(code: MetricsCalculatorErrorCode, message: string) {
    super(message);
    this.name = code;
  }
}

/**
 * MetricsCalculator Class
 * 
 * Implements the MetricsCalculatorInterface to provide metric calculations for the application.
 */
export class MetricsCalculator implements MetricsCalculatorInterface {
  /**
   * Constants for calculations
   */
  private readonly FTC_POINTS_PER_ANSWER = 3;   // Points per first-time correct answer (FIXED: was 10)
  private readonly EC_POINTS_PER_ANSWER = 1;    // Points per eventually correct answer (FIXED: was 3)
  private readonly MAX_BONUS_MULTIPLIER = 30.0; // Maximum bonus multiplier (FIXED: was 1.5)
  private readonly MIN_BONUS_MULTIPLIER = 2.0;  // Minimum bonus multiplier (FIXED: was 1.0)
  // REMOVED: CONSISTENCY_WEIGHT, ACCURACY_WEIGHT, SPEED_WEIGHT - now using MAX() system
  private readonly EASTER_EGG_MODE = true;      // Hide threshold details for discovery
  private readonly TARGET_BLINK_SPEED = 10000;  // Target blink speed in milliseconds

  /**
   * Calculates metrics for a learning session
   * @param sessionData Session data for calculation
   * @returns Calculated metrics
   * @throws INVALID_SESSION_DATA if the session data is invalid
   * @throws CALCULATION_FAILED if failed to calculate metrics
   */
  calculateSessionMetrics(sessionData: SessionData): MetricsResult {
    try {
      // Validate session data
      if (!sessionData || sessionData.duration < 0 || sessionData.questionCount < 0 ||
          sessionData.ftcCount < 0 || sessionData.ecCount < 0 || sessionData.incorrectCount < 0) {
        throw new MetricsError(
          ErrorCode.INVALID_SESSION_DATA,
          'Session data contains invalid values'
        );
      }

      // Calculate FTC and EC points
      const ftcPoints = this.calculateFTCPoints(sessionData.ftcCount);
      const ecPoints = this.calculateECPoints(sessionData.ecCount);
      const basePoints = ftcPoints + ecPoints;

      // Calculate consistency (reward for consistent correct answers)
      const consistency = this.calculateConsistency(sessionData);

      // Calculate accuracy (total correct / total questions)
      const accuracy = this.calculateAccuracy(sessionData);

      // Calculate speed (based on average response time)
      const speed = this.calculateSpeed(sessionData);

      // Calculate bonus multiplier
      // Calculate individual bonus multipliers using Easter Egg thresholds
      const consistencyMultiplier = this.calculateConsistencyBonus(sessionData);
      const excellenceMultiplier = this.calculateExcellenceBonus(sessionData);
      const speedMultiplier = this.calculateSpeedBonus(sessionData);
      
      // Apply MAX() bonus system
      const bonusMultiplier = this.calculateBonusMultiplier(consistencyMultiplier, excellenceMultiplier, speedMultiplier);

      // Calculate blink speed
      const blinkSpeed = this.calculateBlinkSpeed(sessionData.duration, sessionData.ftcCount);

      // Calculate total points
      const totalPoints = Math.round(basePoints * bonusMultiplier);

      // Calculate evolution metric
      const evolution = this.calculateEvolution(totalPoints, blinkSpeed);

      // Return the metrics result
      return {
        ftcPoints,
        ecPoints,
        basePoints,
        consistency,
        accuracy,
        speed,
        bonusMultiplier,
        consistencyMultiplier,
        excellenceMultiplier,
        speedMultiplier,
        blinkSpeed,
        totalPoints
      };
    } catch (error) {
      // Handle specific errors
      if (error instanceof MetricsError) {
        throw error;
      }
      
      // Handle unexpected errors
      throw new MetricsError(
        ErrorCode.CALCULATION_FAILED,
        `Failed to calculate metrics: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Calculates first-time correct points
   * @param ftcCount Number of first-time correct answers
   * @returns Calculated FTC points
   * @throws INVALID_COUNT if the count is invalid
   */
  calculateFTCPoints(ftcCount: number): number {
    if (ftcCount < 0) {
      throw new MetricsError(
        ErrorCode.INVALID_COUNT,
        'FTC count cannot be negative'
      );
    }
    
    return ftcCount * this.FTC_POINTS_PER_ANSWER;
  }

  /**
   * Calculates eventually correct points
   * @param ecCount Number of eventually correct answers
   * @returns Calculated EC points
   * @throws INVALID_COUNT if the count is invalid
   */
  calculateECPoints(ecCount: number): number {
    if (ecCount < 0) {
      throw new MetricsError(
        ErrorCode.INVALID_COUNT,
        'EC count cannot be negative'
      );
    }
    
    return ecCount * this.EC_POINTS_PER_ANSWER;
  }

  /**
   * Calculates consistency score based on session data
   * @param sessionData Session data for calculation
   * @returns Consistency score (0.0-1.0)
   */
  private calculateConsistency(sessionData: SessionData): number {
    // Consistency is the ratio of FTC answers to total questions
    if (sessionData.questionCount === 0) {
      return 0;
    }
    
    return sessionData.ftcCount / sessionData.questionCount;
  }

  /**
   * Calculates accuracy score based on session data
   * @param sessionData Session data for calculation
   * @returns Accuracy score (0.0-1.0)
   */
  private calculateAccuracy(sessionData: SessionData): number {
    // Accuracy is the ratio of correct answers (FTC + EC) to total questions
    if (sessionData.questionCount === 0) {
      return 0;
    }
    
    const correctAnswers = sessionData.ftcCount + sessionData.ecCount;
    return correctAnswers / sessionData.questionCount;
  }

  /**
   * Calculates speed score based on session data
   * @param sessionData Session data for calculation
   * @returns Speed score (0.0-1.0)
   */
  private calculateSpeed(sessionData: SessionData): number {
    // If we have response time data, use it to calculate speed
    if (sessionData.responseTimeData && sessionData.responseTimeData.length > 0) {
      // Calculate average response time
      const totalResponseTime = sessionData.responseTimeData.reduce((sum, time) => sum + time, 0);
      const avgResponseTime = totalResponseTime / sessionData.responseTimeData.length;
      
      // Convert to a score between 0 and 1 (lower is better for response time)
      // This is a basic formula; adjust as needed for your specific requirements
      return Math.min(1, Math.max(0, 1 - (avgResponseTime / 10000)));
    }
    
    // If no response time data, use a simpler method based on duration and questions
    if (sessionData.questionCount === 0 || sessionData.duration === 0) {
      return 0.5; // Default to middle value when data is insufficient
    }
    
    // Time per question (lower is better)
    const timePerQuestion = sessionData.duration / sessionData.questionCount;
    
    // Convert to a score (simple formula, adjust as needed)
    return Math.min(1, Math.max(0, 1 - (timePerQuestion / 5000)));
  }

  /**
   * Calculates bonus multiplier based on consistency, accuracy, and speed
   * @param consistency Consistency score (0.0-1.0)
   * @param accuracy Accuracy score (0.0-1.0)
   * @param speed Speed score (0.0-1.0)
   * @returns Calculated bonus multiplier
   * @throws INVALID_SCORE if one or more scores are invalid
   */
  calculateBonusMultiplier(consistencyMultiplier: number, excellenceMultiplier: number, speedMultiplier: number): number {
    // Validate multipliers are within valid range
    const multipliers = [consistencyMultiplier, excellenceMultiplier, speedMultiplier];
    for (const multiplier of multipliers) {
      if (multiplier < this.MIN_BONUS_MULTIPLIER || multiplier > this.MAX_BONUS_MULTIPLIER) {
        throw new MetricsError(
          ErrorCode.INVALID_SCORE,
          `Bonus multipliers must be between ${this.MIN_BONUS_MULTIPLIER} and ${this.MAX_BONUS_MULTIPLIER}`
        );
      }
    }
    
    // FIXED: Use MAX() system instead of weighted average
    const maxBonus = Math.max(consistencyMultiplier, excellenceMultiplier, speedMultiplier);
    
    // Round to 1 decimal place for clean display
    return Math.round(maxBonus * 10) / 10;
  }

  /**
   * Calculates blink speed (ms per FTC answer)
   * @param duration Session duration in milliseconds
   * @param ftcCount Number of first-time correct answers
   * @returns Calculated blink speed
   * @throws INVALID_DURATION if the duration is invalid
   * @throws INVALID_COUNT if the count is invalid
   * @throws DIVISION_BY_ZERO if cannot calculate blink speed with zero FTC answers
   */
  calculateBlinkSpeed(duration: number, ftcCount: number): number {
    // Validate inputs
    if (duration < 0) {
      throw new MetricsError(
        ErrorCode.INVALID_DURATION,
        'Duration cannot be negative'
      );
    }
    
    if (ftcCount < 0) {
      throw new MetricsError(
        ErrorCode.INVALID_COUNT,
        'FTC count cannot be negative'
      );
    }
    
    // Check for division by zero
    if (ftcCount === 0) {
      throw new MetricsError(
        ErrorCode.DIVISION_BY_ZERO,
        'Cannot calculate blink speed with zero FTC answers'
      );
    }
    
    // Calculate blink speed (ms per FTC answer)
    const blinkSpeed = duration / ftcCount;
    
    // Round to whole number for clean display
    return Math.round(blinkSpeed);
  }

  /**
   * Calculates the Evolution metric
   * @param totalPoints Total points
   * @param blinkSpeed Blink speed in milliseconds
   * @returns Calculated Evolution metric
   * @throws INVALID_POINTS if the points value is invalid
   * @throws INVALID_BLINK_SPEED if the blink speed is invalid
   * @throws DIVISION_BY_ZERO if cannot calculate Evolution with zero blink speed
   */
  calculateEvolution(totalPoints: number, blinkSpeed: number): number {
    // Validate inputs
    if (totalPoints < 0) {
      throw new MetricsError(
        ErrorCode.INVALID_POINTS,
        'Total points cannot be negative'
      );
    }
    
    if (blinkSpeed <= 0) {
      throw new MetricsError(
        ErrorCode.INVALID_BLINK_SPEED,
        'Blink speed must be positive'
      );
    }
    
    // Calculate Evolution (points / blink speed, scaled for easier understanding)
    // This gives points per millisecond, which is a small number, so we scale it
    const evolutionRaw = totalPoints / blinkSpeed;
    
    // Scale by the target blink speed for a more meaningful number
    const evolutionScaled = evolutionRaw * this.TARGET_BLINK_SPEED;
    
    // Round to 2 decimal places for clean display
    return Math.round(evolutionScaled * 100) / 100;
  }

  /**
   * Calculate consistency bonus based on valid sessions (Easter Egg thresholds)
   * Note: This is a simplified implementation - full version would track sessions over time
   */
  private calculateConsistencyBonus(sessionData: SessionData): number {
    // For now, return base multiplier since we don't have session history tracking yet
    // TODO: Implement ConsistencyTracker integration
    return this.MIN_BONUS_MULTIPLIER;
  }

  /**
   * Calculate excellence bonus based on FTC percentage (Easter Egg thresholds)
   */
  private calculateExcellenceBonus(sessionData: SessionData): number {
    if (sessionData.questionCount === 0) return this.MIN_BONUS_MULTIPLIER;
    
    const ftcPercentage = (sessionData.ftcCount / sessionData.questionCount) * 100;
    
    // Easter Egg thresholds (hidden from UI)
    if (ftcPercentage >= 100) return 30.0;  // Perfect session
    if (ftcPercentage >= 95) return 10.0;   // Near perfect
    if (ftcPercentage >= 90) return 5.0;    // Excellent
    if (ftcPercentage >= 80) return 2.0;    // Good
    
    return this.MIN_BONUS_MULTIPLIER;
  }

  /**
   * Calculate speed bonus based on blink speed (Easter Egg thresholds)
   */
  private calculateSpeedBonus(sessionData: SessionData): number {
    if (sessionData.ftcCount === 0 || sessionData.duration === 0) {
      return this.MIN_BONUS_MULTIPLIER;
    }
    
    const blinkSpeed = sessionData.duration / sessionData.ftcCount; // ms per FTC answer
    
    // Easter Egg thresholds (hidden from UI)
    if (blinkSpeed <= 1000) return 30.0;   // Under 1 second per FTC
    if (blinkSpeed <= 2000) return 10.0;   // Under 2 seconds per FTC  
    if (blinkSpeed <= 3000) return 2.0;    // Under 3 seconds per FTC
    
    return this.MIN_BONUS_MULTIPLIER;
  }
}