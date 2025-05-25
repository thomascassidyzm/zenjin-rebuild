/**
 * LaunchInterface Interface Specification
 * APML Framework v1.3.3 Compliant
 * 
 * Defines the welcome/authentication choice interface that appears after initial loading
 * Replaces automatic anonymous user creation with user choice-driven flow
 */

export interface LaunchInterfaceInterface {
  // Core Interface Properties
  phase: LaunchPhase;
  isVisible: boolean;
  userChoice: UserAuthChoice | null;
  
  // Authentication Flow Methods
  onSignInRequested: () => Promise<void>;
  onSignUpRequested: () => Promise<void>;
  onAnonymousRequested: () => Promise<void>;
  onLaunchComplete: (choice: UserAuthChoice) => void;
  
  // State Management
  isProcessingChoice: boolean;
  hasError: boolean;
  errorMessage: string | null;
  
  // Animation Control
  animationState: LaunchAnimationState;
  transitionDuration: number;
}

export enum LaunchPhase {
  HIDDEN = 'hidden',
  APPEARING = 'appearing', 
  WELCOME = 'welcome',
  PROCESSING_CHOICE = 'processing_choice',
  TRANSITIONING_OUT = 'transitioning_out',
  COMPLETE = 'complete'
}

export enum UserAuthChoice {
  SIGN_IN = 'sign_in',
  SIGN_UP = 'sign_up', 
  ANONYMOUS = 'anonymous',
  NONE = 'none'
}

export interface LaunchAnimationState {
  logoScale: number;
  welcomeTextOpacity: number;
  buttonsVisible: boolean;
  backgroundGradientPosition: number;
}

export interface LaunchInterfaceProps {
  // Required Props
  onAuthChoiceSelected: (choice: UserAuthChoice) => Promise<void>;
  onInterfaceComplete: () => void;
  
  // Optional Props
  branding?: LaunchBranding;
  authOptions?: AuthenticationOptions;
  animations?: LaunchAnimationConfig;
  accessibility?: AccessibilityConfig;
}

export interface LaunchBranding {
  appName: string;
  appTagline: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface AuthenticationOptions {
  enableSignIn: boolean;
  enableSignUp: boolean;
  enableAnonymous: boolean;
  anonymousLabel: string;
  signInLabel: string;
  signUpLabel: string;
  termsText: string;
}

export interface LaunchAnimationConfig {
  enableAnimations: boolean;
  transitionDuration: number;
  logoAnimationDuration: number;
  buttonStaggerDelay: number;
  backgroundAnimationEnabled: boolean;
}

export interface AccessibilityConfig {
  reducedMotion: boolean;
  highContrast: boolean;
  screenReaderSupport: boolean;
  keyboardNavigationEnabled: boolean;
}

// Event Types
export interface LaunchInterfaceEvents {
  onPhaseChanged: (newPhase: LaunchPhase, previousPhase: LaunchPhase) => void;
  onUserChoiceStarted: (choice: UserAuthChoice) => void;
  onUserChoiceCompleted: (choice: UserAuthChoice, success: boolean) => void;
  onAnimationCompleted: (animationType: string) => void;
  onError: (error: LaunchInterfaceError) => void;
}

export interface LaunchInterfaceError {
  code: LaunchErrorCode;
  message: string;
  details?: any;
  timestamp: string;
}

export enum LaunchErrorCode {
  ANIMATION_FAILED = 'animation_failed',
  AUTH_CHOICE_FAILED = 'auth_choice_failed',
  INTERFACE_MOUNT_FAILED = 'interface_mount_failed',
  ACCESSIBILITY_ERROR = 'accessibility_error'
}

// State Management Interface
export interface LaunchInterfaceState {
  phase: LaunchPhase;
  userChoice: UserAuthChoice | null;
  isProcessing: boolean;
  animationState: LaunchAnimationState;
  error: LaunchInterfaceError | null;
  accessibility: AccessibilityConfig;
}

// Component Lifecycle Interface
export interface LaunchInterfaceLifecycle {
  onMount: () => Promise<void>;
  onUnmount: () => Promise<void>;
  onShow: () => Promise<void>;
  onHide: () => Promise<void>;
  onReset: () => Promise<void>;
}

// APML Validation Interface
export interface LaunchInterfaceValidation {
  validateProps: (props: LaunchInterfaceProps) => ValidationResult;
  validateState: (state: LaunchInterfaceState) => ValidationResult;
  validateAccessibility: (config: AccessibilityConfig) => ValidationResult;
  validateAnimations: (config: LaunchAnimationConfig) => ValidationResult;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

// Integration Interface with other components
export interface LaunchInterfaceIntegration {
  // LoadingInterface Integration
  connectToLoadingInterface: (loadingInterface: any) => void;
  
  // UserSessionManager Integration  
  connectToSessionManager: (sessionManager: any) => void;
  
  // Navigation Integration
  connectToNavigation: (navigationHandler: any) => void;
}

export default LaunchInterfaceInterface;