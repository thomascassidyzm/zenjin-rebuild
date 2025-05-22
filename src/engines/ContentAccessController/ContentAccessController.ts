import { ContentItem, AccessRights, ContentAccessControllerInterface } from './interfaces';

/**
 * Interface for the SubscriptionManager dependency
 */
interface SubscriptionManagerInterface {
  /**
   * Gets the subscription info for a user
   * @param userId - User identifier
   * @returns User's subscription information
   */
  getUserSubscription(userId: string): {
    userId: string;
    tier: 'anonymous' | 'free' | 'premium';
    status: 'active' | 'expired' | 'cancelled';
    startDate: string;
    endDate?: string;
  };
}

/**
 * Error types for ContentAccessController
 */
export const ErrorTypes = {
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  CONTENT_NOT_FOUND: 'CONTENT_NOT_FOUND',
  NO_ACCESS_RIGHTS: 'NO_ACCESS_RIGHTS',
  INVALID_ACCESS_LEVEL: 'INVALID_ACCESS_LEVEL',
  INVALID_CONTENT_TYPE: 'INVALID_CONTENT_TYPE',
  UPDATE_FAILED: 'UPDATE_FAILED',
  GRANT_FAILED: 'GRANT_FAILED',
  REVOKE_FAILED: 'REVOKE_FAILED'
};

/**
 * Custom error class for ContentAccessController errors
 */
class ContentAccessError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'ContentAccessError';
    this.code = code;
  }
}

/**
 * Implementation of the ContentAccessController component
 */
export class ContentAccessController implements ContentAccessControllerInterface {
  private subscriptionManager: SubscriptionManagerInterface;
  private contentRepository: Map<string, ContentItem>;
  private accessRightsRepository: Map<string, AccessRights>;
  private accessDecisionCache: Map<string, { result: boolean; timestamp: number }>;
  private readonly CACHE_TTL = 60 * 1000; // 1 minute cache TTL
  private readonly ACCESS_LEVELS = ['anonymous', 'free', 'premium'];
  private readonly CONTENT_TYPES = ['lesson', 'exercise', 'assessment', 'stitch'];
  private readonly FREE_CONTENT_LIMIT_PER_TUBE = 10;

  constructor(subscriptionManager: SubscriptionManagerInterface) {
    this.subscriptionManager = subscriptionManager;
    this.contentRepository = new Map<string, ContentItem>();
    this.accessRightsRepository = new Map<string, AccessRights>();
    this.accessDecisionCache = new Map<string, { result: boolean; timestamp: number }>();
    
    // Initialize with sample content for testing
    this.initializeSampleContent();
  }

  /**
   * Initialize sample content for testing purposes
   * In a real implementation, this would be replaced with data from a database
   */
  private initializeSampleContent(): void {
    // Sample tubes: addition, subtraction, multiplication
    const tubes = ['addition', 'subtraction', 'multiplication'];
    
    // Create free content (10 stitches per tube)
    tubes.forEach(tube => {
      for (let i = 1; i <= 10; i++) {
        const contentId = `stitch-${tube.substring(0, 3)}-${i}`;
        this.contentRepository.set(contentId, {
          id: contentId,
          type: 'stitch',
          accessLevel: 'free',
          metadata: {
            tube,
            position: i,
            questions: 20,
            distractorVariations: 5
          }
        });
      }
    });
    
    // Create premium content (additional stitches per tube)
    tubes.forEach(tube => {
      for (let i = 11; i <= 30; i++) {
        const contentId = `stitch-${tube.substring(0, 3)}-${i}`;
        this.contentRepository.set(contentId, {
          id: contentId,
          type: 'stitch',
          accessLevel: 'premium',
          metadata: {
            tube,
            position: i,
            questions: 20,
            distractorVariations: 5
          }
        });
      }
    });
  }

  /**
   * Checks if a user has access to a specific content item
   * @param userId - User identifier
   * @param contentId - Content item identifier
   * @returns Access check result
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws CONTENT_NOT_FOUND if the specified content was not found
   */
  checkAccess(userId: string, contentId: string): { hasAccess: boolean; reason: string } {
    // Validate input
    this.validateUserId(userId);
    this.validateContentId(contentId);
    
    // Check access cache first
    const cacheKey = `${userId}-${contentId}`;
    const cachedResult = this.accessDecisionCache.get(cacheKey);
    
    if (cachedResult && (Date.now() - cachedResult.timestamp) < this.CACHE_TTL) {
      return {
        hasAccess: cachedResult.result,
        reason: cachedResult.result 
          ? 'Access granted based on subscription or special access' 
          : 'Content requires higher subscription tier'
      };
    }
    
    // Get content item
    const contentItem = this.contentRepository.get(contentId);
    if (!contentItem) {
      throw new ContentAccessError(`Content not found: ${contentId}`, ErrorTypes.CONTENT_NOT_FOUND);
    }
    
    // Get user's access rights
    let accessRights: AccessRights;
    try {
      accessRights = this.getUserAccessRights(userId);
    } catch (error) {
      // If user has no access rights yet, create default rights based on subscription
      if (error instanceof ContentAccessError && error.code === ErrorTypes.NO_ACCESS_RIGHTS) {
        const subscription = this.getUserSubscription(userId);
        accessRights = {
          userId,
          accessLevel: subscription.tier,
          specialAccess: []
        };
        
        if (subscription.endDate) {
          accessRights.expirationDate = subscription.endDate;
        }
        
        // Save the created access rights
        this.accessRightsRepository.set(userId, accessRights);
      } else {
        throw error;
      }
    }
    
    // Check for special access
    if (accessRights.specialAccess && accessRights.specialAccess.includes(contentId)) {
      // Check if special access has expired
      if (accessRights.expirationDate && new Date(accessRights.expirationDate) < new Date()) {
        // Special access has expired
        const result = {
          hasAccess: false,
          reason: 'Special access has expired'
        };
        this.cacheAccessDecision(cacheKey, result.hasAccess);
        return result;
      } else {
        // Special access is valid
        const result = {
          hasAccess: true,
          reason: 'Access granted due to special access'
        };
        this.cacheAccessDecision(cacheKey, result.hasAccess);
        return result;
      }
    }
    
    // Check subscription-based access
    const hasAccess = this.hasSubscriptionBasedAccess(accessRights.accessLevel, contentItem);
    
    // If access is not granted by subscription, check if it's because of tube limits
    let reason: string;
    if (!hasAccess) {
      if (contentItem.accessLevel === 'premium' && accessRights.accessLevel !== 'premium') {
        reason = 'Content requires premium subscription';
      } else if (contentItem.accessLevel === 'free' && accessRights.accessLevel === 'free') {
        // Check if this is because of per-tube limits
        const tube = contentItem.metadata?.tube;
        if (tube) {
          const positionInTube = contentItem.metadata?.position || 0;
          if (positionInTube > this.FREE_CONTENT_LIMIT_PER_TUBE) {
            reason = `Free tier limited to ${this.FREE_CONTENT_LIMIT_PER_TUBE} stitches per tube`;
          } else {
            reason = 'Content access limit reached for free tier';
          }
        } else {
          reason = 'Content requires higher subscription tier';
        }
      } else {
        reason = 'Content requires higher subscription tier';
      }
    } else {
      reason = 'Access granted based on subscription level';
    }
    
    const result = { hasAccess, reason };
    this.cacheAccessDecision(cacheKey, hasAccess);
    return result;
  }

  /**
   * Cache the result of an access decision
   * @param cacheKey - Cache key (userId-contentId)
   * @param result - Access decision result
   */
  private cacheAccessDecision(cacheKey: string, result: boolean): void {
    this.accessDecisionCache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });
  }

  /**
   * Invalidate access decision cache for a user
   * @param userId - User identifier
   */
  private invalidateAccessCache(userId: string): void {
    // Remove all cache entries that start with userId
    for (const key of this.accessDecisionCache.keys()) {
      if (key.startsWith(`${userId}-`)) {
        this.accessDecisionCache.delete(key);
      }
    }
  }

  /**
   * Determines if a user has access to content based on subscription level alone
   * @param userAccessLevel - User's access level
   * @param contentItem - Content item
   * @returns Whether user has access based on subscription
   */
  private hasSubscriptionBasedAccess(userAccessLevel: string, contentItem: ContentItem): boolean {
    // Convert access levels to numeric values for comparison
    const accessLevelValues: { [key: string]: number } = {
      'anonymous': 0,
      'free': 1,
      'premium': 2
    };
    
    const userAccessValue = accessLevelValues[userAccessLevel] || 0;
    const contentAccessValue = accessLevelValues[contentItem.accessLevel] || 0;
    
    // User has access if their access level is greater than or equal to content's required level
    if (userAccessValue >= contentAccessValue) {
      // For free/anonymous users, check tube-based limits
      if (userAccessValue < 2 && contentItem.type === 'stitch') {
        const tube = contentItem.metadata?.tube;
        const position = contentItem.metadata?.position || 0;
        
        // Free users only get access to first 10 stitches per tube
        if (tube && position > this.FREE_CONTENT_LIMIT_PER_TUBE) {
          return false;
        }
      }
      
      return true;
    }
    
    return false;
  }

  /**
   * Gets the access rights for a user
   * @param userId - User identifier
   * @returns User's access rights
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws NO_ACCESS_RIGHTS if no access rights exist for this user
   */
  getUserAccessRights(userId: string): AccessRights {
    // Validate user ID
    this.validateUserId(userId);
    
    // Get access rights
    const accessRights = this.accessRightsRepository.get(userId);
    
    if (!accessRights) {
      throw new ContentAccessError(`No access rights found for user: ${userId}`, ErrorTypes.NO_ACCESS_RIGHTS);
    }
    
    return { ...accessRights };
  }

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
  ): AccessRights {
    // Validate input
    this.validateUserId(userId);
    this.validateAccessLevel(accessLevel);
    
    if (expirationDate) {
      this.validateDate(expirationDate);
    }
    
    try {
      // Get existing access rights or create new ones
      let accessRights: AccessRights;
      
      try {
        accessRights = this.getUserAccessRights(userId);
      } catch (error) {
        if (error instanceof ContentAccessError && error.code === ErrorTypes.NO_ACCESS_RIGHTS) {
          // Create new access rights
          accessRights = {
            userId,
            accessLevel: 'free', // Default
            specialAccess: []
          };
        } else {
          throw error;
        }
      }
      
      // Update access rights
      accessRights.accessLevel = accessLevel;
      
      if (expirationDate) {
        accessRights.expirationDate = expirationDate;
      } else if (accessRights.expirationDate) {
        // Remove expiration date if not provided
        delete accessRights.expirationDate;
      }
      
      // Save updated access rights
      this.accessRightsRepository.set(userId, accessRights);
      
      // Invalidate cache for this user
      this.invalidateAccessCache(userId);
      
      return { ...accessRights };
    } catch (error) {
      if (error instanceof ContentAccessError) {
        throw error;
      }
      
      throw new ContentAccessError(
        `Failed to update access rights for user: ${userId}`,
        ErrorTypes.UPDATE_FAILED
      );
    }
  }

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
  ): AccessRights {
    // Validate input
    this.validateUserId(userId);
    this.validateContentIds(contentIds);
    
    if (expirationDate) {
      this.validateDate(expirationDate);
    }
    
    try {
      // Get existing access rights or create new ones
      let accessRights: AccessRights;
      
      try {
        accessRights = this.getUserAccessRights(userId);
      } catch (error) {
        if (error instanceof ContentAccessError && error.code === ErrorTypes.NO_ACCESS_RIGHTS) {
          // Create new access rights with user's subscription level
          const subscription = this.getUserSubscription(userId);
          accessRights = {
            userId,
            accessLevel: subscription.tier,
            specialAccess: []
          };
        } else {
          throw error;
        }
      }
      
      // Initialize specialAccess array if it doesn't exist
      if (!accessRights.specialAccess) {
        accessRights.specialAccess = [];
      }
      
      // Add content IDs to special access
      contentIds.forEach(contentId => {
        if (!accessRights.specialAccess!.includes(contentId)) {
          accessRights.specialAccess!.push(contentId);
        }
      });
      
      // Update expiration date if provided
      if (expirationDate) {
        accessRights.expirationDate = expirationDate;
      }
      
      // Save updated access rights
      this.accessRightsRepository.set(userId, accessRights);
      
      // Invalidate cache for this user
      this.invalidateAccessCache(userId);
      
      return { ...accessRights };
    } catch (error) {
      if (error instanceof ContentAccessError) {
        throw error;
      }
      
      throw new ContentAccessError(
        `Failed to grant special access for user: ${userId}`,
        ErrorTypes.GRANT_FAILED
      );
    }
  }

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
  ): AccessRights {
    // Validate input
    this.validateUserId(userId);
    
    try {
      // Get existing access rights
      const accessRights = this.getUserAccessRights(userId);
      
      // If no special access, return as is
      if (!accessRights.specialAccess || accessRights.specialAccess.length === 0) {
        return { ...accessRights };
      }
      
      // Remove content IDs from special access
      accessRights.specialAccess = accessRights.specialAccess.filter(
        contentId => !contentIds.includes(contentId)
      );
      
      // Save updated access rights
      this.accessRightsRepository.set(userId, accessRights);
      
      // Invalidate cache for this user
      this.invalidateAccessCache(userId);
      
      return { ...accessRights };
    } catch (error) {
      if (error instanceof ContentAccessError) {
        throw error;
      }
      
      throw new ContentAccessError(
        `Failed to revoke special access for user: ${userId}`,
        ErrorTypes.REVOKE_FAILED
      );
    }
  }

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
  ): ContentItem[] {
    // Validate input
    this.validateUserId(userId);
    
    if (contentType) {
      this.validateContentType(contentType);
    }
    
    // Get user's access rights or create default rights based on subscription
    let accessRights: AccessRights;
    
    try {
      accessRights = this.getUserAccessRights(userId);
    } catch (error) {
      if (error instanceof ContentAccessError && error.code === ErrorTypes.NO_ACCESS_RIGHTS) {
        const subscription = this.getUserSubscription(userId);
        accessRights = {
          userId,
          accessLevel: subscription.tier,
          specialAccess: []
        };
        
        if (subscription.endDate) {
          accessRights.expirationDate = subscription.endDate;
        }
      } else {
        throw error;
      }
    }
    
    // Check if access has expired
    const isExpired = accessRights.expirationDate && new Date(accessRights.expirationDate) < new Date();
    
    // If expired, treat as anonymous user
    const effectiveAccessLevel = isExpired ? 'anonymous' : accessRights.accessLevel;
    
    // Special access items that haven't expired
    const validSpecialAccess = !isExpired ? (accessRights.specialAccess || []) : [];
    
    // Filter content based on access rights
    const accessibleContent: ContentItem[] = [];
    
    // Track number of stitches per tube for free/anonymous users
    const tubeStitchCount: { [tube: string]: number } = {};
    
    // Iterate through all content items
    this.contentRepository.forEach(contentItem => {
      // Filter by content type if specified
      if (contentType && contentItem.type !== contentType) {
        return;
      }
      
      // Check if content is accessible via special access
      if (validSpecialAccess.includes(contentItem.id)) {
        accessibleContent.push(contentItem);
        return;
      }
      
      // Check if accessible via subscription level
      const tube = contentItem.metadata?.tube;
      const position = contentItem.metadata?.position || 0;
      
      // For free/anonymous users, enforce tube limits
      if (effectiveAccessLevel !== 'premium' && contentItem.type === 'stitch' && tube) {
        // Initialize count for this tube if needed
        if (!tubeStitchCount[tube]) {
          tubeStitchCount[tube] = 0;
        }
        
        // Check if adding this would exceed limit
        if (tubeStitchCount[tube] >= this.FREE_CONTENT_LIMIT_PER_TUBE) {
          return;
        }
        
        // Check if this stitch is within the allowed positions
        if (position > this.FREE_CONTENT_LIMIT_PER_TUBE) {
          return;
        }
        
        // This stitch is accessible
        accessibleContent.push(contentItem);
        tubeStitchCount[tube]++;
      } 
      // For premium users, or non-stitch content, check normal access rules
      else if (this.hasSubscriptionBasedAccess(effectiveAccessLevel, contentItem)) {
        accessibleContent.push(contentItem);
      }
    });
    
    return accessibleContent;
  }

  /**
   * Gets user subscription information from the SubscriptionManager
   * @param userId - User identifier
   * @returns User's subscription information
   * @throws USER_NOT_FOUND if the specified user was not found
   */
  private getUserSubscription(userId: string): ReturnType<SubscriptionManagerInterface['getUserSubscription']> {
    try {
      return this.subscriptionManager.getUserSubscription(userId);
    } catch (error) {
      throw new ContentAccessError(`User not found: ${userId}`, ErrorTypes.USER_NOT_FOUND);
    }
  }

  /**
   * Validates a user ID
   * @param userId - User identifier to validate
   * @throws USER_NOT_FOUND if the user ID is invalid
   */
  private validateUserId(userId: string): void {
    if (!userId || typeof userId !== 'string') {
      throw new ContentAccessError(`Invalid user ID: ${userId}`, ErrorTypes.USER_NOT_FOUND);
    }
    
    try {
      this.getUserSubscription(userId);
    } catch (error) {
      throw new ContentAccessError(`User not found: ${userId}`, ErrorTypes.USER_NOT_FOUND);
    }
  }

  /**
   * Validates a content ID
   * @param contentId - Content identifier to validate
   * @throws CONTENT_NOT_FOUND if the content ID is invalid
   */
  private validateContentId(contentId: string): void {
    if (!contentId || typeof contentId !== 'string') {
      throw new ContentAccessError(`Invalid content ID: ${contentId}`, ErrorTypes.CONTENT_NOT_FOUND);
    }
    
    if (!this.contentRepository.has(contentId)) {
      throw new ContentAccessError(`Content not found: ${contentId}`, ErrorTypes.CONTENT_NOT_FOUND);
    }
  }

  /**
   * Validates an array of content IDs
   * @param contentIds - Content identifiers to validate
   * @throws CONTENT_NOT_FOUND if any content ID is invalid
   */
  private validateContentIds(contentIds: string[]): void {
    if (!Array.isArray(contentIds) || contentIds.length === 0) {
      throw new ContentAccessError('Content IDs must be a non-empty array', ErrorTypes.CONTENT_NOT_FOUND);
    }
    
    contentIds.forEach(contentId => this.validateContentId(contentId));
  }

  /**
   * Validates an access level
   * @param accessLevel - Access level to validate
   * @throws INVALID_ACCESS_LEVEL if the access level is invalid
   */
  private validateAccessLevel(accessLevel: string): void {
    if (!this.ACCESS_LEVELS.includes(accessLevel)) {
      throw new ContentAccessError(
        `Invalid access level: ${accessLevel}. Must be one of: ${this.ACCESS_LEVELS.join(', ')}`,
        ErrorTypes.INVALID_ACCESS_LEVEL
      );
    }
  }

  /**
   * Validates a content type
   * @param contentType - Content type to validate
   * @throws INVALID_CONTENT_TYPE if the content type is invalid
   */
  private validateContentType(contentType: string): void {
    if (!this.CONTENT_TYPES.includes(contentType)) {
      throw new ContentAccessError(
        `Invalid content type: ${contentType}. Must be one of: ${this.CONTENT_TYPES.join(', ')}`,
        ErrorTypes.INVALID_CONTENT_TYPE
      );
    }
  }

  /**
   * Validates a date string
   * @param dateString - ISO date string to validate
   * @throws Error if the date string is invalid
   */
  private validateDate(dateString: string): void {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${dateString}. Must be a valid ISO date string.`);
    }
  }
}
