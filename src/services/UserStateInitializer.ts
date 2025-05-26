/**
 * User State Initialization Service
 * 
 * Handles the initialization of learning state for different user types:
 * - Anonymous users: Always start at Tube 1, Stitch 1 (default content)
 * - Authenticated users: Resume from their last saved position
 * 
 * Integrates with TripleHelixManager, StitchManager, and backend services
 */

import { TripleHelixManager } from '../engines/TripleHelixManager/TripleHelixManager';
import { StitchManager } from '../engines/StitchManager/StitchManager';
import { StitchLibrary, Stitch } from '../engines/StitchLibrary';
import { FactRepository } from '../engines/FactRepository/FactRepository';
import { SupabaseUserState } from './SupabaseUserState';

export interface UserLearningState {
  userId: string;
  userType: 'anonymous' | 'authenticated';
  currentTube: number;
  currentStitch: Stitch;
  tripleHelixInitialized: boolean;
  progress: {
    totalStitchesCompleted: number;
    currentMasteryLevel: number;
    timeSpent: number;
  };
}

export interface LearningPosition {
  tubeId: string;
  stitchId: string;
  position: number;
  partialProgress?: {
    questionsAnswered: number;
    totalQuestions: number;
    correctAnswers: number;
  };
}

export class UserStateInitializer {
  private tripleHelixManager: TripleHelixManager;
  private stitchManager: StitchManager;
  private stitchLibrary: StitchLibrary;
  private userStateService: SupabaseUserState;

  constructor() {
    // Initialize dependencies
    const factRepository = new FactRepository();
    this.stitchLibrary = new StitchLibrary(factRepository);
    this.tripleHelixManager = new TripleHelixManager();
    this.stitchManager = new StitchManager();
    this.userStateService = new SupabaseUserState();
  }

  /**
   * Initialize learning state for a user
   * Anonymous users get default starting position
   * Authenticated users get their saved state or default if first time
   */
  async initializeUserLearningState(userId: string, userType: 'anonymous' | 'authenticated'): Promise<UserLearningState> {
    console.log(`🎯 Initializing learning state for ${userType} user: ${userId}`);

    if (userType === 'anonymous') {
      return this.initializeAnonymousUser(userId);
    } else {
      return this.initializeAuthenticatedUser(userId);
    }
  }

  /**
   * Anonymous users always start at Tube 1, Stitch 1
   */
  private async initializeAnonymousUser(userId: string): Promise<UserLearningState> {
    console.log('📚 Setting up anonymous user with default content');
    
    // Get the first stitch from the default learning path
    const defaultStitch = this.getDefaultStartingStitch();
    
    // Initialize basic triple helix (in-memory only for anonymous users)
    try {
      const tripleHelixState = this.tripleHelixManager.initializeTripleHelix(userId, 1);
      console.log('✅ Anonymous user triple helix initialized');
    } catch (error) {
      console.log('ℹ️ Triple helix already exists for anonymous user');
    }

    return {
      userId,
      userType: 'anonymous',
      currentTube: 1,
      currentStitch: defaultStitch,
      tripleHelixInitialized: true,
      progress: {
        totalStitchesCompleted: 0,
        currentMasteryLevel: 0,
        timeSpent: 0
      }
    };
  }

  /**
   * Authenticated users resume from saved state or get default if first time
   */
  private async initializeAuthenticatedUser(userId: string): Promise<UserLearningState> {
    console.log('🔐 Setting up authenticated user - checking saved state');

    try {
      // Try to load existing state from backend
      const savedState = await this.loadSavedUserState(userId);
      
      if (savedState) {
        console.log('✅ Restored user from saved learning position');
        return this.restoreUserFromSavedState(userId, savedState);
      } else {
        console.log('🆕 First-time authenticated user - initializing with defaults');
        return this.initializeFirstTimeAuthenticatedUser(userId);
      }
    } catch (error) {
      console.error('❌ Failed to load saved state, defaulting to fresh start:', error);
      return this.initializeFirstTimeAuthenticatedUser(userId);
    }
  }

  /**
   * Load saved learning position from backend
   */
  private async loadSavedUserState(userId: string): Promise<LearningPosition | null> {
    try {
      // This would call the backend API to get user's learning state
      // For now, we'll simulate this since the API endpoint needs to be built
      console.log('🔍 Looking up saved learning position...');
      
      // TODO: Implement actual backend call
      // const userState = await this.userStateService.getUserLearningState(userId);
      // return userState?.currentPosition || null;
      
      return null; // No saved state for now
    } catch (error) {
      console.error('Failed to load saved user state:', error);
      return null;
    }
  }

  /**
   * Restore user from saved learning position
   */
  private async restoreUserFromSavedState(userId: string, savedPosition: LearningPosition): Promise<UserLearningState> {
    console.log('🔄 Restoring user learning state from position:', savedPosition);

    // Get the stitch they were working on
    const currentStitch = this.getStitchById(savedPosition.stitchId);
    
    // Restore triple helix state
    let tripleHelixState;
    try {
      tripleHelixState = this.tripleHelixManager.getTripleHelixState(userId);
    } catch (error) {
      console.log('🔧 Rebuilding triple helix state from saved data');
      tripleHelixState = this.tripleHelixManager.initializeTripleHelix(userId, currentStitch.difficulty);
    }

    return {
      userId,
      userType: 'authenticated',
      currentTube: this.extractTubeNumber(savedPosition.tubeId),
      currentStitch,
      tripleHelixInitialized: true,
      progress: {
        totalStitchesCompleted: savedPosition.position - 1, // Approximate
        currentMasteryLevel: savedPosition.partialProgress ? 
          savedPosition.partialProgress.correctAnswers / savedPosition.partialProgress.totalQuestions : 0,
        timeSpent: 0 // Would come from saved state
      }
    };
  }

  /**
   * Initialize first-time authenticated user (same as anonymous but with backend persistence)
   */
  private async initializeFirstTimeAuthenticatedUser(userId: string): Promise<UserLearningState> {
    console.log('🎓 Setting up first-time authenticated user');
    
    const defaultStitch = this.getDefaultStartingStitch();
    
    // Initialize triple helix
    const tripleHelixState = this.tripleHelixManager.initializeTripleHelix(userId, 1);
    
    // Save initial state to backend
    try {
      await this.saveUserLearningPosition(userId, {
        tubeId: 'tube-1',
        stitchId: defaultStitch.id,
        position: 1
      });
      console.log('✅ Initial learning position saved to backend');
    } catch (error) {
      console.error('⚠️ Failed to save initial position, continuing anyway:', error);
    }

    return {
      userId,
      userType: 'authenticated',
      currentTube: 1,
      currentStitch: defaultStitch,
      tripleHelixInitialized: true,
      progress: {
        totalStitchesCompleted: 0,
        currentMasteryLevel: 0,
        timeSpent: 0
      }
    };
  }

  /**
   * Get the default starting stitch (Tube 1, Stitch 1)
   */
  private getDefaultStartingStitch(): Stitch {
    // Get the first addition stitch as the default starting point
    const additionStitches = this.stitchLibrary.createAdditionStitches();
    return additionStitches.find(stitch => stitch.position === 1) || additionStitches[0];
  }

  /**
   * Get stitch by ID
   */
  private getStitchById(stitchId: string): Stitch {
    // This would lookup stitch from the library
    // For now, return default if not found
    const additionStitches = this.stitchLibrary.createAdditionStitches();
    return additionStitches.find(stitch => stitch.id === stitchId) || additionStitches[0];
  }

  /**
   * Extract tube number from tube ID
   */
  private extractTubeNumber(tubeId: string): number {
    const match = tubeId.match(/tube-(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
  }

  /**
   * Save user's current learning position to backend
   */
  private async saveUserLearningPosition(userId: string, position: LearningPosition): Promise<void> {
    try {
      // TODO: Implement actual backend save
      // await this.userStateService.saveUserLearningState(userId, position);
      console.log('💾 Learning position saved:', position);
    } catch (error) {
      console.error('Failed to save learning position:', error);
      throw error;
    }
  }

  /**
   * Update user's learning position (called when they progress)
   */
  async updateUserProgress(userId: string, userType: 'anonymous' | 'authenticated', newPosition: LearningPosition): Promise<void> {
    console.log(`📊 Updating progress for ${userType} user:`, newPosition);

    if (userType === 'authenticated') {
      // Save to backend for authenticated users
      await this.saveUserLearningPosition(userId, newPosition);
    }
    
    // For anonymous users, we could store in localStorage if needed
    if (userType === 'anonymous') {
      this.saveAnonymousProgress(userId, newPosition);
    }
  }

  /**
   * Save anonymous user progress to localStorage
   */
  private saveAnonymousProgress(userId: string, position: LearningPosition): void {
    try {
      const key = `zenjin-anon-progress-${userId}`;
      localStorage.setItem(key, JSON.stringify(position));
      console.log('💽 Anonymous progress saved to localStorage');
    } catch (error) {
      console.error('Failed to save anonymous progress:', error);
    }
  }
}