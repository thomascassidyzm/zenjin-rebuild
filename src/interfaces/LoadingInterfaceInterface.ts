/**
 * LoadingInterface Interface Specification  
 * APML Framework v1.3.3 Compliant
 * 
 * Defines the reusable loading interface with magical math animations
 * Used across multiple contexts: initial load, auth, session init, player state
 */

export interface LoadingInterfaceInterface {
  // Core Interface Properties
  context: LoadingContext;
  phase: LoadingPhase;
  progress: number; // 0-100
  isVisible: boolean;
  
  // Animation Control
  animationType: LoadingAnimationType;
  animationState: LoadingAnimationState;
  mathSymbolsEnabled: boolean;
  
  // Context-Specific Configuration
  loadingSteps: LoadingStep[];
  currentStep: LoadingStep | null;
  estimatedDuration: number;
  
  // Lifecycle Methods
  show: (context: LoadingContext) => Promise<void>;
  hide: () => Promise<void>;
  updateProgress: (progress: number, step?: LoadingStep) => void;
  complete: () => Promise<void>;
  
  // Animation Methods
  startMathAnimation: () => void;
  stopMathAnimation: () => void;
  updateAnimationIntensity: (intensity: number) => void;
}

export enum LoadingContext {
  INITIAL_APP_LOAD = 'initial_app_load',
  USER_AUTHENTICATION = 'user_authentication', 
  SESSION_INITIALIZATION = 'session_initialization',
  PLAYER_STATE_LOADING = 'player_state_loading',
  BACKEND_CONNECTION = 'backend_connection',
  ENGINE_STARTUP = 'engine_startup',
  CONTENT_LOADING = 'content_loading'
}

export enum LoadingPhase {
  HIDDEN = 'hidden',
  APPEARING = 'appearing',
  LOADING = 'loading', 
  COMPLETING = 'completing',
  DISAPPEARING = 'disappearing',
  COMPLETE = 'complete'
}

export enum LoadingAnimationType {
  MATH_SYMBOLS = 'math_symbols',
  PROGRESS_BAR = 'progress_bar',
  SPINNING_EQUATIONS = 'spinning_equations',
  CASCADING_NUMBERS = 'cascading_numbers',
  GEOMETRIC_PATTERNS = 'geometric_patterns',
  MINIMAL = 'minimal'
}

export interface LoadingAnimationState {
  mathSymbols: MathSymbolState[];
  backgroundEffects: BackgroundEffectState;
  progressIndicator: ProgressIndicatorState;
  logoState: LogoAnimationState;
}

export interface MathSymbolState {
  id: string;
  symbol: string; // +, -, ×, ÷, =, π, ∞, etc.
  x: number;
  y: number;
  velocity: { x: number; y: number };
  rotation: number;
  scale: number;
  opacity: number;
  color: string;
}

export interface BackgroundEffectState {
  gradientPosition: number;
  particleCount: number;
  waveAmplitude: number;
  effectIntensity: number;
}

export interface ProgressIndicatorState {
  type: 'bar' | 'circle' | 'dots' | 'custom';
  progress: number;
  isAnimating: boolean;
  color: string;
  secondaryColor: string;
}

export interface LogoAnimationState {
  scale: number;
  rotation: number;
  opacity: number;
  glowIntensity: number;
}

export interface LoadingStep {
  id: string;
  label: string;
  description?: string;
  estimatedDuration: number;
  priority: LoadingStepPriority;
  isCompleted: boolean;
  hasError: boolean;
  errorMessage?: string;
}

export enum LoadingStepPriority {
  CRITICAL = 'critical',
  HIGH = 'high', 
  MEDIUM = 'medium',
  LOW = 'low',
  OPTIONAL = 'optional'
}

export interface LoadingInterfaceProps {
  // Required Props
  context: LoadingContext;
  onLoadingComplete: () => void;
  
  // Optional Props
  customSteps?: LoadingStep[];
  animationType?: LoadingAnimationType;
  estimatedDuration?: number;
  branding?: LoadingBranding;
  accessibility?: LoadingAccessibilityConfig;
  performance?: LoadingPerformanceConfig;
}

export interface LoadingBranding {
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  customMathSymbols?: string[];
  backgroundStyle: 'gradient' | 'solid' | 'animated';
}

export interface LoadingAccessibilityConfig {
  reducedMotion: boolean;
  highContrast: boolean;
  screenReaderAnnouncements: boolean;
  focusManagement: boolean;
  respectPrefersReducedMotion: boolean;
}

export interface LoadingPerformanceConfig {
  maxMathSymbols: number;
  animationFPS: number;
  enableGPUAcceleration: boolean;
  pauseOnInactive: boolean;
  memoryOptimized: boolean;
}

// Context-Specific Configurations
export interface LoadingContextConfig {
  [LoadingContext.INITIAL_APP_LOAD]: {
    steps: LoadingStep[];
    animationType: LoadingAnimationType.MATH_SYMBOLS;
    showBranding: true;
    estimatedDuration: 2000;
  };
  
  [LoadingContext.USER_AUTHENTICATION]: {
    steps: LoadingStep[];
    animationType: LoadingAnimationType.PROGRESS_BAR;
    showBranding: false;
    estimatedDuration: 1000;
  };
  
  [LoadingContext.SESSION_INITIALIZATION]: {
    steps: LoadingStep[];
    animationType: LoadingAnimationType.SPINNING_EQUATIONS;
    showBranding: false;
    estimatedDuration: 1500;
  };
  
  [LoadingContext.PLAYER_STATE_LOADING]: {
    steps: LoadingStep[];
    animationType: LoadingAnimationType.CASCADING_NUMBERS;
    showBranding: false;
    estimatedDuration: 800;
  };
}

// Event Types
export interface LoadingInterfaceEvents {
  onPhaseChanged: (newPhase: LoadingPhase, context: LoadingContext) => void;
  onStepCompleted: (step: LoadingStep, context: LoadingContext) => void;
  onProgressUpdated: (progress: number, context: LoadingContext) => void;
  onAnimationFrame: (animationState: LoadingAnimationState) => void;
  onError: (error: LoadingInterfaceError) => void;
  onPerformanceWarning: (warning: PerformanceWarning) => void;
}

export interface LoadingInterfaceError {
  code: LoadingErrorCode;
  message: string;
  context: LoadingContext;
  step?: LoadingStep;
  timestamp: string;
}

export enum LoadingErrorCode {
  ANIMATION_PERFORMANCE_DEGRADED = 'animation_performance_degraded',
  STEP_TIMEOUT = 'step_timeout',
  MATH_SYMBOL_GENERATION_FAILED = 'math_symbol_generation_failed',
  ACCESSIBILITY_ERROR = 'accessibility_error',
  CONTEXT_SWITCH_FAILED = 'context_switch_failed'
}

export interface PerformanceWarning {
  type: 'high_cpu' | 'memory_usage' | 'frame_rate_drop' | 'gpu_overload';
  severity: 'low' | 'medium' | 'high';
  recommendedAction: string;
  currentMetrics: PerformanceMetrics;
}

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number; // MB
  cpuUsage: number; // percentage
  activeAnimations: number;
  mathSymbolCount: number;
}

// State Management Interface
export interface LoadingInterfaceState {
  phase: LoadingPhase;
  context: LoadingContext;
  progress: number;
  currentStep: LoadingStep | null;
  animationState: LoadingAnimationState;
  error: LoadingInterfaceError | null;
  performance: PerformanceMetrics;
}

// APML Validation Interface
export interface LoadingInterfaceValidation {
  validateContext: (context: LoadingContext) => ValidationResult;
  validateSteps: (steps: LoadingStep[]) => ValidationResult;
  validateAnimation: (animationType: LoadingAnimationType) => ValidationResult;
  validatePerformance: (metrics: PerformanceMetrics) => ValidationResult;
  validateAccessibility: (config: LoadingAccessibilityConfig) => ValidationResult;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
  performanceScore: number; // 0-100
}

// Integration Interface
export interface LoadingInterfaceIntegration {
  // LaunchInterface Integration
  connectToLaunchInterface: (launchInterface: any) => void;
  
  // UserSessionManager Integration
  connectToSessionManager: (sessionManager: any) => void;
  
  // Engine Integration
  connectToEngines: (engines: any[]) => void;
  
  // Performance Monitor Integration
  connectToPerformanceMonitor: (monitor: any) => void;
}

export default LoadingInterfaceInterface;