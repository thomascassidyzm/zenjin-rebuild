# LifetimeMetricsManager Implementation

This package provides a complete implementation of the LifetimeMetricsManager component for the Zenjin Maths App, as per the requirements specified in the implementation package document.

## Overview

The LifetimeMetricsManager is a core component of the MetricsSystem module that implements the calculation and management of lifetime metrics across all user sessions. It aggregates session metrics into lifetime statistics, calculates the Evolution metric, determines global rankings, and provides comprehensive performance data for long-term user progress tracking.

## Components

### 1. LifetimeMetricsManager.ts

The main component that implements all required functionality:
- Aggregating session metrics into lifetime metrics
- Calculating the Evolution metric
- Tracking user streaks
- Calculating global rankings and percentiles
- Retrieving lists of top-ranked users
- Error handling for all operations

### 2. MetricsStorage.ts

An interface that defines methods for storing and retrieving metrics data:
- Getting and saving lifetime metrics
- Retrieving recent session data
- Getting and saving global rankings
- Retrieving lists of top-ranked users

### 3. InMemoryMetricsStorage.ts

An in-memory implementation of the MetricsStorage interface for testing and development.

### 4. MetricsCalculator.ts

An interface that defines methods for calculating various metrics:
- Evolution metric
- Weighted average blink speed
- Percentile rankings

### 5. BasicMetricsCalculator.ts

A basic implementation of the MetricsCalculator interface.

### 6. LifetimeMetricsManager.test.ts

Unit tests for the LifetimeMetricsManager, focusing on the validation criteria:
- MS-002: Correctly aggregating session metrics into lifetime metrics and calculating Evolution
- MS-003: Correctly calculating global ranking percentile

### 7. UsageExample.ts

A comprehensive example demonstrating how to use the LifetimeMetricsManager in a real application.

## Key Features

1. **Metrics Aggregation**: Aggregates session metrics into lifetime metrics, including totalSessions, totalPoints, and currentBlinkSpeed.

2. **Evolution Calculation**: Calculates the Evolution metric as totalPoints / currentBlinkSpeed.

3. **Streak Tracking**: Tracks user streaks (consecutive days with at least one session) and maintains both current and longest streak records.

4. **Global Ranking**: Calculates global rankings and percentiles based on the Evolution metric or other specified metrics.

5. **Top Users**: Provides lists of top-ranked users based on specified metrics.

6. **Daily Updates**: Supports daily recalculation of global rankings to ensure they remain current.

7. **Comprehensive Error Handling**: Includes appropriate error types and messages for all operations.

8. **Configurability**: Allows customization of various parameters, such as:
   - Number of recent sessions to consider for BlinkSpeed calculation
   - Weights for recent sessions in BlinkSpeed calculation
   - Valid metrics for ranking
   - Default metric for ranking

## Usage

```typescript
// Create dependencies
const metricsStorage = new InMemoryMetricsStorage();
const metricsCalculator = new BasicMetricsCalculator();

// Create LifetimeMetricsManager
const lifetimeMetricsManager = new LifetimeMetricsManager(
  metricsStorage,
  metricsCalculator
);

// Get lifetime metrics for a user
const metrics = lifetimeMetricsManager.getLifetimeMetrics('user123');

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

// Calculate evolution metric
const evolution = lifetimeMetricsManager.calculateEvolution('user123');

// Get global ranking
const ranking = lifetimeMetricsManager.getGlobalRanking('user123');

// Get top-ranked users
const topUsers = lifetimeMetricsManager.getTopRankedUsers(5, 'evolution');
```

## Implementation Considerations

1. **State Management**: In a production environment, the InMemoryMetricsStorage should be replaced with a persistent storage implementation.

2. **Calculation Efficiency**: The implementation uses efficient algorithms for aggregating metrics and calculating rankings.

3. **Precision**: The implementation ensures appropriate precision in calculations, especially for floating-point values.

4. **Timestamp Handling**: The implementation uses ISO date strings for consistent timestamp handling.

5. **Error Handling**: The implementation includes comprehensive error types and messages for all operations.

6. **Testing**: The implementation includes unit tests for all key functionality, with particular focus on the validation criteria.

7. **Documentation**: The implementation includes comprehensive documentation for all methods and data structures.

8. **Extensibility**: The implementation is designed to be extensible, allowing for future enhancements and modifications.

## Future Improvements

Potential future improvements could include:

1. **Persistence**: Implementing a persistent storage solution for metrics data.

2. **Caching**: Adding caching for frequently accessed data to improve performance.

3. **Batch Processing**: Supporting batch updates for more efficient processing of large numbers of sessions.

4. **Additional Metrics**: Adding support for additional metrics and ranking algorithms.

5. **Performance Optimizations**: Further optimizing the implementation for large numbers of users and sessions.
