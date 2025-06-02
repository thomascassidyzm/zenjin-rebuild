/**
 * OfflineStorageInterface.ts
 * Generated from APML Interface Definition
 * Module: OfflineSupport
 */

import { undefined } from './undefined';

/**
 * Defines the contract for the OfflineStorage component that manages local data storage for offline usage.
 */
/**
 * StorageItem
 */
export interface StorageItem {
  /** Unique key for the storage item */
  key: string;
  /** Value of the storage item */
  value: any;
  /** ISO date string of last modification */
  timestamp: string;
  /** Synchronization status ('synced', 'pending', 'conflict') */
  syncStatus: string;
  /** ISO date string of expiration */
  expirationDate?: string;
}

/**
 * StorageStats
 */
export interface StorageStats {
  /** Total number of items in storage */
  totalItems: number;
  /** Total size in bytes */
  totalSize: number;
  /** Number of synced items */
  syncedItems: number;
  /** Number of pending items */
  pendingItems: number;
  /** Number of items with conflicts */
  conflictItems: number;
  /** ISO date string of last update */
  lastUpdated: string;
}

/**
 * Error codes for OfflineStorageInterface
 */
export enum OfflineStorageErrorCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  ITEM_NOT_FOUND = 'ITEM_NOT_FOUND',
  STORAGE_ERROR = 'STORAGE_ERROR',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  REMOVAL_ERROR = 'REMOVAL_ERROR',
  CLEAR_ERROR = 'CLEAR_ERROR',
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
  setItem(userId: string, key: string, value: any, options?: Record<string, any>): boolean;

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
