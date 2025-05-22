/**
 * Example usage of the TripleHelixManager component in the Zenjin Maths App
 * 
 * This demonstrates how to use the TripleHelixManager to implement the Triple Helix
 * learning model in a real application.
 */

import { TripleHelixManager } from './TripleHelixManager';

// Create main function to demonstrate usage
async function demonstrateTripleHelixManager() {
  console.log('Demonstrating TripleHelixManager...');
  
  // Create a new instance of the TripleHelixManager
  const tripleHelixManager = new TripleHelixManager();
  
  try {
    // Step 1: Initialize triple helix for a new user
    console.log('\n1. Initialize triple helix for a new user');
    const userId = 'user456';
    const initialDifficulty = 2;
    
    console.log(`Initializing triple helix for user ${userId} with difficulty ${initialDifficulty}...`);
    
    const initialState = tripleHelixManager.initializeTripleHelix(userId, initialDifficulty);
    
    console.log(`Triple helix initialized successfully!`);
    console.log(`Active path: ${initialState.activePath.name}`);
    console.log(`Number of preparing paths: ${initialState.preparingPaths.length}`);
    console.log(`Initial state:`, JSON.stringify(initialState, null, 2));
    
    // Step 2: Get active learning path
    console.log('\n2. Get active learning path');
    
    const activePath = tripleHelixManager.getActiveLearningPath(userId);
    
    console.log(`Active path: ${activePath.name}`);
    console.log(`Current stitch: ${activePath.currentStitchId}`);
    console.log(`Difficulty: ${activePath.difficulty}`);
    console.log(`Active path details:`, JSON.stringify(activePath, null, 2));
    
    // Step 3: Get preparing paths
    console.log('\n3. Get preparing paths');
    
    const preparingPaths = tripleHelixManager.getPreparingPaths(userId);
    
    preparingPaths.forEach((path, index) => {
      console.log(`Preparing path ${index + 1}: ${path.name}`);
      console.log(`Next stitch: ${path.nextStitchId}`);
      console.log(`Path details:`, JSON.stringify(path, null, 2));
    });
    
    // Step 4: Update learning path difficulty
    console.log('\n4. Update learning path difficulty');
    
    const pathIdToUpdate = activePath.id;
    const newDifficulty = 3;
    
    console.log(`Updating difficulty of path ${pathIdToUpdate} to ${newDifficulty}...`);
    
    const updatedPath = tripleHelixManager.updateLearningPathDifficulty(
      userId,
      pathIdToUpdate,
      newDifficulty
    );
    
    console.log(`Path difficulty updated successfully!`);
    console.log(`Updated difficulty: ${updatedPath.difficulty}`);
    console.log(`Last updated: ${updatedPath.metadata?.difficultyUpdated}`);
    console.log(`Updated path:`, JSON.stringify(updatedPath, null, 2));
    
    // Step 5: Rotate learning paths
    console.log('\n5. Rotate learning paths');
    
    console.log(`Rotating learning paths for user ${userId}...`);
    
    const rotationResult = tripleHelixManager.rotateLearningPaths(userId);
    
    console.log(`Learning paths rotated successfully!`);
    console.log(`Previous active path: ${rotationResult.previousActivePath.name}`);
    console.log(`New active path: ${rotationResult.newActivePath.name}`);
    console.log(`Rotation count: ${rotationResult.rotationCount}`);
    console.log(`Rotation result:`, JSON.stringify(rotationResult, null, 2));
    
    // Step 6: Get current triple helix state
    console.log('\n6. Get current triple helix state');
    
    const currentState = tripleHelixManager.getTripleHelixState(userId);
    
    console.log(`Current active path: ${currentState.activePath.name}`);
    console.log(`Current preparing paths: ${currentState.preparingPaths.map(p => p.name).join(', ')}`);
    console.log(`Rotation count: ${currentState.rotationCount}`);
    console.log(`Last rotation time: ${currentState.lastRotationTime}`);
    console.log(`Current state:`, JSON.stringify(currentState, null, 2));
    
    // Step 7: Rotate again to complete the cycle
    console.log('\n7. Rotate learning paths again');
    
    console.log(`Rotating learning paths for user ${userId} again...`);
    
    const secondRotationResult = tripleHelixManager.rotateLearningPaths(userId);
    
    console.log(`Learning paths rotated successfully!`);
    console.log(`Previous active path: ${secondRotationResult.previousActivePath.name}`);
    console.log(`New active path: ${secondRotationResult.newActivePath.name}`);
    console.log(`Rotation count: ${secondRotationResult.rotationCount}`);
    
    // Get final state
    const finalState = tripleHelixManager.getTripleHelixState(userId);
    console.log(`Final state:`, JSON.stringify(finalState, null, 2));
    
    // Summary
    console.log('\nTriple Helix Manager Demonstration Summary:');
    console.log(`1. Initialized triple helix for user ${userId}`);
    console.log(`2. Retrieved active learning path: ${activePath.name}`);
    console.log(`3. Retrieved ${preparingPaths.length} preparing paths`);
    console.log(`4. Updated path ${pathIdToUpdate} difficulty to ${newDifficulty}`);
    console.log(`5. Rotated learning paths, making ${rotationResult.newActivePath.name} active`);
    console.log(`6. Retrieved current triple helix state`);
    console.log(`7. Rotated again, making ${secondRotationResult.newActivePath.name} active`);
    console.log(`8. Final rotation count: ${finalState.rotationCount}`);
    
  } catch (error) {
    console.error('Error during demonstration:', error);
  }
}

// Run the demonstration
demonstrateTripleHelixManager().catch(error => {
  console.error('Unhandled error:', error);
});

// Example of how to integrate the TripleHelixManager in a classroom setting
class MathsClassroomController {
  private tripleHelixManager: TripleHelixManager;
  
  constructor() {
    this.tripleHelixManager = new TripleHelixManager();
  }
  
  // Called when a new student joins the class
  public onboardNewStudent(studentId: string, initialAssessmentScore: number): void {
    // Map assessment score to initial difficulty (1-5)
    const initialDifficulty = Math.max(1, Math.min(5, Math.ceil(initialAssessmentScore / 20)));
    
    // Initialize triple helix for the student
    this.tripleHelixManager.initializeTripleHelix(studentId, initialDifficulty);
    
    console.log(`Student ${studentId} onboarded with initial difficulty ${initialDifficulty}`);
  }
  
  // Called when a student completes an exercise
  public onExerciseCompleted(studentId: string, success: boolean): void {
    // Get current active path
    const activePath = this.tripleHelixManager.getActiveLearningPath(studentId);
    
    // Adjust difficulty based on performance
    if (success) {
      // Student did well, consider increasing difficulty
      if (activePath.difficulty < 5) {
        // Increase difficulty
        this.tripleHelixManager.updateLearningPathDifficulty(
          studentId,
          activePath.id,
          activePath.difficulty + 1
        );
        console.log(`Increased difficulty for ${studentId} on path ${activePath.name}`);
      }
    } else {
      // Student struggled, consider decreasing difficulty
      if (activePath.difficulty > 1) {
        // Decrease difficulty
        this.tripleHelixManager.updateLearningPathDifficulty(
          studentId,
          activePath.id,
          activePath.difficulty - 1
        );
        console.log(`Decreased difficulty for ${studentId} on path ${activePath.name}`);
      }
    }
    
    // Check if it's time to rotate paths
    const state = this.tripleHelixManager.getTripleHelixState(studentId);
    
    // Rotate every 5 exercises (this is a simplification, real app would have more complex logic)
    if (state.rotationCount % 5 === 0) {
      const result = this.tripleHelixManager.rotateLearningPaths(studentId);
      console.log(`Rotated paths for ${studentId}, new active path: ${result.newActivePath.name}`);
    }
  }
  
  // Called when a student needs the next exercise
  public getNextExerciseForStudent(studentId: string): { pathName: string; stitchId: string; difficulty: number } {
    const activePath = this.tripleHelixManager.getActiveLearningPath(studentId);
    
    return {
      pathName: activePath.name,
      stitchId: activePath.currentStitchId || 'unknown',
      difficulty: activePath.difficulty
    };
  }
}

// Example of how to use the MathsClassroomController
function demonstrateClassroomUsage() {
  const classroomController = new MathsClassroomController();
  
  // Onboard new student
  const studentId = 'student001';
  const initialAssessment = 65; // Out of 100
  classroomController.onboardNewStudent(studentId, initialAssessment);
  
  // Get first exercise
  const firstExercise = classroomController.getNextExerciseForStudent(studentId);
  console.log(`Student's first exercise: ${firstExercise.pathName}, stitch ${firstExercise.stitchId}, difficulty ${firstExercise.difficulty}`);
  
  // Student completes exercise successfully
  classroomController.onExerciseCompleted(studentId, true);
  
  // Get next exercise
  const nextExercise = classroomController.getNextExerciseForStudent(studentId);
  console.log(`Student's next exercise: ${nextExercise.pathName}, stitch ${nextExercise.stitchId}, difficulty ${nextExercise.difficulty}`);
}
