/**
 * AnonymousUserServiceInterface.ts
 * Generated from APML Interface Definition
 * Module: Authentication
 */

import { UserApplicationState } from './UserApplicationState';
import { AuthSession } from './AuthSession';

/**
 * Defines contract for anonymous user creation services with multiple implementation strategies.
 * Enables seamless switching between online backend services and offline local fallbacks.
 */
/**
 * Service operation mode for anonymous user creation
 */
export interface ServiceMode {
}

export interface AnonymousUser {
  id: string;
  anonymousId: string;
  displayName: string;
  userType: string;
  subscriptionTier: string;
  isLocal: boolean;
  expiresAt?: string;
  createdAt: string;
}

export interface AnonymousSession {
  accessToken: string;
  userType: string;
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
  initialState?: UserApplicationState;
  /** Indicates which mode was used */
  mode: ServiceMode;
  error?: string;
  errorCode?: string;
  /** True if offline mode was used */
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
 * Error codes for AnonymousUserServiceInterface
 */
export enum AnonymousUserServiceErrorCode {
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  USER_CREATION_FAILED = 'USER_CREATION_FAILED',
  STATE_INITIALIZATION_FAILED = 'STATE_INITIALIZATION_FAILED',
  TOKEN_GENERATION_FAILED = 'TOKEN_GENERATION_FAILED',
  OFFLINE_STORAGE_FAILED = 'OFFLINE_STORAGE_FAILED',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
}

// Export default interface
export default AnonymousUserServiceInterface;
