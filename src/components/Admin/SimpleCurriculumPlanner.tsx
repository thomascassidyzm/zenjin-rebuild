/**
 * Simplified Curriculum Planner
 * Focus on essential workflow: sequences of stitches within concepts in each tube
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Upload, 
  ArrowLeft,
  GripVertical,
  Check,
  X
} from 'lucide-react';

interface StitchEssence {
  id: string;
  conceptType: string;
  conceptParams: {
    operand?: number;
    range?: [number, number];
    min?: number;
    max?: number;
  };
  tubeId: 'tube1' | 'tube2' | 'tube3';
  position: number;
}

interface SimpleCurriculumPlannerProps {
  onBack: () => void;
}

export const SimpleCurriculumPlanner: React.FC<SimpleCurriculumPlannerProps> = ({ onBack }) => {
  const [stitches, setStitches] = useState<StitchEssence[]>([]);
  const [editingStitch, setEditingStitch] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCurriculum();
  }, []);

  const loadCurriculum = async () => {
    setLoading(true);
    try {
      // Mock curriculum data - would come from API
      setStitches([
        {
          id: 'st_1_1',
          conceptType: 'double',
          conceptParams: { range: [1, 5] },
          tubeId: 'tube1',
          position: 0
        },
        {
          id: 'st_1_2', 
          conceptType: 'double',
          conceptParams: { range: [6, 10] },
          tubeId: 'tube1',
          position: 1
        },
        {
          id: 'st_1_3',
          conceptType: 'half',
          conceptParams: { range: [2, 10] },
          tubeId: 'tube1',
          position: 2
        },
        {
          id: 'st_2_1',
          conceptType: 'times_table',
          conceptParams: { operand: 2, range: [1, 5] },
          tubeId: 'tube2',
          position: 0
        },
        {
          id: 'st_2_2',
          conceptType: 'times_table', 
          conceptParams: { operand: 2, range: [6, 12] },
          tubeId: 'tube2',
          position: 1
        },
        {
          id: 'st_3_1',
          conceptType: 'mixed_operations',
          conceptParams: {},
          tubeId: 'tube3',
          position: 0
        }
      ]);
    } catch (error) {
      console.error('Failed to load curriculum:', error);
    } finally {
      setLoading(false);
    }
  };

  // Convert stitch essence to simplified title
  const getStitchTitle = (stitch: StitchEssence): string => {
    const { conceptType, conceptParams } = stitch;
    
    switch (conceptType) {
      case 'double':
        if (conceptParams.range) {
          return `Double [${conceptParams.range[0]}-${conceptParams.range[1]}]`;
        }
        return 'Double';
        
      case 'half':
        if (conceptParams.range) {
          return `Half [${conceptParams.range[0]}-${conceptParams.range[1]}]`;
        }
        return 'Half';
        
      case 'times_table':
        const range = conceptParams.range ? `[${conceptParams.range[0]}-${conceptParams.range[1]}]` : '';
        return `${conceptParams.operand}x table ${range}`.trim();
        
      case 'mixed_operations':
        return 'Mixed [review]';
        
      default:
        return conceptType;
    }
  };

  // Parse simplified title back to stitch essence
  const parseStitchTitle = (title: string): Partial<StitchEssence> => {
    // Simple parsing for common patterns
    if (title.includes('Double')) {
      const rangeMatch = title.match(/\[(\d+)-(\d+)\]/);
      return {
        conceptType: 'double',
        conceptParams: rangeMatch ? { range: [parseInt(rangeMatch[1]), parseInt(rangeMatch[2])] } : {}
      };
    }
    
    if (title.includes('Half')) {
      const rangeMatch = title.match(/\[(\d+)-(\d+)\]/);
      return {
        conceptType: 'half',
        conceptParams: rangeMatch ? { range: [parseInt(rangeMatch[1]), parseInt(rangeMatch[2])] } : {}
      };
    }
    
    if (title.includes('x table')) {
      const operandMatch = title.match(/(\d+)x table/);
      const rangeMatch = title.match(/\[(\d+)-(\d+)\]/);
      return {
        conceptType: 'times_table',
        conceptParams: {
          operand: operandMatch ? parseInt(operandMatch[1]) : 2,
          range: rangeMatch ? [parseInt(rangeMatch[1]), parseInt(rangeMatch[2])] : undefined
        }
      };
    }
    
    return { conceptType: title.toLowerCase() };
  };

  const handleEditStitch = (stitchId: string) => {
    const stitch = stitches.find(s => s.id === stitchId);
    if (stitch) {
      setEditingStitch(stitchId);
      setEditValue(getStitchTitle(stitch));
    }
  };

  const handleSaveEdit = async (stitchId: string) => {
    const parsed = parseStitchTitle(editValue);
    const updatedStitches = stitches.map(s => 
      s.id === stitchId 
        ? { ...s, ...parsed }
        : s
    );
    
    setStitches(updatedStitches);
    setEditingStitch(null);
    setEditValue('');
    
    // TODO: Save to API
    console.log('✅ Stitch updated:', stitchId, parsed);
  };

  const handleCancelEdit = () => {
    setEditingStitch(null);
    setEditValue('');
  };

  const handleAddStitch = (tubeId: 'tube1' | 'tube2' | 'tube3') => {
    const tubeStitches = stitches.filter(s => s.tubeId === tubeId);
    const newPosition = tubeStitches.length;
    const newStitch: StitchEssence = {
      id: `st_${tubeId.slice(-1)}_${Date.now()}`,
      conceptType: 'new_concept',
      conceptParams: {},
      tubeId,
      position: newPosition
    };
    
    setStitches([...stitches, newStitch]);
    handleEditStitch(newStitch.id);
  };

  const handleDeleteStitch = async (stitchId: string) => {
    if (!confirm('Delete this stitch?')) return;
    
    setStitches(stitches.filter(s => s.id !== stitchId));
    console.log('✅ Stitch deleted:', stitchId);
  };

  const getTubeTitle = (tubeId: string) => {
    switch (tubeId) {
      case 'tube1': return 'Number Sense';
      case 'tube2': return 'Times Tables';
      case 'tube3': return 'Mixed Practice';
      default: return tubeId;
    }
  };

  const getTubeColor = (tubeId: string) => {
    switch (tubeId) {
      case 'tube1': return 'border-emerald-500/20 bg-gradient-to-br from-emerald-900/20 to-emerald-800/10';
      case 'tube2': return 'border-blue-500/20 bg-gradient-to-br from-blue-900/20 to-blue-800/10';
      case 'tube3': return 'border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-purple-800/10';
      default: return 'border-gray-600 bg-gray-800/50';
    }
  };

  const renderTube = (tubeId: 'tube1' | 'tube2' | 'tube3') => {
    const tubeStitches = stitches
      .filter(s => s.tubeId === tubeId)
      .sort((a, b) => a.position - b.position);

    return (
      <div key={tubeId} className={`flex-1 border rounded-xl p-6 backdrop-blur-sm ${getTubeColor(tubeId)}`}>
        <h3 className="text-lg font-semibold text-white mb-4">
          {getTubeTitle(tubeId)}
          <span className="text-sm text-gray-400 ml-2">({tubeStitches.length} stitches)</span>
        </h3>
        
        <div className="space-y-2">
          {tubeStitches.map((stitch, index) => (
            <div key={stitch.id} className="group">
              {editingStitch === stitch.id ? (
                <div className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg border border-gray-700">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 text-sm bg-transparent text-white border-none outline-none placeholder-gray-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(stitch.id);
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                  />
                  <button
                    onClick={() => handleSaveEdit(stitch.id)}
                    className="text-green-400 hover:text-green-300"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 bg-gray-800/50 p-3 rounded-lg border border-gray-700/50 hover:bg-gray-800/70 hover:border-gray-600 transition-all">
                  <GripVertical className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-400 w-6">{index + 1}.</span>
                  <span 
                    className="flex-1 text-sm text-gray-200 cursor-pointer hover:text-white"
                    onClick={() => handleEditStitch(stitch.id)}
                  >
                    {getStitchTitle(stitch)}
                  </span>
                  <div className="opacity-0 group-hover:opacity-100 flex space-x-1 transition-opacity">
                    <button
                      onClick={() => handleEditStitch(stitch.id)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteStitch(stitch.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          <button
            onClick={() => handleAddStitch(tubeId)}
            className="w-full flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-gray-300 hover:border-gray-500 hover:bg-gray-800/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Add stitch</span>
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 shadow-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="mr-4 p-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Curriculum Planner</h1>
                <p className="text-gray-400 mt-1">Design learning sequences for the triple helix</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-700 rounded-lg shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white transition-all">
                <Upload className="w-4 h-4 mr-2" />
                Bulk Import
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-6">
          {renderTube('tube1')}
          {renderTube('tube2')}
          {renderTube('tube3')}
        </div>
        
        {/* Helper Text */}
        <div className="mt-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-xl p-4 backdrop-blur-sm">
          <h4 className="text-sm font-medium text-blue-300 mb-2">Quick Reference</h4>
          <div className="text-xs text-blue-200/80 space-y-1">
            <div>• Click any stitch title to edit in-place</div>
            <div>• Use format: "Double [1-10]", "2x table [1-12]", "Half [2-20]"</div>
            <div>• Drag to reorder stitches within tubes</div>
            <div>• Essential workflow: concept sequences that build naturally</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SimpleCurriculumPlanner;