/**
 * SynchronizationTypes.ts
 * 
 * Defines types and interfaces for the SynchronizationManager component,
 * which handles data synchronization between client and server.
 */

/**
 * Synchronization error codes
 */
export enum SyncErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  INVALID_DATA = 'INVALID_DATA',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Synchronization error object
 */
export interface SyncError {
  code: SyncErrorCode;
  message: string;
  details?: any;
  timestamp: Date;
}

/**
 * Synchronization status
 */
export enum SyncStatus {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  SYNCING = 'SYNCING',
  OFFLINE = 'OFFLINE',
  ERROR = 'ERROR',
  COMPLETED = 'COMPLETED'
}

/**
 * Synchronization mode
 */
export enum SyncMode {
  MANUAL = 'MANUAL',
  AUTO = 'AUTO',
  PERIODIC = 'PERIODIC',
  OPPORTUNISTIC = 'OPPORTUNISTIC'
}

/**
 * Synchronization direction
 */
export enum SyncDirection {
  UPLOAD = 'UPLOAD',
  DOWNLOAD = 'DOWNLOAD',
  BIDIRECTIONAL = 'BIDIRECTIONAL'
}

/**
 * Synchronization priority
 */
export enum SyncPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

/**
 * Conflict resolution strategy
 */
export enum ConflictResolution {
  CLIENT_WINS = 'CLIENT_WINS',
  SERVER_WINS = 'SERVER_WINS',
  NEWEST_WINS = 'NEWEST_WINS',
  MANUAL = 'MANUAL',
  MERGE = 'MERGE'
}

/**
 * Synchronization event types
 */
export type SyncEventType = 
  | 'start'
  | 'progress'
  | 'complete'
  | 'error'
  | 'online'
  | 'offline'
  | 'conflict'
  | 'retry'
  | 'abort'
  | 'pause'
  | 'resume';

/**
 * Synchronization event interface
 */
export interface SyncEvent {
  type: SyncEventType;
  data: any;
}

/**
 * Synchronization event listener
 */
export type SyncEventListener = (event: SyncEvent) => void;

/**
 * Data item to be synchronized
 */
export interface SyncItem<T = any> {
  id: string;
  collectionName: string;
  data: T;
  lastModified: number;
  createdAt: number;
  isDeleted?: boolean;
  version?: number;
  conflictStatus?: 'none' | 'resolved' | 'unresolved';
  syncStatus?: 'pending' | 'synced' | 'failed';
  localOnly?: boolean;
  priority?: SyncPriority;
  metadata?: Record<string, any>;
}

/**
 * Synchronization queue item
 */
export interface SyncQueueItem {
  id: string;
  collectionName: string;
  operation: 'create' | 'update' | 'delete';
  data?: any;
  priority: SyncPriority;
  timestamp: number;
  retryCount: number;
  lastAttempt?: number;
  errorInfo?: Partial<SyncError>;
}

/**
 * Synchronization batch
 */
export interface SyncBatch {
  id: string;
  items: SyncQueueItem[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  startTime?: number;
  endTime?: number;
  error?: SyncError;
  stats?: {
    totalItems: number;
    successItems: number;
    failedItems: number;
  };
}

/**
 * Conflict information
 */
export interface SyncConflict<T = any> {
  id: string;
  collectionName: string;
  clientData: T;
  serverData: T;
  clientTimestamp: number;
  serverTimestamp: number;
  resolved: boolean;
  resolution?: ConflictResolution;
  resolvedData?: T;
  resolvedAt?: number;
}

/**
 * Synchronization statistics
 */
export interface SyncStats {
  lastSyncTime?: number;
  totalItemsSynced: number;
  pendingItems: number;
  failedItems: number;
  conflicts: number;
  lastError?: SyncError;
  syncDuration?: number;
  uploadedBytes?: number;
  downloadedBytes?: number;
  collections: Record<string, {
    lastSyncTime?: number;
    itemCount: number;
    pendingItems: number;
    failedItems: number;
    conflicts: number;
  }>;
}

/**
 * Synchronization options
 */
export interface SyncOptions {
  mode?: SyncMode;
  direction?: SyncDirection;
  conflictResolution?: ConflictResolution;
  batchSize?: number;
  retryLimit?: number;
  retryDelay?: number;
  syncInterval?: number;
  maxConcurrentRequests?: number;
  timeout?: number;
  compressionEnabled?: boolean;
  encryptionEnabled?: boolean;
  prioritizeCollections?: string[];
  throttleRequests?: boolean;
  allowOfflineChanges?: boolean;
  syncWhenOnline?: boolean;
  autoResolveConflicts?: boolean;
  collections?: string[];
}

/**
 * Network status information
 */
export interface NetworkStatus {
  online: boolean;
  type?: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  downlink?: number; // Mbps
  rtt?: number; // ms
  effectiveType?: '4g' | '3g' | '2g' | 'slow-2g';
  saveData?: boolean;
}

/**
 * REST API configuration
 */
export interface RestApiConfig {
  baseUrl: string;
  endpoints: {
    [key: string]: string;
  };
  headers?: Record<string, string>;
  authTokenProvider?: () => Promise<string>;
  refreshTokenProvider?: () => Promise<string>;
  timeout?: number;
  retryConfig?: {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
  };
}

/**
 * WebSocket configuration
 */
export interface WebSocketConfig {
  url: string;
  protocols?: string | string[];
  reconnectAttempts?: number;
  reconnectInterval?: number;
  connectionTimeout?: number;
  pingInterval?: number;
  authTokenProvider?: () => Promise<string>;
}

/**
 * Main Synchronization Manager Interface
 */
export interface SynchronizationManagerInterface {
  // Initialization & configuration
  initialize(): Promise<void>;
  configure(options: SyncOptions): void;
  
  // Core synchronization operations
  sync(options?: Partial<SyncOptions>): Promise<SyncStats>;
  syncCollection(collectionName: string, options?: Partial<SyncOptions>): Promise<SyncStats>;
  syncItem(collectionName: string, itemId: string, options?: Partial<SyncOptions>): Promise<SyncItem>;
  
  // Queue management
  addToSyncQueue<T>(item: SyncItem<T>, operation: 'create' | 'update' | 'delete'): Promise<void>;
  removeFromSyncQueue(collectionName: string, itemId: string): Promise<boolean>;
  clearSyncQueue(collectionName?: string): Promise<void>;
  
  // Conflict management
  getConflicts(collectionName?: string): Promise<SyncConflict[]>;
  resolveConflict(conflict: SyncConflict, resolution: ConflictResolution, customData?: any): Promise<SyncItem>;
  
  // Status & statistics
  getStatus(): SyncStatus;
  getNetworkStatus(): NetworkStatus;
  getStats(): Promise<SyncStats>;
  
  // Control operations
  pause(): void;
  resume(): void;
  abort(): Promise<void>;
  
  // Event handling
  addEventListener(eventType: SyncEventType, listener: SyncEventListener): void;
  removeEventListener(eventType: SyncEventType, listener: SyncEventListener): void;
  
  // Utility methods
  isOnline(): boolean;
  hasUnsyncedChanges(): Promise<boolean>;
  purgeOldData(maxAge?: number): Promise<number>;
}

/**
 * HTTP Client Interface used by SynchronizationManager
 */
export interface HttpClientInterface {
  get<T>(url: string, config?: any): Promise<T>;
  post<T>(url: string, data: any, config?: any): Promise<T>;
  put<T>(url: string, data: any, config?: any): Promise<T>;
  patch<T>(url: string, data: any, config?: any): Promise<T>;
  delete<T>(url: string, config?: any): Promise<T>;
  head<T>(url: string, config?: any): Promise<T>;
  request<T>(config: any): Promise<T>;
  setHeader(name: string, value: string): void;
  setAuthToken(token: string): void;
}

/**
 * WebSocket Client Interface used by SynchronizationManager
 */
export interface WebSocketClientInterface {
  connect(): Promise<void>;
  disconnect(): void;
  send(data: any): void;
  subscribe(channel: string, callback: (data: any) => void): void;
  unsubscribe(channel: string): void;
  isConnected(): boolean;
  onOpen(callback: () => void): void;
  onClose(callback: () => void): void;
  onError(callback: (error: any) => void): void;
  onMessage(callback: (data: any) => void): void;
}

/**
 * Offline Queue Storage Interface
 */
export interface SyncQueueStorageInterface {
  getQueue(): Promise<SyncQueueItem[]>;
  addItem(item: SyncQueueItem): Promise<void>;
  removeItem(id: string): Promise<boolean>;
  updateItem(id: string, updates: Partial<SyncQueueItem>): Promise<boolean>;
  clearQueue(): Promise<void>;
  getQueueStats(): Promise<{
    total: number;
    byPriority: Record<SyncPriority, number>;
    byOperation: Record<string, number>;
    byCollection: Record<string, number>;
  }>;
}

/**
 * Synchronization Manager Factory options
 */
export interface SynchronizationManagerFactoryOptions {
  apiConfig: RestApiConfig;
  wsConfig?: WebSocketConfig;
  syncOptions?: SyncOptions;
  httpClient?: HttpClientInterface;
  wsClient?: WebSocketClientInterface;
  queueStorage?: SyncQueueStorageInterface;
  debug?: boolean;
}