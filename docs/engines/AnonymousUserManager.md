# AnonymousUserManager Component

## Overview

The AnonymousUserManager component for the Zenjin Maths App handles anonymous users with temporary access, manages their time-to-live (TTL) limitations, and facilitates conversion to registered users while preserving progress and settings.

## Key Features

- Creation of anonymous user accounts with a default 7-day TTL
- TTL management including expiration enforcement and extension
- Secure conversion from anonymous to registered user accounts
- Progress and settings preservation during conversion
- Local storage of user data with encryption
- Cleanup of expired anonymous users

## Files Structure

The component is organized into four main files:

1. **AnonymousUserTypes.ts**: Contains all type definitions, interfaces, and error classes used by the component.
2. **AnonymousUserStorage.ts**: Handles data persistence and encryption/decryption of user data in local storage.
3. **AnonymousUserManager.ts**: Implements the core functionality of the AnonymousUserManager component.
4. **AnonymousUserExample.ts**: Demonstrates the usage of the AnonymousUserManager component.

## Dependencies

- **SubscriptionManager**: Required for managing subscription status of anonymous and registered users.
- **uuid**: Used for generating unique identifiers for users.
- **localStorage**: Used for persisting user data.

## Installation

1. Make sure you have the required dependencies installed:

```bash
npm install uuid
```

## Usage Example

```typescript
import { AnonymousUserManager } from './AnonymousUserManager';
import { SubscriptionManager } from '../SubscriptionManager/SubscriptionManager';

// Initialize dependencies
const subscriptionManager = new SubscriptionManager();

// Create the AnonymousUserManager instance
const anonymousUserManager = new AnonymousUserManager(subscriptionManager);

// Create a new anonymous user
try {
  const anonymousId = anonymousUserManager.createAnonymousUser();
  console.log(`Created anonymous user: ${anonymousId}`);
  
  // Store anonymous ID in local storage for future sessions
  localStorage.setItem('current-anonymous-id', anonymousId);
  
  // Display TTL information to the user
  const ttlInfo = anonymousUserManager.getTimeToLive(anonymousId);
  const daysRemaining = Math.ceil(ttlInfo.secondsRemaining / (60 * 60 * 24));
  
  console.log(`Your anonymous access expires in ${daysRemaining} days (${new Date(ttlInfo.expirationTime).toLocaleString()})`);
  
} catch (error) {
  console.error(`Error creating anonymous user: ${error.message}`);
}
```

## Security Considerations

The current implementation uses a simple Base64 encoding for data "encryption" which is NOT secure for production use. In a real-world implementation, you should:

1. Replace the `encrypt()` and `decrypt()` methods in `AnonymousUserStorage` with a proper encryption implementation (e.g., using the Web Crypto API).
2. Consider using a more secure storage mechanism than localStorage for sensitive user data.
3. Implement proper authentication and authorization controls.

## TTL Management

Anonymous users have a default TTL of 7 days (configurable via `DEFAULT_TTL_SECONDS` in the `AnonymousUserManager` class). The TTL can be extended using the `extendTimeToLive()` method, but only if the user has not already expired.

## Integration Points

- **SubscriptionManager**: The AnonymousUserManager interacts with the SubscriptionManager to initialize subscriptions for new anonymous users and to transfer subscriptions when converting to registered users.
- **ProgressTracker**: Although not directly integrated, the AnonymousUserManager preserves progress data when converting anonymous users to registered users, which can then be used by the ProgressTracker.

## Extension Points

The component is designed to be extensible in several ways:

1. The storage mechanism can be replaced by providing a custom implementation to the `AnonymousUserManager` constructor.
2. The encryption/decryption methods can be enhanced for better security.
3. The default TTL can be modified to meet specific business requirements.
4. Additional validation rules can be added to the `validateRegistrationDetails()` method.