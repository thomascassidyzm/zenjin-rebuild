# TripleHelixManager Implementation Package

## Implementation Goal

Implement the TripleHelixManager component that manages three parallel learning paths and their rotation according to the Live Aid Stage Model, optimizing cognitive resource usage through varied learning experiences in the Zenjin Maths App.

## Component Context

The TripleHelixManager is a core component of the ProgressionSystem module that implements the Triple Helix learning model. This model is a key innovation in the Zenjin Maths App that optimizes cognitive resource usage by maintaining three parallel learning paths (often called "tubes") that operate simultaneously.

The Triple Helix model is based on the principle that cognitive resources are better utilized when learners engage with varied content rather than focusing intensely on a single topic. By rotating between three different learning paths, the system helps prevent cognitive fatigue while maintaining engagement and improving overall learning outcomes.

The Live Aid Stage Model, which the TripleHelixManager implements, ensures that while one learning path is active (being presented to the user), two others are being prepared in the background. This preparation includes selecting appropriate content, adjusting difficulty based on user performance, and ensuring a smooth transition when rotation occurs.

Each learning path can adapt independently based on the user's mastery level, allowing for personalized progression across different mathematical concepts. This independent adaptation ensures that users can progress at different rates in different areas of mathematics, providing an optimized learning experience.

## Interface Definition

```typescript
/**
 * Interface for the TripleHelixManager component
 */
export interface TripleHelixManagerInterface {
  /**
   * Gets the currently active learning path for a user
   * @param userId User identifier
   * @returns The active learning path
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws NO_ACTIVE_PATH if no active learning path exists for this user
   */
  getActiveLearningPath(userId: string): LearningPath;
  
  /**
   * Gets the learning paths being prepared for a user
   * @param userId User identifier
   * @returns Array of learning paths being prepared
   * @throws USER_NOT_FOUND if the specified user was not found
   */
  getPreparingPaths(userId: string): LearningPath[];
  
  /**
   * Rotates the learning paths, making a prepared path active
   * @param userId User identifier
   * @returns Result of the rotation operation
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws NO_TRIPLE_HELIX if no triple helix exists for this user
   * @throws ROTATION_FAILED if failed to rotate learning paths
   */
  rotateLearningPaths(userId: string): {
    previousActivePath: LearningPath;
    newActivePath: LearningPath;
    rotationCount: number;
  };
  
  /**
   * Sets up the initial learning paths for a new user
   * @param userId User identifier
   * @param initialDifficulty Initial difficulty level (1-5)
   * @returns Initial triple helix state
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws ALREADY_INITIALIZED if triple helix already initialized for this user
   * @throws INITIALIZATION_FAILED if failed to initialize triple helix
   */
  initializeTripleHelix(
    userId: string,
    initialDifficulty?: number
  ): TripleHelixState;
  
  /**
   * Gets the current triple helix state for a user
   * @param userId User identifier
   * @returns Current triple helix state
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws NO_TRIPLE_HELIX if no triple helix exists for this user
   */
  getTripleHelixState(userId: string): TripleHelixState;
  
  /**
   * Updates the difficulty of a specific learning path
   * @param userId User identifier
   * @param pathId Learning path identifier
   * @param newDifficulty New difficulty level (1-5)
   * @returns Updated learning path
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws PATH_NOT_FOUND if the specified learning path was not found
   * @throws INVALID_DIFFICULTY if the specified difficulty is invalid
   */
  updateLearningPathDifficulty(
    userId: string,
    pathId: string,
    newDifficulty: number
  ): LearningPath;
}
```

## Data Structures

```typescript
/**
 * Learning path data structure
 */
export type LearningPath = {
  /** Unique identifier for the learning path */
  id: string;
  
  /** Name of the learning path */
  name: string;
  
  /** Description of the learning path */
  description?: string;
  
  /** ID of the currently active stitch in this path */
  currentStitchId?: string;
  
  /** ID of the next stitch to be presented in this path */
  nextStitchId?: string;
  
  /** Current difficulty level of the path (1-5) */
  difficulty: number;
  
  /** Status of the path ('active', 'preparing', 'inactive') */
  status: string;
  
  /** Additional metadata for the learning path */
  metadata?: Record<string, any>;
};

/**
 * Triple helix state data structure
 */
export type TripleHelixState = {
  /** User identifier */
  userId: string;
  
  /** Currently active learning path */
  activePath: LearningPath;
  
  /** Learning paths being prepared */
  preparingPaths: LearningPath[];
  
  /** ISO date string of last rotation */
  lastRotationTime?: string;
  
  /** Number of rotations performed */
  rotationCount: number;
};
```

## Module Context

The TripleHelixManager is part of the ProgressionSystem module, which is responsible for managing the user's learning progression through the Zenjin Maths App. It interacts with:

1. **StitchManager**: To manage the individual learning units (stitches) within each learning path
2. **DistinctionManager**: To understand the user's mastery level for different mathematical concepts
3. **SpacedRepetitionSystem**: To optimize the timing of content presentation based on memory principles

The TripleHelixManager plays a central role in the Zenjin Maths App's learning approach by:

1. Ensuring cognitive resources are optimally utilized through varied learning experiences
2. Providing a structured progression through mathematical concepts
3. Adapting difficulty independently for different learning paths
4. Supporting the spaced repetition approach to memory reinforcement

## Implementation Requirements

The TripleHelixManager component must:

1. **Manage three parallel learning paths**:
   - Maintain three distinct learning paths for each user
   - Track the status of each path (active, preparing, inactive)
   - Store relevant metadata for each path

2. **Implement the Live Aid Stage Model**:
   - Ensure one path is active while two are being prepared
   - Manage smooth transitions between paths during rotation
   - Prepare appropriate content for upcoming paths

3. **Support path rotation**:
   - Implement a rotation mechanism that cycles through the three paths
   - Track rotation history and count
   - Ensure proper state transitions during rotation

4. **Adapt difficulty independently**:
   - Allow each learning path to have its own difficulty level
   - Provide mechanisms to update difficulty based on user performance
   - Ensure difficulty changes are properly persisted

5. **Initialize new users**:
   - Set up initial learning paths for new users
   - Apply appropriate initial difficulty levels
   - Ensure all paths are properly configured

6. **Provide state access**:
   - Allow retrieval of the current Triple Helix state
   - Provide access to active and preparing paths
   - Support querying of path-specific information

7. **Error handling**:
   - Properly handle missing user data
   - Validate inputs for path operations
   - Provide meaningful error messages

## Implementation Prompt

You are implementing the TripleHelixManager component for the Zenjin Maths App, which is responsible for managing three parallel learning paths (tubes) and their rotation according to the Live Aid Stage Model.

The TripleHelixManager must implement:

1. Three parallel learning paths that operate simultaneously:
   - Each path represents a different area of mathematical learning
   - Paths can have different difficulty levels
   - Each path maintains its own state and progression

2. Rotation between paths to optimize cognitive resource usage:
   - Implement the Live Aid Stage Model where one path is active and two are being prepared
   - Ensure smooth transitions between paths during rotation
   - Track rotation history and count

3. Adaptive difficulty for each learning path:
   - Allow each path to have an independent difficulty level (1-5)
   - Provide mechanisms to update difficulty based on user performance
   - Ensure difficulty changes are properly persisted

4. Path state management:
   - Track which stitch is currently active in each path
   - Prepare upcoming stitches for paths in the preparing state
   - Store relevant metadata for each path

Key methods to implement:
- `getActiveLearningPath`: Returns the currently active learning path for a user
- `rotateLearningPaths`: Rotates the learning paths, making a prepared path active
- `getPreparingPaths`: Returns the learning paths being prepared
- `initializeTripleHelix`: Sets up the initial learning paths for a new user
- `getTripleHelixState`: Gets the current triple helix state for a user
- `updateLearningPathDifficulty`: Updates the difficulty of a specific learning path

Technical requirements:
- Use TypeScript for type safety
- Implement the TripleHelixManagerInterface as defined in the ProgressionSystem module
- Integrate with the StitchManagerInterface to manage stitches within paths
- Ensure the implementation is testable with mock inputs
- Design for efficient rotation and path management
- Include comprehensive error handling
- Support independent adaptation of difficulty for each learning path

Please implement the TripleHelixManager component with all necessary TypeScript types, classes, and methods. Include comprehensive comments explaining the implementation details and how they relate to the Triple Helix learning model principles.

## Mock Inputs

```typescript
// Example 1: Get active learning path
const userId1 = 'user123';

// Example 2: Get preparing paths
const userId2 = 'user123';

// Example 3: Rotate learning paths
const userId3 = 'user123';

// Example 4: Initialize triple helix
const userId4 = 'user456';
const initialDifficulty4 = 2;

// Example 5: Get triple helix state
const userId5 = 'user123';

// Example 6: Update learning path difficulty
const userId6 = 'user123';
const pathId6 = 'path1';
const newDifficulty6 = 3;
```

## Expected Outputs

```typescript
// Output for Example 1: Get active learning path
const output1 = {
  id: 'path1',
  name: 'Addition Facts',
  description: 'Basic addition facts from 1+1 to 12+12',
  currentStitchId: 'stitch123',
  nextStitchId: null,
  difficulty: 3,
  status: 'active',
  metadata: {
    category: 'addition',
    lastAccessed: '2025-05-20T12:34:56Z'
  }
};

// Output for Example 2: Get preparing paths
const output2 = [
  {
    id: 'path2',
    name: 'Multiplication Facts',
    description: 'Basic multiplication facts from 1×1 to 12×12',
    currentStitchId: null,
    nextStitchId: 'stitch456',
    difficulty: 2,
    status: 'preparing',
    metadata: {
      category: 'multiplication',
      lastAccessed: '2025-05-19T10:11:12Z'
    }
  },
  {
    id: 'path3',
    name: 'Division Facts',
    description: 'Basic division facts',
    currentStitchId: null,
    nextStitchId: 'stitch789',
    difficulty: 4,
    status: 'preparing',
    metadata: {
      category: 'division',
      lastAccessed: '2025-05-18T09:08:07Z'
    }
  }
];

// Output for Example 3: Rotate learning paths
const output3 = {
  previousActivePath: {
    id: 'path1',
    name: 'Addition Facts',
    difficulty: 3,
    status: 'preparing'
  },
  newActivePath: {
    id: 'path2',
    name: 'Multiplication Facts',
    difficulty: 2,
    status: 'active'
  },
  rotationCount: 5
};

// Output for Example 4: Initialize triple helix
const output4 = {
  userId: 'user456',
  activePath: {
    id: 'path1',
    name: 'Addition Facts',
    difficulty: 2,
    status: 'active',
    currentStitchId: 'stitch001'
  },
  preparingPaths: [
    {
      id: 'path2',
      name: 'Multiplication Facts',
      difficulty: 2,
      status: 'preparing',
      nextStitchId: 'stitch002'
    },
    {
      id: 'path3',
      name: 'Division Facts',
      difficulty: 2,
      status: 'preparing',
      nextStitchId: 'stitch003'
    }
  ],
  rotationCount: 0
};

// Output for Example 5: Get triple helix state
const output5 = {
  userId: 'user123',
  activePath: {
    id: 'path1',
    name: 'Addition Facts',
    difficulty: 3,
    status: 'active',
    currentStitchId: 'stitch123'
  },
  preparingPaths: [
    {
      id: 'path2',
      name: 'Multiplication Facts',
      difficulty: 2,
      status: 'preparing',
      nextStitchId: 'stitch456'
    },
    {
      id: 'path3',
      name: 'Division Facts',
      difficulty: 4,
      status: 'preparing',
      nextStitchId: 'stitch789'
    }
  ],
  lastRotationTime: '2025-05-15T14:30:00Z',
  rotationCount: 4
};

// Output for Example 6: Update learning path difficulty
const output6 = {
  id: 'path1',
  name: 'Addition Facts',
  description: 'Basic addition facts from 1+1 to 12+12',
  currentStitchId: 'stitch123',
  difficulty: 3,
  status: 'active',
  metadata: {
    category: 'addition',
    lastAccessed: '2025-05-20T12:34:56Z',
    difficultyUpdated: '2025-05-20T13:45:00Z'
  }
};
```

## Validation Criteria

The TripleHelixManager component must meet the following validation criteria:

1. **PS-001**: TripleHelixManager must correctly rotate between three parallel learning paths according to the Live Aid Stage Model.
   - One path must be active at all times
   - Two paths must be in the preparing state
   - Rotation must follow the correct sequence
   - Path states must be properly updated during rotation

2. **PS-005**: TripleHelixManager must adapt difficulty independently for each learning path based on user mastery.
   - Each path must maintain its own difficulty level
   - Difficulty updates must be properly persisted
   - Difficulty must be within the valid range (1-5)
   - Difficulty changes must not affect other paths

3. **Performance**: Path operations must be efficient, with rotation completing quickly to ensure smooth user experience.

4. **Error Handling**: The component must properly handle invalid inputs and provide meaningful error messages.

5. **State Management**: The component must properly maintain and persist the Triple Helix state for each user.

## Triple Helix Model Context

Understanding the Triple Helix model is crucial for implementing the TripleHelixManager:

1. **Cognitive Resource Optimization**:
   - The Triple Helix model is based on the principle that cognitive resources are better utilized when learners engage with varied content
   - By rotating between three different learning paths, the system helps prevent cognitive fatigue
   - This approach leads to improved engagement and better learning outcomes

2. **Live Aid Stage Model**:
   - Inspired by concert stage setup where one band performs while others prepare
   - One learning path is active (being presented to the user)
   - Two learning paths are being prepared in the background
   - Preparation includes selecting appropriate content and adjusting difficulty

3. **Independent Adaptation**:
   - Each learning path adapts independently based on user performance
   - This allows users to progress at different rates in different areas of mathematics
   - The system can focus more resources on areas where the user struggles

4. **Rotation Mechanics**:
   - Rotation typically occurs after a certain number of questions or time period
   - The oldest preparing path becomes the new active path
   - The previously active path moves to preparing status
   - The system ensures smooth transitions between paths

The TripleHelixManager must implement these principles to provide an effective learning experience that optimizes cognitive resource usage and adapts to each user's individual needs.

## Usage Example

```typescript
// Example usage of TripleHelixManager
import { TripleHelixManager } from './components/TripleHelixManager';

// Create triple helix manager
const tripleHelixManager = new TripleHelixManager();

// Initialize triple helix for a new user
const initialState = tripleHelixManager.initializeTripleHelix('user123', 2);
console.log(`Active path: ${initialState.activePath.name}`);
console.log(`Preparing paths: ${initialState.preparingPaths.length}`);

// Get active learning path
const activePath = tripleHelixManager.getActiveLearningPath('user123');
console.log(`Active path: ${activePath.name}`);
console.log(`Current stitch: ${activePath.currentStitchId}`);
console.log(`Difficulty: ${activePath.difficulty}`);

// Get preparing paths
const preparingPaths = tripleHelixManager.getPreparingPaths('user123');
preparingPaths.forEach((path, index) => {
  console.log(`Preparing path ${index + 1}: ${path.name}`);
  console.log(`Next stitch: ${path.nextStitchId}`);
});

// Rotate learning paths
const rotationResult = tripleHelixManager.rotateLearningPaths('user123');
console.log(`Previous active: ${rotationResult.previousActivePath.name}`);
console.log(`New active: ${rotationResult.newActivePath.name}`);
console.log(`Rotation count: ${rotationResult.rotationCount}`);

// Get current triple helix state
const state = tripleHelixManager.getTripleHelixState('user123');
console.log(`Active path: ${state.activePath.name}`);
console.log(`Last rotation: ${state.lastRotationTime}`);
console.log(`Rotation count: ${state.rotationCount}`);

// Update learning path difficulty
const updatedPath = tripleHelixManager.updateLearningPathDifficulty(
  'user123',
  activePath.id,
  3
);
console.log(`Updated difficulty: ${updatedPath.difficulty}`);
```
