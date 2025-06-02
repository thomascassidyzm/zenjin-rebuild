/**
 * Admin Integration Flow Interface
 * Defines the complete flow of how admin features integrate with the main app
 */

import { AdminUser } from './AdminAccessInterface';
import { UserSession } from './MainAppIntegrationInterface';

/**
 * Complete admin integration flow interface
 */
export interface AdminIntegrationFlowInterface {
  /**
   * Initialize admin integration during app startup
   * @returns Promise resolving to initialization result
   */
  initializeAdminIntegration(): Promise<AdminIntegrationResult>;

  /**
   * Handle user authentication with admin detection
   * @param authResult - Authentication result from main auth flow
   * @returns Promise resolving to session with admin status
   */
  handleAuthenticationWithAdmin(authResult: AuthenticationResult): Promise<UserSessionWithAdmin>;

  /**
   * Show/hide admin options based on user session
   * @param session - Current user session
   * @returns UI modification instructions
   */
  updateUIForAdminAccess(session: UserSession): AdminUIUpdate;

  /**
   * Handle admin section navigation
   * @param adminUser - Admin user attempting access
   * @param targetSection - Admin section to access
   * @returns Promise resolving to navigation result
   */
  navigateToAdminSection(adminUser: AdminUser, targetSection: string): Promise<AdminNavigationResult>;

  /**
   * Handle return from admin to main app
   * @param adminUser - Admin user returning
   * @param returnPath - Optional path to return to
   * @returns Promise resolving to return result
   */
  returnFromAdminToMain(adminUser: AdminUser, returnPath?: string): Promise<ReturnToMainResult>;
}

export interface AdminIntegrationResult {
  success: boolean;
  adminSystemAvailable: boolean;
  databaseReady: boolean;
  errors: string[];
  warnings: string[];
}

export interface AuthenticationResult {
  success: boolean;
  userId?: string;
  email?: string;
  userType?: 'anonymous' | 'registered';
  error?: string;
}

export interface UserSessionWithAdmin {
  userId: string;
  email: string;
  userType: 'anonymous' | 'registered' | 'admin';
  isAuthenticated: boolean;
  adminAccess: AdminAccessStatus;
}

export interface AdminAccessStatus {
  isAdmin: boolean;
  adminUser?: AdminUser;
  lastAdminActivity?: string;
  adminSessionActive: boolean;
}

export interface AdminUIUpdate {
  showAdminEntry: boolean;
  adminEntryText?: string;
  adminEntryIcon?: string;
  adminEntryPosition: 'header' | 'sidebar' | 'hidden';
  notifications?: AdminNotification[];
}

export interface AdminNotification {
  type: 'info' | 'warning' | 'error';
  message: string;
  action?: {
    text: string;
    callback: () => void;
  };
}

export interface AdminNavigationResult {
  success: boolean;
  redirectPath?: string;
  error?: string;
  requiredPermissions?: string[];
  hasPermissions?: boolean;
}

export interface ReturnToMainResult {
  success: boolean;
  returnPath: string;
  sessionUpdated: boolean;
  adminSessionEnded: boolean;
}

/**
 * User journey interface for admin access
 */
export interface AdminUserJourneyInterface {
  /**
   * User logs in and app checks for admin status
   */
  Step1_LoginWithAdminCheck: {
    input: { email: string; password?: string };
    process: 'authenticate_and_check_admin';
    output: UserSessionWithAdmin;
  };

  /**
   * Admin entry point appears in UI if user is admin
   */
  Step2_ShowAdminEntry: {
    input: UserSessionWithAdmin;
    process: 'evaluate_admin_ui_visibility';
    output: AdminUIUpdate;
  };

  /**
   * User clicks admin entry and permissions are verified
   */
  Step3_AdminAccessAttempt: {
    input: { adminUser: AdminUser; targetSection: string };
    process: 'verify_permissions_and_navigate';
    output: AdminNavigationResult;
  };

  /**
   * User works in admin section with full capabilities
   */
  Step4_AdminWork: {
    input: { adminUser: AdminUser; adminAction: string };
    process: 'execute_admin_action';
    output: AdminActionResult;
  };

  /**
   * User returns to main app, admin session context maintained
   */
  Step5_ReturnToMain: {
    input: { adminUser: AdminUser; returnPath?: string };
    process: 'transition_to_main_app';
    output: ReturnToMainResult;
  };
}

export interface AdminActionResult {
  success: boolean;
  action: string;
  result?: any;
  error?: string;
  loggedActivity?: boolean;
}

/**
 * Configuration interface for admin integration
 */
export interface AdminIntegrationConfigInterface {
  /**
   * Get admin integration configuration
   * @returns Configuration object
   */
  getAdminConfig(): AdminIntegrationConfig;

  /**
   * Update admin integration settings
   * @param updates - Configuration updates
   * @returns Promise resolving to update result
   */
  updateAdminConfig(updates: Partial<AdminIntegrationConfig>): Promise<boolean>;

  /**
   * Reset admin configuration to defaults
   * @returns Promise resolving to reset result
   */
  resetAdminConfig(): Promise<boolean>;
}

export interface AdminIntegrationConfig {
  // Admin Detection
  adminDetection: {
    checkOnLogin: boolean;
    checkOnAppStart: boolean;
    cacheAdminStatus: boolean;
    cacheDurationMinutes: number;
  };

  // UI Integration
  uiIntegration: {
    showAdminEntry: boolean;
    adminEntryPosition: 'header' | 'sidebar' | 'floating';
    adminEntryText: string;
    adminEntryIcon: string;
    requireConfirmation: boolean;
  };

  // Security
  security: {
    requireReauthentication: boolean;
    sessionTimeoutMinutes: number;
    logAdminActivity: boolean;
    restrictIPAccess: boolean;
    allowedIPs?: string[];
  };

  // Navigation
  navigation: {
    openInNewWindow: boolean;
    returnToMainApp: boolean;
    defaultReturnPath: string;
    maintainMainAppSession: boolean;
  };

  // Development
  development: {
    enableTestAdmin: boolean;
    testAdminEmail: string;
    mockAdminData: boolean;
    debugLogging: boolean;
  };
}

/**
 * Admin role and permission definitions
 */
export interface AdminRoleDefinitionInterface {
  /**
   * Get all available admin roles
   * @returns Array of role definitions
   */
  getAvailableRoles(): AdminRoleDefinition[];

  /**
   * Get permissions for specific role
   * @param role - Role to get permissions for
   * @returns Array of permissions
   */
  getRolePermissions(role: string): string[];

  /**
   * Check if role has specific permission
   * @param role - Role to check
   * @param permission - Permission to verify
   * @returns Boolean indicating if role has permission
   */
  roleHasPermission(role: string, permission: string): boolean;

  /**
   * Get minimum role required for permission
   * @param permission - Permission to check
   * @returns Minimum role or null
   */
  getMinimumRoleForPermission(permission: string): string | null;
}

export interface AdminRoleDefinition {
  role: string;
  name: string;
  description: string;
  permissions: string[];
  level: number; // Higher number = more permissions
  canCreateUsers: boolean;
  canModifySystem: boolean;
}

/**
 * Example admin flow states
 */
export type AdminFlowState = 
  | 'not_authenticated'
  | 'authenticated_no_admin'
  | 'authenticated_with_admin'
  | 'admin_session_active'
  | 'admin_action_in_progress'
  | 'returning_to_main';

export interface AdminFlowStateManager {
  getCurrentState(): AdminFlowState;
  transitionTo(newState: AdminFlowState): boolean;
  canTransitionTo(targetState: AdminFlowState): boolean;
  getAvailableTransitions(): AdminFlowState[];
}