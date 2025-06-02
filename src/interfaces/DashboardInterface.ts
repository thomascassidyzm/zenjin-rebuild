/**
 * DashboardInterface.ts
 * Generated from APML Interface Definition
 * Module: UserInterface
 */


/**
 * Defines the contract for the Dashboard component that displays lifetime metrics and user progress information.
 */
/**
 * LifetimeMetrics
 */
export interface LifetimeMetrics {
  /** Total accumulated points across all sessions */
  totalPoints: number;
  /** Total number of completed sessions */
  totalSessions: number;
  /** Average blink speed across all sessions (ms) */
  averageBlinkSpeed: number;
  /** Evolution metric (Total Points / Average Blink Speed) */
  evolution: number;
  /** User's global ranking position */
  globalRanking: number;
  /** Overall progress percentage (0-100) */
  progressPercentage: number;
  /** First time correct points accumulated */
  ftcPoints: number;
  /** Eventually correct points accumulated */
  ecPoints: number;
  /** Base points without multipliers */
  basePoints: number;
  /** Average bonus multiplier across sessions */
  averageBonusMultiplier: number;
}

/**
 * LearningPathProgress
 */
export interface LearningPathProgress {
  /** Identifier for the learning path */
  pathId: string;
  /** Display name for the learning path */
  pathName: string;
  /** Current level within the path */
  currentLevel: number;
  /** Maximum level available in the path */
  maxLevel: number;
  /** Number of completed stitches in this path */
  completedStitches: number;
  /** Total number of stitches in this path */
  totalStitches: number;
  /** Progress percentage for this path (0-100) */
  progressPercentage: number;
  /** Whether this path is currently active in the rotation */
  active: boolean;
}

/**
 * Achievement
 */
export interface Achievement {
  /** Unique identifier for the achievement */
  id: string;
  /** Display name for the achievement */
  name: string;
  /** Description of how the achievement was earned */
  description: string;
  /** ISO date string when the achievement was earned */
  dateEarned: string;
  /** URL to the achievement icon */
  iconUrl: string;
  /** Achievement level (for multi-level achievements) */
  level?: number;
  /** Points awarded for this achievement */
  pointsAwarded?: number;
}

/**
 * DashboardData
 */
export interface DashboardData {
  /** User's lifetime metrics */
  lifetimeMetrics: LifetimeMetrics;
  /** Array of LearningPathProgress objects */
  learningPaths: any[];
  /** Array of recent Achievement objects */
  recentAchievements: any[];
  /** User's subscription type (Anonymous, Free, Premium) */
  subscriptionType: string;
  /** User's display name */
  username: string;
  /** URL to user's avatar image */
  avatarUrl?: string;
  /** ISO date string of the last completed session */
  lastSessionDate?: string;
  /** Current streak of consecutive days with sessions */
  streakDays?: number;
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
  showDashboard(dashboardData: DashboardData, options?: Record<string, any>): boolean;

  /**
   * Updates a specific metric on the dashboard
   * @param metricName - Name of the metric to update
   * @param metricValue - New value for the metric
   * @param options - Update options
   * @returns Whether the metric was successfully updated
   * @throws INVALID_METRIC if The specified metric does not exist
   * @throws UPDATE_FAILED if Failed to update the metric
   */
  updateMetric(metricName: string, metricValue: any, options?: Record<string, any>): boolean;

  /**
   * Displays a notification for a newly earned achievement
   * @param achievement - Achievement data
   * @param options - Notification options
   * @returns Whether the notification was successfully displayed
   * @throws INVALID_ACHIEVEMENT if The achievement data is invalid
   * @throws NOTIFICATION_FAILED if Failed to display the notification
   */
  showAchievementNotification(achievement: Achievement, options?: Record<string, any>): boolean;

  /**
   * Refreshes the dashboard data
   * @returns Whether the dashboard was successfully refreshed
   * @throws REFRESH_FAILED if Failed to refresh the dashboard
   */
  refreshDashboard(): Promise<boolean>;

}

// Export default interface
export default DashboardInterface;
