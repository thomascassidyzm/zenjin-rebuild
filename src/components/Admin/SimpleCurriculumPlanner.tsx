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
      case 'tube1': return 'border-emerald-200 bg-emerald-50';
      case 'tube2': return 'border-blue-200 bg-blue-50';
      case 'tube3': return 'border-purple-200 bg-purple-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const renderTube = (tubeId: 'tube1' | 'tube2' | 'tube3') => {
    const tubeStitches = stitches
      .filter(s => s.tubeId === tubeId)
      .sort((a, b) => a.position - b.position);

    return (
      <div key={tubeId} className={`flex-1 border-2 rounded-lg p-4 ${getTubeColor(tubeId)}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {getTubeTitle(tubeId)}
          <span className="text-sm text-gray-500 ml-2">({tubeStitches.length} stitches)</span>
        </h3>
        
        <div className="space-y-2">
          {tubeStitches.map((stitch, index) => (
            <div key={stitch.id} className="group">
              {editingStitch === stitch.id ? (
                <div className="flex items-center space-x-2 bg-white p-2 rounded border">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 text-sm border-none outline-none"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(stitch.id);
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                  />
                  <button
                    onClick={() => handleSaveEdit(stitch.id)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 bg-white p-3 rounded border hover:shadow-sm transition-shadow">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 w-6">{index + 1}.</span>
                  <span 
                    className="flex-1 text-sm cursor-pointer hover:text-blue-600"
                    onClick={() => handleEditStitch(stitch.id)}
                  >
                    {getStitchTitle(stitch)}
                  </span>
                  <div className="opacity-0 group-hover:opacity-100 flex space-x-1">
                    <button
                      onClick={() => handleEditStitch(stitch.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteStitch(stitch.id)}
                      className="text-red-600 hover:text-red-800"
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
            className="w-full flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Curriculum Planner</h1>
                <p className="text-gray-600 mt-1">Design learning sequences for the triple helix</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
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
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Quick Reference</h4>
          <div className="text-xs text-blue-800 space-y-1">
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