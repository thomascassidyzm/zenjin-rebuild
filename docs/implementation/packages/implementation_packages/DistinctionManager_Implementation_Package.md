# DistinctionManager Implementation Package for Claude 3.7 Sonnet

## Implementation Goal
Implement the DistinctionManager component that manages the five boundary levels of distinction and tracks user mastery at each level, forming the core of the distinction-based learning approach in the Zenjin Maths App.

## Component Context
The DistinctionManager is a critical component of the LearningEngine module, responsible for implementing the theoretical foundation of distinction-based learning. It manages the five boundary levels that represent increasingly fine-grained distinctions a learner must make:

1. **Category Boundaries (Level 1)**: Mathematical answers must be numerical
2. **Magnitude Boundaries (Level 2)**: Awareness of appropriate numerical ranges
3. **Operation Boundaries (Level 3)**: Differentiation between mathematical operations
4. **Related Fact Boundaries (Level 4)**: Distinction between adjacent facts in the same operation
5. **Near Miss Boundaries (Level 5)**: Precise differentiation between very similar numerical answers

The DistinctionManager tracks user mastery at each level and determines when a user should progress to the next level based on their performance.

## Technical Requirements
- Implement in TypeScript with comprehensive type definitions
- Strictly adhere to the DistinctionManagerInterface contract
- Ensure methods are fully documented with JSDoc comments
- Include appropriate error handling for all edge cases
- Implement efficient data structures for storing and retrieving user mastery data
- Design for performance with potentially thousands of facts per user
- Provide a mechanism for progressing through boundary levels based on user performance
- Include comprehensive unit tests for all functionality

## Interface Definition
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Interface name="DistinctionManagerInterface" version="1.1.0" module="LearningEngine">
  <Purpose>
    Defines the contract for the DistinctionManager component that manages the five boundary levels of distinction and tracks user mastery at each level.
  </Purpose>
  
  <DataStructures>
    <Structure name="BoundaryLevel">
      <Field name="level" type="number" required="true" description="Boundary level (1-5)" />
      <Field name="name" type="string" required="true" description="Name of the boundary level" />
      <Field name="description" type="string" required="true" description="Description of the boundary level" />
    </Structure>
    
    <Structure name="UserFactMastery">
      <Field name="userId" type="string" required="true" description="User identifier" />
      <Field name="factId" type="string" required="true" description="Mathematical fact identifier" />
      <Field name="currentLevel" type="number" required="true" description="Current boundary level (1-5)" />
      <Field name="masteryScore" type="number" required="true" description="Mastery score for the current level (0.0-1.0)" />
      <Field name="consecutiveCorrect" type="number" required="true" description="Number of consecutive correct answers" />
      <Field name="lastResponseTime" type="number" required="false" description="Last response time in milliseconds" />
      <Field name="lastAttemptDate" type="string" required="false" description="ISO date string of last attempt" />
    </Structure>
    
    <Structure name="PerformanceData">
      <Field name="correctFirstAttempt" type="boolean" required="true" description="Whether the answer was correct on first attempt" />
      <Field name="responseTime" type="number" required="true" description="Response time in milliseconds" />
      <Field name="consecutiveCorrect" type="number" required="false" description="Number of consecutive correct answers" defaultValue="0" />
    </Structure>
  </DataStructures>
  
  <Methods>
    <Method name="getCurrentBoundaryLevel">
      <Description>Gets the current boundary level for a user and fact</Description>
      <Input name="userId" type="string" required="true" description="User identifier" />
      <Input name="factId" type="string" required="true" description="Mathematical fact identifier" />
      <Output name="boundaryLevel" type="number" description="Current boundary level (1-5)" />
      <Errors>
        <Error code="USER_NOT_FOUND" description="The specified user was not found" />
        <Error code="FACT_NOT_FOUND" description="The specified fact was not found" />
        <Error code="NO_MASTERY_DATA" description="No mastery data exists for this user and fact" />
      </Errors>
      <Async>false</Async>
    </Method>
    
    <Method name="getUserFactMastery">
      <Description>Gets detailed mastery data for a user and fact</Description>
      <Input name="userId" type="string" required="true" description="User identifier" />
      <Input name="factId" type="string" required="true" description="Mathematical fact identifier" />
      <Output name="mastery" type="UserFactMastery" description="User fact mastery data" />
      <Errors>
        <Error code="USER_NOT_FOUND" description="The specified user was not found" />
        <Error code="FACT_NOT_FOUND" description="The specified fact was not found" />
        <Error code="NO_MASTERY_DATA" description="No mastery data exists for this user and fact" />
      </Errors>
      <Async>false</Async>
    </Method>
    
    <Method name="updateBoundaryLevel">
      <Description>Updates the boundary level based on user performance</Description>
      <Input name="userId" type="string" required="true" description="User identifier" />
      <Input name="factId" type="string" required="true" description="Mathematical fact identifier" />
      <Input name="performance" type="PerformanceData" required="true" description="Performance data for the update" />
      <Output name="result" type="object" description="Result of the update operation">
        <Field name="previousLevel" type="number" description="Previous boundary level" />
        <Field name="newLevel" type="number" description="New boundary level" />
        <Field name="levelChanged" type="boolean" description="Whether the level changed" />
        <Field name="masteryScore" type="number" description="Updated mastery score" />
      </Output>
      <Errors>
        <Error code="USER_NOT_FOUND" description="The specified user was not found" />
        <Error code="FACT_NOT_FOUND" description="The specified fact was not found" />
        <Error code="INVALID_PERFORMANCE_DATA" description="The performance data is invalid" />
      </Errors>
      <Async>false</Async>
    </Method>
    
    <Method name="getBoundaryLevelDescription">
      <Description>Gets the description of a specific boundary level</Description>
      <Input name="level" type="number" required="true" description="Boundary level (1-5)" />
      <Output name="description" type="BoundaryLevel" description="Boundary level description" />
      <Errors>
        <Error code="INVALID_LEVEL" description="The specified level is invalid" />
      </Errors>
      <Async>false</Async>
    </Method>
    
    <Method name="getAllBoundaryLevels">
      <Description>Gets descriptions of all boundary levels</Description>
      <Output name="levels" type="BoundaryLevel[]" description="Array of all boundary level descriptions" />
      <Errors>
        <!-- No specific errors for this method -->
      </Errors>
      <Async>false</Async>
    </Method>
    
    <Method name="initializeUserFactMastery">
      <Description>Initializes mastery data for a user and fact</Description>
      <Input name="userId" type="string" required="true" description="User identifier" />
      <Input name="factId" type="string" required="true" description="Mathematical fact identifier" />
      <Input name="initialLevel" type="number" required="false" description="Initial boundary level (1-5)" defaultValue="1" />
      <Output name="success" type="boolean" description="Whether the initialization was successful" />
      <Errors>
        <Error code="USER_NOT_FOUND" description="The specified user was not found" />
        <Error code="FACT_NOT_FOUND" description="The specified fact was not found" />
        <Error code="INVALID_LEVEL" description="The specified initial level is invalid" />
        <Error code="ALREADY_INITIALIZED" description="Mastery data already exists for this user and fact" />
      </Errors>
      <Async>false</Async>
    </Method>
  </Methods>
</Interface>
```

## Module Definition (Relevant Sections)
```xml
<Component name="DistinctionManager">
  <Description>
    Implements the five boundary levels of distinction and tracks user mastery.
  </Description>
  <Implements>DistinctionManagerInterface</Implements>
  <Dependencies>
    <Dependency interface="FactRepositoryInterface" />
  </Dependencies>
</Component>

<ValidationCriteria>
  <Criterion id="LE-001" test="tests/learning/boundary_levels_test.js">
    DistinctionManager must correctly implement all five boundary levels: Category, Magnitude, Operation, Related Fact, and Near Miss.
  </Criterion>
  <Criterion id="LE-005" test="tests/learning/boundary_progression_test.js">
    DistinctionManager must appropriately update boundary levels based on user performance.
  </Criterion>
</ValidationCriteria>

<SystemRequirements>
  <Requirement type="Adaptability" name="BoundaryLevelAdjustment">
    Boundary level adjustments must be responsive to user performance while avoiding oscillation.
  </Requirement>
</SystemRequirements>
```

## Implementation Prompt
You are implementing the DistinctionManager component for the Zenjin Maths App, a critical part of the LearningEngine module that manages the five boundary levels of distinction and tracks user mastery at each level.

Your task is to create the following files:
1. `DistinctionManager.tsx` - Main component implementation
2. `DistinctionManager.test.tsx` - Unit tests for the component
3. `README.md` - Documentation for the component

The DistinctionManager needs to implement the following functionality:

1. **Boundary Level Management**
   - Define and implement all five boundary levels:
     - Category Boundaries (Level 1): Mathematical answers must be numerical
     - Magnitude Boundaries (Level 2): Awareness of appropriate numerical ranges
     - Operation Boundaries (Level 3): Differentiation between mathematical operations
     - Related Fact Boundaries (Level 4): Distinction between adjacent facts in the same operation
     - Near Miss Boundaries (Level 5): Precise differentiation between very similar numerical answers
   - Provide methods to get descriptions of boundary levels

2. **User Mastery Tracking**
   - Track mastery data for each user and fact
   - Implement methods to get and update mastery data
   - Initialize mastery data for new users and facts

3. **Boundary Level Progression**
   - Implement an algorithm for determining when a user should progress to the next boundary level
   - Consider factors like response time, consecutive correct answers, and overall mastery
   - Avoid oscillation between levels (don't promote/demote too quickly)

4. **Performance Optimization**
   - Design data structures for efficient storage and retrieval of mastery data
   - Optimize for potentially thousands of facts per user

The implementation should adhere strictly to the DistinctionManagerInterface contract and include comprehensive error handling and logging.

## Mock Inputs for Testing
```typescript
// Example 1: Get current boundary level
distinctionManager.getCurrentBoundaryLevel('user123', 'mult-7-8');

// Example 2: Update boundary level based on performance
distinctionManager.updateBoundaryLevel('user123', 'mult-7-8', {
  correctFirstAttempt: true,
  responseTime: 1200,
  consecutiveCorrect: 3
});

// Example 3: Get detailed mastery data
distinctionManager.getUserFactMastery('user123', 'mult-7-8');

// Example 4: Get boundary level description
distinctionManager.getBoundaryLevelDescription(4);

// Example 5: Get all boundary levels
distinctionManager.getAllBoundaryLevels();

// Example 6: Initialize mastery data
distinctionManager.initializeUserFactMastery('user456', 'add-5-7', 2);
```

## Expected Outputs
```typescript
// Example 1 Output: Current boundary level
3

// Example 2 Output: Boundary level update result
{
  previousLevel: 3,
  newLevel: 4,
  levelChanged: true,
  masteryScore: 0.75
}

// Example 3 Output: User fact mastery data
{
  userId: 'user123',
  factId: 'mult-7-8',
  currentLevel: 4,
  masteryScore: 0.75,
  consecutiveCorrect: 4,
  lastResponseTime: 1200,
  lastAttemptDate: '2025-05-20T15:30:45Z'
}

// Example 4 Output: Boundary level description
{
  level: 4,
  name: 'Related Fact Boundaries',
  description: 'Distinguishes between adjacent facts in the same operation (e.g., 7 × 8 = 56 vs. 7 × 7 = 49)'
}

// Example 5 Output: All boundary levels
[
  {
    level: 1,
    name: 'Category Boundaries',
    description: 'Mathematical answers must be numerical'
  },
  {
    level: 2,
    name: 'Magnitude Boundaries',
    description: 'Awareness of appropriate numerical ranges'
  },
  {
    level: 3,
    name: 'Operation Boundaries',
    description: 'Differentiation between mathematical operations'
  },
  {
    level: 4,
    name: 'Related Fact Boundaries',
    description: 'Distinction between adjacent facts in the same operation'
  },
  {
    level: 5,
    name: 'Near Miss Boundaries',
    description: 'Precise differentiation between very similar numerical answers'
  }
]

// Example 6 Output: Initialization result
true
```

## Validation Criteria
1. The component must correctly implement all five boundary levels with appropriate descriptions and behaviors.
2. The boundary level progression algorithm must be responsive to user performance while avoiding oscillation.
3. The implementation must handle all potential error cases gracefully.
4. The component must be efficient and performant for large numbers of users and facts.
5. All tests must pass, covering both normal operation and edge cases.

## Domain-Specific Context
The distinction-based learning approach is fundamental to the Zenjin Maths App. It is based on the theory that learning occurs through making increasingly fine-grained distinctions between concepts. 

The five boundary levels represent stages of mastery:
- **Level 1 (Category)**: The most basic distinction - can the student identify that the answer should be a number?
- **Level 2 (Magnitude)**: Can the student identify the approximate range of the answer?
- **Level 3 (Operation)**: Can the student distinguish between different operations (e.g., addition vs. multiplication)?
- **Level 4 (Related Fact)**: Can the student distinguish between adjacent facts in the same operation (e.g., 7×8 vs. 7×7)?
- **Level 5 (Near Miss)**: Can the student distinguish between very similar numerical answers (e.g., 56 vs. 54)?

This component is a cornerstone of the learning algorithm, and its correct implementation is critical to the educational effectiveness of the application.