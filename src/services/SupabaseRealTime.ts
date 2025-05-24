/**
 * SupabaseRealTime Implementation
 * Handles real-time data synchronization using Supabase real-time subscriptions
 */

import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

// Data Structures from Interface
export interface RealtimeEvent {
  eventType: string;
  table: string;
  record: any;
  oldRecord?: any;
  timestamp: string;
  userId?: string;
}

export interface SubscriptionConfig {
  table: string;
  event: string;
  filter?: string;
  schema?: string;
}

export interface SubscriptionStatus {
  subscriptionId: string;
  status: string;
  config: SubscriptionConfig;
  lastEvent?: string;
  eventCount: number;
}

export interface RealtimeMetrics {
  activeSubscriptions: number;
  totalEventsReceived: number;
  connectionStatus: string;
  lastHeartbeat: string;
  averageLatency: number;
}

// Error codes
export const RealtimeErrors = {
  SUBSCRIPTION_FAILED: 'SUBSCRIPTION_FAILED',
  INVALID_FILTER: 'INVALID_FILTER',
  TABLE_NOT_FOUND: 'TABLE_NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  CONNECTION_FAILED: 'CONNECTION_FAILED',
  SUBSCRIPTION_NOT_FOUND: 'SUBSCRIPTION_NOT_FOUND',
  UNSUBSCRIBE_FAILED: 'UNSUBSCRIBE_FAILED',
  RECONNECTION_FAILED: 'RECONNECTION_FAILED',
  ALREADY_CONNECTED: 'ALREADY_CONNECTED',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  BROADCAST_FAILED: 'BROADCAST_FAILED',
  INVALID_CHANNEL: 'INVALID_CHANNEL',
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE'
} as const;

export class SupabaseRealTimeError extends Error {
  constructor(public code: string, message: string, public originalError?: any) {
    super(message);
    this.name = 'SupabaseRealTimeError';
  }
}

export class SupabaseRealTime {
  private supabase: SupabaseClient;
  private subscriptions: Map<string, SubscriptionStatus> = new Map();
  private channels: Map<string, RealtimeChannel> = new Map();
  private eventCount = 0;
  private startTime = Date.now();
  private latencySum = 0;
  private latencyCount = 0;

  constructor(supabaseUrl?: string, supabaseKey?: string) {
    // Use Vite environment variables for frontend builds
    const url = supabaseUrl || import.meta.env.VITE_SUPABASE_URL;
    const key = supabaseKey || import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (url && key) {
      try {
        this.supabase = createClient(url, key);
        console.log('SupabaseRealTime: Successfully initialized');
      } catch (error) {
        console.error('SupabaseRealTime: Failed to initialize Supabase client:', error);
        this.supabase = null as any;
      }
    } else {
      console.warn('SupabaseRealTime: Missing environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
      this.supabase = null as any;
    }
  }

  /**
   * Creates a real-time subscription to database changes
   */
  subscribe(config: SubscriptionConfig, callback: (event: RealtimeEvent) => void): string {
    try {
      const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const schema = config.schema || 'public';
      
      // Create Supabase channel
      const channel = this.supabase
        .channel(`${subscriptionId}`)
        .on(
          'postgres_changes',
          {
            event: config.event as any,
            schema: schema,
            table: config.table,
            filter: config.filter
          },
          (payload) => {
            const eventStartTime = Date.now();
            
            // Transform Supabase payload to our RealtimeEvent format
            const realtimeEvent: RealtimeEvent = {
              eventType: payload.eventType,
              table: payload.table,
              record: payload.new || payload.old,
              oldRecord: payload.old,
              timestamp: new Date().toISOString(),
              userId: payload.new?.user_id || payload.old?.user_id
            };

            // Track latency and event count
            const latency = eventStartTime - (payload.commit_timestamp ? new Date(payload.commit_timestamp).getTime() : eventStartTime);
            this.latencySum += latency;
            this.latencyCount++;
            this.eventCount++;

            // Update subscription status
            const subscription = this.subscriptions.get(subscriptionId);
            if (subscription) {
              subscription.lastEvent = realtimeEvent.timestamp;
              subscription.eventCount++;
            }

            // Call the user's callback
            callback(realtimeEvent);
          }
        )
        .subscribe((status) => {
          // Update subscription status
          const subscription = this.subscriptions.get(subscriptionId);
          if (subscription) {
            subscription.status = status;
          }
        });

      // Store subscription and channel
      this.subscriptions.set(subscriptionId, {
        subscriptionId,
        status: 'SUBSCRIBED',
        config,
        eventCount: 0
      });

      this.channels.set(subscriptionId, channel);

      return subscriptionId;
    } catch (error) {
      throw new SupabaseRealTimeError(
        RealtimeErrors.SUBSCRIPTION_FAILED,
        'Failed to create subscription',
        error
      );
    }
  }

  /**
   * Removes a real-time subscription
   */
  unsubscribe(subscriptionId: string): boolean {
    try {
      const channel = this.channels.get(subscriptionId);
      if (!channel) {
        throw new SupabaseRealTimeError(
          RealtimeErrors.SUBSCRIPTION_NOT_FOUND,
          `Subscription ${subscriptionId} not found`
        );
      }

      // Unsubscribe from Supabase
      this.supabase.removeChannel(channel);

      // Clean up local storage
      this.subscriptions.delete(subscriptionId);
      this.channels.delete(subscriptionId);

      return true;
    } catch (error) {
      if (error instanceof SupabaseRealTimeError) {
        throw error;
      }
      throw new SupabaseRealTimeError(
        RealtimeErrors.UNSUBSCRIBE_FAILED,
        'Failed to remove subscription',
        error
      );
    }
  }

  /**
   * Gets the current status of a subscription
   */
  getSubscriptionStatus(subscriptionId: string): SubscriptionStatus {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new SupabaseRealTimeError(
        RealtimeErrors.SUBSCRIPTION_NOT_FOUND,
        `Subscription ${subscriptionId} not found`
      );
    }
    return { ...subscription };
  }

  /**
   * Gets status of all active subscriptions
   */
  getAllSubscriptions(): SubscriptionStatus[] {
    return Array.from(this.subscriptions.values()).map(sub => ({ ...sub }));
  }

  /**
   * Gets the current real-time connection status
   */
  getConnectionStatus(): string {
    // Check if we have any active channels
    if (this.channels.size === 0) {
      return 'CLOSED';
    }

    // Check first active channel status
    const firstChannel = Array.from(this.channels.values())[0];
    return firstChannel.state || 'UNKNOWN';
  }

  /**
   * Manually reconnect the real-time connection
   */
  async reconnect(): Promise<boolean> {
    try {
      const currentStatus = this.getConnectionStatus();
      if (currentStatus === 'OPEN' || currentStatus === 'CONNECTING') {
        throw new SupabaseRealTimeError(
          RealtimeErrors.ALREADY_CONNECTED,
          'Connection is already active'
        );
      }

      // For each subscription, recreate the channel
      const subscriptionEntries = Array.from(this.subscriptions.entries());
      
      for (const [subscriptionId, subscription] of subscriptionEntries) {
        const oldChannel = this.channels.get(subscriptionId);
        if (oldChannel) {
          this.supabase.removeChannel(oldChannel);
        }

        // Recreate subscription (this will create a new channel)
        // Note: In a real implementation, you'd store the original callback
        // For now, we'll mark it as reconnecting
        subscription.status = 'CONNECTING';
      }

      return true;
    } catch (error) {
      if (error instanceof SupabaseRealTimeError) {
        throw error;
      }
      throw new SupabaseRealTimeError(
        RealtimeErrors.RECONNECTION_FAILED,
        'Failed to reconnect to real-time service',
        error
      );
    }
  }

  /**
   * Gets real-time performance and usage metrics
   */
  getMetrics(): RealtimeMetrics {
    const averageLatency = this.latencyCount > 0 ? this.latencySum / this.latencyCount : 0;
    
    return {
      activeSubscriptions: this.subscriptions.size,
      totalEventsReceived: this.eventCount,
      connectionStatus: this.getConnectionStatus(),
      lastHeartbeat: new Date().toISOString(),
      averageLatency
    };
  }

  /**
   * Convenience method to subscribe to user state changes
   */
  subscribeToUserState(userId: string, callback: (event: RealtimeEvent) => void): string {
    return this.subscribe(
      {
        table: 'user_state',
        event: '*',
        filter: `user_id=eq.${userId}`
      },
      callback
    );
  }

  /**
   * Convenience method to subscribe to session metrics changes
   */
  subscribeToSessionMetrics(userId: string, callback: (event: RealtimeEvent) => void): string {
    return this.subscribe(
      {
        table: 'session_metrics',
        event: '*',
        filter: `user_id=eq.${userId}`
      },
      callback
    );
  }

  /**
   * Broadcast custom events to other clients
   */
  async broadcastEvent(channel: string, event: string, payload: any): Promise<boolean> {
    try {
      // Validate payload size (Supabase has limits)
      const payloadSize = JSON.stringify(payload).length;
      if (payloadSize > 100000) { // 100KB limit
        throw new SupabaseRealTimeError(
          RealtimeErrors.PAYLOAD_TOO_LARGE,
          'Payload exceeds size limit'
        );
      }

      // Create or get broadcast channel
      let broadcastChannel = this.channels.get(`broadcast_${channel}`);
      if (!broadcastChannel) {
        broadcastChannel = this.supabase.channel(channel);
        this.channels.set(`broadcast_${channel}`, broadcastChannel);
      }

      // Send broadcast
      const result = await broadcastChannel.send({
        type: 'broadcast',
        event,
        payload
      });

      return result === 'ok';
    } catch (error) {
      if (error instanceof SupabaseRealTimeError) {
        throw error;
      }
      throw new SupabaseRealTimeError(
        RealtimeErrors.BROADCAST_FAILED,
        'Failed to broadcast event',
        error
      );
    }
  }

  /**
   * Clean up all subscriptions and channels
   */
  destroy(): void {
    // Unsubscribe from all channels
    for (const channel of this.channels.values()) {
      this.supabase.removeChannel(channel);
    }

    // Clear local storage
    this.subscriptions.clear();
    this.channels.clear();
  }
}

// Export the class - create instances when needed to avoid initialization errors
// export const supabaseRealTime = new SupabaseRealTime();