/**
 * UserInitializationInterface.ts
 * Generated from APML Interface Definition
 * Module: BackendServices
 */

import { UserRecord } from './UserRecord';
import { UserStateRecord } from './UserStateRecord';
import { TripleHelixState } from './TripleHelixState';
import { ProgressMetrics } from './ProgressMetrics';

/**
 * Define interface contracts for initializing new users in the database after authentication.
 * Following External Service Integration Protocol for backend user creation.
 */
/**
 * Type of user account
 */
export interface UserType {
}

export interface UserRecord {
  /** User's unique identifier */
  id: string;
  /** User's email address */
  email: string;
  /** User's display name */
  displayName: string;
  /** Type of user account */
  userType: UserType;
  /** User's subscription level */
  subscriptionTier: string;
  /** ISO timestamp of record creation */
  createdAt: string;
}

export interface UserStateRecord {
  /** Associated user identifier */
  userId: string;
  /** User's learning positions */
  stitchPositions: Record<string, any>;
  /** User's Triple Helix progress */
  tripleHelixState: TripleHelixState;
  /** Spaced repetition data */
  spacedRepetitionState: Record<string, any>;
  /** User's progress statistics */
  progressMetrics: ProgressMetrics;
  /** State version for optimistic locking */
  version: number;
  /** ISO timestamp of last sync */
  lastSyncTime: string;
}

export interface UserInitializationResult {
  /** Whether initialization completed successfully */
  success: boolean;
  /** Created user record or null if failed */
  user?: UserRecord;
  /** Created user state record or null if failed */
  userState?: UserStateRecord;
  /** Error message if initialization failed */
  error?: string;
  /** Error code for programmatic handling */
  errorCode?: string;
}

export interface UserExistenceResult {
  /** Whether user exists in database */
  exists: boolean;
  /** Whether user needs to be created */
  requiresInitialization: boolean;
  /** User record if exists */
  user?: UserRecord;
  /** Error message if check failed */
  error?: string;
}

export interface UserInitializationStatus {
  /** User record exists in database */
  userExists: boolean;
  /** User state record exists in database */
  userStateExists: boolean;
  /** Both user and state records exist */
  isFullyInitialized: boolean;
  /** List of missing components */
  missingComponents: string[];
}

/**
 * Error codes for UserInitializationInterface
 */
export enum UserInitializationErrorCode {
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  DATABASE_ERROR = 'DATABASE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

// Export default interface
export default UserInitializationInterface;
