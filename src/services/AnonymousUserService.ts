/**
 * Anonymous User Service Implementation
 * APML-Compliant service adapter for anonymous user creation
 * 
 * Implements External Service Integration Protocol with proper fallback handling
 */

import { 
  AnonymousUserServiceInterface,
  AnonymousUserCreationRequest,
  AnonymousUserCreationResult,
  SessionValidationResult,
  ServiceStatus,
  ServiceMode,
  AnonymousUser,
  AnonymousSession,
  ErrorCodes
} from '../interfaces/AnonymousUserServiceInterface';
import { UserApplicationState } from '../interfaces/UserSessionManagerInterface';
import { backendServiceOrchestrator } from './BackendServiceOrchestrator';

/**
 * APML-Compliant Anonymous User Service
 * Implements proper service adapter pattern with defined failure modes
 */
export class AnonymousUserService implements AnonymousUserServiceInterface {
  private lastStatusCheck: string = new Date().toISOString();
  private cachedStatus: ServiceStatus | null = null;

  /**
   * Create new anonymous user with session
   * Implements hybrid mode with proper fallback handling
   */
  async createAnonymousUser(request: AnonymousUserCreationRequest): Promise<AnonymousUserCreationResult> {
    const mode = request.mode || 'Hybrid';
    
    switch (mode) {
      case 'Online':
        return this.createOnlineAnonymousUser(request);
      
      case 'Offline':
        return this.createOfflineAnonymousUser(request);
      
      case 'Hybrid':
        // Attempt online first, fall back to offline on failure
        const onlineResult = await this.createOnlineAnonymousUser(request);
        if (onlineResult.success) {
          return onlineResult;
        }
        
        console.log('🔄 Online anonymous user creation failed, falling back to offline mode');
        return this.createOfflineAnonymousUser(request);
      
      default:
        return {
          success: false,
          mode: 'Hybrid',
          error: 'Invalid service mode specified',
          errorCode: 'VALIDATION_FAILED',
          isOffline: false
        };
    }
  }

  /**
   * Create anonymous user via backend service
   */
  private async createOnlineAnonymousUser(request: AnonymousUserCreationRequest): Promise<AnonymousUserCreationResult> {
    try {
      const result = await backendServiceOrchestrator.createAnonymousUserSession(request.deviceId);
      
      if (!result.success) {
        return {
          success: false,
          mode: 'Online',
          error: result.error || 'Backend service failed',
          errorCode: this.mapBackendErrorToCode(result.error),
          isOffline: false
        };
      }

      return {
        success: true,
        mode: 'Online',
        user: this.mapBackendUserToInterface(result.user),
        session: this.mapBackendSessionToInterface(result.session),
        initialState: result.initialState,
        isOffline: false
      };

    } catch (error) {
      return {
        success: false,
        mode: 'Online',
        error: error instanceof Error ? error.message : 'Online service failed',
        errorCode: 'SERVICE_UNAVAILABLE',
        isOffline: false
      };
    }
  }

  /**
   * Create anonymous user locally (offline mode)
   */
  private createOfflineAnonymousUser(request: AnonymousUserCreationRequest): AnonymousUserCreationResult {
    try {
      const timestamp = new Date().toISOString();
      const anonymousId = `local_anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const userId = `local_${Date.now()}`;
      const displayName = `Guest ${anonymousId.slice(-6)}`;
      
      // Create local anonymous user
      const user: AnonymousUser = {
        id: userId,
        anonymousId,
        displayName,
        userType: 'anonymous',
        subscriptionTier: 'Free',
        isLocal: true,
        createdAt: timestamp
      };

      // Create local session
      const session: AnonymousSession = {
        accessToken: `local_token_${userId}`,
        userType: 'anonymous',
        isLocal: true
      };

      // Initialize default user state
      const initialState: UserApplicationState = {
        stitchPositions: {},
        tripleHelixState: {
          activeTube: 1,
          currentPath: 'addition',
          rotationCount: 0
        },
        spacedRepetitionState: {
          sequence: [4, 8, 15, 30, 100, 1000],
          globalPosition: 1
        },
        progressMetrics: {
          totalSessions: 0,
          totalQuestions: 0,
          totalCorrect: 0,
          totalPoints: 0,
          lifetimeMetrics: {
            ftcPoints: 0,
            ecPoints: 0,
            basePoints: 0,
            evolution: 0,
            averageBlinkSpeed: 0,
            globalRanking: null
          }
        }
      };

      // Store locally for session persistence
      this.storeLocalSession(user, session, initialState);

      return {
        success: true,
        mode: 'Offline',
        user,
        session,
        initialState,
        isOffline: true
      };

    } catch (error) {
      return {
        success: false,
        mode: 'Offline',
        error: error instanceof Error ? error.message : 'Local user creation failed',
        errorCode: 'OFFLINE_STORAGE_FAILED',
        isOffline: true
      };
    }
  }

  /**
   * Validate existing anonymous session token
   */
  async validateAnonymousSession(token: string): Promise<SessionValidationResult> {
    // Check if it's a local token
    if (token.startsWith('local_token_')) {
      return this.validateLocalSession(token);
    }
    
    // Validate online token (JWT)
    return this.validateOnlineSession(token);
  }

  /**
   * Check current service availability and mode
   */
  getServiceStatus(): ServiceStatus {
    // Use cached status if recent (within 30 seconds)
    const now = new Date();
    const lastCheck = new Date(this.lastStatusCheck);
    const timeDiff = now.getTime() - lastCheck.getTime();
    
    if (this.cachedStatus && timeDiff < 30000) {
      return this.cachedStatus;
    }

    // Update status
    this.lastStatusCheck = now.toISOString();
    const backendStatus = backendServiceOrchestrator.getServiceStatus();
    
    this.cachedStatus = {
      isOnline: backendStatus.overall,
      mode: backendStatus.overall ? 'Online' : 'Offline',
      lastCheck: this.lastStatusCheck,
      responseTime: undefined // Could be enhanced with actual response time measurement
    };

    return this.cachedStatus;
  }

  // Private helper methods

  private mapBackendErrorToCode(error?: string): ErrorCodes {
    if (!error) return 'SERVICE_UNAVAILABLE';
    
    if (error.includes('database')) return 'DATABASE_ERROR';
    if (error.includes('user')) return 'USER_CREATION_FAILED';
    if (error.includes('state')) return 'STATE_INITIALIZATION_FAILED';
    if (error.includes('token')) return 'TOKEN_GENERATION_FAILED';
    
    return 'SERVICE_UNAVAILABLE';
  }

  private mapBackendUserToInterface(backendUser: any): AnonymousUser {
    return {
      id: backendUser.id,
      anonymousId: backendUser.anonymousId,
      displayName: backendUser.displayName,
      userType: 'anonymous',
      subscriptionTier: backendUser.subscriptionTier || 'Free',
      isLocal: false,
      expiresAt: backendUser.expiresAt,
      createdAt: backendUser.createdAt || new Date().toISOString()
    };
  }

  private mapBackendSessionToInterface(backendSession: any): AnonymousSession {
    return {
      accessToken: backendSession.accessToken,
      userType: 'anonymous',
      isLocal: false,
      expiresAt: backendSession.expiresAt
    };
  }

  private storeLocalSession(user: AnonymousUser, session: AnonymousSession, state: UserApplicationState): void {
    try {
      const sessionData = {
        user,
        session,
        initialState: state,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem(`zenjin_local_session_${user.id}`, JSON.stringify(sessionData));
    } catch (error) {
      console.warn('Failed to store local session data:', error);
    }
  }

  private validateLocalSession(token: string): SessionValidationResult {
    try {
      const userId = token.replace('local_token_', '');
      const sessionData = localStorage.getItem(`zenjin_local_session_${userId}`);
      
      if (!sessionData) {
        return {
          isValid: false,
          isOffline: true,
          error: 'Local session not found'
        };
      }

      const parsed = JSON.parse(sessionData);
      return {
        isValid: true,
        userId: parsed.user.id,
        isOffline: true
      };

    } catch (error) {
      return {
        isValid: false,
        isOffline: true,
        error: 'Invalid local session data'
      };
    }
  }

  private async validateOnlineSession(token: string): Promise<SessionValidationResult> {
    // This would integrate with backend JWT validation
    // For now, return basic validation
    return {
      isValid: false,
      isOffline: false,
      error: 'Online session validation not implemented'
    };
  }
}

// Export singleton instance
export const anonymousUserService = new AnonymousUserService();