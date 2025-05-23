/**
 * ConnectivityManagerTypes.ts
 * 
 * Type definitions for the ConnectivityManager component.
 * Provides interfaces for network connectivity detection and monitoring.
 */

/**
 * Connection status information
 */
export interface ConnectionStatus {
  /** Whether the device is currently online */
  isOnline: boolean;
  /** Type of connection ('wifi', 'cellular', 'ethernet', 'unknown') */
  connectionType: string;
  /** Effective connection type ('slow-2g', '2g', '3g', '4g') */
  effectiveType?: string;
  /** Downlink speed in Mbps */
  downlink?: number;
  /** Round-trip time in milliseconds */
  rtt?: number;
  /** ISO date string of last connectivity check */
  lastChecked: string;
}

/**
 * Connectivity change event
 */
export interface ConnectivityEvent {
  /** Event type ('online', 'offline', 'slow', 'fast') */
  type: string;
  /** Current connection status */
  status: ConnectionStatus;
  /** Previous connection status */
  previousStatus?: ConnectionStatus;
  /** ISO date string of when event occurred */
  timestamp: string;
}

/**
 * Network quality metrics
 */
export interface NetworkQualityMetrics {
  /** Network latency in milliseconds */
  latency: number;
  /** Available bandwidth in Mbps */
  bandwidth: number;
  /** Packet loss percentage (0-100) */
  packetLoss: number;
  /** Connection reliability score (0-1) */
  reliability: number;
  /** ISO date string of measurement */
  measuredAt: string;
}

/**
 * Event listener callback function type
 */
export type ConnectivityEventCallback = (event: ConnectivityEvent) => void;

/**
 * Event listener registration
 */
export interface EventListener {
  id: string;
  eventType: string;
  callback: ConnectivityEventCallback;
}

/**
 * ConnectivityManager error codes
 */
export enum ConnectivityManagerErrorCode {
  CONNECTIVITY_CHECK_FAILED = 'CONNECTIVITY_CHECK_FAILED',
  INVALID_EVENT_TYPE = 'INVALID_EVENT_TYPE',
  INVALID_CALLBACK = 'INVALID_CALLBACK',
  LISTENER_NOT_FOUND = 'LISTENER_NOT_FOUND',
  MEASUREMENT_FAILED = 'MEASUREMENT_FAILED',
  OFFLINE = 'OFFLINE',
  MONITORING_ALREADY_ACTIVE = 'MONITORING_ALREADY_ACTIVE',
  INVALID_INTERVAL = 'INVALID_INTERVAL',
  MONITORING_NOT_ACTIVE = 'MONITORING_NOT_ACTIVE'
}

/**
 * ConnectivityManager error class
 */
export class ConnectivityManagerError extends Error {
  constructor(
    public code: ConnectivityManagerErrorCode,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ConnectivityManagerError';
  }
}

/**
 * Main ConnectivityManager interface
 */
export interface ConnectivityManagerInterface {
  /**
   * Gets the current connection status
   */
  getConnectionStatus(): ConnectionStatus;

  /**
   * Checks if the device is currently online
   */
  isOnline(): boolean;

  /**
   * Adds an event listener for connectivity changes
   */
  addEventListener(eventType: string, callback: ConnectivityEventCallback): string;

  /**
   * Removes an event listener
   */
  removeEventListener(listenerId: string): boolean;

  /**
   * Measures current network quality metrics
   */
  measureNetworkQuality(): Promise<NetworkQualityMetrics>;

  /**
   * Starts continuous connectivity monitoring
   */
  startMonitoring(interval?: number): boolean;

  /**
   * Stops continuous connectivity monitoring
   */
  stopMonitoring(): boolean;
}

/**
 * Valid event types for connectivity monitoring
 */
export const CONNECTIVITY_EVENT_TYPES = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  CHANGE: 'change',
  SLOW: 'slow',
  FAST: 'fast'
} as const;

/**
 * Valid connection types
 */
export const CONNECTION_TYPES = {
  WIFI: 'wifi',
  CELLULAR: 'cellular',
  ETHERNET: 'ethernet',
  BLUETOOTH: 'bluetooth',
  UNKNOWN: 'unknown'
} as const;

/**
 * Valid effective connection types (based on Network Information API)
 */
export const EFFECTIVE_CONNECTION_TYPES = {
  SLOW_2G: 'slow-2g',
  TWO_G: '2g',
  THREE_G: '3g',
  FOUR_G: '4g'
} as const;

/**
 * Default monitoring interval in milliseconds
 */
export const DEFAULT_MONITORING_INTERVAL = 5000;

/**
 * Minimum allowed monitoring interval in milliseconds
 */
export const MIN_MONITORING_INTERVAL = 1000;

/**
 * Maximum allowed monitoring interval in milliseconds
 */
export const MAX_MONITORING_INTERVAL = 60000;