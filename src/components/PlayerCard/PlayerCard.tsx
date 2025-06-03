// PlayerCard.tsx
// Core interactive component that presents questions with binary choices and provides feedback
// based on distinction-based learning principles

import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './playerCardAnimations.css';

// Import types from generated interfaces
import { 
  Question, 
  Response, 
  FeedbackOptions, 
  PlayerCardInterface 
} from '../../interfaces/PlayerCardInterface';

// Additional types not in the APML interface
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
  points?: number; // Current points to display
}

// Expose methods that parent can call
export interface PlayerCardHandle {
  presentQuestion: (question: Question, options?: PresentationOptions) => boolean;
  handleResponse: (response: Response, feedbackOptions?: FeedbackOptions) => { processed: boolean; feedbackShown: boolean };
  handleTimeout: (questionId: string) => { processed: boolean; feedbackShown: boolean };
  reset: () => boolean;
}

/**
 * PlayerCard Component
 * 
 * The core interactive element of the Zenjin Maths App that presents 
 * mathematical questions with binary choices (one correct answer and one distractor)
 * and provides visual feedback based on user responses to reinforce distinction-based learning.
 */
const PlayerCard = forwardRef<PlayerCardHandle, PlayerCardProps>(({ 
  onAnswerSelected,
  initialQuestion,
  points = 0
}, ref) => {
  // State for current question
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(initialQuestion || null);
  
  // State for tracking answer order (randomize positions)
  const [answerOptions, setAnswerOptions] = useState<string[]>([]);
  
  // State for tracking the feedback to show
  const [feedbackState, setFeedbackState] = useState<FeedbackState>('idle');
  
  // State for tracking if the card is flipped (for animations) - simplified for fixed positioning
  const [isCardVisible, setIsCardVisible] = useState<boolean>(true);
  
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
      
      // Randomize the order of answers
      const answers = [question.correctAnswer, question.distractor];
      const shuffled = [...answers].sort(() => Math.random() - 0.5);
      setAnswerOptions(shuffled);
      
      console.log('🎮 PlayerCard presenting question:', {
        id: question.id,
        text: question.text,
        correctAnswer: question.correctAnswer,
        distractor: question.distractor,
        shuffledOptions: shuffled
      });
      
      // Set the current question
      setCurrentQuestion(question);
      
      // Reset interactable state
      setIsInteractable(true);
      
      // Start the timer for response time calculation
      startTimeRef.current = Date.now();
      
      // Set a timeout - default to 10 seconds if not provided
      const timeoutDuration = options.timeout || 10000;
      timeoutRef.current = setTimeout(() => {
        handleTimeout(question.id);
      }, timeoutDuration);
      
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
        safeSetState(() => {
          setFeedbackState('idle');
          setIsInteractable(true);
          
          // Re-present the same question if answer was incorrect
          if (!response.isCorrect && currentQuestion) {
            presentQuestion(currentQuestion);
          }
        });
      }, duration);
      
      return { processed: true, feedbackShown: true };
    } catch (error) {
      console.error('FEEDBACK_FAILED: Failed to show feedback due to rendering issues', error);
      return { processed: false, feedbackShown: false };
    }
  }, [safeSetState]);

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
      
      // After showing feedback, reset the card and re-present question
      setTimeout(() => {
        safeSetState(() => {
          setFeedbackState('idle');
          setIsInteractable(true);
          
          // Re-present the same question for timeout scenario
          if (currentQuestion) {
            presentQuestion(currentQuestion);
          }
        });
      }, 3000); // Show timeout feedback for 3 seconds
      
      return { processed: true, feedbackShown: true };
    } catch (error) {
      console.error('FEEDBACK_FAILED: Failed to show timeout feedback due to rendering issues', error);
      return { processed: false, feedbackShown: false };
    }
  }, [currentQuestion, presentQuestion, safeSetState]);

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

  // Expose component methods via ref
  useImperativeHandle(ref, () => ({
    presentQuestion,
    handleResponse,
    handleTimeout,
    reset
  }), [presentQuestion, handleResponse, handleTimeout, reset]);

  // APML-compliant component lifecycle cleanup
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      // Mark component as unmounted
      isMountedRef.current = false;
      
      // Clear all timers and async operations
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);
  
  // Safe state setter that checks if component is still mounted
  const safeSetState = useCallback((setter: () => void) => {
    if (isMountedRef.current) {
      setter();
    }
  }, []);

  // Determine card background class based on feedback state
  const getCardClasses = () => {
    // Fixed size optimized for mobile devices - never goes thinner
    const baseClasses = "relative w-full max-w-md min-w-[370px] h-[500px] rounded-xl p-6 transition-all duration-300 shadow-lg flex flex-col justify-between";
    
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
    // Using circles rather than full width buttons for a more modern look - bigger relative to card
    const baseClasses = "relative flex items-center justify-center h-36 w-36 rounded-full text-3xl font-bold transition-all duration-300 transform touch-target";
    
    // If showing feedback and this is the correct answer
    if ((feedbackState === 'correct' || feedbackState === 'incorrect') && 
        currentQuestion && option === currentQuestion.correctAnswer) {
      return `${baseClasses} bg-green-500 text-white border-2 border-green-400 shadow-lg shadow-green-500/30 glow-green`;
    }
    
    // If showing incorrect feedback and this is the selected wrong answer
    if (feedbackState === 'incorrect' && 
        currentQuestion && option !== currentQuestion.correctAnswer) {
      return `${baseClasses} bg-red-500 text-white border-2 border-red-400 shadow-lg shadow-red-500/30 glow-red`;
    }
    
    // If timeout or no-answer - both circles glow neutral blue
    if (feedbackState === 'timeout' || feedbackState === 'no-answer') {
      return `${baseClasses} bg-blue-400/40 text-blue-100 border-2 border-blue-300/60 glow-blue`;
    }
    
    // Default interactable state - light blue circular button
    return `${baseClasses} bg-blue-500/20 hover:bg-blue-400/30 text-white border-2 border-blue-400/50 hover:scale-[1.05] active:scale-[0.98]`;
  };

  // Determine question text size based on length - bigger overall
  const getQuestionTextClass = () => {
    if (!currentQuestion) return "text-3xl font-bold";
    
    const textLength = currentQuestion.text.length;
    if (textLength > 100) return "text-2xl font-bold";
    if (textLength > 50) return "text-3xl font-bold";
    return "text-4xl font-bold";
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
              level <= (currentQuestion.boundaryLevel || 0) 
                ? 'bg-purple-500' 
                : 'bg-gray-600'
            }`}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  };

  console.log('🎮 PlayerCard render state:', {
    hasCurrentQuestion: !!currentQuestion,
    currentQuestionId: currentQuestion?.id,
    answerOptionsLength: answerOptions.length,
    answerOptions,
    feedbackState,
    isInteractable
  });

  return (
    <div 
      className="flex flex-col items-center justify-start w-full min-h-[500px] p-2 player-card-container" 
      style={{ 
        minWidth: '370px !important',
        width: 'max-content',
        flexShrink: 0 
      }}
    >
      {/* Points Display */}
      <div 
        className="w-full max-w-md min-w-[370px] mb-2" 
        style={{ 
          minWidth: '370px !important',
          width: '370px',
          flexShrink: 0 
        }}
      >
        <div className="bg-gray-800/80 rounded-lg p-3 shadow-md">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-medium">POINTS</span>
            <span className="text-3xl font-bold text-white">{points}</span>
          </div>
        </div>
      </div>

      {/* Fixed-size card container to prevent mounting/unmounting */}
      <div 
        className="relative w-full max-w-md min-w-[370px] h-[500px]" 
        style={{ 
          minWidth: '370px !important',
          width: '370px',
          flexShrink: 0 
        }}
      >
        {currentQuestion && (
          <div
            className={getCardClasses()}
            data-testid="player-card"
          >
            {/* Question Section - Fixed position to prevent layout shift */}
            <div className="relative flex-shrink-0 text-center" style={{ height: '200px' }}>
              <h2 
                className={`${getQuestionTextClass()} mb-4 text-white`}
                aria-live="polite"
              >
                {currentQuestion.text}
              </h2>

              {/* Explanation overlay - only for incorrect/timeout states */}
              {(feedbackState === 'incorrect' || feedbackState === 'timeout') && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 py-4 px-6 bg-black/90 rounded-2xl z-10 shadow-2xl glow-feedback border border-gray-600/30">
                  <p className={`${getQuestionTextClass()} text-center whitespace-nowrap text-white font-bold`}>
                    {feedbackState === 'incorrect' && `✗ ${currentQuestion.correctAnswer}`}
                    {feedbackState === 'timeout' && '⏱ Time\'s up!'}
                  </p>
                </div>
              )}
            </div>
            
            {/* Answer Options - Fixed position with minimum spacing */}
            <div className="flex justify-around items-center gap-4 flex-grow flex-shrink-0" style={{ minWidth: '280px' }}>
              {answerOptions.map((option, index) => (
                <motion.button
                  key={`${currentQuestion.id}-option-${index}`}
                  whileHover={isInteractable ? { scale: 1.05 } : {}}
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

            {/* End Session button - Fixed position */}
            <div className="flex justify-center flex-shrink-0">
              <button 
                className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-8 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 transition-all duration-300"
                onClick={reset}
              >
                End Session
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

PlayerCard.displayName = 'PlayerCard';

export default PlayerCard;

// Export types and interface implementation
export type { 
  Question, 
  Response, 
  FeedbackOptions,
  PresentationOptions
};

// Export a class that implements the full PlayerCardInterface for compatibility
export class PlayerCardImpl implements PlayerCardInterface {
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