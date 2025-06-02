/**
 * OfflineContentManager Component
 * Premium feature: Download content for offline learning
 */

import React, { useState, useEffect } from 'react';
import { Download, Trash2, Wifi, WifiOff, HardDrive, CheckCircle, AlertCircle } from 'lucide-react';
import { offlineContentManager, OfflineContentStatus, DownloadJob } from '../engines/OfflineContentManager';
import { userSessionManager } from '../services/UserSessionManager';

interface OfflineContentManagerProps {
  onUpgradeRequired?: () => void;
}

export const OfflineContentManager: React.FC<OfflineContentManagerProps> = ({ onUpgradeRequired }) => {
  const [offlineStatus, setOfflineStatus] = useState<OfflineContentStatus | null>(null);
  const [storageBreakdown, setStorageBreakdown] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingJob, setDownloadingJob] = useState<DownloadJob | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOfflineStatus();
    setupEventListeners();
  }, []);

  const loadOfflineStatus = async () => {
    try {
      const user = userSessionManager.state.user;
      if (!user) return;

      const [status, breakdown] = await Promise.all([
        offlineContentManager.getOfflineStatus(user.id),
        offlineContentManager.getStorageBreakdown()
      ]);

      setOfflineStatus(status);
      setStorageBreakdown(breakdown);
    } catch (err) {
      console.error('Failed to load offline status:', err);
      setError('Failed to load offline content status');
    } finally {
      setLoading(false);
    }
  };

  const setupEventListeners = () => {
    const unsubscribes = [
      offlineContentManager.addEventListener('downloadProgress', (data) => {
        const job = offlineContentManager.getDownloadJobStatus(data.jobId);
        setDownloadingJob(job);
      }),
      offlineContentManager.addEventListener('downloadCompleted', () => {
        setDownloadingJob(null);
        loadOfflineStatus();
      }),
      offlineContentManager.addEventListener('downloadFailed', (data) => {
        setError(`Download failed: ${data.error}`);
        setDownloadingJob(null);
      })
    ];

    return () => {
      unsubscribes.forEach(fn => fn());
    };
  };

  const handleDownloadContent = async () => {
    const user = userSessionManager.state.user;
    if (!user) return;

    setError(null);
    
    try {
      const result = await offlineContentManager.downloadContent(
        user.id,
        ['t1', 't2', 't3', 't4'], // All tubes
        (progress) => {
          // Progress updates handled by event listeners
        }
      );

      if (!result.success) {
        if (result.error?.includes('Premium subscription required')) {
          onUpgradeRequired?.();
        } else {
          setError(result.error || 'Download failed');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    }
  };

  const handleClearContent = async (tubeId?: string) => {
    if (!confirm(`Are you sure you want to clear ${tubeId ? `content for ${tubeId}` : 'all offline content'}?`)) {
      return;
    }

    try {
      const result = await offlineContentManager.clearOfflineContent(
        tubeId ? [tubeId] : undefined
      );

      if (result.success) {
        await loadOfflineStatus();
      } else {
        setError(result.error || 'Failed to clear content');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear content');
    }
  };

  const formatSize = (sizeKB: number): string => {
    if (sizeKB < 1024) {
      return `${Math.round(sizeKB)} KB`;
    }
    return `${(sizeKB / 1024).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg p-6">
        <div className="animate-pulse flex items-center justify-center h-32">
          <div className="text-gray-400">Loading offline content status...</div>
        </div>
      </div>
    );
  }

  if (!offlineStatus?.isAvailable) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 text-center">
        <WifiOff className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-white font-semibold mb-2">Offline Learning</h3>
        <p className="text-gray-400 mb-4">
          Download lessons for offline learning with Premium
        </p>
        <button
          onClick={onUpgradeRequired}
          className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 font-semibold rounded-md hover:from-yellow-600 hover:to-yellow-700 transition-all"
        >
          Upgrade to Premium
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Download className="w-6 h-6 text-blue-500" />
          <div>
            <h3 className="text-white font-semibold">Offline Content</h3>
            <p className="text-gray-400 text-sm">Download lessons for offline learning</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Wifi className="w-4 h-4 text-green-500" />
          <span className="text-green-400 text-sm">Premium</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-600/30 rounded-md flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          <div>
            <p className="text-red-200 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300 text-xs mt-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Download Progress */}
      {downloadingJob && (
        <div className="mb-4 p-4 bg-blue-900/20 border border-blue-600/30 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-200 text-sm font-medium">Downloading Content...</span>
            <span className="text-blue-300 text-sm">{downloadingJob.progress}%</span>
          </div>
          <div className="w-full bg-blue-900/50 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${downloadingJob.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Storage Usage */}
      {storageBreakdown && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">Storage Used</span>
            <span className="text-gray-400 text-sm">
              {formatSize(storageBreakdown.totalUsed)} / {formatSize(storageBreakdown.maxAllowed)}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                storageBreakdown.percentUsed > 90 ? 'bg-red-500' :
                storageBreakdown.percentUsed > 75 ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(storageBreakdown.percentUsed, 100)}%` }}
            />
          </div>

          {/* Storage Breakdown by Tube */}
          {storageBreakdown.byTube.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-gray-300 text-sm font-medium">Downloaded Content:</h4>
              {storageBreakdown.byTube.map((tube: any) => (
                <div key={tube.tubeId} className="flex items-center justify-between py-2 px-3 bg-gray-800 rounded">
                  <div className="flex items-center space-x-2">
                    <HardDrive className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300 text-sm">
                      Tube {tube.tubeId} ({tube.stitchCount} lessons)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-sm">{formatSize(tube.sizeKB)}</span>
                    <button
                      onClick={() => handleClearContent(tube.tubeId)}
                      className="text-red-400 hover:text-red-300"
                      title="Clear content"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {!offlineStatus.isDownloaded ? (
          <button
            onClick={handleDownloadContent}
            disabled={!!downloadingJob}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>{downloadingJob ? 'Downloading...' : 'Download All Content'}</span>
          </button>
        ) : (
          <div className="flex items-center justify-center space-x-2 py-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-400">Content ready for offline use</span>
          </div>
        )}

        {storageBreakdown?.totalUsed > 0 && (
          <button
            onClick={() => handleClearContent()}
            className="w-full px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All Offline Content</span>
          </button>
        )}
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-gray-800 rounded-md">
        <p className="text-gray-400 text-xs">
          Offline content allows you to learn without an internet connection. 
          Downloaded lessons will sync progress when you're back online.
        </p>
      </div>
    </div>
  );
};

export default OfflineContentManager;