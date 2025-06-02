/**
 * ContentAccessControllerInterface.ts
 * Generated from APML Interface Definition
 * Module: SubscriptionSystem
 */

import { undefined } from './undefined';

/**
 * Defines the contract for the ContentAccessController component that manages access to premium content based on subscription status.
 */
/**
 * ContentItem
 */
export interface ContentItem {
  /** Unique identifier for the content item */
  id: string;
  /** Type of content ('lesson', 'exercise', 'assessment') */
  type: string;
  /** Required access level ('free', 'basic', 'premium') */
  accessLevel: string;
  /** Additional metadata for the content item */
  metadata?: Record<string, any>;
}

/**
 * AccessRights
 */
export interface AccessRights {
  /** User identifier */
  userId: string;
  /** User's access level ('free', 'basic', 'premium') */
  accessLevel: string;
  /** IDs of content items with special access */
  specialAccess?: string[];
  /** ISO date string of access expiration */
  expirationDate?: string;
}

/**
 * Error codes for ContentAccessControllerInterface
 */
export enum ContentAccessControllerErrorCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  CONTENT_NOT_FOUND = 'CONTENT_NOT_FOUND',
  NO_ACCESS_RIGHTS = 'NO_ACCESS_RIGHTS',
  INVALID_ACCESS_LEVEL = 'INVALID_ACCESS_LEVEL',
  UPDATE_FAILED = 'UPDATE_FAILED',
  GRANT_FAILED = 'GRANT_FAILED',
  REVOKE_FAILED = 'REVOKE_FAILED',
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
   * @throws CONTENT_NOT_FOUND if The specified content was not found
   * @throws GRANT_FAILED if Failed to grant special access
   */
  grantSpecialAccess(userId: string, contentIds: any[], expirationDate?: string): AccessRights;

  /**
   * Revokes special access to specific content items
   * @param userId - User identifier
   * @param contentIds - Content item identifiers
   * @returns Updated access rights
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws REVOKE_FAILED if Failed to revoke special access
   */
  revokeSpecialAccess(userId: string, contentIds: any[]): AccessRights;

  /**
   * Gets all content items accessible to a user
   * @param userId - User identifier
   * @param contentType - Filter by content type
   * @returns Array of accessible content items
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws INVALID_CONTENT_TYPE if The specified content type is invalid
   */
  getAccessibleContent(userId: string, contentType?: string): any[];

}

// Export default interface
export default ContentAccessControllerInterface;
