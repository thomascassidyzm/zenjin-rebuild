/**
 * Interface for managing caching of content for offline use
 */
export interface ContentCachingInterface {
  /**
   * Caches content for offline use
   * @param contentIds Array of content identifiers to cache
   * @param options Optional caching options
   * @returns Result of the caching operation
   * @throws Error if caching operation fails
   */
  cacheContent(contentIds: string[], options?: CachingOptions): Promise<CacheResult>;
  
  /**
   * Retrieves cached content
   * @param contentId Content identifier
   * @returns Cached content or undefined if not cached
   * @throws Error if retrieval operation fails
   */
  getCachedContent(contentId: string): Promise<any | undefined>;
  
  /**
   * Checks if content is cached
   * @param contentId Content identifier
   * @returns Whether the content is cached
   */
  isCached(contentId: string): Promise<boolean>;
  
  /**
   * Gets cache status for specified content
   * @param contentIds Optional array of content identifiers
   * @returns Cache status for the specified content
   */
  getCacheStatus(contentIds?: string[]): Promise<CacheStatus>;

  /**
   * Removes cached content
   * @param contentId Content identifier to remove
   * @returns Whether the operation was successful
   */
  removeCachedContent(contentId: string): Promise<boolean>;

  /**
   * Clears all cached content
   * @returns Whether the operation was successful
   */
  clearCache(): Promise<boolean>;
}

/**
 * Interface for offline storage operations
 */
export interface OfflineStorageInterface {
  /**
   * Retrieves an item from storage
   * @param store Store identifier
   * @param key Item key
   * @returns Stored item or undefined if not found
   */
  getItem(store: string, key: string): Promise<any | undefined>;
  
  /**
   * Stores an item
   * @param store Store identifier
   * @param key Item key
   * @param value Item value
   * @param options Optional storage options
   * @returns Whether the operation was successful
   */
  setItem(store: string, key: string, value: any, options?: any): Promise<boolean>;
  
  /**
   * Removes an item from storage
   * @param store Store identifier
   * @param key Item key
   * @returns Whether the operation was successful
   */
  removeItem(store: string, key: string): Promise<boolean>;
  
  /**
   * Gets all keys in a store
   * @param store Store identifier
   * @returns Array of keys
   */
  getAllKeys(store: string): Promise<string[]>;
  
  /**
   * Gets storage statistics
   * @param store Store identifier
   * @returns Storage statistics
   */
  getStorageStats(store: string): Promise<{
    totalSize: number;
    itemCount: number;
    quota?: number;
  }>;
}

/**
 * Options for content caching
 */
export interface CachingOptions {
  /**
   * Priority level for caching ('high', 'medium', 'low')
   */
  priority?: 'high' | 'medium' | 'low';
  
  /**
   * Time-to-live in milliseconds
   */
  ttl?: number;
  
  /**
   * Whether to force cache refresh even if content is already cached
   */
  forceRefresh?: boolean;
  
  /**
   * Maximum size in bytes to allocate for this caching operation
   */
  maxSize?: number;
}

/**
 * Result of a caching operation
 */
export interface CacheResult {
  /**
   * Whether the operation was successful overall
   */
  success: boolean;
  
  /**
   * Number of content items successfully cached
   */
  cachedCount: number;
  
  /**
   * Number of content items that failed to cache
   */
  failedCount: number;
  
  /**
   * Total size in bytes of cached content
   */
  totalSize: number;
  
  /**
   * Optional details about failed items
   */
  failures?: {
    contentId: string;
    reason: string;
  }[];
}

/**
 * Cache status for content items
 */
export interface CacheStatus {
  /**
   * Map of content IDs to their cache status
   */
  [contentId: string]: {
    /**
     * Whether the content is cached
     */
    cached: boolean;
    
    /**
     * Size in bytes (only present if cached)
     */
    size?: number;
    
    /**
     * Timestamp when the content was cached (only present if cached)
     */
    timestamp?: number;
    
    /**
     * Expiration timestamp (only present if cached and has TTL)
     */
    expiresAt?: number;
    
    /**
     * Priority level (only present if cached)
     */
    priority?: string;
  };
}