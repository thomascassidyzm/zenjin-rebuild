// src/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import PlayerCard from './components/PlayerCard/PlayerCard';
import { ProjectStatusDashboard } from './components/ProjectStatusDashboard';
import LaunchInterface from './components/LaunchInterface';
import LoadingInterface from './components/LoadingInterface';
import UnifiedAuthForm, { AuthMode } from './components/UnifiedAuthForm';
import { AuthenticatedUserContext, AnonymousUserContext } from './interfaces/AuthToPlayerInterface';
import { authenticationFlowService } from './services/AuthenticationFlowService';
import PreEngagementCard from './components/PreEngagementCard';
import MathLoadingAnimation from './components/MathLoadingAnimation';
import { UserAuthChoice } from './interfaces/LaunchInterfaceInterface';
import { LoadingContext } from './interfaces/LoadingInterfaceInterface';
import { engineOrchestrator } from './engines/EngineOrchestrator';
import { learningEngineService } from './services/LearningEngineService';
import { DashboardData } from './components/Dashboard/DashboardTypes';
import { Question } from './interfaces/PlayerCardInterface';
import { ConnectivityManager } from './engines/ConnectivityManager';
import { UserSessionProvider, useUserSession } from './contexts/UserSessionContext';
import { authToPlayerEventBus, AuthToPlayerState } from './services/AuthToPlayerEventBus';
import BuildBadge from './components/BuildBadge';
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
      id: "flawless-session",
      name: "Flawless Session",
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

// Generate questions for current stitch in learning path using LearningEngineService
const generateQuestionsForStitch = async (learningPathId: string, userId: string = 'default-user'): Promise<Question[]> => {
  try {
    console.log(`Generating questions for learning path: ${learningPathId}, user: ${userId}`);
    
    // Use LearningEngineService for session-based question generation
    const sessionResult = await learningEngineService.initializeLearningSession(
      userId,
      learningPathId,
      { maxQuestions: 20 }
    );
    
    console.log(`Session ${sessionResult.sessionId} created with ${sessionResult.initialQuestions.length} questions`);
    
    if (sessionResult.initialQuestions.length === 0) {
      console.warn(`No questions generated for ${learningPathId}`);
      return [];
    }
    
    // Convert LearningEngineService questions to PlayerCard format
    const questions: Question[] = sessionResult.initialQuestions.map(q => ({
      id: q.id,
      text: q.questionText,
      correctAnswer: q.correctAnswer,
      wrongAnswers: q.distractors,
      metadata: {
        factId: q.factId,
        boundaryLevel: q.boundaryLevel,
        difficulty: q.difficulty,
        sessionId: sessionResult.sessionId,
        ...q.metadata
      }
    }));
    
    return questions;
  } catch (error) {
    console.error('Failed to generate stitch questions:', error);
    // Return empty array to avoid infinite loops
    return [];
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
    const stitchId = engineOrchestrator.getCurrentStitchId(userId);
    setCurrentStitch(stitchId);
    
    const loadQuestions = async () => {
      try {
        const generatedQuestions = await generateQuestionsForStitch(learningPathId, userId);
        setQuestions(generatedQuestions);
        setCurrentQuestionIndex(0);
        setSessionScore({ correct: 0, total: 0 });
        setSessionComplete(false);
        setSessionStartTime(Date.now());
      } catch (error) {
        console.error('Failed to load questions:', error);
      }
    };
    
    loadQuestions();
  }, [learningPathId]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelected = async (response: any) => {
    const newScore = {
      correct: sessionScore.correct + (response.isCorrect ? 1 : 0),
      total: sessionScore.total + 1
    };
    setSessionScore(newScore);

    // Process the response through LearningEngineService if we have session metadata
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion?.metadata?.sessionId) {
      try {
        const userResponse = {
          questionId: currentQuestion.id,
          selectedAnswer: response.selectedAnswer,
          responseTime: response.responseTime || 3000,
          isCorrect: response.isCorrect,
          timestamp: new Date().toISOString()
        };
        
        const responseResult = await learningEngineService.processUserResponse(
          currentQuestion.metadata.sessionId,
          currentQuestion.id,
          userResponse
        );
        
        console.log(`Response processed: ${responseResult.feedback.isCorrect ? 'correct' : 'incorrect'}`);
        console.log(`Encouragement: ${responseResult.feedback.encouragement}`);
        
        // If there's a next question from the service, add it to our queue
        if (responseResult.nextQuestion && !responseResult.sessionComplete) {
          const nextQ: Question = {
            id: responseResult.nextQuestion.id,
            text: responseResult.nextQuestion.questionText,
            correctAnswer: responseResult.nextQuestion.correctAnswer,
            wrongAnswers: responseResult.nextQuestion.distractors,
            metadata: {
              factId: responseResult.nextQuestion.factId,
              boundaryLevel: responseResult.nextQuestion.boundaryLevel,
              difficulty: responseResult.nextQuestion.difficulty,
              sessionId: currentQuestion.metadata.sessionId,
              ...responseResult.nextQuestion.metadata
            }
          };
          
          setQuestions(prev => [...prev, nextQ]);
        }
      } catch (error) {
        console.error('Failed to process response through LearningEngineService:', error);
      }
    }

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
      const repositionResult = await engineOrchestrator.completeStitch(userId, currentStitch.id, sessionResults);
      
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
        console.log(`Tube rotated: ${rotationResult.previousActiveTube} → ${rotationResult.newActiveTube}`);
        
        // Update user state with new triple helix state
        await updateUserState({
          tripleHelixState: engineOrchestrator.getTripleHelixState(userId)
        });
      }
      
      // Automatically start next stitch from the new active tube
      const nextStitchId = engineOrchestrator.getCurrentStitchId(userId);
      if (nextStitchId) {
        setCurrentStitch(nextStitchId);
        try {
          const newQuestions = await engineOrchestrator.generateQuestionsForStitch(nextStitchId, 20, userId);
          setQuestions(newQuestions);
          setCurrentQuestionIndex(0);
          setSessionStartTime(Date.now());
          console.log(`🎯 Started stitch '${nextStitchId}' from tube: ${rotationResult?.newActiveTube}`);
        } catch (error) {
          console.error('Failed to generate questions for next stitch:', error);
        }
      }
    } catch (error) {
      console.error('Failed to complete stitch:', error);
    }
  };

  const resetSession = async () => {
    // Start fresh session from current active tube (don't override with learningPathId)
    const stitchId = engineOrchestrator.getCurrentStitchId(userId); // No learningPathId - use active tube
    setCurrentStitch(stitchId);
    
    if (stitchId) {
      try {
        const generatedQuestions = await engineOrchestrator.generateQuestionsForStitch(stitchId, 20, userId);
        setQuestions(generatedQuestions);
      } catch (error) {
        console.error('Failed to generate questions for reset session:', error);
      }
    }
    setCurrentQuestionIndex(0);
    setSessionScore({ correct: 0, total: 0 });
    setSessionComplete(false);
    setSessionStartTime(Date.now());
  };

  if (sessionComplete) {
    const percentage = Math.round((sessionScore.correct / sessionScore.total) * 100);
    const nextStitchId = engineOrchestrator.getCurrentStitchId(userId);
    
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
                  const flawlessScore = { correct: 20, total: 20 };
                  handleStitchCompletion(flawlessScore);
                }}
                className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-1 px-3 rounded transition-colors"
              >
                ✓ Flawless (20/20)
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
  const [authError, setAuthError] = useState<string | null>(null);

  // Access UserSession context
  const { 
    state: sessionState, 
    getBackendStatus, 
    createAnonymousUser, 
    initializeSession,
    registerUser,
    signInUser,
    sendEmailOTP,
    verifyEmailOTP
  } = useUserSession();

  // Auth-to-Player Flow Event Bus
  const [authToPlayerState, setAuthToPlayerState] = useState<AuthToPlayerState>('AUTH_SUCCESS');
  const [playerContent, setPlayerContent] = useState<any>(null);

  // Handle Auth-to-Player flow events
  useEffect(() => {
    // Listen for state changes
    const unsubscribeState = authToPlayerEventBus.on('state:changed', ({ to }) => {
      setAuthToPlayerState(to);
    });

    // Listen for player ready event
    const unsubscribePlayer = authToPlayerEventBus.on('player:ready', (data) => {
      console.log('🎮 Auth-to-Player flow complete, transitioning to player');
      setPlayerContent(data.content); // Capture content from event
      setCurrentPage('session');
      setLaunchComplete(true);
    });

    return () => {
      unsubscribeState();
      unsubscribePlayer();
    };
  }, []);

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
          // Simple approach: go directly to PreEngagementCard, create user later
          const anonymousUserContext: AnonymousUserContext = {
            userType: 'anonymous',
            userId: 'pending-creation', // Will be created when play button clicked
            userName: 'Guest'
          };
          
          console.log('✅ Starting Auth-to-Player flow for anonymous user (no backend calls)');
          authToPlayerEventBus.startFlow(anonymousUserContext);
          break;
        case UserAuthChoice.SIGN_IN:
          // Sign in flow will be handled by dedicated form component
          console.log('Sign in flow initiated');
          break;
        case UserAuthChoice.SIGN_UP:
          // Sign up flow will be handled by dedicated form component
          console.log('Sign up flow initiated');
          break;
      }
    } catch (error) {
      console.error('Auth choice failed:', error);
      throw error; // Let LaunchInterface handle the error
    }
  };

  // Phase 1: User Choice (Launch Interface - immediate start page)
  if (!userAuthChoice) {
    return (
      <LaunchInterface
        onAuthChoiceSelected={handleAuthChoice}
        onInterfaceComplete={() => setLaunchComplete(true)}
      />
    );
  }

  // Phase 2: Authentication Forms (for Sign In/Sign Up choices)
  if ((userAuthChoice === UserAuthChoice.SIGN_IN || userAuthChoice === UserAuthChoice.SIGN_UP) && !sessionState.isAuthenticated && !sessionState.isLoading) {
    const handleSendOTP = async (email: string): Promise<boolean> => {
      setAuthError(null);
      return await sendEmailOTP(email);
    };

    const handleVerifyOTP = async (email: string, otp: string): Promise<boolean> => {
      setAuthError(null);
      try {
        // Use APML-compliant authentication service
        const result = await authenticationFlowService.handleOTPAuthentication(email, otp);
        
        if (result.success && result.user) {
          // Handle authentication completion with guaranteed user data
          authenticationFlowService.onAuthenticationComplete(result, 'OTP');
          return true;
        } else {
          setAuthError(result.error || 'OTP verification failed');
          return false;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'OTP verification failed';
        setAuthError(errorMessage);
        return false;
      }
    };

    const handlePasswordLogin = async (email: string, password: string): Promise<boolean> => {
      setAuthError(null);
      try {
        // Use APML-compliant authentication service
        const result = await authenticationFlowService.handlePasswordAuthentication(email, password);
        
        if (result.success && result.user) {
          // Handle authentication completion with guaranteed user data
          authenticationFlowService.onAuthenticationComplete(result, 'PASSWORD');
          return true;
        } else {
          setAuthError(result.error || 'Password authentication failed');
          return false;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
        setAuthError(errorMessage);
        return false;
      }
    };

    const handleAuthSuccess = () => {
      // Auth success is now handled by the APML-compliant service adapter
      // This callback is triggered by UnifiedAuthForm when authentication succeeds
      console.log('✅ Authentication completed via UnifiedAuthForm');
    };

    const handleCancel = () => {
      setUserAuthChoice(null);
      setAuthError(null);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">Z</span>
            </div>
          </div>
          
          <UnifiedAuthForm
            mode={AuthMode.EMAIL_ENTRY}
            onSuccess={handleAuthSuccess}
            onCancel={handleCancel}
            onSendOTP={handleSendOTP}
            onVerifyOTP={handleVerifyOTP}
            onLoginWithPassword={handlePasswordLogin}
          />
        </div>
      </div>
    );
  }

  // Phase 3: Session Loading (only show for sign-in users, not anonymous)
  if (sessionState.isLoading && !sessionState.isAuthenticated && userAuthChoice !== UserAuthChoice.ANONYMOUS) {
    const loadingContext = LoadingContext.USER_AUTHENTICATION;
      
    return (
      <LoadingInterface
        context={loadingContext}
        onLoadingComplete={() => setLaunchComplete(true)}
      />
    );
  }

  // Phase 4: Auth-to-Player Flow (after authentication success OR anonymous pending)
  if ((sessionState.isAuthenticated || userAuthChoice === UserAuthChoice.ANONYMOUS) && authToPlayerState !== 'ACTIVE_LEARNING') {
    // Determine user context type based on user data or auth choice
    const userContext = (sessionState.user?.userType === 'anonymous' || userAuthChoice === UserAuthChoice.ANONYMOUS) ? {
      userType: 'anonymous' as const,
      userId: sessionState.user?.anonymousId || 'pending-creation',
      userName: sessionState.user?.displayName || 'Guest'
    } as AnonymousUserContext : {
      userType: 'authenticated' as const,
      userId: sessionState.user?.id || '',
      userName: sessionState.user?.displayName,
      email: sessionState.user?.id || '' // Using id as email fallback since User interface doesn't have email
    } as AuthenticatedUserContext;

    switch (authToPlayerState) {
      case 'PRE_ENGAGEMENT':
        return (
          <PreEngagementCard
            userContext={userContext}
            onPlayClicked={async () => authToPlayerEventBus.playButtonClicked()}
            isLoading={false}
            loadingProgress={0}
          />
        );
      
      case 'LOADING_WITH_ANIMATION':
        return (
          <MathLoadingAnimation
            onAnimationComplete={async () => authToPlayerEventBus.animationCompleted()}
            loadingProgress={0}
            duration={3000}
          />
        );
      
      default:
        // AUTH_SUCCESS state - immediately show PRE_ENGAGEMENT (no loading screen)
        return (
          <PreEngagementCard
            userContext={userContext}
            onPlayClicked={async () => authToPlayerEventBus.playButtonClicked()}
            isLoading={false}
            loadingProgress={0}
          />
        );
    }
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
        // If we have content from Auth-to-Player flow, use it
        if (playerContent) {
          return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
              <div className="w-full max-w-md">
                <PlayerCard
                  key={playerContent.id}
                  initialQuestion={playerContent}
                  onAnswerSelected={async (answer) => {
                    console.log('Answer selected:', answer);
                    
                    // Process the answer and get next question
                    try {
                      const result = await engineOrchestrator.processUserResponse(
                        userSession.user?.id || 'default-user',
                        answer.questionId,
                        answer.selectedAnswer,
                        answer.responseTime
                      );
                      
                      if (result.nextQuestion) {
                        // Update the current question with the next question
                        setPlayerContent(result.nextQuestion);
                        console.log('Next question loaded:', result.nextQuestion);
                      } else {
                        // Generate a new question if none provided
                        const nextQuestion = await engineOrchestrator.generateQuestion(userSession.user?.id || 'default-user');
                        setPlayerContent(nextQuestion);
                        console.log('New question generated:', nextQuestion);
                      }
                    } catch (error) {
                      console.error('Failed to get next question:', error);
                      // Fallback - generate a new question
                      try {
                        const fallbackQuestion = await engineOrchestrator.generateQuestion(userSession.user?.id || 'default-user');
                        setPlayerContent(fallbackQuestion);
                      } catch (fallbackError) {
                        console.error('Fallback question generation failed:', fallbackError);
                      }
                    }
                  }}
                />
              </div>
            </div>
          );
        }
        // Fallback for when accessed directly without Auth-to-Player flow
        return (
          <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
            <div className="text-white text-center">
              <h2 className="text-2xl font-bold mb-4">Learning Session</h2>
              <p>Loading learning content...</p>
            </div>
          </div>
        );
      
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

  // Phase 3: Main Application (after loading and choices complete)
  return mainAppContent;
};

// Main App Component with UserSession Provider
const App: React.FC = () => {
  return (
    <UserSessionProvider>
      <AppContent />
      <BuildBadge />
    </UserSessionProvider>
  );
};

export default App;