# FactRepository Implementation Package

## Implementation Goal and Component Context

The FactRepository component is responsible for storing and retrieving mathematical facts used in the learning process within the Zenjin Maths App. It serves as the central knowledge base for all mathematical operations, providing structured access to facts based on various criteria such as operation type, difficulty level, and relationships between facts.

This component is a critical part of the LearningEngine module, supporting the distinction-based learning approach by providing the foundational mathematical facts that other components like DistinctionManager, DistractorGenerator, and QuestionGenerator rely on to create appropriate learning experiences.

## Interface Definition

```typescript
/**
 * Interface for the FactRepository component that stores and retrieves mathematical facts
 */
export interface FactRepositoryInterface {
  /**
   * Gets a mathematical fact by its identifier
   * @param factId Fact identifier
   * @returns The mathematical fact
   * @throws Error if the fact is not found
   */
  getFactById(factId: string): MathematicalFact;
  
  /**
   * Queries mathematical facts based on criteria
   * @param query Query criteria
   * @returns Array of matching facts
   * @throws Error if the query is invalid
   */
  queryFacts(query: FactQuery): MathematicalFact[];
  
  /**
   * Gets facts related to a specific fact
   * @param factId Fact identifier
   * @param limit Maximum number of related facts to return (default: 10)
   * @returns Array of related facts
   * @throws Error if the fact is not found
   */
  getRelatedFacts(factId: string, limit?: number): MathematicalFact[];
  
  /**
   * Gets facts for a specific mathematical operation
   * @param operation Mathematical operation
   * @returns Array of facts for the operation
   * @throws Error if the operation is invalid
   */
  getFactsByOperation(operation: string): MathematicalFact[];
  
  /**
   * Gets the total count of facts in the repository
   * @param query Optional query criteria
   * @returns Number of facts matching the criteria
   * @throws Error if the query is invalid
   */
  getFactCount(query?: FactQuery): number;
}

/**
 * Represents a mathematical fact
 */
export interface MathematicalFact {
  /**
   * Unique identifier for the fact
   */
  id: string;
  
  /**
   * Mathematical operation (e.g., 'addition', 'multiplication')
   */
  operation: string;
  
  /**
   * Operands involved in the fact
   */
  operands: number[];
  
  /**
   * Result of the operation
   */
  result: number;
  
  /**
   * Inherent difficulty rating (0.0-1.0)
   */
  difficulty?: number;
  
  /**
   * IDs of related facts
   */
  relatedFactIds?: string[];
  
  /**
   * Tags for categorization
   */
  tags?: string[];
}

/**
 * Query criteria for facts
 */
export interface FactQuery {
  /**
   * Filter by operation
   */
  operation?: string;
  
  /**
   * Filter by difficulty range
   */
  difficulty?: {
    /**
     * Minimum difficulty
     */
    min?: number;
    
    /**
     * Maximum difficulty
     */
    max?: number;
  };
  
  /**
   * Filter by tags
   */
  tags?: string[];
  
  /**
   * Maximum number of results (default: 100)
   */
  limit?: number;
  
  /**
   * Result offset for pagination (default: 0)
   */
  offset?: number;
}
```

## Module Context

The FactRepository component is part of the LearningEngine module, which implements the distinction-based learning approach with five boundary levels and manages the generation of appropriate distractors for each question based on the user's current mastery level.

### Module Structure

The LearningEngine module consists of the following components:

1. **DistinctionManager**: Manages the boundary levels for distinctions in the learning process
2. **DistractorGenerator**: Generates appropriate distractors for questions
3. **QuestionGenerator**: Generates questions based on the user's current learning state
4. **FactRepository** (this component): Stores and retrieves mathematical facts

### Component Dependencies

The FactRepository component has no external dependencies, but other components in the LearningEngine module depend on it:

1. **DistinctionManager**: Uses facts to determine appropriate boundary levels
2. **DistractorGenerator**: Uses facts to generate appropriate distractors
3. **QuestionGenerator**: Uses facts to generate questions

## Implementation Requirements

### Data Storage and Retrieval

1. **Efficient Fact Storage**
   - Implement an efficient in-memory storage structure for mathematical facts
   - Organize facts by operation type for quick retrieval
   - Support indexing by fact ID for direct access
   - Implement efficient filtering mechanisms for query operations

2. **Fact Relationships**
   - Maintain relationships between related facts
   - Support efficient retrieval of related facts
   - Implement relationship strength or relevance scoring (optional)

3. **Performance Optimization**
   - Optimize for fast retrieval of frequently accessed facts
   - Implement caching mechanisms where appropriate
   - Ensure O(1) lookup for fact retrieval by ID
   - Optimize query performance for filtering operations

### Mathematical Operations Support

1. **Core Operations**
   - Support addition facts (e.g., 2+3=5)
   - Support subtraction facts (e.g., 5-3=2)
   - Support multiplication facts (e.g., 3×4=12)
   - Support division facts (e.g., 12÷4=3)

2. **Extended Operations (Optional)**
   - Support exponentiation facts (e.g., 2^3=8)
   - Support square root facts (e.g., √9=3)
   - Support fraction facts (e.g., 1/2+1/4=3/4)
   - Support decimal facts (e.g., 0.1+0.2=0.3)

3. **Fact Generation**
   - Implement automatic generation of basic facts
   - Support custom fact addition for specialized learning paths
   - Ensure consistency in fact representation

### Difficulty Rating

1. **Difficulty Calculation**
   - Implement a consistent algorithm for calculating fact difficulty
   - Consider operand size, operation complexity, and cognitive load
   - Support custom difficulty overrides for specific facts

2. **Difficulty Ranges**
   - Support filtering by difficulty ranges
   - Implement consistent difficulty distribution across operations
   - Ensure appropriate progression of difficulty within each operation

### Error Handling

1. **Robust Error Management**
   - Implement comprehensive error handling for all methods
   - Provide detailed error messages for debugging
   - Handle edge cases gracefully

2. **Validation**
   - Validate all inputs to prevent invalid operations
   - Ensure query parameters are within acceptable ranges
   - Validate fact consistency during creation or update

## Mock Inputs and Expected Outputs

### getFactById

**Input:**
```typescript
const factId = "mult-7-8";
```

**Expected Output:**
```typescript
{
  id: "mult-7-8",
  operation: "multiplication",
  operands: [7, 8],
  result: 56,
  difficulty: 0.65,
  relatedFactIds: ["mult-8-7", "mult-7-7", "mult-8-8", "div-56-7", "div-56-8"],
  tags: ["multiplication", "times-tables", "level-3"]
}
```

### queryFacts

**Input:**
```typescript
const query = {
  operation: "multiplication",
  difficulty: {
    min: 0.3,
    max: 0.7
  },
  limit: 3
};
```

**Expected Output:**
```typescript
[
  {
    id: "mult-5-6",
    operation: "multiplication",
    operands: [5, 6],
    result: 30,
    difficulty: 0.45,
    relatedFactIds: ["mult-6-5", "mult-5-5", "mult-6-6", "div-30-5", "div-30-6"],
    tags: ["multiplication", "times-tables", "level-2"]
  },
  {
    id: "mult-7-4",
    operation: "multiplication",
    operands: [7, 4],
    result: 28,
    difficulty: 0.5,
    relatedFactIds: ["mult-4-7", "mult-7-3", "mult-4-4", "div-28-7", "div-28-4"],
    tags: ["multiplication", "times-tables", "level-2"]
  },
  {
    id: "mult-6-8",
    operation: "multiplication",
    operands: [6, 8],
    result: 48,
    difficulty: 0.6,
    relatedFactIds: ["mult-8-6", "mult-6-6", "mult-8-8", "div-48-6", "div-48-8"],
    tags: ["multiplication", "times-tables", "level-3"]
  }
]
```

### getRelatedFacts

**Input:**
```typescript
const factId = "add-7-8";
const limit = 2;
```

**Expected Output:**
```typescript
[
  {
    id: "add-8-7",
    operation: "addition",
    operands: [8, 7],
    result: 15,
    difficulty: 0.4,
    relatedFactIds: ["add-7-8", "sub-15-7", "sub-15-8"],
    tags: ["addition", "level-2"]
  },
  {
    id: "sub-15-7",
    operation: "subtraction",
    operands: [15, 7],
    result: 8,
    difficulty: 0.45,
    relatedFactIds: ["add-7-8", "add-8-7", "sub-15-8"],
    tags: ["subtraction", "level-2"]
  }
]
```

### getFactsByOperation

**Input:**
```typescript
const operation = "division";
```

**Expected Output:**
```typescript
[
  {
    id: "div-10-2",
    operation: "division",
    operands: [10, 2],
    result: 5,
    difficulty: 0.3,
    relatedFactIds: ["mult-5-2", "div-10-5"],
    tags: ["division", "level-2"]
  },
  {
    id: "div-12-3",
    operation: "division",
    operands: [12, 3],
    result: 4,
    difficulty: 0.35,
    relatedFactIds: ["mult-4-3", "div-12-4"],
    tags: ["division", "level-2"]
  },
  // Additional division facts...
]
```

### getFactCount

**Input:**
```typescript
const query = {
  operation: "addition",
  difficulty: {
    max: 0.3
  }
};
```

**Expected Output:**
```typescript
15
```

## Error Scenarios

### Fact Not Found

**Input:**
```typescript
const factId = "nonexistent-fact";
```

**Expected Error:**
```
Error: FACT_NOT_FOUND - The specified fact was not found
```

### Invalid Operation

**Input:**
```typescript
const operation = "invalid-operation";
```

**Expected Error:**
```
Error: INVALID_OPERATION - The specified operation is invalid
```

### Invalid Query

**Input:**
```typescript
const query = {
  difficulty: {
    min: 2.0,
    max: 0.5
  }
};
```

**Expected Error:**
```
Error: INVALID_QUERY - Invalid difficulty range: min cannot be greater than max
```

## Validation Criteria

### LE-004: Fact Repository Functionality

The FactRepository component must provide efficient storage and retrieval of mathematical facts for use in the learning process. This means:

1. All mathematical facts must be consistently structured and accessible
2. Retrieval of facts must be fast and efficient
3. Relationships between facts must be maintained
4. Difficulty ratings must be consistent and appropriate
5. The repository must support all required mathematical operations

## Implementation Notes

### Fact Storage Strategy

The implementation should use an efficient in-memory storage strategy:

```typescript
class FactRepository implements FactRepositoryInterface {
  private facts: Map<string, MathematicalFact> = new Map();
  private operationIndex: Map<string, Set<string>> = new Map();
  private difficultyIndex: Map<string, number> = new Map();
  private tagIndex: Map<string, Set<string>> = new Map();
  
  constructor() {
    this.initializeRepository();
  }
  
  private initializeRepository(): void {
    // Initialize with basic mathematical facts
    this.addBasicAdditionFacts();
    this.addBasicSubtractionFacts();
    this.addBasicMultiplicationFacts();
    this.addBasicDivisionFacts();
    
    // Build indexes for efficient querying
    this.buildIndexes();
  }
  
  private addBasicAdditionFacts(): void {
    // Add addition facts for numbers 0-20
    for (let a = 0; a <= 10; a++) {
      for (let b = 0; b <= 10; b++) {
        const result = a + b;
        const id = `add-${a}-${b}`;
        const difficulty = this.calculateAdditionDifficulty(a, b);
        
        const fact: MathematicalFact = {
          id,
          operation: 'addition',
          operands: [a, b],
          result,
          difficulty,
          relatedFactIds: [
            `add-${b}-${a}`, // Commutative property
            `sub-${result}-${a}`, // Inverse operation
            `sub-${result}-${b}` // Inverse operation
          ],
          tags: ['addition', this.getDifficultyLevel(difficulty)]
        };
        
        this.facts.set(id, fact);
      }
    }
  }
  
  // Similar methods for other operations...
  
  private calculateAdditionDifficulty(a: number, b: number): number {
    // Simple algorithm for addition difficulty
    // Consider factors like:
    // - Size of operands
    // - Whether it crosses 10
    // - Whether it involves 0 or 1 (easier)
    
    let difficulty = 0.1; // Base difficulty
    
    // Larger numbers are more difficult
    difficulty += (a + b) / 100;
    
    // Crossing 10 is more difficult
    if ((a < 10 && b < 10 && a + b >= 10) || 
        (a < 20 && b < 20 && a + b >= 20)) {
      difficulty += 0.2;
    }
    
    // Operations with 0 or 1 are easier
    if (a === 0 || b === 0) {
      difficulty -= 0.05;
    }
    if (a === 1 || b === 1) {
      difficulty -= 0.03;
    }
    
    // Ensure difficulty is within bounds
    return Math.max(0.1, Math.min(0.9, difficulty));
  }
  
  // Similar calculation methods for other operations...
  
  private getDifficultyLevel(difficulty: number): string {
    if (difficulty < 0.2) return 'level-1';
    if (difficulty < 0.4) return 'level-2';
    if (difficulty < 0.6) return 'level-3';
    if (difficulty < 0.8) return 'level-4';
    return 'level-5';
  }
  
  private buildIndexes(): void {
    // Clear existing indexes
    this.operationIndex.clear();
    this.difficultyIndex.clear();
    this.tagIndex.clear();
    
    // Build indexes for efficient querying
    for (const [id, fact] of this.facts.entries()) {
      // Operation index
      if (!this.operationIndex.has(fact.operation)) {
        this.operationIndex.set(fact.operation, new Set());
      }
      this.operationIndex.get(fact.operation)!.add(id);
      
      // Difficulty index
      this.difficultyIndex.set(id, fact.difficulty || 0.5);
      
      // Tag index
      if (fact.tags) {
        for (const tag of fact.tags) {
          if (!this.tagIndex.has(tag)) {
            this.tagIndex.set(tag, new Set());
          }
          this.tagIndex.get(tag)!.add(id);
        }
      }
    }
  }
  
  // Interface method implementations...
}
```

### Query Optimization

Implement efficient querying with indexes:

```typescript
class FactRepository implements FactRepositoryInterface {
  // ... previous code ...
  
  public queryFacts(query: FactQuery): MathematicalFact[] {
    // Validate query
    this.validateQuery(query);
    
    // Start with all fact IDs
    let candidateIds: Set<string> = new Set(this.facts.keys());
    
    // Filter by operation (most selective filter first)
    if (query.operation) {
      const operationIds = this.operationIndex.get(query.operation);
      if (!operationIds) {
        return []; // No facts for this operation
      }
      candidateIds = new Set(
        [...candidateIds].filter(id => operationIds.has(id))
      );
    }
    
    // Filter by tags
    if (query.tags && query.tags.length > 0) {
      for (const tag of query.tags) {
        const tagIds = this.tagIndex.get(tag);
        if (!tagIds) {
          return []; // No facts with this tag
        }
        candidateIds = new Set(
          [...candidateIds].filter(id => tagIds.has(id))
        );
      }
    }
    
    // Filter by difficulty
    if (query.difficulty) {
      const min = query.difficulty.min ?? 0;
      const max = query.difficulty.max ?? 1;
      
      candidateIds = new Set(
        [...candidateIds].filter(id => {
          const difficulty = this.difficultyIndex.get(id) ?? 0.5;
          return difficulty >= min && difficulty <= max;
        })
      );
    }
    
    // Convert IDs to facts
    let results = [...candidateIds]
      .map(id => this.facts.get(id)!)
      .sort((a, b) => (a.difficulty || 0.5) - (b.difficulty || 0.5));
    
    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 100;
    
    return results.slice(offset, offset + limit);
  }
  
  private validateQuery(query: FactQuery): void {
    // Validate operation
    if (query.operation && !this.operationIndex.has(query.operation)) {
      throw new Error(`INVALID_OPERATION - The specified operation is invalid`);
    }
    
    // Validate difficulty range
    if (query.difficulty) {
      const min = query.difficulty.min ?? 0;
      const max = query.difficulty.max ?? 1;
      
      if (min < 0 || min > 1) {
        throw new Error(`INVALID_QUERY - Difficulty min must be between 0 and 1`);
      }
      
      if (max < 0 || max > 1) {
        throw new Error(`INVALID_QUERY - Difficulty max must be between 0 and 1`);
      }
      
      if (min > max) {
        throw new Error(`INVALID_QUERY - Invalid difficulty range: min cannot be greater than max`);
      }
    }
    
    // Validate pagination
    if (query.offset !== undefined && query.offset < 0) {
      throw new Error(`INVALID_QUERY - Offset cannot be negative`);
    }
    
    if (query.limit !== undefined && query.limit <= 0) {
      throw new Error(`INVALID_QUERY - Limit must be positive`);
    }
  }
  
  // ... other methods ...
}
```

### Related Facts Retrieval

Implement efficient retrieval of related facts:

```typescript
class FactRepository implements FactRepositoryInterface {
  // ... previous code ...
  
  public getRelatedFacts(factId: string, limit: number = 10): MathematicalFact[] {
    // Get the fact
    const fact = this.getFactById(factId);
    
    // Get related fact IDs
    const relatedIds = fact.relatedFactIds || [];
    
    // Get related facts
    const relatedFacts = relatedIds
      .map(id => {
        try {
          return this.getFactById(id);
        } catch (error) {
          // Skip facts that don't exist
          return null;
        }
      })
      .filter((f): f is MathematicalFact => f !== null);
    
    // Sort by relevance (could be enhanced with a relevance algorithm)
    // For now, just sort by difficulty similarity
    const factDifficulty = fact.difficulty || 0.5;
    relatedFacts.sort((a, b) => {
      const diffA = Math.abs((a.difficulty || 0.5) - factDifficulty);
      const diffB = Math.abs((b.difficulty || 0.5) - factDifficulty);
      return diffA - diffB;
    });
    
    // Apply limit
    return relatedFacts.slice(0, limit);
  }
  
  // ... other methods ...
}
```

### Fact Generation Strategy

For automatic generation of facts:

```typescript
class FactRepository implements FactRepositoryInterface {
  // ... previous code ...
  
  private generateMultiplicationFacts(): void {
    // Generate multiplication facts for numbers 0-12
    for (let a = 0; a <= 12; a++) {
      for (let b = 0; b <= 12; b++) {
        const result = a * b;
        const id = `mult-${a}-${b}`;
        const difficulty = this.calculateMultiplicationDifficulty(a, b);
        
        // Create related fact IDs
        const relatedFactIds: string[] = [
          `mult-${b}-${a}`, // Commutative property
        ];
        
        // Add division as related fact
        if (result !== 0) {
          relatedFactIds.push(`div-${result}-${a}`);
          relatedFactIds.push(`div-${result}-${b}`);
        }
        
        // Add nearby facts
        if (a > 0) relatedFactIds.push(`mult-${a-1}-${b}`);
        if (b > 0) relatedFactIds.push(`mult-${a}-${b-1}`);
        relatedFactIds.push(`mult-${a+1}-${b}`);
        relatedFactIds.push(`mult-${a}-${b+1}`);
        
        const fact: MathematicalFact = {
          id,
          operation: 'multiplication',
          operands: [a, b],
          result,
          difficulty,
          relatedFactIds,
          tags: ['multiplication', 'times-tables', this.getDifficultyLevel(difficulty)]
        };
        
        this.facts.set(id, fact);
      }
    }
  }
  
  private calculateMultiplicationDifficulty(a: number, b: number): number {
    // Simple algorithm for multiplication difficulty
    // Consider factors like:
    // - Size of operands
    // - Whether it involves 0, 1, or 10 (easier)
    // - Whether it's a square number
    
    let difficulty = 0.2; // Base difficulty
    
    // Larger numbers are more difficult
    difficulty += (a * b) / 200;
    
    // Operations with 0, 1, or 10 are easier
    if (a === 0 || b === 0) {
      difficulty = 0.1; // Very easy
      return difficulty;
    }
    
    if (a === 1 || b === 1) {
      difficulty = 0.15; // Easy
      return difficulty;
    }
    
    if (a === 10 || b === 10) {
      difficulty = 0.2; // Relatively easy
      return difficulty;
    }
    
    // Square numbers are slightly easier to remember
    if (a === b) {
      difficulty -= 0.05;
    }
    
    // Ensure difficulty is within bounds
    return Math.max(0.1, Math.min(0.9, difficulty));
  }
  
  // ... other methods ...
}
```

## Usage Example

```typescript
// Example usage of FactRepository
import { FactRepository } from './engines/FactRepository';

// Create fact repository
const factRepository = new FactRepository();

// Get a fact by ID
try {
  const fact = factRepository.getFactById('mult-7-8');
  console.log(`Fact: ${fact.operands[0]} × ${fact.operands[1]} = ${fact.result}`);
  console.log(`Difficulty: ${fact.difficulty}`);
  console.log(`Tags: ${fact.tags?.join(', ')}`);
} catch (error) {
  console.error(`Error retrieving fact: ${error.message}`);
}

// Query facts by criteria
try {
  const multiplicationFacts = factRepository.queryFacts({
    operation: 'multiplication',
    difficulty: { min: 0.3, max: 0.7 },
    limit: 5
  });

  console.log(`Found ${multiplicationFacts.length} multiplication facts:`);
  multiplicationFacts.forEach(fact => {
    console.log(`${fact.operands[0]} × ${fact.operands[1]} = ${fact.result} (difficulty: ${fact.difficulty})`);
  });
} catch (error) {
  console.error(`Error querying facts: ${error.message}`);
}

// Get related facts
try {
  const relatedFacts = factRepository.getRelatedFacts('mult-7-8', 3);
  console.log(`Related facts to 7 × 8 = 56:`);
  relatedFacts.forEach(fact => {
    if (fact.operation === 'multiplication') {
      console.log(`${fact.operands[0]} × ${fact.operands[1]} = ${fact.result}`);
    } else if (fact.operation === 'division') {
      console.log(`${fact.operands[0]} ÷ ${fact.operands[1]} = ${fact.result}`);
    }
  });
} catch (error) {
  console.error(`Error retrieving related facts: ${error.message}`);
}

// Get facts by operation
try {
  const additionFacts = factRepository.getFactsByOperation('addition');
  console.log(`Addition facts: ${additionFacts.length}`);
  
  // Show first 5 addition facts
  additionFacts.slice(0, 5).forEach(fact => {
    console.log(`${fact.operands[0]} + ${fact.operands[1]} = ${fact.result}`);
  });
} catch (error) {
  console.error(`Error retrieving facts by operation: ${error.message}`);
}

// Get fact count
try {
  const totalFacts = factRepository.getFactCount();
  console.log(`Total facts in repository: ${totalFacts}`);
  
  const easyAdditionFacts = factRepository.getFactCount({
    operation: 'addition',
    difficulty: { max: 0.3 }
  });
  console.log(`Easy addition facts: ${easyAdditionFacts}`);
} catch (error) {
  console.error(`Error getting fact count: ${error.message}`);
}
```

## Implementation Considerations

### Performance Optimization

For optimal performance:

1. **Indexing Strategy**
   - Use multiple indexes for different query patterns
   - Optimize index updates when facts are added or modified
   - Consider memory usage vs. query performance tradeoffs

2. **Memory Management**
   - Implement lazy loading for large fact sets
   - Consider using WeakMap for related facts to allow garbage collection
   - Monitor memory usage and implement cleanup strategies if needed

3. **Query Optimization**
   - Apply filters in order of selectivity (most selective first)
   - Use Set operations for efficient filtering
   - Implement pagination for large result sets

### Extensibility

To support future extensions:

1. **Custom Fact Types**
   - Design the system to allow addition of new operation types
   - Support custom difficulty calculation algorithms
   - Allow extension of the fact structure for specialized operations

2. **Integration with External Systems**
   - Consider implementing import/export functionality
   - Support synchronization with server-side repositories
   - Allow for dynamic fact updates based on learning analytics

### Testing Strategy

The implementation should be tested with:

1. **Unit Tests**
   - Test each method with various inputs
   - Verify correct error handling
   - Test performance with large fact sets

2. **Integration Tests**
   - Test integration with DistinctionManager
   - Test integration with DistractorGenerator
   - Test integration with QuestionGenerator

3. **Performance Tests**
   - Measure query performance with large fact sets
   - Test memory usage under various conditions
   - Verify scaling characteristics
