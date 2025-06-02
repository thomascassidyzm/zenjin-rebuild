/**
 * User Lifecycle Interface
 * APML v2.2 Interface Specification
 * 
 * Defines the contract for user state transitions throughout their lifecycle,
 * with special focus on anonymous-to-registered conversion for optimal UX.
 */

export type UserLifecycleState = 
  | 'INITIAL'           // No user state
  | 'ANONYMOUS_ACTIVE'  // Anonymous user with TTL, actively learning
  | 'ANONYMOUS_EXPIRING' // Anonymous user approaching TTL expiry
  | 'CONVERSION_PENDING' // User initiated sign-up, conversion in progress
  | 'REGISTERED_ACTIVE'  // Fully registered user
  | 'REGISTERED_INACTIVE' // Registered but dormant
  | 'ACCOUNT_SUSPENDED'  // Temporarily suspended
  | 'ACCOUNT_DELETED';   // Soft deleted

export type UserLifecycleEvent =
  | { type: 'CREATE_ANONYMOUS'; deviceId?: string }
  | { type: 'START_LEARNING'; }
  | { type: 'APPROACH_TTL_EXPIRY'; daysRemaining: number }
  | { type: 'INITIATE_SIGNUP'; email: string; password: string }
  | { type: 'COMPLETE_CONVERSION'; authUserId: string }
  | { type: 'CONVERSION_FAILED'; error: string }
  | { type: 'ACCOUNT_SUSPEND'; reason: string }
  | { type: 'ACCOUNT_RESTORE'; }
  | { type: 'REQUEST_DELETION'; };

export interface UserLifecycleData {
  userId: string;
  userType: 'anonymous' | 'registered';
  createdAt: string;
  lastActiveAt: string;
  expiresAt?: string; // TTL for anonymous users
  email?: string;
  anonymousId?: string;
  learningProgress: {
    totalSessions: number;
    totalQuestions: number;
    currentStreak: number;
    lifetimePoints: number;
  };
  metadata: Record<string, any>;
}

export interface ConversionPreservationData {
  // Critical data that MUST be preserved during conversion
  learningState: {
    stitchPositions: Record<string, any>;
    tripleHelixState: Record<string, any>;
    spacedRepetitionState: Record<string, any>;
  };
  progressMetrics: {
    totalSessions: number;
    totalQuestions: number;
    totalCorrect: number;
    totalPoints: number;
    lifetimeMetrics: Record<string, any>;
  };
  userPreferences: Record<string, any>;
  achievementsUnlocked: string[];
  subscriptionData?: Record<string, any>;
}

export interface UserLifecycleInterface {
  /**
   * Get current user lifecycle state
   */
  getCurrentState(): UserLifecycleState;
  
  /**
   * Get user lifecycle data
   */
  getUserData(): UserLifecycleData | null;
  
  /**
   * Send lifecycle event to state machine
   */
  sendEvent(event: UserLifecycleEvent): Promise<boolean>;
  
  /**
   * Initiate anonymous-to-registered conversion
   * This is the critical UX flow that preserves all learning progress
   */
  initiateConversion(email: string, password: string): Promise<ConversionResult>;
  
  /**
   * Get data that will be preserved during conversion
   * Allows user to see what they'll keep when they sign up
   */
  getConversionPreview(): Promise<ConversionPreservationData>;
  
  /**
   * Check TTL status for anonymous users
   */
  getTTLStatus(): Promise<TTLStatus | null>;
  
  /**
   * Subscribe to lifecycle state changes
   */
  onStateChange(callback: (state: UserLifecycleState, data: UserLifecycleData) => void): () => void;
  
  /**
   * Subscribe to TTL warnings for anonymous users
   */
  onTTLWarning(callback: (daysRemaining: number) => void): () => void;
}

export interface ConversionResult {
  success: boolean;
  newUserId?: string; // Should be same as original for seamless UX
  preservedData?: ConversionPreservationData;
  authenticationData?: {
    accessToken: string;
    refreshToken: string;
  };
  error?: string;
  errorCode?: 'CONVERSION_FAILED' | 'EMAIL_EXISTS' | 'VALIDATION_FAILED' | 'PRESERVATION_FAILED';
}

export interface TTLStatus {
  daysRemaining: number;
  hoursRemaining: number;
  isExpiring: boolean; // true if < 7 days remaining
  isCritical: boolean; // true if < 24 hours remaining
  expiresAt: string;
  canExtend: boolean; // whether user can extend TTL by signing up
}

/**
 * Anonymous-to-Registered Conversion Interface
 * Specialized interface for the critical UX flow
 */
export interface AnonymousConversionInterface {
  /**
   * Prepare for conversion - validate and gather data
   */
  prepareConversion(email: string): Promise<ConversionPreparationResult>;
  
  /**
   * Execute the conversion atomically
   * MUST preserve all user data and maintain same UUID
   */
  executeConversion(
    email: string, 
    password: string,
    preservationData: ConversionPreservationData
  ): Promise<ConversionResult>;
  
  /**
   * Rollback conversion if it fails
   */
  rollbackConversion(originalUserId: string): Promise<boolean>;
  
  /**
   * Verify conversion completed successfully
   */
  verifyConversion(userId: string): Promise<ConversionVerificationResult>;
}

export interface ConversionPreparationResult {
  canConvert: boolean;
  preservationData: ConversionPreservationData;
  estimatedProgress: {
    sessionsCompleted: number;
    achievementsEarned: number;
    pointsAccumulated: number;
    daysActive: number;
  };
  warnings: string[];
  errors: string[];
}

export interface ConversionVerificationResult {
  success: boolean;
  dataIntegrity: {
    learningStatePreserved: boolean;
    progressMetricsIntact: boolean;
    achievementsRetained: boolean;
    preferencesCarriedOver: boolean;
  };
  userStateValid: boolean;
  authenticationValid: boolean;
  errors: string[];
}

/**
 * User State Transition Events
 * For integration with other systems (analytics, notifications, etc.)
 */
export interface UserLifecycleEvents {
  'user:created': { userId: string; userType: 'anonymous' | 'registered' };
  'user:activated': { userId: string; firstSession: boolean };
  'user:approaching_expiry': { userId: string; daysRemaining: number };
  'user:conversion_started': { userId: string; email: string };
  'user:conversion_completed': { 
    userId: string; 
    email: string; 
    preservedData: ConversionPreservationData 
  };
  'user:conversion_failed': { userId: string; error: string; email: string };
  'user:expired': { userId: string; finalState: ConversionPreservationData };
  'user:deleted': { userId: string; deletionReason: string };
}

/**
 * UX-Focused Conversion Flow States
 * These map to specific UI components and user experiences
 */
export type ConversionFlowState =
  | 'DISCOVERY'        // User learning about benefits of signing up
  | 'INCENTIVIZED'     // User shown what they'll preserve + TTL warning
  | 'FORM_ENTRY'       // User entering email/password
  | 'VALIDATING'       // Checking email availability, validation
  | 'PREVIEW'          // Showing user what will be preserved
  | 'CONVERTING'       // Atomic conversion in progress
  | 'VERIFICATION'     // Verifying conversion success
  | 'WELCOME'          // Successful conversion, welcoming registered user
  | 'FAILED'           // Conversion failed, user still anonymous
  | 'ROLLBACK';        // Rolling back failed conversion

export interface ConversionFlowInterface {
  getCurrentFlowState(): ConversionFlowState;
  sendFlowEvent(event: string, data?: any): Promise<boolean>;
  onFlowStateChange(callback: (state: ConversionFlowState) => void): () => void;
}