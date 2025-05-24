/**
 * Backend API Client for Zenjin Maths App
 * Handles communication with Supabase + Vercel backend services
 */

interface AnonymousUserResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      anonymousId: string;
      displayName: string;
      userType: 'anonymous';
      subscriptionTier: string;
      expiresAt: string;
      createdAt: string;
    };
    session: {
      accessToken: string;
      userType: 'anonymous';
      expiresAt: number;
    };
    initialState: {
      stitch_positions: Record<string, any>;
      triple_helix_state: Record<string, any>;
      spaced_repetition_state: Record<string, any>;
      progress_metrics: Record<string, any>;
    };
  };
  timestamp: string;
  requestId: string;
}

interface UserStateResponse {
  success: boolean;
  data: {
    userId: string;
    anonymousId?: string;
    stitchPositions: Record<string, any>;
    tripleHelixState: Record<string, any>;
    spacedRepetitionState: Record<string, any>;
    progressMetrics: Record<string, any>;
    lastSyncTime: string;
    version: number;
    subscriptionTier: string;
    user: {
      id: string;
      userType: string;
      displayName: string;
      subscriptionTier: string;
    };
  };
  timestamp: string;
  requestId: string;
}

interface StateUpdateRequest {
  stateChanges: Record<string, any>;
  expectedVersion: number;
  syncSource: string;
}

export class BackendAPIClient {
  private baseURL: string;
  private currentUser: AnonymousUserResponse['data'] | null = null;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }

  /**
   * Creates a new anonymous user
   */
  async createAnonymousUser(deviceId?: string): Promise<AnonymousUserResponse> {
    const response = await fetch(`${this.baseURL}/api/auth/anonymous`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deviceId: deviceId || `browser_${Date.now()}`,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create anonymous user: ${response.statusText}`);
    }

    const data: AnonymousUserResponse = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to create anonymous user');
    }

    // Store user data for subsequent requests
    this.currentUser = data.data;
    
    return data;
  }

  /**
   * Gets the current user state
   */
  async getUserState(userId: string, accessToken: string): Promise<UserStateResponse> {
    const response = await fetch(`${this.baseURL}/api/users/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get user state: ${response.statusText}`);
    }

    const data: UserStateResponse = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to get user state');
    }

    return data;
  }

  /**
   * Updates user state with optimistic locking
   */
  async updateUserState(
    userId: string, 
    accessToken: string, 
    stateUpdate: StateUpdateRequest
  ): Promise<UserStateResponse> {
    const response = await fetch(`${this.baseURL}/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(stateUpdate),
    });

    if (!response.ok) {
      throw new Error(`Failed to update user state: ${response.statusText}`);
    }

    const data: UserStateResponse = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to update user state');
    }

    return data;
  }

  /**
   * Gets the current user data
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Test the backend connection by creating an anonymous user and testing state operations
   */
  async testBackendConnection(): Promise<{
    anonymousUserCreation: boolean;
    stateRetrieval: boolean;
    stateUpdate: boolean;
    errors: string[];
  }> {
    const results = {
      anonymousUserCreation: false,
      stateRetrieval: false,
      stateUpdate: false,
      errors: [] as string[]
    };

    try {
      // Test 1: Create anonymous user
      console.log('Testing anonymous user creation...');
      const userResponse = await this.createAnonymousUser('test-device');
      results.anonymousUserCreation = true;
      console.log('✅ Anonymous user created:', userResponse.data.user);

      // Test 2: Get user state
      console.log('Testing state retrieval...');
      const stateResponse = await this.getUserState(
        userResponse.data.user.id,
        userResponse.data.session.accessToken
      );
      results.stateRetrieval = true;
      console.log('✅ User state retrieved:', stateResponse.data);

      // Test 3: Update user state
      console.log('Testing state update...');
      const updateResponse = await this.updateUserState(
        userResponse.data.user.id,
        userResponse.data.session.accessToken,
        {
          stateChanges: {
            progressMetrics: { totalSessions: 1, totalQuestions: 5 }
          },
          expectedVersion: stateResponse.data.version,
          syncSource: 'frontend_test'
        }
      );
      results.stateUpdate = true;
      console.log('✅ User state updated:', updateResponse.data);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      results.errors.push(errorMessage);
      console.error('❌ Backend test failed:', errorMessage);
    }

    return results;
  }
}

// Create a singleton instance
export const backendAPIClient = new BackendAPIClient();