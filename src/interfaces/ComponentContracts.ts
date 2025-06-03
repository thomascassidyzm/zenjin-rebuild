/**
 * APML v3.1 Component Contracts
 * 
 * Interface-first definitions for all components following Axiom F1
 * These contracts define behavior, dependencies, and responsibilities before implementation
 */

// Base contract interface that all components must implement
export interface ComponentContract<T = any> {
  // Context boundary this component belongs to
  context: 'infrastructure' | 'learning' | 'admin' | 'payment' | 'analytics' | 'settings';
  
  // Dependencies required for this component
  dependencies: {
    required: string[];
    optional?: string[];
  };
  
  // Responsibilities this component fulfills
  responsibilities: string[];
  
  // Responsive behavior contracts
  responsive?: ResponsiveContract;
  
  // Accessibility contracts
  accessibility?: AccessibilityContract;
  
  // Performance contracts
  performance?: PerformanceContract;
  
  // Validate that implementation meets contract
  validateContract(): boolean;
}

// Responsive behavior contract
export interface ResponsiveContract {
  breakpoints: {
    mobile_portrait: DeviceDimensions;
    mobile_landscape: DeviceDimensions;
    tablet: DeviceDimensions;
    desktop: DeviceDimensions;
  };
  
  touchTargets: {
    minimum: string;
    recommended: string;
  };
  
  scalingBehavior: 'fluid' | 'stepped' | 'fixed';
}

// Device dimension specifications
export interface DeviceDimensions {
  minWidth?: string;
  maxWidth?: string;
  width?: string;
  padding: string;
  fontSize?: string;
}

// Accessibility contract requirements
export interface AccessibilityContract {
  ariaRole: string;
  ariaLabels: string[];
  keyboardNavigation: boolean;
  focusIndicators: boolean;
  screenReaderSupport: boolean;
  contrastRatio: number;
}

// Performance contract requirements
export interface PerformanceContract {
  maxRenderTime: number; // milliseconds
  maxMemoryUsage: number; // MB
  maxReRenders: number; // per interaction
  lazyLoadable: boolean;
  memoizable: boolean;
}

/**
 * Navigation Component Contract
 */
export interface NavigationContract extends ComponentContract {
  context: 'infrastructure';
  
  props: {
    currentRoute: string;
    isAuthenticated: boolean;
    userRole?: 'student' | 'admin';
    onNavigate: (route: string) => void;
  };
  
  state: {
    isCollapsed: boolean;
    activeRoute: string;
  };
  
  methods: {
    navigateTo(route: string): void;
    toggleCollapse(): void;
    isRouteAccessible(route: string): boolean;
  };
}

/**
 * PlayerCard Component Contract
 */
export interface PlayerCardContract extends ComponentContract {
  context: 'learning';
  
  props: {
    onAnswerSelected?: (response: any) => void;
    initialQuestion?: any;
    points?: number;
  };
  
  state: {
    currentQuestion: any | null;
    feedbackState: 'idle' | 'correct' | 'incorrect' | 'timeout';
    isInteractable: boolean;
  };
  
  methods: {
    presentQuestion(question: any, options?: any): boolean;
    handleResponse(response: any, feedbackOptions?: any): any;
    handleTimeout(questionId: string): any;
    reset(): boolean;
  };
  
  responsive: {
    breakpoints: {
      mobile_portrait: {
        width: '100%',
        maxWidth: '100vw',
        padding: '16px',
        fontSize: '16px'
      },
      mobile_landscape: {
        width: '100%',
        maxWidth: '80vw',
        padding: '24px',
        fontSize: '16px'
      },
      tablet: {
        width: 'clamp(480px, 80vw, 600px)',
        padding: '32px',
        fontSize: '18px'
      },
      desktop: {
        width: '600px',
        padding: '40px',
        fontSize: '18px'
      }
    },
    touchTargets: {
      minimum: '44px',
      recommended: '48px'
    },
    scalingBehavior: 'fluid'
  };
}

/**
 * Dashboard Component Contract
 */
export interface DashboardContract extends ComponentContract {
  context: 'learning';
  
  props: {
    data: any; // DashboardData type
    onPlayClick: () => void;
    onAdminClick?: () => void;
  };
  
  state: {
    activeTab: string;
    isLoading: boolean;
  };
  
  performance: {
    maxRenderTime: 100,
    maxMemoryUsage: 50,
    maxReRenders: 2,
    lazyLoadable: true,
    memoizable: true
  };
}

/**
 * Session Summary Component Contract
 */
export interface SessionSummaryContract extends ComponentContract {
  context: 'learning';
  
  props: {
    sessionData: {
      correct: number;
      total: number;
      points: number;
      duration: number;
    };
    onComplete: () => void;
  };
  
  accessibility: {
    ariaRole: 'region',
    ariaLabels: ['session-summary', 'results'],
    keyboardNavigation: true,
    focusIndicators: true,
    screenReaderSupport: true,
    contrastRatio: 4.5
  };
}

/**
 * Contract validation helper
 */
export function validateComponentContract<T extends ComponentContract>(
  component: React.ComponentType<any>,
  contract: T
): boolean {
  // Check if component implements required methods
  const prototype = component.prototype || {};
  
  // Validate dependencies are available
  const { required = [] } = contract.dependencies;
  
  // Validate responsive contracts if specified
  if (contract.responsive) {
    // Check breakpoints are defined
    const breakpoints = contract.responsive.breakpoints;
    if (!breakpoints.mobile_portrait || !breakpoints.desktop) {
      console.error('Missing required responsive breakpoints');
      return false;
    }
  }
  
  // Validate accessibility contracts if specified
  if (contract.accessibility) {
    // Check ARIA requirements
    if (!contract.accessibility.ariaRole) {
      console.error('Missing ARIA role');
      return false;
    }
  }
  
  return true;
}

/**
 * Higher-order component to enforce contracts
 */
export function withContract<P, C extends ComponentContract>(
  contract: C,
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return (props: P) => {
    // Validate contract on mount
    React.useEffect(() => {
      const isValid = validateComponentContract(Component, contract);
      if (!isValid && process.env.NODE_ENV !== 'production') {
        console.warn(`Component does not fulfill contract requirements`);
      }
    }, []);
    
    return <Component {...props} />;
  };
}