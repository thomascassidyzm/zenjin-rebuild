/**
 * Represents registration details for converting an anonymous user to a registered user
 */
export interface RegistrationDetails {
  /** Username for the new registered user */
  username: string;
  
  /** Email address for the new registered user */
  email: string;
  
  /** Password for the new registered user */
  password: string;
  
  /** Optional display name for the new registered user */
  displayName?: string;
  
  /** Optional additional user information */
  additionalInfo?: Record<string, any>;
}

/**
 * Represents time-to-live information for an anonymous user
 */
export interface TimeToLiveInfo {
  /** Anonymous user identifier */
  anonymousId: string;
  
  /** ISO date string of creation time */
  creationTime: string;
  
  /** ISO date string of expiration time */
  expirationTime: string;
  
  /** Number of seconds remaining until expiration */
  secondsRemaining: number;
  
  /** Whether the anonymous user has expired */
  isExpired: boolean;
}

/**
 * Interface for the AnonymousUserManager component that manages anonymous users with temporary access
 */
export interface AnonymousUserInterface {
  /**
   * Creates a new anonymous user with temporary access
   * @returns Identifier for the new anonymous user
   * @throws CREATION_FAILED if failed to create anonymous user
   */
  createAnonymousUser(): string;
  
  /**
   * Converts an anonymous user to a registered user
   * @param anonymousId - Anonymous user identifier
   * @param registrationDetails - Registration details for the new registered user
   * @returns Identifier for the new registered user
   * @throws ANONYMOUS_USER_NOT_FOUND if the specified anonymous user was not found
   * @throws ANONYMOUS_USER_EXPIRED if the anonymous user has expired
   * @throws INVALID_REGISTRATION_DETAILS if the registration details are invalid
   * @throws USERNAME_TAKEN if the username is already taken
   * @throws EMAIL_TAKEN if the email is already taken
   * @throws CONVERSION_FAILED if failed to convert the anonymous user
   */
  convertToRegisteredUser(
    anonymousId: string, 
    registrationDetails: RegistrationDetails
  ): string;
  
  /**
   * Gets the time-to-live information for an anonymous user
   * @param anonymousId - Anonymous user identifier
   * @returns Time-to-live information for the anonymous user
   * @throws ANONYMOUS_USER_NOT_FOUND if the specified anonymous user was not found
   */
  getTimeToLive(anonymousId: string): TimeToLiveInfo;
  
  /**
   * Checks if an anonymous user exists and has not expired
   * @param anonymousId - Anonymous user identifier
   * @returns Whether the anonymous user exists and has not expired
   */
  isValidAnonymousUser(anonymousId: string): boolean;
  
  /**
   * Extends the time-to-live for an anonymous user
   * @param anonymousId - Anonymous user identifier
   * @param extensionSeconds - Number of seconds to extend the TTL
   * @returns Updated time-to-live information
   * @throws ANONYMOUS_USER_NOT_FOUND if the specified anonymous user was not found
   * @throws ANONYMOUS_USER_EXPIRED if the anonymous user has expired
   * @throws EXTENSION_FAILED if failed to extend the TTL
   */
  extendTimeToLive(anonymousId: string, extensionSeconds: number): TimeToLiveInfo;
  
  /**
   * Cleans up expired anonymous users
   * @returns Number of expired users cleaned up
   */
  cleanupExpiredUsers(): number;
}

/**
 * Anonymous user data structure stored in the system
 */
export interface AnonymousUserData {
  /** Anonymous user identifier */
  anonymousId: string;
  
  /** ISO date string of creation time */
  creationTime: string;
  
  /** ISO date string of expiration time */
  expirationTime: string;
  
  /** User learning progress data */
  progress: Record<string, any>;
  
  /** User preferences and settings */
  settings: Record<string, any>;
  
  /** Subscription tier of the user */
  subscriptionTier: string;
}

/**
 * Registered user data structure stored in the system
 */
export interface RegisteredUserData {
  /** Registered user identifier */
  userId: string;
  
  /** Username of the registered user */
  username: string;
  
  /** Email address of the registered user */
  email: string;
  
  /** Display name of the registered user */
  displayName: string;
  
  /** ISO date string of account creation time */
  creationTime: string;
  
  /** User learning progress data */
  progress: Record<string, any>;
  
  /** User preferences and settings */
  settings: Record<string, any>;
  
  /** Subscription tier of the user */
  subscriptionTier: string;
  
  /** Additional user information */
  additionalInfo: Record<string, any>;
}

/**
 * Error codes for AnonymousUserManager
 */
export enum AnonymousUserErrorCode {
  CREATION_FAILED = 'CREATION_FAILED',
  ANONYMOUS_USER_NOT_FOUND = 'ANONYMOUS_USER_NOT_FOUND',
  ANONYMOUS_USER_EXPIRED = 'ANONYMOUS_USER_EXPIRED',
  INVALID_REGISTRATION_DETAILS = 'INVALID_REGISTRATION_DETAILS',
  USERNAME_TAKEN = 'USERNAME_TAKEN',
  EMAIL_TAKEN = 'EMAIL_TAKEN',
  CONVERSION_FAILED = 'CONVERSION_FAILED',
  EXTENSION_FAILED = 'EXTENSION_FAILED'
}

/**
 * Error class for AnonymousUserManager
 */
export class AnonymousUserError extends Error {
  public code: AnonymousUserErrorCode;
  public originalError?: Error;

  /**
   * Creates a new AnonymousUserError
   * @param code - Error code
   * @param message - Error message
   * @param originalError - Original error that caused this error
   */
  constructor(
    code: AnonymousUserErrorCode,
    message: string,
    originalError?: Error | unknown
  ) {
    super(message);
    this.code = code;
    this.name = 'AnonymousUserError';
    
    if (originalError instanceof Error) {
      this.originalError = originalError;
    }
    
    // Capture stack trace for better debugging
    Object.setPrototypeOf(this, AnonymousUserError.prototype);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AnonymousUserError);
    }
  }
}