/**
 * Utility classes for OfflineStorage component
 * This file contains encryption services and content cycling management
 */

import { StorageItem, ContentMetadata, ContentPriority, OfflineStorageInterface } from './OfflineStorageTypes';

/**
 * Service for handling encryption and decryption of storage data
 */
export class EncryptionService {
  private readonly ALGORITHM = "AES-GCM";
  private readonly KEY_LENGTH = 256;
  private readonly IV_LENGTH = 12;
  private readonly ITERATIONS = 100000;
  
  private cryptoKeys: Map<string, CryptoKey> = new Map();
  
  /**
   * Initialize encryption for a specific user
   * @param userId User identifier
   */
  async initializeEncryption(userId: string): Promise<void> {
    if (this.cryptoKeys.has(userId)) {
      return; // Already initialized
    }
    
    try {
      // Check for Web Crypto API support
      if (!window.crypto || !window.crypto.subtle) {
        console.warn('Web Crypto API not supported, encryption disabled');
        return;
      }
      
      const keyMaterial = await this.getKeyMaterial(userId);
      const cryptoKey = await window.crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: new TextEncoder().encode(`zenjin-salt-${userId}`),
          iterations: this.ITERATIONS,
          hash: "SHA-256"
        },
        keyMaterial,
        { name: this.ALGORITHM, length: this.KEY_LENGTH },
        false,
        ["encrypt", "decrypt"]
      );
      
      this.cryptoKeys.set(userId, cryptoKey);
    } catch (error) {
      console.error(`Failed to initialize encryption for user ${userId}:`, error);
      throw new Error(`ENCRYPTION_ERROR - Failed to initialize encryption: ${error.message}`);
    }
  }
  
  /**
   * Encrypt data for storage
   * @param data Data to encrypt
   * @returns Encrypted data and initialization vector
   */
  async encrypt(data: any): Promise<{ encryptedData: ArrayBuffer; iv: Uint8Array }> {
    // Find the crypto key for the current context (assumes single user context)
    const cryptoKey = this.cryptoKeys.values().next().value;
    
    if (!cryptoKey) {
      throw new Error("Encryption not initialized");
    }
    
    try {
      const iv = window.crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
      const encodedData = new TextEncoder().encode(JSON.stringify(data));
      
      const encryptedData = await window.crypto.subtle.encrypt(
        {
          name: this.ALGORITHM,
          iv
        },
        cryptoKey,
        encodedData
      );
      
      return { encryptedData, iv };
    } catch (error) {
      throw new Error(`ENCRYPTION_ERROR - Failed to encrypt data: ${error.message}`);
    }
  }
  
  /**
   * Decrypt data from storage
   * @param encryptedData Encrypted data
   * @param iv Initialization vector
   * @returns Decrypted data
   */
  async decrypt(encryptedData: ArrayBuffer, iv: Uint8Array): Promise<any> {
    // Find the crypto key for the current context (assumes single user context)
    const cryptoKey = this.cryptoKeys.values().next().value;
    
    if (!cryptoKey) {
      throw new Error("Encryption not initialized");
    }
    
    try {
      const decryptedData = await window.crypto.subtle.decrypt(
        {
          name: this.ALGORITHM,
          iv
        },
        cryptoKey,
        encryptedData
      );
      
      const decodedData = new TextDecoder().decode(decryptedData);
      return JSON.parse(decodedData);
    } catch (error) {
      throw new Error(`DECRYPTION_ERROR - Failed to decrypt data: ${error.message}`);
    }
  }
  
  /**
   * Clear encryption key for a user
   * @param userId User identifier
   */
  clearEncryptionKey(userId: string): void {
    this.cryptoKeys.delete(userId);
  }
  
  /**
   * Check if encryption is available and initialized
   * @param userId User identifier
   * @returns Whether encryption is available
   */
  isEncryptionAvailable(userId: string): boolean {
    return window.crypto && window.crypto.subtle && this.cryptoKeys.has(userId);
  }
  
  /**
   * Get key material for encryption
   * @param userId User identifier
   * @returns Key material for encryption
   */
  private async getKeyMaterial(userId: string): Promise<CryptoKey> {
    // In a production environment, this would use a more secure approach
    // such as deriving from user credentials or stored keys
    const encoder = new TextEncoder();
    const keyData = encoder.encode(`zenjin-key-${userId}-${Date.now()}`);
    
    return window.crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );
  }
}

/**
 * Manager for content cycling when storage is limited
 */
export class ContentCyclingManager {
  private readonly MAX_CONTENT_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
  private readonly CONTENT_EXPIRY_TIME_MS = 30 * 60 * 1000; // 30 minutes
  private readonly TARGET_USAGE_PERCENTAGE = 0.7; // Target 70% usage after cleanup
  
  constructor(private offlineStorage: OfflineStorageInterface) {}
  
  /**
   * Manage content storage by cycling old/unused content
   * @param userId User identifier
   */
  async manageContentStorage(userId: string): Promise<void> {
    try {
      // Get current storage stats
      const stats = await this.offlineStorage.getStorageStats(userId);
      
      // If we're approaching storage limits, start cycling content
      if (stats.totalSize > this.MAX_CONTENT_SIZE_BYTES * 0.8) {
        await this.cycleContent(userId);
      }
      
      // Clear expired content
      const clearedCount = await this.offlineStorage.clearExpiredItems(userId);
      if (clearedCount > 0) {
        console.log(`Cleared ${clearedCount} expired items for user ${userId}`);
      }
    } catch (error) {
      console.error('Error managing content storage:', error);
      throw new Error(`CONTENT_CYCLING_ERROR - ${error.message}`);
    }
  }
  
  /**
   * Cycle content to free up storage space
   * @param userId User identifier
   */
  private async cycleContent(userId: string): Promise<void> {
    try {
      // Get all content items
      const contentItems = await this.getAllContentItems(userId);
      
      // Sort by priority (learning path position, last access time, etc.)
      const sortedItems = this.sortContentByPriority(contentItems);
      
      // Calculate current content size
      let currentSize = sortedItems.reduce((total, item) => total + this.estimateItemSize(item), 0);
      const targetSize = this.MAX_CONTENT_SIZE_BYTES * this.TARGET_USAGE_PERCENTAGE;
      
      // Remove lowest priority items until we're under the target size
      const itemsToRemove: StorageItem[] = [];
      while (currentSize > targetSize && sortedItems.length > 0) {
        const itemToRemove = sortedItems.pop();
        if (itemToRemove && !this.isCriticalContent(itemToRemove)) {
          itemsToRemove.push(itemToRemove);
          currentSize -= this.estimateItemSize(itemToRemove);
        } else {
          break; // Don't remove critical content
        }
      }
      
      // Remove selected items
      for (const item of itemsToRemove) {
        try {
          await this.offlineStorage.removeItem(userId, item.key);
        } catch (error) {
          console.error(`Failed to remove item ${item.key}:`, error);
        }
      }
      
      if (itemsToRemove.length > 0) {
        console.log(`Cycled ${itemsToRemove.length} content items for user ${userId}`);
      }
    } catch (error) {
      console.error('Error cycling content:', error);
      throw new Error(`CONTENT_CYCLING_ERROR - ${error.message}`);
    }
  }
  
  /**
   * Get all content items for a user
   * @param userId User identifier
   * @returns Array of content items
   */
  private async getAllContentItems(userId: string): Promise<StorageItem[]> {
    try {
      // Get all synced items (prioritize keeping these)
      const syncedItems = await this.offlineStorage.getItemsBySyncStatus(userId, 'synced');
      const pendingItems = await this.offlineStorage.getItemsBySyncStatus(userId, 'pending');
      
      // Filter for content items only
      const allItems = [...syncedItems, ...pendingItems];
      return allItems.filter(item => item.key.startsWith('content:'));
    } catch (error) {
      console.error('Error getting content items:', error);
      return [];
    }
  }
  
  /**
   * Sort content by priority for cycling decisions
   * @param items Content items to sort
   * @returns Sorted items (highest priority first)
   */
  private sortContentByPriority(items: StorageItem[]): StorageItem[] {
    return [...items].sort((a, b) => {
      // Priority sorting logic:
      // 1. Critical content stays (handled separately)
      // 2. Recently accessed content has higher priority
      // 3. Content with 'synced' status has higher priority than 'pending'
      // 4. Smaller content has higher priority (easier to keep)
      
      const aMetadata = this.extractContentMetadata(a);
      const bMetadata = this.extractContentMetadata(b);
      
      // Recently accessed content gets priority
      const aLastAccessed = new Date(aMetadata.lastAccessed || a.timestamp).getTime();
      const bLastAccessed = new Date(bMetadata.lastAccessed || b.timestamp).getTime();
      
      if (Math.abs(aLastAccessed - bLastAccessed) > 24 * 60 * 60 * 1000) { // 24 hours difference
        return bLastAccessed - aLastAccessed; // More recent first
      }
      
      // Sync status priority
      if (a.syncStatus !== b.syncStatus) {
        if (a.syncStatus === 'synced') return -1;
        if (b.syncStatus === 'synced') return 1;
      }
      
      // Size priority (smaller items first)
      const aSize = this.estimateItemSize(a);
      const bSize = this.estimateItemSize(b);
      return aSize - bSize;
    });
  }
  
  /**
   * Extract content metadata from a storage item
   * @param item Storage item
   * @returns Content metadata
   */
  private extractContentMetadata(item: StorageItem): ContentMetadata {
    // Try to extract metadata from the item value
    const metadata: ContentMetadata = {
      contentType: 'unknown',
      priority: ContentPriority.MEDIUM,
      lastAccessed: item.timestamp,
      size: this.estimateItemSize(item)
    };
    
    try {
      // Extract content type from key
      const keyParts = item.key.split(':');
      if (keyParts.length > 1) {
        metadata.contentType = keyParts[1].split('/')[0] || 'unknown';
      }
      
      // Extract metadata from value if it exists
      if (item.value && typeof item.value === 'object') {
        if (item.value.metadata) {
          Object.assign(metadata, item.value.metadata);
        }
        
        // Infer priority from content type
        if (metadata.contentType === 'lesson' || metadata.contentType === 'exercise') {
          metadata.priority = ContentPriority.HIGH;
        } else if (metadata.contentType === 'quiz' || metadata.contentType === 'assessment') {
          metadata.priority = ContentPriority.MEDIUM;
        } else {
          metadata.priority = ContentPriority.LOW;
        }
      }
    } catch (error) {
      console.warn('Error extracting content metadata:', error);
    }
    
    return metadata;
  }
  
  /**
   * Check if content is critical and should not be removed
   * @param item Storage item
   * @returns Whether the content is critical
   */
  private isCriticalContent(item: StorageItem): boolean {
    try {
      const metadata = this.extractContentMetadata(item);
      
      // Content is critical if:
      // 1. Explicitly marked as critical
      // 2. Is current lesson/exercise content
      // 3. Is recently accessed (within last hour)
      
      if (metadata.critical) {
        return true;
      }
      
      const lastAccessed = new Date(metadata.lastAccessed).getTime();
      const hourAgo = Date.now() - (60 * 60 * 1000);
      
      if (lastAccessed > hourAgo && metadata.priority === ContentPriority.HIGH) {
        return true;
      }
      
      return false;
    } catch (error) {
      // If we can't determine criticality, err on the side of caution
      return true;
    }
  }
  
  /**
   * Estimate the size of a storage item in bytes
   * @param item Storage item
   * @returns Estimated size in bytes
   */
  private estimateItemSize(item: StorageItem): number {
    try {
      // More accurate size estimation
      let size = 0;
      
      // Key size
      size += item.key.length * 2;
      
      // Timestamp size
      size += item.timestamp.length * 2;
      
      // Sync status size
      size += item.syncStatus.length * 2;
      
      // Expiration date size
      if (item.expirationDate) {
        size += item.expirationDate.length * 2;
      }
      
      // Value size (most significant)
      if (item.value !== null && item.value !== undefined) {
        if (typeof item.value === 'string') {
          size += item.value.length * 2;
        } else if (typeof item.value === 'number') {
          size += 8;
        } else if (typeof item.value === 'boolean') {
          size += 4;
        } else if (item.value instanceof ArrayBuffer) {
          size += item.value.byteLength;
        } else if (ArrayBuffer.isView(item.value)) {
          size += item.value.byteLength;
        } else {
          // For objects, use JSON string length as approximation
          size += JSON.stringify(item.value).length * 2;
        }
      }
      
      // Add overhead for object structure
      size += 100;
      
      return size;
    } catch (error) {
      // Fallback estimation
      return 1000; // Default 1KB if calculation fails
    }
  }
  
  /**
   * Prefetch content for offline use
   * @param userId User identifier
   * @param contentKeys Array of content keys to prefetch
   * @param priority Priority level for the content
   */
  async prefetchContent(
    userId: string, 
    contentKeys: string[], 
    priority: ContentPriority = ContentPriority.MEDIUM
  ): Promise<void> {
    try {
      // Ensure we have storage space
      await this.manageContentStorage(userId);
      
      for (const key of contentKeys) {
        try {
          // Check if content already exists
          const existingItem = await this.offlineStorage.getItem(userId, key);
          if (existingItem) {
            // Update metadata to refresh priority
            const metadata = this.extractContentMetadata(existingItem);
            metadata.priority = priority;
            metadata.lastAccessed = new Date().toISOString();
            
            // Update the item with new metadata
            const updatedValue = {
              ...existingItem.value,
              metadata
            };
            
            await this.offlineStorage.setItem(userId, key, updatedValue, {
              syncStatus: existingItem.syncStatus,
              expirationDate: existingItem.expirationDate
            });
          } else {
            // TODO: Implement content fetching from server
            console.log(`Would prefetch content: ${key} with priority: ${priority}`);
          }
        } catch (error) {
          console.error(`Failed to prefetch content ${key}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in prefetch content:', error);
      throw new Error(`PREFETCH_ERROR - ${error.message}`);
    }
  }
  
  /**
   * Calculate expiration date based on content type and priority
   * @param contentType Type of content
   * @param priority Priority level
   * @returns ISO date string for expiration
   */
  calculateExpirationDate(contentType: string, priority: ContentPriority): string {
    const now = new Date();
    let expiryTime = now.getTime();
    
    // Base expiration times by content type
    switch (contentType) {
      case 'lesson':
      case 'exercise':
        expiryTime += 2 * 24 * 60 * 60 * 1000; // 2 days
        break;
      case 'quiz':
      case 'assessment':
        expiryTime += 7 * 24 * 60 * 60 * 1000; // 7 days
        break;
      default:
        expiryTime += 24 * 60 * 60 * 1000; // 1 day
    }
    
    // Adjust based on priority
    switch (priority) {
      case ContentPriority.HIGH:
        expiryTime += 24 * 60 * 60 * 1000; // +1 day
        break;
      case ContentPriority.LOW:
        expiryTime -= 12 * 60 * 60 * 1000; // -12 hours
        break;
      // MEDIUM priority uses base time
    }
    
    return new Date(expiryTime).toISOString();
  }
}

/**
 * Utility functions for OfflineStorage
 */
export class StorageUtils {
  /**
   * Validate storage key format
   * @param key Storage key to validate
   * @returns Whether the key is valid
   */
  static validateKey(key: string): boolean {
    if (!key || typeof key !== 'string') {
      return false;
    }
    
    // Key should be non-empty and not contain invalid characters
    const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (invalidChars.test(key)) {
      return false;
    }
    
    // Key should not be too long
    if (key.length > 250) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Validate user ID format
   * @param userId User ID to validate
   * @returns Whether the user ID is valid
   */
  static validateUserId(userId: string): boolean {
    if (!userId || typeof userId !== 'string') {
      return false;
    }
    
    // User ID should be non-empty and alphanumeric with hyphens/underscores
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    if (!validPattern.test(userId)) {
      return false;
    }
    
    // User ID should be reasonable length
    if (userId.length < 1 || userId.length > 50) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Validate sync status
   * @param syncStatus Sync status to validate
   * @returns Whether the sync status is valid
   */
  static validateSyncStatus(syncStatus: string): boolean {
    const validStatuses = ['synced', 'pending', 'conflict'];
    return validStatuses.includes(syncStatus);
  }
  
  /**
   * Check if IndexedDB is supported
   * @returns Whether IndexedDB is supported
   */
  static isIndexedDBSupported(): boolean {
    return typeof window !== 'undefined' && 
           typeof window.indexedDB !== 'undefined' &&
           window.indexedDB !== null;
  }
  
  /**
   * Check if Web Crypto API is supported
   * @returns Whether Web Crypto API is supported
   */
  static isWebCryptoSupported(): boolean {
    return typeof window !== 'undefined' && 
           typeof window.crypto !== 'undefined' &&
           typeof window.crypto.subtle !== 'undefined';
  }
  
  /**
   * Generate a storage key with proper formatting
   * @param category Storage category
   * @param identifier Item identifier
   * @param subcategory Optional subcategory
   * @returns Formatted storage key
   */
  static generateKey(category: string, identifier: string, subcategory?: string): string {
    let key = `${category}:${identifier}`;
    if (subcategory) {
      key += `/${subcategory}`;
    }
    return key;
  }
  
  /**
   * Parse a storage key into its components
   * @param key Storage key to parse
   * @returns Parsed key components
   */
  static parseKey(key: string): { category: string; identifier: string; subcategory?: string } {
    const parts = key.split(':');
    if (parts.length < 2) {
      throw new Error('Invalid key format');
    }
    
    const category = parts[0];
    const rest = parts[1];
    const slashIndex = rest.indexOf('/');
    
    if (slashIndex === -1) {
      return { category, identifier: rest };
    } else {
      return {
        category,
        identifier: rest.substring(0, slashIndex),
        subcategory: rest.substring(slashIndex + 1)
      };
    }
  }
  
  /**
   * Format storage size for display
   * @param bytes Size in bytes
   * @returns Formatted size string
   */
  static formatStorageSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  }
}

// Export utility functions for backwards compatibility
export const encryptData = async (data: any): Promise<{ encryptedData: ArrayBuffer; iv: Uint8Array }> => {
  const encryptionService = new EncryptionService();
  return encryptionService.encrypt(data);
};

export const decryptData = async (encryptedData: ArrayBuffer, iv: Uint8Array): Promise<any> => {
  const encryptionService = new EncryptionService();
  return encryptionService.decrypt(encryptedData, iv);
};

export const calculateStorageRequirements = (data: any): number => {
  try {
    if (typeof data === 'string') {
      return data.length * 2;
    } else if (typeof data === 'number') {
      return 8;
    } else if (typeof data === 'boolean') {
      return 4;
    } else if (data instanceof ArrayBuffer) {
      return data.byteLength;
    } else if (ArrayBuffer.isView(data)) {
      return data.byteLength;
    } else {
      return JSON.stringify(data).length * 2;
    }
  } catch (error) {
    return 1000; // Default 1KB if calculation fails
  }
};

export const performContentCycling = async (userId: string, offlineStorage: any): Promise<void> => {
  const cyclingManager = new ContentCyclingManager(offlineStorage);
  return cyclingManager.manageContentStorage(userId);
};