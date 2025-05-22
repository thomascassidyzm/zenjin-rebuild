import { 
  OfflineStorageInterface, 
  StorageStats, 
  StorageOptions, 
  StorageItem,
  StorageEventType,
  StorageEventListener,
  OfflineStorageErrorCode,
  CachedItem
} from './OfflineStorageTypes';
import { 
  encryptData, 
  decryptData, 
  calculateStorageRequirements,
  performContentCycling
} from './OfflineStorageUtils';

/**
 * Implementation of the OfflineStorage engine using IndexedDB
 * Provides encrypted storage with content cycling capabilities
 */
class OfflineStorage implements OfflineStorageInterface {
  private dbName: string;
  private dbVersion: number;
  private db: IDBDatabase | null = null;
  private isInitialized: boolean = false;
  private eventListeners: Map<StorageEventType, StorageEventListener[]> = new Map();
  private encryptionEnabled: boolean = true;
  private maxStorageSize: number;
  private cyclingThreshold: number;
  
  constructor(options: StorageOptions = {}) {
    this.dbName = options.dbName || 'zenjin_offline_storage';
    this.dbVersion = options.dbVersion || 1;
    this.maxStorageSize = options.maxStorageSize || 50 * 1024 * 1024; // 50MB default
    this.cyclingThreshold = options.cyclingThreshold || 0.9; // 90% default
    this.encryptionEnabled = options.encryptionEnabled !== false;
  }
  
  /**
   * Initialize the IndexedDB database
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = (event) => {
        const error = new Error(`Failed to open IndexedDB: ${(event.target as IDBRequest).error}`);
        this.emitEvent('error', { 
          code: OfflineStorageErrorCode.INITIALIZATION_FAILED,
          message: error.message,
          details: { originalError: (event.target as IDBRequest).error }
        });
        reject(error);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('items')) {
          const store = db.createObjectStore('items', { keyPath: 'key' });
          store.createIndex('expires', 'expires', { unique: false });
          store.createIndex('priority', 'priority', { unique: false });
          store.createIndex('lastAccessed', 'lastAccessed', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      };
      
      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.isInitialized = true;
        this.emitEvent('ready', { message: 'OfflineStorage initialized successfully' });
        
        // Set up event handlers
        this.db.onerror = (event) => {
          this.emitEvent('error', { 
            code: OfflineStorageErrorCode.DB_ERROR,
            message: `IndexedDB error: ${(event.target as IDBRequest).error}`,
            details: { originalError: (event.target as IDBRequest).error }
          });
        };
        
        // Schedule cleanup of expired items
        this.cleanupExpiredItems();
        
        resolve();
      };
    });
  }
  
  /**
   * Store an item in the database
   */
  async setItem<T>(key: string, value: T, options: Partial<StorageItem> = {}): Promise<void> {
    await this.ensureInitialized();
    
    // Check storage limits
    const stats = await this.getStats();
    if (stats.usedSpace >= this.maxStorageSize * this.cyclingThreshold) {
      await this.performMaintenance();
    }
    
    const valueToStore = this.encryptionEnabled && options.secure !== false 
      ? await encryptData(JSON.stringify(value))
      : JSON.stringify(value);
      
    const storageSize = calculateStorageRequirements(valueToStore);
    
    if (storageSize > this.maxStorageSize) {
      const error = new Error(`Item too large to store: ${storageSize} bytes exceeds maximum of ${this.maxStorageSize} bytes`);
      this.emitEvent('error', { 
        code: OfflineStorageErrorCode.ITEM_TOO_LARGE,
        message: error.message,
        details: { itemSize: storageSize, maxSize: this.maxStorageSize }
      });
      throw error;
    }
    
    const item: CachedItem = {
      key,
      value: valueToStore,
      secure: this.encryptionEnabled && options.secure !== false,
      created: Date.now(),
      expires: options.ttl ? Date.now() + options.ttl : undefined,
      lastAccessed: Date.now(),
      priority: options.priority || 0,
      size: storageSize,
      metadata: options.metadata || {}
    };
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      const transaction = this.db.transaction(['items'], 'readwrite');
      const store = transaction.objectStore('items');
      
      const request = store.put(item);
      
      request.onerror = (event) => {
        const error = new Error(`Failed to store item: ${(event.target as IDBRequest).error}`);
        this.emitEvent('error', { 
          code: OfflineStorageErrorCode.WRITE_FAILED,
          message: error.message,
          details: { key, originalError: (event.target as IDBRequest).error }
        });
        reject(error);
      };
      
      transaction.oncomplete = () => {
        this.emitEvent('write', { key, size: storageSize });
        resolve();
      };
    });
  }
  
  /**
   * Retrieve an item from the database
   */
  async getItem<T>(key: string): Promise<T | null> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      const transaction = this.db.transaction(['items'], 'readwrite');
      const store = transaction.objectStore('items');
      
      const request = store.get(key);
      
      request.onerror = (event) => {
        const error = new Error(`Failed to retrieve item: ${(event.target as IDBRequest).error}`);
        this.emitEvent('error', { 
          code: OfflineStorageErrorCode.READ_FAILED,
          message: error.message,
          details: { key, originalError: (event.target as IDBRequest).error }
        });
        reject(error);
      };
      
      request.onsuccess = async () => {
        const item = request.result as CachedItem | undefined;
        
        if (!item) {
          this.emitEvent('miss', { key });
          resolve(null);
          return;
        }
        
        // Update last accessed time
        item.lastAccessed = Date.now();
        store.put(item);
        
        this.emitEvent('read', { key, size: item.size });
        
        try {
          let valueString = item.value;
          
          // Decrypt if necessary
          if (item.secure) {
            valueString = await decryptData(item.value);
          }
          
          const value = JSON.parse(valueString) as T;
          resolve(value);
        } catch (error) {
          this.emitEvent('error', { 
            code: OfflineStorageErrorCode.DECRYPTION_FAILED,
            message: `Failed to decrypt or parse item: ${error}`,
            details: { key, originalError: error }
          });
          reject(error);
        }
      };
    });
  }
  
  /**
   * Remove an item from the database
   */
  async removeItem(key: string): Promise<boolean> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      const transaction = this.db.transaction(['items'], 'readwrite');
      const store = transaction.objectStore('items');
      
      const request = store.delete(key);
      
      request.onerror = (event) => {
        const error = new Error(`Failed to remove item: ${(event.target as IDBRequest).error}`);
        this.emitEvent('error', { 
          code: OfflineStorageErrorCode.DELETE_FAILED,
          message: error.message,
          details: { key, originalError: (event.target as IDBRequest).error }
        });
        reject(error);
      };
      
      transaction.oncomplete = () => {
        this.emitEvent('delete', { key });
        resolve(true);
      };
    });
  }
  
  /**
   * Check if an item exists in the database
   */
  async hasItem(key: string): Promise<boolean> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      const transaction = this.db.transaction(['items'], 'readonly');
      const store = transaction.objectStore('items');
      
      const request = store.count(key);
      
      request.onerror = (event) => {
        const error = new Error(`Failed to check item existence: ${(event.target as IDBRequest).error}`);
        this.emitEvent('error', { 
          code: OfflineStorageErrorCode.READ_FAILED,
          message: error.message,
          details: { key, originalError: (event.target as IDBRequest).error }
        });
        reject(error);
      };
      
      request.onsuccess = () => {
        resolve(request.result > 0);
      };
    });
  }
  
  /**
   * Get all keys in the database
   */
  async getAllKeys(): Promise<string[]> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      const transaction = this.db.transaction(['items'], 'readonly');
      const store = transaction.objectStore('items');
      
      const request = store.getAllKeys();
      
      request.onerror = (event) => {
        const error = new Error(`Failed to get all keys: ${(event.target as IDBRequest).error}`);
        this.emitEvent('error', { 
          code: OfflineStorageErrorCode.READ_FAILED,
          message: error.message,
          details: { originalError: (event.target as IDBRequest).error }
        });
        reject(error);
      };
      
      request.onsuccess = () => {
        resolve(request.result as string[]);
      };
    });
  }
  
  /**
   * Clear all items from the database
   */
  async clear(): Promise<void> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      const transaction = this.db.transaction(['items'], 'readwrite');
      const store = transaction.objectStore('items');
      
      const request = store.clear();
      
      request.onerror = (event) => {
        const error = new Error(`Failed to clear storage: ${(event.target as IDBRequest).error}`);
        this.emitEvent('error', { 
          code: OfflineStorageErrorCode.CLEAR_FAILED,
          message: error.message,
          details: { originalError: (event.target as IDBRequest).error }
        });
        reject(error);
      };
      
      transaction.oncomplete = () => {
        this.emitEvent('clear', { message: 'Storage cleared successfully' });
        resolve();
      };
    });
  }
  
  /**
   * Get storage statistics
   */
  async getStats(): Promise<StorageStats> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      const transaction = this.db.transaction(['items'], 'readonly');
      const store = transaction.objectStore('items');
      
      const request = store.getAll();
      
      request.onerror = (event) => {
        const error = new Error(`Failed to get storage stats: ${(event.target as IDBRequest).error}`);
        this.emitEvent('error', { 
          code: OfflineStorageErrorCode.READ_FAILED,
          message: error.message,
          details: { originalError: (event.target as IDBRequest).error }
        });
        reject(error);
      };
      
      request.onsuccess = () => {
        const items = request.result as CachedItem[];
        
        const totalItems = items.length;
        const usedSpace = items.reduce((total, item) => total + item.size, 0);
        const oldestItem = items.length > 0 
          ? Math.min(...items.map(item => item.created))
          : undefined;
        const newestItem = items.length > 0
          ? Math.max(...items.map(item => item.created))
          : undefined;
          
        const stats: StorageStats = {
          totalItems,
          usedSpace,
          maxSpace: this.maxStorageSize,
          utilization: usedSpace / this.maxStorageSize,
          oldestItem: oldestItem ? new Date(oldestItem) : undefined,
          newestItem: newestItem ? new Date(newestItem) : undefined
        };
        
        resolve(stats);
      };
    });
  }
  
  /**
   * Register an event listener
   */
  addEventListener(eventType: StorageEventType, listener: StorageEventListener): void {
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
  removeEventListener(eventType: StorageEventType, listener: StorageEventListener): void {
    if (!this.eventListeners.has(eventType)) return;
    
    const listeners = this.eventListeners.get(eventType)!;
    const index = listeners.indexOf(listener);
    
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }
  
  /**
   * Emit an event to all registered listeners
   */
  private emitEvent(eventType: StorageEventType, data: any): void {
    if (!this.eventListeners.has(eventType)) return;
    
    const listeners = this.eventListeners.get(eventType)!;
    listeners.forEach(listener => {
      try {
        listener({ type: eventType, data });
      } catch (error) {
        console.error(`Error in OfflineStorage event listener for ${eventType}:`, error);
      }
    });
  }
  
  /**
   * Ensure the database is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }
  
  /**
   * Clean up expired items
   */
  private async cleanupExpiredItems(): Promise<void> {
    if (!this.db) return;
    
    const now = Date.now();
    
    const transaction = this.db.transaction(['items'], 'readwrite');
    const store = transaction.objectStore('items');
    const index = store.index('expires');
    
    // Get all items with expiration time in the past
    const request = index.openCursor(IDBKeyRange.upperBound(now));
    
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
      
      if (cursor) {
        const item = cursor.value as CachedItem;
        
        // Delete the expired item
        cursor.delete();
        this.emitEvent('expire', { key: item.key });
        
        // Move to the next item
        cursor.continue();
      }
    };
    
    // Schedule the next cleanup
    setTimeout(() => {
      this.cleanupExpiredItems();
    }, 60 * 1000); // Run every minute
  }
  
  /**
   * Perform maintenance on the storage
   */
  private async performMaintenance(): Promise<void> {
    // Get all items for content cycling
    if (!this.db) return;
    
    const transaction = this.db.transaction(['items'], 'readonly');
    const store = transaction.objectStore('items');
    
    const request = store.getAll();
    
    request.onsuccess = async () => {
      const items = request.result as CachedItem[];
      
      if (items.length > 0) {
        // Calculate current space usage
        const totalSpace = items.reduce((total, item) => total + item.size, 0);
        
        if (totalSpace > this.maxStorageSize * this.cyclingThreshold) {
          // Need to perform content cycling
          const itemsToRemove = await performContentCycling(
            items, 
            this.maxStorageSize * 0.7 // Target 70% usage after cycling
          );
          
          // Remove the selected items
          for (const key of itemsToRemove) {
            await this.removeItem(key);
          }
          
          this.emitEvent('maintenance', { 
            itemsRemoved: itemsToRemove.length,
            spaceReclaimed: items
              .filter(item => itemsToRemove.includes(item.key))
              .reduce((total, item) => total + item.size, 0)
          });
        }
      }
    };
  }
}

export default OfflineStorage;