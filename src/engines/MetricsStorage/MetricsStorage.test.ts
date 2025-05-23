import { MetricsStorage } from './MetricsStorage';
import { StorageResult } from './MetricsStorageTypes';

// Mock IndexedDB
const mockIDBCursor = {
  continue: jest.fn()
};

const mockIDBIndex = {
  openCursor: jest.fn(() => ({ result: null }))
};

const mockIDBObjectStore = {
  add: jest.fn(() => ({ result: 'mock-id' })),
  put: jest.fn(() => ({})),
  delete: jest.fn(() => ({})),
  index: jest.fn(() => mockIDBIndex),
  get: jest.fn(() => ({}))
};

const mockIDBTransaction = {
  objectStore: jest.fn(() => mockIDBObjectStore),
  oncomplete: null,
  onerror: null,
  onabort: null
};

const mockIDBDatabase = {
  transaction: jest.fn(() => mockIDBTransaction),
  close: jest.fn()
};

// Mock data
const mockSessionMetrics = {
  sessionId: 'session123',
  userId: 'user123',
  startTime: '2025-01-01T12:00:00Z',
  endTime: '2025-01-01T12:30:00Z',
  totalQuestions: 20,
  correctAnswers: 18,
  ftcPoints: 900,
  ecPoints: 200,
  basePoints: 1100,
  bonusMultiplier: 1.2,
  totalPoints: 1320,
  blinkSpeed: 1.5
};

const mockLifetimeMetrics = {
  userId: 'user123',
  totalSessions: 10,
  totalQuestions: 200,
  correctAnswers: 180,
  totalPoints: 13200,
  ftcPoints: 9000,
  ecPoints: 2000,
  basePoints: 11000,
  averageBonusMultiplier: 1.2,
  blinkSpeed: 1.5,
  evolution: 8800,
  lastUpdateDate: '2025-01-01T12:30:00Z'
};

const mockSessionHistory = [
  {
    sessionId: 'session123',
    startTime: '2025-01-01T12:00:00Z',
    endTime: '2025-01-01T12:30:00Z',
    totalQuestions: 20,
    correctAnswers: 18,
    totalPoints: 1320
  },
  {
    sessionId: 'session456',
    startTime: '2025-01-02T14:00:00Z',
    endTime: '2025-01-02T14:45:00Z',
    totalQuestions: 30,
    correctAnswers: 25,
    totalPoints: 2000
  }
];

// Mock IDBFactory (indexedDB global)
global.indexedDB = {
  open: jest.fn(() => ({
    result: mockIDBDatabase,
    onupgradeneeded: null,
    onsuccess: null,
    onerror: null
  }))
} as unknown as IDBFactory;

// Mock IDBKeyRange
global.IDBKeyRange = {
  only: jest.fn((key) => key)
} as unknown as typeof IDBKeyRange;

describe('MetricsStorage', () => {
  let metricsStorage: MetricsStorage;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create instance
    metricsStorage = new MetricsStorage();
    
    // Simulate database connection
    const openRequest = indexedDB.open.mock.results[0].value;
    if (openRequest.onsuccess) {
      openRequest.onsuccess(new Event('success'));
    }
  });

  describe('saveSessionMetrics', () => {
    test('should save session metrics successfully', async () => {
      // Set up mock add operation
      const addRequest = mockIDBObjectStore.add.mock.results[0].value;
      
      // Simulate successful add
      setTimeout(() => {
        if (addRequest.onsuccess) addRequest.onsuccess(new Event('success'));
      }, 0);
      
      // Call the method
      const result = await metricsStorage.saveSessionMetrics('session123', mockSessionMetrics);
      
      // Verify result
      expect(result).toBe(true);
      expect(mockIDBObjectStore.add).toHaveBeenCalledWith(mockSessionMetrics);
    });
    
    test('should handle errors during session save', async () => {
      // Set up mock add operation
      const addRequest = mockIDBObjectStore.add.mock.results[0].value;
      
      // Simulate error
      setTimeout(() => {
        if (addRequest.onerror) addRequest.onerror(new Event('error'));
      }, 0);
      
      // Call the method
      const result = await metricsStorage.saveSessionMetrics('session123', mockSessionMetrics);
      
      // Verify result
      expect(result).toBe(false);
    });
  });
  
  describe('saveLifetimeMetrics', () => {
    test('should save lifetime metrics successfully', async () => {
      // Set up mock put operation
      const putRequest = mockIDBObjectStore.put.mock.results[0].value;
      
      // Simulate successful put
      setTimeout(() => {
        if (putRequest.onsuccess) putRequest.onsuccess(new Event('success'));
      }, 0);
      
      // Call the method
      const result = await metricsStorage.saveLifetimeMetrics('user123', mockLifetimeMetrics);
      
      // Verify result
      expect(result).toBe(true);
      expect(mockIDBObjectStore.put).toHaveBeenCalledWith(mockLifetimeMetrics);
    });
    
    test('should handle errors during lifetime metrics save', async () => {
      // Set up mock put operation
      const putRequest = mockIDBObjectStore.put.mock.results[0].value;
      
      // Simulate error
      setTimeout(() => {
        if (putRequest.onerror) putRequest.onerror(new Event('error'));
      }, 0);
      
      // Call the method
      const result = await metricsStorage.saveLifetimeMetrics('user123', mockLifetimeMetrics);
      
      // Verify result
      expect(result).toBe(false);
    });
  });
  
  describe('getLifetimeMetrics', () => {
    test('should retrieve lifetime metrics successfully', async () => {
      // Set up mock get operation
      const getRequest = mockIDBObjectStore.get.mock.results[0].value;
      
      // Simulate successful get
      setTimeout(() => {
        getRequest.result = mockLifetimeMetrics;
        if (getRequest.onsuccess) getRequest.onsuccess(new Event('success'));
      }, 0);
      
      // Call the method
      const result = await metricsStorage.getLifetimeMetrics('user123');
      
      // Verify result
      expect(result).toEqual(mockLifetimeMetrics);
      expect(mockIDBObjectStore.get).toHaveBeenCalledWith('user123');
    });
    
    test('should handle not found case', async () => {
      // Set up mock get operation
      const getRequest = mockIDBObjectStore.get.mock.results[0].value;
      
      // Simulate successful get but with no result
      setTimeout(() => {
        getRequest.result = undefined;
        if (getRequest.onsuccess) getRequest.onsuccess(new Event('success'));
      }, 0);
      
      // Call the method
      const result = await metricsStorage.getLifetimeMetrics('user123');
      
      // Verify result
      expect(result).toBeNull();
    });
    
    test('should handle errors during retrieval', async () => {
      // Set up mock get operation
      const getRequest = mockIDBObjectStore.get.mock.results[0].value;
      
      // Simulate error
      setTimeout(() => {
        if (getRequest.onerror) getRequest.onerror(new Event('error'));
      }, 0);
      
      // Call the method
      await expect(metricsStorage.getLifetimeMetrics('user123')).rejects.toThrow();
    });
  });
  
  describe('getSessionMetrics', () => {
    test('should retrieve session metrics successfully', async () => {
      // Set up mock get operation
      const getRequest = mockIDBObjectStore.get.mock.results[0].value;
      
      // Simulate successful get
      setTimeout(() => {
        getRequest.result = mockSessionMetrics;
        if (getRequest.onsuccess) getRequest.onsuccess(new Event('success'));
      }, 0);
      
      // Call the method
      const result = await metricsStorage.getSessionMetrics('session123');
      
      // Verify result
      expect(result).toEqual(mockSessionMetrics);
      expect(mockIDBObjectStore.get).toHaveBeenCalledWith('session123');
    });
    
    test('should handle not found case', async () => {
      // Set up mock get operation
      const getRequest = mockIDBObjectStore.get.mock.results[0].value;
      
      // Simulate successful get but with no result
      setTimeout(() => {
        getRequest.result = undefined;
        if (getRequest.onsuccess) getRequest.onsuccess(new Event('success'));
      }, 0);
      
      // Call the method
      const result = await metricsStorage.getSessionMetrics('session123');
      
      // Verify result
      expect(result).toBeNull();
    });
    
    test('should handle errors during retrieval', async () => {
      // Set up mock get operation
      const getRequest = mockIDBObjectStore.get.mock.results[0].value;
      
      // Simulate error
      setTimeout(() => {
        if (getRequest.onerror) getRequest.onerror(new Event('error'));
      }, 0);
      
      // Call the method
      await expect(metricsStorage.getSessionMetrics('session123')).rejects.toThrow();
    });
  });
  
  describe('getSessionHistory', () => {
    test('should retrieve session history successfully', async () => {
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
        if (openCursorRequest.onsuccess) openCursorRequest.onsuccess(new Event('success'));
        
        setTimeout(() => {
          openCursorRequest.result = null; // End of cursor
          if (openCursorRequest.onsuccess) openCursorRequest.onsuccess(new Event('success'));
        }, 0);
      }, 0);
      
      // Call the method with limit of 1
      const result = await metricsStorage.getSessionHistory('user123', 1);
      
      // Verify result
      expect(result).toHaveLength(1);
      expect(result[0].sessionId).toBe(mockSessionHistory[0].sessionId);
    });
    
    test('should handle empty result', async () => {
      // Set up mock cursor with no results
      const openCursorRequest = mockIDBIndex.openCursor.mock.results[0].value;
      
      // Simulate cursor with no results
      setTimeout(() => {
        openCursorRequest.result = null;
        if (openCursorRequest.onsuccess) openCursorRequest.onsuccess(new Event('success'));
      }, 0);
      
      // Call the method
      const result = await metricsStorage.getSessionHistory('user123');
      
      // Verify result
      expect(result).toHaveLength(0);
    });
    
    test('should handle errors during retrieval', async () => {
      // Set up mock cursor
      const openCursorRequest = mockIDBIndex.openCursor.mock.results[0].value;
      
      // Simulate error
      setTimeout(() => {
        if (openCursorRequest.onerror) openCursorRequest.onerror(new Event('error'));
      }, 0);
      
      // Call the method
      await expect(metricsStorage.getSessionHistory('user123')).rejects.toThrow();
    });
  });
});