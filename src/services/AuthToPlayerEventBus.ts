/**
 * Auth-to-Player Event Bus
 * 
 * Event-driven implementation of the Auth-to-Player behavioral specification.
 * Replaces useAuthToPlayerFlow hook with explicit event dispatching and handling.
 * Integrates with UserStateInitializer for proper learning state setup.
 */

import { UserStateInitializer, UserLearningState } from './UserStateInitializer';
import { learningEngineService } from './LearningEngineService';
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
    this.on('preengagement:play-clicked', async () => {
      this.setState('LOADING_WITH_ANIMATION');
      this.emit('loading:animation-started', {});
      
      // Create anonymous user if pending
      if (this.currentUserContext?.userType === 'anonymous' && this.currentUserContext.userId === 'pending-creation') {
        await this.createPendingAnonymousUser();
      }
      
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
      
      // Use LearningEngineService to generate real question content
      try {
        const learningPathId = userLearningState.currentStitch.learningPathId || 'addition';
        const sessionData = await learningEngineService.initializeLearningSession(userId, learningPathId);
        
        if (sessionData.initialQuestions && sessionData.initialQuestions.length > 0) {
          const firstQuestion = sessionData.initialQuestions[0];
          this.backgroundData.firstStitch = {
            id: firstQuestion.id,
            text: firstQuestion.questionText,
            answers: [firstQuestion.correctAnswer, ...firstQuestion.distractors].sort(() => Math.random() - 0.5),
            correctAnswer: this.findCorrectAnswerIndex(firstQuestion.correctAnswer, [firstQuestion.correctAnswer, ...firstQuestion.distractors]),
            learningPath: learningPathId,
            metadata: {
              ...firstQuestion.metadata,
              sessionId: sessionData.sessionId,
              factId: firstQuestion.factId,
              boundaryLevel: firstQuestion.boundaryLevel
            }
          };
        } else {
          // Fallback if no questions generated
          this.backgroundData.firstStitch = this.createFallbackQuestion(learningPathId);
        }
      } catch (error) {
        console.warn('Failed to generate question from LearningEngine, using fallback:', error);
        this.backgroundData.firstStitch = this.createFallbackQuestion(userLearningState.currentStitch.learningPathId || 'addition');
      }
      
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

  // Helper methods for LearningEngine integration
  private findCorrectAnswerIndex(correctAnswer: string, shuffledAnswers: string[]): number {
    return shuffledAnswers.findIndex(answer => answer === correctAnswer);
  }

  private createFallbackQuestion(learningPath: string): any {
    const fallbackQuestions: Record<string, any> = {
      'addition': {
        id: 'fallback-add',
        text: '2 + 3 = ?',
        answers: ['4', '5', '6', '7'],
        correctAnswer: 1,
        learningPath: 'addition'
      },
      'subtraction': {
        id: 'fallback-sub',
        text: '8 - 3 = ?',
        answers: ['4', '5', '6', '7'],
        correctAnswer: 1,
        learningPath: 'subtraction'
      },
      'multiplication': {
        id: 'fallback-mult',
        text: '3 × 4 = ?',
        answers: ['10', '12', '14', '16'],
        correctAnswer: 1,
        learningPath: 'multiplication'
      }
    };
    
    return fallbackQuestions[learningPath] || fallbackQuestions['addition'];
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

    // Otherwise load it now using LearningEngine
    this.loadContentFromLearningEngine();
  }

  // Load content directly from LearningEngine (used as fallback)
  private async loadContentFromLearningEngine(): Promise<void> {
    if (!this.currentUserContext) {
      console.warn('No user context available, using hard fallback');
      this.emit('loading:content-ready', { content: this.createFallbackQuestion('addition') });
      return;
    }

    try {
      const userId = this.getUserStateId(this.currentUserContext);
      const learningPath = 'addition'; // Default learning path
      
      console.log('🔄 Loading content from LearningEngine for user:', userId);
      
      const sessionData = await learningEngineService.initializeLearningSession(userId, learningPath);
      
      if (sessionData.initialQuestions && sessionData.initialQuestions.length > 0) {
        const firstQuestion = sessionData.initialQuestions[0];
        const shuffledAnswers = [firstQuestion.correctAnswer, ...firstQuestion.distractors];
        // Shuffle answers
        for (let i = shuffledAnswers.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledAnswers[i], shuffledAnswers[j]] = [shuffledAnswers[j], shuffledAnswers[i]];
        }
        
        const content = {
          id: firstQuestion.id,
          text: firstQuestion.questionText,
          answers: shuffledAnswers,
          correctAnswer: this.findCorrectAnswerIndex(firstQuestion.correctAnswer, shuffledAnswers),
          learningPath: learningPath,
          metadata: {
            ...firstQuestion.metadata,
            sessionId: sessionData.sessionId,
            factId: firstQuestion.factId,
            boundaryLevel: firstQuestion.boundaryLevel
          }
        };
        
        console.log('✅ Content loaded from LearningEngine:', content);
        this.emit('loading:content-ready', { content });
      } else {
        console.warn('No questions generated, using fallback');
        this.emit('loading:content-ready', { content: this.createFallbackQuestion(learningPath) });
      }
    } catch (error) {
      console.error('Failed to load from LearningEngine:', error);
      this.emit('loading:content-ready', { content: this.createFallbackQuestion('addition') });
    }
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

  /**
   * Create anonymous user during loading animation
   * Simple approach - only called when needed
   */
  private async createPendingAnonymousUser(): Promise<void> {
    try {
      console.log('🔄 Creating anonymous user during loading...');
      
      // Import UserSessionManager to avoid circular dependencies
      const { userSessionManager } = await import('./UserSessionManager');
      
      // Create the anonymous user
      await userSessionManager.createAnonymousUser();
      
      // Update user context with real user data
      const sessionState = userSessionManager.state;
      if (sessionState.user && this.currentUserContext) {
        this.currentUserContext = {
          userType: 'anonymous',
          userId: sessionState.user.anonymousId,
          userName: sessionState.user.displayName
        };
        
        console.log('✅ Anonymous user created during loading:', this.currentUserContext);
      }
    } catch (error) {
      console.error('❌ Failed to create anonymous user during loading:', error);
      // Continue with pending context - learning will work with offline fallback
    }
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