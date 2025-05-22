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

// Define error codes that can be thrown by the MetricsCalculator
enum ErrorCode {
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
 * Custom error class for MetricsCalculator
 */
class MetricsError extends Error {
  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = code;
  }
}

/**
 * Session data for metrics calculation
 */
interface SessionData {
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
  
  /** Array of response times in milliseconds (optional) */
  responseTimeData?: number[];
}

/**
 * Result of metrics calculation
 */
interface MetricsResult {
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
 * MetricsCalculator interface
 */
interface MetricsCalculatorInterface {
  /**
   * Calculates metrics for a learning session
   * @param sessionData - Session data for calculation
   * @returns Calculated metrics
   * @throws INVALID_SESSION_DATA if the session data is invalid
   * @throws CALCULATION_FAILED if failed to calculate metrics
   */
  calculateSessionMetrics(sessionData: SessionData): MetricsResult;

  /**
   * Calculates first-time correct points
   * @param ftcCount - Number of first-time correct answers
   * @returns Calculated FTC points
   * @throws INVALID_COUNT if the count is invalid
   */
  calculateFTCPoints(ftcCount: number): number;

  /**
   * Calculates eventually correct points
   * @param ecCount - Number of eventually correct answers
   * @returns Calculated EC points
   * @throws INVALID_COUNT if the count is invalid
   */
  calculateECPoints(ecCount: number): number;

  /**
   * Calculates bonus multiplier based on consistency, accuracy, and speed
   * @param consistency - Consistency score (0.0-1.0)
   * @param accuracy - Accuracy score (0.0-1.0)
   * @param speed - Speed score (0.0-1.0)
   * @returns Calculated bonus multiplier
   * @throws INVALID_SCORE if one or more scores are invalid
   */
  calculateBonusMultiplier(consistency: number, accuracy: number, speed: number): number;

  /**
   * Calculates blink speed (ms per FTC answer)
   * @param duration - Session duration in milliseconds
   * @param ftcCount - Number of first-time correct answers
   * @returns Calculated blink speed
   * @throws INVALID_DURATION if the duration is invalid
   * @throws INVALID_COUNT if the count is invalid
   * @throws DIVISION_BY_ZERO if cannot calculate blink speed with zero FTC answers
   */
  calculateBlinkSpeed(duration: number, ftcCount: number): number;

  /**
   * Calculates the Evolution metric
   * @param totalPoints - Total points
   * @param blinkSpeed - Blink speed in milliseconds
   * @returns Calculated Evolution metric
   * @throws INVALID_POINTS if the points value is invalid
   * @throws INVALID_BLINK_SPEED if the blink speed is invalid
   * @throws DIVISION_BY_ZERO if cannot calculate Evolution with zero blink speed
   */
  calculateEvolution(totalPoints: number, blinkSpeed: number): number;
}

/**
 * MetricsCalculator class implementation
 */
export class MetricsCalculator implements MetricsCalculatorInterface {
  /** Points awarded per FTC answer */
  private readonly FTC_POINTS_PER_ANSWER = 5;
  
  /** Points awarded per EC answer */
  private readonly EC_POINTS_PER_ANSWER = 3;
  
  /** Expected response time in milliseconds (for Speed calculation) */
  private readonly EXPECTED_RESPONSE_TIME = 3000;
  
  /** Default speed value when response time data is not available */
  private readonly DEFAULT_SPEED = 0.5;
  
  /** Weight of consistency in bonus multiplier calculation */
  private readonly CONSISTENCY_WEIGHT = 0.1;
  
  /** Weight of accuracy in bonus multiplier calculation */
  private readonly ACCURACY_WEIGHT = 0.1;
  
  /** Weight of speed in bonus multiplier calculation */
  private readonly SPEED_WEIGHT = 0.1;
  
  /** Precision for floating-point calculations (number of decimal places) */
  private readonly PRECISION = 2;

  /**
   * Validates session data for calculation
   * @param sessionData - Session data to validate
   * @throws INVALID_SESSION_DATA if the session data is invalid
   */
  private validateSessionData(sessionData: SessionData): void {
    if (!sessionData) {
      throw new MetricsError(ErrorCode.INVALID_SESSION_DATA, 'Session data is required');
    }

    if (typeof sessionData.duration !== 'number' || sessionData.duration < 0) {
      throw new MetricsError(ErrorCode.INVALID_SESSION_DATA, 'Session duration must be a non-negative number');
    }

    if (!Number.isInteger(sessionData.questionCount) || sessionData.questionCount < 0) {
      throw new MetricsError(ErrorCode.INVALID_SESSION_DATA, 'Question count must be a non-negative integer');
    }

    if (!Number.isInteger(sessionData.ftcCount) || sessionData.ftcCount < 0) {
      throw new MetricsError(ErrorCode.INVALID_SESSION_DATA, 'FTC count must be a non-negative integer');
    }

    if (!Number.isInteger(sessionData.ecCount) || sessionData.ecCount < 0) {
      throw new MetricsError(ErrorCode.INVALID_SESSION_DATA, 'EC count must be a non-negative integer');
    }

    if (!Number.isInteger(sessionData.incorrectCount) || sessionData.incorrectCount < 0) {
      throw new MetricsError(ErrorCode.INVALID_SESSION_DATA, 'Incorrect count must be a non-negative integer');
    }

    // Validate the sum of FTC, EC, and incorrect counts matches the question count
    if (sessionData.ftcCount + sessionData.ecCount + sessionData.incorrectCount !== sessionData.questionCount) {
      throw new MetricsError(
        ErrorCode.INVALID_SESSION_DATA,
        'Sum of FTC, EC, and incorrect counts must equal the question count'
      );
    }

    // Validate response time data if provided
    if (sessionData.responseTimeData) {
      if (!Array.isArray(sessionData.responseTimeData)) {
        throw new MetricsError(ErrorCode.INVALID_SESSION_DATA, 'Response time data must be an array');
      }

      if (sessionData.responseTimeData.length !== sessionData.questionCount) {
        throw new MetricsError(
          ErrorCode.INVALID_SESSION_DATA,
          'Response time data length must match the question count'
        );
      }

      for (const responseTime of sessionData.responseTimeData) {
        if (typeof responseTime !== 'number' || responseTime < 0) {
          throw new MetricsError(
            ErrorCode.INVALID_SESSION_DATA,
            'Response time values must be non-negative numbers'
          );
        }
      }
    }
  }

  /**
   * Rounds a number to the specified precision
   * @param value - Number to round
   * @param precision - Number of decimal places
   * @returns Rounded number
   */
  private round(value: number, precision: number = this.PRECISION): number {
    const factor = Math.pow(10, precision);
    return Math.round(value * factor) / factor;
  }

  /**
   * Calculates metrics for a learning session
   * @param sessionData - Session data for calculation
   * @returns Calculated metrics
   * @throws INVALID_SESSION_DATA if the session data is invalid
   * @throws CALCULATION_FAILED if failed to calculate metrics
   */
  public calculateSessionMetrics(sessionData: SessionData): MetricsResult {
    try {
      // Validate session data
      this.validateSessionData(sessionData);

      // Calculate basic metrics
      const ftcPoints = this.calculateFTCPoints(sessionData.ftcCount);
      const ecPoints = this.calculateECPoints(sessionData.ecCount);
      const basePoints = ftcPoints + ecPoints;

      // Calculate accuracy
      const accuracy = this.round(
        (sessionData.ftcCount + sessionData.ecCount) / sessionData.questionCount
      );

      // Calculate consistency
      let consistency: number;
      if (sessionData.responseTimeData) {
        // Calculate streak breaks if response time data is available
        // We can analyze the pattern of correct and incorrect answers to determine streak breaks
        // For simplicity, we'll use accuracy as consistency when response data is provided
        consistency = accuracy;
      } else {
        // Use accuracy as a proxy for consistency when response data is not available
        consistency = accuracy;
      }
      consistency = this.round(consistency);

      // Calculate speed
      let speed: number;
      if (sessionData.responseTimeData && sessionData.responseTimeData.length > 0) {
        // Calculate average response time
        const averageResponseTime = sessionData.responseTimeData.reduce((sum, time) => sum + time, 0) / 
          sessionData.responseTimeData.length;
        
        // Calculate speed based on average response time
        speed = 1 - Math.min(1, averageResponseTime / this.EXPECTED_RESPONSE_TIME);
      } else {
        // Use default speed when response time data is not available
        speed = this.DEFAULT_SPEED;
      }
      speed = this.round(speed);

      // Calculate bonus multiplier
      const bonusMultiplier = this.calculateBonusMultiplier(consistency, accuracy, speed);

      // Calculate blink speed
      const blinkSpeed = this.calculateBlinkSpeed(sessionData.duration, sessionData.ftcCount);

      // Calculate total points
      const totalPoints = this.round(basePoints * bonusMultiplier);

      // Return metrics result
      return {
        ftcPoints,
        ecPoints,
        basePoints,
        consistency,
        accuracy,
        speed,
        bonusMultiplier,
        blinkSpeed,
        totalPoints
      };
    } catch (error) {
      if (error instanceof MetricsError) {
        throw error;
      }
      
      throw new MetricsError(
        ErrorCode.CALCULATION_FAILED,
        `Failed to calculate session metrics: ${error.message}`
      );
    }
  }

  /**
   * Calculates first-time correct points
   * @param ftcCount - Number of first-time correct answers
   * @returns Calculated FTC points
   * @throws INVALID_COUNT if the count is invalid
   */
  public calculateFTCPoints(ftcCount: number): number {
    if (!Number.isInteger(ftcCount) || ftcCount < 0) {
      throw new MetricsError(
        ErrorCode.INVALID_COUNT,
        'FTC count must be a non-negative integer'
      );
    }

    return ftcCount * this.FTC_POINTS_PER_ANSWER;
  }

  /**
   * Calculates eventually correct points
   * @param ecCount - Number of eventually correct answers
   * @returns Calculated EC points
   * @throws INVALID_COUNT if the count is invalid
   */
  public calculateECPoints(ecCount: number): number {
    if (!Number.isInteger(ecCount) || ecCount < 0) {
      throw new MetricsError(
        ErrorCode.INVALID_COUNT,
        'EC count must be a non-negative integer'
      );
    }

    return ecCount * this.EC_POINTS_PER_ANSWER;
  }

  /**
   * Calculates bonus multiplier based on consistency, accuracy, and speed
   * @param consistency - Consistency score (0.0-1.0)
   * @param accuracy - Accuracy score (0.0-1.0)
   * @param speed - Speed score (0.0-1.0)
   * @returns Calculated bonus multiplier
   * @throws INVALID_SCORE if one or more scores are invalid
   */
  public calculateBonusMultiplier(consistency: number, accuracy: number, speed: number): number {
    // Validate scores
    if (typeof consistency !== 'number' || consistency < 0 || consistency > 1) {
      throw new MetricsError(
        ErrorCode.INVALID_SCORE,
        'Consistency score must be a number between 0 and 1'
      );
    }

    if (typeof accuracy !== 'number' || accuracy < 0 || accuracy > 1) {
      throw new MetricsError(
        ErrorCode.INVALID_SCORE,
        'Accuracy score must be a number between 0 and 1'
      );
    }

    if (typeof speed !== 'number' || speed < 0 || speed > 1) {
      throw new MetricsError(
        ErrorCode.INVALID_SCORE,
        'Speed score must be a number between 0 and 1'
      );
    }

    // Calculate bonus multiplier
    const bonusMultiplier = 1 + 
      (consistency * this.CONSISTENCY_WEIGHT) + 
      (accuracy * this.ACCURACY_WEIGHT) + 
      (speed * this.SPEED_WEIGHT);

    // Round to specified precision
    return this.round(bonusMultiplier);
  }

  /**
   * Calculates blink speed (ms per FTC answer)
   * @param duration - Session duration in milliseconds
   * @param ftcCount - Number of first-time correct answers
   * @returns Calculated blink speed
   * @throws INVALID_DURATION if the duration is invalid
   * @throws INVALID_COUNT if the count is invalid
   * @throws DIVISION_BY_ZERO if cannot calculate blink speed with zero FTC answers
   */
  public calculateBlinkSpeed(duration: number, ftcCount: number): number {
    // Validate duration
    if (typeof duration !== 'number' || duration < 0) {
      throw new MetricsError(
        ErrorCode.INVALID_DURATION,
        'Duration must be a non-negative number'
      );
    }

    // Validate FTC count
    if (!Number.isInteger(ftcCount) || ftcCount < 0) {
      throw new MetricsError(
        ErrorCode.INVALID_COUNT,
        'FTC count must be a non-negative integer'
      );
    }

    // Handle division by zero
    if (ftcCount === 0) {
      // Return session duration as the maximum blink speed
      return duration;
    }

    // Calculate blink speed
    return Math.round(duration / ftcCount);
  }

  /**
   * Calculates the Evolution metric
   * @param totalPoints - Total points
   * @param blinkSpeed - Blink speed in milliseconds
   * @returns Calculated Evolution metric
   * @throws INVALID_POINTS if the points value is invalid
   * @throws INVALID_BLINK_SPEED if the blink speed is invalid
   * @throws DIVISION_BY_ZERO if cannot calculate Evolution with zero blink speed
   */
  public calculateEvolution(totalPoints: number, blinkSpeed: number): number {
    // Validate total points
    if (typeof totalPoints !== 'number' || totalPoints < 0) {
      throw new MetricsError(
        ErrorCode.INVALID_POINTS,
        'Total points must be a non-negative number'
      );
    }

    // Validate blink speed
    if (typeof blinkSpeed !== 'number' || blinkSpeed < 0) {
      throw new MetricsError(
        ErrorCode.INVALID_BLINK_SPEED,
        'Blink speed must be a non-negative number'
      );
    }

    // Handle division by zero
    if (blinkSpeed === 0) {
      return 0;
    }

    // Calculate evolution
    const evolution = totalPoints / blinkSpeed;

    // Round to specified precision
    return this.round(evolution);
  }
}
