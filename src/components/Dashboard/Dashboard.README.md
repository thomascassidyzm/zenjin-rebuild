# Dashboard Component

## Overview

The Dashboard component displays lifetime metrics and user progress information in a visually appealing and child-friendly manner. It provides a comprehensive view of the user's performance, learning path progress, and achievements.

## Features

- Display of lifetime metrics (Total Points, Blink Speed, Evolution, etc.)
- Learning path progress visualization (Triple Helix model)
- Recent achievements display
- Animated metrics updates
- Responsive design for both desktop and mobile

## Technical Implementation

- Next.js with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations

## Files

- **Dashboard.tsx**: Main component implementation
- **DashboardTypes.tsx**: TypeScript type definitions for the Dashboard component
- **DashboardExample.tsx**: Example usage of the Dashboard component
- **DashboardUsage.tsx**: Utility functions and usage examples

## Usage

```jsx
import Dashboard from './Dashboard';
import { DashboardData } from './DashboardTypes';

// Sample dashboard data
const dashboardData: DashboardData = {
  lifetimeMetrics: {
    totalPoints: 15750,
    totalSessions: 42,
    averageBlinkSpeed: 2345,
    evolution: 6.71,
    globalRanking: 1253,
    progressPercentage: 37,
    ftcPoints: 12500,
    ecPoints: 3250,
    basePoints: 10500,
    averageBonusMultiplier: 1.5
  },
  learningPaths: [
    // Learning path data
  ],
  recentAchievements: [
    // Achievement data
  ],
  subscriptionType: "Premium",
  username: "MathWhiz123",
  // Other properties
};

function App() {
  const handlePathSelected = (pathId) => {
    console.log(`Path selected: ${pathId}`);
  };

  return (
    <Dashboard
      initialData={dashboardData}
      onPathSelected={handlePathSelected}
    />
  );
}
```

## Interface Methods

The Dashboard component implements the following interface methods:

- `showDashboard`: Displays the dashboard with user's lifetime metrics and progress
- `updateMetric`: Updates a specific metric on the dashboard
- `showAchievementNotification`: Displays a notification for a newly earned achievement
- `refreshDashboard`: Refreshes the dashboard data
- Event handlers: `onPathSelected`, `onAchievementSelected`, `onStartSessionClicked`

## Integration with Zenjin Maths App

The Dashboard is a core component of the UserInterface module and interacts with:

- MetricsSystem: To display lifetime metrics and session performance
- ProgressionSystem: To visualize learning path progress (Triple Helix model)
- SubscriptionSystem: To display subscription status

## Implementation Date

2025-05-21

## LLM

Claude 3.7 Sonnet