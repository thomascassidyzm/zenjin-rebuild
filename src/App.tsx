// src/App.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import PlayerCard, { PlayerCardHandle } from './components/PlayerCard/PlayerCard';
import { ProjectStatusDashboard } from './components/ProjectStatusDashboard';
import LaunchInterface from './components/LaunchInterface';
import LoadingInterface from './components/LoadingInterface';
import UnifiedAuthForm, { AuthMode } from './components/UnifiedAuthForm';
import { AuthenticatedUserContext, AnonymousUserContext } from './interfaces/AuthToPlayerInterface';
import { authenticationFlowService } from './services/AuthenticationFlowService';
import MathLoadingAnimation from './components/MathLoadingAnimation';
import { UserAuthChoice } from './interfaces/LaunchInterfaceInterface';
import { LoadingContext } from './interfaces/LoadingInterfaceInterface';
import { getServiceContainer } from './services/ServiceContainer';
import { DashboardData } from './components/Dashboard/DashboardTypes';
import { Question } from './interfaces/PlayerCardInterface';
import { ConnectivityManager } from './engines/ConnectivityManager';
import { UserSessionProvider, useUserSession } from './contexts/UserSessionContext';
import AdminEntryPoint from './components/AdminEntryPoint';
import AdminRouter from './components/Admin/AdminRouter';
import BuildBadge from './components/BuildBadge';
import SubscriptionUpgrade from './components/SubscriptionUpgrade';
import SubscriptionManagement from './components/SubscriptionManagement';
import SubscriptionSuccess from './components/SubscriptionSuccess';
import SubscriptionCancelled from './components/SubscriptionCancelled';
import ContentGatingPrompt from './components/ContentGatingPrompt';
import OfflineContentManager from './components/OfflineContentManager';
import UserSettings from './components/UserSettings';
import { contentGatingEngine } from './engines/ContentGatingEngine';
import { initializeServiceContainer, isServiceContainerInitialized, getService } from './services/AppServiceContainer';
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
      iconUrl: "", // Removed placeholder URL - icons should be handled by UI components
      pointsAwarded: 500
    }
  ],
  subscriptionType: "Free",
  username: "TestUser",
  lastSessionDate: "2025-05-22T09:00:00Z",
  streakDays: 7
};

// Generate questions for current stitch in learning path using APML-compliant service
const generateQuestionsForStitch = async (learningPathId: string, userId: string = 'default-user'): Promise<Question[]> => {
  try {
    console.log(`Generating questions for learning path: ${learningPathId}, user: ${userId}`);
    
    // Get LearningEngineService following APML context boundaries
    const learningEngineService = getService<any>('LearningEngineService');
    
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
      distractor: (q.distractors && q.distractors[0]) || 'Unknown',
      boundaryLevel: q.boundaryLevel || 1,
      factId: q.factId || 'unknown',
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
  userSession?: any;
  onAdminClick?: () => void;
  inActiveSession?: boolean;
}> = ({ currentPage, onNavigate, isOnline, connectionType, backendConnected = false, userSession, onAdminClick, inActiveSession = false }) => {
  return (
    <header className="bg-gray-900 shadow-lg border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
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
            
            <nav className="flex space-x-2 sm:space-x-3">
            {[
              { id: 'dashboard', icon: '⚏', label: 'Dashboard', title: 'Dashboard' },
              { id: 'session', icon: '▶', label: 'Play', title: inActiveSession ? 'Playing Session' : 'Start Learning' },
              { id: 'project-status', icon: '📊', label: 'Status', title: 'Project Status' },
              { id: 'settings', icon: '⚙', label: 'Settings', title: 'User Settings' }
            ].map((item) => {
              const isDisabled = inActiveSession && item.id === 'session';
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  title={item.title}
                  disabled={isDisabled}
                  className={`px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center space-x-1 sm:space-x-2 ${
                    currentPage === item.id
                      ? 'bg-indigo-600 text-white'
                      : isDisabled
                      ? 'text-gray-500 cursor-not-allowed'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="hidden sm:inline text-sm">{item.label}</span>
                </button>
              );
            })}
            
            {/* Admin Entry Point - conditionally rendered based on admin status */}
            {userSession && onAdminClick && (
              <AdminEntryPoint
                userSession={userSession}
                onAdminClick={onAdminClick}
                position="header"
              />
            )}
            
            {/* TEMPORARY: Dev Admin Access - Remove after testing */}
            <button
              onClick={onAdminClick}
              className="px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center space-x-1 sm:space-x-2 text-yellow-400 hover:text-yellow-300 hover:bg-gray-800"
              title="Dev Admin Access (Temporary)"
            >
              <span className="text-lg">🛠️</span>
              <span className="hidden sm:inline text-sm">Dev Admin</span>
            </button>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

// Learning Session Component using AuthToPlayerEventBus content
interface LearningSessionProps {
  initialQuestionFromBus?: Question;
  sessionIdFromBus?: string;
  sessionDataFromBus?: any; // Full session data with all questions
  isExiting?: boolean; // Whether the session is exiting
  onSessionSummaryShown?: () => void; // Callback when session summary is shown
}

const LearningSession: React.FC<LearningSessionProps> = ({ 
  initialQuestionFromBus, 
  sessionIdFromBus, 
  sessionDataFromBus,
  isExiting = false,
  onSessionSummaryShown
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionScore, setSessionScore] = useState({ correct: 0, total: 0 });
  const [sessionComplete, setSessionComplete] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  const [hasInitialized, setHasInitialized] = useState(false);

  // Handle session summary notification for exit flow (must be at top level)
  useEffect(() => {
    if (sessionComplete && isExiting && onSessionSummaryShown) {
      // Call the callback after a brief delay to ensure UI is rendered
      const timer = setTimeout(() => {
        onSessionSummaryShown();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [sessionComplete, isExiting, onSessionSummaryShown]);
  
  // Ref to PlayerCard for imperative control
  const playerCardRef = useRef<PlayerCardHandle>(null);
  
  // Proper game mechanics state
  const [ftcPoints, setFtcPoints] = useState(0); // First Time Correct points (3 per question)
  const [ecPoints, setEcPoints] = useState(0);   // Eventually Correct points
  const [totalPoints, setTotalPoints] = useState(0);
  const [questionQueue, setQuestionQueue] = useState<Question[]>([]); // Queue for repeated questions
  const [correctAnswers, setCorrectAnswers] = useState(new Set<string>()); // Track correctly answered questions
  
  // Backend integration via UserSession context
  const { state: sessionState, recordSessionMetrics } = useUserSession();
  const userId = sessionState.user?.id || sessionState.user?.anonymousId || 'anon_' + Date.now();
  
  // Handle session exit request
  useEffect(() => {
    if (isExiting && !sessionComplete) {
      // Trigger session completion
      setSessionComplete(true);
    }
  }, [isExiting, sessionComplete]);

  // Initialize session using APML-compliant service architecture
  useEffect(() => {
    // Prevent re-initialization on every render
    if (hasInitialized) return;
    
    const initializeSession = async () => {
      console.log('🔍 DEBUG: initializeSession called with:', {
        hasSessionData: !!sessionDataFromBus,
        initialQuestionsLength: sessionDataFromBus?.initialQuestions?.length,
        firstQuestion: sessionDataFromBus?.initialQuestions?.[0]
      });
      
      if (sessionDataFromBus && sessionDataFromBus.initialQuestions && sessionDataFromBus.initialQuestions.length > 0) {
        // Initialize from full session data with all questions
        const allQuestions = sessionDataFromBus.initialQuestions.map((q: any) => ({
          id: q.id,
          text: q.questionText, // LearningEngineService uses questionText
          correctAnswer: q.correctAnswer,
          distractor: (q.distractors && q.distractors[0]) || q.distractor || 'Unknown', // Take first distractor or fallback
          boundaryLevel: q.metadata?.boundaryLevel || q.boundaryLevel || 1,
          factId: q.metadata?.factId || q.factId || 'unknown',
          metadata: {
            factId: q.metadata?.factId || q.factId || 'unknown',
            boundaryLevel: q.metadata?.boundaryLevel || q.boundaryLevel || 1,
            sessionId: sessionDataFromBus.sessionId || sessionIdFromBus,
            ...q.metadata
          }
        }));
        
        setQuestions(allQuestions);
        setSessionId(sessionDataFromBus.sessionId || sessionIdFromBus || `session_${Date.now()}`);
        setCurrentQuestionIndex(0);
        setSessionScore({ correct: 0, total: 0 });
        setSessionComplete(false);
        setSessionStartTime(Date.now());
        setHasInitialized(true);
        // Reset game mechanics state for new session
        setFtcPoints(0);
        setEcPoints(0);
        setTotalPoints(0);
        setQuestionQueue([]);
        setCorrectAnswers(new Set());
        console.log(`LearningSession initialized from bus with full session data: ${allQuestions.length} questions`);
        console.log('First question:', allQuestions[0]);
        console.log('Questions set in state');
        
        // Verify questions were set properly
        if (allQuestions.length === 0) {
          console.error('❌ No questions were converted from session data');
        } else {
          console.log('✅ First question:', allQuestions[0]);
        }
      } else {
        // APML Violation: Insufficient data provided by event bus
        console.error('❌ APML Violation: Event bus must provide full session data - no fallbacks allowed');
        throw new Error('APML architecture failure: AuthToPlayerEventBus must provide complete session data');
      }
    };
    
    initializeSession();
  }, [userId, initialQuestionFromBus, sessionIdFromBus, sessionDataFromBus, hasInitialized]);

  const currentQuestion = questions[currentQuestionIndex];
  
  // Debug logging for questions state changes
  useEffect(() => {
    console.log('🔍 Questions state updated:', {
      questionsLength: questions.length,
      currentQuestionIndex,
      hasCurrentQuestion: !!currentQuestion,
      currentQuestionId: currentQuestion?.id,
      firstQuestionId: questions[0]?.id
    });
  }, [questions, currentQuestionIndex]);
  
  // Present question when it changes (APML proper flow)
  useEffect(() => {
    if (currentQuestion && playerCardRef.current) {
      console.log('📝 Presenting question to PlayerCard:', currentQuestion.id);
      const presented = playerCardRef.current.presentQuestion(currentQuestion);
      if (!presented) {
        console.error('❌ Failed to present question');
      }
    }
  }, [currentQuestion]);

  const handleAnswerSelected = async (response: any) => {
    const currentQ = questions[currentQuestionIndex];
    
    if (response.isCorrect) {
      // Mark question as correctly answered
      setCorrectAnswers(prev => new Set(prev).add(currentQ.id));
      
      // Award points based on first attempt or not
      if (response.isFirstAttempt) {
        setFtcPoints(prev => prev + 3); // 3 points for first-time correct
        setTotalPoints(prev => prev + 3);
      } else {
        setEcPoints(prev => prev + 1); // 1 point for eventually correct
        setTotalPoints(prev => prev + 1);
      }
      
      // Update score tracking
      const newScore = {
        correct: sessionScore.correct + 1,
        total: sessionScore.total + 1
      };
      setSessionScore(newScore);
    } else {
      // Wrong answer - add question back to queue for repetition
      setQuestionQueue(prev => [...prev, currentQ]);
      
      // Still increment total attempts
      const newScore = {
        correct: sessionScore.correct,
        total: sessionScore.total + 1
      };
      setSessionScore(newScore);
    }

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
        
        const learningEngineService = getService<any>('LearningEngineService');
        const responseResult = await learningEngineService.processUserResponse(
          currentQuestion.metadata.sessionId,
          currentQuestion.id,
          userResponse
        );
        
        console.log(`Response processed: ${responseResult.feedback.isCorrect ? 'correct' : 'incorrect'}`);
        console.log(`Encouragement: ${responseResult.feedback.encouragement}`);
        
        // Don't add questions during session - just use the pre-loaded 20 questions
      } catch (error) {
        console.error('Failed to process response through LearningEngineService:', error);
      }
    }

    // Question progression logic - simplified
    if (response.isCorrect) {
      // Correct answer: Move to next question after brief pause
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
          // Session complete - all questions attempted
          console.log('Session complete - all questions attempted');
          handleSessionCompletion({
            correct: correctAnswers.size,
            total: sessionScore.total
          });
        }
      }, 1500);
    }
    // For incorrect answers: question is automatically re-presented by PlayerCard
  };

  const handleSessionCompletion = async (finalScore: { correct: number; total: number }) => {
    try {
      const completionTime = Date.now() - sessionStartTime;
      
      // Record session metrics to backend
      const sessionMetrics = {
        sessionId: sessionId || `session_${Date.now()}`,
        correctAnswers: finalScore.correct,
        totalQuestions: finalScore.total,
        completionTime,
        learningPath: 'addition',
        timestamp: new Date().toISOString()
      };
      
      await recordSessionMetrics(sessionMetrics);
      console.log('✅ Session metrics recorded to backend');
      
      // APML: Complete stitch (rotation is handled by LearningEngineService)
      const { EngineOrchestrator } = await import('./engines/EngineOrchestrator');
      const orchestrator = new EngineOrchestrator();
      
      // Complete current stitch
      const currentStitchId = questions[0]?.metadata?.stitchId || 't1-0001-0001';
      await orchestrator.completeStitch(userId, currentStitchId, {
        score: finalScore,
        completionTime
      });
      
      // Note: Tube rotation is handled automatically by LearningEngineService
      // when processLearningResponse detects session completion
      
    } catch (error) {
      console.error('Failed to handle session completion:', error);
    }
  };

  const resetSession = async () => {
    // Load the next stitch (tubes already rotated in handleSessionCompletion)
    try {
      const { EngineOrchestrator } = await import('./engines/EngineOrchestrator');
      const orchestrator = new EngineOrchestrator();
      
      // Get next stitch content
      const nextStitch = await orchestrator.getNextStitch(userId);
      if (nextStitch && nextStitch.questions) {
        const playerQuestions = nextStitch.questions.map((q: any, index: number) => ({
          id: q.id || `stitch-q${index + 1}-${Date.now()}`,
          text: q.questionText || q.text,
          correctAnswer: q.correctAnswer,
          distractor: (q.distractors && q.distractors[0]) || q.distractor || 'Unknown',
          boundaryLevel: q.boundaryLevel || 1,
          factId: q.factId || 'unknown',
          metadata: {
            factId: q.factId,
            boundaryLevel: q.boundaryLevel,
            stitchId: nextStitch.stitchId,
            sessionId: nextStitch.sessionId || `session_${Date.now()}`
          }
        }));
        
        setQuestions(playerQuestions);
        setCurrentQuestionIndex(0);
        setSessionScore({ correct: 0, total: 0 });
        setSessionComplete(false);
        setSessionStartTime(Date.now());
        
        console.log(`Loading next stitch: ${nextStitch.stitchId}`);
      } else {
        // APML Violation: EngineOrchestrator must provide next stitch
        console.error('❌ APML Violation: EngineOrchestrator failed to provide next stitch - no fallbacks allowed');
        throw new Error('APML architecture failure: EngineOrchestrator must provide next stitch content');
      }
    } catch (error) {
      console.error('Failed to load next stitch:', error);
    }
  };

  if (sessionComplete) {
    const percentage = Math.round((sessionScore.correct / sessionScore.total) * 100);
    
    // Log session summary
    console.log('📊 Session Summary:', {
      totalQuestions: sessionScore.total,
      correctAnswers: sessionScore.correct,
      accuracy: percentage,
      sessionTime: Date.now() - sessionStartTime,
      ftcPoints,
      ecPoints,
      totalPoints,
    });
    
    
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">✓</span>
          </div>
          <h2 className="text-white text-2xl font-bold mb-2">Session Complete!</h2>
          <p className="text-gray-300 text-lg mb-4">
            You scored {sessionScore.correct} out of {sessionScore.total} ({percentage}%)
          </p>
          <div className="text-gray-400 text-sm space-y-1 mb-6">
            <p>FTC Points: {ftcPoints}</p>
            <p>EC Points: {ecPoints}</p>
            <p>Total Points: {totalPoints}</p>
          </div>
          <button
            onClick={resetSession}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors mb-3"
          >
            Continue Learning
          </button>
          <button
            onClick={() => {
              if (onSessionSummaryShown) {
                // If we have a callback, use it (for proper navigation)
                onSessionSummaryShown();
              } else {
                // Otherwise, reload to reset state
                window.location.reload();
              }
            }}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Player Card Container */}
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          {currentQuestion ? (
            <div className="w-full max-w-md">
              <PlayerCard
                ref={playerCardRef}
                key={currentQuestion.id}
                onAnswerSelected={handleAnswerSelected}
                points={totalPoints}
              />
            
            {/* Testing Buttons */}
            <div className="mt-4 text-center flex gap-2 justify-center">
              <button
                onClick={async () => {
                  // Simulate answering all 20 questions correctly
                  for (let i = 0; i < 20; i++) {
                    const questionId = questions[i]?.id;
                    if (questionId) {
                      setCorrectAnswers(prev => new Set(prev).add(questionId));
                    }
                  }
                  setFtcPoints(20 * 3); // 3 points per question
                  setTotalPoints(60);
                  const finalScore = { correct: 20, total: 20 };
                  setSessionScore(finalScore);
                  
                  // Handle completion to rotate tubes
                  await handleSessionCompletion(finalScore);
                  
                  // Load next stitch automatically without showing summary
                  await resetSession();
                }}
                className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-1 px-3 rounded transition-colors"
              >
                Complete Stitch 20/20
              </button>
              <button
                onClick={() => {
                  // Simulate getting current question correct
                  const response = {
                    questionId: currentQuestion.id,
                    selectedAnswer: currentQuestion.correctAnswer,
                    isCorrect: true,
                    responseTime: 2000,
                    isFirstAttempt: !correctAnswers.has(currentQuestion.id)
                  };
                  handleAnswerSelected(response);
                }}
                className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-bold py-1 px-3 rounded transition-colors"
              >
                Answer Correct
              </button>
              <button
                onClick={() => {
                  // End session and show completion screen
                  setSessionComplete(true);
                  // Don't call handleSessionCompletion to avoid tube rotation
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white text-xs font-bold py-1 px-3 rounded transition-colors"
              >
                End Session
              </button>
            </div>
          </div>
        ) : (
          <div className="text-white text-center">
            <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading questions...</p>
            <p className="text-sm text-gray-400 mt-2">
              Questions loaded: {questions.length} | Current index: {currentQuestionIndex}
            </p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

// App Content Component (needs UserSession context)
const AppContent: React.FC = () => {
  // Check URL parameters for page navigation
  const urlParams = new URLSearchParams(window.location.search);
  const pageParam = urlParams.get('page');
  const initialPage = pageParam || 'dashboard';
  
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [selectedLearningPath, setSelectedLearningPath] = useState('addition');
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState('unknown');
  const [launchComplete, setLaunchComplete] = useState(false);
  const [userAuthChoice, setUserAuthChoice] = useState<UserAuthChoice | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [contentGatingPrompt, setContentGatingPrompt] = useState<{
    type: 'stitch_limit' | 'offline_request' | 'advanced_feature';
    context: any;
  } | null>(null);

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

  // Simplified session state
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);

  // Initialize service container on app start
  const [containerInitialized, setContainerInitialized] = useState(false);
  const [containerError, setContainerError] = useState<Error | null>(null);

  useEffect(() => {
    // Initialize APML-compliant service architecture
    if (!isServiceContainerInitialized()) {
      initializeServiceContainer()
        .then(() => {
          console.log('✅ APML-compliant service architecture initialized successfully');
          console.log('📦 Multiple FactRepository instances created per APML Context Boundary Principle');
          setContainerInitialized(true);
        })
        .catch((error) => {
          console.error('❌ Failed to initialize APML service architecture:', error);
          setContainerError(error);
        });
    } else {
      setContainerInitialized(true);
    }
  }, []);

  // Start learning session directly
  const handleStartLearning = useCallback(async (learningPathId: string = 'addition') => {
    try {
      const userId = sessionState.user?.id || sessionState.user?.anonymousId || 'anon_' + Date.now();
      const questions = await generateQuestionsForStitch(learningPathId, userId);
      
      if (questions.length > 0) {
        setSessionData({
          sessionId: `session_${Date.now()}`,
          initialQuestions: questions,
          learningPathId
        });
        setSessionActive(true);
        setCurrentPage('session');
      }
    } catch (error) {
      console.error('Failed to start learning session:', error);
    }
  }, [sessionState.user]);


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
    // If we're in an active session, end it and navigate
    if (sessionActive && page !== 'session') {
      console.log('🚪 Ending session to navigate to:', page);
      setSessionActive(false);
      setSessionData(null);
    }
    
    // Handle Play button - start learning directly
    if (page === 'session') {
      console.log('🎮 Play button clicked - starting learning session');
      handleStartLearning();
      return;
    }
    
    // Normal navigation
    setCurrentPage(page);
  };
  
  const handleAdminClick = () => {
    console.log('🔧 Admin access requested');
    setCurrentPage('admin');
  };

  const handleStartSession = (pathId: string) => {
    setSelectedLearningPath(pathId);
    handleStartLearning(pathId);
  };


  // Handle user authentication choice - simplified
  const handleAuthChoice = async (choice: UserAuthChoice): Promise<void> => {
    setUserAuthChoice(choice);
    
    try {
      switch (choice) {
        case UserAuthChoice.ANONYMOUS:
          // Create anonymous user and go directly to dashboard
          await createAnonymousUser();
          console.log('✅ Anonymous user created, going to dashboard');
          break;
        case UserAuthChoice.SIGN_IN:
        case UserAuthChoice.SIGN_UP:
          // Sign in/up flow will be handled by UnifiedAuthForm
          console.log(`${choice} flow initiated`);
          break;
      }
    } catch (error) {
      console.error('Auth choice failed:', error);
      throw error;
    }
  };

  // Check if service container is still initializing
  if (!containerInitialized) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Initializing services...</p>
          {containerError && (
            <p className="text-red-400 mt-2">Error: {containerError.message}</p>
          )}
        </div>
      </div>
    );
  }

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
          // Handle authentication completion with guaranteed user data (now with admin detection)
          await authenticationFlowService.onAuthenticationComplete(result, 'OTP');
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
          // Handle authentication completion with guaranteed user data (now with admin detection)
          await authenticationFlowService.onAuthenticationComplete(result, 'PASSWORD');
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


  // Determine online status - needed for NavigationHeader
  const backendStatus = getBackendStatus();
  const hasBackendConnection = backendStatus.api || sessionState.isAuthenticated;
  const backendIsWorking = sessionState.isAuthenticated || hasBackendConnection;
  const effectiveOnlineStatus = isOnline || backendIsWorking;

  // Phase 4: Simplified flow - authenticated users go directly to dashboard
  const shouldShowMainApp = sessionState.isAuthenticated || userAuthChoice === UserAuthChoice.ANONYMOUS;

  const handleUpgradeClick = () => {
    setShowUpgradeModal(true);
  };

  const handleContentGatingError = async (error: any, userId: string) => {
    if (error.code === 'LE-GATE-001') {
      // Content gating error - show appropriate prompt
      const context = await contentGatingEngine.getUpgradePromptContext(
        userId, 
        'stitch_limit'
      );
      
      setContentGatingPrompt({
        type: 'stitch_limit',
        context
      });
    }
  };

  const handleContinueFree = async () => {
    // Close the prompt and continue with free variant
    setContentGatingPrompt(null);
    // The LearningEngineService will automatically provide the free alternative
    setCurrentPage('session');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            initialData={mockDashboardData}
            onStartSessionClicked={handleStartSession}
            onUpgradeClicked={handleUpgradeClick}
          />
        );
      
      case 'session':
        // Render learning session if we have session data
        if (sessionActive && sessionData) {
          return (
            <LearningSession 
              sessionDataFromBus={sessionData}
              onSessionSummaryShown={() => {
                setSessionActive(false);
                setSessionData(null);
                setCurrentPage('dashboard');
              }}
            />
          );
        } else {
          // No session data, redirect to dashboard
          setCurrentPage('dashboard');
          return null;
        }
      
      case 'project-status':
        return <ProjectStatusDashboard />;
      
      case 'admin':
        return <AdminRouter />;
      
      case 'subscription-management':
        return (
          <SubscriptionManagement
            onUpgradeClicked={handleUpgradeClick}
            onBack={() => setCurrentPage('dashboard')}
          />
        );
      
      case 'subscription-success':
        return (
          <SubscriptionSuccess
            onContinue={() => {
              setCurrentPage('dashboard');
              initializeSession();
            }}
          />
        );
      
      case 'subscription-cancelled':
        return (
          <SubscriptionCancelled
            onGoBack={() => setCurrentPage('dashboard')}
            onTryAgain={handleUpgradeClick}
          />
        );
      
      case 'offline-content':
        return (
          <div className="min-h-screen bg-gray-950 text-white p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="text-gray-400 hover:text-white mb-6 inline-flex items-center"
              >
                ← Back to Dashboard
              </button>
              <OfflineContentManager onUpgradeRequired={handleUpgradeClick} />
            </div>
          </div>
        );
      
      case 'settings':
        return (
          <div className="min-h-screen bg-gray-950 text-white p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
              <UserSettings onClose={() => setCurrentPage('dashboard')} />
            </div>
          </div>
        );
      
      case 'math-engine-demo':
        return (
          <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <MathEngineStartup
              userName={sessionState.user?.full_name || sessionState.user?.email || "Player"}
              userAvatar={sessionState.user?.avatar_url}
              onComplete={() => {
                console.log('Animation complete!');
                setCurrentPage('dashboard');
              }}
            />
          </div>
        );
      
      default:
        return <Navigate to="/dashboard" replace />;
    }
  };


  // Phase 5: Main Application - simplified
  if (!shouldShowMainApp) {
    return null; // Still in authentication phase
  }
  
  return (
    <div className="min-h-screen bg-gray-950">
      <NavigationHeader 
        currentPage={currentPage} 
        onNavigate={handleNavigate}
        isOnline={effectiveOnlineStatus}
        connectionType={connectionType}
        backendConnected={hasBackendConnection}
        userSession={sessionState}
        onAdminClick={handleAdminClick}
        inActiveSession={sessionActive}
      />
      {renderCurrentPage()}
      
      {/* Subscription Upgrade Modal */}
      {showUpgradeModal && (
        <SubscriptionUpgrade
          isModal={true}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}
      
      {/* Content Gating Prompt */}
      {contentGatingPrompt && (
        <ContentGatingPrompt
          type={contentGatingPrompt.type}
          context={contentGatingPrompt.context}
          onUpgrade={() => {
            setContentGatingPrompt(null);
            handleUpgradeClick();
          }}
          onContinueFree={contentGatingPrompt.type === 'stitch_limit' ? handleContinueFree : undefined}
          onDismiss={() => setContentGatingPrompt(null)}
        />
      )}
    </div>
  );
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