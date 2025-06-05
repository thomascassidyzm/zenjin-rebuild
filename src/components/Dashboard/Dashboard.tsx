/**
 * Dashboard Component for Zenjin Maths App
 * 
 * This component displays lifetime metrics and user progress information
 * in a visually appealing and child-friendly manner, following the
 * technical requirements specified in the implementation package.
 * 
 * Features:
 * - Display of lifetime metrics (Total Points, Blink Speed, Evolution, etc.)
 * - Learning path progress visualization (Triple Helix model)
 * - Recent achievements display
 * - Animated metrics updates
 * - Responsive design for both desktop and mobile
 * 
 * Technical implementation:
 * - Next.js with TypeScript
 * - Tailwind CSS for styling
 * - Framer Motion for animations
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Crown } from 'lucide-react';

// Type definitions based on the interface specification
type LifetimeMetrics = {
  totalPoints: number;
  totalSessions: number;
  averageBlinkSpeed: number;
  evolution: number;
  globalRanking: number;
  progressPercentage: number;
  ftcPoints: number;
  ecPoints: number;
  basePoints: number;
  averageBonusMultiplier: number;
};

type LearningPathProgress = {
  pathId: string;
  pathName: string;
  currentLevel: number;
  maxLevel: number;
  completedStitches: number;
  totalStitches: number;
  progressPercentage: number;
  active: boolean;
};

type Achievement = {
  id: string;
  name: string;
  description: string;
  dateEarned: string;
  iconUrl: string;
  level?: number;
  pointsAwarded?: number;
};

type DashboardData = {
  lifetimeMetrics: LifetimeMetrics;
  learningPaths: LearningPathProgress[];
  recentAchievements: Achievement[];
  subscriptionType: string;
  username: string;
  avatarUrl?: string;
  lastSessionDate?: string;
  streakDays?: number;
};

type DashboardOptions = {
  animation?: string;
  highlightMetric?: string;
};

type UpdateMetricOptions = {
  animate?: boolean;
  highlight?: boolean;
};

type NotificationOptions = {
  duration?: number;
  sound?: boolean;
};

// Dashboard Props for the main component
interface DashboardProps {
  initialData: DashboardData;
  onPathSelected?: (pathId: string) => void;
  onAchievementSelected?: (achievementId: string) => void;
  onStartSessionClicked?: (pathId: string) => void;
  onUpgradeClicked?: () => void;
}

/**
 * Helper component for displaying a metric card with animation capabilities
 */
const MetricCard: React.FC<{
  title: string;
  value: string | number;
  description?: string;
  isHighlighted?: boolean;
  icon?: React.ReactNode;
}> = ({ title, value, description, isHighlighted, icon }) => {
  return (
    <motion.div
      className={`relative p-4 rounded-xl ${
        isHighlighted 
          ? 'bg-gradient-to-br from-purple-900 to-indigo-800 ring-2 ring-purple-400' 
          : 'bg-gradient-to-br from-gray-900 to-gray-800'
      } shadow-lg`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
          <motion.p 
            className="text-white text-2xl font-bold mt-1"
            key={`${title}-${value}`} // Key for animation when value changes
            initial={{ opacity: 0.6, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {value}
          </motion.p>
          {description && (
            <p className="text-gray-300 text-xs mt-1">{description}</p>
          )}
        </div>
        {icon && (
          <div className="text-purple-400 opacity-80">
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
};

/**
 * Learning Path Progress component displays the Triple Helix learning model
 */
const LearningPathProgress: React.FC<{
  paths: LearningPathProgress[];
  onPathSelected?: (pathId: string) => void;
  onStartSessionClicked?: (pathId: string) => void;
}> = ({ paths, onPathSelected, onStartSessionClicked }) => {
  return (
    <div className="mt-6">
      <h2 className="text-white text-lg font-bold mb-4">Learning Paths</h2>
      <div className="space-y-4">
        {paths.map((path) => (
          <motion.div
            key={path.pathId}
            className={`p-4 rounded-xl relative ${
              path.active
                ? 'bg-gradient-to-r from-indigo-900 to-purple-900 ring-2 ring-indigo-400'
                : 'bg-gradient-to-r from-gray-800 to-gray-900'
            } shadow-lg`}
            whileHover={{ scale: 1.01 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => onPathSelected && onPathSelected(path.pathId)}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center">
                  <h3 className="text-white font-bold">
                    {path.pathName}
                  </h3>
                  {path.active && (
                    <span className="ml-2 bg-green-500 text-xs text-white px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-gray-300 text-sm mt-1">
                  Level {path.currentLevel} of {path.maxLevel}
                </p>
              </div>
              <button
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm transition"
                onClick={(e) => {
                  e.stopPropagation();
                  onStartSessionClicked && onStartSessionClicked(path.pathId);
                }}
              >
                Start
              </button>
            </div>
            <div className="mt-3">
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <motion.div
                  className="h-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  style={{ width: `${path.progressPercentage}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${path.progressPercentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                ></motion.div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{path.completedStitches} stitches completed</span>
                <span>{path.progressPercentage}%</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

/**
 * Recent Achievements component
 */
const RecentAchievements: React.FC<{
  achievements: Achievement[];
  onAchievementSelected?: (achievementId: string) => void;
}> = ({ achievements, onAchievementSelected }) => {
  return (
    <div className="mt-6">
      <h2 className="text-white text-lg font-bold mb-4">Recent Achievements</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement) => (
          <motion.div
            key={achievement.id}
            className="p-4 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg"
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            onClick={() => onAchievementSelected && onAchievementSelected(achievement.id)}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 h-12 w-12 bg-indigo-900 rounded-full flex items-center justify-center">
                <img 
                  src={achievement.iconUrl} 
                  alt={achievement.name} 
                  className="h-8 w-8"
                  onError={(e) => {
                    // Fallback in case image fails to load
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="gold"><circle cx="12" cy="12" r="10"/></svg>';
                  }} 
                />
              </div>
              <div className="ml-4">
                <h3 className="text-white font-medium">{achievement.name}</h3>
                <p className="text-gray-400 text-xs mt-1">{achievement.description}</p>
                <div className="flex items-center text-gray-400 text-xs mt-1">
                  <span>{format(new Date(achievement.dateEarned), 'MMM d, yyyy')}</span>
                  {achievement.pointsAwarded && (
                    <span className="ml-2 text-purple-400">+{achievement.pointsAwarded} points</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

/**
 * Achievement Notification component
 */
const AchievementNotification: React.FC<{
  achievement: Achievement;
  onClose: () => void;
}> = ({ achievement, onClose }) => {
  return (
    <motion.div
      className="fixed top-4 right-4 max-w-sm w-full bg-gradient-to-r from-indigo-900 to-purple-900 rounded-lg shadow-lg z-50 overflow-hidden"
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      transition={{ duration: 0.4 }}
    >
      <div className="p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-12 w-12 bg-indigo-800 rounded-full flex items-center justify-center">
            <img 
              src={achievement.iconUrl} 
              alt={achievement.name} 
              className="h-8 w-8" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="gold"><circle cx="12" cy="12" r="10"/></svg>';
              }}
            />
          </div>
          <div className="ml-4 flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-white font-bold">Achievement Unlocked!</h3>
                <p className="text-indigo-200 font-medium">{achievement.name}</p>
              </div>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <p className="text-gray-300 text-sm mt-1">{achievement.description}</p>
            {achievement.pointsAwarded && (
              <p className="text-purple-300 text-sm font-bold mt-1">+{achievement.pointsAwarded} points</p>
            )}
          </div>
        </div>
      </div>
      {/* Progress bar for auto-close timing */}
      <motion.div 
        className="h-1 bg-indigo-400"
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: 5, ease: "linear" }}
      />
    </motion.div>
  );
};

/**
 * User Profile Header component
 */
const UserProfileHeader: React.FC<{
  username: string;
  avatarUrl?: string;
  subscriptionType: string;
  streakDays?: number;
  lastSessionDate?: string;
}> = ({ username, avatarUrl, subscriptionType, streakDays, lastSessionDate }) => {
  return (
    <div className="flex items-center mb-6">
      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center overflow-hidden">
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={username} 
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-white text-xl font-bold">{username.charAt(0).toUpperCase()}</span>
        )}
      </div>
      <div className="ml-4">
        <div className="flex items-center">
          <h1 className="text-white text-xl font-bold">{username}</h1>
          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
            subscriptionType === 'Premium' 
              ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900' 
              : 'bg-gray-700 text-gray-300'
          }`}>
            {subscriptionType}
          </span>
        </div>
        <div className="flex items-center text-gray-400 text-sm mt-1">
          {streakDays !== undefined && streakDays > 0 && (
            <div className="flex items-center mr-4">
              <svg className="h-4 w-4 text-orange-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
              <span>{streakDays} day streak</span>
            </div>
          )}
          {lastSessionDate && (
            <div>
              Last session: {format(new Date(lastSessionDate), 'MMM d, yyyy')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Main Dashboard component - Mobile-first design with hero 'Start Learning' button
 */
const Dashboard: React.FC<DashboardProps> = ({
  initialData,
  onPathSelected,
  onAchievementSelected,
  onStartSessionClicked,
  onUpgradeClicked
}) => {
  // State for dashboard data
  const [dashboardData, setDashboardData] = useState<DashboardData>(initialData);
  
  // State for highlighted metric
  const [highlightedMetric, setHighlightedMetric] = useState<string | null>(null);

  // Method to update a specific metric
  const updateMetric = useCallback((metricName: string, metricValue: any, options: UpdateMetricOptions = {}) => {
    try {
      const { animate = true, highlight = false } = options;
      
      setDashboardData((prevData) => {
        // Create a deep copy to avoid direct state mutation
        const newData = { ...prevData };
        
        // Update the specific metric
        if (metricName in newData.lifetimeMetrics) {
          newData.lifetimeMetrics = {
            ...newData.lifetimeMetrics,
            [metricName]: metricValue
          };
        } else {
          throw new Error('INVALID_METRIC');
        }
        
        return newData;
      });
      
      // Highlight the metric if requested
      if (highlight) {
        setHighlightedMetric(metricName);
        
        // Remove highlight after animation
        setTimeout(() => {
          setHighlightedMetric(null);
        }, 3000);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to update metric:', error);
      return false;
    }
  }, []);

  // Method to show achievement notification
  const showAchievementNotification = useCallback((achievement: Achievement, options: NotificationOptions = {}) => {
    try {
      const { duration = 5000, sound = true } = options;
      
      setNotification({ achievement, options });
      
      // Play sound if enabled
      if (sound) {
        // Play achievement sound
        const audio = new Audio('/sounds/achievement.mp3');
        audio.play().catch(e => console.log('Audio play failed:', e));
      }
      
      // Auto-close notification after duration
      setTimeout(() => {
        setNotification(null);
      }, duration);
      
      return true;
    } catch (error) {
      console.error('Failed to show achievement notification:', error);
      return false;
    }
  }, []);

  // Method to refresh dashboard data
  const refreshDashboard = useCallback(async () => {
    try {
      // In a real implementation, this would fetch the latest data from an API
      // Here we're just using the current state for demonstration
      return true;
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
      return false;
    }
  }, []);

  // Format large numbers with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* User Profile Header - Simplified */}
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl font-bold">{dashboardData.username.charAt(0).toUpperCase()}</span>
          </div>
          <h1 className="text-white text-xl font-bold mb-1">{dashboardData.username}</h1>
          <span className={`text-xs px-3 py-1 rounded-full ${
            dashboardData.subscriptionType === 'Premium' 
              ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900' 
              : 'bg-gray-700 text-gray-300'
          }`}>
            {dashboardData.subscriptionType}
          </span>
        </div>

        {/* HERO: Start Learning Button - Mobile-first, fills screen */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 shadow-2xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Ready to Learn?</h2>
              <p className="text-gray-400">Continue your mathematical journey</p>
            </div>
            
            {/* Big Hero Play Button */}
            <div className="flex justify-center mb-6">
              <motion.button
                onClick={() => onStartSessionClicked && onStartSessionClicked('addition')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative w-32 h-32 bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-full shadow-2xl transition-all duration-300"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg 
                    className="w-12 h-12 text-white ml-1 group-hover:scale-110 transition-transform duration-200" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-white opacity-20 animate-pulse"></div>
              </motion.button>
            </div>
            
            <div className="text-center">
              <p className="text-xl font-semibold text-white mb-2">Start Learning</p>
              <p className="text-gray-400 text-sm">Tap the play button when you're ready</p>
            </div>
          </div>
        </motion.div>

        {/* Priority Metrics - Lifetime Points, Blink Speed, Evolution */}
        <div className="space-y-4 mb-6">
          {/* Lifetime Points - Most Important */}
          <MetricCard
            title="Lifetime Points"
            value={formatNumber(dashboardData.lifetimeMetrics.totalPoints)}
            isHighlighted={highlightedMetric === 'totalPoints'}
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
          
          {/* Blink Speed and Evolution in a row */}
          <div className="grid grid-cols-2 gap-4">
            <MetricCard
              title="Blink Speed"
              value={`${dashboardData.lifetimeMetrics.averageBlinkSpeed}ms`}
              description="Response time"
              isHighlighted={highlightedMetric === 'averageBlinkSpeed'}
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            />
            <MetricCard
              title="Evolution"
              value={dashboardData.lifetimeMetrics.evolution.toFixed(2)}
              description="Points ÷ Speed"
              isHighlighted={highlightedMetric === 'evolution'}
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            />
          </div>
        </div>

        {/* Streak and Session Info */}
        {dashboardData.streakDays && dashboardData.streakDays > 0 && (
          <motion.div
            className="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="h-5 w-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
              <span className="text-white font-bold">{dashboardData.streakDays} day streak!</span>
            </div>
          </motion.div>
        )}

        {/* Active Learning Path - Simplified */}
        {dashboardData.learningPaths.find(p => p.active) && (
          <motion.div
            className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-xl p-4 border border-indigo-400/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {(() => {
              const activePath = dashboardData.learningPaths.find(p => p.active)!;
              return (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-white font-bold">{activePath.pathName}</h3>
                    <span className="bg-green-500 text-xs text-white px-2 py-1 rounded-full">Active</span>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">Level {activePath.currentLevel} of {activePath.maxLevel}</p>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${activePath.progressPercentage}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    ></motion.div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{activePath.completedStitches} stitches completed</span>
                    <span>{activePath.progressPercentage}%</span>
                  </div>
                </div>
              );
            })()} 
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Export the Dashboard component and its public methods (DashboardInterface implementation)
export default Dashboard;

// Export a factory function to create a Dashboard with the interface methods
export const createDashboard = (initialData: DashboardData) => {
  let dashboardComponent: Dashboard | null = null;
  let eventListeners = {
    onPathSelected: new Set<(pathId: string) => void>(),
    onAchievementSelected: new Set<(achievementId: string) => void>(),
    onStartSessionClicked: new Set<(pathId: string) => void>(),
  };

  const dashboardInterface = {
    /**
     * Displays the dashboard with user's lifetime metrics and progress
     */
    showDashboard: (dashboardData: DashboardData, options: DashboardOptions = {}) => {
      try {
        // In a real implementation, you would render the Dashboard component
        // For this example, we're just updating the state
        if (dashboardComponent) {
          dashboardComponent.updateDashboardData(dashboardData);
        }
        return true;
      } catch (error) {
        console.error('Failed to show dashboard:', error);
        return false;
      }
    },

    /**
     * Updates a specific metric on the dashboard
     */
    updateMetric: (metricName: string, metricValue: any, options: UpdateMetricOptions = {}) => {
      try {
        if (dashboardComponent) {
          return dashboardComponent.updateMetric(metricName, metricValue, options);
        }
        return false;
      } catch (error) {
        console.error('Failed to update metric:', error);
        return false;
      }
    },

    /**
     * Displays a notification for a newly earned achievement
     */
    showAchievementNotification: (achievement: Achievement, options: NotificationOptions = {}) => {
      try {
        if (dashboardComponent) {
          return dashboardComponent.showAchievementNotification(achievement, options);
        }
        return false;
      } catch (error) {
        console.error('Failed to show achievement notification:', error);
        return false;
      }
    },

    /**
     * Refreshes the dashboard data
     */
    refreshDashboard: async () => {
      try {
        if (dashboardComponent) {
          return await dashboardComponent.refreshDashboard();
        }
        return false;
      } catch (error) {
        console.error('Failed to refresh dashboard:', error);
        return false;
      }
    },

    /**
     * Registers an event listener for path selection
     */
    onPathSelected: (callback: (pathId: string) => void) => {
      eventListeners.onPathSelected.add(callback);
      return () => {
        eventListeners.onPathSelected.delete(callback);
      };
    },

    /**
     * Registers an event listener for achievement selection
     */
    onAchievementSelected: (callback: (achievementId: string) => void) => {
      eventListeners.onAchievementSelected.add(callback);
      return () => {
        eventListeners.onAchievementSelected.delete(callback);
      };
    },

    /**
     * Registers an event listener for start session clicks
     */
    onStartSessionClicked: (callback: (pathId: string) => void) => {
      eventListeners.onStartSessionClicked.add(callback);
      return () => {
        eventListeners.onStartSessionClicked.delete(callback);
      };
    },
  };

  return dashboardInterface;
};

/**
 * Example usage of the Dashboard component:
 * 
 * import { Dashboard, createDashboard } from './components/Dashboard';
 * 
 * // Sample dashboard data
 * const dashboardData = {
 *   lifetimeMetrics: {
 *     totalPoints: 15750,
 *     totalSessions: 42,
 *     // ... other metrics
 *   },
 *   // ... other data
 * };
 * 
 * // Component usage
 * function App() {
 *   const handlePathSelected = (pathId) => {
 *     console.log(`Path selected: ${pathId}`);
 *   };
 * 
 *   return (
 *     <Dashboard
 *       initialData={dashboardData}
 *       onPathSelected={handlePathSelected}
 *     />
 *   );
 * }
 * 
 * // Interface usage
 * const dashboard = createDashboard(dashboardData);
 * 
 * dashboard.onPathSelected((pathId) => {
 *   console.log(`Path selected: ${pathId}`);
 * });
 * 
 * dashboard.updateMetric('totalPoints', 16000, { animate: true, highlight: true });
 */