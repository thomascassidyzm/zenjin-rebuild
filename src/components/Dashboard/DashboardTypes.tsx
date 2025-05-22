/**
 * Type definitions for Dashboard Component
 * Based on the Zenjin Maths App's Interface Definition
 */

/**
 * Lifetime metrics for a user
 */
export type LifetimeMetrics = {
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
};

/**
 * Progress data for a learning path
 */
export type LearningPathProgress = {
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
};

/**
 * User achievement data
 */
export type Achievement = {
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
};

/**
 * Complete dashboard data structure
 */
export type DashboardData = {
  /** User's lifetime metrics */
  lifetimeMetrics: LifetimeMetrics;
  
  /** Array of learning path progress objects */
  learningPaths: LearningPathProgress[];
  
  /** Array of recent achievement objects */
  recentAchievements: Achievement[];
  
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
};

/**
 * Options for displaying the dashboard
 */
export type DashboardOptions = {
  /** Entry animation style */
  animation?: string;
  
  /** Metric to highlight */
  highlightMetric?: string;
};

/**
 * Options for updating a metric
 */
export type UpdateMetricOptions = {
  /** Whether to animate the update */
  animate?: boolean;
  
  /** Whether to highlight the updated metric */
  highlight?: boolean;
};

/**
 * Options for achievement notifications
 */
export type NotificationOptions = {
  /** Duration to show notification (ms) */
  duration?: number;
  
  /** Whether to play sound */
  sound?: boolean;
};

/**
 * Dashboard Interface Methods
 */
export interface DashboardInterface {
  /**
   * Displays the dashboard with user's lifetime metrics and progress
   * @param dashboardData Combined dashboard data
   * @param options Display options
   * @returns Whether the dashboard was successfully displayed
   */
  showDashboard: (dashboardData: DashboardData, options?: DashboardOptions) => boolean;
  
  /**
   * Updates a specific metric on the dashboard
   * @param metricName Name of the metric to update
   * @param metricValue New value for the metric
   * @param options Update options
   * @returns Whether the metric was successfully updated
   */
  updateMetric: (metricName: string, metricValue: any, options?: UpdateMetricOptions) => boolean;
  
  /**
   * Displays a notification for a newly earned achievement
   * @param achievement Achievement data
   * @param options Notification options
   * @returns Whether the notification was successfully displayed
   */
  showAchievementNotification: (achievement: Achievement, options?: NotificationOptions) => boolean;
  
  /**
   * Refreshes the dashboard data
   * @returns Whether the dashboard was successfully refreshed
   */
  refreshDashboard: () => Promise<boolean>;
  
  /**
   * Registers an event listener for path selection
   * @param callback Function to call when a path is selected
   * @returns Function to remove the event listener
   */
  onPathSelected: (callback: (pathId: string) => void) => () => void;
  
  /**
   * Registers an event listener for achievement selection
   * @param callback Function to call when an achievement is selected
   * @returns Function to remove the event listener
   */
  onAchievementSelected: (callback: (achievementId: string) => void) => () => void;
  
  /**
   * Registers an event listener for start session clicks
   * @param callback Function to call when a new session is started
   * @returns Function to remove the event listener
   */
  onStartSessionClicked: (callback: (pathId: string) => void) => () => void;
}

/**
 * Dashboard component props
 */
export interface DashboardProps {
  /** Initial dashboard data */
  initialData: DashboardData;
  
  /** Callback for when a path is selected */
  onPathSelected?: (pathId: string) => void;
  
  /** Callback for when an achievement is selected */
  onAchievementSelected?: (achievementId: string) => void;
  
  /** Callback for when a new session is started */
  onStartSessionClicked?: (pathId: string) => void;
}