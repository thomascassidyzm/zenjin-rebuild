/**
 * SynchronizationManager.ts
 * 
 * Main implementation of the SynchronizationManager component.
 * Handles data synchronization between client and server with offline support.
 */

import { 
  SynchronizationManagerInterface,
  SyncOptions,
  SyncItem,
  SyncQueueItem,
  SyncStatus,
  SyncStats,
  SyncError,
  SyncErrorCode,
  SyncEventType,
  SyncEventListener,
  SyncEvent,
  ConflictResolution,
  SyncPriority,
  SyncDirection,
  SyncMode,
  NetworkStatus,
  SyncConflict,
  HttpClientInterface,
  WebSocketClientInterface,
  SyncQueueStorageInterface,
  RestApiConfig,
  WebSocketConfig
} from './SynchronizationTypes';

import {
  generateSyncId,
  compressData,
  decompressData,
  createSyncQueueItem,
  prioritizeSyncQueue,
  calculateBackoff,
  isRetryableError,
  getNetworkStatus,
  shouldSync,
  createSyncBatches,
  resolveConflict,
  detectChanges,
  mergeMetadata,
  createSyncError,
  limitConcurrency
} from './SynchronizationUtils';

/**
 * Default HTTP client implementation
 */
class DefaultHttpClient implements HttpClientInterface {
  private baseUrl: string;
  private headers: Record<string, string> = {};
  private authToken: string | null = null;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }
  
  async get<T>(url: string, config?: any): Promise<T> {
    return this.request<T>({
      method: 'GET',
      url,
      ...config
    });
  }
  
  async post<T>(url: string, data: any, config?: any): Promise<T> {
    return this.request<T>({
      method: 'POST',
      url,
      data,
      ...config
    });
  }
  
  async put<T>(url: string, data: any, config?: any): Promise<T> {
    return this.request<T>({
      method: 'PUT',
      url,
      data,
      ...config
    });
  }
  
  async patch<T>(url: string, data: any, config?: any): Promise<T> {
    return this.request<T>({
      method: 'PATCH',
      url,
      data,
      ...config
    });
  }
  
  async delete<T>(url: string, config?: any): Promise<T> {
    return this.request<T>({
      method: 'DELETE',
      url,
      ...config
    });
  }
  
  async head<T>(url: string, config?: any): Promise<T> {
    return this.request<T>({
      method: 'HEAD',
      url,
      ...config
    });
  }
  
  async request<T>(config: any): Promise<T> {
    const { method, url, data, headers = {}, timeout } = config;
    
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
    
    const requestHeaders = {
      ...this.headers,
      ...headers
    };
    
    if (this.authToken) {
      requestHeaders['Authorization'] = `Bearer ${this.authToken}`;
    }
    
    const controller = new AbortController();
    const timeoutId = timeout ? setTimeout(() => controller.abort(), timeout) : null;
    
    try {
      const response = await fetch(fullUrl, {
        method,
        headers: requestHeaders,
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal
      });
      
      if (timeoutId) clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw createSyncError(
          SyncErrorCode.TIMEOUT_ERROR,
          'Request timed out',
          { url: fullUrl }
        );
      }
      
      throw createSyncError(
        SyncErrorCode.NETWORK_ERROR,
        `Network request failed: ${error.message}`,
        { url: fullUrl, originalError: error }
      );
    }
  }
  
  setHeader(name: string, value: string): void {
    this.headers[name] = value;
  }
  
  setAuthToken(token: string): void {
    this.authToken = token;
  }
}

/**
 * Default WebSocket client implementation
 */
class DefaultWebSocketClient implements WebSocketClientInterface {
  private url: string;
  private protocols?: string | string[];
  private ws: WebSocket | null = null;
  private reconnectAttempts: number;
  private reconnectInterval: number;
  private connectionTimeout: number;
  private pingInterval: number;
  private authTokenProvider?: () => Promise<string>;
  private subscriptions: Map<string, ((data: any) => void)[]> = new Map();
  private pingTimer: number | null = null;
  private reconnectTimer: number | null = null;
  private currentReconnectAttempt: number = 0;
  private openCallbacks: (() => void)[] = [];
  private closeCallbacks: (() => void)[] = [];
  private errorCallbacks: ((error: any) => void)[] = [];
  private messageCallbacks: ((data: any) => void)[] = [];
  
  constructor(config: WebSocketConfig) {
    this.url = config.url;
    this.protocols = config.protocols;
    this.reconnectAttempts = config.reconnectAttempts ?? 5;
    this.reconnectInterval = config.reconnectInterval ?? 3000;
    this.connectionTimeout = config.connectionTimeout ?? 10000;
    this.pingInterval = config.pingInterval ?? 30000;
    this.authTokenProvider = config.authTokenProvider;
  }
  
  async connect(): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }
    
    return new Promise(async (resolve, reject) => {
      try {
        let url = this.url;
        
        // Add auth token to URL if provider is available
        if (this.authTokenProvider) {
          const token = await this.authTokenProvider();
          const separator = url.includes('?') ? '&' : '?';
          url = `${url}${separator}token=${token}`;
        }
        
        this.ws = new WebSocket(url, this.protocols);
        
        // Set up connection timeout
        const timeoutId = setTimeout(() => {
          if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
            this.ws.close();
            reject(new Error('WebSocket connection timeout'));
          }
        }, this.connectionTimeout);
        
        this.ws.onopen = () => {
          clearTimeout(timeoutId);
          this.currentReconnectAttempt = 0;
          this.startPingTimer();
          this.openCallbacks.forEach(callback => callback());
          resolve();
        };
        
        this.ws.onclose = () => {
          clearTimeout(timeoutId);
          this.stopPingTimer();
          this.closeCallbacks.forEach(callback => callback());
          this.attemptReconnect();
        };
        
        this.ws.onerror = (event) => {
          clearTimeout(timeoutId);
          this.errorCallbacks.forEach(callback => callback(event));
          reject(new Error('WebSocket connection error'));
        };
        
        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // Handle ping message
            if (data.type === 'ping') {
              this.send({ type: 'pong' });
              return;
            }
            
            // Handle subscription messages
            if (data.channel && this.subscriptions.has(data.channel)) {
              const callbacks = this.subscriptions.get(data.channel)!;
              callbacks.forEach(callback => callback(data.payload));
            }
            
            // General message handlers
            this.messageCallbacks.forEach(callback => callback(data));
          } catch (error) {
            console.error('Error processing WebSocket message:', error);
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }
  
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.stopPingTimer();
    this.stopReconnectTimer();
  }
  
  send(data: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }
    
    this.ws.send(JSON.stringify(data));
  }
  
  subscribe(channel: string, callback: (data: any) => void): void {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, []);
      
      // Send subscription request if connected
      if (this.isConnected()) {
        this.send({
          type: 'subscribe',
          channel
        });
      }
    }
    
    const callbacks = this.subscriptions.get(channel)!;
    if (!callbacks.includes(callback)) {
      callbacks.push(callback);
    }
  }
  
  unsubscribe(channel: string): void {
    if (this.subscriptions.has(channel)) {
      this.subscriptions.delete(channel);
      
      // Send unsubscription request if connected
      if (this.isConnected()) {
        this.send({
          type: 'unsubscribe',
          channel
        });
      }
    }
  }
  
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
  
  onOpen(callback: () => void): void {
    this.openCallbacks.push(callback);
  }
  
  onClose(callback: () => void): void {
    this.closeCallbacks.push(callback);
  }
  
  onError(callback: (error: any) => void): void {
    this.errorCallbacks.push(callback);
  }
  
  onMessage(callback: (data: any) => void): void {
    this.messageCallbacks.push(callback);
  }
  
  private startPingTimer(): void {
    this.stopPingTimer();
    
    this.pingTimer = window.setInterval(() => {
      if (this.isConnected()) {
        this.send({ type: 'ping' });
      }
    }, this.pingInterval);
  }
  
  private stopPingTimer(): void {
    if (this.pingTimer !== null) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }
  
  private attemptReconnect(): void {
    this.stopReconnectTimer();
    
    if (this.currentReconnectAttempt >= this.reconnectAttempts) {
      return;
    }
    
    this.currentReconnectAttempt++;
    
    this.reconnectTimer = window.setTimeout(() => {
      this.connect().catch(error => {
        console.error('WebSocket reconnect failed:', error);
        this.attemptReconnect();
      });
    }, this.reconnectInterval * Math.pow(1.5, this.currentReconnectAttempt - 1));
  }
  
  private stopReconnectTimer(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

/**
 * Default sync queue storage implementation using IndexedDB
 */
class DefaultSyncQueueStorage implements SyncQueueStorageInterface {
  private dbName: string;
  private dbVersion: number;
  private db: IDBDatabase | null = null;
  private isInitialized: boolean = false;
  
  constructor(dbName: string = 'zenjin_sync_queue', dbVersion: number = 1) {
    this.dbName = dbName;
    this.dbVersion = dbVersion;
  }
  
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = (event) => {
        reject(new Error(`Failed to open IndexedDB: ${(event.target as IDBRequest).error}`));
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('queue')) {
          const store = db.createObjectStore('queue', { keyPath: 'id' });
          store.createIndex('collectionName', 'collectionName', { unique: false });
          store.createIndex('operation', 'operation', { unique: false });
          store.createIndex('priority', 'priority', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
      
      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.isInitialized = true;
        resolve();
      };
    });
  }
  
  async getQueue(): Promise<SyncQueueItem[]> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      const transaction = this.db.transaction(['queue'], 'readonly');
      const store = transaction.objectStore('queue');
      
      const request = store.getAll();
      
      request.onerror = (event) => {
        reject(new Error(`Failed to get queue: ${(event.target as IDBRequest).error}`));
      };
      
      request.onsuccess = () => {
        resolve(request.result as SyncQueueItem[]);
      };
    });
  }
  
  async addItem(item: SyncQueueItem): Promise<void> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      const transaction = this.db.transaction(['queue'], 'readwrite');
      const store = transaction.objectStore('queue');
      
      const request = store.put(item);
      
      request.onerror = (event) => {
        reject(new Error(`Failed to add item to queue: ${(event.target as IDBRequest).error}`));
      };
      
      transaction.oncomplete = () => {
        resolve();
      };
    });
  }
  
  async removeItem(id: string): Promise<boolean> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      const transaction = this.db.transaction(['queue'], 'readwrite');
      const store = transaction.objectStore('queue');
      
      const request = store.delete(id);
      
      request.onerror = (event) => {
        reject(new Error(`Failed to remove item from queue: ${(event.target as IDBRequest).error}`));
      };
      
      transaction.oncomplete = () => {
        resolve(true);
      };
    });
  }
  
  async updateItem(id: string, updates: Partial<SyncQueueItem>): Promise<boolean> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      const transaction = this.db.transaction(['queue'], 'readwrite');
      const store = transaction.objectStore('queue');
      
      const getRequest = store.get(id);
      
      getRequest.onerror = (event) => {
        reject(new Error(`Failed to get item from queue: ${(event.target as IDBRequest).error}`));
      };
      
      getRequest.onsuccess = () => {
        const item = getRequest.result as SyncQueueItem;
        
        if (!item) {
          resolve(false);
          return;
        }
        
        // Update the item
        const updatedItem = {
          ...item,
          ...updates
        };
        
        const putRequest = store.put(updatedItem);
        
        putRequest.onerror = (event) => {
          reject(new Error(`Failed to update item in queue: ${(event.target as IDBRequest).error}`));
        };
        
        putRequest.onsuccess = () => {
          resolve(true);
        };
      };
    });
  }
  
  async clearQueue(): Promise<void> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      const transaction = this.db.transaction(['queue'], 'readwrite');
      const store = transaction.objectStore('queue');
      
      const request = store.clear();
      
      request.onerror = (event) => {
        reject(new Error(`Failed to clear queue: ${(event.target as IDBRequest).error}`));
      };
      
      transaction.oncomplete = () => {
        resolve();
      };
    });
  }
  
  async getQueueStats(): Promise<{
    total: number;
    byPriority: Record<SyncPriority, number>;
    byOperation: Record<string, number>;
    byCollection: Record<string, number>;
  }> {
    const queue = await this.getQueue();
    
    const stats = {
      total: queue.length,
      byPriority: {
        [SyncPriority.LOW]: 0,
        [SyncPriority.MEDIUM]: 0,
        [SyncPriority.HIGH]: 0,
        [SyncPriority.CRITICAL]: 0
      },
      byOperation: {
        create: 0,
        update: 0,
        delete: 0
      },
      byCollection: {} as Record<string, number>
    };
    
    for (const item of queue) {
      // Count by priority
      stats.byPriority[item.priority]++;
      
      // Count by operation
      stats.byOperation[item.operation]++;
      
      // Count by collection
      if (!stats.byCollection[item.collectionName]) {
        stats.byCollection[item.collectionName] = 0;
      }
      stats.byCollection[item.collectionName]++;
    }
    
    return stats;
  }
  
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }
}

/**
 * Main SynchronizationManager implementation
 */
class SynchronizationManager implements SynchronizationManagerInterface {
  private apiConfig: RestApiConfig;
  private wsConfig?: WebSocketConfig;
  private options: SyncOptions;
  private httpClient: HttpClientInterface;
  private wsClient?: WebSocketClientInterface;
  private queueStorage: SyncQueueStorageInterface;
  private status: SyncStatus = SyncStatus.IDLE;
  private eventListeners: Map<SyncEventType, SyncEventListener[]> = new Map();
  private syncInterval: number | null = null;
  private isInitialized: boolean = false;
  private currentSyncOperation: AbortController | null = null;
  private lastSyncTime: number | null = null;
  private conflicts: Map<string, SyncConflict> = new Map();
  private debug: boolean;
  
  constructor(options: {
    apiConfig: RestApiConfig;
    wsConfig?: WebSocketConfig;
    syncOptions?: SyncOptions;
    httpClient?: HttpClientInterface;
    wsClient?: WebSocketClientInterface;
    queueStorage?: SyncQueueStorageInterface;
    debug?: boolean;
  }) {
    this.apiConfig = options.apiConfig;
    this.wsConfig = options.wsConfig;
    this.options = {
      mode: SyncMode.AUTO,
      direction: SyncDirection.BIDIRECTIONAL,
      conflictResolution: ConflictResolution.SERVER_WINS,
      batchSize: 10,
      retryLimit: 5,
      retryDelay: 1000,
      syncInterval: 60000, // 1 minute
      maxConcurrentRequests: 3,
      timeout: 30000, // 30 seconds
      compressionEnabled: true,
      encryptionEnabled: false,
      throttleRequests: true,
      allowOfflineChanges: true,
      syncWhenOnline: true,
      autoResolveConflicts: true,
      ...options.syncOptions
    };
    
    this.httpClient = options.httpClient || new DefaultHttpClient(this.apiConfig.baseUrl);
    this.wsClient = options.wsClient;
    this.queueStorage = options.queueStorage || new DefaultSyncQueueStorage();
    this.debug = options.debug || false;
    
    // Set up event listeners for network status changes
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Set up WebSocket if configured
    if (this.wsConfig && !this.wsClient) {
      this.wsClient = new DefaultWebSocketClient(this.wsConfig);
    }
  }
  
  /**
   * Initialize the synchronization manager
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Initialize queue storage
      await this.queueStorage.initialize();
      
      // Initialize WebSocket connection if available
      if (this.wsClient) {
        try {
          await this.wsClient.connect();
          
          this.wsClient.onOpen(() => {
            this.logDebug('WebSocket connected');
            this.emitEvent('online', { message: 'WebSocket connected' });
          });
          
          this.wsClient.onClose(() => {
            this.logDebug('WebSocket disconnected');
            this.emitEvent('offline', { message: 'WebSocket disconnected' });
          });
          
          this.wsClient.onError((error) => {
            this.logDebug('WebSocket error:', error);
            this.emitEvent('error', {
              code: SyncErrorCode.NETWORK_ERROR,
              message: 'WebSocket connection error',
              details: error
            });
          });
          
          this.wsClient.onMessage((data) => {
            if (data.type === 'sync_update') {
              this.logDebug('Received sync update from server:', data);
              this.handleServerUpdate(data.payload);
            }
          });
          
          // Subscribe to sync updates
          this.wsClient.subscribe('sync_updates', (data) => {
            this.handleServerUpdate(data);
          });
        } catch (error) {
          this.logDebug('Failed to initialize WebSocket:', error);
          // Continue initialization even if WebSocket fails
        }
      }
      
      // Configure HTTP client
      if (this.apiConfig.authTokenProvider) {
        const token = await this.apiConfig.authTokenProvider();
        this.httpClient.setAuthToken(token);
      }
      
      if (this.apiConfig.headers) {
        for (const [name, value] of Object.entries(this.apiConfig.headers)) {
          this.httpClient.setHeader(name, value);
        }
      }
      
      // Set up automatic synchronization if configured
      if (this.options.mode === SyncMode.AUTO || this.options.mode === SyncMode.PERIODIC) {
        this.setupAutoSync();
      }
      
      this.isInitialized = true;
      this.emitEvent('start', { message: 'SynchronizationManager initialized' });
      
      // Perform initial sync if online and auto sync enabled
      if (
        this.isOnline() && 
        (this.options.mode === SyncMode.AUTO || this.options.mode === SyncMode.PERIODIC)
      ) {
        await this.sync();
      }
    } catch (error) {
      const syncError = createSyncError(
        SyncErrorCode.INITIALIZATION_FAILED,
        `Failed to initialize SynchronizationManager: ${error.message}`,
        error
      );
      
      this.emitEvent('error', syncError);
      throw syncError;
    }
  }
  
  /**
   * Configure synchronization options
   */
  configure(options: SyncOptions): void {
    this.options = {
      ...this.options,
      ...options
    };
    
    // Update auto sync if interval changed
    if (options.syncInterval !== undefined && this.options.mode !== SyncMode.MANUAL) {
      this.setupAutoSync();
    }
  }
  
  /**
   * Perform a full synchronization
   */
  async sync(options?: Partial<SyncOptions>): Promise<SyncStats> {
    await this.ensureInitialized();
    
    // Check if sync is already in progress
    if (this.status === SyncStatus.SYNCING) {
      throw createSyncError(
        SyncErrorCode.SYNC_IN_PROGRESS,
        'Synchronization is already in progress'
      );
    }
    
    const syncOptions = {
      ...this.options,
      ...options
    };
    
    // Check if we should sync based on network conditions
    const networkStatus = this.getNetworkStatus();
    if (!shouldSync({
      isOnline: networkStatus.online,
      networkType: networkStatus.type,
      syncWhenOnline: syncOptions.syncWhenOnline
    })) {
      return this.getStatsWithError(
        createSyncError(
          SyncErrorCode.NETWORK_UNAVAILABLE,
          'Cannot sync: network is unavailable or restricted'
        )
      );
    }
    
    // Set up abort controller for cancellation
    this.currentSyncOperation = new AbortController();
    const signal = this.currentSyncOperation.signal;
    
    try {
      // Update status and emit event
      this.updateStatus(SyncStatus.SYNCING);
      this.emitEvent('start', { message: 'Starting synchronization' });
      
      const startTime = Date.now();
      
      // Fetch changes from server if downloading is enabled
      let downloadedChanges = 0;
      let downloadedBytes = 0;
      
      if (
        syncOptions.direction === SyncDirection.DOWNLOAD || 
        syncOptions.direction === SyncDirection.BIDIRECTIONAL
      ) {
        try {
          const result = await this.downloadChanges(syncOptions, signal);
          downloadedChanges = result.count;
          downloadedBytes = result.bytes;
        } catch (error) {
          if (error.code === SyncErrorCode.AUTHENTICATION_ERROR) {
            // Authentication errors are critical, stop sync
            throw error;
          }
          
          // For other download errors, continue with upload
          this.emitEvent('error', error);
        }
      }
      
      // Upload local changes if uploading is enabled
      let uploadedChanges = 0;
      let uploadedBytes = 0;
      
      if (
        syncOptions.direction === SyncDirection.UPLOAD || 
        syncOptions.direction === SyncDirection.BIDIRECTIONAL
      ) {
        try {
          const result = await this.uploadChanges(syncOptions, signal);
          uploadedChanges = result.count;
          uploadedBytes = result.bytes;
        } catch (error) {
          // Continue even if upload fails
          this.emitEvent('error', error);
        }
      }
      
      const syncDuration = Date.now() - startTime;
      this.lastSyncTime = Date.now();
      
      // Update status and emit completion event
      this.updateStatus(SyncStatus.COMPLETED);
      
      const stats = await this.getStats();
      
      this.emitEvent('complete', {
        stats,
        uploadedChanges,
        downloadedChanges,
        syncDuration
      });
      
      return {
        ...stats,
        syncDuration,
        uploadedBytes,
        downloadedBytes
      };
    } catch (error) {
      // Handle sync errors
      const syncError = error.code
        ? error
        : createSyncError(
            SyncErrorCode.UNKNOWN_ERROR,
            `Synchronization failed: ${error.message}`,
            error
          );
      
      this.updateStatus(SyncStatus.ERROR);
      this.emitEvent('error', syncError);
      
      return this.getStatsWithError(syncError);
    } finally {
      this.currentSyncOperation = null;
    }
  }
  
  /**
   * Synchronize a specific collection
   */
  async syncCollection(
    collectionName: string, 
    options?: Partial<SyncOptions>
  ): Promise<SyncStats> {
    return this.sync({
      ...options,
      collections: [collectionName]
    });
  }
  
  /**
   * Synchronize a specific item
   */
  async syncItem(
    collectionName: string, 
    itemId: string, 
    options?: Partial<SyncOptions>
  ): Promise<SyncItem> {
    await this.ensureInitialized();
    
    const syncOptions = {
      ...this.options,
      ...options
    };
    
    // Check if we should sync based on network conditions
    if (!this.isOnline() && syncOptions.syncWhenOnline) {
      throw createSyncError(
        SyncErrorCode.NETWORK_UNAVAILABLE,
        'Cannot sync item: network is unavailable'
      );
    }
    
    try {
      // Fetch the item from the server
      const endpoint = this.apiConfig.endpoints[collectionName] || collectionName;
      const result = await this.httpClient.get<SyncItem>(
        `${endpoint}/${itemId}`
      );
      
      return result;
    } catch (error) {
      const syncError = error.code
        ? error
        : createSyncError(
            SyncErrorCode.UNKNOWN_ERROR,
            `Failed to sync item: ${error.message}`,
            { collectionName, itemId, originalError: error }
          );
      
      this.emitEvent('error', syncError);
      throw syncError;
    }
  }
  
  /**
   * Add an item to the sync queue
   */
  async addToSyncQueue<T>(
    item: SyncItem<T>, 
    operation: 'create' | 'update' | 'delete'
  ): Promise<void> {
    await this.ensureInitialized();
    
    // Create a queue item
    const queueItem = createSyncQueueItem(
      item,
      operation,
      item.priority || SyncPriority.MEDIUM
    );
    
    // Add to queue
    await this.queueStorage.addItem(queueItem);
    
    // Trigger sync if auto sync is enabled and online
    if (
      this.isOnline() && 
      (this.options.mode === SyncMode.AUTO || this.options.mode === SyncMode.OPPORTUNISTIC)
    ) {
      this.sync().catch(error => {
        this.logDebug('Auto sync failed:', error);
      });
    }
  }
  
  /**
   * Remove an item from the sync queue
   */
  async removeFromSyncQueue(collectionName: string, itemId: string): Promise<boolean> {
    await this.ensureInitialized();
    
    const queue = await this.queueStorage.getQueue();
    
    // Find matching queue items
    const matchingItems = queue.filter(item => 
      item.collectionName === collectionName && 
      item.data?.id === itemId
    );
    
    if (matchingItems.length === 0) {
      return false;
    }
    
    // Remove all matching items
    for (const item of matchingItems) {
      await this.queueStorage.removeItem(item.id);
    }
    
    return true;
  }
  
  /**
   * Clear the sync queue
   */
  async clearSyncQueue(collectionName?: string): Promise<void> {
    await this.ensureInitialized();
    
    if (!collectionName) {
      // Clear entire queue
      await this.queueStorage.clearQueue();
      return;
    }
    
    // Clear only items for the specified collection
    const queue = await this.queueStorage.getQueue();
    
    for (const item of queue) {
      if (item.collectionName === collectionName) {
        await this.queueStorage.removeItem(item.id);
      }
    }
  }
  
  /**
   * Get all conflicts
   */
  async getConflicts(collectionName?: string): Promise<SyncConflict[]> {
    const conflicts = Array.from(this.conflicts.values());
    
    if (collectionName) {
      return conflicts.filter(conflict => conflict.collectionName === collectionName);
    }
    
    return conflicts;
  }
  
  /**
   * Resolve a conflict
   */
  async resolveConflict(
    conflict: SyncConflict, 
    resolution: ConflictResolution, 
    customData?: any
  ): Promise<SyncItem> {
    // Check if conflict exists
    if (!this.conflicts.has(`${conflict.collectionName}_${conflict.id}`)) {
      throw createSyncError(
        SyncErrorCode.CONFLICT_NOT_FOUND,
        'Conflict not found',
        { conflictId: `${conflict.collectionName}_${conflict.id}` }
      );
    }
    
    // Resolve the conflict
    const resolvedItem = resolveConflict(
      conflict,
      resolution,
      customData
    );
    
    // Update the server with the resolved data
    if (this.isOnline()) {
      try {
        const endpoint = this.apiConfig.endpoints[conflict.collectionName] || conflict.collectionName;
        
        await this.httpClient.put(
          `${endpoint}/${conflict.id}/resolve`,
          {
            data: resolvedItem.data,
            resolution
          }
        );
      } catch (error) {
        // If updating the server fails, add to sync queue
        await this.addToSyncQueue(resolvedItem, 'update');
      }
    } else {
      // If offline, add to sync queue
      await this.addToSyncQueue(resolvedItem, 'update');
    }
    
    // Remove the conflict
    this.conflicts.delete(`${conflict.collectionName}_${conflict.id}`);
    
    return resolvedItem;
  }
  
  /**
   * Get current sync status
   */
  getStatus(): SyncStatus {
    return this.status;
  }
  
  /**
   * Get current network status
   */
  getNetworkStatus(): NetworkStatus {
    return getNetworkStatus();
  }
  
  /**
   * Get synchronization statistics
   */
  async getStats(): Promise<SyncStats> {
    await this.ensureInitialized();
    
    const queueStats = await this.queueStorage.getQueueStats();
    
    // Build collections stats
    const collections: Record<string, any> = {};
    
    for (const [collection, count] of Object.entries(queueStats.byCollection)) {
      collections[collection] = {
        lastSyncTime: this.lastSyncTime,
        itemCount: count,
        pendingItems: count,
        failedItems: 0,
        conflicts: Array.from(this.conflicts.values())
          .filter(conflict => conflict.collectionName === collection)
          .length
      };
    }
    
    return {
      lastSyncTime: this.lastSyncTime,
      totalItemsSynced: 0, // This would need persistent tracking
      pendingItems: queueStats.total,
      failedItems: 0, // This would need persistent tracking
      conflicts: this.conflicts.size,
      collections
    };
  }
  
  /**
   * Pause synchronization
   */
  pause(): void {
    if (this.syncInterval !== null) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    this.emitEvent('pause', { message: 'Synchronization paused' });
  }
  
  /**
   * Resume synchronization
   */
  resume(): void {
    this.setupAutoSync();
    this.emitEvent('resume', { message: 'Synchronization resumed' });
  }
  
  /**
   * Abort current synchronization
   */
  async abort(): Promise<void> {
    if (this.currentSyncOperation) {
      this.currentSyncOperation.abort();
      this.currentSyncOperation = null;
      this.updateStatus(SyncStatus.IDLE);
      this.emitEvent('abort', { message: 'Synchronization aborted' });
    }
  }
  
  /**
   * Register an event listener
   */
  addEventListener(eventType: SyncEventType, listener: SyncEventListener): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    
    const listeners = this.eventListeners.get(eventType)!;
    if (!listeners.includes(listener)) {
      listeners.push(listener);
    }
  }
  
  /**
   * Remove an event listener
   */
  removeEventListener(eventType: SyncEventType, listener: SyncEventListener): void {
    if (!this.eventListeners.has(eventType)) return;
    
    const listeners = this.eventListeners.get(eventType)!;
    const index = listeners.indexOf(listener);
    
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }
  
  /**
   * Check if the client is online
   */
  isOnline(): boolean {
    return navigator.onLine;
  }
  
  /**
   * Check if there are any unsynced changes
   */
  async hasUnsyncedChanges(): Promise<boolean> {
    const queue = await this.queueStorage.getQueue();
    return queue.length > 0;
  }
  
  /**
   * Purge old data based on age
   */
  async purgeOldData(maxAge: number = 30 * 24 * 60 * 60 * 1000): Promise<number> {
    // This implementation would depend on how data is stored
    // For now, return 0 items purged
    return 0;
  }
  
  /**
   * Download changes from the server
   */
  private async downloadChanges(
    options: SyncOptions, 
    signal: AbortSignal
  ): Promise<{ count: number, bytes: number }> {
    // Build the request parameters
    const params: Record<string, any> = {
      lastSyncTime: this.lastSyncTime,
      compress: options.compressionEnabled
    };
    
    if (options.collections && options.collections.length > 0) {
      params.collections = options.collections;
    }
    
    // Fetch changes from the server
    try {
      const endpoint = this.apiConfig.endpoints.sync || 'sync';
      
      const response = await this.httpClient.get<{
        changes: SyncItem[];
        deletedItems: { collectionName: string; id: string }[];
        timestamp: number;
        byteSize: number;
      }>(`${endpoint}/pull?${new URLSearchParams(params as any).toString()}`);
      
      if (signal.aborted) {
        throw createSyncError(
          SyncErrorCode.SYNC_ABORTED,
          'Synchronization was aborted'
        );
      }
      
      const { changes, deletedItems, byteSize } = response;
      
      // Process changes
      let processedCount = 0;
      
      // TODO: Implement local storage of received changes
      // This would depend on how data is stored in the application
      
      // For now, just count the changes
      processedCount = changes.length + deletedItems.length;
      
      // Return the number of changes processed
      return { 
        count: processedCount, 
        bytes: byteSize 
      };
    } catch (error) {
      if (signal.aborted) {
        throw createSyncError(
          SyncErrorCode.SYNC_ABORTED,
          'Synchronization was aborted during download'
        );
      }
      
      throw error.code
        ? error
        : createSyncError(
            SyncErrorCode.DOWNLOAD_FAILED,
            `Failed to download changes: ${error.message}`,
            { originalError: error }
          );
    }
  }
  
  /**
   * Upload changes to the server
   */
  private async uploadChanges(
    options: SyncOptions, 
    signal: AbortSignal
  ): Promise<{ count: number, bytes: number }> {
    // Get the sync queue
    const queue = await this.queueStorage.getQueue();
    
    if (queue.length === 0) {
      return { count: 0, bytes: 0 };
    }
    
    // Filter queue by collections if specified
    let filteredQueue = queue;
    if (options.collections && options.collections.length > 0) {
      filteredQueue = queue.filter(item => 
        options.collections!.includes(item.collectionName)
      );
    }
    
    // Prioritize the queue
    const prioritizedQueue = prioritizeSyncQueue(filteredQueue);
    
    // Create batches
    const batches = createSyncBatches(
      prioritizedQueue,
      options.batchSize || 10
    );
    
    // Process batches with concurrency limit
    let processedCount = 0;
    let totalBytes = 0;
    
    const tasks = batches.map(batch => async () => {
      if (signal.aborted) {
        throw createSyncError(
          SyncErrorCode.SYNC_ABORTED,
          'Synchronization was aborted'
        );
      }
      
      const batchData = {
        items: batch,
        clientTime: Date.now(),
        compress: options.compressionEnabled
      };
      
      let dataToSend = batchData;
      
      // Compress if enabled
      if (options.compressionEnabled) {
        const compressedData = await compressData(batchData);
        dataToSend = { 
          compressed: true, 
          data: compressedData 
        };
      }
      
      try {
        const endpoint = this.apiConfig.endpoints.sync || 'sync';
        
        const response = await this.httpClient.post<{
          success: boolean;
          processed: number;
          failed: string[];
          conflicts: SyncConflict[];
          byteSize: number;
        }>(
          `${endpoint}/push`,
          dataToSend,
          { timeout: options.timeout }
        );
        
        // Handle conflicts
        if (response.conflicts && response.conflicts.length > 0) {
          this.handleConflicts(response.conflicts, options);
        }
        
        // Remove processed items from queue
        for (const item of batch) {
          if (!response.failed.includes(item.id)) {
            await this.queueStorage.removeItem(item.id);
            processedCount++;
          } else {
            // Update retry count for failed items
            await this.queueStorage.updateItem(item.id, {
              retryCount: item.retryCount + 1,
              lastAttempt: Date.now()
            });
          }
        }
        
        totalBytes += response.byteSize;
        
        this.emitEvent('progress', {
          processed: processedCount,
          total: queue.length,
          percentage: Math.round((processedCount / queue.length) * 100)
        });
        
        return response;
      } catch (error) {
        // Update retry count for all items in the batch
        for (const item of batch) {
          await this.queueStorage.updateItem(item.id, {
            retryCount: item.retryCount + 1,
            lastAttempt: Date.now(),
            errorInfo: {
              code: error.code || SyncErrorCode.UNKNOWN_ERROR,
              message: error.message
            }
          });
        }
        
        throw error;
      }
    });
    
    try {
      await limitConcurrency(
        tasks,
        options.maxConcurrentRequests || 3
      );
      
      return { 
        count: processedCount, 
        bytes: totalBytes 
      };
    } catch (error) {
      if (signal.aborted) {
        throw createSyncError(
          SyncErrorCode.SYNC_ABORTED,
          'Synchronization was aborted during upload'
        );
      }
      
      throw error.code
        ? error
        : createSyncError(
            SyncErrorCode.UPLOAD_FAILED,
            `Failed to upload changes: ${error.message}`,
            { originalError: error }
          );
    }
  }
  
  /**
   * Handle conflicts from server
   */
  private handleConflicts(conflicts: SyncConflict[], options: SyncOptions): void {
    for (const conflict of conflicts) {
      // Store the conflict
      this.conflicts.set(`${conflict.collectionName}_${conflict.id}`, conflict);
      
      // Emit conflict event
      this.emitEvent('conflict', { conflict });
      
      // Auto-resolve if enabled
      if (options.autoResolveConflicts) {
        this.resolveConflict(
          conflict,
          options.conflictResolution || ConflictResolution.SERVER_WINS
        ).catch(error => {
          this.logDebug('Failed to auto-resolve conflict:', error);
        });
      }
    }
  }
  
  /**
   * Handle server-sent updates
   */
  private handleServerUpdate(update: any): void {
    // Implementation would depend on how data is stored in the application
    this.logDebug('Server update received:', update);
    
    // Emit an event with the update
    this.emitEvent('progress', { serverUpdate: update });
  }
  
  /**
   * Handle online event
   */
  private handleOnline(): void {
    this.updateStatus(SyncStatus.IDLE);
    this.emitEvent('online', { message: 'Device is online' });
    
    // Reconnect WebSocket if available
    if (this.wsClient && !this.wsClient.isConnected()) {
      this.wsClient.connect().catch(error => {
        this.logDebug('Failed to reconnect WebSocket:', error);
      });
    }
    
    // Trigger sync if auto sync is enabled
    if (this.options.mode === SyncMode.AUTO || this.options.mode === SyncMode.OPPORTUNISTIC) {
      this.sync().catch(error => {
        this.logDebug('Auto sync on reconnect failed:', error);
      });
    }
  }
  
  /**
   * Handle offline event
   */
  private handleOffline(): void {
    this.updateStatus(SyncStatus.OFFLINE);
    this.emitEvent('offline', { message: 'Device is offline' });
  }
  
  /**
   * Set up automatic synchronization
   */
  private setupAutoSync(): void {
    // Clear existing interval if any
    if (this.syncInterval !== null) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    // Only set up interval for periodic or auto mode
    if (
      this.options.mode === SyncMode.PERIODIC || 
      this.options.mode === SyncMode.AUTO
    ) {
      const interval = this.options.syncInterval || 60000; // Default to 1 minute
      
      this.syncInterval = window.setInterval(() => {
        // Only sync if online and not already syncing
        if (this.isOnline() && this.status !== SyncStatus.SYNCING) {
          this.sync().catch(error => {
            this.logDebug('Auto sync failed:', error);
          });
        }
      }, interval);
    }
  }
  
  /**
   * Update the sync status
   */
  private updateStatus(status: SyncStatus): void {
    this.status = status;
  }
  
  /**
   * Emit an event to all registered listeners
   */
  private emitEvent(eventType: SyncEventType, data: any): void {
    if (!this.eventListeners.has(eventType)) return;
    
    const event: SyncEvent = { type: eventType, data };
    
    const listeners = this.eventListeners.get(eventType)!;
    for (const listener of listeners) {
      try {
        listener(event);
      } catch (error) {
        this.logDebug(`Error in event listener for ${eventType}:`, error);
      }
    }
  }
  
  /**
   * Ensure the manager is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }
  
  /**
   * Get stats with error information
   */
  private async getStatsWithError(error: SyncError): Promise<SyncStats> {
    const stats = await this.getStats();
    
    return {
      ...stats,
      lastError: error
    };
  }
  
  /**
   * Log debug messages
   */
  private logDebug(...args: any[]): void {
    if (this.debug) {
      console.debug('[SynchronizationManager]', ...args);
    }
  }
}

export default SynchronizationManager;