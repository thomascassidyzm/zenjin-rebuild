# FactRepository Component

## Overview

The FactRepository component is a core part of the Zenjin Maths App's LearningEngine module. It stores and retrieves mathematical facts used in the learning process, serving as the central knowledge base for all mathematical operations. This component provides structured access to facts based on various criteria such as operation type, difficulty level, and relationships between facts.

## Files

The component consists of three main files:

1. **fact-repository.ts** - The main implementation of the FactRepository class
2. **fact-repository-types.ts** - Type definitions and interfaces used by the repository
3. **fact-repository-utils.ts** - Utility functions for working with mathematical facts

## Features

- **Efficient Storage**: In-memory storage structure optimized for quick retrieval
- **Multiple Operations**: Support for addition, subtraction, multiplication, and division facts
- **Extended Range**: Support for:
  - Times tables up to 20 × 20
  - Addition and subtraction facts up to 100
  - Doubling facts for numbers up to 100
  - Halving facts for even numbers up to 100
- **Difficulty Rating**: Consistent algorithm for calculating fact difficulty
- **Related Facts**: Tracking of relationships between mathematical facts
- **Efficient Querying**: Indexing and filtering mechanisms for optimized searches
- **Fact Categorization**: Special tags for doubling, halving, and times tables
- **Error Handling**: Comprehensive validation and error reporting

## Usage Examples

### Basic Usage

```typescript
import { FactRepository } from './fact-repository';

// Create a repository instance
const factRepository = new FactRepository();

// Get a specific fact by ID
const fact = factRepository.getFactById('mult-7-8');
console.log(`${fact.operands[0]} × ${fact.operands[1]} = ${fact.result}`);
```

### Querying Facts

```typescript
// Query facts by criteria
const multiplicationFacts = factRepository.queryFacts({
  operation: 'multiplication',
  difficulty: { min: 0.3, max: 0.7 },
  limit: 5
});

console.log(`Found ${multiplicationFacts.length} multiplication facts in the medium difficulty range`);
```

### Finding Related Facts

```typescript
// Get facts related to a specific fact
const relatedFacts = factRepository.getRelatedFacts('add-7-8', 3);
console.log(`Facts related to 7 + 8 = 15:`);

relatedFacts.forEach(fact => {
  if (fact.operation === 'addition') {
    console.log(`${fact.operands[0]} + ${fact.operands[1]} = ${fact.result}`);
  } else if (fact.operation === 'subtraction') {
    console.log(`${fact.operands[0]} - ${fact.operands[1]} = ${fact.result}`);
  }
});
```

### Working with Specialized Fact Types

```typescript
import { FactRepository } from './fact-repository';
import { groupFactsByType } from './fact-repository-utils';

// Create a repository instance
const factRepository = new FactRepository();

// Get all doubling facts
const doublingFacts = factRepository.queryFacts({
  tags: ['doubling']
});

console.log(`Found ${doublingFacts.length} doubling facts`);

// Group facts by type
const facts = factRepository.queryFacts({ limit: 500 });
const groupedFacts = groupFactsByType(facts);

console.log(`Doubling facts: ${groupedFacts.doubling.length}`);
console.log(`Halving facts: ${groupedFacts.halving.length}`);
console.log(`Times tables: ${groupedFacts['times-tables'].length}`);
```

## Integration with LearningEngine

The FactRepository component is designed to work with other components in the LearningEngine module:

1. **DistinctionManager**: Uses facts to determine appropriate boundary levels
2. **DistractorGenerator**: Uses facts to generate appropriate distractors
3. **QuestionGenerator**: Uses facts to generate questions

## Performance Considerations

- The repository uses multiple indexes for efficient querying
- Fact retrieval by ID is optimized for O(1) performance
- Queries are optimized by applying the most selective filters first
- Memory usage is managed by selectively storing facts for large ranges
- The repository provides pagination support for large result sets

## Error Handling

The component provides clear error messages for common issues:

- `FACT_NOT_FOUND`: When a requested fact doesn't exist
- `INVALID_OPERATION`: When an unsupported operation is specified
- `INVALID_QUERY`: When query parameters are invalid

## Extensibility

The component can be extended to support:

- Additional mathematical operations (exponentiation, square roots, etc.)
- Custom difficulty calculation algorithms
- Integration with external data sources
- Import/export functionality for curriculum management
- Custom fact generation strategies

## Implementation Notes

The FactRepository implementation initializes with a comprehensive set of mathematical facts covering:

- Addition facts for numbers 0-100 (with optimizations for memory usage)
- Subtraction facts for numbers 0-100 (with optimizations for memory usage)
- Multiplication facts for times tables 0-20
- Division facts derived from multiplication facts
- Special facts for doubling numbers up to 100
- Special facts for halving even numbers up to 100

Each fact is assigned a difficulty rating based on cognitive load factors such as operand size, operation complexity, and special cases (e.g., operations involving 0, 1, or 10).
