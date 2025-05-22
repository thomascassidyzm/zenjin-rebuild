/**
 * Example usage of the SpacedRepetitionSystem
 */
import { SpacedRepetitionSystem, PerformanceData } from './SpacedRepetitionSystem';

// Function to log the state of the stitch queue
function logStitchQueue(
  system: SpacedRepetitionSystem, 
  userId: string, 
  learningPathId: string
): void {
  console.log("\nCurrent Stitch Queue:");
  const queue = system.getStitchQueue(userId, learningPathId);
  
  console.log("Position | Stitch ID");
  console.log("---------|----------");
  
  queue.forEach(stitch => {
    console.log(`${stitch.position.toString().padEnd(9)} | ${stitch.id}`);
  });
  console.log();
}

// Initialize the SpacedRepetitionSystem
const spacedRepetitionSystem = new SpacedRepetitionSystem();

// Define user and learning path
const userId = 'user123';
const learningPathId = 'path1';

// Create sample stitches for a math learning path
const mathStitches = [
  { 
    id: 'addition-basic', 
    content: {
      type: 'addition',
      difficulty: 1,
      question: '5 + 7 = ?',
      answer: 12,
      options: [10, 11, 12, 13]
    }
  },
  { 
    id: 'subtraction-basic', 
    content: {
      type: 'subtraction',
      difficulty: 1,
      question: '10 - 3 = ?',
      answer: 7,
      options: [5, 6, 7, 8]
    }
  },
  { 
    id: 'multiplication-basic', 
    content: {
      type: 'multiplication',
      difficulty: 2,
      question: '6 × 4 = ?',
      answer: 24,
      options: [18, 22, 24, 28]
    }
  },
  { 
    id: 'division-basic', 
    content: {
      type: 'division',
      difficulty: 2,
      question: '15 ÷ 3 = ?',
      answer: 5,
      options: [3, 4, 5, 6]
    }
  },
  { 
    id: 'addition-intermediate', 
    content: {
      type: 'addition',
      difficulty: 3,
      question: '27 + 15 = ?',
      answer: 42,
      options: [39, 41, 42, 45]
    }
  },
  { 
    id: 'subtraction-intermediate', 
    content: {
      type: 'subtraction',
      difficulty: 3,
      question: '36 - 18 = ?',
      answer: 18,
      options: [16, 17, 18, 19]
    }
  }
];

// Initialize the learning path with stitches
spacedRepetitionSystem.initializeLearningPath(userId, learningPathId, mathStitches);

console.log("===== SpacedRepetitionSystem Example =====");
console.log("Initialized learning path with 6 math stitches");

// Log the initial queue state
logStitchQueue(spacedRepetitionSystem, userId, learningPathId);

// Simulate a user session
console.log("===== Simulating User Learning Session =====");

// Performance data variations for simulation
const performanceData: { [key: string]: PerformanceData } = {
  perfect: {
    correctCount: 20,
    totalCount: 20,
    averageResponseTime: 1500,
    completionDate: new Date().toISOString()
  },
  good: {
    correctCount: 18,
    totalCount: 20,
    averageResponseTime: 2000,
    completionDate: new Date().toISOString()
  },
  fair: {
    correctCount: 14,
    totalCount: 20,
    averageResponseTime: 2500,
    completionDate: new Date().toISOString()
  },
  poor: {
    correctCount: 10,
    totalCount: 20,
    averageResponseTime: 3000,
    completionDate: new Date().toISOString()
  }
};

// Simulation steps
const simulationSteps = [
  { stitchIndex: 0, performance: 'perfect' },  // addition-basic with perfect performance
  { stitchIndex: 1, performance: 'good' },     // subtraction-basic with good performance
  { stitchIndex: 2, performance: 'fair' },     // multiplication-basic with fair performance
  { stitchIndex: 3, performance: 'poor' },     // division-basic with poor performance
  { stitchIndex: 0, performance: 'perfect' },  // addition-basic again with perfect (should move further back)
];

// Run the simulation
for (let step = 0; step < simulationSteps.length; step++) {
  console.log(`\n----- Step ${step + 1} -----`);
  
  // Get the next stitch
  const nextStitch = spacedRepetitionSystem.getNextStitch(userId, learningPathId);
  console.log(`Next stitch: ${nextStitch.id} (Position: ${nextStitch.position})`);
  console.log(`Content: ${JSON.stringify(nextStitch.content)}`);
  
  // Get the performance for this step
  const currentStep = simulationSteps[step];
  const performance = performanceData[currentStep.performance];
  
  console.log(`Completed with ${currentStep.performance} performance: ${performance.correctCount}/${performance.totalCount} correct`);
  
  // Reposition the stitch based on performance
  const result = spacedRepetitionSystem.repositionStitch(userId, nextStitch.id, performance);
  
  console.log(`Repositioning result:`);
  console.log(`- Previous position: ${result.previousPosition}`);
  console.log(`- New position: ${result.newPosition}`);
  console.log(`- Skip number: ${result.skipNumber}`);
  
  // Log the updated queue state
  logStitchQueue(spacedRepetitionSystem, userId, learningPathId);
}

// Check repositioning history for a specific stitch
console.log("===== Repositioning History =====");
const historyStitchId = 'addition-basic';
const history = spacedRepetitionSystem.getRepositioningHistory(userId, historyStitchId);

console.log(`Repositioning history for stitch ${historyStitchId}:`);
history.forEach((entry, index) => {
  console.log(`\nEntry ${index + 1}:`);
  console.log(`- Previous position: ${entry.previousPosition}`);
  console.log(`- New position: ${entry.newPosition}`);
  console.log(`- Skip number: ${entry.skipNumber}`);
  console.log(`- Timestamp: ${entry.timestamp}`);
});

// Calculate skip numbers for various performance levels
console.log("\n===== Skip Number Calculation =====");
console.log(`Perfect performance: Skip ${spacedRepetitionSystem.calculateSkipNumber(performanceData.perfect)}`);
console.log(`Good performance: Skip ${spacedRepetitionSystem.calculateSkipNumber(performanceData.good)}`);
console.log(`Fair performance: Skip ${spacedRepetitionSystem.calculateSkipNumber(performanceData.fair)}`);
console.log(`Poor performance: Skip ${spacedRepetitionSystem.calculateSkipNumber(performanceData.poor)}`);

console.log("\n===== End of Example =====");
