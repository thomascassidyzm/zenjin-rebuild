/**
 * OfflineStorageInterface.ts
 * Generated from APML Interface Definition
 * Module: OfflineSupport
 */

/**
 * 
    Defines the contract for the OfflineStorage component that manages local data storage for offline usage.
  
 */
/**
 * StorageItem
 */
export interface StorageItem {
  key: string; // Unique key for the storage item
  value: any; // Value of the storage item
  timestamp: string; // ISO date string of last modification
  syncStatus: string; // Synchronization status ('synced', 'pending', 'conflict')
  expirationDate?: string; // ISO date string of expiration
}

/**
 * StorageStats
 */
export interface StorageStats {
  totalItems: number; // Total number of items in storage
  totalSize: number; // Total size in bytes
  syncedItems: number; // Number of synced items
  pendingItems: number; // Number of pending items
  conflictItems: number; // Number of items with conflicts
  lastUpdated: string; // ISO date string of last update
}

/**
 * Error codes for OfflineStorageInterface
 */
export enum OfflineStorageErrorCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  ITEM_NOT_FOUND = 'ITEM_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  STORAGE_ERROR = 'STORAGE_ERROR',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  ITEM_NOT_FOUND = 'ITEM_NOT_FOUND',
  REMOVAL_ERROR = 'REMOVAL_ERROR',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  CLEAR_ERROR = 'CLEAR_ERROR',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  ITEM_NOT_FOUND = 'ITEM_NOT_FOUND',
  INVALID_STATUS = 'INVALID_STATUS',
}

/**
 * OfflineStorageInterface
 */
export interface OfflineStorageInterface {
  /**
   * Gets an item from storage by key
   * @param userId - User identifier
   * @param key - Storage item key
   * @returns The storage item
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws ITEM_NOT_FOUND if The specified item was not found
   */
  getItem(userId: string, key: string): StorageItem;

  /**
   * Sets an item in storage
   * @param userId - User identifier
   * @param key - Storage item key
   * @param value - Storage item value
   * @param options - Storage options
   * @returns Whether the item was successfully set
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws STORAGE_ERROR if Error storing the item
   * @throws QUOTA_EXCEEDED if Storage quota exceeded
   */
  setItem(userId: string, key: string, value: any, options?: { syncStatus?: string; expirationDate?: string }): boolean;

  /**
   * Removes an item from storage
   * @param userId - User identifier
   * @param key - Storage item key
   * @returns Whether the item was successfully removed
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws ITEM_NOT_FOUND if The specified item was not found
   * @throws REMOVAL_ERROR if Error removing the item
   */
  removeItem(userId: string, key: string): boolean;

  /**
   * Gets storage statistics for a user
   * @param userId - User identifier
   * @returns Storage statistics
   * @throws USER_NOT_FOUND if The specified user was not found
   */
  getStorageStats(userId: string): StorageStats;

  /**
   * Clears expired items from storage
   * @param userId - User identifier
   * @returns Number of items cleared
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws CLEAR_ERROR if Error clearing expired items
   */
  clearExpiredItems(userId: string): number;

  /**
   * Updates the synchronization status of an item
   * @param userId - User identifier
   * @param key - Storage item key
   * @param syncStatus - New synchronization status
   * @returns Whether the status was successfully updated
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws ITEM_NOT_FOUND if The specified item was not found
   * @throws INVALID_STATUS if The specified status is invalid
   */
  updateSyncStatus(userId: string, key: string, syncStatus: string): boolean;

}

// Export default interface
export default OfflineStorageInterface;
