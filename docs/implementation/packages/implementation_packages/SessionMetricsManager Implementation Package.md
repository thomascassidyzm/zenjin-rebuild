# SessionMetricsManager Implementation Package

## Implementation Goal

Create a SessionMetricsManager component that calculates and manages metrics for individual learning sessions in the Zenjin Maths App. This component will track and calculate key performance metrics including FTCPoints (First Time Correct), ECPoints (Eventually Correct), BasePoints, BonusMultipliers, BlinkSpeed, and TotalPoints, providing real-time feedback during sessions and comprehensive summaries upon completion.

## Component Context

The SessionMetricsManager is a core component of the MetricsSystem module that implements the calculation and management of metrics for individual learning sessions. It plays a critical role in:

1. Tracking user performance during learning sessions
2. Calculating performance-based metrics in real-time
3. Generating comprehensive session summaries
4. Providing data for the SessionSummary UI component
5. Contributing to lifetime metrics calculations

This component is essential for providing immediate feedback to users on their performance and for generating the motivational metrics that drive engagement in the Zenjin Maths App's distinction-based learning approach.

## Interface Definition

### Data Structures

```typescript
/**
 * Configuration for a learning session
 */
interface SessionConfig {
  /** Target session duration in seconds (optional) */
  duration?: number;
  
  /** Target number of questions (optional) */
  questionCount?: number;
  
  /** Learning path identifier (optional) */
  learningPathId?: string;
  
  /** Stitch identifier (optional) */
  stitchId?: string;
}

/**
 * Record of an answer during a session
 */
interface AnswerRecord {
  /** Question identifier */
  questionId: string;
  
  /** Whether the answer was correct */
  isCorrect: boolean;
  
  /** Whether this was the first attempt */
  isFirstAttempt: boolean;
  
  /** Response time in milliseconds */
  responseTime: number;
  
  /** ISO date string of the answer */
  timestamp: string;
}

/**
 * Summary of a completed learning session
 */
interface SessionSummary {
  /** Session identifier */
  sessionId: string;
  
  /** User identifier */
  userId: string;
  
  /** Actual session duration in milliseconds */
  duration: number;
  
  /** Number of questions answered */
  questionCount: number;
  
  /** Number of first-time correct answers */
  ftcCount: number;
  
  /** Number of eventually correct answers */
  ecCount: number;
  
  /** Number of incorrect answers */
  incorrectCount: number;
  
  /** First-time correct points */
  ftcPoints: number;
  
  /** Eventually correct points */
  ecPoints: number;
  
  /** Base points (FTC + EC) */
  basePoints: number;
  
  /** Consistency score (0.0-1.0) */
  consistency: number;
  
  /** Accuracy score (0.0-1.0) */
  accuracy: number;
  
  /** Speed score (0.0-1.0) */
  speed: number;
  
  /** Bonus multiplier */
  bonusMultiplier: number;
  
  /** Blink speed (ms per FTC answer) */
  blinkSpeed: number;
  
  /** Total points (base × bonus) */
  totalPoints: number;
  
  /** ISO date string of session start */
  startTime: string;
  
  /** ISO date string of session end */
  endTime: string;
}

/**
 * Current metrics during an active session
 */
interface CurrentSessionMetrics {
  /** Current duration in milliseconds */
  duration: number;
  
  /** Current question count */
  questionCount: number;
  
  /** Current first-time correct count */
  ftcCount: number;
  
  /** Current eventually correct count */
  ecCount: number;
  
  /** Current incorrect count */
  incorrectCount: number;
  
  /** Current points estimate */
  currentPoints: number;
}
```

### Methods

```typescript
/**
 * Starts a new learning session
 * @param userId - User identifier
 * @param sessionConfig - Session configuration (optional)
 * @returns Identifier for the new session
 * @throws USER_NOT_FOUND if the specified user was not found
 * @throws INVALID_CONFIG if the session configuration is invalid
 * @throws SESSION_START_FAILED if failed to start the session
 */
function startSession(userId: string, sessionConfig?: SessionConfig): string;

/**
 * Records an answer during the session
 * @param sessionId - Session identifier
 * @param answer - Answer record
 * @returns Whether the answer was successfully recorded
 * @throws SESSION_NOT_FOUND if the specified session was not found
 * @throws INVALID_ANSWER if the answer record is invalid
 * @throws SESSION_ENDED if the session has already ended
 */
function recordAnswer(sessionId: string, answer: AnswerRecord): boolean;

/**
 * Gets the current metrics for an active session
 * @param sessionId - Session identifier
 * @returns Current session metrics
 * @throws SESSION_NOT_FOUND if the specified session was not found
 * @throws SESSION_ENDED if the session has already ended
 */
function getCurrentMetrics(sessionId: string): CurrentSessionMetrics;

/**
 * Ends a session and generates a summary
 * @param sessionId - Session identifier
 * @returns Session summary
 * @throws SESSION_NOT_FOUND if the specified session was not found
 * @throws SESSION_ALREADY_ENDED if the session has already ended
 * @throws SUMMARY_GENERATION_FAILED if failed to generate session summary
 */
function endSession(sessionId: string): SessionSummary;

/**
 * Gets the summary for a completed session
 * @param sessionId - Session identifier
 * @returns Session summary
 * @throws SESSION_NOT_FOUND if the specified session was not found
 * @throws SESSION_NOT_ENDED if the session has not ended yet
 */
function getSessionSummary(sessionId: string): SessionSummary;
```

## Module Context

The SessionMetricsManager is a component of the MetricsSystem module, which calculates and manages session and lifetime metrics including FTCPoints, ECPoints, BasePoints, BonusMultipliers, BlinkSpeed, TotalPoints, Evolution, and GlobalRanking.

### Module Purpose

The MetricsSystem module is responsible for tracking, calculating, and storing all performance metrics in the Zenjin Maths App. It provides the data needed for the user interface to display progress and achievements, and for the ProgressionSystem to make decisions about learning path progression.

### Component Relationships

The SessionMetricsManager has the following relationships with other components:

1. **MetricsCalculator**: The SessionMetricsManager depends on the MetricsCalculator for performing the actual calculations of metrics based on session data.

2. **LifetimeMetricsManager**: The SessionMetricsManager provides session summaries to the LifetimeMetricsManager for aggregation into lifetime metrics.

3. **UserInterface.SessionSummary**: The SessionMetricsManager provides session summary data to the SessionSummary component for visualization and display.

## Implementation Requirements

### Session Management

1. **Session Lifecycle**: Implement the complete lifecycle of a session, including starting a session, recording answers, and ending a session.

2. **Session State**: Maintain the state of active sessions, including all answers recorded, timestamps, and current metrics.

3. **Session Identification**: Generate unique session identifiers and ensure they can be used to retrieve session data.

### Metrics Calculation

1. **FTCPoints**: Calculate First Time Correct points as 5 points per FTC answer.

2. **ECPoints**: Calculate Eventually Correct points as 3 points per EC answer.

3. **BasePoints**: Calculate Base points as the sum of FTCPoints and ECPoints.

4. **Consistency**: Calculate Consistency score (0.0-1.0) based on the pattern of correct and incorrect answers.

5. **Accuracy**: Calculate Accuracy score (0.0-1.0) as the ratio of correct answers (FTC + EC) to total questions.

6. **Speed**: Calculate Speed score (0.0-1.0) based on average response time relative to expected response time.

7. **BonusMultiplier**: Calculate Bonus multiplier based on Consistency, Accuracy, and Speed scores.

8. **BlinkSpeed**: Calculate Blink speed as the session duration divided by the number of FTC answers.

9. **TotalPoints**: Calculate Total points as BasePoints × BonusMultiplier.

### Real-time Updates

1. **Current Metrics**: Provide real-time access to current session metrics during an active session.

2. **Efficient Calculation**: Ensure that metrics calculations are efficient and can be performed in real-time.

3. **Incremental Updates**: Update metrics incrementally as new answers are recorded, rather than recalculating from scratch.

### Error Handling

1. **Input Validation**: Validate all inputs to ensure they meet the requirements of the interface.

2. **Error Reporting**: Provide clear error messages for all error conditions.

3. **Edge Cases**: Handle edge cases such as sessions with no answers, sessions with all incorrect answers, etc.

## Implementation Prompt

Implement the SessionMetricsManager component according to the interface definition and requirements. The implementation should:

1. Manage the lifecycle of learning sessions, including starting sessions, recording answers, and ending sessions.

2. Calculate session metrics according to the specified formulas, including FTCPoints, ECPoints, BasePoints, BonusMultipliers, BlinkSpeed, and TotalPoints.

3. Provide real-time access to current session metrics during active sessions.

4. Generate comprehensive session summaries upon session completion.

5. Handle error conditions and edge cases gracefully.

6. Include comprehensive comments explaining the implementation details and the calculation formulas for each metric.

7. Ensure the implementation is testable with mock inputs.

8. Use TypeScript for type safety and implement the SessionMetricsInterface as defined in the MetricsSystem module.

## Calculation Formulas

### FTCPoints
```
FTCPoints = FTCCount × 5
```

### ECPoints
```
ECPoints = ECCount × 3
```

### BasePoints
```
BasePoints = FTCPoints + ECPoints
```

### Consistency
```
Consistency = 1 - (StreakBreaks / (QuestionCount - 1))
```
Where StreakBreaks is the number of times a correct answer is followed by an incorrect answer or vice versa.

### Accuracy
```
Accuracy = (FTCCount + ECCount) / QuestionCount
```

### Speed
```
Speed = 1 - min(1, AverageResponseTime / ExpectedResponseTime)
```
Where ExpectedResponseTime is a baseline response time (e.g., 3000ms).

### BonusMultiplier
```
BonusMultiplier = 1 + (Consistency × 0.1) + (Accuracy × 0.1) + (Speed × 0.1)
```

### BlinkSpeed
```
BlinkSpeed = SessionDuration / FTCCount
```
If FTCCount is 0, BlinkSpeed is set to a maximum value (e.g., SessionDuration).

### TotalPoints
```
TotalPoints = BasePoints × BonusMultiplier
```

## Mock Inputs and Expected Outputs

### startSession

**Input:**
```typescript
const userId = "user123";
const sessionConfig = {
  duration: 300,
  questionCount: 20
};
```

**Expected Output:**
```typescript
"session123"
```

### recordAnswer

**Input:**
```typescript
const sessionId = "session123";
const answer = {
  questionId: "q001",
  isCorrect: true,
  isFirstAttempt: true,
  responseTime: 1500,
  timestamp: "2025-05-20T10:15:00Z"
};
```

**Expected Output:**
```typescript
true
```

### getCurrentMetrics

**Input:**
```typescript
const sessionId = "session123";
```

**Expected Output:**
```typescript
{
  duration: 120000,
  questionCount: 10,
  ftcCount: 8,
  ecCount: 1,
  incorrectCount: 1,
  currentPoints: 43
}
```

### endSession

**Input:**
```typescript
const sessionId = "session123";
```

**Expected Output:**
```typescript
{
  sessionId: "session123",
  userId: "user123",
  duration: 240000,
  questionCount: 20,
  ftcCount: 16,
  ecCount: 3,
  incorrectCount: 1,
  ftcPoints: 80,
  ecPoints: 9,
  basePoints: 89,
  consistency: 0.85,
  accuracy: 0.95,
  speed: 0.78,
  bonusMultiplier: 1.25,
  blinkSpeed: 15000,
  totalPoints: 111.25,
  startTime: "2025-05-20T10:10:00Z",
  endTime: "2025-05-20T10:14:00Z"
}
```

### getSessionSummary

**Input:**
```typescript
const sessionId = "session123";
```

**Expected Output:**
```typescript
{
  sessionId: "session123",
  userId: "user123",
  duration: 240000,
  questionCount: 20,
  ftcCount: 16,
  ecCount: 3,
  incorrectCount: 1,
  ftcPoints: 80,
  ecPoints: 9,
  basePoints: 89,
  consistency: 0.85,
  accuracy: 0.95,
  speed: 0.78,
  bonusMultiplier: 1.25,
  blinkSpeed: 15000,
  totalPoints: 111.25,
  startTime: "2025-05-20T10:10:00Z",
  endTime: "2025-05-20T10:14:00Z"
}
```

## Validation Criteria

The SessionMetricsManager implementation must satisfy the following validation criteria:

**MS-001**: SessionMetricsManager must correctly calculate FTCPoints, ECPoints, BasePoints, BonusMultipliers, BlinkSpeed, and TotalPoints for a session.

This criterion will be tested by:
1. Starting a session
2. Recording a series of answers with known correctness and response times
3. Ending the session
4. Verifying that the calculated metrics match the expected values

**MS-005**: MetricsCalculator must perform calculations with the correct formulas and precision.

This criterion will be tested by:
1. Providing known inputs to the calculation formulas
2. Verifying that the outputs match the expected values
3. Checking that the precision of the calculations is appropriate (e.g., rounding to 2 decimal places for display)

## Usage Example

```typescript
// Example usage of SessionMetricsManager
import { SessionMetricsManager } from './components/SessionMetricsManager';

// Create session metrics manager
const sessionMetricsManager = new SessionMetricsManager();

// Start a new session
const sessionId = sessionMetricsManager.startSession('user123', {
  duration: 300,
  questionCount: 20
});

console.log(`Started session: ${sessionId}`);

// Record answers during the session
sessionMetricsManager.recordAnswer(sessionId, {
  questionId: 'q001',
  isCorrect: true,
  isFirstAttempt: true,
  responseTime: 1500,
  timestamp: new Date().toISOString()
});

// Get current metrics during the session
const currentMetrics = sessionMetricsManager.getCurrentMetrics(sessionId);
console.log(`Questions answered: ${currentMetrics.questionCount}`);
console.log(`FTC count: ${currentMetrics.ftcCount}`);
console.log(`Current points: ${currentMetrics.currentPoints}`);

// Record more answers...
sessionMetricsManager.recordAnswer(sessionId, {
  questionId: 'q002',
  isCorrect: true,
  isFirstAttempt: true,
  responseTime: 1800,
  timestamp: new Date().toISOString()
});

sessionMetricsManager.recordAnswer(sessionId, {
  questionId: 'q003',
  isCorrect: false,
  isFirstAttempt: true,
  responseTime: 2200,
  timestamp: new Date().toISOString()
});

sessionMetricsManager.recordAnswer(sessionId, {
  questionId: 'q003',
  isCorrect: true,
  isFirstAttempt: false,
  responseTime: 1600,
  timestamp: new Date().toISOString()
});

// End the session and get summary
const summary = sessionMetricsManager.endSession(sessionId);
console.log(`Session duration: ${summary.duration / 1000} seconds`);
console.log(`FTC points: ${summary.ftcPoints}`);
console.log(`EC points: ${summary.ecPoints}`);
console.log(`Base points: ${summary.basePoints}`);
console.log(`Bonus multiplier: ${summary.bonusMultiplier}`);
console.log(`Total points: ${summary.totalPoints}`);
console.log(`Blink speed: ${summary.blinkSpeed} ms`);

// Later, retrieve the session summary
const retrievedSummary = sessionMetricsManager.getSessionSummary(sessionId);
console.log(`Retrieved session summary for: ${retrievedSummary.sessionId}`);
```

## Implementation Considerations

1. **State Management**: Consider using a Map or similar data structure to store active session state, with sessionId as the key.

2. **Calculation Efficiency**: Implement incremental calculation of metrics where possible to avoid recalculating from scratch for each answer.

3. **Precision**: Ensure appropriate precision in calculations, especially for floating-point values like bonusMultiplier.

4. **Timestamp Handling**: Use consistent timestamp handling throughout the implementation, preferably using ISO date strings.

5. **Error Handling**: Implement comprehensive error handling for all methods, with appropriate error codes and messages.

6. **Testing**: Include unit tests for all methods, with particular focus on the validation criteria (MS-001 and MS-005).

7. **Documentation**: Include comprehensive documentation for all methods and data structures.

8. **Performance**: Ensure that the implementation can handle high volumes of answer records efficiently.

9. **Memory Management**: Consider memory usage, especially for long sessions with many answer records.

10. **Extensibility**: Design the implementation to be extensible, allowing for future enhancements and modifications to the metrics calculations.
