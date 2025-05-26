/**
 * UserInitializationInterface.ts
 * TypeScript implementation of UserInitializationInterface.apml
 * Generated following APML-to-TypeScript bridge patterns
 */

// Data Structures
export interface UserInitializationResult {
  success: boolean;
  user: UserRecord | null;
  userState: UserStateRecord | null;
  error: string | null;
  errorCode: string | null;
}

export interface UserExistenceResult {
  exists: boolean;
  requiresInitialization: boolean;
  user: UserRecord | null;
  error: string | null;
}

export interface UserInitializationStatus {
  userExists: boolean;
  userStateExists: boolean;
  isFullyInitialized: boolean;
  missingComponents: string[];
}

export interface UserRecord {
  id: string;
  email: string;
  displayName: string;
  userType: 'registered' | 'anonymous';
  subscriptionTier: string;
  createdAt: string;
}

export interface UserStateRecord {
  userId: string;
  stitchPositions: Record<string, any>;
  tripleHelixState: TripleHelixState;
  spacedRepetitionState: Record<string, any>;
  progressMetrics: ProgressMetrics;
  version: number;
  lastSyncTime: string;
}

// Supporting types
export interface TripleHelixState {
  currentTube: number;
  activeSessions: any[];
  completedGroupings: Record<string, any>;
  sessionProgress: Record<string, any>;
}

export interface ProgressMetrics {
  totalStitchesCompleted: number;
  totalTimeSpent: number;
  currentStreak: number;
  longestStreak: number;
  averageAccuracy: number;
}

// Error codes enumeration
export enum UserInitializationErrorCode {
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  DATABASE_ERROR = 'DATABASE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

// Service adapter interface contract
export interface UserInitializationServiceInterface {
  /**
   * Creates complete user record with initial state in database
   */
  initializeNewUser(
    userId: string,
    email: string,
    displayName?: string,
    userType?: 'registered' | 'anonymous'
  ): Promise<UserInitializationResult>;

  /**
   * Verifies user exists in database, creates if missing
   */
  ensureUserExists(
    userId: string,
    accessToken: string
  ): Promise<UserExistenceResult>;

  /**
   * Checks current initialization status without side effects
   */
  getUserInitializationStatus(
    userId: string
  ): Promise<UserInitializationStatus>;
}

// APML-compliant service adapter requirements
export interface UserInitializationAdapterRequirements {
  // Must isolate external service behavior from application logic
  isolateServiceBehavior: boolean;
  
  // Must provide consistent interface regardless of backend implementation
  consistentInterface: boolean;
  
  // Must handle all documented error states gracefully
  gracefulErrorHandling: boolean;
  
  // Must support offline/online mode detection
  offlineOnlineSupport: boolean;
  
  // Must provide immediate feedback on operation status
  immediateFeedback: boolean;
}