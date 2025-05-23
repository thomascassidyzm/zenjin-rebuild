// SessionSummary/index.ts
// Export SessionSummary component and related types

import SessionSummary, {
  SessionData,
  MetricsData,
  Achievement,
  AchievementProgress,
  AchievementData,
  PathProgress,
  ProgressData,
  SummaryOptions,
  SessionSummaryProps,
  SessionSummaryImpl
} from './SessionSummary';

export default SessionSummary;

// Use export type for TypeScript interfaces when isolatedModules is enabled
export type {
  SessionData,
  MetricsData,
  Achievement,
  AchievementProgress,
  AchievementData,
  PathProgress,
  ProgressData,
  SummaryOptions,
  SessionSummaryProps,
  SessionSummaryImpl
};
