# MetricsStorage Implementation Package

## Implementation Goal

Create a MetricsStorage component that manages the storage and retrieval of metrics data in the Zenjin Maths App. This component will handle the persistence of session and lifetime metrics, provide access to historical data, and ensure reliable data storage even during offline operation.

## Component Context

The MetricsStorage is a core component of the MetricsSystem module that implements the storage layer for all metrics data. It plays a critical role in:

1. Persisting session metrics after each learning session
2. Storing and updating lifetime metrics for each user
3. Providing access to historical session data
4. Supporting offline operation with local data storage
5. Ensuring data integrity and reliability

This component is essential for maintaining user progress and performance data, which drives the adaptive learning experience and motivational aspects of the Zenjin Maths App.

## Interface Definition

### Data Structures

```typescript
/**
 * Session metrics data to be stored
 */
interface SessionMetrics {
  /** Session identifier */
  sessionId: string;
  
  /** User identifier */
  userId: string;
  
  /** Session duration in milliseconds */
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
 * Lifetime metrics data to be stored
 */
interface LifetimeMetrics {
  /** User identifier */
  userId: string;
  
  /** Total number of completed sessions */
  totalSessions: number;
  
  /** Cumulative points across all sessions */
  totalPoints: number;
  
  /** User's current BlinkSpeed performance in milliseconds */
  currentBlinkSpeed: number;
  
  /** Evolution metric (Total Points / Blink Speed) */
  evolution: number;
  
  /** ISO date string of first session (optional) */
  firstSessionDate?: string;
  
  /** ISO date string of last session (optional) */
  lastSessionDate?: string;
  
  /** Current streak in days (optional) */
  streakDays?: number;
  
  /** Longest streak in days (optional) */
  longestStreakDays?: number;
}

/**
 * Session history entry
 */
interface SessionHistoryEntry {
  /** Session identifier */
  sessionId: string;
  
  /** Total points earned in the session */
  totalPoints: number;
  
  /** ISO date string of session end */
  endTime: string;
  
  /** Session duration in milliseconds */
  duration: number;
  
  /** Number of questions answered */
  questionCount: number;
}
```

### Methods

```typescript
/**
 * Saves session metrics data
 * @param sessionId - Session identifier
 * @param metrics - Session metrics to save
 * @returns Whether the save was successful
 * @throws INVALID_SESSION_ID if the session ID is invalid
 * @throws INVALID_METRICS if the metrics data is invalid
 * @throws STORAGE_ERROR if a storage error occurred
 */
function saveSessionMetrics(sessionId: string, metrics: SessionMetrics): boolean;

/**
 * Saves lifetime metrics data
 * @param userId - User identifier
 * @param metrics - Lifetime metrics to save
 * @returns Whether the save was successful
 * @throws INVALID_USER_ID if the user ID is invalid
 * @throws INVALID_METRICS if the metrics data is invalid
 * @throws STORAGE_ERROR if a storage error occurred
 */
function saveLifetimeMetrics(userId: string, metrics: LifetimeMetrics): boolean;

/**
 * Gets session history for a user
 * @param userId - User identifier
 * @param limit - Maximum number of sessions to retrieve (optional, defaults to 10)
 * @returns Array of session history entries
 * @throws INVALID_USER_ID if the user ID is invalid
 * @throws INVALID_LIMIT if the limit is invalid
 * @throws STORAGE_ERROR if a storage error occurred
 */
function getSessionHistory(userId: string, limit?: number): SessionHistoryEntry[];
```

## Module Context

The MetricsStorage is a component of the MetricsSystem module, which calculates and manages session and lifetime metrics including FTCPoints, ECPoints, BasePoints, BonusMultipliers, BlinkSpeed, TotalPoints, Evolution, and GlobalRanking.

### Module Purpose

The MetricsSystem module is responsible for tracking, calculating, and storing all performance metrics in the Zenjin Maths App. It provides the data needed for the user interface to display progress and achievements, and for the ProgressionSystem to make decisions about learning path progression.

### Component Relationships

The MetricsStorage has the following relationships with other components:

1. **SessionMetricsManager**: The SessionMetricsManager depends on the MetricsStorage for persisting session metrics data.

2. **LifetimeMetricsManager**: The LifetimeMetricsManager depends on the MetricsStorage for retrieving and updating lifetime metrics data.

3. **OfflineSupport.SynchronizationInterface**: The MetricsStorage interacts with the SynchronizationInterface to ensure metrics data is properly synchronized between local storage and the server.

## Implementation Requirements

### Storage Management

1. **Data Persistence**: Implement reliable storage of metrics data that persists across app restarts and device reboots.

2. **Offline Support**: Ensure metrics data can be stored locally during offline operation and synchronized with the server when online.

3. **Storage Efficiency**: Optimize storage to handle large volumes of metrics data efficiently.

4. **Data Integrity**: Implement mechanisms to ensure data integrity and prevent data corruption.

### Session Metrics Storage

1. **Session Data Model**: Define a data model for storing session metrics that includes all required fields.

2. **Session Identification**: Implement a mechanism for uniquely identifying sessions and associating them with users.

3. **Session History**: Maintain a history of session metrics for each user, with the ability to retrieve recent sessions.

### Lifetime Metrics Storage

1. **Lifetime Data Model**: Define a data model for storing lifetime metrics that includes all required fields.

2. **User Identification**: Implement a mechanism for uniquely identifying users and retrieving their lifetime metrics.

3. **Metrics Updates**: Support efficient updates to lifetime metrics as new session data becomes available.

### Performance Requirements

1. **Storage Efficiency**: The MetricsStorage must efficiently handle data for at least 100,000 users with 1,000 sessions each, as specified in the module's system requirements.

2. **Retrieval Speed**: Data retrieval operations must be optimized for performance to support responsive UI updates.

3. **Reliability**: The storage system must be reliable, with appropriate error handling and recovery mechanisms.

## Implementation Prompt

Implement the MetricsStorage component according to the interface definition and requirements. The implementation should:

1. Provide reliable storage and retrieval of session and lifetime metrics data.

2. Support offline operation with local data storage and synchronization with the server when online.

3. Implement all methods defined in the MetricsStorageInterface, including saveSessionMetrics, saveLifetimeMetrics, and getSessionHistory.

4. Include thorough error handling for storage operations, with appropriate error codes and messages.

5. Optimize storage for efficiency and performance, considering the large volume of data that may need to be stored.

6. Ensure data integrity and prevent data corruption.

7. Include comprehensive comments explaining the implementation details and storage strategies.

8. Ensure the implementation is testable with mock inputs.

9. Use TypeScript for type safety and implement the MetricsStorageInterface as defined in the MetricsSystem module.

## Storage Strategy

### Local Storage

For offline support and performance, the MetricsStorage component should use a combination of:

1. **IndexedDB**: For storing large volumes of session metrics data locally in the browser.

2. **LocalStorage**: For storing smaller, frequently accessed data such as current lifetime metrics.

3. **In-Memory Cache**: For optimizing access to frequently used metrics data.

### Data Synchronization

The MetricsStorage component should implement a synchronization strategy that:

1. Stores metrics data locally during offline operation.

2. Queues data for synchronization with the server when online.

3. Resolves conflicts when local and server data differ.

4. Prioritizes critical data (e.g., lifetime metrics) for synchronization.

### Data Compression

To optimize storage efficiency, the MetricsStorage component should:

1. Compress session history data for long-term storage.

2. Implement data pruning strategies for older, less relevant data.

3. Use efficient data serialization formats.

## Mock Inputs and Expected Outputs

### saveSessionMetrics

**Input:**
```typescript
const sessionId = "session123";
const metrics = {
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
};
```

**Expected Output:**
```typescript
true
```

### saveLifetimeMetrics

**Input:**
```typescript
const userId = "user123";
const metrics = {
  userId: "user123",
  totalSessions: 43,
  totalPoints: 4361.25,
  currentBlinkSpeed: 13750,
  evolution: 0.317,
  firstSessionDate: "2025-01-15T10:00:00Z",
  lastSessionDate: "2025-05-20T10:14:00Z",
  streakDays: 6,
  longestStreakDays: 14
};
```

**Expected Output:**
```typescript
true
```

### getSessionHistory

**Input:**
```typescript
const userId = "user123";
const limit = 3;
```

**Expected Output:**
```typescript
[
  {
    sessionId: "session123",
    totalPoints: 111.25,
    endTime: "2025-05-20T10:14:00Z",
    duration: 240000,
    questionCount: 20
  },
  {
    sessionId: "session122",
    totalPoints: 98.5,
    endTime: "2025-05-19T15:30:00Z",
    duration: 210000,
    questionCount: 18
  },
  {
    sessionId: "session121",
    totalPoints: 105.75,
    endTime: "2025-05-18T09:45:00Z",
    duration: 225000,
    questionCount: 19
  }
]
```

## Validation Criteria

The MetricsStorage implementation must satisfy the following validation criterion:

**MS-004**: MetricsStorage must reliably store and retrieve metrics data.

This criterion will be tested by:
1. Saving session metrics data and verifying it can be retrieved correctly
2. Saving lifetime metrics data and verifying it can be retrieved correctly
3. Retrieving session history and verifying it contains the expected entries
4. Testing storage operations during simulated offline conditions
5. Testing data integrity after simulated app crashes or network interruptions

## Usage Example

```typescript
// Example usage of MetricsStorage
import { MetricsStorage } from './components/MetricsStorage';

// Create metrics storage
const metricsStorage = new MetricsStorage();

// Save session metrics
const sessionMetrics = {
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
};

const sessionSaved = metricsStorage.saveSessionMetrics("session123", sessionMetrics);
console.log(`Session metrics saved: ${sessionSaved}`);

// Save lifetime metrics
const lifetimeMetrics = {
  userId: "user123",
  totalSessions: 43,
  totalPoints: 4361.25,
  currentBlinkSpeed: 13750,
  evolution: 0.317,
  firstSessionDate: "2025-01-15T10:00:00Z",
  lastSessionDate: "2025-05-20T10:14:00Z",
  streakDays: 6,
  longestStreakDays: 14
};

const lifetimeSaved = metricsStorage.saveLifetimeMetrics("user123", lifetimeMetrics);
console.log(`Lifetime metrics saved: ${lifetimeSaved}`);

// Get session history
try {
  const sessionHistory = metricsStorage.getSessionHistory("user123", 5);
  console.log(`Retrieved ${sessionHistory.length} session history entries`);
  
  sessionHistory.forEach((session, index) => {
    console.log(`Session ${index + 1}: ${session.sessionId}`);
    console.log(`  Total Points: ${session.totalPoints}`);
    console.log(`  End Time: ${session.endTime}`);
    console.log(`  Duration: ${session.duration / 1000} seconds`);
    console.log(`  Questions: ${session.questionCount}`);
  });
} catch (error) {
  console.error(`Error retrieving session history: ${error.message}`);
}
```

## Implementation Considerations

1. **Storage Backend**: Consider using IndexedDB for local storage of metrics data, as it provides efficient storage of large amounts of structured data.

2. **Caching Strategy**: Implement a caching strategy to optimize access to frequently used metrics data.

3. **Error Handling**: Implement comprehensive error handling for storage operations, with appropriate error codes and messages.

4. **Offline Support**: Ensure metrics data can be stored locally during offline operation and synchronized with the server when online.

5. **Data Compression**: Consider compressing session history data for long-term storage to optimize storage efficiency.

6. **Data Pruning**: Implement data pruning strategies for older, less relevant data to prevent excessive storage usage.

7. **Synchronization**: Implement a synchronization strategy that resolves conflicts when local and server data differ.

8. **Testing**: Include unit tests for all methods, with particular focus on the validation criterion (MS-004).

9. **Documentation**: Include comprehensive documentation for all methods and storage strategies.

10. **Performance**: Optimize storage operations for performance, especially for large volumes of data.
