/**
 * VercelAPIInterface.ts
 * Generated from APML Interface Definition
 * Module: BackendServices
 */


/**
 * Defines the REST API endpoints for the Zenjin Maths App deployed on Vercel, providing serverless functions that integrate with Supabase for user management, state synchronization, and metrics collection.
 */
/**
 * APIResponse
 */
export interface APIResponse {
  /** Whether the request was successful */
  success: boolean;
  /** Response data if successful */
  data?: any;
  /** Error message if unsuccessful */
  error?: string;
  /** Specific error code for client handling */
  errorCode?: string;
  /** ISO timestamp of response */
  timestamp: string;
  /** Unique request identifier for debugging */
  requestId: string;
}

/**
 * AuthRequest
 */
export interface AuthRequest {
  /** User email (for registration/login) */
  email?: string;
  /** User password (for registration/login) */
  password?: string;
  /** User display name */
  displayName?: string;
  /** Anonymous ID for migration */
  anonymousId?: string;
  /** Type of user operation */
  userType?: string;
}

/**
 * StateUpdateRequest
 */
export interface StateUpdateRequest {
  /** Partial state changes to apply */
  stateChanges: Record<string, any>;
  /** Expected current version */
  expectedVersion: number;
  /** Source device identifier */
  syncSource: string;
  /** Client timestamp of changes */
  timestamp: string;
}

/**
 * MetricsSubmission
 */
export interface MetricsSubmission {
  /** Unique session identifier */
  sessionId: string;
  /** Learning path identifier */
  learningPath: string;
  /** Complete session performance data */
  sessionData: Record<string, any>;
  /** Session start timestamp */
  startedAt: string;
  /** Session completion timestamp */
  completedAt: string;
}

/**
 * Error codes for VercelAPIInterface
 */
export enum VercelAPIErrorCode {
  ANONYMOUS_CREATION_FAILED = 'ANONYMOUS_CREATION_FAILED',
  DATABASE_ERROR = 'DATABASE_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  INVALID_EMAIL = 'INVALID_EMAIL',
  MIGRATION_FAILED = 'MIGRATION_FAILED',
  REGISTRATION_FAILED = 'REGISTRATION_FAILED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_NOT_CONFIRMED = 'EMAIL_NOT_CONFIRMED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  LOGIN_FAILED = 'LOGIN_FAILED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  LOGOUT_FAILED = 'LOGOUT_FAILED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  VERSION_CONFLICT = 'VERSION_CONFLICT',
  INVALID_STATE_DATA = 'INVALID_STATE_DATA',
  UPDATE_FAILED = 'UPDATE_FAILED',
  INVALID_METRICS_DATA = 'INVALID_METRICS_DATA',
  METRICS_SUBMISSION_FAILED = 'METRICS_SUBMISSION_FAILED',
  INVALID_DATE_RANGE = 'INVALID_DATE_RANGE',
  ANONYMOUS_USER_NOT_FOUND = 'ANONYMOUS_USER_NOT_FOUND',
  REGISTERED_USER_EXISTS = 'REGISTERED_USER_EXISTS',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  CLEANUP_FAILED = 'CLEANUP_FAILED',
}

/**
 * VercelAPIInterface
 */
export interface VercelAPIInterface {
  /**
   * Creates a new anonymous user with temporary access
   * @param body - Optional initial session data
   * @returns Auth result with anonymous user session
   * @throws ANONYMOUS_CREATION_FAILED if Failed to create anonymous user
   * @throws DATABASE_ERROR if Database operation failed
   * @throws RATE_LIMIT_EXCEEDED if Too many requests from this IP
   */
  POST /api/auth/anonymous(body?: AuthRequest): Promise<APIResponse>;

  /**
   * Registers a new user account, optionally migrating from anonymous
   * @param body - Registration details
   * @returns Registration result with user session
   * @throws EMAIL_ALREADY_EXISTS if Email address is already registered
   * @throws WEAK_PASSWORD if Password does not meet requirements
   * @throws INVALID_EMAIL if Email format is invalid
   * @throws MIGRATION_FAILED if Failed to migrate anonymous user data
   * @throws REGISTRATION_FAILED if User registration failed
   */
  POST /api/auth/register(body: AuthRequest): Promise<APIResponse>;

  /**
   * Authenticates a registered user
   * @param body - Login credentials
   * @returns Authentication result
   * @throws INVALID_CREDENTIALS if Email or password is incorrect
   * @throws EMAIL_NOT_CONFIRMED if Email not confirmed
   * @throws ACCOUNT_LOCKED if Account is temporarily locked
   * @throws LOGIN_FAILED if Login attempt failed
   */
  POST /api/auth/login(body: AuthRequest): Promise<APIResponse>;

  /**
   * Logs out the current user
   * @param headers - Authorization header with JWT token
   * @returns Logout result
   * @throws INVALID_TOKEN if Authorization token is invalid
   * @throws LOGOUT_FAILED if Failed to logout user
   */
  POST /api/auth/logout(headers: Record<string, any>): Promise<APIResponse>;

  /**
   * Retrieves current user state
   * @param params - User ID in URL params
   * @param headers - Authorization header
   * @returns Current user state data
   * @throws USER_NOT_FOUND if User does not exist
   * @throws UNAUTHORIZED if Invalid or missing authorization
   * @throws PERMISSION_DENIED if User cannot access this state
   */
  GET /api/users/[id]/state(params: Record<string, any>, headers: Record<string, any>): Promise<APIResponse>;

  /**
   * Updates user state with conflict resolution
   * @param params - User ID in URL params
   * @param headers - Authorization header
   * @param body - State update data
   * @returns Update result with new state
   * @throws VERSION_CONFLICT if State version conflict detected
   * @throws USER_NOT_FOUND if User does not exist
   * @throws UNAUTHORIZED if Invalid or missing authorization
   * @throws INVALID_STATE_DATA if State data is invalid
   * @throws UPDATE_FAILED if Failed to update state
   */
  PUT /api/users/[id]/state(params: Record<string, any>, headers: Record<string, any>, body: StateUpdateRequest): Promise<APIResponse>;

  /**
   * Submits session performance metrics
   * @param params - User ID in URL params
   * @param headers - Authorization header
   * @param body - Session metrics data
   * @returns Metrics submission result
   * @throws USER_NOT_FOUND if User does not exist
   * @throws UNAUTHORIZED if Invalid or missing authorization
   * @throws INVALID_METRICS_DATA if Metrics data is invalid
   * @throws METRICS_SUBMISSION_FAILED if Failed to submit metrics
   */
  POST /api/users/[id]/metrics(params: Record<string, any>, headers: Record<string, any>, body: MetricsSubmission): Promise<APIResponse>;

  /**
   * Retrieves user performance metrics and analytics
   * @param params - User ID in URL params
   * @param query - Query parameters for filtering
   * @param headers - Authorization header
   * @returns User metrics and analytics
   * @throws USER_NOT_FOUND if User does not exist
   * @throws UNAUTHORIZED if Invalid or missing authorization
   * @throws INVALID_DATE_RANGE if Date range parameters are invalid
   */
  GET /api/users/[id]/metrics(params: Record<string, any>, query?: Record<string, any>, headers: Record<string, any>): Promise<APIResponse>;

  /**
   * Retrieves available learning paths for user's subscription
   * @param headers - Authorization header
   * @param query - Optional filtering parameters
   * @returns Available learning paths
   * @throws UNAUTHORIZED if Invalid or missing authorization
   * @throws USER_NOT_FOUND if User does not exist
   */
  GET /api/learning-paths(headers: Record<string, any>, query?: Record<string, any>): Promise<APIResponse>;

  /**
   * Retrieves user progress across all learning paths
   * @param params - User ID in URL params
   * @param headers - Authorization header
   * @returns User progress data
   * @throws USER_NOT_FOUND if User does not exist
   * @throws UNAUTHORIZED if Invalid or missing authorization
   */
  GET /api/users/[id]/progress(params: Record<string, any>, headers: Record<string, any>): Promise<APIResponse>;

  /**
   * Migrates anonymous user to registered account
   * @param body - Migration request with anonymous and registered user IDs
   * @param headers - Authorization header
   * @returns Migration result
   * @throws ANONYMOUS_USER_NOT_FOUND if Anonymous user does not exist
   * @throws REGISTERED_USER_EXISTS if Registered user already exists
   * @throws MIGRATION_FAILED if Failed to migrate anonymous user data
   * @throws UNAUTHORIZED if Invalid or missing authorization
   */
  POST /api/users/migrate(body: Record<string, any>, headers: Record<string, any>): Promise<APIResponse>;

  /**
   * Health check endpoint for monitoring
   * @returns Service health status
   * @throws SERVICE_UNAVAILABLE if Service is currently unavailable
   */
  GET /api/health(): APIResponse;

  /**
   * Admin endpoint to cleanup expired anonymous users
   * @param headers - Admin authorization header
   * @returns Cleanup operation result
   * @throws UNAUTHORIZED if Invalid or missing authorization
   * @throws CLEANUP_FAILED if Cleanup operation failed
   */
  POST /api/admin/cleanup(headers: Record<string, any>): Promise<APIResponse>;

}

// Export default interface
export default VercelAPIInterface;
