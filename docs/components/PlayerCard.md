# PlayerCard Component Implementation

This document provides details on the implementation of the PlayerCard component for the Zenjin Maths App rebuild project. The PlayerCard is the core interactive element of the application, presenting mathematical questions with binary choices and providing appropriate visual feedback based on user responses.

## Implementation Overview

The PlayerCard component has been implemented according to the provided interface definition and module requirements. The implementation focuses on:

1. **Binary Choice Presentation**: Each question is presented with exactly two options - one correct answer and one distractor.
2. **Visual Feedback**: Provides clear visual feedback based on user responses using color, animation, and visual effects.
3. **Distinction-Based Learning Support**: Visually represents the boundary level of each question to reinforce the distinction-based learning principles.
4. **Accessibility**: Ensures the component is accessible to school-aged children (6+).
5. **Responsive Design**: Works well on mobile devices with appropriate touch targets.
6. **Performance**: Optimized animations that maintain 60fps on target devices.

## Core Files

The implementation consists of the following files:

1. **PlayerCard.tsx**: The main component implementing the PlayerCardInterface.
2. **playerCardAnimations.css**: Custom CSS animations for feedback effects.
3. **PlayerCardExample.tsx**: Example usage of the PlayerCard component with different boundary levels.
4. **PlayerCard.test.tsx**: Comprehensive test suite to ensure all requirements are met.
5. **tailwind.config.js**: Tailwind CSS configuration with custom utilities for the PlayerCard.

## Key Features

### 1. Boundary Level Indicators

The PlayerCard visually represents the boundary level of each question using a series of dots at the top of the card. This helps learners understand the complexity level of the distinction being tested:

- Level 1: Obvious distinctions (e.g., 2+2=4 vs 2+2=5)
- Level 2: Clear distinctions (e.g., 7×8=56 vs 7×8=64)
- Level 3: Moderate distinctions (e.g., 7×8=56 vs 7×8=54)
- Level 4: Subtle distinctions (e.g., 7×8=56 vs 7×8=57)
- Level 5: Very subtle distinctions (e.g., √64=8 vs √64=±8)

### 2. Visual Feedback System

The component provides clear visual feedback based on user responses:

- **Correct Answer**: Circle glows greenish and the button receives a green highlight
- **Wrong Answer**: Card shudders with a shake animation and the button glows reddish
- **No Answer/Timeout**: Answer circles go neutral blue and question repeats

### 3. Interface Implementation

The component fully implements the PlayerCardInterface as defined in the module:

```typescript
// Methods implemented
presentQuestion(question: Question, options?: PresentationOptions): boolean
handleResponse(response: Response, feedbackOptions?: FeedbackOptions): { processed: boolean; feedbackShown: boolean }
handleTimeout(questionId: string): { processed: boolean; feedbackShown: boolean }
reset(): boolean
onAnswerSelected(callback: (response: Response) => void): void
```

### 4. Accessibility Features

The implementation includes several accessibility features:

- **Appropriate text sizing**: Text size adjusts based on question length
- **High contrast**: Ensures readable text with sufficient contrast ratios
- **Reduced motion option**: Respects user preferences for reduced motion
- **Focus states**: Clear focus indicators for keyboard navigation
- **ARIA attributes**: Proper aria-live and aria-disabled attributes
- **Touch-friendly targets**: All interactive elements meet minimum size requirements

### 5. Responsive Design

The component is fully responsive and works well on mobile devices:

- **Flexible sizing**: Adapts to different screen sizes
- **Touch-optimized**: Large touch targets for younger users
- **Performance optimization**: Efficient animations and transitions

## Implementation Details

### State Management

The PlayerCard uses React useState and useRef hooks to manage its internal state:

```typescript
const [currentQuestion, setCurrentQuestion] = useState<Question | null>(initialQuestion || null);
const [answerOptions, setAnswerOptions] = useState<string[]>([]);
const [feedbackState, setFeedbackState] = useState<FeedbackState>('idle');
const [isCardVisible, setIsCardVisible] = useState<boolean>(!!initialQuestion);
const startTimeRef = useRef<number>(0);
const timeoutRef = useRef<NodeJS.Timeout | null>(null);
const [isInteractable, setIsInteractable] = useState<boolean>(true);
const [attemptedQuestions, setAttemptedQuestions] = useState<Set<string>>(new Set());
```

### Animations

Animations are implemented using a combination of:

1. **Framer Motion**: For entrance/exit animations and interactive button effects
2. **Tailwind Animations**: For feedback effects like glowing and shaking
3. **CSS Keyframes**: For custom animations defined in playerCardAnimations.css

### Error Handling

The component includes comprehensive error handling for all interface methods:

```typescript
try {
  // Method implementation
} catch (error) {
  console.error('ERROR_CODE: Error message', error);
  return { processed: false, feedbackShown: false }; // Example return value
}
```

## Distinction-Based Learning Implementation

The PlayerCard implements distinction-based learning in several ways:

1. **Binary Choices**: Every question presents exactly two options, forcing the learner to make a clear distinction.
2. **Boundary Level Visualization**: The dots at the top of the card indicate the subtlety of the distinction being tested.
3. **Immediate Feedback**: Visual feedback reinforces the boundary between correct and incorrect answers.
4. **Progressive Difficulty**: The component supports presenting questions with increasing boundary levels as learners progress.

## Usage Example

```tsx
import React, { useRef } from 'react';
import PlayerCard, { PlayerCardImpl, Question } from './PlayerCard';

const ExampleApp: React.FC = () => {
  const playerCardRef = useRef<any>(null);
  const componentRef = useRef<any>(null);
  
  // Initialize the PlayerCard implementation
  React.useEffect(() => {
    if (componentRef.current) {
      playerCardRef.current = new PlayerCardImpl(componentRef);
    }
  }, []);
  
  // Example question
  const question: Question = {
    id: "mult-7-8-001",
    text: "What is 7 × 8?",
    correctAnswer: "56",
    distractor: "54",
    boundaryLevel: 3,
    factId: "mult-7-8"
  };
  
  // Present the question when component mounts
  React.useEffect(() => {
    if (playerCardRef.current) {
      playerCardRef.current.presentQuestion(question, {
        timeout: 30000 // 30 seconds timeout
      });
    }
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <PlayerCard
        ref={componentRef}
        onAnswerSelected={(response) => {
          console.log('User selected:', response);
        }}
      />
    </div>
  );
};

export default ExampleApp;
```

## Testing

The component includes a comprehensive test suite covering all functionality:

- Rendering and display tests
- User interaction tests
- Feedback visualization tests
- Timeout handling tests
- Boundary level visualization tests
- Reset functionality tests

## Performance Considerations

The implementation is optimized for performance:

1. **Efficient Re-renders**: Uses React.useCallback for event handlers
2. **Animation Performance**: CSS animations for better performance
3. **Cleanup**: Proper cleanup of timeouts in useEffect
4. **Conditional Rendering**: Uses AnimatePresence for smooth transitions

## Accessibility Considerations

The implementation follows accessibility best practices:

1. **Keyboard Navigation**: Full keyboard support for all interactions
2. **Screen Reader Support**: Proper aria attributes and semantic HTML
3. **Reduced Motion**: Respects prefers-reduced-motion media query
4. **Child-Friendly Design**: Large, clear text and buttons suitable for younger users
5. **Focus Management**: Clear focus states and logical tab order

## Future Enhancements

Potential future enhancements to the PlayerCard component could include:

1. **Sound Effects**: Adding optional sound effects for feedback
2. **Additional Animation Options**: More animation styles for question presentation
3. **Progressive Difficulty**: Automatically adjusting boundary levels based on user performance
4. **Multilingual Support**: Adding support for multiple languages
5. **Performance Analytics**: More detailed tracking of user response patterns
