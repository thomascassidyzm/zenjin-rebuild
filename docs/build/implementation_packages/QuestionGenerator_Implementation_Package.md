# QuestionGenerator Implementation Package for Claude 3.7 Sonnet

## Implementation Goal
Implement the QuestionGenerator component that generates appropriate mathematical questions based on the user's active learning path, mastery level, and progression through the Triple Helix learning model, ensuring a personalized and effective learning experience in the Zenjin Maths App.

## Component Context
The QuestionGenerator is a pivotal component of the LearningEngine module, responsible for creating mathematical questions that are presented to the user. It works in conjunction with the DistinctionManager, DistractorGenerator, and TripleHelixManager to deliver questions that are:

1. Appropriate for the user's current boundary level of mastery
2. Aligned with their active learning path in the Triple Helix model
3. Sequenced according to the spaced repetition system

The QuestionGenerator doesn't simply provide random questions; it strategically selects facts that the user needs to practice based on their learning history and current performance. This ensures that each question contributes meaningfully to the user's learning progression.

The component serves as a bridge between the theoretical learning model (implemented in the ProgressionSystem module) and the practical user experience (implemented in the UserInterface module). It transforms abstract learning concepts into concrete questions for the user to answer.

## Technical Requirements
- Implement in TypeScript with comprehensive type definitions
- Strictly adhere to the QuestionGeneratorInterface contract
- Ensure methods are fully documented with JSDoc comments
- Include appropriate error handling for all edge cases
- Implement efficient algorithms for question selection and generation
- Design for performance, generating questions in under 30ms
- Implement question generation strategies based on learning paths and mastery levels
- Include comprehensive unit tests for all functionality

## Interface Definition
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Interface name="QuestionGeneratorInterface" version="1.1.0" module="LearningEngine">
  <Purpose>
    Defines the contract for the QuestionGenerator component that generates questions based on the active learning path and user's progress.
  </Purpose>
  
  <DataStructures>
    <Structure name="Question">
      <Field name="id" type="string" required="true" description="Unique identifier for the question" />
      <Field name="factId" type="string" required="true" description="Mathematical fact identifier" />
      <Field name="text" type="string" required="true" description="Question text to display to the user" />
      <Field name="correctAnswer" type="string" required="true" description="The correct answer" />
      <Field name="boundaryLevel" type="number" required="true" description="Boundary level (1-5) this question targets" />
      <Field name="learningPathId" type="string" required="true" description="Identifier for the learning path" />
      <Field name="operation" type="string" required="true" description="Mathematical operation (e.g., 'addition', 'multiplication')" />
      <Field name="difficulty" type="number" required="false" description="Difficulty rating (0.0-1.0)" />
      <Field name="tags" type="string[]" required="false" description="Tags for categorizing the question" />
    </Structure>
    
    <Structure name="QuestionRequest">
      <Field name="userId" type="string" required="true" description="User identifier" />
      <Field name="learningPathId" type="string" required="true" description="Identifier for the active learning path" />
      <Field name="preferredOperations" type="string[]" required="false" description="Preferred operations to focus on" />
      <Field name="excludeFactIds" type="string[]" required="false" description="Fact IDs to exclude from selection" />
      <Field name="maxDifficulty" type="number" required="false" description="Maximum difficulty level (0.0-1.0)" />
      <Field name="count" type="number" required="false" description="Number of questions to generate" defaultValue="1" />
    </Structure>
    
    <Structure name="QuestionSetInfo">
      <Field name="totalQuestions" type="number" required="true" description="Total number of questions available for the learning path" />
      <Field name="completedQuestions" type="number" required="true" description="Number of questions the user has completed" />
      <Field name="masteredFacts" type="number" required="true" description="Number of facts the user has mastered at level 5" />
      <Field name="inProgressFacts" type="number" required="true" description="Number of facts the user is currently learning" />
      <Field name="averageBoundaryLevel" type="number" required="true" description="Average boundary level across all facts" />
    </Structure>
  </DataStructures>
  
  <Methods>
    <Method name="generateQuestion">
      <Description>Generates a question based on the user's active learning path and progress</Description>
      <Input name="request" type="QuestionRequest" required="true" description="Question generation request" />
      <Output name="question" type="Question" description="Generated question" />
      <Errors>
        <Error code="USER_NOT_FOUND" description="The specified user was not found" />
        <Error code="LEARNING_PATH_NOT_FOUND" description="The specified learning path was not found" />
        <Error code="NO_APPROPRIATE_QUESTIONS" description="No appropriate questions are available for the user's current progress" />
        <Error code="GENERATION_FAILED" description="Failed to generate a question" />
      </Errors>
      <Async>false</Async>
    </Method>
    
    <Method name="generateMultipleQuestions">
      <Description>Generates multiple questions based on the user's active learning path and progress</Description>
      <Input name="request" type="QuestionRequest" required="true" description="Question generation request" />
      <Output name="questions" type="Question[]" description="Array of generated questions" />
      <Errors>
        <Error code="USER_NOT_FOUND" description="The specified user was not found" />
        <Error code="LEARNING_PATH_NOT_FOUND" description="The specified learning path was not found" />
        <Error code="NO_APPROPRIATE_QUESTIONS" description="No appropriate questions are available for the user's current progress" />
        <Error code="GENERATION_FAILED" description="Failed to generate questions" />
      </Errors>
      <Async>false</Async>
    </Method>
    
    <Method name="getNextQuestion">
      <Description>Gets the next question for a user based on their learning path and progress</Description>
      <Input name="userId" type="string" required="true" description="User identifier" />
      <Input name="learningPathId" type="string" required="true" description="Identifier for the active learning path" />
      <Output name="question" type="Question" description="Next question in the sequence" />
      <Errors>
        <Error code="USER_NOT_FOUND" description="The specified user was not found" />
        <Error code="LEARNING_PATH_NOT_FOUND" description="The specified learning path was not found" />
        <Error code="NO_APPROPRIATE_QUESTIONS" description="No appropriate questions are available for the user's current progress" />
      </Errors>
      <Async>false</Async>
    </Method>
    
    <Method name="getQuestionSetInfo">
      <Description>Gets information about the current question set for a user and learning path</Description>
      <Input name="userId" type="string" required="true" description="User identifier" />
      <Input name="learningPathId" type="string" required="true" description="Identifier for the learning path" />
      <Output name="info" type="QuestionSetInfo" description="Information about the question set" />
      <Errors>
        <Error code="USER_NOT_FOUND" description="The specified user was not found" />
        <Error code="LEARNING_PATH_NOT_FOUND" description="The specified learning path was not found" />
      </Errors>
      <Async>false</Async>
    </Method>
    
    <Method name="formatQuestionText">
      <Description>Formats a question text template with the appropriate values</Description>
      <Input name="factId" type="string" required="true" description="Mathematical fact identifier" />
      <Input name="template" type="string" required="true" description="Question text template" />
      <Output name="formattedText" type="string" description="Formatted question text" />
      <Errors>
        <Error code="INVALID_FACT" description="The specified fact is invalid or not found" />
        <Error code="INVALID_TEMPLATE" description="The specified template is invalid" />
      </Errors>
      <Async>false</Async>
    </Method>
  </Methods>
  
  <Dependencies>
    <Dependency interface="FactRepositoryInterface" module="LearningEngine" />
    <Dependency interface="DistinctionManagerInterface" module="LearningEngine" />
    <Dependency interface="TripleHelixManagerInterface" module="ProgressionSystem" />
  </Dependencies>
</Interface>
```

## Module Definition (Relevant Sections)
```xml
<Component name="QuestionGenerator">
  <Description>
    Generates questions based on learning paths and user progress.
  </Description>
  <Implements>QuestionGeneratorInterface</Implements>
  <Dependencies>
    <Dependency interface="FactRepositoryInterface" />
    <Dependency interface="DistinctionManagerInterface" />
  </Dependencies>
</Component>

<ValidationCriteria>
  <Criterion id="LE-003" test="tests/learning/question_generation_test.js">
    QuestionGenerator must generate questions appropriate for the user's current learning path and mastery level.
  </Criterion>
</ValidationCriteria>

<SystemRequirements>
  <Requirement type="Performance" name="QuestionGenerationTime">
    Question generation must complete within 30ms to ensure smooth user experience.
  </Requirement>
  <Requirement type="Adaptability" name="QuestionDifficulty">
    Questions must adapt to the user's current mastery level and learning path.
  </Requirement>
</SystemRequirements>
```

## Implementation Prompt
You are implementing the QuestionGenerator component for the Zenjin Maths App, a key part of the LearningEngine module that generates appropriate mathematical questions based on the user's learning path, mastery level, and progression through the Triple Helix learning model.

Your task is to create the following files:
1. `QuestionGenerator.tsx` - Main component implementation
2. `QuestionGenerator.test.tsx` - Unit tests for the component
3. `README.md` - Documentation for the component

The QuestionGenerator needs to implement the following functionality:

1. **Question Generation**
   - Generate questions based on the user's active learning path and progress
   - Select appropriate facts based on the user's current mastery level
   - Format questions with appropriate text templates
   - Ensure questions target the correct boundary level

2. **Learning Path Integration**
   - Work with the TripleHelixManager to respect the user's current learning path
   - Ensure questions follow the proper progression through the curriculum
   - Adapt to changes in the user's learning path

3. **Mastery-Based Selection**
   - Use the DistinctionManager to get the user's current mastery level for facts
   - Prioritize facts that need practice based on spaced repetition principles
   - Avoid excessive repetition of the same facts

4. **Performance Optimization**
   - Generate questions efficiently (under 30ms)
   - Implement caching where appropriate
   - Handle large numbers of facts and users

The implementation should be designed for performance and adaptability, ensuring that questions are generated quickly and are appropriately targeted to the user's current learning needs. It should also include comprehensive error handling and logging.

The component has dependencies on the FactRepositoryInterface (to access mathematical facts), the DistinctionManagerInterface (to understand the user's mastery levels), and the TripleHelixManagerInterface (to understand the user's learning path). You should assume these dependencies will be provided through dependency injection.

## Mock Inputs for Testing
```typescript
// Example 1: Generate a question
questionGenerator.generateQuestion({
  userId: 'user123',
  learningPathId: 'multiplication-basic'
});

// Example 2: Generate multiple questions
questionGenerator.generateMultipleQuestions({
  userId: 'user123',
  learningPathId: 'multiplication-basic',
  preferredOperations: ['multiplication'],
  count: 3
});

// Example 3: Get the next question
questionGenerator.getNextQuestion(
  'user123',
  'multiplication-basic'
);

// Example 4: Get question set info
questionGenerator.getQuestionSetInfo(
  'user123',
  'multiplication-basic'
);

// Example 5: Format question text
questionGenerator.formatQuestionText(
  'mult-7-8',
  'What is {{operand1}} × {{operand2}}?'
);

// Example 6: Generate question with constraints
questionGenerator.generateQuestion({
  userId: 'user123',
  learningPathId: 'multiplication-basic',
  preferredOperations: ['multiplication'],
  excludeFactIds: ['mult-7-8', 'mult-7-7'],
  maxDifficulty: 0.7
});
```

## Expected Outputs
```typescript
// Example 1 Output: Generated question
{
  id: 'q-12345',
  factId: 'mult-7-8',
  text: 'What is 7 × 8?',
  correctAnswer: '56',
  boundaryLevel: 4,
  learningPathId: 'multiplication-basic',
  operation: 'multiplication',
  difficulty: 0.7,
  tags: ['multiplication', 'single-digit']
}

// Example 2 Output: Multiple generated questions
[
  {
    id: 'q-12345',
    factId: 'mult-7-8',
    text: 'What is 7 × 8?',
    correctAnswer: '56',
    boundaryLevel: 4,
    learningPathId: 'multiplication-basic',
    operation: 'multiplication',
    difficulty: 0.7,
    tags: ['multiplication', 'single-digit']
  },
  {
    id: 'q-12346',
    factId: 'mult-6-9',
    text: 'What is 6 × 9?',
    correctAnswer: '54',
    boundaryLevel: 3,
    learningPathId: 'multiplication-basic',
    operation: 'multiplication',
    difficulty: 0.65,
    tags: ['multiplication', 'single-digit']
  },
  {
    id: 'q-12347',
    factId: 'mult-9-9',
    text: 'What is 9 × 9?',
    correctAnswer: '81',
    boundaryLevel: 5,
    learningPathId: 'multiplication-basic',
    operation: 'multiplication',
    difficulty: 0.8,
    tags: ['multiplication', 'single-digit']
  }
]

// Example 3 Output: Next question
{
  id: 'q-12348',
  factId: 'mult-7-9',
  text: 'What is 7 × 9?',
  correctAnswer: '63',
  boundaryLevel: 4,
  learningPathId: 'multiplication-basic',
  operation: 'multiplication',
  difficulty: 0.75,
  tags: ['multiplication', 'single-digit']
}

// Example 4 Output: Question set info
{
  totalQuestions: 100,
  completedQuestions: 42,
  masteredFacts: 15,
  inProgressFacts: 27,
  averageBoundaryLevel: 3.2
}

// Example 5 Output: Formatted question text
'What is 7 × 8?'

// Example 6 Output: Generated question with constraints
{
  id: 'q-12349',
  factId: 'mult-6-8',
  text: 'What is 6 × 8?',
  correctAnswer: '48',
  boundaryLevel: 3,
  learningPathId: 'multiplication-basic',
  operation: 'multiplication',
  difficulty: 0.6,
  tags: ['multiplication', 'single-digit']
}
```

## Validation Criteria
1. The component must generate questions appropriate for the user's current learning path and mastery level.
2. Question generation must complete within 30ms to ensure a smooth user experience.
3. Questions must adapt to the user's current mastery level and learning path.
4. The implementation must handle all potential error cases gracefully.
5. Multiple questions generated for the same user should provide appropriate variety while respecting learning progression.
6. All tests must pass, covering both normal operation and edge cases.

## Domain-Specific Context
The QuestionGenerator is a critical component in the learning experience of the Zenjin Maths App. It embodies the educational principles of the system by:

1. **Progressive Difficulty**: Questions should progress in difficulty as the user masters concepts, following the five boundary levels of distinction.

2. **Triple Helix Integration**: The Triple Helix model involves three parallel learning paths:
   - **Knowledge Acquisition**: Learning new facts
   - **Skill Development**: Practicing known facts
   - **Application**: Using facts in more complex contexts
   The QuestionGenerator should respect which path the user is currently on.

3. **Spaced Repetition**: Facts should be revisited at appropriate intervals based on the user's mastery level, with longer intervals for well-mastered facts and shorter intervals for facts that need more practice.

4. **Adaptive Challenge**: Questions should be challenging enough to promote learning but not so difficult that they cause frustration.

This component combines educational theory with practical implementation to deliver an effective learning experience. Its correct implementation is crucial for the pedagogical effectiveness of the application.