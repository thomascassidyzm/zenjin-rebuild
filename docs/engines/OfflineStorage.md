# OfflineStorage Component

The OfflineStorage component provides a robust, encrypted client-side storage solution for the Zenjin application. It enables reliable offline functionality by securely storing and managing content on the client device.

## Features

- **Persistent Storage**: Uses IndexedDB for reliable client-side storage that persists across sessions
- **Encryption**: Secure storage with Web Crypto API encryption for sensitive data
- **Content Cycling**: Intelligent management of storage space with priority-based content cycling
- **Time to Live (TTL)**: Support for automatic expiration of cached items
- **Event System**: Comprehensive event system for monitoring storage operations
- **Statistics**: Detailed storage statistics for monitoring usage and performance

## Usage

### Basic Usage

```typescript
import { createOfflineStorage } from './engines/OfflineStorage';

// Create a storage instance
const storage = createOfflineStorage();
await storage.initialize();

// Store an item
await storage.setItem('user_data', {
  id: 'user123',
  name: 'Jane Smith',
  preferences: { theme: 'dark' }
});

// Retrieve an item
const userData = await storage.getItem('user_data');

// Check if an item exists
const hasItem = await storage.hasItem('user_data');

// Remove an item
await storage.removeItem('user_data');

// Get storage statistics
const stats = await storage.getStats();
console.log(`Storage usage: ${stats.utilization * 100}%`);
```

### Advanced Configuration

```typescript
import { createOfflineStorage } from './engines/OfflineStorage';
import { StorageOptions } from './engines/OfflineStorage/OfflineStorageTypes';

// Configure storage with custom options
const options: StorageOptions = {
  dbName: 'zenjin_app_storage',
  dbVersion: 1,
  maxStorageSize: 100 * 1024 * 1024, // 100MB
  cyclingThreshold: 0.8, // Start cycling at 80% capacity
  encryptionEnabled: true
};

const storage = createOfflineStorage(options);
await storage.initialize();
```

### Storage Item Options

```typescript
// Store with TTL and priority
await storage.setItem('session_data', sessionObject, {
  ttl: 24 * 60 * 60 * 1000, // 24 hours
  priority: 2, // Higher priority (less likely to be cycled out)
  metadata: {
    type: 'session',
    userId: 'user123'
  }
});

// Store without encryption
await storage.setItem('public_content', publicData, {
  secure: false,
  priority: 1
});
```

### Event Handling

```typescript
// Register event listeners
storage.addEventListener('error', (event) => {
  console.error('Storage error:', event.data);
});

storage.addEventListener('write', (event) => {
  console.log(`Item written: ${event.data.key}, size: ${event.data.size} bytes`);
});

storage.addEventListener('read', (event) => {
  console.log(`Item read: ${event.data.key}`);
});

storage.addEventListener('expire', (event) => {
  console.log(`Item expired: ${event.data.key}`);
});

storage.addEventListener('maintenance', (event) => {
  console.log(`Storage maintenance performed`);
});
```

## API Reference

### OfflineStorageInterface

```typescript
interface OfflineStorageInterface {
  // Core methods
  initialize(): Promise<void>;
  setItem<T>(key: string, value: T, options?: Partial<StorageItem>): Promise<void>;
  getItem<T>(key: string): Promise<T | null>;
  removeItem(key: string): Promise<boolean>;
  hasItem(key: string): Promise<boolean>;
  getAllKeys(): Promise<string[]>;
  clear(): Promise<void>;
  getStats(): Promise<StorageStats>;
  
  // Event handling
  addEventListener(eventType: StorageEventType, listener: StorageEventListener): void;
  removeEventListener(eventType: StorageEventType, listener: StorageEventListener): void;
}
```

### Storage Options

```typescript
interface StorageOptions {
  dbName?: string;           // Database name
  dbVersion?: number;        // Database version
  maxStorageSize?: number;   // Maximum storage size in bytes
  cyclingThreshold?: number; // Threshold for content cycling (0-1)
  encryptionEnabled?: boolean; // Whether encryption is enabled
}
```

### Storage Item Options

```typescript
interface StorageItem {
  ttl?: number;        // Time to live in milliseconds
  priority?: number;   // Priority level (higher = less likely to be cycled)
  secure?: boolean;    // Whether to encrypt the item
  metadata?: Record<string, any>; // Additional metadata for the item
}
```

### Storage Stats

```typescript
interface StorageStats {
  totalItems: number;         // Total number of items
  usedSpace: number;          // Used space in bytes
  maxSpace: number;           // Maximum space in bytes
  utilization: number;        // Used space / max space (0-1)
  oldestItem?: Date;          // Creation date of the oldest item
  newestItem?: Date;          // Creation date of the newest item
}
```

### Event Types

The following event types are available:

- `'read'`: Fired when an item is read
- `'write'`: Fired when an item is written
- `'delete'`: Fired when an item is deleted
- `'clear'`: Fired when storage is cleared
- `'error'`: Fired when an error occurs
- `'expire'`: Fired when an item expires
- `'maintenance'`: Fired when maintenance is performed
- `'ready'`: Fired when the storage is initialized

## Integration with ContentCache

The OfflineStorage component is designed to work seamlessly with the ContentCache component to provide a complete offline content solution:

```typescript
import { createOfflineStorage } from './engines/OfflineStorage';
import { createContentCache } from './engines/ContentCache';

// Create the storage
const storage = createOfflineStorage();

// Create the content cache with the storage
const contentCache = createContentCache({
  storage: storage,
  maxCacheSize: 50 * 1024 * 1024, // 50MB
  defaultTTL: 7 * 24 * 60 * 60 * 1000 // 7 days
});

// Initialize both components
await storage.initialize();
await contentCache.initialize();

// Now you can use the content cache for managing offline content
```

## Error Handling

The OfflineStorage component provides detailed error information:

```typescript
try {
  await storage.setItem('large_item', veryLargeObject);
} catch (error) {
  if (error.code === OfflineStorageErrorCode.ITEM_TOO_LARGE) {
    console.error('The item is too large to store:', error.message);
  } else {
    console.error('Storage error:', error);
  }
}
```

## Security Considerations

- All sensitive data is encrypted using the Web Crypto API
- The encryption key is securely stored and never exposed
- The component follows best practices for client-side storage security

## Performance Optimization

- Automatic content cycling to manage storage space
- Priority-based retention to keep important content longer
- Efficient storage utilization with compression where appropriate