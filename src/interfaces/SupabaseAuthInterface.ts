/**
 * SupabaseAuthInterface.ts
 * Generated from APML Interface Definition
 * Module: BackendServices
 */


/**
 * Defines the contract for user authentication and authorization using Supabase Auth, supporting anonymous users, registration, login, and seamless migration between user types.
 */
/**
 * AnonymousUser
 */
export interface AnonymousUser {
  /** Supabase anonymous user ID */
  id: string;
  /** Custom anonymous identifier for app logic */
  anonymousId: string;
  /** ISO timestamp of creation */
  createdAt: string;
  /** ISO timestamp of expiration */
  expiresAt: string;
  /** Temporary session data */
  sessionData?: Record<string, any>;
}

/**
 * RegisteredUser
 */
export interface RegisteredUser {
  /** Supabase user ID */
  id: string;
  /** User email address */
  email: string;
  /** User display name */
  displayName?: string;
  /** ISO timestamp of registration */
  createdAt: string;
  /** ISO timestamp of last login */
  lastLoginAt: string;
  /** User subscription level */
  subscriptionTier: string;
  /** Additional user metadata */
  metadata?: Record<string, any>;
}

/**
 * AuthSession
 */
export interface AuthSession {
  /** User object (anonymous or registered) */
  user: Record<string, any>;
  /** JWT access token */
  accessToken: string;
  /** Refresh token */
  refreshToken: string;
  /** Token expiration timestamp */
  expiresAt: number;
  /** Type of user (anonymous or registered) */
  userType: string;
}

/**
 * RegistrationRequest
 */
export interface RegistrationRequest {
  /** User email address */
  email: string;
  /** User password */
  password: string;
  /** User display name */
  displayName?: string;
  /** Anonymous ID to migrate from */
  anonymousId?: string;
  /** Additional user metadata */
  metadata?: Record<string, any>;
}

/**
 * LoginRequest
 */
export interface LoginRequest {
  /** User email address */
  email: string;
  /** User password */
  password: string;
  /** Whether to extend session duration */
  rememberMe?: boolean;
}

/**
 * AuthResult
 */
export interface AuthResult {
  /** Whether the operation was successful */
  success: boolean;
  /** Auth session if successful */
  session?: AuthSession;
  /** User object if successful */
  user?: Record<string, any>;
  /** Error message if failed */
  error?: string;
  /** Whether email confirmation is required */
  requiresEmailConfirmation?: boolean;
}

/**
 * Error codes for SupabaseAuthInterface
 */
export enum SupabaseAuthErrorCode {
  ANONYMOUS_CREATION_FAILED = 'ANONYMOUS_CREATION_FAILED',
  SESSION_CREATION_FAILED = 'SESSION_CREATION_FAILED',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  INVALID_EMAIL = 'INVALID_EMAIL',
  REGISTRATION_FAILED = 'REGISTRATION_FAILED',
  MIGRATION_FAILED = 'MIGRATION_FAILED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_NOT_CONFIRMED = 'EMAIL_NOT_CONFIRMED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT_FAILED = 'LOGOUT_FAILED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  INVALID_SESSION = 'INVALID_SESSION',
  REFRESH_FAILED = 'REFRESH_FAILED',
  REFRESH_TOKEN_EXPIRED = 'REFRESH_TOKEN_EXPIRED',
  NO_ACTIVE_SESSION = 'NO_ACTIVE_SESSION',
  ANONYMOUS_USER_NOT_FOUND = 'ANONYMOUS_USER_NOT_FOUND',
  EXTENSION_FAILED = 'EXTENSION_FAILED',
  CLEANUP_FAILED = 'CLEANUP_FAILED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_PROFILE_DATA = 'INVALID_PROFILE_DATA',
  UPDATE_FAILED = 'UPDATE_FAILED',
  EMAIL_NOT_FOUND = 'EMAIL_NOT_FOUND',
  RESET_FAILED = 'RESET_FAILED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  CONFIRMATION_FAILED = 'CONFIRMATION_FAILED',
}

/**
 * SupabaseAuthInterface
 */
export interface SupabaseAuthInterface {
  /**
   * Creates a new anonymous user with temporary access
   * @param sessionData - Initial session data
   * @param ttlHours - Time to live in hours
   * @returns Authentication result with anonymous user
   * @throws ANONYMOUS_CREATION_FAILED if Failed to create anonymous user
   * @throws SESSION_CREATION_FAILED if Failed to create anonymous session
   */
  createAnonymousUser(sessionData?: Record<string, any>, ttlHours?: number): Promise<AuthResult>;

  /**
   * Registers a new user account, optionally migrating from anonymous
   * @param registrationRequest - Registration details
   * @returns Authentication result with registered user
   * @throws EMAIL_ALREADY_EXISTS if Email address is already registered
   * @throws WEAK_PASSWORD if Password does not meet security requirements
   * @throws INVALID_EMAIL if Email address format is invalid
   * @throws REGISTRATION_FAILED if User registration failed
   * @throws MIGRATION_FAILED if Failed to migrate anonymous user data
   */
  registerUser(registrationRequest: RegistrationRequest): Promise<AuthResult>;

  /**
   * Authenticates a registered user
   * @param loginRequest - Login credentials
   * @returns Authentication result
   * @throws INVALID_CREDENTIALS if Email or password is incorrect
   * @throws EMAIL_NOT_CONFIRMED if User has not confirmed their email address
   * @throws ACCOUNT_LOCKED if Account is temporarily locked
   * @throws LOGIN_FAILED if Login attempt failed
   */
  loginUser(loginRequest: LoginRequest): Promise<AuthResult>;

  /**
   * Logs out the current user and invalidates session
   * @returns Whether logout was successful
   * @throws LOGOUT_FAILED if Failed to logout user
   */
  logoutUser(): Promise<boolean>;

  /**
   * Gets the current authentication session
   * @returns Current session or null if not authenticated
   * @throws SESSION_EXPIRED if Current session has expired
   * @throws INVALID_SESSION if Session is invalid or corrupted
   */
  getCurrentSession(): Promise<AuthSession>;

  /**
   * Refreshes the current authentication session
   * @returns Refreshed authentication result
   * @throws REFRESH_FAILED if Failed to refresh session
   * @throws REFRESH_TOKEN_EXPIRED if Refresh token has expired
   * @throws NO_ACTIVE_SESSION if No active session to refresh
   */
  refreshSession(): Promise<AuthResult>;

  /**
   * Migrates an anonymous user to a registered account
   * @param anonymousId - Anonymous user identifier
   * @param registrationRequest - Registration details
   * @returns Authentication result with migrated user
   * @throws ANONYMOUS_USER_NOT_FOUND if Anonymous user does not exist
   * @throws MIGRATION_FAILED if Failed to migrate anonymous user data
   * @throws EMAIL_ALREADY_EXISTS if Email address is already registered
   */
  migrateAnonymousToRegistered(anonymousId: string, registrationRequest: RegistrationRequest): Promise<AuthResult>;

  /**
   * Extends the TTL of an anonymous user session
   * @param anonymousId - Anonymous user identifier
   * @param additionalHours - Hours to add to current TTL
   * @returns Whether extension was successful
   * @throws ANONYMOUS_USER_NOT_FOUND if Anonymous user does not exist
   * @throws SESSION_EXPIRED if Current session has expired
   * @throws EXTENSION_FAILED if Failed to extend session
   */
  extendAnonymousSession(anonymousId: string, additionalHours: number): Promise<boolean>;

  /**
   * Removes expired anonymous users and their data
   * @returns Number of users cleaned up
   * @throws CLEANUP_FAILED if Failed to cleanup expired users
   */
  cleanupExpiredAnonymousUsers(): Promise<number>;

  /**
   * Updates user profile information
   * @param userId - User identifier
   * @param profileUpdates - Profile fields to update
   * @returns Updated user object
   * @throws USER_NOT_FOUND if User does not exist
   * @throws INVALID_PROFILE_DATA if Profile data is invalid
   * @throws UPDATE_FAILED if Failed to update profile
   */
  updateUserProfile(userId: string, profileUpdates: Record<string, any>): Promise<Record<string, any>>;

  /**
   * Initiates password reset process
   * @param email - User email address
   * @returns Whether reset email was sent
   * @throws EMAIL_NOT_FOUND if Email address is not registered
   * @throws RESET_FAILED if Failed to initiate password reset
   */
  resetPassword(email: string): Promise<boolean>;

  /**
   * Confirms user email address
   * @param token - Email confirmation token
   * @returns Authentication result after confirmation
   * @throws INVALID_TOKEN if Confirmation token is invalid or expired
   * @throws CONFIRMATION_FAILED if Failed to confirm email
   */
  confirmEmail(token: string): Promise<AuthResult>;

}

// Export default interface
export default SupabaseAuthInterface;
