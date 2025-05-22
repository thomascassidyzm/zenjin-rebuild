/**
 * SynchronizationExample.ts
 * 
 * This file demonstrates how to use the SynchronizationManager component
 * for handling data synchronization between client and server.
 */

import SynchronizationManager from './SynchronizationManager';
import { 
  SyncMode, 
  SyncDirection, 
  ConflictResolution,
  SyncPriority,
  SyncStatus,
  SyncEventType,
  SyncEvent,
  SyncItem,
  RestApiConfig
} from './SynchronizationTypes';
import { createSynchronizationManager } from './index';

/**
 * Basic usage example
 */
async function basicUsageExample() {
  // Configure the API endpoints
  const apiConfig: RestApiConfig = {
    baseUrl: 'https://api.zenjin.com/v1',
    endpoints: {
      sync: 'sync',
      users: 'users',
      lessons: 'lessons',
      progress: 'progress'
    },
    // Provide a function to get the auth token
    authTokenProvider: async () => {
      // In a real app, this would get the token from secure storage
      return 'example_auth_token';
    }
  };
  
  // Create the synchronization manager
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
    console.log('Sync started:', event.data.message);
  });
  
  syncManager.addEventListener('progress', (event) => {
    console.log(`Sync progress: ${event.data.percentage}%`);
  });
  
  syncManager.addEventListener('complete', (event) => {
    console.log('Sync completed:', event.data.stats);
  });
  
  syncManager.addEventListener('error', (event) => {
    console.error('Sync error:', event.data.message);
  });
  
  // Manually trigger a sync
  const stats = await syncManager.sync();
  console.log('Sync stats:', stats);
  
  // Add an item to the sync queue
  const newLesson: SyncItem = {
    id: '123',
    collectionName: 'lessons',
    data: {
      title: 'Introduction to Algebra',
      content: 'Algebra is the study of mathematical symbols...',
      createdBy: 'user_456'
    },
    lastModified: Date.now(),
    createdAt: Date.now(),
    priority: SyncPriority.HIGH
  };
  
  await syncManager.addToSyncQueue(newLesson, 'create');
  
  // Check sync status
  const status = syncManager.getStatus();
  console.log('Current sync status:', status);
  
  // Check if there are unsynced changes
  const hasChanges = await syncManager.hasUnsyncedChanges();
  console.log('Has unsynced changes:', hasChanges);
  
  // Get network status
  const networkStatus = syncManager.getNetworkStatus();
  console.log('Network status:', networkStatus);
}

/**
 * Example of using SynchronizationManager for offline-first learning app
 */
async function offlineFirstLearningApp() {
  // API configuration
  const apiConfig: RestApiConfig = {
    baseUrl: 'https://api.zenjin.com/v1',
    endpoints: {
      sync: 'sync',
      users: 'users',
      lessons: 'lessons',
      progress: 'progress',
      quizzes: 'quizzes',
      answers: 'answers'
    },
    authTokenProvider: async () => 'user_auth_token',
    timeout: 30000,
    retryConfig: {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000
    }
  };
  
  // Create and initialize synchronization manager
  const syncManager = createSynchronizationManager({
    apiConfig,
    syncOptions: {
      mode: SyncMode.OPPORTUNISTIC,
      direction: SyncDirection.BIDIRECTIONAL,
      conflictResolution: ConflictResolution.NEWEST_WINS,
      allowOfflineChanges: true,
      syncWhenOnline: true,
      autoResolveConflicts: true,
      prioritizeCollections: ['progress', 'answers'],
      compressionEnabled: true
    }
  });
  
  await syncManager.initialize();
  
  // Set up UI indicators for sync status
  syncManager.addEventListener('start', () => {
    updateSyncIndicator('syncing');
  });
  
  syncManager.addEventListener('complete', () => {
    updateSyncIndicator('synced');
  });
  
  syncManager.addEventListener('error', (event) => {
    updateSyncIndicator('error');
    console.error('Sync error:', event.data);
  });
  
  syncManager.addEventListener('offline', () => {
    updateSyncIndicator('offline');
  });
  
  syncManager.addEventListener('online', () => {
    updateSyncIndicator('online');
  });
  
  // Example: Record quiz answers offline
  function saveQuizAnswer(quizId: string, questionId: string, answer: string) {
    const answerItem: SyncItem = {
      id: `${quizId}_${questionId}_${Date.now()}`,
      collectionName: 'answers',
      data: {
        quizId,
        questionId,
        answer,
        timestamp: Date.now()
      },
      lastModified: Date.now(),
      createdAt: Date.now(),
      priority: SyncPriority.HIGH
    };
    
    // Add to sync queue
    syncManager.addToSyncQueue(answerItem, 'create')
      .then(() => {
        console.log('Answer saved and queued for sync');
      })
      .catch(error => {
        console.error('Failed to save answer:', error);
      });
  }
  
  // Example: Track progress in a lesson
  function updateLessonProgress(lessonId: string, percentComplete: number) {
    const progressItem: SyncItem = {
      id: `lesson_progress_${lessonId}`,
      collectionName: 'progress',
      data: {
        lessonId,
        percentComplete,
        lastAccessed: Date.now()
      },
      lastModified: Date.now(),
      createdAt: Date.now(),
      priority: SyncPriority.MEDIUM
    };
    
    // Add to sync queue
    syncManager.addToSyncQueue(progressItem, 'update')
      .then(() => {
        console.log('Progress updated and queued for sync');
      })
      .catch(error => {
        console.error('Failed to update progress:', error);
      });
  }
  
  // Mock function to update UI
  function updateSyncIndicator(status: 'syncing' | 'synced' | 'error' | 'offline' | 'online') {
    console.log(`UI indicator updated to: ${status}`);
  }
  
  // Example usage of the functions
  saveQuizAnswer('quiz_123', 'q1', 'answer_option_b');
  updateLessonProgress('lesson_456', 75);
  
  // Force a manual sync of specific collections
  async function syncUserData() {
    try {
      const stats = await syncManager.sync({
        collections: ['progress', 'answers'],
        direction: SyncDirection.UPLOAD
      });
      
      console.log('User data synced:', stats);
    } catch (error) {
      console.error('Failed to sync user data:', error);
    }
  }
  
  // Call the function
  syncUserData();
}

/**
 * Example of conflict resolution
 */
async function conflictResolutionExample() {
  // Create the synchronization manager
  const syncManager = createSynchronizationManager({
    apiConfig: {
      baseUrl: 'https://api.zenjin.com/v1',
      endpoints: {
        sync: 'sync',
        users: 'users',
        lessons: 'lessons'
      }
    }
  });
  
  await syncManager.initialize();
  
  // Set up conflict handling
  syncManager.addEventListener('conflict', async (event) => {
    const conflict = event.data.conflict;
    
    console.log('Conflict detected:', conflict);
    
    // Example: Show conflict to user and let them choose
    // In a real app, this would show a UI for the user to choose
    const userChoice = await mockUserChoiceDialog(conflict);
    
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
      const mergedData = {
        ...conflict.serverData,
        ...conflict.clientData,
        mergeNote: 'This was manually merged'
      };
      
      await syncManager.resolveConflict(
        conflict,
        ConflictResolution.MANUAL,
        mergedData
      );
    }
    
    console.log('Conflict resolved');
  });
  
  // Mock function to simulate user choice
  async function mockUserChoiceDialog(conflict: any): Promise<'client' | 'server' | 'merge'> {
    console.log('User would be shown:', {
      clientVersion: conflict.clientData,
      serverVersion: conflict.serverData
    });
    
    // Simulate user choosing the client version
    return 'client';
  }
  
  // Trigger a sync that might have conflicts
  await syncManager.sync();
}

// For direct execution of examples
export async function runExamples() {
  console.log('Running SynchronizationManager basic usage example:');
  await basicUsageExample();
  
  console.log('\nRunning SynchronizationManager offline-first learning app example:');
  await offlineFirstLearningApp();
  
  console.log('\nRunning SynchronizationManager conflict resolution example:');
  await conflictResolutionExample();
}

// Only run if this file is executed directly
if (require.main === module) {
  runExamples().catch(console.error);
}