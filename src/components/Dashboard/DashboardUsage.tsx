/**
 * Dashboard Component Usage Guide
 * This file demonstrates how to use the Dashboard component in the Zenjin Maths App
 */

import React, { useEffect, useState } from 'react';
import Dashboard, { createDashboard } from './components/Dashboard';
import { DashboardData, Achievement } from './types';

// Example mock data for demonstration
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
    },
    {
      pathId: "division",
      pathName: "Division",
      currentLevel: 2,
      maxLevel: 10,
      completedStitches: 10,
      totalStitches: 50,
      progressPercentage: 20,
      active: false
    }
  ],
  recentAchievements: [
    {
      id: "first-perfect",
      name: "Perfect Session",
      description: "Complete a session with 100% first-time correct answers",
      dateEarned: "2025-05-18T14:32:00Z",
      iconUrl: "/icons/perfect-session.svg",
      pointsAwarded: 500
    },
    {
      id: "streak-7",
      name: "Weekly Wizard",
      description: "Complete sessions on 7 consecutive days",
      dateEarned: "2025-05-15T09:15:00Z",
      iconUrl: "/icons/weekly-wizard.svg",
      pointsAwarded: 700
    }
  ],
  subscriptionType: "Premium",
  username: "MathWhiz123",
  avatarUrl: "/avatars/mathwhiz.png",
  lastSessionDate: "2025-05-19T16:45:00Z",
  streakDays: 12
};

/**
 * Example 1: Using the Dashboard as a React Component
 */
const DashboardExample = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>(mockDashboardData);

  // Event handlers
  const handlePathSelected = (pathId: string) => {
    console.log(`Path selected: ${pathId}`);
    // Handle path selection logic
  };

  const handleAchievementSelected = (achievementId: string) => {
    console.log(`Achievement selected: ${achievementId}`);
    // Handle achievement selection logic
  };

  const handleStartSessionClicked = (pathId: string) => {
    console.log(`Starting session for path: ${pathId}`);
    // Start a new learning session
  };

  return (
    <div>
      <h1>Zenjin Maths Dashboard</h1>
      
      <Dashboard
        initialData={dashboardData}
        onPathSelected={handlePathSelected}
        onAchievementSelected={handleAchievementSelected}
        onStartSessionClicked={handleStartSessionClicked}
      />
    </div>
  );
};

/**
 * Example 2: Using the Dashboard Interface
 * This demonstrates using the dashboard through its interface
 */
const DashboardInterfaceExample = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Create a dashboard instance
    const dashboard = createDashboard(mockDashboardData);
    
    // Register event listeners
    const unregisterPathListener = dashboard.onPathSelected((pathId) => {
      console.log(`Path selected: ${pathId}`);
      // Handle path selection logic
    });
    
    const unregisterAchievementListener = dashboard.onAchievementSelected((achievementId) => {
      console.log(`Achievement selected: ${achievementId}`);
      // Handle achievement selection logic
    });
    
    const unregisterSessionListener = dashboard.onStartSessionClicked((pathId) => {
      console.log(`Starting session for path: ${pathId}`);
      // Start a new learning session
    });
    
    // Show the dashboard
    dashboard.showDashboard(mockDashboardData);
    setIsLoaded(true);
    
    // Example of updating a metric
    setTimeout(() => {
      dashboard.updateMetric('totalPoints', 16000, { animate: true, highlight: true });
    }, 3000);
    
    // Example of showing an achievement notification
    setTimeout(() => {
      const newAchievement: Achievement = {
        id: "mastery-addition",
        name: "Addition Master",
        description: "Reach level 10 in the Addition path",
        dateEarned: new Date().toISOString(),
        iconUrl: "/icons/addition-master.svg",
        pointsAwarded: 1000
      };
      dashboard.showAchievementNotification(newAchievement);
    }, 5000);
    
    // Cleanup on unmount
    return () => {
      unregisterPathListener();
      unregisterAchievementListener();
      unregisterSessionListener();
    };
  }, []);

  return (
    <div>
      <h1>Zenjin Maths Dashboard (Interface Example)</h1>
      {isLoaded ? (
        <p>Dashboard has been initialized through its interface</p>
      ) : (
        <p>Loading dashboard...</p>
      )}
      
      {/* The Dashboard component is controlled through its interface in this example */}
      <div id="dashboard-container"></div>
    </div>
  );
};

/**
 * Example 3: Complete App Example
 * This shows how the Dashboard would be integrated into a complete app
 */
const ZenjinMathsApp = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [userData, setUserData] = useState<DashboardData>(mockDashboardData);
  
  // Simulated data fetching
  useEffect(() => {
    // In a real app, you would fetch user data from an API
    console.log('Fetching user data...');
    
    // Simulate API delay
    const timer = setTimeout(() => {
      setUserData(mockDashboardData);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Navigation handlers
  const navigateTo = (page: string) => {
    setCurrentPage(page);
  };
  
  // Event handlers
  const handlePathSelected = (pathId: string) => {
    console.log(`Path selected: ${pathId}`);
    // In a real app, you might navigate to a learning path detail view
  };
  
  const handleStartSessionClicked = (pathId: string) => {
    console.log(`Starting session for path: ${pathId}`);
    // In a real app, you would start a learning session and navigate to the session page
    navigateTo('session');
  };
  
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navigation */}
      <nav className="bg-gray-900 p-4">
        <div className="max-w-4xl mx-auto flex justify-between">
          <div className="text-white font-bold text-xl">Zenjin Maths</div>
          <div className="flex space-x-4">
            <button 
              className={`px-3 py-1 rounded ${currentPage === 'dashboard' ? 'bg-indigo-600' : 'text-white'}`}
              onClick={() => navigateTo('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`px-3 py-1 rounded ${currentPage === 'learning' ? 'bg-indigo-600' : 'text-white'}`}
              onClick={() => navigateTo('learning')}
            >
              Learning
            </button>
            <button 
              className={`px-3 py-1 rounded ${currentPage === 'achievements' ? 'bg-indigo-600' : 'text-white'}`}
              onClick={() => navigateTo('achievements')}
            >
              Achievements
            </button>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main>
        {currentPage === 'dashboard' && (
          <Dashboard
            initialData={userData}
            onPathSelected={handlePathSelected}
            onStartSessionClicked={handleStartSessionClicked}
          />
        )}
        
        {currentPage === 'learning' && (
          <div className="max-w-4xl mx-auto p-4 text-white">
            <h1 className="text-2xl font-bold mb-4">Learning Paths</h1>
            <p>This would show detailed learning path information.</p>
          </div>
        )}
        
        {currentPage === 'achievements' && (
          <div className="max-w-4xl mx-auto p-4 text-white">
            <h1 className="text-2xl font-bold mb-4">Achievements</h1>
            <p>This would show all achievements, both earned and locked.</p>
          </div>
        )}
        
        {currentPage === 'session' && (
          <div className="max-w-4xl mx-auto p-4 text-white">
            <h1 className="text-2xl font-bold mb-4">Learning Session</h1>
            <p>This is where the actual learning session would take place.</p>
            <button 
              className="mt-4 px-4 py-2 bg-indigo-600 rounded"
              onClick={() => {
                // Simulate completing a session with improved metrics
                setUserData(prev => ({
                  ...prev,
                  lifetimeMetrics: {
                    ...prev.lifetimeMetrics,
                    totalPoints: prev.lifetimeMetrics.totalPoints + 500,
                    totalSessions: prev.lifetimeMetrics.totalSessions + 1
                  }
                }));
                navigateTo('dashboard');
              }}
            >
              Complete Session
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export { DashboardExample, DashboardInterfaceExample, ZenjinMathsApp };