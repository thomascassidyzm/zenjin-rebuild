/**
 * SupabaseAuth Implementation
 * Handles user authentication with anonymous and registered user support
 */

import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { configurationService } from './ConfigurationService';

// Data Structures from Interface
export interface AnonymousUser {
  id: string;
  anonymousId: string;
  createdAt: string;
  expiresAt: string;
  sessionData?: any;
}

export interface RegisteredUser {
  id: string;
  email: string;
  displayName?: string;
  createdAt: string;
  lastLoginAt: string;
  subscriptionTier: string;
  metadata?: any;
}

export interface AuthSession {
  user: any;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  userType: string;
}

export interface RegistrationRequest {
  email: string;
  password: string;
  displayName?: string;
  anonymousId?: string;
  metadata?: any;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResult {
  success: boolean;
  session?: AuthSession;
  user?: any;
  error?: string;
  requiresEmailConfirmation?: boolean;
}

// Error codes
export const AuthErrors = {
  ANONYMOUS_CREATION_FAILED: 'ANONYMOUS_CREATION_FAILED',
  SESSION_CREATION_FAILED: 'SESSION_CREATION_FAILED',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  WEAK_PASSWORD: 'WEAK_PASSWORD',
  INVALID_EMAIL: 'INVALID_EMAIL',
  REGISTRATION_FAILED: 'REGISTRATION_FAILED',
  MIGRATION_FAILED: 'MIGRATION_FAILED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_NOT_CONFIRMED: 'EMAIL_NOT_CONFIRMED',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT_FAILED: 'LOGOUT_FAILED',
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  REFRESH_FAILED: 'REFRESH_FAILED',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  PASSWORD_RESET_FAILED: 'PASSWORD_RESET_FAILED',
  PROFILE_UPDATE_FAILED: 'PROFILE_UPDATE_FAILED'
} as const;

export class SupabaseAuthError extends Error {
  constructor(public code: string, message: string, public originalError?: any) {
    super(message);
    this.name = 'SupabaseAuthError';
  }
}

export class SupabaseAuth {
  private supabase: SupabaseClient | null = null;
  private adminSupabase: SupabaseClient | null = null;
  private currentSession: AuthSession | null = null;
  private initializationPromise: Promise<void> | null = null;

  constructor(supabaseUrl?: string, supabaseKey?: string) {
    // If explicit values provided, use them immediately
    if (supabaseUrl && supabaseKey) {
      this.initializeSupabase(supabaseUrl, supabaseKey);
    }
    // Otherwise, initialization will happen lazily on first use
  }

  /**
   * Ensure Supabase client is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (this.supabase && this.adminSupabase) return;
    
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.initialize();
    await this.initializationPromise;
  }

  /**
   * Initialize Supabase client with configuration
   * APML-compliant: either works or fails clearly
   */
  private async initialize(): Promise<void> {
    const config = await configurationService.getConfiguration();
    this.initializeSupabase(config.supabaseUrl, config.supabaseAnonKey, config.supabaseServiceKey);
  }

  private initializeSupabase(url: string, anonKey: string, serviceKey: string): void {
    try {
      // Regular client for auth operations
      this.supabase = createClient(url, anonKey);
      
      // Admin client for user creation operations - APML: required, no fallbacks
      this.adminSupabase = createClient(url, serviceKey);
      
      // Listen for auth changes
      this.supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
          this.currentSession = this.transformSupabaseSession(session);
        } else {
          this.currentSession = null;
        }
      });
      
      console.log('SupabaseAuth: Successfully initialized with admin client');
    } catch (error) {
      console.error('SupabaseAuth: Failed to create Supabase clients:', error);
      this.supabase = null;
      this.adminSupabase = null;
      throw error; // APML: fail fast, no graceful degradation
    }
  }

  /**
   * Creates a new anonymous user with temporary access
   */
  async createAnonymousUser(sessionData?: any, ttlHours: number = 168): Promise<AuthResult> {
    try {
      // For anonymous users, we'll use the backend API we already created
      const response = await fetch('/api/auth/anonymous', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId: sessionData?.deviceId || `browser_${Date.now()}`,
          initialSessionData: sessionData,
          ttlHours
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create anonymous user');
      }

      // Transform to AuthResult format
      const authSession: AuthSession = {
        user: data.data.user,
        accessToken: data.data.session.accessToken,
        refreshToken: '', // Anonymous users don't have refresh tokens
        expiresAt: data.data.session.expiresAt,
        userType: 'anonymous'
      };

      this.currentSession = authSession;

      return {
        success: true,
        session: authSession,
        user: data.data.user
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Anonymous user creation failed'
      };
    }
  }

  /**
   * Registers a new user account, optionally migrating from anonymous
   */
  async registerUser(registrationRequest: RegistrationRequest): Promise<AuthResult> {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(registrationRequest.email)) {
        throw new SupabaseAuthError(
          AuthErrors.INVALID_EMAIL,
          'Email address format is invalid'
        );
      }

      // Validate password strength
      if (registrationRequest.password.length < 8) {
        throw new SupabaseAuthError(
          AuthErrors.WEAK_PASSWORD,
          'Password must be at least 8 characters long'
        );
      }

      // Register user with Supabase Auth
      const { data, error } = await this.supabase.auth.signUp({
        email: registrationRequest.email,
        password: registrationRequest.password,
        options: {
          data: {
            display_name: registrationRequest.displayName,
            subscription_tier: 'Free',
            anonymous_id: registrationRequest.anonymousId,
            metadata: registrationRequest.metadata || {}
          }
        }
      });

      if (error) {
        // Map Supabase errors to our error codes
        if (error.message.includes('User already registered')) {
          throw new SupabaseAuthError(
            AuthErrors.EMAIL_ALREADY_EXISTS,
            'Email address is already registered'
          );
        } else if (error.message.includes('Password')) {
          throw new SupabaseAuthError(
            AuthErrors.WEAK_PASSWORD,
            error.message
          );
        } else {
          throw new SupabaseAuthError(
            AuthErrors.REGISTRATION_FAILED,
            error.message
          );
        }
      }

      if (!data.user) {
        throw new SupabaseAuthError(
          AuthErrors.REGISTRATION_FAILED,
          'User registration failed - no user returned'
        );
      }

      // Create user record in our custom users table using admin client
      const { error: userRecordError } = await this.adminSupabase
        .from('users')
        .insert({
          id: data.user.id,
          user_type: 'registered',
          anonymous_id: null, // Explicitly set to null for registered users
          email: registrationRequest.email,
          display_name: registrationRequest.displayName,
          subscription_tier: 'Free',
          metadata: registrationRequest.metadata || {}
        });

      if (userRecordError) {
        console.error('Failed to create user record:', userRecordError);
        // Don't fail the registration for this - the auth user was created successfully
      }

      // Handle anonymous user migration if provided
      if (registrationRequest.anonymousId) {
        try {
          await this.migrateAnonymousToRegistered(
            registrationRequest.anonymousId,
            data.user.id
          );
        } catch (migrationError) {
          console.error('Anonymous user migration failed:', migrationError);
          // Don't fail registration for migration issues
        }
      }

      // Transform session if available
      let authSession: AuthSession | undefined;
      if (data.session) {
        authSession = this.transformSupabaseSession(data.session);
        this.currentSession = authSession;
      }

      return {
        success: true,
        session: authSession,
        user: this.transformSupabaseUser(data.user),
        requiresEmailConfirmation: !data.session // If no session, email confirmation required
      };

    } catch (error) {
      if (error instanceof SupabaseAuthError) {
        return {
          success: false,
          error: error.message
        };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }

  /**
   * Authenticates a registered user
   */
  async loginUser(loginRequest: LoginRequest): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: loginRequest.email,
        password: loginRequest.password
      });

      if (error) {
        // Map Supabase errors to our error codes
        if (error.message.includes('Invalid login credentials')) {
          throw new SupabaseAuthError(
            AuthErrors.INVALID_CREDENTIALS,
            'Email or password is incorrect'
          );
        } else if (error.message.includes('Email not confirmed')) {
          throw new SupabaseAuthError(
            AuthErrors.EMAIL_NOT_CONFIRMED,
            'Please confirm your email address before logging in'
          );
        } else {
          throw new SupabaseAuthError(
            AuthErrors.LOGIN_FAILED,
            error.message
          );
        }
      }

      if (!data.session || !data.user) {
        throw new SupabaseAuthError(
          AuthErrors.LOGIN_FAILED,
          'Login failed - no session created'
        );
      }

      const authSession = this.transformSupabaseSession(data.session);
      this.currentSession = authSession;

      return {
        success: true,
        session: authSession,
        user: this.transformSupabaseUser(data.user)
      };

    } catch (error) {
      if (error instanceof SupabaseAuthError) {
        return {
          success: false,
          error: error.message
        };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }

  /**
   * Send OTP code to email address for passwordless authentication
   * Works for both new user registration and existing user login
   */
  async sendEmailOTP(email: string): Promise<AuthResult> {
    try {
      await this.ensureInitialized();
      
      if (!this.supabase) {
        throw new SupabaseAuthError(
          AuthErrors.SESSION_CREATION_FAILED,
          'Supabase client not initialized'
        );
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new SupabaseAuthError(
          AuthErrors.INVALID_EMAIL,
          'Email address format is invalid'
        );
      }

      const { data, error } = await this.supabase.auth.signInWithOtp({
        email: email,
        options: {
          // Allow creating new users automatically
          shouldCreateUser: true,
          // Don't need redirect URL for OTP flow
          emailRedirectTo: undefined
        }
      });

      if (error) {
        throw new SupabaseAuthError(
          AuthErrors.LOGIN_FAILED,
          error.message
        );
      }

      // Supabase returns null user/session for OTP requests
      // This is expected - user will be authenticated after OTP verification
      return {
        success: true,
        // No session yet - will be created after OTP verification
        session: undefined,
        user: undefined
      };

    } catch (error) {
      if (error instanceof SupabaseAuthError) {
        return {
          success: false,
          error: error.message
        };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send OTP'
      };
    }
  }

  /**
   * Verify OTP code and create authenticated session
   */
  async verifyEmailOTP(email: string, otp: string): Promise<AuthResult> {
    try {
      await this.ensureInitialized();
      
      if (!this.supabase) {
        throw new SupabaseAuthError(
          AuthErrors.SESSION_CREATION_FAILED,
          'Supabase client not initialized'
        );
      }

      // Validate inputs
      if (!email || !otp) {
        throw new SupabaseAuthError(
          AuthErrors.INVALID_CREDENTIALS,
          'Email and OTP code are required'
        );
      }

      if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
        throw new SupabaseAuthError(
          AuthErrors.INVALID_CREDENTIALS,
          'OTP must be a 6-digit number'
        );
      }

      const { data, error } = await this.supabase.auth.verifyOtp({
        email: email,
        token: otp,
        type: 'email'
      });

      console.log('🔍 OTP Verification Result:', { 
        hasData: !!data, 
        hasUser: !!data?.user, 
        hasSession: !!data?.session,
        error: error,
        userCreatedAt: data?.user?.created_at,
        userLastSignIn: data?.user?.last_sign_in_at
      });

      if (error) {
        // Map common OTP errors
        if (error.message.includes('expired') || error.message.includes('invalid')) {
          throw new SupabaseAuthError(
            AuthErrors.INVALID_CREDENTIALS,
            'Invalid or expired OTP code'
          );
        } else {
          throw new SupabaseAuthError(
            AuthErrors.LOGIN_FAILED,
            error.message
          );
        }
      }

      if (!data.session || !data.user) {
        throw new SupabaseAuthError(
          AuthErrors.LOGIN_FAILED,
          'OTP verification failed - no session created'
        );
      }

      const authSession = this.transformSupabaseSession(data.session);
      this.currentSession = authSession;

      // Check if this is a new user that needs a user record
      const isNewUser = data.user.created_at === data.user.last_sign_in_at;
      if (isNewUser) {
        try {
          // Create user record in our custom users table using admin client
          const { error: userRecordError } = await this.adminSupabase
            .from('users')
            .insert({
              id: data.user.id,
              user_type: 'registered',
              anonymous_id: null, // Explicitly set to null for registered users
              email: email,
              expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days TTL
              subscription_tier: 'Free',
              metadata: {}
            });

          if (userRecordError) {
            console.error('❌ DETAILED DATABASE ERROR:', {
              error: userRecordError,
              message: userRecordError.message,
              details: userRecordError.details,
              hint: userRecordError.hint,
              code: userRecordError.code,
              userId: data.user.id,
              email: email,
              userCreatedAt: data.user.created_at,
              userLastSignIn: data.user.last_sign_in_at,
              isNewUserCheck: data.user.created_at === data.user.last_sign_in_at,
              insertData: {
                id: data.user.id,
                user_type: 'registered',
                anonymous_id: null,
                email: email,
                expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
                subscription_tier: 'Free',
                metadata: {}
              }
            });
            // Don't fail the authentication for this - auth user was created successfully
          } else {
            console.log('✅ User record created successfully in database');
          }
        } catch (recordError) {
          console.error('❌ EXCEPTION in user record creation:', {
            error: recordError,
            message: recordError.message,
            stack: recordError.stack,
            userId: data.user.id,
            email: email
          });
          // Continue with authentication even if user record creation fails
        }
      }

      return {
        success: true,
        session: authSession,
        user: this.transformSupabaseUser(data.user)
      };

    } catch (error) {
      if (error instanceof SupabaseAuthError) {
        return {
          success: false,
          error: error.message
        };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'OTP verification failed'
      };
    }
  }

  /**
   * Logs out the current user and invalidates session
   */
  async logoutUser(): Promise<boolean> {
    try {
      const { error } = await this.supabase.auth.signOut();
      
      if (error) {
        throw new SupabaseAuthError(
          AuthErrors.LOGOUT_FAILED,
          error.message
        );
      }

      this.currentSession = null;
      return true;

    } catch (error) {
      console.error('Logout failed:', error);
      return false;
    }
  }

  /**
   * Gets the current authentication session
   */
  getCurrentSession(): AuthSession | null {
    return this.currentSession;
  }

  /**
   * Gets the current authenticated user
   */
  getCurrentUser(): any | null {
    return this.currentSession?.user || null;
  }

  /**
   * Refreshes the current session
   */
  async refreshSession(): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.refreshSession();

      if (error) {
        throw new SupabaseAuthError(
          AuthErrors.REFRESH_FAILED,
          error.message
        );
      }

      if (!data.session) {
        throw new SupabaseAuthError(
          AuthErrors.SESSION_NOT_FOUND,
          'No session to refresh'
        );
      }

      const authSession = this.transformSupabaseSession(data.session);
      this.currentSession = authSession;

      return {
        success: true,
        session: authSession,
        user: data.user ? this.transformSupabaseUser(data.user) : undefined
      };

    } catch (error) {
      if (error instanceof SupabaseAuthError) {
        return {
          success: false,
          error: error.message
        };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Session refresh failed'
      };
    }
  }

  /**
   * Migrates anonymous user data to registered user
   */
  async migrateAnonymousToRegistered(anonymousId: string, registeredUserId: string): Promise<boolean> {
    try {
      // Call the stored procedure for migration
      const { data, error } = await this.supabase.rpc('migrate_anonymous_user', {
        p_anonymous_id: anonymousId,
        p_registered_user_id: registeredUserId,
        p_preserve_data: true
      });

      if (error) {
        throw new SupabaseAuthError(
          AuthErrors.MIGRATION_FAILED,
          error.message
        );
      }

      return true;

    } catch (error) {
      console.error('Migration failed:', error);
      throw new SupabaseAuthError(
        AuthErrors.MIGRATION_FAILED,
        error instanceof Error ? error.message : 'Anonymous user migration failed'
      );
    }
  }

  /**
   * Transform Supabase session to our AuthSession format
   */
  private transformSupabaseSession(session: Session): AuthSession {
    return {
      user: this.transformSupabaseUser(session.user),
      accessToken: session.access_token,
      refreshToken: session.refresh_token || '',
      expiresAt: session.expires_at || 0,
      userType: session.user.user_metadata?.user_type || 'registered'
    };
  }

  /**
   * Transform Supabase user to our user format
   */
  private transformSupabaseUser(user: User): any {
    return {
      id: user.id,
      email: user.email,
      displayName: user.user_metadata?.display_name,
      userType: user.user_metadata?.user_type || 'registered',
      subscriptionTier: user.user_metadata?.subscription_tier || 'Free',
      createdAt: user.created_at,
      lastLoginAt: user.last_sign_in_at,
      metadata: user.user_metadata || {}
    };
  }
}

// Export the class - create instances when needed to avoid initialization errors
// export const supabaseAuth = new SupabaseAuth();