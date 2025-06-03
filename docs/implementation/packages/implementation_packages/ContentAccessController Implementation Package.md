# ContentAccessController Implementation Package

## Implementation Goal

Implement the ContentAccessController component for the Zenjin Maths App that controls access to content based on subscription tier, enforcing the appropriate limitations for Anonymous, Free, and Premium users. This component ensures that users can only access content appropriate for their subscription level while providing a clear path to premium features.

## Interface Definition

```typescript
/**
 * Represents a content item in the system
 */
export interface ContentItem {
  /** Unique identifier for the content item */
  id: string;
  
  /** Type of content ('lesson', 'exercise', 'assessment') */
  type: string;
  
  /** Required access level ('free', 'basic', 'premium') */
  accessLevel: string;
  
  /** Additional metadata for the content item (optional) */
  metadata?: Record<string, any>;
}

/**
 * Represents a user's access rights in the system
 */
export interface AccessRights {
  /** User identifier */
  userId: string;
  
  /** User's access level ('free', 'basic', 'premium') */
  accessLevel: string;
  
  /** IDs of content items with special access (optional) */
  specialAccess?: string[];
  
  /** ISO date string of access expiration (optional) */
  expirationDate?: string;
}

/**
 * Interface for the ContentAccessController component that manages access to premium content based on subscription status
 */
export interface ContentAccessControllerInterface {
  /**
   * Checks if a user has access to a specific content item
   * @param userId - User identifier
   * @param contentId - Content item identifier
   * @returns Access check result
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws CONTENT_NOT_FOUND if the specified content was not found
   */
  checkAccess(userId: string, contentId: string): {
    hasAccess: boolean;
    reason: string;
  };
  
  /**
   * Gets the access rights for a user
   * @param userId - User identifier
   * @returns User's access rights
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws NO_ACCESS_RIGHTS if no access rights exist for this user
   */
  getUserAccessRights(userId: string): AccessRights;
  
  /**
   * Updates the access rights for a user
   * @param userId - User identifier
   * @param accessLevel - New access level
   * @param expirationDate - ISO date string of access expiration (optional)
   * @returns Updated access rights
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws INVALID_ACCESS_LEVEL if the specified access level is invalid
   * @throws UPDATE_FAILED if failed to update access rights
   */
  updateAccessRights(
    userId: string, 
    accessLevel: string, 
    expirationDate?: string
  ): AccessRights;
  
  /**
   * Grants special access to specific content items
   * @param userId - User identifier
   * @param contentIds - Content item identifiers
   * @param expirationDate - ISO date string of special access expiration (optional)
   * @returns Updated access rights
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws CONTENT_NOT_FOUND if one or more content items were not found
   * @throws GRANT_FAILED if failed to grant special access
   */
  grantSpecialAccess(
    userId: string, 
    contentIds: string[], 
    expirationDate?: string
  ): AccessRights;
  
  /**
   * Revokes special access to specific content items
   * @param userId - User identifier
   * @param contentIds - Content item identifiers
   * @returns Updated access rights
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws REVOKE_FAILED if failed to revoke special access
   */
  revokeSpecialAccess(
    userId: string, 
    contentIds: string[]
  ): AccessRights;
  
  /**
   * Gets all content items accessible to a user
   * @param userId - User identifier
   * @param contentType - Filter by content type (optional)
   * @returns Array of accessible content items
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws INVALID_CONTENT_TYPE if the specified content type is invalid
   */
  getAccessibleContent(
    userId: string, 
    contentType?: string
  ): ContentItem[];
}
```

## Module Context

The ContentAccessController is a key component of the SubscriptionSystem module, which manages subscription tiers (Anonymous, Free, Premium) and controls access to content and features based on the user's subscription level. The SubscriptionSystem module has the following components:

1. **SubscriptionManager**: Manages user subscription tiers and status
2. **ContentAccessController**: Controls access to content based on subscription tier
3. **PaymentProcessor**: Handles payment processing for premium subscriptions
4. **AnonymousUserManager**: Manages anonymous users with temporary access

The ContentAccessController component is responsible for:
- Enforcing content access limitations based on subscription tier
- Checking if users have access to specific content
- Providing lists of accessible content for users
- Managing special access grants for specific content
- Reporting content limits based on subscription tier

### Dependencies

The ContentAccessController has the following dependencies:

1. **SubscriptionManagerInterface**: Used to retrieve subscription information for users

### Subscription Tiers and Content Access

The Zenjin Maths App has three subscription tiers with different content access levels:

1. **Anonymous**:
   - Access to 10 stitches per tube (30 total), each with 20 questions × 5 distractor variations
   - Progress only saved on current device
   - Time-limited access (TTL)

2. **Free**:
   - Access to 10 stitches per tube (30 total), each with 20 questions × 5 distractor variations
   - Progress saved to user account
   - No time limitation

3. **Premium**:
   - Complete access to all content (unlimited stitches)
   - Access to advanced features and analytics
   - No time or content limitations

## Implementation Requirements

### Content Access Control

1. **Tier-Based Access Control**:
   - The component must correctly enforce content access limitations based on subscription tier
   - Each tier must provide the correct set of features and limitations
   - Premium content must be inaccessible to Anonymous and Free users

2. **Special Access Management**:
   - Support for granting temporary special access to specific content
   - Support for revoking special access when needed
   - Special access should override normal tier-based restrictions

3. **Access Rights Management**:
   - Maintain accurate access rights for each user
   - Support updating access rights when subscription changes
   - Handle access expiration correctly

### Content Filtering

1. **Content Listing**:
   - Provide filtered lists of accessible content based on user's subscription
   - Support filtering by content type
   - Ensure efficient retrieval of accessible content lists

2. **Content Metadata**:
   - Support additional metadata for content items
   - Use metadata for advanced filtering and organization

### Performance Requirements

1. **Access Check Efficiency**:
   - Content access checks must complete within 50ms
   - Optimize for frequent access checks during user sessions

2. **Caching Strategy**:
   - Implement appropriate caching for access rights
   - Invalidate cache when access rights change

### Error Handling

1. **Validation**:
   - Validate user IDs and content IDs
   - Check for valid access levels and content types
   - Verify existence of users and content items

2. **Error Reporting**:
   - Provide clear error messages for all failure scenarios
   - Log detailed error information for debugging
   - Return appropriate error codes to callers

## Mock Inputs and Expected Outputs

### checkAccess(userId, contentId)

**Input**:
```json
{
  "userId": "user123",
  "contentId": "stitch-mult-11"
}
```

**Expected Output**:
```json
{
  "hasAccess": false,
  "reason": "Content requires premium subscription"
}
```

### getUserAccessRights(userId)

**Input**:
```json
{
  "userId": "user123"
}
```

**Expected Output**:
```json
{
  "userId": "user123",
  "accessLevel": "free",
  "specialAccess": ["stitch-premium-1", "stitch-premium-2"],
  "expirationDate": "2025-06-20T15:30:00Z"
}
```

### updateAccessRights(userId, accessLevel, expirationDate)

**Input**:
```json
{
  "userId": "user123",
  "accessLevel": "premium",
  "expirationDate": "2026-05-20T15:30:00Z"
}
```

**Expected Output**:
```json
{
  "userId": "user123",
  "accessLevel": "premium",
  "specialAccess": ["stitch-premium-1", "stitch-premium-2"],
  "expirationDate": "2026-05-20T15:30:00Z"
}
```

### grantSpecialAccess(userId, contentIds, expirationDate)

**Input**:
```json
{
  "userId": "user123",
  "contentIds": ["stitch-premium-3", "stitch-premium-4"],
  "expirationDate": "2025-06-01T15:30:00Z"
}
```

**Expected Output**:
```json
{
  "userId": "user123",
  "accessLevel": "free",
  "specialAccess": ["stitch-premium-1", "stitch-premium-2", "stitch-premium-3", "stitch-premium-4"],
  "expirationDate": "2025-06-01T15:30:00Z"
}
```

### revokeSpecialAccess(userId, contentIds)

**Input**:
```json
{
  "userId": "user123",
  "contentIds": ["stitch-premium-1", "stitch-premium-2"]
}
```

**Expected Output**:
```json
{
  "userId": "user123",
  "accessLevel": "free",
  "specialAccess": ["stitch-premium-3", "stitch-premium-4"],
  "expirationDate": "2025-06-01T15:30:00Z"
}
```

### getAccessibleContent(userId, contentType)

**Input**:
```json
{
  "userId": "user123",
  "contentType": "stitch"
}
```

**Expected Output**:
```json
[
  {
    "id": "stitch-add-1",
    "type": "stitch",
    "accessLevel": "free",
    "metadata": {
      "tube": "addition",
      "position": 1
    }
  },
  {
    "id": "stitch-add-2",
    "type": "stitch",
    "accessLevel": "free",
    "metadata": {
      "tube": "addition",
      "position": 2
    }
  },
  // ... more free stitches
  {
    "id": "stitch-premium-3",
    "type": "stitch",
    "accessLevel": "premium",
    "metadata": {
      "tube": "multiplication",
      "position": 15
    }
  },
  {
    "id": "stitch-premium-4",
    "type": "stitch",
    "accessLevel": "premium",
    "metadata": {
      "tube": "division",
      "position": 12
    }
  }
]
```

## Validation Criteria

### SS-002: Content Access Enforcement

The ContentAccessController must correctly enforce content access limitations based on subscription tier:

1. **Anonymous and Free Tier Limitations**:
   - Access must be limited to 10 stitches per tube (30 total)
   - Each stitch should have 20 questions × 5 distractor variations
   - Premium content must be inaccessible

2. **Premium Tier Access**:
   - Complete access to all content must be provided
   - No limitations on number of stitches
   - All advanced features must be accessible

3. **Special Access Handling**:
   - Special access grants must override normal tier limitations
   - Special access must respect expiration dates
   - Revoking special access must immediately remove access

4. **Access Rights Updates**:
   - When a user upgrades from Free to Premium, all content should become accessible
   - When a user downgrades from Premium to Free, access should be restricted to Free tier content
   - Access rights changes must take effect immediately

### SS-005: Subscription Tier Features

Each subscription tier must provide the correct set of features and limitations:

1. **Anonymous Tier**:
   - Limited to 10 stitches per tube (30 total)
   - Each stitch has 20 questions × 5 distractor variations
   - Progress saved only on the current device
   - Time-limited access (TTL)

2. **Free Tier**:
   - Limited to 10 stitches per tube (30 total)
   - Each stitch has 20 questions × 5 distractor variations
   - Progress saved to user account
   - No time limitation

3. **Premium Tier**:
   - Unlimited stitches
   - Advanced analytics and progress tracking
   - Priority support
   - No time or content limitations

## Usage Example

```typescript
import { ContentAccessController } from './components/ContentAccessController';
import { SubscriptionManager } from './components/SubscriptionManager';

// Create dependencies
const subscriptionManager = new SubscriptionManager();

// Create content access controller
const contentAccessController = new ContentAccessController(subscriptionManager);

// Check if a user has access to content
try {
  const accessResult = contentAccessController.checkAccess('user123', 'stitch-mult-11');
  console.log(`Has access: ${accessResult.hasAccess}`);
  console.log(`Reason: ${accessResult.reason}`);
  
  if (!accessResult.hasAccess) {
    console.log('Suggesting premium upgrade to access this content');
  }
} catch (error) {
  console.error(`Error checking access: ${error.message}`);
}

// Get user's access rights
try {
  const accessRights = contentAccessController.getUserAccessRights('user123');
  console.log(`Access level: ${accessRights.accessLevel}`);
  
  if (accessRights.specialAccess && accessRights.specialAccess.length > 0) {
    console.log(`Special access items: ${accessRights.specialAccess.length}`);
  }
  
  if (accessRights.expirationDate) {
    const expirationDate = new Date(accessRights.expirationDate);
    const now = new Date();
    const daysRemaining = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    console.log(`Access expires in ${daysRemaining} days`);
  }
} catch (error) {
  console.error(`Error getting access rights: ${error.message}`);
}

// Update access rights based on subscription change
try {
  const updatedRights = contentAccessController.updateAccessRights(
    'user123',
    'premium',
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
  );

  console.log(`Updated access level: ${updatedRights.accessLevel}`);
  console.log(`New expiration date: ${updatedRights.expirationDate}`);
} catch (error) {
  console.error(`Error updating access rights: ${error.message}`);
}

// Grant special access to premium content for a free user
try {
  const withSpecialAccess = contentAccessController.grantSpecialAccess(
    'user456', // Free user
    ['stitch-premium-1', 'stitch-premium-2'],
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
  );

  console.log(`Special access granted to: ${withSpecialAccess.specialAccess.join(', ')}`);
  console.log(`Special access expires: ${withSpecialAccess.expirationDate}`);
} catch (error) {
  console.error(`Error granting special access: ${error.message}`);
}

// Get all accessible content for a user
try {
  const accessibleContent = contentAccessController.getAccessibleContent('user123', 'stitch');
  console.log(`Accessible stitches: ${accessibleContent.length}`);
  
  // Group by tube
  const contentByTube = accessibleContent.reduce((acc, content) => {
    const tube = content.metadata?.tube || 'unknown';
    if (!acc[tube]) {
      acc[tube] = [];
    }
    acc[tube].push(content);
    return acc;
  }, {});
  
  Object.entries(contentByTube).forEach(([tube, contents]) => {
    console.log(`${tube}: ${contents.length} stitches`);
  });
} catch (error) {
  console.error(`Error getting accessible content: ${error.message}`);
}
```

## Implementation Notes

### Access Control Strategy

The ContentAccessController should implement a multi-layered access control strategy:

1. **Base Access Level**: Determined by the user's subscription tier
2. **Special Access Overrides**: Specific content items granted special access
3. **Expiration Checks**: Ensuring access is only granted within valid time periods

This layered approach allows for flexible access control while maintaining the core tier-based restrictions.

### Content Metadata Management

Content metadata should be used to enhance the access control system:

1. **Tube Assignment**: Tracking which tube each stitch belongs to
2. **Position Tracking**: Tracking the position of each stitch within its tube
3. **Difficulty Levels**: Storing information about content difficulty
4. **Prerequisites**: Defining prerequisite relationships between content items

### Caching and Performance Optimization

To meet the 50ms performance requirement for access checks, implement:

1. **User Rights Caching**: Cache user access rights for quick lookup
2. **Content Metadata Caching**: Cache content metadata to avoid repeated lookups
3. **Access Decision Caching**: Cache recent access decisions for frequently accessed content
4. **Cache Invalidation**: Implement proper cache invalidation when access rights change

### Error Handling Strategy

Implement a comprehensive error handling strategy:

1. **Input Validation**: Validate all inputs before processing
2. **Error Types**: Use specific error types for different failure scenarios
3. **Logging**: Log all errors with appropriate context for debugging
4. **User-Friendly Messages**: Provide clear, user-friendly error messages

### Security Considerations

The ContentAccessController must implement appropriate security measures:

1. **Access Verification**: Always verify access rights before serving content
2. **Expiration Enforcement**: Strictly enforce access expiration dates
3. **Audit Trail**: Maintain an audit trail of access rights changes
4. **Rate Limiting**: Implement rate limiting for access checks to prevent abuse
