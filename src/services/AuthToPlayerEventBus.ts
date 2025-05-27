/**
 * Auth-to-Player Event Bus
 * 
 * Event-driven implementation of the Auth-to-Player behavioral specification.
 * Replaces useAuthToPlayerFlow hook with explicit event dispatching and handling.
 * Integrates with UserStateInitializer for proper learning state setup.
 */

import { UserStateInitializer, UserLearningState } from './UserStateInitializer';
import { 
  AuthToPlayerInterface,
  AuthToPlayerEvents,
  AuthToPlayerState,
  UserContext,
  AuthenticatedUserContext,
  AnonymousUserContext
} from '../interfaces/AuthToPlayerInterface';

type EventCallback<T = any> = (data: T) => void;

class AuthToPlayerEventBus implements AuthToPlayerInterface {
  private listeners: Map<keyof AuthToPlayerEvents, EventCallback[]> = new Map();
  private currentState: AuthToPlayerState = 'AUTH_SUCCESS';
  private backgroundData: { dashboardLoaded: boolean; contentPrepared: boolean; firstStitch?: any; userLearningState?: UserLearningState } = {
    dashboardLoaded: false,
    contentPrepared: false
  };
  private isAnimationCompleted = false;
  private contentReady = false;
  private userStateInitializer: UserStateInitializer;
  private currentUserContext?: UserContext;

  constructor() {
    this.userStateInitializer = new UserStateInitializer();
    this.setupEventHandlers();
  }

  // Event emission
  emit<K extends keyof AuthToPlayerEvents>(event: K, data: AuthToPlayerEvents[K]): void {
    console.log(`🎯 Event: ${event}`, data);
    
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }

  // Event subscription
  on<K extends keyof AuthToPlayerEvents>(event: K, callback: EventCallback<AuthToPlayerEvents[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    this.listeners.get(event)!.push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event) || [];
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  // State management
  private setState(newState: AuthToPlayerState): void {
    const oldState = this.currentState;
    this.currentState = newState;
    
    console.log(`🎯 State Transition: ${oldState} → ${newState}`);
    this.emit('state:changed', { from: oldState, to: newState });
  }

  getState(): AuthToPlayerState {
    return this.currentState;
  }

  // Core event handlers implementing the behavioral specification
  private setupEventHandlers(): void {
    
    // AUTH_SUCCESS → PRE_ENGAGEMENT transition
    this.on('auth:success', (data) => {
      this.setState('PRE_ENGAGEMENT');
      // No background processes - wait for user to click play
    });

    // PRE_ENGAGEMENT → LOADING_WITH_ANIMATION transition
    this.on('preengagement:play-clicked', () => {
      this.setState('LOADING_WITH_ANIMATION');
      this.emit('loading:animation-started', {});
      
      // Start background processes when user actually clicks play
      this.startBackgroundProcesses();
      this.loadFirstStitchContent();
    });

    // Track animation completion
    this.on('loading:animation-completed', () => {
      this.isAnimationCompleted = true;
      this.checkTransitionToPlayer();
    });

    // Track content readiness
    this.on('loading:content-ready', (data) => {
      this.contentReady = true;
      this.checkTransitionToPlayer();
    });

    // LOADING_WITH_ANIMATION → ACTIVE_LEARNING transition
    // Only when both animation is complete AND content is ready
  }

  private checkTransitionToPlayer(): void {
    if (this.isAnimationCompleted && this.contentReady && this.backgroundData.userLearningState) {
      this.setState('ACTIVE_LEARNING');
      this.emit('player:ready', { 
        content: this.backgroundData.firstStitch,
        userLearningState: this.backgroundData.userLearningState
      });
    } else {
      console.log('⏳ Waiting for animation, content, and user state...', {
        animationCompleted: this.isAnimationCompleted,
        contentReady: this.contentReady,
        userStateReady: !!this.backgroundData.userLearningState
      });
    }
  }

  // Background processes (start immediately on auth success)
  private async startBackgroundProcesses(): Promise<void> {
    console.log('🔄 Starting background loading processes');
    
    // Simulate dashboard loading
    setTimeout(() => {
      this.backgroundData.dashboardLoaded = true;
      console.log('✅ Dashboard data loaded in background');
      this.emit('background:dashboard-loaded', { dashboardData: { /* mock data */ } });
    }, 100);

    // Initialize user learning state
    this.initializeUserLearningState();
  }

  private async initializeUserLearningState(): Promise<void> {
    if (!this.currentUserContext) {
      throw new Error('No user context available for state initialization');
    }

    // Use APML-compliant method to get proper user ID
    const userId = this.getUserStateId(this.currentUserContext);
    const userType = this.currentUserContext.userType;
    
    try {
      console.log('🎓 Initializing user learning state...');
      const userLearningState = await this.userStateInitializer.initializeUserLearningState(userId, userType);
      
      this.backgroundData.userLearningState = userLearningState;
      
      // Use the actual stitch from user state instead of mock data
      this.backgroundData.firstStitch = {
        id: userLearningState.currentStitch.id,
        text: this.generateQuestionFromStitch(userLearningState.currentStitch),
        answers: this.generateAnswersFromStitch(userLearningState.currentStitch),
        correctAnswer: 1, // This would be determined by the question generator
        learningPath: userLearningState.currentStitch.learningPathId,
        metadata: userLearningState.currentStitch.metadata
      };
      
      this.backgroundData.contentPrepared = true;
      
      console.log('✅ User learning state initialized:', {
        tube: userLearningState.tripleHelixPosition.currentTube,
        stitch: userLearningState.currentStitch.name,
        userType: userLearningState.userType,
        rotationCount: userLearningState.tripleHelixPosition.rotationCount
      });
      
      this.emit('background:content-prepared', { firstStitch: this.backgroundData.firstStitch });
      
    } catch (error) {
      console.error('❌ Failed to initialize user learning state:', error);
      
      // Fallback to default content
      this.backgroundData.firstStitch = {
        id: 'fallback-stitch',
        text: '2 + 3 = ?',
        answers: ['4', '5', '6', '7'],
        correctAnswer: 1,
        learningPath: 'addition'
      };
      this.backgroundData.contentPrepared = true;
      this.emit('background:content-prepared', { firstStitch: this.backgroundData.firstStitch });
    }
  }

  // Helper methods for content generation
  private generateQuestionFromStitch(stitch: any): string {
    // This is a simplified version - would integrate with QuestionGenerator
    return `${stitch.name}: 2 + 3 = ?`;
  }

  private generateAnswersFromStitch(stitch: any): string[] {
    // This is a simplified version - would integrate with DistractorGenerator
    return ['4', '5', '6', '7'];
  }

  // Load first stitch (called when play button clicked)
  private loadFirstStitchContent(): void {
    console.log('📚 Loading first stitch content...');
    
    // If content already prepared in background, use it immediately
    if (this.backgroundData.contentPrepared && this.backgroundData.firstStitch) {
      console.log('📚 Content ready from background preparation');
      this.emit('loading:content-ready', { content: this.backgroundData.firstStitch });
      return;
    }

    // Otherwise load it now (fallback)
    setTimeout(() => {
      const mockStitch = {
        id: 'first-stitch',
        text: '2 + 3 = ?',
        answers: ['4', '5', '6', '7'],
        correctAnswer: 1,
        learningPath: 'addition'
      };
      
      console.log('✅ First stitch loaded (fallback):', mockStitch);
      this.emit('loading:content-ready', { content: mockStitch });
    }, 200);
  }

  // Public API for components
  /**
   * Start the Auth-to-Player flow with user context
   * APML-compliant implementation with proper type validation
   */
  startFlow(userContext: UserContext): void {
    // Validate context based on user type
    if (userContext.userType === 'authenticated') {
      const authContext = userContext as AuthenticatedUserContext;
      if (!authContext.userId || !authContext.email) {
        throw new Error('Authenticated users must have userId and email');
      }
    }
    
    this.currentUserContext = userContext;
    this.emit('auth:success', userContext);
  }

  /**
   * Extract appropriate user ID for state initialization
   * APML-compliant implementation following interface contract
   */
  getUserStateId(userContext: UserContext): string {
    if (userContext.userType === 'authenticated') {
      const authContext = userContext as AuthenticatedUserContext;
      return authContext.userId; // Always present for authenticated users
    } else {
      const anonContext = userContext as AnonymousUserContext;
      return anonContext.userId || `anonymous-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  playButtonClicked(): void {
    this.emit('preengagement:play-clicked', {});
  }

  animationCompleted(): void {
    this.emit('loading:animation-completed', {});
  }


  // Reset for testing/cleanup
  reset(): void {
    this.currentState = 'AUTH_SUCCESS';
    this.backgroundData = { dashboardLoaded: false, contentPrepared: false };
    this.isAnimationCompleted = false;
    this.contentReady = false;
  }
}

// Singleton instance
export const authToPlayerEventBus = new AuthToPlayerEventBus();