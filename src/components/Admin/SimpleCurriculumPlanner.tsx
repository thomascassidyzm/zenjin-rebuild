/**
 * Simplified Curriculum Planner
 * Focus on essential workflow: sequences of stitches within concepts in each tube
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Upload, 
  ArrowLeft,
  GripVertical,
  Check,
  X,
  Sparkles
} from 'lucide-react';
import { InlineClaudeGenerator } from './InlineClaudeGenerator';
import type { Fact } from './ClaudeGenerationModal';

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
  const [draggedStitch, setDraggedStitch] = useState<StitchEssence | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<{ tubeId: string; index: number } | null>(null);
  const dragCounter = useRef(0);
  const [existingFacts, setExistingFacts] = useState<Fact[]>([]);

  useEffect(() => {
    loadCurriculum();
  }, []);

  const loadCurriculum = async () => {
    setLoading(true);
    try {
      // Load facts from API
      const factsResponse = await fetch('/api/admin/facts');
      if (factsResponse.ok) {
        const factsData = await factsResponse.json();
        setExistingFacts(factsData);
        console.log(`✅ Loaded ${factsData.length} facts from backend`);
      }

      // Load stitches from API
      const stitchesResponse = await fetch('/api/admin/stitches?limit=1000');
      if (stitchesResponse.ok) {
        const stitchesData = await stitchesResponse.json();
        
        // Convert backend format to local format
        const localStitches: StitchEssence[] = stitchesData.map((stitch: any, index: number) => ({
          id: stitch.id,
          conceptType: stitch.concept_type,
          conceptParams: stitch.concept_params || {},
          tubeId: stitch.tube_id as 'tube1' | 'tube2' | 'tube3',
          position: index // Will be recalculated per tube below
        }));
        
        // Sort by tube and recalculate positions
        const sortedStitches = localStitches.sort((a, b) => {
          if (a.tubeId !== b.tubeId) return a.tubeId.localeCompare(b.tubeId);
          return 0; // Maintain order from backend
        });
        
        // Recalculate positions per tube
        let tube1Count = 0, tube2Count = 0, tube3Count = 0;
        sortedStitches.forEach(stitch => {
          switch (stitch.tubeId) {
            case 'tube1':
              stitch.position = tube1Count++;
              break;
            case 'tube2':
              stitch.position = tube2Count++;
              break;
            case 'tube3':
              stitch.position = tube3Count++;
              break;
          }
        });
        
        setStitches(sortedStitches);
        console.log(`✅ Loaded ${sortedStitches.length} stitches from backend`);
      } else {
        console.warn('⚠️ No stitches loaded from backend, starting with empty curriculum');
        setStitches([]);
      }
    } catch (error) {
      console.error('Failed to load curriculum:', error);
      // Start with empty curriculum if backend fails
      setStitches([]);
      setExistingFacts([]);
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
    
    try {
      // Save to backend API
      const response = await fetch(`/api/admin/stitches?id=${stitchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editValue,
          concept_type: parsed.conceptType,
          concept_params: parsed.conceptParams
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save: ${response.statusText}`);
      }
      
      const updatedStitch = await response.json();
      
      // Update local state only after successful save
      const updatedStitches = stitches.map(s => 
        s.id === stitchId 
          ? { ...s, ...parsed }
          : s
      );
      
      setStitches(updatedStitches);
      setEditingStitch(null);
      setEditValue('');
      
      console.log('✅ Stitch saved to backend:', updatedStitch);
    } catch (error) {
      console.error('❌ Failed to save stitch:', error);
      alert('Failed to save changes. Please try again.');
      // Don't update local state if save failed
    }
  };

  const handleCancelEdit = () => {
    setEditingStitch(null);
    setEditValue('');
  };

  const handleAddStitch = async (tubeId: 'tube1' | 'tube2' | 'tube3') => {
    const tubeStitches = stitches.filter(s => s.tubeId === tubeId);
    const newPosition = tubeStitches.length;
    const newId = `st_${tubeId.slice(-1)}_${Date.now()}`;
    
    const newStitchData = {
      id: newId,
      name: 'New Concept',
      tube_id: tubeId,
      concept_type: 'new_concept',
      concept_params: {},
      is_active: true
    };
    
    try {
      // Save to backend API
      const response = await fetch('/api/admin/stitches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStitchData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create: ${response.statusText}`);
      }
      
      const createdStitch = await response.json();
      
      // Convert to local format and update state
      const localStitch: StitchEssence = {
        id: createdStitch.id,
        conceptType: createdStitch.concept_type,
        conceptParams: createdStitch.concept_params,
        tubeId,
        position: newPosition
      };
      
      setStitches([...stitches, localStitch]);
      handleEditStitch(localStitch.id);
      console.log('✅ Stitch created in backend:', createdStitch);
    } catch (error) {
      console.error('❌ Failed to create stitch:', error);
      alert('Failed to create stitch. Please try again.');
    }
  };

  const handleDeleteStitch = async (stitchId: string) => {
    if (!confirm('Delete this stitch?')) return;
    
    try {
      // Delete from backend API
      const response = await fetch(`/api/admin/stitches?id=${stitchId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete: ${response.statusText}`);
      }
      
      // Update local state only after successful deletion
      setStitches(stitches.filter(s => s.id !== stitchId));
      console.log('✅ Stitch deleted from backend:', stitchId);
    } catch (error) {
      console.error('❌ Failed to delete stitch:', error);
      alert('Failed to delete stitch. Please try again.');
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, stitch: StitchEssence) => {
    setDraggedStitch(stitch);
    e.dataTransfer.effectAllowed = 'move';
    // Add a slight opacity to the dragged element
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedStitch(null);
    setDragOverIndex(null);
    dragCounter.current = 0;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, tubeId: string, index: number) => {
    e.preventDefault();
    dragCounter.current++;
    setDragOverIndex({ tubeId, index });
  };

  const handleDragLeave = (e: React.DragEvent) => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverIndex(null);
    }
  };

  const handleContentGenerated = async (newStitches: StitchEssence[], newFacts: Fact[]) => {
    // Facts are already saved to database by InlineClaudeGenerator
    
    // Save generated stitches to backend
    if (newStitches.length > 0) {
      try {
        console.log(`💾 Saving ${newStitches.length} generated stitches to backend...`);
        
        const savePromises = newStitches.map(async (stitch, index) => {
          const stitchData = {
            id: `generated_${Date.now()}_${index}`,
            name: stitch.conceptType || 'Generated Stitch',
            tube_id: stitch.tubeId || 'tube1',
            concept_type: stitch.conceptType,
            concept_params: stitch.conceptParams,
            is_active: true
          };
          
          const response = await fetch('/api/admin/stitches', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(stitchData)
          });
          
          if (!response.ok) {
            throw new Error(`Failed to save stitch: ${response.statusText}`);
          }
          
          const savedStitch = await response.json();
          
          // Convert back to local format
          return {
            id: savedStitch.id,
            conceptType: savedStitch.concept_type,
            conceptParams: savedStitch.concept_params,
            tubeId: stitch.tubeId,
            position: stitches.filter(s => s.tubeId === stitch.tubeId).length + index
          };
        });
        
        const savedStitches = await Promise.all(savePromises);
        
        // Update local state with backend-saved stitches
        setStitches([...stitches, ...savedStitches]);
        console.log('✅ Generated stitches saved to backend and added to UI');
        
      } catch (error) {
        console.error('❌ Failed to save generated stitches:', error);
        alert('Failed to save generated content to backend. Please try again.');
      }
    }
  };

  const handleDrop = (e: React.DragEvent, targetTubeId: string, targetIndex: number) => {
    e.preventDefault();
    dragCounter.current = 0;
    
    if (!draggedStitch) return;

    const updatedStitches = [...stitches];
    
    // Remove the dragged stitch from its original position
    const draggedIndex = updatedStitches.findIndex(s => s.id === draggedStitch.id);
    if (draggedIndex === -1) return;
    
    updatedStitches.splice(draggedIndex, 1);
    
    // Get stitches in the target tube
    const targetTubeStitches = updatedStitches
      .filter(s => s.tubeId === targetTubeId)
      .sort((a, b) => a.position - b.position);
    
    // Insert the dragged stitch at the new position
    const newStitch = { ...draggedStitch, tubeId: targetTubeId };
    
    // Recalculate positions
    const finalStitches = updatedStitches.filter(s => s.tubeId !== targetTubeId);
    targetTubeStitches.splice(targetIndex, 0, newStitch);
    
    targetTubeStitches.forEach((stitch, idx) => {
      stitch.position = idx;
    });
    
    finalStitches.push(...targetTubeStitches);
    
    // Update positions for all tubes
    ['tube1', 'tube2', 'tube3'].forEach(tubeId => {
      const tubeStitches = finalStitches
        .filter(s => s.tubeId === tubeId)
        .sort((a, b) => a.position - b.position);
      
      tubeStitches.forEach((stitch, idx) => {
        stitch.position = idx;
      });
    });
    
    setStitches(finalStitches);
    setDragOverIndex(null);
    
    console.log('✅ Stitch moved:', draggedStitch.id, 'to', targetTubeId, 'position', targetIndex);
  };

  const getTubeTitle = (tubeId: string) => {
    switch (tubeId) {
      case 'tube1': return 'Tube 1';
      case 'tube2': return 'Tube 2';
      case 'tube3': return 'Tube 3';
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
        
        <div 
          className="space-y-2 min-h-[100px]"
          onDragOver={handleDragOver}
          onDrop={(e) => {
            e.preventDefault();
            // Handle drop on empty space at the end
            if (draggedStitch) {
              handleDrop(e, tubeId, tubeStitches.length);
            }
          }}
        >
          {tubeStitches.map((stitch, index) => (
            <div 
              key={stitch.id} 
              className="group relative"
              onDragEnter={(e) => handleDragEnter(e, tubeId, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, tubeId, index)}
            >
              {/* Drop indicator */}
              {dragOverIndex?.tubeId === tubeId && dragOverIndex?.index === index && (
                <div className="absolute -top-1 left-0 right-0 h-1 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50" />
              )}
              
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
                <div 
                  className="flex items-center space-x-2 bg-gray-800/50 p-3 rounded-lg border border-gray-700/50 hover:bg-gray-800/70 hover:border-gray-600 transition-all cursor-move"
                  draggable
                  onDragStart={(e) => handleDragStart(e, stitch)}
                  onDragEnd={handleDragEnd}
                >
                  <GripVertical className="w-4 h-4 text-gray-500 cursor-grab active:cursor-grabbing" />
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
          
          {/* Drop indicator for end of list */}
          {dragOverIndex?.tubeId === tubeId && dragOverIndex?.index === tubeStitches.length && (
            <div className="h-1 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50 mx-3" />
          )}
          
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
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-purple-300">Generate content with Claude below</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Claude Generator */}
        <InlineClaudeGenerator
          existingStitches={stitches}
          existingFacts={existingFacts}
          onContentGenerated={handleContentGenerated}
        />
        
        {/* Curriculum Tubes */}
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