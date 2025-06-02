/**
 * AuthToPlayerInterface.ts
 * Generated from APML Interface Definition
 * Module: AuthToPlayer
 */


/**
 * Defines user context contracts for Auth-to-Player flow with proper type safety for different user states.
 * Ensures authenticated users always have required identifiers while anonymous users have optional fields.
 */
/**
 * Type of user in the system
 */
export interface UserType {
}

/**
 * Base user context shared by all user types
 */
export interface BaseUserContext {
  /** Type of user */
  userType: UserType;
}

/**
 * Context for authenticated users
 */
export interface AuthenticatedUserContext {
  /** Always 'authenticated' for this type */
  userType: string;
  /** Unique identifier from authentication system - never null for authenticated users */
  userId: string;
  /** Display name from user profile */
  userName?: string;
  /** Email address from authentication system */
  email: string;
}

/**
 * Context for anonymous users
 */
export interface AnonymousUserContext {
  /** Always 'anonymous' for this type */
  userType: string;
  /** Optional anonymous user identifier for session tracking */
  userId?: string;
  /** Generated display name for anonymous users */
  userName?: string;
  /** Not applicable for anonymous users */
  email?: string;
}

/**
 * Error codes for AuthToPlayerInterface
 */
export enum AuthToPlayerErrorCode {
  INVALID_USER_TYPE = 'INVALID_USER_TYPE',
  MISSING_USER_ID = 'MISSING_USER_ID',
  MISSING_EMAIL = 'MISSING_EMAIL',
  CONTEXT_VALIDATION_FAILED = 'CONTEXT_VALIDATION_FAILED',
}

/**
 * AuthToPlayerInterface
 */
export interface AuthToPlayerInterface {
  /**
   * Creates appropriate user context based on authentication state
   * @param isAuthenticated - Whether user is authenticated
   * @param userId - User identifier
   * @param userName - User display name
   * @param email - User email address
   * @returns AuthenticatedUserContext or AnonymousUserContext
   * @throws INVALID_USER_TYPE if Invalid user type provided
   * @throws MISSING_USER_ID if User ID is required for authenticated users
   * @throws MISSING_EMAIL if Email is required for authenticated users
   */
  createUserContext(isAuthenticated: boolean, userId?: string, userName?: string, email?: string): Record<string, any>;

  /**
   * Validates a user context object
   * @param context - User context to validate
   * @returns Whether context is valid
   * @throws CONTEXT_VALIDATION_FAILED if User context validation failed
   */
  validateUserContext(context: Record<string, any>): boolean;

  /**
   * Extract appropriate user ID for state initialization
   * @param userContext - User context
   * @returns For authenticated users: actual userId
For anonymous users: userId if provided, otherwise generated

   */
  extractUserId(userContext: Record<string, any>): string;

}

// Export default interface
export default AuthToPlayerInterface;
