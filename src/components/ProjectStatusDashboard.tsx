import React, { useState } from 'react';
import { APMLBackendTester } from './APMLBackendTester';

// APML Status Data (from registry.apml)
const apmlStatusLevels = [
  { name: 'not-started', symbol: '🔴', description: 'Not implemented at all', color: 'bg-red-500' },
  { name: 'scaffolded', symbol: '🟡', description: 'Basic structure exists but not functional', color: 'bg-yellow-500' },
  { name: 'functional', symbol: '🟠', description: 'Basic functionality works but not polished', color: 'bg-orange-500' },
  { name: 'integrated', symbol: '🟢', description: 'Works with other components properly', color: 'bg-green-500' },
  { name: 'tested', symbol: '🔵', description: 'Has comprehensive tests', color: 'bg-blue-500' },
  { name: 'optimized', symbol: '⭐', description: 'Performance optimized and production-ready', color: 'bg-purple-500' }
];

const moduleData = [
  { name: 'UserInterface', interfaces: '5/5', components: '5/5', status: 'integrated', completion: 95 },
  { name: 'LearningEngine', interfaces: '6/6', components: '6/6', status: 'functional', completion: 85 },
  { name: 'ProgressionSystem', interfaces: '4/4', components: '4/4', status: 'functional', completion: 85 },
  { name: 'MetricsSystem', interfaces: '4/4', components: '4/4', status: 'functional', completion: 90 },
  { name: 'SubscriptionSystem', interfaces: '4/4', components: '4/4', status: 'scaffolded', completion: 65 },
  { name: 'OfflineSupport', interfaces: '4/4', components: '4/4', status: 'functional', completion: 75 },
  { name: 'UserManagement', interfaces: '1/1', components: '1/1', status: 'functional', completion: 90 },
  { name: 'BackendServices', interfaces: '5/5', components: '6/6', status: 'scaffolded', completion: 65 }
];

const recentAchievements = [
  { date: '2025-05-24', title: 'APML Compliance Restored', description: 'Implemented proper APML-compliant testing system and corrected status levels' },
  { date: '2025-05-24', title: 'Backend Services Scaffolded', description: 'All 6 backend components implemented, awaiting proper validation' },
  { date: '2025-05-24', title: 'API Endpoints Validated', description: 'Anonymous user creation and state management tested and working' },
  { date: '2025-05-23', title: 'Database Schema Deployed', description: 'Complete Postgres schema with RLS policies and stored procedures' }
];

const nextSteps = [
  { title: 'APML Backend Validation', priority: 'high', description: 'Complete APML validation testing to advance components to functional status' },
  { title: 'Environment Variable Setup', priority: 'high', description: 'Configure proper frontend environment variables for Supabase services' },
  { title: 'Frontend Integration', priority: 'medium', description: 'Integrate existing frontend with validated backend services' },
  { title: 'Payment Processing', priority: 'low', description: 'Replace mock payment processor with Stripe integration' }
];

export const ProjectStatusDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'testing' | 'timeline'>('overview');

  const getStatusLevel = (statusName: string) => {
    return apmlStatusLevels.find(level => level.name === statusName) || apmlStatusLevels[0];
  };

  const overallProgress = Math.round(moduleData.reduce((sum, module) => sum + module.completion, 0) / moduleData.length);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Zenjin Maths App</h1>
              <p className="text-gray-600 mt-1">APML Framework Development Status</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{overallProgress}%</div>
              <div className="text-sm text-gray-500">Overall Progress</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'modules', label: 'Modules', icon: '🧩' },
                { id: 'testing', label: 'System Tests', icon: '🧪' },
                { id: 'timeline', label: 'Timeline', icon: '📅' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* APML Status Legend */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">APML Status Levels</h2>
              <div className="space-y-3">
                {apmlStatusLevels.map((level) => (
                  <div key={level.name} className="flex items-center space-x-3">
                    <span className="text-2xl">{level.symbol}</span>
                    <div>
                      <div className="font-medium capitalize">{level.name}</div>
                      <div className="text-sm text-gray-600">{level.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Module Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Module Summary</h2>
              <div className="space-y-4">
                {moduleData.slice(0, 4).map((module) => {
                  const status = getStatusLevel(module.status);
                  return (
                    <div key={module.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{status.symbol}</span>
                        <span className="font-medium">{module.name}</span>
                      </div>
                      <span className="text-sm text-gray-600">{module.completion}%</span>
                    </div>
                  );
                })}
                <div className="text-sm text-gray-500 mt-2">
                  + {moduleData.length - 4} more modules
                </div>
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h2>
              <div className="space-y-4">
                {recentAchievements.map((achievement, index) => (
                  <div key={index} className="border-l-4 border-green-500 pl-4">
                    <div className="font-medium text-gray-900">{achievement.title}</div>
                    <div className="text-sm text-gray-600">{achievement.description}</div>
                    <div className="text-xs text-gray-500 mt-1">{achievement.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modules Tab */}
        {activeTab === 'modules' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Module Status Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {moduleData.map((module) => {
                  const status = getStatusLevel(module.status);
                  return (
                    <div key={module.name} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{status.symbol}</span>
                          <h3 className="font-semibold text-gray-900">{module.name}</h3>
                        </div>
                        <span className="text-sm font-medium text-gray-600">{module.completion}%</span>
                      </div>
                      
                      <div className="mb-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${status.color}`}
                            style={{ width: `${module.completion}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Interfaces: {module.interfaces}</span>
                        <span>Components: {module.components}</span>
                      </div>
                      
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          status.name === 'integrated' ? 'bg-green-100 text-green-800' :
                          status.name === 'functional' ? 'bg-orange-100 text-orange-800' :
                          status.name === 'scaffolded' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {status.name}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Testing Tab */}
        {activeTab === 'testing' && (
          <div>
            <APMLBackendTester />
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Development Timeline & Next Steps</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Progress */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Recent Progress</h3>
                <div className="space-y-4">
                  {recentAchievements.map((achievement, index) => (
                    <div key={index} className="flex space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                      <div>
                        <div className="font-medium text-gray-900">{achievement.title}</div>
                        <div className="text-sm text-gray-600">{achievement.description}</div>
                        <div className="text-xs text-gray-500">{achievement.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Steps */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Next Steps</h3>
                <div className="space-y-4">
                  {nextSteps.map((step, index) => (
                    <div key={index} className="flex space-x-3">
                      <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                        step.priority === 'high' ? 'bg-red-500' :
                        step.priority === 'medium' ? 'bg-yellow-500' :
                        'bg-gray-400'
                      }`}></div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{step.title}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            step.priority === 'high' ? 'bg-red-100 text-red-800' :
                            step.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {step.priority}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">{step.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-white rounded-lg shadow-sm p-4 mt-6 text-center text-sm text-gray-500">
          Built with APML Framework v1.3.2 • Last Updated: {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};