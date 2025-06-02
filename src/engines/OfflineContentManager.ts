/**
 * OfflineContentManager
 * Handles downloading and caching content for premium users
 * 
 * Premium Feature: Download lessons for offline learning
 */

import { contentGatingEngine } from './ContentGatingEngine';
import { userSessionManager } from '../services/UserSessionManager';

export interface OfflineContentStatus {
  isDownloaded: boolean;
  downloadProgress: number;
  lastUpdated?: string;
  storageUsed: number; // in KB
  isAvailable: boolean;
}

export interface DownloadJob {
  id: string;
  tubeId: string;
  stitchIds: string[];
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  startTime: number;
  estimatedSize: number;
  actualSize?: number;
}

export class OfflineContentManager {
  private readonly STORAGE_KEY_PREFIX = 'zenjin_offline_';
  private readonly MAX_STORAGE_MB = 100; // 100MB limit for offline content
  private downloadJobs = new Map<string, DownloadJob>();
  private eventListeners = new Map<string, Set<Function>>();

  /**
   * Check if offline content is available for user
   */
  async isOfflineContentAvailable(userId: string): Promise<boolean> {
    const canDownload = await contentGatingEngine.canDownloadOfflineContent(userId);
    return canDownload.hasAccess;
  }

  /**
   * Get current offline content status
   */
  async getOfflineStatus(userId: string): Promise<OfflineContentStatus> {
    if (!(await this.isOfflineContentAvailable(userId))) {
      return {
        isDownloaded: false,
        downloadProgress: 0,
        storageUsed: 0,
        isAvailable: false
      };
    }

    const storageUsed = await this.calculateStorageUsage();
    const downloadedContent = await this.getDownloadedContent();
    
    return {
      isDownloaded: downloadedContent.length > 0,
      downloadProgress: 100, // If any content exists, consider it fully downloaded
      lastUpdated: await this.getLastUpdateTime(),
      storageUsed,
      isAvailable: true
    };
  }

  /**
   * Download content for offline use
   */
  async downloadContent(userId: string, tubeIds: string[], onProgress?: (progress: number) => void): Promise<{
    success: boolean;
    jobId?: string;
    error?: string;
  }> {
    // Check premium access
    if (!(await this.isOfflineContentAvailable(userId))) {
      return {
        success: false,
        error: 'Premium subscription required for offline content'
      };
    }

    // Check storage space
    const currentUsage = await this.calculateStorageUsage();
    if (currentUsage > this.MAX_STORAGE_MB * 1024) {
      return {
        success: false,
        error: 'Storage limit exceeded. Please clear some offline content first.'
      };
    }

    try {
      // Get downloadable content
      const content = await contentGatingEngine.getDownloadableContent(userId, tubeIds);
      
      if (content.stitches.length === 0) {
        return {
          success: false,
          error: 'No content available for download'
        };
      }

      // Create download job
      const jobId = `download_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const job: DownloadJob = {
        id: jobId,
        tubeId: tubeIds[0], // Primary tube
        stitchIds: content.stitches.map(s => s.stitchId),
        progress: 0,
        status: 'pending',
        startTime: Date.now(),
        estimatedSize: content.totalSize
      };

      this.downloadJobs.set(jobId, job);

      // Start download process
      this.processDownloadJob(job, content.stitches, onProgress);

      return {
        success: true,
        jobId
      };
      
    } catch (error) {
      console.error('Download failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Download failed'
      };
    }
  }

  /**
   * Get offline content for a specific stitch
   */
  async getOfflineStitch(stitchId: string): Promise<{
    facts: any[];
    metadata: any;
    isAvailable: boolean;
  }> {
    try {
      const stored = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}stitch_${stitchId}`);
      if (stored) {
        const data = JSON.parse(stored);
        return {
          facts: data.facts || [],
          metadata: data.metadata || {},
          isAvailable: true
        };
      }
    } catch (error) {
      console.error('Failed to retrieve offline stitch:', error);
    }
    
    return {
      facts: [],
      metadata: {},
      isAvailable: false
    };
  }

  /**
   * Clear offline content to free up space
   */
  async clearOfflineContent(tubeIds?: string[]): Promise<{
    success: boolean;
    freedSpace: number; // in KB
    error?: string;
  }> {
    try {
      let freedSpace = 0;
      const keysToRemove: string[] = [];
      
      // Get all offline content keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.STORAGE_KEY_PREFIX)) {
          
          // If specific tubes requested, only clear those
          if (tubeIds && tubeIds.length > 0) {
            const shouldClear = tubeIds.some(tubeId => key.includes(tubeId));
            if (!shouldClear) continue;
          }
          
          // Calculate size before removal
          const value = localStorage.getItem(key);
          if (value) {
            freedSpace += new Blob([value]).size / 1024; // Convert to KB
          }
          
          keysToRemove.push(key);
        }
      }
      
      // Remove the keys
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Update last cleared time
      localStorage.setItem(`${this.STORAGE_KEY_PREFIX}last_cleared`, Date.now().toString());
      
      this.emit('contentCleared', { freedSpace, clearedTubes: tubeIds });
      
      return {
        success: true,
        freedSpace: Math.round(freedSpace)
      };
      
    } catch (error) {
      console.error('Failed to clear offline content:', error);
      return {
        success: false,
        freedSpace: 0,
        error: error instanceof Error ? error.message : 'Clear failed'
      };
    }
  }

  /**
   * Get download job status
   */
  getDownloadJobStatus(jobId: string): DownloadJob | null {
    return this.downloadJobs.get(jobId) || null;
  }

  /**
   * Get storage usage breakdown
   */
  async getStorageBreakdown(): Promise<{
    totalUsed: number; // KB
    byTube: Array<{
      tubeId: string;
      stitchCount: number;
      sizeKB: number;
    }>;
    maxAllowed: number; // KB
    percentUsed: number;
  }> {
    const totalUsed = await this.calculateStorageUsage();
    const maxAllowed = this.MAX_STORAGE_MB * 1024;
    const byTube: Array<{tubeId: string; stitchCount: number; sizeKB: number}> = [];
    
    // Group by tube
    const tubeUsage = new Map<string, {count: number; size: number}>();
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`${this.STORAGE_KEY_PREFIX}stitch_`)) {
        const stitchId = key.replace(`${this.STORAGE_KEY_PREFIX}stitch_`, '');
        const tubeId = stitchId.split('-')[0]; // Extract tube ID from stitch ID
        
        const value = localStorage.getItem(key);
        const size = value ? new Blob([value]).size / 1024 : 0;
        
        const current = tubeUsage.get(tubeId) || {count: 0, size: 0};
        tubeUsage.set(tubeId, {
          count: current.count + 1,
          size: current.size + size
        });
      }
    }
    
    tubeUsage.forEach((usage, tubeId) => {
      byTube.push({
        tubeId,
        stitchCount: usage.count,
        sizeKB: Math.round(usage.size)
      });
    });
    
    return {
      totalUsed: Math.round(totalUsed),
      byTube,
      maxAllowed,
      percentUsed: Math.round((totalUsed / maxAllowed) * 100)
    };
  }

  /**
   * Add event listener
   */
  addEventListener(event: string, callback: Function): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.eventListeners.get(event)?.delete(callback);
    };
  }

  // Private methods
  private async processDownloadJob(job: DownloadJob, content: any[], onProgress?: (progress: number) => void) {
    job.status = 'downloading';
    this.emit('downloadStarted', { jobId: job.id });
    
    try {
      let processedSize = 0;
      
      for (let i = 0; i < content.length; i++) {
        const stitch = content[i];
        
        // Simulate downloading facts for this stitch
        await this.downloadStitchContent(stitch);
        
        processedSize += stitch.estimatedSize;
        job.progress = Math.round((processedSize / job.estimatedSize) * 100);
        
        if (onProgress) {
          onProgress(job.progress);
        }
        
        this.emit('downloadProgress', { jobId: job.id, progress: job.progress });
        
        // Small delay to prevent blocking
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      job.status = 'completed';
      job.actualSize = processedSize;
      job.progress = 100;
      
      this.emit('downloadCompleted', { jobId: job.id, actualSize: processedSize });
      
    } catch (error) {
      job.status = 'failed';
      console.error('Download job failed:', error);
      this.emit('downloadFailed', { jobId: job.id, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  private async downloadStitchContent(stitch: any): Promise<void> {
    // Store stitch content in localStorage
    const stitchData = {
      stitchId: stitch.stitchId,
      tubeId: stitch.tubeId,
      position: stitch.position,
      facts: stitch.facts,
      downloadedAt: new Date().toISOString(),
      version: 1
    };
    
    try {
      localStorage.setItem(
        `${this.STORAGE_KEY_PREFIX}stitch_${stitch.stitchId}`,
        JSON.stringify(stitchData)
      );
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded. Please clear some offline content.');
      }
      throw error;
    }
  }

  private async calculateStorageUsage(): Promise<number> {
    let totalSize = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.STORAGE_KEY_PREFIX)) {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += new Blob([value]).size;
        }
      }
    }
    
    return totalSize / 1024; // Convert to KB
  }

  private async getDownloadedContent(): Promise<string[]> {
    const content: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`${this.STORAGE_KEY_PREFIX}stitch_`)) {
        content.push(key.replace(`${this.STORAGE_KEY_PREFIX}stitch_`, ''));
      }
    }
    
    return content;
  }

  private async getLastUpdateTime(): Promise<string | undefined> {
    const timestamp = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}last_update`);
    return timestamp ? new Date(parseInt(timestamp)).toISOString() : undefined;
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }
}

// Export singleton instance
export const offlineContentManager = new OfflineContentManager();