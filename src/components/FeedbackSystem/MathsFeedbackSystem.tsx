// MathsFeedbackSystem.tsx
import React, { useEffect, useState } from 'react';
import { 
  FeedbackSystem, 
  FeedbackSystemProvider,
  useFeedback, 
  FeedbackTarget, 
  FeedbackOptions 
} from './FeedbackSystem';

// This component demonstrates a specialized implementation
// for the Zenjin Maths App that implements the specific
// feedback patterns mentioned in the requirements

interface MathsFeedbackProps {
  children: React.ReactNode;
}

// Custom hook for Maths-specific feedback behaviors
export function useMathsFeedback() {
  const feedback = useFeedback();
  
  // Specialized function for answer circle feedback
  const showAnswerFeedback = (
    circleId: string, 
    isCorrect: boolean, 
    options?: FeedbackOptions
  ) => {
    const target: FeedbackTarget = {
      id: circleId,
      type: 'circle'
    };
    
    // Use appropriate feedback type based on correctness
    if (isCorrect) {
      return feedback.showCorrectFeedback(target, {
        duration: 1500,
        intensity: 0.9,
        sound: true,
        ...options
      });
    } else {
      return feedback.showIncorrectFeedback(target, {
        duration: 1200,
        intensity: 0.8,
        sound: true,
        animation: 'shake',
        ...options
      });
    }
  };
  
  // Function for handling timeout/distraction scenarios
  const showDistractionFeedback = (
    elementIds: string[], 
    options?: FeedbackOptions
  ) => {
    // Map elements to feedback calls
    const results = elementIds.map(id => {
      const target: FeedbackTarget = {
        id: id,
        type: id.includes('circle') ? 'circle' : 'card'
      };
      
      return feedback.showTimeoutFeedback(target, {
        duration: 2000,
        intensity: 0.7,
        sound: true,
        ...options
      });
    });
    
    return results;
  };
  
  // Reset all answer circles to neutral state
  const resetAnswerCircles = (
    circleIds: string[],
    options?: FeedbackOptions
  ) => {
    // Map elements to feedback calls
    const results = circleIds.map(id => {
      const target: FeedbackTarget = {
        id: id,
        type: 'circle'
      };
      
      return feedback.showNeutralFeedback(target, {
        duration: 800,
        intensity: 0.6,
        ...options
      });
    });
    
    return results;
  };
  
  return {
    ...feedback, // Include all base feedback functions
    showAnswerFeedback,
    showDistractionFeedback,
    resetAnswerCircles,
  };
}

// Context provider for Maths-specific feedback
const MathsFeedbackContext = React.createContext<ReturnType<typeof useMathsFeedback> | undefined>(undefined);

export function MathsFeedbackProvider({ children }: MathsFeedbackProps) {
  return (
    <FeedbackSystemProvider>
      <MathsFeedbackWrapper>
        {children}
      </MathsFeedbackWrapper>
    </FeedbackSystemProvider>
  );
}

// Internal wrapper to use the feedback system and provide maths-specific context
function MathsFeedbackWrapper({ children }: MathsFeedbackProps) {
  const mathsFeedback = useMathsFeedback();
  
  return (
    <MathsFeedbackContext.Provider value={mathsFeedback}>
      {children}
    </MathsFeedbackContext.Provider>
  );
}

// Hook to use the maths feedback in components
export function useMathsAppFeedback() {
  const context = React.useContext(MathsFeedbackContext);
  if (context === undefined) {
    throw new Error('useMathsAppFeedback must be used within a MathsFeedbackProvider');
  }
  return context;
}

// Example of a specialized Maths Application Answer Circle component
interface AnswerCircleProps {
  id: string;
  value: string | number;
  isCorrect: boolean;
  onClick?: (value: string | number, isCorrect: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export function AnswerCircle({ 
  id, 
  value, 
  isCorrect, 
  onClick, 
  size = 'md',
  disabled = false 
}: AnswerCircleProps) {
  const mathsFeedback = useMathsAppFeedback();
  const [answered, setAnswered] = useState(false);
  
  // Map size to tailwind classes
  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-14 h-14 text-base',
    lg: 'w-20 h-20 text-xl',
  };
  
  const handleClick = () => {
    if (disabled || answered) return;
    
    // Show appropriate feedback
    mathsFeedback.showAnswerFeedback(id, isCorrect);
    setAnswered(true);
    
    // Call the handler if provided
    if (onClick) {
      onClick(value, isCorrect);
    }
  };
  
  // Reset state when disabled changes
  useEffect(() => {
    if (!disabled) {
      setAnswered(false);
    }
  }, [disabled]);
  
  return (
    <div
      id={id}
      className={`
        ${sizeClasses[size]} 
        rounded-full 
        flex 
        items-center 
        justify-center 
        font-semibold
        transition-all 
        duration-300
        ${answered ? (isCorrect ? 'bg-green-100 dark:bg-green-800' : 'bg-red-100 dark:bg-red-800') : 'bg-blue-100 dark:bg-blue-800'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}
      `}
      onClick={handleClick}
      aria-disabled={disabled}
    >
      {value}
    </div>
  );
}

// Example of a Question Card using the feedback system
interface QuestionCardProps {
  id: string;
  question: string;
  answerOptions: Array<{
    id: string;
    value: string | number;
    isCorrect: boolean;
  }>;
  onAnswer?: (value: string | number, isCorrect: boolean) => void;
  onComplete?: (correct: boolean) => void;
  timeLimit?: number; // in seconds
}

export function QuestionCard({
  id,
  question,
  answerOptions,
  onAnswer,
  onComplete,
  timeLimit
}: QuestionCardProps) {
  const mathsFeedback = useMathsAppFeedback();
  const [answered, setAnswered] = useState(false);
  const [timeoutActive, setTimeoutActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit || 0);
  
  // Handle timer logic if timeLimit is provided
  useEffect(() => {
    if (!timeLimit || answered || timeoutActive) return;
    
    let timer: NodeJS.Timeout;
    
    if (timeRemaining > 0) {
      timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else {
      // Time's up - show timeout feedback
      setTimeoutActive(true);
      
      // Get all answer circle IDs
      const circleIds = answerOptions.map(option => option.id);
      
      // Show distraction/timeout feedback on all answer circles
      mathsFeedback.showDistractionFeedback([id, ...circleIds]);
      
      // Reset to neutral after timeout feedback
      setTimeout(() => {
        mathsFeedback.resetAnswerCircles(circleIds);
        setTimeoutActive(false);
        setTimeRemaining(timeLimit);
      }, 3000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [timeRemaining, answered, timeoutActive, timeLimit, id, answerOptions, mathsFeedback]);
  
  const handleAnswer = (value: string | number, isCorrect: boolean) => {
    setAnswered(true);
    
    // Apply feedback to the card itself
    mathsFeedback.showCustomFeedback(
      { id, type: 'card' },
      isCorrect ? 'correct' : 'incorrect'
    );
    
    // Call the handlers if provided
    if (onAnswer) {
      onAnswer(value, isCorrect);
    }
    
    if (onComplete) {
      setTimeout(() => {
        onComplete(isCorrect);
      }, 1500);
    }
  };
  
  // Reset the question
  const resetQuestion = () => {
    setAnswered(false);
    setTimeoutActive(false);
    setTimeRemaining(timeLimit || 0);
    
    // Reset all answer circles
    const circleIds = answerOptions.map(option => option.id);
    mathsFeedback.resetAnswerCircles(circleIds);
  };
  
  return (
    <div 
      id={id}
      className="p-6 rounded-lg shadow-lg bg-white dark:bg-gray-800 transition-all duration-300"
    >
      {/* Timer display if timeLimit provided */}
      {timeLimit > 0 && (
        <div className="flex justify-end mb-2">
          <span className={`px-3 py-1 rounded ${timeRemaining < 5 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
            {timeRemaining}s
          </span>
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Question</h3>
        <p className="text-gray-700 dark:text-gray-300">{question}</p>
      </div>
      
      <div className="flex flex-wrap gap-4 justify-center mb-4">
        {answerOptions.map((option) => (
          <AnswerCircle
            key={option.id}
            id={option.id}
            value={option.value}
            isCorrect={option.isCorrect}
            onClick={(value, isCorrect) => handleAnswer(value, isCorrect)}
            disabled={answered || timeoutActive}
            size="lg"
          />
        ))}
      </div>
      
      {/* Controls for demo purposes */}
      <div className="mt-4 flex justify-end">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={resetQuestion}
        >
          Next Question
        </button>
      </div>
    </div>
  );
}

// Complete demo component showing how it all works together
export function MathsFeedbackDemo() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  
  // Sample questions for the demo
  const questions = [
    {
      id: 'question-1',
      question: 'What is 5 + 3?',
      options: [
        { id: 'q1-option-1', value: 8, isCorrect: true },
        { id: 'q1-option-2', value: 7, isCorrect: false },
        { id: 'q1-option-3', value: 9, isCorrect: false },
      ],
      timeLimit: 10,
    },
    {
      id: 'question-2',
      question: 'What is 12 - 4?',
      options: [
        { id: 'q2-option-1', value: 6, isCorrect: false },
        { id: 'q2-option-2', value: 8, isCorrect: true },
        { id: 'q2-option-3', value: 7, isCorrect: false },
      ],
      timeLimit: 10,
    },
    {
      id: 'question-3',
      question: 'What is 4 × 3?',
      options: [
        { id: 'q3-option-1', value: 10, isCorrect: false },
        { id: 'q3-option-2', value: 7, isCorrect: false },
        { id: 'q3-option-3', value: 12, isCorrect: true },
      ],
      timeLimit: 10,
    },
  ];
  
  const handleComplete = (correct: boolean) => {
    if (correct) {
      setScore(prev => prev + 1);
    }
    
    // Move to next question after a delay
    setTimeout(() => {
      setCurrentQuestion(prev => (prev + 1) % questions.length);
    }, 1000);
  };
  
  return (
    <div className="max-w-md mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Zenjin Maths App Demo</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Score: {score} / {questions.length}
        </p>
      </div>
      
      <QuestionCard
        id={questions[currentQuestion].id}
        question={questions[currentQuestion].question}
        answerOptions={questions[currentQuestion].options}
        onComplete={handleComplete}
        timeLimit={questions[currentQuestion].timeLimit}
      />
      
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900 rounded">
        <h2 className="text-lg font-semibold mb-2">Feedback System Features</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Correct answers: Circle glows green</li>
          <li>Wrong answers: Circle glows red and shudders</li>
          <li>Timeout feedback: Pulsing blue attention animation</li>
          <li>Question reset: Circles return to neutral blue state</li>
          <li>Anxiety-free design with smooth animations</li>
          <li>Accessible with reduced motion support</li>
          <li>Sound and haptic feedback (where supported)</li>
        </ul>
      </div>
    </div>
  );
}

// Provide a complete export of all components
export default {
  Provider: MathsFeedbackProvider,
  use: useMathsAppFeedback,
  AnswerCircle,
  QuestionCard,
  Demo: MathsFeedbackDemo,
};
