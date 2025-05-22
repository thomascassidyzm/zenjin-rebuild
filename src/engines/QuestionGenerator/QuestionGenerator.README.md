# QuestionGenerator Component

## Overview

The QuestionGenerator is a core component of the Zenjin Maths App's LearningEngine module. It intelligently generates mathematical questions tailored to each user's current learning path, mastery level, and progression through the Triple Helix learning model.

This component creates questions that adapt to the user's learning journey, ensuring an optimal balance between challenge and achievability. It implements spaced repetition principles to reinforce mathematical facts at appropriate intervals based on the user's mastery level.

## Key Features

- **Adaptive Question Generation**: Generates questions appropriate for the user's current boundary level of mastery
- **Triple Helix Learning Model Integration**: Aligns questions with the user's active learning path (knowledge acquisition, skill development, or application)
- **Spaced Repetition**: Strategically schedules fact practice based on mastery levels and time since last practice
- **Progressive Difficulty**: Adjusts question complexity as users master concepts
- **Performance Optimized**: Designed for high performance, generating questions in under 30ms
- **Comprehensive Error Handling**: Robust handling of edge cases and error conditions

## Dependencies

The QuestionGenerator has the following dependencies:

- **FactRepositoryInterface**: Provides access to mathematical facts and question templates
- **DistinctionManagerInterface**: Tracks user mastery levels for mathematical facts
- **TripleHelixManagerInterface**: Manages user progression through the Triple Helix learning model

## Usage

### Basic Usage

```typescript
// Create a new QuestionGenerator instance (typically done through dependency injection)
const questionGenerator = new QuestionGenerator(
  factRepository,
  distinctionManager,
  tripleHelixManager,
  logger
);

// Generate a question for a user on a specific learning path
const question = questionGenerator.generateQuestion({
  userId: 'user123',
  learningPathId: 'multiplication-basic'
});

// Display the question to the user
console.log(question.text); // e.g., "What is 7 × 8?"
```

### Generating Multiple Questions

```typescript
// Generate a batch of questions for a learning session
const questions = questionGenerator.generateMultipleQuestions({
  userId: 'user123',
  learningPathId: 'multiplication-basic',
  preferredOperations: ['multiplication'],
  count: 5
});

// Process the questions
questions.forEach(question => {
  console.log(question.text);
});
```

### Getting the Next Question in Sequence

```typescript
// Get the next appropriate question for a user
const nextQuestion = questionGenerator.getNextQuestion(
  'user123',
  'multiplication-basic'
);
```

### Getting Question Set Information

```typescript
// Get information about the user's progress in a learning path
const info = questionGenerator.getQuestionSetInfo(
  'user123',
  'multiplication-basic'
);

console.log(`Progress: ${info.completedQuestions}/${info.totalQuestions}`);
console.log(`Mastered facts: ${info.masteredFacts}`);
console.log(`Average boundary level: ${info.averageBoundaryLevel}`);
```

### Formatting Custom Question Text

```typescript
// Format a question template with fact values
const formattedText = questionGenerator.formatQuestionText(
  'mult-7-8',
  'Calculate the product: {{operand1}} × {{operand2}} = ?'
);
```

## Educational Principles

The QuestionGenerator embodies several key educational principles:

### Triple Helix Learning Model

The Triple Helix model consists of three parallel learning paths:

1. **Knowledge Acquisition**: Learning new facts (mastery levels 0-1)
   - Questions focus on introducing new concepts and basic recall
   - Simpler presentation with more scaffolding

2. **Skill Development**: Practicing known facts (mastery levels 2-4)
   - Questions focus on building fluency and speed
   - Progressive difficulty to build confidence

3. **Application**: Using facts in more complex contexts (mastery levels 3-5)
   - Questions focus on applying knowledge to solve more complex problems
   - May combine multiple facts or present them in different formats

### Boundary Levels

The component uses a 5-level mastery system:

- **Level 1**: Initial exposure to a fact (high support needed)
- **Level 2**: Recognition with some prompting (moderate support)
- **Level 3**: Recall with occasional errors (low support)
- **Level 4**: Reliable recall with consistent accuracy (minimal support)
- **Level 5**: Automatic recall with high confidence (no support needed)

Questions target the user's current boundary level, with occasional challenges one level higher to promote growth.

### Spaced Repetition

Facts are revisited at strategic intervals:
- Recently learned or less mastered facts are practiced more frequently
- Well-mastered facts are revisited less often but are still periodically reinforced
- The algorithm prioritizes facts based on both mastery level and time since last practice

## API Reference

### Methods

#### `generateQuestion(request: QuestionRequest): Question`

Generates a question based on the user's active learning path and progress.

**Parameters:**
- `request`: QuestionRequest object containing:
  - `userId`: User identifier
  - `learningPathId`: Identifier for the active learning path
  - `preferredOperations?`: (Optional) Preferred operations to focus on
  - `excludeFactIds?`: (Optional) Fact IDs to exclude from selection
  - `maxDifficulty?`: (Optional) Maximum difficulty level (0.0-1.0)

**Returns:**
- A Question object

**Errors:**
- `USER_NOT_FOUND`: The specified user was not found
- `LEARNING_PATH_NOT_FOUND`: The specified learning path was not found
- `NO_APPROPRIATE_QUESTIONS`: No appropriate questions are available for the user's current progress
- `GENERATION_FAILED`: Failed to generate a question

#### `generateMultipleQuestions(request: QuestionRequest): Question[]`

Generates multiple questions based on the user's active learning path and progress.

**Parameters:**
- `request`: QuestionRequest object (as above, with optional `count` field)

**Returns:**
- An array of Question objects

**Errors:**
- Same as `generateQuestion`

#### `getNextQuestion(userId: string, learningPathId: string): Question`

Gets the next question for a user based on their learning path and progress.

**Parameters:**
- `userId`: User identifier
- `learningPathId`: Identifier for the active learning path

**Returns:**
- A Question object

**Errors:**
- Same as `generateQuestion`

#### `getQuestionSetInfo(userId: string, learningPathId: string): QuestionSetInfo`

Gets information about the current question set for a user and learning path.

**Parameters:**
- `userId`: User identifier
- `learningPathId`: Identifier for the learning path

**Returns:**
- A QuestionSetInfo object containing:
  - `totalQuestions`: Total number of questions available for the learning path
  - `completedQuestions`: Number of questions the user has completed
  - `masteredFacts`: Number of facts the user has mastered at level 5
  - `inProgressFacts`: Number of facts the user is currently learning
  - `averageBoundaryLevel`: Average boundary level across all facts

**Errors:**
- `USER_NOT_FOUND`: The specified user was not found
- `LEARNING_PATH_NOT_FOUND`: The specified learning path was not found

#### `formatQuestionText(factId: string, template: string): string`

Formats a question text template with the appropriate values.

**Parameters:**
- `factId`: Mathematical fact identifier
- `template`: Question text template

**Returns:**
- Formatted question text

**Errors:**
- `INVALID_FACT`: The specified fact is invalid or not found
- `INVALID_TEMPLATE`: The specified template is invalid

### Data Structures

#### `Question`
```typescript
{
  id: string;              // Unique identifier for the question
  factId: string;          // Mathematical fact identifier
  text: string;            // Question text to display to the user
  correctAnswer: string;   // The correct answer
  boundaryLevel: number;   // Boundary level (1-5) this question targets
  learningPathId: string;  // Identifier for the learning path
  operation: string;       // Mathematical operation (e.g., 'addition', 'multiplication')
  difficulty?: number;     // Difficulty rating (0.0-1.0)
  tags?: string[];         // Tags for categorizing the question
}
```

#### `QuestionRequest`
```typescript
{
  userId: string;              // User identifier
  learningPathId: string;      // Identifier for the active learning path
  preferredOperations?: string[]; // Preferred operations to focus on
  excludeFactIds?: string[];   // Fact IDs to exclude from selection
  maxDifficulty?: number;      // Maximum difficulty level (0.0-1.0)
  count?: number;              // Number of questions to generate (default: 1)
}
```

#### `QuestionSetInfo`
```typescript
{
  totalQuestions: number;      // Total number of questions available for the learning path
  completedQuestions: number;  // Number of questions the user has completed
  masteredFacts: number;       // Number of facts the user has mastered at level 5
  inProgressFacts: number;     // Number of facts the user is currently learning
  averageBoundaryLevel: number; // Average boundary level across all facts
}
```

## Performance Considerations

The QuestionGenerator is optimized for performance:

- Efficient question selection algorithms
- Caching of recent questions to prevent repetition
- Optimized data access patterns
- Performance target: < 30ms per question generation

## Error Handling

The component implements comprehensive error handling:

- Validation of all inputs
- Explicit error codes for different conditions
- Graceful handling of edge cases
- Detailed logging for troubleshooting

## Testing

The component includes comprehensive unit tests covering:

- Basic question generation
- Triple Helix learning path integration
- Boundary level selection
- Error handling
- Performance validation

Run tests with:
```
npm test
```

## Future Improvements

Potential areas for enhancement:

1. **Advanced Analytics**: Track question performance to further optimize selection
2. **Machine Learning Integration**: Implement predictive models for better question selection
3. **Expanded Question Types**: Support for more complex question formats
4. **Customizable Templates**: Allow for more dynamic question templates
5. **Performance Optimization**: Further improve generation speed for larger fact sets
