/**
 * ConnectivityManagerExample.ts
 * 
 * Example usage of the ConnectivityManager component
 */

import { ConnectivityManager } from './ConnectivityManager';
import { CONNECTIVITY_EVENT_TYPES } from './ConnectivityManagerTypes';

/**
 * Example usage of ConnectivityManager
 */
export function demonstrateConnectivityManager(): void {
  console.log('=== ConnectivityManager Example ===');

  // Create connectivity manager instance
  const connectivityManager = new ConnectivityManager();

  // Check initial status
  const initialStatus = connectivityManager.getConnectionStatus();
  console.log('Initial connection status:', {
    isOnline: initialStatus.isOnline,
    connectionType: initialStatus.connectionType,
    effectiveType: initialStatus.effectiveType,
    downlink: initialStatus.downlink,
    rtt: initialStatus.rtt
  });

  // Simple online check
  console.log('Is online:', connectivityManager.isOnline());

  // Add event listeners
  const onlineListenerId = connectivityManager.addEventListener(
    CONNECTIVITY_EVENT_TYPES.ONLINE,
    (event) => {
      console.log('🟢 Connection restored!', {
        connectionType: event.status.connectionType,
        effectiveType: event.status.effectiveType,
        timestamp: event.timestamp
      });
    }
  );

  const offlineListenerId = connectivityManager.addEventListener(
    CONNECTIVITY_EVENT_TYPES.OFFLINE,
    (event) => {
      console.log('🔴 Connection lost!', {
        previousType: event.previousStatus?.connectionType,
        timestamp: event.timestamp
      });
    }
  );

  const changeListenerId = connectivityManager.addEventListener(
    CONNECTIVITY_EVENT_TYPES.CHANGE,
    (event) => {
      console.log('📡 Connection changed:', {
        type: event.type,
        from: event.previousStatus?.connectionType,
        to: event.status.connectionType,
        timestamp: event.timestamp
      });
    }
  );

  // Measure network quality if online
  if (connectivityManager.isOnline()) {
    connectivityManager.measureNetworkQuality()
      .then(metrics => {
        console.log('📊 Network quality metrics:', {
          latency: `${metrics.latency.toFixed(2)}ms`,
          bandwidth: `${metrics.bandwidth.toFixed(2)}Mbps`,
          reliability: `${(metrics.reliability * 100).toFixed(1)}%`,
          measuredAt: metrics.measuredAt
        });
      })
      .catch(error => {
        console.error('Failed to measure network quality:', error.message);
      });
  }

  // Start monitoring with 3-second intervals
  try {
    connectivityManager.startMonitoring(3000);
    console.log('✅ Started connectivity monitoring (3s intervals)');
  } catch (error) {
    console.error('Failed to start monitoring:', error);
  }

  // Simulate cleanup after 30 seconds
  setTimeout(() => {
    console.log('\n=== Cleaning up ConnectivityManager ===');
    
    // Remove event listeners
    connectivityManager.removeEventListener(onlineListenerId);
    connectivityManager.removeEventListener(offlineListenerId);
    connectivityManager.removeEventListener(changeListenerId);
    console.log('✅ Removed event listeners');

    // Stop monitoring
    try {
      connectivityManager.stopMonitoring();
      console.log('✅ Stopped connectivity monitoring');
    } catch (error) {
      console.error('Failed to stop monitoring:', error);
    }

    // Final status check
    const finalStatus = connectivityManager.getConnectionStatus();
    console.log('Final connection status:', {
      isOnline: finalStatus.isOnline,
      connectionType: finalStatus.connectionType
    });

    console.log('=== ConnectivityManager Example Complete ===');
  }, 30000);
}

/**
 * Example: Basic connectivity checking
 */
export function basicConnectivityCheck(): void {
  console.log('=== Basic Connectivity Check ===');

  const connectivityManager = new ConnectivityManager();

  // Simple status check
  const status = connectivityManager.getConnectionStatus();
  console.log(`Connection Status: ${status.isOnline ? 'Online' : 'Offline'}`);
  console.log(`Connection Type: ${status.connectionType}`);
  
  if (status.effectiveType) {
    console.log(`Effective Type: ${status.effectiveType}`);
  }
  
  if (status.downlink) {
    console.log(`Downlink Speed: ${status.downlink}Mbps`);
  }
}

/**
 * Example: Event-driven connectivity handling
 */
export function eventDrivenConnectivityHandling(): void {
  console.log('=== Event-Driven Connectivity Handling ===');

  const connectivityManager = new ConnectivityManager();

  // Set up offline handling
  connectivityManager.addEventListener(CONNECTIVITY_EVENT_TYPES.OFFLINE, (event) => {
    console.log('📱 Switching to offline mode...');
    // In a real app, you would:
    // - Save any pending data locally
    // - Show offline indicator to user
    // - Switch to cached content
    // - Queue operations for later sync
  });

  // Set up online handling
  connectivityManager.addEventListener(CONNECTIVITY_EVENT_TYPES.ONLINE, (event) => {
    console.log('🌐 Back online! Resuming normal operations...');
    // In a real app, you would:
    // - Sync any pending data
    // - Resume normal API calls
    // - Hide offline indicator
    // - Update content from server
  });

  // Start monitoring
  connectivityManager.startMonitoring(5000);
  console.log('Monitoring connectivity for changes...');
}

// Run examples if this file is executed directly
if (require.main === module) {
  basicConnectivityCheck();
  setTimeout(() => eventDrivenConnectivityHandling(), 2000);
  setTimeout(() => demonstrateConnectivityManager(), 4000);
}