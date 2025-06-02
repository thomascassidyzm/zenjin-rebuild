/**
 * AdminUserDetectionService
 * Enhances authentication flow with admin status detection
 * 
 * Implements admin_detection_interface from main_app_admin_integration_interface.apml:
 * - Admin status detection during authentication
 * - Admin session creation and management
 * - Integration with existing auth flow
 */

import { AdminAccess, User } from '../interfaces/UserSessionManagerInterface';
import { backendServiceOrchestrator } from './BackendServiceOrchestrator';

export interface AdminStatusResult {
  isAdmin: boolean;
  adminData?: {
    role: 'super_admin' | 'content_admin' | 'user_admin';
    permissions: string[];
    lastAdminActivity?: string;
    isActive: boolean;
  };
  error?: string;
}

export interface EnhancedAuthResult {
  success: boolean;
  user?: User;
  adminAccess?: AdminAccess;
  error?: string;
}

export class AdminUserDetectionService {
  private adminStatusCache: Map<string, { data: AdminStatusResult; timestamp: number }>;
  private readonly CACHE_TTL = 15 * 60 * 1000; // 15 minutes as per APML specs

  constructor() {
    this.adminStatusCache = new Map();
  }

  /**
   * Enhance authentication result with admin status
   * Hook point: after_successful_authentication
   * Performance requirement: add max 50ms to login time
   */
  async enhanceAuthenticationResult(authResult: any): Promise<EnhancedAuthResult> {
    const startTime = Date.now();
    
    try {
      if (!authResult.success || !authResult.user) {
        return {
          success: authResult.success,
          user: authResult.user,
          error: authResult.error
        };
      }

      // Query admin status with caching
      const adminStatus = await this.queryAdminStatus(authResult.user.id);
      
      // Create enhanced user object with admin access
      const enhancedUser: User = {
        ...authResult.user,
        metadata: {
          ...authResult.user.metadata,
          admin_access: this.createAdminAccess(adminStatus)
        }
      };

      const elapsed = Date.now() - startTime;
      console.log(`🔍 Admin detection completed in ${elapsed}ms`);

      return {
        success: true,
        user: enhancedUser,
        adminAccess: enhancedUser.metadata?.admin_access
      };

    } catch (error) {
      const elapsed = Date.now() - startTime;
      console.warn(`⚠️ Admin detection failed after ${elapsed}ms:`, error);
      
      // Proceed with regular session on error (as per APML error handling)
      return {
        success: authResult.success,
        user: authResult.user,
        error: authResult.error
      };
    }
  }

  /**
   * Query admin status from database with caching
   * Implements caching strategy: cache_admin_status_for_session_duration
   */
  private async queryAdminStatus(userId: string): Promise<AdminStatusResult> {
    // Check cache first
    const cached = this.adminStatusCache.get(userId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log(`📋 Using cached admin status for user ${userId}`);
      return cached.data;
    }

    try {
      // Use admin client for elevated permissions to query admin_users table
      const authService = backendServiceOrchestrator.getAuthService();
      const adminClient = await authService.getAdminClient();
      if (!adminClient) {
        throw new Error('Admin Supabase client not available');
      }

      // Query admin_users table with admin privileges
      const { data, error } = await adminClient
        .from('admin_users')
        .select('role, permissions, last_admin_activity, is_active')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
        throw new Error(`Database query failed: ${error.message}`);
      }

      const adminUser = data;
      const result: AdminStatusResult = {
        isAdmin: !!adminUser,
        adminData: adminUser ? {
          role: adminUser.role,
          permissions: Array.isArray(adminUser.permissions) 
            ? adminUser.permissions 
            : JSON.parse(adminUser.permissions || '[]'),
          lastAdminActivity: adminUser.last_admin_activity,
          isActive: adminUser.is_active
        } : undefined
      };

      // Cache the result
      this.adminStatusCache.set(userId, {
        data: result,
        timestamp: Date.now()
      });

      console.log(`🔍 Admin status queried for user ${userId}: ${result.isAdmin ? 'ADMIN' : 'REGULAR'}`);
      return result;

    } catch (error) {
      console.error(`❌ Failed to query admin status for user ${userId}:`, error);
      
      const errorResult: AdminStatusResult = {
        isAdmin: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      return errorResult;
    }
  }

  /**
   * Create AdminAccess object from admin status result
   */
  private createAdminAccess(adminStatus: AdminStatusResult): AdminAccess {
    return {
      is_admin: adminStatus.isAdmin,
      role: adminStatus.adminData?.role,
      permissions: adminStatus.adminData?.permissions,
      last_admin_activity: adminStatus.adminData?.lastAdminActivity
    };
  }

  /**
   * Create admin session context
   * Implements admin_session_context creation from APML interface
   */
  async createAdminSessionContext(userId: string, adminStatus: AdminStatusResult): Promise<any> {
    if (!adminStatus.isAdmin) {
      return null;
    }

    try {
      // Generate admin token for enhanced security
      const adminToken = await this.generateAdminToken(userId, adminStatus.adminData!);
      
      // Create admin session context
      const adminSessionContext = {
        adminUser: {
          userId,
          role: adminStatus.adminData!.role,
          permissions: adminStatus.adminData!.permissions,
          isActive: adminStatus.adminData!.isActive
        },
        adminToken,
        sessionStartTime: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      };

      console.log(`🔐 Admin session context created for ${userId} with role ${adminStatus.adminData!.role}`);
      return adminSessionContext;

    } catch (error) {
      console.error(`❌ Failed to create admin session context:`, error);
      return null;
    }
  }

  /**
   * Generate secure admin token for admin operations
   */
  private async generateAdminToken(userId: string, adminData: any): Promise<string> {
    const payload = {
      userId,
      role: adminData.role,
      permissions: adminData.permissions,
      sessionType: 'admin',
      issuedAt: Date.now(),
      expiresAt: Date.now() + (2 * 60 * 60 * 1000) // 2 hours
    };

    // Simple token generation (in production, use proper JWT signing)
    const tokenData = btoa(JSON.stringify(payload));
    return `admin_${tokenData}`;
  }

  /**
   * Verify admin status is still valid
   * Called periodically during admin sessions
   */
  async verifyAdminStatus(userId: string): Promise<boolean> {
    try {
      // Clear cache to force fresh query
      this.adminStatusCache.delete(userId);
      
      const adminStatus = await this.queryAdminStatus(userId);
      return adminStatus.isAdmin && adminStatus.adminData?.isActive === true;

    } catch (error) {
      console.error(`❌ Admin status verification failed for ${userId}:`, error);
      return false;
    }
  }

  /**
   * Clear admin status cache for user
   * Called when admin status might have changed
   */
  clearAdminCache(userId: string): void {
    this.adminStatusCache.delete(userId);
    console.log(`🗑️ Cleared admin cache for user ${userId}`);
  }

  /**
   * Clear all admin caches
   * Called on admin system updates
   */
  clearAllAdminCaches(): void {
    this.adminStatusCache.clear();
    console.log(`🗑️ Cleared all admin caches`);
  }
}