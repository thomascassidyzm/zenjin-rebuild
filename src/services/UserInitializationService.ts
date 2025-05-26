/**
 * UserInitializationService.ts
 * APML-compliant service adapter for user initialization
 * Following External Service Integration Protocol
 */

import {
  UserInitializationServiceInterface,
  UserInitializationResult,
  UserExistenceResult,
  UserInitializationStatus,
  UserInitializationErrorCode
} from '../interfaces/UserInitializationInterface';

export class UserInitializationService implements UserInitializationServiceInterface {
  
  /**
   * Initialize a new user with complete database records
   * APML-compliant implementation with proper error isolation
   */
  async initializeNewUser(
    userId: string,
    email: string,
    displayName?: string,
    userType: 'registered' | 'anonymous' = 'registered'
  ): Promise<UserInitializationResult> {
    try {
      // First check if user already exists
      const existenceCheck = await this.getUserInitializationStatus(userId);
      
      if (existenceCheck.isFullyInitialized) {
        return {
          success: true,
          user: null, // Would need to fetch existing user
          userState: null, // Would need to fetch existing state
          error: null,
          errorCode: UserInitializationErrorCode.USER_ALREADY_EXISTS
        };
      }

      // Get access token for API call
      const accessToken = await this.getValidAccessToken();
      if (!accessToken) {
        return {
          success: false,
          user: null,
          userState: null,
          error: 'No valid authentication token available',
          errorCode: UserInitializationErrorCode.AUTHENTICATION_FAILED
        };
      }

      // Call backend API to create user
      const response = await fetch('/api/users/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          userId,
          email,
          displayName: displayName || email.split('@')[0],
          userType
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          user: null,
          userState: null,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          errorCode: errorData.errorCode || UserInitializationErrorCode.DATABASE_ERROR
        };
      }

      const result = await response.json();
      
      if (!result.success) {
        return {
          success: false,
          user: null,
          userState: null,
          error: result.error || 'User initialization failed',
          errorCode: result.errorCode || UserInitializationErrorCode.DATABASE_ERROR
        };
      }

      return {
        success: true,
        user: result.data.user,
        userState: result.data.userState,
        error: null,
        errorCode: null
      };

    } catch (error) {
      console.error('UserInitializationService: Error initializing user:', error);
      return {
        success: false,
        user: null,
        userState: null,
        error: error instanceof Error ? error.message : 'Unknown error during user initialization',
        errorCode: UserInitializationErrorCode.DATABASE_ERROR
      };
    }
  }

  /**
   * Ensure user exists in database, create if missing
   * APML-compliant implementation with existence checking
   */
  async ensureUserExists(
    userId: string,
    accessToken: string
  ): Promise<UserExistenceResult> {
    try {
      // Check current initialization status
      const status = await this.getUserInitializationStatus(userId);
      
      if (status.isFullyInitialized) {
        return {
          exists: true,
          requiresInitialization: false,
          user: null, // Would need to fetch from API
          error: null
        };
      }

      // User needs initialization - get user data from auth session
      const userEmail = await this.getCurrentUserEmail();
      if (!userEmail) {
        return {
          exists: false,
          requiresInitialization: true,
          user: null,
          error: 'Cannot determine user email for initialization'
        };
      }

      // Initialize the user
      const initResult = await this.initializeNewUser(userId, userEmail);
      
      return {
        exists: initResult.success,
        requiresInitialization: !initResult.success,
        user: initResult.user,
        error: initResult.error
      };

    } catch (error) {
      console.error('UserInitializationService: Error checking user existence:', error);
      return {
        exists: false,
        requiresInitialization: true,
        user: null,
        error: error instanceof Error ? error.message : 'Unknown error checking user existence'
      };
    }
  }

  /**
   * Check user initialization status without side effects
   * APML-compliant read-only operation
   */
  async getUserInitializationStatus(userId: string): Promise<UserInitializationStatus> {
    try {
      const accessToken = await this.getValidAccessToken();
      if (!accessToken) {
        return {
          userExists: false,
          userStateExists: false,
          isFullyInitialized: false,
          missingComponents: ['authentication']
        };
      }

      // Attempt to fetch user state (this will fail if user doesn't exist)
      const response = await fetch(`/api/users/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.status === 404) {
        return {
          userExists: false,
          userStateExists: false,
          isFullyInitialized: false,
          missingComponents: ['user_record', 'user_state']
        };
      }

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          return {
            userExists: true,
            userStateExists: true,
            isFullyInitialized: true,
            missingComponents: []
          };
        }
      }

      // Partial or unknown state
      return {
        userExists: false,
        userStateExists: false,
        isFullyInitialized: false,
        missingComponents: ['user_record', 'user_state']
      };

    } catch (error) {
      console.error('UserInitializationService: Error checking initialization status:', error);
      return {
        userExists: false,
        userStateExists: false,
        isFullyInitialized: false,
        missingComponents: ['unknown']
      };
    }
  }

  // Private helper methods

  /**
   * Get valid access token from current session
   * Following External Service Integration Protocol
   */
  private async getValidAccessToken(): Promise<string | null> {
    try {
      // Import UserSessionManager dynamically to avoid circular dependencies
      const { userSessionManager } = await import('./UserSessionManager');
      const sessionState = userSessionManager.state;
      
      if (sessionState.session?.accessToken) {
        return sessionState.session.accessToken;
      }
      
      return null;
    } catch (error) {
      console.error('UserInitializationService: Error getting access token:', error);
      return null;
    }
  }

  /**
   * Get current user's email from session
   * Following External Service Integration Protocol
   */
  private async getCurrentUserEmail(): Promise<string | null> {
    try {
      const { userSessionManager } = await import('./UserSessionManager');
      const sessionState = userSessionManager.state;
      
      if (sessionState.user?.email) {
        return sessionState.user.email;
      }
      
      return null;
    } catch (error) {
      console.error('UserInitializationService: Error getting user email:', error);
      return null;
    }
  }
}

// Export singleton instance following APML service adapter pattern
export const userInitializationService = new UserInitializationService();