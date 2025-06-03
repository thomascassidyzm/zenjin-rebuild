# SpacedRepetitionSystem Implementation Package

## Implementation Goal

Implement the SpacedRepetitionSystem component that implements the Stitch Repositioning Algorithm for spaced repetition, moving mastered content progressively further back in the queue to optimize learning and memory retention.

## Component Context

The SpacedRepetitionSystem is a core component of the ProgressionSystem module that implements the scientifically-proven spaced repetition approach to learning. This approach is based on the principle that information is better retained when it's reviewed at increasing intervals over time.

In the Zenjin Maths App, the SpacedRepetitionSystem manages the sequencing of learning content (stitches) within each learning path. It ensures that:

1. New or challenging content is presented more frequently
2. Well-mastered content is presented at progressively longer intervals
3. The spacing of content is adapted based on the user's performance

The Stitch Repositioning Algorithm is the heart of this system. It dynamically adjusts the position of each stitch in the queue based on the user's performance, creating an optimal spacing pattern that maximizes learning efficiency and long-term retention.

## Interface Definition

```typescript
/**
 * Interface for the SpacedRepetitionSystem component
 */
export interface SpacedRepetitionInterface {
  /**
   * Repositions a stitch based on performance using the Stitch Repositioning Algorithm
   * @param userId User identifier
   * @param stitchId Stitch identifier
   * @param performance Performance data for repositioning
   * @returns Result of the repositioning operation
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws STITCH_NOT_FOUND if the specified stitch was not found
   * @throws INVALID_PERFORMANCE_DATA if the performance data is invalid
   * @throws REPOSITIONING_FAILED if failed to reposition the stitch
   */
  repositionStitch(
    userId: string,
    stitchId: string,
    performance: PerformanceData
  ): RepositionResult;
  
  /**
   * Gets the next stitch to present to the user in a learning path
   * @param userId User identifier
   * @param learningPathId Learning path identifier
   * @returns The next stitch to present
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws LEARNING_PATH_NOT_FOUND if the specified learning path was not found
   * @throws NO_STITCHES_AVAILABLE if no stitches available in the learning path
   */
  getNextStitch(
    userId: string,
    learningPathId: string
  ): {
    id: string;
    position: number;
    content: any;
  };
  
  /**
   * Calculates the skip number based on performance
   * @param performance Performance data
   * @returns Calculated skip number
   * @throws INVALID_PERFORMANCE_DATA if the performance data is invalid
   */
  calculateSkipNumber(performance: PerformanceData): number;
  
  /**
   * Gets the current stitch queue for a user and learning path
   * @param userId User identifier
   * @param learningPathId Learning path identifier
   * @returns Array of stitches in queue order
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws LEARNING_PATH_NOT_FOUND if the specified learning path was not found
   */
  getStitchQueue(
    userId: string,
    learningPathId: string
  ): Array<{
    id: string;
    position: number;
  }>;
  
  /**
   * Gets the repositioning history for a specific stitch and user
   * @param userId User identifier
   * @param stitchId Stitch identifier
   * @param limit Maximum number of history entries to return
   * @returns Array of repositioning history entries
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws STITCH_NOT_FOUND if the specified stitch was not found
   */
  getRepositioningHistory(
    userId: string,
    stitchId: string,
    limit?: number
  ): RepositionResult[];
}
```

## Data Structures

```typescript
/**
 * Performance data for a stitch completion
 */
export type PerformanceData = {
  /** Number of correct answers */
  correctCount: number;
  
  /** Total number of questions */
  totalCount: number;
  
  /** Average response time in milliseconds */
  averageResponseTime: number;
  
  /** ISO date string of completion */
  completionDate?: string;
};

/**
 * Result of a stitch repositioning operation
 */
export type RepositionResult = {
  /** Stitch identifier */
  stitchId: string;
  
  /** Previous position in the queue */
  previousPosition: number;
  
  /** New position in the queue */
  newPosition: number;
  
  /** Skip number used for repositioning */
  skipNumber: number;
  
  /** ISO date string of repositioning */
  timestamp: string;
};
```

## Module Context

The SpacedRepetitionSystem is part of the ProgressionSystem module, which is responsible for managing the user's learning progression through the Zenjin Maths App. While it doesn't have direct dependencies on other interfaces, it works in conjunction with:

1. **TripleHelixManager**: The SpacedRepetitionSystem manages stitch sequencing within each learning path managed by the TripleHelixManager.

2. **ProgressTracker**: The performance data used by the SpacedRepetitionSystem is often derived from metrics tracked by the ProgressTracker.

The SpacedRepetitionSystem plays a crucial role in the Zenjin Maths App's learning approach by:

1. Ensuring optimal spacing of content presentation for maximum retention
2. Adapting to each user's individual performance and learning pace
3. Implementing scientifically-proven spaced repetition principles
4. Supporting the Triple Helix model by managing content sequencing within each learning path

## Implementation Requirements

The SpacedRepetitionSystem component must:

1. **Implement the Stitch Repositioning Algorithm**:
   - When a stitch is completed with perfect performance (20/20 correct answers), it's temporarily assigned position -1
   - All stitches in positions 1 through [skip number] shift down one position
   - This creates a vacant slot at the position equal to the stitch's skip number
   - The completed stitch is placed in this vacant slot
   - This creates spaced repetition where correctly answered content moves progressively further back in the queue as it's mastered

2. **Calculate appropriate skip numbers**:
   - Base skip number on performance metrics (correctness and response time)
   - Higher performance should result in larger skip numbers
   - Skip numbers should increase as a stitch is repeatedly mastered
   - Skip numbers should decrease if performance deteriorates

3. **Manage stitch queues**:
   - Maintain a queue of stitches for each user and learning path
   - Ensure efficient queue operations for potentially hundreds of stitches
   - Support retrieval of the next stitch to present
   - Track repositioning history for analysis and debugging

4. **Handle edge cases**:
   - New users with no existing queue
   - Learning paths with few stitches
   - Perfect performance on all available content
   - Varying performance levels across sessions

5. **Provide performance analytics**:
   - Track repositioning history
   - Support analysis of spacing patterns
   - Enable monitoring of algorithm effectiveness

## Implementation Prompt

You are implementing the SpacedRepetitionSystem component for the Zenjin Maths App, which is responsible for implementing the Stitch Repositioning Algorithm for spaced repetition.

The SpacedRepetitionSystem must implement:

1. The Stitch Repositioning Algorithm:
   - When a stitch is completed with 20/20 correct answers, it's temporarily assigned position -1
   - All stitches in positions 1 through [skip number] shift down one position
   - This creates a vacant slot at the position equal to the stitch's skip number
   - The completed stitch is placed in this vacant slot
   - This creates spaced repetition where correctly answered content moves progressively further back in the queue as it's mastered

2. Skip number calculation:
   - Calculate skip numbers based on performance metrics
   - Consider correctness, response time, and previous performance
   - Implement adaptive spacing that increases with mastery
   - Ensure skip numbers are appropriate for the queue size

3. Queue management:
   - Maintain efficient queue data structures
   - Support operations for adding, removing, and repositioning stitches
   - Provide access to the next stitch in the queue
   - Track repositioning history

Technical requirements:
- Use TypeScript for type safety
- Implement the SpacedRepetitionInterface as defined in the ProgressionSystem module
- Ensure the implementation is testable with mock inputs
- Design for efficient queue management with potentially hundreds of stitches per user
- Support adaptive spacing based on performance
- Include comprehensive error handling
- Provide detailed logging for debugging and analysis

Please implement the SpacedRepetitionSystem component with all necessary TypeScript types, classes, and methods. Include comprehensive comments explaining the implementation details and how the algorithm optimizes learning through spaced repetition.

## Mock Inputs

```typescript
// Example 1: Reposition a stitch with perfect performance
const userId1 = 'user123';
const stitchId1 = 'stitch456';
const performance1 = {
  correctCount: 20,
  totalCount: 20,
  averageResponseTime: 1500,
  completionDate: '2025-05-20T14:30:00Z'
};

// Example 2: Reposition a stitch with good but not perfect performance
const userId2 = 'user123';
const stitchId2 = 'stitch789';
const performance2 = {
  correctCount: 18,
  totalCount: 20,
  averageResponseTime: 2000,
  completionDate: '2025-05-20T14:35:00Z'
};

// Example 3: Get the next stitch for a user and learning path
const userId3 = 'user123';
const learningPathId3 = 'path1';

// Example 4: Calculate skip number for perfect performance
const performance4 = {
  correctCount: 20,
  totalCount: 20,
  averageResponseTime: 1500
};

// Example 5: Calculate skip number for good but not perfect performance
const performance5 = {
  correctCount: 18,
  totalCount: 20,
  averageResponseTime: 2000
};

// Example 6: Get the stitch queue for a user and learning path
const userId6 = 'user123';
const learningPathId6 = 'path1';

// Example 7: Get repositioning history for a stitch
const userId7 = 'user123';
const stitchId7 = 'stitch456';
const limit7 = 5;
```

## Expected Outputs

```typescript
// Output for Example 1: Reposition a stitch with perfect performance
const output1 = {
  stitchId: 'stitch456',
  previousPosition: 2,
  newPosition: 5,
  skipNumber: 5,
  timestamp: '2025-05-20T14:30:00Z'
};

// Output for Example 2: Reposition a stitch with good but not perfect performance
const output2 = {
  stitchId: 'stitch789',
  previousPosition: 1,
  newPosition: 3,
  skipNumber: 3,
  timestamp: '2025-05-20T14:35:00Z'
};

// Output for Example 3: Get the next stitch for a user and learning path
const output3 = {
  id: 'stitch123',
  position: 1,
  content: {
    type: 'addition',
    difficulty: 2,
    question: '5 + 7 = ?',
    answer: 12,
    options: [10, 11, 12, 13]
  }
};

// Output for Example 4: Calculate skip number for perfect performance
const output4 = 5;

// Output for Example 5: Calculate skip number for good but not perfect performance
const output5 = 3;

// Output for Example 6: Get the stitch queue for a user and learning path
const output6 = [
  { id: 'stitch123', position: 1 },
  { id: 'stitch234', position: 2 },
  { id: 'stitch345', position: 3 },
  { id: 'stitch789', position: 4 },
  { id: 'stitch456', position: 5 },
  { id: 'stitch567', position: 6 }
];

// Output for Example 7: Get repositioning history for a stitch
const output7 = [
  {
    stitchId: 'stitch456',
    previousPosition: 2,
    newPosition: 5,
    skipNumber: 5,
    timestamp: '2025-05-20T14:30:00Z'
  },
  {
    stitchId: 'stitch456',
    previousPosition: 1,
    newPosition: 3,
    skipNumber: 3,
    timestamp: '2025-05-19T10:15:00Z'
  },
  {
    stitchId: 'stitch456',
    previousPosition: 1,
    newPosition: 2,
    skipNumber: 2,
    timestamp: '2025-05-18T09:45:00Z'
  }
];
```

## Validation Criteria

The SpacedRepetitionSystem component must meet the following validation criteria:

1. **PS-002**: SpacedRepetitionSystem must correctly implement the Stitch Repositioning Algorithm, moving completed stitches to appropriate positions.
   - Perfect performance (20/20 correct) should result in larger skip numbers
   - Stitches should be correctly repositioned based on the calculated skip number
   - The queue should maintain proper ordering after repositioning
   - Repositioning history should be accurately tracked

2. **Algorithm Correctness**: The implementation must correctly follow the Stitch Repositioning Algorithm steps:
   - Temporarily assign position -1 to the completed stitch
   - Shift all stitches in positions 1 through [skip number] down one position
   - Place the completed stitch in the position equal to its skip number

3. **Performance**: Queue operations must be efficient, even with hundreds of stitches.

4. **Adaptivity**: Skip numbers must adapt based on performance, increasing with mastery and decreasing with errors.

5. **Error Handling**: The component must properly handle invalid inputs and edge cases.

## Spaced Repetition Context

Understanding the principles of spaced repetition is crucial for implementing the SpacedRepetitionSystem:

1. **The Spacing Effect**:
   - Information is better retained when it's reviewed at increasing intervals over time
   - Reviewing content too frequently is inefficient
   - Reviewing content too infrequently leads to forgetting
   - Optimal spacing intervals increase as mastery increases

2. **The Stitch Repositioning Algorithm**:
   - Implements the spacing effect by dynamically adjusting the position of each stitch in the queue
   - Perfect performance moves content further back in the queue
   - Less-than-perfect performance results in smaller spacing intervals
   - This creates an adaptive system that focuses on challenging content while efficiently reviewing mastered content

3. **Skip Number Calculation**:
   - Skip numbers determine how far back in the queue a stitch is placed
   - Larger skip numbers mean longer intervals between reviews
   - Skip numbers should increase as a stitch is repeatedly mastered
   - Skip numbers should be influenced by performance metrics like correctness and response time

4. **Queue Management**:
   - The queue represents the sequence of stitches to be presented to the user
   - Position 1 is the next stitch to be presented
   - Efficient queue operations are essential for performance
   - The queue must maintain proper ordering after repositioning operations

The SpacedRepetitionSystem must implement these principles to provide an effective learning experience that optimizes memory retention and learning efficiency.

## Usage Example

```typescript
// Example usage of SpacedRepetitionSystem
import { SpacedRepetitionSystem } from './components/SpacedRepetitionSystem';

// Create spaced repetition system
const spacedRepetitionSystem = new SpacedRepetitionSystem();

// Get the next stitch to present to the user
const nextStitch = spacedRepetitionSystem.getNextStitch('user123', 'path1');
console.log(`Next stitch ID: ${nextStitch.id}`);
console.log(`Position: ${nextStitch.position}`);
console.log(`Content: ${JSON.stringify(nextStitch.content)}`);

// After the user completes the stitch, reposition it based on performance
const performance = {
  correctCount: 20,
  totalCount: 20,
  averageResponseTime: 1500,
  completionDate: new Date().toISOString()
};

const repositionResult = spacedRepetitionSystem.repositionStitch(
  'user123',
  nextStitch.id,
  performance
);

console.log(`Previous position: ${repositionResult.previousPosition}`);
console.log(`New position: ${repositionResult.newPosition}`);
console.log(`Skip number: ${repositionResult.skipNumber}`);

// Calculate skip number for a different performance
const skipNumber = spacedRepetitionSystem.calculateSkipNumber({
  correctCount: 18,
  totalCount: 20,
  averageResponseTime: 2000
});

console.log(`Skip number for 18/20 correct: ${skipNumber}`);

// Get the current stitch queue
const queue = spacedRepetitionSystem.getStitchQueue('user123', 'path1');
console.log(`Queue length: ${queue.length}`);
queue.forEach((item, index) => {
  console.log(`Position ${item.position}: Stitch ${item.id}`);
});

// Get repositioning history for a stitch
const history = spacedRepetitionSystem.getRepositioningHistory('user123', nextStitch.id, 3);
console.log(`Repositioning history entries: ${history.length}`);
history.forEach((entry, index) => {
  console.log(`Entry ${index + 1}:`);
  console.log(`  Previous position: ${entry.previousPosition}`);
  console.log(`  New position: ${entry.newPosition}`);
  console.log(`  Skip number: ${entry.skipNumber}`);
  console.log(`  Timestamp: ${entry.timestamp}`);
});
```
