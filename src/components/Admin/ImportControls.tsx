/**
 * Import Controls Component
 * Handles selection and import of generated content
 */

import React from 'react';
import { Download, CheckSquare, Square } from 'lucide-react';

interface ImportControlsProps {
  hasContent: boolean;
  selectedCount: number;
  totalCount: number;
  onImport: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export const ImportControls: React.FC<ImportControlsProps> = ({
  hasContent,
  selectedCount,
  totalCount,
  onImport,
  onSelectAll,
  onDeselectAll
}) => {
  if (!hasContent) {
    return (
      <div className="p-4 border-t bg-gray-50">
        <button
          disabled
          className="w-full px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          No Content to Import
        </button>
      </div>
    );
  }

  const allSelected = selectedCount === totalCount;
  const someSelected = selectedCount > 0 && selectedCount < totalCount;

  return (
    <div className="p-4 border-t bg-white">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={allSelected ? onDeselectAll : onSelectAll}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          {allSelected ? (
            <>
              <CheckSquare className="w-4 h-4" />
              Deselect All
            </>
          ) : (
            <>
              <Square className="w-4 h-4" />
              Select All
            </>
          )}
        </button>
        <span className="text-sm text-gray-500">
          {selectedCount} of {totalCount} selected
        </span>
      </div>

      <button
        onClick={onImport}
        disabled={selectedCount === 0}
        className={`w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
          selectedCount > 0
            ? 'bg-purple-600 text-white hover:bg-purple-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        <Download className="w-4 h-4" />
        Import {selectedCount} {selectedCount === 1 ? 'Item' : 'Items'}
      </button>

      {someSelected && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          Click items to select/deselect individually
        </div>
      )}
    </div>
  );
};