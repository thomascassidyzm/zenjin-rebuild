/**
 * Content Preview Component
 * Shows generated stitches and facts with selection controls
 */

import React from 'react';
import { Check, Square, Package, Hash } from 'lucide-react';
import type { StitchEssence, Fact, GeneratedContent } from './ClaudeGenerationModal';

interface ContentPreviewProps {
  content: GeneratedContent;
  selectedItems: Set<string>;
  onSelectionChange: (items: Set<string>) => void;
}

export const ContentPreview: React.FC<ContentPreviewProps> = ({
  content,
  selectedItems,
  onSelectionChange
}) => {
  const toggleItem = (id: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    onSelectionChange(newSelection);
  };

  const formatStitchDisplay = (stitch: StitchEssence): string => {
    const { conceptType, conceptParams } = stitch;
    
    if (conceptType === 'times_table' && conceptParams.operand && conceptParams.range) {
      return `${conceptParams.operand}x table [${conceptParams.range[0]}-${conceptParams.range[1]}]`;
    }
    
    if (conceptType === 'double' && conceptParams.range) {
      return `Double [${conceptParams.range[0]}-${conceptParams.range[1]}]`;
    }
    
    if (conceptType === 'half' && conceptParams.range) {
      return `Half [${conceptParams.range[0]}-${conceptParams.range[1]}]`;
    }
    
    if (conceptParams.range) {
      return `${conceptType} [${conceptParams.range[0]}-${conceptParams.range[1]}]`;
    }
    
    return `${conceptType} ${JSON.stringify(conceptParams)}`;
  };

  const getTubeColor = (tubeId: string) => {
    switch (tubeId) {
      case 'tube1': return 'bg-blue-100 text-blue-700';
      case 'tube2': return 'bg-green-100 text-green-700';
      case 'tube3': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTubeName = (tubeId: string) => {
    switch (tubeId) {
      case 'tube1': return 'Number Sense';
      case 'tube2': return 'Times Tables';
      case 'tube3': return 'Mixed Practice';
      default: return tubeId;
    }
  };

  if (content.stitches.length === 0 && content.facts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-gray-400">
        <div className="text-center">
          <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No content generated yet</p>
          <p className="text-sm mt-1">Ask Claude to generate curriculum content</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {/* Stitches Section */}
      {content.stitches.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Generated Stitches ({content.stitches.length})
          </h4>
          <div className="space-y-2">
            {content.stitches.map((stitch) => {
              const id = `stitch-${stitch.id}`;
              const isSelected = selectedItems.has(id);
              
              return (
                <div
                  key={stitch.id}
                  onClick={() => toggleItem(id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelected 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {isSelected ? (
                        <Check className="w-5 h-5 text-purple-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{formatStitchDisplay(stitch)}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getTubeColor(stitch.tubeId)}`}>
                          {getTubeName(stitch.tubeId)}
                        </span>
                        <span className="text-xs text-gray-500">
                          Position: {stitch.position}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Facts Section */}
      {content.facts.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Hash className="w-4 h-4" />
            Generated Facts ({content.facts.length})
          </h4>
          <div className="space-y-2">
            {content.facts.map((fact, index) => {
              const id = `fact-${index}`;
              const isSelected = selectedItems.has(id);
              
              return (
                <div
                  key={index}
                  onClick={() => toggleItem(id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelected 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {isSelected ? (
                        <Check className="w-5 h-5 text-purple-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-mono text-sm">{fact.statement} {fact.answer}</div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>Type: {fact.operation_type}</span>
                        <span>Level: {fact.difficulty_level}</span>
                        {fact.operand1 !== null && fact.operand2 !== null && (
                          <span>({fact.operand1}, {fact.operand2})</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};