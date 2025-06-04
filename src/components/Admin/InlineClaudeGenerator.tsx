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
      
      // Enhanced prompt for concise responses and direct database saving
      const enhancedPrompt = `${input}

IMPORTANT: Generate the content and provide a BRIEF summary of what you created. Format your response like this:

✅ Generated: [brief description]
📊 Created: X stitches, Y facts
🎯 Example: [one sample stitch title and one sample fact]

Then include the full structured data for import.`;

      const response = await apiService.generateContent(enhancedPrompt, context);
      
      if (response.generatedContent) {
        // Auto-import to database
        await saveToDatabase(response.generatedContent.stitches, response.generatedContent.facts);
        
        // Update UI
        onContentGenerated(response.generatedContent.stitches, response.generatedContent.facts);
        
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

      // Then save stitches (if you have an API for them)
      if (stitches.length > 0) {
        // Note: You may need to implement this API endpoint
        console.log('Stitches to save:', stitches);
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

  const saveApiKey = () => {
    localStorage.setItem('claude_api_key', apiKey);
    setShowApiKeyInput(false);
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
      {/* Input */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Claude to generate curriculum content... (e.g., 'Create 7x table progression')"
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

      {/* Response */}
      {lastResponse && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700 whitespace-pre-wrap">{lastResponse}</div>
          </div>
        </div>
      )}
    </div>
  );
};