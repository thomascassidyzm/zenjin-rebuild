/**
 * SupabaseUserStateTypes.ts
 * 
 * Type definitions for the SupabaseUserState service, implementing the
 * SupabaseUserStateInterface with TypeScript type safety.
 */

/**
 * User state data structure
 */
export interface UserState {
  /** Unique user identifier (anonymous or registered) */
  userId: string;
  /** Original anonymous ID for conversion tracking */
  anonymousId?: string;
  /** Current stitch positions across learning paths */
  stitchPositions: Record<string, any>;
  /** Current tube rotation and active learning path */
  tripleHelixState: Record<string, any>;
  /** Skip numbers and progression data */
  spacedRepetitionState: Record<string, any>;
  /** Learning progress and performance metrics */
  progressMetrics: Record<string, any>;
  /** ISO timestamp of last successful sync */
  lastSyncTime: string;
  /** State version for conflict resolution */
  version: number;
  /** User subscription level */
  subscriptionTier: string;
}

/**
 * State update request with version control
 */
export interface StateUpdateRequest {
  /** Target user identifier */
  userId: string;
  /** Partial state changes to apply */
  stateChanges: Record<string, any>;
  /** Expected current version for optimistic updates */
  expectedVersion: number;
  /** Source of the update (device identifier) */
  syncSource: string;
}

/**
 * Result of a state update operation
 */
export interface StateUpdateResult {
  /** Whether the update was successful */
  success: boolean;
  /** New state version after update */
  newVersion: number;
  /** How conflicts were resolved if any */
  conflictResolution?: string;
  /** Complete updated state */
  updatedState: UserState;
  /** ISO timestamp of update */
  timestamp: string;
}

/**
 * Real-time subscription configuration
 */
export interface RealtimeSubscription {
  /** User to subscribe to */
  userId: string;
  /** Types of events to subscribe to */
  eventTypes: string[];
  /** Function to call on updates */
  callback: (event: ConnectivityEvent) => void;
  /** Unique subscription identifier */
  subscriptionId: string;
}

/**
 * Connectivity event for real-time updates
 */
export interface ConnectivityEvent {
  /** Event type */
  type: string;
  /** Current status */
  status: any;
  /** Previous status */
  previousStatus?: any;
  /** ISO timestamp of event */
  timestamp: string;
}

/**
 * Error codes for user state operations
 */
export enum UserStateErrorCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  DATABASE_ERROR = 'DATABASE_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  VERSION_CONFLICT = 'VERSION_CONFLICT',
  INVALID_STATE_DATA = 'INVALID_STATE_DATA',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  ANONYMOUS_USER_NOT_FOUND = 'ANONYMOUS_USER_NOT_FOUND',
  REGISTERED_USER_EXISTS = 'REGISTERED_USER_EXISTS',
  MIGRATION_FAILED = 'MIGRATION_FAILED',
  SUBSCRIPTION_FAILED = 'SUBSCRIPTION_FAILED',
  INVALID_CALLBACK = 'INVALID_CALLBACK',
  SUBSCRIPTION_NOT_FOUND = 'SUBSCRIPTION_NOT_FOUND'
}

/**
 * User state error class
 */
export class UserStateError extends Error {
  constructor(
    public code: UserStateErrorCode,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'UserStateError';
  }
}

/**
 * Main interface for user state management
 */
export interface SupabaseUserStateInterface {
  /**
   * Retrieves the current user state from Supabase
   */
  getUserState(userId: string): Promise<UserState>;

  /**
   * Updates user state with optimistic locking and conflict resolution
   */
  updateUserState(updateRequest: StateUpdateRequest): Promise<StateUpdateResult>;

  /**
   * Creates initial state for a new user (anonymous or registered)
   */
  createUserState(
    userId: string, 
    initialState?: object, 
    userType?: string
  ): Promise<UserState>;

  /**
   * Migrates anonymous user state to registered user account
   */
  migrateAnonymousUser(
    anonymousId: string, 
    registeredUserId: string, 
    preserveData?: boolean
  ): Promise<object>;

  /**
   * Subscribe to real-time state changes via Supabase subscriptions
   */
  subscribeToStateChanges(subscription: RealtimeSubscription): string;

  /**
   * Unsubscribe from real-time state changes
   */
  unsubscribeFromStateChanges(subscriptionId: string): boolean;

  /**
   * Retrieves historical state changes for audit and debugging
   */
  getStateHistory(
    userId: string, 
    limit?: number, 
    startDate?: string
  ): Promise<object[]>;
}

/**
 * Database record structure for user_state table
 */
export interface UserStateRecord {
  id: string;
  user_id: string;
  stitch_positions: Record<string, any>;
  triple_helix_state: Record<string, any>;
  spaced_repetition_state: Record<string, any>;
  progress_metrics: Record<string, any>;
  version: number;
  last_sync_time: string;
  sync_source?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Migration result information
 */
export interface MigrationResult {
  success: boolean;
  migratedData: any;
  anonymousUserId: string;
  registeredUserId: string;
  timestamp: string;
}

/**
 * Subscription management
 */
export interface SubscriptionInfo {
  id: string;
  userId: string;
  eventTypes: string[];
  callback: (event: ConnectivityEvent) => void;
  channel: any;
  createdAt: string;
}

/**
 * State history entry
 */
export interface StateHistoryEntry {
  id: string;
  user_id: string;
  change_type: string;
  old_state: Record<string, any>;
  new_state: Record<string, any>;
  sync_source: string;
  created_at: string;
}

/**
 * Configuration options for the service
 */
export interface SupabaseUserStateConfig {
  /** Supabase client instance */
  supabaseClient: any;
  /** Default subscription tier for new users */
  defaultSubscriptionTier?: string;
  /** Maximum number of concurrent subscriptions per user */
  maxSubscriptionsPerUser?: number;
  /** Timeout for database operations in milliseconds */
  operationTimeout?: number;
  /** Enable state history tracking */
  enableStateHistory?: boolean;
}

/**
 * Service status information
 */
export interface ServiceStatus {
  isConnected: boolean;
  activeSubscriptions: number;
  lastOperation: string;
  errorCount: number;
  uptime: number;
}