/**
 * BackendServiceOrchestrator Implementation
 * Coordinates all backend services and provides a unified interface
 */

import { SupabaseAuth, AuthResult, RegistrationRequest, LoginRequest } from './SupabaseAuth';
import { SupabaseRealTime, RealtimeEvent, SubscriptionConfig, RealtimeMetrics } from './SupabaseRealTime';
import { backendAPIClient } from './BackendAPIClient';

export interface BackendServiceStatus {
  auth: boolean;
  realtime: boolean;
  api: boolean;
  database: boolean;
  overall: boolean;
}

export interface ServiceMetrics {
  auth: {
    currentUser: any | null;
    sessionActive: boolean;
    userType: string | null;
  };
  realtime: RealtimeMetrics;
  api: {
    lastResponse: number | null;
    requestCount: number;
    errorCount: number;
  };
}

export interface BackendError {
  service: string;
  operation: string;
  error: string;
  timestamp: string;
}

/**
 * Orchestrates all backend services and provides a unified interface
 */
export class BackendServiceOrchestrator {
  private auth: SupabaseAuth;
  private realtime: SupabaseRealTime;
  private apiRequestCount = 0;
  private apiErrorCount = 0;
  private lastApiResponse: number | null = null;
  private errors: BackendError[] = [];

  constructor() {
    this.auth = new SupabaseAuth();
    this.realtime = new SupabaseRealTime();
  }

  /**
   * Initialize all backend services
   */
  async initialize(): Promise<boolean> {
    try {
      // Services are already initialized in constructors
      // Could add any additional setup here
      return true;
    } catch (error) {
      this.logError('orchestrator', 'initialize', error);
      return false;
    }
  }

  /**
   * Create an anonymous user and set up real-time subscriptions
   */
  async createAnonymousUserSession(deviceId?: string): Promise<AuthResult> {
    try {
      this.apiRequestCount++;
      
      // Create anonymous user via API client
      const response = await backendAPIClient.createAnonymousUser(deviceId);
      this.lastApiResponse = Date.now();

      if (!response.success) {
        throw new Error('API client failed to create anonymous user');
      }

      // Set up real-time subscription for this user
      const userId = response.data.user.id;
      this.setupUserRealTimeSubscriptions(userId);

      return {
        success: true,
        session: {
          user: response.data.user,
          accessToken: response.data.session.accessToken,
          refreshToken: '',
          expiresAt: response.data.session.expiresAt,
          userType: 'anonymous'
        },
        user: response.data.user
      };

    } catch (error) {
      this.apiErrorCount++;
      this.logError('orchestrator', 'createAnonymousUserSession', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create anonymous user session'
      };
    }
  }

  /**
   * Register a new user account
   */
  async registerUser(registrationRequest: RegistrationRequest): Promise<AuthResult> {
    try {
      const result = await this.auth.registerUser(registrationRequest);
      
      if (result.success && result.user) {
        // Set up real-time subscriptions for the new user
        this.setupUserRealTimeSubscriptions(result.user.id);
      }

      return result;
    } catch (error) {
      this.logError('auth', 'registerUser', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'User registration failed'
      };
    }
  }

  /**
   * Login an existing user
   */
  async loginUser(loginRequest: LoginRequest): Promise<AuthResult> {
    try {
      const result = await this.auth.loginUser(loginRequest);
      
      if (result.success && result.user) {
        // Set up real-time subscriptions for the logged-in user
        this.setupUserRealTimeSubscriptions(result.user.id);
      }

      return result;
    } catch (error) {
      this.logError('auth', 'loginUser', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'User login failed'
      };
    }
  }

  /**
   * Logout the current user
   */
  async logoutUser(): Promise<boolean> {
    try {
      // Clean up real-time subscriptions
      this.realtime.destroy();
      
      // Logout from auth service
      const success = await this.auth.logoutUser();
      
      return success;
    } catch (error) {
      this.logError('auth', 'logoutUser', error);
      return false;
    }
  }

  /**
   * Get current user state from API
   */
  async getUserState(userId: string, accessToken: string): Promise<any> {
    try {
      this.apiRequestCount++;
      const response = await backendAPIClient.getUserState(userId, accessToken);
      this.lastApiResponse = Date.now();
      return response.data;
    } catch (error) {
      this.apiErrorCount++;
      this.logError('api', 'getUserState', error);
      throw error;
    }
  }

  /**
   * Update user state via API
   */
  async updateUserState(userId: string, accessToken: string, stateChanges: any, expectedVersion: number): Promise<any> {
    try {
      this.apiRequestCount++;
      const response = await backendAPIClient.updateUserState(userId, accessToken, {
        stateChanges,
        expectedVersion,
        syncSource: 'orchestrator'
      });
      this.lastApiResponse = Date.now();
      return response.data;
    } catch (error) {
      this.apiErrorCount++;
      this.logError('api', 'updateUserState', error);
      throw error;
    }
  }

  /**
   * Set up real-time subscriptions for a user
   */
  private setupUserRealTimeSubscriptions(userId: string): void {
    try {
      // Subscribe to user state changes
      this.realtime.subscribeToUserState(userId, (event: RealtimeEvent) => {
        console.log('User state changed:', event);
        // Emit custom event for the app to handle
        this.emitUserStateChange(event);
      });

      // Subscribe to session metrics changes
      this.realtime.subscribeToSessionMetrics(userId, (event: RealtimeEvent) => {
        console.log('Session metrics updated:', event);
        // Emit custom event for the app to handle
        this.emitSessionMetricsChange(event);
      });

    } catch (error) {
      this.logError('realtime', 'setupUserRealTimeSubscriptions', error);
    }
  }

  /**
   * Subscribe to real-time events with custom callback
   */
  subscribeToRealtimeEvents(config: SubscriptionConfig, callback: (event: RealtimeEvent) => void): string {
    try {
      return this.realtime.subscribe(config, callback);
    } catch (error) {
      this.logError('realtime', 'subscribeToRealtimeEvents', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from real-time events
   */
  unsubscribeFromRealtimeEvents(subscriptionId: string): boolean {
    try {
      return this.realtime.unsubscribe(subscriptionId);
    } catch (error) {
      this.logError('realtime', 'unsubscribeFromRealtimeEvents', error);
      return false;
    }
  }

  /**
   * Get current user from auth service
   */
  getCurrentUser(): any | null {
    return this.auth.getCurrentUser();
  }

  /**
   * Get current session from auth service
   */
  getCurrentSession(): any | null {
    return this.auth.getCurrentSession();
  }

  /**
   * Check the status of all backend services
   */
  getServiceStatus(): BackendServiceStatus {
    const authStatus = this.auth.getCurrentSession() !== null;
    const realtimeStatus = this.realtime.getConnectionStatus() === 'OPEN';
    const apiStatus = this.lastApiResponse !== null && (Date.now() - this.lastApiResponse) < 60000; // Within last minute
    const databaseStatus = true; // Assume database is OK if API is working

    return {
      auth: authStatus,
      realtime: realtimeStatus,
      api: apiStatus,
      database: databaseStatus,
      overall: authStatus && realtimeStatus && apiStatus && databaseStatus
    };
  }

  /**
   * Get performance metrics for all services
   */
  getServiceMetrics(): ServiceMetrics {
    const currentUser = this.auth.getCurrentUser();
    const currentSession = this.auth.getCurrentSession();

    return {
      auth: {
        currentUser,
        sessionActive: currentSession !== null,
        userType: currentUser?.userType || null
      },
      realtime: this.realtime.getMetrics(),
      api: {
        lastResponse: this.lastApiResponse,
        requestCount: this.apiRequestCount,
        errorCount: this.apiErrorCount
      }
    };
  }

  /**
   * Get recent errors from all services
   */
  getRecentErrors(limit: number = 10): BackendError[] {
    return this.errors.slice(-limit);
  }

  /**
   * Test all backend services connectivity
   */
  async testServices(): Promise<{ [service: string]: boolean }> {
    const results: { [service: string]: boolean } = {};

    // Test API connectivity
    try {
      await backendAPIClient.testBackendConnection();
      results.api = true;
    } catch (error) {
      results.api = false;
      this.logError('api', 'testServices', error);
    }

    // Test auth service
    try {
      const currentSession = this.auth.getCurrentSession();
      results.auth = true; // Auth service is available if we can call it
    } catch (error) {
      results.auth = false;
      this.logError('auth', 'testServices', error);
    }

    // Test real-time service
    try {
      const status = this.realtime.getConnectionStatus();
      results.realtime = status === 'OPEN' || status === 'CONNECTING';
    } catch (error) {
      results.realtime = false;
      this.logError('realtime', 'testServices', error);
    }

    return results;
  }

  /**
   * Log an error to the error tracking system
   */
  private logError(service: string, operation: string, error: any): void {
    const backendError: BackendError = {
      service,
      operation,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    };

    this.errors.push(backendError);

    // Keep only last 100 errors
    if (this.errors.length > 100) {
      this.errors = this.errors.slice(-100);
    }

    console.error(`Backend Error [${service}:${operation}]:`, error);
  }

  /**
   * Emit user state change event (can be enhanced with EventEmitter)
   */
  private emitUserStateChange(event: RealtimeEvent): void {
    // For now, just log. In a real implementation, you might use EventEmitter
    // or integrate with a state management system like Redux/Zustand
    console.log('User state change event:', event);
    
    // Could dispatch to global state management here
    // globalStateManager.updateUserState(event.record);
  }

  /**
   * Emit session metrics change event
   */
  private emitSessionMetricsChange(event: RealtimeEvent): void {
    console.log('Session metrics change event:', event);
    
    // Could dispatch to metrics tracking system here
    // metricsTracker.updateSessionMetrics(event.record);
  }

  /**
   * Clean up all services
   */
  destroy(): void {
    this.realtime.destroy();
    // Auth cleanup is handled internally by Supabase
  }
}

// Create a singleton instance for use throughout the app
export const backendServiceOrchestrator = new BackendServiceOrchestrator();