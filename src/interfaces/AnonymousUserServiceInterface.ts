/**
 * Anonymous User Service Interface
 * Generated from AnonymousUserServiceInterface.apml
 * 
 * APML-Compliant service adapter for anonymous user creation
 */

export type ServiceMode = 'Online' | 'Offline' | 'Hybrid';

export type ErrorCodes = 
  | 'SERVICE_UNAVAILABLE' 
  | 'DATABASE_ERROR' 
  | 'USER_CREATION_FAILED'
  | 'STATE_INITIALIZATION_FAILED' 
  | 'TOKEN_GENERATION_FAILED'
  | 'OFFLINE_STORAGE_FAILED' 
  | 'VALIDATION_FAILED';

export interface AnonymousUser {
  id: string;
  anonymousId: string;
  displayName: string;
  userType: 'anonymous';
  subscriptionTier: string;
  isLocal: boolean;
  expiresAt?: string;
  createdAt: string;
}

export interface AnonymousSession {
  accessToken: string;
  userType: 'anonymous';
  isLocal: boolean;
  expiresAt?: number;
}

export interface AnonymousUserCreationRequest {
  deviceId?: string;
  mode?: ServiceMode;
  initialSessionData?: Record<string, any>;
  ttlHours?: number;
}

export interface AnonymousUserCreationResult {
  success: boolean;
  user?: AnonymousUser;
  session?: AnonymousSession;
  initialState?: any; // UserApplicationState type to be imported
  mode: ServiceMode;
  error?: string;
  errorCode?: ErrorCodes;
  isOffline: boolean;
}

export interface SessionValidationResult {
  isValid: boolean;
  userId?: string;
  expiresAt?: number;
  isOffline: boolean;
  error?: string;
}

export interface ServiceStatus {
  isOnline: boolean;
  mode: ServiceMode;
  lastCheck: string;
  responseTime?: number;
}

/**
 * Anonymous User Service Interface Contract
 * Defines service adapter pattern for external anonymous user creation
 */
export interface AnonymousUserServiceInterface {
  /**
   * Create new anonymous user with session
   */
  createAnonymousUser(request: AnonymousUserCreationRequest): Promise<AnonymousUserCreationResult>;
  
  /**
   * Validate existing anonymous session token
   */
  validateAnonymousSession(token: string): Promise<SessionValidationResult>;
  
  /**
   * Check current service availability and mode
   */
  getServiceStatus(): ServiceStatus;
}