/**
 * SessionMetricsManager
 * 
 * This component calculates and manages metrics for individual learning sessions
 * in the Zenjin Maths App. It tracks and calculates key performance metrics
 * including FTCPoints, ECPoints, BasePoints, BonusMultipliers, BlinkSpeed, and
 * TotalPoints, providing real-time feedback during sessions and comprehensive
 * summaries upon completion.
 */

// Error types for SessionMetricsManager
enum SessionMetricsError {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_CONFIG = 'INVALID_CONFIG',
  SESSION_START_FAILED = 'SESSION_START_FAILED',
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  INVALID_ANSWER = 'INVALID_ANSWER',
  SESSION_ENDED = 'SESSION_ENDED',
  SESSION_ALREADY_ENDED = 'SESSION_ALREADY_ENDED',
  SESSION_NOT_ENDED = 'SESSION_NOT_ENDED',
  SUMMARY_GENERATION_FAILED = 'SUMMARY_GENERATION_FAILED'
}

/**
 * Configuration for a learning session
 */
interface SessionConfig {
  /** Target session duration in seconds (optional) */
  duration?: number;
  
  /** Target number of questions (optional) */
  questionCount?: number;
  
  /** Learning path identifier (optional) */
  learningPathId?: string;
  
  /** Stitch identifier (optional) */
  stitchId?: string;
}

/**
 * Record of an answer during a session
 */
interface AnswerRecord {
  /** Question identifier */
  questionId: string;
  
  /** Whether the answer was correct */
  isCorrect: boolean;
  
  /** Whether this was the first attempt */
  isFirstAttempt: boolean;
  
  /** Response time in milliseconds */
  responseTime: number;
  
  /** ISO date string of the answer */
  timestamp: string;
}

/**
 * Summary of a completed learning session
 */
interface SessionSummary {
  /** Session identifier */
  sessionId: string;
  
  /** User identifier */
  userId: string;
  
  /** Actual session duration in milliseconds */
  duration: number;
  
  /** Number of questions answered */
  questionCount: number;
  
  /** Number of first-time correct answers */
  ftcCount: number;
  
  /** Number of eventually correct answers */
  ecCount: number;
  
  /** Number of incorrect answers */
  incorrectCount: number;
  
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
  
  /** ISO date string of session start */
  startTime: string;
  
  /** ISO date string of session end */
  endTime: string;
}

/**
 * Current metrics during an active session
 */
interface CurrentSessionMetrics {
  /** Current duration in milliseconds */
  duration: number;
  
  /** Current question count */
  questionCount: number;
  
  /** Current first-time correct count */
  ftcCount: number;
  
  /** Current eventually correct count */
  ecCount: number;
  
  /** Current incorrect count */
  incorrectCount: number;
  
  /** Current points estimate */
  currentPoints: number;
}

/**
 * Internal state of a session
 */
interface SessionState {
  /** Session configuration */
  config: SessionConfig;
  
  /** User identifier */
  userId: string;
  
  /** ISO date string of session start */
  startTime: string;
  
  /** ISO date string of session end (if ended) */
  endTime?: string;
  
  /** List of answers recorded during the session */
  answers: AnswerRecord[];
  
  /** Map of question IDs to attempts (to track EC vs FTC) */
  questionAttempts: Map<string, number>;
  
  /** List of correctness sequence (for consistency calculation) */
  correctnessSequence: boolean[];
  
  /** Whether the session has ended */
  isEnded: boolean;
  
  /** Cached session summary (after session ends) */
  summary?: SessionSummary;
}

/**
 * Implementation of the SessionMetricsManager component
 */
export class SessionMetricsManager {
  // Expected response time in milliseconds (for speed calculation)
  private static readonly EXPECTED_RESPONSE_TIME = 3000;
  
  // Points awarded for First Time Correct answers
  private static readonly FTC_POINTS = 5;
  
  // Points awarded for Eventually Correct answers
  private static readonly EC_POINTS = 3;
  
  // Weight factors for bonus multiplier components
  private static readonly CONSISTENCY_WEIGHT = 0.1;
  private static readonly ACCURACY_WEIGHT = 0.1;
  private static readonly SPEED_WEIGHT = 0.1;
  
  // Map of active and completed sessions
  private sessions: Map<string, SessionState>;
  
  // Counter for generating session IDs
  private sessionCounter: number;
  
  /**
   * Creates a new SessionMetricsManager
   */
  constructor() {
    this.sessions = new Map<string, SessionState>();
    this.sessionCounter = 1;
  }
  
  /**
   * Starts a new learning session
   * @param userId - User identifier
   * @param sessionConfig - Session configuration (optional)
   * @returns Identifier for the new session
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws INVALID_CONFIG if the session configuration is invalid
   * @throws SESSION_START_FAILED if failed to start the session
   */
  public startSession(userId: string, sessionConfig?: SessionConfig): string {
    // Validate user ID
    if (!userId || userId.trim() === '') {
      throw new Error(SessionMetricsError.USER_NOT_FOUND);
    }
    
    // Validate session configuration
    if (sessionConfig) {
      if (
        (sessionConfig.duration !== undefined && sessionConfig.duration <= 0) ||
        (sessionConfig.questionCount !== undefined && sessionConfig.questionCount <= 0)
      ) {
        throw new Error(SessionMetricsError.INVALID_CONFIG);
      }
    }
    
    try {
      // Generate session ID
      const sessionId = `session_${this.sessionCounter++}_${Date.now()}`;
      
      // Create new session state
      const sessionState: SessionState = {
        config: sessionConfig || {},
        userId,
        startTime: new Date().toISOString(),
        answers: [],
        questionAttempts: new Map<string, number>(),
        correctnessSequence: [],
        isEnded: false
      };
      
      // Store session state
      this.sessions.set(sessionId, sessionState);
      
      return sessionId;
    } catch (error) {
      throw new Error(SessionMetricsError.SESSION_START_FAILED);
    }
  }
  
  /**
   * Records an answer during the session
   * @param sessionId - Session identifier
   * @param answer - Answer record
   * @returns Whether the answer was successfully recorded
   * @throws SESSION_NOT_FOUND if the specified session was not found
   * @throws INVALID_ANSWER if the answer record is invalid
   * @throws SESSION_ENDED if the session has already ended
   */
  public recordAnswer(sessionId: string, answer: AnswerRecord): boolean {
    // Validate session ID
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(SessionMetricsError.SESSION_NOT_FOUND);
    }
    
    // Check if session has ended
    if (session.isEnded) {
      throw new Error(SessionMetricsError.SESSION_ENDED);
    }
    
    // Validate answer record
    if (
      !answer.questionId ||
      answer.responseTime < 0 ||
      !answer.timestamp
    ) {
      throw new Error(SessionMetricsError.INVALID_ANSWER);
    }
    
    // Track question attempts
    const currentAttempts = session.questionAttempts.get(answer.questionId) || 0;
    session.questionAttempts.set(answer.questionId, currentAttempts + 1);
    
    // Ensure isFirstAttempt is consistent with our tracking
    const isFirstAttempt = currentAttempts === 0;
    if (answer.isFirstAttempt !== isFirstAttempt) {
      answer = { ...answer, isFirstAttempt };
    }
    
    // Record the answer
    session.answers.push(answer);
    
    // Update correctness sequence for consistency calculation
    session.correctnessSequence.push(answer.isCorrect);
    
    return true;
  }
  
  /**
   * Gets the current metrics for an active session
   * @param sessionId - Session identifier
   * @returns Current session metrics
   * @throws SESSION_NOT_FOUND if the specified session was not found
   * @throws SESSION_ENDED if the session has already ended
   */
  public getCurrentMetrics(sessionId: string): CurrentSessionMetrics {
    // Validate session ID
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(SessionMetricsError.SESSION_NOT_FOUND);
    }
    
    // Check if session has ended
    if (session.isEnded) {
      throw new Error(SessionMetricsError.SESSION_ENDED);
    }
    
    // Calculate current duration
    const currentTime = new Date();
    const startTime = new Date(session.startTime);
    const duration = currentTime.getTime() - startTime.getTime();
    
    // Count metrics
    let ftcCount = 0;
    let ecCount = 0;
    let incorrectCount = 0;
    
    // Process all answers
    const processedQuestions = new Set<string>();
    
    for (const answer of session.answers) {
      // For calculating counts, we need to handle multiple attempts on the same question
      if (answer.isCorrect) {
        if (answer.isFirstAttempt) {
          ftcCount++;
          processedQuestions.add(answer.questionId);
        } else if (!processedQuestions.has(answer.questionId)) {
          ecCount++;
          processedQuestions.add(answer.questionId);
        }
      } else if (!processedQuestions.has(answer.questionId) && 
                !session.answers.some(a => 
                  a.questionId === answer.questionId && a.isCorrect)) {
        incorrectCount++;
        processedQuestions.add(answer.questionId);
      }
    }
    
    // Calculate current points estimate
    const ftcPoints = ftcCount * SessionMetricsManager.FTC_POINTS;
    const ecPoints = ecCount * SessionMetricsManager.EC_POINTS;
    const basePoints = ftcPoints + ecPoints;
    
    // Calculate current bonus multiplier estimate (simplified)
    const questionCount = ftcCount + ecCount + incorrectCount;
    const accuracy = questionCount > 0 ? (ftcCount + ecCount) / questionCount : 0;
    const estimatedBonusMultiplier = 1 + (accuracy * SessionMetricsManager.ACCURACY_WEIGHT);
    
    // Calculate current points with estimated bonus
    const currentPoints = Math.round(basePoints * estimatedBonusMultiplier);
    
    return {
      duration,
      questionCount,
      ftcCount,
      ecCount,
      incorrectCount,
      currentPoints
    };
  }
  
  /**
   * Ends a session and generates a summary
   * @param sessionId - Session identifier
   * @returns Session summary
   * @throws SESSION_NOT_FOUND if the specified session was not found
   * @throws SESSION_ALREADY_ENDED if the session has already ended
   * @throws SUMMARY_GENERATION_FAILED if failed to generate session summary
   */
  public endSession(sessionId: string): SessionSummary {
    // Validate session ID
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(SessionMetricsError.SESSION_NOT_FOUND);
    }
    
    // Check if session has already ended
    if (session.isEnded) {
      throw new Error(SessionMetricsError.SESSION_ALREADY_ENDED);
    }
    
    try {
      // Mark session as ended
      session.isEnded = true;
      session.endTime = new Date().toISOString();
      
      // Generate session summary
      const summary = this.generateSessionSummary(sessionId, session);
      
      // Cache the summary
      session.summary = summary;
      
      return summary;
    } catch (error) {
      // Revert session state on error
      session.isEnded = false;
      session.endTime = undefined;
      throw new Error(SessionMetricsError.SUMMARY_GENERATION_FAILED);
    }
  }
  
  /**
   * Gets the summary for a completed session
   * @param sessionId - Session identifier
   * @returns Session summary
   * @throws SESSION_NOT_FOUND if the specified session was not found
   * @throws SESSION_NOT_ENDED if the session has not ended yet
   */
  public getSessionSummary(sessionId: string): SessionSummary {
    // Validate session ID
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(SessionMetricsError.SESSION_NOT_FOUND);
    }
    
    // Check if session has ended
    if (!session.isEnded) {
      throw new Error(SessionMetricsError.SESSION_NOT_ENDED);
    }
    
    // Return cached summary if available
    if (session.summary) {
      return session.summary;
    }
    
    // Generate summary if not cached
    const summary = this.generateSessionSummary(sessionId, session);
    session.summary = summary;
    return summary;
  }
  
  /**
   * Generates a session summary
   * @param sessionId - Session identifier
   * @param session - Session state
   * @returns Session summary
   * @private
   */
  private generateSessionSummary(sessionId: string, session: SessionState): SessionSummary {
    // Calculate session duration
    const startTime = new Date(session.startTime);
    const endTime = new Date(session.endTime || new Date().toISOString());
    const duration = endTime.getTime() - startTime.getTime();
    
    // Process answers to calculate metrics
    const uniqueQuestions = new Set<string>();
    let ftcCount = 0;
    let ecCount = 0;
    let incorrectCount = 0;
    let totalResponseTime = 0;
    
    // Track which questions have been counted already
    const processedQuestions = new Set<string>();
    
    // First pass: Count FTC, EC, and incorrect answers
    for (const answer of session.answers) {
      uniqueQuestions.add(answer.questionId);
      totalResponseTime += answer.responseTime;
      
      // Skip already processed questions
      if (processedQuestions.has(answer.questionId)) {
        continue;
      }
      
      if (answer.isCorrect) {
        if (answer.isFirstAttempt) {
          ftcCount++;
          processedQuestions.add(answer.questionId);
        } else {
          ecCount++;
          processedQuestions.add(answer.questionId);
        }
      }
    }
    
    // Count remaining incorrect answers (questions never answered correctly)
    for (const questionId of uniqueQuestions) {
      if (!processedQuestions.has(questionId)) {
        incorrectCount++;
        processedQuestions.add(questionId);
      }
    }
    
    // Calculate total question count
    const questionCount = ftcCount + ecCount + incorrectCount;
    
    // Calculate points
    const ftcPoints = ftcCount * SessionMetricsManager.FTC_POINTS;
    const ecPoints = ecCount * SessionMetricsManager.EC_POINTS;
    const basePoints = ftcPoints + ecPoints;
    
    // Calculate consistency score
    const consistency = this.calculateConsistency(session.correctnessSequence);
    
    // Calculate accuracy score
    const accuracy = questionCount > 0 ? (ftcCount + ecCount) / questionCount : 0;
    
    // Calculate speed score
    const averageResponseTime = session.answers.length > 0 ? 
      totalResponseTime / session.answers.length : 
      SessionMetricsManager.EXPECTED_RESPONSE_TIME;
    
    const speed = Math.max(
      0,
      Math.min(
        1,
        1 - (averageResponseTime / SessionMetricsManager.EXPECTED_RESPONSE_TIME)
      )
    );
    
    // Calculate bonus multiplier
    const bonusMultiplier = 1 + 
      (consistency * SessionMetricsManager.CONSISTENCY_WEIGHT) +
      (accuracy * SessionMetricsManager.ACCURACY_WEIGHT) +
      (speed * SessionMetricsManager.SPEED_WEIGHT);
    
    // Calculate blink speed
    const blinkSpeed = ftcCount > 0 ? duration / ftcCount : duration;
    
    // Calculate total points
    const totalPoints = basePoints * bonusMultiplier;
    
    // Create session summary
    return {
      sessionId,
      userId: session.userId,
      duration,
      questionCount,
      ftcCount,
      ecCount,
      incorrectCount,
      ftcPoints,
      ecPoints,
      basePoints,
      consistency,
      accuracy,
      speed,
      bonusMultiplier,
      blinkSpeed,
      totalPoints,
      startTime: session.startTime,
      endTime: session.endTime || new Date().toISOString()
    };
  }
  
  /**
   * Calculates consistency score based on correctness sequence
   * @param sequence - Sequence of correct/incorrect answers
   * @returns Consistency score (0.0-1.0)
   * @private
   */
  private calculateConsistency(sequence: boolean[]): number {
    if (sequence.length <= 1) {
      return 1.0; // Perfect consistency for 0 or 1 answers
    }
    
    let streakBreaks = 0;
    for (let i = 1; i < sequence.length; i++) {
      if (sequence[i] !== sequence[i-1]) {
        streakBreaks++;
      }
    }
    
    return 1 - (streakBreaks / (sequence.length - 1));
  }
}
