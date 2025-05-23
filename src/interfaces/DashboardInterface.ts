/**
 * DashboardInterface.ts
 * Generated from APML Interface Definition
 * Module: UserInterface
 */

/**
 * 
    Defines the contract for the Dashboard component that displays lifetime metrics and user progress information.
  
 */
/**
 * LifetimeMetrics
 */
export interface LifetimeMetrics {
  totalPoints: number; // Total accumulated points across all sessions
  totalSessions: number; // Total number of completed sessions
  averageBlinkSpeed: number; // Average blink speed across all sessions (ms)
  evolution: number; // Evolution metric (Total Points / Average Blink Speed)
  globalRanking: number; // User's global ranking position
  progressPercentage: number; // Overall progress percentage (0-100)
  ftcPoints: number; // First time correct points accumulated
  ecPoints: number; // Eventually correct points accumulated
  basePoints: number; // Base points without multipliers
  averageBonusMultiplier: number; // Average bonus multiplier across sessions
}

/**
 * LearningPathProgress
 */
export interface LearningPathProgress {
  pathId: string; // Identifier for the learning path
  pathName: string; // Display name for the learning path
  currentLevel: number; // Current level within the path
  maxLevel: number; // Maximum level available in the path
  completedStitches: number; // Number of completed stitches in this path
  totalStitches: number; // Total number of stitches in this path
  progressPercentage: number; // Progress percentage for this path (0-100)
  active: boolean; // Whether this path is currently active in the rotation
}

/**
 * Achievement
 */
export interface Achievement {
  id: string; // Unique identifier for the achievement
  name: string; // Display name for the achievement
  description: string; // Description of how the achievement was earned
  dateEarned: string; // ISO date string when the achievement was earned
  iconUrl: string; // URL to the achievement icon
  level?: number; // Achievement level (for multi-level achievements)
  pointsAwarded?: number; // Points awarded for this achievement
}

/**
 * DashboardData
 */
export interface DashboardData {
  lifetimeMetrics: LifetimeMetrics; // User's lifetime metrics
  learningPaths: any[]; // Array of LearningPathProgress objects
  recentAchievements: any[]; // Array of recent Achievement objects
  subscriptionType: string; // User's subscription type (Anonymous, Free, Premium)
  username: string; // User's display name
  avatarUrl?: string; // URL to user's avatar image
  lastSessionDate?: string; // ISO date string of the last completed session
  streakDays?: number; // Current streak of consecutive days with sessions
}

/**
 * Error codes for DashboardInterface
 */
export enum DashboardErrorCode {
  INVALID_DATA = 'INVALID_DATA',
  DISPLAY_FAILED = 'DISPLAY_FAILED',
  INVALID_METRIC = 'INVALID_METRIC',
  UPDATE_FAILED = 'UPDATE_FAILED',
  INVALID_ACHIEVEMENT = 'INVALID_ACHIEVEMENT',
  NOTIFICATION_FAILED = 'NOTIFICATION_FAILED',
  REFRESH_FAILED = 'REFRESH_FAILED',
}

/**
 * DashboardInterface
 */
export interface DashboardInterface {
  /**
   * Displays the dashboard with user's lifetime metrics and progress
   * @param dashboardData - Combined dashboard data
   * @param options - Display options
   * @returns Whether the dashboard was successfully displayed
   * @throws INVALID_DATA if The dashboard data is invalid or incomplete
   * @throws DISPLAY_FAILED if Failed to display the dashboard due to rendering issues
   */
  showDashboard(dashboardData: DashboardData, options?: { animation?: string; highlightMetric?: string }): boolean;

  /**
   * Updates a specific metric on the dashboard
   * @param metricName - Name of the metric to update
   * @param metricValue - New value for the metric
   * @param options - Update options
   * @returns Whether the metric was successfully updated
   * @throws INVALID_METRIC if The specified metric does not exist
   * @throws UPDATE_FAILED if Failed to update the metric
   */
  updateMetric(metricName: string, metricValue: any, options?: { animate?: boolean; highlight?: boolean }): boolean;

  /**
   * Displays a notification for a newly earned achievement
   * @param achievement - Achievement data
   * @param options - Notification options
   * @returns Whether the notification was successfully displayed
   * @throws INVALID_ACHIEVEMENT if The achievement data is invalid
   * @throws NOTIFICATION_FAILED if Failed to display the notification
   */
  showAchievementNotification(achievement: Achievement, options?: { duration?: number; sound?: boolean }): boolean;

  /**
   * Refreshes the dashboard data
   * @returns Whether the dashboard was successfully refreshed
   * @throws REFRESH_FAILED if Failed to refresh the dashboard
   */
  refreshDashboard(): Promise<boolean>;

}

// Export default interface
export default DashboardInterface;
