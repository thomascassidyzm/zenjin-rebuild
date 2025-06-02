/**
 * SupabaseUserStateInterface.ts
 * Generated from APML Interface Definition
 * Module: BackendServices
 */


/**
 * Defines the contract for managing user state persistence and synchronization through Supabase, supporting both anonymous and registered users with real-time updates.
 */
/**
 * UserState
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
 * StateUpdateRequest
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
 * StateUpdateResult
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
 * RealtimeSubscription
 */
export interface RealtimeSubscription {
  /** User to subscribe to */
  userId: string;
  /** Types of events to subscribe to */
  eventTypes: string[];
  /** Function to call on updates */
  callback: function;
  /** Unique subscription identifier */
  subscriptionId: string;
}

/**
 * Error codes for SupabaseUserStateInterface
 */
export enum SupabaseUserStateErrorCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  DATABASE_ERROR = 'DATABASE_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  VERSION_CONFLICT = 'VERSION_CONFLICT',
  INVALID_STATE_DATA = 'INVALID_STATE_DATA',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  INVALID_INITIAL_STATE = 'INVALID_INITIAL_STATE',
  ANONYMOUS_USER_NOT_FOUND = 'ANONYMOUS_USER_NOT_FOUND',
  REGISTERED_USER_EXISTS = 'REGISTERED_USER_EXISTS',
  MIGRATION_FAILED = 'MIGRATION_FAILED',
  SUBSCRIPTION_FAILED = 'SUBSCRIPTION_FAILED',
  INVALID_CALLBACK = 'INVALID_CALLBACK',
  SUBSCRIPTION_NOT_FOUND = 'SUBSCRIPTION_NOT_FOUND',
  INVALID_DATE_RANGE = 'INVALID_DATE_RANGE',
}

/**
 * SupabaseUserStateInterface
 */
export interface SupabaseUserStateInterface {
  /**
   * Retrieves the current user state from Supabase
   * @param userId - User identifier
   * @returns Current user state
   * @throws USER_NOT_FOUND if User does not exist in the database
   * @throws DATABASE_ERROR if Supabase database error occurred
   * @throws PERMISSION_DENIED if User does not have permission to access this state
   */
  getUserState(userId: string): Promise<UserState>;

  /**
   * Updates user state with optimistic locking and conflict resolution
   * @param updateRequest - Update request with version control
   * @returns Result of the update operation
   * @throws VERSION_CONFLICT if State version conflict detected
   * @throws USER_NOT_FOUND if User does not exist in the database
   * @throws INVALID_STATE_DATA if State data failed validation
   * @throws DATABASE_ERROR if Supabase database error occurred
   */
  updateUserState(updateRequest: StateUpdateRequest): Promise<StateUpdateResult>;

  /**
   * Creates initial state for a new user (anonymous or registered)
   * @param userId - New user identifier
   * @param initialState - Initial state data (uses defaults if not provided)
   * @param userType - Type of user (anonymous or registered)
   * @returns Created user state
   * @throws USER_ALREADY_EXISTS if User state already exists
   * @throws INVALID_INITIAL_STATE if Initial state data is invalid
   * @throws DATABASE_ERROR if Supabase database error occurred
   */
  createUserState(userId: string, initialState?: Record<string, any>, userType: string): Promise<UserState>;

  /**
   * Migrates anonymous user state to registered user account
   * @param anonymousId - Anonymous user identifier
   * @param registeredUserId - New registered user identifier
   * @param preserveData - Whether to preserve all anonymous data
   * @returns Result of migration operation
   * @throws ANONYMOUS_USER_NOT_FOUND if Anonymous user does not exist
   * @throws REGISTERED_USER_EXISTS if Registered user already exists
   * @throws MIGRATION_FAILED if Migration operation failed
   */
  migrateAnonymousUser(anonymousId: string, registeredUserId: string, preserveData?: boolean): Promise<Record<string, any>>;

  /**
   * Subscribe to real-time state changes via Supabase subscriptions
   * @param subscription - Subscription configuration
   * @returns Unique subscription identifier
   * @throws SUBSCRIPTION_FAILED if Failed to establish real-time subscription
   * @throws INVALID_CALLBACK if Callback function is invalid
   * @throws USER_NOT_FOUND if User does not exist in the database
   */
  subscribeToStateChanges(subscription: RealtimeSubscription): string;

  /**
   * Unsubscribe from real-time state changes
   * @param subscriptionId - Subscription identifier to remove
   * @returns Whether unsubscription was successful
   * @throws SUBSCRIPTION_NOT_FOUND if Subscription does not exist
   */
  unsubscribeFromStateChanges(subscriptionId: string): boolean;

  /**
   * Retrieves historical state changes for audit and debugging
   * @param userId - User identifier
   * @param limit - Maximum number of history entries
   * @param startDate - ISO date to start history from
   * @returns Array of historical state changes
   * @throws USER_NOT_FOUND if User does not exist in the database
   * @throws INVALID_DATE_RANGE if Invalid date range specified
   */
  getStateHistory(userId: string, limit?: number, startDate?: string): Promise<any[]>;

}

// Export default interface
export default SupabaseUserStateInterface;
