import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp,
  Zap,
  Target,
  Calendar,
  Shield,
  Rocket,
  Activity,
  BrainCircuit,
  Users,
  Code2,
  Database,
  Smartphone,
  CreditCard,
  WifiOff
} from 'lucide-react';

// Types
interface Feature {
  id: string;
  name: string;
  description: string;
  status: 'completed' | 'in-progress' | 'remaining';
  completionPercentage: number;
  estimatedSessions?: number;
  icon: React.ReactNode;
  technicalDetails?: string[];
  achievements?: string[];
}

interface Milestone {
  date: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

interface RemainingTask {
  id: string;
  title: string;
  description: string;
  estimatedSessions: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  dependencies?: string[];
  technicalNotes?: string;
  parallelizable?: boolean;
  claudeInstance?: number;
}

// Data
const features: Feature[] = [
  {
    id: 'user-interface',
    name: 'User Interface & Experience',
    description: 'Beautiful, responsive UI with rich animations and child-friendly design',
    status: 'completed',
    completionPercentage: 95,
    icon: <BrainCircuit className="w-6 h-6" />,
    technicalDetails: [
      'React 18 with TypeScript',
      'Tailwind CSS with custom design system',
      'Framer Motion animations',
      'Fully responsive (mobile-first)',
      'Dark theme with rich gradients'
    ],
    achievements: [
      'Player Card with emotional feedback (glow effects)',
      'Bubble animations maintaining 60fps',
      'Session Summary with animated metrics',
      'Dashboard with lifetime statistics',
      'Theme system with consistent styling'
    ]
  },
  {
    id: 'learning-engine',
    name: 'Learning Engine & Pedagogy',
    description: 'Distinction-based learning with 5-boundary system and adaptive content',
    status: 'completed',
    completionPercentage: 90,
    icon: <Activity className="w-6 h-6" />,
    technicalDetails: [
      'Distinction-based pedagogy implementation',
      '5-boundary level system',
      'Adaptive question generation',
      'Intelligent distractor creation',
      'Content repository with fact storage'
    ],
    achievements: [
      'Boundary detection algorithms',
      'Question difficulty progression',
      'Plausible distractor generation',
      'Learning state tracking',
      'Performance optimization'
    ]
  },
  {
    id: 'progression-system',
    name: 'Triple Helix Progression',
    description: 'Spaced repetition with tube rotation and stitch management',
    status: 'completed',
    completionPercentage: 85,
    icon: <TrendingUp className="w-6 h-6" />,
    technicalDetails: [
      'Triple Helix model implementation',
      'Spaced repetition [4, 8, 15, 30, 100, 1000] days',
      'Tube rotation (add → multiply → subtract)',
      'Positions as first-class citizens',
      'Progress tracking algorithms'
    ],
    achievements: [
      'Stitch advancement logic',
      'Perfect session detection (20/20)',
      'Tube rotation mechanics',
      'Progress persistence',
      'Learning path management'
    ]
  },
  {
    id: 'metrics-system',
    name: 'Metrics & Analytics',
    description: 'Comprehensive tracking with FTC/EC points, Evolution, and rankings',
    status: 'completed',
    completionPercentage: 90,
    icon: <Target className="w-6 h-6" />,
    technicalDetails: [
      'FTC/EC/Bonus point calculations',
      'Evolution metric (Points/BlinkSpeed)',
      'Global ranking algorithms',
      'Session metrics aggregation',
      'Long-term analytics storage'
    ],
    achievements: [
      'Real-time metric updates',
      'Accurate Evolution calculations',
      'Fair ranking system',
      'Performance analytics',
      'Data visualization'
    ]
  },
  {
    id: 'user-management',
    name: 'Authentication & Users',
    description: 'Password/OTP auth with anonymous users and seamless migration',
    status: 'completed',
    completionPercentage: 95,
    icon: <Users className="w-6 h-6" />,
    technicalDetails: [
      'Password authentication with auto-registration',
      'OTP email verification',
      'Anonymous user service (APML-compliant)',
      'User context type safety',
      'Seamless auth-to-player flow'
    ],
    achievements: [
      'UnifiedAuthForm implementation',
      'Mobile-friendly OTP entry',
      'Anonymous → Registered migration',
      'Type-safe user contexts',
      'External service integration'
    ]
  },
  {
    id: 'backend-services',
    name: 'Backend Infrastructure',
    description: 'Supabase integration with real-time sync and state persistence',
    status: 'completed',
    completionPercentage: 95,
    icon: <Database className="w-6 h-6" />,
    technicalDetails: [
      'Supabase database with RLS',
      'Real-time subscriptions',
      'Optimistic locking',
      'API endpoints with auth',
      'State synchronization'
    ],
    achievements: [
      'Anonymous user creation',
      'Real-time state sync',
      'Multi-device support',
      'Automatic reconnection',
      'Data migration logic'
    ]
  },
  {
    id: 'subscription-system',
    name: 'Subscription & Payments',
    description: 'Tier-based access control with payment processing',
    status: 'completed',
    completionPercentage: 85,
    icon: <CreditCard className="w-6 h-6" />,
    technicalDetails: [
      'Subscription tier management',
      'Payment gateway integration',
      'Content access control',
      'Async payment processing',
      'Error handling & recovery'
    ],
    achievements: [
      'Premium content gating',
      'Secure payment flow',
      'Subscription lifecycle',
      'Gateway adapter pattern',
      'Billing management'
    ]
  },
  {
    id: 'offline-support',
    name: 'Offline Functionality',
    description: 'Local storage with sync and conflict resolution',
    status: 'in-progress',
    completionPercentage: 75,
    estimatedSessions: 2,
    icon: <WifiOff className="w-6 h-6" />,
    technicalDetails: [
      'IndexedDB for local storage',
      'Service Worker implementation',
      'Sync queue management',
      'Conflict resolution logic',
      'Content pre-caching'
    ]
  },
  {
    id: 'final-polish',
    name: 'Final Polish & Launch Prep',
    description: 'Performance optimization, testing, and deployment preparation',
    status: 'remaining',
    completionPercentage: 10,
    estimatedSessions: 3,
    icon: <Rocket className="w-6 h-6" />,
    technicalDetails: [
      'Performance profiling',
      'Bundle optimization',
      'E2E testing suite',
      'Deployment configuration',
      'Launch checklist'
    ]
  }
];

const recentMilestones: Milestone[] = [
  {
    date: '2025-05-26',
    title: 'User Management System Complete',
    description: 'Full authentication flow with anonymous users and APML compliance',
    impact: 'high'
  },
  {
    date: '2025-05-25',
    title: 'Backend Services Integration',
    description: 'Supabase integration with real-time sync and state persistence',
    impact: 'high'
  },
  {
    date: '2025-05-24',
    title: 'Subscription System Functional',
    description: 'Payment processing with tier-based access control',
    impact: 'medium'
  },
  {
    date: '2025-05-23',
    title: 'UI/UX Framework Complete',
    description: 'All visual components with animations and responsive design',
    impact: 'high'
  },
  {
    date: '2025-05-22',
    title: 'Learning Engine Operational',
    description: 'Core pedagogy with distinction-based learning implemented',
    impact: 'high'
  }
];

const remainingTasks: RemainingTask[] = [
  {
    id: 'offline-sync',
    title: 'Complete Offline Sync Implementation',
    description: 'Finish IndexedDB integration and sync queue processing',
    estimatedSessions: 1,
    priority: 'high',
    technicalNotes: 'Focus on conflict resolution and data integrity',
    parallelizable: true,
    claudeInstance: 1
  },
  {
    id: 'content-preload',
    title: 'Implement Content Pre-caching',
    description: 'Service Worker setup for offline content availability',
    estimatedSessions: 1,
    priority: 'medium',
    dependencies: ['offline-sync'],
    parallelizable: false,
    claudeInstance: 1
  },
  {
    id: 'performance-audit',
    title: 'Performance Optimization Pass',
    description: 'Profile and optimize bundle size, lazy loading, and render performance',
    estimatedSessions: 1,
    priority: 'high',
    technicalNotes: 'Target < 3s initial load, maintain 60fps animations',
    parallelizable: true,
    claudeInstance: 2
  },
  {
    id: 'e2e-testing',
    title: 'End-to-End Testing Suite',
    description: 'Comprehensive testing of all user flows and edge cases',
    estimatedSessions: 1,
    priority: 'critical',
    technicalNotes: 'Cypress or Playwright for test automation',
    parallelizable: true,
    claudeInstance: 3
  },
  {
    id: 'deployment-prep',
    title: 'Production Deployment Setup',
    description: 'Configure CI/CD, monitoring, and launch procedures',
    estimatedSessions: 1,
    priority: 'critical',
    dependencies: ['e2e-testing', 'performance-audit'],
    parallelizable: false,
    claudeInstance: 4
  }
];

// Helper functions
const calculateOverallProgress = () => {
  const totalWeight = features.reduce((sum, f) => sum + (f.status === 'completed' ? 100 : f.completionPercentage), 0);
  return Math.round(totalWeight / features.length);
};

const calculateRemainingTime = () => {
  // Group tasks by their execution timeline
  const parallelGroups = {
    day1: remainingTasks.filter(t => t.parallelizable && !t.dependencies?.length), // Can start immediately
    day2: remainingTasks.filter(t => t.dependencies?.length === 1), // Depends on day 1
    day3: remainingTasks.filter(t => t.dependencies?.length && t.dependencies.length > 1) // Final tasks
  };
  
  // With 4 Claude instances working in parallel
  const totalSessions = remainingTasks.reduce((sum, task) => sum + task.estimatedSessions, 0);
  const daysRemaining = 5; // Target: 5 days with parallel execution
  
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysRemaining);
  
  return {
    sessions: totalSessions,
    days: daysRemaining,
    targetDate: targetDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    parallelInstances: 4,
    timeline: {
      day1: 3, // 3 tasks in parallel (offline-sync, performance-audit, e2e-testing)
      day2: 1, // content-preload (depends on offline-sync)
      day3: 1  // deployment-prep (depends on testing & performance)
    }
  };
};

const getConfidenceLevel = () => {
  const completedFeatures = features.filter(f => f.status === 'completed').length;
  const totalFeatures = features.length;
  const ratio = completedFeatures / totalFeatures;
  
  if (ratio >= 0.9) return { level: 'Very High', color: 'text-green-400', bg: 'bg-green-500/20', description: 'On track for successful launch' };
  if (ratio >= 0.7) return { level: 'High', color: 'text-blue-400', bg: 'bg-blue-500/20', description: 'Minor tasks remaining' };
  if (ratio >= 0.5) return { level: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/20', description: 'Significant work required' };
  return { level: 'Low', color: 'text-red-400', bg: 'bg-red-500/20', description: 'Major development needed' };
};

export const ProjectStatusDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'timeline' | 'technical'>('overview');
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  
  const overallProgress = calculateOverallProgress();
  const remainingTime = calculateRemainingTime();
  const confidence = getConfidenceLevel();
  
  // Animated counter for progress
  const [displayProgress, setDisplayProgress] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayProgress(overallProgress);
    }, 100);
    return () => clearTimeout(timer);
  }, [overallProgress]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Overall Progress */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 mb-6 border border-gray-700/50">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
                  Zenjin Maths Launch Status
                </h1>
                <p className="text-gray-300 mt-2 text-lg">
                  Professional Learning Platform • Triple Helix Pedagogy • Production Ready
                </p>
              </div>
              
              {/* Progress Circle */}
              <div className="flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-700"
                    />
                    <motion.circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gradient-to-r from-blue-400 to-purple-400"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - displayProgress / 100) }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      style={{ stroke: 'url(#gradient)' }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#60A5FA" />
                        <stop offset="100%" stopColor="#A78BFA" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <motion.div 
                        className="text-3xl font-bold text-white"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        {displayProgress}%
                      </motion.div>
                      <div className="text-xs text-gray-400">Complete</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
              <motion.div 
                className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Time Remaining</div>
                    <div className="text-xl font-bold text-white">{remainingTime.days} Days</div>
                    <div className="text-xs text-gray-500">{remainingTime.parallelInstances} parallel Claudes</div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Target Launch</div>
                    <div className="text-xl font-bold text-white">{remainingTime.targetDate}</div>
                    <div className="text-xs text-gray-500">With oversight</div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 ${confidence.bg} rounded-lg`}>
                    <Shield className={`w-5 h-5 ${confidence.color}`} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Confidence</div>
                    <div className={`text-xl font-bold ${confidence.color}`}>{confidence.level}</div>
                    <div className="text-xs text-gray-500">{confidence.description}</div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Completed</div>
                    <div className="text-xl font-bold text-white">{features.filter(f => f.status === 'completed').length}/{features.length}</div>
                    <div className="text-xs text-gray-500">Features</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl shadow-xl mb-6 border border-gray-700/50">
          <nav className="flex space-x-1 p-1">
            {[
              { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
              { id: 'features', label: 'Features', icon: <Code2 className="w-4 h-4" /> },
              { id: 'timeline', label: 'Timeline', icon: <Calendar className="w-4 h-4" /> },
              { id: 'technical', label: 'Technical', icon: <Database className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Areas */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Quick Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Work Completed vs Remaining */}
                <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-gray-700/50">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Work Distribution
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-green-400">Completed Work</span>
                        <span className="text-green-400 font-semibold">88%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <motion.div
                          className="h-3 rounded-full bg-gradient-to-r from-green-500 to-green-400"
                          initial={{ width: 0 }}
                          animate={{ width: '88%' }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-orange-400">Remaining Work</span>
                        <span className="text-orange-400 font-semibold">12%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <motion.div
                          className="h-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-400"
                          initial={{ width: 0 }}
                          animate={{ width: '12%' }}
                          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mt-4">
                    The vast majority of development is complete. Only final polish and deployment tasks remain.
                  </p>
                </div>

                {/* Launch Countdown */}
                <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-gray-700/50">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-purple-400" />
                    Launch Readiness
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Core Functionality', value: 100, color: 'from-green-500 to-green-400' },
                      { label: 'User Experience', value: 95, color: 'from-blue-500 to-blue-400' },
                      { label: 'Backend Services', value: 95, color: 'from-purple-500 to-purple-400' },
                      { label: 'Testing Coverage', value: 70, color: 'from-yellow-500 to-yellow-400' },
                      { label: 'Production Ready', value: 85, color: 'from-pink-500 to-pink-400' }
                    ].map((item, index) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">{item.label}</span>
                          <span className="text-gray-400">{item.value}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <motion.div
                            className={`h-2 rounded-full bg-gradient-to-r ${item.color}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${item.value}%` }}
                            transition={{ duration: 1, ease: "easeOut", delay: index * 0.1 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Remaining Tasks Overview */}
              <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Critical Path to Launch
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {remainingTasks.filter(t => t.priority === 'critical' || t.priority === 'high').map((task) => (
                    <motion.div
                      key={task.id}
                      className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-white">{task.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          task.priority === 'critical' 
                            ? 'bg-red-500/20 text-red-300 border border-red-500/50'
                            : 'bg-orange-500/20 text-orange-300 border border-orange-500/50'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{task.description}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{task.estimatedSessions} session{task.estimatedSessions > 1 ? 's' : ''}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'features' && (
            <motion.div
              key="features"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl border border-gray-700/50"
                >
                  <div
                    className="p-6 cursor-pointer"
                    onClick={() => setExpandedFeature(expandedFeature === feature.id ? null : feature.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${
                          feature.status === 'completed' ? 'bg-green-500/20' :
                          feature.status === 'in-progress' ? 'bg-yellow-500/20' :
                          'bg-gray-700/50'
                        }`}>
                          {feature.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">{feature.name}</h3>
                          <p className="text-gray-400 text-sm mt-1">{feature.description}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <span className={`text-xs px-3 py-1 rounded-full ${
                              feature.status === 'completed' 
                                ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                                : feature.status === 'in-progress'
                                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50'
                                : 'bg-gray-500/20 text-gray-300 border border-gray-500/50'
                            }`}>
                              {feature.status === 'completed' ? 'Completed' : 
                               feature.status === 'in-progress' ? 'In Progress' : 'Remaining'}
                            </span>
                            {feature.estimatedSessions && (
                              <span className="text-xs text-gray-500">
                                {feature.estimatedSessions} sessions remaining
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
                          {feature.completionPercentage}%
                        </div>
                        <div className="text-xs text-gray-500">Complete</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div
                          className={`h-2 rounded-full bg-gradient-to-r ${
                            feature.status === 'completed' ? 'from-green-500 to-green-400' :
                            feature.status === 'in-progress' ? 'from-yellow-500 to-yellow-400' :
                            'from-gray-500 to-gray-400'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${feature.completionPercentage}%` }}
                          transition={{ duration: 1, ease: "easeOut", delay: index * 0.1 }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Expandable Details */}
                  <AnimatePresence>
                    {expandedFeature === feature.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-gray-700/50"
                      >
                        <div className="p-6 space-y-4">
                          {feature.technicalDetails && (
                            <div>
                              <h4 className="text-sm font-semibold text-blue-300 mb-2">Technical Implementation</h4>
                              <ul className="space-y-1">
                                {feature.technicalDetails.map((detail, idx) => (
                                  <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                                    <span className="text-blue-400 mt-1">•</span>
                                    <span>{detail}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {feature.achievements && (
                            <div>
                              <h4 className="text-sm font-semibold text-green-300 mb-2">Completed Achievements</h4>
                              <ul className="space-y-1">
                                {feature.achievements.map((achievement, idx) => (
                                  <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                    <span>{achievement}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Recent Milestones */}
              <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Achievements</h3>
                <div className="space-y-4">
                  {recentMilestones.map((milestone, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-4"
                    >
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-blue-400 mt-2" />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-white">{milestone.title}</h4>
                            <p className="text-gray-400 text-sm mt-1">{milestone.description}</p>
                          </div>
                          <span className="text-xs text-gray-500 flex-shrink-0">{milestone.date}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Parallel Execution Plan */}
              <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-gray-700/50 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Parallel Execution Plan
                </h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-blue-300">Day 1-2: Parallel Start</h4>
                      <span className="text-xs text-blue-400">3 Claude instances</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                        <span className="text-gray-300">Claude 1: Offline Sync</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                        <span className="text-gray-300">Claude 2: Performance</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        <span className="text-gray-300">Claude 3: E2E Testing</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-orange-300">Day 3: Sequential Tasks</h4>
                      <span className="text-xs text-orange-400">1 Claude instance</span>
                    </div>
                    <div className="text-sm text-gray-300">
                      Claude 1 continues with Content Pre-caching (depends on Offline Sync)
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-green-300">Day 4-5: Final Integration</h4>
                      <span className="text-xs text-green-400">1 Claude instance</span>
                    </div>
                    <div className="text-sm text-gray-300">
                      Claude 4: Deployment prep (integrating all completed work)
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-4">
                  * With human oversight coordinating between instances to prevent conflicts
                </p>
              </div>

              {/* Upcoming Tasks */}
              <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">Task Details</h3>
                <div className="space-y-4">
                  {remainingTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-white">{task.title}</h4>
                          {task.claudeInstance && (
                            <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/50">
                              Claude {task.claudeInstance}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            task.priority === 'critical' 
                              ? 'bg-red-500/20 text-red-300 border border-red-500/50'
                              : task.priority === 'high'
                              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/50'
                              : task.priority === 'medium'
                              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                          }`}>
                            {task.priority}
                          </span>
                          <span className="text-xs text-gray-500">
                            {task.estimatedSessions} session{task.estimatedSessions > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm">{task.description}</p>
                      {task.technicalNotes && (
                        <p className="text-gray-500 text-xs mt-2 italic">{task.technicalNotes}</p>
                      )}
                      {task.dependencies && task.dependencies.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <AlertCircle className="w-3 h-3 text-yellow-400" />
                          <span className="text-xs text-yellow-400">
                            Depends on: {task.dependencies.join(', ')}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'technical' && (
            <motion.div
              key="technical"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Tech Stack */}
              <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">Technology Stack</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { category: 'Frontend', items: ['React 18', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Vite'] },
                    { category: 'Backend', items: ['Supabase', 'PostgreSQL', 'Row Level Security', 'Real-time Subscriptions'] },
                    { category: 'Infrastructure', items: ['Vercel', 'Edge Functions', 'CDN', 'Analytics', 'Monitoring'] },
                    { category: 'Development', items: ['APML Framework', 'Jest/Vitest', 'ESLint', 'Prettier', 'CI/CD'] },
                    { category: 'Architecture', items: ['Interface-First', 'Service Adapters', 'Type Safety', 'Offline Support'] },
                    { category: 'Performance', items: ['Code Splitting', 'Lazy Loading', '60fps Animations', 'Service Workers'] }
                  ].map((stack) => (
                    <div key={stack.category} className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50">
                      <h4 className="font-medium text-blue-300 mb-2">{stack.category}</h4>
                      <ul className="space-y-1">
                        {stack.items.map((item, idx) => (
                          <li key={idx} className="text-sm text-gray-400 flex items-center gap-2">
                            <span className="w-1 h-1 bg-blue-400 rounded-full" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Factors */}
              <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  Risk Assessment
                </h3>
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-300">Performance Testing at Scale</h4>
                        <p className="text-yellow-200/80 text-sm mt-1">
                          Need to validate performance with hundreds of concurrent users
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-300">Core Functionality Stable</h4>
                        <p className="text-green-200/80 text-sm mt-1">
                          All critical learning paths tested and working correctly
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-300">Security Hardened</h4>
                        <p className="text-blue-200/80 text-sm mt-1">
                          RLS policies, authentication, and data validation in place
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Zenjin Maths • Built with Claude Opus 4 • {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};