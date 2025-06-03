import React from 'react';
import { UserContext } from '../hooks/useAuthToPlayerFlow';

/**
 * PreEngagementCard Component
 * APML v1.4.1 Interface Specification Implementation
 * 
 * YouTube-style landing card with big play button for post-authentication engagement
 */

interface PreEngagementCardProps {
  userContext: UserContext;
  onPlayClicked: () => Promise<void>;
  isLoading: boolean;
  loadingProgress: number;
  onDashboardClick?: () => void;
}

const PreEngagementCard: React.FC<PreEngagementCardProps> = ({
  userContext,
  onPlayClicked,
  isLoading,
  loadingProgress,
  onDashboardClick
}) => {
  const getUserWelcomeMessage = () => {
    if (userContext.userType === 'authenticated' && userContext.userName) {
      return `Welcome back, ${userContext.userName}!`;
    } else if (userContext.userType === 'authenticated') {
      return 'Welcome back!';
    } else {
      return 'Welcome to Zenjin Maths!';
    }
  };

  const getLearningPathInfo = () => {
    // Default to Addition for now - this would come from user progress in real implementation
    return {
      name: 'Addition',
      description: 'Master addition facts with adaptive learning',
      estimatedDuration: '5-10 minutes',
      level: 'Beginner'
    };
  };

  const pathInfo = getLearningPathInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-3xl">Z</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {getUserWelcomeMessage()}
          </h1>
          <p className="text-gray-400 text-lg">
            Ready to continue your mathematical journey?
          </p>
        </div>

        {/* Main Engagement Card */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
          
          {/* Learning Path Info */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2">
              {pathInfo.name}
            </h2>
            <p className="text-gray-300 mb-4">
              {pathInfo.description}
            </p>
            
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                {pathInfo.level}
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                {pathInfo.estimatedDuration}
              </div>
              {userContext.userType === 'authenticated' && (
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Progress Saved
                </div>
              )}
            </div>
          </div>

          {/* Big Play Button (YouTube Style) */}
          <div className="flex justify-center mb-6">
            <button
              onClick={onPlayClicked}
              disabled={isLoading}
              className="group relative w-32 h-32 bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {!isLoading ? (
                // Play Icon
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg 
                    className="w-12 h-12 text-white ml-1 group-hover:scale-110 transition-transform duration-200" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              ) : (
                // Loading State
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              
              {/* Pulsing Ring Effect */}
              {!isLoading && (
                <div className="absolute inset-0 rounded-full border-4 border-white opacity-20 animate-pulse"></div>
              )}
            </button>
          </div>

          {/* Action Text */}
          <div className="text-center">
            <p className="text-xl font-semibold text-white mb-2">
              {isLoading ? 'Preparing your session...' : 'Start Learning'}
            </p>
            <p className="text-gray-400 text-sm">
              {isLoading 
                ? `Loading progress: ${loadingProgress}%`
                : 'Click the play button when you\'re ready to begin'
              }
            </p>
          </div>
          
          {/* Dashboard Link */}
          {onDashboardClick && (
            <div className="text-center mt-4">
              <button
                onClick={onDashboardClick}
                disabled={isLoading}
                className="text-gray-400 hover:text-white text-sm underline transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Go to Dashboard
              </button>
            </div>
          )}

          {/* Loading Progress Bar */}
          {isLoading && (
            <div className="mt-6">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* User Context Info */}
          {userContext.userType === 'anonymous' && (
            <div className="mt-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
              <p className="text-sm text-yellow-400 mb-2">
                <span className="font-semibold">Anonymous Mode:</span> Your progress won't be saved.
              </p>
              <p className="text-xs text-gray-400">
                Sign up or sign in to save your learning progress and unlock additional features.
              </p>
            </div>
          )}
        </div>

        {/* Quick Stats (for authenticated users) */}
        {userContext.userType === 'authenticated' && (
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
              <div className="text-2xl font-bold text-indigo-400">-</div>
              <div className="text-xs text-gray-400">Sessions</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
              <div className="text-2xl font-bold text-purple-400">-</div>
              <div className="text-xs text-gray-400">Accuracy</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
              <div className="text-2xl font-bold text-green-400">-</div>
              <div className="text-xs text-gray-400">Streak</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreEngagementCard;