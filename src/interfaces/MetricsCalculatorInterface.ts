/**
 * MetricsCalculatorInterface.ts
 * Generated from APML Interface Definition
 * Module: MetricsSystem
 */

import { undefined } from './undefined';

/**
 * Defines the contract for the MetricsCalculator component that performs calculations for various metrics in the system.
 */
/**
 * SessionData
 */
export interface SessionData {
  /** Session duration in milliseconds */
  duration: number;
  /** Number of questions answered */
  questionCount: number;
  /** Number of first-time correct answers */
  ftcCount: number;
  /** Number of eventually correct answers */
  ecCount: number;
  /** Number of incorrect answers */
  incorrectCount: number;
  /** Array of response times in milliseconds */
  responseTimeData?: number[];
}

/**
 * MetricsResult
 */
export interface MetricsResult {
  /** First-time correct points */
  ftcPoints: number;
  /** Eventually correct points */
  ecPoints: number;
  /** Base points (FTC + EC) */
  basePoints: number;
  /** Consistency score (0.0-1.0) */
  consistency: number;
  /** Accuracy score (0.0-1.0) */
  accuracy: number;
  /** Speed score (0.0-1.0) */
  speed: number;
  /** Bonus multiplier */
  bonusMultiplier: number;
  /** Blink speed (ms per FTC answer) */
  blinkSpeed: number;
  /** Total points (base × bonus) */
  totalPoints: number;
}

/**
 * Error codes for MetricsCalculatorInterface
 */
export enum MetricsCalculatorErrorCode {
  INVALID_SESSION_DATA = 'INVALID_SESSION_DATA',
  CALCULATION_FAILED = 'CALCULATION_FAILED',
  INVALID_COUNT = 'INVALID_COUNT',
  INVALID_SCORE = 'INVALID_SCORE',
  INVALID_DURATION = 'INVALID_DURATION',
  DIVISION_BY_ZERO = 'DIVISION_BY_ZERO',
  INVALID_POINTS = 'INVALID_POINTS',
  INVALID_BLINK_SPEED = 'INVALID_BLINK_SPEED',
}

/**
 * MetricsCalculatorInterface
 */
export interface MetricsCalculatorInterface {
  /**
   * Calculates metrics for a learning session
   * @param sessionData - Session data for calculation
   * @returns Calculated metrics
   * @throws INVALID_SESSION_DATA if The session data is invalid
   * @throws CALCULATION_FAILED if Failed to calculate metrics
   */
  calculateSessionMetrics(sessionData: SessionData): MetricsResult;

  /**
   * Calculates first-time correct points
   * @param ftcCount - Number of first-time correct answers
   * @returns Calculated FTC points
   * @throws INVALID_COUNT if The count is invalid
   */
  calculateFTCPoints(ftcCount: number): number;

  /**
   * Calculates eventually correct points
   * @param ecCount - Number of eventually correct answers
   * @returns Calculated EC points
   * @throws INVALID_COUNT if The count is invalid
   */
  calculateECPoints(ecCount: number): number;

  /**
   * Calculates bonus multiplier based on consistency, accuracy, and speed
   * @param consistency - Consistency score (0.0-1.0)
   * @param accuracy - Accuracy score (0.0-1.0)
   * @param speed - Speed score (0.0-1.0)
   * @returns Calculated bonus multiplier
   * @throws INVALID_SCORE if One or more scores are invalid
   */
  calculateBonusMultiplier(consistency: number, accuracy: number, speed: number): number;

  /**
   * Calculates blink speed (ms per FTC answer)
   * @param duration - Session duration in milliseconds
   * @param ftcCount - Number of first-time correct answers
   * @returns Calculated blink speed
   * @throws INVALID_DURATION if The duration is invalid
   * @throws INVALID_COUNT if The count is invalid
   * @throws DIVISION_BY_ZERO if Cannot calculate blink speed with zero FTC answers
   */
  calculateBlinkSpeed(duration: number, ftcCount: number): number;

  /**
   * Calculates the Evolution metric
   * @param totalPoints - Total points
   * @param blinkSpeed - Blink speed in milliseconds
   * @returns Calculated Evolution metric
   * @throws INVALID_POINTS if The points value is invalid
   * @throws INVALID_BLINK_SPEED if The blink speed is invalid
   * @throws DIVISION_BY_ZERO if Cannot calculate blink speed with zero FTC answers
   */
  calculateEvolution(totalPoints: number, blinkSpeed: number): number;

}

// Export default interface
export default MetricsCalculatorInterface;
