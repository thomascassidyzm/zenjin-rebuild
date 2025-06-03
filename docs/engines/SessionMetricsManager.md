# SessionMetricsManager

## Overview

The `SessionMetricsManager` is a core component of the MetricsSystem module in the Zenjin Maths App. It tracks and calculates performance metrics for individual learning sessions, providing real-time feedback and comprehensive summaries for the app's distinction-based learning approach.

This implementation calculates key metrics including:
- First Time Correct (FTC) points
- Eventually Correct (EC) points
- Base points
- Consistency scores
- Accuracy percentages
- Speed ratings
- Bonus multipliers
- Blink speed
- Total points

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
  - [Methods](#methods)
  - [Interfaces](#interfaces)
- [Metrics Calculation](#metrics-calculation)
- [Error Handling](#error-handling)
- [Usage Examples](#usage-examples)
- [Testing](#testing)
- [Integration](#integration)

## Installation

```bash
# Using npm
npm install @zenjin/metrics-system

# Using yarn
yarn add @zenjin/metrics-system
```

## Usage

Basic usage example:

```typescript
import { SessionMetricsManager } from '@zenjin/metrics-system';

// Create an instance
const metricsManager = new SessionMetricsManager();

// Start a session
const sessionId = metricsManager.startSession('user123', {
  duration: 300,     // 5 minutes
  questionCount: 20
});

// Record an answer
metricsManager.recordAnswer(sessionId, {
  questionId: 'q001',
  isCorrect: true,
  isFirstAttempt: true,
  responseTime: 1500,
  timestamp: new Date().toISOString()
});

// Get current metrics during the session
const currentMetrics = metricsManager.getCurrentMetrics(sessionId);
console.log(`Current points: ${currentMetrics.currentPoints}`);

// End the session and get summary
const summary = metricsManager.endSession(sessionId);
console.log(`Total points: ${summary.totalPoints}`);
```

## API Reference

### Methods

#### `startSession(userId: string, sessionConfig?: SessionConfig): string`

Starts a new learning session.

**Parameters:**
- `userId`: User identifier
- `sessionConfig` (optional): Session configuration

**Returns:** 
- Session identifier (string)

**Throws:**
- `USER_NOT_FOUND`: If the specified user was not found
- `INVALID_CONFIG`: If the session configuration is invalid
- `SESSION_START_FAILED`: If failed to start the session

#### `recordAnswer(sessionId: string, answer: AnswerRecord): boolean`

Records an answer during the session.

**Parameters:**
- `sessionId`: Session identifier
- `answer`: Answer record

**Returns:**
- Whether the answer was successfully recorded (boolean)

**Throws:**
- `SESSION_NOT_FOUND`: If the specified session was not found
- `INVALID_ANSWER`: If the answer record is invalid
- `SESSION_ENDED`: If the session has already ended

#### `getCurrentMetrics(sessionId: string): CurrentSessionMetrics`

Gets the current metrics for an active session.

**Parameters:**
- `sessionId`: Session identifier

**Returns:**
- Current session metrics object

**Throws:**
- `SESSION_NOT_FOUND`: If the specified session was not found
- `SESSION_ENDED`: If the session has already ended

#### `endSession(sessionId: string): SessionSummary`

Ends a session and generates a summary.

**Parameters:**
- `sessionId`: Session identifier

**Returns:**
- Complete session summary object

**Throws:**
- `SESSION_NOT_FOUND`: If the specified session was not found
- `SESSION_ALREADY_ENDED`: If the session has already ended
- `SUMMARY_GENERATION_FAILED`: If failed to generate session summary

#### `getSessionSummary(sessionId: string): SessionSummary`

Gets the summary for a completed session.

**Parameters:**
- `sessionId`: Session identifier

**Returns:**
- Session summary object

**Throws:**
- `SESSION_NOT_FOUND`: If the specified session was not found
- `SESSION_NOT_ENDED`: If the session has not ended yet

### Interfaces

#### SessionConfig

```typescript
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
```

#### AnswerRecord

```typescript
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
```

#### CurrentSessionMetrics

```typescript
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

#### SessionSummary

```typescript
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
```

## Metrics Calculation

The SessionMetricsManager calculates metrics using the following formulas:

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
Where `StreakBreaks` is the number of times a correct answer is followed by an incorrect answer or vice versa.

### Accuracy
```
Accuracy = (FTCCount + ECCount) / QuestionCount
```

### Speed
```
Speed = 1 - min(1, AverageResponseTime / ExpectedResponseTime)
```
Where `ExpectedResponseTime` is a baseline response time (3000ms).

### BonusMultiplier
```
BonusMultiplier = 1 + (Consistency × 0.1) + (Accuracy × 0.1) + (Speed × 0.1)
```

### BlinkSpeed
```
BlinkSpeed = SessionDuration / FTCCount
```
If `FTCCount` is 0, `BlinkSpeed` is set to `SessionDuration`.

### TotalPoints
```
TotalPoints = BasePoints × BonusMultiplier
```

## Error Handling

The SessionMetricsManager uses the following error types:

```typescript
enum SessionMetricsError {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_CONFIG = 'INVALID_CONFIG',
  SESSION_START_FAILED = 'SESSION_START_FAILED',
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  INVALID_ANSWER = 'INVALID_ANSWER',
  SESSION_ENDED = 'SESSION_ENDED',
  SESSION_ALREADY_ENDED = 'SESSION_ALREADY_ENDED',
  SESSION_NOT_ENDED = 'SESSION_NOT_ENDED',
  SUMMARY_GENERATION_FAILED = 'SUMMARY_GENERATION_FAILED'
}
```

Example of error handling:

```typescript
try {
  const sessionId = sessionMetricsManager.startSession('user123');
  // Use the session...
} catch (error) {
  if (error.message === 'USER_NOT_FOUND') {
    console.error('The specified user was not found.');
  } else if (error.message === 'SESSION_START_FAILED') {
    console.error('Failed to start the session.');
  } else {
    console.error('An unexpected error occurred:', error);
  }
}
```

## Usage Examples

### Complete Session Flow

```typescript
import { SessionMetricsManager } from '@zenjin/metrics-system';

// Create session metrics manager
const sessionMetricsManager = new SessionMetricsManager();

// Start a new session
const sessionId = sessionMetricsManager.startSession('user123', {
  duration: 300,
  questionCount: 20
});

// Record a first-time correct answer
sessionMetricsManager.recordAnswer(sessionId, {
  questionId: 'q001',
  isCorrect: true,
  isFirstAttempt: true,
  responseTime: 1500,
  timestamp: new Date().toISOString()
});

// Record an eventually correct answer (two attempts)
sessionMetricsManager.recordAnswer(sessionId, {
  questionId: 'q002',
  isCorrect: false,
  isFirstAttempt: true,
  responseTime: 2200,
  timestamp: new Date().toISOString()
});

sessionMetricsManager.recordAnswer(sessionId, {
  questionId: 'q002',
  isCorrect: true,
  isFirstAttempt: false,
  responseTime: 1600,
  timestamp: new Date().toISOString()
});

// Get current metrics during the session
const currentMetrics = sessionMetricsManager.getCurrentMetrics(sessionId);
console.log(`Questions answered: ${currentMetrics.questionCount}`);
console.log(`Current points: ${currentMetrics.currentPoints}`);

// End the session and get summary
const summary = sessionMetricsManager.endSession(sessionId);
console.log(`Session duration: ${summary.duration / 1000} seconds`);
console.log(`FTC points: ${summary.ftcPoints}`);
console.log(`EC points: ${summary.ecPoints}`);
console.log(`Base points: ${summary.basePoints}`);
console.log(`Bonus multiplier: ${summary.bonusMultiplier.toFixed(2)}`);
console.log(`Total points: ${summary.totalPoints.toFixed(2)}`);
```

## Testing

The SessionMetricsManager implementation includes comprehensive unit tests to ensure that all requirements are met.

To run the tests:

```bash
# Using npm
npm test -- --testPathPattern=SessionMetricsManager

# Using yarn
yarn test --testPathPattern=SessionMetricsManager
```

The tests cover:

1. Session lifecycle management
2. Metrics calculation
3. Error handling
4. Edge cases

## Integration

### With LifetimeMetricsManager

```typescript
import { SessionMetricsManager } from '@zenjin/metrics-system/session';
import { LifetimeMetricsManager } from '@zenjin/metrics-system/lifetime';

const sessionMetricsManager = new SessionMetricsManager();
const lifetimeMetricsManager = new LifetimeMetricsManager();

// Start and use a session...
const sessionId = sessionMetricsManager.startSession('user123');
// Record answers...

// End the session
const sessionSummary = sessionMetricsManager.endSession(sessionId);

// Update lifetime metrics with the session summary
lifetimeMetricsManager.updateWithSession('user123', sessionSummary);
```

### With SessionSummary UI Component

```typescript
import { SessionMetricsManager } from '@zenjin/metrics-system';
import { SessionSummaryUI } from '@zenjin/ui-components';

const sessionMetricsManager = new SessionMetricsManager();

// After ending a session
const sessionSummary = sessionMetricsManager.endSession('session123');

// Display the session summary in the UI
const sessionSummaryUI = new SessionSummaryUI();
sessionSummaryUI.displaySummary(sessionSummary);
```

## Contributing

Guidelines for contributing to the SessionMetricsManager component:

1. Follow the TypeScript coding standards
2. Add tests for new features
3. Ensure all existing tests pass
4. Document new functionality
5. Update the README with any changes to the API

## License

This component is part of the Zenjin Maths App and is subject to the company's licensing terms.
