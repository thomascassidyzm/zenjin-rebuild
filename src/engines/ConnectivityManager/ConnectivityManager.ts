/**
 * ConnectivityManager.ts
 * 
 * Implementation of the ConnectivityManager component.
 * Manages network connectivity detection and provides real-time connection status updates.
 */

import {
  ConnectivityManagerInterface,
  ConnectionStatus,
  ConnectivityEvent,
  NetworkQualityMetrics,
  ConnectivityEventCallback,
  EventListener,
  ConnectivityManagerError,
  ConnectivityManagerErrorCode,
  CONNECTIVITY_EVENT_TYPES,
  CONNECTION_TYPES,
  EFFECTIVE_CONNECTION_TYPES,
  DEFAULT_MONITORING_INTERVAL,
  MIN_MONITORING_INTERVAL,
  MAX_MONITORING_INTERVAL
} from './ConnectivityManagerTypes';

/**
 * Implementation of the ConnectivityManager component for the Zenjin Maths App
 * Handles network connectivity detection and monitoring with real-time status updates
 */
export class ConnectivityManager implements ConnectivityManagerInterface {
  private eventListeners: Map<string, EventListener> = new Map();
  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;
  private currentStatus?: ConnectionStatus;
  private listenerIdCounter = 0;

  constructor() {
    // Initialize with current status
    this.currentStatus = this.detectConnectionStatus();
    
    // Set up native event listeners for immediate detection
    this.setupNativeEventListeners();
  }

  /**
   * Gets the current connection status
   */
  public getConnectionStatus(): ConnectionStatus {
    try {
      this.currentStatus = this.detectConnectionStatus();
      return this.currentStatus;
    } catch (error) {
      throw new ConnectivityManagerError(
        ConnectivityManagerErrorCode.CONNECTIVITY_CHECK_FAILED,
        'Failed to check connectivity status',
        error as Error
      );
    }
  }

  /**
   * Checks if the device is currently online
   */
  public isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Adds an event listener for connectivity changes
   */
  public addEventListener(eventType: string, callback: ConnectivityEventCallback): string {
    // Validate event type
    const validEventTypes = Object.values(CONNECTIVITY_EVENT_TYPES);
    if (!validEventTypes.includes(eventType as any)) {
      throw new ConnectivityManagerError(
        ConnectivityManagerErrorCode.INVALID_EVENT_TYPE,
        `Invalid event type: ${eventType}. Valid types: ${validEventTypes.join(', ')}`
      );
    }

    // Validate callback
    if (typeof callback !== 'function') {
      throw new ConnectivityManagerError(
        ConnectivityManagerErrorCode.INVALID_CALLBACK,
        'Callback must be a function'
      );
    }

    // Generate unique listener ID
    const listenerId = `listener_${++this.listenerIdCounter}_${Date.now()}`;

    // Register the listener
    const listener: EventListener = {
      id: listenerId,
      eventType,
      callback
    };

    this.eventListeners.set(listenerId, listener);
    return listenerId;
  }

  /**
   * Removes an event listener
   */
  public removeEventListener(listenerId: string): boolean {
    if (!this.eventListeners.has(listenerId)) {
      throw new ConnectivityManagerError(
        ConnectivityManagerErrorCode.LISTENER_NOT_FOUND,
        `Listener with ID ${listenerId} not found`
      );
    }

    return this.eventListeners.delete(listenerId);
  }

  /**
   * Measures current network quality metrics
   */
  public async measureNetworkQuality(): Promise<NetworkQualityMetrics> {
    if (!this.isOnline()) {
      throw new ConnectivityManagerError(
        ConnectivityManagerErrorCode.OFFLINE,
        'Cannot measure network quality while offline'
      );
    }

    try {
      const startTime = performance.now();
      
      // Use a small test request to measure latency
      const testUrl = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      
      await fetch(testUrl, { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      const endTime = performance.now();
      const latency = endTime - startTime;

      // Get connection info from Network Information API if available
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      let bandwidth = 1; // Default to 1 Mbps
      let effectiveType = EFFECTIVE_CONNECTION_TYPES.THREE_G;
      
      if (connection) {
        bandwidth = connection.downlink || 1;
        effectiveType = connection.effectiveType || EFFECTIVE_CONNECTION_TYPES.THREE_G;
      }

      // Calculate reliability based on latency and bandwidth
      const reliability = this.calculateReliability(latency, bandwidth);

      return {
        latency,
        bandwidth,
        packetLoss: 0, // Browser can't measure packet loss directly
        reliability,
        measuredAt: new Date().toISOString()
      };
    } catch (error) {
      throw new ConnectivityManagerError(
        ConnectivityManagerErrorCode.MEASUREMENT_FAILED,
        'Failed to measure network quality',
        error as Error
      );
    }
  }

  /**
   * Starts continuous connectivity monitoring
   */
  public startMonitoring(interval: number = DEFAULT_MONITORING_INTERVAL): boolean {
    if (this.isMonitoring) {
      throw new ConnectivityManagerError(
        ConnectivityManagerErrorCode.MONITORING_ALREADY_ACTIVE,
        'Monitoring is already active'
      );
    }

    if (interval < MIN_MONITORING_INTERVAL || interval > MAX_MONITORING_INTERVAL) {
      throw new ConnectivityManagerError(
        ConnectivityManagerErrorCode.INVALID_INTERVAL,
        `Interval must be between ${MIN_MONITORING_INTERVAL} and ${MAX_MONITORING_INTERVAL} milliseconds`
      );
    }

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.checkConnectivityChange();
    }, interval);

    return true;
  }

  /**
   * Stops continuous connectivity monitoring
   */
  public stopMonitoring(): boolean {
    if (!this.isMonitoring) {
      throw new ConnectivityManagerError(
        ConnectivityManagerErrorCode.MONITORING_NOT_ACTIVE,
        'Monitoring is not currently active'
      );
    }

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    this.isMonitoring = false;
    return true;
  }

  /**
   * Detects the current connection status
   */
  private detectConnectionStatus(): ConnectionStatus {
    const isOnline = navigator.onLine;
    const now = new Date().toISOString();

    // Get connection info from Network Information API if available
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    let connectionType = CONNECTION_TYPES.UNKNOWN;
    let effectiveType: string | undefined;
    let downlink: number | undefined;
    let rtt: number | undefined;

    if (connection) {
      // Map connection types
      switch (connection.type) {
        case 'wifi':
          connectionType = CONNECTION_TYPES.WIFI;
          break;
        case 'cellular':
          connectionType = CONNECTION_TYPES.CELLULAR;
          break;
        case 'ethernet':
          connectionType = CONNECTION_TYPES.ETHERNET;
          break;
        case 'bluetooth':
          connectionType = CONNECTION_TYPES.BLUETOOTH;
          break;
        default:
          connectionType = CONNECTION_TYPES.UNKNOWN;
      }

      effectiveType = connection.effectiveType;
      downlink = connection.downlink;
      rtt = connection.rtt;
    }

    return {
      isOnline,
      connectionType,
      effectiveType,
      downlink,
      rtt,
      lastChecked: now
    };
  }

  /**
   * Sets up native browser event listeners for immediate connectivity detection
   */
  private setupNativeEventListeners(): void {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.handleConnectivityChange();
    });

    window.addEventListener('offline', () => {
      this.handleConnectivityChange();
    });

    // Listen for Network Information API changes if available
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      connection.addEventListener('change', () => {
        this.handleConnectivityChange();
      });
    }
  }

  /**
   * Handles connectivity changes and notifies listeners
   */
  private handleConnectivityChange(): void {
    const previousStatus = this.currentStatus;
    const newStatus = this.detectConnectionStatus();
    
    // Only proceed if status actually changed
    if (!this.statusChanged(previousStatus, newStatus)) {
      return;
    }

    this.currentStatus = newStatus;

    // Create connectivity event
    const event: ConnectivityEvent = {
      type: newStatus.isOnline ? CONNECTIVITY_EVENT_TYPES.ONLINE : CONNECTIVITY_EVENT_TYPES.OFFLINE,
      status: newStatus,
      previousStatus,
      timestamp: new Date().toISOString()
    };

    // Notify all relevant listeners
    this.notifyListeners(event);
  }

  /**
   * Checks for connectivity changes during monitoring
   */
  private checkConnectivityChange(): void {
    this.handleConnectivityChange();
  }

  /**
   * Checks if connection status has meaningfully changed
   */
  private statusChanged(previous?: ConnectionStatus, current?: ConnectionStatus): boolean {
    if (!previous || !current) return true;
    
    return (
      previous.isOnline !== current.isOnline ||
      previous.connectionType !== current.connectionType ||
      previous.effectiveType !== current.effectiveType
    );
  }

  /**
   * Notifies all relevant event listeners
   */
  private notifyListeners(event: ConnectivityEvent): void {
    this.eventListeners.forEach(listener => {
      // Check if listener is interested in this event type
      if (listener.eventType === event.type || listener.eventType === CONNECTIVITY_EVENT_TYPES.CHANGE) {
        try {
          listener.callback(event);
        } catch (error) {
          console.error(`Error in connectivity event listener ${listener.id}:`, error);
        }
      }
    });
  }

  /**
   * Calculates connection reliability based on latency and bandwidth
   */
  private calculateReliability(latency: number, bandwidth: number): number {
    // Simple reliability calculation based on latency and bandwidth
    // Lower latency and higher bandwidth = higher reliability
    const latencyScore = Math.max(0, 1 - (latency / 1000)); // Normalize latency to 0-1
    const bandwidthScore = Math.min(1, bandwidth / 10); // Normalize bandwidth to 0-1 (10+ Mbps = max score)
    
    return Math.round((latencyScore * 0.6 + bandwidthScore * 0.4) * 100) / 100;
  }

  /**
   * Cleanup method to remove all listeners and stop monitoring
   */
  public destroy(): void {
    if (this.isMonitoring) {
      this.stopMonitoring();
    }
    this.eventListeners.clear();
  }
}