/**
 * OfflineStorageExample.ts
 * 
 * This file demonstrates how to use the OfflineStorage component
 * for persistent client-side storage with encryption and content cycling.
 */

import OfflineStorage from './OfflineStorage';
import { StorageEventType, StorageOptions } from './OfflineStorageTypes';
import { createOfflineStorage } from './index';

/**
 * Basic usage example
 */
async function basicUsageExample() {
  // Initialize with default options
  const storage = new OfflineStorage();
  await storage.initialize();
  
  // Store an item
  await storage.setItem('user_preferences', {
    theme: 'dark',
    fontSize: 16,
    notifications: true
  });
  
  // Retrieve the item
  const preferences = await storage.getItem<{
    theme: string;
    fontSize: number;
    notifications: boolean;
  }>('user_preferences');
  
  console.log('User preferences:', preferences);
  
  // Check if an item exists
  const hasItem = await storage.hasItem('user_preferences');
  console.log('Has user preferences:', hasItem);
  
  // Remove an item
  await storage.removeItem('user_preferences');
  
  // Get all keys
  const allKeys = await storage.getAllKeys();
  console.log('All keys:', allKeys);
  
  // Get storage statistics
  const stats = await storage.getStats();
  console.log('Storage stats:', stats);
}

/**
 * Advanced usage with custom options
 */
async function advancedUsageExample() {
  // Configure storage with custom options
  const options: StorageOptions = {
    dbName: 'zenjin_app_storage',
    dbVersion: 1,
    maxStorageSize: 100 * 1024 * 1024, // 100MB
    cyclingThreshold: 0.8, // Start cycling at 80% capacity
    encryptionEnabled: true
  };
  
  // Using the factory function
  const storage = createOfflineStorage(options);
  await storage.initialize();
  
  // Store items with time-to-live (TTL)
  await storage.setItem('session_data', {
    sessionId: 'abc123',
    startTime: new Date().toISOString(),
    activities: []
  }, {
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    priority: 2, // Higher priority items are less likely to be cycled out
    metadata: {
      type: 'session',
      userId: 'user123'
    }
  });
  
  // Store items without encryption
  await storage.setItem('public_content', {
    title: 'Welcome to Zenjin',
    content: 'This is public content that does not need encryption'
  }, {
    secure: false,
    priority: 1
  });
  
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
    console.log(`Storage maintenance performed: removed ${event.data.itemsRemoved} items, reclaimed ${event.data.spaceReclaimed} bytes`);
  });
}

/**
 * Example of using OfflineStorage for caching learning content
 */
async function contentCachingExample() {
  const storage = new OfflineStorage({
    dbName: 'zenjin_content_cache',
    maxStorageSize: 200 * 1024 * 1024 // 200MB
  });
  
  await storage.initialize();
  
  // Store a lesson with assets
  const lessonId = 'lesson_123';
  const lesson = {
    id: lessonId,
    title: 'Introduction to Algebra',
    content: 'Algebra is the study of mathematical symbols and the rules for manipulating these symbols...',
    exercises: [
      { id: 'ex1', question: 'Solve for x: 2x + 3 = 7', answer: 2 },
      { id: 'ex2', question: 'Solve for y: 3y - 5 = 10', answer: 5 }
    ],
    images: [
      { id: 'img1', url: 'https://example.com/algebra_intro.jpg', dataUrl: 'data:image/jpeg;base64,/9j/4AAQSkZ...' }
    ],
    videos: [
      { id: 'vid1', url: 'https://example.com/algebra_video.mp4', downloaded: true, localPath: 'algebra_video.mp4' }
    ],
    lastUpdated: new Date().toISOString()
  };
  
  // Store with high priority and metadata
  await storage.setItem(lessonId, lesson, {
    priority: 3,
    metadata: {
      type: 'lesson',
      subject: 'math',
      level: 'beginner',
      lastAccessed: new Date().toISOString(),
      downloadDate: new Date().toISOString()
    }
  });
  
  // Retrieve the lesson
  const cachedLesson = await storage.getItem(lessonId);
  console.log('Cached lesson:', cachedLesson);
  
  // Update access tracking
  if (cachedLesson) {
    // In a real app, we would update the metadata to track usage
    const updatedLesson = {
      ...cachedLesson,
      metadata: {
        ...cachedLesson.metadata,
        lastAccessed: new Date().toISOString(),
        accessCount: (cachedLesson.metadata?.accessCount || 0) + 1
      }
    };
    
    await storage.setItem(lessonId, updatedLesson);
  }
}

// For direct execution of examples
export async function runExamples() {
  console.log('Running OfflineStorage basic usage example:');
  await basicUsageExample();
  
  console.log('\nRunning OfflineStorage advanced usage example:');
  await advancedUsageExample();
  
  console.log('\nRunning OfflineStorage content caching example:');
  await contentCachingExample();
}

// Only run if this file is executed directly
if (require.main === module) {
  runExamples().catch(console.error);
}