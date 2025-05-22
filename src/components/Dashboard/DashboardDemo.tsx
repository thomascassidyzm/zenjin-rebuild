import React, { useState } from 'react';
import { Dashboard } from './Dashboard';
import { DashboardData } from './DashboardTypes';

const DashboardDemo = () => {
  // Style for the background
  const style = {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, #1a1a2e, #16213e, #0f3460)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'flex-start',
    color: 'white',
    padding: '20px',
    fontFamily: 'system-ui, sans-serif'
  };

  // Sample dashboard data
  const initialDashboardData: DashboardData = {
    lifetimeMetrics: {
      totalPoints: 13580,
      totalSessions: 47,
      averageBlinkSpeed: 1250,
      evolution: 10.86,
      globalRanking: 326,
      progressPercentage: 37,
      ftcPoints: 8700,
      ecPoints: 3200,
      basePoints: 11900,
      averageBonusMultiplier: 1.14
    },
    learningPaths: [
      {
        pathId: 'algebra-basics',
        pathName: 'Algebra Basics',
        currentLevel: 4,
        maxLevel: 10,
        completedStitches: 37,
        totalStitches: 85,
        progressPercentage: 43,
        active: true
      },
      {
        pathId: 'geometry',
        pathName: 'Geometry',
        currentLevel: 2,
        maxLevel: 8,
        completedStitches: 12,
        totalStitches: 64,
        progressPercentage: 19,
        active: true
      },
      {
        pathId: 'probability',
        pathName: 'Probability & Statistics',
        currentLevel: 1,
        maxLevel: 8,
        completedStitches: 6,
        totalStitches: 70,
        progressPercentage: 9,
        active: false
      }
    ],
    recentAchievements: [
      {
        id: 'consistent-learner',
        name: 'Consistent Learner',
        description: 'Complete sessions on 5 consecutive days',
        dateEarned: '2025-05-18T10:23:45Z',
        iconUrl: 'https://via.placeholder.com/50',
        level: 1,
        pointsAwarded: 500
      },
      {
        id: 'speed-demon',
        name: 'Speed Demon',
        description: 'Average response time under 1.5 seconds in a session',
        dateEarned: '2025-05-15T16:12:33Z',
        iconUrl: 'https://via.placeholder.com/50',
        pointsAwarded: 250
      }
    ],
    subscriptionType: 'Premium',
    username: 'MathWhiz42',
    avatarUrl: 'https://via.placeholder.com/100',
    lastSessionDate: '2025-05-22T08:45:12Z',
    streakDays: 5
  };

  // State for the dashboard data
  const [dashboardData, setDashboardData] = useState<DashboardData>(initialDashboardData);

  // Event handlers
  const handlePathSelected = (pathId: string) => {
    console.log(`Selected learning path: ${pathId}`);
    alert(`Selected learning path: ${pathId}`);
  };

  const handleAchievementSelected = (achievementId: string) => {
    console.log(`Selected achievement: ${achievementId}`);
    alert(`Selected achievement: ${achievementId}`);
  };

  const handleStartSessionClicked = (pathId: string) => {
    console.log(`Starting session for path: ${pathId}`);
    alert(`Starting session for path: ${pathId}`);
  };

  return (
    <div style={style}>
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem', textAlign: 'center' }}>
        Zenjin Maths - Dashboard Demo
      </h1>
      
      <div style={{ maxWidth: '800px', width: '100%', marginBottom: '2rem' }}>
        <Dashboard 
          initialData={dashboardData}
          onPathSelected={handlePathSelected}
          onAchievementSelected={handleAchievementSelected}
          onStartSessionClicked={handleStartSessionClicked}
        />
      </div>
      
      <div style={{ marginTop: '2rem', fontSize: '0.8rem', opacity: 0.6, textAlign: 'center' }}>
        Zenjin Maths App - Dashboard Implementation
      </div>
    </div>
  );
};

export default DashboardDemo;