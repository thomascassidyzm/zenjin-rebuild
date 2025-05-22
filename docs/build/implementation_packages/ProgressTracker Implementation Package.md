# ProgressTracker Implementation Package

## Implementation Goal

Implement the ProgressTracker component for the Zenjin Maths App rebuild project. This component is responsible for tracking user progress through learning paths and content mastery, providing data for adaptive difficulty adjustment. The ProgressTracker must accurately maintain progress metrics across multiple learning paths, track mastery levels for specific content items, and support the Triple Helix model's adaptive learning approach.

## Component Context

The ProgressTracker is a core component of the ProgressionSystem module, which implements the Triple Helix model with three parallel learning paths and the spaced repetition algorithm. The ProgressTracker specifically handles:

1. Tracking overall user progress across all learning paths
2. Monitoring mastery levels for individual content items (stitches)
3. Updating progress based on session results
4. Providing progress data to support adaptive difficulty adjustment
5. Generating detailed progress reports for specific learning paths

This component is critical for the adaptive learning experience, as it maintains the data that drives personalization of content difficulty and learning path progression.

## Interface Definition

The ProgressTracker implements the ProgressTrackingInterface, which defines the following data structures and methods:

### Data Structures

```typescript
/**
 * Represents overall progress data for a user
 */
interface UserProgress {
  /** User identifier */
  userId: string;
  
  /** Overall completion percentage (0.0-1.0) */
  overallCompletion: number;
  
  /** Progress for each learning path */
  pathProgress: {
    [pathId: string]: number; // Completion percentage for the path (0.0-1.0)
  };
  
  /** Number of mastered content items */
  masteredContent: number;
  
  /** Total number of content items */
  totalContent: number;
  
  /** ISO date string of last update */
  lastUpdateDate: string;
}

/**
 * Represents mastery data for a specific content item
 */
interface ContentMastery {
  /** Content identifier */
  contentId: string;
  
  /** Mastery level (0.0-1.0) */
  masteryLevel: number;
  
  /** Number of attempts */
  attemptsCount: number;
  
  /** ISO date string of last attempt */
  lastAttemptDate: string;
  
  /** ISO date string of next scheduled review (optional) */
  nextReviewDate?: string;
}

/**
 * Represents results from a learning session
 */
interface SessionResults {
  /** Learning path identifier */
  learningPathId: string;
  
  /** Stitch identifier */
  stitchId: string;
  
  /** Number of correct answers */
  correctCount: number;
  
  /** Total number of questions */
  totalCount: number;
  
  /** Time taken to complete in milliseconds */
  completionTime: number;
  
  /** ISO date string of session completion (defaults to current time) */
  timestamp?: string;
}

/**
 * Represents detailed progress data for a specific learning path
 */
interface PathProgressDetails {
  /** Overall completion percentage for the path (0.0-1.0) */
  completion: number;
  
  /** Progress for each stitch in the path */
  stitchProgress: {
    [stitchId: string]: {
      /** Mastery level (0.0-1.0) */
      masteryLevel: number;
      
      /** Number of attempts */
      attemptsCount: number;
      
      /** Current position in the queue */
      position: number;
    }
  };
  
  /** ISO date string of last update */
  lastUpdateDate: string;
}
```

### Methods

```typescript
/**
 * Interface for the ProgressTracker component
 */
interface ProgressTrackingInterface {
  /**
   * Gets overall progress data for a user
   * @param userId - User identifier
   * @returns User progress data
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws NO_PROGRESS_DATA if no progress data exists for this user
   */
  getUserProgress(userId: string): UserProgress;
  
  /**
   * Updates progress based on session results
   * @param userId - User identifier
   * @param sessionResults - Results from the learning session
   * @returns Updated user progress data
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws INVALID_SESSION_RESULTS if the session results are invalid
   * @throws UPDATE_FAILED if failed to update progress
   */
  updateProgress(userId: string, sessionResults: SessionResults): UserProgress;
  
  /**
   * Gets mastery data for specific content
   * @param userId - User identifier
   * @param contentId - Content identifier
   * @returns Content mastery data
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws CONTENT_NOT_FOUND if the specified content was not found
   * @throws NO_MASTERY_DATA if no mastery data exists for this content
   */
  getContentMastery(userId: string, contentId: string): ContentMastery;
  
  /**
   * Gets detailed progress data for a specific learning path
   * @param userId - User identifier
   * @param learningPathId - Learning path identifier
   * @returns Detailed path progress data
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws LEARNING_PATH_NOT_FOUND if the specified learning path was not found
   * @throws NO_PROGRESS_DATA if no progress data exists for this path
   */
  getPathProgress(userId: string, learningPathId: string): PathProgressDetails;
  
  /**
   * Initializes progress tracking for a new user
   * @param userId - User identifier
   * @returns Whether the initialization was successful
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws ALREADY_INITIALIZED if progress tracking already initialized for this user
   * @throws INITIALIZATION_FAILED if failed to initialize progress tracking
   */
  initializeUserProgress(userId: string): boolean;
}
```

## Module Context

The ProgressTracker is part of the ProgressionSystem module, which implements the Triple Helix model with three parallel learning paths and the spaced repetition algorithm. Within this module, the ProgressTracker interacts with:

1. **TripleHelixManager**: Uses progress data to adapt difficulty and determine rotation of learning paths
2. **SpacedRepetitionSystem**: Uses mastery data to determine appropriate spacing of content reviews
3. **StitchManager**: Provides position information for stitches in learning paths

The ProgressTracker does not have direct dependencies on other interfaces, but its data is used by multiple components across the system:

- **UserInterface.SessionSummary**: Displays progress information to users after sessions
- **UserInterface.Dashboard**: Shows overall progress and mastery statistics
- **LearningEngine.DistinctionManager**: Uses mastery data to adjust boundary levels
- **MetricsSystem.SessionMetricsManager**: Incorporates progress data into session metrics

## Implementation Requirements

### Progress Tracking Requirements

1. **Overall Progress Tracking**:
   - Track completion percentage across all learning paths
   - Maintain counts of mastered vs. total content items
   - Update overall progress when individual path progress changes
   - Ensure progress calculations are accurate and consistent

2. **Learning Path Progress Tracking**:
   - Track completion percentage for each learning path independently
   - Maintain detailed progress data for each stitch in a path
   - Update path progress based on session results
   - Support retrieval of detailed path progress data

3. **Content Mastery Tracking**:
   - Track mastery level (0.0-1.0) for each content item
   - Record attempt history and performance metrics
   - Calculate next review dates based on mastery level
   - Support mastery level decay over time for unused content

4. **Adaptive Difficulty Support**:
   - Provide data to support adaptive difficulty adjustments
   - Track performance metrics that influence difficulty
   - Support independent difficulty adjustment for each learning path

### Performance Requirements

1. **Efficiency**:
   - Retrieve progress data with minimal latency (<50ms)
   - Update progress data efficiently after session completion
   - Optimize storage and retrieval of progress data
   - Support concurrent access from multiple system components

2. **Scalability**:
   - Handle progress data for at least 100,000 concurrent users
   - Support tracking of large numbers of content items per user
   - Maintain performance as user progress history grows

3. **Reliability**:
   - Ensure data consistency during updates
   - Implement error handling for all operations
   - Prevent data loss during concurrent operations
   - Support recovery from failed operations

### Data Management Requirements

1. **Storage Strategy**:
   - Use efficient data structures for progress tracking
   - Implement caching for frequently accessed progress data
   - Support persistence of progress data
   - Optimize for both read and write operations

2. **Data Integrity**:
   - Validate all inputs before processing
   - Ensure atomic updates to prevent partial progress changes
   - Implement data consistency checks
   - Support data recovery mechanisms

## Mock Inputs and Expected Outputs

### getUserProgress

**Input:**
```typescript
{
  userId: 'user123'
}
```

**Expected Output:**
```typescript
{
  userId: 'user123',
  overallCompletion: 0.35,
  pathProgress: {
    'path1': 0.42,
    'path2': 0.28,
    'path3': 0.35
  },
  masteredContent: 28,
  totalContent: 80,
  lastUpdateDate: '2025-05-20T14:30:00Z'
}
```

### updateProgress

**Input:**
```typescript
{
  userId: 'user123',
  sessionResults: {
    learningPathId: 'path1',
    stitchId: 'stitch123',
    correctCount: 18,
    totalCount: 20,
    completionTime: 240000
  }
}
```

**Expected Output:**
```typescript
{
  userId: 'user123',
  overallCompletion: 0.36,
  pathProgress: {
    'path1': 0.44,
    'path2': 0.28,
    'path3': 0.35
  },
  masteredContent: 29,
  totalContent: 80,
  lastUpdateDate: '2025-05-20T15:10:00Z'
}
```

### getContentMastery

**Input:**
```typescript
{
  userId: 'user123',
  contentId: 'stitch123'
}
```

**Expected Output:**
```typescript
{
  contentId: 'stitch123',
  masteryLevel: 0.9,
  attemptsCount: 3,
  lastAttemptDate: '2025-05-18T15:10:00Z',
  nextReviewDate: '2025-05-25T15:10:00Z'
}
```

### getPathProgress

**Input:**
```typescript
{
  userId: 'user123',
  learningPathId: 'path1'
}
```

**Expected Output:**
```typescript
{
  completion: 0.44,
  stitchProgress: {
    'stitch123': {
      masteryLevel: 0.9,
      attemptsCount: 3,
      position: 42
    },
    'stitch124': {
      masteryLevel: 0.7,
      attemptsCount: 2,
      position: 12
    },
    'stitch125': {
      masteryLevel: 0.3,
      attemptsCount: 1,
      position: 5
    }
  },
  lastUpdateDate: '2025-05-20T15:10:00Z'
}
```

### initializeUserProgress

**Input:**
```typescript
{
  userId: 'user456'
}
```

**Expected Output:**
```typescript
true
```

## Validation Criteria

The ProgressTracker implementation must satisfy the following validation criteria:

### PS-003: Progress Tracking Accuracy

The ProgressTracker must accurately track and update user progress based on session results. This includes:

1. Correctly calculating overall completion percentages
2. Accurately tracking mastery levels for individual content items
3. Properly updating progress data based on session results
4. Maintaining consistency between overall progress and path-specific progress
5. Supporting the retrieval of detailed progress data for specific learning paths

## Implementation Notes

### Progress Calculation Strategy

The implementation should use the following strategies for calculating progress:

1. **Overall Completion**: Weighted average of path completion percentages, with weights based on the importance of each path in the curriculum.

2. **Path Completion**: Calculated as the percentage of stitches in the path that have reached a mastery level of at least 0.8 (80%).

3. **Mastery Level**: Calculated using a formula that considers:
   - Correctness ratio (correct answers / total questions)
   - Response time (normalized against expected time)
   - Consistency across multiple attempts
   - Recency of attempts (with decay over time)

### Mastery Level Formula

```typescript
function calculateMasteryLevel(
  correctRatio: number,
  responseTime: number,
  expectedTime: number,
  previousMastery: number,
  daysSinceLastAttempt: number
): number {
  // Calculate time factor (1.0 for responses faster than expected, decreasing for slower responses)
  const timeFactor = Math.min(1.0, expectedTime / responseTime);
  
  // Calculate current attempt mastery
  const currentAttemptMastery = correctRatio * timeFactor;
  
  // Apply decay to previous mastery based on time since last attempt
  const decayFactor = Math.exp(-0.05 * daysSinceLastAttempt);
  const decayedPreviousMastery = previousMastery * decayFactor;
  
  // Weighted average of previous mastery and current attempt mastery
  // Weight of current attempt increases with more attempts
  const currentAttemptWeight = 0.3;
  const previousMasteryWeight = 0.7;
  
  return (currentAttemptMastery * currentAttemptWeight) + 
         (decayedPreviousMastery * previousMasteryWeight);
}
```

### Next Review Date Calculation

The next review date should be calculated based on the mastery level, using a spaced repetition algorithm:

```typescript
function calculateNextReviewDate(
  masteryLevel: number,
  lastAttemptDate: Date
): Date {
  // Base interval in days, increases with mastery level
  const baseInterval = Math.pow(masteryLevel * 5, 2);
  
  // Add random variation (±10%) to prevent clustering of reviews
  const variationFactor = 0.9 + (Math.random() * 0.2);
  const interval = baseInterval * variationFactor;
  
  // Calculate next review date
  const nextReviewDate = new Date(lastAttemptDate);
  nextReviewDate.setDate(nextReviewDate.getDate() + Math.ceil(interval));
  
  return nextReviewDate;
}
```

### Data Storage Considerations

The implementation should consider the following for efficient data storage:

1. **In-Memory Cache**: Maintain a cache of recently accessed progress data to minimize database queries.

2. **Batch Updates**: Group progress updates to minimize database write operations.

3. **Denormalized Storage**: Store pre-calculated progress metrics to avoid expensive calculations during retrieval.

4. **Incremental Updates**: Update only the affected portions of progress data rather than rewriting entire records.

### Error Handling Strategy

The implementation should include comprehensive error handling:

1. **Input Validation**: Validate all inputs before processing to prevent invalid data.

2. **Graceful Degradation**: Return partial progress data when complete data is unavailable.

3. **Retry Mechanism**: Implement retries for failed storage operations.

4. **Logging**: Log all errors with sufficient context for debugging.

5. **Error Propagation**: Properly propagate errors to calling components with clear error codes.

## Usage Example

```typescript
import { ProgressTracker } from './components/ProgressTracker';
import { SessionResults, UserProgress, ContentMastery, PathProgressDetails } from './interfaces/ProgressTrackingInterface';

// Create a new instance of the ProgressTracker
const progressTracker = new ProgressTracker();

// Initialize progress tracking for a new user
try {
  const initialized = progressTracker.initializeUserProgress('user123');
  console.log(`User progress initialized: ${initialized}`);
} catch (error) {
  console.error(`Failed to initialize user progress: ${error.message}`);
}

// Get overall progress for a user
try {
  const progress: UserProgress = progressTracker.getUserProgress('user123');
  console.log(`Overall completion: ${progress.overallCompletion * 100}%`);
  console.log(`Mastered content: ${progress.masteredContent}/${progress.totalContent}`);
  
  // Display progress for each learning path
  Object.entries(progress.pathProgress).forEach(([pathId, completion]) => {
    console.log(`Path ${pathId} completion: ${completion * 100}%`);
  });
} catch (error) {
  console.error(`Failed to get user progress: ${error.message}`);
}

// Update progress based on session results
try {
  const sessionResults: SessionResults = {
    learningPathId: 'path1',
    stitchId: 'stitch123',
    correctCount: 18,
    totalCount: 20,
    completionTime: 240000,
    timestamp: new Date().toISOString()
  };
  
  const updatedProgress: UserProgress = progressTracker.updateProgress('user123', sessionResults);
  console.log(`Updated overall completion: ${updatedProgress.overallCompletion * 100}%`);
  console.log(`Updated path completion: ${updatedProgress.pathProgress['path1'] * 100}%`);
} catch (error) {
  console.error(`Failed to update progress: ${error.message}`);
}

// Get mastery data for specific content
try {
  const mastery: ContentMastery = progressTracker.getContentMastery('user123', 'stitch123');
  console.log(`Mastery level: ${mastery.masteryLevel * 100}%`);
  console.log(`Attempts: ${mastery.attemptsCount}`);
  console.log(`Next review: ${mastery.nextReviewDate}`);
} catch (error) {
  console.error(`Failed to get content mastery: ${error.message}`);
}

// Get detailed progress for a learning path
try {
  const pathProgress: PathProgressDetails = progressTracker.getPathProgress('user123', 'path1');
  console.log(`Path completion: ${pathProgress.completion * 100}%`);
  
  // Display progress for each stitch in the path
  const stitchCount = Object.keys(pathProgress.stitchProgress).length;
  console.log(`Stitches with progress: ${stitchCount}`);
  
  // Find stitches with high mastery
  const masteredStitches = Object.entries(pathProgress.stitchProgress)
    .filter(([_, data]) => data.masteryLevel >= 0.8)
    .map(([stitchId, _]) => stitchId);
  
  console.log(`Mastered stitches: ${masteredStitches.join(', ')}`);
} catch (error) {
  console.error(`Failed to get path progress: ${error.message}`);
}
```

This implementation package provides a comprehensive guide for implementing the ProgressTracker component, which is responsible for tracking user progress through learning paths and content mastery in the Zenjin Maths App. The component plays a critical role in supporting the adaptive learning experience by maintaining the data that drives personalization of content difficulty and learning path progression.
