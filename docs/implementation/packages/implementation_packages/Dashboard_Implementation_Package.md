# Dashboard Implementation Package for Claude 3.7 Sonnet

This package contains all necessary information for implementing the Dashboard component for the Zenjin Maths App rebuild project using the Fractal AI-Assisted Development Framework.

## Implementation Goal

Implement the Dashboard component that displays lifetime metrics and user progress information in a visually appealing and child-friendly manner consistent with the overall app design.

## Component Context

The Dashboard is a key user interface component that provides users with an overview of their learning progress and lifetime metrics. It shows achievement data, learning path progress, and global ranking information to motivate continued engagement. This component helps users visualize their progress over time and understand their current status within the Zenjin Maths learning system.

## Technical Requirements

- Use Next.js with TypeScript and Tailwind CSS
- Ensure the component is responsive and works well on mobile devices
- Implement smooth animations for metrics visualization
- Ensure accessibility for school-aged children (6+ years old)
- Use dark theme with rich colors and gradients to maintain visual consistency
- Optimize for performance on mobile devices

## Interface Definition

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Interface name="DashboardInterface" version="1.1.0" module="UserInterface">
  <Purpose>
    Defines the contract for the Dashboard component that displays lifetime metrics and user progress information.
  </Purpose>
  
  <DataStructures>
    <Structure name="LifetimeMetrics">
      <Field name="totalPoints" type="number" required="true" description="Total accumulated points across all sessions" />
      <Field name="totalSessions" type="number" required="true" description="Total number of completed sessions" />
      <Field name="averageBlinkSpeed" type="number" required="true" description="Average blink speed across all sessions (ms)" />
      <Field name="evolution" type="number" required="true" description="Evolution metric (Total Points / Average Blink Speed)" />
      <Field name="globalRanking" type="number" required="true" description="User's global ranking position" />
      <Field name="progressPercentage" type="number" required="true" description="Overall progress percentage (0-100)" />
      <Field name="ftcPoints" type="number" required="true" description="First time correct points accumulated" />
      <Field name="ecPoints" type="number" required="true" description="Eventually correct points accumulated" />
      <Field name="basePoints" type="number" required="true" description="Base points without multipliers" />
      <Field name="averageBonusMultiplier" type="number" required="true" description="Average bonus multiplier across sessions" />
    </Structure>
    
    <Structure name="LearningPathProgress">
      <Field name="pathId" type="string" required="true" description="Identifier for the learning path" />
      <Field name="pathName" type="string" required="true" description="Display name for the learning path" />
      <Field name="currentLevel" type="number" required="true" description="Current level within the path" />
      <Field name="maxLevel" type="number" required="true" description="Maximum level available in the path" />
      <Field name="completedStitches" type="number" required="true" description="Number of completed stitches in this path" />
      <Field name="totalStitches" type="number" required="true" description="Total number of stitches in this path" />
      <Field name="progressPercentage" type="number" required="true" description="Progress percentage for this path (0-100)" />
      <Field name="active" type="boolean" required="true" description="Whether this path is currently active in the rotation" />
    </Structure>
    
    <Structure name="Achievement">
      <Field name="id" type="string" required="true" description="Unique identifier for the achievement" />
      <Field name="name" type="string" required="true" description="Display name for the achievement" />
      <Field name="description" type="string" required="true" description="Description of how the achievement was earned" />
      <Field name="dateEarned" type="string" required="true" description="ISO date string when the achievement was earned" />
      <Field name="iconUrl" type="string" required="true" description="URL to the achievement icon" />
      <Field name="level" type="number" required="false" description="Achievement level (for multi-level achievements)" />
      <Field name="pointsAwarded" type="number" required="false" description="Points awarded for this achievement" />
    </Structure>
    
    <Structure name="DashboardData">
      <Field name="lifetimeMetrics" type="LifetimeMetrics" required="true" description="User's lifetime metrics" />
      <Field name="learningPaths" type="array" required="true" description="Array of LearningPathProgress objects" />
      <Field name="recentAchievements" type="array" required="true" description="Array of recent Achievement objects" />
      <Field name="subscriptionType" type="string" required="true" description="User's subscription type (Anonymous, Free, Premium)" />
      <Field name="username" type="string" required="true" description="User's display name" />
      <Field name="avatarUrl" type="string" required="false" description="URL to user's avatar image" />
      <Field name="lastSessionDate" type="string" required="false" description="ISO date string of the last completed session" />
      <Field name="streakDays" type="number" required="false" description="Current streak of consecutive days with sessions" />
    </Structure>
  </DataStructures>
  
  <Methods>
    <Method name="showDashboard">
      <Description>Displays the dashboard with user's lifetime metrics and progress</Description>
      <Input name="dashboardData" type="DashboardData" required="true" description="Combined dashboard data" />
      <Input name="options" type="object" required="false" description="Display options">
        <Field name="animation" type="string" required="false" description="Entry animation style" defaultValue="fade" />
        <Field name="highlightMetric" type="string" required="false" description="Metric to highlight" />
      </Input>
      <Output name="displayed" type="boolean" description="Whether the dashboard was successfully displayed" />
      <Errors>
        <Error code="INVALID_DATA" description="The dashboard data is invalid or incomplete" />
        <Error code="DISPLAY_FAILED" description="Failed to display the dashboard due to rendering issues" />
      </Errors>
      <Async>false</Async>
    </Method>
    
    <Method name="updateMetric">
      <Description>Updates a specific metric on the dashboard</Description>
      <Input name="metricName" type="string" required="true" description="Name of the metric to update" />
      <Input name="metricValue" type="any" required="true" description="New value for the metric" />
      <Input name="options" type="object" required="false" description="Update options">
        <Field name="animate" type="boolean" required="false" description="Whether to animate the update" defaultValue="true" />
        <Field name="highlight" type="boolean" required="false" description="Whether to highlight the updated metric" defaultValue="false" />
      </Input>
      <Output name="success" type="boolean" description="Whether the metric was successfully updated" />
      <Errors>
        <Error code="INVALID_METRIC" description="The specified metric does not exist" />
        <Error code="UPDATE_FAILED" description="Failed to update the metric" />
      </Errors>
      <Async>false</Async>
    </Method>
    
    <Method name="showAchievementNotification">
      <Description>Displays a notification for a newly earned achievement</Description>
      <Input name="achievement" type="Achievement" required="true" description="Achievement data" />
      <Input name="options" type="object" required="false" description="Notification options">
        <Field name="duration" type="number" required="false" description="Duration to show notification (ms)" defaultValue="5000" />
        <Field name="sound" type="boolean" required="false" description="Whether to play sound" defaultValue="true" />
      </Input>
      <Output name="displayed" type="boolean" description="Whether the notification was successfully displayed" />
      <Errors>
        <Error code="INVALID_ACHIEVEMENT" description="The achievement data is invalid" />
        <Error code="NOTIFICATION_FAILED" description="Failed to display the notification" />
      </Errors>
      <Async>false</Async>
    </Method>
    
    <Method name="refreshDashboard">
      <Description>Refreshes the dashboard data</Description>
      <Output name="success" type="boolean" description="Whether the dashboard was successfully refreshed" />
      <Errors>
        <Error code="REFRESH_FAILED" description="Failed to refresh the dashboard" />
      </Errors>
      <Async>true</Async>
    </Method>
  </Methods>
  
  <Events>
    <Event name="onPathSelected">
      <Parameter name="pathId" type="string" description="ID of the selected learning path" />
    </Event>
    <Event name="onAchievementSelected">
      <Parameter name="achievementId" type="string" description="ID of the selected achievement" />
    </Event>
    <Event name="onStartSessionClicked">
      <Parameter name="pathId" type="string" description="ID of the selected path for the new session" />
    </Event>
  </Events>
  
  <Dependencies>
    <Dependency interface="ThemeManagerInterface" module="UserInterface" />
    <Dependency interface="LifetimeMetricsInterface" module="MetricsSystem" />
    <Dependency interface="ProgressTrackingInterface" module="ProgressionSystem" />
  </Dependencies>
  
  <UsageExample>
```typescript
// Example usage of DashboardInterface
import { Dashboard } from './components/Dashboard';

// Sample dashboard data
const dashboardData = {
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
    {
      pathId: "addition",
      pathName: "Addition",
      currentLevel: 5,
      maxLevel: 10,
      completedStitches: 25,
      totalStitches: 50,
      progressPercentage: 50,
      active: true
    },
    {
      pathId: "multiplication",
      pathName: "Multiplication",
      currentLevel: 3,
      maxLevel: 10,
      completedStitches: 15,
      totalStitches: 50,
      progressPercentage: 30,
      active: false
    },
    {
      pathId: "division",
      pathName: "Division",
      currentLevel: 2,
      maxLevel: 10,
      completedStitches: 10,
      totalStitches: 50,
      progressPercentage: 20,
      active: false
    }
  ],
  recentAchievements: [
    {
      id: "first-perfect",
      name: "Perfect Session",
      description: "Complete a session with 100% first-time correct answers",
      dateEarned: "2025-05-18T14:32:00Z",
      iconUrl: "/icons/perfect-session.svg",
      pointsAwarded: 500
    },
    {
      id: "streak-7",
      name: "Weekly Wizard",
      description: "Complete sessions on 7 consecutive days",
      dateEarned: "2025-05-15T09:15:00Z",
      iconUrl: "/icons/weekly-wizard.svg",
      pointsAwarded: 700
    }
  ],
  subscriptionType: "Premium",
  username: "MathWhiz123",
  avatarUrl: "/avatars/mathwhiz.png",
  lastSessionDate: "2025-05-19T16:45:00Z",
  streakDays: 12
};

// Display the dashboard
const dashboard = new Dashboard();
dashboard.showDashboard(dashboardData);

// Listen for events
dashboard.onPathSelected((pathId) => {
  console.log(`User selected path: ${pathId}`);
});

dashboard.onStartSessionClicked((pathId) => {
  console.log(`Starting new session with path: ${pathId}`);
  // Start a new learning session
});

// Update a metric when it changes
dashboard.updateMetric("totalPoints", 16250, { animate: true, highlight: true });

// Show achievement notification
const newAchievement = {
  id: "mastery-addition",
  name: "Addition Master",
  description: "Reach level 10 in the Addition path",
  dateEarned: "2025-05-20T10:30:00Z",
  iconUrl: "/icons/addition-master.svg",
  pointsAwarded: 1000
};
dashboard.showAchievementNotification(newAchievement);
```
  </UsageExample>
</Interface>
```

## Module Definition (Relevant Sections)

```xml
<Module name="UserInterface" version="1.1.0">
  <Purpose>
    Provide a calming, anxiety-free visual experience with appropriate feedback for user interactions, implementing the binary distinction presentation through the Player Card mechanism.
  </Purpose>
  
  <ContextBoundary size="medium" tokenEstimate="40000">
    <Description>
      This module encompasses all user-facing components, including the Player Card, feedback system, 
      visual theming, animations, and layout. It is responsible for presenting questions and collecting 
      user responses, but not for generating content or tracking progression.
    </Description>
  </ContextBoundary>
  
  <Interfaces>
    <Interface name="DashboardInterface">
      <Description>
        Displays lifetime metrics and user progress information.
      </Description>
      <Methods>
        <Method name="showDashboard">
          <Input name="lifetimeData" type="object" required="true" description="Lifetime metrics and progress data" />
        </Method>
        <Method name="updateMetric">
          <Input name="metricName" type="string" required="true" description="Name of the metric to update" />
          <Input name="metricValue" type="any" required="true" description="New value for the metric" />
        </Method>
      </Methods>
    </Interface>
  </Interfaces>
  
  <Components>
    <Component name="Dashboard">
      <Description>
        Displays lifetime metrics and user progress information.
      </Description>
      <Implements>DashboardInterface</Implements>
      <Dependencies>
        <Dependency interface="ThemeManagerInterface" />
      </Dependencies>
    </Component>
  </Components>
  
  <ValidationCriteria>
    <Criterion id="UI-005" test="tests/ui/dashboard_test.js">
      Dashboard must correctly display all lifetime metrics including Evolution and Global Ranking.
    </Criterion>
    <Criterion id="UI-003" test="tests/ui/theme_consistency_test.js">
      All UI components must consistently apply the theme with rich colors, gradients, and dark theme.
    </Criterion>
    <Criterion id="UI-006" test="tests/ui/accessibility_test.js">
      UI must be accessible for the target audience of school-aged children from age 6 and up.
    </Criterion>
  </ValidationCriteria>
  
  <SystemRequirements>
    <Requirement type="Performance" name="AnimationFrameRate">
      All animations must maintain 60fps on target devices.
    </Requirement>
    <Requirement type="Performance" name="InteractionLatency">
      UI must respond to user interactions within 50ms.
    </Requirement>
    <Requirement type="Usability" name="ChildFriendly">
      UI must be usable by children as young as 6 years old.
    </Requirement>
    <Requirement type="Accessibility" name="ColorContrast">
      All text must have sufficient contrast ratio for readability.
    </Requirement>
    <Requirement type="Compatibility" name="MobileOptimized">
      UI must be optimized for mobile devices with touch interactions.
    </Requirement>
  </SystemRequirements>
</Module>
```

## Implementation Prompt

You are implementing the Dashboard component for the Zenjin Maths App, which displays lifetime metrics and user progress information in a visually appealing and child-friendly manner.

The Dashboard must:
1. Display lifetime metrics including:
   - Total Points
   - Average Blink Speed
   - Evolution (Total Points / Average Blink Speed)
   - Global Ranking
   - Progress Percentage
   - FTC Points (First Time Correct)
   - EC Points (Eventually Correct)
   - Base Points
   - Average Bonus Multiplier
   - Total Sessions
2. Show learning path progress:
   - Three learning paths (Triple Helix model)
   - Current level for each path
   - Progress percentage for each path
   - Active path indicator
3. Display recent achievements
4. Provide a visually engaging experience with:
   - Animations for metrics
   - Rich colors and gradients
   - Dark theme for battery efficiency
   - Child-friendly visual design
5. Implement the DashboardInterface as defined in the UserInterface module
6. Support responsive design for both desktop and mobile devices

Technical requirements:
- Use Next.js with TypeScript and Tailwind CSS
- Ensure the component is responsive and works well on mobile devices
- Implement smooth animations for metrics visualization
- Ensure accessibility for school-aged children (6+ years old)
- Use dark theme with rich colors and gradients to maintain visual consistency
- Optimize for performance on mobile devices

Please implement the Dashboard component with all necessary TypeScript types, React hooks, and styling. Include comprehensive comments explaining the implementation details and how the component integrates with the rest of the application.

## Mock Inputs for Testing

```javascript
const mockDashboardData = {
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
    {
      pathId: "addition",
      pathName: "Addition",
      currentLevel: 5,
      maxLevel: 10,
      completedStitches: 25,
      totalStitches: 50,
      progressPercentage: 50,
      active: true
    },
    {
      pathId: "multiplication",
      pathName: "Multiplication",
      currentLevel: 3,
      maxLevel: 10,
      completedStitches: 15,
      totalStitches: 50,
      progressPercentage: 30,
      active: false
    },
    {
      pathId: "division",
      pathName: "Division",
      currentLevel: 2,
      maxLevel: 10,
      completedStitches: 10,
      totalStitches: 50,
      progressPercentage: 20,
      active: false
    }
  ],
  recentAchievements: [
    {
      id: "first-perfect",
      name: "Perfect Session",
      description: "Complete a session with 100% first-time correct answers",
      dateEarned: "2025-05-18T14:32:00Z",
      iconUrl: "/icons/perfect-session.svg",
      pointsAwarded: 500
    },
    {
      id: "streak-7",
      name: "Weekly Wizard",
      description: "Complete sessions on 7 consecutive days",
      dateEarned: "2025-05-15T09:15:00Z",
      iconUrl: "/icons/weekly-wizard.svg",
      pointsAwarded: 700
    }
  ],
  subscriptionType: "Premium",
  username: "MathWhiz123",
  avatarUrl: "/avatars/mathwhiz.png",
  lastSessionDate: "2025-05-19T16:45:00Z",
  streakDays: 12
};
```

## Expected Outputs

The Dashboard component should:
1. Render all metrics and progress information from the mock data
2. Provide a visually appealing interface with consistent theming
3. Include interactive elements for path selection and session start
4. Support updates to individual metrics with animations
5. Display achievement notifications when new achievements are earned

## Validation Criteria

1. Dashboard must correctly display all lifetime metrics including Evolution and Global Ranking (UI-005)
2. All UI components must consistently apply the theme with rich colors, gradients, and dark theme (UI-003)
3. UI must be accessible for the target audience of school-aged children from age 6 and up (UI-006)
4. All animations must maintain 60fps on target devices
5. UI must respond to user interactions within 50ms

## Triple Helix Model (Context)

The Dashboard visualizes the Triple Helix learning model, which consists of three parallel learning paths (or "tubes") that rotate to optimize cognitive resource usage. This model is based on the theory that learners benefit from working on multiple mathematical concepts simultaneously rather than mastering one concept completely before moving to the next.

The three paths in the Triple Helix model:
1. Addition Path: Focuses on addition facts and related concepts
2. Multiplication Path: Focuses on multiplication facts and related concepts
3. Division Path: Focuses on division facts and related concepts

Each path consists of "stitches" (learning units) that the learner progresses through. The active path rotates based on the Live Aid Stage Model, ensuring that the learner's cognitive resources are optimally engaged. The Dashboard should clearly indicate which path is currently active and show progress on all three paths.

## Metrics Explanation (Context)

The metrics displayed on the Dashboard have specific meanings in the Zenjin Maths learning system:

- **FTC Points (First Time Correct)**: Points earned when answering correctly on the first attempt
- **EC Points (Eventually Correct)**: Points earned when answering correctly after initial mistakes
- **Base Points**: The raw points earned without multipliers
- **Bonus Multiplier**: Additional points based on speed and consistency
- **Total Points**: Overall score (Base Points × Bonus Multiplier)
- **Blink Speed**: Average time to answer correctly on first attempt (measured in milliseconds)
- **Evolution**: A key metric calculated as Total Points / Blink Speed, representing the learner's overall progress
- **Global Ranking**: The learner's position relative to all other users

The Dashboard should provide clear, child-friendly visualizations of these metrics to help young learners understand their progress.