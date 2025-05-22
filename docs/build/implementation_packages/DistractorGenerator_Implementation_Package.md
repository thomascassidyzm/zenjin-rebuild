# DistractorGenerator Implementation Package for Claude 3.7 Sonnet

## Implementation Goal
Implement the DistractorGenerator component that creates pedagogically appropriate distractors based on boundary levels and mathematical facts, ensuring effective distinction-based learning in the Zenjin Maths App.

## Component Context
The DistractorGenerator is a critical component of the LearningEngine module, responsible for generating incorrect answer options (distractors) that are specifically designed to test a learner's mastery at their current boundary level. Rather than random incorrect answers, these distractors are carefully crafted to challenge the specific distinction being taught.

The component works in conjunction with the DistinctionManager, using the five boundary levels to determine what kind of distractors are appropriate:

1. **Category Boundaries (Level 1)**: Distractors might include non-numerical answers
2. **Magnitude Boundaries (Level 2)**: Distractors with very different magnitudes from the correct answer
3. **Operation Boundaries (Level 3)**: Distractors that would be correct for a different operation
4. **Related Fact Boundaries (Level 4)**: Distractors from adjacent facts in the same operation
5. **Near Miss Boundaries (Level 5)**: Distractors with very similar numerical values to the correct answer

This targeted approach ensures that the learning experience is precisely focused on the current learning needs of the user.

## Technical Requirements
- Implement in TypeScript with comprehensive type definitions
- Strictly adhere to the DistractorGeneratorInterface contract
- Ensure methods are fully documented with JSDoc comments
- Include appropriate error handling for all edge cases
- Implement efficient algorithms for generating appropriate distractors
- Design for performance with fast generation times (under 50ms)
- Implement distractor generation strategies for each boundary level
- Include comprehensive unit tests for all functionality

## Interface Definition
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Interface name="DistractorGeneratorInterface" version="1.1.0" module="LearningEngine">
  <Purpose>
    Defines the contract for the DistractorGenerator component that generates appropriate distractors based on the boundary level and mathematical fact.
  </Purpose>
  
  <DataStructures>
    <Structure name="DistractorRequest">
      <Field name="factId" type="string" required="true" description="Mathematical fact identifier" />
      <Field name="boundaryLevel" type="number" required="true" description="Boundary level (1-5)" />
      <Field name="correctAnswer" type="string" required="true" description="The correct answer" />
      <Field name="count" type="number" required="false" description="Number of distractors to generate" defaultValue="1" />
    </Structure>
    
    <Structure name="Distractor">
      <Field name="value" type="string" required="true" description="The distractor value" />
      <Field name="boundaryLevel" type="number" required="true" description="The boundary level this distractor targets" />
      <Field name="explanation" type="string" required="false" description="Explanation of why this distractor was chosen" />
      <Field name="difficulty" type="number" required="false" description="Difficulty rating (0.0-1.0)" />
    </Structure>
  </DataStructures>
  
  <Methods>
    <Method name="generateDistractor">
      <Description>Generates a distractor based on the boundary level and mathematical fact</Description>
      <Input name="request" type="DistractorRequest" required="true" description="Distractor generation request" />
      <Output name="distractor" type="Distractor" description="Generated distractor" />
      <Errors>
        <Error code="INVALID_FACT" description="The specified fact is invalid or not found" />
        <Error code="INVALID_BOUNDARY_LEVEL" description="The specified boundary level is invalid" />
        <Error code="GENERATION_FAILED" description="Failed to generate a distractor" />
      </Errors>
      <Async>false</Async>
    </Method>
    
    <Method name="generateMultipleDistractors">
      <Description>Generates multiple distractors based on the boundary level and mathematical fact</Description>
      <Input name="request" type="DistractorRequest" required="true" description="Distractor generation request" />
      <Output name="distractors" type="Distractor[]" description="Array of generated distractors" />
      <Errors>
        <Error code="INVALID_FACT" description="The specified fact is invalid or not found" />
        <Error code="INVALID_BOUNDARY_LEVEL" description="The specified boundary level is invalid" />
        <Error code="GENERATION_FAILED" description="Failed to generate distractors" />
      </Errors>
      <Async>false</Async>
    </Method>
    
    <Method name="getDistractorExplanation">
      <Description>Gets an explanation for why a distractor was chosen</Description>
      <Input name="factId" type="string" required="true" description="Mathematical fact identifier" />
      <Input name="distractor" type="string" required="true" description="The distractor value" />
      <Input name="boundaryLevel" type="number" required="true" description="Boundary level (1-5)" />
      <Output name="explanation" type="string" description="Explanation of why the distractor was chosen" />
      <Errors>
        <Error code="INVALID_FACT" description="The specified fact is invalid or not found" />
        <Error code="INVALID_DISTRACTOR" description="The specified distractor is invalid" />
        <Error code="INVALID_BOUNDARY_LEVEL" description="The specified boundary level is invalid" />
      </Errors>
      <Async>false</Async>
    </Method>
    
    <Method name="validateDistractor">
      <Description>Validates whether a distractor is appropriate for the given boundary level and fact</Description>
      <Input name="factId" type="string" required="true" description="Mathematical fact identifier" />
      <Input name="distractor" type="string" required="true" description="The distractor value" />
      <Input name="boundaryLevel" type="number" required="true" description="Boundary level (1-5)" />
      <Input name="correctAnswer" type="string" required="true" description="The correct answer" />
      <Output name="result" type="object" description="Validation result">
        <Field name="isValid" type="boolean" description="Whether the distractor is valid" />
        <Field name="reason" type="string" description="Reason for validation result" />
      </Output>
      <Errors>
        <Error code="INVALID_FACT" description="The specified fact is invalid or not found" />
        <Error code="INVALID_BOUNDARY_LEVEL" description="The specified boundary level is invalid" />
      </Errors>
      <Async>false</Async>
    </Method>
  </Methods>
</Interface>
```

## Module Definition (Relevant Sections)
```xml
<Component name="DistractorGenerator">
  <Description>
    Generates distractors based on boundary levels and mathematical facts.
  </Description>
  <Implements>DistractorGeneratorInterface</Implements>
  <Dependencies>
    <Dependency interface="FactRepositoryInterface" />
    <Dependency interface="DistinctionManagerInterface" />
  </Dependencies>
</Component>

<ValidationCriteria>
  <Criterion id="LE-002" test="tests/learning/distractor_generation_test.js">
    DistractorGenerator must generate appropriate distractors for each boundary level that isolate the specific boundary being tested.
  </Criterion>
</ValidationCriteria>

<SystemRequirements>
  <Requirement type="Performance" name="DistractorGenerationTime">
    Distractor generation must complete within 50ms to ensure smooth user experience.
  </Requirement>
  <Requirement type="Accuracy" name="DistractorRelevance">
    Distractors must be relevant to the specific boundary level being tested.
  </Requirement>
</SystemRequirements>
```

## Implementation Prompt
You are implementing the DistractorGenerator component for the Zenjin Maths App, a critical part of the LearningEngine module that generates pedagogically appropriate incorrect answer options (distractors) based on the user's current boundary level and mathematical fact.

Your task is to create the following files:
1. `DistractorGenerator.tsx` - Main component implementation
2. `DistractorGenerator.test.tsx` - Unit tests for the component
3. `README.md` - Documentation for the component

The DistractorGenerator needs to implement the following functionality:

1. **Boundary-Level Specific Distractor Generation**
   - Implement different distractor generation strategies for each boundary level:
     - **Level 1 (Category)**: Non-numerical or obviously incorrect numerical answers
     - **Level 2 (Magnitude)**: Numbers with very different magnitudes from the correct answer
     - **Level 3 (Operation)**: Results from applying the wrong operation (e.g., addition instead of multiplication)
     - **Level 4 (Related Fact)**: Results from adjacent facts in the same operation (e.g., 7×7=49 as a distractor for 7×8=56)
     - **Level 5 (Near Miss)**: Numbers very close to the correct answer (e.g., 54 or 57 as distractors for 56)

2. **Multiple Distractor Generation**
   - Generate multiple distractors for a given fact and boundary level
   - Ensure distractors are distinct from each other
   - Maintain appropriate difficulty for the boundary level

3. **Distractor Explanation**
   - Provide clear explanations for why each distractor was chosen
   - Relate explanations to the specific boundary level and learning objective

4. **Distractor Validation**
   - Validate whether a distractor is appropriate for a given boundary level and fact
   - Check relevance, distinctiveness, and pedagogical value

The implementation should be designed for high performance, completing distractor generation in under 50ms to ensure a smooth user experience. It should also include comprehensive error handling and logging.

The component has dependencies on both the FactRepositoryInterface (to access mathematical facts) and the DistinctionManagerInterface (to understand boundary levels). You should assume these dependencies will be provided through dependency injection.

## Mock Inputs for Testing
```typescript
// Example 1: Generate a single distractor
distractorGenerator.generateDistractor({
  factId: 'mult-7-8',
  boundaryLevel: 4,
  correctAnswer: '56'
});

// Example 2: Generate multiple distractors
distractorGenerator.generateMultipleDistractors({
  factId: 'mult-7-8',
  boundaryLevel: 5,
  correctAnswer: '56',
  count: 3
});

// Example 3: Get distractor explanation
distractorGenerator.getDistractorExplanation(
  'mult-7-8',
  '49',
  4
);

// Example 4: Validate a distractor
distractorGenerator.validateDistractor(
  'mult-7-8',
  '49',
  4,
  '56'
);

// Example 5: Generate distractor for level 1
distractorGenerator.generateDistractor({
  factId: 'add-5-7',
  boundaryLevel: 1,
  correctAnswer: '12'
});

// Example 6: Generate distractor for level 2
distractorGenerator.generateDistractor({
  factId: 'add-5-7',
  boundaryLevel: 2,
  correctAnswer: '12'
});

// Example 7: Generate distractor for level 3
distractorGenerator.generateDistractor({
  factId: 'add-5-7',
  boundaryLevel: 3,
  correctAnswer: '12'
});
```

## Expected Outputs
```typescript
// Example 1 Output: Single distractor for level 4
{
  value: '49',
  boundaryLevel: 4,
  explanation: 'This is the result of 7×7, which is adjacent to 7×8 in the multiplication table',
  difficulty: 0.7
}

// Example 2 Output: Multiple distractors for level 5
[
  {
    value: '54',
    boundaryLevel: 5,
    explanation: 'This is 2 less than the correct answer of 56',
    difficulty: 0.85
  },
  {
    value: '57',
    boundaryLevel: 5,
    explanation: 'This is 1 more than the correct answer of 56',
    difficulty: 0.9
  },
  {
    value: '58',
    boundaryLevel: 5,
    explanation: 'This is 2 more than the correct answer of 56',
    difficulty: 0.85
  }
]

// Example 3 Output: Distractor explanation
'This is the result of 7×7, which is adjacent to 7×8 in the multiplication table. Level 4 (Related Fact Boundaries) tests whether you can distinguish between adjacent facts in the same operation.'

// Example 4 Output: Validation result
{
  isValid: true,
  reason: 'This distractor is appropriate for level 4 as it represents a related fact (7×7) and challenges the student to distinguish between adjacent multiplication facts.'
}

// Example 5 Output: Distractor for level 1
{
  value: 'fifty-six',
  boundaryLevel: 1,
  explanation: 'This is a non-numerical answer testing category boundaries',
  difficulty: 0.3
}

// Example 6 Output: Distractor for level 2
{
  value: '120',
  boundaryLevel: 2,
  explanation: 'This is an order of magnitude larger than the correct answer of 12',
  difficulty: 0.5
}

// Example 7 Output: Distractor for level 3
{
  value: '35',
  boundaryLevel: 3,
  explanation: 'This is the result of multiplying 5×7 instead of adding them',
  difficulty: 0.6
}
```

## Validation Criteria
1. The component must generate appropriate distractors for each boundary level that isolate the specific boundary being tested.
2. Distractor generation must complete within 50ms to ensure a smooth user experience.
3. Distractors must be relevant to the specific boundary level and mathematical fact.
4. The implementation must handle all potential error cases gracefully.
5. Multiple distractors for the same fact and boundary level must be distinct from each other.
6. All tests must pass, covering both normal operation and edge cases.

## Domain-Specific Context
The quality of distractors is crucial to effective learning in the Zenjin Maths App. Random incorrect answers do not facilitate targeted learning; instead, distractors should be carefully crafted to challenge the specific distinction being taught at each boundary level.

For example:
- When teaching a student to distinguish 7×8=56 from 7×7=49 (Level 4 - Related Fact Boundaries), presenting "49" as a distractor is pedagogically valuable
- When teaching a student to distinguish 7×8=56 from 6×9=54 (Level 5 - Near Miss Boundaries), presenting "54" as a distractor is pedagogically valuable

The DistractorGenerator should consider these educational principles when generating distractors, ensuring they target the specific learning objective at each boundary level. This component works closely with the DistinctionManager to create a cohesive learning experience that progressively refines a student's ability to make mathematical distinctions.