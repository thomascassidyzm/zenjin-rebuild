/**
 * Tests for LifetimeMetricsManager
 * 
 * This file contains unit tests for the LifetimeMetricsManager component.
 */

import { LifetimeMetricsManager, LifetimeMetrics, SessionSummary } from './LifetimeMetricsManager';
import { InMemoryMetricsStorage } from './InMemoryMetricsStorage';
import { BasicMetricsCalculator } from './BasicMetricsCalculator';

describe('LifetimeMetricsManager', () => {
  let lifetimeMetricsManager: LifetimeMetricsManager;
  let metricsStorage: InMemoryMetricsStorage;
  let metricsCalculator: BasicMetricsCalculator;
  
  beforeEach(() => {
    // Initialize dependencies
    metricsStorage = new InMemoryMetricsStorage();
    metricsCalculator = new BasicMetricsCalculator();
    
    // Initialize LifetimeMetricsManager with custom configuration
    lifetimeMetricsManager = new LifetimeMetricsManager(
      metricsStorage,
      metricsCalculator,
      {
        blinkSpeedSessionsCount: 3,
        blinkSpeedWeights: [0.7, 0.2, 0.1],
        validRankingMetrics: ['evolution', 'totalPoints', 'currentBlinkSpeed', 'streakDays'],
        defaultRankingMetric: 'evolution'
      }
    );
  });
  
  describe('getLifetimeMetrics', () => {
    it('should throw UserNotFoundError for empty userId', () => {
      expect(() => {
        lifetimeMetricsManager.getLifetimeMetrics('');
      }).toThrow('USER_NOT_FOUND');
    });
    
    it('should throw NoMetricsDataError if no metrics exist', () => {
      expect(() => {
        lifetimeMetricsManager.getLifetimeMetrics('nonexistentUser');
      }).toThrow('NO_METRICS_DATA');
    });
    
    it('should return metrics for an existing user', () => {
      // Arrange
      const userId = 'user123';
      const metrics: LifetimeMetrics = {
        userId,
        totalSessions: 10,
        totalPoints: 1000,
        currentBlinkSpeed: 10000,
        evolution: 0.1,
        streakDays: 5,
        longestStreakDays: 7
      };
      metricsStorage.saveLifetimeMetrics(metrics);
      
      // Act
      const result = lifetimeMetricsManager.getLifetimeMetrics(userId);
      
      // Assert
      expect(result).toEqual(metrics);
    });
  });
  
  describe('updateLifetimeMetrics', () => {
    it('should throw UserNotFoundError for empty userId', () => {
      expect(() => {
        lifetimeMetricsManager.updateLifetimeMetrics('', {} as SessionSummary);
      }).toThrow('USER_NOT_FOUND');
    });
    
    it('should throw InvalidSessionSummaryError for invalid session summary', () => {
      expect(() => {
        lifetimeMetricsManager.updateLifetimeMetrics('user123', null as unknown as SessionSummary);
      }).toThrow('INVALID_SESSION_SUMMARY');
      
      expect(() => {
        lifetimeMetricsManager.updateLifetimeMetrics('user123', {
          sessionId: '',
          ftcPoints: 0,
          ecPoints: 0,
          basePoints: 0,
          bonusMultiplier: 1,
          blinkSpeed: 1000,
          totalPoints: 0
        });
      }).toThrow('INVALID_SESSION_SUMMARY');
      
      expect(() => {
        lifetimeMetricsManager.updateLifetimeMetrics('user123', {
          sessionId: 'session123',
          ftcPoints: -1,
          ecPoints: 0,
          basePoints: 0,
          bonusMultiplier: 1,
          blinkSpeed: 1000,
          totalPoints: 0
        });
      }).toThrow('INVALID_SESSION_SUMMARY');
    });
    
    it('should initialize metrics for a new user', () => {
      // Arrange
      const userId = 'newUser';
      const sessionSummary: SessionSummary = {
        sessionId: 'session123',
        ftcPoints: 80,
        ecPoints: 9,
        basePoints: 89,
        bonusMultiplier: 1.25,
        blinkSpeed: 15000,
        totalPoints: 111.25
      };
      
      // Act
      const result = lifetimeMetricsManager.updateLifetimeMetrics(userId, sessionSummary);
      
      // Assert
      expect(result.userId).toBe(userId);
      expect(result.totalSessions).toBe(1);
      expect(result.totalPoints).toBe(sessionSummary.totalPoints);
      expect(result.currentBlinkSpeed).toBe(sessionSummary.blinkSpeed);
      expect(result.evolution).toBeCloseTo(sessionSummary.totalPoints / sessionSummary.blinkSpeed);
      expect(result.streakDays).toBe(1);
      expect(result.longestStreakDays).toBe(1);
    });
    
    it('should update metrics for an existing user', () => {
      // Arrange
      const userId = 'existingUser';
      
      // Initial metrics
      metricsStorage.saveLifetimeMetrics({
        userId,
        totalSessions: 10,
        totalPoints: 1000,
        currentBlinkSpeed: 10000,
        evolution: 0.1,
        firstSessionDate: '2025-01-15T10:00:00Z',
        lastSessionDate: '2025-01-20T15:30:00Z',
        streakDays: 6,
        longestStreakDays: 6
      });
      
      // Add some recent sessions
      metricsStorage.addSessionData(userId, 'session1', 12000, '2025-01-18T10:00:00Z');
      metricsStorage.addSessionData(userId, 'session2', 11000, '2025-01-19T10:00:00Z');
      
      // New session summary
      const sessionSummary: SessionSummary = {
        sessionId: 'session3',
        ftcPoints: 80,
        ecPoints: 9,
        basePoints: 89,
        bonusMultiplier: 1.25,
        blinkSpeed: 9000,
        totalPoints: 111.25
      };
      
      // Mock current date
      const originalDateNow = Date.now;
      const mockDateNow = jest.fn(() => new Date('2025-01-21T10:00:00Z').getTime());
      Date.now = mockDateNow;
      
      // Act
      const result = lifetimeMetricsManager.updateLifetimeMetrics(userId, sessionSummary);
      
      // Restore original Date.now
      Date.now = originalDateNow;
      
      // Assert
      expect(result.userId).toBe(userId);
      expect(result.totalSessions).toBe(11);
      expect(result.totalPoints).toBeCloseTo(1000 + sessionSummary.totalPoints);
      
      // Expected blink speed: weighted average of [9000, 11000, 12000] with weights [0.7, 0.2, 0.1]
      const expectedBlinkSpeed = 9000 * 0.7 + 11000 * 0.2 + 12000 * 0.1;
      expect(result.currentBlinkSpeed).toBeCloseTo(expectedBlinkSpeed);
      
      // Expected evolution: (1000 + 111.25) / expectedBlinkSpeed
      const expectedEvolution = (1000 + 111.25) / expectedBlinkSpeed;
      expect(result.evolution).toBeCloseTo(expectedEvolution);
      
      expect(result.streakDays).toBe(7);
      expect(result.longestStreakDays).toBe(7);
    });
    
    it('should reset streak if last session was more than 1 day ago', () => {
      // Arrange
      const userId = 'streakUser';
      
      // Initial metrics
      metricsStorage.saveLifetimeMetrics({
        userId,
        totalSessions: 10,
        totalPoints: 1000,
        currentBlinkSpeed: 10000,
        evolution: 0.1,
        firstSessionDate: '2025-01-15T10:00:00Z',
        lastSessionDate: '2025-01-15T15:30:00Z',
        streakDays: 5,
        longestStreakDays: 10
      });
      
      // New session summary
      const sessionSummary: SessionSummary = {
        sessionId: 'sessionStreak',
        ftcPoints: 80,
        ecPoints: 9,
        basePoints: 89,
        bonusMultiplier: 1.25,
        blinkSpeed: 9000,
        totalPoints: 111.25
      };
      
      // Mock current date (3 days later)
      const originalDateNow = Date.now;
      const mockDateNow = jest.fn(() => new Date('2025-01-18T10:00:00Z').getTime());
      Date.now = mockDateNow;
      
      // Act
      const result = lifetimeMetricsManager.updateLifetimeMetrics(userId, sessionSummary);
      
      // Restore original Date.now
      Date.now = originalDateNow;
      
      // Assert
      expect(result.streakDays).toBe(1); // Reset to 1
      expect(result.longestStreakDays).toBe(10); // Unchanged
    });
  });
  
  describe('calculateEvolution', () => {
    it('should throw UserNotFoundError for empty userId', () => {
      expect(() => {
        lifetimeMetricsManager.calculateEvolution('');
      }).toThrow('USER_NOT_FOUND');
    });
    
    it('should throw NoMetricsDataError if no metrics exist', () => {
      expect(() => {
        lifetimeMetricsManager.calculateEvolution('nonexistentUser');
      }).toThrow('NO_METRICS_DATA');
    });
    
    it('should calculate evolution metric correctly', () => {
      // Arrange
      const userId = 'evolutionUser';
      const totalPoints = 1000;
      const blinkSpeed = 10000;
      
      metricsStorage.saveLifetimeMetrics({
        userId,
        totalSessions: 10,
        totalPoints,
        currentBlinkSpeed: blinkSpeed,
        evolution: 0, // Will be recalculated
        streakDays: 5,
        longestStreakDays: 7
      });
      
      // Act
      const result = lifetimeMetricsManager.calculateEvolution(userId);
      
      // Assert
      expect(result).toBeCloseTo(totalPoints / blinkSpeed);
    });
  });
  
  describe('getGlobalRanking', () => {
    it('should throw UserNotFoundError for empty userId', () => {
      expect(() => {
        lifetimeMetricsManager.getGlobalRanking('');
      }).toThrow('USER_NOT_FOUND');
    });
    
    it('should throw NoRankingDataError if no ranking exists', () => {
      expect(() => {
        lifetimeMetricsManager.getGlobalRanking('nonexistentUser');
      }).toThrow('NO_RANKING_DATA');
    });
    
    it('should return ranking for an existing user', () => {
      // Arrange
      const userId = 'rankingUser';
      
      // Create metrics and rankings for multiple users
      const users = ['user1', 'user2', 'rankingUser', 'user4', 'user5'];
      
      users.forEach((uid, index) => {
        metricsStorage.saveLifetimeMetrics({
          userId: uid,
          totalSessions: 10,
          totalPoints: 1000 - index * 100,
          currentBlinkSpeed: 10000,
          evolution: 0.1 - index * 0.01,
          streakDays: 5,
          longestStreakDays: 7
        });
      });
      
      // Calculate rankings
      lifetimeMetricsManager.recalculateGlobalRankings();
      
      // Act
      const result = lifetimeMetricsManager.getGlobalRanking(userId);
      
      // Assert
      expect(result.userId).toBe(userId);
      expect(result.rank).toBe(3);
      expect(result.totalUsers).toBe(5);
      expect(result.percentile).toBeCloseTo((1 - 2/5) * 100); // (1 - (rank-1)/totalUsers) * 100
    });
  });
  
  describe('getTopRankedUsers', () => {
    it('should throw InvalidLimitError for invalid limit', () => {
      expect(() => {
        lifetimeMetricsManager.getTopRankedUsers(0);
      }).toThrow('INVALID_LIMIT');
      
      expect(() => {
        lifetimeMetricsManager.getTopRankedUsers(-1);
      }).toThrow('INVALID_LIMIT');
    });
    
    it('should throw InvalidMetricError for invalid metric', () => {
      expect(() => {
        lifetimeMetricsManager.getTopRankedUsers(10, 'invalidMetric');
      }).toThrow('INVALID_METRIC');
    });
    
    it('should return top ranked users', () => {
      // Arrange
      // Create metrics for multiple users with different evolution values
      const usersData = [
        { userId: 'user1', evolution: 0.5, totalPoints: 5000 },
        { userId: 'user2', evolution: 0.3, totalPoints: 3000 },
        { userId: 'user3', evolution: 0.8, totalPoints: 8000 },
        { userId: 'user4', evolution: 0.1, totalPoints: 1000 },
        { userId: 'user5', evolution: 0.6, totalPoints: 6000 }
      ];
      
      usersData.forEach(data => {
        metricsStorage.saveLifetimeMetrics({
          userId: data.userId,
          totalSessions: 10,
          totalPoints: data.totalPoints,
          currentBlinkSpeed: 10000,
          evolution: data.evolution,
          streakDays: 5,
          longestStreakDays: 7
        });
      });
      
      // Calculate rankings
      lifetimeMetricsManager.recalculateGlobalRankings();
      
      // Act - get top 3 by evolution
      const resultEvolution = lifetimeMetricsManager.getTopRankedUsers(3, 'evolution');
      
      // Assert
      expect(resultEvolution.length).toBe(3);
      expect(resultEvolution[0].userId).toBe('user3'); // Highest evolution
      expect(resultEvolution[0].rank).toBe(1);
      expect(resultEvolution[0].metricValue).toBeCloseTo(0.8);
      
      expect(resultEvolution[1].userId).toBe('user5');
      expect(resultEvolution[1].rank).toBe(2);
      
      expect(resultEvolution[2].userId).toBe('user1');
      expect(resultEvolution[2].rank).toBe(3);
      
      // Act - get top 3 by totalPoints
      const resultPoints = lifetimeMetricsManager.getTopRankedUsers(3, 'totalPoints');
      
      // Assert
      expect(resultPoints.length).toBe(3);
      expect(resultPoints[0].userId).toBe('user3'); // Highest total points
      expect(resultPoints[1].userId).toBe('user5');
      expect(resultPoints[2].userId).toBe('user1');
    });
  });
  
  // MS-002: LifetimeMetricsManager must correctly aggregate session metrics into lifetime metrics and calculate Evolution
  describe('Validation Criterion MS-002', () => {
    it('should correctly aggregate session metrics into lifetime metrics', () => {
      // Arrange
      const userId = 'validationUser';
      
      // Create sessions with different metrics
      const sessions: SessionSummary[] = [
        {
          sessionId: 'session1',
          ftcPoints: 80,
          ecPoints: 10,
          basePoints: 90,
          bonusMultiplier: 1.1,
          blinkSpeed: 14000,
          totalPoints: 99
        },
        {
          sessionId: 'session2',
          ftcPoints: 70,
          ecPoints: 15,
          basePoints: 85,
          bonusMultiplier: 1.2,
          blinkSpeed: 13000,
          totalPoints: 102
        },
        {
          sessionId: 'session3',
          ftcPoints: 90,
          ecPoints: 5,
          basePoints: 95,
          bonusMultiplier: 1.3,
          blinkSpeed: 12000,
          totalPoints: 123.5
        }
      ];
      
      // Act - update metrics with each session
      let metrics: LifetimeMetrics | null = null;
      
      // Add some delay between sessions
      const dates = [
        '2025-01-15T10:00:00Z',
        '2025-01-16T10:00:00Z',
        '2025-01-17T10:00:00Z'
      ];
      
      const originalDateNow = Date.now;
      
      sessions.forEach((session, index) => {
        // Mock current date
        const mockDateNow = jest.fn(() => new Date(dates[index]).getTime());
        Date.now = mockDateNow;
        
        // Add session to storage for blink speed calculation
        if (index > 0) {
          metricsStorage.addSessionData(
            userId,
            sessions[index - 1].sessionId,
            sessions[index - 1].blinkSpeed,
            dates[index - 1]
          );
        }
        
        metrics = lifetimeMetricsManager.updateLifetimeMetrics(userId, session);
      });
      
      // Restore original Date.now
      Date.now = originalDateNow;
      
      // Expected total points
      const expectedTotalPoints = sessions.reduce(
        (sum, session) => sum + session.totalPoints,
        0
      );
      
      // Expected blink speed: weighted average of [12000, 13000] with weights [0.7, 0.2]
      // (We only use the 2 most recent sessions due to our test configuration)
      const expectedBlinkSpeed = 12000 * 0.7 + 13000 * 0.2;
      
      // Expected evolution
      const expectedEvolution = expectedTotalPoints / expectedBlinkSpeed;
      
      // Assert
      expect(metrics).not.toBeNull();
      expect(metrics!.totalSessions).toBe(3);
      expect(metrics!.totalPoints).toBeCloseTo(expectedTotalPoints);
      expect(metrics!.currentBlinkSpeed).toBeCloseTo(expectedBlinkSpeed);
      expect(metrics!.evolution).toBeCloseTo(expectedEvolution);
      expect(metrics!.streakDays).toBe(3);
      expect(metrics!.longestStreakDays).toBe(3);
    });
  });
  
  // MS-003: LifetimeMetricsManager must correctly calculate global ranking percentile
  describe('Validation Criterion MS-003', () => {
    it('should correctly calculate global ranking percentile', () => {
      // Arrange
      // Create metrics for multiple users with different evolution values
      const usersData = [
        { userId: 'user1', evolution: 0.5 },
        { userId: 'user2', evolution: 0.3 },
        { userId: 'user3', evolution: 0.8 },
        { userId: 'user4', evolution: 0.1 },
        { userId: 'user5', evolution: 0.6 },
        { userId: 'user6', evolution: 0.4 },
        { userId: 'user7', evolution: 0.7 },
        { userId: 'user8', evolution: 0.2 }
      ];
      
      usersData.forEach(data => {
        metricsStorage.saveLifetimeMetrics({
          userId: data.userId,
          totalSessions: 10,
          totalPoints: data.evolution * 10000,
          currentBlinkSpeed: 10000,
          evolution: data.evolution,
          streakDays: 5,
          longestStreakDays: 7
        });
      });
      
      // Act - calculate rankings
      lifetimeMetricsManager.recalculateGlobalRankings();
      
      // Expected rankings (sorted by evolution):
      // Rank 1: user3 (0.8) - Percentile: (1 - 0/8) * 100 = 100%
      // Rank 2: user7 (0.7) - Percentile: (1 - 1/8) * 100 = 87.5%
      // Rank 3: user5 (0.6) - Percentile: (1 - 2/8) * 100 = 75%
      // Rank 4: user1 (0.5) - Percentile: (1 - 3/8) * 100 = 62.5%
      // Rank 5: user6 (0.4) - Percentile: (1 - 4/8) * 100 = 50%
      // Rank 6: user2 (0.3) - Percentile: (1 - 5/8) * 100 = 37.5%
      // Rank 7: user8 (0.2) - Percentile: (1 - 6/8) * 100 = 25%
      // Rank 8: user4 (0.1) - Percentile: (1 - 7/8) * 100 = 12.5%
      
      // Assert - check percentiles for several users
      
      // Top user (user3)
      const topUserRanking = lifetimeMetricsManager.getGlobalRanking('user3');
      expect(topUserRanking.rank).toBe(1);
      expect(topUserRanking.totalUsers).toBe(8);
      expect(topUserRanking.percentile).toBeCloseTo(100);
      
      // Middle user (user1)
      const middleUserRanking = lifetimeMetricsManager.getGlobalRanking('user1');
      expect(middleUserRanking.rank).toBe(4);
      expect(middleUserRanking.totalUsers).toBe(8);
      expect(middleUserRanking.percentile).toBeCloseTo(62.5);
      
      // Bottom user (user4)
      const bottomUserRanking = lifetimeMetricsManager.getGlobalRanking('user4');
      expect(bottomUserRanking.rank).toBe(8);
      expect(bottomUserRanking.totalUsers).toBe(8);
      expect(bottomUserRanking.percentile).toBeCloseTo(12.5);
    });
  });
});