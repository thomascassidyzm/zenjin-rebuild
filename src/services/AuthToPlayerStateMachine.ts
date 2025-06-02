/**
 * Auth-to-Player State Machine
 * 
 * First-principles design that makes duplicate user creation impossible by design.
 * No guard rails needed - the state machine itself prevents invalid transitions.
 */

import { UserContext, AnonymousUserContext, AuthenticatedUserContext } from '../interfaces/AuthToPlayerInterface';

export type AuthToPlayerState = 
  | 'INITIAL'
  | 'PENDING_ANONYMOUS'
  | 'CREATING_USER'
  | 'PRE_ENGAGEMENT'
  | 'LOADING_WITH_ANIMATION'
  | 'ACTIVE_LEARNING'
  | 'ERROR';

export type AuthToPlayerEvent =
  | { type: 'CHOOSE_ANONYMOUS' }
  | { type: 'CHOOSE_SIGNIN' }
  | { type: 'AUTHENTICATED'; user: AuthenticatedUserContext }
  | { type: 'PLAY_CLICKED' }
  | { type: 'USER_CREATED'; user: AnonymousUserContext }
  | { type: 'CREATION_FAILED'; error: string }
  | { type: 'ANIMATION_COMPLETE' }
  | { type: 'CONTENT_READY'; content: any };

interface StateMachineContext {
  userContext?: UserContext;
  error?: string;
  content?: any;
  isContentReady: boolean;
  isAnimationComplete: boolean;
}

export class AuthToPlayerStateMachine {
  private currentState: AuthToPlayerState = 'INITIAL';
  private context: StateMachineContext = {
    isContentReady: false,
    isAnimationComplete: false
  };
  
  private listeners = new Map<string, Array<(data: any) => void>>();
  
  /**
   * Get current state (read-only)
   */
  getState(): AuthToPlayerState {
    return this.currentState;
  }
  
  /**
   * Get context (read-only)
   */
  getContext(): Readonly<StateMachineContext> {
    return { ...this.context };
  }
  
  /**
   * Send event to state machine
   */
  send(event: AuthToPlayerEvent): void {
    const prevState = this.currentState;
    const transition = this.getTransition(this.currentState, event);
    
    if (!transition) {
      console.warn(`No transition from ${this.currentState} for event ${event.type}`);
      return;
    }
    
    // Execute transition
    this.currentState = transition.target;
    this.updateContext(event);
    
    console.log(`State transition: ${prevState} → ${this.currentState}`);
    this.emit('stateChanged', { from: prevState, to: this.currentState, event });
    
    // Execute entry actions for new state
    this.executeEntryActions(this.currentState);
  }
  
  /**
   * Subscribe to state machine events
   */
  on(event: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    this.listeners.get(event)!.push(callback);
    
    return () => {
      const callbacks = this.listeners.get(event) || [];
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }
  
  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => cb(data));
  }
  
  /**
   * Define state transitions
   */
  private getTransition(state: AuthToPlayerState, event: AuthToPlayerEvent): { target: AuthToPlayerState } | null {
    const transitions: Record<AuthToPlayerState, Partial<Record<AuthToPlayerEvent['type'], AuthToPlayerState>>> = {
      INITIAL: {
        CHOOSE_ANONYMOUS: 'PENDING_ANONYMOUS',
        AUTHENTICATED: 'PRE_ENGAGEMENT'
      },
      PENDING_ANONYMOUS: {
        PLAY_CLICKED: 'CREATING_USER'
      },
      CREATING_USER: {
        USER_CREATED: 'LOADING_WITH_ANIMATION',
        CREATION_FAILED: 'ERROR'
      },
      PRE_ENGAGEMENT: {
        PLAY_CLICKED: 'LOADING_WITH_ANIMATION'
      },
      LOADING_WITH_ANIMATION: {
        // Only transition when BOTH animation and content are ready
        ANIMATION_COMPLETE: this.canTransitionToActive() ? 'ACTIVE_LEARNING' : undefined,
        CONTENT_READY: this.canTransitionToActive() ? 'ACTIVE_LEARNING' : undefined
      },
      ACTIVE_LEARNING: {
        // Final state - no transitions
      },
      ERROR: {
        // Could add retry logic here
      }
    };
    
    const targetState = transitions[state]?.[event.type];
    return targetState ? { target: targetState } : null;
  }
  
  /**
   * Update context based on events
   */
  private updateContext(event: AuthToPlayerEvent): void {
    switch (event.type) {
      case 'AUTHENTICATED':
      case 'USER_CREATED':
        this.context.userContext = event.user;
        break;
        
      case 'CREATION_FAILED':
        this.context.error = event.error;
        break;
        
      case 'CONTENT_READY':
        this.context.content = event.content;
        this.context.isContentReady = true;
        break;
        
      case 'ANIMATION_COMPLETE':
        this.context.isAnimationComplete = true;
        break;
        
      case 'CHOOSE_ANONYMOUS':
        // Set pending context
        this.context.userContext = {
          userType: 'anonymous',
          userId: 'pending-creation',
          userName: 'Guest'
        };
        break;
    }
  }
  
  /**
   * Check if we can transition to active learning
   */
  private canTransitionToActive(): boolean {
    return this.context.isAnimationComplete && this.context.isContentReady;
  }
  
  /**
   * Execute entry actions for states
   */
  private executeEntryActions(state: AuthToPlayerState): void {
    switch (state) {
      case 'CREATING_USER':
        // This is THE ONLY place user creation happens
        this.emit('action:createUser', {});
        break;
        
      case 'LOADING_WITH_ANIMATION':
        this.emit('action:startAnimation', {});
        this.emit('action:loadContent', { userContext: this.context.userContext });
        break;
        
      case 'ACTIVE_LEARNING':
        this.emit('action:startLearning', { 
          content: this.context.content,
          userContext: this.context.userContext 
        });
        break;
    }
  }
  
  /**
   * Reset state machine (for testing)
   */
  reset(): void {
    this.currentState = 'INITIAL';
    this.context = {
      isContentReady: false,
      isAnimationComplete: false
    };
  }
}

// Singleton instance
export const authToPlayerStateMachine = new AuthToPlayerStateMachine();