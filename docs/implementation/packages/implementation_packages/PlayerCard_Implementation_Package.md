# PlayerCard Implementation Package for Claude 3.7 Sonnet

This package contains all necessary information for implementing the PlayerCard component for the Zenjin Maths App rebuild project using the Fractal AI-Assisted Development Framework.

## Implementation Goal

Implement the PlayerCard component that presents questions with binary choices and provides appropriate visual feedback based on user responses, following the distinction-based learning principles.

## Component Context

The PlayerCard is the core interactive element of the Zenjin Maths App's user interface. It presents mathematical questions with binary choices (one correct answer and one distractor) and provides visual feedback based on user responses. This component is central to implementing the distinction-based learning principles that form the theoretical foundation of the application.

## Technical Requirements

- Use Next.js with TypeScript and Tailwind CSS
- Ensure the component is responsive and works well on mobile devices
- Implement smooth animations for feedback
- Ensure accessibility for school-aged children (6+ years old)
- Use dark theme to limit battery cost on mobile devices

## Interface Definition

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Interface name="PlayerCardInterface" version="1.1.0" module="UserInterface">
  <Purpose>
    Defines the contract for the PlayerCard component that presents questions with binary choices and provides appropriate visual feedback based on user responses.
  </Purpose>
  
  <DataStructures>
    <Structure name="Question">
      <Field name="id" type="string" required="true" description="Unique identifier for the question" />
      <Field name="text" type="string" required="true" description="The question text to display" />
      <Field name="correctAnswer" type="string" required="true" description="The correct answer" />
      <Field name="distractor" type="string" required="true" description="The incorrect answer (distractor)" />
      <Field name="boundaryLevel" type="number" required="true" description="The boundary level (1-5) this question is testing" />
      <Field name="factId" type="string" required="true" description="The mathematical fact ID this question relates to" />
    </Structure>
    
    <Structure name="Response">
      <Field name="questionId" type="string" required="true" description="The ID of the question being answered" />
      <Field name="selectedAnswer" type="string" required="true" description="The answer selected by the user" />
      <Field name="isCorrect" type="boolean" required="true" description="Whether the selected answer is correct" />
      <Field name="responseTime" type="number" required="true" description="Time taken to respond in milliseconds" />
      <Field name="isFirstAttempt" type="boolean" required="true" description="Whether this is the first attempt at answering this question" />
    </Structure>
    
    <Structure name="FeedbackOptions">
      <Field name="duration" type="number" required="false" description="Duration of the feedback animation in milliseconds" defaultValue="1000" />
      <Field name="intensity" type="number" required="false" description="Intensity of the feedback animation (0.0-1.0)" defaultValue="0.8" />
      <Field name="sound" type="boolean" required="false" description="Whether to play sound with the feedback" defaultValue="true" />
    </Structure>
  </DataStructures>
  
  <Methods>
    <Method name="presentQuestion">
      <Description>Presents a question to the user with binary choices</Description>
      <Input name="question" type="Question" required="true" description="The question to present" />
      <Input name="options" type="object" required="false" description="Presentation options">
        <Field name="timeout" type="number" required="false" description="Timeout in milliseconds" defaultValue="30000" />
        <Field name="animation" type="string" required="false" description="Entry animation style" defaultValue="fade" />
      </Input>
      <Output name="presented" type="boolean" description="Whether the question was successfully presented" />
      <Errors>
        <Error code="INVALID_QUESTION" description="The question object is invalid or incomplete" />
        <Error code="PRESENTATION_FAILED" description="Failed to present the question due to rendering issues" />
      </Errors>
      <Async>false</Async>
    </Method>
    
    <Method name="handleResponse">
      <Description>Handles user response to a question and provides appropriate feedback</Description>
      <Input name="response" type="Response" required="true" description="The user's response" />
      <Input name="feedbackOptions" type="FeedbackOptions" required="false" description="Options for the feedback animation" />
      <Output name="result" type="object" description="Result of handling the response">
        <Field name="processed" type="boolean" description="Whether the response was successfully processed" />
        <Field name="feedbackShown" type="boolean" description="Whether feedback was shown to the user" />
      </Output>
      <Errors>
        <Error code="INVALID_RESPONSE" description="The response object is invalid or incomplete" />
        <Error code="FEEDBACK_FAILED" description="Failed to show feedback due to rendering issues" />
      </Errors>
      <Async>false</Async>
    </Method>
    
    <Method name="handleTimeout">
      <Description>Handles timeout when user doesn't respond within the allocated time</Description>
      <Input name="questionId" type="string" required="true" description="ID of the question that timed out" />
      <Output name="result" type="object" description="Result of handling the timeout">
        <Field name="processed" type="boolean" description="Whether the timeout was successfully processed" />
        <Field name="feedbackShown" type="boolean" description="Whether timeout feedback was shown to the user" />
      </Output>
      <Errors>
        <Error code="INVALID_QUESTION_ID" description="The question ID is invalid or unknown" />
        <Error code="FEEDBACK_FAILED" description="Failed to show timeout feedback due to rendering issues" />
      </Errors>
      <Async>false</Async>
    </Method>
    
    <Method name="reset">
      <Description>Resets the PlayerCard to its initial state</Description>
      <Output name="success" type="boolean" description="Whether the reset was successful" />
      <Errors>
        <Error code="RESET_FAILED" description="Failed to reset the PlayerCard" />
      </Errors>
      <Async>false</Async>
    </Method>
    
    <Method name="onAnswerSelected">
      <Description>Event callback when user selects an answer</Description>
      <EventData name="response" type="Response" description="The user's response data" />
      <Async>true</Async>
    </Method>
  </Methods>
  
  <Dependencies>
    <Dependency interface="FeedbackSystemInterface" module="UserInterface" />
    <Dependency interface="ThemeManagerInterface" module="UserInterface" />
  </Dependencies>
  
  <UsageExample>
```typescript
// Example usage of PlayerCardInterface
import { PlayerCard } from './components/PlayerCard';

// Create a question
const question = {
  id: 'mult-7-8-001',
  text: 'What is 7 × 8?',
  correctAnswer: '56',
  distractor: '54',
  boundaryLevel: 5,
  factId: 'mult-7-8'
};

// Present the question
const playerCard = new PlayerCard();
playerCard.presentQuestion(question);

// Handle user response
playerCard.onAnswerSelected((response) => {
  console.log(`User selected: ${response.selectedAnswer}`);
  console.log(`Correct: ${response.isCorrect}`);
  console.log(`Response time: ${response.responseTime}ms`);
  
  // Process the response
  playerCard.handleResponse(response);
});

// Handle timeout if needed
setTimeout(() => {
  playerCard.handleTimeout(question.id);
}, 30000);
```
  </UsageExample>
</Interface>
```

## Module Definition (Relevant Sections)

```xml
<Module name="UserInterface" version="1.1.0">
  <Purpose>
    Provide a calming, anxiety-free visual experience with appropriate feedback for user interactions, implementing the binary distinction presentation through the Player Card mechanism.
  </Purpose>
  
  <ContextBoundary size="medium" tokenEstimate="40000">
    <Description>
      This module encompasses all user-facing components, including the Player Card, feedback system, 
      visual theming, animations, and layout. It is responsible for presenting questions and collecting 
      user responses, but not for generating content or tracking progression.
    </Description>
  </ContextBoundary>
  
  <Components>
    <Component name="PlayerCard">
      <Description>
        The core interactive component that presents questions with binary choices and provides feedback.
      </Description>
      <Implements>PlayerCardInterface</Implements>
      <Dependencies>
        <Dependency interface="FeedbackSystemInterface" />
        <Dependency interface="ThemeManagerInterface" />
      </Dependencies>
    </Component>
  </Components>
  
  <ValidationCriteria>
    <Criterion id="UI-001" test="tests/ui/player_card_feedback_test.js">
      Player Card must show greenish glow for correct answers, reddish glow with card shudder for incorrect answers, and neutral blue for no-answer scenarios.
    </Criterion>
    <Criterion id="UI-003" test="tests/ui/theme_consistency_test.js">
      All UI components must consistently apply the theme with rich colors, gradients, and dark theme.
    </Criterion>
    <Criterion id="UI-006" test="tests/ui/accessibility_test.js">
      UI must be accessible for the target audience of school-aged children from age 6 and up.
    </Criterion>
  </ValidationCriteria>
  
  <SystemRequirements>
    <Requirement type="Performance" name="AnimationFrameRate">
      All animations must maintain 60fps on target devices.
    </Requirement>
    <Requirement type="Performance" name="InteractionLatency">
      UI must respond to user interactions within 50ms.
    </Requirement>
    <Requirement type="Usability" name="ChildFriendly">
      UI must be usable by children as young as 6 years old.
    </Requirement>
    <Requirement type="Accessibility" name="ColorContrast">
      All text must have sufficient contrast ratio for readability.
    </Requirement>
    <Requirement type="Compatibility" name="MobileOptimized">
      UI must be optimized for mobile devices with touch interactions.
    </Requirement>
  </SystemRequirements>
</Module>
```

## Implementation Prompt

You are implementing the PlayerCard component for the Zenjin Maths App, which is the core interactive element that presents mathematical questions with binary choices (one correct answer and one distractor) and provides visual feedback based on user responses.

The PlayerCard must:
1. Present questions with two possible answers in a visually appealing way
2. Show appropriate feedback:
   - Correct Answer: Circle glows greenish
   - Wrong Answer: Card shudders and circle glows reddish
   - No Answer: Answer circles go neutral blue and question repeats
   - Timeout: Handle when learner loses focus/gets distracted
3. Implement the PlayerCardInterface as defined in the UserInterface module
4. Support the distinction-based learning principles

Technical requirements:
- Use Next.js with TypeScript and Tailwind CSS
- Ensure the component is responsive and works well on mobile devices
- Implement smooth animations for feedback
- Ensure accessibility for school-aged children (6+ years old)
- Use dark theme to limit battery cost on mobile devices

Please implement the PlayerCard component with all necessary TypeScript types, React hooks, and styling. Include comprehensive comments explaining the implementation details and how they relate to the distinction-based learning principles.

## Mock Inputs for Testing

```javascript
const mockQuestion = {
  id: "mult-7-8-001",
  text: "What is 7 × 8?",
  correctAnswer: "56",
  distractor: "54",
  boundaryLevel: 5,
  factId: "mult-7-8"
};
```

## Expected Outputs

```javascript
const expectedResponse = {
  questionId: "mult-7-8-001",
  selectedAnswer: "56",
  isCorrect: true,
  responseTime: 1250,
  isFirstAttempt: true
};
```

## Validation Criteria

1. PlayerCard must show greenish glow for correct answers, reddish glow with card shudder for incorrect answers, and neutral blue for no-answer scenarios.
2. All UI components must consistently apply the theme with rich colors, gradients, and dark theme.
3. UI must be accessible for the target audience of school-aged children from age 6 and up.
4. All animations must maintain 60fps on target devices.
5. UI must respond to user interactions within 50ms.

## Distinction-Based Learning Principles (Context)

The PlayerCard implements the core principle of distinction-based learning by presenting binary choices that highlight the boundary between correct and incorrect mathematical concepts. The visual feedback reinforces these boundaries through clear, consistent visual cues that help learners internalize the distinctions.

The five boundary levels (represented by the `boundaryLevel` field in the Question structure) correspond to increasing levels of subtlety in the distinctions being tested:
- Level 1: Obvious distinctions (e.g., 2+2=4 vs 2+2=5)
- Level 2: Clear distinctions (e.g., 7×8=56 vs 7×8=64)
- Level 3: Moderate distinctions (e.g., 7×8=56 vs 7×8=54)
- Level 4: Subtle distinctions (e.g., 7×8=56 vs 7×8=57)
- Level 5: Very subtle distinctions (e.g., √64=8 vs √64=±8)

The PlayerCard should adapt its presentation based on the boundary level to support the learner's progression through increasingly subtle distinctions.
