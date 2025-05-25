/**
 * Build Information Utility
 * APML-compliant build versioning for testing validation
 */

export interface BuildInfo {
  buildTimestamp: string;
  buildNumber: string;
  gitCommit?: string;
  environment: 'development' | 'production';
}

/**
 * Get current build information
 * APML-compliant: either works or fails clearly
 */
export function getBuildInfo(): BuildInfo {
  // Build timestamp injected at build time via Vite
  const buildTimestamp = import.meta.env.VITE_BUILD_TIMESTAMP || new Date().toISOString();
  const buildNumber = import.meta.env.VITE_BUILD_NUMBER || 'dev';
  const gitCommit = import.meta.env.VITE_GIT_COMMIT;
  const environment = import.meta.env.PROD ? 'production' : 'development';

  return {
    buildTimestamp,
    buildNumber,
    gitCommit,
    environment
  };
}

/**
 * Format build information for display
 */
export function formatDisplayText(buildInfo: BuildInfo): string {
  const date = new Date(buildInfo.buildTimestamp);
  const timeString = date.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
  
  return `Build ${buildInfo.buildNumber} - ${timeString}`;
}

/**
 * Format detailed build information
 */
export function formatDetailedInfo(buildInfo: BuildInfo): string {
  const date = new Date(buildInfo.buildTimestamp);
  const fullDateTime = date.toLocaleString('en-US');
  
  let details = `Build: ${buildInfo.buildNumber}\n`;
  details += `Time: ${fullDateTime}\n`;
  details += `Environment: ${buildInfo.environment}\n`;
  
  if (buildInfo.gitCommit) {
    details += `Commit: ${buildInfo.gitCommit.substring(0, 8)}\n`;
  }
  
  details += `Timestamp: ${buildInfo.buildTimestamp}`;
  
  return details;
}