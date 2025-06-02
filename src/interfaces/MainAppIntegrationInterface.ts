/**
 * Main App Integration Interface
 * Defines how admin functionality integrates with the main Zenjin Maths app
 */

import { AdminUser, AdminNavigationItem } from './AdminAccessInterface';

export interface UserSession {
  userId: string;
  email: string;
  userType: 'anonymous' | 'registered' | 'admin';
  isAuthenticated: boolean;
  adminAccess?: AdminUser;
}

/**
 * Interface for the main app's navigation and layout
 */
export interface MainAppLayoutInterface {
  /**
   * Show admin access button/link in main navigation
   * @param adminUser - Admin user details
   * @param onAdminClick - Callback when admin access is clicked
   */
  showAdminAccess(adminUser: AdminUser, onAdminClick: () => void): void;

  /**
   * Hide admin access from navigation
   */
  hideAdminAccess(): void;

  /**
   * Navigate to admin section
   * @param section - Admin section to navigate to
   * @param adminUser - Admin user for context
   */
  navigateToAdmin(section: string, adminUser: AdminUser): void;

  /**
   * Return to main app from admin section
   * @param returnPath - Path to return to in main app
   */
  returnToMainApp(returnPath?: string): void;
}

/**
 * Interface for user session management with admin detection
 */
export interface SessionManagerWithAdminInterface {
  /**
   * Initialize user session and check for admin privileges
   * @param userId - User ID to initialize
   * @returns Promise resolving to session with admin status
   */
  initializeSession(userId: string): Promise<UserSession>;

  /**
   * Update session when admin status changes
   * @param userId - User ID
   * @param adminUser - New admin user details
   */
  updateAdminStatus(userId: string, adminUser: AdminUser | null): void;

  /**
   * Get current session with admin status
   * @returns Current user session
   */
  getCurrentSession(): UserSession | null;

  /**
   * Subscribe to session changes including admin status
   * @param callback - Callback for session changes
   * @returns Unsubscribe function
   */
  onSessionChange(callback: (session: UserSession | null) => void): () => void;
}

/**
 * Interface for the main app router to handle admin routes
 */
export interface AppRouterWithAdminInterface {
  /**
   * Register admin routes with the main app router
   * @param adminRoutes - Admin route definitions
   */
  registerAdminRoutes(adminRoutes: AdminRouteDefinition[]): void;

  /**
   * Check if current route is an admin route
   * @param path - Current path
   * @returns Boolean indicating if path is admin route
   */
  isAdminRoute(path: string): boolean;

  /**
   * Get admin route requirements
   * @param path - Admin route path
   * @returns Route requirements or null
   */
  getAdminRouteRequirements(path: string): AdminRouteRequirements | null;

  /**
   * Navigate with admin context
   * @param path - Path to navigate to
   * @param adminContext - Admin user context
   */
  navigateWithAdminContext(path: string, adminContext: AdminUser): void;
}

export interface AdminRouteDefinition {
  path: string;
  component: string;
  requiredPermissions: string[];
  title: string;
  description: string;
}

export interface AdminRouteRequirements {
  requiredPermissions: string[];
  redirectOnFailure: string;
  allowAnonymous: boolean;
}

/**
 * Interface for the main app to show admin entry points
 */
export interface AdminEntryPointInterface {
  /**
   * Check if admin entry point should be visible
   * @param userSession - Current user session
   * @returns Boolean indicating visibility
   */
  shouldShowAdminEntry(userSession: UserSession): boolean;

  /**
   * Render admin entry point in main navigation
   * @param onAdminAccess - Callback when admin is accessed
   * @returns React component or null
   */
  renderAdminEntry(onAdminAccess: () => void): React.ReactNode | null;

  /**
   * Handle admin access attempt
   * @param userSession - Current user session
   * @returns Promise resolving to access result
   */
  handleAdminAccess(userSession: UserSession): Promise<{
    success: boolean;
    redirectPath?: string;
    errorMessage?: string;
  }>;
}