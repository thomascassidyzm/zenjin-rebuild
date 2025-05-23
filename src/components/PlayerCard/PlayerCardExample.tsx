import React, { useRef, useEffect } from 'react';
import PlayerCard, { 
  PlayerCardImpl, 
  Question, 
  Response,
  FeedbackOptions 
} from './PlayerCard';

// Add custom CSS for the shake animation
import './playerCardAnimations.css';

// Mock question for testing
const mockQuestion: Question = {
  id: "mult-7-8-001",
  text: "What is 7 × 8?",
  correctAnswer: "56",
  distractor: "54",
  boundaryLevel: 3, // Moderate distinction
  factId: "mult-7-8"
};

// Mock questions with varying boundary levels for demonstration
const mockQuestions: Question[] = [
  {
    id: "add-2-2-001",
    text: "What is 2 + 2?",
    correctAnswer: "4",
    distractor: "5",
    boundaryLevel: 1, // Obvious distinction
    factId: "add-2-2"
  },
  {
    id: "mult-6-8-001",
    text: "What is 6 × 8?",
    correctAnswer: "48",
    distractor: "64",
    boundaryLevel: 2, // Clear distinction
    factId: "mult-6-8"
  },
  mockQuestion, // Moderate distinction (level 3)
  {
    id: "mult-7-8-002",
    text: "What is 7 × 8?",
    correctAnswer: "56",
    distractor: "57",
    boundaryLevel: 4, // Subtle distinction
    factId: "mult-7-8"
  },
  {
    id: "sqrt-64-001",
    text: "What is √64?",
    correctAnswer: "8",
    distractor: "±8",
    boundaryLevel: 5, // Very subtle distinction
    factId: "sqrt-64"
  }
];

const PlayerCardExample: React.FC = () => {
  // Reference to the PlayerCard component for imperative access
  const playerCardRef = useRef<PlayerCardImpl | null>(null);
  const componentRef = useRef<any>(null);
  
  // Current question index for demonstrating progression
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  
  // Feedback state to display in the UI
  const [lastResponse, setLastResponse] = React.useState<Response | null>(null);
  
  // Points for demonstration
  const [points, setPoints] = React.useState(0);
  
  // Initialize the PlayerCard implementation
  useEffect(() => {
    if (componentRef.current) {
      playerCardRef.current = new PlayerCardImpl(componentRef);
    }
  }, []);
  
  // Handle answer selection
  const handleAnswerSelected = (response: Response) => {
    console.log('Answer selected:', response);
    setLastResponse(response);
    
    // Update points based on response
    if (response.isCorrect) {
      setPoints(prev => prev + 1);
    }
    
    // Automatically progress to the next question after a delay
    setTimeout(() => {
      const nextIndex = (currentQuestionIndex + 1) % mockQuestions.length;
      setCurrentQuestionIndex(nextIndex);
      
      if (playerCardRef.current) {
        playerCardRef.current.presentQuestion(mockQuestions[nextIndex]);
      }
    }, 2000);
  };
  
  // Manually present a question when the component mounts
  useEffect(() => {
    if (playerCardRef.current) {
      playerCardRef.current.presentQuestion(mockQuestions[currentQuestionIndex], {
        timeout: 30000 // 30 seconds timeout
      });
    }
  }, [currentQuestionIndex]);
  
  // Helper function to simulate timeouts for demonstration
  const simulateTimeout = () => {
    if (playerCardRef.current) {
      playerCardRef.current.handleTimeout(mockQuestions[currentQuestionIndex].id);
    }
  };
  
  // Reset the PlayerCard
  const resetCard = () => {
    if (playerCardRef.current) {
      playerCardRef.current.reset();
      // After a brief delay, present the current question again
      setTimeout(() => {
        playerCardRef.current?.presentQuestion(mockQuestions[currentQuestionIndex]);
      }, 500);
    }
  };
  
  // Present a specific boundary level question
  const presentBoundaryLevel = (level: number) => {
    const questionIndex = mockQuestions.findIndex(q => q.boundaryLevel === level);
    if (questionIndex >= 0) {
      setCurrentQuestionIndex(questionIndex);
      if (playerCardRef.current) {
        playerCardRef.current.presentQuestion(mockQuestions[questionIndex]);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="p-4 bg-gray-800 shadow-md">
        <h1 className="text-2xl font-bold">Zenjin Maths - PlayerCard Demo</h1>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {/* PlayerCard Component */}
        <div className="w-full max-w-md mb-8">
          <PlayerCard
            ref={componentRef}
            onAnswerSelected={handleAnswerSelected}
            initialQuestion={mockQuestions[currentQuestionIndex]}
            points={points}
          />
        </div>
        
        {/* Controls for demonstration */}
        <div className="w-full max-w-md bg-gray-800 rounded-lg p-4 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Demo Controls</h2>
          
          {/* Boundary level selection */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Boundary Levels:</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={`level-${level}`}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                  onClick={() => presentBoundaryLevel(level)}
                >
                  Level {level}
                </button>
              ))}
            </div>
          </div>
          
          {/* Actions */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Actions:</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              <button 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                onClick={() => simulateTimeout()}
              >
                Simulate Timeout
              </button>
              <button 
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition"
                onClick={() => resetCard()}
              >
                Reset Card
              </button>
            </div>
          </div>
          
          {/* Response info */}
          {lastResponse && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Last Response:</h3>
              <div className="bg-gray-700 rounded-lg p-3 text-sm font-mono">
                <div>Question ID: {lastResponse.questionId}</div>
                <div>Selected: {lastResponse.selectedAnswer}</div>
                <div>Correct: {lastResponse.isCorrect ? 'Yes ✅' : 'No ❌'}</div>
                <div>Time: {lastResponse.responseTime}ms</div>
                <div>First Attempt: {lastResponse.isFirstAttempt ? 'Yes' : 'No'}</div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer className="p-4 bg-gray-800 text-center text-sm text-gray-400">
        Zenjin Maths App - Distinction-based Learning Framework
      </footer>
    </div>
  );
};

export default PlayerCardExample;
