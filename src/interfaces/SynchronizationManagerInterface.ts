/**
 * SynchronizationManagerInterface.ts
 * Generated from APML Interface Definition
 * Module: OfflineSupport
 */


/**
 * Defines the contract for the SynchronizationManager component that manages data synchronization between local storage and the server.
 */
/**
 * SyncStatus
 */
export interface SyncStatus {
  /** ISO date string of last successful synchronization */
  lastSyncTime: string;
  /** Number of pending changes to be synchronized */
  pendingChanges: number;
  /** Whether synchronization is currently in progress */
  syncInProgress: boolean;
  /** Description of the last synchronization error */
  lastError?: string;
  /** Current connection status ('online', 'offline') */
  connectionStatus: string;
}

/**
 * SyncResult
 */
export interface SyncResult {
  /** Whether the synchronization was successful */
  success: boolean;
  /** Number of changes synchronized */
  syncedChanges: number;
  /** Number of conflicts resolved */
  conflictsResolved: number;
  /** ISO date string of synchronization */
  timestamp: string;
  /** Error message if synchronization failed */
  error?: string;
}

/**
 * SyncOptions
 */
export interface SyncOptions {
  /** Whether to force synchronization even with conflicts */
  forceSync?: boolean;
  /** Direction of synchronization ('upload', 'download', 'both') */
  syncDirection?: string;
  /** Conflict resolution strategy ('server', 'client', 'manual') */
  conflictResolution?: string;
}

/**
 * Error codes for SynchronizationManagerInterface
 */
export enum SynchronizationManagerErrorCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  SYNC_IN_PROGRESS = 'SYNC_IN_PROGRESS',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  INVALID_DATA_TYPE = 'INVALID_DATA_TYPE',
  DATA_NOT_FOUND = 'DATA_NOT_FOUND',
  CONFLICT_NOT_FOUND = 'CONFLICT_NOT_FOUND',
  INVALID_RESOLUTION = 'INVALID_RESOLUTION',
  INVALID_MERGED_DATA = 'INVALID_MERGED_DATA',
}

/**
 * SynchronizationManagerInterface
 */
export interface SynchronizationManagerInterface {
  /**
   * Initiates data synchronization between local storage and the server
   * @param userId - User identifier
   * @param options - Synchronization options
   * @returns Synchronization result
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws SYNC_IN_PROGRESS if Synchronization is already in progress
   * @throws NETWORK_ERROR if Network error occurred during synchronization
   * @throws SERVER_ERROR if Server error occurred during synchronization
   * @throws CONFLICT_ERROR if Unresolved conflicts prevented synchronization
   */
  synchronize(userId: string, options?: SyncOptions): Promise<SyncResult>;

  /**
   * Gets the current synchronization status
   * @param userId - User identifier
   * @returns Current synchronization status
   * @throws USER_NOT_FOUND if The specified user was not found
   */
  getSyncStatus(userId: string): SyncStatus;

  /**
   * Marks specific data for synchronization
   * @param userId - User identifier
   * @param dataType - Type of data to mark ('progress', 'metrics', 'settings')
   * @param dataId - Identifier of the data to mark
   * @returns Whether the data was successfully marked for synchronization
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws INVALID_DATA_TYPE if The specified data type is invalid
   * @throws DATA_NOT_FOUND if The specified data was not found
   */
  markForSync(userId: string, dataType: string, dataId: string): boolean;

  /**
   * Resolves a synchronization conflict
   * @param userId - User identifier
   * @param conflictId - Conflict identifier
   * @param resolution - Resolution choice ('server', 'client', 'merged')
   * @param mergedData - Merged data if resolution is 'merged'
   * @returns Whether the conflict was successfully resolved
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws CONFLICT_NOT_FOUND if The specified conflict was not found
   * @throws INVALID_RESOLUTION if The specified resolution is invalid
   * @throws INVALID_MERGED_DATA if The merged data is invalid
   */
  resolveConflict(userId: string, conflictId: string, resolution: string, mergedData?: Record<string, any>): boolean;

  /**
   * Gets the current connection status
   * @returns Current connection status ('online', 'offline')
   */
  getConnectionStatus(): string;

}

// Export default interface
export default SynchronizationManagerInterface;
