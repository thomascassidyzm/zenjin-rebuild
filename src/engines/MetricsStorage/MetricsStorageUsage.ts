/**
 * Usage example for the MetricsStorage component
 */

import { 
  MetricsStorage, 
  MetricsStorageManager, 
  SessionMetrics, 
  LifetimeMetrics 
} from './metrics-storage-index';

// Example demonstrating the primary use cases of the MetricsStorage component
async function metricsStorageExample() {
  console.log('Starting MetricsStorage example...');
  
  // Create metrics storage with custom options
  const metricsStorage = new MetricsStorage({
    enableCache: true,
    cacheExpiration: 300000, // 5 minutes
    enableCompression: false, // Disabled for demo simplicity
    autoSync: true
  });
  
  // Create sample session metrics
  const sessionMetrics: SessionMetrics = {
    sessionId: "session123",
    userId: "user123",
    duration: 240000,
    questionCount: 20,
    ftcCount: 16,
    ecCount: 3,
    incorrectCount: 1,
    ftcPoints: 80,
    ecPoints: 9,
    basePoints: 89,
    consistency: 0.85,
    accuracy: 0.95,
    speed: 0.78,
    bonusMultiplier: 1.25,
    blinkSpeed: 15000,
    totalPoints: 111.25,
    startTime: "2025-05-20T10:10:00Z",
    endTime: "2025-05-20T10:14:00Z"
  };
  
  try {
    // Save session metrics
    console.log('Saving session metrics...');
    const sessionSaved = await metricsStorage.saveSessionMetrics("session123", sessionMetrics);
    console.log(`Session metrics saved: ${sessionSaved}`);
    
    // Get session history
    console.log('Retrieving session history...');
    const sessionHistory = await metricsStorage.getSessionHistory("user123", 5);
    console.log(`Retrieved ${sessionHistory.length} session history entries`);
    
    sessionHistory.forEach((session, index) => {
      console.log(`Session ${index + 1}: ${session.sessionId}`);
      console.log(`  Total Points: ${session.totalPoints}`);
      console.log(`  End Time: ${session.endTime}`);
      console.log(`  Duration: ${session.duration / 1000} seconds`);
      console.log(`  Questions: ${session.questionCount}`);
    });
    
    // Create sample lifetime metrics
    const lifetimeMetrics: LifetimeMetrics = {
      userId: "user123",
      totalSessions: 43,
      totalPoints: 4361.25,
      currentBlinkSpeed: 13750,
      evolution: 0.317,
      firstSessionDate: "2025-01-15T10:00:00Z",
      lastSessionDate: "2025-05-20T10:14:00Z",
      streakDays: 6,
      longestStreakDays: 14
    };
    
    // Save lifetime metrics
    console.log('Saving lifetime metrics...');
    const lifetimeSaved = await metricsStorage.saveLifetimeMetrics("user123", lifetimeMetrics);
    console.log(`Lifetime metrics saved: ${lifetimeSaved}`);
    
    // Force synchronization
    console.log('Forcing synchronization...');
    const syncResult = await metricsStorage.forceSync();
    console.log(`Synchronization result: ${syncResult}`);
    
    // Get storage status
    console.log('Getting storage status...');
    const storageStatus = await metricsStorage.getStorageStatus();
    console.log('Storage status:');
    console.log(`  Session count: ${storageStatus.sessionCount}`);
    console.log(`  User count: ${storageStatus.userCount}`);
    console.log(`  Sync queue length: ${storageStatus.syncQueueLength}`);
    console.log(`  Cache size: ${storageStatus.cacheSize}`);
    console.log(`  Network status: ${storageStatus.networkStatus ? 'Online' : 'Offline'}`);
    
  } catch (error) {
    console.error('Error in MetricsStorage example:', error);
  }
  
  console.log('MetricsStorage example completed');
}

// Example demonstrating the usage of MetricsStorageManager
async function metricsStorageManagerExample() {
  console.log('Starting MetricsStorageManager example...');
  
  // Create metrics storage manager
  const metricsManager = new MetricsStorageManager();
  
  // Create sample session metrics
  const sessionMetrics: SessionMetrics = {
    sessionId: "session124",
    userId: "user123",
    duration: 180000,
    questionCount: 15,
    ftcCount: 12,
    ecCount: 2,
    incorrectCount: 1,
    ftcPoints: 60,
    ecPoints: 6,
    basePoints: 66,
    consistency: 0.8,
    accuracy: 0.93,
    speed: 0.75,
    bonusMultiplier: 1.2,
    blinkSpeed: 15000,
    totalPoints: 79.2,
    startTime: "2025-05-21T10:10:00Z",
    endTime: "2025-05-21T10:13:00Z"
  };
  
  try {
    // Save session and update lifetime metrics in one operation
    console.log('Saving session and updating lifetime metrics...');
    const saved = await metricsManager.saveSessionAndUpdateLifetime(sessionMetrics);
    console.log(`Session saved and lifetime updated: ${saved}`);
    
    // Get recent sessions
    console.log('Getting recent sessions...');
    const recentSessions = await metricsManager.getRecentSessions("user123", 3);
    console.log(`Retrieved ${recentSessions.length} recent sessions`);
    
    // Calculate session trends
    console.log('Calculating session trends...');
    const trends = await metricsManager.calculateSessionTrends("user123", 5);
    console.log('Session trends:');
    console.log(`  Points trend: ${(trends.pointsTrend * 100).toFixed(2)}%`);
    console.log(`  Average points: ${trends.averagePoints.toFixed(2)}`);
    
    // Check if user has lifetime metrics
    console.log('Checking if user has lifetime metrics...');
    const hasLifetimeMetrics = await metricsManager.hasLifetimeMetrics("user123");
    console.log(`User has lifetime metrics: ${hasLifetimeMetrics}`);
    
    // Get lifetime metrics
    if (hasLifetimeMetrics) {
      console.log('Getting lifetime metrics...');
      const lifetimeMetrics = await metricsManager.getLifetimeMetrics("user123");
      if (lifetimeMetrics) {
        console.log('Lifetime metrics:');
        console.log(`  Total sessions: ${lifetimeMetrics.totalSessions}`);
        console.log(`  Total points: ${lifetimeMetrics.totalPoints}`);
        console.log(`  Current blink speed: ${lifetimeMetrics.currentBlinkSpeed}`);
        console.log(`  Evolution: ${lifetimeMetrics.evolution}`);
        console.log(`  Streak days: ${lifetimeMetrics.streakDays}`);
      }
    }
    
    // Synchronize data
    console.log('Synchronizing data...');
    const syncResult = await metricsManager.synchronizeData();
    console.log(`Synchronization result: ${syncResult}`);
    
    // Get storage status
    console.log('Getting storage status...');
    const storageStatus = await metricsManager.getStorageStatus();
    console.log('Storage status:');
    console.log(`  Session count: ${storageStatus.sessionCount}`);
    console.log(`  User count: ${storageStatus.userCount}`);
    console.log(`  Sync queue length: ${storageStatus.syncQueueLength}`);
    console.log(`  Cache size: ${storageStatus.cacheSize}`);
    console.log(`  Network status: ${storageStatus.networkStatus ? 'Online' : 'Offline'}`);
    
  } catch (error) {
    console.error('Error in MetricsStorageManager example:', error);
  }
  
  console.log('MetricsStorageManager example completed');
}

// Run the examples
async function runExamples() {
  await metricsStorageExample();
  console.log('\n-----------------------------------\n');
  await metricsStorageManagerExample();
}

// Start the examples when the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runExamples);
} else {
  runExamples();
}