/**
 * UserSessionManager Implementation
 * Implements UserSessionManagerInterface.apml specification
 * 
 * APML-Compliant backend services integration for user session management
 */

// Browser-compatible EventEmitter implementation
class SimpleEventEmitter {
  private events: { [key: string]: Function[] } = {};

  on(event: string, callback: Function): () => void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  off(event: string, callback: Function): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  emit(event: string, ...args: any[]): void {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }
}
import { 
  UserSessionManagerInterface, 
  UserSessionState, 
  UserApplicationState, 
  SessionMetrics, 
  User, 
  Session,
  SessionStateChangedEvent,
  UserStateChangedEvent,
  BackendStatusChangedEvent,
  UserSessionInitializationResult,
  StateUpdateResult
} from '../interfaces/UserSessionManagerInterface';
import { backendServiceOrchestrator, BackendServiceStatus } from './BackendServiceOrchestrator';
import { configurationService } from './ConfigurationService';

/**
 * UserSessionManager
 * Coordinates backend services with frontend application state
 */
export class UserSessionManager extends SimpleEventEmitter implements UserSessionManagerInterface {
  private _state: UserSessionState;

  constructor() {
    super();
    
    // Initialize with default state per interface specification
    // Start with isLoading: false since LaunchInterface will handle user choice first
    this._state = {
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      backendStatus: {
        auth: false,
        realtime: false,
        api: false,
        database: false,
        overall: false
      },
      userState: {
        stitchPositions: {},
        tripleHelixState: {},
        spacedRepetitionState: {},
        progressMetrics: {},
        lastSyncTime: null,
        version: 0
      },
      error: null
    };
  }

  /**
   * Get current session state (readonly)
   */
  get state(): UserSessionState {
    return { ...this._state };
  }

  /**
   * Initialize user session, create anonymous user if needed, and establish backend connections
   */
  async initializeSession(deviceId?: string): Promise<boolean> {
    this.updateState({ isLoading: true, error: null });

    try {
      // Step 1: Check configuration availability
      const config = await configurationService.getConfiguration();
      if (!config.configured) {
        console.log('Backend not configured, running in offline mode');
        this.updateState({ 
          isLoading: false, 
          error: 'Backend configuration not available. Running in offline mode.' 
        });
        return false;
      }

      // Step 2: Initialize backend services
      const initialized = await backendServiceOrchestrator.initialize();
      if (!initialized) {
        this.updateState({ 
          isLoading: false, 
          error: 'Failed to initialize backend services' 
        });
        return false;
      }

      // Step 3: Check for existing session
      const existingUser = backendServiceOrchestrator.getCurrentUser();
      const existingSession = backendServiceOrchestrator.getCurrentSession();

      if (existingUser && existingSession) {
        // Restore existing session
        console.log('Restoring existing user session');
        return await this.restoreExistingSession(existingUser, existingSession);
      } else {
        // Create new anonymous user session
        console.log('Creating new anonymous user session');
        return await this.createAnonymousUser(deviceId);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Session initialization failed';
      this.updateState({ 
        isLoading: false, 
        error: errorMessage 
      });
      return false;
    }
  }

  /**
   * Create new anonymous user and establish authenticated session
   */
  async createAnonymousUser(deviceId?: string): Promise<boolean> {
    this.updateState({ isLoading: true, error: null });

    try {
      const result = await backendServiceOrchestrator.createAnonymousUserSession(deviceId);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create anonymous user');
      }

      // Update session state
      this.updateState({
        user: result.user,
        session: result.session,
        isAuthenticated: true,
        isLoading: false,
        backendStatus: backendServiceOrchestrator.getServiceStatus()
      });

      // Load initial user state from backend
      await this.refreshUserState();

      console.log('✅ Anonymous user session created:', result.user);
      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Anonymous user creation failed';
      this.updateState({ 
        isLoading: false, 
        error: errorMessage 
      });
      return false;
    }
  }

  /**
   * Get current user application state
   */
  getUserState(): UserApplicationState {
    return { ...this._state.userState };
  }

  /**
   * Refresh user state from backend services
   */
  async refreshUserState(): Promise<boolean> {
    if (!this._state.session?.accessToken || !this._state.user?.id) {
      console.warn('No active session for state refresh');
      return false;
    }

    try {
      const userStateData = await backendServiceOrchestrator.getUserState(
        this._state.user.id,
        this._state.session.accessToken
      );

      const refreshedState: UserApplicationState = {
        stitchPositions: userStateData.stitchPositions || {},
        tripleHelixState: userStateData.tripleHelixState || {},
        spacedRepetitionState: userStateData.spacedRepetitionState || {},
        progressMetrics: userStateData.progressMetrics || {},
        lastSyncTime: userStateData.lastSyncTime,
        version: userStateData.version || 0
      };

      this.updateState({ userState: refreshedState });
      
      this.emit('userStateChanged', {
        changes: refreshedState,
        source: 'backend'
      } as UserStateChangedEvent);

      console.log('✅ User state refreshed from backend');
      return true;

    } catch (error) {
      console.error('Failed to refresh user state:', error);
      return false;
    }
  }

  /**
   * Update user application state with backend synchronization
   */
  async updateUserState(changes: Partial<UserApplicationState>): Promise<boolean> {
    // Update local state immediately (optimistic update)
    const updatedUserState = { ...this._state.userState, ...changes };
    this.updateState({ userState: updatedUserState });

    this.emit('userStateChanged', {
      changes,
      source: 'local'
    } as UserStateChangedEvent);

    // Attempt backend synchronization if session available
    if (!this._state.session?.accessToken || !this._state.user?.id) {
      console.warn('No session available for backend sync, keeping local changes');
      return true;
    }

    try {
      const syncedState = await backendServiceOrchestrator.updateUserState(
        this._state.user.id,
        this._state.session.accessToken,
        changes,
        this._state.userState.version
      );

      // Update with synced state from backend
      const backendUserState: UserApplicationState = {
        stitchPositions: syncedState.stitchPositions || {},
        tripleHelixState: syncedState.tripleHelixState || {},
        spacedRepetitionState: syncedState.spacedRepetitionState || {},
        progressMetrics: syncedState.progressMetrics || {},
        lastSyncTime: syncedState.lastSyncTime,
        version: syncedState.version || 0
      };

      this.updateState({ userState: backendUserState });

      this.emit('userStateChanged', {
        changes: backendUserState,
        source: 'backend'
      } as UserStateChangedEvent);

      console.log('✅ User state synced to backend');
      return true;

    } catch (error) {
      console.error('Failed to sync user state to backend:', error);
      // Local state already updated, so return true but log sync failure
      return false;
    }
  }

  /**
   * Record learning session metrics to backend for analytics
   */
  async recordSessionMetrics(metrics: SessionMetrics): Promise<boolean> {
    if (!this._state.session?.accessToken || !this._state.user?.id) {
      console.warn('No session available for metrics recording');
      return false;
    }

    try {
      // Integrate metrics with existing progress metrics
      const updatedProgressMetrics = {
        ...this._state.userState.progressMetrics,
        totalSessions: (this._state.userState.progressMetrics.totalSessions || 0) + 1,
        totalQuestions: (this._state.userState.progressMetrics.totalQuestions || 0) + metrics.totalQuestions,
        totalCorrectAnswers: (this._state.userState.progressMetrics.totalCorrectAnswers || 0) + metrics.correctAnswers,
        lastSessionTime: metrics.timestamp,
        lastSessionAccuracy: (metrics.correctAnswers / metrics.totalQuestions) * 100,
        averageCompletionTime: this.calculateAverageCompletionTime(metrics.completionTime),
        recentSessions: this.updateRecentSessions(metrics)
      };

      // Update user state with new metrics
      return await this.updateUserState({
        progressMetrics: updatedProgressMetrics
      });

    } catch (error) {
      console.error('Failed to record session metrics:', error);
      return false;
    }
  }

  /**
   * Get current status of all backend services
   */
  getBackendStatus(): BackendServiceStatus {
    const status = backendServiceOrchestrator.getServiceStatus();
    
    // Update internal status if changed
    if (JSON.stringify(status) !== JSON.stringify(this._state.backendStatus)) {
      this.updateState({ backendStatus: status });
      
      this.emit('backendStatusChanged', {
        status
      } as BackendStatusChangedEvent);
    }

    return status;
  }

  /**
   * Logout user and clean up session state
   */
  async logout(): Promise<boolean> {
    try {
      await backendServiceOrchestrator.logoutUser();
      
      // Reset to initial state
      const previousState = { ...this._state };
      this._state = {
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        backendStatus: {
          auth: false,
          realtime: false,
          api: false,
          database: false,
          overall: false
        },
        userState: {
          stitchPositions: {},
          tripleHelixState: {},
          spacedRepetitionState: {},
          progressMetrics: {},
          lastSyncTime: null,
          version: 0
        },
        error: null
      };

      this.emit('sessionStateChanged', {
        newState: this._state,
        previousState
      } as SessionStateChangedEvent);

      console.log('✅ User logged out successfully');
      return true;

    } catch (error) {
      console.error('Logout failed:', error);
      // Force local logout even if backend fails
      this._state = {
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        backendStatus: {
          auth: false,
          realtime: false,
          api: false,
          database: false,
          overall: false
        },
        userState: {
          stitchPositions: {},
          tripleHelixState: {},
          spacedRepetitionState: {},
          progressMetrics: {},
          lastSyncTime: null,
          version: 0
        },
        error: 'Logout failed, session cleared locally'
      };
      return false;
    }
  }

  /**
   * Event subscription overrides for type safety
   */
  on(event: 'sessionStateChanged', callback: (data: SessionStateChangedEvent) => void): () => void;
  on(event: 'userStateChanged', callback: (data: UserStateChangedEvent) => void): () => void;
  on(event: 'backendStatusChanged', callback: (data: BackendStatusChangedEvent) => void): () => void;
  on(event: string, callback: (...args: any[]) => void): () => void {
    super.on(event, callback);
    return () => super.off(event, callback);
  }

  /**
   * Restore existing session from stored user/session data
   */
  private async restoreExistingSession(user: any, session: any): Promise<boolean> {
    try {
      this.updateState({
        user,
        session,
        isAuthenticated: true,
        backendStatus: backendServiceOrchestrator.getServiceStatus()
      });

      // Refresh user state from backend
      await this.refreshUserState();

      this.updateState({ isLoading: false });

      console.log('✅ Existing session restored:', user);
      return true;

    } catch (error) {
      console.error('Failed to restore existing session:', error);
      this.updateState({ 
        isLoading: false, 
        error: 'Failed to restore existing session' 
      });
      return false;
    }
  }

  /**
   * Update internal state and emit change events
   */
  private updateState(changes: Partial<UserSessionState>): void {
    const previousState = { ...this._state };
    this._state = { ...this._state, ...changes };

    this.emit('sessionStateChanged', {
      newState: this._state,
      previousState
    } as SessionStateChangedEvent);
  }

  /**
   * Calculate average completion time including new session
   */
  private calculateAverageCompletionTime(newCompletionTime: number): number {
    const currentAverage = this._state.userState.progressMetrics.averageCompletionTime || 0;
    const sessionCount = this._state.userState.progressMetrics.totalSessions || 0;
    
    if (sessionCount === 0) {
      return newCompletionTime;
    }
    
    return Math.round(((currentAverage * sessionCount) + newCompletionTime) / (sessionCount + 1));
  }

  /**
   * Update recent sessions array with new session metrics
   */
  private updateRecentSessions(metrics: SessionMetrics): SessionMetrics[] {
    const recentSessions = this._state.userState.progressMetrics.recentSessions || [];
    const updatedSessions = [metrics, ...recentSessions].slice(0, 10); // Keep last 10 sessions
    return updatedSessions;
  }
}

// Create singleton instance for application use
export const userSessionManager = new UserSessionManager();