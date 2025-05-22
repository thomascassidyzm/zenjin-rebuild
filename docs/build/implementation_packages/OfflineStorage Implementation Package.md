# OfflineStorage Implementation Package

## Implementation Goal and Component Context

The OfflineStorage component is responsible for managing local storage of user data and content in the Zenjin Maths App. It ensures reliable data persistence across application restarts and provides efficient storage and retrieval mechanisms for offline functionality. This component is a critical part of the OfflineSupport module, enabling users to continue learning without interruption even when internet connectivity is unavailable.

The component must implement robust, universal storage solutions that work across all browsers with excellent mobile compatibility. It should support approximately 30 minutes of cached content in local storage with content cycling mechanisms for extended offline periods. The implementation must synchronize with Supabase at the beginning of sessions to get the latest state and relevant content.

## Interface Definition

```typescript
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
  getItem(userId: string, key: string): StorageItem | undefined;
  
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
  }): boolean;
  
  /**
   * Removes an item from storage
   * @param userId User identifier
   * @param key Storage item key
   * @returns Whether the item was successfully removed
   * @throws Error if user not found, item not found, or removal fails
   */
  removeItem(userId: string, key: string): boolean;
  
  /**
   * Gets storage statistics for a user
   * @param userId User identifier
   * @returns Storage statistics
   * @throws Error if user not found
   */
  getStorageStats(userId: string): StorageStats;
  
  /**
   * Clears expired items from storage
   * @param userId User identifier
   * @returns Number of items cleared
   * @throws Error if user not found or clear operation fails
   */
  clearExpiredItems(userId: string): number;
  
  /**
   * Updates the synchronization status of an item
   * @param userId User identifier
   * @param key Storage item key
   * @param syncStatus New synchronization status
   * @returns Whether the status was successfully updated
   * @throws Error if user not found, item not found, or status is invalid
   */
  updateSyncStatus(userId: string, key: string, syncStatus: string): boolean;
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
```

## Module Context

The OfflineStorage component is part of the OfflineSupport module, which provides offline functionality with local storage of content and progress, synchronizing with the server only at the beginning and end of sessions. This module ensures the application functions properly without an internet connection.

### Module Structure

The OfflineSupport module consists of the following components:

1. **OfflineStorage** (this component): Implements local storage using IndexedDB
2. **SynchronizationManager**: Manages data synchronization between local storage and server
3. **ContentCache**: Manages caching of content for offline use
4. **ConnectivityManager**: Detects and handles network connectivity changes

### Component Dependencies

The OfflineStorage component has no direct dependencies on other components, but it is used by:

1. **SynchronizationManager**: Uses OfflineStorage to store and retrieve data that needs to be synchronized
2. **ContentCache**: Uses OfflineStorage to store and retrieve cached content

### Module Dependencies

The OfflineSupport module has dependencies on:

1. **MetricsSystem**: For metrics storage
2. **ProgressionSystem**: For progress tracking
3. **SubscriptionSystem**: For subscription management

## Implementation Requirements

### Storage Strategy

1. **IndexedDB Implementation**
   - Use IndexedDB as the primary storage mechanism for its robustness and performance with large datasets
   - Implement a wrapper around IndexedDB to simplify operations and handle browser compatibility issues
   - Structure the database with separate object stores for different data categories (user progress, content, metrics)
   - Use versioned database schema to support future upgrades

2. **Data Organization**
   - Organize data by user ID and data category
   - Use composite keys (userId + key) for efficient retrieval
   - Implement indexes for common query patterns
   - Support structured data storage with JSON serialization/deserialization

3. **Content Caching**
   - Implement efficient storage of learning content for offline use
   - Support approximately 30 minutes of cached content
   - Implement content cycling mechanisms to manage storage when offline for extended periods
   - Prioritize storage of essential content based on user's current learning path

### Security Requirements

1. **Data Encryption**
   - Implement encryption for sensitive user data
   - Use the Web Crypto API for client-side encryption
   - Store encryption keys securely
   - Ensure encrypted data can be properly synchronized with the server

2. **Storage Quotas**
   - Monitor storage usage to prevent exceeding browser quotas
   - Implement graceful handling of quota exceeded errors
   - Prioritize critical data when storage is limited
   - Implement data eviction policies for non-critical data

### Performance Requirements

1. **Efficient Operations**
   - Optimize read/write operations for performance
   - Use bulk operations where appropriate
   - Implement caching layer for frequently accessed data
   - Minimize blocking operations on the main thread

2. **Large Dataset Handling**
   - Support efficient storage and retrieval of large datasets
   - Implement pagination for large result sets
   - Use indexes for efficient queries
   - Optimize data structures for storage efficiency

### Error Handling

1. **Robust Error Management**
   - Implement comprehensive error handling for all storage operations
   - Provide meaningful error messages and error codes
   - Handle browser-specific storage limitations and errors
   - Implement retry mechanisms for transient errors

2. **Fallback Mechanisms**
   - Implement fallback storage mechanisms (e.g., localStorage) for critical data when IndexedDB is unavailable
   - Ensure graceful degradation when storage is limited or unavailable
   - Provide clear feedback when storage operations fail

### Browser Compatibility

1. **Universal Support**
   - Ensure compatibility with all major browsers (Chrome, Firefox, Safari, Edge)
   - Implement feature detection and polyfills where necessary
   - Test thoroughly on mobile browsers (iOS Safari, Android Chrome)
   - Handle vendor-specific implementations and limitations

### Offline Functionality

1. **Session-Based Synchronization**
   - Support initial synchronization with Supabase at the beginning of sessions
   - Store sufficient data for offline operation
   - Track changes made while offline for later synchronization
   - Implement efficient differential synchronization

2. **Content Cycling**
   - Implement mechanisms to cycle cached content when offline for extended periods
   - Prioritize content based on user's current learning path
   - Implement storage space management policies
   - Support prefetching of likely needed content

## Mock Inputs and Expected Outputs

### getItem

**Input:**
```typescript
const input = {
  userId: "user123",
  key: "progress:session456"
};
```

**Expected Output:**
```typescript
const expectedOutput = {
  key: "progress:session456",
  value: {
    correctAnswers: 18,
    totalQuestions: 20,
    completionTime: 240000
  },
  timestamp: "2025-05-20T15:30:45.123Z",
  syncStatus: "synced",
  expirationDate: "2025-06-20T15:30:45.123Z"
};
```

### setItem

**Input:**
```typescript
const input = {
  userId: "user123",
  key: "progress:session789",
  value: {
    correctAnswers: 15,
    totalQuestions: 20,
    completionTime: 300000
  },
  options: {
    syncStatus: "pending",
    expirationDate: "2025-06-21T10:15:30.000Z"
  }
};
```

**Expected Output:**
```typescript
const expectedOutput = true;
```

### removeItem

**Input:**
```typescript
const input = {
  userId: "user123",
  key: "progress:session456"
};
```

**Expected Output:**
```typescript
const expectedOutput = true;
```

### getStorageStats

**Input:**
```typescript
const input = {
  userId: "user123"
};
```

**Expected Output:**
```typescript
const expectedOutput = {
  totalItems: 42,
  totalSize: 256000,
  syncedItems: 35,
  pendingItems: 5,
  conflictItems: 2,
  lastUpdated: "2025-05-21T08:45:12.789Z"
};
```

### clearExpiredItems

**Input:**
```typescript
const input = {
  userId: "user123"
};
```

**Expected Output:**
```typescript
const expectedOutput = 3; // Number of items cleared
```

### updateSyncStatus

**Input:**
```typescript
const input = {
  userId: "user123",
  key: "progress:session789",
  syncStatus: "synced"
};
```

**Expected Output:**
```typescript
const expectedOutput = true;
```

## Error Scenarios

### User Not Found

**Input:**
```typescript
const input = {
  userId: "nonexistentUser",
  key: "progress:session456"
};
```

**Expected Error:**
```
Error: USER_NOT_FOUND - The specified user was not found
```

### Item Not Found

**Input:**
```typescript
const input = {
  userId: "user123",
  key: "nonexistentKey"
};
```

**Expected Error:**
```
Error: ITEM_NOT_FOUND - The specified item was not found
```

### Storage Quota Exceeded

**Input:**
```typescript
const input = {
  userId: "user123",
  key: "largeContent",
  value: /* Very large data object */
};
```

**Expected Error:**
```
Error: QUOTA_EXCEEDED - Storage quota exceeded
```

### Invalid Sync Status

**Input:**
```typescript
const input = {
  userId: "user123",
  key: "progress:session789",
  syncStatus: "invalidStatus"
};
```

**Expected Error:**
```
Error: INVALID_STATUS - The specified status is invalid
```

## Validation Criteria

### OS-001: Storage Persistence

The OfflineStorage component must reliably store and retrieve data across application restarts. This means:

1. Data stored through the component must persist even after the browser is closed and reopened
2. All data attributes (including metadata like timestamps and sync status) must be preserved accurately
3. The component must handle storage quotas and limitations gracefully
4. Data integrity must be maintained during storage operations

## Implementation Notes

### IndexedDB Implementation Strategy

The implementation should use a structured approach to IndexedDB:

```typescript
class OfflineStorage implements OfflineStorageInterface {
  private readonly DB_NAME = "ZenjinOfflineStorage";
  private readonly DB_VERSION = 1;
  private readonly STORES = {
    USER_DATA: "userData",
    CONTENT: "content",
    METRICS: "metrics"
  };
  
  private db: IDBDatabase | null = null;
  private dbInitPromise: Promise<IDBDatabase> | null = null;
  
  constructor() {
    this.initDatabase();
  }
  
  private initDatabase(): Promise<IDBDatabase> {
    if (this.dbInitPromise) {
      return this.dbInitPromise;
    }
    
    this.dbInitPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      
      request.onerror = (event) => {
        reject(new Error(`Failed to open database: ${(event.target as IDBRequest).error}`));
      };
      
      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores with indexes
        if (!db.objectStoreNames.contains(this.STORES.USER_DATA)) {
          const userDataStore = db.createObjectStore(this.STORES.USER_DATA, { keyPath: ["userId", "key"] });
          userDataStore.createIndex("userId", "userId", { unique: false });
          userDataStore.createIndex("syncStatus", "syncStatus", { unique: false });
          userDataStore.createIndex("expirationDate", "expirationDate", { unique: false });
        }
        
        if (!db.objectStoreNames.contains(this.STORES.CONTENT)) {
          const contentStore = db.createObjectStore(this.STORES.CONTENT, { keyPath: ["userId", "key"] });
          contentStore.createIndex("userId", "userId", { unique: false });
          contentStore.createIndex("contentType", "contentType", { unique: false });
        }
        
        if (!db.objectStoreNames.contains(this.STORES.METRICS)) {
          const metricsStore = db.createObjectStore(this.STORES.METRICS, { keyPath: ["userId", "key"] });
          metricsStore.createIndex("userId", "userId", { unique: false });
          metricsStore.createIndex("timestamp", "timestamp", { unique: false });
        }
      };
    });
    
    return this.dbInitPromise;
  }
  
  // Implementation of interface methods...
}
```

### Data Encryption Strategy

For sensitive data, implement encryption using the Web Crypto API:

```typescript
class EncryptionService {
  private readonly ALGORITHM = "AES-GCM";
  private readonly KEY_LENGTH = 256;
  private readonly IV_LENGTH = 12;
  private cryptoKey: CryptoKey | null = null;
  
  async initializeEncryption(userId: string): Promise<void> {
    // Generate or retrieve encryption key for the user
    const keyMaterial = await this.getKeyMaterial(userId);
    this.cryptoKey = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: new TextEncoder().encode(`zenjin-salt-${userId}`),
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: this.ALGORITHM, length: this.KEY_LENGTH },
      false,
      ["encrypt", "decrypt"]
    );
  }
  
  private async getKeyMaterial(userId: string): Promise<CryptoKey> {
    // In a real implementation, this would use a more secure key derivation approach
    const encoder = new TextEncoder();
    const keyData = encoder.encode(`zenjin-key-${userId}`);
    return window.crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );
  }
  
  async encrypt(data: any): Promise<{ encryptedData: ArrayBuffer; iv: Uint8Array }> {
    if (!this.cryptoKey) {
      throw new Error("Encryption not initialized");
    }
    
    const iv = window.crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
    const encodedData = new TextEncoder().encode(JSON.stringify(data));
    
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: this.ALGORITHM,
        iv
      },
      this.cryptoKey,
      encodedData
    );
    
    return { encryptedData, iv };
  }
  
  async decrypt(encryptedData: ArrayBuffer, iv: Uint8Array): Promise<any> {
    if (!this.cryptoKey) {
      throw new Error("Encryption not initialized");
    }
    
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: this.ALGORITHM,
        iv
      },
      this.cryptoKey,
      encryptedData
    );
    
    const decodedData = new TextDecoder().decode(decryptedData);
    return JSON.parse(decodedData);
  }
}
```

### Content Cycling Strategy

Implement a content cycling mechanism to manage storage when offline for extended periods:

```typescript
class ContentCyclingManager {
  private readonly MAX_CONTENT_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
  private readonly CONTENT_EXPIRY_TIME_MS = 30 * 60 * 1000; // 30 minutes
  
  constructor(private offlineStorage: OfflineStorageInterface) {}
  
  async manageContentStorage(userId: string): Promise<void> {
    // Get current storage stats
    const stats = this.offlineStorage.getStorageStats(userId);
    
    // If we're approaching storage limits, start cycling content
    if (stats.totalSize > this.MAX_CONTENT_SIZE_BYTES * 0.8) {
      await this.cycleContent(userId);
    }
    
    // Clear expired content
    const clearedCount = this.offlineStorage.clearExpiredItems(userId);
    console.log(`Cleared ${clearedCount} expired items`);
  }
  
  private async cycleContent(userId: string): Promise<void> {
    // Get all content items
    const contentItems = await this.getAllContentItems(userId);
    
    // Sort by priority (learning path position, last access time, etc.)
    const sortedItems = this.sortContentByPriority(contentItems);
    
    // Remove lowest priority items until we're under the target size
    let currentSize = sortedItems.reduce((total, item) => total + this.estimateItemSize(item), 0);
    const targetSize = this.MAX_CONTENT_SIZE_BYTES * 0.7; // Target 70% usage
    
    while (currentSize > targetSize && sortedItems.length > 0) {
      const itemToRemove = sortedItems.pop();
      if (itemToRemove) {
        this.offlineStorage.removeItem(userId, itemToRemove.key);
        currentSize -= this.estimateItemSize(itemToRemove);
      }
    }
  }
  
  private async getAllContentItems(userId: string): Promise<StorageItem[]> {
    // Implementation to retrieve all content items for the user
    // This would use a custom method or query the IndexedDB directly
    return [];
  }
  
  private sortContentByPriority(items: StorageItem[]): StorageItem[] {
    // Sort items by priority:
    // 1. Current learning path content
    // 2. Recently accessed content
    // 3. Content with longer expiration times
    return [...items].sort((a, b) => {
      // Implementation of priority sorting logic
      return 0;
    });
  }
  
  private estimateItemSize(item: StorageItem): number {
    // Estimate the size of an item in bytes
    return JSON.stringify(item).length * 2; // Rough estimate
  }
}
```

### Supabase Integration Strategy

Integrate with Supabase for initial data synchronization:

```typescript
class SupabaseIntegration {
  constructor(private offlineStorage: OfflineStorageInterface) {}
  
  async synchronizeInitialData(userId: string): Promise<void> {
    try {
      // 1. Fetch user data from Supabase
      const userData = await this.fetchUserDataFromSupabase(userId);
      
      // 2. Store user data in offline storage
      for (const [key, value] of Object.entries(userData)) {
        this.offlineStorage.setItem(userId, key, value, {
          syncStatus: "synced",
          expirationDate: this.calculateExpirationDate(key, value)
        });
      }
      
      // 3. Fetch content data for next 30 minutes of learning
      const contentData = await this.fetchContentDataFromSupabase(userId);
      
      // 4. Store content data in offline storage
      for (const [key, value] of Object.entries(contentData)) {
        this.offlineStorage.setItem(userId, key, value, {
          syncStatus: "synced",
          expirationDate: this.calculateExpirationDate(key, value)
        });
      }
      
      console.log("Initial data synchronization completed");
    } catch (error) {
      console.error("Error during initial data synchronization:", error);
      throw new Error(`SYNC_ERROR - ${error.message}`);
    }
  }
  
  private async fetchUserDataFromSupabase(userId: string): Promise<Record<string, any>> {
    // Implementation to fetch user data from Supabase
    return {};
  }
  
  private async fetchContentDataFromSupabase(userId: string): Promise<Record<string, any>> {
    // Implementation to fetch content data from Supabase
    return {};
  }
  
  private calculateExpirationDate(key: string, value: any): string {
    // Calculate expiration date based on content type
    const now = new Date();
    let expiryTime = now.getTime();
    
    if (key.startsWith("content:")) {
      // Content expires after 24 hours
      expiryTime += 24 * 60 * 60 * 1000;
    } else if (key.startsWith("progress:")) {
      // Progress data expires after 7 days
      expiryTime += 7 * 24 * 60 * 60 * 1000;
    } else {
      // Default expiration is 3 days
      expiryTime += 3 * 24 * 60 * 60 * 1000;
    }
    
    return new Date(expiryTime).toISOString();
  }
}
```

## Usage Example

```typescript
// Example usage of OfflineStorage component
import { OfflineStorage } from './components/OfflineStorage';

// Initialize the offline storage
const offlineStorage = new OfflineStorage();

// Store user progress data
try {
  const success = offlineStorage.setItem('user123', 'progress:session456', {
    correctAnswers: 18,
    totalQuestions: 20,
    completionTime: 240000
  }, {
    syncStatus: 'pending',
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
  });
  
  if (success) {
    console.log('Progress data stored successfully');
  }
} catch (error) {
  console.error('Error storing progress data:', error);
}

// Retrieve stored data
try {
  const progressData = offlineStorage.getItem('user123', 'progress:session456');
  
  if (progressData) {
    console.log(`Sync status: ${progressData.syncStatus}`);
    console.log(`Last modified: ${progressData.timestamp}`);
    console.log(`Value: ${JSON.stringify(progressData.value)}`);
  } else {
    console.log('Progress data not found');
  }
} catch (error) {
  console.error('Error retrieving progress data:', error);
}

// Update sync status after synchronization
try {
  const success = offlineStorage.updateSyncStatus('user123', 'progress:session456', 'synced');
  
  if (success) {
    console.log('Sync status updated successfully');
  }
} catch (error) {
  console.error('Error updating sync status:', error);
}

// Get storage statistics
try {
  const stats = offlineStorage.getStorageStats('user123');
  console.log(`Total items: ${stats.totalItems}`);
  console.log(`Synced items: ${stats.syncedItems}`);
  console.log(`Pending items: ${stats.pendingItems}`);
  console.log(`Storage size: ${stats.totalSize} bytes`);
} catch (error) {
  console.error('Error getting storage statistics:', error);
}

// Clear expired items
try {
  const clearedCount = offlineStorage.clearExpiredItems('user123');
  console.log(`Cleared ${clearedCount} expired items`);
} catch (error) {
  console.error('Error clearing expired items:', error);
}
```

## Implementation Considerations

### Browser Compatibility

The implementation should handle browser differences in IndexedDB implementation:

1. Use feature detection to check for IndexedDB support
2. Implement fallback mechanisms for browsers with limited or no IndexedDB support
3. Handle Safari's quirks with IndexedDB in private browsing mode
4. Test thoroughly across different browsers and versions

### Mobile Optimization

For optimal mobile performance:

1. Minimize storage operations during critical user interactions
2. Implement efficient data serialization/deserialization
3. Use small, frequent transactions instead of large, infrequent ones
4. Implement background synchronization using Service Workers where supported
5. Handle mobile-specific storage limitations and quotas

### Testing Strategy

The implementation should be tested with:

1. Unit tests for all public methods
2. Integration tests with mock Supabase backend
3. Performance tests with large datasets
4. Compatibility tests across browsers
5. Offline functionality tests
6. Storage quota tests

### Security Considerations

Beyond encryption, consider:

1. Sanitizing inputs to prevent injection attacks
2. Validating data integrity before storage and after retrieval
3. Implementing access controls based on user ID
4. Handling sensitive data according to privacy regulations
5. Implementing secure key management for encryption
