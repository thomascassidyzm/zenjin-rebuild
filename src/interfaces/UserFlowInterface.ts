/**
 * UserFlowInterface Specification
 * APML Framework v1.3.3 Compliant
 * 
 * Defines the complete user flow orchestration from app startup through authentication choice
 * Replaces automatic anonymous user creation with choice-driven architecture
 */

export interface UserFlowInterface {
  // Flow State Management
  currentFlow: UserFlow;
  flowPhase: UserFlowPhase;
  userChoice: UserAuthChoice | null;
  
  // Flow Control Methods
  startFlow: () => Promise<void>;
  advanceFlow: (nextPhase: UserFlowPhase) => Promise<void>;
  handleUserChoice: (choice: UserAuthChoice) => Promise<void>;
  completeFlow: () => Promise<void>;
  resetFlow: () => Promise<void>;
  
  // Interface Orchestration
  showLoadingInterface: (context: LoadingContext) => Promise<void>;
  showLaunchInterface: () => Promise<void>;
  hideAllInterfaces: () => Promise<void>;
  
  // Session Management Integration
  initializeSession: (authChoice: UserAuthChoice) => Promise<SessionInitResult>;
  createAnonymousSession: () => Promise<SessionInitResult>;
  authenticateUser: (credentials: UserCredentials) => Promise<SessionInitResult>;
}

export enum UserFlow {
  APP_STARTUP = 'app_startup',
  RETURNING_USER = 'returning_user',
  NEW_USER_SIGNUP = 'new_user_signup',
  ANONYMOUS_USER = 'anonymous_user',
  AUTHENTICATION_RECOVERY = 'authentication_recovery'
}

export enum UserFlowPhase {
  // Initial Phases
  APP_INITIALIZING = 'app_initializing',
  ENGINES_LOADING = 'engines_loading',
  BACKEND_CONNECTING = 'backend_connecting',
  
  // Launch Phases  
  SHOWING_WELCOME = 'showing_welcome',
  AWAITING_USER_CHOICE = 'awaiting_user_choice',
  PROCESSING_USER_CHOICE = 'processing_user_choice',
  
  // Authentication Phases
  AUTHENTICATING_USER = 'authenticating_user',
  CREATING_SESSION = 'creating_session',
  LOADING_USER_STATE = 'loading_user_state',
  
  // Completion Phases
  TRANSITIONING_TO_APP = 'transitioning_to_app',
  FLOW_COMPLETE = 'flow_complete',
  
  // Error Phases
  ERROR_OCCURRED = 'error_occurred',
  RECOVERY_MODE = 'recovery_mode'
}

export enum UserAuthChoice {
  SIGN_IN = 'sign_in',
  SIGN_UP = 'sign_up',
  ANONYMOUS = 'anonymous',
  NONE = 'none'
}

export enum LoadingContext {
  INITIAL_APP_LOAD = 'initial_app_load',
  USER_AUTHENTICATION = 'user_authentication',
  SESSION_INITIALIZATION = 'session_initialization', 
  BACKEND_CONNECTION = 'backend_connection',
  USER_STATE_LOADING = 'user_state_loading'
}

export interface UserCredentials {
  email?: string;
  username?: string;
  password?: string;
  rememberMe?: boolean;
  deviceId?: string;
}

export interface SessionInitResult {
  success: boolean;
  sessionId: string | null;
  userId: string | null;
  userType: 'anonymous' | 'authenticated';
  error?: SessionInitError;
  requiresAdditionalSteps?: boolean;
  redirectTo?: string;
}

export interface SessionInitError {
  code: SessionErrorCode;
  message: string;
  details?: any;
  recoverable: boolean;
  suggestedAction?: string;
}

export enum SessionErrorCode {
  NETWORK_ERROR = 'network_error',
  AUTHENTICATION_FAILED = 'authentication_failed',
  SESSION_CREATION_FAILED = 'session_creation_failed',
  BACKEND_UNAVAILABLE = 'backend_unavailable',
  INVALID_CREDENTIALS = 'invalid_credentials',
  ACCOUNT_LOCKED = 'account_locked',
  EMAIL_NOT_VERIFIED = 'email_not_verified'
}

// Flow Configuration Interface
export interface UserFlowConfig {
  // Flow Behavior
  enableAutoAdvance: boolean;
  enableFlowRecovery: boolean;
  maxRetryAttempts: number;
  timeoutDuration: number;
  
  // Interface Configuration
  loadingInterfaceConfig: LoadingInterfaceConfig;
  launchInterfaceConfig: LaunchInterfaceConfig;
  
  // Authentication Configuration
  authenticationOptions: AuthenticationOptions;
  sessionConfiguration: SessionConfiguration;
  
  // Performance Configuration
  performanceConfig: FlowPerformanceConfig;
}

export interface LoadingInterfaceConfig {
  enableMathAnimations: boolean;
  animationComplexity: 'minimal' | 'medium' | 'full';
  showProgressDetails: boolean;
  estimatedDurations: Record<LoadingContext, number>;
}

export interface LaunchInterfaceConfig {
  enableAnimations: boolean;
  showBranding: boolean;
  authOptions: AuthenticationOptions;
  welcomeMessage: string;
  customStyling?: LaunchStyling;
}

export interface AuthenticationOptions {
  enableSignIn: boolean;
  enableSignUp: boolean;  
  enableAnonymous: boolean;
  enableSocialAuth: boolean;
  enableGuestMode: boolean;
  requireEmailVerification: boolean;
  enablePasswordReset: boolean;
}

export interface SessionConfiguration {
  anonymousSessionTTL: number; // milliseconds
  enableSessionPersistence: boolean;
  enableCrossDeviceSync: boolean;
  sessionStorageType: 'localStorage' | 'sessionStorage' | 'memory';
}

export interface FlowPerformanceConfig {
  enableFlowMetrics: boolean;
  trackUserInteractions: boolean;
  enablePerformanceOptimizations: boolean;
  maxFlowDuration: number;
}

export interface LaunchStyling {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  buttonStyle: 'rounded' | 'square' | 'pill';
  animationEasing: string;
}

// Flow State Interface
export interface UserFlowState {
  flow: UserFlow;
  phase: UserFlowPhase;
  userChoice: UserAuthChoice | null;
  sessionResult: SessionInitResult | null;
  
  // Interface States
  loadingInterfaceVisible: boolean;
  launchInterfaceVisible: boolean;
  currentLoadingContext: LoadingContext | null;
  
  // Progress Tracking
  flowProgress: number; // 0-100
  currentStep: FlowStep | null;
  completedSteps: FlowStep[];
  
  // Error Handling
  error: UserFlowError | null;
  retryCount: number;
  isRecovering: boolean;
}

export interface FlowStep {
  id: string;
  name: string;
  phase: UserFlowPhase;
  estimatedDuration: number;
  isCompleted: boolean;
  hasError: boolean;
  errorMessage?: string;
  startTime?: number;
  endTime?: number;
}

export interface UserFlowError {
  code: UserFlowErrorCode;
  message: string;
  phase: UserFlowPhase;
  recoverable: boolean;
  suggestedAction?: string;
  details?: any;
  timestamp: string;
}

export enum UserFlowErrorCode {
  FLOW_INITIALIZATION_FAILED = 'flow_initialization_failed',
  INTERFACE_LOADING_FAILED = 'interface_loading_failed',
  USER_CHOICE_PROCESSING_FAILED = 'user_choice_processing_failed',
  SESSION_INITIALIZATION_FAILED = 'session_initialization_failed',
  FLOW_TRANSITION_FAILED = 'flow_transition_failed',
  TIMEOUT_EXCEEDED = 'timeout_exceeded',
  CONFIGURATION_ERROR = 'configuration_error'
}

// Event Interface
export interface UserFlowEvents {
  onFlowStarted: (flow: UserFlow) => void;
  onPhaseChanged: (newPhase: UserFlowPhase, previousPhase: UserFlowPhase) => void;
  onUserChoiceMade: (choice: UserAuthChoice) => void;
  onSessionInitialized: (result: SessionInitResult) => void;
  onFlowCompleted: (flow: UserFlow, duration: number) => void;
  onFlowError: (error: UserFlowError) => void;
  onStepCompleted: (step: FlowStep) => void;
  onProgressUpdated: (progress: number) => void;
}

// APML Validation Interface
export interface UserFlowValidation {
  validateFlowConfig: (config: UserFlowConfig) => ValidationResult;
  validateFlowState: (state: UserFlowState) => ValidationResult;
  validateUserChoice: (choice: UserAuthChoice) => ValidationResult;
  validateSessionResult: (result: SessionInitResult) => ValidationResult;
  validateFlowProgression: (currentPhase: UserFlowPhase, nextPhase: UserFlowPhase) => ValidationResult;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
  securityScore: number; // 0-100
  performanceScore: number; // 0-100
}

// Integration Interface
export interface UserFlowIntegration {
  // Component Integration
  connectToLoadingInterface: (loadingInterface: any) => void;
  connectToLaunchInterface: (launchInterface: any) => void;
  
  // Service Integration
  connectToSessionManager: (sessionManager: any) => void;
  connectToAuthService: (authService: any) => void;
  connectToBackendOrchestrator: (orchestrator: any) => void;
  
  // Analytics Integration
  connectToAnalytics: (analytics: any) => void;
  connectToPerformanceMonitor: (monitor: any) => void;
}

export default UserFlowInterface;