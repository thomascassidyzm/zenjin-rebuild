/**
 * Admin Access Interface
 * Defines how the main app determines and handles admin access
 */

export interface AdminUser {
  id: string;
  email: string;
  role: 'super_admin' | 'content_admin' | 'user_admin';
  permissions: AdminPermission[];
}

export type AdminPermission = 
  | 'read_stats'
  | 'read_content' 
  | 'read_users'
  | 'write_content'
  | 'write_users' 
  | 'delete_content'
  | 'delete_users'
  | 'manage_system';

export interface AdminAccessResult {
  isAdmin: boolean;
  adminUser?: AdminUser;
  redirectPath?: string;
}

/**
 * Interface for checking and managing admin access
 */
export interface AdminAccessInterface {
  /**
   * Check if current user has admin privileges
   * @param userId - The user ID to check
   * @returns Promise resolving to admin access result
   */
  checkAdminAccess(userId: string): Promise<AdminAccessResult>;

  /**
   * Get admin user details and permissions
   * @param userId - The admin user ID
   * @returns Promise resolving to admin user or null
   */
  getAdminUser(userId: string): Promise<AdminUser | null>;

  /**
   * Check if admin user has specific permission
   * @param userId - The admin user ID
   * @param permission - The permission to check
   * @returns Promise resolving to boolean
   */
  hasPermission(userId: string, permission: AdminPermission): Promise<boolean>;

  /**
   * Get admin navigation items based on user permissions
   * @param adminUser - The admin user
   * @returns Array of navigation items the user can access
   */
  getAdminNavigation(adminUser: AdminUser): AdminNavigationItem[];
}

export interface AdminNavigationItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  requiredPermissions: AdminPermission[];
  isEnabled: boolean;
}

/**
 * Interface for admin route protection
 */
export interface AdminRouteGuardInterface {
  /**
   * Protect admin routes with authentication and authorization
   * @param userId - Current user ID
   * @param requiredPermissions - Permissions required for the route
   * @returns Promise resolving to access result
   */
  guardAdminRoute(userId: string, requiredPermissions: AdminPermission[]): Promise<{
    allowed: boolean;
    redirectPath?: string;
    errorMessage?: string;
  }>;

  /**
   * Get admin session token for API calls
   * @param userId - Admin user ID
   * @returns Promise resolving to auth token or null
   */
  getAdminToken(userId: string): Promise<string | null>;
}