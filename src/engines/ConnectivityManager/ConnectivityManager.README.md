# ConnectivityManager

## Overview

The ConnectivityManager component provides network connectivity detection and monitoring functionality for the Zenjin Maths App. It enables the application to detect online/offline status changes, measure network quality, and provide real-time connectivity updates through an event-driven architecture.

## Purpose

As part of the OfflineSupport module, the ConnectivityManager serves as the foundation for:
- **Offline Detection**: Immediate detection of network connectivity changes
- **Sync Coordination**: Informing the SynchronizationManager when sync operations are possible
- **User Experience**: Providing connectivity feedback to users
- **Performance Optimization**: Adapting behavior based on network quality

## Key Features

### ✅ Real-time Connectivity Detection
- Immediate detection of online/offline status changes
- Native browser event integration for instant updates
- Cross-browser compatibility using multiple detection methods

### ✅ Network Quality Measurement
- Latency measurement through test requests
- Bandwidth detection via Network Information API
- Connection reliability scoring
- Support for different connection types (WiFi, cellular, ethernet)

### ✅ Event-Driven Architecture
- Customizable event listeners for connectivity changes
- Support for multiple event types (online, offline, change)
- Automatic cleanup and memory management

### ✅ Continuous Monitoring
- Configurable monitoring intervals
- Automatic status checking with change detection
- Resource-efficient polling with meaningful change detection

## Implementation Status

- **Status**: 🟠 functional (newly implemented)
- **Module**: OfflineSupport
- **Priority**: High (critical missing interface)
- **Dependencies**: None (standalone component)

## Core Interface

```typescript
interface ConnectivityManagerInterface {
  // Status checking
  getConnectionStatus(): ConnectionStatus;
  isOnline(): boolean;
  
  // Event handling
  addEventListener(eventType: string, callback: ConnectivityEventCallback): string;
  removeEventListener(listenerId: string): boolean;
  
  // Network quality
  measureNetworkQuality(): Promise<NetworkQualityMetrics>;
  
  // Monitoring
  startMonitoring(interval?: number): boolean;
  stopMonitoring(): boolean;
}
```

## Data Structures

### ConnectionStatus
```typescript
interface ConnectionStatus {
  isOnline: boolean;                    // Current online status
  connectionType: string;               // 'wifi', 'cellular', 'ethernet', 'unknown'
  effectiveType?: string;               // 'slow-2g', '2g', '3g', '4g'
  downlink?: number;                    // Speed in Mbps
  rtt?: number;                         // Round-trip time in ms
  lastChecked: string;                  // ISO timestamp
}
```

### NetworkQualityMetrics
```typescript
interface NetworkQualityMetrics {
  latency: number;                      // Network latency in ms
  bandwidth: number;                    // Available bandwidth in Mbps
  packetLoss: number;                   // Packet loss percentage (0-100)
  reliability: number;                  // Connection reliability score (0-1)
  measuredAt: string;                   // ISO timestamp
}
```

## Usage Examples

### Basic Connectivity Checking
```typescript
import { ConnectivityManager } from './ConnectivityManager';

const connectivityManager = new ConnectivityManager();

// Check current status
const status = connectivityManager.getConnectionStatus();
console.log(`Online: ${status.isOnline}`);
console.log(`Connection: ${status.connectionType}`);

// Simple online check
if (connectivityManager.isOnline()) {
  // Proceed with online operations
}
```

### Event-Driven Connectivity Handling
```typescript
// Handle going offline
const offlineListener = connectivityManager.addEventListener('offline', (event) => {
  console.log('Connection lost! Switching to offline mode...');
  // Save pending data, show offline indicator, etc.
});

// Handle coming back online
const onlineListener = connectivityManager.addEventListener('online', (event) => {
  console.log('Connection restored! Syncing data...');
  // Resume sync operations, hide offline indicator, etc.
});

// Start monitoring
connectivityManager.startMonitoring(5000); // Check every 5 seconds
```

### Network Quality Measurement
```typescript
if (connectivityManager.isOnline()) {
  const metrics = await connectivityManager.measureNetworkQuality();
  console.log(`Latency: ${metrics.latency}ms`);
  console.log(`Bandwidth: ${metrics.bandwidth}Mbps`);
  console.log(`Reliability: ${metrics.reliability * 100}%`);
  
  // Adapt behavior based on quality
  if (metrics.reliability < 0.5) {
    console.log('Poor connection - reducing sync frequency');
  }
}
```

## Integration with Other Components

### SynchronizationManager Integration
```typescript
// The SynchronizationManager uses ConnectivityManager for sync decisions
class SynchronizationManager {
  constructor(private connectivityManager: ConnectivityManager) {
    // Listen for connectivity changes
    this.connectivityManager.addEventListener('online', () => {
      this.resumeSync();
    });
    
    this.connectivityManager.addEventListener('offline', () => {
      this.pauseSync();
    });
  }
  
  async synchronize(userId: string): Promise<SyncResult> {
    // Check connectivity before sync
    if (!this.connectivityManager.isOnline()) {
      throw new Error('Cannot sync while offline');
    }
    
    // Proceed with synchronization...
  }
}
```

### UI Component Integration
```typescript
// React component using ConnectivityManager
function ConnectivityIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState('unknown');
  
  useEffect(() => {
    const connectivityManager = new ConnectivityManager();
    
    // Set initial status
    const status = connectivityManager.getConnectionStatus();
    setIsOnline(status.isOnline);
    setConnectionType(status.connectionType);
    
    // Listen for changes
    const listener = connectivityManager.addEventListener('change', (event) => {
      setIsOnline(event.status.isOnline);
      setConnectionType(event.status.connectionType);
    });
    
    connectivityManager.startMonitoring();
    
    return () => {
      connectivityManager.removeEventListener(listener);
      connectivityManager.stopMonitoring();
    };
  }, []);
  
  return (
    <div className={`connectivity-indicator ${isOnline ? 'online' : 'offline'}`}>
      {isOnline ? `📶 ${connectionType}` : '📵 Offline'}
    </div>
  );
}
```

## Browser Compatibility

### Network Information API Support
- **Chrome/Edge**: Full support for connection type, effective type, downlink, RTT
- **Firefox**: Partial support (basic connection detection)
- **Safari**: Limited support (online/offline events only)
- **Fallback**: Graceful degradation to basic online/offline detection

### Event Support
- **All modern browsers**: Support for online/offline events
- **Progressive enhancement**: Additional metrics where available
- **Polyfill-ready**: Can be extended with custom network detection

## Error Handling

```typescript
try {
  const status = connectivityManager.getConnectionStatus();
} catch (error) {
  if (error instanceof ConnectivityManagerError) {
    console.error(`Connectivity error (${error.code}): ${error.message}`);
  }
}
```

## Performance Considerations

### Efficient Monitoring
- **Smart polling**: Only checks when meaningful changes can occur
- **Event-driven**: Primarily relies on browser events, not continuous polling
- **Minimal overhead**: Lightweight status checks with caching

### Memory Management
- **Automatic cleanup**: Built-in listener management
- **Resource cleanup**: Proper interval clearing and event removal
- **Memory-efficient**: No memory leaks with proper lifecycle management

## Testing Strategy

### Unit Tests
- Connectivity status detection
- Event listener management
- Network quality measurement
- Error handling scenarios

### Integration Tests
- Browser event integration
- Network Information API usage
- Cross-browser compatibility
- Real network condition testing

### Manual Testing
- Physical network disconnection
- Different connection types (WiFi, cellular, ethernet)
- Network quality variations
- Browser compatibility testing

## Known Limitations

1. **Packet Loss**: Cannot directly measure packet loss in browsers
2. **Cellular Data**: Limited detection of cellular vs WiFi on some browsers
3. **VPN Detection**: Cannot detect VPN usage or proxy connections
4. **Enterprise Networks**: May not detect corporate firewall restrictions

## Future Enhancements

### Planned Features
- **Historical tracking**: Connection quality history and trends
- **Predictive quality**: Predict connection issues before they occur
- **Advanced metrics**: More detailed network performance measurements
- **Custom endpoints**: Configurable test endpoints for quality measurement

### Integration Opportunities
- **Analytics**: Connection quality analytics and reporting
- **Performance optimization**: Adaptive behavior based on connection quality
- **User notifications**: Smart connectivity notifications and guidance

## Files

- `ConnectivityManager.ts` - Main implementation
- `ConnectivityManagerTypes.ts` - Type definitions and interfaces
- `ConnectivityManagerExample.ts` - Usage examples and demonstrations
- `index.ts` - Module exports
- `ConnectivityManager.README.md` - This documentation

## Dependencies

- **Native APIs**: Navigator.onLine, Network Information API
- **Browser Events**: online, offline, connection change events
- **Standards**: W3C Network Information API specification

## Related Components

- **SynchronizationManager**: Uses ConnectivityManager for sync decisions
- **OfflineStorage**: Coordinates with connectivity status for caching
- **EngineOrchestrator**: May use connectivity status for operation coordination