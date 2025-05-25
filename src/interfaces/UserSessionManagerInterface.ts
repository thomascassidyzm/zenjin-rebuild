/**
 * UserSessionManager TypeScript Interface Definition
 * Generated from UserSessionManagerInterface.apml
 * 
 * APML-Compliant interface for user session management and backend integration
 */

import { BackendServiceStatus } from '../services/BackendServiceOrchestrator';

// Core Data Structures

export interface UserSessionState {
  /** Current authenticated user or null if not authenticated */
  user: User | null;
  /** Current session data or null if no active session */
  session: Session | null;
  /** Whether user is currently authenticated */
  isAuthenticated: boolean;
  /** Whether session operations are currently in progress */
  isLoading: boolean;
  /** Current status of all backend services */
  backendStatus: BackendServiceStatus;
  /** Application-specific user state (progress, metrics, etc.) */
  userState: UserApplicationState;
  /** Current error message or null if no error */
  error: string | null;
}

export interface UserApplicationState {
  /** Current positions in spaced repetition system */
  stitchPositions: Record<string, any>;
  /** Triple helix learning path state */
  tripleHelixState: Record<string, any>;
  /** Spaced repetition algorithm state */
  spacedRepetitionState: Record<string, any>;
  /** User progress and performance metrics */
  progressMetrics: Record<string, any>;
  /** Timestamp of last successful backend synchronization */
  lastSyncTime: string | null;
  /** State version for optimistic locking */
  version: number;
}

export interface SessionMetrics {
  /** Unique identifier for the learning session */
  sessionId: string;
  /** Number of correct answers in session */
  correctAnswers: number;
  /** Total number of questions in session */
  totalQuestions: number;
  /** Session completion time in milliseconds */
  completionTime: number;
  /** Which learning path the session was for */
  learningPath: string;
  /** ISO timestamp when session was completed */
  timestamp: string;
}

export interface User {
  id: string;
  anonymousId?: string;
  displayName: string;
  userType: 'anonymous' | 'registered';
  subscriptionTier: string;
  expiresAt?: string;
  createdAt: string;
}

export interface Session {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  userType: 'anonymous' | 'registered';
}

// Event Data Structures

export interface SessionStateChangedEvent {
  newState: UserSessionState;
  previousState: UserSessionState;
}

export interface UserStateChangedEvent {
  changes: Partial<UserApplicationState>;
  source: 'local' | 'backend' | 'realtime';
}

export interface BackendStatusChangedEvent {
  status: BackendServiceStatus;
}

// Method Interface

export interface UserSessionManagerInterface {
  // State Properties
  readonly state: UserSessionState;

  // Core Session Management Methods
  
  /**
   * Initialize user session, create anonymous user if needed, and establish backend connections
   * @param deviceId Optional device identifier for anonymous user creation
   * @returns Promise<boolean> True if session initialized successfully, false otherwise
   */
  initializeSession(deviceId?: string): Promise<boolean>;

  /**
   * Create new anonymous user and establish authenticated session
   * @param deviceId Optional device identifier for user creation
   * @returns Promise<boolean> True if anonymous user created successfully, false otherwise
   */
  createAnonymousUser(deviceId?: string): Promise<boolean>;

  /**
   * Register a new user account with email and password
   * @param email User's email address
   * @param password User's password
   * @param displayName Optional display name for the user
   * @returns Promise<boolean> True if user registered successfully, false otherwise
   */
  registerUser(email: string, password: string, displayName?: string): Promise<boolean>;

  /**
   * Sign in an existing user with email and password
   * @param email User's email address
   * @param password User's password
   * @returns Promise<boolean> True if user signed in successfully, false otherwise
   */
  signInUser(email: string, password: string): Promise<boolean>;

  /**
   * Get current user application state
   * @returns UserApplicationState Current user application state
   */
  getUserState(): UserApplicationState;

  /**
   * Refresh user state from backend services
   * @returns Promise<boolean> True if state refreshed successfully, false otherwise
   */
  refreshUserState(): Promise<boolean>;

  /**
   * Update user application state with backend synchronization
   * @param changes State changes to apply
   * @returns Promise<boolean> True if state updated successfully, false otherwise
   */
  updateUserState(changes: Partial<UserApplicationState>): Promise<boolean>;

  /**
   * Record learning session metrics to backend for analytics
   * @param metrics Session metrics to record
   * @returns Promise<boolean> True if metrics recorded successfully, false otherwise
   */
  recordSessionMetrics(metrics: SessionMetrics): Promise<boolean>;

  /**
   * Get current status of all backend services
   * @returns BackendServiceStatus Current backend service status
   */
  getBackendStatus(): BackendServiceStatus;

  /**
   * Logout user and clean up session state
   * @returns Promise<boolean> True if logout successful, false otherwise
   */
  logout(): Promise<boolean>;

  // Event Management (if using EventEmitter pattern)
  
  /**
   * Subscribe to session state changes
   * @param event Event name
   * @param callback Event callback function
   * @returns Unsubscribe function
   */
  on(event: 'sessionStateChanged', callback: (data: SessionStateChangedEvent) => void): () => void;
  on(event: 'userStateChanged', callback: (data: UserStateChangedEvent) => void): () => void;
  on(event: 'backendStatusChanged', callback: (data: BackendStatusChangedEvent) => void): () => void;

  /**
   * Unsubscribe from events
   * @param event Event name
   * @param callback Event callback function
   */
  off(event: string, callback: Function): void;
}

// React Context Types (for implementation)

export interface UserSessionContextType extends UserSessionManagerInterface {
  // Additional React-specific properties if needed
}

// Utility Types

export type UserSessionInitializationResult = {
  success: boolean;
  user?: User;
  session?: Session;
  error?: string;
};

export type StateUpdateResult = {
  success: boolean;
  updatedState?: UserApplicationState;
  syncedToBackend: boolean;
  error?: string;
};

// Export default interface for easier importing
export default UserSessionManagerInterface;