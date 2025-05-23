// src/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import PlayerCard from './components/PlayerCard/PlayerCard';
import { DashboardData } from './components/Dashboard/DashboardTypes';
import { Question } from './interfaces/PlayerCardInterface';
import { engineOrchestrator } from './engines/EngineOrchestrator';
import './App.css';

// Mock data for initial testing
const mockDashboardData: DashboardData = {
  lifetimeMetrics: {
    totalPoints: 15750,
    totalSessions: 42,
    averageBlinkSpeed: 2345,
    evolution: 6.71,
    globalRanking: 1253,
    progressPercentage: 37,
    ftcPoints: 12500,
    ecPoints: 3250,
    basePoints: 10500,
    averageBonusMultiplier: 1.5
  },
  learningPaths: [
    {
      pathId: "addition",
      pathName: "Addition",
      currentLevel: 5,
      maxLevel: 10,
      completedStitches: 25,
      totalStitches: 50,
      progressPercentage: 50,
      active: true
    },
    {
      pathId: "multiplication",
      pathName: "Multiplication", 
      currentLevel: 3,
      maxLevel: 10,
      completedStitches: 15,
      totalStitches: 50,
      progressPercentage: 30,
      active: false
    }
  ],
  recentAchievements: [
    {
      id: "perfect-session",
      name: "Perfect Session",
      description: "Complete a session with 100% accuracy",
      dateEarned: "2025-05-22T10:30:00Z",
      iconUrl: "/api/placeholder/50/50",
      pointsAwarded: 500
    }
  ],
  subscriptionType: "Premium",
  username: "TestUser",
  lastSessionDate: "2025-05-22T09:00:00Z",
  streakDays: 7
};

// Generate questions for current stitch in learning path
const generateQuestionsForStitch = (learningPathId: string, userId: string = 'default-user'): Question[] => {
  try {
    // Get the current stitch for this user and learning path
    const currentStitch = engineOrchestrator.getCurrentStitch(userId, learningPathId);
    
    if (!currentStitch) {
      console.warn(`No current stitch available for ${learningPathId}`);
      return [engineOrchestrator.generateQuestion(userId, learningPathId)];
    }
    
    // Generate questions specifically for this stitch (always 20 questions)
    const questions = engineOrchestrator.generateQuestionsForStitch(currentStitch, 20);
    
    if (questions.length === 0) {
      console.warn(`No questions generated for stitch ${currentStitch.id}`);
      return [engineOrchestrator.generateQuestion(userId, learningPathId)];
    }
    
    return questions;
  } catch (error) {
    console.error('Failed to generate stitch questions:', error);
    // Fallback to random question generation
    return [engineOrchestrator.generateQuestion('default-user', learningPathId)];
  }
};

// Navigation Header Component
const NavigationHeader: React.FC<{
  currentPage: string;
  onNavigate: (page: string) => void;
}> = ({ currentPage, onNavigate }) => {
  return (
    <header className="bg-gray-900 shadow-lg border-b border-gray-700">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Z</span>
            </div>
            <h1 className="text-white text-xl font-bold">Zenjin Maths</h1>
          </div>
          
          <nav className="flex space-x-1">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'learn', label: 'Learn' },
              { id: 'session', label: 'Practice' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === item.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

// Learning Session Component
const LearningSession: React.FC<{ learningPathId?: string }> = ({ learningPathId = 'addition' }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionScore, setSessionScore] = useState({ correct: 0, total: 0 });
  const [sessionComplete, setSessionComplete] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentStitch, setCurrentStitch] = useState<any>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  const userId = 'default-user';

  // Generate questions when component mounts or learning path changes
  useEffect(() => {
    const stitch = engineOrchestrator.getCurrentStitch(userId, learningPathId);
    setCurrentStitch(stitch);
    
    const generatedQuestions = generateQuestionsForStitch(learningPathId, userId);
    setQuestions(generatedQuestions);
    setCurrentQuestionIndex(0);
    setSessionScore({ correct: 0, total: 0 });
    setSessionComplete(false);
    setSessionStartTime(Date.now());
  }, [learningPathId]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelected = (response: any) => {
    const newScore = {
      correct: sessionScore.correct + (response.isCorrect ? 1 : 0),
      total: sessionScore.total + 1
    };
    setSessionScore(newScore);

    // Move to next question after delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Stitch complete - auto-rotate to next tube and continue
        handleStitchCompletion(newScore);
        // No setSessionComplete - session continues automatically!
      }
    }, 1500);
  };

  const handleStitchCompletion = (finalScore: { correct: number; total: number }) => {
    if (!currentStitch) return;
    
    try {
      const completionTime = Date.now() - sessionStartTime;
      const sessionResults = {
        correctCount: finalScore.correct,
        totalCount: finalScore.total,
        completionTime
      };
      
      // Complete the stitch and reposition it
      const repositionResult = engineOrchestrator.completeStitch(userId, currentStitch.id, sessionResults);
      
      if (repositionResult) {
        console.log(`Stitch completed! Moved from position ${repositionResult.previousPosition} to ${repositionResult.newPosition}`);
      }
      
      // LIVE-AID ROTATION: Automatically rotate to next tube and start next stitch
      const rotationResult = engineOrchestrator.rotateTripleHelix(userId);
      if (rotationResult) {
        console.log(`Tube rotated: ${rotationResult.previousActivePath.id} → ${rotationResult.newActivePath.id}`);
      }
      
      // Automatically start next stitch from the new active tube
      const nextStitch = engineOrchestrator.getCurrentStitch(userId);
      if (nextStitch) {
        setCurrentStitch(nextStitch);
        const newQuestions = engineOrchestrator.generateQuestionsForStitch(nextStitch, 20);
        setQuestions(newQuestions);
        setCurrentQuestionIndex(0);
        setSessionStartTime(Date.now());
        console.log(`Started new stitch from tube: ${rotationResult?.newActivePath.id}`);
      }
    } catch (error) {
      console.error('Failed to complete stitch:', error);
    }
  };

  const resetSession = () => {
    // Start a new stitch session
    const stitch = engineOrchestrator.getCurrentStitch(userId, learningPathId);
    setCurrentStitch(stitch);
    
    const generatedQuestions = generateQuestionsForStitch(learningPathId, userId);
    setQuestions(generatedQuestions);
    setCurrentQuestionIndex(0);
    setSessionScore({ correct: 0, total: 0 });
    setSessionComplete(false);
    setSessionStartTime(Date.now());
  };

  if (sessionComplete) {
    const percentage = Math.round((sessionScore.correct / sessionScore.total) * 100);
    const nextStitch = engineOrchestrator.getCurrentStitch(userId, learningPathId);
    
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">✓</span>
          </div>
          <h2 className="text-white text-2xl font-bold mb-2">Session Complete!</h2>
          <p className="text-gray-300 text-lg mb-6">
            You scored {sessionScore.correct} out of {sessionScore.total} ({percentage}%)
          </p>
          <button
            onClick={resetSession}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Continue Learning
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Session Progress */}
      <div className="bg-gray-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between text-white">
            <div className="text-sm">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
            <div className="text-sm">
              Score: {sessionScore.correct}/{sessionScore.total}
            </div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Player Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        {currentQuestion ? (
          <div className="w-full max-w-md">
            <PlayerCard
              key={currentQuestion.id}
              initialQuestion={currentQuestion}
              onAnswerSelected={handleAnswerSelected}
            />
            
            {/* Temporary Testing Button */}
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  // Simulate perfect completion
                  const perfectScore = { correct: 20, total: 20 };
                  handleStitchCompletion(perfectScore);
                  setSessionComplete(true);
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold py-2 px-4 rounded transition-colors"
              >
                🧪 SIMULATE COMPLETE STITCH (Testing)
              </button>
            </div>
          </div>
        ) : (
          <div className="text-white text-center">
            <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading questions...</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedLearningPath, setSelectedLearningPath] = useState('addition');

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleStartSession = (pathId: string) => {
    setSelectedLearningPath(pathId);
    setCurrentPage('session');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            initialData={mockDashboardData}
            onStartSessionClicked={handleStartSession}
          />
        );
      
      case 'learn':
        return (
          <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full text-center">
              <h2 className="text-white text-3xl font-bold mb-4">Learning Paths</h2>
              <p className="text-gray-400 text-lg mb-8">
                Choose a learning path to begin your mathematical journey
              </p>
              <div className="grid gap-4">
                {mockDashboardData.learningPaths.map((path) => (
                  <div
                    key={path.pathId}
                    className="bg-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-700 transition-colors"
                    onClick={() => handleStartSession(path.pathId)}
                  >
                    <h3 className="text-white text-xl font-bold mb-2">{path.pathName}</h3>
                    <p className="text-gray-300 mb-4">
                      Level {path.currentLevel} of {path.maxLevel}
                    </p>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${path.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'session':
        return <LearningSession learningPathId={selectedLearningPath} />;
      
      default:
        return <Navigate to="/dashboard" replace />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <NavigationHeader currentPage={currentPage} onNavigate={handleNavigate} />
      {renderCurrentPage()}
    </div>
  );
};

export default App;