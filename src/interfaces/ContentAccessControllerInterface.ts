/**
 * ContentAccessControllerInterface.ts
 * Generated from APML Interface Definition
 * Module: SubscriptionSystem
 */

/**
 * 
    Defines the contract for the ContentAccessController component that manages access to premium content based on subscription status.
  
 */
/**
 * ContentItem
 */
export interface ContentItem {
  id: string; // Unique identifier for the content item
  type: string; // Type of content ('lesson', 'exercise', 'assessment')
  accessLevel: string; // Required access level ('free', 'basic', 'premium')
  metadata?: Record<string, any>; // Additional metadata for the content item
}

/**
 * AccessRights
 */
export interface AccessRights {
  userId: string; // User identifier
  accessLevel: string; // User's access level ('free', 'basic', 'premium')
  specialAccess?: string[]; // IDs of content items with special access
  expirationDate?: string; // ISO date string of access expiration
}

/**
 * Error codes for ContentAccessControllerInterface
 */
export enum ContentAccessControllerErrorCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  CONTENT_NOT_FOUND = 'CONTENT_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  NO_ACCESS_RIGHTS = 'NO_ACCESS_RIGHTS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_ACCESS_LEVEL = 'INVALID_ACCESS_LEVEL',
  UPDATE_FAILED = 'UPDATE_FAILED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  CONTENT_NOT_FOUND = 'CONTENT_NOT_FOUND',
  GRANT_FAILED = 'GRANT_FAILED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  REVOKE_FAILED = 'REVOKE_FAILED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_CONTENT_TYPE = 'INVALID_CONTENT_TYPE',
}

/**
 * ContentAccessControllerInterface
 */
export interface ContentAccessControllerInterface {
  /**
   * Checks if a user has access to a specific content item
   * @param userId - User identifier
   * @param contentId - Content item identifier
   * @returns Access check result
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws CONTENT_NOT_FOUND if The specified content was not found
   */
  checkAccess(userId: string, contentId: string): { hasAccess: boolean; reason: string };

  /**
   * Gets the access rights for a user
   * @param userId - User identifier
   * @returns User's access rights
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws NO_ACCESS_RIGHTS if No access rights exist for this user
   */
  getUserAccessRights(userId: string): AccessRights;

  /**
   * Updates the access rights for a user
   * @param userId - User identifier
   * @param accessLevel - New access level
   * @param expirationDate - ISO date string of access expiration
   * @returns Updated access rights
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws INVALID_ACCESS_LEVEL if The specified access level is invalid
   * @throws UPDATE_FAILED if Failed to update access rights
   */
  updateAccessRights(userId: string, accessLevel: string, expirationDate?: string): AccessRights;

  /**
   * Grants special access to specific content items
   * @param userId - User identifier
   * @param contentIds - Content item identifiers
   * @param expirationDate - ISO date string of special access expiration
   * @returns Updated access rights
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws CONTENT_NOT_FOUND if One or more content items were not found
   * @throws GRANT_FAILED if Failed to grant special access
   */
  grantSpecialAccess(userId: string, contentIds: string[], expirationDate?: string): AccessRights;

  /**
   * Revokes special access to specific content items
   * @param userId - User identifier
   * @param contentIds - Content item identifiers
   * @returns Updated access rights
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws REVOKE_FAILED if Failed to revoke special access
   */
  revokeSpecialAccess(userId: string, contentIds: string[]): AccessRights;

  /**
   * Gets all content items accessible to a user
   * @param userId - User identifier
   * @param contentType - Filter by content type
   * @returns Array of accessible content items
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws INVALID_CONTENT_TYPE if The specified content type is invalid
   */
  getAccessibleContent(userId: string, contentType?: string): ContentItem[];

}

// Export default interface
export default ContentAccessControllerInterface;
