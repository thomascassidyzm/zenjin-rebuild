# LifetimeMetricsManager Implementation Package

## Implementation Goal

Create a LifetimeMetricsManager component that calculates and manages lifetime metrics across all user sessions in the Zenjin Maths App. This component will aggregate session metrics into lifetime statistics, calculate the Evolution metric, determine global rankings, and provide comprehensive performance data for long-term user progress tracking.

## Component Context

The LifetimeMetricsManager is a core component of the MetricsSystem module that implements the calculation and management of lifetime metrics across all user sessions. It plays a critical role in:

1. Aggregating session metrics into lifetime statistics
2. Calculating the Evolution metric (Total Points / Blink Speed)
3. Determining global rankings and percentiles
4. Tracking user streaks and long-term progress
5. Providing data for the Dashboard UI component

This component is essential for motivating users through long-term progress tracking and social comparison, which are key engagement drivers in the Zenjin Maths App's learning approach.

## Interface Definition

### Data Structures

```typescript
/**
 * Lifetime metrics for a user across all sessions
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
  
  /** Current streak in days (optional, defaults to 0) */
  streakDays?: number;
  
  /** Longest streak in days (optional, defaults to 0) */
  longestStreakDays?: number;
}

/**
 * Global ranking information for a user
 */
interface GlobalRanking {
  /** User identifier */
  userId: string;
  
  /** Percentile ranking (0-100) */
  percentile: number;
  
  /** Numerical rank */
  rank: number;
  
  /** Total number of users */
  totalUsers: number;
  
  /** ISO date string of ranking calculation */
  calculationDate: string;
  
  /** Metric used for ranking (optional, defaults to 'evolution') */
  metric?: string;
}

/**
 * Session summary data for updating lifetime metrics
 */
interface SessionSummary {
  /** Session identifier */
  sessionId: string;
  
  /** First-time correct points */
  ftcPoints: number;
  
  /** Eventually correct points */
  ecPoints: number;
  
  /** Base points */
  basePoints: number;
  
  /** Bonus multiplier */
  bonusMultiplier: number;
  
  /** Blink speed in milliseconds */
  blinkSpeed: number;
  
  /** Total points */
  totalPoints: number;
}

/**
 * Top-ranked user information
 */
interface RankedUser {
  /** User identifier */
  userId: string;
  
  /** Numerical rank */
  rank: number;
  
  /** Value of the ranking metric */
  metricValue: number;
}
```

### Methods

```typescript
/**
 * Gets lifetime metrics for a user
 * @param userId - User identifier
 * @returns Lifetime metrics for the user
 * @throws USER_NOT_FOUND if the specified user was not found
 * @throws NO_METRICS_DATA if no metrics data exists for this user
 */
function getLifetimeMetrics(userId: string): LifetimeMetrics;

/**
 * Updates lifetime metrics based on session results
 * @param userId - User identifier
 * @param sessionSummary - Session summary data
 * @returns Updated lifetime metrics
 * @throws USER_NOT_FOUND if the specified user was not found
 * @throws INVALID_SESSION_SUMMARY if the session summary is invalid
 * @throws UPDATE_FAILED if failed to update lifetime metrics
 */
function updateLifetimeMetrics(userId: string, sessionSummary: SessionSummary): LifetimeMetrics;

/**
 * Calculates the Evolution metric for a user
 * @param userId - User identifier
 * @returns Evolution metric value
 * @throws USER_NOT_FOUND if the specified user was not found
 * @throws NO_METRICS_DATA if no metrics data exists for this user
 * @throws CALCULATION_FAILED if failed to calculate Evolution metric
 */
function calculateEvolution(userId: string): number;

/**
 * Gets global ranking information for a user
 * @param userId - User identifier
 * @returns Global ranking information
 * @throws USER_NOT_FOUND if the specified user was not found
 * @throws NO_RANKING_DATA if no ranking data exists for this user
 */
function getGlobalRanking(userId: string): GlobalRanking;

/**
 * Gets a list of top-ranked users
 * @param limit - Maximum number of users to return (optional, defaults to 10)
 * @param metric - Metric to rank by (optional, defaults to 'evolution')
 * @returns Array of top-ranked users
 * @throws INVALID_LIMIT if the specified limit is invalid
 * @throws INVALID_METRIC if the specified metric is invalid
 */
function getTopRankedUsers(limit?: number, metric?: string): RankedUser[];
```

## Module Context

The LifetimeMetricsManager is a component of the MetricsSystem module, which calculates and manages session and lifetime metrics including FTCPoints, ECPoints, BasePoints, BonusMultipliers, BlinkSpeed, TotalPoints, Evolution, and GlobalRanking.

### Module Purpose

The MetricsSystem module is responsible for tracking, calculating, and storing all performance metrics in the Zenjin Maths App. It provides the data needed for the user interface to display progress and achievements, and for the ProgressionSystem to make decisions about learning path progression.

### Component Relationships

The LifetimeMetricsManager has the following relationships with other components:

1. **SessionMetricsManager**: The LifetimeMetricsManager depends on the SessionMetricsManager for session summary data, which it aggregates into lifetime metrics.

2. **MetricsCalculator**: The LifetimeMetricsManager depends on the MetricsCalculator for performing the actual calculations of metrics based on aggregated data.

3. **MetricsStorage**: The LifetimeMetricsManager depends on the MetricsStorage for persisting lifetime metrics and global rankings.

4. **UserInterface.Dashboard**: The LifetimeMetricsManager provides lifetime metrics and global ranking data to the Dashboard component for visualization and display.

## Implementation Requirements

### Lifetime Metrics Management

1. **Metrics Aggregation**: Implement the logic for aggregating session metrics into lifetime metrics, including totalSessions, totalPoints, and currentBlinkSpeed.

2. **Evolution Calculation**: Implement the calculation of the Evolution metric as totalPoints / currentBlinkSpeed.

3. **Streak Tracking**: Track user streaks (consecutive days with at least one session) and maintain both current and longest streak records.

4. **Historical Data**: Maintain historical data such as firstSessionDate and lastSessionDate.

### Global Ranking

1. **Ranking Calculation**: Implement the logic for calculating global rankings based on the Evolution metric or other specified metrics.

2. **Percentile Calculation**: Calculate percentile rankings based on a user's position relative to all users.

3. **Top Users**: Provide the ability to retrieve lists of top-ranked users based on specified metrics.

4. **Daily Updates**: Support daily recalculation of global rankings to ensure they remain current.

### Performance Requirements

1. **Efficiency**: The LifetimeMetricsManager must efficiently handle operations on large numbers of users and sessions. Aggregation and ranking operations should be optimized for performance.

2. **Scalability**: The implementation must scale to handle at least 10,000 concurrent users, as specified in the module's system requirements.

3. **Responsiveness**: Lifetime metrics operations must complete within 200ms to ensure smooth user experience, as specified in the module's performance requirements.

## Implementation Prompt

Implement the LifetimeMetricsManager component according to the interface definition and requirements. The implementation should:

1. Aggregate session metrics into lifetime metrics, including totalSessions, totalPoints, and currentBlinkSpeed.

2. Calculate the Evolution metric as totalPoints / currentBlinkSpeed.

3. Track user streaks and maintain both current and longest streak records.

4. Calculate global rankings and percentiles based on the Evolution metric or other specified metrics.

5. Provide the ability to retrieve lists of top-ranked users.

6. Support daily recalculation of global rankings.

7. Include comprehensive error handling for all methods, with appropriate error codes and messages.

8. Include thorough documentation for all methods and data structures.

9. Include unit tests for all methods, with particular focus on the validation criteria (MS-002 and MS-003).

## Calculation Formulas

### Evolution
```
Evolution = TotalPoints / CurrentBlinkSpeed
```

Where:
- TotalPoints is the cumulative points across all sessions
- CurrentBlinkSpeed is the user's current BlinkSpeed performance in milliseconds

The Evolution metric represents the user's overall learning efficiency, with higher values indicating better performance.

### CurrentBlinkSpeed
```
CurrentBlinkSpeed = WeightedAverage(SessionBlinkSpeeds)
```

Where:
- SessionBlinkSpeeds are the BlinkSpeed values from the user's recent sessions
- WeightedAverage gives more weight to recent sessions

This ensures that the CurrentBlinkSpeed reflects the user's recent performance while still considering historical data.

### Percentile Ranking
```
Percentile = (1 - (Rank / TotalUsers)) * 100
```

Where:
- Rank is the user's numerical rank (1 being the highest)
- TotalUsers is the total number of users with metrics data

This formula converts a numerical rank into a percentile, where higher percentiles indicate better performance relative to other users.

### Streak Calculation
```
If (CurrentDate - LastSessionDate) <= 1 day:
    CurrentStreak += 1
Else:
    CurrentStreak = 0

LongestStreak = max(LongestStreak, CurrentStreak)
```

This formula tracks consecutive days with at least one session and maintains the longest streak record.

## Mock Inputs and Expected Outputs

### getLifetimeMetrics

**Input:**
```typescript
const userId = "user123";
```

**Expected Output:**
```typescript
{
  userId: "user123",
  totalSessions: 42,
  totalPoints: 4250,
  currentBlinkSpeed: 12500,
  evolution: 0.34,
  firstSessionDate: "2025-01-15T10:00:00Z",
  lastSessionDate: "2025-05-17T15:30:00Z",
  streakDays: 5,
  longestStreakDays: 14
}
```

### updateLifetimeMetrics

**Input:**
```typescript
const userId = "user123";
const sessionSummary = {
  sessionId: "session123",
  ftcPoints: 80,
  ecPoints: 9,
  basePoints: 89,
  bonusMultiplier: 1.25,
  blinkSpeed: 15000,
  totalPoints: 111.25
};
```

**Expected Output:**
```typescript
{
  userId: "user123",
  totalSessions: 43,
  totalPoints: 4361.25,
  currentBlinkSpeed: 13750,
  evolution: 0.317,
  firstSessionDate: "2025-01-15T10:00:00Z",
  lastSessionDate: "2025-05-18T15:30:00Z",
  streakDays: 6,
  longestStreakDays: 14
}
```

### calculateEvolution

**Input:**
```typescript
const userId = "user123";
```

**Expected Output:**
```typescript
0.317
```

### getGlobalRanking

**Input:**
```typescript
const userId = "user123";
```

**Expected Output:**
```typescript
{
  userId: "user123",
  percentile: 85,
  rank: 1250,
  totalUsers: 8500,
  calculationDate: "2025-05-18T00:00:00Z",
  metric: "evolution"
}
```

### getTopRankedUsers

**Input:**
```typescript
const limit = 3;
const metric = "evolution";
```

**Expected Output:**
```typescript
[
  {
    userId: "user456",
    rank: 1,
    metricValue: 0.85
  },
  {
    userId: "user789",
    rank: 2,
    metricValue: 0.72
  },
  {
    userId: "user234",
    rank: 3,
    metricValue: 0.68
  }
]
```

## Validation Criteria

The LifetimeMetricsManager implementation must satisfy the following validation criteria:

**MS-002**: LifetimeMetricsManager must correctly aggregate session metrics into lifetime metrics and calculate Evolution.

This criterion will be tested by:
1. Creating a user with multiple session summaries
2. Updating lifetime metrics with each session summary
3. Verifying that the aggregated metrics (totalSessions, totalPoints, currentBlinkSpeed) are correctly calculated
4. Verifying that the Evolution metric is correctly calculated as totalPoints / currentBlinkSpeed

**MS-003**: LifetimeMetricsManager must correctly calculate global ranking percentile.

This criterion will be tested by:
1. Creating multiple users with different Evolution metrics
2. Calculating global rankings for all users
3. Verifying that the percentile rankings are correctly calculated based on the formula (1 - (Rank / TotalUsers)) * 100
4. Verifying that the numerical ranks are correctly assigned based on the Evolution metric

## Usage Example

```typescript
// Example usage of LifetimeMetricsManager
import { LifetimeMetricsManager } from './components/LifetimeMetricsManager';

// Create lifetime metrics manager
const lifetimeMetricsManager = new LifetimeMetricsManager();

// Get lifetime metrics for a user
const metrics = lifetimeMetricsManager.getLifetimeMetrics('user123');
console.log(`Total sessions: ${metrics.totalSessions}`);
console.log(`Total points: ${metrics.totalPoints}`);
console.log(`Current blink speed: ${metrics.currentBlinkSpeed} ms`);
console.log(`Evolution: ${metrics.evolution}`);
console.log(`Current streak: ${metrics.streakDays} days`);
console.log(`Longest streak: ${metrics.longestStreakDays} days`);

// Update lifetime metrics based on session results
const updatedMetrics = lifetimeMetricsManager.updateLifetimeMetrics('user123', {
  sessionId: 'session123',
  ftcPoints: 80,
  ecPoints: 9,
  basePoints: 89,
  bonusMultiplier: 1.25,
  blinkSpeed: 15000,
  totalPoints: 111.25
});

console.log(`Updated total sessions: ${updatedMetrics.totalSessions}`);
console.log(`Updated total points: ${updatedMetrics.totalPoints}`);
console.log(`Updated current blink speed: ${updatedMetrics.currentBlinkSpeed} ms`);
console.log(`Updated evolution: ${updatedMetrics.evolution}`);
console.log(`Updated streak: ${updatedMetrics.streakDays} days`);

// Calculate evolution metric
const evolution = lifetimeMetricsManager.calculateEvolution('user123');
console.log(`Evolution: ${evolution}`);

// Get global ranking
const ranking = lifetimeMetricsManager.getGlobalRanking('user123');
console.log(`Percentile: ${ranking.percentile}%`);
console.log(`Rank: ${ranking.rank} of ${ranking.totalUsers}`);
console.log(`Calculation date: ${ranking.calculationDate}`);

// Get top-ranked users
const topUsers = lifetimeMetricsManager.getTopRankedUsers(5, 'evolution');
console.log('Top 5 users by evolution:');
topUsers.forEach((user, index) => {
  console.log(`#${user.rank}: User ${user.userId} - Evolution: ${user.metricValue}`);
});
```

## Implementation Considerations

1. **State Management**: Consider using a database or persistent storage for lifetime metrics and global rankings, as they need to be maintained across sessions and app restarts.

2. **Calculation Efficiency**: Implement efficient algorithms for aggregating metrics and calculating rankings, especially when dealing with large numbers of users.

3. **Precision**: Ensure appropriate precision in calculations, especially for floating-point values like evolution and percentiles.

4. **Timestamp Handling**: Use consistent timestamp handling throughout the implementation, preferably using ISO date strings.

5. **Error Handling**: Implement comprehensive error handling for all methods, with appropriate error codes and messages.

6. **Testing**: Include unit tests for all methods, with particular focus on the validation criteria (MS-002 and MS-003).

7. **Documentation**: Include comprehensive documentation for all methods and data structures.

8. **Performance**: Ensure that the implementation can handle operations on large numbers of users efficiently.

9. **Memory Management**: Consider memory usage, especially when calculating global rankings for large user bases.

10. **Extensibility**: Design the implementation to be extensible, allowing for future enhancements and modifications to the metrics calculations and ranking algorithms.
