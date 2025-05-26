/**
 * Auth-to-Player Interface Definitions
 * Generated from AuthToPlayerInterface.apml
 * 
 * APML-Compliant type definitions for user context handling
 */

export type UserType = 'authenticated' | 'anonymous';

export type AuthToPlayerState = 
  | 'AUTH_SUCCESS'
  | 'PRE_ENGAGEMENT' 
  | 'LOADING_WITH_ANIMATION'
  | 'ACTIVE_LEARNING';

export interface BaseUserContext {
  userType: UserType;
}

export interface AuthenticatedUserContext extends BaseUserContext {
  userType: 'authenticated';
  userId: string; // Required - never null for authenticated users
  userName?: string; // Optional display name
  email: string; // Required from authentication system
}

export interface AnonymousUserContext extends BaseUserContext {
  userType: 'anonymous';
  userId?: string; // Optional anonymous identifier
  userName?: string; // Optional generated name
  email?: string; // Not applicable for anonymous users
}

export type UserContext = AuthenticatedUserContext | AnonymousUserContext;

export interface AuthToPlayerEvents {
  // State transition events
  'auth:success': UserContext;
  'preengagement:play-clicked': {};
  'loading:animation-started': {};
  'loading:animation-completed': {};
  'loading:content-ready': { content: any };
  'player:ready': { content: any; userLearningState: any };
  
  // Background process events
  'background:dashboard-loaded': { dashboardData: any };
  'background:content-prepared': { firstStitch: any };
  
  // State change events
  'state:changed': { from: AuthToPlayerState; to: AuthToPlayerState };
}

export interface AuthToPlayerInterface {
  /**
   * Initialize Auth-to-Player flow with user context
   */
  startFlow(userContext: UserContext): void;
  
  /**
   * Extract appropriate user ID for state initialization
   */
  getUserStateId(userContext: UserContext): string;
}