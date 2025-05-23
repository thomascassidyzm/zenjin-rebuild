/**
 * SynchronizationUtils.ts
 * 
 * Utility functions for the SynchronizationManager component.
 */

import { 
  SyncItem, 
  SyncQueueItem, 
  SyncError, 
  SyncErrorCode, 
  SyncPriority,
  NetworkStatus,
  SyncConflict,
  ConflictResolution
} from './SynchronizationTypes';

/**
 * Generate a unique ID for sync items and batches
 */
export function generateSyncId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 15);
}

/**
 * Compress data before syncing to reduce bandwidth usage
 * @param data The data to compress
 * @returns Compressed data as string
 */
export async function compressData(data: any): Promise<string> {
  try {
    // Convert data to JSON string
    const jsonString = JSON.stringify(data);
    
    // Use CompressionStream if available (modern browsers)
    if (typeof CompressionStream === 'function') {
      const encoder = new TextEncoder();
      const encodedData = encoder.encode(jsonString);
      
      // Create readable stream from the encoded data
      const readableStream = new ReadableStream({
        start(controller) {
          controller.enqueue(encodedData);
          controller.close();
        }
      });
      
      // Pipe through compression stream
      const compressedStream = readableStream.pipeThrough(new CompressionStream('gzip'));
      const reader = compressedStream.getReader();
      
      let compressedData = new Uint8Array();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // Append chunk to compressed data
        const newCompressedData = new Uint8Array(compressedData.length + value.length);
        newCompressedData.set(compressedData);
        newCompressedData.set(value, compressedData.length);
        compressedData = newCompressedData;
      }
      
      // Convert to base64 string for transmission
      return btoa(String.fromCharCode(...compressedData));
    } else {
      // Fallback for browsers without CompressionStream
      // In a real implementation, you might include a JS compression library
      // For now, we just return the JSON string encoded in base64
      return btoa(jsonString);
    }
  } catch (error) {
    console.error('Error compressing data:', error);
    // If compression fails, return the original data as base64
    return btoa(JSON.stringify(data));
  }
}

/**
 * Decompress data received from the server
 * @param compressedData The compressed data as string
 * @returns Decompressed data object
 */
export async function decompressData(compressedData: string): Promise<any> {
  try {
    // Decode base64 string
    const binaryString = atob(compressedData);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Use DecompressionStream if available (modern browsers)
    if (typeof DecompressionStream === 'function') {
      // Create readable stream from the bytes
      const readableStream = new ReadableStream({
        start(controller) {
          controller.enqueue(bytes);
          controller.close();
        }
      });
      
      // Pipe through decompression stream
      const decompressedStream = readableStream.pipeThrough(new DecompressionStream('gzip'));
      const reader = decompressedStream.getReader();
      
      let decompressedData = new Uint8Array();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // Append chunk to decompressed data
        const newDecompressedData = new Uint8Array(decompressedData.length + value.length);
        newDecompressedData.set(decompressedData);
        newDecompressedData.set(value, decompressedData.length);
        decompressedData = newDecompressedData;
      }
      
      // Convert to string and parse JSON
      const decoder = new TextDecoder();
      const jsonString = decoder.decode(decompressedData);
      return JSON.parse(jsonString);
    } else {
      // Fallback for browsers without DecompressionStream
      // In a real implementation, you might include a JS decompression library
      // For now, we just parse the JSON string from base64
      return JSON.parse(binaryString);
    }
  } catch (error) {
    console.error('Error decompressing data:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to decompress data: ${errorMessage}`);
  }
}

/**
 * Create a new sync queue item from a sync item
 * @param item The sync item
 * @param operation The operation type
 * @returns A new sync queue item
 */
export function createSyncQueueItem(
  item: SyncItem, 
  operation: 'create' | 'update' | 'delete',
  priority: SyncPriority = SyncPriority.MEDIUM
): SyncQueueItem {
  return {
    id: `${item.collectionName}_${item.id}_${Date.now()}`,
    collectionName: item.collectionName,
    operation,
    data: operation !== 'delete' ? item.data : undefined,
    priority: priority,
    timestamp: Date.now(),
    retryCount: 0
  };
}

/**
 * Prioritize sync queue based on item priorities and other factors
 * @param queue The sync queue
 * @returns Prioritized queue
 */
export function prioritizeSyncQueue(queue: SyncQueueItem[]): SyncQueueItem[] {
  return [...queue].sort((a, b) => {
    // First sort by priority
    const priorityValues = {
      [SyncPriority.CRITICAL]: 0,
      [SyncPriority.HIGH]: 1,
      [SyncPriority.MEDIUM]: 2,
      [SyncPriority.LOW]: 3
    };
    
    const priorityDiff = priorityValues[a.priority] - priorityValues[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // Then sort by retry count (fewer retries first)
    if (a.retryCount !== b.retryCount) return a.retryCount - b.retryCount;
    
    // Then sort by timestamp (older first)
    return a.timestamp - b.timestamp;
  });
}

/**
 * Calculate backoff time for retries based on retry count
 * @param retryCount Current retry count
 * @param baseDelay Base delay in ms
 * @param maxDelay Maximum delay in ms
 * @returns Delay time in ms
 */
export function calculateBackoff(
  retryCount: number, 
  baseDelay: number = 1000, 
  maxDelay: number = 60000
): number {
  // Exponential backoff with jitter
  const exponentialDelay = Math.min(
    maxDelay,
    baseDelay * Math.pow(2, retryCount)
  );
  
  // Add jitter (±25%)
  const jitter = exponentialDelay * 0.25 * (Math.random() - 0.5);
  
  return Math.max(baseDelay, exponentialDelay + jitter);
}

/**
 * Check if a network error is retryable
 * @param error The error to check
 * @returns Whether the error is retryable
 */
export function isRetryableError(error: SyncError): boolean {
  // Errors that are typically temporary and worth retrying
  const retryableCodes = [
    SyncErrorCode.NETWORK_ERROR,
    SyncErrorCode.SERVER_ERROR,
    SyncErrorCode.TIMEOUT_ERROR
  ];
  
  return retryableCodes.includes(error.code);
}

/**
 * Get current network status information
 * @returns Network status object
 */
export function getNetworkStatus(): NetworkStatus {
  const online = navigator.onLine;
  let type = 'unknown';
  let downlink;
  let rtt;
  let effectiveType;
  let saveData = false;
  
  // Use Network Information API if available
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    
    if (connection) {
      type = connection.type;
      downlink = connection.downlink;
      rtt = connection.rtt;
      effectiveType = connection.effectiveType;
      saveData = connection.saveData;
    }
  }
  
  return {
    online,
    type: type as any,
    downlink,
    rtt,
    effectiveType: effectiveType as any,
    saveData
  };
}

/**
 * Determine if synchronization should proceed based on network conditions
 * @param options Options to consider
 * @returns Whether sync should proceed
 */
export function shouldSync(options: {
  isOnline: boolean;
  networkType?: string;
  batteryLevel?: number;
  syncWhenOnline?: boolean;
  syncOnMeteredConnection?: boolean;
  syncOnLowBattery?: boolean;
  lowBatteryThreshold?: number;
}): boolean {
  const {
    isOnline,
    networkType,
    batteryLevel,
    syncWhenOnline = true,
    syncOnMeteredConnection = true,
    syncOnLowBattery = true,
    lowBatteryThreshold = 0.2
  } = options;
  
  // Don't sync if offline and syncWhenOnline is true
  if (!isOnline && syncWhenOnline) return false;
  
  // Don't sync on metered connections if not allowed
  if (!syncOnMeteredConnection && networkType === 'cellular') return false;
  
  // Don't sync on low battery if not allowed
  if (
    !syncOnLowBattery && 
    batteryLevel !== undefined && 
    batteryLevel < lowBatteryThreshold
  ) return false;
  
  return true;
}

/**
 * Batch sync queue items for efficient transmission
 * @param queue The sync queue
 * @param batchSize Maximum batch size
 * @returns Array of batches
 */
export function createSyncBatches(
  queue: SyncQueueItem[], 
  batchSize: number = 10
): SyncQueueItem[][] {
  const batches: SyncQueueItem[][] = [];
  
  // Group by collection for more efficient syncing
  const collectionGroups = new Map<string, SyncQueueItem[]>();
  
  for (const item of queue) {
    if (!collectionGroups.has(item.collectionName)) {
      collectionGroups.set(item.collectionName, []);
    }
    
    collectionGroups.get(item.collectionName)!.push(item);
  }
  
  // Create batches from the collection groups
  for (const collectionItems of collectionGroups.values()) {
    for (let i = 0; i < collectionItems.length; i += batchSize) {
      batches.push(collectionItems.slice(i, i + batchSize));
    }
  }
  
  return batches;
}

/**
 * Resolve a conflict based on the specified strategy
 * @param conflict The conflict to resolve
 * @param strategy The resolution strategy
 * @param customData Optional custom data for manual resolution
 * @returns Resolved sync item
 */
export function resolveConflict<T>(
  conflict: SyncConflict<T>,
  strategy: ConflictResolution,
  customData?: T
): SyncItem<T> {
  let resolvedData: T;
  
  switch (strategy) {
    case ConflictResolution.CLIENT_WINS:
      resolvedData = conflict.clientData;
      break;
      
    case ConflictResolution.SERVER_WINS:
      resolvedData = conflict.serverData;
      break;
      
    case ConflictResolution.NEWEST_WINS:
      resolvedData = conflict.clientTimestamp > conflict.serverTimestamp
        ? conflict.clientData
        : conflict.serverData;
      break;
      
    case ConflictResolution.MANUAL:
      if (!customData) {
        throw new Error('Custom data required for manual conflict resolution');
      }
      resolvedData = customData;
      break;
      
    case ConflictResolution.MERGE:
      // Simple shallow merge - in a real app, this would be more sophisticated
      resolvedData = {
        ...conflict.serverData,
        ...conflict.clientData
      };
      break;
      
    default:
      throw new Error(`Unknown conflict resolution strategy: ${strategy}`);
  }
  
  // Create resolved sync item
  return {
    id: conflict.id,
    collectionName: conflict.collectionName,
    data: resolvedData,
    lastModified: Date.now(),
    createdAt: Math.min(conflict.clientTimestamp, conflict.serverTimestamp),
    version: (conflict.serverData as any).version 
      ? ((conflict.serverData as any).version + 1) 
      : undefined,
    conflictStatus: 'resolved',
    syncStatus: 'pending'
  };
}

/**
 * Detect changes between two objects
 * @param oldObj The old object
 * @param newObj The new object
 * @returns Object with only the changed properties
 */
export function detectChanges<T extends Record<string, any>>(
  oldObj: T, 
  newObj: T
): Partial<T> {
  const changes: Partial<T> = {};
  
  for (const key in newObj) {
    // Skip if property doesn't exist in old object
    if (!(key in oldObj)) {
      changes[key] = newObj[key];
      continue;
    }
    
    // Check for differences
    if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
      changes[key] = newObj[key];
    }
  }
  
  return changes;
}

/**
 * Merge metadata from multiple sources
 * @param sources Metadata sources to merge
 * @returns Merged metadata
 */
export function mergeMetadata(...sources: Record<string, any>[]): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const source of sources) {
    if (!source) continue;
    
    for (const key in source) {
      result[key] = source[key];
    }
  }
  
  return result;
}

/**
 * Create a sync error object
 * @param code Error code
 * @param message Error message
 * @param details Additional error details
 * @returns Sync error object
 */
export function createSyncError(
  code: SyncErrorCode,
  message: string,
  details?: any
): SyncError {
  return {
    code,
    message,
    details,
    timestamp: new Date()
  };
}

/**
 * Limit concurrent promises
 * @param tasks Array of promise-returning functions
 * @param concurrency Maximum number of concurrent promises
 * @returns Promise resolving to an array of results
 */
export async function limitConcurrency<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number
): Promise<T[]> {
  const results: T[] = [];
  let currentIndex = 0;
  
  async function runTask() {
    if (currentIndex >= tasks.length) return;
    
    const taskIndex = currentIndex++;
    const task = tasks[taskIndex];
    
    try {
      const result = await task();
      results[taskIndex] = result;
    } catch (error) {
      results[taskIndex] = error as any;
    }
    
    // Run the next task
    await runTask();
  }
  
  // Start the initial batch of tasks
  const initialTasks: Promise<void>[] = [];
  
  for (let i = 0; i < Math.min(concurrency, tasks.length); i++) {
    initialTasks.push(runTask());
  }
  
  // Wait for all tasks to complete
  await Promise.all(initialTasks);
  
  return results;
}