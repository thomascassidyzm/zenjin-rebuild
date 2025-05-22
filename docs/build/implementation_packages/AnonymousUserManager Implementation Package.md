# AnonymousUserManager Implementation Package

## Implementation Goal

Implement the AnonymousUserManager component for the Zenjin Maths App that manages anonymous users with temporary access. This component is responsible for creating anonymous user accounts, managing their time-to-live (TTL) limitations, and handling the conversion of anonymous users to registered users when they decide to create an account.

## Interface Definition

```typescript
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
```

## Module Context

The AnonymousUserManager is a key component of the SubscriptionSystem module, which manages subscription tiers (Anonymous, Free, Premium) and controls access to content and features based on the user's subscription level. The SubscriptionSystem module has the following components:

1. **SubscriptionManager**: Manages user subscription tiers and status
2. **ContentAccessController**: Controls access to content based on subscription tier
3. **PaymentProcessor**: Handles payment processing for premium subscriptions
4. **AnonymousUserManager**: Manages anonymous users with temporary access

The AnonymousUserManager component is responsible for:
- Creating and managing anonymous user accounts with temporary access
- Enforcing time-to-live (TTL) limitations for anonymous users
- Converting anonymous users to registered users when they create an account
- Preserving user progress and settings during the conversion process

### Dependencies

The AnonymousUserManager has the following dependencies:

1. **SubscriptionManagerInterface**: Used to manage subscription status for anonymous and converted users

### Anonymous User Lifecycle

The anonymous user lifecycle in the Zenjin Maths App is as follows:

1. **Creation**: A new user starts using the app without creating an account
2. **Temporary Access**: The user has access to the Free tier features with a time limitation
3. **Decision Point**: The user decides whether to create an account or continue anonymously
4. **Conversion or Expiration**: The user either converts to a registered user or their anonymous access expires

## Implementation Requirements

### Anonymous User Management

1. **User Creation**:
   - Generate unique identifiers for anonymous users
   - Set appropriate time-to-live limitations
   - Initialize user with Free tier access level
   - Store user data locally with device identifier

2. **TTL Management**:
   - Enforce time-to-live limitations (default: 7 days)
   - Provide accurate time remaining information
   - Support TTL extension in specific scenarios
   - Clean up expired anonymous users periodically

3. **User Conversion**:
   - Validate registration details
   - Create new registered user account
   - Transfer all progress and settings from anonymous to registered user
   - Maintain subscription status during conversion
   - Delete anonymous user data after successful conversion

### Data Management

1. **Local Storage**:
   - Store anonymous user data locally on the device
   - Ensure data persistence across app restarts
   - Implement appropriate data encryption

2. **Progress Preservation**:
   - Track learning progress for anonymous users
   - Preserve all progress during conversion to registered user
   - Handle edge cases like device changes during conversion

### Security Requirements

1. **Data Protection**:
   - Protect anonymous user data with appropriate encryption
   - Implement secure conversion process
   - Ensure complete data cleanup after expiration or conversion

2. **Validation**:
   - Validate all registration details during conversion
   - Check for username and email uniqueness
   - Enforce password strength requirements

### Performance Requirements

1. **Response Time**:
   - Anonymous user creation must complete within 100ms
   - TTL checks must complete within 50ms
   - User conversion must complete within 1 second

2. **Resource Usage**:
   - Minimize storage footprint for anonymous users
   - Implement efficient cleanup processes
   - Optimize for mobile device constraints

## Mock Inputs and Expected Outputs

### createAnonymousUser()

**Input**: None

**Expected Output**:
```json
"anon_1234567890"
```

### convertToRegisteredUser(anonymousId, registrationDetails)

**Input**:
```json
{
  "anonymousId": "anon_1234567890",
  "registrationDetails": {
    "username": "mathwhiz",
    "email": "mathwhiz@example.com",
    "password": "SecureP@ssw0rd",
    "displayName": "Math Enthusiast"
  }
}
```

**Expected Output**:
```json
"user_9876543210"
```

### getTimeToLive(anonymousId)

**Input**:
```json
{
  "anonymousId": "anon_1234567890"
}
```

**Expected Output**:
```json
{
  "anonymousId": "anon_1234567890",
  "creationTime": "2025-05-13T15:30:00Z",
  "expirationTime": "2025-05-20T15:30:00Z",
  "secondsRemaining": 259200,
  "isExpired": false
}
```

### isValidAnonymousUser(anonymousId)

**Input**:
```json
{
  "anonymousId": "anon_1234567890"
}
```

**Expected Output**:
```json
true
```

### extendTimeToLive(anonymousId, extensionSeconds)

**Input**:
```json
{
  "anonymousId": "anon_1234567890",
  "extensionSeconds": 86400
}
```

**Expected Output**:
```json
{
  "anonymousId": "anon_1234567890",
  "creationTime": "2025-05-13T15:30:00Z",
  "expirationTime": "2025-05-21T15:30:00Z",
  "secondsRemaining": 345600,
  "isExpired": false
}
```

### cleanupExpiredUsers()

**Input**: None

**Expected Output**:
```json
5
```

## Validation Criteria

### SS-004: Anonymous User Management

The AnonymousUserManager must correctly implement TTL for anonymous users and handle conversion to registered users:

1. **TTL Implementation**:
   - Anonymous users must have a default TTL of 7 days
   - TTL must be accurately tracked and enforced
   - TTL information must be accessible to the user
   - Expired anonymous users must be properly handled

2. **User Conversion**:
   - All user progress must be preserved during conversion
   - Conversion must validate registration details
   - Conversion must handle duplicate username/email cases
   - Conversion must update subscription status appropriately

3. **Data Management**:
   - Anonymous user data must be stored securely
   - Anonymous user data must be accessible across app restarts
   - Anonymous user data must be completely removed after conversion or expiration

4. **Error Handling**:
   - All error cases must be properly handled
   - Clear error messages must be provided
   - Edge cases like network failures during conversion must be handled

## Usage Example

```typescript
import { AnonymousUserManager } from './components/AnonymousUserManager';
import { SubscriptionManager } from './components/SubscriptionManager';

// Create dependencies
const subscriptionManager = new SubscriptionManager();

// Create anonymous user manager
const anonymousUserManager = new AnonymousUserManager(subscriptionManager);

// Create a new anonymous user
try {
  const anonymousId = anonymousUserManager.createAnonymousUser();
  console.log(`Created anonymous user: ${anonymousId}`);
  
  // Store the anonymous ID for later use
  localStorage.setItem('anonymousId', anonymousId);
  
  // Check TTL information
  const ttlInfo = anonymousUserManager.getTimeToLive(anonymousId);
  
  const expirationDate = new Date(ttlInfo.expirationTime);
  const daysRemaining = Math.ceil(ttlInfo.secondsRemaining / (60 * 60 * 24));
  
  console.log(`Anonymous access expires on ${expirationDate.toLocaleDateString()}`);
  console.log(`Days remaining: ${daysRemaining}`);
  
  // Display appropriate message to user
  if (daysRemaining <= 1) {
    console.log('Your anonymous access will expire soon. Create an account to continue using the app.');
  }
} catch (error) {
  console.error(`Error creating anonymous user: ${error.message}`);
}

// Convert anonymous user to registered user
function registerUser(anonymousId, username, email, password, displayName) {
  try {
    // Check if anonymous user is still valid
    if (!anonymousUserManager.isValidAnonymousUser(anonymousId)) {
      console.error('Your anonymous session has expired. Please restart the app to continue.');
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
    localStorage.removeItem('anonymousId');
    
    // Store registered user ID
    localStorage.setItem('userId', registeredUserId);
    
    return registeredUserId;
  } catch (error) {
    if (error.code === 'USERNAME_TAKEN') {
      console.error('This username is already taken. Please choose another one.');
    } else if (error.code === 'EMAIL_TAKEN') {
      console.error('This email is already registered. Please use another email or log in with your existing account.');
    } else if (error.code === 'ANONYMOUS_USER_EXPIRED') {
      console.error('Your anonymous session has expired. Please restart the app to continue.');
    } else {
      console.error(`Error during registration: ${error.message}`);
    }
    
    return null;
  }
}

// Example usage of the registration function
const anonymousId = localStorage.getItem('anonymousId');
if (anonymousId) {
  const registeredUserId = registerUser(
    anonymousId,
    'mathwhiz',
    'mathwhiz@example.com',
    'SecureP@ssw0rd',
    'Math Enthusiast'
  );
  
  if (registeredUserId) {
    console.log('Registration successful! Redirecting to dashboard...');
  }
}

// Maintenance: Clean up expired users (would typically be done by a background process)
function performMaintenance() {
  try {
    const cleanedUpCount = anonymousUserManager.cleanupExpiredUsers();
    console.log(`Cleaned up ${cleanedUpCount} expired anonymous users`);
  } catch (error) {
    console.error(`Error during maintenance: ${error.message}`);
  }
}

// Run maintenance periodically
setInterval(performMaintenance, 24 * 60 * 60 * 1000); // Once per day
```

## Implementation Notes

### Anonymous User Identification

The AnonymousUserManager should implement a robust identification system:

1. **ID Generation**:
   - Use a combination of timestamp, random values, and device identifier
   - Ensure IDs are unique across devices
   - Make IDs non-sequential for security

2. **ID Storage**:
   - Store IDs securely in local storage
   - Include device binding to prevent ID theft
   - Implement fallback mechanisms for storage failures

### TTL Implementation Strategy

Implement a comprehensive TTL management strategy:

1. **Time Tracking**:
   - Store creation time and expiration time
   - Calculate remaining time dynamically
   - Handle time zone and device time changes

2. **Extension Rules**:
   - Allow extensions based on user activity
   - Implement maximum TTL limits
   - Track extension history

3. **Expiration Handling**:
   - Gracefully handle expired users
   - Provide clear messaging about expiration
   - Offer simple path to registration

### Conversion Process

Design a robust conversion process:

1. **Data Transfer**:
   - Identify all data that needs to be transferred
   - Implement atomic transaction for data transfer
   - Verify successful transfer before cleanup

2. **Error Recovery**:
   - Implement rollback mechanisms for failed conversions
   - Preserve anonymous data until successful conversion
   - Handle network interruptions during conversion

3. **Duplicate Handling**:
   - Check for existing usernames and emails
   - Provide helpful suggestions for alternatives
   - Support merging of accounts in edge cases

### Security Considerations

Implement appropriate security measures:

1. **Data Protection**:
   - Encrypt sensitive anonymous user data
   - Implement secure storage practices
   - Ensure complete data removal after expiration

2. **Conversion Security**:
   - Validate all registration inputs
   - Enforce password strength requirements
   - Prevent brute force attacks on registration

3. **Privacy Compliance**:
   - Comply with relevant privacy regulations
   - Implement appropriate data retention policies
   - Provide clear privacy information to users
