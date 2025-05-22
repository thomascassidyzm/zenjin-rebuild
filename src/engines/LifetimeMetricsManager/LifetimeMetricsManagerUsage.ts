/**
 * Example usage of LifetimeMetricsManager
 * 
 * This file demonstrates how to use the LifetimeMetricsManager component
 * in a real application context.
 */

import { LifetimeMetricsManager } from './LifetimeMetricsManager';
import { InMemoryMetricsStorage } from './InMemoryMetricsStorage';
import { BasicMetricsCalculator } from './BasicMetricsCalculator';

// Create storage and calculator instances
const metricsStorage = new InMemoryMetricsStorage();
const metricsCalculator = new BasicMetricsCalculator();

// Create lifetime metrics manager with custom configuration
const lifetimeMetricsManager = new LifetimeMetricsManager(
  metricsStorage,
  metricsCalculator,
  {
    blinkSpeedSessionsCount: 5,
    blinkSpeedWeights: [0.5, 0.25, 0.15, 0.07, 0.03],
    validRankingMetrics: ['evolution', 'totalPoints', 'currentBlinkSpeed', 'streakDays'],
    defaultRankingMetric: 'evolution'
  }
);

// Example usage function
async function runExample() {
  try {
    console.log('Starting LifetimeMetricsManager example...');
    
    // Create a user and add some sessions
    const userId = 'user123';
    
    // Add first session
    console.log('\nAdding first session for user123...');
    const session1 = {
      sessionId: 'session1',
      ftcPoints: 80,
      ecPoints: 9,
      basePoints: 89,
      bonusMultiplier: 1.25,
      blinkSpeed: 15000,
      totalPoints: 111.25
    };
    
    let metrics = lifetimeMetricsManager.updateLifetimeMetrics(userId, session1);
    
    console.log(`Updated metrics after session 1:`);
    console.log(`Total sessions: ${metrics.totalSessions}`);
    console.log(`Total points: ${metrics.totalPoints}`);
    console.log(`Current blink speed: ${metrics.currentBlinkSpeed} ms`);
    console.log(`Evolution: ${metrics.evolution}`);
    console.log(`Current streak: ${metrics.streakDays} days`);
    console.log(`Longest streak: ${metrics.longestStreakDays} days`);
    
    // Add second session (assume it's the next day)
    console.log('\nAdding second session for user123 (next day)...');
    const session2 = {
      sessionId: 'session2',
      ftcPoints: 90,
      ecPoints: 5,
      basePoints: 95,
      bonusMultiplier: 1.3,
      blinkSpeed: 13000,
      totalPoints: 123.5
    };
    
    // Simulate next day for streak calculation
    const originalDateNow = Date.now;
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1);
    const mockDateNow = jest.fn(() => currentDate.getTime());
    Date.now = mockDateNow;
    
    metrics = lifetimeMetricsManager.updateLifetimeMetrics(userId, session2);
    
    // Restore original Date.now
    Date.now = originalDateNow;
    
    console.log(`Updated metrics after session 2:`);
    console.log(`Total sessions: ${metrics.totalSessions}`);
    console.log(`Total points: ${metrics.totalPoints}`);
    console.log(`Current blink speed: ${metrics.currentBlinkSpeed} ms`);
    console.log(`Evolution: ${metrics.evolution}`);
    console.log(`Current streak: ${metrics.streakDays} days`);
    console.log(`Longest streak: ${metrics.longestStreakDays} days`);
    
    // Create more users to demonstrate rankings
    console.log('\nCreating additional users for ranking demonstration...');
    
    // Define user data
    const usersData = [
      { userId: 'user456', sessions: 15, points: 1800, blinkSpeed: 9000 },
      { userId: 'user789', sessions: 8, points: 1200, blinkSpeed: 11000 },
      { userId: 'user234', sessions: 20, points: 2500, blinkSpeed: 12000 },
      { userId: 'user567', sessions: 5, points: 600, blinkSpeed: 14000 }
    ];
    
    // Create users
    for (const userData of usersData) {
      // Create initial metrics
      metricsStorage.saveLifetimeMetrics({
        userId: userData.userId,
        totalSessions: userData.sessions,
        totalPoints: userData.points,
        currentBlinkSpeed: userData.blinkSpeed,
        evolution: userData.points / userData.blinkSpeed,
        streakDays: 1,
        longestStreakDays: 5
      });
    }
    
    // Recalculate global rankings
    console.log('\nRecalculating global rankings...');
    lifetimeMetricsManager.recalculateGlobalRankings();
    
    // Get global ranking for our user
    console.log('\nGetting global ranking for user123...');
    try {
      const ranking = lifetimeMetricsManager.getGlobalRanking(userId);
      console.log(`Percentile: ${ranking.percentile.toFixed(2)}%`);
      console.log(`Rank: ${ranking.rank} of ${ranking.totalUsers}`);
      console.log(`Calculation date: ${ranking.calculationDate}`);
    } catch (error) {
      console.log(`Error getting ranking: ${error.message}`);
    }
    
    // Get top-ranked users
    console.log('\nGetting top 3 users by evolution...');
    const topUsers = lifetimeMetricsManager.getTopRankedUsers(3, 'evolution');
    console.log('Top 3 users by evolution:');
    topUsers.forEach(user => {
      console.log(`#${user.rank}: User ${user.userId} - Evolution: ${user.metricValue.toFixed(4)}`);
    });
    
    // Calculate evolution for our user directly
    console.log('\nCalculating evolution metric for user123...');
    const evolution = lifetimeMetricsManager.calculateEvolution(userId);
    console.log(`Evolution: ${evolution.toFixed(4)}`);
    
    // Get a non-existent user to demonstrate error handling
    console.log('\nTrying to get metrics for a non-existent user...');
    try {
      const nonExistentMetrics = lifetimeMetricsManager.getLifetimeMetrics('nonExistentUser');
      console.log('This should not be printed');
    } catch (error) {
      console.log(`Caught error: ${error.message}`);
    }
    
    console.log('\nLifetimeMetricsManager example completed');
  } catch (error) {
    console.error(`Error in example: ${error.message}`);
  }
}

// Run the example
runExample();
