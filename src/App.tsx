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
import PreEngagementCard from './components/PreEngagementCard';
import MathLoadingAnimation from './components/MathLoadingAnimation';
import { UserAuthChoice } from './interfaces/LaunchInterfaceInterface';
import { LoadingContext } from './interfaces/LoadingInterfaceInterface';
import { learningEngineService } from './services/LearningEngineService';
import { DashboardData } from './components/Dashboard/DashboardTypes';
import { Question } from './interfaces/PlayerCardInterface';
import { ConnectivityManager } from './engines/ConnectivityManager';
import { UserSessionProvider, useUserSession } from './contexts/UserSessionContext';
import { authToPlayerEventBus, AuthToPlayerState } from './services/AuthToPlayerEventBus';
import AdminEntryPoint from './components/AdminEntryPoint';
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
}> = ({ currentPage, onNavigate, isOnline, connectionType, backendConnected = false, userSession, onAdminClick }) => {
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
            
            {/* Admin Entry Point - conditionally rendered based on admin status */}
            {userSession && onAdminClick && (
              <AdminEntryPoint
                userSession={userSession}
                onAdminClick={onAdminClick}
                position="header"
              />
            )}
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
}

const LearningSession: React.FC<LearningSessionProps> = ({ initialQuestionFromBus, sessionIdFromBus, sessionDataFromBus }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionScore, setSessionScore] = useState({ correct: 0, total: 0 });
  const [sessionComplete, setSessionComplete] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  const [hasInitialized, setHasInitialized] = useState(false);
  
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

  // Initialize session using LearningEngineService with proper user ID
  useEffect(() => {
    // Prevent re-initialization on every render
    if (hasInitialized) return;
    
    const initializeSession = async () => {
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
      } else if (initialQuestionFromBus && sessionIdFromBus) {
        // Fallback: Initialize from single question - ensure it matches Question interface
        const fixedQuestion = {
          ...initialQuestionFromBus,
          distractor: initialQuestionFromBus.distractor || 'Unknown',
          boundaryLevel: initialQuestionFromBus.boundaryLevel || 1,
          factId: initialQuestionFromBus.factId || 'unknown'
        };
        setQuestions([fixedQuestion]);
        setSessionId(sessionIdFromBus);
        setCurrentQuestionIndex(0);
        setSessionScore({ correct: 0, total: 0 });
        setSessionComplete(false);
        setSessionStartTime(Date.now());
        setHasInitialized(true);
        console.log(`LearningSession initialized from bus: ${sessionIdFromBus} with 1 question`);
      } else {
        // Initialize by fetching new questions
        try {
          // Use tube-based system (defaults to tube1 = doubling/halving)
          const sessionResult = await learningEngineService.initializeLearningSession(
            userId,
            'addition', // Maps to tube1 in the service
            { maxQuestions: 20 }
          );
          
          setSessionId(sessionResult.sessionId);
          
          // Convert to PlayerCard format
          const playerQuestions = sessionResult.initialQuestions.map(q => ({
            id: q.id,
            text: q.questionText,
            correctAnswer: q.correctAnswer,
            distractor: (q.distractors && q.distractors[0]) || 'Unknown',
            boundaryLevel: q.boundaryLevel || 1,
            factId: q.factId || 'unknown',
            metadata: {
              factId: q.factId,
              boundaryLevel: q.boundaryLevel,
              sessionId: sessionResult.sessionId
            }
          }));
          
          setQuestions(playerQuestions);
          setCurrentQuestionIndex(0);
          setSessionScore({ correct: 0, total: 0 });
          setSessionComplete(false);
          setSessionStartTime(Date.now());
          
          console.log(`LearningEngineService session initialized: ${sessionResult.sessionId} with ${playerQuestions.length} questions`);
          setHasInitialized(true);
        } catch (error) {
          console.error('Failed to initialize learning session:', error);
        }
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
            distractor: (responseResult.nextQuestion.distractors && responseResult.nextQuestion.distractors[0]) || 'Unknown',
            boundaryLevel: responseResult.nextQuestion.boundaryLevel || 1,
            factId: responseResult.nextQuestion.factId || 'unknown',
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

    // Only move to next question if answer was correct
    if (response.isCorrect) {
      setTimeout(async () => {
        // Check if there are repeated questions in the queue first
        if (questionQueue.length > 0) {
          // Take the first question from the queue
          const nextQuestion = questionQueue[0];
          setQuestionQueue(prev => prev.slice(1));
          
          // Replace current question with the queued one
          const newQuestions = [...questions];
          newQuestions[currentQuestionIndex] = nextQuestion;
          setQuestions(newQuestions);
        } else if (currentQuestionIndex < questions.length - 1) {
          // Move to next question in sequence
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else if (correctAnswers.size >= 20) {
          // Stitch complete (all 20 questions answered correctly)
          console.log('Stitch complete with all 20 questions answered correctly!');
        
        // Complete current stitch and rotate tubes
        await handleSessionCompletion({
          correct: correctAnswers.size,
          total: sessionScore.total
        });
        
        // Load next stitch questions without showing completion screen
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
                sessionId: nextStitch.sessionId || sessionId
              }
            }));
            
            // Seamlessly continue with new questions
            setQuestions(playerQuestions);
            setCurrentQuestionIndex(0);
            setQuestionQueue([]); // Clear queue for new stitch
            setCorrectAnswers(new Set()); // Reset correct answers for new stitch
            
            console.log(`Seamlessly transitioned to next stitch: ${nextStitch.stitchId}`);
          }
        } catch (error) {
          console.error('Failed to load next stitch:', error);
        }
        }
      }, 1500);
    }
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
      
      // APML: Automatically complete stitch and rotate tubes
      const { EngineOrchestrator } = await import('./engines/EngineOrchestrator');
      const orchestrator = new EngineOrchestrator();
      
      // Complete current stitch
      const currentStitchId = questions[0]?.metadata?.stitchId || 't1-0001-0001';
      await orchestrator.completeStitch(userId, currentStitchId, {
        score: finalScore,
        completionTime
      });
      
      // Rotate tubes automatically
      await orchestrator.rotateTubes(userId);
      console.log('🔄 Tubes rotated automatically after stitch completion');
      
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
        // Fallback: Start new session
        const sessionResult = await learningEngineService.initializeLearningSession(
          userId,
          'addition',
          { maxQuestions: 20 }
        );
        
        setSessionId(sessionResult.sessionId);
        
        const playerQuestions = sessionResult.initialQuestions.map(q => ({
          id: q.id,
          text: q.questionText,
          correctAnswer: q.correctAnswer,
          distractor: (q.distractors && q.distractors[0]) || 'Unknown',
          boundaryLevel: q.boundaryLevel || 1,
          factId: q.factId || 'unknown',
          metadata: {
            factId: q.factId,
            boundaryLevel: q.boundaryLevel,
            sessionId: sessionResult.sessionId
          }
        }));
        
        setQuestions(playerQuestions);
        setCurrentQuestionIndex(0);
        setSessionScore({ correct: 0, total: 0 });
        setSessionComplete(false);
        setSessionStartTime(Date.now());
        
        console.log(`New session started: ${sessionResult.sessionId}`);
      }
    } catch (error) {
      console.error('Failed to load next stitch:', error);
    }
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
              // Reset auth-to-player state to allow new sessions
              window.location.reload(); // Simple reload to reset state
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
    <div className="flex flex-col flex-1">
      {/* Player Card */}
      <div className="flex-1 flex items-center justify-center p-4">
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
                onClick={() => {
                  // Simulate answering all 20 questions correctly
                  for (let i = 0; i < 20; i++) {
                    const questionId = questions[i]?.id;
                    if (questionId) {
                      setCorrectAnswers(prev => new Set(prev).add(questionId));
                    }
                  }
                  setFtcPoints(20 * 3); // 3 points per question
                  setTotalPoints(60);
                  setSessionScore({ correct: 20, total: 20 });
                  setSessionComplete(true);
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
  const [sessionData, setSessionData] = useState<any>(null);

  // Stable callbacks to prevent unnecessary re-renders
  const handleAnimationComplete = useCallback(async () => {
    authToPlayerEventBus.animationCompleted();
  }, []);

  const handlePlayButtonClicked = useCallback(async () => {
    authToPlayerEventBus.playButtonClicked();
  }, []);

  // Handle Auth-to-Player flow events
  useEffect(() => {
    // Listen for state changes
    const unsubscribeState = authToPlayerEventBus.on('state:changed', ({ to }) => {
      setAuthToPlayerState(to);
    });

    // Listen for player ready event - use Auth-to-Player flow
    const unsubscribePlayer = authToPlayerEventBus.on('player:ready', (data) => {
      console.log('🎮 Auth-to-Player flow complete, transitioning to ACTIVE_LEARNING');
      console.log('🎮 Player content received:', data.content);
      console.log('🎮 Session data received:', data.sessionData);
      setPlayerContent(data.content);
      setSessionData(data.sessionData); // Store session data if needed
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
    // This should only be called from dashboard for authenticated users who want to start a new session
    // Anonymous users go directly to PreEngagement, authenticated users would already be past this
    handlePlayButtonClicked();
  };

  // Handle admin interface access
  const handleAdminClick = useCallback(() => {
    console.log('🔧 Admin interface access requested');
    // TODO: Implement admin interface navigation
    // For now, just log that admin access was requested
    alert('Admin interface coming soon! Admin status detected.');
  }, []);

  // Handle user authentication choice
  const handleAuthChoice = async (choice: UserAuthChoice): Promise<void> => {
    setUserAuthChoice(choice);
    
    try {
      switch (choice) {
        case UserAuthChoice.ANONYMOUS:
          // Go directly to PreEngagement (big play button) as designed
          const anonymousUserContext: AnonymousUserContext = {
            userType: 'anonymous',
            userId: 'pending-creation', // Will be created when play button clicked
            userName: 'Guest'
          };
          
          console.log('✅ Starting Auth-to-Player flow for anonymous user to PreEngagement');
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
  console.log('🐛 Phase 1 check - userAuthChoice:', userAuthChoice);
  if (!userAuthChoice) {
    return (
      <LaunchInterface
        onAuthChoiceSelected={handleAuthChoice}
        onInterfaceComplete={() => setLaunchComplete(true)}
      />
    );
  }

  // Phase 2: Authentication Forms (for Sign In/Sign Up choices)
  console.log('🐛 Phase 2 check - sign in/up flow conditions:', {
    isSignInOrUp: userAuthChoice === UserAuthChoice.SIGN_IN || userAuthChoice === UserAuthChoice.SIGN_UP,
    notAuthenticated: !sessionState.isAuthenticated,
    notLoading: !sessionState.isLoading
  });
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
  console.log('🐛 Phase 3 check - loading conditions:', {
    isLoading: sessionState.isLoading,
    notAuthenticated: !sessionState.isAuthenticated,
    notAnonymous: userAuthChoice !== UserAuthChoice.ANONYMOUS
  });
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

  // Phase 4: Auth-to-Player Flow (after authentication success OR anonymous pending)
  console.log('🐛 DEBUG Auth-to-Player conditions:', {
    isAuthenticated: sessionState.isAuthenticated,
    userAuthChoice: userAuthChoice,
    authToPlayerState: authToPlayerState,
    condition: sessionState.isAuthenticated || userAuthChoice === UserAuthChoice.ANONYMOUS
  });
  
  const shouldShowAuthToPlayerFlow = sessionState.isAuthenticated || userAuthChoice === UserAuthChoice.ANONYMOUS;
  console.log('🐛 Auth-to-Player flow decision:', {
    shouldShow: shouldShowAuthToPlayerFlow,
    isAuthenticated: sessionState.isAuthenticated,
    userAuthChoice: userAuthChoice,
    authToPlayerState: authToPlayerState
  });
  
  // Store Auth-to-Player content for integration into main app
  let authToPlayerContent = null;
  
  if (shouldShowAuthToPlayerFlow) {
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
        authToPlayerContent = (
          <PreEngagementCard
            userContext={userContext}
            onPlayClicked={handlePlayButtonClicked}
            isLoading={false}
            loadingProgress={0}
          />
        );
        break;
      
      case 'LOADING_WITH_ANIMATION':
        authToPlayerContent = (
          <MathLoadingAnimation
            onAnimationComplete={handleAnimationComplete}
            loadingProgress={0}
            duration={3000}
          />
        );
        break;
      
      case 'ACTIVE_LEARNING':
        if (!playerContent) {
          authToPlayerContent = (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>Loading content...</p>
              </div>
            </div>
          );
        } else {
          // Convert AuthToPlayerEventBus content to PlayerCard Question format
          const playerQuestion: Question = {
            id: playerContent.id,
            text: playerContent.text,
            correctAnswer: playerContent.correctAnswer,
            distractor: playerContent.distractor, // This should be a string array
            boundaryLevel: playerContent.metadata?.boundaryLevel || 1, // Keep top-level for PlayerCard
            factId: playerContent.metadata?.factId || 'unknown',     // Keep top-level for PlayerCard
            metadata: { // Ensure this metadata object exists for LearningSession's sessionIdFromBus prop
              sessionId: playerContent.metadata?.sessionId,
              factId: playerContent.metadata?.factId || 'unknown', // Can also be here
              boundaryLevel: playerContent.metadata?.boundaryLevel || 1, // Can also be here
              // Spread other potential custom metadata from playerContent
              ...(playerContent.metadata || {})
            }
          };

          authToPlayerContent = (
            <LearningSession 
              initialQuestionFromBus={playerQuestion} 
              sessionIdFromBus={playerQuestion.metadata?.sessionId}
              sessionDataFromBus={sessionData}
            />
          );
        }
        break;
      
      default:
        // AUTH_SUCCESS state - immediately show PRE_ENGAGEMENT (no loading screen)
        authToPlayerContent = (
          <PreEngagementCard
            userContext={userContext}
            onPlayClicked={handlePlayButtonClicked}
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
      
      case 'project-status':
        return <ProjectStatusDashboard />;
      
      default:
        return <Navigate to="/dashboard" replace />;
    }
  };


  // Main app content with smooth launch transition
  console.log('🐛 DEBUG Rendering mainAppContent with currentPage:', currentPage);
  
  // Determine what content to show
  const contentToRender = authToPlayerContent || renderCurrentPage();
  
  // For full-screen states (PRE_ENGAGEMENT, LOADING_WITH_ANIMATION), return content directly
  if (authToPlayerContent && (authToPlayerState === 'PRE_ENGAGEMENT' || authToPlayerState === 'LOADING_WITH_ANIMATION')) {
    return authToPlayerContent;
  }
  
  // For other states, wrap in main app layout with navigation
  const mainAppContent = (
    <div className="min-h-screen bg-gray-950">
      <NavigationHeader 
        currentPage={authToPlayerState === 'ACTIVE_LEARNING' ? 'learning' : currentPage} 
        onNavigate={handleNavigate}
        isOnline={effectiveOnlineStatus}
        connectionType={connectionType}
        backendConnected={hasBackendConnection}
        userSession={sessionState}
        onAdminClick={handleAdminClick}
      />
      {contentToRender}
    </div>
  );

  // Phase 5: Main Application
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