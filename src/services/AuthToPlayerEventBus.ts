/**
 * Auth-to-Player Event Bus
 * 
 * Event-driven implementation of the Auth-to-Player behavioral specification.
 * Replaces useAuthToPlayerFlow hook with explicit event dispatching and handling.
 */

export type AuthToPlayerState = 
  | 'AUTH_SUCCESS'
  | 'PRE_ENGAGEMENT' 
  | 'LOADING_WITH_ANIMATION'
  | 'ACTIVE_LEARNING';

export interface AuthToPlayerEvents {
  // State transition events
  'auth:success': { userType: 'authenticated' | 'anonymous'; userId?: string; userName?: string; email?: string };
  'preengagement:play-clicked': {};
  'loading:animation-started': {};
  'loading:animation-completed': {};
  'loading:content-ready': { content: any };
  'player:ready': { content: any };
  
  // Background process events
  'background:dashboard-loaded': { dashboardData: any };
  'background:content-prepared': { firstStitch: any };
  
  // State change events
  'state:changed': { from: AuthToPlayerState; to: AuthToPlayerState };
}

type EventCallback<T = any> = (data: T) => void;

class AuthToPlayerEventBus {
  private listeners: Map<keyof AuthToPlayerEvents, EventCallback[]> = new Map();
  private currentState: AuthToPlayerState = 'AUTH_SUCCESS';
  private backgroundData: { dashboardLoaded: boolean; contentPrepared: boolean; firstStitch?: any } = {
    dashboardLoaded: false,
    contentPrepared: false
  };
  private animationCompleted = false;
  private contentReady = false;

  constructor() {
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
      this.startBackgroundProcesses();
    });

    // PRE_ENGAGEMENT → LOADING_WITH_ANIMATION transition
    this.on('preengagement:play-clicked', () => {
      this.setState('LOADING_WITH_ANIMATION');
      this.emit('loading:animation-started', {});
      this.loadFirstStitchContent();
    });

    // Track animation completion
    this.on('loading:animation-completed', () => {
      this.animationCompleted = true;
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
    if (this.animationCompleted && this.contentReady) {
      this.setState('ACTIVE_LEARNING');
      this.emit('player:ready', { content: this.backgroundData.firstStitch });
    } else {
      console.log('⏳ Waiting for both animation and content...', {
        animationCompleted: this.animationCompleted,
        contentReady: this.contentReady
      });
    }
  }

  // Background processes (start immediately on auth success)
  private startBackgroundProcesses(): void {
    console.log('🔄 Starting background loading processes');
    
    // Simulate dashboard loading
    setTimeout(() => {
      this.backgroundData.dashboardLoaded = true;
      console.log('✅ Dashboard data loaded in background');
      this.emit('background:dashboard-loaded', { dashboardData: { /* mock data */ } });
    }, 100);

    // Simulate content preparation
    setTimeout(() => {
      this.backgroundData.contentPrepared = true;
      this.backgroundData.firstStitch = {
        id: 'first-stitch',
        text: '2 + 3 = ?',
        answers: ['4', '5', '6', '7'],
        correctAnswer: 1,
        learningPath: 'addition'
      };
      console.log('✅ First stitch content prepared');
      this.emit('background:content-prepared', { firstStitch: this.backgroundData.firstStitch });
    }, 150);
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
  startFlow(userData: { userType: 'authenticated' | 'anonymous'; userId?: string; userName?: string; email?: string }): void {
    this.emit('auth:success', userData);
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
    this.animationCompleted = false;
    this.contentReady = false;
  }
}

// Singleton instance
export const authToPlayerEventBus = new AuthToPlayerEventBus();