/**
 * Type definitions for the OfflineStorage component
 */

/**
 * Interface for managing local storage of user data and content
 */
export interface OfflineStorageInterface {
  /**
   * Gets an item from storage by key
   * @param userId User identifier
   * @param key Storage item key
   * @returns The storage item or undefined if not found
   * @throws Error if user not found or storage operation fails
   */
  getItem(userId: string, key: string): Promise<StorageItem | undefined>;
  
  /**
   * Sets an item in storage
   * @param userId User identifier
   * @param key Storage item key
   * @param value Storage item value
   * @param options Optional storage options
   * @returns Whether the item was successfully set
   * @throws Error if user not found or storage operation fails
   */
  setItem(userId: string, key: string, value: any, options?: {
    syncStatus?: string;
    expirationDate?: string;
    encrypted?: boolean;
  }): Promise<boolean>;
  
  /**
   * Removes an item from storage
   * @param userId User identifier
   * @param key Storage item key
   * @returns Whether the item was successfully removed
   * @throws Error if user not found, item not found, or removal fails
   */
  removeItem(userId: string, key: string): Promise<boolean>;
  
  /**
   * Gets storage statistics for a user
   * @param userId User identifier
   * @returns Storage statistics
   * @throws Error if user not found
   */
  getStorageStats(userId: string): Promise<StorageStats>;
  
  /**
   * Clears expired items from storage
   * @param userId User identifier
   * @returns Number of items cleared
   * @throws Error if user not found or clear operation fails
   */
  clearExpiredItems(userId: string): Promise<number>;
  
  /**
   * Updates the synchronization status of an item
   * @param userId User identifier
   * @param key Storage item key
   * @param syncStatus New synchronization status
   * @returns Whether the status was successfully updated
   * @throws Error if user not found, item not found, or status is invalid
   */
  updateSyncStatus(userId: string, key: string, syncStatus: string): Promise<boolean>;
  
  /**
   * Gets all items for a specific user with a specific sync status
   * @param userId User identifier
   * @param syncStatus Sync status to filter by
   * @returns Array of storage items
   * @throws Error if user not found or operation fails
   */
  getItemsBySyncStatus(userId: string, syncStatus: string): Promise<StorageItem[]>;
  
  /**
   * Clear all data for a user
   * @param userId User identifier
   * @returns Whether the data was successfully cleared
   * @throws Error if user not found or clear operation fails
   */
  clearUserData(userId: string): Promise<boolean>;
}

/**
 * Represents storage statistics
 */
export interface StorageStats {
  /**
   * Total number of items in storage
   */
  totalItems: number;
  
  /**
   * Total size in bytes
   */
  totalSize: number;
  
  /**
   * Number of synced items
   */
  syncedItems: number;
  
  /**
   * Number of pending items
   */
  pendingItems: number;
  
  /**
   * Number of items with conflicts
   */
  conflictItems: number;
  
  /**
   * ISO date string of last update
   */
  lastUpdated: string;
}

/**
 * Error codes for OfflineStorage operations
 */
export enum OfflineStorageErrorCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  ITEM_NOT_FOUND = 'ITEM_NOT_FOUND',
  STORAGE_ERROR = 'STORAGE_ERROR',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  INVALID_STATUS = 'INVALID_STATUS',
  ENCRYPTION_ERROR = 'ENCRYPTION_ERROR',
  DECRYPTION_ERROR = 'DECRYPTION_ERROR'
}

/**
 * Valid synchronization statuses
 */
export enum SyncStatus {
  SYNCED = 'synced',
  PENDING = 'pending',
  CONFLICT = 'conflict'
}

/**
 * Storage categories based on key prefixes
 */
export enum StorageCategories {
  CONTENT = 'content:',
  PROGRESS = 'progress:',
  METRICS = 'metrics:',
  USER_DATA = 'user:',
  SETTINGS = 'settings:'
}

/**
 * Configuration options for OfflineStorage
 */
export interface OfflineStorageConfig {
  /**
   * Database name (default: 'ZenjinOfflineStorage')
   */
  dbName?: string;
  
  /**
   * Database version (default: 1)
   */
  dbVersion?: number;
  
  /**
   * Maximum storage size in bytes (default: 50MB)
   */
  maxStorageSize?: number;
  
  /**
   * Default expiration time in milliseconds (default: 30 minutes)
   */
  defaultExpirationTime?: number;
  
  /**
   * Whether to enable encryption by default
   */
  encryptionEnabled?: boolean;
  
  /**
   * Whether to enable automatic cleanup of expired items
   */
  autoCleanup?: boolean;
  
  /**
   * Cleanup interval in milliseconds (default: 5 minutes)
   */
  cleanupInterval?: number;
}

/**
 * Content cycling priorities
 */
export enum ContentPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

/**
 * Content item metadata for cycling management
 */
export interface ContentMetadata {
  /**
   * Content type (e.g., 'lesson', 'exercise', 'quiz')
   */
  contentType: string;
  
  /**
   * Priority level for cycling
   */
  priority: ContentPriority;
  
  /**
   * Last access timestamp
   */
  lastAccessed: string;
  
  /**
   * Size in bytes
   */
  size: number;
  
  /**
   * Learning path position
   */
  learningPathPosition?: number;
  
  /**
   * Whether this content is critical for offline operation
   */
  critical?: boolean;
}

/**
 * Represents an item in storage
 */
export interface StorageItem {
  /**
   * Unique key for the storage item
   */
  key: string;
  
  /**
   * Value of the storage item
   */
  value: any;
  
  /**
   * ISO date string of last modification
   */
  timestamp: string;
  
  /**
   * Synchronization status ('synced', 'pending', 'conflict')
   */
  syncStatus: string;
  
  /**
   * ISO date string of expiration (optional)
   */
  expirationDate?: string;
}

/**
 * Storage event types
 */
export enum StorageEventType {
  ITEM_ADDED = 'item_added',
  ITEM_UPDATED = 'item_updated',
  ITEM_REMOVED = 'item_removed',
  STORAGE_FULL = 'storage_full',
  CLEANUP_COMPLETED = 'cleanup_completed'
}

/**
 * Storage event listener function type
 */
export type StorageEventListener = (event: {
  type: StorageEventType;
  userId: string;
  key?: string;
  data?: any;
}) => void;

/**
 * Cached item interface for content caching
 */
export interface CachedItem {
  key: string;
  data: any;
  timestamp: string;
  metadata: ContentMetadata;
}