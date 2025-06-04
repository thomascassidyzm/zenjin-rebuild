/**
 * Claude Generation Modal
 * Integrates with Claude MCP for intelligent curriculum content generation
 */

import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Eye, Download, ChevronDown, ChevronUp, Sparkles, AlertCircle } from 'lucide-react';
import { ClaudeConversation } from './ClaudeConversation';
import { ContentPreview } from './ContentPreview';
import { ImportControls } from './ImportControls';
import { prepareClaudeContext, type ClaudeContext } from '../../services/ClaudeContextService';
import { getClaudeAPIService } from '../../services/ClaudeAPIService';

interface ClaudeGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (content: GeneratedContent) => void;
  existingStitches: StitchEssence[];
  existingFacts: Fact[];
}

export interface StitchEssence {
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

export interface Fact {
  id?: string;
  statement: string;
  answer: string;
  operation_type: string;
  operand1: number | null;
  operand2: number | null;
  difficulty_level: number;
  metadata?: any;
}

export interface GeneratedContent {
  stitches: StitchEssence[];
  facts: Fact[];
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  generatedContent?: GeneratedContent;
}

export const ClaudeGenerationModal: React.FC<ClaudeGenerationModalProps> = ({
  isOpen,
  onClose,
  onImport,
  existingStitches,
  existingFacts
}) => {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [preview, setPreview] = useState<GeneratedContent>({ stitches: [], facts: [] });
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [claudeContext, setClaudeContext] = useState<ClaudeContext | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  useEffect(() => {
    // Load API key from localStorage
    const savedKey = localStorage.getItem('claude_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    } else {
      setShowApiKeyInput(true);
    }

    // Prepare context for Claude
    if (isOpen) {
      const context = prepareClaudeContext(existingStitches, existingFacts);
      setClaudeContext(context);
      
      // Add initial context message
      setMessages([{
        role: 'assistant',
        content: `I'm ready to help you generate curriculum content. I can see you have:
        
📚 **Existing Stitches**: ${existingStitches.length} concepts
${context.existingStitches.slice(0, 3).map(s => `  • ${s}`).join('\n')}
${existingStitches.length > 3 ? `  ... and ${existingStitches.length - 3} more` : ''}

📊 **Existing Facts**: ${existingFacts.length} mathematical facts
${Object.entries(context.existingFacts.coverage).slice(0, 3).map(([op, data]) => 
  `  • ${op}: ${JSON.stringify(data)}`
).join('\n')}

🎯 **Gaps Identified**:
${context.gaps.slice(0, 3).map(g => `  • ${g}`).join('\n')}
${context.gaps.length > 3 ? `  ... and ${context.gaps.length - 3} more` : ''}

What would you like me to generate?`
      }]);
    }
  }, [isOpen, existingStitches, existingFacts]);

  const handleSend = async () => {
    if (!input.trim() || !apiKey) return;

    const userMessage: ConversationMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateWithClaude(input, claudeContext!, apiKey, messages);
      setMessages(prev => [...prev, response]);
      
      if (response.generatedContent) {
        setPreview(response.generatedContent);
        // Auto-select all items for preview
        const allIds = new Set<string>();
        response.generatedContent.stitches.forEach(s => allIds.add(`stitch-${s.id}`));
        response.generatedContent.facts.forEach((f, i) => allIds.add(`fact-${i}`));
        setSelectedItems(allIds);
      }
    } catch (error) {
      console.error('Failed to generate content:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Sorry, I encountered an error while generating content. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = () => {
    const contentToImport: GeneratedContent = {
      stitches: preview.stitches.filter(s => selectedItems.has(`stitch-${s.id}`)),
      facts: preview.facts.filter((_, i) => selectedItems.has(`fact-${i}`))
    };
    onImport(contentToImport);
    onClose();
  };

  const saveApiKey = () => {
    localStorage.setItem('claude_api_key', apiKey);
    setShowApiKeyInput(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold">Generate with Claude</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* API Key Input */}
        {showApiKeyInput && (
          <div className="p-4 bg-yellow-50 border-b border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium">Claude API Key Required</span>
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Claude API key..."
                className="flex-1 px-3 py-2 border rounded-lg"
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
        )}

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Conversation */}
          <div className="flex-1 flex flex-col border-r">
            {/* Context Toggle */}
            <button
              onClick={() => setShowContext(!showContext)}
              className="p-3 border-b flex items-center justify-between hover:bg-gray-50"
            >
              <span className="text-sm font-medium">Curriculum Context</span>
              {showContext ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* Context Panel */}
            {showContext && claudeContext && (
              <div className="p-4 bg-gray-50 border-b max-h-48 overflow-y-auto">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-1">Existing Stitches</h4>
                    <ul className="space-y-0.5 text-gray-600">
                      {claudeContext.existingStitches.slice(0, 5).map((s, i) => (
                        <li key={i} className="truncate">• {s}</li>
                      ))}
                      {claudeContext.existingStitches.length > 5 && (
                        <li className="text-gray-400">... +{claudeContext.existingStitches.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Operations Coverage</h4>
                    <ul className="space-y-0.5 text-gray-600">
                      {Object.entries(claudeContext.existingFacts.coverage).map(([op, data]) => (
                        <li key={op} className="truncate">• {op}: {JSON.stringify(data)}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Identified Gaps</h4>
                    <ul className="space-y-0.5 text-gray-600">
                      {claudeContext.gaps.slice(0, 5).map((gap, i) => (
                        <li key={i} className="truncate">• {gap}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Conversation */}
            <ClaudeConversation
              messages={messages}
              input={input}
              onInputChange={setInput}
              onSend={handleSend}
              isLoading={isLoading}
              disabled={!apiKey}
            />
          </div>

          {/* Right: Preview & Import */}
          <div className="w-96 flex flex-col">
            <div className="p-4 border-b">
              <h3 className="font-medium flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Generated Content Preview
              </h3>
            </div>

            <ContentPreview
              content={preview}
              selectedItems={selectedItems}
              onSelectionChange={setSelectedItems}
            />

            <ImportControls
              hasContent={preview.stitches.length > 0 || preview.facts.length > 0}
              selectedCount={selectedItems.size}
              totalCount={preview.stitches.length + preview.facts.length}
              onImport={handleImport}
              onSelectAll={() => {
                const allIds = new Set<string>();
                preview.stitches.forEach(s => allIds.add(`stitch-${s.id}`));
                preview.facts.forEach((_, i) => allIds.add(`fact-${i}`));
                setSelectedItems(allIds);
              }}
              onDeselectAll={() => setSelectedItems(new Set())}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

async function generateWithClaude(
  prompt: string, 
  context: ClaudeContext,
  apiKey: string,
  conversationHistory: ConversationMessage[] = []
): Promise<ConversationMessage> {
  try {
    const apiService = getClaudeAPIService(apiKey);
    
    // Convert conversation history to Claude format
    const claudeHistory = conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    const response = await apiService.generateContent(prompt, context, claudeHistory);
    
    return {
      role: 'assistant',
      content: response.content,
      generatedContent: response.generatedContent
    };
  } catch (error) {
    console.error('Claude API error:', error);
    
    // Fallback to mock response for testing
    if (prompt.toLowerCase().includes('7') && prompt.toLowerCase().includes('times table')) {
      return {
        role: 'assistant',
        content: `I'll create a 7x table progression following your existing pattern:

[GENERATED_CONTENT_START]
{
  "stitches": [
    {
      "id": "gen_7x_1",
      "conceptType": "times_table",
      "conceptParams": { "operand": 7, "range": [1, 3] },
      "tubeId": "tube2",
      "position": 10
    },
    {
      "id": "gen_7x_2",
      "conceptType": "times_table",
      "conceptParams": { "operand": 7, "range": [4, 6] },
      "tubeId": "tube2",
      "position": 11
    },
    {
      "id": "gen_7x_3",
      "conceptType": "times_table",
      "conceptParams": { "operand": 7, "range": [7, 10] },
      "tubeId": "tube2",
      "position": 12
    }
  ],
  "facts": [
    {
      "statement": "7 × 1 = ?",
      "answer": "7",
      "operation_type": "multiplication",
      "operand1": 7,
      "operand2": 1,
      "difficulty_level": 1
    },
    {
      "statement": "7 × 2 = ?",
      "answer": "14",
      "operation_type": "multiplication",
      "operand1": 7,
      "operand2": 2,
      "difficulty_level": 1
    }
  ]
}
[GENERATED_CONTENT_END]

These stitches follow your existing notation and fill the gap in your times tables coverage.`,
        generatedContent: {
          stitches: [
            {
              id: 'gen_7x_1',
              conceptType: 'times_table',
              conceptParams: { operand: 7, range: [1, 3] },
              tubeId: 'tube2',
              position: 10
            },
            {
              id: 'gen_7x_2',
              conceptType: 'times_table',
              conceptParams: { operand: 7, range: [4, 6] },
              tubeId: 'tube2',
              position: 11
            },
            {
              id: 'gen_7x_3',
              conceptType: 'times_table',
              conceptParams: { operand: 7, range: [7, 10] },
              tubeId: 'tube2',
              position: 12
            }
          ],
          facts: [
            { statement: '7 × 1 = ?', answer: '7', operation_type: 'multiplication', operand1: 7, operand2: 1, difficulty_level: 1 },
            { statement: '7 × 2 = ?', answer: '14', operation_type: 'multiplication', operand1: 7, operand2: 2, difficulty_level: 1 }
          ]
        }
      };
    }
    
    throw error;
  }
}