import React, { useState } from 'react';
import { APMLBackendTester } from './APMLBackendTester';
import { ConfigTest } from './ConfigTest';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'testing' | 'timeline'>('overview');

  const getStatusLevel = (statusName: string) => {
    return apmlStatusLevels.find(level => level.name === statusName) || apmlStatusLevels[0];
  };

  const overallProgress = Math.round(moduleData.reduce((sum, module) => sum + module.completion, 0) / moduleData.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-sm rounded-xl shadow-2xl p-6 mb-6 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Zenjin Maths App
              </h1>
              <p className="text-gray-300 mt-1">APML Framework Development Status</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text">
                {overallProgress}%
              </div>
              <div className="text-sm text-gray-400">Overall Progress</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-sm rounded-xl shadow-2xl mb-6 border border-gray-700/50">
          <div className="border-b border-gray-600/50">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'APML Status', icon: '🎯' },
                { id: 'testing', label: 'Validation', icon: '🧪' },
                { id: 'timeline', label: 'Progress', icon: '📈' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-400 text-blue-400 shadow-lg'
                      : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
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
          <div className="space-y-6">
            {/* APML Progress Matrix */}
            <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 backdrop-blur-sm rounded-xl shadow-2xl p-6 border border-gray-600/50">
              <h2 className="text-lg font-semibold text-white mb-4">APML Interface Implementation Matrix</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {moduleData.map((module) => {
                  const status = getStatusLevel(module.status);
                  return (
                    <div key={module.name} className="text-center p-3 rounded-lg bg-gray-700/50 border border-gray-600/30 hover:bg-gray-600/50 transition-all duration-200">
                      <div className="text-2xl mb-2">{status.symbol}</div>
                      <div className="text-xs text-gray-300 font-medium">{module.name}</div>
                      <div className="text-xs text-gray-400 mt-1">{module.interfaces}</div>
                      <div className="text-xs text-transparent bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text font-semibold mt-1">{module.completion}%</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* APML Axiom Compliance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 backdrop-blur-sm rounded-xl shadow-2xl p-6 border border-gray-600/50">
                <h3 className="text-lg font-semibold text-white mb-4">APML Axiom Compliance</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-green-500/20 border border-green-400/50">
                    <span className="text-green-300">✓ Interface Before Implementation</span>
                    <span className="text-green-400 text-sm">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-green-500/20 border border-green-400/50">
                    <span className="text-green-300">✓ Validation Through Distinction</span>
                    <span className="text-green-400 text-sm">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-yellow-500/20 border border-yellow-400/50">
                    <span className="text-yellow-300">◐ Better × Simpler × Cheaper</span>
                    <span className="text-yellow-400 text-sm">Partial</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 backdrop-blur-sm rounded-xl shadow-2xl p-6 border border-gray-600/50">
                <h3 className="text-lg font-semibold text-white mb-4">Critical Path</h3>
                <div className="space-y-3">
                  {nextSteps.filter(step => step.priority === 'high').map((step, index) => (
                    <div key={index} className="p-3 rounded-lg bg-red-500/20 border border-red-400/50">
                      <div className="font-medium text-red-300">{step.title}</div>
                      <div className="text-sm text-red-200">{step.description}</div>
                    </div>
                  ))}
                </div>
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
          <div className="space-y-6">
            <ConfigTest />
            <APMLBackendTester />
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 backdrop-blur-sm rounded-xl shadow-2xl p-6 border border-gray-600/50">
            <h2 className="text-lg font-semibold text-white mb-6">Development Timeline & Next Steps</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Progress */}
              <div>
                <h3 className="font-medium text-gray-100 mb-4">Recent Progress</h3>
                <div className="space-y-4">
                  {recentAchievements.map((achievement, index) => (
                    <div key={index} className="flex space-x-3 p-3 rounded-lg bg-gray-700/50 border border-gray-600/30">
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-blue-400 mt-2"></div>
                      <div>
                        <div className="font-medium text-gray-100">{achievement.title}</div>
                        <div className="text-sm text-gray-300">{achievement.description}</div>
                        <div className="text-xs text-gray-400">{achievement.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Steps */}
              <div>
                <h3 className="font-medium text-gray-100 mb-4">Next Steps</h3>
                <div className="space-y-4">
                  {nextSteps.map((step, index) => (
                    <div key={index} className="flex space-x-3 p-3 rounded-lg bg-gray-700/50 border border-gray-600/30">
                      <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                        step.priority === 'high' ? 'bg-gradient-to-r from-red-400 to-pink-400' :
                        step.priority === 'medium' ? 'bg-gradient-to-r from-yellow-400 to-orange-400' :
                        'bg-gradient-to-r from-blue-400 to-purple-400'
                      }`}></div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-100">{step.title}</span>
                          <span className={`px-2 py-1 text-xs rounded-full border ${
                            step.priority === 'high' ? 'bg-red-500/20 text-red-300 border-red-500/50' :
                            step.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' :
                            'bg-blue-500/20 text-blue-300 border-blue-500/50'
                          }`}>
                            {step.priority}
                          </span>
                        </div>
                        <div className="text-sm text-gray-300">{step.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-sm rounded-xl shadow-2xl p-4 mt-6 text-center text-sm text-gray-400 border border-gray-600/50">
          Built with APML Framework v1.3.2 • Last Updated: {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};