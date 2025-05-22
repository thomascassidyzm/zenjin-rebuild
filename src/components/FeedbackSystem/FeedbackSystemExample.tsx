// Example Usage with PlayerCard Component
import React, { useState } from 'react';
import { 
  FeedbackSystemProvider, 
  useFeedback, 
  FeedbackTarget, 
  FeedbackOptions 
} from './FeedbackSystem';

// Mock ThemeManager for demonstration
interface ThemeProps {
  darkMode: boolean;
  primaryColor: string;
  secondaryColor: string;
}

const themeContext = {
  darkMode: false,
  primaryColor: '#4299e1', // Blue
  secondaryColor: '#805ad5', // Purple
};

// PlayerCard Component that uses FeedbackSystem
function PlayerCard({ id, name, level }: { id: string; name: string; level: number }) {
  // Use feedback system in the component
  const feedback = useFeedback();
  
  // Example state to track answer status
  const [answerStatus, setAnswerStatus] = useState<'unanswered' | 'correct' | 'incorrect' | 'timeout'>('unanswered');
  
  // Handler for correct answer
  const handleCorrectAnswer = () => {
    const target: FeedbackTarget = { id: `player-card-${id}`, type: 'card' };
    const options: FeedbackOptions = { 
      duration: 1200, 
      intensity: 0.9,
      sound: true 
    };
    
    feedback.showCorrectFeedback(target, options);
    setAnswerStatus('correct');
  };
  
  // Handler for incorrect answer
  const handleIncorrectAnswer = () => {
    const target: FeedbackTarget = { id: `player-card-${id}`, type: 'card' };
    const options: FeedbackOptions = { 
      duration: 1500, 
      intensity: 1.0,
      sound: true,
      animation: 'shake'
    };
    
    feedback.showIncorrectFeedback(target, options);
    setAnswerStatus('incorrect');
  };
  
  // Handler for timeout
  const handleTimeout = () => {
    const target: FeedbackTarget = { id: `player-card-${id}`, type: 'card' };
    feedback.showTimeoutFeedback(target);
    setAnswerStatus('timeout');
  };
  
  // Handler for reset
  const handleReset = () => {
    const target: FeedbackTarget = { id: `player-card-${id}`, type: 'card' };
    
    // Try to cancel any active feedback
    try {
      feedback.cancelFeedback(target);
    } catch (error) {
      console.log('No active feedback to cancel');
    }
    
    // Show neutral feedback for reset
    feedback.showNeutralFeedback(target);
    setAnswerStatus('unanswered');
  };
  
  // Determine styles based on answer status
  const getCardStyle = () => {
    switch (answerStatus) {
      case 'correct':
        return 'bg-green-50 dark:bg-green-900';
      case 'incorrect':
        return 'bg-red-50 dark:bg-red-900';
      case 'timeout':
        return 'bg-blue-50 dark:bg-blue-900';
      default:
        return 'bg-gray-50 dark:bg-gray-800';
    }
  };
  
  return (
    <div 
      id={`player-card-${id}`}
      className={`p-6 rounded-lg shadow-md transition-all duration-300 ${getCardStyle()}`}
    >
      <h3 className="text-xl font-bold mb-2">{name}</h3>
      <p className="text-sm mb-4">Level: {level}</p>
      
      {/* Example answer circles */}
      <div className="flex space-x-4 mb-6">
        {[1, 2, 3].map((circleId) => (
          <div
            key={circleId}
            id={`answer-circle-${id}-${circleId}`}
            className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center cursor-pointer"
            onClick={() => {
              // Example: consider first circle as correct answer
              const isCorrect = circleId === 1;
              
              const target: FeedbackTarget = { 
                id: `answer-circle-${id}-${circleId}`, 
                type: 'circle' 
              };
              
              if (isCorrect) {
                feedback.showCorrectFeedback(target);
                handleCorrectAnswer();
              } else {
                feedback.showIncorrectFeedback(target);
                handleIncorrectAnswer();
              }
            }}
          >
            {circleId}
          </div>
        ))}
      </div>
      
      {/* Control buttons for demo */}
      <div className="flex flex-wrap gap-2 mt-4">
        <button
          className="px-3 py-1 bg-green-500 text-white rounded"
          onClick={handleCorrectAnswer}
        >
          Correct
        </button>
        <button
          className="px-3 py-1 bg-red-500 text-white rounded"
          onClick={handleIncorrectAnswer}
        >
          Incorrect
        </button>
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded"
          onClick={handleTimeout}
        >
          Timeout
        </button>
        <button
          className="px-3 py-1 bg-gray-500 text-white rounded"
          onClick={handleReset}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

// Example App component using FeedbackSystem and PlayerCard
export default function FeedbackExample() {
  return (
    <FeedbackSystemProvider>
      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Feedback System Demo</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          This example demonstrates the FeedbackSystem with PlayerCard component. 
          Click on the buttons to see different feedback types.
        </p>
        
        <div className="space-y-6">
          <PlayerCard id="1" name="Player One" level={3} />
          <PlayerCard id="2" name="Player Two" level={5} />
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900 rounded">
          <h2 className="text-lg font-semibold mb-2">Implementation Notes</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>FeedbackSystem uses GSAP for smooth animations</li>
            <li>Animations respect reduced motion preferences</li>
            <li>Feedback includes visual cues, optional sounds, and haptic feedback</li>
            <li>Each feedback type (correct, incorrect, neutral, timeout) has distinctive styling</li>
            <li>All feedback can be customized with duration and intensity options</li>
            <li>The system supports cancellation of active feedback animations</li>
          </ul>
        </div>
      </div>
    </FeedbackSystemProvider>
  );
}
