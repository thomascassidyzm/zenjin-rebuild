# StitchManager Implementation Package

## Implementation Goal

Create a StitchManager component that manages stitches (learning units) within learning paths, implementing the "positions as first class citizens" principle where positions in the learning path tubes exist independently and stitches are assigned to them. This component is responsible for organizing, retrieving, and repositioning stitches within the Triple Helix learning model.

## Component Context

The StitchManager is a core component of the ProgressionSystem module that implements the fundamental data structures and operations for the Triple Helix learning model. It treats positions within learning paths as first-class citizens, ensuring that:

1. Each position in a learning path can only be occupied by one stitch at a time
2. Positions exist independently of stitches
3. Stitches are assigned to positions (not vice versa)
4. The integrity of the position-based system is maintained during operations

This architectural principle is essential for the proper functioning of the spaced repetition algorithm, which relies on the ability to shift stitches between positions while maintaining the integrity of the learning path structure.

## Interface Definition

### Data Structures

```typescript
/**
 * Represents a stitch (learning unit) within a learning path
 */
interface Stitch {
  /** Unique identifier for the stitch */
  id: string;
  
  /** Name of the stitch */
  name: string;
  
  /** Description of the stitch (optional) */
  description?: string;
  
  /** ID of the learning path this stitch belongs to */
  learningPathId: string;
  
  /** Position in the learning path queue */
  position: number;
  
  /** Difficulty level of the stitch (1-5) */
  difficulty: number;
  
  /** IDs of mathematical facts covered in this stitch */
  factIds: string[];
  
  /** IDs of prerequisite stitches (optional) */
  prerequisites?: string[];
  
  /** Additional metadata for the stitch (optional) */
  metadata?: Record<string, any>;
}

/**
 * Represents a user's progress on a specific stitch
 */
interface StitchProgress {
  /** User identifier */
  userId: string;
  
  /** Stitch identifier */
  stitchId: string;
  
  /** Number of times the stitch has been completed */
  completionCount: number;
  
  /** Number of correct answers */
  correctCount: number;
  
  /** Total number of questions attempted */
  totalCount: number;
  
  /** Mastery level (0.0-1.0) */
  masteryLevel: number;
  
  /** ISO date string of last attempt (optional) */
  lastAttemptDate?: string;
}

/**
 * Session results for updating stitch progress
 */
interface SessionResults {
  /** Number of correct answers in the session */
  correctCount: number;
  
  /** Total number of questions in the session */
  totalCount: number;
  
  /** Time taken to complete the session in milliseconds */
  completionTime: number;
}

/**
 * Performance data for repositioning a stitch
 */
interface PerformanceData {
  /** Number of correct answers */
  correctCount: number;
  
  /** Total number of questions */
  totalCount: number;
  
  /** Average response time in milliseconds */
  averageResponseTime: number;
}

/**
 * Result of a stitch repositioning operation
 */
interface RepositionResult {
  /** Previous position in the queue */
  previousPosition: number;
  
  /** New position in the queue */
  newPosition: number;
  
  /** Skip number used for repositioning */
  skipNumber: number;
}
```

### Methods

```typescript
/**
 * Gets a stitch by its identifier
 * @param stitchId - Stitch identifier
 * @returns The stitch
 * @throws STITCH_NOT_FOUND if the specified stitch was not found
 */
function getStitchById(stitchId: string): Stitch;

/**
 * Gets all stitches for a specific learning path
 * @param learningPathId - Learning path identifier
 * @returns Array of stitches in the learning path
 * @throws LEARNING_PATH_NOT_FOUND if the specified learning path was not found
 */
function getStitchesByLearningPath(learningPathId: string): Stitch[];

/**
 * Gets progress data for a specific stitch and user
 * @param userId - User identifier
 * @param stitchId - Stitch identifier
 * @returns Stitch progress data
 * @throws USER_NOT_FOUND if the specified user was not found
 * @throws STITCH_NOT_FOUND if the specified stitch was not found
 * @throws NO_PROGRESS_DATA if no progress data exists for this user and stitch
 */
function getStitchProgress(userId: string, stitchId: string): StitchProgress;

/**
 * Updates progress data for a specific stitch and user
 * @param userId - User identifier
 * @param stitchId - Stitch identifier
 * @param sessionResults - Results from the learning session
 * @returns Updated stitch progress data
 * @throws USER_NOT_FOUND if the specified user was not found
 * @throws STITCH_NOT_FOUND if the specified stitch was not found
 * @throws INVALID_SESSION_RESULTS if the session results are invalid
 */
function updateStitchProgress(
  userId: string,
  stitchId: string,
  sessionResults: SessionResults
): StitchProgress;

/**
 * Repositions a stitch within its learning path based on the Stitch Repositioning Algorithm
 * @param userId - User identifier
 * @param stitchId - Stitch identifier
 * @param performance - Performance data for repositioning
 * @returns Result of the repositioning operation
 * @throws USER_NOT_FOUND if the specified user was not found
 * @throws STITCH_NOT_FOUND if the specified stitch was not found
 * @throws INVALID_PERFORMANCE_DATA if the performance data is invalid
 * @throws REPOSITIONING_FAILED if failed to reposition the stitch
 */
function repositionStitch(
  userId: string,
  stitchId: string,
  performance: PerformanceData
): RepositionResult;

/**
 * Gets the next stitch to present to the user in a learning path
 * @param userId - User identifier
 * @param learningPathId - Learning path identifier
 * @returns The next stitch to present
 * @throws USER_NOT_FOUND if the specified user was not found
 * @throws LEARNING_PATH_NOT_FOUND if the specified learning path was not found
 * @throws NO_STITCHES_AVAILABLE if no stitches available in the learning path
 */
function getNextStitch(userId: string, learningPathId: string): Stitch;
```

## Module Context

The StitchManager is a component of the ProgressionSystem module, which implements the Triple Helix model with three parallel learning paths and the spaced repetition algorithm for optimizing cognitive resource usage and ensuring effective learning progression.

### Module Purpose

The ProgressionSystem module encompasses the Triple Helix learning model, spaced repetition algorithm, and progress tracking. It is responsible for managing the rotation between learning paths, determining which content to present next, and tracking overall learning progress.

### Component Relationships

The StitchManager has the following relationships with other components:

1. **SpacedRepetitionSystem**: Depends on the StitchManager for accessing and manipulating stitches within learning paths. The StitchManager provides the underlying data structures and operations that the SpacedRepetitionSystem uses to implement the Stitch Repositioning Algorithm.

2. **TripleHelixManager**: Depends on the StitchManager for managing stitches within the three parallel learning paths. The StitchManager ensures that each position in each learning path can only be occupied by one stitch at a time.

3. **ProgressTracker**: Interacts with the StitchManager to track user progress through learning paths and content mastery.

## Implementation Requirements

### Position Management

1. **Positions as First-Class Citizens**: Implement the data structures and operations to ensure that positions in learning paths exist independently and stitches are assigned to positions, not vice versa.

2. **Position Integrity**: Ensure that each position in a learning path can only be occupied by one stitch at a time. When repositioning stitches, maintain the integrity of the position-based system.

3. **Position Shifting**: Implement the logic for shifting stitches between positions according to the Stitch Repositioning Algorithm. When a stitch is repositioned, all stitches in positions 1 through [skip number] shift down one position, creating a vacant slot at the position equal to the stitch's skip number.

### Stitch Management

1. **Stitch Retrieval**: Implement efficient methods for retrieving stitches by ID and learning path.

2. **Stitch Progress Tracking**: Track and update user progress on specific stitches, including completion count, correct answers, and mastery level.

3. **Next Stitch Determination**: Implement the logic for determining the next stitch to present to the user in a learning path, based on the current state of the learning path and user progress.

### Performance Requirements

1. **Efficiency**: The StitchManager must efficiently handle operations on large numbers of stitches and users. Retrieval and repositioning operations should be optimized for performance.

2. **Scalability**: The implementation must scale to handle at least 100,000 concurrent users, as specified in the module's system requirements.

3. **Responsiveness**: Learning path operations must complete within 100ms to ensure smooth transitions, as specified in the module's performance requirements.

## Implementation Prompt

Implement the StitchManager component according to the interface definition and requirements. The implementation should:

1. Treat positions in learning paths as first-class citizens, ensuring that positions exist independently and stitches are assigned to positions.

2. Provide efficient methods for retrieving, updating, and repositioning stitches within learning paths.

3. Implement the logic for determining the next stitch to present to the user in a learning path.

4. Track and update user progress on specific stitches.

5. Ensure that the implementation meets the performance and scalability requirements of the ProgressionSystem module.

6. Include comprehensive error handling for all methods, with appropriate error codes and messages.

7. Include thorough documentation for all methods and data structures.

8. Include unit tests for all methods, with particular focus on the validation criteria (PS-004).

## Mock Inputs and Expected Outputs

### getStitchById

**Input:**
```typescript
const stitchId = "stitch123";
```

**Expected Output:**
```typescript
{
  id: "stitch123",
  name: "Addition of Single-Digit Numbers",
  description: "Practice adding numbers from 1 to 9",
  learningPathId: "path1",
  position: 3,
  difficulty: 2,
  factIds: ["fact1", "fact2", "fact3"],
  prerequisites: ["stitch122"],
  metadata: {
    category: "addition",
    tags: ["basic", "arithmetic"]
  }
}
```

### getStitchesByLearningPath

**Input:**
```typescript
const learningPathId = "path1";
```

**Expected Output:**
```typescript
[
  {
    id: "stitch121",
    name: "Counting from 1 to 10",
    learningPathId: "path1",
    position: 1,
    difficulty: 1,
    factIds: ["fact1"]
  },
  {
    id: "stitch122",
    name: "Counting from 10 to 20",
    learningPathId: "path1",
    position: 2,
    difficulty: 1,
    factIds: ["fact2"]
  },
  {
    id: "stitch123",
    name: "Addition of Single-Digit Numbers",
    learningPathId: "path1",
    position: 3,
    difficulty: 2,
    factIds: ["fact1", "fact2", "fact3"],
    prerequisites: ["stitch122"]
  }
]
```

### getStitchProgress

**Input:**
```typescript
const userId = "user123";
const stitchId = "stitch123";
```

**Expected Output:**
```typescript
{
  userId: "user123",
  stitchId: "stitch123",
  completionCount: 5,
  correctCount: 45,
  totalCount: 50,
  masteryLevel: 0.9,
  lastAttemptDate: "2025-05-15T14:30:00Z"
}
```

### updateStitchProgress

**Input:**
```typescript
const userId = "user123";
const stitchId = "stitch123";
const sessionResults = {
  correctCount: 18,
  totalCount: 20,
  completionTime: 240000
};
```

**Expected Output:**
```typescript
{
  userId: "user123",
  stitchId: "stitch123",
  completionCount: 6,
  correctCount: 63,
  totalCount: 70,
  masteryLevel: 0.9,
  lastAttemptDate: "2025-05-20T10:15:00Z"
}
```

### repositionStitch

**Input:**
```typescript
const userId = "user123";
const stitchId = "stitch123";
const performance = {
  correctCount: 20,
  totalCount: 20,
  averageResponseTime: 1500
};
```

**Expected Output:**
```typescript
{
  previousPosition: 3,
  newPosition: 8,
  skipNumber: 5
}
```

### getNextStitch

**Input:**
```typescript
const userId = "user123";
const learningPathId = "path1";
```

**Expected Output:**
```typescript
{
  id: "stitch121",
  name: "Counting from 1 to 10",
  learningPathId: "path1",
  position: 1,
  difficulty: 1,
  factIds: ["fact1"]
}
```

## Validation Criteria

The StitchManager implementation must satisfy the following validation criterion:

**PS-004**: StitchManager must correctly organize and retrieve stitches based on tube and subscription tier.

This criterion will be tested using the test file `tests/progression/stitch_management_test.js`, which will verify that:

1. Stitches are correctly organized within learning paths, with each position occupied by at most one stitch.
2. Stitches can be retrieved efficiently by ID and learning path.
3. The next stitch to present to the user is correctly determined based on the current state of the learning path and user progress.
4. Stitch progress is accurately tracked and updated based on session results.
5. Stitches are correctly repositioned within learning paths according to the Stitch Repositioning Algorithm.
6. The implementation handles edge cases and error conditions gracefully.

## Stitch Repositioning Algorithm Context

The Stitch Repositioning Algorithm is a key part of the spaced repetition system. It determines how stitches move within a learning path based on user performance. The algorithm works as follows:

1. When a user completes a stitch, a skip number is calculated based on their performance (correctness and response time).
2. All stitches in positions 1 through [skip number] shift down one position.
3. This creates a vacant slot at the position equal to the stitch's skip number.
4. The completed stitch is placed in this vacant slot.

This algorithm ensures that:
- Well-mastered stitches are reviewed less frequently (higher skip number)
- Challenging stitches are reviewed more frequently (lower skip number)
- The learning path adapts to the user's mastery level

The StitchManager is responsible for implementing the position shifting logic of this algorithm, while the SpacedRepetitionSystem is responsible for calculating the skip number based on performance.

## Usage Example

```typescript
// Example usage of StitchManager
import { StitchManager } from './components/StitchManager';

// Create stitch manager
const stitchManager = new StitchManager();

// Get a stitch by ID
const stitch = stitchManager.getStitchById('stitch123');
console.log(`Stitch: ${stitch.name}`);
console.log(`Difficulty: ${stitch.difficulty}`);
console.log(`Position: ${stitch.position}`);

// Get all stitches for a learning path
const stitches = stitchManager.getStitchesByLearningPath('path1');
console.log(`Found ${stitches.length} stitches in the learning path`);

// Get stitch progress for a user
const progress = stitchManager.getStitchProgress('user123', 'stitch123');
console.log(`Completion count: ${progress.completionCount}`);
console.log(`Mastery level: ${progress.masteryLevel}`);

// Update stitch progress based on session results
const updatedProgress = stitchManager.updateStitchProgress('user123', 'stitch123', {
  correctCount: 18,
  totalCount: 20,
  completionTime: 240000
});

console.log(`Updated mastery level: ${updatedProgress.masteryLevel}`);

// Reposition a stitch based on performance
const repositionResult = stitchManager.repositionStitch('user123', 'stitch123', {
  correctCount: 20,
  totalCount: 20,
  averageResponseTime: 1500
});

console.log(`Previous position: ${repositionResult.previousPosition}`);
console.log(`New position: ${repositionResult.newPosition}`);
console.log(`Skip number: ${repositionResult.skipNumber}`);

// Get the next stitch for a user in a learning path
const nextStitch = stitchManager.getNextStitch('user123', 'path1');
console.log(`Next stitch: ${nextStitch.name}`);
```

## Implementation Considerations

1. **Data Storage**: Consider using an efficient data structure for storing and retrieving stitches by position. A combination of maps and arrays might be appropriate.

2. **Concurrency**: Ensure that the implementation handles concurrent operations correctly, especially when repositioning stitches.

3. **Error Handling**: Implement comprehensive error handling for all methods, with appropriate error codes and messages.

4. **Performance Optimization**: Optimize the implementation for performance, especially for operations that involve shifting stitches between positions.

5. **Testing**: Include thorough unit tests for all methods, with particular focus on the validation criteria (PS-004).

6. **Documentation**: Include comprehensive documentation for all methods and data structures.

7. **Extensibility**: Design the implementation to be extensible, allowing for future enhancements and modifications.
