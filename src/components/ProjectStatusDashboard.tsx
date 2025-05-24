import React, { useState } from 'react';
import { APMLBackendTester } from './APMLBackendTester';
import { APMLValidationSuite } from './APMLValidationSuite/APMLValidationSuite';

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
  { 
    name: 'UserInterface', 
    interfaces: '5/5', 
    components: '5/5', 
    status: 'integrated', 
    completion: 95,
    purpose: 'User-facing components including Player Card, feedback system, visual theming, animations, and layout management',
    contextBoundary: 'Encompasses all visual components, user interactions, theme management, and frontend presentation logic',
    validationCriteria: [
      { id: 'UI-001', description: 'Player Card shows greenish glow for correct answers, reddish glow with shudder for incorrect' },
      { id: 'UI-002', description: 'Background displays calming bubble animation maintaining 60fps on target devices' },
      { id: 'UI-003', description: 'All components consistently apply theme with rich colors, gradients, and dark theme' },
      { id: 'UI-004', description: 'Session Summary correctly displays and animates all session metrics' },
      { id: 'UI-005', description: 'Dashboard correctly displays lifetime metrics including Evolution and Global Ranking' }
    ]
  },
  { 
    name: 'LearningEngine', 
    interfaces: '6/6', 
    components: '6/6', 
    status: 'functional', 
    completion: 85,
    purpose: 'Core learning algorithms implementing distinction-based pedagogy with 5-boundary levels, question generation, and adaptive content',
    contextBoundary: 'Encompasses learning algorithms, distinction management, question generation, distractor generation, and curriculum logic',
    validationCriteria: [
      { id: 'LE-001', description: 'Five boundary levels implementation with proper thresholds' },
      { id: 'LE-002', description: 'Question generation produces appropriate difficulty progression' },
      { id: 'LE-003', description: 'Distractor generation creates plausible but incorrect answers' },
      { id: 'LE-004', description: 'Distinction manager accurately tracks learner progress across boundaries' },
      { id: 'LE-005', description: 'Content repository provides reliable fact storage and retrieval' }
    ]
  },
  { 
    name: 'ProgressionSystem', 
    interfaces: '4/4', 
    components: '4/4', 
    status: 'functional', 
    completion: 85,
    purpose: 'Triple Helix model implementation with spaced repetition, stitch management, and progress tracking using positions-as-first-class-citizens',
    contextBoundary: 'Covers spaced repetition algorithms, stitch progression, tube rotation, and learning path management',
    validationCriteria: [
      { id: 'PS-001', description: 'Spaced repetition follows fixed sequence [4, 8, 15, 30, 100, 1000] days' },
      { id: 'PS-002', description: 'Triple Helix tube rotation (addition → multiplication → subtraction) works seamlessly' },
      { id: 'PS-003', description: 'Stitch positions are treated as first-class citizens in the system' },
      { id: 'PS-004', description: 'Progress tracking accurately reflects learner advancement through sequences' },
      { id: 'PS-005', description: 'Perfect completion (=20/20) advances stitches, imperfect (<20/20) keeps them active' }
    ]
  },
  { 
    name: 'MetricsSystem', 
    interfaces: '4/4', 
    components: '4/4', 
    status: 'functional', 
    completion: 90,
    purpose: 'Comprehensive metrics calculation including FTC/EC/Bonus points, session tracking, lifetime aggregation, and analytics storage',
    contextBoundary: 'Handles all numerical tracking, performance calculation, session metrics, and long-term analytics',
    validationCriteria: [
      { id: 'MS-001', description: 'Session metrics calculation accuracy for FTC, EC, and Bonus points' },
      { id: 'MS-002', description: 'Lifetime metrics aggregation produces correct Evolution calculations' },
      { id: 'MS-003', description: 'Metrics storage persists data reliably across sessions' },
      { id: 'MS-004', description: 'Performance tracking provides meaningful analytics for learning optimization' },
      { id: 'MS-005', description: 'Global ranking algorithms function correctly with fair comparisons' }
    ]
  },
  { 
    name: 'SubscriptionSystem', 
    interfaces: '3/3', 
    components: '3/3', 
    status: 'functional', 
    completion: 85,
    purpose: 'Subscription management with content access control, payment processing, and tier-based feature restrictions',
    contextBoundary: 'Covers subscription tiers, payment integration, content access control, and billing management',
    validationCriteria: [
      { id: 'SS-001', description: 'Subscription tiers properly restrict access to premium content' },
      { id: 'SS-002', description: 'Payment processing integrates securely with async operations and gateway adapters' },
      { id: 'SS-003', description: 'Content access controller enforces subscription boundaries and updateUserAccess integration' },
      { id: 'SS-004', description: 'SubscriptionManager handles create/update/cancel operations with proper error handling' },
      { id: 'SS-005', description: 'PaymentProcessorAdapter bridges SubscriptionManager with complex payment processing' }
    ]
  },
  { 
    name: 'OfflineSupport', 
    interfaces: '4/4', 
    components: '4/4', 
    status: 'functional', 
    completion: 75,
    purpose: 'Offline functionality with local storage, sync conflict resolution, and connectivity management for uninterrupted learning',
    contextBoundary: 'Encompasses offline storage, synchronization logic, conflict resolution, and connectivity detection',
    validationCriteria: [
      { id: 'OS-001', description: 'Offline storage maintains learning session data when disconnected' },
      { id: 'OS-002', description: 'Synchronization manager resolves conflicts between offline and online data' },
      { id: 'OS-003', description: 'Content cache preloads essential learning materials for offline use' },
      { id: 'OS-004', description: 'Connectivity manager accurately detects online/offline state changes' },
      { id: 'OS-005', description: 'Sync queue processes pending changes when connection is restored' }
    ]
  },
  { 
    name: 'UserManagement', 
    interfaces: '1/1', 
    components: '1/1', 
    status: 'functional', 
    completion: 90,
    purpose: 'Anonymous user lifecycle management with TTL expiration, registration conversion, and data preservation',
    contextBoundary: 'Handles anonymous user creation, lifecycle management, and seamless conversion to registered accounts',
    validationCriteria: [
      { id: 'UM-001', description: 'Anonymous users can start learning immediately without registration barriers' },
      { id: 'UM-002', description: 'TTL expiration automatically cleans up expired anonymous sessions' },
      { id: 'UM-003', description: 'Conversion to registered accounts preserves all learning progress and metrics' },
      { id: 'UM-004', description: 'User session management maintains consistent identity across app usage' },
      { id: 'UM-005', description: 'Data migration between anonymous and registered states is lossless' }
    ]
  },
  { 
    name: 'BackendServices', 
    interfaces: '5/5', 
    components: '6/6', 
    status: 'integrated', 
    completion: 95,
    purpose: 'Backend integration using Supabase and Vercel for authentication, state persistence, real-time sync, and API endpoints with frontend integration',
    contextBoundary: 'Database schema, authentication patterns, API endpoints, real-time subscriptions, state synchronization, user migration logic, React context integration',
    validationCriteria: [
      { id: 'BS-001', description: 'Anonymous users can be created and immediately start using the app without registration' },
      { id: 'BS-002', description: 'Anonymous users can seamlessly convert to registered accounts with full data migration' },
      { id: 'BS-003', description: 'User state changes are synchronized in real-time across multiple devices/sessions' },
      { id: 'BS-004', description: 'State updates use optimistic locking to handle concurrent modifications' },
      { id: 'BS-005', description: 'Session metrics are accurately recorded and retrievable for analytics' },
      { id: 'BS-006', description: 'API endpoints handle authentication and authorization correctly' },
      { id: 'BS-007', description: 'Real-time subscriptions automatically reconnect on connection failures' },
      { id: 'BS-008', description: 'Database operations are protected by Row Level Security (RLS) policies' },
      { id: 'BS-009', description: 'Expired anonymous users are automatically cleaned up to prevent data bloat' },
      { id: 'BS-010', description: 'All API responses follow consistent error handling and response format' }
    ]
  }
];

const recentAchievements = [
  { date: '2025-05-24', title: 'SubscriptionSystem Advanced to Functional', description: 'All 3 components functional with async payment processing, gateway adapters, and integration testing (12/12 tests passing)' },
  { date: '2025-05-24', title: 'PaymentProcessorAdapter Created', description: 'Bridge component successfully integrates SubscriptionManager with complex PaymentProcessor using async operations' },
  { date: '2025-05-24', title: 'Backend Services Integration Complete', description: 'UserSessionManager fully integrated with frontend components via React Context' },
  { date: '2025-05-24', title: 'APML Interface-First Success', description: 'UserSessionManagerInterface.apml created before implementation, full APML compliance' }
];

const nextSteps = [
  { title: 'OfflineSupport Enhancement', priority: 'high', description: 'Implement SynchronizationManager conflict resolution for multi-device usage' },
  { title: 'Live Deployment Testing', priority: 'high', description: 'Deploy to Vercel and test end-to-end backend integration in production' },
  { title: 'ContentManager Enhancement', priority: 'medium', description: 'Add curriculum import/export tools for admin functionality' },
  { title: 'MetricsSystem Global Ranking', priority: 'low', description: 'Implement global ranking algorithms in LifetimeMetricsManager' }
];

export const ProjectStatusDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'testing' | 'timeline'>('overview');
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

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

            {/* APML Module Documentation */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white mb-4">APML Module Documentation</h2>
              {moduleData.map((module, index) => {
                const status = getStatusLevel(module.status);
                const isExpanded = expandedModules.includes(module.name);
                
                const toggleExpanded = () => {
                  setExpandedModules(prev => 
                    isExpanded 
                      ? prev.filter(name => name !== module.name)
                      : [...prev, module.name]
                  );
                };
                
                return (
                  <div key={module.name} className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-600/50">
                    {/* Module Header */}
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-700/30 transition-all duration-200 rounded-xl"
                      onClick={toggleExpanded}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl">{status.symbol}</div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{module.name}</h3>
                            <p className="text-sm text-gray-400">{module.interfaces} interfaces • {module.components} components • {module.completion}% complete</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            status.name === 'integrated' ? 'bg-green-500/20 text-green-300 border-green-500/50' :
                            status.name === 'functional' ? 'bg-orange-500/20 text-orange-300 border-orange-500/50' :
                            status.name === 'scaffolded' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' :
                            'bg-gray-500/20 text-gray-300 border-gray-500/50'
                          }`}>
                            {status.name}
                          </span>
                          <div className={`transform transition-transform duration-200 text-gray-400 ${isExpanded ? 'rotate-180' : ''}`}>
                            ▼
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Content */}
                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-4">
                        {/* Purpose */}
                        <div>
                          <h4 className="text-sm font-semibold text-blue-300 mb-2">Purpose</h4>
                          <p className="text-sm text-gray-300">{module.purpose}</p>
                        </div>

                        {/* Context Boundary */}
                        <div>
                          <h4 className="text-sm font-semibold text-purple-300 mb-2">Context Boundary</h4>
                          <p className="text-sm text-gray-300">{module.contextBoundary}</p>
                        </div>

                        {/* Validation Criteria */}
                        <div>
                          <h4 className="text-sm font-semibold text-green-300 mb-2">Validation Criteria ({module.validationCriteria.length})</h4>
                          <div className="grid grid-cols-1 gap-2">
                            {module.validationCriteria.map((criteria, idx) => (
                              <div key={criteria.id} className="flex items-start space-x-3 p-2 rounded-lg bg-gray-700/30">
                                <span className="text-xs font-mono text-blue-400 mt-0.5">{criteria.id}</span>
                                <span className="text-xs text-gray-300 flex-1">{criteria.description}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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


        {/* Testing Tab */}
        {activeTab === 'testing' && (
          <div className="space-y-6">
            {/* APML Validation Suite - Comprehensive Module Testing */}
            <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-600/50">
              <div className="p-4 border-b border-gray-600/50">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span>🧪</span>
                  APML Comprehensive Module Validation
                </h2>
                <p className="text-gray-300 text-sm mt-1">
                  Evidence-based validation for module status advancement following APML Framework v1.3.3
                </p>
              </div>
              <div className="p-6">
                <APMLValidationSuite />
              </div>
            </div>

            {/* Backend Services Testing - Existing System */}
            <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-600/50">
              <div className="p-4 border-b border-gray-600/50">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span>🔧</span>
                  Backend Services Validation
                </h2>
                <p className="text-gray-300 text-sm mt-1">
                  Interface compliance testing for Supabase integration and backend orchestration
                </p>
              </div>
              <div className="p-6">
                <APMLBackendTester />
              </div>
            </div>
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
          Built with APML Framework v1.3.3 • Last Updated: {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};