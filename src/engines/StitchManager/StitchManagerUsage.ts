// usage-example.ts
/**
 * Example usage of the StitchManager component
 */
import { 
  StitchManager, 
  Stitch, 
  SessionResults, 
  PerformanceData 
} from './StitchManager';

/**
 * Demonstrates the usage of StitchManager in a typical learning scenario
 */
async function demonstrateStitchManager() {
  console.log('=== StitchManager Usage Example ===');
  
  // Create stitch manager
  const stitchManager = new StitchManager();
  
  try {
    // Initialize a learning path
    const learningPathId = 'math-basics';
    stitchManager.initializeLearningPath(learningPathId);
    console.log(`Initialized learning path: ${learningPathId}`);
    
    // Create and add stitches
    const stitch1: Stitch = {
      id: 'stitch1',
      name: 'Counting Numbers',
      description: 'Learn to count from 1 to 10',
      learningPathId,
      position: 1,
      difficulty: 1,
      factIds: ['fact1'],
      metadata: {
        category: 'counting',
        tags: ['basic', 'numbers']
      }
    };
    
    const stitch2: Stitch = {
      id: 'stitch2',
      name: 'Basic Addition',
      description: 'Addition of single-digit numbers',
      learningPathId,
      position: 2,
      difficulty: 2,
      factIds: ['fact2', 'fact3'],
      prerequisites: ['stitch1'],
      metadata: {
        category: 'addition',
        tags: ['basic', 'arithmetic']
      }
    };
    
    const stitch3: Stitch = {
      id: 'stitch3',
      name: 'Basic Subtraction',
      description: 'Subtraction of single-digit numbers',
      learningPathId,
      position: 3,
      difficulty: 2,
      factIds: ['fact4', 'fact5'],
      prerequisites: ['stitch2'],
      metadata: {
        category: 'subtraction',
        tags: ['basic', 'arithmetic']
      }
    };
    
    // Add stitches to the system
    stitchManager.addStitch(stitch1);
    stitchManager.addStitch(stitch2);
    stitchManager.addStitch(stitch3);
    console.log(`Added 3 stitches to learning path: ${learningPathId}`);
    
    // Retrieve stitches by learning path
    const stitches = stitchManager.getStitchesByLearningPath(learningPathId);
    console.log(`Found ${stitches.length} stitches in learning path ${learningPathId}:`);
    stitches.forEach(stitch => {
      console.log(`  - ${stitch.name} (Position: ${stitch.position}, Difficulty: ${stitch.difficulty})`);
    });
    
    // User interaction
    const userId = 'user123';
    console.log(`\nUser ${userId} starts learning path ${learningPathId}`);
    
    // Get the first stitch
    let nextStitch = stitchManager.getNextStitch(userId, learningPathId);
    console.log(`Next stitch for user: ${nextStitch.name} (Position: ${nextStitch.position})`);
    
    // User completes the first stitch with perfect score
    console.log(`\nUser completes stitch: ${nextStitch.name}`);
    const sessionResults1: SessionResults = {
      correctCount: 10,
      totalCount: 10,
      completionTime: 120000
    };
    
    // Update progress
    const progress1 = stitchManager.updateStitchProgress(userId, nextStitch.id, sessionResults1);
    console.log(`Updated progress: Mastery level: ${progress1.masteryLevel.toFixed(2)}, Completion count: ${progress1.completionCount}`);
    
    // Reposition stitch based on performance
    const performance1: PerformanceData = {
      correctCount: 10,
      totalCount: 10,
      averageResponseTime: 1200
    };
    
    const reposition1 = stitchManager.repositionStitch(userId, nextStitch.id, performance1);
    console.log(`Repositioned stitch from position ${reposition1.previousPosition} to ${reposition1.newPosition} (Skip: ${reposition1.skipNumber})`);
    
    // Get the next stitch (should be stitch2 now)
    nextStitch = stitchManager.getNextStitch(userId, learningPathId);
    console.log(`\nNext stitch for user: ${nextStitch.name} (Position: ${nextStitch.position})`);
    
    // User completes the second stitch with average score
    console.log(`User completes stitch: ${nextStitch.name}`);
    const sessionResults2: SessionResults = {
      correctCount: 8,
      totalCount: 10,
      completionTime: 180000
    };
    
    // Update progress
    const progress2 = stitchManager.updateStitchProgress(userId, nextStitch.id, sessionResults2);
    console.log(`Updated progress: Mastery level: ${progress2.masteryLevel.toFixed(2)}, Completion count: ${progress2.completionCount}`);
    
    // Reposition stitch based on performance
    const performance2: PerformanceData = {
      correctCount: 8,
      totalCount: 10,
      averageResponseTime: 1800
    };
    
    const reposition2 = stitchManager.repositionStitch(userId, nextStitch.id, performance2);
    console.log(`Repositioned stitch from position ${reposition2.previousPosition} to ${reposition2.newPosition} (Skip: ${reposition2.skipNumber})`);
    
    // Get the next stitch (should be stitch3 now)
    nextStitch = stitchManager.getNextStitch(userId, learningPathId);
    console.log(`\nNext stitch for user: ${nextStitch.name} (Position: ${nextStitch.position})`);
    
    // Get all stitches again to see the updated positions
    const updatedStitches = stitchManager.getStitchesByLearningPath(learningPathId);
    console.log(`\nUpdated stitch positions in learning path ${learningPathId}:`);
    updatedStitches.forEach(stitch => {
      console.log(`  - ${stitch.name} (Position: ${stitch.position})`);
    });
    
    // Get stitch progress
    console.log('\nUser progress:');
    try {
      const stitch1Progress = stitchManager.getStitchProgress(userId, stitch1.id);
      console.log(`  - ${stitch1.name}: Mastery level: ${stitch1Progress.masteryLevel.toFixed(2)}`);
    } catch (error) {
      console.log(`  - ${stitch1.name}: No progress data available`);
    }
    
    try {
      const stitch2Progress = stitchManager.getStitchProgress(userId, stitch2.id);
      console.log(`  - ${stitch2.name}: Mastery level: ${stitch2Progress.masteryLevel.toFixed(2)}`);
    } catch (error) {
      console.log(`  - ${stitch2.name}: No progress data available`);
    }
    
    // Demonstrate error handling
    console.log('\nDemonstrating error handling:');
    try {
      stitchManager.getStitchById('non-existent');
    } catch (error: any) {
      console.log(`Error: ${error.code} - ${error.message}`);
    }
    
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

// Run the demonstration
demonstrateStitchManager().catch(console.error);

/**
 * Expected output:
 * 
 * === StitchManager Usage Example ===
 * Initialized learning path: math-basics
 * Added 3 stitches to learning path: math-basics
 * Found 3 stitches in learning path math-basics:
 *   - Counting Numbers (Position: 1, Difficulty: 1)
 *   - Basic Addition (Position: 2, Difficulty: 2)
 *   - Basic Subtraction (Position: 3, Difficulty: 2)
 * 
 * User user123 starts learning path math-basics
 * Next stitch for user: Counting Numbers (Position: 1)
 * 
 * User completes stitch: Counting Numbers
 * Updated progress: Mastery level: 1.00, Completion count: 1
 * Repositioned stitch from position 1 to 10 (Skip: 9)
 * 
 * Next stitch for user: Basic Addition (Position: 2)
 * User completes stitch: Basic Addition
 * Updated progress: Mastery level: 0.80, Completion count: 1
 * Repositioned stitch from position 2 to 8 (Skip: 6)
 * 
 * Next stitch for user: Basic Subtraction (Position: 3)
 * 
 * Updated stitch positions in learning path math-basics:
 *   - Basic Subtraction (Position: 3)
 *   - Basic Addition (Position: 8)
 *   - Counting Numbers (Position: 10)
 * 
 * User progress:
 *   - Counting Numbers: Mastery level: 1.00
 *   - Basic Addition: Mastery level: 0.80
 * 
 * Demonstrating error handling:
 * Error: STITCH_NOT_FOUND - Stitch with ID 'non-existent' not found
 */
