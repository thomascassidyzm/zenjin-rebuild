# DistinctionManager Component

## Overview

The DistinctionManager is a critical component of the Zenjin Maths App's LearningEngine module. It implements a distinction-based learning approach by managing five increasingly fine-grained boundary levels that represent the distinctions a learner must make when learning mathematical facts.

This component tracks user mastery at each boundary level and determines when a user should progress to the next level based on their performance, forming the core of the distinction-based learning approach.

## Distinction-Based Learning Approach

The distinction-based learning approach is based on the theory that learning occurs through making increasingly fine-grained distinctions between concepts. The DistinctionManager implements five boundary levels of distinction:

1. **Category Boundaries (Level 1)**: The most basic distinction - can the student identify that the answer should be a number?
2. **Magnitude Boundaries (Level 2)**: Can the student identify the approximate range of the answer?
3. **Operation Boundaries (Level 3)**: Can the student distinguish between different operations (e.g., addition vs. multiplication)?
4. **Related Fact Boundaries (Level 4)**: Can the student distinguish between adjacent facts in the same operation (e.g., 7×8 vs. 7×7)?
5. **Near Miss Boundaries (Level 5)**: Can the student distinguish between very similar numerical answers (e.g., 56 vs. 54)?

As students demonstrate mastery at one level, they progress to more challenging distinctions.

## Features

- Manages five boundary levels with detailed descriptions
- Tracks user mastery data for each mathematical fact
- Implements a sophisticated algorithm for boundary level progression based on:
  - Response time
  - Consecutive correct answers
  - Overall mastery score
- Provides comprehensive error handling
- Optimized for performance with large numbers of users and facts

## Technical Implementation

The DistinctionManager implements the `DistinctionManagerInterface` and depends on the `FactRepositoryInterface` for validating fact IDs. It is written in TypeScript with comprehensive type definitions and full JSDoc documentation.

### Key Components

- **Boundary Level Management**: Defines and provides access to the five boundary levels
- **User Mastery Tracking**: Stores and retrieves mastery data for each user and fact
- **Progression Algorithm**: Determines when a user should move up or down boundary levels
- **Performance Optimization**: Uses efficient data structures for storing and retrieving mastery data

### Data Structures

- **BoundaryLevel**: Represents a single boundary level with level number, name, and description
- **UserFactMastery**: Stores mastery data for a specific user and fact, including current level, mastery score, consecutive correct answers, and timing data
- **PerformanceData**: Represents performance data for a single attempt, including correctness, response time, and consecutive correct count

## Usage

### Initialization

```typescript
// Create a new DistinctionManager with a fact repository
const factRepository = new FactRepository();
const distinctionManager = new DistinctionManager(factRepository);

// Initialize mastery data for a user and fact
distinctionManager.initializeUserFactMastery('user123', 'mult-7-8', 1);
```

### Updating Boundary Level Based on Performance

```typescript
// Update boundary level after a user attempt
const result = distinctionManager.updateBoundaryLevel('user123', 'mult-7-8', {
  correctFirstAttempt: true,
  responseTime: 1200, // milliseconds
  consecutiveCorrect: 3
});

console.log(`Previous level: ${result.previousLevel}`);
console.log(`New level: ${result.newLevel}`);
console.log(`Level changed: ${result.levelChanged}`);
console.log(`Mastery score: ${result.masteryScore}`);
```

### Retrieving Mastery Data

```typescript
// Get current boundary level
const currentLevel = distinctionManager.getCurrentBoundaryLevel('user123', 'mult-7-8');

// Get detailed mastery data
const masteryData = distinctionManager.getUserFactMastery('user123', 'mult-7-8');
```

### Retrieving Boundary Level Information

```typescript
// Get information about a specific boundary level
const level4 = distinctionManager.getBoundaryLevelDescription(4);

// Get information about all boundary levels
const allLevels = distinctionManager.getAllBoundaryLevels();
```

## Error Handling

The DistinctionManager provides comprehensive error handling with specific error codes for different scenarios:

- `USER_NOT_FOUND`: The specified user was not found
- `FACT_NOT_FOUND`: The specified fact was not found
- `NO_MASTERY_DATA`: No mastery data exists for the specified user and fact
- `INVALID_LEVEL`: The specified boundary level is invalid
- `INVALID_PERFORMANCE_DATA`: The performance data is invalid
- `ALREADY_INITIALIZED`: Mastery data already exists for the specified user and fact

Example of error handling:

```typescript
try {
  const level = distinctionManager.getCurrentBoundaryLevel('user123', 'invalid-fact');
} catch (error) {
  if (error instanceof DistinctionManagerError) {
    if (error.code === DistinctionManagerErrorCode.FACT_NOT_FOUND) {
      console.error('Fact not found:', error.message);
    }
  }
}
```

## Performance Considerations

The DistinctionManager is designed for performance with potentially thousands of facts per user:

- Uses an efficient Map data structure for storing and retrieving mastery data
- Optimizes key generation for quick lookups
- Returns deep copies of objects to prevent external modification
- Implements validation checks for all inputs to prevent runtime errors

## Testing

The DistinctionManager includes comprehensive unit tests covering:

- Basic functionality for all methods
- Boundary level progression and demotion
- Error handling for all possible error cases
- Performance with large datasets
- Edge cases and potential issues

To run the tests:

```bash
npm test
```

## Integration with Zenjin Maths App

The DistinctionManager is a core component of the LearningEngine module and integrates with:

- The fact repository for validating mathematical facts
- The wider learning system for tracking user progress
- The user interface for displaying appropriate questions based on boundary level

## Future Enhancements

Potential future enhancements to the DistinctionManager include:

- Persistence of mastery data to a database
- Advanced analytics for tracking user progress over time
- Machine learning algorithms to better predict optimal boundary level transitions
- Support for different types of mathematical facts beyond basic arithmetic

## Contributing

Please refer to the overall project contribution guidelines before making changes to the DistinctionManager component.

## License

This component is part of the Zenjin Maths App and is subject to the project's license agreement.