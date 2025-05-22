# ContentManager Component

## Overview

The ContentManager component is an administrative tool for the Zenjin Maths App that provides interfaces to create, import, export, and manage mathematical facts and curriculum content. It works on top of the FactRepository component to provide higher-level functionality for content creators and administrators.

## Files

The component consists of three main files:

1. **content-manager.ts** - The main implementation of the ContentManager class
2. **content-manager-types.ts** - Type definitions and interfaces used by the ContentManager
3. **fact-repository-types.ts** (dependency) - Type definitions from the FactRepository component

## Features

- **Fact Management**: Create, update, and delete individual mathematical facts
- **Curriculum Import/Export**: Import and export curriculum content in JSON format
- **Relationship Generation**: Automatically generate relationships between facts
- **Difficulty Calculation**: Automatically calculate fact difficulty ratings
- **Curriculum Sets**: Manage and list curriculum sets for different learning objectives
- **Validation**: Comprehensive validation of fact and curriculum structure

## Usage Examples

### Basic Fact Management

```typescript
import { FactRepository } from './fact-repository';
import { ContentManager } from './content-manager';

// Create repository and content manager
const factRepository = new FactRepository();
const contentManager = new ContentManager(factRepository);

// Create a new fact
const newFact = contentManager.createFact({
  operation: 'multiplication',
  operands: [7, 8],
  result: 56,
  tags: ['multiplication', 'times-tables']
});

console.log(`Created fact: ${newFact.id}`);

// Update an existing fact
const updatedFact = contentManager.updateFact('mult-7-8', {
  difficulty: 0.7,
  tags: ['multiplication', 'times-tables', 'level-4']
});

console.log(`Updated fact difficulty: ${updatedFact.difficulty}`);

// Delete a fact
try {
  const deleted = contentManager.deleteFact('mult-7-8');
  console.log(`Fact deleted: ${deleted}`);
} catch (error) {
  console.error(`Error deleting fact: ${error.message}`);
}
```

### Curriculum Import/Export

```typescript
// Import curriculum content
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

async function importExportExample() {
  try {
    // Import curriculum
    const importResult = await contentManager.importCurriculum(jsonData, {
      replaceExisting: true
    });
    console.log(`Import result: ${importResult.message}`);
    
    // Export curriculum
    const exportedJson = await contentManager.exportCurriculum(
      "Times Tables",
      "Multiplication facts for times tables",
      { operation: "multiplication", tags: ["times-tables"] }
    );
    console.log(`Exported curriculum: ${exportedJson.substring(0, 100)}...`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

importExportExample();
```

### Relationship Generation

```typescript
// Generate relationships between facts
async function generateRelationships() {
  try {
    // Generate all relationship types for multiplication facts
    const updatedCount = await contentManager.generateFactRelationships(
      undefined, // All facts
      ['commutative', 'inverse', 'adjacent']
    );
    
    console.log(`Updated relationships for ${updatedCount} facts`);
  } catch (error) {
    console.error(`Error generating relationships: ${error.message}`);
  }
}

generateRelationships();
```

### Difficulty Calculation

```typescript
// Calculate difficulty ratings for facts
async function calculateDifficulty() {
  try {
    // Use cognitive load algorithm for all facts
    const updatedCount = await contentManager.generateDifficultyRatings(
      undefined, // All facts
      'cognitive-load'
    );
    
    console.log(`Updated difficulty ratings for ${updatedCount} facts`);
  } catch (error) {
    console.error(`Error calculating difficulty: ${error.message}`);
  }
}

calculateDifficulty();
```

### Curriculum Management

```typescript
// List available curriculum sets
const curriculumSets = contentManager.listCurriculumSets(['elementary']);
console.log(`Found ${curriculumSets.length} elementary curriculum sets`);

// Get a specific curriculum
try {
  const timesTables = contentManager.getCurriculumSet('times-tables');
  console.log(`Times Tables curriculum has ${timesTables.facts.length} facts`);
} catch (error) {
  console.error(`Error: ${error.message}`);
}
```

## Integration with Other Components

The ContentManager component is designed to work with:

1. **FactRepository**: The ContentManager uses the FactRepository for storing and retrieving facts
2. **Administrative UI**: The ContentManager provides functionality for admin interfaces
3. **LearningEngine**: The content created through the ContentManager is used by the LearningEngine components

## Relationship Types

The ContentManager supports generating different types of relationships between facts:

1. **Commutative**: For operations where order doesn't matter (e.g., 2+3 and 3+2)
2. **Inverse**: Opposite operations (e.g., 2+3=5 and 5-3=2)
3. **Adjacent**: Facts with operands that differ by 1 (e.g., 2+3 and 2+4)
4. **Equivalent**: Facts that can be represented in different ways (e.g., 2×3 and 3+3)

## Difficulty Calculation

Two algorithms are provided for calculating fact difficulty:

1. **Default**: Simple calculation based on operation, operand size, and special cases
2. **Cognitive Load**: More sophisticated algorithm that considers additional factors like pattern recognition

## JSON Curriculum Format

The ContentManager supports importing and exporting curriculum in the following JSON format:

```json
{
  "name": "Curriculum Name",
  "description": "Curriculum description",
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
}
```

## Error Handling

The component provides comprehensive error handling with specific error codes:

- `INVALID_FACT`: When fact data is invalid
- `FACT_NOT_FOUND`: When a requested fact doesn't exist
- `FACT_IN_USE`: When a fact cannot be deleted because it's referenced by other facts
- `INVALID_JSON`: When JSON data cannot be parsed
- `INVALID_CURRICULUM`: When curriculum structure is invalid
- `EXPORT_ERROR`: When exporting curriculum fails
- `GENERATION_ERROR`: When generating relationships fails
- `CALCULATION_ERROR`: When calculating difficulty ratings fails
- `INVALID_ALGORITHM`: When an unsupported algorithm is specified
- `LIST_ERROR`: When listing curriculum sets fails
- `CURRICULUM_NOT_FOUND`: When a requested curriculum doesn't exist

## Security Considerations

The ContentManager is designed for administrative use only and should not be exposed to regular users. Access to the ContentManager functions should be restricted to authenticated administrators.
