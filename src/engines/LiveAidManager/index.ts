/**
 * LiveAidManager Engine Export
 * Live Aid Architecture - System Coordination
 */

export { LiveAidManager } from './LiveAidManager';
export { default } from './LiveAidManager';

// Re-export types from interface
export type {
  LiveAidManagerInterface,
  LiveAidStatus,
  TubeTransition,
  LiveAidRotationResult,
  PreparationRequest,
  PreparationProgress,
  LiveAidSystemState,
  LiveAidPerformanceMetrics,
  LiveAidManagerErrorCode
} from '../../interfaces/LiveAidManagerInterface';