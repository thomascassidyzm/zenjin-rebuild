# ContentAccessController

## Overview

The ContentAccessController is a key component of the Zenjin Maths App's subscription system that controls access to content based on subscription tier. It enforces appropriate limitations for Anonymous, Free, and Premium users, ensuring that users can only access content suitable for their subscription level while providing a clear path to premium features.

## Features

- **Tier-Based Access Control**: Enforces content access limitations for different subscription tiers:
  - **Anonymous**: Access to 10 stitches per tube (30 total), time-limited access
  - **Free**: Access to 10 stitches per tube (30 total), permanent access
  - **Premium**: Complete access to all content (unlimited stitches)

- **Special Access Management**:
  - Grant temporary special access to specific premium content
  - Revoke special access when needed
  - Special access overrides normal tier-based restrictions

- **Access Rights Management**:
  - Maintain accurate access rights for each user
  - Update access rights when subscription changes
  - Handle access expiration correctly

- **Content Filtering**:
  - Filter accessible content based on user's subscription
  - Support filtering by content type
  - Efficient retrieval of accessible content lists

- **Performance Optimized**:
  - Content access checks complete within 50ms
  - Caching strategy for frequent access checks
  - Cache invalidation when access rights change

## Directory Structure

```
/src
  /components
    /ContentAccessController
      - ContentAccessController.ts  (Main implementation)
      - interfaces.ts               (Type definitions)
      - README.md                   (This file)
  /tests
    - ContentAccessController.tests.ts
  /examples
    - ContentAccessUsage.ts
```

## Installation

### Prerequisites

- Node.js 14.x or higher
- TypeScript 4.x or higher

### Setup

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd [repository-name]
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

## Usage

### Basic Usage

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
    // Show premium upgrade suggestion
    console.log('Suggesting premium upgrade to access this content');
  }
} catch (error) {
  console.error(`Error checking access: ${error.message}`);
}
```

### Getting User Access Rights

```typescript
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
```

### Updating Access Rights

```typescript
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
```

### Granting Special Access

```typescript
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
```

### Getting Accessible Content

```typescript
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

## API Reference

### ContentAccessController

```typescript
constructor(subscriptionManager: SubscriptionManagerInterface);
```

### checkAccess

Checks if a user has access to a specific content item.

```typescript
checkAccess(userId: string, contentId: string): {
  hasAccess: boolean;
  reason: string;
};
```

#### Parameters
- `userId`: User identifier
- `contentId`: Content item identifier

#### Returns
- Object containing:
  - `hasAccess`: Boolean indicating whether access is granted
  - `reason`: String describing the reason for the access decision

#### Throws
- `USER_NOT_FOUND`: If the specified user was not found
- `CONTENT_NOT_FOUND`: If the specified content was not found

### getUserAccessRights

Gets the access rights for a user.

```typescript
getUserAccessRights(userId: string): AccessRights;
```

#### Parameters
- `userId`: User identifier

#### Returns
- `AccessRights` object containing:
  - `userId`: User identifier
  - `accessLevel`: User's access level ('anonymous', 'free', 'premium')
  - `specialAccess`: Array of content item IDs with special access
  - `expirationDate`: ISO date string of access expiration

#### Throws
- `USER_NOT_FOUND`: If the specified user was not found
- `NO_ACCESS_RIGHTS`: If no access rights exist for this user

### updateAccessRights

Updates the access rights for a user.

```typescript
updateAccessRights(
  userId: string, 
  accessLevel: string, 
  expirationDate?: string
): AccessRights;
```

#### Parameters
- `userId`: User identifier
- `accessLevel`: New access level ('anonymous', 'free', 'premium')
- `expirationDate`: Optional ISO date string of access expiration

#### Returns
- Updated `AccessRights` object

#### Throws
- `USER_NOT_FOUND`: If the specified user was not found
- `INVALID_ACCESS_LEVEL`: If the specified access level is invalid
- `UPDATE_FAILED`: If failed to update access rights

### grantSpecialAccess

Grants special access to specific content items.

```typescript
grantSpecialAccess(
  userId: string, 
  contentIds: string[], 
  expirationDate?: string
): AccessRights;
```

#### Parameters
- `userId`: User identifier
- `contentIds`: Array of content item identifiers
- `expirationDate`: Optional ISO date string of special access expiration

#### Returns
- Updated `AccessRights` object

#### Throws
- `USER_NOT_FOUND`: If the specified user was not found
- `CONTENT_NOT_FOUND`: If one or more content items were not found
- `GRANT_FAILED`: If failed to grant special access

### revokeSpecialAccess

Revokes special access to specific content items.

```typescript
revokeSpecialAccess(
  userId: string, 
  contentIds: string[]
): AccessRights;
```

#### Parameters
- `userId`: User identifier
- `contentIds`: Array of content item identifiers

#### Returns
- Updated `AccessRights` object

#### Throws
- `USER_NOT_FOUND`: If the specified user was not found
- `REVOKE_FAILED`: If failed to revoke special access

### getAccessibleContent

Gets all content items accessible to a user.

```typescript
getAccessibleContent(
  userId: string, 
  contentType?: string
): ContentItem[];
```

#### Parameters
- `userId`: User identifier
- `contentType`: Optional filter by content type ('lesson', 'exercise', 'assessment', 'stitch')

#### Returns
- Array of accessible `ContentItem` objects

#### Throws
- `USER_NOT_FOUND`: If the specified user was not found
- `INVALID_CONTENT_TYPE`: If the specified content type is invalid

## Testing

Run the tests to verify the implementation:

```bash
npm test
```

The test suite covers:
- Subscription tier access control
- Special access granting and revocation
- Access rights updates
- Content filtering
- Error handling

## Integration Examples

See `examples/ContentAccessUsage.ts` for comprehensive integration examples showing:
- Checking content access
- Handling subscription upgrades
- Getting accessible content
- Granting trial access
- Handling expired subscriptions

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
