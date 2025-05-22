// DashboardTypes.ts
// Type definitions for the Dashboard component

// Type for lifetime metrics data
export type LifetimeMetrics = {
  totalPoints: number;
  totalSessions: number;
  averageBlinkSpeed: number;
  evolution: number;
  globalRanking: number;
  progressPercentage: number;
  ftcPoints: number;
  ecPoints: number;
  basePoints: number;
  averageBonusMultiplier: number;
};

// Type for learning path progress data
export type LearningPathProgress = {
  pathId: string;
  pathName: string;
  currentLevel: number;
  maxLevel: number;
  completedStitches: number;
  totalStitches: number;
  progressPercentage: number;
  active: boolean;
};

// Type for achievement data
export type Achievement = {
  id: string;
  name: string;
  description: string;
  dateEarned: string;
  iconUrl: string;
  level?: number;
  pointsAwarded?: number;
};

// Type for the main dashboard data
export type DashboardData = {
  lifetimeMetrics: LifetimeMetrics;
  learningPaths: LearningPathProgress[];
  recentAchievements: Achievement[];
  subscriptionType: string;
  username: string;
  avatarUrl?: string;
  lastSessionDate?: string;
  streakDays?: number;
};

// Type for dashboard options
export type DashboardOptions = {
  animation?: string;
  highlightMetric?: string;
};

// Type for update metric options
export type UpdateMetricOptions = {
  animate?: boolean;
  highlight?: boolean;
};

// Type for notification options
export type NotificationOptions = {
  duration?: number;
  sound?: boolean;
};

// Type for dashboard props
export interface DashboardProps {
  initialData: DashboardData;
  onPathSelected?: (pathId: string) => void;
  onAchievementSelected?: (achievementId: string) => void;
  onStartSessionClicked?: (pathId: string) => void;
}
