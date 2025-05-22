import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement,
  PointElement,
  RadialLinearScale,
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Radar, Doughnut } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import confetti from 'canvas-confetti';

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement,
  PointElement,
  RadialLinearScale,
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
);

// Define interface types based on the SessionSummaryInterface
export interface SessionData {
  sessionId: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  questionsAnswered: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timeouts: number;
  averageResponseTime: number;
  boundaryLevels: {
    level1: number;
    level2: number;
    level3: number;
    level4: number;
    level5: number;
  };
}

export interface MetricsData {
  ftcPoints: number;
  ecPoints: number;
  basePoints: number;
  bonusMultiplier: number;
  blinkSpeed: number;
  totalPoints: number;
  evolution: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  pointsAwarded: number;
}

export interface AchievementProgress {
  id: string;
  name: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
}

export interface AchievementData {
  newAchievements: Achievement[];
  progressAchievements: AchievementProgress[];
}

export interface PathProgress {
  name: string;
  progress: number;
  unitsCompleted: number;
  totalUnits: number;
  currentUnit: string;
}

export interface ProgressData {
  learningPaths: {
    path1: PathProgress;
    path2: PathProgress;
    path3: PathProgress;
  };
  overallProgress: number;
  nextSessionFocus: string[];
}

export interface SummaryOptions {
  showMetrics?: boolean;
  showAchievements?: boolean;
  showProgress?: boolean;
  showNextSteps?: boolean;
  animateEntrance?: boolean;
  celebrateAchievements?: boolean;
}

// ThemeManager interface (simplified for this implementation)
interface Theme {
  isDarkMode: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    success: string;
    warning: string;
    error: string;
  };
}

interface ThemeManager {
  currentTheme: Theme;
}

// FeedbackSystem interface (simplified for this implementation)
interface FeedbackSystem {
  playCelebrationAnimation: (type: string, targetElement: HTMLElement) => void;
  playSound: (soundType: string) => void;
}

// Props for the SessionSummary component
export interface SessionSummaryProps {
  sessionData: SessionData;
  metricsData: MetricsData;
  achievementData: AchievementData;
  progressData: ProgressData;
  options?: SummaryOptions;
  themeManager?: ThemeManager;
  feedbackSystem?: FeedbackSystem;
}

// Default options for the summary
const defaultOptions: SummaryOptions = {
  showMetrics: true,
  showAchievements: true,
  showProgress: true,
  showNextSteps: true,
  animateEntrance: true,
  celebrateAchievements: true,
};

// Default theme if no ThemeManager is provided
const defaultTheme: Theme = {
  isDarkMode: false,
  colors: {
    primary: '#4F46E5',
    secondary: '#10B981',
    accent: '#F59E0B',
    background: '#F3F4F6',
    surface: '#FFFFFF',
    text: '#1F2937',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
};

/**
 * SessionSummary Component
 * 
 * Displays a comprehensive summary of the user's learning session with metrics,
 * achievements, and progress in an engaging and motivational format suitable
 * for school-aged children (6+ years old).
 */
export const SessionSummary: React.FC<SessionSummaryProps> = ({
  sessionData,
  metricsData,
  achievementData,
  progressData,
  options = defaultOptions,
  themeManager,
  feedbackSystem,
}) => {
  // Generate a unique ID for this summary instance
  const [summaryId] = useState(`summary-${Date.now()}-${Math.floor(Math.random() * 1000)}`);
  
  // Merge provided options with defaults
  const mergedOptions = { ...defaultOptions, ...options };

  // Get current theme
  const theme = themeManager?.currentTheme || defaultTheme;
  
  // Refs for various sections (used for scroll animations and celebrations)
  const summaryRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const achievementsRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  
  // State for tracking which achievements have been celebrated
  const [celebratedAchievements, setCelebratedAchievements] = useState<string[]>([]);
  
  // State for tracking if the summary is visible
  const [isVisible, setIsVisible] = useState(mergedOptions.animateEntrance ? false : true);
  
  // State for tracking if all the animations have completed
  const [animationsComplete, setAnimationsComplete] = useState(false);

  /**
   * Calculate accuracy percentage from session data
   */
  const calculateAccuracy = useCallback(() => {
    if (sessionData.questionsAnswered === 0) return 0;
    return (sessionData.correctAnswers / sessionData.questionsAnswered) * 100;
  }, [sessionData]);

  /**
   * Format time in seconds to a human-readable format (mm:ss)
   */
  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  /**
   * Format date to a human-readable format
   */
  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  /**
   * Show session summary (triggered on mount if animateEntrance is true)
   */
  const showSessionSummary = useCallback(() => {
    setIsVisible(true);
    // Trigger onSummaryDisplayed event (would be implemented in a real system)
    console.log('Event: onSummaryDisplayed', {
      summaryId,
      sessionId: sessionData.sessionId,
      displayTime: new Date(),
    });
    return summaryId;
  }, [summaryId, sessionData.sessionId]);

  /**
   * Hide session summary
   */
  const hideSessionSummary = useCallback((animate: boolean = true) => {
    if (animate) {
      setIsVisible(false);
      // Allow time for exit animation
      setTimeout(() => {
        // Trigger onSummaryHidden event (would be implemented in a real system)
        console.log('Event: onSummaryHidden', {
          summaryId,
          viewDuration: Date.now() - new Date(sessionData.endTime).getTime(),
        });
      }, 500);
    } else {
      // Trigger onSummaryHidden event immediately
      console.log('Event: onSummaryHidden', {
        summaryId,
        viewDuration: Date.now() - new Date(sessionData.endTime).getTime(),
      });
    }
    return true;
  }, [summaryId, sessionData.endTime]);

  /**
   * Generate a shareable image of the session summary
   */
  const getSummarySnapshot = useCallback(async (
    format: 'png' | 'jpeg' = 'png',
    includeMetrics: boolean = true,
    includeAchievements: boolean = true
  ) => {
    if (!summaryRef.current) {
      throw new Error('Summary not found');
    }
    
    try {
      // Use html2canvas to capture the summary as an image
      const canvas = await html2canvas(summaryRef.current);
      
      // Convert canvas to data URL
      const imageData = canvas.toDataURL(`image/${format}`);
      
      // In a real application, this might upload the image to a server and get a shareable URL
      // For this implementation, we'll just return the data URL
      
      // Trigger onSnapshotGenerated event (would be implemented in a real system)
      console.log('Event: onSnapshotGenerated', {
        summaryId,
        format,
        imageUrl: 'mockImageUrl.png', // In a real app, this would be the actual URL
      });
      
      return {
        imageUrl: 'mockImageUrl.png', // In a real app, this would be the actual URL
        imageData: new Blob([imageData], { type: `image/${format}` }),
      };
    } catch (error) {
      console.error('Image generation failed', error);
      throw new Error('Image generation failed');
    }
  }, [summaryId]);

  /**
   * Celebrate an achievement with animation
   */
  const celebrateAchievement = useCallback((
    achievementId: string,
    animationType: 'confetti' | 'stars' | 'fireworks' = 'confetti'
  ) => {
    // Find the achievement
    const achievement = [...achievementData.newAchievements, ...achievementData.progressAchievements]
      .find(a => a.id === achievementId);
    
    if (!achievement) {
      throw new Error('Achievement not found');
    }
    
    // Check if we already celebrated this achievement
    if (celebratedAchievements.includes(achievementId)) {
      return true;
    }
    
    // Mark this achievement as celebrated
    setCelebratedAchievements(prev => [...prev, achievementId]);
    
    // If we have a feedback system, use it for the celebration
    if (feedbackSystem) {
      const achievementElement = document.getElementById(`achievement-${achievementId}`);
      if (achievementElement) {
        feedbackSystem.playCelebrationAnimation(animationType, achievementElement);
        feedbackSystem.playSound('achievement');
      }
    } else {
      // Fallback celebration using canvas-confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    
    // Trigger onAchievementCelebrated event (would be implemented in a real system)
    console.log('Event: onAchievementCelebrated', {
      summaryId,
      achievementId,
      animationType,
    });
    
    return true;
  }, [summaryId, achievementData, celebratedAchievements, feedbackSystem]);

  /**
   * Highlight a specific area of progress
   */
  const highlightProgress = useCallback((
    progressType: 'path1' | 'path2' | 'path3' | 'overall',
    highlightDuration: number = 3000
  ) => {
    // In a real implementation, this would highlight the specified progress area
    // with a visual effect
    
    const progressElement = document.getElementById(`progress-${progressType}`);
    if (progressElement) {
      // Add a highlight class
      progressElement.classList.add('highlight-progress');
      
      // Remove it after the specified duration
      setTimeout(() => {
        progressElement.classList.remove('highlight-progress');
      }, highlightDuration);
    }
    
    return true;
  }, []);

  // Effect to trigger entrance animation
  useEffect(() => {
    if (mergedOptions.animateEntrance && !isVisible) {
      // Small delay to allow for component mounting
      const timer = setTimeout(() => {
        showSessionSummary();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [mergedOptions.animateEntrance, isVisible, showSessionSummary]);

  // Effect to auto-celebrate new achievements
  useEffect(() => {
    if (!mergedOptions.celebrateAchievements || !animationsComplete) {
      return;
    }
    
    // Celebrate new achievements with a delay between each
    const celebrateWithDelay = async () => {
      for (const achievement of achievementData.newAchievements) {
        if (!celebratedAchievements.includes(achievement.id)) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          celebrateAchievement(achievement.id);
        }
      }
    };
    
    celebrateWithDelay();
  }, [
    achievementData.newAchievements,
    celebrateAchievement,
    celebratedAchievements,
    mergedOptions.celebrateAchievements,
    animationsComplete
  ]);

  // Set animations complete after a delay
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setAnimationsComplete(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  // Prepare chart data for boundary levels
  const boundaryLevelData = {
    labels: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5'],
    datasets: [
      {
        label: 'Mastery %',
        data: [
          sessionData.boundaryLevels.level1,
          sessionData.boundaryLevels.level2,
          sessionData.boundaryLevels.level3,
          sessionData.boundaryLevels.level4,
          sessionData.boundaryLevels.level5,
        ],
        backgroundColor: [
          'rgba(79, 70, 229, 0.6)', // primary
          'rgba(16, 185, 129, 0.6)', // secondary
          'rgba(245, 158, 11, 0.6)', // accent
          'rgba(99, 102, 241, 0.6)', 
          'rgba(139, 92, 246, 0.6)',
        ],
        borderColor: [
          'rgb(79, 70, 229)', // primary
          'rgb(16, 185, 129)', // secondary
          'rgb(245, 158, 11)', // accent
          'rgb(99, 102, 241)',
          'rgb(139, 92, 246)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Prepare chart data for learning paths
  const learningPathData = {
    labels: [
      progressData.learningPaths.path1.name,
      progressData.learningPaths.path2.name,
      progressData.learningPaths.path3.name,
    ],
    datasets: [
      {
        label: 'Path Progress',
        data: [
          progressData.learningPaths.path1.progress,
          progressData.learningPaths.path2.progress,
          progressData.learningPaths.path3.progress,
        ],
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
        borderColor: 'rgb(79, 70, 229)',
        pointBackgroundColor: 'rgb(79, 70, 229)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(79, 70, 229)',
      },
    ],
  };
  
  // Prepare chart data for points breakdown
  const pointsData = {
    labels: ['FTC Points', 'EC Points', 'Base Points', 'Bonus'],
    datasets: [
      {
        label: 'Points',
        data: [
          metricsData.ftcPoints, 
          metricsData.ecPoints, 
          metricsData.basePoints,
          metricsData.totalPoints - metricsData.basePoints,
        ],
        backgroundColor: [
          'rgba(79, 70, 229, 0.6)', // primary
          'rgba(16, 185, 129, 0.6)', // secondary 
          'rgba(245, 158, 11, 0.6)', // accent
          'rgba(99, 102, 241, 0.6)',
        ],
        hoverOffset: 4,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: {
            size: 12,
            family: "'Comic Sans MS', 'Bubblegum Sans', cursive"
          },
        },
      },
    },
    scales: {
      r: {
        max: 100,
        min: 0,
        ticks: {
          stepSize: 20,
        },
      },
    },
  };

  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    },
    exit: {
      opacity: 0,
      y: 50,
      transition: {
        duration: 0.5
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  // Decide which classes to use based on theme
  const themeClasses = theme.isDarkMode
    ? 'bg-gray-800 text-white'
    : 'bg-white text-gray-900';

  // Return the component JSX
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={summaryRef}
          className={`session-summary ${themeClasses} rounded-lg shadow-lg p-6 max-w-4xl mx-auto`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          data-testid="session-summary"
        >
          {/* Header */}
          <motion.div 
            className="text-center mb-6"
            variants={itemVariants}
          >
            <h2 className="text-3xl font-bold mb-2 text-center">
              Session Summary
            </h2>
            <p className="text-sm opacity-70">
              {formatDate(sessionData.startTime)} - {formatDate(sessionData.endTime)}
            </p>
            <p className="text-sm opacity-70">
              Duration: {formatTime(sessionData.duration)}
            </p>
          </motion.div>
          
          {/* Quick Stats */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
            variants={itemVariants}
          >
            <div className="bg-indigo-100 dark:bg-indigo-900 rounded-lg p-4 text-center">
              <h3 className="text-lg font-semibold mb-1">Questions</h3>
              <p className="text-3xl font-bold">{sessionData.questionsAnswered}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900 rounded-lg p-4 text-center">
              <h3 className="text-lg font-semibold mb-1">Correct</h3>
              <p className="text-3xl font-bold">{sessionData.correctAnswers}</p>
            </div>
            <div className="bg-amber-100 dark:bg-amber-900 rounded-lg p-4 text-center">
              <h3 className="text-lg font-semibold mb-1">Accuracy</h3>
              <p className="text-3xl font-bold">{calculateAccuracy().toFixed(1)}%</p>
            </div>
          </motion.div>
          
          {/* Metrics Section */}
          {mergedOptions.showMetrics && (
            <motion.div 
              ref={metricsRef}
              className="mb-8"
              variants={itemVariants}
            >
              <h3 className="text-2xl font-bold mb-4 border-b pb-2">
                Your Metrics
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Points Breakdown */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-xl font-semibold mb-3">Points Breakdown</h4>
                  <div className="h-64">
                    <Doughnut data={pointsData} options={chartOptions} />
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm">Total Points</p>
                    <p className="text-3xl font-bold">{metricsData.totalPoints}</p>
                    <p className="text-xs mt-1">
                      Bonus Multiplier: x{metricsData.bonusMultiplier.toFixed(1)}
                    </p>
                  </div>
                </div>
                
                {/* Boundary Levels */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-xl font-semibold mb-3">Boundary Level Mastery</h4>
                  <div className="h-64">
                    <Bar data={boundaryLevelData} options={chartOptions} />
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm">Average Response Time</p>
                    <p className="text-3xl font-bold">
                      {(sessionData.averageResponseTime / 1000).toFixed(1)}s
                    </p>
                    <p className="text-xs mt-1">
                      Blink Speed: {(metricsData.blinkSpeed / 1000).toFixed(1)}s
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Achievements Section */}
          {mergedOptions.showAchievements && (
            <motion.div 
              ref={achievementsRef}
              className="mb-8"
              variants={itemVariants}
            >
              <h3 className="text-2xl font-bold mb-4 border-b pb-2">
                Achievements
              </h3>
              
              {achievementData.newAchievements.length === 0 && 
               achievementData.progressAchievements.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-lg">No achievements yet. Keep practicing!</p>
                </div>
              ) : (
                <div>
                  {/* New Achievements */}
                  {achievementData.newAchievements.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-xl font-semibold mb-3">New Achievements</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {achievementData.newAchievements.map(achievement => (
                          <div 
                            key={achievement.id}
                            id={`achievement-${achievement.id}`}
                            className="bg-indigo-50 dark:bg-indigo-900 rounded-lg p-4 flex items-center achievement-card"
                            onClick={() => celebrateAchievement(achievement.id)}
                          >
                            <div className="achievement-icon mr-4 bg-indigo-100 dark:bg-indigo-800 p-2 rounded-full">
                              <img 
                                src={achievement.icon} 
                                alt={achievement.name}
                                className="w-12 h-12"
                                onError={(e) => {
                                  // Fallback for missing icons
                                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48?text=🏆';
                                }}
                              />
                            </div>
                            <div>
                              <h5 className="font-bold">{achievement.name}</h5>
                              <p className="text-sm">{achievement.description}</p>
                              <p className="text-xs mt-1">+{achievement.pointsAwarded} points</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Achievement Progress */}
                  {achievementData.progressAchievements.length > 0 && (
                    <div>
                      <h4 className="text-xl font-semibold mb-3">Achievement Progress</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {achievementData.progressAchievements.map(achievement => (
                          <div 
                            key={achievement.id}
                            id={`achievement-${achievement.id}`}
                            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center"
                          >
                            <div className="achievement-icon mr-4 bg-gray-100 dark:bg-gray-600 p-2 rounded-full">
                              <img 
                                src={achievement.icon} 
                                alt={achievement.name}
                                className="w-12 h-12 opacity-70"
                                onError={(e) => {
                                  // Fallback for missing icons
                                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48?text=🏆';
                                }}
                              />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-bold">{achievement.name}</h5>
                              <p className="text-sm">{achievement.description}</p>
                              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                                <div 
                                  className="bg-indigo-500 h-2.5 rounded-full" 
                                  style={{ width: `${achievement.progress}%` }}
                                ></div>
                              </div>
                              <p className="text-xs mt-1">
                                {achievement.progress}% complete ({Math.round(achievement.progress * achievement.target / 100)}/{achievement.target})
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
          
          {/* Progress Section */}
          {mergedOptions.showProgress && (
            <motion.div 
              ref={progressRef}
              className="mb-8"
              variants={itemVariants}
            >
              <h3 className="text-2xl font-bold mb-4 border-b pb-2">
                Learning Progress
              </h3>
              
              <div className="grid grid-cols-1 gap-6">
                {/* Triple Helix Progress */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-xl font-semibold mb-3">Triple Helix Progress</h4>
                  <div className="h-64">
                    <Radar data={learningPathData} options={chartOptions} />
                  </div>
                  
                  {/* Path Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div 
                      id="progress-path1"
                      className="bg-indigo-50 dark:bg-indigo-900 rounded-lg p-3"
                    >
                      <h5 className="font-bold">{progressData.learningPaths.path1.name}</h5>
                      <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                        <div 
                          className="bg-indigo-500 h-2.5 rounded-full" 
                          style={{ width: `${progressData.learningPaths.path1.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs mt-1">
                        {progressData.learningPaths.path1.unitsCompleted}/{progressData.learningPaths.path1.totalUnits} units
                      </p>
                      <p className="text-xs mt-1">
                        Current: {progressData.learningPaths.path1.currentUnit}
                      </p>
                    </div>
                    
                    <div 
                      id="progress-path2"
                      className="bg-green-50 dark:bg-green-900 rounded-lg p-3"
                    >
                      <h5 className="font-bold">{progressData.learningPaths.path2.name}</h5>
                      <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                        <div 
                          className="bg-green-500 h-2.5 rounded-full" 
                          style={{ width: `${progressData.learningPaths.path2.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs mt-1">
                        {progressData.learningPaths.path2.unitsCompleted}/{progressData.learningPaths.path2.totalUnits} units
                      </p>
                      <p className="text-xs mt-1">
                        Current: {progressData.learningPaths.path2.currentUnit}
                      </p>
                    </div>
                    
                    <div 
                      id="progress-path3"
                      className="bg-amber-50 dark:bg-amber-900 rounded-lg p-3"
                    >
                      <h5 className="font-bold">{progressData.learningPaths.path3.name}</h5>
                      <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                        <div 
                          className="bg-amber-500 h-2.5 rounded-full" 
                          style={{ width: `${progressData.learningPaths.path3.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs mt-1">
                        {progressData.learningPaths.path3.unitsCompleted}/{progressData.learningPaths.path3.totalUnits} units
                      </p>
                      <p className="text-xs mt-1">
                        Current: {progressData.learningPaths.path3.currentUnit}
                      </p>
                    </div>
                  </div>
                  
                  {/* Overall Progress */}
                  <div 
                    id="progress-overall"
                    className="mt-6 text-center"
                  >
                    <h5 className="font-bold">Overall Curriculum Progress</h5>
                    <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4">
                      <div 
                        className="bg-indigo-500 h-4 rounded-full flex items-center justify-center text-xs text-white" 
                        style={{ width: `${progressData.overallProgress}%` }}
                      >
                        {progressData.overallProgress}%
                      </div>
                    </div>
                    <p className="text-sm mt-2">
                      Evolution Progress: {metricsData.evolution}%
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Next Steps Section */}
          {mergedOptions.showNextSteps && progressData.nextSessionFocus.length > 0 && (
            <motion.div 
              className="mb-6"
              variants={itemVariants}
            >
              <h3 className="text-2xl font-bold mb-4 border-b pb-2">
                Focus for Next Session
              </h3>
              
              <div className="bg-indigo-50 dark:bg-indigo-900 rounded-lg p-6">
                <ul className="list-disc pl-5 space-y-2">
                  {progressData.nextSessionFocus.map((focus, index) => (
                    <li key={index} className="text-lg">{focus}</li>
                  ))}
                </ul>
                <p className="mt-4 text-sm italic">
                  These suggestions are based on your performance in this session.
                </p>
              </div>
            </motion.div>
          )}
          
          {/* Actions */}
          <motion.div 
            className="flex justify-between mt-8"
            variants={itemVariants}
          >
            <button
              onClick={() => getSummarySnapshot()}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm flex items-center"
              aria-label="Save as image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              Save as Image
            </button>
            <button
              onClick={() => hideSessionSummary()}
              className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 px-4 py-2 rounded-lg text-sm"
              aria-label="Close summary"
            >
              Close Summary
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Export a class that implements the SessionSummaryInterface
export class SessionSummaryImpl {
  private summaryId: string | null = null;
  private component: React.RefObject<any>;
  
  constructor(componentRef: React.RefObject<any>) {
    this.component = componentRef;
  }
  
  showSessionSummary(
    sessionData: SessionData,
    metricsData: MetricsData,
    achievementData: AchievementData,
    progressData: ProgressData,
    options?: SummaryOptions
  ): string {
    if (this.component.current) {
      this.summaryId = this.component.current.showSessionSummary();
      return this.summaryId || '';
    }
    throw new Error('Summary component not found');
  }
  
  hideSessionSummary(summaryId: string, animate: boolean = true): boolean {
    if (this.component.current && this.summaryId === summaryId) {
      return this.component.current.hideSessionSummary(animate);
    }
    throw new Error('Summary not found');
  }
  
  getSummarySnapshot(
    summaryId: string,
    format: 'png' | 'jpeg' = 'png',
    includeMetrics: boolean = true,
    includeAchievements: boolean = true
  ): Promise<{ imageUrl: string; imageData: Blob }> {
    if (this.component.current && this.summaryId === summaryId) {
      return this.component.current.getSummarySnapshot(format, includeMetrics, includeAchievements);
    }
    throw new Error('Summary not found');
  }
  
  celebrateAchievement(
    summaryId: string,
    achievementId: string,
    animationType: 'confetti' | 'stars' | 'fireworks' = 'confetti'
  ): boolean {
    if (this.component.current && this.summaryId === summaryId) {
      return this.component.current.celebrateAchievement(achievementId, animationType);
    }
    throw new Error('Summary not found');
  }
  
  highlightProgress(
    summaryId: string,
    progressType: 'path1' | 'path2' | 'path3' | 'overall',
    highlightDuration: number = 3000
  ): boolean {
    if (this.component.current && this.summaryId === summaryId) {
      return this.component.current.highlightProgress(progressType, highlightDuration);
    }
    throw new Error('Summary not found');
  }
}

export default SessionSummary;
