// Dashboard/index.ts
// Export Dashboard component and related functionality

import Dashboard, { createDashboard } from './Dashboard';

export default Dashboard;
export { createDashboard };

// Export types from Dashboard component
export type {
  LifetimeMetrics,
  LearningPathProgress,
  Achievement,
  DashboardData,
  DashboardOptions,
  UpdateMetricOptions,
  NotificationOptions,
  DashboardProps
} from './DashboardTypes';
