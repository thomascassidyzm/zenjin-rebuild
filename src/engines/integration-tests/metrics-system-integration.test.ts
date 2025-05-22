/**
 * Integration tests for the MetricsSystem components.
 * 
 * This file tests the interaction between the MetricsCalculator,
 * SessionMetricsManager, LifetimeMetricsManager, and MetricsStorage components.
 */

import { MetricsCalculator } from '../MetricsCalculator';
import { SessionMetricsManager } from '../SessionMetricsManager';
import { LifetimeMetricsManager } from '../LifetimeMetricsManager';
import { MetricsStorage } from '../MetricsStorage';

describe('MetricsSystem Integration Tests', () => {
  let metricsCalculator: MetricsCalculator;
  let sessionMetricsManager: SessionMetricsManager;
  let lifetimeMetricsManager: LifetimeMetricsManager;
  let metricsStorage: MetricsStorage;

  beforeEach(() => {
    // Initialize components
    metricsCalculator = new MetricsCalculator();
    metricsStorage = new MetricsStorage();
    sessionMetricsManager = new SessionMetricsManager(metricsCalculator, metricsStorage);
    lifetimeMetricsManager = new LifetimeMetricsManager(metricsStorage);
  });

  test('Full metrics calculation and storage pipeline', async () => {
    // This test verifies that the metrics components can work together
    // to calculate, store, and retrieve metrics for a session
    
    // 1. Create sample session data
    const sessionData = {
      userId: 'user123',
      sessionId: 'session456',
      duration: 300000, // 5 minutes
      questionCount: 20,
      ftcCount: 15,
      ecCount: 3,
      incorrectCount: 2,
      responseTimeData: Array(20).fill(0).map(() => Math.floor(Math.random() * 3000) + 500)
    };

    // 2. Calculate metrics using MetricsCalculator
    const metrics = metricsCalculator.calculateSessionMetrics(sessionData);
    
    // Verify calculated metrics
    expect(metrics.ftcPoints).toBe(75); // 15 * 5
    expect(metrics.ecPoints).toBe(9); // 3 * 3
    expect(metrics.basePoints).toBe(84); // 75 + 9
    expect(metrics.accuracy).toBe(0.9); // (15 + 3) / 20
    expect(metrics.consistency).toBe(0.9); // Using accuracy as proxy
    expect(metrics.bonusMultiplier).toBeGreaterThan(1);
    expect(metrics.totalPoints).toBeGreaterThan(metrics.basePoints);

    // 3. Store session metrics
    await sessionMetricsManager.storeSessionMetrics({
      ...sessionData,
      metrics
    });
    
    // 4. Retrieve stored session metrics
    const retrievedSession = await sessionMetricsManager.getSessionMetrics(sessionData.sessionId);
    expect(retrievedSession).toBeDefined();
    expect(retrievedSession.metrics.totalPoints).toBe(metrics.totalPoints);
    
    // 5. Update lifetime metrics
    await lifetimeMetricsManager.updateLifetimeMetrics(sessionData.userId, metrics);
    
    // 6. Retrieve lifetime metrics
    const lifetimeMetrics = await lifetimeMetricsManager.getLifetimeMetrics(sessionData.userId);
    expect(lifetimeMetrics).toBeDefined();
    expect(lifetimeMetrics.totalSessions).toBe(1);
    expect(lifetimeMetrics.totalPoints).toBe(metrics.totalPoints);
    
    // Complete integration test passed
  });
});