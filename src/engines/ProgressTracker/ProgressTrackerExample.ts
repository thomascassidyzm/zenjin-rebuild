/**
 * ProgressTrackerExample.ts
 * 
 * Example usage of the ProgressTracker component
 */

import { ProgressTracker } from './ProgressTracker';
import { SessionResults, LearningPath, ContentExpectedTime } from './ProgressTrackingInterface';

/**
 * Example function demonstrating the usage of the ProgressTracker component
 */
export function progressTrackerExample(): void {
  // Define learning paths for the example
  const learningPaths: LearningPath[] = [
    {
      id: 'path1',
      stitches: [
        { id: 'stitch123', position: 1 },
        { id: 'stitch124', position: 2 },
        { id: 'stitch125', position: 3 }
      ],
      weight: 1.0
    },
    {
      id: 'path2',
      stitches: [
        { id: 'stitch126', position: 1 },
        { id: 'stitch127', position: 2 }
      ],
      weight: 1.5
    }
  ];
  
  // Define expected completion times for content items
  const expectedTimes: ContentExpectedTime[] = [
    { contentId: 'stitch123', expectedTime: 300000 }, // 5 minutes
    { contentId: 'stitch124', expectedTime: 180000 }, // 3 minutes
    { contentId: 'stitch125', expectedTime: 240000 }, // 4 minutes
    { contentId: 'stitch126', expectedTime: 360000 }, // 6 minutes
    { contentId: 'stitch127', expectedTime: 300000 }  // 5 minutes
  ];
  
  // Create a progress tracker with the defined learning paths and expected times
  const progressTracker = new ProgressTracker(learningPaths, expectedTimes);
  
  // Initialize user progress (assuming user123 exists in the mock database)
  try {
    const initialized = progressTracker.initializeUserProgress('user123');
    console.log(`User progress initialized: ${initialized}`);
  } catch (error) {
    console.error(`Failed to initialize user progress: ${error.message}`);
  }
  
  // Get user progress
  try {
    const progress = progressTracker.getUserProgress('user123');
    console.log('User progress:', progress);
  } catch (error) {
    console.error(`Failed to get user progress: ${error.message}`);
  }
  
  // Create session results for updating progress
  const sessionResults: SessionResults = {
    learningPathId: 'path1',
    stitchId: 'stitch123',
    correctCount: 18,
    totalCount: 20,
    completionTime: 280000, // 4 minutes 40 seconds
    timestamp: new Date().toISOString()
  };
  
  // Update progress based on session results
  try {
    const updatedProgress = progressTracker.updateProgress('user123', sessionResults);
    console.log('Updated user progress:', updatedProgress);
    
    // Get content mastery for the stitch
    const contentMastery = progressTracker.getContentMastery('user123', 'stitch123');
    console.log('Content mastery:', contentMastery);
    
    // Get path progress
    const pathProgress = progressTracker.getPathProgress('user123', 'path1');
    console.log('Path progress:', pathProgress);
  } catch (error) {
    console.error(`Failed to update progress: ${error.message}`);
  }
}

// If this file is run directly, execute the example
if (require.main === module) {
  progressTrackerExample();
}