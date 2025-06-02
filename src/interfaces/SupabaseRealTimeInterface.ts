/**
 * SupabaseRealTimeInterface.ts
 * Generated from APML Interface Definition
 * Module: BackendServices
 */


/**
 * Defines the contract for real-time data synchronization using Supabase real-time subscriptions, enabling live updates for learning progress, metrics, and collaborative features.
 */
/**
 * RealtimeEvent
 */
export interface RealtimeEvent {
  /** Type of database event (INSERT, UPDATE, DELETE) */
  eventType: string;
  /** Database table that changed */
  table: string;
  /** The affected record data */
  record: Record<string, any>;
  /** Previous record data for UPDATE events */
  oldRecord?: Record<string, any>;
  /** ISO timestamp of the event */
  timestamp: string;
  /** User associated with the change */
  userId?: string;
}

/**
 * SubscriptionConfig
 */
export interface SubscriptionConfig {
  /** Database table to subscribe to */
  table: string;
  /** Event type to listen for (*,INSERT,UPDATE,DELETE) */
  event: string;
  /** SQL filter for subscription (e.g., user_id=eq.123) */
  filter?: string;
  /** Database schema name */
  schema?: string;
}

/**
 * SubscriptionStatus
 */
export interface SubscriptionStatus {
  /** Unique subscription identifier */
  subscriptionId: string;
  /** Subscription status (SUBSCRIBED, CLOSED, TIMED_OUT, CHANNEL_ERROR) */
  status: string;
  /** Subscription configuration */
  config: SubscriptionConfig;
  /** Timestamp of last received event */
  lastEvent?: string;
  /** Total events received */
  eventCount: number;
}

/**
 * RealtimeMetrics
 */
export interface RealtimeMetrics {
  /** Number of active subscriptions */
  activeSubscriptions: number;
  /** Total events received across all subscriptions */
  totalEventsReceived: number;
  /** Real-time connection status */
  connectionStatus: string;
  /** Last heartbeat timestamp */
  lastHeartbeat: string;
  /** Average event latency in milliseconds */
  averageLatency: number;
}

/**
 * Error codes for SupabaseRealTimeInterface
 */
export enum SupabaseRealTimeErrorCode {
  SUBSCRIPTION_FAILED = 'SUBSCRIPTION_FAILED',
  INVALID_FILTER = 'INVALID_FILTER',
  TABLE_NOT_FOUND = 'TABLE_NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  SUBSCRIPTION_NOT_FOUND = 'SUBSCRIPTION_NOT_FOUND',
  UNSUBSCRIBE_FAILED = 'UNSUBSCRIBE_FAILED',
  RECONNECTION_FAILED = 'RECONNECTION_FAILED',
  ALREADY_CONNECTED = 'ALREADY_CONNECTED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  BROADCAST_FAILED = 'BROADCAST_FAILED',
  INVALID_CHANNEL = 'INVALID_CHANNEL',
  PAYLOAD_TOO_LARGE = 'PAYLOAD_TOO_LARGE',
}

/**
 * SupabaseRealTimeInterface
 */
export interface SupabaseRealTimeInterface {
  /**
   * Creates a real-time subscription to database changes
   * @param config - Subscription configuration
   * @param callback - Function to call when events occur
   * @returns Unique subscription identifier
   * @throws SUBSCRIPTION_FAILED if Failed to create subscription
   * @throws INVALID_FILTER if Subscription filter is invalid
   * @throws TABLE_NOT_FOUND if Specified table does not exist
   * @throws PERMISSION_DENIED if User lacks permission to subscribe to this table
   * @throws CONNECTION_FAILED if Real-time connection failed
   */
  subscribe(config: SubscriptionConfig, callback: function): string;

  /**
   * Removes a real-time subscription
   * @param subscriptionId - Subscription identifier to remove
   * @returns Whether unsubscription was successful
   * @throws SUBSCRIPTION_NOT_FOUND if Subscription does not exist
   * @throws UNSUBSCRIBE_FAILED if Failed to remove subscription
   */
  unsubscribe(subscriptionId: string): boolean;

  /**
   * Gets the current status of a subscription
   * @param subscriptionId - Subscription identifier
   * @returns Current subscription status
   * @throws SUBSCRIPTION_NOT_FOUND if Subscription does not exist
   */
  getSubscriptionStatus(subscriptionId: string): SubscriptionStatus;

  /**
   * Gets status of all active subscriptions
   * @returns Array of all subscription statuses
   */
  getAllSubscriptions(): any[];

  /**
   * Gets the current real-time connection status
   * @returns Connection status (OPEN, CLOSED, CONNECTING, CLOSING)
   */
  getConnectionStatus(): string;

  /**
   * Manually reconnect the real-time connection
   * @returns Whether reconnection was successful
   * @throws RECONNECTION_FAILED if Failed to reconnect to real-time service
   * @throws ALREADY_CONNECTED if Connection is already active
   */
  reconnect(): Promise<boolean>;

  /**
   * Gets real-time performance and usage metrics
   * @returns Current real-time metrics
   */
  getMetrics(): RealtimeMetrics;

  /**
   * Convenience method to subscribe to user state changes
   * @param userId - User identifier to monitor
   * @param callback - Function to call on state changes
   * @returns Unique subscription identifier
   * @throws USER_NOT_FOUND if User does not exist
   * @throws SUBSCRIPTION_FAILED if Failed to create subscription
   */
  subscribeToUserState(userId: string, callback: function): string;

  /**
   * Convenience method to subscribe to session metrics changes
   * @param userId - User identifier to monitor
   * @param callback - Function to call on metrics changes
   * @returns Unique subscription identifier
   * @throws USER_NOT_FOUND if User does not exist
   * @throws SUBSCRIPTION_FAILED if Failed to create subscription
   */
  subscribeToSessionMetrics(userId: string, callback: function): string;

  /**
   * Broadcast custom events to other clients
   * @param channel - Channel name to broadcast to
   * @param event - Event name
   * @param payload - Event payload data
   * @returns Whether broadcast was successful
   * @throws BROADCAST_FAILED if Failed to broadcast event
   * @throws INVALID_CHANNEL if Channel name is invalid
   * @throws PAYLOAD_TOO_LARGE if Payload exceeds size limit
   */
  broadcastEvent(channel: string, event: string, payload: Record<string, any>): Promise<boolean>;

}

// Export default interface
export default SupabaseRealTimeInterface;
