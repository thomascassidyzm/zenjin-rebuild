# SynchronizationManager Component

The SynchronizationManager component provides robust data synchronization between client and server with comprehensive offline support for the Zenjin application. It enables seamless offline functionality and ensures data integrity across devices.

## Features

- **Bidirectional Synchronization**: Sync data to and from the server in real-time or batch modes
- **Offline Support**: Continue using the app offline with automatic sync when connection is restored
- **Conflict Resolution**: Smart handling of conflicts with configurable resolution strategies
- **Prioritized Sync**: Prioritize critical data for synchronization
- **Bandwidth Optimization**: Data compression and batching to minimize network usage
- **Retry Mechanism**: Exponential backoff and retry strategies for reliable sync
- **Event System**: Comprehensive events for monitoring sync status and progress
- **Configurable Sync Policies**: Fine-tune sync behavior based on network conditions and battery status

## Usage

### Basic Setup

```typescript
import { createSynchronizationManager } from './engines/SynchronizationManager';
import { SyncMode, SyncDirection, ConflictResolution } from './engines/SynchronizationManager/SynchronizationTypes';

// Configure the API endpoints
const apiConfig = {
  baseUrl: 'https://api.zenjin.com/v1',
  endpoints: {
    sync: 'sync',
    users: 'users',
    lessons: 'lessons',
    progress: 'progress'
  },
  authTokenProvider: async () => {
    // Get the auth token from your authentication system
    return 'user_auth_token';
  }
};

// Create and initialize the synchronization manager
const syncManager = createSynchronizationManager({
  apiConfig,
  syncOptions: {
    mode: SyncMode.AUTO,
    direction: SyncDirection.BIDIRECTIONAL,
    conflictResolution: ConflictResolution.SERVER_WINS,
    syncInterval: 5 * 60 * 1000, // 5 minutes
    batchSize: 20,
    compressionEnabled: true
  }
});

// Initialize the manager
await syncManager.initialize();

// Register event listeners
syncManager.addEventListener('start', (event) => {
  console.log('Sync started');
});

syncManager.addEventListener('complete', (event) => {
  console.log('Sync completed:', event.data.stats);
});

syncManager.addEventListener('error', (event) => {
  console.error('Sync error:', event.data.message);
});
```

### Adding Items to Sync Queue

```typescript
// Create an item to be synced
const newLesson = {
  id: 'lesson_123',
  collectionName: 'lessons',
  data: {
    title: 'Introduction to Algebra',
    content: 'Algebra is the study of mathematical symbols...',
    createdBy: 'user_456'
  },
  lastModified: Date.now(),
  createdAt: Date.now()
};

// Add to sync queue
await syncManager.addToSyncQueue(newLesson, 'create');

// When the item is updated
await syncManager.addToSyncQueue(updatedLesson, 'update');

// When the item is deleted
await syncManager.addToSyncQueue({ id: 'lesson_123', collectionName: 'lessons' }, 'delete');
```

### Manual Synchronization

```typescript
// Trigger a full sync
const stats = await syncManager.sync();
console.log('Sync completed with stats:', stats);

// Sync a specific collection
await syncManager.syncCollection('lessons');

// Sync a specific item
const lesson = await syncManager.syncItem('lessons', 'lesson_123');
```

### Handling Conflicts

```typescript
// Register conflict handler
syncManager.addEventListener('conflict', async (event) => {
  const conflict = event.data.conflict;
  
  // Show conflict to user in UI
  const userChoice = await showConflictResolutionDialog(conflict);
  
  if (userChoice === 'client') {
    await syncManager.resolveConflict(
      conflict,
      ConflictResolution.CLIENT_WINS
    );
  } else if (userChoice === 'server') {
    await syncManager.resolveConflict(
      conflict,
      ConflictResolution.SERVER_WINS
    );
  } else if (userChoice === 'merge') {
    // Custom merge logic
    const mergedData = customMergeFunction(conflict.clientData, conflict.serverData);
    
    await syncManager.resolveConflict(
      conflict,
      ConflictResolution.MANUAL,
      mergedData
    );
  }
});
```

### Sync Status Monitoring

```typescript
// Check current sync status
const status = syncManager.getStatus();
console.log('Current sync status:', status);

// Check network status
const networkStatus = syncManager.getNetworkStatus();
console.log('Network status:', networkStatus);

// Check if there are pending changes
const hasChanges = await syncManager.hasUnsyncedChanges();
console.log('Has unsynced changes:', hasChanges);

// Get detailed sync statistics
const stats = await syncManager.getStats();
console.log('Sync stats:', stats);
```

### Controlling Sync

```typescript
// Pause automatic synchronization
syncManager.pause();

// Resume automatic synchronization
syncManager.resume();

// Abort an in-progress sync
await syncManager.abort();

// Clear the sync queue
await syncManager.clearSyncQueue();
```

## API Reference

### SynchronizationManagerInterface

```typescript
interface SynchronizationManagerInterface {
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
```

### Sync Options

```typescript
interface SyncOptions {
  mode?: SyncMode;               // AUTO, MANUAL, PERIODIC, OPPORTUNISTIC
  direction?: SyncDirection;     // UPLOAD, DOWNLOAD, BIDIRECTIONAL
  conflictResolution?: ConflictResolution; // SERVER_WINS, CLIENT_WINS, etc.
  batchSize?: number;            // Number of items per batch
  retryLimit?: number;           // Maximum retry attempts
  retryDelay?: number;           // Base delay between retries
  syncInterval?: number;         // Interval for periodic sync
  maxConcurrentRequests?: number; // Concurrent request limit
  timeout?: number;              // Request timeout
  compressionEnabled?: boolean;  // Enable data compression
  encryptionEnabled?: boolean;   // Enable data encryption
  prioritizeCollections?: string[]; // Collections to prioritize
  throttleRequests?: boolean;    // Throttle request rate
  allowOfflineChanges?: boolean; // Allow changes when offline
  syncWhenOnline?: boolean;      // Only sync when online
  autoResolveConflicts?: boolean; // Auto-resolve conflicts
  collections?: string[];        // Collections to sync
}
```

### Event Types

The following event types are available:

- `'start'`: Fired when sync starts
- `'progress'`: Fired with sync progress updates
- `'complete'`: Fired when sync completes
- `'error'`: Fired when an error occurs
- `'online'`: Fired when device goes online
- `'offline'`: Fired when device goes offline
- `'conflict'`: Fired when a conflict is detected
- `'retry'`: Fired when a retry is attempted
- `'abort'`: Fired when sync is aborted
- `'pause'`: Fired when sync is paused
- `'resume'`: Fired when sync is resumed

## Integration with OfflineStorage

The SynchronizationManager component is designed to work seamlessly with the OfflineStorage component to provide a complete offline data solution:

```typescript
import { createSynchronizationManager } from './engines/SynchronizationManager';
import { createOfflineStorage } from './engines/OfflineStorage';

// Create the offline storage
const storage = createOfflineStorage();
await storage.initialize();

// Create a custom sync queue storage using the offline storage
const queueStorage = {
  async getQueue() {
    return await storage.getItem('sync_queue') || [];
  },
  
  async addItem(item) {
    const queue = await this.getQueue();
    queue.push(item);
    await storage.setItem('sync_queue', queue);
  },
  
  async removeItem(id) {
    const queue = await this.getQueue();
    const newQueue = queue.filter(item => item.id !== id);
    await storage.setItem('sync_queue', newQueue);
    return queue.length !== newQueue.length;
  },
  
  async updateItem(id, updates) {
    const queue = await this.getQueue();
    const index = queue.findIndex(item => item.id === id);
    
    if (index === -1) return false;
    
    queue[index] = { ...queue[index], ...updates };
    await storage.setItem('sync_queue', queue);
    return true;
  },
  
  async clearQueue() {
    await storage.setItem('sync_queue', []);
  },
  
  async getQueueStats() {
    const queue = await this.getQueue();
    // Calculate and return stats
    return { /* stats object */ };
  }
};

// Create the synchronization manager with the custom queue storage
const syncManager = createSynchronizationManager({
  apiConfig: { /* API config */ },
  queueStorage: queueStorage
});

// Initialize both components
await storage.initialize();
await syncManager.initialize();
```

## Performance Considerations

- Use appropriate batch sizes based on your data and network conditions
- Enable compression for larger datasets
- Use the `prioritizeCollections` option to ensure critical data syncs first
- Consider network type and battery status for sync timing
- Use `maxConcurrentRequests` to limit parallel requests based on device capabilities

## Security Considerations

- The component supports secure token-based authentication
- Token refresh handling is built-in
- Enable encryption for sensitive data
- Always validate data on the server side despite client validation