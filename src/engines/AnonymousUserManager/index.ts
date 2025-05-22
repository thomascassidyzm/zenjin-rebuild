import { AnonymousUserManager } from './AnonymousUserManager';
import { AnonymousUserStorage } from './AnonymousUserStorage';
import { 
  AnonymousUserInterface, 
  AnonymousUserData, 
  RegisteredUserData, 
  TimeToLiveInfo, 
  RegistrationDetails, 
  AnonymousUserError, 
  AnonymousUserErrorCode 
} from './AnonymousUserTypes';
import { SubscriptionManager } from '../SubscriptionManager/SubscriptionManager';

/**
 * Factory function to create a new AnonymousUserManager instance
 * @returns A new AnonymousUserManager instance
 */
export function createAnonymousUserManager(): AnonymousUserInterface {
  const subscriptionManager = new SubscriptionManager();
  return new AnonymousUserManager(subscriptionManager);
}

export {
  AnonymousUserManager,
  AnonymousUserStorage,
  AnonymousUserInterface,
  AnonymousUserData,
  RegisteredUserData,
  TimeToLiveInfo,
  RegistrationDetails,
  AnonymousUserError,
  AnonymousUserErrorCode
};