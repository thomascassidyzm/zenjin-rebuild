# ProgressTracker Component

## Overview

The ProgressTracker component is a crucial part of the Zenjin Maths App rebuild project. It tracks user progress through learning paths and content mastery, providing data for adaptive difficulty adjustment. This component accurately maintains progress metrics across multiple learning paths, tracks mastery levels for specific content items, and supports the Triple Helix model's adaptive learning approach.

## Files Structure

The implementation consists of three TypeScript files:

1. **ProgressTrackingInterface.ts** - Defines the interfaces and types for the component
2. **ProgressTrackerUtils.ts** - Contains utility functions for calculations
3. **ProgressTracker.ts** - Main implementation of the ProgressTracker component

## Core Functionality

The ProgressTracker component provides the following core functionality:

- Tracking overall user progress across all learning paths
- Monitoring mastery levels for individual content items (stitches)
- Updating progress based on session results
- Providing progress data to support adaptive difficulty adjustment
- Generating detailed progress reports for specific learning paths

## Key Features

### Progress Tracking

- Accurately calculates overall completion percentages across learning paths
- Tracks completion percentage for each learning path independently
- Maintains detailed progress data for each stitch in a path
- Updates path progress based on session results

### Mastery Tracking

- Tracks mastery level (0.0-1.0) for each content item
- Records attempt history and performance metrics
- Calculates next review dates based on mastery level
- Supports mastery level decay over time for unused content

### Adaptive Learning Support

- Provides data to support adaptive difficulty adjustments
- Tracks performance metrics that influence difficulty
- Supports independent difficulty adjustment for each learning path

## Implementation Details

### Mastery Level Calculation

The component calculates mastery levels using a sophisticated formula that considers:
- Correctness ratio (correct answers / total questions)
- Response time (normalized against expected time)
- Consistency across multiple attempts
- Recency of attempts (with decay over time)

### Spaced Repetition Support

The next review date is calculated based on the mastery level, using a spaced repetition algorithm that:
- Increases intervals as mastery improves
- Adds random variation to prevent clustering of reviews
- Adjusts based on performance in learning sessions

### Caching Strategy

To optimize performance, the component implements:
- In-memory caching of frequently accessed progress data
- Efficient data structures for progress tracking
- Optimized retrieval for both quick access and detailed reporting

## Usage Example

```typescript
import { ProgressTracker } from './components/ProgressTracker';
import { SessionResults } from './interfaces/ProgressTrackingInterface';

// Create a new instance of the ProgressTracker
const progressTracker = new ProgressTracker();

// Initialize progress tracking for a new user
progressTracker.initializeUserProgress('user123');

// Get overall progress for a user
const progress = progressTracker.getUserProgress('user123');
console.log(`Overall completion: ${progress.overallCompletion * 100}%`);

// Update progress based on session results
const sessionResults: SessionResults = {
  learningPathId: 'path1',
  stitchId: 'stitch123',
  correctCount: 18,
  totalCount: 20,
  completionTime: 240000
};

const updatedProgress = progressTracker.updateProgress('user123', sessionResults);
```

## Integration Points

The ProgressTracker interfaces with:

1. **TripleHelixManager**: Uses progress data to adapt difficulty and determine rotation of learning paths
2. **SpacedRepetitionSystem**: Uses mastery data to determine appropriate spacing of content reviews
3. **StitchManager**: Provides position information for stitches in learning paths
4. **UserInterface.SessionSummary**: Displays progress information to users after sessions
5. **UserInterface.Dashboard**: Shows overall progress and mastery statistics
6. **LearningEngine.DistinctionManager**: Uses mastery data to adjust boundary levels
7. **MetricsSystem.SessionMetricsManager**: Incorporates progress data into session metrics

## Error Handling

The component includes comprehensive error handling:
- Input validation for all operations
- Clear error codes for troubleshooting
- Proper error propagation to calling components
- Graceful degradation for partial data access

## Performance Considerations

The implementation focuses on performance optimization:
- Efficient data structures for progress tracking
- In-memory caching of frequently accessed data
- Batch updates to minimize database operations
- Optimized calculations for progress metrics

## Future Enhancements

Potential enhancements for future versions:
- Support for more sophisticated adaptive learning algorithms
- Enhanced analytics for learning patterns
- Integration with machine learning for personalized difficulty adjustment
- Performance optimizations for larger scale deployments