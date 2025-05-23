# SpacedRepetitionSystem Example

This README explains how to use the SpacedRepetitionSystem component for implementing spaced repetition learning in the Zenjin Maths App. The system implements the Stitch Repositioning Algorithm to optimize learning and memory retention by adaptively spacing content based on user performance.

## Overview

The SpacedRepetitionSystem manages the sequencing of learning content (stitches) within each learning path. It ensures that:

1. New or challenging content is presented more frequently
2. Well-mastered content is presented at progressively longer intervals
3. The spacing of content is adapted based on the user's performance

## Key Components

The SpacedRepetitionSystem exposes the following main methods:

- `repositionStitch`: Repositions a stitch based on user performance
- `getNextStitch`: Gets the next stitch to present to the user
- `calculateSkipNumber`: Calculates how far back to position a stitch
- `getStitchQueue`: Gets the current queue of stitches
- `getRepositioningHistory`: Gets the history of stitch repositionings

## How the Stitch Repositioning Algorithm Works

The Stitch Repositioning Algorithm is the core of the SpacedRepetitionSystem (following APML specification):

1. When a stitch is completed with 20/20 correct answers, it's temporarily assigned position -1
2. All stitches in positions 1 through [skip number] shift DOWN one position (position 2 becomes position 1, etc.)
3. This creates a vacant slot at the position equal to the stitch's skip number
4. The completed stitch is placed in this vacant slot
5. This creates spaced repetition where correctly answered content moves progressively further back in the queue as it's mastered

## Skip Number Sequence

The system uses a fixed skip number sequence for optimal spaced repetition:
**[4, 8, 15, 30, 100, 1000]**

### Progression Logic:
- **< 20/20**: Stitch remains at current position (stays active), skip number resets to 4
- **= 20/20**: Stitch moves by skip number, advances to next number in sequence

### Position Management:
- **Positions are first-class citizens** - stitches are assigned to positions
- **Active stitch** is always at position 1
- **Gaps are preserved** for inserting new stitches (e.g., positions 49-99 when a stitch moves to position 100)
- **Compression** can be applied periodically to optimize space usage

## Usage Example

### Setting Up

```typescript
import { SpacedRepetitionSystem } from './SpacedRepetitionSystem';

// Create a new instance
const spacedRepetitionSystem = new SpacedRepetitionSystem();

// Initialize with stitches
const userId = 'user123';
const learningPathId = 'path1';
const stitches = [
  { 
    id: 'addition-basic', 
    content: {
      type: 'addition',
      difficulty: 1,
      question: '5 + 7 = ?',
      answer: 12,
      options: [10, 11, 12, 13]
    }
  },
  // ... more stitches ...
];

spacedRepetitionSystem.initializeLearningPath(userId, learningPathId, stitches);
```

### Basic Learning Flow

```typescript
// Get the next stitch to present to the user
const nextStitch = spacedRepetitionSystem.getNextStitch(userId, learningPathId);
console.log(`Next stitch: ${nextStitch.id}`);
console.log(`Content: ${JSON.stringify(nextStitch.content)}`);

// After user completes the stitch, record performance
const performance = {
  correctCount: 20,    // Number of correct answers
  totalCount: 20,      // Total number of questions
  averageResponseTime: 1500,  // Average response time in ms
  completionDate: new Date().toISOString()
};

// Reposition the stitch based on performance
const result = spacedRepetitionSystem.repositionStitch(
  userId,
  nextStitch.id,
  performance
);

console.log(`Stitch moved from position ${result.previousPosition} to ${result.newPosition}`);
console.log(`Skip number used: ${result.skipNumber}`);

// View the updated queue
const queue = spacedRepetitionSystem.getStitchQueue(userId, learningPathId);
console.log('Updated queue:', queue);
```

### Analyzing Repositioning History

```typescript
// Get the repositioning history for a specific stitch
const history = spacedRepetitionSystem.getRepositioningHistory(
  userId,
  'addition-basic',
  5  // Limit to last 5 entries
);

console.log('Repositioning history:');
history.forEach((entry, index) => {
  console.log(`Entry ${index + 1}:`);
  console.log(`  Previous position: ${entry.previousPosition}`);
  console.log(`  New position: ${entry.newPosition}`);
  console.log(`  Skip number: ${entry.skipNumber}`);
  console.log(`  Timestamp: ${entry.timestamp}`);
});
```

## Learning Path Progression

As a user progresses through a learning path:

1. They start with the stitch at position 1
2. Based on their performance, that stitch is repositioned further back in the queue
3. The next stitch in the queue becomes position 1 and is presented next
4. As stitches are mastered, they move further back, creating optimal spacing
5. Difficult stitches stay near the front of the queue for more frequent review

This creates an adaptive learning sequence that focuses on challenging content while efficiently reviewing mastered content at optimal intervals for long-term retention.

## Performance Considerations

The SpacedRepetitionSystem is designed to handle:

- Learning paths with hundreds of stitches
- Multiple users with different learning paces
- Varying performance across different stitches
- Long-term learning progression

The implementation ensures efficient queue operations and minimal memory usage while maintaining the scientific principles of spaced repetition.

## Error Handling

The system includes comprehensive error handling for:

- Invalid performance data
- Non-existent users or learning paths
- Empty stitch queues
- Invalid stitch IDs or indices

Each method throws appropriate errors with descriptive messages to help diagnose issues.

## Scientific Background

The SpacedRepetitionSystem is based on well-established research showing that spaced repetition is one of the most effective learning techniques. It implements these principles by:

1. Adapting spacing intervals based on individual performance
2. Increasing intervals as material is mastered (expanding rehearsal)
3. Focusing on challenging content that needs more practice
4. Creating an optimal review schedule for long-term retention

By using the SpacedRepetitionSystem, the Zenjin Maths App provides a scientifically-proven approach to helping users achieve mastery of mathematical concepts with maximum efficiency and retention.
