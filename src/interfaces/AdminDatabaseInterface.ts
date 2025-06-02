/**
 * Admin Database Interface
 * Defines the database contract for admin role management
 */

export interface AdminDatabaseInterface {
  /**
   * Check if user is admin by examining user record
   * @param userId - User ID to check
   * @returns Promise resolving to admin status
   */
  checkUserAdminStatus(userId: string): Promise<AdminStatusResult>;

  /**
   * Get admin permissions for a user
   * @param userId - Admin user ID
   * @returns Promise resolving to permissions array
   */
  getAdminPermissions(userId: string): Promise<AdminPermission[]>;

  /**
   * Create admin user (manual process)
   * @param adminData - Admin user creation data
   * @returns Promise resolving to created admin user
   */
  createAdminUser(adminData: CreateAdminUserData): Promise<AdminUserRecord>;

  /**
   * Update admin permissions
   * @param userId - Admin user ID
   * @param permissions - New permissions array
   * @returns Promise resolving to success boolean
   */
  updateAdminPermissions(userId: string, permissions: AdminPermission[]): Promise<boolean>;

  /**
   * Revoke admin access
   * @param userId - User ID to revoke admin from
   * @returns Promise resolving to success boolean
   */
  revokeAdminAccess(userId: string): Promise<boolean>;

  /**
   * List all admin users
   * @returns Promise resolving to admin users array
   */
  listAdminUsers(): Promise<AdminUserRecord[]>;
}

export interface AdminStatusResult {
  isAdmin: boolean;
  role?: AdminRole;
  permissions?: AdminPermission[];
  createdAt?: string;
  lastAdminActivity?: string;
}

export type AdminRole = 'super_admin' | 'content_admin' | 'user_admin';

export type AdminPermission = 
  | 'read_stats'
  | 'read_content' 
  | 'read_users'
  | 'write_content'
  | 'write_users' 
  | 'delete_content'
  | 'delete_users'
  | 'manage_system';

export interface CreateAdminUserData {
  userId: string;
  email: string;
  role: AdminRole;
  permissions: AdminPermission[];
  createdBy: string;
  notes?: string;
}

export interface AdminUserRecord {
  userId: string;
  email: string;
  role: AdminRole;
  permissions: AdminPermission[];
  createdAt: string;
  createdBy: string;
  lastAdminActivity?: string;
  isActive: boolean;
  notes?: string;
}

/**
 * Database Schema Requirements for Admin Features
 */
export interface AdminDatabaseSchema {
  /**
   * Admin users table structure
   */
  admin_users: {
    user_id: string; // FK to app_users.id
    role: AdminRole;
    permissions: AdminPermission[];
    created_at: string;
    created_by: string; // FK to app_users.id
    last_admin_activity?: string;
    is_active: boolean;
    notes?: string;
  };

  /**
   * Admin activity log for audit trail
   */
  admin_activity_log: {
    id: string;
    admin_user_id: string; // FK to admin_users.user_id
    action: AdminAction;
    target_type: AdminTargetType;
    target_id?: string;
    details: Record<string, any>;
    ip_address?: string;
    user_agent?: string;
    timestamp: string;
  };

  /**
   * Enhanced app_users table with admin fields
   */
  app_users_admin_fields: {
    is_admin: boolean; // Computed field or direct flag
    admin_role?: AdminRole;
    admin_permissions?: AdminPermission[];
  };
}

export type AdminAction = 
  | 'login'
  | 'view_dashboard'
  | 'view_users'
  | 'edit_user'
  | 'delete_user'
  | 'view_content'
  | 'create_content'
  | 'edit_content'
  | 'delete_content'
  | 'view_analytics'
  | 'export_data'
  | 'system_settings';

export type AdminTargetType = 
  | 'user'
  | 'fact'
  | 'stitch'
  | 'session'
  | 'system'
  | 'export';

/**
 * SQL Script Interface for Admin Setup
 */
export interface AdminSetupScriptInterface {
  /**
   * Generate SQL to create admin tables
   * @returns SQL creation script
   */
  getCreateAdminTablesSQL(): string;

  /**
   * Generate SQL to add admin fields to existing tables
   * @returns SQL alter script
   */
  getAlterExistingTablesSQL(): string;

  /**
   * Generate SQL to create initial super admin user
   * @param email - Admin email
   * @param userId - User ID (must exist in app_users)
   * @returns SQL insert script
   */
  getCreateSuperAdminSQL(email: string, userId: string): string;

  /**
   * Generate SQL for admin user creation procedure
   * @returns SQL stored procedure
   */
  getAdminUserCreationProcedureSQL(): string;
}

/**
 * Manual Admin User Creation Guide Interface
 */
export interface AdminUserCreationGuideInterface {
  /**
   * Get step-by-step guide for creating admin users
   * @returns Guide steps array
   */
  getCreationSteps(): AdminCreationStep[];

  /**
   * Generate SQL command for creating specific admin user
   * @param adminData - Admin user data
   * @returns SQL command string
   */
  generateAdminCreationSQL(adminData: CreateAdminUserData): string;

  /**
   * Validate admin user data before creation
   * @param adminData - Admin user data to validate
   * @returns Validation result
   */
  validateAdminUserData(adminData: CreateAdminUserData): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
}

export interface AdminCreationStep {
  step: number;
  title: string;
  description: string;
  sqlCommand?: string;
  verification?: string;
  notes?: string[];
}

/**
 * Admin Database Migration Interface
 */
export interface AdminMigrationInterface {
  /**
   * Check if admin tables exist
   * @returns Promise resolving to existence status
   */
  checkAdminTablesExist(): Promise<boolean>;

  /**
   * Run admin database migration
   * @returns Promise resolving to migration result
   */
  runAdminMigration(): Promise<{
    success: boolean;
    tablesCreated: string[];
    errors: string[];
  }>;

  /**
   * Rollback admin migration
   * @returns Promise resolving to rollback result
   */
  rollbackAdminMigration(): Promise<{
    success: boolean;
    tablesDropped: string[];
    errors: string[];
  }>;
}