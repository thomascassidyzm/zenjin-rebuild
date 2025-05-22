/**
 * MetricsCalculator Tests
 * 
 * This file contains tests for the MetricsCalculator component to verify that
 * it performs calculations with the correct formulas and precision as per
 * the MS-005 validation criterion.
 */

import { MetricsCalculator } from './MetricsCalculator';

// Create a metrics calculator instance for testing
const metricsCalculator = new MetricsCalculator();

/**
 * Test calculateFTCPoints
 */
function testCalculateFTCPoints() {
  console.log('Testing calculateFTCPoints...');
  
  // Test with valid input
  try {
    const ftcCount = 16;
    const expected = 80;
    const actual = metricsCalculator.calculateFTCPoints(ftcCount);
    
    console.log(`FTC Count: ${ftcCount}, Expected: ${expected}, Actual: ${actual}`);
    console.assert(actual === expected, `Expected ${expected}, but got ${actual}`);
  } catch (error) {
    console.error(`Unexpected error: ${error.message}`);
  }
  
  // Test with zero
  try {
    const ftcCount = 0;
    const expected = 0;
    const actual = metricsCalculator.calculateFTCPoints(ftcCount);
    
    console.log(`FTC Count: ${ftcCount}, Expected: ${expected}, Actual: ${actual}`);
    console.assert(actual === expected, `Expected ${expected}, but got ${actual}`);
  } catch (error) {
    console.error(`Unexpected error: ${error.message}`);
  }
  
  // Test with invalid input (negative)
  try {
    const ftcCount = -5;
    metricsCalculator.calculateFTCPoints(ftcCount);
    console.error('Expected error for negative FTC count, but none was thrown');
  } catch (error) {
    console.log(`Expected error: ${error.message}`);
  }
  
  // Test with invalid input (non-integer)
  try {
    const ftcCount = 5.5;
    metricsCalculator.calculateFTCPoints(ftcCount as any);
    console.error('Expected error for non-integer FTC count, but none was thrown');
  } catch (error) {
    console.log(`Expected error: ${error.message}`);
  }
  
  console.log('calculateFTCPoints tests completed.\n');
}

/**
 * Test calculateECPoints
 */
function testCalculateECPoints() {
  console.log('Testing calculateECPoints...');
  
  // Test with valid input
  try {
    const ecCount = 3;
    const expected = 9;
    const actual = metricsCalculator.calculateECPoints(ecCount);
    
    console.log(`EC Count: ${ecCount}, Expected: ${expected}, Actual: ${actual}`);
    console.assert(actual === expected, `Expected ${expected}, but got ${actual}`);
  } catch (error) {
    console.error(`Unexpected error: ${error.message}`);
  }
  
  // Test with zero
  try {
    const ecCount = 0;
    const expected = 0;
    const actual = metricsCalculator.calculateECPoints(ecCount);
    
    console.log(`EC Count: ${ecCount}, Expected: ${expected}, Actual: ${actual}`);
    console.assert(actual === expected, `Expected ${expected}, but got ${actual}`);
  } catch (error) {
    console.error(`Unexpected error: ${error.message}`);
  }
  
  // Test with invalid input (negative)
  try {
    const ecCount = -3;
    metricsCalculator.calculateECPoints(ecCount);
    console.error('Expected error for negative EC count, but none was thrown');
  } catch (error) {
    console.log(`Expected error: ${error.message}`);
  }
  
  console.log('calculateECPoints tests completed.\n');
}

/**
 * Test calculateBonusMultiplier
 */
function testCalculateBonusMultiplier() {
  console.log('Testing calculateBonusMultiplier...');
  
  // Test with valid inputs
  try {
    const consistency = 0.85;
    const accuracy = 0.95;
    const speed = 0.78;
    const expected = 1.26; // 1 + (0.85 * 0.1) + (0.95 * 0.1) + (0.78 * 0.1) = 1.258 rounded to 1.26
    const actual = metricsCalculator.calculateBonusMultiplier(consistency, accuracy, speed);
    
    console.log(`Consistency: ${consistency}, Accuracy: ${accuracy}, Speed: ${speed}`);
    console.log(`Expected: ${expected}, Actual: ${actual}`);
    console.assert(actual === expected, `Expected ${expected}, but got ${actual}`);
  } catch (error) {
    console.error(`Unexpected error: ${error.message}`);
  }
  
  // Test with zeros
  try {
    const consistency = 0;
    const accuracy = 0;
    const speed = 0;
    const expected = 1.0; // Base multiplier of 1.0
    const actual = metricsCalculator.calculateBonusMultiplier(consistency, accuracy, speed);
    
    console.log(`Consistency: ${consistency}, Accuracy: ${accuracy}, Speed: ${speed}`);
    console.log(`Expected: ${expected}, Actual: ${actual}`);
    console.assert(actual === expected, `Expected ${expected}, but got ${actual}`);
  } catch (error) {
    console.error(`Unexpected error: ${error.message}`);
  }
  
  // Test with max values
  try {
    const consistency = 1;
    const accuracy = 1;
    const speed = 1;
    const expected = 1.3; // 1 + (1 * 0.1) + (1 * 0.1) + (1 * 0.1) = 1.3
    const actual = metricsCalculator.calculateBonusMultiplier(consistency, accuracy, speed);
    
    console.log(`Consistency: ${consistency}, Accuracy: ${accuracy}, Speed: ${speed}`);
    console.log(`Expected: ${expected}, Actual: ${actual}`);
    console.assert(actual === expected, `Expected ${expected}, but got ${actual}`);
  } catch (error) {
    console.error(`Unexpected error: ${error.message}`);
  }
  
  // Test with invalid input (negative consistency)
  try {
    const consistency = -0.5;
    const accuracy = 0.8;
    const speed = 0.7;
    metricsCalculator.calculateBonusMultiplier(consistency, accuracy, speed);
    console.error('Expected error for negative consistency, but none was thrown');
  } catch (error) {
    console.log(`Expected error: ${error.message}`);
  }
  
  // Test with invalid input (consistency > 1)
  try {
    const consistency = 1.5;
    const accuracy = 0.8;
    const speed = 0.7;
    metricsCalculator.calculateBonusMultiplier(consistency, accuracy, speed);
    console.error('Expected error for consistency > 1, but none was thrown');
  } catch (error) {
    console.log(`Expected error: ${error.message}`);
  }
  
  console.log('calculateBonusMultiplier tests completed.\n');
}

/**
 * Test calculateBlinkSpeed
 */
function testCalculateBlinkSpeed() {
  console.log('Testing calculateBlinkSpeed...');
  
  // Test with valid inputs
  try {
    const duration = 240000;
    const ftcCount = 16;
    const expected = 15000;
    const actual = metricsCalculator.calculateBlinkSpeed(duration, ftcCount);
    
    console.log(`Duration: ${duration}, FTC Count: ${ftcCount}`);
    console.log(`Expected: ${expected}, Actual: ${actual}`);
    console.assert(actual === expected, `Expected ${expected}, but got ${actual}`);
  } catch (error) {
    console.error(`Unexpected error: ${error.message}`);
  }
  
  // Test with zero FTC count (should return duration as maximum blink speed)
  try {
    const duration = 240000;
    const ftcCount = 0;
    const expected = 240000;
    const actual = metricsCalculator.calculateBlinkSpeed(duration, ftcCount);
    
    console.log(`Duration: ${duration}, FTC Count: ${ftcCount}`);
    console.log(`Expected: ${expected}, Actual: ${actual}`);
    console.assert(actual === expected, `Expected ${expected}, but got ${actual}`);
  } catch (error) {
    console.error(`Unexpected error: ${error.message}`);
  }
  
  // Test with invalid input (negative duration)
  try {
    const duration = -240000;
    const ftcCount = 16;
    metricsCalculator.calculateBlinkSpeed(duration, ftcCount);
    console.error('Expected error for negative duration, but none was thrown');
  } catch (error) {
    console.log(`Expected error: ${error.message}`);
  }
  
  // Test with invalid input (negative FTC count)
  try {
    const duration = 240000;
    const ftcCount = -16;
    metricsCalculator.calculateBlinkSpeed(duration, ftcCount);
    console.error('Expected error for negative FTC count, but none was thrown');
  } catch (error) {
    console.log(`Expected error: ${error.message}`);
  }
  
  console.log('calculateBlinkSpeed tests completed.\n');
}

/**
 * Test calculateEvolution
 */
function testCalculateEvolution() {
  console.log('Testing calculateEvolution...');
  
  // Test with valid inputs
  try {
    const totalPoints = 4250;
    const blinkSpeed = 12500;
    const expected = 0.34;
    const actual = metricsCalculator.calculateEvolution(totalPoints, blinkSpeed);
    
    console.log(`Total Points: ${totalPoints}, Blink Speed: ${blinkSpeed}`);
    console.log(`Expected: ${expected}, Actual: ${actual}`);
    console.assert(actual === expected, `Expected ${expected}, but got ${actual}`);
  } catch (error) {
    console.error(`Unexpected error: ${error.message}`);
  }
  
  // Test with zero blink speed (should return 0)
  try {
    const totalPoints = 4250;
    const blinkSpeed = 0;
    const expected = 0;
    const actual = metricsCalculator.calculateEvolution(totalPoints, blinkSpeed);
    
    console.log(`Total Points: ${totalPoints}, Blink Speed: ${blinkSpeed}`);
    console.log(`Expected: ${expected}, Actual: ${actual}`);
    console.assert(actual === expected, `Expected ${expected}, but got ${actual}`);
  } catch (error) {
    console.error(`Unexpected error: ${error.message}`);
  }
  
  // Test with invalid input (negative total points)
  try {
    const totalPoints = -4250;
    const blinkSpeed = 12500;
    metricsCalculator.calculateEvolution(totalPoints, blinkSpeed);
    console.error('Expected error for negative total points, but none was thrown');
  } catch (error) {
    console.log(`Expected error: ${error.message}`);
  }
  
  // Test with invalid input (negative blink speed)
  try {
    const totalPoints = 4250;
    const blinkSpeed = -12500;
    metricsCalculator.calculateEvolution(totalPoints, blinkSpeed);
    console.error('Expected error for negative blink speed, but none was thrown');
  } catch (error) {
    console.log(`Expected error: ${error.message}`);
  }
  
  console.log('calculateEvolution tests completed.\n');
}

/**
 * Test calculateSessionMetrics
 */
function testCalculateSessionMetrics() {
  console.log('Testing calculateSessionMetrics...');
  
  // Test with valid inputs and response time data
  try {
    const sessionData = {
      duration: 240000,
      questionCount: 20,
      ftcCount: 16,
      ecCount: 3,
      incorrectCount: 1,
      responseTimeData: [1200, 1500, 1800, 1300, 1600, 1400, 1700, 1200, 1900, 1500, 
                         1400, 1600, 1300, 1800, 1500, 1700, 1400, 1600, 1500, 1700]
    };
    
    const result = metricsCalculator.calculateSessionMetrics(sessionData);
    
    console.log('Session Metrics Result:');
    console.log(`FTC Points: ${result.ftcPoints} (Expected: 80)`);
    console.assert(result.ftcPoints === 80, `Expected FTC points: 80, but got ${result.ftcPoints}`);
    
    console.log(`EC Points: ${result.ecPoints} (Expected: 9)`);
    console.assert(result.ecPoints === 9, `Expected EC points: 9, but got ${result.ecPoints}`);
    
    console.log(`Base Points: ${result.basePoints} (Expected: 89)`);
    console.assert(result.basePoints === 89, `Expected base points: 89, but got ${result.basePoints}`);
    
    console.log(`Consistency: ${result.consistency}`);
    console.log(`Accuracy: ${result.accuracy} (Expected: 0.95)`);
    console.assert(result.accuracy === 0.95, `Expected accuracy: 0.95, but got ${result.accuracy}`);
    
    console.log(`Speed: ${result.speed}`);
    console.log(`Bonus Multiplier: ${result.bonusMultiplier}`);
    console.log(`Blink Speed: ${result.blinkSpeed} ms (Expected: 15000)`);
    console.assert(result.blinkSpeed === 15000, `Expected blink speed: 15000, but got ${result.blinkSpeed}`);
    
    console.log(`Total Points: ${result.totalPoints}`);
  } catch (error) {
    console.error(`Unexpected error: ${error.message}`);
  }
  
  // Test with valid inputs but no response time data
  try {
    const sessionData = {
      duration: 240000,
      questionCount: 20,
      ftcCount: 16,
      ecCount: 3,
      incorrectCount: 1
    };
    
    const result = metricsCalculator.calculateSessionMetrics(sessionData);
    
    console.log('\nSession Metrics Result (no response time data):');
    console.log(`FTC Points: ${result.ftcPoints} (Expected: 80)`);
    console.assert(result.ftcPoints === 80, `Expected FTC points: 80, but got ${result.ftcPoints}`);
    
    console.log(`EC Points: ${result.ecPoints} (Expected: 9)`);
    console.assert(result.ecPoints === 9, `Expected EC points: 9, but got ${result.ecPoints}`);
    
    console.log(`Base Points: ${result.basePoints} (Expected: 89)`);
    console.assert(result.basePoints === 89, `Expected base points: 89, but got ${result.basePoints}`);
    
    console.log(`Consistency: ${result.consistency}`);
    console.log(`Accuracy: ${result.accuracy} (Expected: 0.95)`);
    console.assert(result.accuracy === 0.95, `Expected accuracy: 0.95, but got ${result.accuracy}`);
    
    console.log(`Speed: ${result.speed} (Expected: 0.5)`);
    console.assert(result.speed === 0.5, `Expected speed: 0.5, but got ${result.speed}`);
    
    console.log(`Bonus Multiplier: ${result.bonusMultiplier}`);
    console.log(`Blink Speed: ${result.blinkSpeed} ms (Expected: 15000)`);
    console.assert(result.blinkSpeed === 15000, `Expected blink speed: 15000, but got ${result.blinkSpeed}`);
    
    console.log(`Total Points: ${result.totalPoints}`);
  } catch (error) {
    console.error(`Unexpected error: ${error.message}`);
  }
  
  // Test with invalid session data (inconsistent counts)
  try {
    const sessionData = {
      duration: 240000,
      questionCount: 20,
      ftcCount: 16,
      ecCount: 3,
      incorrectCount: 2 // Should be 1 to match question count
    };
    
    metricsCalculator.calculateSessionMetrics(sessionData);
    console.error('Expected error for inconsistent counts, but none was thrown');
  } catch (error) {
    console.log(`\nExpected error: ${error.message}`);
  }
  
  // Test with invalid session data (negative duration)
  try {
    const sessionData = {
      duration: -240000,
      questionCount: 20,
      ftcCount: 16,
      ecCount: 3,
      incorrectCount: 1
    };
    
    metricsCalculator.calculateSessionMetrics(sessionData);
    console.error('Expected error for negative duration, but none was thrown');
  } catch (error) {
    console.log(`Expected error: ${error.message}`);
  }
  
  console.log('calculateSessionMetrics tests completed.\n');
}

/**
 * Run all tests
 */
function runTests() {
  console.log('=== MetricsCalculator Tests ===\n');
  
  testCalculateFTCPoints();
  testCalculateECPoints();
  testCalculateBonusMultiplier();
  testCalculateBlinkSpeed();
  testCalculateEvolution();
  testCalculateSessionMetrics();
  
  console.log('=== All tests completed ===');
}

// Run the tests
runTests();
