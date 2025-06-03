# Zenjin Maths - Data Structures Reference

## Quick Reference for Implementation

This document provides a complete reference of all data structures used in the Zenjin Maths system, formatted for easy implementation in any programming language.

## Core Data Structures

### 1. User State

```typescript
interface UserState {
  // Sparse position maps for each tube
  tubePositions: {
    tube1: { [logicalPosition: number]: string }, // stitchId
    tube2: { [logicalPosition: number]: string }, // stitchId  
    tube3: { [logicalPosition: number]: string }  // stitchId
  },
  
  // Progress tracking for each stitch
  stitchProgress: {
    [stitchId: string]: {
      skipNumber: 4 | 8 | 15 | 30 | 100 | 1000,
      boundaryLevel: 1 | 2 | 3 | 4 | 5,
      lastCompleted: Date | null
    }
  },
  
  // Current active tube
  tripleHelixState: {
    activeTube: 1 | 2 | 3
  }
}
```

### 2. Stitch Definition

```typescript
interface Stitch {
  id: string,                    // Format: 't1-0001-0001'
  name: string,                  // Human-readable name
  tubeId: 'tube1' | 'tube2' | 'tube3',
  conceptType: string,           // 'times_table', 'addition', etc.
  conceptParams: {
    operand?: number,            // For times tables
    range?: [number, number],    // For number ranges
    operation?: string,          // Specific operation
    [key: string]: any          // Extensible parameters
  },
  surpriseWeight?: number        // 0.0 to 1.0 (default 0)
}
```

### 3. Mathematical Fact

```typescript
interface Fact {
  id: string,                    // Format: 'mult-6-4'
  statement: string,             // '6 × 4'
  answer: string | number,       // '24'
  operationType: 'multiplication' | 'addition' | 'subtraction' | 'division',
  metadata: {
    difficulty?: number,         // 0.0 to 1.0
    tags?: string[],            // ['times-table', 'six-times']
    prerequisites?: string[],    // Other fact IDs
    [key: string]: any
  }
}
```

### 4. Question Object

```typescript
interface Question {
  id: string,                    // Unique question identifier
  factId: string,                // Reference to the mathematical fact
  text: string,                  // Formatted question text
  correctAnswer: string,         // The correct answer
  distractor: string,            // Single distractor for binary choice
  boundaryLevel: 1 | 2 | 3 | 4 | 5,
  metadata?: Record<string, any> // Additional metadata
}
```

### 5. Session State

```typescript
interface SessionState {
  sessionId: string,             // UUID
  userId: string,
  stitchId: string,
  questions: Question[],         // Array of 20 questions
  currentQuestionIndex: number,
  responses: Response[],
  startTime: Date,
  points: number,
  repeatQueue: number[]          // Indices of questions to repeat
}
```

### 6. Response Record

```typescript
interface Response {
  questionIndex: number,
  selectedAnswer: string,
  isCorrect: boolean,
  responseTime: number,          // Milliseconds
  attempts: number,              // How many tries
  points: 0 | 1 | 3,            // Points earned
  timestamp: Date
}
```

### 7. Database Tables

```sql
-- Core fact storage
CREATE TABLE facts (
  id VARCHAR PRIMARY KEY,        -- 'mult-6-4'
  statement VARCHAR NOT NULL,
  answer VARCHAR NOT NULL,
  operation_type VARCHAR NOT NULL,
  metadata JSONB
);

-- Stitch definitions (recipes)
CREATE TABLE stitches (
  id VARCHAR PRIMARY KEY,        -- 't1-0001-0001'
  name VARCHAR NOT NULL,
  tube_id VARCHAR NOT NULL,
  concept_type VARCHAR NOT NULL,
  concept_params JSONB NOT NULL,
  surprise_weight DECIMAL DEFAULT 0
);

-- Learning tubes
CREATE TABLE tubes (
  id VARCHAR PRIMARY KEY,        -- 'tube1'
  name VARCHAR NOT NULL,
  description TEXT,
  display_order INT
);

-- Default curriculum
CREATE TABLE default_tube_positions (
  tube_id VARCHAR NOT NULL,
  logical_position INT NOT NULL,
  stitch_id VARCHAR NOT NULL,
  PRIMARY KEY (tube_id, logical_position),
  FOREIGN KEY (tube_id) REFERENCES tubes(id),
  FOREIGN KEY (stitch_id) REFERENCES stitches(id)
);

-- User data
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  user_state JSONB NOT NULL,    -- Complete UserState object
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- Metrics tracking
CREATE TABLE user_metrics (
  user_id UUID PRIMARY KEY,
  total_sessions INT DEFAULT 0,
  total_questions INT DEFAULT 0,
  total_correct INT DEFAULT 0,
  streak_days INT DEFAULT 0,
  last_played DATE,
  lifetime_points INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Key Algorithms

### Skip Number Sequence

```javascript
const SKIP_SEQUENCE = [4, 8, 15, 30, 100, 1000];

function getNextSkipNumber(current) {
  const index = SKIP_SEQUENCE.indexOf(current);
  return index < SKIP_SEQUENCE.length - 1 
    ? SKIP_SEQUENCE[index + 1] 
    : 1000;
}
```

### Position Shifting

```javascript
function shiftPositions(positions, skipNumber, stitchId) {
  // Remove from position 1
  delete positions[1];
  
  // Shift positions down
  for (let i = 2; i <= skipNumber; i++) {
    if (positions[i]) {
      positions[i - 1] = positions[i];
      delete positions[i];
    }
  }
  
  // Place at skip position
  positions[skipNumber] = stitchId;
  
  return positions;
}
```

### Sparse Position Compression

```javascript
function compressPositions(sparsePositions) {
  const entries = Object.entries(sparsePositions)
    .map(([pos, stitchId]) => [parseInt(pos), stitchId])
    .sort(([a], [b]) => a - b);
  
  const compressed = {};
  entries.forEach(([_, stitchId], index) => {
    compressed[index + 1] = stitchId;
  });
  
  return compressed;
}
```

### Distractor Generation by Level

```javascript
function generateDistractor(fact, boundaryLevel) {
  const answer = parseInt(fact.answer);
  
  switch(boundaryLevel) {
    case 1: // Category boundary - completely wrong type
      return 'fish'; // Non-numeric for numeric answer
      
    case 2: // Magnitude boundary - wrong order of magnitude
      return answer * 10; // Or answer / 10
      
    case 3: // Operation boundary - different operation result
      const [a, b] = fact.statement.match(/\d+/g).map(Number);
      return a + b; // If fact is multiplication
      
    case 4: // Pattern near-miss - plausible but wrong
      return answer + 4; // Common calculation error
      
    case 5: // Conceptual near-miss - very close
      return answer + 1; // Off by one
  }
}
```

## State Transitions

### New User Initialization

```javascript
async function initializeNewUser(userId) {
  // Get default positions
  const defaultPositions = await db.query(
    'SELECT * FROM default_tube_positions'
  );
  
  // Build initial state
  const userState = {
    tubePositions: {
      tube1: {},
      tube2: {},
      tube3: {}
    },
    stitchProgress: {},
    tripleHelixState: { activeTube: 1 }
  };
  
  // Populate positions
  defaultPositions.forEach(row => {
    userState.tubePositions[row.tube_id][row.logical_position] = row.stitch_id;
    
    // Initialize progress
    userState.stitchProgress[row.stitch_id] = {
      skipNumber: 4,
      boundaryLevel: 2,
      lastCompleted: null
    };
  });
  
  return userState;
}
```

### Triple Helix Rotation

```javascript
function rotateTripleHelix(currentState) {
  const nextTube = (currentState.tripleHelixState.activeTube % 3) + 1;
  return {
    ...currentState,
    tripleHelixState: { activeTube: nextTube }
  };
}
```

## API Endpoints Structure

```typescript
// Question Generation
POST /api/session/start
Request: { userId: string }
Response: { 
  sessionId: string,
  questions: Question[],
  stitchInfo: { id: string, name: string }
}

// Answer Submission
POST /api/session/answer
Request: { 
  sessionId: string,
  questionIndex: number,
  selectedAnswer: string,
  responseTime: number
}
Response: {
  isCorrect: boolean,
  points: number,
  nextQuestion?: Question,
  completed?: boolean
}

// Stitch Completion
POST /api/session/complete
Request: { sessionId: string }
Response: {
  score: number,
  totalPoints: number,
  progressed: boolean,
  newSkipNumber?: number,
  newBoundaryLevel?: number
}

// Admin Operations
POST /api/admin/stitch-group
Request: {
  groupName: string,
  conceptTemplate: object,
  variations: object[]
}
Response: {
  created: Stitch[],
  preview: Question[]
}
```

## Constants and Configurations

```javascript
// System Constants
const MAX_QUESTIONS_PER_STITCH = 20;
const DEFAULT_BOUNDARY_LEVEL = 2;
const DEFAULT_SKIP_NUMBER = 4;
const SURPRISE_CONTENT_RATIO = 0.1; // 10%

// Points System
const POINTS = {
  FIRST_TIME_CORRECT: 3,
  EVENTUALLY_CORRECT: 1,
  INCORRECT: 0
};

// Boundary Level Names
const BOUNDARY_LEVELS = {
  1: 'Category Boundary',
  2: 'Magnitude Boundary',
  3: 'Operation Boundary',
  4: 'Pattern Near-Miss',
  5: 'Conceptual Near-Miss'
};

// Tube Definitions
const TUBES = {
  tube1: 'Knowledge Acquisition',
  tube2: 'Skill Development',
  tube3: 'Application'
};

// Fact ID Patterns
const FACT_ID_PATTERNS = {
  multiplication: 'mult-{op1}-{op2}',
  addition: 'add-{op1}-{op2}',
  subtraction: 'sub-{op1}-{op2}',
  division: 'div-{op1}-{op2}'
};
```

## Error Handling

```javascript
// Error Types
class ZenjinError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

// Error Codes
const ERROR_CODES = {
  INSUFFICIENT_FACTS: 'E001',
  INVALID_SESSION: 'E002',
  STATE_CORRUPTION: 'E003',
  POSITION_CONFLICT: 'E004',
  FACT_NOT_FOUND: 'E005',
  STITCH_NOT_FOUND: 'E006',
  USER_NOT_FOUND: 'E007',
  INVALID_BOUNDARY_LEVEL: 'E008',
  INVALID_SKIP_NUMBER: 'E009'
};
```

## Testing Utilities

```javascript
// Test Data Generators
function createTestUser(overrides = {}) {
  return {
    id: 'test-user-123',
    email: 'test@example.com',
    userState: initializeNewUser('test-user-123'),
    ...overrides
  };
}

function createTestStitch(overrides = {}) {
  return {
    id: 't1-0001-0001',
    name: 'Test Stitch',
    tubeId: 'tube1',
    conceptType: 'multiplication',
    conceptParams: { operand: 6, range: [1, 20] },
    ...overrides
  };
}

function createTestQuestion(overrides = {}) {
  return {
    fact: createTestFact(),
    questionText: 'What is 6 × 4?',
    correctAnswer: '24',
    distractor: '20',
    allOptions: ['20', '24'],
    boundaryLevel: 3,
    ...overrides
  };
}
```

This reference guide provides all the essential data structures and algorithms needed to implement the Zenjin Maths system in any technology stack.