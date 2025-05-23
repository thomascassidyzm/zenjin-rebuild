// SessionSummary/index.ts
// Export SessionSummary component and related types

import SessionSummary, {
  SessionSummaryProps,
  SessionSummaryImpl,
  SESSION_SUMMARY_ERRORS
} from './SessionSummary';

// Import interfaces from generated interfaces
import { SessionSummaryInterface } from '../../interfaces/SessionSummaryInterface';

export default SessionSummary;

// Export implementation-specific types
export type {
  SessionSummaryProps,
  SessionSummaryImpl
};

// Export error codes
export { SESSION_SUMMARY_ERRORS };

// Re-export the interface
export type { SessionSummaryInterface };

// Re-export types from the generated interface
export type {
  SessionData,
  MetricsData,
  Achievement,
  AchievementProgress,
  AchievementData,
  PathProgress,
  ProgressData,
  SummaryOptions,
  SessionSummaryErrorCode
} from '../../interfaces/SessionSummaryInterface';
