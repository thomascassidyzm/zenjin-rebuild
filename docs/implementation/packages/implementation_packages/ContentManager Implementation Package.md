# ContentManager Implementation Package

## Implementation Goal and Component Context

The ContentManager component is responsible for providing administrative interfaces to create, import, export, and manage mathematical facts and curriculum content within the Zenjin Maths App. It builds on top of the FactRepository component, which handles the storage and retrieval of mathematical facts, to provide higher-level functionality for curriculum management.

This component enables educational content creators and administrators to efficiently manage mathematical content without needing to directly interact with the underlying data structures. It supports bulk operations, relationship generation, and difficulty calculations, making it ideal for preparing and maintaining curriculum content.

## Interface Definition

```typescript
/**
 * Interface for the ContentManager component that manages curriculum content
 */
export interface ContentManagerInterface {
  /**
   * Creates a new mathematical fact
   * @param factInput Fact data to create
   * @returns The created mathematical fact
   * @throws Error if the fact data is invalid
   */
  createFact(factInput: MathematicalFactInput): MathematicalFact;
  
  /**
   * Updates an existing mathematical fact
   * @param factId ID of the fact to update
   * @param factUpdates Fact data updates
   * @returns The updated mathematical fact
   * @throws Error if the fact is not found or the updated data is invalid
   */
  updateFact(factId: string, factUpdates: Partial<MathematicalFactInput>): MathematicalFact;
  
  /**
   * Deletes a mathematical fact
   * @param factId ID of the fact to delete
   * @returns Whether the deletion was successful
   * @throws Error if the fact is not found or is in use
   */
  deleteFact(factId: string): boolean;
  
  /**
   * Imports curriculum content from JSON format
   * @param jsonData JSON curriculum data
   * @param options Import options
   * @returns Import operation result
   * @throws Error if the JSON or curriculum structure is invalid
   */
  importCurriculum(jsonData: string, options?: ImportOptions): Promise<ImportResult>;
  
  /**
   * Exports curriculum content to JSON format
   * @param curriculumName Name for the exported curriculum
   * @param description Description of the curriculum
   * @param query Optional query to filter facts to export
   * @returns JSON curriculum data
   * @throws Error if export fails
   */
  exportCurriculum(curriculumName: string, description?: string, query?: FactQuery): Promise<string>;
  
  /**
   * Automatically generates relationships between facts
   * @param factIds IDs of facts to process (all if not specified)
   * @param relationshipTypes Types of relationships to generate
   * @returns Number of facts updated with new relationships
   * @throws Error if generation fails
   */
  generateFactRelationships(factIds?: string[], relationshipTypes?: string[]): Promise<number>;
  
  /**
   * Automatically calculates difficulty ratings for facts
   * @param factIds IDs of facts to process (all if not specified)
   * @param algorithm Difficulty calculation algorithm to use
   * @returns Number of facts updated with new difficulty ratings
   * @throws Error if calculation fails or algorithm is invalid
   */
  generateDifficultyRatings(factIds?: string[], algorithm?: string): Promise<number>;
  
  /**
   * Lists available curriculum sets
   * @param tags Filter by tags
   * @returns Available curriculum sets
   * @throws Error if listing fails
   */
  listCurriculumSets(tags?: string[]): CurriculumMetadata[];
  
  /**
   * Gets a specific curriculum set
   * @param curriculumId Curriculum identifier
   * @returns The curriculum data
   * @throws Error if the curriculum is not found
   */
  getCurriculumSet(curriculumId: string): Curriculum;
}

/**
 * Curriculum metadata
 */
export interface CurriculumMetadata {
  /**
   * Unique identifier for the curriculum
   */
  id: string;
  
  /**
   * Name of the curriculum
   */
  name: string;
  
  /**
   * Description of the curriculum content
   */
  description: string;
  
  /**
   * Version of the curriculum
   */
  version: string;
  
  /**
   * Creation timestamp (ISO format)
   */
  createdAt: string;
  
  /**
   * Last update timestamp (ISO format)
   */
  updatedAt: string;
  
  /**
   * Tags for categorization
   */
  tags?: string[];
}

/**
 * Curriculum with facts
 */
export interface Curriculum {
  /**
   * Curriculum metadata
   */
  metadata: CurriculumMetadata;
  
  /**
   * Mathematical facts in this curriculum
   */
  facts: MathematicalFact[];
}

/**
 * Input for creating a mathematical fact
 */
export interface MathematicalFactInput {
  /**
   * Unique identifier for the fact (auto-generated if not provided)
   */
  id?: string;
  
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
 * Import options
 */
export interface ImportOptions {
  /**
   * Whether to replace existing facts
   */
  replaceExisting?: boolean;
  
  /**
   * Only validate without importing
   */
  validateOnly?: boolean;
}

/**
 * Import operation result
 */
export interface ImportResult {
  /**
   * Whether the import was successful
   */
  success: boolean;
  
  /**
   * Number of facts imported
   */
  importedCount: number;
  
  /**
   * Number of facts skipped
   */
  skippedCount: number;
  
  /**
   * Number of errors encountered
   */
  errorCount: number;
  
  /**
   * Name of the imported curriculum
   */
  curriculumName?: string;
  
  /**
   * Error messages for failed imports
   */
  errors?: string[];
  
  /**
   * Summary message of the import operation
   */
  message: string;
}
```

## Module Context

The ContentManager component is part of the LearningEngine module, which implements the distinction-based learning approach and manages the learning experience for users.

### Module Structure

The LearningEngine module consists of the following components:

1. **DistinctionManager**: Manages the boundary levels for distinctions in the learning process
2. **DistractorGenerator**: Generates appropriate distractors for questions
3. **QuestionGenerator**: Generates questions based on the user's current learning state
4. **FactRepository**: Stores and retrieves mathematical facts
5. **ContentManager** (this component): Manages curriculum content for administrators

### Component Dependencies

The ContentManager component depends on:

1. **FactRepository**: Used for storing and retrieving the mathematical facts

## Implementation Requirements

### Content Management

1. **Fact Creation and Management**
   - Support creation of individual facts with validation
   - Support updating existing facts
   - Support deletion of facts (with safeguards for facts in use)
   - Generate unique IDs for facts when not provided

2. **Curriculum Import/Export**
   - Parse and validate JSON curriculum content
   - Handle bulk importing of facts
   - Export facts as structured curriculum content
   - Support filtering of facts during export

3. **Relationship Management**
   - Automatically generate relationships between facts
   - Support different types of relationships (e.g., commutative, inverse)
   - Update relationship references across facts

4. **Difficulty Calculation**
   - Implement algorithms for calculating fact difficulty
   - Support recalculation of difficulty ratings
   - Ensure consistent difficulty distribution

### Administration

1. **Curriculum Management**
   - Maintain metadata about available curriculum sets
   - Support tagging and categorization of curriculum sets
   - Provide listing and retrieval of curriculum sets

2. **Validation and Error Handling**
   - Validate fact structure and relationships
   - Provide detailed error reporting for invalid content
   - Support validation-only mode for curriculum checking

3. **Performance Optimization**
   - Optimize bulk operations for large curriculum sets
   - Implement asynchronous processing for long-running operations
   - Minimize memory usage during import/export

## Mock Inputs and Expected Outputs

### createFact

**Input:**
```typescript
const factInput = {
  operation: 'multiplication',
  operands: [7, 8],
  result: 56,
  tags: ['multiplication', 'times-tables']
};
```

**Expected Output:**
```typescript
{
  id: "mult-7-8",
  operation: "multiplication",
  operands: [7, 8],
  result: 56,
  difficulty: 0.65,
  relatedFactIds: ["mult-8-7", "div-56-7", "div-56-8"],
  tags: ["multiplication", "times-tables", "level-3"]
}
```

### updateFact

**Input:**
```typescript
const factId = "mult-7-8";
const factUpdates = {
  difficulty: 0.7,
  tags: ["multiplication", "times-tables", "level-4"]
};
```

**Expected Output:**
```typescript
{
  id: "mult-7-8",
  operation: "multiplication",
  operands: [7, 8],
  result: 56,
  difficulty: 0.7,
  relatedFactIds: ["mult-8-7", "div-56-7", "div-56-8"],
  tags: ["multiplication", "times-tables", "level-4"]
}
```

### importCurriculum

**Input:**
```typescript
const jsonData = `{
  "name": "Elementary Mathematics",
  "description": "Basic mathematics facts for elementary school",
  "version": "1.0",
  "facts": [
    {
      "operation": "addition",
      "operands": [7, 8],
      "result": 15,
      "tags": ["addition", "level-2"]
    },
    {
      "operation": "multiplication",
      "operands": [6, 7],
      "result": 42,
      "tags": ["multiplication", "times-tables", "level-3"]
    }
  ]
}`;

const options = {
  replaceExisting: true
};
```

**Expected Output:**
```typescript
{
  success: true,
  importedCount: 2,
  skippedCount: 0,
  errorCount: 0,
  curriculumName: "Elementary Mathematics",
  message: "Successfully imported 2 facts for curriculum 'Elementary Mathematics'"
}
```

### exportCurriculum

**Input:**
```typescript
const curriculumName = "Times Tables";
const description = "Multiplication facts for times tables";
const query = {
  operation: "multiplication",
  tags: ["times-tables"]
};
```

**Expected Output:**
```typescript
`{
  "name": "Times Tables",
  "description": "Multiplication facts for times tables",
  "version": "1.0",
  "createdAt": "2025-05-22T12:34:56Z",
  "facts": [
    {
      "id": "mult-1-1",
      "operation": "multiplication",
      "operands": [1, 1],
      "result": 1,
      "difficulty": 0.1,
      "relatedFactIds": ["mult-1-1"],
      "tags": ["multiplication", "times-tables", "level-1"]
    },
    // Additional multiplication facts...
  ]
}`
```

### generateFactRelationships

**Input:**
```typescript
const factIds = ["add-7-8", "add-8-7", "sub-15-7", "sub-15-8"];
const relationshipTypes = ["commutative", "inverse"];
```

**Expected Output:**
```typescript
4 // Number of facts updated with new relationships
```

### listCurriculumSets

**Input:**
```typescript
const tags = ["elementary", "addition"];
```

**Expected Output:**
```typescript
[
  {
    id: "elementary-math-1",
    name: "Elementary Mathematics",
    description: "Basic mathematics facts for elementary school",
    version: "1.0",
    createdAt: "2025-05-20T10:00:00Z",
    updatedAt: "2025-05-20T10:00:00Z",
    tags: ["elementary", "addition", "subtraction"]
  },
  {
    id: "addition-basics",
    name: "Addition Basics",
    description: "Fundamental addition facts",
    version: "1.2",
    createdAt: "2025-05-15T14:30:00Z",
    updatedAt: "2025-05-21T09:15:00Z",
    tags: ["elementary", "addition"]
  }
]
```

## Error Scenarios

### Invalid Fact

**Input:**
```typescript
const factInput = {
  operation: 'invalid-operation',
  operands: [7, 8],
  result: 56
};
```

**Expected Error:**
```
Error: INVALID_FACT - The operation 'invalid-operation' is not supported
```

### Fact Not Found

**Input:**
```typescript
const factId = "nonexistent-fact";
const factUpdates = {
  difficulty: 0.7
};
```

**Expected Error:**
```
Error: FACT_NOT_FOUND - The specified fact was not found: nonexistent-fact
```

### Invalid JSON

**Input:**
```typescript
const jsonData = `{
  "name": "Invalid JSON,
  "facts": [
    {
      "operation": "addition",
      "operands": [7, 8],
      "result": 15
    }
  ]
}`;
```

**Expected Error:**
```
Error: INVALID_JSON - Failed to parse JSON: Unexpected end of JSON input
```

### Invalid Curriculum Structure

**Input:**
```typescript
const jsonData = `{
  "name": "Missing Facts",
  "description": "This curriculum is missing the facts array"
}`;
```

**Expected Error:**
```
Error: INVALID_CURRICULUM - Missing required field 'facts' in curriculum
```

## Validation Criteria

### CM-001: Content Creation

The ContentManager component must support the creation, update, and deletion of mathematical facts with proper validation. This means:

1. New facts must be validated for structure and content
2. Fact IDs must be generated following consistent patterns
3. Updates must preserve fact integrity and relationships
4. Deletion must respect dependencies and prevent orphaned relationships

### CM-002: Curriculum Import/Export

The ContentManager component must support importing and exporting curriculum content in JSON format. This means:

1. Import must validate the structure and content of the curriculum
2. Import must handle duplicate facts appropriately
3. Export must generate well-structured, valid JSON
4. Metadata must be properly maintained during import/export

### CM-003: Relationship Management

The ContentManager component must support automatic generation and management of fact relationships. This means:

1. Relationships must be correctly identified and generated
2. Different types of relationships must be supported
3. Relationships must be bidirectional where appropriate
4. Relationship generation must be efficient for large fact sets

### CM-004: Difficulty Calculation

The ContentManager component must support automatic calculation of fact difficulty ratings. This means:

1. Difficulty calculations must consider relevant factors
2. Difficulty ratings must be consistent across similar facts
3. Different algorithms must be supported for different fact types
4. Difficulty distribution must be appropriate for learning progression

## Implementation Notes

### Fact Management Strategy

The implementation should leverage the FactRepository for efficient storage:

```typescript
class ContentManager implements ContentManagerInterface {
  private factRepository: FactRepositoryInterface;
  private curriculumStore: Map<string, CurriculumMetadata> = new Map();
  
  constructor(factRepository: FactRepositoryInterface) {
    this.factRepository = factRepository;
    this.initializeCurriculumStore();
  }
  
  public createFact(factInput: MathematicalFactInput): MathematicalFact {
    // Validate fact input
    this.validateFactInput(factInput);
    
    // Generate ID if not provided
    if (!factInput.id) {
      factInput.id = this.generateFactId(factInput.operation, factInput.operands);
    }
    
    // Calculate difficulty if not provided
    if (factInput.difficulty === undefined) {
      factInput.difficulty = this.calculateFactDifficulty(
        factInput.operation, 
        factInput.operands, 
        factInput.result
      );
    }
    
    // Create fact object
    const fact: MathematicalFact = {
      id: factInput.id,
      operation: factInput.operation,
      operands: factInput.operands,
      result: factInput.result,
      difficulty: factInput.difficulty,
      relatedFactIds: factInput.relatedFactIds || [],
      tags: factInput.tags || []
    };
    
    // Add difficulty level tag if not present
    if (!fact.tags?.some(tag => tag.startsWith('level-'))) {
      const levelTag = this.getDifficultyLevelTag(fact.difficulty);
      fact.tags = [...(fact.tags || []), levelTag];
    }
    
    // Import into repository
    this.factRepository.importFacts(JSON.stringify([fact]));
    
    return fact;
  }
  
  // ... other methods ...
  
  private generateFactId(operation: string, operands: number[]): string {
    const opPrefix = this.getOperationPrefix(operation);
    return `${opPrefix}-${operands.join('-')}`;
  }
  
  private getOperationPrefix(operation: string): string {
    switch (operation) {
      case 'addition': return 'add';
      case 'subtraction': return 'sub';
      case 'multiplication': return 'mult';
      case 'division': return 'div';
      default: return operation.substring(0, 4);
    }
  }
  
  private calculateFactDifficulty(operation: string, operands: number[], result: number): number {
    // Implement difficulty calculation based on operation and operands
    // This is a simplified version - a more comprehensive algorithm would be used
    
    let difficulty = 0.5; // Default medium difficulty
    
    switch (operation) {
      case 'addition':
        difficulty = this.calculateAdditionDifficulty(operands[0], operands[1]);
        break;
      case 'subtraction':
        difficulty = this.calculateSubtractionDifficulty(operands[0], operands[1]);
        break;
      case 'multiplication':
        difficulty = this.calculateMultiplicationDifficulty(operands[0], operands[1]);
        break;
      case 'division':
        difficulty = this.calculateDivisionDifficulty(operands[0], operands[1]);
        break;
    }
    
    return Math.max(0.1, Math.min(0.9, difficulty));
  }
  
  // ... specific difficulty calculation methods ...
}
```

### Curriculum Import/Export Implementation

```typescript
class ContentManager implements ContentManagerInterface {
  // ... previous code ...
  
  public async importCurriculum(jsonData: string, options: ImportOptions = {}): Promise<ImportResult> {
    try {
      // Parse JSON data
      let curriculum;
      try {
        curriculum = JSON.parse(jsonData);
      } catch (error) {
        throw new Error(`INVALID_JSON - Failed to parse JSON: ${error.message}`);
      }
      
      // Validate curriculum structure
      this.validateCurriculumStructure(curriculum);
      
      // Initialize result
      const result: ImportResult = {
        success: true,
        importedCount: 0,
        skippedCount: 0,
        errorCount: 0,
        curriculumName: curriculum.name,
        errors: [],
        message: ""
      };
      
      // Validation only mode
      if (options.validateOnly) {
        result.message = `Validation successful for curriculum '${curriculum.name}'`;
        return result;
      }
      
      // Process facts
      for (const factData of curriculum.facts) {
        try {
          // Generate ID if not provided
          if (!factData.id) {
            factData.id = this.generateFactId(factData.operation, factData.operands);
          }
          
          // Check if fact exists
          let factExists = false;
          try {
            this.factRepository.getFactById(factData.id);
            factExists = true;
          } catch (error) {
            // Fact doesn't exist, which is fine
          }
          
          // Handle existing facts
          if (factExists) {
            if (options.replaceExisting) {
              // Update existing fact
              this.updateFact(factData.id, factData);
              result.importedCount++;
            } else {
              // Skip existing fact
              result.skippedCount++;
            }
          } else {
            // Create new fact
            this.createFact(factData);
            result.importedCount++;
          }
        } catch (error) {
          result.errorCount++;
          result.errors?.push(`Error processing fact: ${error.message}`);
        }
      }
      
      // Store curriculum metadata
      const curriculumMetadata: CurriculumMetadata = {
        id: this.generateCurriculumId(curriculum.name),
        name: curriculum.name,
        description: curriculum.description || "",
        version: curriculum.version || "1.0",
        createdAt: curriculum.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: curriculum.tags || []
      };
      
      this.curriculumStore.set(curriculumMetadata.id, curriculumMetadata);
      
      // Set message
      result.message = `Successfully imported ${result.importedCount} facts for curriculum '${curriculum.name}'`;
      if (result.skippedCount > 0) {
        result.message += `, skipped ${result.skippedCount} existing facts`;
      }
      if (result.errorCount > 0) {
        result.message += `, encountered ${result.errorCount} errors`;
        result.success = false;
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        importedCount: 0,
        skippedCount: 0,
        errorCount: 1,
        errors: [error.message],
        message: `Failed to import curriculum: ${error.message}`
      };
    }
  }
  
  public async exportCurriculum(curriculumName: string, description?: string, query?: FactQuery): Promise<string> {
    try {
      // Get facts from repository
      const facts = this.factRepository.queryFacts(query || {});
      
      // Create curriculum structure
      const curriculum = {
        name: curriculumName,
        description: description || `${curriculumName} curriculum`,
        version: "1.0",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        facts: facts
      };
      
      // Store curriculum metadata if it doesn't exist
      const curriculumId = this.generateCurriculumId(curriculumName);
      if (!this.curriculumStore.has(curriculumId)) {
        const curriculumMetadata: CurriculumMetadata = {
          id: curriculumId,
          name: curriculumName,
          description: description || `${curriculumName} curriculum`,
          version: "1.0",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: []
        };
        
        this.curriculumStore.set(curriculumId, curriculumMetadata);
      }
      
      return JSON.stringify(curriculum, null, 2);
    } catch (error) {
      throw new Error(`EXPORT_ERROR - Failed to export curriculum: ${error.message}`);
    }
  }
  
  // ... other methods ...
  
  private validateCurriculumStructure(curriculum: any): void {
    // Check required fields
    if (!curriculum.name) {
      throw new Error('INVALID_CURRICULUM - Missing required field \'name\' in curriculum');
    }
    
    if (!Array.isArray(curriculum.facts)) {
      throw new Error('INVALID_CURRICULUM - Missing required field \'facts\' in curriculum');
    }
    
    // Validate each fact
    for (const fact of curriculum.facts) {
      if (!fact.operation) {
        throw new Error('INVALID_CURRICULUM - Missing required field \'operation\' in fact');
      }
      
      if (!Array.isArray(fact.operands)) {
        throw new Error('INVALID_CURRICULUM - Missing required field \'operands\' in fact');
      }
      
      if (fact.result === undefined) {
        throw new Error('INVALID_CURRICULUM - Missing required field \'result\' in fact');
      }
    }
  }
  
  private generateCurriculumId(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
```

### Relationship Generation Implementation

```typescript
class ContentManager implements ContentManagerInterface {
  // ... previous code ...
  
  public async generateFactRelationships(factIds?: string[], relationshipTypes?: string[]): Promise<number> {
    try {
      // Default relationship types if not specified
      const types = relationshipTypes || ['commutative', 'inverse', 'adjacent'];
      
      // Get facts to process
      let facts: MathematicalFact[];
      if (factIds && factIds.length > 0) {
        facts = factIds.map(id => this.factRepository.getFactById(id));
      } else {
        facts = this.factRepository.queryFacts({});
      }
      
      let updatedCount = 0;
      
      // Process each fact
      for (const fact of facts) {
        const originalRelatedIds = new Set(fact.relatedFactIds || []);
        const newRelatedIds = new Set<string>();
        
        // Generate relationships based on types
        if (types.includes('commutative')) {
          this.addCommutativeRelationships(fact, newRelatedIds);
        }
        
        if (types.includes('inverse')) {
          this.addInverseRelationships(fact, newRelatedIds);
        }
        
        if (types.includes('adjacent')) {
          this.addAdjacentRelationships(fact, newRelatedIds);
        }
        
        // Convert sets to arrays and remove self-references
        const relatedIds = [...newRelatedIds].filter(id => id !== fact.id);
        
        // Check if relationships changed
        const hasChanges = relatedIds.length !== originalRelatedIds.size ||
          relatedIds.some(id => !originalRelatedIds.has(id));
        
        if (hasChanges) {
          // Update fact with new relationships
          this.updateFact(fact.id, { relatedFactIds: relatedIds });
          updatedCount++;
        }
      }
      
      return updatedCount;
    } catch (error) {
      throw new Error(`GENERATION_ERROR - Failed to generate relationships: ${error.message}`);
    }
  }
  
  // ... other methods ...
  
  private addCommutativeRelationships(fact: MathematicalFact, relatedIds: Set<string>): void {
    // Commutative operations: addition and multiplication
    if (fact.operation === 'addition' || fact.operation === 'multiplication') {
      if (fact.operands.length >= 2) {
        // Reverse operands for commutative property
        const commutativeOperands = [...fact.operands].reverse();
        const commutativeId = this.generateFactId(fact.operation, commutativeOperands);
        relatedIds.add(commutativeId);
      }
    }
  }
  
  private addInverseRelationships(fact: MathematicalFact, relatedIds: Set<string>): void {
    if (fact.operation === 'addition') {
      // Inverse of a + b = c is c - a = b and c - b = a
      const result = fact.result;
      const a = fact.operands[0];
      const b = fact.operands[1];
      
      relatedIds.add(this.generateFactId('subtraction', [result, a]));
      relatedIds.add(this.generateFactId('subtraction', [result, b]));
    } else if (fact.operation === 'subtraction') {
      // Inverse of a - b = c is a - c = b and b + c = a
      const a = fact.operands[0];
      const b = fact.operands[1];
      const c = fact.result;
      
      relatedIds.add(this.generateFactId('addition', [b, c]));
    } else if (fact.operation === 'multiplication') {
      // Inverse of a * b = c is c / a = b and c / b = a
      const result = fact.result;
      const a = fact.operands[0];
      const b = fact.operands[1];
      
      if (a !== 0 && b !== 0) {
        relatedIds.add(this.generateFactId('division', [result, a]));
        relatedIds.add(this.generateFactId('division', [result, b]));
      }
    } else if (fact.operation === 'division') {
      // Inverse of a / b = c is a / c = b and b * c = a
      const a = fact.operands[0];
      const b = fact.operands[1];
      const c = fact.result;
      
      if (c !== 0) {
        relatedIds.add(this.generateFactId('multiplication', [b, c]));
      }
    }
  }
  
  private addAdjacentRelationships(fact: MathematicalFact, relatedIds: Set<string>): void {
    // Add facts with operands that are +1 or -1 from current fact
    const operation = fact.operation;
    const operands = fact.operands;
    
    if (operation === 'addition' || operation === 'multiplication') {
      // For each operand, add facts with +1 and -1
      for (let i = 0; i < operands.length; i++) {
        const plusOne = [...operands];
        const minusOne = [...operands];
        
        if (operands[i] > 0) {
          minusOne[i] = operands[i] - 1;
          relatedIds.add(this.generateFactId(operation, minusOne));
        }
        
        plusOne[i] = operands[i] + 1;
        relatedIds.add(this.generateFactId(operation, plusOne));
      }
    }
  }
}
```

### Difficulty Generation Implementation

```typescript
class ContentManager implements ContentManagerInterface {
  // ... previous code ...
  
  public async generateDifficultyRatings(factIds?: string[], algorithm?: string): Promise<number> {
    try {
      // Get facts to process
      let facts: MathematicalFact[];
      if (factIds && factIds.length > 0) {
        facts = factIds.map(id => this.factRepository.getFactById(id));
      } else {
        facts = this.factRepository.queryFacts({});
      }
      
      // Select algorithm
      const difficultyAlgorithm = algorithm || 'default';
      if (difficultyAlgorithm !== 'default' && difficultyAlgorithm !== 'cognitive-load') {
        throw new Error(`INVALID_ALGORITHM - The specified algorithm '${difficultyAlgorithm}' is not supported`);
      }
      
      let updatedCount = 0;
      
      // Process each fact
      for (const fact of facts) {
        let newDifficulty: number;
        
        if (difficultyAlgorithm === 'default') {
          newDifficulty = this.calculateFactDifficulty(
            fact.operation,
            fact.operands,
            fact.result
          );
        } else {
          newDifficulty = this.calculateCognitiveLoadDifficulty(
            fact.operation,
            fact.operands,
            fact.result
          );
        }
        
        // Check if difficulty changed
        if (Math.abs((fact.difficulty || 0.5) - newDifficulty) > 0.01) {
          // Update fact with new difficulty
          const levelTag = this.getDifficultyLevelTag(newDifficulty);
          
          // Remove existing level tags
          const tags = (fact.tags || []).filter(tag => !tag.startsWith('level-'));
          tags.push(levelTag);
          
          this.updateFact(fact.id, { 
            difficulty: newDifficulty,
            tags
          });
          
          updatedCount++;
        }
      }
      
      return updatedCount;
    } catch (error) {
      throw new Error(`CALCULATION_ERROR - Failed to calculate difficulty ratings: ${error.message}`);
    }
  }
  
  // ... other methods ...
  
  private calculateCognitiveLoadDifficulty(operation: string, operands: number[], result: number): number {
    // Implement a more sophisticated cognitive load based algorithm
    // This is just an example - a real implementation would be more complex
    
    let baseDifficulty = 0.3;
    let operandFactor = 0;
    let resultFactor = 0;
    let specialCaseFactor = 0;
    
    // Factor 1: Size of operands
    operandFactor = Math.min(1, operands.reduce((sum, op) => sum + Math.log10(Math.max(1, op)), 0) / 10);
    
    // Factor 2: Size of result
    resultFactor = Math.min(0.5, Math.log10(Math.max(1, result)) / 10);
    
    // Factor 3: Special cases
    if (operands.includes(0) || operands.includes(1)) {
      specialCaseFactor = -0.1; // Easier
    }
    
    // Factor 4: Operation complexity
    let operationFactor = 0;
    switch (operation) {
      case 'addition':
        operationFactor = 0;
        break;
      case 'subtraction':
        operationFactor = 0.1;
        break;
      case 'multiplication':
        operationFactor = 0.2;
        break;
      case 'division':
        operationFactor = 0.3;
        break;
    }
    
    // Combine factors
    const difficulty = baseDifficulty + operandFactor + resultFactor + specialCaseFactor + operationFactor;
    
    // Ensure within bounds
    return Math.max(0.1, Math.min(0.9, difficulty));
  }
  
  private getDifficultyLevelTag(difficulty: number): string {
    if (difficulty < 0.2) return 'level-1';
    if (difficulty < 0.4) return 'level-2';
    if (difficulty < 0.6) return 'level-3';
    if (difficulty < 0.8) return 'level-4';
    return 'level-5';
  }
}
```

### Curriculum Management Implementation

```typescript
class ContentManager implements ContentManagerInterface {
  // ... previous code ...
  
  public listCurriculumSets(tags?: string[]): CurriculumMetadata[] {
    let curriculumSets = [...this.curriculumStore.values()];
    
    // Filter by tags if provided
    if (tags && tags.length > 0) {
      curriculumSets = curriculumSets.filter(curriculum => {
        return tags.every(tag => curriculum.tags?.includes(tag));
      });
    }
    
    return curriculumSets;
  }
  
  public getCurriculumSet(curriculumId: string): Curriculum {
    const metadata = this.curriculumStore.get(curriculumId);
    
    if (!metadata) {
      throw new Error(`CURRICULUM_NOT_FOUND - The specified curriculum was not found: ${curriculumId}`);
    }
    
    // Get facts associated with this curriculum
    // This is a simplified implementation - in practice, you would store
    // fact IDs with the curriculum or use tags to identify them
    const facts = this.factRepository.queryFacts({
      tags: metadata.tags
    });
    
    return {
      metadata,
      facts
    };
  }
  
  // ... other methods ...
  
  private initializeCurriculumStore(): void {
    // Initialize with some basic curriculum sets
    const basicMath: CurriculumMetadata = {
      id: 'basic-mathematics',
      name: 'Basic Mathematics',
      description: 'Fundamental mathematics facts for early education',
      version: '1.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['basic', 'elementary', 'addition', 'subtraction']
    };
    
    const timesTables: CurriculumMetadata = {
      id: 'times-tables',
      name: 'Times Tables',
      description: 'Multiplication facts for times tables',
      version: '1.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['multiplication', 'times-tables']
    };
    
    this.curriculumStore.set(basicMath.id, basicMath);
    this.curriculumStore.set(timesTables.id, timesTables);
  }
}
```

## Usage Example

```typescript
// Example usage of ContentManager
import { FactRepository } from './FactRepository';
import { ContentManager } from './ContentManager';

// Create fact repository
const factRepository = new FactRepository();

// Create content manager
const contentManager = new ContentManager(factRepository);

// Create a new fact
try {
  const newFact = contentManager.createFact({
    operation: 'multiplication',
    operands: [7, 8],
    result: 56,
    tags: ['multiplication', 'times-tables']
  });
  
  console.log(`Created fact: ${newFact.id}`);
  console.log(`Difficulty: ${newFact.difficulty}`);
  console.log(`Tags: ${newFact.tags?.join(', ')}`);
} catch (error) {
  console.error(`Error creating fact: ${error.message}`);
}

// Import curriculum from JSON
try {
  const jsonData = `{
    "name": "Elementary Mathematics",
    "description": "Basic mathematics facts for elementary school",
    "version": "1.0",
    "facts": [
      {
        "operation": "addition",
        "operands": [7, 8],
        "result": 15,
        "tags": ["addition", "level-2"]
      },
      {
        "operation": "multiplication",
        "operands": [6, 7],
        "result": 42,
        "tags": ["multiplication", "times-tables", "level-3"]
      }
    ]
  }`;
  
  const importResult = await contentManager.importCurriculum(jsonData);
  console.log(`Import result: ${importResult.message}`);
  console.log(`Imported: ${importResult.importedCount}, Skipped: ${importResult.skippedCount}, Errors: ${importResult.errorCount}`);
} catch (error) {
  console.error(`Error importing curriculum: ${error.message}`);
}

// Generate relationships
try {
  const updatedCount = await contentManager.generateFactRelationships();
  console.log(`Updated relationships for ${updatedCount} facts`);
} catch (error) {
  console.error(`Error generating relationships: ${error.message}`);
}

// List available curriculum sets
try {
  const curriculumSets = contentManager.listCurriculumSets();
  console.log(`Available curriculum sets: ${curriculumSets.length}`);
  
  curriculumSets.forEach(curriculum => {
    console.log(`- ${curriculum.name} (${curriculum.id}): ${curriculum.description}`);
    console.log(`  Tags: ${curriculum.tags?.join(', ')}`);
  });
} catch (error) {
  console.error(`Error listing curriculum sets: ${error.message}`);
}
```

## Implementation Considerations

### Performance Optimization

For optimal performance:

1. **Bulk Operations**
   - Implement batch processing for large imports
   - Use asynchronous processing for long-running operations
   - Optimize relationship generation for large fact sets

2. **Memory Management**
   - Use efficient data structures for curriculum storage
   - Implement pagination for large result sets
   - Avoid unnecessary duplication of fact data

3. **Error Handling**
   - Implement comprehensive validation
   - Provide detailed error reporting
   - Support partial success for bulk operations

### Extensibility

To support future extensions:

1. **Custom Algorithms**
   - Design for pluggable difficulty calculation algorithms
   - Support custom relationship generation strategies
   - Allow extension for new mathematical operations

2. **Integration with UI**
   - Design for easy integration with administrative UI
   - Support progressive loading of large curriculum sets
   - Include metadata for UI presentation

### Testing Strategy

The implementation should be tested with:

1. **Unit Tests**
   - Test each method with various inputs
   - Verify correct error handling
   - Test performance with large fact sets

2. **Integration Tests**
   - Test integration with FactRepository
   - Test end-to-end curriculum management
   - Verify correct relationship generation

3. **Performance Tests**
   - Measure import/export performance with large sets
   - Test memory usage during bulk operations
   - Verify scaling characteristics
