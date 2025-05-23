/**
 * ConnectivityManager module exports
 * 
 * Provides network connectivity detection and monitoring functionality
 */

export { ConnectivityManager } from './ConnectivityManager';
export * from './ConnectivityManagerTypes';

// Re-export for convenience
export type {
  ConnectivityManagerInterface,
  ConnectionStatus,
  ConnectivityEvent,
  NetworkQualityMetrics,
  ConnectivityEventCallback,
  EventListener
} from './ConnectivityManagerTypes';