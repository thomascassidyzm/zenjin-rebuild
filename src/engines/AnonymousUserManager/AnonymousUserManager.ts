import { v4 as uuidv4 } from 'uuid';
import { 
  RegistrationDetails, 
  TimeToLiveInfo, 
  AnonymousUserInterface,
  AnonymousUserError,
  AnonymousUserErrorCode 
} from './AnonymousUserTypes';
import { SubscriptionManagerInterface } from '../SubscriptionManager/SubscriptionManagerInterfaces';
import { AnonymousUserStorage } from './AnonymousUserStorage';

/**
 * Default TTL for anonymous users in seconds (7 days)
 */
const DEFAULT_TTL_SECONDS = 7 * 24 * 60 * 60;

/**
 * Implementation of the AnonymousUserManager component for the Zenjin Maths App
 * Handles anonymous users with temporary access, TTL management, and conversion to registered users
 */
export class AnonymousUserManager implements AnonymousUserInterface {
  private storage: AnonymousUserStorage;
  private subscriptionManager: SubscriptionManagerInterface;

  /**
   * Creates a new AnonymousUserManager instance
   * @param subscriptionManager - Subscription manager interface for managing subscription status
   * @param storage - Optional storage implementation (defaults to a new instance of AnonymousUserStorage)
   */
  constructor(
    subscriptionManager: SubscriptionManagerInterface,
    storage?: AnonymousUserStorage
  ) {
    this.subscriptionManager = subscriptionManager;
    this.storage = storage || new AnonymousUserStorage();
  }

  /**
   * Creates a new anonymous user with temporary access
   * @returns Identifier for the new anonymous user
   * @throws CREATION_FAILED if failed to create anonymous user
   */
  public createAnonymousUser(): string {
    try {
      // Generate a unique ID for the anonymous user
      const anonymousId = `anon_${uuidv4().replace(/-/g, '')}`;
      
      // Set creation and expiration times
      const creationTime = new Date();
      const expirationTime = new Date(creationTime.getTime() + DEFAULT_TTL_SECONDS * 1000);
      
      // Create anonymous user data
      const userData = {
        anonymousId,
        creationTime: creationTime.toISOString(),
        expirationTime: expirationTime.toISOString(),
        progress: {},
        settings: {},
        subscriptionTier: 'Free'
      };
      
      // Store the anonymous user data
      this.storage.saveAnonymousUser(userData);
      
      // Initialize subscription status for the anonymous user
      this.subscriptionManager.initializeUserSubscription(anonymousId, 'Free');
      
      return anonymousId;
    } catch (error) {
      throw new AnonymousUserError(
        AnonymousUserErrorCode.CREATION_FAILED,
        'Failed to create anonymous user',
        error
      );
    }
  }

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
  public convertToRegisteredUser(
    anonymousId: string, 
    registrationDetails: RegistrationDetails
  ): string {
    try {
      // Check if anonymous user exists
      if (!this.storage.anonymousUserExists(anonymousId)) {
        throw new AnonymousUserError(
          AnonymousUserErrorCode.ANONYMOUS_USER_NOT_FOUND,
          `Anonymous user with ID ${anonymousId} not found`
        );
      }
      
      // Check if anonymous user has expired
      const ttlInfo = this.getTimeToLive(anonymousId);
      if (ttlInfo.isExpired) {
        throw new AnonymousUserError(
          AnonymousUserErrorCode.ANONYMOUS_USER_EXPIRED,
          `Anonymous user with ID ${anonymousId} has expired`
        );
      }
      
      // Validate registration details
      this.validateRegistrationDetails(registrationDetails);
      
      // Check if username is already taken
      if (this.storage.isUsernameTaken(registrationDetails.username)) {
        throw new AnonymousUserError(
          AnonymousUserErrorCode.USERNAME_TAKEN,
          `Username '${registrationDetails.username}' is already taken`
        );
      }
      
      // Check if email is already taken
      if (this.storage.isEmailTaken(registrationDetails.email)) {
        throw new AnonymousUserError(
          AnonymousUserErrorCode.EMAIL_TAKEN,
          `Email '${registrationDetails.email}' is already registered`
        );
      }
      
      // Get anonymous user data
      const anonymousUserData = this.storage.getAnonymousUser(anonymousId);
      
      // Generate a unique ID for the registered user
      const registeredUserId = `user_${uuidv4().replace(/-/g, '')}`;
      
      // Create registered user data, preserving progress and settings
      const registeredUserData = {
        userId: registeredUserId,
        username: registrationDetails.username,
        email: registrationDetails.email,
        displayName: registrationDetails.displayName || registrationDetails.username,
        creationTime: new Date().toISOString(),
        progress: anonymousUserData.progress,
        settings: anonymousUserData.settings,
        subscriptionTier: anonymousUserData.subscriptionTier,
        additionalInfo: registrationDetails.additionalInfo || {}
      };
      
      // Store the registered user data
      this.storage.saveRegisteredUser(registeredUserData);
      
      // Transfer subscription status from anonymous to registered user
      this.subscriptionManager.transferSubscription(anonymousId, registeredUserId);
      
      // Delete the anonymous user data
      this.storage.deleteAnonymousUser(anonymousId);
      
      return registeredUserId;
    } catch (error) {
      // Re-throw if it's already an AnonymousUserError
      if (error instanceof AnonymousUserError) {
        throw error;
      }
      
      // Otherwise wrap in a CONVERSION_FAILED error
      throw new AnonymousUserError(
        AnonymousUserErrorCode.CONVERSION_FAILED,
        'Failed to convert anonymous user to registered user',
        error
      );
    }
  }

  /**
   * Gets the time-to-live information for an anonymous user
   * @param anonymousId - Anonymous user identifier
   * @returns Time-to-live information for the anonymous user
   * @throws ANONYMOUS_USER_NOT_FOUND if the specified anonymous user was not found
   */
  public getTimeToLive(anonymousId: string): TimeToLiveInfo {
    // Check if anonymous user exists
    if (!this.storage.anonymousUserExists(anonymousId)) {
      throw new AnonymousUserError(
        AnonymousUserErrorCode.ANONYMOUS_USER_NOT_FOUND,
        `Anonymous user with ID ${anonymousId} not found`
      );
    }
    
    // Get anonymous user data
    const userData = this.storage.getAnonymousUser(anonymousId);
    
    // Calculate time-to-live information
    const now = new Date();
    const expirationTime = new Date(userData.expirationTime);
    const secondsRemaining = Math.max(0, Math.floor((expirationTime.getTime() - now.getTime()) / 1000));
    const isExpired = secondsRemaining <= 0;
    
    return {
      anonymousId,
      creationTime: userData.creationTime,
      expirationTime: userData.expirationTime,
      secondsRemaining,
      isExpired
    };
  }

  /**
   * Checks if an anonymous user exists and has not expired
   * @param anonymousId - Anonymous user identifier
   * @returns Whether the anonymous user exists and has not expired
   */
  public isValidAnonymousUser(anonymousId: string): boolean {
    try {
      // Check if anonymous user exists
      if (!this.storage.anonymousUserExists(anonymousId)) {
        return false;
      }
      
      // Check if anonymous user has expired
      const ttlInfo = this.getTimeToLive(anonymousId);
      return !ttlInfo.isExpired;
    } catch (error) {
      return false;
    }
  }

  /**
   * Extends the time-to-live for an anonymous user
   * @param anonymousId - Anonymous user identifier
   * @param extensionSeconds - Number of seconds to extend the TTL
   * @returns Updated time-to-live information
   * @throws ANONYMOUS_USER_NOT_FOUND if the specified anonymous user was not found
   * @throws ANONYMOUS_USER_EXPIRED if the anonymous user has expired
   * @throws EXTENSION_FAILED if failed to extend the TTL
   */
  public extendTimeToLive(anonymousId: string, extensionSeconds: number): TimeToLiveInfo {
    try {
      // Check if anonymous user exists
      if (!this.storage.anonymousUserExists(anonymousId)) {
        throw new AnonymousUserError(
          AnonymousUserErrorCode.ANONYMOUS_USER_NOT_FOUND,
          `Anonymous user with ID ${anonymousId} not found`
        );
      }
      
      // Check if anonymous user has expired
      const ttlInfo = this.getTimeToLive(anonymousId);
      if (ttlInfo.isExpired) {
        throw new AnonymousUserError(
          AnonymousUserErrorCode.ANONYMOUS_USER_EXPIRED,
          `Anonymous user with ID ${anonymousId} has expired`
        );
      }
      
      // Get anonymous user data
      const userData = this.storage.getAnonymousUser(anonymousId);
      
      // Extend the expiration time
      const currentExpirationTime = new Date(userData.expirationTime);
      const newExpirationTime = new Date(currentExpirationTime.getTime() + extensionSeconds * 1000);
      
      // Update the user data
      userData.expirationTime = newExpirationTime.toISOString();
      
      // Save the updated user data
      this.storage.saveAnonymousUser(userData);
      
      // Return updated TTL information
      return this.getTimeToLive(anonymousId);
    } catch (error) {
      // Re-throw if it's already an AnonymousUserError
      if (error instanceof AnonymousUserError) {
        throw error;
      }
      
      // Otherwise wrap in an EXTENSION_FAILED error
      throw new AnonymousUserError(
        AnonymousUserErrorCode.EXTENSION_FAILED,
        'Failed to extend time-to-live for anonymous user',
        error
      );
    }
  }

  /**
   * Cleans up expired anonymous users
   * @returns Number of expired users cleaned up
   */
  public cleanupExpiredUsers(): number {
    try {
      // Get all anonymous user IDs
      const anonymousUserIds = this.storage.getAllAnonymousUserIds();
      
      let cleanedUpCount = 0;
      
      // Check each anonymous user
      for (const anonymousId of anonymousUserIds) {
        try {
          const ttlInfo = this.getTimeToLive(anonymousId);
          
          // If expired, delete the anonymous user
          if (ttlInfo.isExpired) {
            this.storage.deleteAnonymousUser(anonymousId);
            cleanedUpCount++;
          }
        } catch (error) {
          // Ignore errors for individual users and continue with others
          console.error(`Error checking anonymous user ${anonymousId}:`, error);
        }
      }
      
      return cleanedUpCount;
    } catch (error) {
      console.error('Error during cleanup of expired users:', error);
      return 0;
    }
  }

  /**
   * Validates registration details
   * @param registrationDetails - Registration details to validate
   * @throws INVALID_REGISTRATION_DETAILS if the registration details are invalid
   */
  private validateRegistrationDetails(registrationDetails: RegistrationDetails): void {
    const errors: string[] = [];
    
    // Validate username
    if (!registrationDetails.username) {
      errors.push('Username is required');
    } else if (registrationDetails.username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    } else if (!/^[a-zA-Z0-9_]+$/.test(registrationDetails.username)) {
      errors.push('Username can only contain letters, numbers, and underscores');
    }
    
    // Validate email
    if (!registrationDetails.email) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registrationDetails.email)) {
      errors.push('Email is invalid');
    }
    
    // Validate password
    if (!registrationDetails.password) {
      errors.push('Password is required');
    } else if (registrationDetails.password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    } else if (!/[A-Z]/.test(registrationDetails.password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else if (!/[a-z]/.test(registrationDetails.password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else if (!/[0-9]/.test(registrationDetails.password)) {
      errors.push('Password must contain at least one number');
    } else if (!/[^A-Za-z0-9]/.test(registrationDetails.password)) {
      errors.push('Password must contain at least one special character');
    }
    
    // If there are validation errors, throw an INVALID_REGISTRATION_DETAILS error
    if (errors.length > 0) {
      throw new AnonymousUserError(
        AnonymousUserErrorCode.INVALID_REGISTRATION_DETAILS,
        `Invalid registration details: ${errors.join(', ')}`
      );
    }
  }
}