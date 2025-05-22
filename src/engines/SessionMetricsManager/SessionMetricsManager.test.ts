/**
 * Test case for SessionMetricsManager
 * 
 * This file demonstrates how to use the SessionMetricsManager component
 * with a typical usage example based on the requirements.
 */

import { SessionMetricsManager } from './session-metrics-manager';

// Function to sleep for a given number of milliseconds
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Sample user data
const userId = 'user123';

// Sample session configuration
const sessionConfig = {
  duration: 300, // 5 minutes
  questionCount: 20
};

// Main test function
async function runTest() {
  console.log('Starting SessionMetricsManager test...');
  
  // Create session metrics manager
  const sessionMetricsManager = new SessionMetricsManager();
  
  // Start a new session
  const sessionId = sessionMetricsManager.startSession(userId, sessionConfig);
  console.log(`Started session: ${sessionId}`);
  
  // Record a series of answers to simulate a learning session
  const answers = [
    // Questions 1-5: All FTC with various response times
    {
      questionId: 'q001',
      isCorrect: true,
      isFirstAttempt: true,
      responseTime: 1500,
      timestamp: new Date().toISOString()
    },
    {
      questionId: 'q002',
      isCorrect: true,
      isFirstAttempt: true,
      responseTime: 1800,
      timestamp: new Date().toISOString()
    },
    {
      questionId: 'q003',
      isCorrect: true,
      isFirstAttempt: true,
      responseTime: 2100,
      timestamp: new Date().toISOString()
    },
    {
      questionId: 'q004',
      isCorrect: true,
      isFirstAttempt: true,
      responseTime: 1700,
      timestamp: new Date().toISOString()
    },
    {
      questionId: 'q005',
      isCorrect: true,
      isFirstAttempt: true,
      responseTime: 1900,
      timestamp: new Date().toISOString()
    },
    
    // Question 6: Incorrect first, then correct (EC)
    {
      questionId: 'q006',
      isCorrect: false,
      isFirstAttempt: true,
      responseTime: 2200,
      timestamp: new Date().toISOString()
    },
    {
      questionId: 'q006',
      isCorrect: true,
      isFirstAttempt: false,
      responseTime: 1600,
      timestamp: new Date().toISOString()
    },
    
    // Questions 7-10: Mix of FTC and incorrect
    {
      questionId: 'q007',
      isCorrect: true,
      isFirstAttempt: true,
      responseTime: 1500,
      timestamp: new Date().toISOString()
    },
    {
      questionId: 'q008',
      isCorrect: false,
      isFirstAttempt: true,
      responseTime: 2800,
      timestamp: new Date().toISOString()
    },
    {
      questionId: 'q009',
      isCorrect: true,
      isFirstAttempt: true,
      responseTime: 1600,
      timestamp: new Date().toISOString()
    },
    {
      questionId: 'q010',
      isCorrect: false,
      isFirstAttempt: true,
      responseTime: 3000,
      timestamp: new Date().toISOString()
    },
    
    // Questions 11-15: All FTC with various response times
    {
      questionId: 'q011',
      isCorrect: true,
      isFirstAttempt: true,
      responseTime: 1400,
      timestamp: new Date().toISOString()
    },
    {
      questionId: 'q012',
      isCorrect: true,
      isFirstAttempt: true,
      responseTime: 1700,
      timestamp: new Date().toISOString()
    },
    {
      questionId: 'q013',
      isCorrect: true,
      isFirstAttempt: true,
      responseTime: 1900,
      timestamp: new Date().toISOString()
    },
    {
      questionId: 'q014',
      isCorrect: true,
      isFirstAttempt: true,
      responseTime: 2000,
      timestamp: new Date().toISOString()
    },
    {
      questionId: 'q015',
      isCorrect: true,
      isFirstAttempt: true,
      responseTime: 1800,
      timestamp: new Date().toISOString()
    },
    
    // Questions 16-17: EC answers
    {
      questionId: 'q016',
      isCorrect: false,
      isFirstAttempt: true,
      responseTime: 2500,
      timestamp: new Date().toISOString()
    },
    {
      questionId: 'q016',
      isCorrect: true,
      isFirstAttempt: false,
      responseTime: 1700,
      timestamp: new Date().toISOString()
    },
    {
      questionId: 'q017',
      isCorrect: false,
      isFirstAttempt: true,
      responseTime: 2700,
      timestamp: new Date().toISOString()
    },
    {
      questionId: 'q017',
      isCorrect: true,
      isFirstAttempt: false,
      responseTime: 1900,
      timestamp: new Date().toISOString()
    },
    
    // Questions 18-20: More FTC
    {
      questionId: 'q018',
      isCorrect: true,
      isFirstAttempt: true,
      responseTime: 1600,
      timestamp: new Date().toISOString()
    },
    {
      questionId: 'q019',
      isCorrect: true,
      isFirstAttempt: true,
      responseTime: 1700,
      timestamp: new Date().toISOString()
    },
    {
      questionId: 'q020',
      isCorrect: true,
      isFirstAttempt: true,
      responseTime: 1500,
      timestamp: new Date().toISOString()
    }
  ];
  
  // Record answers with some delay to simulate a real session
  for (const answer of answers) {
    await sleep(100); // Simulate 100ms between answers
    sessionMetricsManager.recordAnswer(sessionId, answer);
    
    // Check current metrics after every 5th answer
    if (answers.indexOf(answer) % 5 === 4) {
      const currentMetrics = sessionMetricsManager.getCurrentMetrics(sessionId);
      console.log('\nCurrent Metrics:');
      console.log(`Questions answered: ${currentMetrics.questionCount}`);
      console.log(`FTC count: ${currentMetrics.ftcCount}`);
      console.log(`EC count: ${currentMetrics.ecCount}`);
      console.log(`Incorrect count: ${currentMetrics.incorrectCount}`);
      console.log(`Current points: ${currentMetrics.currentPoints}`);
      console.log(`Current duration: ${currentMetrics.duration / 1000} seconds`);
    }
  }
  
  // End the session
  console.log('\nEnding session...');
  const summary = sessionMetricsManager.endSession(sessionId);
  
  // Display session summary
  console.log('\nSession Summary:');
  console.log(`Session ID: ${summary.sessionId}`);
  console.log(`User ID: ${summary.userId}`);
  console.log(`Duration: ${summary.duration / 1000} seconds`);
  console.log(`Questions: ${summary.questionCount}`);
  console.log(`FTC count: ${summary.ftcCount}`);
  console.log(`EC count: ${summary.ecCount}`);
  console.log(`Incorrect count: ${summary.incorrectCount}`);
  console.log(`FTC points: ${summary.ftcPoints}`);
  console.log(`EC points: ${summary.ecPoints}`);
  console.log(`Base points: ${summary.basePoints}`);
  console.log(`Consistency: ${summary.consistency.toFixed(2)}`);
  console.log(`Accuracy: ${summary.accuracy.toFixed(2)}`);
  console.log(`Speed: ${summary.speed.toFixed(2)}`);
  console.log(`Bonus multiplier: ${summary.bonusMultiplier.toFixed(2)}`);
  console.log(`Blink speed: ${summary.blinkSpeed.toFixed(2)} ms`);
  console.log(`Total points: ${summary.totalPoints.toFixed(2)}`);
  console.log(`Start time: ${summary.startTime}`);
  console.log(`End time: ${summary.endTime}`);
  
  // Verify that we can retrieve the summary later
  console.log('\nRetrieving session summary...');
  const retrievedSummary = sessionMetricsManager.getSessionSummary(sessionId);
  console.log(`Retrieved session summary for: ${retrievedSummary.sessionId}`);
  
  // Verify metrics calculations
  console.log('\nVerifying metrics calculations:');
  
  // Expected counts based on the test data
  const expectedFtcCount = 16; // 16 questions answered correctly on first attempt
  const expectedEcCount = 3;   // 3 questions answered correctly after initial failure
  const expectedIncorrectCount = 1; // 1 question never answered correctly
  
  // Expected points
  const expectedFtcPoints = expectedFtcCount * 5; // 16 * 5 = 80
  const expectedEcPoints = expectedEcCount * 3;   // 3 * 3 = 9
  const expectedBasePoints = expectedFtcPoints + expectedEcPoints; // 80 + 9 = 89
  
  console.log(`FTC Count - Expected: ${expectedFtcCount}, Actual: ${summary.ftcCount}`);
  console.log(`EC Count - Expected: ${expectedEcCount}, Actual: ${summary.ecCount}`);
  console.log(`Incorrect Count - Expected: ${expectedIncorrectCount}, Actual: ${summary.incorrectCount}`);
  console.log(`FTC Points - Expected: ${expectedFtcPoints}, Actual: ${summary.ftcPoints}`);
  console.log(`EC Points - Expected: ${expectedEcPoints}, Actual: ${summary.ecPoints}`);
  console.log(`Base Points - Expected: ${expectedBasePoints}, Actual: ${summary.basePoints}`);
  
  console.log('\nTest completed.');
}

// Run the test
runTest().catch(error => {
  console.error('Test failed:', error);
});
