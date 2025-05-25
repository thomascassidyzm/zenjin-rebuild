/**
 * UserSession React Context Implementation
 * Implements React Context pattern for UserSessionManager integration
 * 
 * APML-Compliant frontend integration layer for backend services
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  UserSessionManagerInterface,
  UserSessionState,
  UserApplicationState,
  SessionMetrics,
  UserSessionContextType
} from '../interfaces/UserSessionManagerInterface';
import { userSessionManager } from '../services/UserSessionManager';
import { BackendServiceStatus } from '../services/BackendServiceOrchestrator';

// Create React Context
const UserSessionContext = createContext<UserSessionContextType | null>(null);

/**
 * Custom hook to access UserSession context
 * Throws error if used outside provider (fail-fast APML principle)
 */
export const useUserSession = (): UserSessionContextType => {
  const context = useContext(UserSessionContext);
  if (!context) {
    throw new Error('useUserSession must be used within UserSessionProvider');
  }
  return context;
};

/**
 * UserSession Context Provider
 * Bridges UserSessionManager service with React components
 */
export const UserSessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sessionState, setSessionState] = useState<UserSessionState>(userSessionManager.state);

  // Set up event subscriptions (but don't auto-initialize)
  useEffect(() => {

    // Subscribe to state changes
    const unsubscribeSessionState = userSessionManager.on('sessionStateChanged', (event) => {
      console.log('Session state changed:', event.newState);
      setSessionState(event.newState);
    });

    const unsubscribeUserState = userSessionManager.on('userStateChanged', (event) => {
      console.log('User state changed:', event.changes, 'source:', event.source);
      // Session state will be updated via sessionStateChanged event
    });

    const unsubscribeBackendStatus = userSessionManager.on('backendStatusChanged', (event) => {
      console.log('Backend status changed:', event.status);
      // Session state will be updated via sessionStateChanged event
    });

    // Cleanup subscriptions
    return () => {
      unsubscribeSessionState();
      unsubscribeUserState();
      unsubscribeBackendStatus();
    };
  }, []);

  // Create context value implementing UserSessionManagerInterface
  const contextValue: UserSessionContextType = {
    // State properties
    state: sessionState,

    // Session management methods
    initializeSession: async (deviceId?: string): Promise<boolean> => {
      return await userSessionManager.initializeSession(deviceId);
    },

    createAnonymousUser: async (deviceId?: string): Promise<boolean> => {
      return await userSessionManager.createAnonymousUser(deviceId);
    },

    registerUser: async (email: string, password: string, displayName?: string): Promise<boolean> => {
      return await userSessionManager.registerUser(email, password, displayName);
    },

    signInUser: async (email: string, password: string): Promise<boolean> => {
      return await userSessionManager.signInUser(email, password);
    },

    sendEmailOTP: async (email: string): Promise<boolean> => {
      return await userSessionManager.sendEmailOTP(email);
    },

    verifyEmailOTP: async (email: string, otp: string): Promise<boolean> => {
      return await userSessionManager.verifyEmailOTP(email, otp);
    },

    getUserState: (): UserApplicationState => {
      return userSessionManager.getUserState();
    },

    refreshUserState: async (): Promise<boolean> => {
      return await userSessionManager.refreshUserState();
    },

    updateUserState: async (changes: Partial<UserApplicationState>): Promise<boolean> => {
      return await userSessionManager.updateUserState(changes);
    },

    recordSessionMetrics: async (metrics: SessionMetrics): Promise<boolean> => {
      return await userSessionManager.recordSessionMetrics(metrics);
    },

    getBackendStatus: (): BackendServiceStatus => {
      return userSessionManager.getBackendStatus();
    },

    logout: async (): Promise<boolean> => {
      return await userSessionManager.logout();
    },

    // Event subscription methods
    on: (event: any, callback: any): (() => void) => {
      return userSessionManager.on(event, callback);
    },

    off: (event: string, callback: Function): void => {
      userSessionManager.off(event, callback);
    }
  };

  return (
    <UserSessionContext.Provider value={contextValue}>
      {children}
    </UserSessionContext.Provider>
  );
};

export default UserSessionProvider;