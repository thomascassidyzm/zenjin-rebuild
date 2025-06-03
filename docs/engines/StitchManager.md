# StitchManager

## Overview

The StitchManager is a core component of the ProgressionSystem module that implements the fundamental data structures and operations for the Triple Helix learning model. It manages stitches (learning units) within learning paths, implementing the "positions as first class citizens" principle where positions in the learning path tubes exist independently and stitches are assigned to them.

## Key Features

- **Position-based Learning Paths**: Implements the "positions as first class citizens" principle, ensuring positions exist independently and stitches are assigned to positions.
- **Stitch Repositioning**: Implements the Stitch Repositioning Algorithm for spaced repetition, shifting stitches based on user performance.
- **Progress Tracking**: Tracks and updates user progress on specific stitches, including completion count, correct answers, and mastery level.
- **Next Stitch Determination**: Efficiently determines the next stitch to present to a user in a learning path.
- **Comprehensive Error Handling**: Provides detailed error information for all operations through custom error codes and messages.

## Architecture

The StitchManager treats positions within learning paths as first-class citizens, ensuring that:

1. Each position in a learning path can only be occupied by one stitch at a time
2. Positions exist independently of stitches
3. Stitches are assigned to positions (not vice versa)
4. The integrity of the position-based system is maintained during operations

This architectural principle is essential for the proper functioning of the spaced repetition algorithm, which relies on the ability to shift stitches between positions while maintaining the integrity of the learning path structure.

## Data Structures

### Stitch

Represents a learning unit within a learning path:

```typescript
interface Stitch {
  id: string;                     // Unique identifier
  name: string;                   // Name of the stitch
  description?: string;           // Description (optional)
  learningPathId: string;         // ID of the learning path
  position: number;               // Position in the learning path
  difficulty: number;             // Difficulty level (1-5)
  factIds: string[];              // IDs of facts covered
  prerequisites?: string[];       // IDs of prerequisite stitches (optional)
  metadata?: Record<string, any>; // Additional metadata (optional)
}
```

### StitchProgress

Represents a user's progress on a specific stitch:

```typescript
interface StitchProgress {
  userId: string;           // User identifier
  stitchId: string;         // Stitch identifier
  completionCount: number;  // Number of times completed
  correctCount: number;     // Number of correct answers
  totalCount: number;       // Total questions attempted
  masteryLevel: number;     // Mastery level (0.0-1.0)
  lastAttemptDate?: string; // ISO date of last attempt (optional)
}
```

### SessionResults

Represents the results of a learning session:

```typescript
interface SessionResults {
  correctCount: number;    // Correct answers in the session
  totalCount: number;      // Total questions in the session
  completionTime: number;  // Time taken to complete (ms)
}
```

### PerformanceData

Represents performance data for repositioning a stitch:

```typescript
interface PerformanceData {
  correctCount: number;        // Correct answers
  totalCount: number;          // Total questions
  averageResponseTime: number; // Average response time (ms)
}
```

### RepositionResult

Represents the result of a stitch repositioning operation:

```typescript
interface RepositionResult {
  previousPosition: number; // Previous position
  newPosition: number;      // New position
  skipNumber: number;       // Skip number used
}
```

## API Reference

### Core Methods

#### `getStitchById(stitchId: string): Stitch`

Gets a stitch by its identifier.

```typescript
const stitch = stitchManager.getStitchById('stitch123');
console.log(`Stitch: ${stitch.name}`);
```

#### `getStitchesByLearningPath(learningPathId: string): Stitch[]`

Gets all stitches for a specific learning path.

```typescript
const stitches = stitchManager.getStitchesByLearningPath('path1');
console.log(`Found ${stitches.length} stitches in the learning path`);
```

#### `getStitchProgress(userId: string, stitchId: string): StitchProgress`

Gets progress data for a specific stitch and user.

```typescript
const progress = stitchManager.getStitchProgress('user123', 'stitch123');
console.log(`Mastery level: ${progress.masteryLevel}`);
```

#### `updateStitchProgress(userId: string, stitchId: string, sessionResults: SessionResults): StitchProgress`

Updates progress data for a specific stitch and user.

```typescript
const updatedProgress = stitchManager.updateStitchProgress('user123', 'stitch123', {
  correctCount: 18,
  totalCount: 20,
  completionTime: 240000
});
console.log(`Updated mastery level: ${updatedProgress.masteryLevel}`);
```

#### `repositionStitch(userId: string, stitchId: string, performance: PerformanceData): RepositionResult`

Repositions a stitch within its learning path based on the Stitch Repositioning Algorithm.

```typescript
const repositionResult = stitchManager.repositionStitch('user123', 'stitch123', {
  correctCount: 20,
  totalCount: 20,
  averageResponseTime: 1500
});
console.log(`Stitch repositioned from ${repositionResult.previousPosition} to ${repositionResult.newPosition}`);
```

#### `getNextStitch(userId: string, learningPathId: string): Stitch`

Gets the next stitch to present to the user in a learning path.

```typescript
const nextStitch = stitchManager.getNextStitch('user123', 'path1');
console.log(`Next stitch: ${nextStitch.name}`);
```

### Additional Methods

#### `addStitch(stitch: Stitch): void`

Adds a stitch to the system.

```typescript
stitchManager.addStitch({
  id: 'stitch124',
  name: 'Multiplication Tables',
  learningPathId: 'path1',
  position: 4,
  difficulty: 3,
  factIds: ['fact6', 'fact7']
});
```

#### `removeStitch(stitchId: string): void`

Removes a stitch from the system.

```typescript
stitchManager.removeStitch('stitch123');
```

#### `getStitchAtPosition(learningPathId: string, position: number): Stitch | null`

Gets the stitch at a specific position in a learning path.

```typescript
const stitch = stitchManager.getStitchAtPosition('path1', 2);
if (stitch) {
  console.log(`Stitch at position 2: ${stitch.name}`);
}
```

#### `initializeLearningPath(learningPathId: string): void`

Initializes a learning path with the given ID.

```typescript
stitchManager.initializeLearningPath('new-path');
```

## Stitch Repositioning Algorithm

The Stitch Repositioning Algorithm is a key part of the spaced repetition system. It determines how stitches move within a learning path based on user performance:

1. When a user completes a stitch, a skip number is calculated based on their performance (correctness and response time).
2. All stitches in positions 1 through [skip number] shift down one position.
3. This creates a vacant slot at the position equal to the stitch's skip number.
4. The completed stitch is placed in this vacant slot.

This algorithm ensures that:
- Well-mastered stitches are reviewed less frequently (higher skip number)
- Challenging stitches are reviewed more frequently (lower skip number)
- The learning path adapts to the user's mastery level

## Error Handling

The StitchManager provides comprehensive error handling through the `StitchManagerError` class and `StitchManagerErrorCode` enum:

```typescript
try {
  const stitch = stitchManager.getStitchById('non-existent');
} catch (error) {
  if (error instanceof StitchManagerError) {
    console.error(`Error: ${error.code} - ${error.message}`);
  }
}
```

Error codes:
- `STITCH_NOT_FOUND`: Specified stitch was not found
- `LEARNING_PATH_NOT_FOUND`: Specified learning path was not found
- `USER_NOT_FOUND`: Specified user was not found
- `NO_PROGRESS_DATA`: No progress data exists for this user and stitch
- `INVALID_SESSION_RESULTS`: Session results are invalid
- `INVALID_PERFORMANCE_DATA`: Performance data is invalid
- `REPOSITIONING_FAILED`: Failed to reposition the stitch
- `NO_STITCHES_AVAILABLE`: No stitches available in the learning path
- `POSITION_OCCUPIED`: Position in the learning path is already occupied
- `POSITION_OUT_OF_BOUNDS`: Position is out of bounds for the learning path

## Performance Considerations

The StitchManager is designed for high performance and scalability:

- Efficient data structures: Uses Maps for O(1) lookups of stitches and progress data
- Position shifting: Optimized to minimize the number of operations during stitch repositioning
- Caching: Implements a simple caching mechanism for the next stitch determination
- Error handling: Provides detailed error information without sacrificing performance

## Usage Example

```typescript
// Create stitch manager
const stitchManager = new StitchManager();

// Initialize a learning path
stitchManager.initializeLearningPath('math-basics');

// Add stitches to the learning path
stitchManager.addStitch({
  id: 'stitch1',
  name: 'Counting Numbers',
  description: 'Learn to count from 1 to 10',
  learningPathId: 'math-basics',
  position: 1,
  difficulty: 1,
  factIds: ['fact1']
});

// Get the next stitch for a user
const nextStitch = stitchManager.getNextStitch('user123', 'math-basics');
console.log(`Next stitch: ${nextStitch.name}`);

// Update progress after user completes the stitch
const progress = stitchManager.updateStitchProgress('user123', nextStitch.id, {
  correctCount: 10,
  totalCount: 10,
  completionTime: 120000
});

// Reposition stitch based on performance
const repositionResult = stitchManager.repositionStitch('user123', nextStitch.id, {
  correctCount: 10,
  totalCount: 10,
  averageResponseTime: 1200
});
```

## Integration with Other Components

The StitchManager is designed to integrate with other components of the ProgressionSystem module:

1. **SpacedRepetitionSystem**: Depends on the StitchManager for accessing and manipulating stitches within learning paths.

2. **TripleHelixManager**: Depends on the StitchManager for managing stitches within the three parallel learning paths.

3. **ProgressTracker**: Interacts with the StitchManager to track user progress through learning paths and content mastery.

## Testing

The StitchManager includes comprehensive unit tests that verify:

1. Stitches are correctly organized within learning paths
2. Each position is occupied by at most one stitch
3. Stitches can be retrieved efficiently
4. The next stitch is correctly determined
5. Stitch progress is accurately tracked and updated
6. Stitches are correctly repositioned
7. Edge cases and error conditions are handled gracefully

Run the tests with:

```bash
npm test
```

## License

This component is proprietary and confidential. Unauthorized use, copying, or distribution is prohibited.
