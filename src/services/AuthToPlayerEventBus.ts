/**
 * Auth-to-Player Event Bus
 * 
 * Event-driven implementation of the Auth-to-Player behavioral specification.
 * Replaces useAuthToPlayerFlow hook with explicit event dispatching and handling.
 * Integrates with UserStateInitializer for proper learning state setup.
 */

import { UserStateInitializer, UserLearningState } from './UserStateInitializer';
import { getService } from './AppServiceContainer';
import type { LearningEngineService } from './LearningEngineService';
import { 
  AuthToPlayerInterface,
  AuthToPlayerEvents,
  AuthToPlayerState,
  UserContext,
  AuthenticatedUserContext,
  AnonymousUserContext
} from '../interfaces/AuthToPlayerInterface';

// Re-export types needed by other modules
export type { AuthToPlayerState, UserContext, AuthenticatedUserContext, AnonymousUserContext };

type EventCallback<T = any> = (data: T) => void;

class AuthToPlayerEventBus implements AuthToPlayerInterface {
  private listeners: Map<keyof AuthToPlayerEvents, EventCallback[]> = new Map();
  private currentState: AuthToPlayerState = 'AUTH_SUCCESS';
  private backgroundData: { 
    dashboardLoaded: boolean; 
    contentPrepared: boolean; 
    firstStitch?: any; 
    userLearningState?: UserLearningState;
    sessionData?: any; // Store full session data with all questions
  } = {
    dashboardLoaded: false,
    contentPrepared: false
  };
  private isAnimationCompleted = false;
  private contentReady = false;
  private userStateInitializer: UserStateInitializer;
  private currentUserContext?: UserContext;
  private isCreatingUser = false; // Guard against duplicate user creation
  
  // Session tracking for proper exit handling
  private sessionMetrics = {
    startTime: Date.now(),
    questionsAnswered: 0,
    correctAnswers: 0,
    targetPage: ''
  };

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
      // Store the content from the loading event
      if (data.content) {
        this.backgroundData.firstStitch = data.content;
      }
      this.checkTransitionToPlayer();
    });

    // LOADING_WITH_ANIMATION → ACTIVE_LEARNING transition
    // Only when both animation is complete AND content is ready
    
    // New: Handle session exit requests
    this.on('session:exit-requested', (data) => {
      if (this.currentState === 'ACTIVE_LEARNING') {
        // Store the target page for after session summary
        this.sessionMetrics.targetPage = data.targetPage || 'dashboard';
        this.setState('SESSION_ENDING');
        
        // Session summary will be shown by the LearningSession component
        // which should emit session:summary-shown when done
      }
    });
    
    // New: Handle session summary completion
    this.on('session:summary-shown', (data) => {
      if (this.currentState === 'SESSION_ENDING') {
        // Transition to IDLE state to allow normal navigation
        this.setState('IDLE');
        
        // Reset for potential new sessions
        this.resetForNewSession();
      }
    });
  }

  private checkTransitionToPlayer(): void {
    // Guard against duplicate transitions
    if (this.currentState === 'ACTIVE_LEARNING') {
      return; // Already transitioned, prevent duplicate events
    }
    
    if (this.isAnimationCompleted && this.contentReady && this.backgroundData.userLearningState) {
      this.setState('ACTIVE_LEARNING');
      this.emit('player:ready', { 
        content: this.backgroundData.firstStitch,
        userLearningState: this.backgroundData.userLearningState,
        sessionData: this.backgroundData.sessionData // Include full session data
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
        const learningEngineService = getService<LearningEngineService>('LearningEngineService');
        const sessionData = await learningEngineService.initializeLearningSession(userId, learningPathId);
        
        if (sessionData.initialQuestions && sessionData.initialQuestions.length > 0) {
          // Store full session data
          this.backgroundData.sessionData = sessionData;
          
          // Also store first question for backward compatibility
          const firstQuestion = sessionData.initialQuestions[0];
          this.backgroundData.firstStitch = {
            id: firstQuestion.id,
            text: firstQuestion.questionText,
            correctAnswer: firstQuestion.correctAnswer,
            distractor: firstQuestion.distractors && firstQuestion.distractors.length > 0 
              ? firstQuestion.distractors[0] 
              : this.generateSimpleDistractor(firstQuestion.correctAnswer),
            learningPath: learningPathId,
            metadata: {
              ...firstQuestion.metadata,
              sessionId: sessionData.sessionId,
              factId: firstQuestion.factId,
              boundaryLevel: firstQuestion.boundaryLevel,
              totalQuestions: sessionData.initialQuestions.length // Add total questions count
            }
          };
        } else {
          // APML Protocol: Service must provide content, no fallbacks allowed
          throw new Error('LearningEngine must provide questions - fallbacks violate APML compliance');
        }
      } catch (error) {
        console.error('APML Violation: LearningEngine failed to provide content:', error);
        throw new Error('LearningEngine service failure violates APML External Service Integration Protocol');
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
      
      // APML Protocol: No fallback content allowed
      throw new Error('User learning state initialization failed - APML compliance requires service reliability');
    }
  }

  // Helper methods for LearningEngine integration

  // APML Protocol: Fallback questions removed for External Service Integration Protocol compliance

  private generateSimpleDistractor(correctAnswer: string): string {
    const num = parseInt(correctAnswer);
    if (!isNaN(num)) {
      // For numbers, add or subtract 1-3
      const adjustment = Math.floor(Math.random() * 3) + 1;
      const newNum = Math.random() > 0.5 ? num + adjustment : Math.max(0, num - adjustment);
      return newNum.toString();
    }
    return correctAnswer + '?'; // Fallback for non-numeric answers
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

    // APML Protocol: Check if background initialization is in progress
    // Don't create duplicate sessions - wait for background process to complete
    if (this.backgroundData.userLearningState) {
      console.log('📚 Background initialization in progress, waiting for completion...');
      // Background process will emit 'loading:content-ready' when done
      return;
    }

    // Only as last resort, load content directly (this should rarely happen)
    console.log('📚 No background process detected, loading content directly');
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
      
      const learningEngineService = getService<LearningEngineService>('LearningEngineService');
      const sessionData = await learningEngineService.initializeLearningSession(userId, learningPath);
      
      if (sessionData.initialQuestions && sessionData.initialQuestions.length > 0) {
        const firstQuestion = sessionData.initialQuestions[0];
        
        const content = {
          id: firstQuestion.id,
          text: firstQuestion.questionText,
          correctAnswer: firstQuestion.correctAnswer,
          distractor: firstQuestion.distractors && firstQuestion.distractors.length > 0 
            ? firstQuestion.distractors[0] 
            : this.generateSimpleDistractor(firstQuestion.correctAnswer),
          learningPath: learningPath,
          metadata: {
            ...firstQuestion.metadata,
            sessionId: sessionData.sessionId,
            factId: firstQuestion.factId,
            boundaryLevel: firstQuestion.boundaryLevel
          }
        };
        
        // Store session data for LearningSession component
        this.backgroundData.sessionData = sessionData;
        
        console.log('✅ Content loaded from LearningEngine:', content);
        this.emit('loading:content-ready', { content });
      } else {
        console.error('APML Violation: LearningEngine generated no questions');
        throw new Error('LearningEngine must generate questions - empty result violates APML compliance');
      }
    } catch (error) {
      console.error('APML Violation: LearningEngine service failed:', error);
      throw new Error('LearningEngine service failure violates APML External Service Integration Protocol');
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
    // Guard against duplicate user creation
    if (this.isCreatingUser) {
      console.log('⚠️ Already creating user, skipping duplicate request');
      return;
    }
    
    // Check if user already exists (not pending)
    if (this.currentUserContext?.userId && this.currentUserContext.userId !== 'pending-creation') {
      console.log('✅ User already exists:', this.currentUserContext.userId);
      return;
    }
    
    this.isCreatingUser = true;
    
    try {
      console.log('🔄 Creating anonymous user during loading...');
      
      // Import UserSessionManager to avoid circular dependencies
      const { userSessionManager } = await import('./UserSessionManager');
      
      // Check if user already exists in session
      const existingState = userSessionManager.state;
      if (existingState.user && existingState.isAuthenticated) {
        console.log('✅ User already exists in session:', existingState.user.id);
        // Update context with existing user
        this.currentUserContext = {
          userType: 'anonymous',
          userId: existingState.user.anonymousId || existingState.user.id,
          userName: existingState.user.displayName
        };
        return;
      }
      
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
    } finally {
      this.isCreatingUser = false;
    }
  }

  // Reset for testing/cleanup
  reset(): void {
    this.currentState = 'AUTH_SUCCESS';
    this.backgroundData = { dashboardLoaded: false, contentPrepared: false };
    this.isAnimationCompleted = false;
    this.contentReady = false;
  }
  
  // Reset for new session after summary shown
  private resetForNewSession(): void {
    // Clear session-specific data
    this.isAnimationCompleted = false;
    this.contentReady = false;
    this.backgroundData.firstStitch = undefined;
    this.backgroundData.sessionData = undefined;
    
    // Reset session metrics
    this.sessionMetrics = {
      startTime: Date.now(),
      questionsAnswered: 0,
      correctAnswers: 0,
      targetPage: ''
    };
  }
  
  // Public method to request session exit
  requestSessionExit(reason: 'navigation' | 'end-button' | 'completion', targetPage?: string): void {
    this.emit('session:exit-requested', { reason, targetPage });
  }
}

// Singleton instance
export const authToPlayerEventBus = new AuthToPlayerEventBus();