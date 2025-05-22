import { AnonymousUserManager } from './AnonymousUserManager';
import { SubscriptionManager } from '../SubscriptionManager/SubscriptionManager';

/**
 * Example usage of the AnonymousUserManager component
 */

// Initialize dependencies
const subscriptionManager = new SubscriptionManager();

// Create the AnonymousUserManager instance
const anonymousUserManager = new AnonymousUserManager(subscriptionManager);

/**
 * Example: Creating a new anonymous user
 */
function createAnonymousUserExample(): string {
  try {
    const anonymousId = anonymousUserManager.createAnonymousUser();
    console.log(`Created anonymous user: ${anonymousId}`);
    
    // Store anonymous ID in local storage for future sessions
    localStorage.setItem('current-anonymous-id', anonymousId);
    
    // Display TTL information to the user
    const ttlInfo = anonymousUserManager.getTimeToLive(anonymousId);
    const daysRemaining = Math.ceil(ttlInfo.secondsRemaining / (60 * 60 * 24));
    
    console.log(`Your anonymous access expires in ${daysRemaining} days (${new Date(ttlInfo.expirationTime).toLocaleString()})`);
    
    return anonymousId;
  } catch (error) {
    console.error(`Error creating anonymous user: ${error.message}`);
    return '';
  }
}

/**
 * Example: Converting anonymous user to registered user
 */
function registerUserExample(
  anonymousId: string, 
  username: string, 
  email: string, 
  password: string, 
  displayName: string
): string | null {
  try {
    // Verify the anonymous user is still valid
    if (!anonymousUserManager.isValidAnonymousUser(anonymousId)) {
      console.error('Your anonymous session has expired. Please restart the app.');
      return null;
    }
    
    // Prepare registration details
    const registrationDetails = {
      username,
      email,
      password,
      displayName
    };
    
    // Convert anonymous user to registered user
    const registeredUserId = anonymousUserManager.convertToRegisteredUser(
      anonymousId,
      registrationDetails
    );
    
    console.log(`Successfully registered! Your user ID is: ${registeredUserId}`);
    
    // Remove anonymous ID from storage
    localStorage.removeItem('current-anonymous-id');
    
    // Store registered user ID
    localStorage.setItem('current-user-id', registeredUserId);
    
    return registeredUserId;
  } catch (error) {
    if (error.code === 'USERNAME_TAKEN') {
      console.error('This username is already taken. Please choose another one.');
    } else if (error.code === 'EMAIL_TAKEN') {
      console.error('This email is already registered. Please use another email or log in.');
    } else {
      console.error(`Registration failed: ${error.message}`);
    }
    
    return null;
  }
}

/**
 * Example: Extending TTL for anonymous user
 */
function extendAnonymousUserExample(anonymousId: string, extensionDays: number): boolean {
  try {
    // Convert days to seconds
    const extensionSeconds = extensionDays * 24 * 60 * 60;
    
    // Extend the TTL
    const ttlInfo = anonymousUserManager.extendTimeToLive(anonymousId, extensionSeconds);
    
    // Display updated TTL information
    const daysRemaining = Math.ceil(ttlInfo.secondsRemaining / (60 * 60 * 24));
    console.log(`Your anonymous access has been extended. It now expires in ${daysRemaining} days (${new Date(ttlInfo.expirationTime).toLocaleString()})`);
    
    return true;
  } catch (error) {
    console.error(`Failed to extend anonymous user access: ${error.message}`);
    return false;
  }
}

/**
 * Example: Periodic cleanup of expired anonymous users
 */
function performMaintenanceExample(): void {
  const cleanedUpCount = anonymousUserManager.cleanupExpiredUsers();
  console.log(`Maintenance completed: Removed ${cleanedUpCount} expired anonymous users`);
}

// Export example functions for testing and demonstration
export {
  createAnonymousUserExample,
  registerUserExample,
  extendAnonymousUserExample,
  performMaintenanceExample
};