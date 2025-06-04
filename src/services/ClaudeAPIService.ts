/**
 * Claude API Service
 * Handles communication with Claude API for curriculum generation
 */

import type { ClaudeContext } from './ClaudeContextService';
import type { StitchEssence, Fact } from '../components/Admin/ClaudeGenerationModal';

export interface ClaudeMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ClaudeResponse {
  content: string;
  generatedContent?: {
    stitches: StitchEssence[];
    facts: Fact[];
  };
}

export class ClaudeAPIService {
  public apiKey: string;
  private apiUrl = 'https://api.anthropic.com/v1/messages';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateContent(
    userPrompt: string,
    context: ClaudeContext,
    conversationHistory: ClaudeMessage[] = []
  ): Promise<ClaudeResponse> {
    const systemPrompt = this.buildSystemPrompt(context);
    
    const messages = [
      ...conversationHistory,
      { role: 'user' as const, content: userPrompt }
    ];

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true' // Required for browser-based requests
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 4096,
          system: systemPrompt,
          messages: messages
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const assistantContent = data.content[0].text;

      // Parse generated content from response
      const generatedContent = this.parseGeneratedContent(assistantContent);

      return {
        content: assistantContent,
        generatedContent
      };
    } catch (error) {
      console.error('Claude API request failed:', error);
      throw error;
    }
  }

  private buildSystemPrompt(context: ClaudeContext): string {
    return `You are an expert curriculum designer for the Zenjin Maths learning platform. You help create mathematical learning content following specific patterns and conventions.

EXISTING CURRICULUM STATE:
${JSON.stringify(context, null, 2)}

IMPORTANT GUIDELINES:

1. STITCH FORMAT:
   - Use notation: "${context.stitchFormat.notation}"
   - Examples: ${context.stitchFormat.examples.join(', ')}
   - Assign to appropriate tubes based on content type

2. FACT FORMAT:
   - Structure: ${context.factFormat.structure}
   - Available operations: ${context.factFormat.operations.join(', ')}
   - CRITICAL: Use clean mathematical expressions only
   - Examples: "7 × 4" NOT "7 × 4 = ?" or "What is 7 × 4?"
   - Use proper multiplication symbol (×) not asterisk (*)
   - Include all required fields (statement, answer, operation_type, operands, difficulty_level)

3. TRIPLE HELIX MODEL:
   - Tube 1: ${context.tripleHelixModel.tube1}
   - Tube 2: ${context.tripleHelixModel.tube2}
   - Tube 3: ${context.tripleHelixModel.tube3}

4. WHEN GENERATING CONTENT:
   - Avoid duplicating existing content
   - Follow established progressions (easy → medium → hard)
   - Create pedagogically sound sequences
   - CRITICAL: Each stitch needs 20 questions, so generate AT LEAST 20 facts per stitch
   - For times tables: generate both directions (7×3=21 AND 3×7=21) to reach 20+ facts
   - Use clean expressions: "7 × 3", "3 × 7", "21 ÷ 3", "21 ÷ 7"
   - For addition: "7 + 3", "3 + 7", "10 - 7", "10 - 3"
   - For subtraction: "10 - 3", "10 - 7"
   - For division: "21 ÷ 3", "21 ÷ 7"

5. RESPONSE FORMAT:
   Provide a BRIEF summary (1 line), then the structured data.
   
   Example response:
   ✅ Created 3 stitches with 60+ facts for 7x table progression
   
   [GENERATED_CONTENT_START]
   {
     "stitches": [...],
     "facts": [
       {
         "statement": "7 × 4",
         "answer": "28",
         "operation_type": "multiplication",
         "operand1": 7,
         "operand2": 4,
         "difficulty_level": 2
       }
     ]
   }
   [GENERATED_CONTENT_END]

Keep your description brief - the content will be saved automatically to the database.`;
  }

  private parseGeneratedContent(response: string): { stitches: StitchEssence[]; facts: Fact[] } | undefined {
    try {
      // Look for content between markers
      const startMarker = '[GENERATED_CONTENT_START]';
      const endMarker = '[GENERATED_CONTENT_END]';
      
      const startIndex = response.indexOf(startMarker);
      const endIndex = response.indexOf(endMarker);
      
      if (startIndex === -1 || endIndex === -1) {
        // Try to find JSON in the response
        const jsonMatch = response.match(/\{[\s\S]*"stitches"[\s\S]*"facts"[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        return undefined;
      }
      
      const jsonContent = response.substring(startIndex + startMarker.length, endIndex).trim();
      return JSON.parse(jsonContent);
    } catch (error) {
      console.error('Failed to parse generated content:', error);
      return undefined;
    }
  }
}

// Singleton instance management
let apiServiceInstance: ClaudeAPIService | null = null;

export function getClaudeAPIService(apiKey: string): ClaudeAPIService {
  if (!apiServiceInstance || apiServiceInstance.apiKey !== apiKey) {
    apiServiceInstance = new ClaudeAPIService(apiKey);
  }
  return apiServiceInstance;
}