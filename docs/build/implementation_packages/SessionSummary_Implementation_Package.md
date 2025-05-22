# SessionSummary Implementation Package

## Implementation Goal

Create a comprehensive session summary component that displays metrics, achievements, and progress in an engaging and motivational format for the Zenjin Maths App.

## Component Context

The SessionSummary component is part of the UserInterface module and is responsible for displaying a comprehensive summary of the user's learning session after completion. It shows metrics, achievements, and progress in an engaging and motivational format suitable for school-aged children (6+ years old).

This component plays a crucial role in the distinction-based learning approach by:
1. Highlighting performance at different boundary levels
2. Providing positive reinforcement for achievements
3. Showing clear progress indicators for each learning path
4. Suggesting focus areas for the next session based on performance

## Interface Definition

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Interface name="SessionSummaryInterface" version="1.1.0">
  <Purpose>
    Provide a comprehensive summary of the user's learning session, displaying metrics, achievements, and progress in an engaging and motivational format.
  </Purpose>
  
  <DataStructures>
    <Structure name="SessionData">
      <Field name="sessionId" type="string" required="true" description="Unique identifier for the session" />
      <Field name="startTime" type="Date" required="true" description="When the session started" />
      <Field name="endTime" type="Date" required="true" description="When the session ended" />
      <Field name="duration" type="number" required="true" description="Session duration in seconds" />
      <Field name="questionsAnswered" type="number" required="true" description="Total number of questions answered" />
      <Field name="correctAnswers" type="number" required="true" description="Number of correct answers" />
      <Field name="incorrectAnswers" type="number" required="true" description="Number of incorrect answers" />
      <Field name="timeouts" type="number" required="true" description="Number of questions that timed out" />
      <Field name="averageResponseTime" type="number" required="true" description="Average time to answer in milliseconds" />
      <Field name="boundaryLevels" type="object" required="true" description="Performance at each boundary level">
        <Field name="level1" type="number" required="true" description="Percentage correct at boundary level 1" />
        <Field name="level2" type="number" required="true" description="Percentage correct at boundary level 2" />
        <Field name="level3" type="number" required="true" description="Percentage correct at boundary level 3" />
        <Field name="level4" type="number" required="true" description="Percentage correct at boundary level 4" />
        <Field name="level5" type="number" required="true" description="Percentage correct at boundary level 5" />
      </Field>
    </Structure>
    
    <Structure name="MetricsData">
      <Field name="ftcPoints" type="number" required="true" description="First Time Correct points earned" />
      <Field name="ecPoints" type="number" required="true" description="Every Correct points earned" />
      <Field name="basePoints" type="number" required="true" description="Base points earned" />
      <Field name="bonusMultiplier" type="number" required="true" description="Bonus multiplier achieved" />
      <Field name="blinkSpeed" type="number" required="true" description="Blink speed metric (milliseconds)" />
      <Field name="totalPoints" type="number" required="true" description="Total points earned in session" />
      <Field name="evolution" type="number" required="true" description="Evolution progress (percentage)" />
    </Structure>
    
    <Structure name="AchievementData">
      <Field name="newAchievements" type="Array<Achievement>" required="true" description="Achievements unlocked in this session" />
      <Field name="progressAchievements" type="Array<AchievementProgress>" required="true" description="Progress made toward achievements" />
    </Structure>
    
    <Structure name="Achievement">
      <Field name="id" type="string" required="true" description="Unique identifier for the achievement" />
      <Field name="name" type="string" required="true" description="Display name of the achievement" />
      <Field name="description" type="string" required="true" description="Description of the achievement" />
      <Field name="icon" type="string" required="true" description="Icon URL for the achievement" />
      <Field name="pointsAwarded" type="number" required="true" description="Points awarded for this achievement" />
    </Structure>
    
    <Structure name="AchievementProgress">
      <Field name="id" type="string" required="true" description="Unique identifier for the achievement" />
      <Field name="name" type="string" required="true" description="Display name of the achievement" />
      <Field name="description" type="string" required="true" description="Description of the achievement" />
      <Field name="icon" type="string" required="true" description="Icon URL for the achievement" />
      <Field name="progress" type="number" required="true" description="Current progress (percentage)" />
      <Field name="target" type="number" required="true" description="Target value to achieve" />
    </Structure>
    
    <Structure name="ProgressData">
      <Field name="learningPaths" type="object" required="true" description="Progress in each learning path">
        <Field name="path1" type="PathProgress" required="true" description="Progress in first learning path" />
        <Field name="path2" type="PathProgress" required="true" description="Progress in second learning path" />
        <Field name="path3" type="PathProgress" required="true" description="Progress in third learning path" />
      </Field>
      <Field name="overallProgress" type="number" required="true" description="Overall curriculum progress (percentage)" />
      <Field name="nextSessionFocus" type="Array<string>" required="true" description="Suggested focus areas for next session" />
    </Structure>
    
    <Structure name="PathProgress">
      <Field name="name" type="string" required="true" description="Name of the learning path" />
      <Field name="progress" type="number" required="true" description="Progress percentage in this path" />
      <Field name="unitsCompleted" type="number" required="true" description="Number of units completed" />
      <Field name="totalUnits" type="number" required="true" description="Total number of units in path" />
      <Field name="currentUnit" type="string" required="true" description="Name of current unit" />
    </Structure>
    
    <Structure name="SummaryOptions">
      <Field name="showMetrics" type="boolean" required="false" description="Whether to show metrics section" defaultValue="true" />
      <Field name="showAchievements" type="boolean" required="false" description="Whether to show achievements section" defaultValue="true" />
      <Field name="showProgress" type="boolean" required="false" description="Whether to show progress section" defaultValue="true" />
      <Field name="showNextSteps" type="boolean" required="false" description="Whether to show next steps section" defaultValue="true" />
      <Field name="animateEntrance" type="boolean" required="false" description="Whether to animate the entrance of the summary" defaultValue="true" />
      <Field name="celebrateAchievements" type="boolean" required="false" description="Whether to show celebration animations for achievements" defaultValue="true" />
    </Structure>
  </DataStructures>
  
  <Methods>
    <Method name="showSessionSummary">
      <Description>
        Display a comprehensive summary of the completed learning session with metrics, achievements, and progress.
      </Description>
      <Input>
        <Parameter name="sessionData" type="SessionData" required="true" description="Data about the completed session" />
        <Parameter name="metricsData" type="MetricsData" required="true" description="Metrics calculated for the session" />
        <Parameter name="achievementData" type="AchievementData" required="true" description="Achievements unlocked and progress made" />
        <Parameter name="progressData" type="ProgressData" required="true" description="Progress made in learning paths" />
        <Parameter name="options" type="SummaryOptions" required="false" description="Display options for the summary" />
      </Input>
      <Output>
        <Parameter name="summaryId" type="string" description="Unique identifier for the displayed summary" />
      </Output>
      <Errors>
        <Error code="SS-001" description="Invalid session data provided" />
        <Error code="SS-002" description="Invalid metrics data provided" />
        <Error code="SS-003" description="Invalid achievement data provided" />
        <Error code="SS-004" description="Invalid progress data provided" />
        <Error code="SS-005" description="Summary already displayed" />
      </Errors>
    </Method>
    
    <Method name="hideSessionSummary">
      <Description>
        Hide the currently displayed session summary.
      </Description>
      <Input>
        <Parameter name="summaryId" type="string" required="true" description="Identifier of the summary to hide" />
        <Parameter name="animate" type="boolean" required="false" description="Whether to animate the exit" defaultValue="true" />
      </Input>
      <Output>
        <Parameter name="success" type="boolean" description="Whether the operation was successful" />
      </Output>
      <Errors>
        <Error code="SS-101" description="Summary not found" />
        <Error code="SS-102" description="Summary already hidden" />
      </Errors>
    </Method>
    
    <Method name="getSummarySnapshot">
      <Description>
        Generate a shareable image of the session summary.
      </Description>
      <Input>
        <Parameter name="summaryId" type="string" required="true" description="Identifier of the summary to snapshot" />
        <Parameter name="format" type="string" required="false" description="Image format (png, jpeg)" defaultValue="png" />
        <Parameter name="includeMetrics" type="boolean" required="false" description="Whether to include metrics in snapshot" defaultValue="true" />
        <Parameter name="includeAchievements" type="boolean" required="false" description="Whether to include achievements in snapshot" defaultValue="true" />
      </Input>
      <Output>
        <Parameter name="imageUrl" type="string" description="URL to the generated image" />
        <Parameter name="imageData" type="Blob" description="Raw image data" />
      </Output>
      <Errors>
        <Error code="SS-201" description="Summary not found" />
        <Error code="SS-202" description="Invalid format specified" />
        <Error code="SS-203" description="Image generation failed" />
      </Errors>
    </Method>
    
    <Method name="celebrateAchievement">
      <Description>
        Trigger a celebration animation for a specific achievement.
      </Description>
      <Input>
        <Parameter name="summaryId" type="string" required="true" description="Identifier of the summary" />
        <Parameter name="achievementId" type="string" required="true" description="Identifier of the achievement to celebrate" />
        <Parameter name="animationType" type="string" required="false" description="Type of celebration animation" defaultValue="confetti" />
      </Input>
      <Output>
        <Parameter name="success" type="boolean" description="Whether the celebration was triggered successfully" />
      </Output>
      <Errors>
        <Error code="SS-301" description="Summary not found" />
        <Error code="SS-302" description="Achievement not found" />
        <Error code="SS-303" description="Invalid animation type" />
      </Errors>
    </Method>
    
    <Method name="highlightProgress">
      <Description>
        Highlight a specific area of progress in the summary.
      </Description>
      <Input>
        <Parameter name="summaryId" type="string" required="true" description="Identifier of the summary" />
        <Parameter name="progressType" type="string" required="true" description="Type of progress to highlight (path1, path2, path3, overall)" />
        <Parameter name="highlightDuration" type="number" required="false" description="Duration of highlight in milliseconds" defaultValue="3000" />
      </Input>
      <Output>
        <Parameter name="success" type="boolean" description="Whether the highlight was triggered successfully" />
      </Output>
      <Errors>
        <Error code="SS-401" description="Summary not found" />
        <Error code="SS-402" description="Invalid progress type" />
      </Errors>
    </Method>
  </Methods>
  
  <Events>
    <Event name="onSummaryDisplayed">
      <Description>Fired when a session summary is displayed</Description>
      <Data>
        <Field name="summaryId" type="string" description="Identifier of the displayed summary" />
        <Field name="sessionId" type="string" description="Identifier of the session" />
        <Field name="displayTime" type="Date" description="When the summary was displayed" />
      </Data>
    </Event>
    
    <Event name="onSummaryHidden">
      <Description>Fired when a session summary is hidden</Description>
      <Data>
        <Field name="summaryId" type="string" description="Identifier of the hidden summary" />
        <Field name="viewDuration" type="number" description="How long the summary was viewed (milliseconds)" />
      </Data>
    </Event>
    
    <Event name="onAchievementCelebrated">
      <Description>Fired when an achievement celebration is triggered</Description>
      <Data>
        <Field name="summaryId" type="string" description="Identifier of the summary" />
        <Field name="achievementId" type="string" description="Identifier of the celebrated achievement" />
        <Field name="animationType" type="string" description="Type of celebration animation used" />
      </Data>
    </Event>
    
    <Event name="onSnapshotGenerated">
      <Description>Fired when a summary snapshot is generated</Description>
      <Data>
        <Field name="summaryId" type="string" description="Identifier of the summary" />
        <Field name="format" type="string" description="Format of the generated image" />
        <Field name="imageUrl" type="string" description="URL to the generated image" />
      </Data>
    </Event>
  </Events>
  
  <Dependencies>
    <Dependency interface="ThemeManagerInterface" required="true" description="Used to apply consistent theming to the summary display" />
    <Dependency interface="FeedbackSystemInterface" required="true" description="Used for celebration animations and visual feedback" />
    <Dependency interface="MetricsCalculatorInterface" required="true" description="Used to calculate and format metrics for display" />
  </Dependencies>
  
  <ValidationCriteria>
    <Criterion id="UI-004" description="Session summary shows all metrics with appropriate visualizations and explanations" />
    <Criterion id="UI-005" description="Achievement celebrations provide positive reinforcement without causing anxiety" />
    <Criterion id="UI-006" description="UI is accessible for the target audience of school-aged children from age 6 and up" />
  </ValidationCriteria>
</Interface>
```

## Module Context

From the UserInterface module definition:

```xml
<Component name="SessionSummary">
  <Description>
    Displays session metrics and summary information.
  </Description>
  <Implements>SessionSummaryInterface</Implements>
  <Dependencies>
    <Dependency interface="ThemeManagerInterface" />
  </Dependencies>
</Component>

<ValidationCriteria>
  <Criterion id="UI-004" test="tests/ui/session_summary_test.js">
    Session Summary must correctly display and animate all session metrics.
  </Criterion>
  <Criterion id="UI-005" test="tests/ui/dashboard_test.js">
    Dashboard must correctly display all lifetime metrics including Evolution and Global Ranking.
  </Criterion>
  <Criterion id="UI-006" test="tests/ui/accessibility_test.js">
    UI must be accessible for the target audience of school-aged children from age 6 and up.
  </Criterion>
</ValidationCriteria>
```

## Implementation Requirements

The SessionSummary component should:

1. Follow the SessionSummaryInterface definition, implementing all required methods and data structures
2. Use Next.js with TypeScript and Tailwind CSS for the implementation
3. Create visually appealing displays for metrics with appropriate charts and visualizations
4. Implement engaging celebration animations for achievements that are positive without causing anxiety
5. Show clear progress indicators for the Triple Helix learning paths
6. Provide a shareable snapshot feature for session summaries
7. Be fully responsive for both desktop and mobile devices
8. Support dark mode through the ThemeManager
9. Use the FeedbackSystem for celebration animations
10. Be accessible for the target audience of school-aged children

## Implementation Prompt

Implement a SessionSummary component for the Zenjin Maths App that displays a comprehensive summary of the user's learning session. The component should show metrics, achievements, and progress in an engaging and motivational format suitable for school-aged children (6+ years old).

The implementation should:

1. Follow the SessionSummaryInterface definition, implementing all required methods and data structures
2. Use Next.js with TypeScript and Tailwind CSS for the implementation
3. Create visually appealing displays for metrics with appropriate charts and visualizations
4. Implement engaging celebration animations for achievements that are positive without causing anxiety
5. Show clear progress indicators for the Triple Helix learning paths
6. Provide a shareable snapshot feature for session summaries
7. Be fully responsive for both desktop and mobile devices
8. Support dark mode through the ThemeManager
9. Use the FeedbackSystem for celebration animations
10. Be accessible for the target audience of school-aged children

The component should support the distinction-based learning approach by:

1. Highlighting performance at different boundary levels
2. Providing positive reinforcement for achievements
3. Showing clear progress indicators for each learning path
4. Suggesting focus areas for the next session based on performance

Technical requirements:

1. Use React hooks for state management
2. Implement responsive design with Tailwind CSS
3. Use Chart.js or similar for metric visualizations
4. Implement animations with GSAP or Framer Motion
5. Support keyboard navigation and screen readers
6. Optimize for performance with appropriate memoization
7. Include comprehensive test coverage

Please provide the following files:

1. SessionSummary.tsx - Main component implementation
2. sessionSummary.css - CSS styles and animations (if needed beyond Tailwind)
3. SessionSummaryExample.tsx - Example usage with mock data
4. SessionSummary.test.tsx - Test suite
5. README.md - Implementation documentation

Include detailed comments explaining the implementation decisions and how they support the distinction-based learning approach.

## Mock Inputs

### Example 1: Basic Session Summary

```typescript
// Example usage of SessionSummary component
import { SessionSummary } from './SessionSummary';

function ExampleApp() {
  // Mock session data
  const sessionData = {
    sessionId: "session-123",
    startTime: new Date("2025-05-19T14:00:00Z"),
    endTime: new Date("2025-05-19T14:30:00Z"),
    duration: 1800, // 30 minutes in seconds
    questionsAnswered: 45,
    correctAnswers: 38,
    incorrectAnswers: 7,
    timeouts: 0,
    averageResponseTime: 2350, // milliseconds
    boundaryLevels: {
      level1: 95, // percentage correct
      level2: 90,
      level3: 85,
      level4: 75,
      level5: 65
    }
  };
  
  // Mock metrics data
  const metricsData = {
    ftcPoints: 380,
    ecPoints: 420,
    basePoints: 800,
    bonusMultiplier: 1.25,
    blinkSpeed: 2350,
    totalPoints: 1000,
    evolution: 15
  };
  
  // Mock achievement data
  const achievementData = {
    newAchievements: [
      {
        id: "achievement-1",
        name: "Quick Thinker",
        description: "Answer 10 questions in under 3 seconds each",
        icon: "/icons/quick-thinker.svg",
        pointsAwarded: 50
      },
      {
        id: "achievement-2",
        name: "Perfect Streak",
        description: "Get 10 correct answers in a row",
        icon: "/icons/perfect-streak.svg",
        pointsAwarded: 100
      }
    ],
    progressAchievements: [
      {
        id: "achievement-3",
        name: "Math Master",
        description: "Complete all units in a learning path",
        icon: "/icons/math-master.svg",
        progress: 65,
        target: 100
      }
    ]
  };
  
  // Mock progress data
  const progressData = {
    learningPaths: {
      path1: {
        name: "Addition & Subtraction",
        progress: 75,
        unitsCompleted: 15,
        totalUnits: 20,
        currentUnit: "Two-digit Addition"
      },
      path2: {
        name: "Multiplication & Division",
        progress: 40,
        unitsCompleted: 8,
        totalUnits: 20,
        currentUnit: "Multiplication Tables"
      },
      path3: {
        name: "Fractions & Decimals",
        progress: 25,
        unitsCompleted: 5,
        totalUnits: 20,
        currentUnit: "Basic Fractions"
      }
    },
    overallProgress: 47,
    nextSessionFocus: [
      "Multiplication Tables",
      "Basic Fractions"
    ]
  };
  
  // Display options
  const options = {
    showMetrics: true,
    showAchievements: true,
    showProgress: true,
    showNextSteps: true,
    animateEntrance: true,
    celebrateAchievements: true
  };
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Session Summary Example</h1>
      <SessionSummary
        sessionData={sessionData}
        metricsData={metricsData}
        achievementData={achievementData}
        progressData={progressData}
        options={options}
      />
    </div>
  );
}
```

### Example 2: Minimal Session Summary

```typescript
// Example of minimal session summary
import { SessionSummary } from './SessionSummary';

function MinimalExample() {
  // Minimal session data
  const sessionData = {
    sessionId: "session-456",
    startTime: new Date("2025-05-19T15:00:00Z"),
    endTime: new Date("2025-05-19T15:15:00Z"),
    duration: 900, // 15 minutes in seconds
    questionsAnswered: 20,
    correctAnswers: 15,
    incorrectAnswers: 5,
    timeouts: 0,
    averageResponseTime: 3000, // milliseconds
    boundaryLevels: {
      level1: 90, // percentage correct
      level2: 80,
      level3: 70,
      level4: 60,
      level5: 50
    }
  };
  
  // Minimal metrics data
  const metricsData = {
    ftcPoints: 150,
    ecPoints: 200,
    basePoints: 350,
    bonusMultiplier: 1.0,
    blinkSpeed: 3000,
    totalPoints: 350,
    evolution: 5
  };
  
  // No achievements
  const achievementData = {
    newAchievements: [],
    progressAchievements: []
  };
  
  // Minimal progress data
  const progressData = {
    learningPaths: {
      path1: {
        name: "Addition & Subtraction",
        progress: 30,
        unitsCompleted: 6,
        totalUnits: 20,
        currentUnit: "Single-digit Addition"
      },
      path2: {
        name: "Multiplication & Division",
        progress: 10,
        unitsCompleted: 2,
        totalUnits: 20,
        currentUnit: "Introduction to Multiplication"
      },
      path3: {
        name: "Fractions & Decimals",
        progress: 5,
        unitsCompleted: 1,
        totalUnits: 20,
        currentUnit: "Introduction to Fractions"
      }
    },
    overallProgress: 15,
    nextSessionFocus: [
      "Single-digit Addition"
    ]
  };
  
  // Minimal options
  const options = {
    showMetrics: true,
    showAchievements: false,
    showProgress: true,
    showNextSteps: true,
    animateEntrance: false,
    celebrateAchievements: false
  };
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Minimal Session Summary</h1>
      <SessionSummary
        sessionData={sessionData}
        metricsData={metricsData}
        achievementData={achievementData}
        progressData={progressData}
        options={options}
      />
    </div>
  );
}
```

## Expected Outputs

1. **SessionSummary.tsx**: A TypeScript React component that implements the SessionSummaryInterface, with all required methods and data structures. The component should display a comprehensive summary of the user's learning session, with metrics, achievements, and progress in an engaging and motivational format.

2. **sessionSummary.css**: CSS styles and animations for the SessionSummary component, if needed beyond what Tailwind CSS provides.

3. **SessionSummaryExample.tsx**: An example usage of the SessionSummary component with mock data, demonstrating how to use the component in different scenarios.

4. **SessionSummary.test.tsx**: A comprehensive test suite for the SessionSummary component, covering all methods and edge cases.

5. **README.md**: Detailed documentation of the SessionSummary component implementation, including usage examples, design decisions, and how it supports the distinction-based learning approach.

## Validation Criteria

1. **UI-004**: Session summary shows all metrics with appropriate visualizations and explanations
   - The component must display all metrics (FTCPoints, ECPoints, BasePoints, BonusMultipliers, BlinkSpeed, TotalPoints, Evolution) with appropriate visualizations and clear explanations suitable for the target audience.

2. **UI-005**: Achievement celebrations provide positive reinforcement without causing anxiety
   - Achievement celebrations must be visually engaging and provide positive reinforcement without causing anxiety or overwhelming the user. Animations should be smooth and appropriate for the target audience.

3. **UI-006**: UI is accessible for the target audience of school-aged children from age 6 and up
   - The component must be accessible for school-aged children (6+ years old), with clear visual cues, appropriate language, and intuitive interactions. It should support keyboard navigation and screen readers.

## Distinction-Based Learning Context

The SessionSummary component plays a crucial role in the distinction-based learning approach by:

1. **Boundary Level Visualization**: Showing performance at each of the five boundary levels, helping users understand their mastery of distinctions at different levels of complexity.

2. **Achievement Reinforcement**: Celebrating achievements that represent mastery of specific distinctions, providing positive reinforcement for learning progress.

3. **Triple Helix Progress**: Visualizing progress in the three parallel learning paths, showing how distinctions are being mastered across different mathematical domains.

4. **Adaptive Focus Suggestions**: Recommending focus areas for the next session based on performance, guiding users toward distinctions that need more practice.

5. **Non-Anxiety Approach**: Presenting metrics and progress in a positive, encouraging manner that avoids causing anxiety, in line with the core principles of distinction-based learning.

The component should use visual design, animations, and language that support these principles, making the learning process engaging and effective for the target audience of school-aged children.
