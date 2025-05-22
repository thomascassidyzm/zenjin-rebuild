/**
 * Integration example showing how MetricsStorage fits into the MetricsSystem module
 */

import { 
  MetricsStorage, 
  MetricsStorageManager, 
  SessionMetrics, 
  LifetimeMetrics 
} from './metrics-storage-index';

/**
 * Simplified SessionMetricsManager that would use MetricsStorage
 */
class SessionMetricsManager {
  private metricsStorageManager: MetricsStorageManager;
  private currentSession: {
    sessionId: string;
    userId: string;
    startTime: string;
    questions: Array<{
      questionId: string;
      isCorrect: boolean;
      isFirstTimeCorrect: boolean;
      timeSpent: number;
    }>;
  } | null = null;
  
  constructor(metricsStorageManager: MetricsStorageManager) {
    this.metricsStorageManager = metricsStorageManager;
  }
  
  /**
   * Start a new learning session
   * @param userId - User identifier
   * @returns Session identifier
   */
  public startSession(userId: string): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    this.currentSession = {
      sessionId,
      userId,
      startTime: new Date().toISOString(),
      questions: []
    };
    
    return sessionId;
  }
  
  /**
   * Record a question answer
   * @param questionId - Question identifier
   * @param isCorrect - Whether the answer was correct
   * @param isFirstTimeCorrect - Whether it was correct on the first try
   * @param timeSpent - Time spent on the question in milliseconds
   */
  public recordAnswer(
    questionId: string, 
    isCorrect: boolean, 
    isFirstTimeCorrect: boolean, 
    timeSpent: number
  ): void {
    if (!this.currentSession) {
      throw new Error('No active session');
    }
    
    this.currentSession.questions.push({
      questionId,
      isCorrect,
      isFirstTimeCorrect,
      timeSpent
    });
  }
  
  /**
   * End the current session and save metrics
   * @returns Session metrics
   */
  public async endSession(): Promise<SessionMetrics> {
    if (!this.currentSession) {
      throw new Error('No active session');
    }
    
    // Calculate metrics
    const endTime = new Date().toISOString();
    const duration = new Date(endTime).getTime() - new Date(this.currentSession.startTime).getTime();
    
    const questionCount = this.currentSession.questions.length;
    const ftcCount = this.currentSession.questions.filter(q => q.isFirstTimeCorrect).length;
    const ecCount = this.currentSession.questions.filter(q => q.isCorrect && !q.isFirstTimeCorrect).length;
    const incorrectCount = this.currentSession.questions.filter(q => !q.isCorrect).length;
    
    // Calculate points
    const ftcPoints = ftcCount * 5; // 5 points for each FTC
    const ecPoints = ecCount * 3; // 3 points for each EC
    const basePoints = ftcPoints + ecPoints;
    
    // Calculate performance metrics
    const accuracy = questionCount > 0 ? (ftcCount + ecCount) / questionCount : 0;
    const consistency = questionCount > 0 ? ftcCount / questionCount : 0;
    
    // Calculate speed based on average time per correct answer
    const correctAnswers = this.currentSession.questions.filter(q => q.isCorrect);
    const avgTimePerCorrect = correctAnswers.length > 0 
      ? correctAnswers.reduce((sum, q) => sum + q.timeSpent, 0) / correctAnswers.length 
      : 0;
    
    // Normalize speed to 0-1 range (lower time is better)
    // Assuming 30s is the maximum expected time per question
    const speed = avgTimePerCorrect > 0 ? Math.max(0, Math.min(1, 1 - (avgTimePerCorrect / 30000))) : 0;
    
    // Calculate bonus multiplier based on accuracy, consistency, and speed
    const bonusMultiplier = 1 + (0.1 * accuracy) + (0.1 * consistency) + (0.05 * speed);
    
    // Calculate blink speed (ms per FTC answer)
    const blinkSpeed = ftcCount > 0 
      ? this.currentSession.questions
          .filter(q => q.isFirstTimeCorrect)
          .reduce((sum, q) => sum + q.timeSpent, 0) / ftcCount 
      : 0;
    
    // Calculate total points
    const totalPoints = basePoints * bonusMultiplier;
    
    // Create session metrics
    const sessionMetrics: SessionMetrics = {
      sessionId: this.currentSession.sessionId,
      userId: this.currentSession.userId,
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
      startTime: this.currentSession.startTime,
      endTime
    };
    
    // Save metrics and update lifetime metrics
    await this.metricsStorageManager.saveSessionAndUpdateLifetime(sessionMetrics);
    
    // Reset current session
    this.currentSession = null;
    
    return sessionMetrics;
  }
}

/**
 * Simplified LifetimeMetricsManager that would use MetricsStorage
 */
class LifetimeMetricsManager {
  private metricsStorageManager: MetricsStorageManager;
  
  constructor(metricsStorageManager: MetricsStorageManager) {
    this.metricsStorageManager = metricsStorageManager;
  }
  
  /**
   * Get lifetime metrics for a user
   * @param userId - User identifier
   * @returns Lifetime metrics or null if not found
   */
  public async getLifetimeMetrics(userId: string): Promise<LifetimeMetrics | null> {
    return this.metricsStorageManager.getLifetimeMetrics(userId);
  }
  
  /**
   * Get user streak information
   * @param userId - User identifier
   * @returns Streak information
   */
  public async getUserStreak(userId: string): Promise<{
    currentStreak: number;
    longestStreak: number;
  }> {
    const lifetimeMetrics = await this.metricsStorageManager.getLifetimeMetrics(userId);
    
    if (!lifetimeMetrics) {
      return {
        currentStreak: 0,
        longestStreak: 0
      };
    }
    
    return {
      currentStreak: lifetimeMetrics.streakDays || 0,
      longestStreak: lifetimeMetrics.longestStreakDays || 0
    };
  }
  
  /**
   * Get performance trends for a user
   * @param userId - User identifier
   * @returns Performance trends
   */
  public async getPerformanceTrends(userId: string): Promise<{
    pointsTrend: number;
    evolutionTrend: number;
    blinkSpeedTrend: number;
  }> {
    // Get recent session history
    const sessionHistory = await this.metricsStorageManager.getRecentSessions(userId, 10);
    
    if (sessionHistory.length < 2) {
      return {
        pointsTrend: 0,
        evolutionTrend: 0,
        blinkSpeedTrend: 0
      };
    }
    
    // Calculate points trend
    const earlierPoints = sessionHistory[sessionHistory.length - 1].totalPoints;
    const latestPoints = sessionHistory[0].totalPoints;
    const pointsTrend = (latestPoints - earlierPoints) / earlierPoints;
    
    // For a real implementation, we would need to store evolution and blink speed
    // in the session history to calculate these trends accurately
    
    return {
      pointsTrend,
      evolutionTrend: 0, // Placeholder
      blinkSpeedTrend: 0 // Placeholder
    };
  }
}

/**
 * Main MetricsSystem class that would coordinate the metrics components
 */
class MetricsSystem {
  private metricsStorage: MetricsStorage;
  private metricsStorageManager: MetricsStorageManager;
  private sessionMetricsManager: SessionMetricsManager;
  private lifetimeMetricsManager: LifetimeMetricsManager;
  
  constructor() {
    // Initialize storage components
    this.metricsStorage = new MetricsStorage({
      enableCache: true,
      autoSync: true
    });
    
    this.metricsStorageManager = new MetricsStorageManager(this.metricsStorage);
    
    // Initialize managers
    this.sessionMetricsManager = new SessionMetricsManager(this.metricsStorageManager);
    this.lifetimeMetricsManager = new LifetimeMetricsManager(this.metricsStorageManager);
  }
  
  /**
   * Get the session metrics manager
   * @returns Session metrics manager
   */
  public getSessionMetricsManager(): SessionMetricsManager {
    return this.sessionMetricsManager;
  }
  
  /**
   * Get the lifetime metrics manager
   * @returns Lifetime metrics manager
   */
  public getLifetimeMetricsManager(): LifetimeMetricsManager {
    return this.lifetimeMetricsManager;
  }
  
  /**
   * Force synchronization of metrics data with the server
   * @returns Whether synchronization was successful
   */
  public async synchronizeMetrics(): Promise<boolean> {
    return this.metricsStorageManager.synchronizeData();
  }
  
  /**
   * Get storage status
   * @returns Storage status
   */
  public async getStorageStatus(): Promise<{
    sessionCount: number;
    userCount: number;
    syncQueueLength: number;
    cacheSize: number;
    networkStatus: boolean;
  }> {
    return this.metricsStorageManager.getStorageStatus();
  }
}

/**
 * Example usage of the MetricsSystem
 */
async function metricsSystemExample() {
  console.log('Starting MetricsSystem integration example...');
  
  // Create metrics system
  const metricsSystem = new MetricsSystem();
  
  // Get managers
  const sessionManager = metricsSystem.getSessionMetricsManager();
  const lifetimeManager = metricsSystem.getLifetimeMetricsManager();
  
  try {
    // Start a session
    console.log('Starting a learning session...');
    const userId = 'user456';
    const sessionId = sessionManager.startSession(userId);
    console.log(`Session started: ${sessionId}`);
    
    // Simulate some question answers
    console.log('Recording question answers...');
    sessionManager.recordAnswer('q1', true, true, 5000); // FTC
    sessionManager.recordAnswer('q2', true, true, 8000); // FTC
    sessionManager.recordAnswer('q3', true, false, 12000); // EC
    sessionManager.recordAnswer('q4', false, false, 15000); // Incorrect
    sessionManager.recordAnswer('q5', true, true, 4000); // FTC
    
    // End the session
    console.log('Ending the session...');
    const sessionMetrics = await sessionManager.endSession();
    console.log('Session metrics:');
    console.log(`  Total points: ${sessionMetrics.totalPoints.toFixed(2)}`);
    console.log(`  FTC count: ${sessionMetrics.ftcCount}`);
    console.log(`  EC count: ${sessionMetrics.ecCount}`);
    console.log(`  Accuracy: ${(sessionMetrics.accuracy * 100).toFixed(2)}%`);
    console.log(`  Consistency: ${(sessionMetrics.consistency * 100).toFixed(2)}%`);
    console.log(`  Speed: ${(sessionMetrics.speed * 100).toFixed(2)}%`);
    console.log(`  Bonus multiplier: ${sessionMetrics.bonusMultiplier.toFixed(2)}`);
    
    // Get lifetime metrics
    console.log('Getting lifetime metrics...');
    const lifetimeMetrics = await lifetimeManager.getLifetimeMetrics(userId);
    if (lifetimeMetrics) {
      console.log('Lifetime metrics:');
      console.log(`  Total sessions: ${lifetimeMetrics.totalSessions}`);
      console.log(`  Total points: ${lifetimeMetrics.totalPoints.toFixed(2)}`);
      console.log(`  Evolution: ${lifetimeMetrics.evolution.toFixed(4)}`);
    }
    
    // Get streak information
    console.log('Getting streak information...');
    const streakInfo = await lifetimeManager.getUserStreak(userId);
    console.log(`  Current streak: ${streakInfo.currentStreak} days`);
    console.log(`  Longest streak: ${streakInfo.longestStreak} days`);
    
    // Get performance trends
    console.log('Getting performance trends...');
    const trends = await lifetimeManager.getPerformanceTrends(userId);
    console.log(`  Points trend: ${(trends.pointsTrend * 100).toFixed(2)}%`);
    
    // Synchronize metrics
    console.log('Synchronizing metrics...');
    const syncResult = await metricsSystem.synchronizeMetrics();
    console.log(`Synchronization result: ${syncResult}`);
    
    // Get storage status
    console.log('Getting storage status...');
    const storageStatus = await metricsSystem.getStorageStatus();
    console.log('Storage status:');
    console.log(`  Session count: ${storageStatus.sessionCount}`);
    console.log(`  User count: ${storageStatus.userCount}`);
    console.log(`  Sync queue length: ${storageStatus.syncQueueLength}`);
    
  } catch (error) {
    console.error('Error in MetricsSystem example:', error);
  }
  
  console.log('MetricsSystem integration example completed');
}

// Run the example
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', metricsSystemExample);
} else {
  metricsSystemExample();
}