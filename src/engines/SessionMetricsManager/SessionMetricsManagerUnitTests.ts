/**
 * Unit tests for SessionMetricsManager
 * 
 * This file contains comprehensive tests for the SessionMetricsManager component,
 * covering session lifecycle management, metrics calculation, error handling, and edge cases.
 */

import { SessionMetricsManager } from './session-metrics-manager';

describe('SessionMetricsManager', () => {
  let sessionMetricsManager: SessionMetricsManager;
  
  beforeEach(() => {
    sessionMetricsManager = new SessionMetricsManager();
  });
  
  describe('Session Lifecycle', () => {
    test('should start a session successfully', () => {
      const sessionId = sessionMetricsManager.startSession('user123');
      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe('string');
    });
    
    test('should record answers successfully', () => {
      const sessionId = sessionMetricsManager.startSession('user123');
      const result = sessionMetricsManager.recordAnswer(sessionId, {
        questionId: 'q001',
        isCorrect: true,
        isFirstAttempt: true,
        responseTime: 1500,
        timestamp: new Date().toISOString()
      });
      expect(result).toBe(true);
    });
    
    test('should get current metrics successfully', () => {
      const sessionId = sessionMetricsManager.startSession('user123');
      sessionMetricsManager.recordAnswer(sessionId, {
        questionId: 'q001',
        isCorrect: true,
        isFirstAttempt: true,
        responseTime: 1500,
        timestamp: new Date().toISOString()
      });
      
      const metrics = sessionMetricsManager.getCurrentMetrics(sessionId);
      expect(metrics).toBeDefined();
      expect(metrics.questionCount).toBe(1);
      expect(metrics.ftcCount).toBe(1);
      expect(metrics.ecCount).toBe(0);
      expect(metrics.incorrectCount).toBe(0);
      expect(metrics.currentPoints).toBe(5);
    });
    
    test('should end a session successfully', () => {
      const sessionId = sessionMetricsManager.startSession('user123');
      sessionMetricsManager.recordAnswer(sessionId, {
        questionId: 'q001',
        isCorrect: true,
        isFirstAttempt: true,
        responseTime: 1500,
        timestamp: new Date().toISOString()
      });
      
      const summary = sessionMetricsManager.endSession(sessionId);
      expect(summary).toBeDefined();
      expect(summary.sessionId).toBe(sessionId);
      expect(summary.userId).toBe('user123');
      expect(summary.questionCount).toBe(1);
      expect(summary.ftcCount).toBe(1);
      expect(summary.ecCount).toBe(0);
      expect(summary.incorrectCount).toBe(0);
    });
    
    test('should get session summary successfully', () => {
      const sessionId = sessionMetricsManager.startSession('user123');
      sessionMetricsManager.recordAnswer(sessionId, {
        questionId: 'q001',
        isCorrect: true,
        isFirstAttempt: true,
        responseTime: 1500,
        timestamp: new Date().toISOString()
      });
      
      sessionMetricsManager.endSession(sessionId);
      const summary = sessionMetricsManager.getSessionSummary(sessionId);
      
      expect(summary).toBeDefined();
      expect(summary.sessionId).toBe(sessionId);
      expect(summary.userId).toBe('user123');
    });
  });
  
  describe('Error Handling', () => {
    test('should throw USER_NOT_FOUND when starting session with invalid user', () => {
      expect(() => {
        sessionMetricsManager.startSession('');
      }).toThrow('USER_NOT_FOUND');
    });
    
    test('should throw INVALID_CONFIG when starting session with invalid configuration', () => {
      expect(() => {
        sessionMetricsManager.startSession('user123', {
          duration: -10, // Negative duration
          questionCount: 20
        });
      }).toThrow('INVALID_CONFIG');
      
      expect(() => {
        sessionMetricsManager.startSession('user123', {
          duration: 300,
          questionCount: -5 // Negative question count
        });
      }).toThrow('INVALID_CONFIG');
    });
    
    test('should throw SESSION_NOT_FOUND when recording answer for non-existent session', () => {
      expect(() => {
        sessionMetricsManager.recordAnswer('nonexistent-session', {
          questionId: 'q001',
          isCorrect: true,
          isFirstAttempt: true,
          responseTime: 1500,
          timestamp: new Date().toISOString()
        });
      }).toThrow('SESSION_NOT_FOUND');
    });
    
    test('should throw INVALID_ANSWER when recording invalid answer', () => {
      const sessionId = sessionMetricsManager.startSession('user123');
      
      expect(() => {
        sessionMetricsManager.recordAnswer(sessionId, {
          questionId: '', // Empty question ID
          isCorrect: true,
          isFirstAttempt: true,
          responseTime: 1500,
          timestamp: new Date().toISOString()
        });
      }).toThrow('INVALID_ANSWER');
      
      expect(() => {
        sessionMetricsManager.recordAnswer(sessionId, {
          questionId: 'q001',
          isCorrect: true,
          isFirstAttempt: true,
          responseTime: -100, // Negative response time
          timestamp: new Date().toISOString()
        });
      }).toThrow('INVALID_ANSWER');
    });
    
    test('should throw SESSION_ENDED when recording answer for ended session', () => {
      const sessionId = sessionMetricsManager.startSession('user123');
      sessionMetricsManager.endSession(sessionId);
      
      expect(() => {
        sessionMetricsManager.recordAnswer(sessionId, {
          questionId: 'q001',
          isCorrect: true,
          isFirstAttempt: true,
          responseTime: 1500,
          timestamp: new Date().toISOString()
        });
      }).toThrow('SESSION_ENDED');
    });
    
    test('should throw SESSION_ENDED when getting current metrics for ended session', () => {
      const sessionId = sessionMetricsManager.startSession('user123');
      sessionMetricsManager.endSession(sessionId);
      
      expect(() => {
        sessionMetricsManager.getCurrentMetrics(sessionId);
      }).toThrow('SESSION_ENDED');
    });
    
    test('should throw SESSION_ALREADY_ENDED when ending an already ended session', () => {
      const sessionId = sessionMetricsManager.startSession('user123');
      sessionMetricsManager.endSession(sessionId);
      
      expect(() => {
        sessionMetricsManager.endSession(sessionId);
      }).toThrow('SESSION_ALREADY_ENDED');
    });
    
    test('should throw SESSION_NOT_ENDED when getting summary for active session', () => {
      const sessionId = sessionMetricsManager.startSession('user123');
      
      expect(() => {
        sessionMetricsManager.getSessionSummary(sessionId);
      }).toThrow('SESSION_NOT_ENDED');
    });
  });
  
  describe('Edge Cases', () => {
    test('should handle session with no answers', () => {
      const sessionId = sessionMetricsManager.startSession('user123');
      const summary = sessionMetricsManager.endSession(sessionId);
      
      expect(summary.questionCount).toBe(0);
      expect(summary.ftcCount).toBe(0);
      expect(summary.ecCount).toBe(0);
      expect(summary.incorrectCount).toBe(0);
      expect(summary.ftcPoints).toBe(0);
      expect(summary.ecPoints).toBe(0);
      expect(summary.basePoints).toBe(0);
      expect(summary.consistency).toBe(1); // Perfect consistency when no answers
      expect(summary.accuracy).toBe(0);    // Zero accuracy when no questions
      expect(summary.totalPoints).toBe(0); // Zero points when no questions
    });
    
    test('should handle session with all incorrect answers', () => {
      const sessionId = sessionMetricsManager.startSession('user123');
      
      // Record 3 incorrect answers
      for (let i = 0; i < 3; i++) {
        sessionMetricsManager.recordAnswer(sessionId, {
          questionId: `q00${i+1}`,
          isCorrect: false,
          isFirstAttempt: true,
          responseTime: 2000,
          timestamp: new Date().toISOString()
        });
      }
      
      const summary = sessionMetricsManager.endSession(sessionId);
      
      expect(summary.questionCount).toBe(3);
      expect(summary.ftcCount).toBe(0);
      expect(summary.ecCount).toBe(0);
      expect(summary.incorrectCount).toBe(3);
      expect(summary.ftcPoints).toBe(0);
      expect(summary.ecPoints).toBe(0);
      expect(summary.basePoints).toBe(0);
      expect(summary.consistency).toBe(1); // Perfect consistency (all incorrect)
      expect(summary.accuracy).toBe(0);    // Zero accuracy (all incorrect)
      expect(summary.totalPoints).toBe(0); // Zero points (all incorrect)
    });
    
    test('should handle multiple attempts on the same question correctly', () => {
      const sessionId = sessionMetricsManager.startSession('user123');
      
      // Multiple attempts on the same question
      sessionMetricsManager.recordAnswer(sessionId, {
        questionId: 'q001',
        isCorrect: false,
        isFirstAttempt: true,
        responseTime: 2000,
        timestamp: new Date().toISOString()
      });
      
      sessionMetricsManager.recordAnswer(sessionId, {
        questionId: 'q001',
        isCorrect: false,
        isFirstAttempt: false,
        responseTime: 1800,
        timestamp: new Date().toISOString()
      });
      
      sessionMetricsManager.recordAnswer(sessionId, {
        questionId: 'q001',
        isCorrect: true,
        isFirstAttempt: false,
        responseTime: 1500,
        timestamp: new Date().toISOString()
      });
      
      const summary = sessionMetricsManager.endSession(sessionId);
      
      expect(summary.questionCount).toBe(1);
      expect(summary.ftcCount).toBe(0);
      expect(summary.ecCount).toBe(1);
      expect(summary.incorrectCount).toBe(0);
      expect(summary.ecPoints).toBe(3); // 1 EC * 3 points = 3
    });
    
    test('should handle BlinkSpeed when there are no FTC answers', () => {
      const sessionId = sessionMetricsManager.startSession('user123');
      
      // Only EC answers, no FTC
      sessionMetricsManager.recordAnswer(sessionId, {
        questionId: 'q001',
        isCorrect: false,
        isFirstAttempt: true,
        responseTime: 2000,
        timestamp: new Date().toISOString()
      });
      
      sessionMetricsManager.recordAnswer(sessionId, {
        questionId: 'q001',
        isCorrect: true,
        isFirstAttempt: false,
        responseTime: 1500,
        timestamp: new Date().toISOString()
      });
      
      const summary = sessionMetricsManager.endSession(sessionId);
      
      expect(summary.ftcCount).toBe(0);
      expect(summary.blinkSpeed).toBe(summary.duration); // BlinkSpeed defaults to session duration when FTCCount is 0
    });
  });
  
  describe('Metrics Calculation', () => {
    test('should calculate FTCPoints correctly', () => {
      const sessionId = sessionMetricsManager.startSession('user123');
      
      // Record 3 FTC answers
      for (let i = 0; i < 3; i++) {
        sessionMetricsManager.recordAnswer(sessionId, {
          questionId: `q00${i+1}`,
          isCorrect: true,
          isFirstAttempt: true,
          responseTime: 1500,
          timestamp: new Date().toISOString()
        });
      }
      
      const summary = sessionMetricsManager.endSession(sessionId);
      expect(summary.ftcCount).toBe(3);
      expect(summary.ftcPoints).toBe(15); // 3 * 5 = 15
    });
    
    test('should calculate ECPoints correctly', () => {
      const sessionId = sessionMetricsManager.startSession('user123');
      
      // Record 2 EC answers
      for (let i = 0; i < 2; i++) {
        // First attempt (incorrect)
        sessionMetricsManager.recordAnswer(sessionId, {
          questionId: `q00${i+1}`,
          isCorrect: false,
          isFirstAttempt: true,
          responseTime: 2000,
          timestamp: new Date().toISOString()
        });
        
        // Second attempt (correct)
        sessionMetricsManager.recordAnswer(sessionId, {
          questionId: `q00${i+1}`,
          isCorrect: true,
          isFirstAttempt: false,
          responseTime: 1500,
          timestamp: new Date().toISOString()
        });
      }
      
      const summary = sessionMetricsManager.endSession(sessionId);
      expect(summary.ecCount).toBe(2);
      expect(summary.ecPoints).toBe(6); // 2 * 3 = 6
    });
    
    test('should calculate BasePoints correctly', () => {
      const sessionId = sessionMetricsManager.startSession('user123');
      
      // Record 2 FTC answers
      for (let i = 0; i < 2; i++) {
        sessionMetricsManager.recordAnswer(sessionId, {
          questionId: `q00${i+1}`,
          isCorrect: true,
          isFirstAttempt: true,
          responseTime: 1500,
          timestamp: new Date().toISOString()
        });
      }
      
      // Record 1 EC answer
      sessionMetricsManager.recordAnswer(sessionId, {
        questionId: 'q003',
        isCorrect: false,
        isFirstAttempt: true,
        responseTime: 2000,
        timestamp: new Date().toISOString()
      });
      
      sessionMetricsManager.recordAnswer(sessionId, {
        questionId: 'q003',
        isCorrect: true,
        isFirstAttempt: false,
        responseTime: 1500,
        timestamp: new Date().toISOString()
      });
      
      const summary = sessionMetricsManager.endSession(sessionId);
      expect(summary.ftcCount).toBe(2);
      expect(summary.ecCount).toBe(1);
      expect(summary.ftcPoints).toBe(10); // 2 * 5 = 10
      expect(summary.ecPoints).toBe(3);   // 1 * 3 = 3
      expect(summary.basePoints).toBe(13); // 10 + 3 = 13
    });
    
    test('should calculate Consistency correctly', () => {
      const sessionId = sessionMetricsManager.startSession('user123');
      
      // Record alternating correct/incorrect answers (poor consistency)
      const answers = [
        { questionId: 'q001', isCorrect: true, isFirstAttempt: true },
        { questionId: 'q002', isCorrect: false, isFirstAttempt: true },
        { questionId: 'q003', isCorrect: true, isFirstAttempt: true },
        { questionId: 'q004', isCorrect: false, isFirstAttempt: true }
      ];
      
      for (const ans of answers) {
        sessionMetricsManager.recordAnswer(sessionId, {
          ...ans,
          responseTime: 1500,
          timestamp: new Date().toISOString()
        });
      }
      
      const summary = sessionMetricsManager.endSession(sessionId);
      
      // 3 streak breaks in 4 questions = 3/(4-1) = 1 consistency
      // Consistency = 1 - 3/3 = 0
      expect(summary.consistency).toBe(0);
      
      // Test perfect consistency
      const sessionId2 = sessionMetricsManager.startSession('user123');
      
      // Record all correct answers (perfect consistency)
      for (let i = 0; i < 4; i++) {
        sessionMetricsManager.recordAnswer(sessionId2, {
          questionId: `q00${i+1}`,
          isCorrect: true,
          isFirstAttempt: true,
          responseTime: 1500,
          timestamp: new Date().toISOString()
        });
      }
      
      const summary2 = sessionMetricsManager.endSession(sessionId2);
      
      // 0 streak breaks in 4 questions
      // Consistency = 1 - 0/3 = 1
      expect(summary2.consistency).toBe(1);
    });
    
    test('should calculate Accuracy correctly', () => {
      const sessionId = sessionMetricsManager.startSession('user123');
      
      // Record 3 correct answers (2 FTC, 1 EC) and 1 incorrect
      sessionMetricsManager.recordAnswer(sessionId, {
        questionId: 'q001',
        isCorrect: true,
        isFirstAttempt: true,
        responseTime: 1500,
        timestamp: new Date().toISOString()
      });
      
      sessionMetricsManager.recordAnswer(sessionId, {
        questionId: 'q002',
        isCorrect: true,
        isFirstAttempt: true,
        responseTime: 1500,
        timestamp: new Date().toISOString()
      });
      
      sessionMetricsManager.recordAnswer(sessionId, {
        questionId: 'q003',
        isCorrect: false,
        isFirstAttempt: true,
        responseTime: 2000,
        timestamp: new Date().toISOString()
      });
      
      sessionMetricsManager.recordAnswer(sessionId, {
        questionId: 'q003',
        isCorrect: true,
        isFirstAttempt: false,
        responseTime: 1500,
        timestamp: new Date().toISOString()
      });
      
      sessionMetricsManager.recordAnswer(sessionId, {
        questionId: 'q004',
        isCorrect: false,
        isFirstAttempt: true,
        responseTime: 2000,
        timestamp: new Date().toISOString()
      });
      
      const summary = sessionMetricsManager.endSession(sessionId);
      
      // 3 correct answers (2 FTC + 1 EC) out of 4 questions
      // Accuracy = 3/4 = 0.75
      expect(summary.accuracy).toBe(0.75);
    });
    
    test('should calculate Speed correctly', () => {
      const sessionId = sessionMetricsManager.startSession('user123');
      
      // Record answers with 1500ms response time (expected time is 3000ms)
      for (let i = 0; i < 3; i++) {
        sessionMetricsManager.recordAnswer(sessionId, {
          questionId: `q00${i+1}`,
          isCorrect: true,
          isFirstAttempt: true,
          responseTime: 1500, // Half of the expected response time
          timestamp: new Date().toISOString()
        });
      }
      
      const summary = sessionMetricsManager.endSession(sessionId);
      
      // Speed = 1 - (1500/3000) = 1 - 0.5 = 0.5
      expect(summary.speed).toBe(0.5);
    });
    
    test('should calculate BonusMultiplier correctly', () => {
      const sessionId = sessionMetricsManager.startSession('user123');
      
      // Set up for: Consistency = 1, Accuracy = 1, Speed = 0.5
      for (let i = 0; i < 3; i++) {
        sessionMetricsManager.recordAnswer(sessionId, {
          questionId: `q00${i+1}`,
          isCorrect: true,
          isFirstAttempt: true,
          responseTime: 1500, // Half of the expected response time
          timestamp: new Date().toISOString()
        });
      }
      
      const summary = sessionMetricsManager.endSession(sessionId);
      
      // BonusMultiplier = 1 + (1 * 0.1) + (1 * 0.1) + (0.5 * 0.1)
      // = 1 + 0.1 + 0.1 + 0.05 = 1.25
      expect(summary.bonusMultiplier).toBeCloseTo(1.25, 2);
    });
    
    test('should calculate BlinkSpeed correctly', () => {
      const sessionId = sessionMetricsManager.startSession('user123');
      
      // Record 2 FTC answers
      for (let i = 0; i < 2; i++) {
        sessionMetricsManager.recordAnswer(sessionId, {
          questionId: `q00${i+1}`,
          isCorrect: true,
          isFirstAttempt: true,
          responseTime: 1000,
          timestamp: new Date().toISOString()
        });
      }
      
      // Simulate some delay before ending the session
      const startTime = new Date(sessionMetricsManager.getCurrentMetrics(sessionId).duration);
      const mockEndTime = new Date(startTime.getTime() + 10000); // 10 seconds later
      
      // Mock the current date for testing
      const realDate = Date;
      global.Date = class extends Date {
        constructor() {
          super();
          return mockEndTime;
        }
        static now() {
          return mockEndTime.getTime();
        }
      } as any;
      
      const summary = sessionMetricsManager.endSession(sessionId);
      
      // BlinkSpeed = SessionDuration / FTCCount ≈ 10000 / 2 = 5000ms
      expect(summary.blinkSpeed).toBeCloseTo(5000, -2); // Allowing some variance
      
      // Restore the original Date
      global.Date = realDate;
    });
    
    test('should calculate TotalPoints correctly', () => {
      const sessionId = sessionMetricsManager.startSession('user123');
      
      // Set up for: FTC = 2, EC = 1, BasePoints = 13, BonusMultiplier = 1.25
      
      // Record 2 FTC answers
      for (let i = 0; i < 2; i++) {
        sessionMetricsManager.recordAnswer(sessionId, {
          questionId: `q00${i+1}`,
          isCorrect: true,
          isFirstAttempt: true,
          responseTime: 1500,
          timestamp: new Date().toISOString()
        });
      }
      
      // Record 1 EC answer
      sessionMetricsManager.recordAnswer(sessionId, {
        questionId: 'q003',
        isCorrect: false,
        isFirstAttempt: true,
        responseTime: 2000,
        timestamp: new Date().toISOString()
      });
      
      sessionMetricsManager.recordAnswer(sessionId, {
        questionId: 'q003',
        isCorrect: true,
        isFirstAttempt: false,
        responseTime: 1500,
        timestamp: new Date().toISOString()
      });
      
      const summary = sessionMetricsManager.endSession(sessionId);
      
      // FTCPoints = 2 * 5 = 10
      // ECPoints = 1 * 3 = 3
      // BasePoints = 10 + 3 = 13
      // BonusMultiplier ≈ 1.25 (from previous test)
      // TotalPoints = 13 * 1.25 = 16.25
      expect(summary.totalPoints).toBeCloseTo(16.25, 2);
    });
  });
  
  describe('Validation Criteria', () => {
    describe('MS-001: Metrics Calculation', () => {
      test('should correctly calculate all metrics', () => {
        const sessionId = sessionMetricsManager.startSession('user123');
        
        // Create a balanced set of answers with known outcomes
        
        // 5 FTC answers
        for (let i = 0; i < 5; i++) {
          sessionMetricsManager.recordAnswer(sessionId, {
            questionId: `q00${i+1}`,
            isCorrect: true,
            isFirstAttempt: true,
            responseTime: 1500,
            timestamp: new Date().toISOString()
          });
        }
        
        // 2 EC answers
        for (let i = 0; i < 2; i++) {
          sessionMetricsManager.recordAnswer(sessionId, {
            questionId: `q00${i+6}`,
            isCorrect: false,
            isFirstAttempt: true,
            responseTime: 2500,
            timestamp: new Date().toISOString()
          });
          
          sessionMetricsManager.recordAnswer(sessionId, {
            questionId: `q00${i+6}`,
            isCorrect: true,
            isFirstAttempt: false,
            responseTime: 1800,
            timestamp: new Date().toISOString()
          });
        }
        
        // 1 incorrect answer
        sessionMetricsManager.recordAnswer(sessionId, {
          questionId: 'q008',
          isCorrect: false,
          isFirstAttempt: true,
          responseTime: 3000,
          timestamp: new Date().toISOString()
        });
        
        const summary = sessionMetricsManager.endSession(sessionId);
        
        // Verify all metrics
        expect(summary.questionCount).toBe(8);
        expect(summary.ftcCount).toBe(5);
        expect(summary.ecCount).toBe(2);
        expect(summary.incorrectCount).toBe(1);
        
        // FTCPoints = 5 * 5 = 25
        expect(summary.ftcPoints).toBe(25);
        
        // ECPoints = 2 * 3 = 6
        expect(summary.ecPoints).toBe(6);
        
        // BasePoints = 25 + 6 = 31
        expect(summary.basePoints).toBe(31);
        
        // Verify that accuracy, consistency, speed, bonusMultiplier, and totalPoints
        // are calculated and have reasonable values
        expect(summary.accuracy).toBeCloseTo(7/8, 2); // (5+2)/8 = 0.875
        expect(summary.consistency).toBeGreaterThanOrEqual(0);
        expect(summary.consistency).toBeLessThanOrEqual(1);
        expect(summary.speed).toBeGreaterThanOrEqual(0);
        expect(summary.speed).toBeLessThanOrEqual(1);
        expect(summary.bonusMultiplier).toBeGreaterThanOrEqual(1);
        expect(summary.totalPoints).toBeGreaterThan(summary.basePoints);
      });
    });
    
    describe('MS-005: Formula Precision', () => {
      test('should calculate with appropriate precision', () => {
        const sessionId = sessionMetricsManager.startSession('user123');
        
        // Add answers to get predictable metrics values
        sessionMetricsManager.recordAnswer(sessionId, {
          questionId: 'q001',
          isCorrect: true,
          isFirstAttempt: true,
          responseTime: 1500, // 0.5 of expected time
          timestamp: new Date().toISOString()
        });
        
        sessionMetricsManager.recordAnswer(sessionId, {
          questionId: 'q002',
          isCorrect: true,
          isFirstAttempt: true,
          responseTime: 1500,
          timestamp: new Date().toISOString()
        });
        
        sessionMetricsManager.recordAnswer(sessionId, {
          questionId: 'q003',
          isCorrect: true,
          isFirstAttempt: true,
          responseTime: 1500,
          timestamp: new Date().toISOString()
        });
        
        const summary = sessionMetricsManager.endSession(sessionId);
        
        // Check precision of floating-point metrics
        expect(Number.isFinite(summary.consistency)).toBe(true);
        expect(Number.isFinite(summary.accuracy)).toBe(true);
        expect(Number.isFinite(summary.speed)).toBe(true);
        expect(Number.isFinite(summary.bonusMultiplier)).toBe(true);
        expect(Number.isFinite(summary.totalPoints)).toBe(true);
        
        // Specifically check that speed is calculated correctly
        // Speed = 1 - (1500/3000) = 0.5
        expect(summary.speed).toBeCloseTo(0.5, 2);
        
        // Check bonusMultiplier precision
        // BonusMultiplier = 1 + (1 * 0.1) + (1 * 0.1) + (0.5 * 0.1) = 1.25
        expect(summary.bonusMultiplier).toBeCloseTo(1.25, 2);
        
        // Check totalPoints precision
        // FTCPoints = 3 * 5 = 15
        // TotalPoints = 15 * 1.25 = 18.75
        expect(summary.totalPoints).toBeCloseTo(18.75, 2);
      });
    });
  });
});