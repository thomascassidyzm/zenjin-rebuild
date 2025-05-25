/**
 * BuildBadge Component
 * APML-compliant build versioning display for testing validation
 */

import React, { useState } from 'react';
import { getBuildInfo, formatDisplayText, formatDetailedInfo } from '../utils/buildInfo';

export const BuildBadge: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false);
  const buildInfo = getBuildInfo();

  const handleClick = () => {
    setShowDetails(!showDetails);
  };

  const handleModalClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDetails(false);
  };

  return (
    <>
      {/* Build Badge */}
      <div
        onClick={handleClick}
        className="fixed bottom-4 right-4 z-50 bg-gray-800 text-white text-xs px-3 py-1 rounded-full cursor-pointer hover:bg-gray-700 transition-colors duration-200 shadow-lg border border-gray-600"
        data-testid="build-badge"
        style={{ fontFamily: 'monospace' }}
      >
        {formatDisplayText(buildInfo)}
      </div>

      {/* Detailed Info Modal */}
      {showDetails && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={handleModalClose}
          data-testid="build-details-modal"
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Build Information</h3>
              <button
                onClick={handleModalClose}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                data-testid="close-build-details"
              >
                ×
              </button>
            </div>
            
            <pre className="text-sm bg-gray-100 p-3 rounded text-gray-800 whitespace-pre-wrap font-mono">
              {formatDetailedInfo(buildInfo)}
            </pre>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleModalClose}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BuildBadge;