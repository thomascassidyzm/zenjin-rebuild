/**
 * AuthenticationFlowInterface.ts
 * Generated from APML Interface Definition
 * Module: Authentication
 */

import { AuthenticatedUserContext } from './AuthenticatedUserContext';

/**
 * Defines contracts for authentication flow completion with proper user data availability guarantees.
 * Eliminates timing dependencies and ensures Auth-to-Player flow receives complete user context.
 */
/**
 * Method used for authentication
 */
export interface AuthenticationMethod {
}

export interface AuthenticatedUser {
  /** Unique user identifier from authentication system */
  id: string;
  /** Verified email address */
  email: string;
  /** User display name */
  displayName?: string;
  /** Type of user account (registered, anonymous, etc.) */
  userType: string;
  /** User subscription level */
  subscriptionTier: string;
}

export interface AuthenticationResult {
  success: boolean;
  /** Present when success=true, contains complete user data */
  user?: AuthenticatedUser;
  /** Present when success=false, contains error message */
  error?: string;
}

/**
 * AuthenticationFlowInterface
 * Defines the contract for authentication flow completion handling
 */
export interface AuthenticationFlowInterface {
  /**
   * Handle authentication completion with admin detection
   * Enhanced to support admin status detection during auth flow
   */
  onAuthenticationComplete(result: AuthenticationResult, method: AuthenticationMethod): Promise<void>;
  
  /**
   * Create user context from authenticated user data
   */
  createUserContext(user: AuthenticatedUser): AuthenticatedUserContext;
  
  /**
   * Handle password authentication
   */
  handlePasswordAuthentication(email: string, password: string): Promise<AuthenticationResult>;
  
  /**
   * Handle OTP authentication
   */
  handleOTPAuthentication(email: string, otp: string): Promise<AuthenticationResult>;
}

/**
 * Authentication method types
 */
export type AuthenticationMethod = 'PASSWORD' | 'OTP' | 'ANONYMOUS' | 'SOCIAL';

/**
 * Error codes for AuthenticationFlowInterface
 */
export enum AuthenticationFlowErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  USER_REGISTRATION_FAILED = 'USER_REGISTRATION_FAILED',
}

// Export default interface
export default AuthenticationFlowInterface;
