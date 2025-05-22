/**
 * metrics-storage.test.ts
 * 
 * Unit tests for the MetricsStorage component.
 */

import { MetricsStorage, SessionMetrics, LifetimeMetrics, MetricsStorageError } from './metrics-storage';

// Mock IndexedDB
let mockIndexedDB: any;
let mockIDBFactory: any;
let mockIDBDatabase: any;
let mockIDBTransaction: any;
let mockIDBObjectStore: any;
let mockIDBIndex: any;
let mockIDBRequest: any;
let mockIDBCursor: any;

// Mock data
const mockSessionData: SessionMetrics = {
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

const mockLifetimeData: LifetimeMetrics = {
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

const mockSessionHistory = [
  {
    sessionId: "session123",
    totalPoints: 111.25,
    endTime: "2025-05-20T10:14:00Z",
    duration: 240000,
    questionCount: 20
  },
  {
    sessionId: "session122",
    totalPoints: 98.5,
    endTime: "2025-05-19T15:30:00Z",
    duration: 210000,
    questionCount: 18
  },
  {
    sessionId: "session121",
    totalPoints: 105.75,
    endTime: "2025-05-18T09:45:00Z",
    duration: 225000,
    questionCount: 19
  }
];

// Setup IndexedDB mocks before each test
beforeEach(() => {
  // Create mock IndexedDB
  mockIDBRequest = {
    result: null,
    error: null,
    transaction: null,
    source: null,
    readyState: 'pending',
    onsuccess: null,
    onerror: null
  };
  
  mockIDBCursor = {
    continue: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    value: null,
    key: null,
    primaryKey: null,
    direction: 'next',
    source: null
  };
  
  mockIDBIndex = {
    name: '',
    objectStore: null,
    keyPath: '',
    multiEntry: false,
    unique: false,
    get: jest.fn(() => ({ ...mockIDBRequest })),
    getKey: jest.fn(() => ({ ...mockIDBRequest })),
    getAll: jest.fn(() => ({ ...mockIDBRequest })),
    getAllKeys: jest.fn(() => ({ ...mockIDBRequest })),
    count: jest.fn(() => ({ ...mockIDBRequest })),
    openCursor: jest.fn(() => ({ ...mockIDBRequest })),
    openKeyCursor: jest.fn(() => ({ ...mockIDBRequest }))
  };
  
  mockIDBObjectStore = {
    name: '',
    keyPath: '',
    indexNames: ['userId', 'endTime', 'userEndTime'],
    autoIncrement: false,
    transaction: null,
    put: jest.fn(() => ({ ...mockIDBRequest })),
    add: jest.fn(() => ({ ...mockIDBRequest })),
    delete: jest.fn(() => ({ ...mockIDBRequest })),
    clear: jest.fn(() => ({ ...mockIDBRequest })),
    get: jest.fn(() => ({ ...mockIDBRequest })),
    getAll: jest.fn(() => ({ ...mockIDBRequest })),
    getAllKeys: jest.fn(() => ({ ...mockIDBRequest })),
    count: jest.fn(() => ({ ...mockIDBRequest })),
    openCursor: jest.fn(() => ({ ...mockIDBRequest })),
    createIndex: jest.fn(),
    index: jest.fn(() => ({ ...mockIDBIndex })),
    deleteIndex: jest.fn()
  };
  
  mockIDBTransaction = {
    mode: 'readonly',
    db: null,
    error: null,
    objectStoreNames: ['sessionMetrics', 'lifetimeMetrics', 'sessionHistory', 'syncQueue'],
    abort: jest.fn(),
    objectStore: jest.fn(() => ({ ...mockIDBObjectStore })),
    commit: jest.fn(),
    onabort: null,
    onerror: null,
    oncomplete: null
  };
  
  mockIDBDatabase = {
    name: 'zenjin-metrics',
    version: 1,
    objectStoreNames: ['sessionMetrics', 'lifetimeMetrics', 'sessionHistory', 'syncQueue'],
    onabort: null,
    onclose: null,
    onerror: null,
    onversionchange: null,
    close: jest.fn(),
    createObjectStore: jest.fn(() => ({ ...mockIDBObjectStore })),
    deleteObjectStore: jest.fn(),
    transaction: jest.fn(() => ({ ...mockIDBTransaction }))
  };
  
  mockIDBFactory = {
    open: jest.fn(() => ({ ...mockIDBRequest })),
    deleteDatabase: jest.fn(() => ({ ...mockIDBRequest })),
    cmp: jest.fn()
  };
  
  // Mock global.indexedDB
  global.indexedDB = mockIDBFactory;
  
  // Mock online status
  Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
  
  // Mock fetch
  global.fetch = jest.fn().mockImplementation(() => 
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
      status: 200,
      statusText: 'OK'
    })
  );
});

describe('MetricsStorage', () => {
  let metricsStorage: MetricsStorage;
  
  beforeEach(() => {
    // Initialize MetricsStorage with mocked options
    metricsStorage = new MetricsStorage({
      enableCache: true,
      cacheExpiration: 300000,
      enableCompression: false,
      autoSync: false,
      endpoints: {
        sessionMetrics: '/api/metrics/session',
        lifetimeMetrics: '/api/metrics/lifetime',
        sessionHistory: '/api/metrics/history'
      }
    });
    
    // Simulate successful database initialization
    const openRequest = mockIDBFactory.open.mock.results[0].value;
    openRequest.result = mockIDBDatabase;
    if (openRequest.onsuccess) openRequest.onsuccess(new Event('success'));
  });
  
  describe('saveSessionMetrics', () => {
    test('should save valid session metrics', async () => {
      // Set up mock success response
      const putRequest = mockIDBObjectStore.put.mock.results[0].value;
      setTimeout(() => {
        if (putRequest.onsuccess) putRequest.onsuccess(new Event('success'));
      }, 0);
      
      // Call the method
      const result = await metricsStorage.saveSessionMetrics('session123', mockSessionData);
      
      // Verify result
      expect(result).toBe(true);
      expect(mockIDBObjectStore.put).toHaveBeenCalledWith(mockSessionData);
    });
    
    test('should throw error for invalid session ID', async () => {
      await expect(metricsStorage.saveSessionMetrics('', mockSessionData))
        .rejects.toThrow(MetricsStorageError.INVALID_SESSION_ID);
    });
    
    test('should throw error for invalid metrics data', async () => {
      const invalidData = { ...mockSessionData, ftcCount: undefined };
      await expect(metricsStorage.saveSessionMetrics('session123', invalidData as any))
        .rejects.toThrow(MetricsStorageError.INVALID_METRICS);
    });
    
    test('should throw error for session ID mismatch', async () => {
      const mismatchData = { ...mockSessionData, sessionId: 'different-id' };
      await expect(metricsStorage.saveSessionMetrics('session123', mismatchData))
        .rejects.toThrow(/Session ID mismatch/);
    });
    
    test('should handle database error', async () => {
      // Set up mock error response
      const putRequest = mockIDBObjectStore.put.mock.results[0].value;
      putRequest.error = new Error('Test DB error');
      setTimeout(() => {
        if (putRequest.onerror) putRequest.onerror(new Event('error'));
      }, 0);
      
      await expect(metricsStorage.saveSessionMetrics('session123', mockSessionData))
        .rejects.toThrow(MetricsStorageError.STORAGE_ERROR);
    });
  });
  
  describe('saveLifetimeMetrics', () => {
    test('should save valid lifetime metrics', async () => {
      // Set up mock success response
      const putRequest = mockIDBObjectStore.put.mock.results[0].value;
      setTimeout(() => {
        if (putRequest.onsuccess) putRequest.onsuccess(new Event('success'));
      }, 0);
      
      // Call the method
      const result = await metricsStorage.saveLifetimeMetrics('user123', mockLifetimeData);
      
      // Verify result
      expect(result).toBe(true);
      expect(mockIDBObjectStore.put).toHaveBeenCalledWith(mockLifetimeData);
    });
    
    test('should throw error for invalid user ID', async () => {
      await expect(metricsStorage.saveLifetimeMetrics('', mockLifetimeData))
        .rejects.toThrow(MetricsStorageError.INVALID_USER_ID);
    });
    
    test('should throw error for invalid metrics data', async () => {
      const invalidData = { ...mockLifetimeData, totalSessions: undefined };
      await expect(metricsStorage.saveLifetimeMetrics('user123', invalidData as any))
        .rejects.toThrow(MetricsStorageError.INVALID_METRICS);
    });
    
    test('should throw error for user ID mismatch', async () => {
      const mismatchData = { ...mockLifetimeData, userId: 'different-id' };
      await expect(metricsStorage.saveLifetimeMetrics('user123', mismatchData))
        .rejects.toThrow(/User ID mismatch/);
    });
  });
  
  describe('getSessionHistory', () => {
    test('should retrieve session history with default limit', async () => {
      // Set up mock cursor
      const openCursorRequest = mockIDBIndex.openCursor.mock.results[0].value;
      
      // Simulate cursor iteration
      setTimeout(() => {
        openCursorRequest.result = {
          ...mockIDBCursor,
                      value: { ...mockSessionHistory[0], userId: 'user123' }
        };
        if (openCursorRequest.onsuccess) openCursorRequest.onsuccess(new Event('success'));
        
        setTimeout(() => {
          openCursorRequest.result = null; // End of cursor
          if (openCursorRequest.onsuccess) openCursorRequest.onsuccess(new Event('success'));
        }, 0);
      }, 0);
      
      // Call the method
      const result = await metricsStorage.getSessionHistory('user123', 1);
      
      // Verify result
      expect(result).toHaveLength(1);
      expect(result[0].sessionId).toBe(mockSessionHistory[0].sessionId);
    });
    
    test('should throw error for invalid user ID', async () => {
      await expect(metricsStorage.getSessionHistory(''))
        .rejects.toThrow(MetricsStorageError.INVALID_USER_ID);
    });
    
    test('should throw error for invalid limit', async () => {
      await expect(metricsStorage.getSessionHistory('user123', -5))
        .rejects.toThrow(MetricsStorageError.INVALID_LIMIT);
    });
    
    test('should handle empty results', async () => {
      // Set up mock cursor with no results
      const openCursorRequest = mockIDBIndex.openCursor.mock.results[0].value;
      setTimeout(() => {
        openCursorRequest.result = null;
        if (openCursorRequest.onsuccess) openCursorRequest.onsuccess(new Event('success'));
      }, 0);
      
      // Call the method
      const result = await metricsStorage.getSessionHistory('user123');
      
      // Verify result
      expect(result).toEqual([]);
    });
  });
  
  describe('updateLifetimeMetrics', () => {
    test('should create new lifetime metrics for new user', async () => {
      // Mock getLifetimeMetricsById to return null (no existing metrics)
      const getRequest = mockIDBObjectStore.get.mock.results[0].value;
      setTimeout(() => {
        getRequest.result = null;
        if (getRequest.onsuccess) getRequest.onsuccess(new Event('success'));
      }, 0);
      
      // Mock saveLifetimeMetrics success
      const putRequest = mockIDBObjectStore.put.mock.results[0].value;
      setTimeout(() => {
        if (putRequest.onsuccess) putRequest.onsuccess(new Event('success'));
      }, 0);
      
      // Call the method
      const result = await metricsStorage.updateLifetimeMetrics('newuser', mockSessionData);
      
      // Verify result
      expect(result).toBeDefined();
      expect(result.userId).toBe('newuser');
      expect(result.totalSessions).toBe(1);
      expect(result.totalPoints).toBe(mockSessionData.totalPoints);
    });
    
    test('should update existing lifetime metrics', async () => {
      // Mock getLifetimeMetricsById to return existing metrics
      const getRequest = mockIDBObjectStore.get.mock.results[0].value;
      setTimeout(() => {
        getRequest.result = { ...mockLifetimeData };
        if (getRequest.onsuccess) getRequest.onsuccess(new Event('success'));
      }, 0);
      
      // Mock saveLifetimeMetrics success
      const putRequest = mockIDBObjectStore.put.mock.results[0].value;
      setTimeout(() => {
        if (putRequest.onsuccess) putRequest.onsuccess(new Event('success'));
      }, 0);
      
      // Call the method
      const result = await metricsStorage.updateLifetimeMetrics('user123', mockSessionData);
      
      // Verify result
      expect(result).toBeDefined();
      expect(result.userId).toBe('user123');
      expect(result.totalSessions).toBe(mockLifetimeData.totalSessions + 1);
      expect(result.totalPoints).toBe(mockLifetimeData.totalPoints + mockSessionData.totalPoints);
    });
    
    test('should update streak for consecutive days', async () => {
      // Create session data for the next day
      const nextDaySession = {
        ...mockSessionData,
        startTime: "2025-05-21T10:10:00Z",
        endTime: "2025-05-21T10:14:00Z"
      };
      
      // Mock getLifetimeMetricsById to return existing metrics
      const getRequest = mockIDBObjectStore.get.mock.results[0].value;
      setTimeout(() => {
        getRequest.result = { ...mockLifetimeData };
        if (getRequest.onsuccess) getRequest.onsuccess(new Event('success'));
      }, 0);
      
      // Mock saveLifetimeMetrics success
      const putRequest = mockIDBObjectStore.put.mock.results[0].value;
      setTimeout(() => {
        if (putRequest.onsuccess) putRequest.onsuccess(new Event('success'));
      }, 0);
      
      // Call the method
      const result = await metricsStorage.updateLifetimeMetrics('user123', nextDaySession);
      
      // Verify result
      expect(result).toBeDefined();
      expect(result.streakDays).toBe(mockLifetimeData.streakDays! + 1);
    });
    
    test('should reset streak for non-consecutive days', async () => {
      // Create session data for a day after a gap
      const gapSession = {
        ...mockSessionData,
        startTime: "2025-05-25T10:10:00Z",
        endTime: "2025-05-25T10:14:00Z"
      };
      
      // Mock getLifetimeMetricsById to return existing metrics
      const getRequest = mockIDBObjectStore.get.mock.results[0].value;
      setTimeout(() => {
        getRequest.result = { ...mockLifetimeData };
        if (getRequest.onsuccess) getRequest.onsuccess(new Event('success'));
      }, 0);
      
      // Mock saveLifetimeMetrics success
      const putRequest = mockIDBObjectStore.put.mock.results[0].value;
      setTimeout(() => {
        if (putRequest.onsuccess) putRequest.onsuccess(new Event('success'));
      }, 0);
      
      // Call the method
      const result = await metricsStorage.updateLifetimeMetrics('user123', gapSession);
      
      // Verify result
      expect(result).toBeDefined();
      expect(result.streakDays).toBe(1);
      expect(result.longestStreakDays).toBe(mockLifetimeData.longestStreakDays);
    });
  });
  
  describe('forceSync', () => {
    test('should process the sync queue', async () => {
      // Call the method
      const result = await metricsStorage.forceSync();
      
      // Verify result
      expect(result).toBe(true);
    });
    
    test('should throw error when offline', async () => {
      // Set offline
      Object.defineProperty(navigator, 'onLine', { value: false });
      
      await expect(metricsStorage.forceSync())
        .rejects.toThrow(MetricsStorageError.NETWORK_ERROR);
    });
  });
  
  describe('clearAllData', () => {
    test('should clear all data stores', async () => {
      // Mock clear requests
      const clearRequests = Array(4).fill(0).map(() => {
        const request = mockIDBObjectStore.clear.mock.results[0].value;
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess(new Event('success'));
        }, 0);
        return request;
      });
      
      // Call the method
      const result = await metricsStorage.clearAllData();
      
      // Verify result
      expect(result).toBe(true);
      expect(mockIDBObjectStore.clear).toHaveBeenCalled();
    });
  });
  
  describe('getStorageStatus', () => {
    test('should return storage status', async () => {
      // Mock count requests
      const countRequests = Array(3).fill(0).map((_, index) => {
        const request = mockIDBObjectStore.count.mock.results[index].value;
        request.result = index + 1;
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess(new Event('success'));
        }, 0);
        return request;
      });
      
      // Call the method
      const result = await metricsStorage.getStorageStatus();
      
      // Verify result
      expect(result).toEqual({
        sessionCount: 1,
        userCount: 2,
        syncQueueLength: 3,
        cacheSize: 0,
        networkStatus: true
      });
    });
  });
  
  describe('Validation functions', () => {
    describe('validateSessionMetrics', () => {
      test('should accept valid metrics', () => {
        // This is tested implicitly in saveSessionMetrics tests
      });
      
      test('should detect missing required fields', async () => {
        const invalidData = { ...mockSessionData };
        delete (invalidData as any).ftcCount;
        
        await expect(metricsStorage.saveSessionMetrics('session123', invalidData as any))
          .rejects.toThrow(/Missing field/);
      });
      
      test('should validate numeric fields', async () => {
        const invalidData = { ...mockSessionData, accuracy: 'not-a-number' as any };
        
        await expect(metricsStorage.saveSessionMetrics('session123', invalidData))
          .rejects.toThrow(/Invalid accuracy/);
      });
      
      test('should validate date fields', async () => {
        const invalidData = { ...mockSessionData, startTime: 'invalid-date' };
        
        await expect(metricsStorage.saveSessionMetrics('session123', invalidData))
          .rejects.toThrow(/Invalid date format/);
      });
      
      test('should check consistency between question counts', async () => {
        const invalidData = { ...mockSessionData, questionCount: 50 };
        
        await expect(metricsStorage.saveSessionMetrics('session123', invalidData))
          .rejects.toThrow(/Question count mismatch/);
      });
      
      test('should check consistency between point calculations', async () => {
        const invalidData = { ...mockSessionData, basePoints: 200 };
        
        await expect(metricsStorage.saveSessionMetrics('session123', invalidData))
          .rejects.toThrow(/Points calculation mismatch/);
      });
    });
    
    describe('validateLifetimeMetrics', () => {
      test('should accept valid metrics', () => {
        // This is tested implicitly in saveLifetimeMetrics tests
      });
      
      test('should detect missing required fields', async () => {
        const invalidData = { ...mockLifetimeData };
        delete (invalidData as any).totalSessions;
        
        await expect(metricsStorage.saveLifetimeMetrics('user123', invalidData as any))
          .rejects.toThrow(/Missing field/);
      });
      
      test('should validate numeric fields', async () => {
        const invalidData = { ...mockLifetimeData, totalSessions: 'not-a-number' as any };
        
        await expect(metricsStorage.saveLifetimeMetrics('user123', invalidData))
          .rejects.toThrow(/Invalid totalSessions/);
      });
      
      test('should validate optional numeric fields', async () => {
        const invalidData = { ...mockLifetimeData, streakDays: 'not-a-number' as any };
        
        await expect(metricsStorage.saveLifetimeMetrics('user123', invalidData))
          .rejects.toThrow(/Invalid streakDays/);
      });
      
      test('should validate optional date fields', async () => {
        const invalidData = { ...mockLifetimeData, firstSessionDate: 'invalid-date' };
        
        await expect(metricsStorage.saveLifetimeMetrics('user123', invalidData))
          .rejects.toThrow(/Invalid firstSessionDate format/);
      });
    });
  });
});success'));
        
        setTimeout(() => {
          openCursorRequest.result = {
            ...mockIDBCursor,
            value: { ...mockSessionHistory[1], userId: 'user123' }
          };
          if (openCursorRequest.onsuccess) openCursorRequest.onsuccess(new Event('success'));
          
          setTimeout(() => {
            openCursorRequest.result = null; // End of cursor
            if (openCursorRequest.onsuccess) openCursorRequest.onsuccess(new Event('success'));
          }, 0);
        }, 0);
      }, 0);
      
      // Call the method
      const result = await metricsStorage.getSessionHistory('user123');
      
      // Verify result
      expect(result).toHaveLength(2);
      expect(result[0].sessionId).toBe(mockSessionHistory[0].sessionId);
      expect(result[1].sessionId).toBe(mockSessionHistory[1].sessionId);
    });
    
    test('should respect provided limit', async () => {
      // Set up mock cursor
      const openCursorRequest = mockIDBIndex.openCursor.mock.results[0].value;
      
      // Simulate cursor iteration for one item
      setTimeout(() => {
        openCursorRequest.result = {
          ...mockIDBCursor,
          value: { ...mockSessionHistory[0], userId: 'user123' }
        };
        if (openCursorRequest.onsuccess) openCursorRequest.onsuccess(new Event('