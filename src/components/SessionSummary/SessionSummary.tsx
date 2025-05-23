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

// Import types from generated interfaces
import {
  SessionData,
  MetricsData,
  Achievement,
  AchievementProgress,
  AchievementData,
  PathProgress,
  ProgressData,
  SummaryOptions,
  SessionSummaryErrorCode
} from '../../interfaces/SessionSummaryInterface';

// Extend SessionData with specific boundary levels format for our implementation
interface ExtendedSessionData extends SessionData {
  boundaryLevels: {
    level1: number;
    level2: number;
    level3: number;
    level4: number;
    level5: number;
  };
}

// Error codes from the interface
export const SESSION_SUMMARY_ERRORS = SessionSummaryErrorCode;

// Default summary options
const DEFAULT_OPTIONS: SummaryOptions = {
  showMetrics: true,
  showAchievements: true,
  showProgress: true,
  showNextSteps: true,
  animateEntrance: true,
  celebrateAchievements: true,
};

// Component Props Interface
export interface SessionSummaryProps {
  sessionData: SessionData;
  metricsData: MetricsData;
  achievementData: AchievementData;
  progressData: ProgressData;
  options?: SummaryOptions;
  onShare?: (imageUrl: string) => void;
  onClose?: () => void;
}

/**
 * SessionSummary Component
 * 
 * Displays a comprehensive summary of the user's learning session, showing
 * metrics, achievements, and progress in an engaging and motivational format.
 */
const SessionSummary: React.FC<SessionSummaryProps> = ({
  sessionData,
  metricsData,
  achievementData,
  progressData,
  options = DEFAULT_OPTIONS,
  onShare,
  onClose,
}) => {
  // References and state
  const summaryRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [highlightedProgress, setHighlightedProgress] = useState<string | null>(null);
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);

  // When component mounts, animate entrance if enabled
  useEffect(() => {
    if (options.animateEntrance) {
      setIsVisible(true);
    } else {
      setIsVisible(true);
    }
    
    // Automatically celebrate achievements if enabled
    if (options.celebrateAchievements && achievementData.newAchievements.length > 0) {
      setTimeout(() => {
        launchConfetti();
      }, 1000);
    }
  }, [options.animateEntrance, options.celebrateAchievements, achievementData.newAchievements.length]);

  // Format time duration (seconds to minutes:seconds)
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Format time (milliseconds to seconds)
  const formatTime = (ms: number): string => {
    return (ms / 1000).toFixed(2) + 's';
  };

  // Launch confetti for achievement celebration
  const launchConfetti = () => {
    if (typeof window !== 'undefined') {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  // Create shareable snapshot of the summary
  const createSnapshot = async (): Promise<string | null> => {
    if (!summaryRef.current) return null;
    
    try {
      const canvas = await html2canvas(summaryRef.current);
      const imageUrl = canvas.toDataURL('image/png');
      setSnapshotUrl(imageUrl);
      return imageUrl;
    } catch (error) {
      console.error('Failed to create summary snapshot:', error);
      return null;
    }
  };

  // Handle share button click
  const handleShare = async () => {
    const imageUrl = await createSnapshot();
    if (imageUrl && onShare) {
      onShare(imageUrl);
    }
  };

  // Handle close button click
  const handleClose = () => {
    setIsVisible(false);
    // Wait for exit animation to complete
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  // Handle achievement click
  const handleAchievementClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    if (options.celebrateAchievements) {
      launchConfetti();
    }
  };

  // Handle progress section click
  const handleProgressClick = (pathName: string) => {
    setHighlightedProgress(pathName);
  };

  // Prepare bar chart data for boundary levels
  const boundaryLevelChartData = {
    labels: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5'],
    datasets: [
      {
        label: 'Mastery',
        data: [
          sessionData.boundaryLevels.level1 || 0,
          sessionData.boundaryLevels.level2 || 0,
          sessionData.boundaryLevels.level3 || 0,
          sessionData.boundaryLevels.level4 || 0,
          sessionData.boundaryLevels.level5 || 0,
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Boundary Level Performance',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  // Prepare doughnut chart data for question breakdown
  const questionBreakdownData = {
    labels: ['Correct', 'Incorrect', 'Timeouts'],
    datasets: [
      {
        label: 'Questions',
        data: [
          sessionData.correctAnswers,
          sessionData.incorrectAnswers,
          sessionData.timeouts,
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70"
        >
          <motion.div
            ref={summaryRef}
            className="w-full max-w-4xl bg-gray-900 rounded-xl shadow-2xl overflow-hidden"
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-700 to-indigo-800 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Session Summary</h2>
              <div className="flex space-x-2">
                <button
                  onClick={handleShare}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white text-sm transition"
                  aria-label="Share session summary"
                >
                  Share
                </button>
                <button
                  onClick={handleClose}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-800 rounded-md text-white text-sm transition"
                  aria-label="Close session summary"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Content Scroll Area */}
            <div className="max-h-[80vh] overflow-y-auto p-6 space-y-8">
              {/* Session Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-4 shadow-md">
                  <h3 className="text-lg font-semibold text-white mb-4">Session Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-gray-300">
                      <p className="text-sm">Duration</p>
                      <p className="text-xl font-bold">{formatDuration(sessionData.duration)}</p>
                    </div>
                    <div className="text-gray-300">
                      <p className="text-sm">Questions</p>
                      <p className="text-xl font-bold">{sessionData.questionsAnswered}</p>
                    </div>
                    <div className="text-gray-300">
                      <p className="text-sm">Correct</p>
                      <p className="text-xl font-bold text-green-400">
                        {sessionData.correctAnswers} ({((sessionData.correctAnswers / sessionData.questionsAnswered) * 100).toFixed(0)}%)
                      </p>
                    </div>
                    <div className="text-gray-300">
                      <p className="text-sm">Avg. Response</p>
                      <p className="text-xl font-bold">{formatTime(sessionData.averageResponseTime)}</p>
                    </div>
                  </div>
                </div>

                {/* Metrics Summary */}
                {options.showMetrics && (
                  <div className="bg-gray-800 rounded-lg p-4 shadow-md">
                    <h3 className="text-lg font-semibold text-white mb-4">Points Earned</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-gray-300">
                        <p className="text-sm">FTC Points</p>
                        <p className="text-xl font-bold">{metricsData.ftcPoints}</p>
                      </div>
                      <div className="text-gray-300">
                        <p className="text-sm">EC Points</p>
                        <p className="text-xl font-bold">{metricsData.ecPoints}</p>
                      </div>
                      <div className="text-gray-300">
                        <p className="text-sm">Bonus</p>
                        <p className="text-xl font-bold">×{metricsData.bonusMultiplier.toFixed(2)}</p>
                      </div>
                      <div className="text-gray-300">
                        <p className="text-sm">Total Points</p>
                        <p className="text-xl font-bold text-yellow-400">{metricsData.totalPoints}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Performance Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-4 shadow-md">
                  <h3 className="text-lg font-semibold text-white mb-4">Boundary Level Performance</h3>
                  <div className="h-64">
                    <Bar data={boundaryLevelChartData} options={chartOptions} />
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4 shadow-md">
                  <h3 className="text-lg font-semibold text-white mb-4">Question Breakdown</h3>
                  <div className="h-64 flex items-center justify-center">
                    <Doughnut 
                      data={questionBreakdownData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                      }} 
                    />
                  </div>
                </div>
              </div>

              {/* Achievements */}
              {options.showAchievements && achievementData && (
                <div className="bg-gray-800 rounded-lg p-4 shadow-md">
                  <h3 className="text-lg font-semibold text-white mb-4">Achievements</h3>
                  
                  {achievementData.newAchievements.length > 0 ? (
                    <div className="mb-6">
                      <h4 className="text-md font-medium text-yellow-400 mb-3">🏆 New Achievements Unlocked</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {achievementData.newAchievements.map((achievement) => (
                          <motion.div
                            key={achievement.id}
                            className={`bg-gray-700 rounded-lg p-3 cursor-pointer transition border-2 ${
                              selectedAchievement?.id === achievement.id
                                ? 'border-yellow-400'
                                : 'border-transparent'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAchievementClick(achievement)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                                <img
                                  src={achievement.icon || '/icons/achievement-default.svg'}
                                  alt={achievement.name}
                                  className="w-8 h-8"
                                />
                              </div>
                              <div>
                                <h5 className="text-white font-medium">{achievement.name}</h5>
                                <p className="text-xs text-gray-300">{achievement.description}</p>
                                <p className="text-xs text-yellow-400">+{achievement.pointsAwarded} points</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-300 mb-4">No new achievements this session.</p>
                  )}

                  {achievementData.progressAchievements.length > 0 && (
                    <div>
                      <h4 className="text-md font-medium text-blue-400 mb-3">🔄 Progress Towards Achievements</h4>
                      <div className="space-y-4">
                        {achievementData.progressAchievements.map((achievement) => (
                          <div
                            key={achievement.id}
                            className="bg-gray-700 rounded-lg p-3"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                                  <img
                                    src={achievement.icon || '/icons/achievement-default.svg'}
                                    alt={achievement.name}
                                    className="w-6 h-6 opacity-70"
                                  />
                                </div>
                                <div>
                                  <h5 className="text-white font-medium">{achievement.name}</h5>
                                  <p className="text-xs text-gray-300">{achievement.description}</p>
                                </div>
                              </div>
                              <p className="text-sm text-gray-300">
                                {Math.round(achievement.progress * 100)}%
                              </p>
                            </div>
                            <div className="w-full bg-gray-600 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${achievement.progress * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Progress */}
              {options.showProgress && progressData && (
                <div className="bg-gray-800 rounded-lg p-4 shadow-md">
                  <h3 className="text-lg font-semibold text-white mb-4">Learning Progress</h3>
                  
                  {/* Overall Progress */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-md font-medium text-blue-400">Overall Curriculum Progress</h4>
                      <p className="text-lg font-bold text-white">
                        {Math.round(progressData.overallProgress * 100)}%
                      </p>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
                        style={{ width: `${progressData.overallProgress * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Learning Paths */}
                  <h4 className="text-md font-medium text-purple-400 mb-3">Learning Path Progress</h4>
                  <div className="space-y-4">
                    {Object.values(progressData.learningPaths).map((path: any) => (
                      <div
                        key={path.name}
                        className={`bg-gray-700 rounded-lg p-3 cursor-pointer ${
                          highlightedProgress === path.name ? 'ring-2 ring-purple-500' : ''
                        }`}
                        onClick={() => handleProgressClick(path.name)}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <h5 className="text-white font-medium">{path.name}</h5>
                            <p className="text-xs text-gray-300">
                              {path.unitsCompleted} of {path.totalUnits} units complete
                            </p>
                          </div>
                          <p className="text-sm font-bold text-white">
                            {Math.round(path.progress * 100)}%
                          </p>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ width: `${path.progress * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Steps */}
              {options.showNextSteps && progressData && progressData.nextSessionFocus && (
                <div className="bg-gray-800 rounded-lg p-4 shadow-md">
                  <h3 className="text-lg font-semibold text-white mb-4">Suggested Focus Areas</h3>
                  <div className="space-y-3">
                    {progressData.nextSessionFocus.map((focus, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-white text-xs font-bold">{index + 1}</span>
                        </div>
                        <p className="text-gray-300">{focus}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Evolution Metrics */}
              <div className="bg-gradient-to-r from-purple-800 to-indigo-900 rounded-lg p-4 shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white mb-2">Blink Speed</h3>
                    <p className="text-3xl font-bold text-white">{formatTime(metricsData.blinkSpeed)}</p>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white mb-2">Evolution</h3>
                    <p className="text-3xl font-bold text-white">{metricsData.evolution.toFixed(2)}</p>
                    <div className="w-full bg-indigo-800 rounded-full h-2 mt-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-green-400 h-2 rounded-full"
                        style={{ width: `${Math.min(metricsData.evolution * 10, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SessionSummary;

// Export session summary implementation for compatibility with the interface
export class SessionSummaryImpl {
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
  ): boolean {
    if (this.component.current) {
      return this.component.current.showSessionSummary(
        sessionData, 
        metricsData, 
        achievementData, 
        progressData, 
        options
      );
    }
    return false;
  }
  
  hideSessionSummary(): boolean {
    if (this.component.current) {
      return this.component.current.hideSessionSummary();
    }
    return false;
  }
  
  getSummarySnapshot(): string | null {
    if (this.component.current) {
      return this.component.current.getSummarySnapshot();
    }
    return null;
  }
  
  celebrateAchievement(achievementId: string): boolean {
    if (this.component.current) {
      return this.component.current.celebrateAchievement(achievementId);
    }
    return false;
  }
  
  highlightProgress(pathName: string): boolean {
    if (this.component.current) {
      return this.component.current.highlightProgress(pathName);
    }
    return false;
  }
}