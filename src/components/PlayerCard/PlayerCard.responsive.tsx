// PlayerCard.responsive.tsx
// APML v3.1 Contract-compliant responsive version of PlayerCard

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

// Import contract system
import { PlayerCardContract } from '../../interfaces/ComponentContracts';
import { useResponsive } from '../../systems/ResponsiveSystem';

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

// Define the contract for PlayerCard
const playerCardContract: PlayerCardContract = {
  context: 'learning',
  
  dependencies: {
    required: ['PlayerCardInterface', 'ResponsiveSystem'],
    optional: ['AnimationSystem']
  },
  
  responsibilities: [
    'Present mathematical questions',
    'Handle user responses',
    'Provide visual feedback',
    'Adapt to device constraints'
  ],
  
  responsive: {
    breakpoints: {
      mobile_portrait: {
        width: '100%',
        maxWidth: '100vw',
        padding: '16px',
        fontSize: '16px'
      },
      mobile_landscape: {
        width: '100%',
        maxWidth: '80vw',
        padding: '24px',
        fontSize: '16px'
      },
      tablet: {
        width: 'clamp(480px, 80vw, 600px)',
        padding: '32px',
        fontSize: '18px'
      },
      desktop: {
        width: '600px',
        padding: '40px',
        fontSize: '18px'
      }
    },
    touchTargets: {
      minimum: '44px',
      recommended: '48px'
    },
    scalingBehavior: 'fluid'
  },
  
  validateContract(): boolean {
    return true;
  }
};

/**
 * PlayerCard Component - APML v3.1 Responsive Version
 * 
 * The core interactive element of the Zenjin Maths App that presents 
 * mathematical questions with binary choices using responsive contracts
 */
const PlayerCard = forwardRef<PlayerCardHandle, PlayerCardProps>(({ 
  onAnswerSelected,
  initialQuestion,
  points = 0
}, ref) => {
  // Use responsive contract
  const { device, styles: responsiveStyles, isMobile, isTouchDevice } = useResponsive(playerCardContract.responsive);
  
  // State for current question
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(initialQuestion || null);
  
  // State for tracking answer order (randomize positions)
  const [answerOptions, setAnswerOptions] = useState<string[]>([]);
  
  // State for tracking the feedback to show
  const [feedbackState, setFeedbackState] = useState<FeedbackState>('idle');
  
  // State for tracking if the card is flipped (for animations)
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
   */
  const presentQuestion = useCallback((question: Question, options?: PresentationOptions): boolean => {
    try {
      if (!question || !question.id || !question.text || !question.correctAnswer || !question.distractor) {
        console.error('INVALID_QUESTION: Question is missing required fields');
        return false;
      }
      
      clearTimeout(timeoutRef.current!);
      
      setCurrentQuestion(question);
      
      const answers = [question.correctAnswer, question.distractor];
      const shuffled = [...answers].sort(() => Math.random() - 0.5);
      setAnswerOptions(shuffled);
      
      setFeedbackState('idle');
      setIsInteractable(true);
      setIsCardVisible(true);
      
      startTimeRef.current = Date.now();
      
      if (options?.timeout && options.timeout > 0) {
        timeoutRef.current = setTimeout(() => {
          handleTimeout(question.id);
        }, options.timeout);
      }
      
      return true;
    } catch (error) {
      console.error('RENDERING_ERROR: Failed to present question due to rendering issues', error);
      return false;
    }
  }, []);

  /**
   * Handles the user's response to a question
   */
  const handleResponse = useCallback((response: Response, feedbackOptions?: FeedbackOptions): { processed: boolean; feedbackShown: boolean } => {
    try {
      if (!response || !response.questionId || !response.selectedAnswer) {
        console.error('INVALID_RESPONSE: Response is missing required fields');
        return { processed: false, feedbackShown: false };
      }
      
      const { questionId, selectedAnswer, isCorrect } = response;
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      setFeedbackState(isCorrect ? 'correct' : 'incorrect');
      setIsInteractable(false);
      
      const feedbackDuration = (feedbackOptions?.duration || 2) * 1000;
      
      setTimeout(() => {
        setFeedbackState('idle');
        setIsInteractable(true);
        
        if (feedbackOptions?.onComplete) {
          feedbackOptions.onComplete(response);
        }
      }, feedbackDuration);
      
      return { processed: true, feedbackShown: true };
    } catch (error) {
      console.error('FEEDBACK_FAILED: Failed to show response feedback due to rendering issues', error);
      return { processed: false, feedbackShown: false };
    }
  }, []);

  /**
   * Handles timeout scenarios
   */
  const handleTimeout = useCallback((questionId: string): { processed: boolean; feedbackShown: boolean } => {
    try {
      if (!questionId || !currentQuestion || currentQuestion.id !== questionId) {
        console.error('INVALID_QUESTION_ID: The question ID is invalid or unknown');
        return { processed: false, feedbackShown: false };
      }
      
      setFeedbackState('timeout');
      setIsInteractable(false);
      
      setTimeout(() => {
        setFeedbackState('idle');
        setIsInteractable(true);
        
        if (currentQuestion) {
          presentQuestion(currentQuestion);
        }
      }, 3000);
      
      return { processed: true, feedbackShown: true };
    } catch (error) {
      console.error('FEEDBACK_FAILED: Failed to show timeout feedback due to rendering issues', error);
      return { processed: false, feedbackShown: false };
    }
  }, [currentQuestion, presentQuestion]);

  /**
   * Resets the PlayerCard to its initial state
   */
  const reset = useCallback((): boolean => {
    try {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
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
   */
  const handleAnswerClick = useCallback((selectedAnswer: string) => {
    if (!isInteractable || !currentQuestion) return;
    
    const responseTime = Date.now() - startTimeRef.current;
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const isFirstAttempt = !attemptedQuestions.has(currentQuestion.id);
    
    if (isFirstAttempt) {
      setAttemptedQuestions(prev => new Set(prev).add(currentQuestion.id));
    }
    
    const response: Response = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect,
      responseTime,
      isFirstAttempt
    };
    
    handleResponse(response);
    
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
  }));

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Get card background class based on feedback state
  const getCardClasses = () => {
    const baseClasses = 'rounded-3xl shadow-2xl transition-all duration-300 transform';
    
    switch (feedbackState) {
      case 'correct':
        return `${baseClasses} bg-gradient-to-br from-emerald-400 to-green-600 scale-105 ring-4 ring-emerald-300`;
      case 'incorrect':
        return `${baseClasses} bg-gradient-to-br from-rose-400 to-red-600 shake-animation`;
      case 'timeout':
        return `${baseClasses} bg-gradient-to-br from-amber-400 to-orange-600 pulse-animation`;
      default:
        return `${baseClasses} bg-gradient-to-br from-indigo-500 to-purple-600`;
    }
  };

  // Get touch target size based on device
  const touchTargetSize = isTouchDevice ? playerCardContract.responsive!.touchTargets.recommended : '40px';

  return (
    <div 
      className="flex flex-col items-center justify-start w-full min-h-[500px] p-2 player-card-container" 
      style={responsiveStyles}
    >
      {/* Points Display */}
      <div className="w-full mb-2" style={{ maxWidth: responsiveStyles.width }}>
        <div className="bg-gray-800/80 rounded-lg p-3 shadow-md">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-medium">POINTS</span>
            <span className="text-3xl font-bold text-white">{points}</span>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <AnimatePresence mode="wait">
        {currentQuestion && (
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
            style={{ maxWidth: responsiveStyles.width }}
          >
            <div className={`${getCardClasses()} p-6 relative`}>
              {/* Difficulty Indicator */}
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

              {/* Question */}
              <div className="text-center mb-8">
                <h2 
                  className="text-2xl font-bold text-white"
                  style={{ fontSize: responsiveStyles.fontSize }}
                >
                  {currentQuestion.text}
                </h2>
              </div>

              {/* Answer Options */}
              <div className="grid grid-cols-1 gap-4">
                {answerOptions.map((answer, index) => (
                  <motion.button
                    key={`${currentQuestion.id}-${answer}-${index}`}
                    whileHover={isInteractable ? { scale: 1.05 } : {}}
                    whileTap={isInteractable ? { scale: 0.95 } : {}}
                    onClick={() => handleAnswerClick(answer)}
                    disabled={!isInteractable}
                    className={`relative overflow-hidden rounded-xl transition-all duration-200 ${
                      isInteractable 
                        ? 'bg-white/20 hover:bg-white/30 cursor-pointer' 
                        : 'bg-white/10 cursor-not-allowed'
                    } backdrop-blur-sm border-2 border-white/20`}
                    style={{ 
                      minHeight: touchTargetSize,
                      padding: isMobile ? '12px 20px' : '16px 24px'
                    }}
                  >
                    <span className="relative z-10 text-lg font-semibold text-white">
                      {answer}
                    </span>
                  </motion.button>
                ))}
              </div>

              {/* Feedback Messages */}
              <AnimatePresence>
                {feedbackState !== 'idle' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-3xl"
                  >
                    <div className="text-center">
                      {feedbackState === 'correct' && (
                        <>
                          <div className="text-6xl mb-2">✅</div>
                          <p className="text-2xl font-bold text-white">Correct!</p>
                        </>
                      )}
                      {feedbackState === 'incorrect' && (
                        <>
                          <div className="text-6xl mb-2">❌</div>
                          <p className="text-2xl font-bold text-white">Try Again!</p>
                        </>
                      )}
                      {feedbackState === 'timeout' && (
                        <>
                          <div className="text-6xl mb-2">⏰</div>
                          <p className="text-2xl font-bold text-white">Time's Up!</p>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!currentQuestion && (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400 text-lg">Waiting for question...</p>
        </div>
      )}
    </div>
  );
});

PlayerCard.displayName = 'PlayerCard';

export default PlayerCard;