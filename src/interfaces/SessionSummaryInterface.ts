/**
 * SessionSummaryInterface.ts
 * Generated from APML Interface Definition
 * Module: undefined
 */

/**
 * 
    Provide a comprehensive summary of the user's learning session, displaying metrics, achievements, and progress in an engaging and motivational format.
  
 */
/**
 * SessionData
 */
export interface SessionData {
  sessionId: string; // Unique identifier for the session
  startTime: Date; // When the session started
  endTime: Date; // When the session ended
  duration: number; // Session duration in seconds
  questionsAnswered: number; // Total number of questions answered
  correctAnswers: number; // Number of correct answers
  incorrectAnswers: number; // Number of incorrect answers
  timeouts: number; // Number of questions that timed out
  averageResponseTime: number; // Average time to answer in milliseconds
  boundaryLevels: Record<string, any>; // Performance at each boundary level
}

/**
 * MetricsData
 */
export interface MetricsData {
  ftcPoints: number; // First Time Correct points earned
  ecPoints: number; // Every Correct points earned
  basePoints: number; // Base points earned
  bonusMultiplier: number; // Bonus multiplier achieved
  blinkSpeed: number; // Blink speed metric (milliseconds)
  totalPoints: number; // Total points earned in session
  evolution: number; // Evolution progress (percentage)
}

/**
 * AchievementData
 */
export interface AchievementData {
  newAchievements: Array<Achievement>; // Achievements unlocked in this session
  progressAchievements: Array<AchievementProgress>; // Progress made toward achievements
}

/**
 * Achievement
 */
export interface Achievement {
  id: string; // Unique identifier for the achievement
  name: string; // Display name of the achievement
  description: string; // Description of the achievement
  icon: string; // Icon URL for the achievement
  pointsAwarded: number; // Points awarded for this achievement
}

/**
 * AchievementProgress
 */
export interface AchievementProgress {
  id: string; // Unique identifier for the achievement
  name: string; // Display name of the achievement
  description: string; // Description of the achievement
  icon: string; // Icon URL for the achievement
  progress: number; // Current progress (percentage)
  target: number; // Target value to achieve
}

/**
 * ProgressData
 */
export interface ProgressData {
  learningPaths: Record<string, any>; // Progress in each learning path
  overallProgress: number; // Overall curriculum progress (percentage)
  nextSessionFocus: Array<string>; // Suggested focus areas for next session
}

/**
 * PathProgress
 */
export interface PathProgress {
  name: string; // Name of the learning path
  progress: number; // Progress percentage in this path
  unitsCompleted: number; // Number of units completed
  totalUnits: number; // Total number of units in path
  currentUnit: string; // Name of current unit
}

/**
 * SummaryOptions
 */
export interface SummaryOptions {
  showMetrics?: boolean; // Whether to show metrics section
  showAchievements?: boolean; // Whether to show achievements section
  showProgress?: boolean; // Whether to show progress section
  showNextSteps?: boolean; // Whether to show next steps section
  animateEntrance?: boolean; // Whether to animate the entrance of the summary
  celebrateAchievements?: boolean; // Whether to show celebration animations for achievements
}

/**
 * Error codes for SessionSummaryInterface
 */
export enum SessionSummaryErrorCode {
  SS_001 = 'SS-001',
  SS_002 = 'SS-002',
  SS_003 = 'SS-003',
  SS_004 = 'SS-004',
  SS_005 = 'SS-005',
  SS_101 = 'SS-101',
  SS_102 = 'SS-102',
  SS_201 = 'SS-201',
  SS_202 = 'SS-202',
  SS_203 = 'SS-203',
  SS_301 = 'SS-301',
  SS_302 = 'SS-302',
  SS_303 = 'SS-303',
  SS_401 = 'SS-401',
  SS_402 = 'SS-402'
}

/**
 * SessionSummaryInterface
 */
export interface SessionSummaryInterface {
  /**
   * 
        Display a comprehensive summary of the completed learning session with metrics, achievements, and progress.
      
   * @param undefined - undefined
   * @returns Result of the operation
   * @throws SS-001 if Invalid session data provided
   * @throws SS-002 if Invalid metrics data provided
   * @throws SS-003 if Invalid achievement data provided
   * @throws SS-004 if Invalid progress data provided
   * @throws SS-005 if Summary already displayed
   */
  showSessionSummary(undefined?: undefined): undefined;

  /**
   * 
        Hide the currently displayed session summary.
      
   * @param undefined - undefined
   * @returns Result of the operation
   * @throws SS-101 if Summary not found
   * @throws SS-102 if Summary already hidden
   */
  hideSessionSummary(undefined?: undefined): undefined;

  /**
   * 
        Generate a shareable image of the session summary.
      
   * @param undefined - undefined
   * @returns Result of the operation
   * @throws SS-201 if Summary not found
   * @throws SS-202 if Invalid format specified
   * @throws SS-203 if Image generation failed
   */
  getSummarySnapshot(undefined?: undefined): undefined;

  /**
   * 
        Trigger a celebration animation for a specific achievement.
      
   * @param undefined - undefined
   * @returns Result of the operation
   * @throws SS-301 if Summary not found
   * @throws SS-302 if Achievement not found
   * @throws SS-303 if Invalid animation type
   */
  celebrateAchievement(undefined?: undefined): undefined;

  /**
   * 
        Highlight a specific area of progress in the summary.
      
   * @param undefined - undefined
   * @returns Result of the operation
   * @throws SS-401 if Summary not found
   * @throws SS-402 if Invalid progress type
   */
  highlightProgress(undefined?: undefined): undefined;

}

// Export default interface
export default SessionSummaryInterface;
