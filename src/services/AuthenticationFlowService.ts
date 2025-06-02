/**
 * Authentication Flow Service
 * APML-Compliant service adapter for authentication completion handling
 * 
 * Eliminates timing dependencies and provides guaranteed user data availability
 */

import {
  AuthenticationFlowInterface,
  AuthenticationResult,
  AuthenticationMethod,
  AuthenticatedUser
} from '../interfaces/AuthenticationFlowInterface';
import { AuthenticatedUserContext } from '../interfaces/AuthToPlayerInterface';
import { authToPlayerEventBus } from './AuthToPlayerEventBus';
import { AdminUserDetectionService } from './AdminUserDetectionService';

export class AuthenticationFlowService implements AuthenticationFlowInterface {
  private adminDetectionService: AdminUserDetectionService;

  constructor() {
    this.adminDetectionService = new AdminUserDetectionService();
  }

  /**
   * Handle authentication completion with guaranteed user data availability
   * APML-compliant implementation with admin detection integration
   * Hook point: after_successful_authentication (enhanced with admin status)
   */
  async onAuthenticationComplete(result: AuthenticationResult, method: AuthenticationMethod): Promise<void> {
    console.log(`🔐 Authentication completed via ${method}:`, result);
    
    if (!result.success || !result.user) {
      console.error('❌ Authentication failed:', result.error);
      throw new Error(result.error || 'Authentication failed');
    }
    
    // Validate user data completeness (APML contract requirement)
    this.validateUserData(result.user);
    
    try {
      // ENHANCEMENT: Admin detection during authentication flow
      // Performance requirement: add max 50ms to login time
      console.log('🔍 Enhancing authentication result with admin detection...');
      const enhancedResult = await this.adminDetectionService.enhanceAuthenticationResult(result);
      
      if (!enhancedResult.success) {
        throw new Error(enhancedResult.error || 'Enhanced authentication failed');
      }
      
      // Persist admin status in session state
      if (enhancedResult.adminAccess) {
        const { userSessionManager } = await import('./UserSessionManager');
        userSessionManager.updateUserAdminStatus(enhancedResult.adminAccess);
      }

      // Create APML-compliant user context with admin status
      const userContext = this.createUserContext(enhancedResult.user!);
      
      console.log('✅ Starting Auth-to-Player flow with admin-enhanced context:', {
        ...userContext,
        hasAdminAccess: enhancedResult.adminAccess?.is_admin || false
      });
      
      // Initialize Auth-to-Player flow with admin-enhanced user context
      authToPlayerEventBus.startFlow(userContext);
      
    } catch (error) {
      console.warn('⚠️ Admin detection failed, proceeding with regular authentication:', error);
      
      // Fallback: proceed with regular session (as per APML error handling)
      const userContext = this.createUserContext(result.user);
      console.log('✅ Starting Auth-to-Player flow with regular context (admin detection failed)');
      authToPlayerEventBus.startFlow(userContext);
    }
  }
  
  /**
   * Create typed user context from authentication result
   * APML-compliant implementation with validation
   */
  createUserContext(user: AuthenticatedUser): AuthenticatedUserContext {
    // APML contract: validate all required fields
    if (!user.id || !user.email) {
      throw new Error('Invalid user data: missing required fields (id, email)');
    }
    
    return {
      userType: 'authenticated',
      userId: user.id,
      userName: user.displayName,
      email: user.email
    };
  }
  
  /**
   * Process password authentication with proper error handling
   * APML-compliant implementation with service isolation
   */
  async handlePasswordAuthentication(email: string, password: string): Promise<AuthenticationResult> {
    try {
      // Import UserSessionManager dynamically to avoid circular dependencies
      const { userSessionManager } = await import('./UserSessionManager');
      
      // Attempt sign-in first
      const signInSuccess = await userSessionManager.signInUser(email, password);
      if (signInSuccess) {
        // Extract user data from session state
        const sessionState = userSessionManager.state;
        if (sessionState.user) {
          return {
            success: true,
            user: this.mapSessionUserToAuthUser(sessionState.user)
          };
        }
      }
      
      // Attempt auto-registration if sign-in failed
      console.log('Sign in failed, attempting auto-registration for new user');
      const registerSuccess = await userSessionManager.registerUser(email, password, email.split('@')[0]);
      if (registerSuccess) {
        // Extract user data from session state
        const sessionState = userSessionManager.state;
        if (sessionState.user) {
          return {
            success: true,
            user: this.mapSessionUserToAuthUser(sessionState.user)
          };
        }
      }
      
      return {
        success: false,
        error: 'Invalid credentials and registration failed'
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication service failed'
      };
    }
  }
  
  /**
   * Process OTP authentication with proper user data extraction
   */
  async handleOTPAuthentication(email: string, otp: string): Promise<AuthenticationResult> {
    try {
      const { userSessionManager } = await import('./UserSessionManager');
      
      const success = await userSessionManager.verifyEmailOTP(email, otp);
      if (success) {
        const sessionState = userSessionManager.state;
        if (sessionState.user) {
          return {
            success: true,
            user: this.mapSessionUserToAuthUser(sessionState.user)
          };
        }
      }
      
      return {
        success: false,
        error: 'OTP verification failed'
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'OTP verification failed'
      };
    }
  }
  
  // Private helper methods
  
  private validateUserData(user: AuthenticatedUser): void {
    const requiredFields = ['id', 'email', 'userType', 'subscriptionTier'];
    const missingFields = requiredFields.filter(field => !user[field as keyof AuthenticatedUser]);
    
    if (missingFields.length > 0) {
      throw new Error(`Invalid user data: missing required fields: ${missingFields.join(', ')}`);
    }
  }
  
  private mapSessionUserToAuthUser(sessionUser: any): AuthenticatedUser {
    return {
      id: sessionUser.id,
      email: sessionUser.email,
      displayName: sessionUser.displayName,
      userType: sessionUser.userType || 'registered',
      subscriptionTier: sessionUser.subscriptionTier || 'Free'
    };
  }
}

// Export singleton instance
export const authenticationFlowService = new AuthenticationFlowService();