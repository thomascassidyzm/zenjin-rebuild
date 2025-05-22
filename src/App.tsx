// src/App.tsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import PlayerCard from './components/PlayerCard/PlayerCard';
import { DashboardData } from './components/Dashboard/DashboardTypes';
import { Question } from './components/PlayerCard/PlayerCard';
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

// Mock questions for testing
const mockQuestions: Question[] = [
  {
    id: "add-7-8-001",
    text: "What is 7 + 8?",
    correctAnswer: "15",
    distractor: "16",
    boundaryLevel: 2,
    factId: "add-7-8"
  },
  {
    id: "mult-6-7-001", 
    text: "What is 6 × 7?",
    correctAnswer: "42",
    distractor: "48",
    boundaryLevel: 3,
    factId: "mult-6-7"
  },
  {
    id: "mult-8-9-001",
    text: "What is 8 × 9?", 
    correctAnswer: "72",
    distractor: "81",
    boundaryLevel: 4,
    factId: "mult-8-9"
  }
];

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
const LearningSession: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionScore, setSessionScore] = useState({ correct: 0, total: 0 });
  const [sessionComplete, setSessionComplete] = useState(false);

  const currentQuestion = mockQuestions[currentQuestionIndex];

  const handleAnswerSelected = (response: any) => {
    const newScore = {
      correct: sessionScore.correct + (response.isCorrect ? 1 : 0),
      total: sessionScore.total + 1
    };
    setSessionScore(newScore);

    // Move to next question after delay
    setTimeout(() => {
      if (currentQuestionIndex < mockQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setSessionComplete(true);
      }
    }, 1500);
  };

  const resetSession = () => {
    setCurrentQuestionIndex(0);
    setSessionScore({ correct: 0, total: 0 });
    setSessionComplete(false);
  };

  if (sessionComplete) {
    const percentage = Math.round((sessionScore.correct / sessionScore.total) * 100);
    
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
            Start New Session
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
              Question {currentQuestionIndex + 1} of {mockQuestions.length}
            </div>
            <div className="text-sm">
              Score: {sessionScore.correct}/{sessionScore.total}
            </div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / mockQuestions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Player Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <PlayerCard
          key={currentQuestion.id}
          initialQuestion={currentQuestion}
          onAnswerSelected={handleAnswerSelected}
        />
      </div>
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleStartSession = (pathId: string) => {
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
        return <LearningSession />;
      
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