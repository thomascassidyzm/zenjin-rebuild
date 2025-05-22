/**
 * SynchronizationManager module exports
 */

import SynchronizationManager from './SynchronizationManager';
import * as SynchronizationTypes from './SynchronizationTypes';
import * as SynchronizationUtils from './SynchronizationUtils';

/**
 * Factory function to create a new SynchronizationManager instance
 * 
 * @param options Configuration options for the synchronization manager
 * @returns A new SynchronizationManager instance
 */
export function createSynchronizationManager(
  options: SynchronizationTypes.SynchronizationManagerFactoryOptions
): SynchronizationTypes.SynchronizationManagerInterface {
  return new SynchronizationManager(options);
}

// Export main component
export default SynchronizationManager;

// Export types and utilities
export { 
  SynchronizationTypes,
  SynchronizationUtils 
};

// Re-export important types for convenience
export type {
  SynchronizationManagerInterface,
  SyncOptions,
  SyncItem,
  SyncStatus,
  SyncMode,
  SyncDirection,
  ConflictResolution,
  SyncPriority,
  SyncEventType,
  SyncEventListener,
  SyncEvent,
  SyncError,
  SyncErrorCode,
  NetworkStatus,
  SyncConflict,
  SyncStats,
  RestApiConfig,
  WebSocketConfig,
  SynchronizationManagerFactoryOptions
} from './SynchronizationTypes';