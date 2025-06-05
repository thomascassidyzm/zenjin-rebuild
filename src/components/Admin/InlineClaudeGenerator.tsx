/**
 * Inline Claude Generator
 * Simple, clean interface for curriculum generation within the planner
 */

import React, { useState, useEffect } from 'react';
import { Send, Sparkles, Loader2, Check } from 'lucide-react';
import { getClaudeAPIService } from '../../services/ClaudeAPIService';
import { prepareClaudeContext } from '../../services/ClaudeContextService';
import type { StitchEssence, Fact } from './ClaudeGenerationModal';

interface InlineClaudeGeneratorProps {
  existingStitches: StitchEssence[];
  existingFacts: Fact[];
  onContentGenerated: (stitches: StitchEssence[], facts: Fact[]) => void;
}

export const InlineClaudeGenerator: React.FC<InlineClaudeGeneratorProps> = ({
  existingStitches,
  existingFacts,
  onContentGenerated
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [targetTube, setTargetTube] = useState<'tube1' | 'tube2' | 'tube3' | 'auto'>('auto');

  useEffect(() => {
    const savedKey = localStorage.getItem('claude_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    } else {
      setShowApiKeyInput(true);
    }
  }, []);

  const handleGenerate = async () => {
    if (!input.trim() || !apiKey || isLoading) return;

    setIsLoading(true);
    setLastResponse('');

    try {
      const context = prepareClaudeContext(existingStitches, existingFacts);
      const apiService = getClaudeAPIService(apiKey);
      
      // Enhanced prompt with tube assignment guidance
      const tubeGuidance = targetTube === 'auto' 
        ? "Assign stitches to appropriate tubes based on content type."
        : `Assign ALL generated stitches to ${targetTube.toUpperCase()}.`;

      const enhancedPrompt = `${input}

TUBE ASSIGNMENT: ${tubeGuidance}

IMPORTANT: Generate the content and provide a BRIEF summary of what you created. Format your response like this:

✅ Generated: [brief description]

Then include the full structured data for import.`;

      const response = await apiService.generateContent(enhancedPrompt, context);
      
      if (response.generatedContent) {
        // Process stitches with tube assignment and positioning
        const processedStitches = assignStitchPositions(response.generatedContent.stitches, targetTube);
        
        // Auto-import to database
        await saveToDatabase(processedStitches, response.generatedContent.facts);
        
        // Update UI
        onContentGenerated(processedStitches, response.generatedContent.facts);
        
        // Show success message
        setLastResponse(response.content);
      } else {
        setLastResponse(response.content);
      }
      
      setInput('');
    } catch (error) {
      console.error('Generation failed:', error);
      setLastResponse('❌ Generation failed. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveToDatabase = async (stitches: StitchEssence[], facts: Fact[]) => {
    try {
      // Save facts first
      if (facts.length > 0) {
        const factPromises = facts.map(fact => 
          fetch('/api/admin/facts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fact)
          })
        );
        await Promise.all(factPromises);
      }

      // Then save stitches using the existing API
      if (stitches.length > 0) {
        console.log(`💾 Saving ${stitches.length} stitches to backend...`);
        const stitchPromises = stitches.map(stitch =>
          fetch('/api/admin/stitches', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: stitch.id,
              name: stitch.name || `${stitch.concept_type} stitch`,
              tube_id: stitch.tube_id || 'tube1',
              concept_type: stitch.concept_type,
              concept_params: stitch.concept_params,
              is_active: true
            })
          }).then(res => {
            if (!res.ok) throw new Error(`Failed to save stitch ${stitch.id}`);
            return res.json();
          })
        );
        const savedStitches = await Promise.all(stitchPromises);
        console.log('✅ Stitches saved to backend:', savedStitches);
      }
    } catch (error) {
      console.error('Database save failed:', error);
      throw error;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const assignStitchPositions = (stitches: StitchEssence[], targetTube: 'tube1' | 'tube2' | 'tube3' | 'auto') => {
    return stitches.map((stitch, index) => {
      // Override tube assignment if user specified
      const assignedTube = targetTube === 'auto' ? stitch.tubeId : targetTube;
      
      // Calculate next available position in the target tube
      const tubeStitches = existingStitches.filter(s => s.tubeId === assignedTube);
      const nextPosition = tubeStitches.length + index;
      
      return {
        ...stitch,
        tubeId: assignedTube,
        position: nextPosition
      };
    });
  };

  const saveApiKey = () => {
    localStorage.setItem('claude_api_key', apiKey);
    setShowApiKeyInput(false);
  };

  const getTubeName = (tubeId: string) => {
    switch (tubeId) {
      case 'tube1': return 'Tube 1';
      case 'tube2': return 'Tube 2';
      case 'tube3': return 'Tube 3';
      default: return 'Auto-assign';
    }
  };

  if (showApiKeyInput) {
    return (
      <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <span className="font-medium">Claude API Key Required</span>
        </div>
        <div className="flex gap-2">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Claude API key..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white"
          />
          <button
            onClick={saveApiKey}
            disabled={!apiKey}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      {/* Input and Controls */}
      <div className="space-y-3">
        {/* Main Input */}
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Claude to generate curriculum content... (e.g., 'Create 10 equivalent fraction stitches from basic to advanced')"
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {isLoading ? 'Generating...' : 'Generate'}
          </button>
        </div>

        {/* Tube Assignment */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Assign to:</span>
          <div className="flex gap-2">
            {[
              { value: 'auto', label: 'Auto-assign', color: 'bg-gray-100 text-gray-700' },
              { value: 'tube1', label: 'Tube 1', color: 'bg-blue-100 text-blue-700' },
              { value: 'tube2', label: 'Tube 2', color: 'bg-green-100 text-green-700' },
              { value: 'tube3', label: 'Tube 3', color: 'bg-purple-100 text-purple-700' }
            ].map((tube) => (
              <button
                key={tube.value}
                onClick={() => setTargetTube(tube.value as any)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  targetTube === tube.value 
                    ? `${tube.color} ring-2 ring-offset-1 ring-current` 
                    : `${tube.color} opacity-60 hover:opacity-100`
                }`}
              >
                {tube.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Response */}
      {lastResponse && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              {/* Extract only the summary part before [GENERATED_CONTENT_START] */}
              {lastResponse.split('[GENERATED_CONTENT_START]')[0].trim()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};