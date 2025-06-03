/**
 * Learning Context Module
 * 
 * APML v3.1 compliant context boundary for all learning-related components
 * This module is lazy-loaded as a single chunk containing the core learning experience
 */

import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingInterface from '../components/LoadingInterface';

// Components in the Learning Context
import Dashboard from '../components/Dashboard/Dashboard';
import PlayerCard from '../components/PlayerCard/PlayerCard';
import PreEngagementCard from '../components/PreEngagementCard';
import MathLoadingAnimation from '../components/MathLoadingAnimation';

// Lazy load heavier components within the context
const SessionSummary = lazy(() => import('../components/SessionSummary'));

// Types
import { Question } from '../interfaces/PlayerCardInterface';
import { DashboardData } from '../components/Dashboard/DashboardTypes';

interface LearningContextProps {
  userId: string;
  dashboardData: DashboardData;
  onNavigate: (page: string) => void;
}

/**
 * Learning Context Component
 * Encapsulates all learning-related functionality in a single context boundary
 */
export const LearningContext: React.FC<LearningContextProps> = ({
  userId,
  dashboardData,
  onNavigate
}) => {
  return (
    <div className="learning-context">
      <Suspense fallback={<LoadingInterface context={{ source: 'learning' }} />}>
        <Routes>
          <Route path="/" element={
            <Dashboard 
              data={dashboardData}
              onPlayClick={() => onNavigate('session')}
              onAdminClick={() => onNavigate('admin')}
            />
          } />
          
          <Route path="/dashboard" element={
            <Dashboard 
              data={dashboardData}
              onPlayClick={() => onNavigate('session')}
              onAdminClick={() => onNavigate('admin')}
            />
          } />
          
          <Route path="/play" element={
            <div className="learning-session-container">
              <PreEngagementCard 
                onPlayClick={() => onNavigate('session')}
                userId={userId}
              />
            </div>
          } />
          
          <Route path="/session/*" element={
            <div className="active-session">
              {/* Session components loaded here */}
              <MathLoadingAnimation />
            </div>
          } />
        </Routes>
      </Suspense>
    </div>
  );
};

// Export the context as default for lazy loading
export default LearningContext;