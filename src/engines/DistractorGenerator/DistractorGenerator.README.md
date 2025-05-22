# DistractorGenerator Component

## Overview

The DistractorGenerator is a critical component of the Zenjin Maths App's LearningEngine module. It generates appropriate distractors (incorrect answer options) for mathematical facts based on specific boundary levels of knowledge, supporting the distinction-based learning approach.

The component generates distractors that specifically target five boundary levels:

1. **Category Boundaries (Level 1)**: Non-numerical distractors (e.g., "Fish" instead of 56)
2. **Magnitude Boundaries (Level 2)**: Numerical distractors with incorrect magnitude (e.g., 784 instead of 56)
3. **Operation Boundaries (Level 3)**: Results from incorrect operation (e.g., 7 + 8 = 15 instead of 7 × 8 = 56)
4. **Related Fact Boundaries (Level 4)**: Results from adjacent facts (e.g., 7 × 9 = 63 instead of 7 × 8 = 56)
5. **Near Miss Boundaries (Level 5)**: Very similar numerical answers (e.g., 54 instead of 56)

## Features

- Generation of appropriate distractors for each boundary level
- Support for multiple mathematical operations (addition, subtraction, multiplication, division)
- Ability to generate multiple unique distractors for a single fact and boundary level
- Validation of distractors to ensure they are appropriate for the specified boundary level
- Detailed explanations for why specific distractors were chosen
- Performance optimization to ensure distractor generation completes within 50ms

## Implementation Details

The DistractorGenerator is implemented in TypeScript and includes:

- Comprehensive error handling for invalid inputs
- Extensive validation to ensure distractors are appropriate for each boundary level
- Type-safe interfaces and data structures
- Well-documented code with comments explaining implementation details

### Core Methods

1. **generateDistractor**: Generates a single distractor based on the boundary level and mathematical fact
2. **generateMultipleDistractors**: Generates multiple unique distractors for a fact and boundary level
3. **getDistractorExplanation**: Provides explanations for why a distractor was chosen
4. **validateDistractor**: Validates whether a distractor is appropriate for a given boundary level and fact

### Data Structures

- **DistractorRequest**: Represents a request for generating distractors
- **Distractor**: Contains information about a generated distractor, including its value, boundary level, explanation, and difficulty rating

## Usage Examples

```typescript
// Create an instance of the DistractorGenerator
const distractorGenerator = new DistractorGenerator();

// Generate a distractor for a multiplication fact at boundary level 5 (Near Miss)
const distractor = distractorGenerator.generateDistractor({
  factId: 'mult-7-8',
  boundaryLevel: 5,
  correctAnswer: '56'
});

console.log(`Distractor: ${distractor.value}`);
console.log(`Boundary Level: ${distractor.boundaryLevel}`);
console.log(`Explanation: ${distractor.explanation}`);

// Generate multiple distractors for an addition fact at boundary level 3 (Operation)
const distractors = distractorGenerator.generateMultipleDistractors({
  factId: 'add-24-18',
  boundaryLevel: 3,
  correctAnswer: '42',
  count: 3
});

distractors.forEach((d, index) => {
  console.log(`Distractor ${index + 1}: ${d.value}`);
});

// Get explanation for a specific distractor
const explanation = distractorGenerator.getDistractorExplanation(
  'mult-7-8',
  '54',
  5
);

console.log(`Explanation: ${explanation}`);

// Validate a distractor
const validationResult = distractorGenerator.validateDistractor(
  'mult-7-8',
  '54',
  5,
  '56'
);

console.log(`Is valid: ${validationResult.isValid}`);
console.log(`Reason: ${validationResult.reason}`);
```

## Testing

The DistractorGenerator component includes a comprehensive test suite that:

- Verifies the generation of appropriate distractors for each boundary level
- Tests error handling for invalid inputs
- Validates the explanations provided for distractors
- Ensures performance requirements are met (distractor generation within 50ms)
- Tests edge cases and different operation types

## Boundary Level Details

Understanding the five boundary levels is crucial to understanding how the DistractorGenerator works:

1. **Category Boundaries (Level 1)**:
   - Tests whether the learner understands the basic category of the answer
   - Distractors are completely unrelated to the correct answer (e.g., words, symbols)

2. **Magnitude Boundaries (Level 2)**:
   - Tests whether the learner understands the approximate size of the answer
   - Distractors are numerical but of a completely different magnitude

3. **Operation Boundaries (Level 3)**:
   - Tests whether the learner understands which operation to apply
   - Distractors are the results of applying the wrong operation to the same numbers

4. **Related Fact Boundaries (Level 4)**:
   - Tests whether the learner can distinguish between related facts
   - Distractors are the results of similar but different facts

5. **Near Miss Boundaries (Level 5)**:
   - Tests whether the learner has precise knowledge of the exact answer
   - Distractors are very close to the correct answer

## Integration with the Zenjin Maths App

The DistractorGenerator is a key component of the LearningEngine module, supporting the distinction-based learning approach. It interacts with:

1. **FactRepository**: To retrieve information about mathematical facts
2. **DistinctionManager**: To understand the boundary levels and how they apply to specific facts

By generating appropriate distractors for each boundary level, the DistractorGenerator helps the Zenjin Maths App identify precisely where a learner's understanding breaks down, enabling targeted instruction and practice.
