/**
 * Authentication Flow Interface
 * Generated from AuthenticationFlowInterface.apml
 * 
 * APML-Compliant interface contracts for authentication completion
 */

export type AuthenticationMethod = 'PASSWORD' | 'OTP' | 'ANONYMOUS';

export interface AuthenticatedUser {
  id: string;
  email: string;
  displayName?: string;
  userType: string;
  subscriptionTier: string;
}

export interface AuthenticationResult {
  success: boolean;
  user?: AuthenticatedUser;
  error?: string;
}

export interface AuthenticationFlowInterface {
  /**
   * Handle authentication completion with guaranteed user data availability
   */
  onAuthenticationComplete(result: AuthenticationResult, method: AuthenticationMethod): void;
  
  /**
   * Create typed user context from authentication result
   */
  createUserContext(user: AuthenticatedUser): any; // AuthenticatedUserContext type
  
  /**
   * Process password authentication with proper error handling
   */
  handlePasswordAuthentication(email: string, password: string): Promise<AuthenticationResult>;
}