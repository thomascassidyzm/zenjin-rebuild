/**
 * ConnectivityManager.test.ts
 * 
 * Unit tests for the ConnectivityManager component
 */

import { ConnectivityManager } from './ConnectivityManager';
import { 
  ConnectivityManagerError, 
  ConnectivityManagerErrorCode,
  CONNECTIVITY_EVENT_TYPES,
  CONNECTION_TYPES 
} from './ConnectivityManagerTypes';

// Mock browser APIs
const mockNavigator = {
  onLine: true,
  connection: {
    type: 'wifi',
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
    addEventListener: jest.fn()
  }
};

// Mock window object
const mockWindow = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
};

// Mock performance API
const mockPerformance = {
  now: jest.fn(() => Date.now())
};

// Mock fetch API
global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    status: 200
  } as Response)
);

// Setup mocks
beforeAll(() => {
  Object.defineProperty(global, 'navigator', { value: mockNavigator, configurable: true });
  Object.defineProperty(global, 'window', { value: mockWindow, configurable: true });
  Object.defineProperty(global, 'performance', { value: mockPerformance, configurable: true });
});

describe('ConnectivityManager', () => {
  let connectivityManager: ConnectivityManager;

  beforeEach(() => {
    connectivityManager = new ConnectivityManager();
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (connectivityManager) {
      connectivityManager.destroy();
    }
  });

  describe('getConnectionStatus', () => {
    test('should return current connection status', () => {
      const status = connectivityManager.getConnectionStatus();

      expect(status).toBeDefined();
      expect(typeof status.isOnline).toBe('boolean');
      expect(typeof status.connectionType).toBe('string');
      expect(typeof status.lastChecked).toBe('string');
      expect(new Date(status.lastChecked)).toBeInstanceOf(Date);
    });

    test('should include Network Information API data when available', () => {
      const status = connectivityManager.getConnectionStatus();

      expect(status.effectiveType).toBe('4g');
      expect(status.downlink).toBe(10);
      expect(status.rtt).toBe(50);
    });
  });

  describe('isOnline', () => {
    test('should return true when online', () => {
      mockNavigator.onLine = true;
      expect(connectivityManager.isOnline()).toBe(true);
    });

    test('should return false when offline', () => {
      mockNavigator.onLine = false;
      expect(connectivityManager.isOnline()).toBe(false);
      mockNavigator.onLine = true; // Reset for other tests
    });
  });

  describe('addEventListener', () => {
    test('should add event listener and return listener ID', () => {
      const callback = jest.fn();
      const listenerId = connectivityManager.addEventListener(
        CONNECTIVITY_EVENT_TYPES.ONLINE,
        callback
      );

      expect(typeof listenerId).toBe('string');
      expect(listenerId).toMatch(/^listener_\d+_\d+$/);
    });

    test('should throw error for invalid event type', () => {
      const callback = jest.fn();
      
      expect(() => {
        connectivityManager.addEventListener('invalid-event', callback);
      }).toThrow(ConnectivityManagerError);
    });

    test('should throw error for invalid callback', () => {
      expect(() => {
        connectivityManager.addEventListener(
          CONNECTIVITY_EVENT_TYPES.ONLINE, 
          'not-a-function' as any
        );
      }).toThrow(ConnectivityManagerError);
    });
  });

  describe('removeEventListener', () => {
    test('should remove existing event listener', () => {
      const callback = jest.fn();
      const listenerId = connectivityManager.addEventListener(
        CONNECTIVITY_EVENT_TYPES.ONLINE,
        callback
      );

      const result = connectivityManager.removeEventListener(listenerId);
      expect(result).toBe(true);
    });

    test('should throw error for non-existent listener', () => {
      expect(() => {
        connectivityManager.removeEventListener('non-existent-id');
      }).toThrow(ConnectivityManagerError);
    });
  });

  describe('measureNetworkQuality', () => {
    test('should measure network quality when online', async () => {
      mockNavigator.onLine = true;
      mockPerformance.now
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1050); // 50ms latency

      const metrics = await connectivityManager.measureNetworkQuality();

      expect(metrics).toBeDefined();
      expect(typeof metrics.latency).toBe('number');
      expect(typeof metrics.bandwidth).toBe('number');
      expect(typeof metrics.reliability).toBe('number');
      expect(metrics.reliability).toBeGreaterThanOrEqual(0);
      expect(metrics.reliability).toBeLessThanOrEqual(1);
      expect(new Date(metrics.measuredAt)).toBeInstanceOf(Date);
    });

    test('should throw error when offline', async () => {
      mockNavigator.onLine = false;

      await expect(connectivityManager.measureNetworkQuality())
        .rejects
        .toThrow(ConnectivityManagerError);

      mockNavigator.onLine = true; // Reset for other tests
    });
  });

  describe('startMonitoring', () => {
    test('should start monitoring with default interval', () => {
      const result = connectivityManager.startMonitoring();
      expect(result).toBe(true);
    });

    test('should start monitoring with custom interval', () => {
      const result = connectivityManager.startMonitoring(3000);
      expect(result).toBe(true);
    });

    test('should throw error if monitoring already active', () => {
      connectivityManager.startMonitoring();
      
      expect(() => {
        connectivityManager.startMonitoring();
      }).toThrow(ConnectivityManagerError);
    });

    test('should throw error for invalid interval', () => {
      expect(() => {
        connectivityManager.startMonitoring(500); // Too short
      }).toThrow(ConnectivityManagerError);

      expect(() => {
        connectivityManager.startMonitoring(100000); // Too long
      }).toThrow(ConnectivityManagerError);
    });
  });

  describe('stopMonitoring', () => {
    test('should stop active monitoring', () => {
      connectivityManager.startMonitoring();
      const result = connectivityManager.stopMonitoring();
      expect(result).toBe(true);
    });

    test('should throw error if monitoring not active', () => {
      expect(() => {
        connectivityManager.stopMonitoring();
      }).toThrow(ConnectivityManagerError);
    });
  });

  describe('error handling', () => {
    test('should handle ConnectivityManagerError correctly', () => {
      const error = new ConnectivityManagerError(
        ConnectivityManagerErrorCode.CONNECTIVITY_CHECK_FAILED,
        'Test error'
      );

      expect(error.name).toBe('ConnectivityManagerError');
      expect(error.code).toBe(ConnectivityManagerErrorCode.CONNECTIVITY_CHECK_FAILED);
      expect(error.message).toBe('Test error');
    });
  });

  describe('constants', () => {
    test('should have valid connectivity event types', () => {
      expect(CONNECTIVITY_EVENT_TYPES.ONLINE).toBe('online');
      expect(CONNECTIVITY_EVENT_TYPES.OFFLINE).toBe('offline');
      expect(CONNECTIVITY_EVENT_TYPES.CHANGE).toBe('change');
    });

    test('should have valid connection types', () => {
      expect(CONNECTION_TYPES.WIFI).toBe('wifi');
      expect(CONNECTION_TYPES.CELLULAR).toBe('cellular');
      expect(CONNECTION_TYPES.ETHERNET).toBe('ethernet');
      expect(CONNECTION_TYPES.UNKNOWN).toBe('unknown');
    });
  });
});

/**
 * Integration tests for ConnectivityManager
 */
describe('ConnectivityManager Integration', () => {
  let connectivityManager: ConnectivityManager;

  beforeEach(() => {
    connectivityManager = new ConnectivityManager();
  });

  afterEach(() => {
    connectivityManager.destroy();
  });

  test('should handle connectivity workflow', async () => {
    // Initial status check
    const initialStatus = connectivityManager.getConnectionStatus();
    expect(initialStatus).toBeDefined();

    // Add event listeners
    const events: any[] = [];
    const listenerId = connectivityManager.addEventListener(
      CONNECTIVITY_EVENT_TYPES.CHANGE,
      (event) => events.push(event)
    );

    // Start monitoring
    connectivityManager.startMonitoring(1000);

    // Measure quality if online
    if (connectivityManager.isOnline()) {
      const metrics = await connectivityManager.measureNetworkQuality();
      expect(metrics.latency).toBeGreaterThan(0);
    }

    // Cleanup
    connectivityManager.removeEventListener(listenerId);
    connectivityManager.stopMonitoring();
  });
});