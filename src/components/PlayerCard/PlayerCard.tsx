// PlayerCard.tsx
// Core interactive component that presents questions with binary choices and provides feedback
// based on distinction-based learning principles

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types based on the interface definition
interface Question {
  id: string;
  text: string;
  correctAnswer: string;
  distractor: string;
  boundaryLevel: number;
  factId: string;
}

interface Response {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  responseTime: number;
  isFirstAttempt: boolean;
}

interface FeedbackOptions {
  duration?: number;
  intensity?: number;
  sound?: boolean;
}

interface PresentationOptions {
  timeout?: number;
  animation?: string;
}

// Feedback states for visual indication
type FeedbackState = 'idle' | 'correct' | 'incorrect' | 'timeout' | 'no-answer';

// Component Props Interface
interface PlayerCardProps {
  onAnswerSelected?: (response: Response) => void;
  initialQuestion?: Question;
}

/**
 * PlayerCard Component
 * 
 * The core interactive element of the Zenjin Maths App that presents 
 * mathematical questions with binary choices (one correct answer and one distractor)
 * and provides visual feedback based on user responses to reinforce distinction-based learning.
 */
const PlayerCard: React.FC<PlayerCardProps> = ({ 
  onAnswerSelected,
  initialQuestion
}) => {
  // State for current question
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(initialQuestion || null);
  
  // State for tracking answer order (randomize positions)
  const [answerOptions, setAnswerOptions] = useState<string[]>([]);
  
  // State for tracking the feedback to show
  const [feedbackState, setFeedbackState] = useState<FeedbackState>('idle');
  
  // State for tracking if the card is flipped (for animations)
  const [isCardVisible, setIsCardVisible] = useState<boolean>(!!initialQuestion);
  
  // State for tracking response time
  const startTimeRef = useRef<number>(0);
  
  // State for tracking timeout timer
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // State for interaction tracking
  const [isInteractable, setIsInteractable] = useState<boolean>(true);
  
  // Tracking if a question has been attempted before
  const [attemptedQuestions, setAttemptedQuestions] = useState<Set<string>>(new Set());

  /**
   * Presents a question to the user with binary choices
   * @param question The question to present
   * @param options Presentation options (timeout, animation)
   * @returns Whether the question was successfully presented
   */
  const presentQuestion = useCallback((
    question: Question, 
    options: PresentationOptions = {}
  ): boolean => {
    try {
      // Validate the question
      if (!question.id || !question.text || !question.correctAnswer || !question.distractor) {
        console.error('INVALID_QUESTION: The question object is invalid or incomplete');
        return false;
      }

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Reset the feedback state
      setFeedbackState('idle');
      
      // Hide the card first (for animation)
      setIsCardVisible(false);
      
      // Brief timeout to allow animation to work
      setTimeout(() => {
        // Randomize the order of answers
        const answers = [question.correctAnswer, question.distractor];
        const shuffled = [...answers].sort(() => Math.random() - 0.5);
        setAnswerOptions(shuffled);
        
        // Set the current question
        setCurrentQuestion(question);
        
        // Show the card with animation
        setIsCardVisible(true);
        
        // Reset interactable state
        setIsInteractable(true);
        
        // Start the timer for response time calculation
        startTimeRef.current = Date.now();
        
        // Set a timeout if provided
        if (options.timeout) {
          timeoutRef.current = setTimeout(() => {
            handleTimeout(question.id);
          }, options.timeout);
        }
      }, 300); // Short delay for animation
      
      return true;
    } catch (error) {
      console.error('PRESENTATION_FAILED: Failed to present the question due to rendering issues', error);
      return false;
    }
  }, []);

  /**
   * Handles user response to a question and provides appropriate feedback
   * @param response The user's response
   * @param feedbackOptions Options for the feedback animation
   * @returns Result of handling the response
   */
  const handleResponse = useCallback((
    response: Response,
    feedbackOptions: FeedbackOptions = {}
  ): { processed: boolean; feedbackShown: boolean } => {
    try {
      // Validate the response
      if (!response.questionId || !response.selectedAnswer) {
        console.error('INVALID_RESPONSE: The response object is invalid or incomplete');
        return { processed: false, feedbackShown: false };
      }
      
      // Set feedback state based on whether the answer is correct
      setFeedbackState(response.isCorrect ? 'correct' : 'incorrect');
      
      // Make card non-interactable during feedback
      setIsInteractable(false);
      
      // Clear any timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Calculate duration for feedback display
      const duration = feedbackOptions.duration || 1000;
      
      // After showing feedback, reset the card
      setTimeout(() => {
        setFeedbackState('idle');
        // Reset could go here if we want to auto-reset
      }, duration);
      
      return { processed: true, feedbackShown: true };
    } catch (error) {
      console.error('FEEDBACK_FAILED: Failed to show feedback due to rendering issues', error);
      return { processed: false, feedbackShown: false };
    }
  }, []);

  /**
   * Handles timeout when user doesn't respond within the allocated time
   * @param questionId ID of the question that timed out
   * @returns Result of handling the timeout
   */
  const handleTimeout = useCallback((
    questionId: string
  ): { processed: boolean; feedbackShown: boolean } => {
    try {
      // Validate question ID
      if (!questionId || !currentQuestion || currentQuestion.id !== questionId) {
        console.error('INVALID_QUESTION_ID: The question ID is invalid or unknown');
        return { processed: false, feedbackShown: false };
      }
      
      // Set timeout feedback
      setFeedbackState('timeout');
      
      // Make card non-interactable during feedback
      setIsInteractable(false);
      
      // After showing feedback, reset the card
      setTimeout(() => {
        setFeedbackState('idle');
        setIsInteractable(true);
        
        // Re-present the same question for timeout scenario
        if (currentQuestion) {
          presentQuestion(currentQuestion);
        }
      }, 2000); // Show timeout feedback a bit longer
      
      return { processed: true, feedbackShown: true };
    } catch (error) {
      console.error('FEEDBACK_FAILED: Failed to show timeout feedback due to rendering issues', error);
      return { processed: false, feedbackShown: false };
    }
  }, [currentQuestion, presentQuestion]);

  /**
   * Resets the PlayerCard to its initial state
   * @returns Whether the reset was successful
   */
  const reset = useCallback((): boolean => {
    try {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Reset all states
      setCurrentQuestion(null);
      setAnswerOptions([]);
      setFeedbackState('idle');
      setIsCardVisible(false);
      setIsInteractable(true);
      
      return true;
    } catch (error) {
      console.error('RESET_FAILED: Failed to reset the PlayerCard', error);
      return false;
    }
  }, []);

  /**
   * Handle when the user selects an answer
   * @param selectedAnswer The answer selected by the user
   */
  const handleAnswerClick = useCallback((selectedAnswer: string) => {
    if (!isInteractable || !currentQuestion) return;
    
    // Calculate response time
    const responseTime = Date.now() - startTimeRef.current;
    
    // Check if answer is correct
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    // Check if this is the first attempt for this question
    const isFirstAttempt = !attemptedQuestions.has(currentQuestion.id);
    
    // Add to attempted questions
    if (isFirstAttempt) {
      setAttemptedQuestions(prev => new Set(prev).add(currentQuestion.id));
    }
    
    // Create response object
    const response: Response = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect,
      responseTime,
      isFirstAttempt
    };
    
    // Process the response internally
    handleResponse(response);
    
    // Call external event handler if provided
    if (onAnswerSelected) {
      onAnswerSelected(response);
    }
  }, [currentQuestion, isInteractable, onAnswerSelected, handleResponse, attemptedQuestions]);

  // Initialize with initial question if provided
  useEffect(() => {
    if (initialQuestion) {
      presentQuestion(initialQuestion);
    }
  }, [initialQuestion, presentQuestion]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Determine card background class based on feedback state
  const getCardClasses = () => {
    const baseClasses = "relative w-full max-w-md rounded-xl p-6 transition-all duration-300 shadow-lg transform";
    
    switch (feedbackState) {
      case 'correct':
        return `${baseClasses} bg-gradient-to-br from-gray-800 to-gray-900 shadow-green-500/30 border border-green-500/30`;
      case 'incorrect':
        return `${baseClasses} bg-gradient-to-br from-gray-800 to-gray-900 shadow-red-500/30 border border-red-500/30 animate-shake`;
      case 'timeout':
        return `${baseClasses} bg-gradient-to-br from-gray-800 to-gray-900 shadow-blue-500/30 border border-blue-500/30`;
      case 'no-answer':
        return `${baseClasses} bg-gradient-to-br from-gray-800 to-gray-900 shadow-blue-500/30 border border-blue-500/30`;
      default:
        return `${baseClasses} bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700`;
    }
  };

  // Get option button styles based on state and answer
  const getOptionButtonClasses = (option: string) => {
    const baseClasses = "relative w-full p-4 rounded-full text-xl font-bold mb-4 transition-all duration-300 transform";
    
    // If showing feedback and this is the correct answer
    if ((feedbackState === 'correct' || feedbackState === 'incorrect') && 
        currentQuestion && option === currentQuestion.correctAnswer) {
      return `${baseClasses} bg-green-500/20 text-green-300 border-2 border-green-500 shadow-lg shadow-green-500/30`;
    }
    
    // If showing incorrect feedback and this is the selected wrong answer
    if (feedbackState === 'incorrect' && 
        currentQuestion && option !== currentQuestion.correctAnswer) {
      return `${baseClasses} bg-red-500/20 text-red-300 border-2 border-red-500 shadow-lg shadow-red-500/30`;
    }
    
    // If timeout or no-answer
    if (feedbackState === 'timeout' || feedbackState === 'no-answer') {
      return `${baseClasses} bg-blue-500/10 text-blue-300 border-2 border-blue-500/50`;
    }
    
    // Default interactable state
    return `${baseClasses} bg-gray-700/50 hover:bg-gray-600/50 text-white border-2 border-gray-600 hover:scale-[1.02] active:scale-[0.98]`;
  };

  // Determine question text size based on length
  const getQuestionTextClass = () => {
    if (!currentQuestion) return "text-2xl font-bold";
    
    const textLength = currentQuestion.text.length;
    if (textLength > 100) return "text-xl font-bold";
    if (textLength > 50) return "text-2xl font-bold";
    return "text-3xl font-bold";
  };

  // Render boundary level indicator (subtle visual cue based on level)
  const renderBoundaryLevelIndicator = () => {
    if (!currentQuestion) return null;
    
    // Create an array of 5 circles, filled up to the boundary level
    return (
      <div className="flex items-center justify-center space-x-1 mb-4">
        {[1, 2, 3, 4, 5].map((level) => (
          <div 
            key={level}
            className={`w-2 h-2 rounded-full ${
              level <= currentQuestion.boundaryLevel 
                ? 'bg-purple-500' 
                : 'bg-gray-600'
            }`}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex items-center justify-center w-full min-h-[400px] p-4">
      <AnimatePresence mode="wait">
        {isCardVisible && currentQuestion && (
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={getCardClasses()}
            data-testid="player-card"
          >
            {/* Question */}
            <div className="mb-8 text-center">
              {renderBoundaryLevelIndicator()}
              <h2 
                className={`${getQuestionTextClass()} mb-4 text-white`}
                aria-live="polite"
              >
                {currentQuestion.text}
              </h2>
            </div>
            
            {/* Answer Options */}
            <div className="space-y-4">
              {answerOptions.map((option, index) => (
                <motion.button
                  key={`${currentQuestion.id}-option-${index}`}
                  whileHover={isInteractable ? { scale: 1.02 } : {}}
                  whileTap={isInteractable ? { scale: 0.98 } : {}}
                  className={getOptionButtonClasses(option)}
                  onClick={() => handleAnswerClick(option)}
                  disabled={!isInteractable}
                  aria-disabled={!isInteractable}
                >
                  {option}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlayerCard;

// Export types and interface implementation
export type { 
  Question, 
  Response, 
  FeedbackOptions,
  PresentationOptions
};

// Export a class that implements the full PlayerCardInterface for compatibility
export class PlayerCardImpl {
  private component: React.RefObject<any>;
  private onAnswerSelectedCallback: ((response: Response) => void) | null = null;
  
  constructor(componentRef: React.RefObject<any>) {
    this.component = componentRef;
  }
  
  presentQuestion(question: Question, options: PresentationOptions = {}): boolean {
    if (this.component.current) {
      return this.component.current.presentQuestion(question, options);
    }
    return false;
  }
  
  handleResponse(response: Response, feedbackOptions: FeedbackOptions = {}): { processed: boolean; feedbackShown: boolean } {
    if (this.component.current) {
      return this.component.current.handleResponse(response, feedbackOptions);
    }
    return { processed: false, feedbackShown: false };
  }
  
  handleTimeout(questionId: string): { processed: boolean; feedbackShown: boolean } {
    if (this.component.current) {
      return this.component.current.handleTimeout(questionId);
    }
    return { processed: false, feedbackShown: false };
  }
  
  reset(): boolean {
    if (this.component.current) {
      return this.component.current.reset();
    }
    return false;
  }
  
  onAnswerSelected(callback: (response: Response) => void): void {
    this.onAnswerSelectedCallback = callback;
  }
}

// Add the CSS for the shake animation (not handled by Tailwind by default)
// To be added to your global CSS file
/*
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.animate-shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}
*/
