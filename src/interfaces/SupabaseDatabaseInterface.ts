/**
 * SupabaseDatabaseInterface.ts
 * Generated from APML Interface Definition
 * Module: BackendServices
 */


/**
 * Defines the database schema and operations for the Zenjin Maths App using Supabase Postgres, including tables for user management, learning state, metrics, and content.
 */
/**
 * DatabaseSchema
 */
export interface DatabaseSchema {
  /** User accounts (both anonymous and registered) */
  users: table;
  /** Current learning state for each user */
  user_state: table;
  /** Session performance metrics */
  session_metrics: table;
  /** Available learning paths and content */
  learning_paths: table;
  /** User progress through learning paths */
  user_progress: table;
  /** Current stitch positions and skip numbers */
  stitch_positions: table;
  /** User achievements and milestones */
  achievements: table;
  /** Available subscription levels */
  subscription_tiers: table;
}

/**
 * UsersTable
 */
export interface UsersTable {
  /** Primary key, Supabase Auth user ID */
  id: uuid;
  /** Type: 'anonymous' or 'registered' */
  user_type: text;
  /** Custom anonymous identifier for app logic */
  anonymous_id?: text;
  /** User email (null for anonymous) */
  email?: text;
  /** User display name */
  display_name?: text;
  /** Current subscription level */
  subscription_tier: text;
  /** Account creation timestamp */
  created_at: timestamptz;
  /** Last update timestamp */
  updated_at: timestamptz;
  /** Expiration for anonymous users */
  expires_at?: timestamptz;
  /** Additional user metadata */
  metadata?: jsonb;
}

/**
 * UserStateTable
 */
export interface UserStateTable {
  /** Primary key */
  id: uuid;
  /** Foreign key to users table */
  user_id: uuid;
  /** Current stitch positions across learning paths */
  stitch_positions: jsonb;
  /** Current tube rotation and active path */
  triple_helix_state: jsonb;
  /** Skip numbers and progression data */
  spaced_repetition_state: jsonb;
  /** Learning progress and performance metrics */
  progress_metrics: jsonb;
  /** State version for conflict resolution */
  version: bigint;
  /** Last successful sync timestamp */
  last_sync_time: timestamptz;
  /** Device/source of last update */
  sync_source?: text;
  /** State creation timestamp */
  created_at: timestamptz;
  /** Last update timestamp */
  updated_at: timestamptz;
}

/**
 * SessionMetricsTable
 */
export interface SessionMetricsTable {
  /** Primary key */
  id: uuid;
  /** Foreign key to users table */
  user_id: uuid;
  /** Unique session identifier */
  session_id: text;
  /** Learning path for this session */
  learning_path: text;
  /** Total questions answered */
  questions_answered: number;
  /** Number of correct answers */
  correct_answers: number;
  /** Session duration in seconds */
  session_duration: number;
  /** First Time Correct points earned */
  ftc_points: number;
  /** Eventually Correct points earned */
  ec_points: number;
  /** Base points earned */
  base_points: number;
  /** Bonus multiplier applied */
  bonus_multiplier: decimal;
  /** Average response time */
  blink_speed: decimal;
  /** Additional session data */
  session_data?: jsonb;
  /** Session start timestamp */
  started_at: timestamptz;
  /** Session completion timestamp */
  completed_at: timestamptz;
  /** Record creation timestamp */
  created_at: timestamptz;
}

/**
 * LearningPathsTable
 */
export interface LearningPathsTable {
  /** Primary key */
  id: uuid;
  /** Unique path identifier (e.g., 'addition') */
  path_id: text;
  /** Human-readable path name */
  path_name: text;
  /** Path description */
  description?: text;
  /** Difficulty level (1-10) */
  difficulty_level: number;
  /** Minimum subscription tier required */
  required_subscription: text;
  /** Learning path content and configuration */
  content_data: jsonb;
  /** Whether path is currently active */
  is_active: boolean;
  /** Display order */
  sort_order: number;
  /** Path creation timestamp */
  created_at: timestamptz;
  /** Last update timestamp */
  updated_at: timestamptz;
}

/**
 * StitchPositionsTable
 */
export interface StitchPositionsTable {
  /** Primary key */
  id: uuid;
  /** Foreign key to users table */
  user_id: uuid;
  /** Learning path identifier */
  learning_path: text;
  /** Stitch identifier */
  stitch_id: text;
  /** Current position in learning sequence */
  current_position: number;
  /** Current skip number from spaced repetition */
  skip_number: number;
  /** When this stitch should be reviewed next */
  next_review_at?: timestamptz;
  /** Current mastery level (0-5) */
  mastery_level: number;
  /** Number of times this stitch has been presented */
  times_seen: number;
  /** Number of times answered correctly */
  times_correct: number;
  /** Last time this stitch was presented */
  last_seen_at?: timestamptz;
  /** Record creation timestamp */
  created_at: timestamptz;
  /** Last update timestamp */
  updated_at: timestamptz;
}

/**
 * Error codes for SupabaseDatabaseInterface
 */
export enum SupabaseDatabaseErrorCode {
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  USER_CREATION_FAILED = 'USER_CREATION_FAILED',
  DUPLICATE_USER = 'DUPLICATE_USER',
  INVALID_USER_DATA = 'INVALID_USER_DATA',
  DATABASE_ERROR = 'DATABASE_ERROR',
  VERSION_CONFLICT = 'VERSION_CONFLICT',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  UPDATE_FAILED = 'UPDATE_FAILED',
  METRICS_INSERT_FAILED = 'METRICS_INSERT_FAILED',
  INVALID_METRICS_DATA = 'INVALID_METRICS_DATA',
  LEARNING_PATH_NOT_FOUND = 'LEARNING_PATH_NOT_FOUND',
  POSITION_UPDATE_FAILED = 'POSITION_UPDATE_FAILED',
  STITCH_NOT_FOUND = 'STITCH_NOT_FOUND',
  INVALID_SUBSCRIPTION_TIER = 'INVALID_SUBSCRIPTION_TIER',
  INVALID_DATE_RANGE = 'INVALID_DATE_RANGE',
  CLEANUP_FAILED = 'CLEANUP_FAILED',
  MIGRATION_FAILED = 'MIGRATION_FAILED',
  SOURCE_USER_NOT_FOUND = 'SOURCE_USER_NOT_FOUND',
  TARGET_USER_EXISTS = 'TARGET_USER_EXISTS',
}

/**
 * SupabaseDatabaseInterface
 */
export interface SupabaseDatabaseInterface {
  /**
   * Creates all necessary tables, indexes, and constraints
   * @returns Whether database initialization was successful
   * @throws INITIALIZATION_FAILED if Failed to initialize database schema
   * @throws PERMISSION_DENIED if Insufficient permissions to create schema
   */
  initializeDatabase(): Promise<boolean>;

  /**
   * Creates a new user record in the users table
   * @param userData - User data to insert
   * @returns Created user record
   * @throws USER_CREATION_FAILED if Failed to create user record
   * @throws DUPLICATE_USER if User already exists
   * @throws INVALID_USER_DATA if User data validation failed
   */
  createUser(userData: Record<string, any>): Promise<Record<string, any>>;

  /**
   * Retrieves a user by their ID
   * @param userId - User identifier
   * @returns User record or null if not found
   * @throws DATABASE_ERROR if Database query failed
   */
  getUserById(userId: string): Promise<Record<string, any>>;

  /**
   * Updates user state with optimistic locking
   * @param userId - User identifier
   * @param stateData - State data to update
   * @param expectedVersion - Expected current version
   * @returns Update result with new version
   * @throws VERSION_CONFLICT if State version conflict detected
   * @throws USER_NOT_FOUND if User does not exist
   * @throws UPDATE_FAILED if Failed to update state
   */
  updateUserState(userId: string, stateData: Record<string, any>, expectedVersion: number): Promise<Record<string, any>>;

  /**
   * Records session performance metrics
   * @param metricsData - Session metrics to record
   * @returns Inserted metrics record
   * @throws METRICS_INSERT_FAILED if Failed to insert session metrics
   * @throws INVALID_METRICS_DATA if Metrics data validation failed
   */
  insertSessionMetrics(metricsData: Record<string, any>): Promise<Record<string, any>>;

  /**
   * Retrieves current stitch positions for a user and learning path
   * @param userId - User identifier
   * @param learningPath - Learning path identifier
   * @returns Array of stitch positions
   * @throws USER_NOT_FOUND if User does not exist
   * @throws LEARNING_PATH_NOT_FOUND if Learning path does not exist
   */
  getStitchPositions(userId: string, learningPath: string): Promise<any[]>;

  /**
   * Updates a specific stitch position and skip number
   * @param userId - User identifier
   * @param learningPath - Learning path identifier
   * @param stitchId - Stitch identifier
   * @param positionData - Position and performance data
   * @returns Updated stitch position
   * @throws POSITION_UPDATE_FAILED if Failed to update stitch position
   * @throws STITCH_NOT_FOUND if Stitch does not exist
   */
  updateStitchPosition(userId: string, learningPath: string, stitchId: string, positionData: Record<string, any>): Promise<Record<string, any>>;

  /**
   * Retrieves available learning paths for a subscription tier
   * @param subscriptionTier - User subscription tier
   * @returns Array of available learning paths
   * @throws INVALID_SUBSCRIPTION_TIER if Subscription tier is invalid
   */
  getLearningPaths(subscriptionTier: string): Promise<any[]>;

  /**
   * Retrieves aggregated metrics for a user
   * @param userId - User identifier
   * @param startDate - Start date for metrics (ISO string)
   * @param endDate - End date for metrics (ISO string)
   * @returns Aggregated user metrics
   * @throws USER_NOT_FOUND if User does not exist
   * @throws INVALID_DATE_RANGE if Date range is invalid
   */
  getUserMetrics(userId: string, startDate?: string, endDate?: string): Promise<Record<string, any>>;

  /**
   * Removes expired anonymous users and their associated data
   * @returns Number of users cleaned up
   * @throws CLEANUP_FAILED if Failed to cleanup expired users
   */
  cleanupExpiredUsers(): Promise<number>;

  /**
   * Migrates data from anonymous user to registered user
   * @param anonymousUserId - Anonymous user identifier
   * @param registeredUserId - Registered user identifier
   * @returns Result of migration operation
   * @throws MIGRATION_FAILED if Failed to migrate user data
   * @throws SOURCE_USER_NOT_FOUND if Anonymous user does not exist
   * @throws TARGET_USER_EXISTS if Registered user already has data
   */
  migrateUserData(anonymousUserId: string, registeredUserId: string): Promise<Record<string, any>>;

}

// Export default interface
export default SupabaseDatabaseInterface;
