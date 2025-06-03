/**
 * APML v3.1 Context Boundaries Configuration
 * 
 * Defines module federation boundaries following Axiom F6 (Context Boundary Principle)
 * Each context has its own bundle, size limit, and loading strategy
 */

export interface ContextDefinition {
  name: string;
  routes: string[];
  components: string[];
  maxSize: string;
  preload: boolean;
  dependencies: string[];
}

export interface ContextConfiguration {
  [key: string]: ContextDefinition;
}

/**
 * Context boundary definitions for the Zenjin Maths App
 * Following APML v3.1 principles for proper module federation
 */
export const contextConfiguration: ContextConfiguration = {
  /**
   * Core Infrastructure Context
   * Always loaded - contains essential services and state management
   */
  infrastructure: {
    name: 'core',
    routes: ['*'], // Available on all routes
    components: [
      'ServiceContainer',
      'AuthToPlayerEventBus',
      'ConnectivityManager',
      'UserSessionContext',
      'ConfigurationService'
    ],
    maxSize: '100KB',
    preload: true,
    dependencies: []
  },

  /**
   * Learning Context
   * Primary user experience - preloaded after authentication
   */
  learning: {
    name: 'learning',
    routes: ['/play', '/dashboard', '/session', '/'],
    components: [
      'PlayerCard',
      'Dashboard',
      'SessionSummary',
      'FeedbackSystem',
      'PreEngagementCard',
      'MathLoadingAnimation',
      'LearningSession'
    ],
    maxSize: '120KB',
    preload: true,
    dependencies: ['infrastructure']
  },

  /**
   * Admin Context
   * Administrative functions - lazy loaded on demand
   */
  admin: {
    name: 'admin',
    routes: ['/admin', '/admin/*'],
    components: [
      'AdminRouter',
      'AdminDashboard',
      'ContentManager',
      'UserManagement',
      'AdminEntryPoint'
    ],
    maxSize: '80KB',
    preload: false,
    dependencies: ['infrastructure']
  },

  /**
   * Payment Context
   * Subscription and billing - lazy loaded when needed
   */
  payment: {
    name: 'payment',
    routes: ['/subscribe', '/billing', '/subscription/*'],
    components: [
      'SubscriptionUpgrade',
      'SubscriptionManagement',
      'SubscriptionSuccess',
      'SubscriptionCancelled',
      'ContentGatingPrompt',
      'StripeIntegration'
    ],
    maxSize: '60KB',
    preload: false,
    dependencies: ['infrastructure']
  },

  /**
   * Analytics Context
   * Reporting and status - lazy loaded
   */
  analytics: {
    name: 'analytics',
    routes: ['/project-status', '/reports'],
    components: [
      'ProjectStatusDashboard',
      'PerformanceCharts',
      'UserProgressReports'
    ],
    maxSize: '40KB',
    preload: false,
    dependencies: ['infrastructure']
  },

  /**
   * Settings Context
   * User preferences and configuration - lazy loaded
   */
  settings: {
    name: 'settings',
    routes: ['/settings', '/profile'],
    components: [
      'UserSettings',
      'OfflineContentManager',
      'ProfileManagement'
    ],
    maxSize: '40KB',
    preload: false,
    dependencies: ['infrastructure']
  }
};

/**
 * Get context for a given route
 */
export function getContextForRoute(route: string): ContextDefinition | null {
  for (const [key, context] of Object.entries(contextConfiguration)) {
    if (context.routes.some(r => {
      if (r === '*') return true;
      if (r.endsWith('/*')) {
        const prefix = r.slice(0, -2);
        return route.startsWith(prefix);
      }
      return r === route;
    })) {
      return context;
    }
  }
  return null;
}

/**
 * Get all contexts that should be preloaded
 */
export function getPreloadContexts(): ContextDefinition[] {
  return Object.values(contextConfiguration).filter(c => c.preload);
}

/**
 * Validate that a context's bundle size is within limits
 */
export function validateContextSize(contextName: string, actualSize: number): boolean {
  const context = contextConfiguration[contextName];
  if (!context) return false;
  
  const maxSizeKB = parseInt(context.maxSize);
  const actualSizeKB = Math.round(actualSize / 1024);
  
  return actualSizeKB <= maxSizeKB;
}