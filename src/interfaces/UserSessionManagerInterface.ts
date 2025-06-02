/**
 * UserSessionManagerInterface.ts
 * Generated from APML Interface Definition
 * Module: BackendServices
 */

import { BackendServiceStatus } from '../services/BackendServiceOrchestrator';

/**
 * Provides unified interface for managing user sessions, authentication, and state persistence
 * that integrates BackendServices with frontend components following APML compliance requirements.
 */

/**
 * AdminAccess information for admin interface integration
 */
export interface AdminAccess {
  is_admin: boolean;
  role?: 'super_admin' | 'content_admin' | 'user_admin';
  permissions?: string[];
  last_admin_activity?: string;
}

/**
 * User interface with admin access integration
 */
export interface User {
  id: string;
  email?: string;
  displayName?: string;
  userType: 'authenticated' | 'anonymous';
  anonymousId?: string;
  metadata?: {
    admin_access?: AdminAccess;
    [key: string]: any;
  };
  createdAt?: string;
  lastActivity?: string;
}

/**
 * Session interface for user sessions
 */
export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

/**
 * UserSessionState
 */
export interface UserSessionState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  backendStatus: BackendServiceStatus;
  userState: UserApplicationState;
  error: string | null;
}

/**
 * UserApplicationState
 */
export interface UserApplicationState {
  stitchPositions: Record<string, any>;
  tripleHelixState: Record<string, any>;
  spacedRepetitionState: Record<string, any>;
  progressMetrics: Record<string, any>;
  lastSyncTime: string | null;
  version: number;
}

/**
 * SessionMetrics
 */
export interface SessionMetrics {
  sessionId: string;
  correctAnswers: number;
  totalQuestions: number;
  completionTime: number;
  learningPath: string;
  timestamp: string;
}

/**
 * Event interfaces for UserSessionManager
 */
export interface SessionStateChangedEvent {
  oldState: UserSessionState;
  newState: UserSessionState;
  timestamp: string;
}

export interface UserStateChangedEvent {
  changes: Partial<UserApplicationState>;
  source: string;
  timestamp: string;
}

export interface BackendStatusChangedEvent {
  status: BackendServiceStatus;
  timestamp: string;
}

/**
 * Result interfaces for UserSessionManager operations
 */
export interface UserSessionInitializationResult {
  success: boolean;
  user?: User;
  session?: Session;
  error?: string;
}

export interface StateUpdateResult {
  success: boolean;
  updatedState?: UserApplicationState;
  error?: string;
}

/**
 * UserSessionContextType for React Context
 */
export interface UserSessionContextType extends UserSessionManagerInterface {
  state: UserSessionState;
  on: (event: string, callback: Function) => () => void;
  off: (event: string, callback: Function) => void;
}

/**
 * UserSessionManagerInterface
 */
export interface UserSessionManagerInterface {
  initializeSession(deviceId?: string): Promise<boolean>;
  createAnonymousUser(deviceId?: string): Promise<boolean>;
  registerUser(email: string, password: string, displayName?: string): Promise<boolean>;
  signInUser(email: string, password: string): Promise<boolean>;
  sendEmailOTP(email: string): Promise<boolean>;
  verifyEmailOTP(email: string, otp: string): Promise<boolean>;
  getUserState(): UserApplicationState;
  refreshUserState(): Promise<boolean>;
  updateUserState(changes: Partial<UserApplicationState>): Promise<boolean>;
  recordSessionMetrics(metrics: SessionMetrics): Promise<boolean>;
  getBackendStatus(): BackendServiceStatus;
  logout(): Promise<boolean>;
  on(event: string, callback: Function): () => void;
  off(event: string, callback: Function): void;
}

// Export default interface
export default UserSessionManagerInterface;
