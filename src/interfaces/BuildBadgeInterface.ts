/**
 * BuildBadgeInterface.ts
 * Generated from APML Interface Definition
 * Module: UserInterface
 */

import { React } from './React';

/**
 * APML-compliant build versioning and timestamp interface for testing validation.
 * Provides evidence-based testing capability with clear build identification across all pages.
 */
/**
 * Environment type for build
 */
export interface BuildEnvironment {
}

export interface BuildInfo {
  /** ISO timestamp of build creation */
  buildTimestamp: string;
  /** Unique build identifier */
  buildNumber: string;
  /** Git commit hash for build */
  gitCommit?: string;
  /** Build environment type */
  environment: BuildEnvironment;
}

// Export default interface
export default BuildBadgeInterface;
