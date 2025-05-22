/**
 * OfflineStorage module exports
 */

import OfflineStorage from './OfflineStorage';
import * as OfflineStorageTypes from './OfflineStorageTypes';
import * as OfflineStorageUtils from './OfflineStorageUtils';

/**
 * Factory function to create a new OfflineStorage instance
 * 
 * @param options Configuration options for the offline storage
 * @returns A new OfflineStorage instance
 */
export function createOfflineStorage(options?: OfflineStorageTypes.StorageOptions): OfflineStorageTypes.OfflineStorageInterface {
  return new OfflineStorage(options);
}

// Export main component
export default OfflineStorage;

// Export types and utilities
export { 
  OfflineStorageTypes,
  OfflineStorageUtils 
};

// Re-export important types for convenience
export type {
  OfflineStorageInterface,
  StorageOptions,
  StorageStats,
  StorageItem,
  StorageEventType,
  StorageEventListener,
  StorageEvent,
  OfflineStorageErrorCode,
  OfflineStorageError
} from './OfflineStorageTypes';