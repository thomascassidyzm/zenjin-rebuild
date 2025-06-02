/**
 * ConnectivityManagerInterface.ts
 * Generated from APML Interface Definition
 * Module: OfflineSupport
 */

import { undefined } from './undefined';

/**
 * Defines the contract for the ConnectivityManager component that manages network connectivity detection and provides real-time connection status updates.
 */
/**
 * ConnectionStatus
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
 * ConnectivityEvent
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
 * NetworkQualityMetrics
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
 * Error codes for ConnectivityManagerInterface
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
  MONITORING_NOT_ACTIVE = 'MONITORING_NOT_ACTIVE',
}

/**
 * ConnectivityManagerInterface
 */
export interface ConnectivityManagerInterface {
  /**
   * Gets the current connection status
   * @returns Current connection status
   * @throws CONNECTIVITY_CHECK_FAILED if Failed to check connectivity status
   */
  getConnectionStatus(): ConnectionStatus;

  /**
   * Checks if the device is currently online
   * @returns Whether the device is online
   */
  isOnline(): boolean;

  /**
   * Adds an event listener for connectivity changes
   * @param eventType - Event type to listen for ('online', 'offline', 'change')
   * @param callback - Callback function to execute on event
   * @returns Unique identifier for the listener
   * @throws INVALID_EVENT_TYPE if The specified event type is invalid
   * @throws INVALID_CALLBACK if The callback function is invalid
   */
  addEventListener(eventType: string, callback: function): string;

  /**
   * Removes an event listener
   * @param listenerId - Unique identifier of the listener to remove
   * @returns Whether the listener was successfully removed
   * @throws LISTENER_NOT_FOUND if The specified listener was not found
   */
  removeEventListener(listenerId: string): boolean;

  /**
   * Measures current network quality metrics
   * @returns Network quality measurements
   * @throws MEASUREMENT_FAILED if Failed to measure network quality
   * @throws OFFLINE if Cannot measure quality while offline
   */
  measureNetworkQuality(): Promise<NetworkQualityMetrics>;

  /**
   * Starts continuous connectivity monitoring
   * @param interval - Monitoring interval in milliseconds
   * @returns Whether monitoring was successfully started
   * @throws MONITORING_ALREADY_ACTIVE if Monitoring is already active
   * @throws INVALID_INTERVAL if The specified interval is invalid
   */
  startMonitoring(interval?: number): boolean;

  /**
   * Stops continuous connectivity monitoring
   * @returns Whether monitoring was successfully stopped
   * @throws MONITORING_NOT_ACTIVE if Monitoring is not currently active
   */
  stopMonitoring(): boolean;

}

// Export default interface
export default ConnectivityManagerInterface;
