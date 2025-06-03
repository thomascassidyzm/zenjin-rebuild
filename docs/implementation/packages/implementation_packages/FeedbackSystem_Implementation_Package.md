# FeedbackSystem Implementation Package

This package contains all the necessary information for implementing the FeedbackSystem component for the Zenjin Maths App rebuild project. The FeedbackSystem is responsible for managing visual and interactive feedback for user actions throughout the application.

## Implementation Goal

Implement the FeedbackSystem component that manages visual and interactive feedback for user actions throughout the application, providing appropriate responses for correct, incorrect, neutral, and timeout scenarios.

## Interface Definition

```typescript
// FeedbackSystemInterface

// Data Structures
interface FeedbackTarget {
  id: string;                // Unique identifier for the target element
  type?: string;             // Type of the target element (e.g., 'button', 'card', 'circle')
}

interface FeedbackOptions {
  duration?: number;         // Duration of the feedback animation in milliseconds
  intensity?: number;        // Intensity of the feedback animation (0.0-1.0)
  sound?: boolean;           // Whether to play sound with the feedback
  haptic?: boolean;          // Whether to use haptic feedback (on supported devices)
  animation?: string;        // Animation style to use
}

interface FeedbackResult {
  success: boolean;          // Whether the feedback was successfully shown
  target: string;            // ID of the target element
  feedbackType: string;      // Type of feedback that was shown
  duration: number;          // Actual duration of the feedback in milliseconds
}

// Methods
/**
 * Shows positive feedback for correct answers
 * @param target The target element to show feedback on
 * @param options Options for the feedback animation
 * @returns Result of the feedback operation
 * @throws INVALID_TARGET if the target element is invalid or not found
 * @throws FEEDBACK_FAILED if failed to show feedback due to rendering issues
 */
function showCorrectFeedback(target: FeedbackTarget, options?: FeedbackOptions): FeedbackResult;

/**
 * Shows negative feedback for incorrect answers
 * @param target The target element to show feedback on
 * @param options Options for the feedback animation
 * @returns Result of the feedback operation
 * @throws INVALID_TARGET if the target element is invalid or not found
 * @throws FEEDBACK_FAILED if failed to show feedback due to rendering issues
 */
function showIncorrectFeedback(target: FeedbackTarget, options?: FeedbackOptions): FeedbackResult;

/**
 * Shows neutral feedback for no-answer scenarios
 * @param target The target element to show feedback on
 * @param options Options for the feedback animation
 * @returns Result of the feedback operation
 * @throws INVALID_TARGET if the target element is invalid or not found
 * @throws FEEDBACK_FAILED if failed to show feedback due to rendering issues
 */
function showNeutralFeedback(target: FeedbackTarget, options?: FeedbackOptions): FeedbackResult;

/**
 * Shows timeout feedback when user doesn't respond within the allocated time
 * @param target The target element to show feedback on
 * @param options Options for the feedback animation
 * @returns Result of the feedback operation
 * @throws INVALID_TARGET if the target element is invalid or not found
 * @throws FEEDBACK_FAILED if failed to show feedback due to rendering issues
 */
function showTimeoutFeedback(target: FeedbackTarget, options?: FeedbackOptions): FeedbackResult;

/**
 * Shows custom feedback with specified parameters
 * @param target The target element to show feedback on
 * @param feedbackType Type of feedback to show
 * @param options Options for the feedback animation
 * @returns Result of the feedback operation
 * @throws INVALID_TARGET if the target element is invalid or not found
 * @throws INVALID_FEEDBACK_TYPE if the specified feedback type is not supported
 * @throws FEEDBACK_FAILED if failed to show feedback due to rendering issues
 */
function showCustomFeedback(target: FeedbackTarget, feedbackType: string, options?: FeedbackOptions): FeedbackResult;

/**
 * Cancels any ongoing feedback animations on the specified target
 * @param target The target element to cancel feedback on
 * @returns Whether the cancellation was successful
 * @throws INVALID_TARGET if the target element is invalid or not found
 * @throws NO_ACTIVE_FEEDBACK if no active feedback to cancel on the target
 */
function cancelFeedback(target: FeedbackTarget): boolean;
```

## Module Context

The FeedbackSystem is part of the UserInterface module, which provides a calming, anxiety-free visual experience with appropriate feedback for user interactions. The FeedbackSystem specifically handles visual and interactive feedback for different user responses:

- **Correct Answer**: Circle glows greenish
- **Wrong Answer**: Card shudders and circle glows reddish
- **No Answer**: Answer circles go neutral blue and question repeats
- **Timeout**: Appropriate feedback for when learner loses focus/gets distracted

The FeedbackSystem has a dependency on the ThemeManagerInterface, which provides theme-related styling information.

## Implementation Requirements

1. **Technical Stack**:
   - Use Next.js with TypeScript and Tailwind CSS
   - Implement the FeedbackSystemInterface as defined
   - Ensure the implementation is testable with mock inputs
   - Design for smooth animations and transitions
   - Support customizable feedback intensity

2. **Visual Feedback Types**:
   - Correct feedback: Green glow/highlight with subtle positive animation
   - Incorrect feedback: Red glow/highlight with shake animation
   - Neutral feedback: Blue/gray neutral state
   - Timeout feedback: Pulsing blue with attention-grabbing (but not alarming) animation

3. **Accessibility Requirements**:
   - Ensure feedback is perceivable through multiple channels (visual, optional sound)
   - Support reduced motion preferences
   - Maintain appropriate contrast ratios
   - Ensure feedback is appropriate for school-aged children (6+)

4. **Performance Considerations**:
   - Animations must maintain 60fps on target devices
   - Minimize re-renders and layout thrashing
   - Properly clean up animations to prevent memory leaks

## Implementation Prompt

You are implementing the FeedbackSystem component for the Zenjin Maths App, which is responsible for managing visual and interactive feedback for user actions throughout the application.

The FeedbackSystem must implement:
1. Visual feedback for different user responses:
   - Correct Answer: Circle glows greenish
   - Wrong Answer: Card shudders and circle glows reddish
   - No Answer: Answer circles go neutral blue and question repeats
   - Timeout: Appropriate feedback for when learner loses focus/gets distracted

2. Methods to:
   - Show correct feedback on UI elements
   - Show incorrect feedback on UI elements
   - Show neutral feedback on UI elements
   - Show timeout feedback on UI elements

Technical requirements:
- Use Next.js with TypeScript and Tailwind CSS
- Implement the FeedbackSystemInterface as defined in the UserInterface module
- Ensure the implementation is testable with mock inputs
- Design for smooth animations and transitions
- Support customizable feedback intensity

Please implement the FeedbackSystem component with all necessary TypeScript types, React hooks, and styling. Include comprehensive comments explaining the implementation details and how the feedback supports the distinction-based learning approach.

## Mock Inputs for Testing

```typescript
// Example 1: Show correct feedback
const correctResult = feedbackSystem.showCorrectFeedback({
  id: 'answer-circle-1',
  type: 'circle'
}, {
  duration: 1200,
  intensity: 0.9,
  sound: true
});

// Example 2: Show incorrect feedback
const incorrectResult = feedbackSystem.showIncorrectFeedback({
  id: 'answer-circle-2',
  type: 'circle'
}, {
  duration: 1500,
  intensity: 1.0,
  sound: true,
  animation: 'shake'
});

// Example 3: Show timeout feedback
const timeoutResult = feedbackSystem.showTimeoutFeedback({
  id: 'player-card',
  type: 'card'
});

// Example 4: Cancel feedback
const cancelResult = feedbackSystem.cancelFeedback({
  id: 'player-card',
  type: 'card'
});
```

## Expected Outputs

The implementation should provide appropriate visual effects applied to the specified elements, with the following characteristics:

1. **Correct Feedback**:
   - Green glow/highlight
   - Subtle positive animation (e.g., gentle pulse or scale)
   - Optional sound effect if enabled

2. **Incorrect Feedback**:
   - Red glow/highlight
   - Shake animation
   - Optional sound effect if enabled

3. **Neutral Feedback**:
   - Blue/gray neutral state
   - Subtle attention animation
   - Optional sound effect if enabled

4. **Timeout Feedback**:
   - Pulsing blue highlight
   - Attention-grabbing animation
   - Optional sound effect if enabled

## Validation Criteria

The implementation must satisfy the following validation criteria:

1. **UI-001**: Player Card must show greenish glow for correct answers, reddish glow with card shudder for incorrect answers, and neutral blue for no-answer scenarios.

2. **UI-003**: All UI components must consistently apply the theme with rich colors, gradients, and dark theme.

3. **UI-006**: UI must be accessible for the target audience of school-aged children from age 6 and up.

## Distinction-Based Learning Context

The feedback system plays a crucial role in the distinction-based learning approach by providing clear, immediate feedback that reinforces the boundaries between correct and incorrect answers. The visual feedback should be:

1. **Clear and Unambiguous**: Feedback must clearly indicate whether an answer is correct or incorrect
2. **Age-Appropriate**: Visual effects should be engaging but not overwhelming for young learners
3. **Consistent**: Feedback patterns should be consistent across the application
4. **Supportive**: Feedback should encourage continued engagement, even for incorrect answers

The feedback system should support the five boundary levels of distinction by adjusting feedback intensity based on the subtlety of the distinction being tested.

Please implement the FeedbackSystem component that meets all these requirements and integrates seamlessly with the existing PlayerCard component.
