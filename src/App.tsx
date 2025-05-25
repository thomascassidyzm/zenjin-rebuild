// src/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import PlayerCard from './components/PlayerCard/PlayerCard';
import { ProjectStatusDashboard } from './components/ProjectStatusDashboard';
import LaunchInterface from './components/LaunchInterface';
import LoadingInterface from './components/LoadingInterface';
import { UserAuthChoice } from './interfaces/LaunchInterfaceInterface';
import { LoadingContext } from './interfaces/LoadingInterfaceInterface';
import { DashboardData } from './components/Dashboard/DashboardTypes';
import { Question } from './interfaces/PlayerCardInterface';
import { engineOrchestrator } from './engines/EngineOrchestrator';
import { ConnectivityManager } from './engines/ConnectivityManager';
import { UserSessionProvider, useUserSession } from './contexts/UserSessionContext';
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
  isOnline: boolean;
  connectionType: string;
  backendConnected?: boolean;
}> = ({ currentPage, onNavigate, isOnline, connectionType, backendConnected = false }) => {
  return (
    <header className="bg-gray-900 shadow-lg border-b border-gray-700">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Z</span>
            </div>
            <h1 className="hidden sm:block text-white text-xl font-bold">Zenjin Maths</h1>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Connectivity Indicator with Backend Status */}
            <div className="flex items-center space-x-1">
              <div className={`w-3 h-3 rounded-full ${
                isOnline ? 'bg-green-400' : 'bg-red-400'
              }`} title={`Network: ${isOnline ? 'Online' : 'Offline'} (${connectionType})`}></div>
              {backendConnected && (
                <div className="w-2 h-2 rounded-full bg-blue-400" title="Backend Connected"></div>
              )}
            </div>
            
            <nav className="flex space-x-1">
            {[
              { id: 'dashboard', icon: '⚏', label: 'Dashboard', title: 'Dashboard' },
              { id: 'session', icon: '▶', label: 'Play', title: 'Play Session' },
              { id: 'project-status', icon: '📊', label: 'Status', title: 'Project Status' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                title={item.title}
                className={`px-2 sm:px-4 py-2 rounded-lg transition-colors flex items-center space-x-1 sm:space-x-2 ${
                  currentPage === item.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="hidden sm:inline text-sm">{item.label}</span>
              </button>
            ))}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

// Learning Session Component with Backend Integration
const LearningSession: React.FC<{ learningPathId?: string }> = ({ learningPathId = 'addition' }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionScore, setSessionScore] = useState({ correct: 0, total: 0 });
  const [sessionComplete, setSessionComplete] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentStitch, setCurrentStitch] = useState<any>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  const [showProjectStatus, setShowProjectStatus] = useState(false);
  
  // Backend integration via UserSession context
  const { state: sessionState, recordSessionMetrics, updateUserState } = useUserSession();
  const userId = sessionState.user?.id || 'default-user';

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

  const handleStitchCompletion = async (finalScore: { correct: number; total: number }) => {
    if (!currentStitch) return;
    
    try {
      const completionTime = Date.now() - sessionStartTime;
      const sessionResults = {
        correctCount: finalScore.correct,
        totalCount: finalScore.total,
        completionTime
      };
      
      // Record session metrics to backend
      const sessionMetrics = {
        sessionId: `${currentStitch.id}_${Date.now()}`,
        correctAnswers: finalScore.correct,
        totalQuestions: finalScore.total,
        completionTime,
        learningPath: learningPathId,
        timestamp: new Date().toISOString()
      };
      
      await recordSessionMetrics(sessionMetrics);
      console.log('✅ Session metrics recorded to backend');
      
      // Complete the stitch and reposition it
      const repositionResult = engineOrchestrator.completeStitch(userId, currentStitch.id, sessionResults);
      
      if (repositionResult) {
        console.log(`Stitch completed! Moved from position ${repositionResult.previousPosition} to ${repositionResult.newPosition}`);
        
        // Update user state with new stitch positions
        await updateUserState({
          stitchPositions: engineOrchestrator.getAllStitchPositions(userId)
        });
      }
      
      // LIVE-AID ROTATION: Automatically rotate to next tube and start next stitch
      const rotationResult = engineOrchestrator.rotateTripleHelix(userId);
      if (rotationResult) {
        console.log(`Tube rotated: ${rotationResult.previousActivePath.id} → ${rotationResult.newActivePath.id}`);
        
        // Update user state with new triple helix state
        await updateUserState({
          tripleHelixState: engineOrchestrator.getTripleHelixState(userId)
        });
      }
      
      // Automatically start next stitch from the new active tube
      const nextStitch = engineOrchestrator.getCurrentStitch(userId);
      if (nextStitch) {
        setCurrentStitch(nextStitch);
        const newQuestions = engineOrchestrator.generateQuestionsForStitch(nextStitch, 20);
        setQuestions(newQuestions);
        setCurrentQuestionIndex(0);
        setSessionStartTime(Date.now());
        console.log(`🎯 Started stitch '${nextStitch.id}' from tube: ${rotationResult?.newActivePath.id}`);
      }
    } catch (error) {
      console.error('Failed to complete stitch:', error);
    }
  };

  const resetSession = () => {
    // Start fresh session from current active tube (don't override with learningPathId)
    const stitch = engineOrchestrator.getCurrentStitch(userId); // No learningPathId - use active tube
    setCurrentStitch(stitch);
    
    if (stitch) {
      const generatedQuestions = engineOrchestrator.generateQuestionsForStitch(stitch, 20);
      setQuestions(generatedQuestions);
    }
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

  // Show project status dashboard if enabled
  if (showProjectStatus) {
    return (
      <div>
        <div className="bg-gray-900 p-3">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-white font-semibold">Project Status Dashboard</h1>
            <button
              onClick={() => setShowProjectStatus(false)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
            >
              Back to App
            </button>
          </div>
        </div>
        <ProjectStatusDashboard />
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
            <button
              onClick={() => setShowProjectStatus(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs"
            >
              📊 Project Status
            </button>
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
            
            {/* Testing Buttons */}
            <div className="mt-4 text-center flex gap-2 justify-center">
              <button
                onClick={() => {
                  const perfectScore = { correct: 20, total: 20 };
                  handleStitchCompletion(perfectScore);
                }}
                className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-1 px-3 rounded transition-colors"
              >
                ✓ Perfect (20/20)
              </button>
              <button
                onClick={() => {
                  const imperfectScore = { correct: 15, total: 20 };
                  handleStitchCompletion(imperfectScore);
                }}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-3 rounded transition-colors"
              >
                ✗ Imperfect (15/20)
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

// App Content Component (needs UserSession context)
const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedLearningPath, setSelectedLearningPath] = useState('addition');
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState('unknown');
  const [launchComplete, setLaunchComplete] = useState(false);
  const [userAuthChoice, setUserAuthChoice] = useState<UserAuthChoice | null>(null);
  const [showInitialLoading, setShowInitialLoading] = useState(true);

  // Access UserSession context
  const { state: sessionState, getBackendStatus, createAnonymousUser, initializeSession } = useUserSession();

  // Initialize connectivity monitoring
  useEffect(() => {
    const connectivityManager = new ConnectivityManager();
    
    // Set initial status
    const status = connectivityManager.getConnectionStatus();
    console.log('🌐 Initial connectivity status:', status);
    setIsOnline(status.isOnline);
    setConnectionType(status.connectionType);
    
    // Listen for connectivity changes
    const changeListener = connectivityManager.addEventListener('change', (event) => {
      console.log('🌐 Connectivity changed:', event);
      setIsOnline(event.status.isOnline);
      setConnectionType(event.status.connectionType);
    });
    
    const onlineListener = connectivityManager.addEventListener('online', (event) => {
      console.log('✅ Back online!', event);
    });
    
    const offlineListener = connectivityManager.addEventListener('offline', (event) => {
      console.log('❌ Gone offline!', event);
    });
    
    // Start monitoring connectivity
    connectivityManager.startMonitoring(5000);
    
    return () => {
      connectivityManager.removeEventListener(changeListener);
      connectivityManager.removeEventListener(onlineListener);
      connectivityManager.removeEventListener(offlineListener);
      connectivityManager.stopMonitoring();
      connectivityManager.destroy();
    };
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleStartSession = (pathId: string) => {
    setSelectedLearningPath(pathId);
    setCurrentPage('session');
  };

  // Handle user authentication choice
  const handleAuthChoice = async (choice: UserAuthChoice): Promise<void> => {
    setUserAuthChoice(choice);
    
    try {
      switch (choice) {
        case UserAuthChoice.ANONYMOUS:
          // Create anonymous user session
          await createAnonymousUser();
          break;
        case UserAuthChoice.SIGN_IN:
          // TODO: Implement sign in flow
          console.log('Sign in requested - not yet implemented');
          break;
        case UserAuthChoice.SIGN_UP:
          // TODO: Implement sign up flow
          console.log('Sign up requested - not yet implemented');
          break;
      }
    } catch (error) {
      console.error('Auth choice failed:', error);
      throw error; // Let LaunchInterface handle the error
    }
  };

  // Handle initial loading completion
  const handleInitialLoadingComplete = () => {
    setShowInitialLoading(false);
  };

  // Phase 1: Initial Loading (engines, backend connection)
  if (showInitialLoading) {
    return (
      <LoadingInterface
        context={LoadingContext.INITIAL_APP_LOAD}
        onLoadingComplete={handleInitialLoadingComplete}
      />
    );
  }

  // Phase 2: User Choice (Launch Interface)
  if (!userAuthChoice) {
    return (
      <LaunchInterface
        onAuthChoiceSelected={handleAuthChoice}
        onInterfaceComplete={() => setLaunchComplete(true)}
      />
    );
  }

  // Phase 3: Session Loading (after user choice, before app)
  if (sessionState.isLoading) {
    const loadingContext = userAuthChoice === UserAuthChoice.ANONYMOUS 
      ? LoadingContext.SESSION_INITIALIZATION 
      : LoadingContext.USER_AUTHENTICATION;
      
    return (
      <LoadingInterface
        context={loadingContext}
        onLoadingComplete={() => setLaunchComplete(true)}
      />
    );
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            initialData={mockDashboardData}
            onStartSessionClicked={handleStartSession}
          />
        );
      
      case 'session':
        return <LearningSession learningPathId={selectedLearningPath} />;
      
      case 'project-status':
        return <ProjectStatusDashboard />;
      
      default:
        return <Navigate to="/dashboard" replace />;
    }
  };

  // Determine online status - show green if basic connectivity is working
  // Don't require full backend integration for green light during development
  const backendStatus = getBackendStatus();
  const hasBackendConnection = backendStatus.api || sessionState.isAuthenticated;
  
  // If backend is working (user authenticated), then connectivity is clearly working
  // Use practical detection: if we can create users and sync state, we're online
  const backendIsWorking = sessionState.isAuthenticated || hasBackendConnection;
  const effectiveOnlineStatus = isOnline || backendIsWorking;

  // Main app content with smooth launch transition
  const mainAppContent = (
    <div className="min-h-screen bg-gray-950">
      <NavigationHeader 
        currentPage={currentPage} 
        onNavigate={handleNavigate}
        isOnline={effectiveOnlineStatus}
        connectionType={connectionType}
        backendConnected={hasBackendConnection}
      />
      {renderCurrentPage()}
    </div>
  );

  // Phase 4: Main Application (after all loading and choices complete)
  return mainAppContent;
};

// Main App Component with UserSession Provider
const App: React.FC = () => {
  return (
    <UserSessionProvider>
      <AppContent />
    </UserSessionProvider>
  );
};

export default App;