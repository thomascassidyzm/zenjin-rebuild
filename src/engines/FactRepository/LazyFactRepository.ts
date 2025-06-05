/**
 * LazyFactRepository - Optimized for on-demand fact loading
 * 
 * Instead of loading thousands of facts into memory at startup,
 * this implementation loads facts as needed for each stitch.
 * 
 * Benefits:
 * - Minimal memory footprint (only ~20 facts in memory at a time)
 * - Fast startup (no bulk loading)
 * - Leverages rotating stage model for background loading
 * - Database-driven (no hardcoded facts)
 */

import { FactRepositoryInterface, MathematicalFact, FactQuery } from './FactRepositoryTypes';

export class LazyFactRepository implements FactRepositoryInterface {
  private static instance: LazyFactRepository | null = null;
  
  // Small cache for current stitch facts only
  private currentStitchFacts: Map<string, MathematicalFact> = new Map();
  private nextStitchFacts: Map<string, MathematicalFact> = new Map();
  
  // Cache metadata for quick lookups
  private factMetadataCache: Map<string, { operation: string; difficulty: number }> = new Map();
  
  // Track what we're currently loading
  private currentStitchId: string | null = null;
  private nextStitchId: string | null = null;
  private loadingPromise: Promise<void> | null = null;

  private constructor() {
    console.log('🚀 LazyFactRepository: Initialized with zero facts - will load on demand');
  }

  public static getInstance(): LazyFactRepository {
    if (!LazyFactRepository.instance) {
      LazyFactRepository.instance = new LazyFactRepository();
    }
    return LazyFactRepository.instance;
  }

  /**
   * Load facts for a specific stitch from the backend
   * Called by LiveAidManager when preparing a stitch
   */
  public async loadFactsForStitch(stitchId: string, conceptType: string, conceptParams: any): Promise<void> {
    console.log(`📥 Loading facts for stitch ${stitchId} (${conceptType})`);
    
    try {
      // Determine which facts we need based on concept
      const factIds = this.determineRequiredFacts(conceptType, conceptParams);
      
      // Load facts from backend
      const facts = await this.fetchFactsFromBackend(factIds);
      
      // Store in next stitch cache
      this.nextStitchFacts.clear();
      facts.forEach(fact => {
        this.nextStitchFacts.set(fact.id, fact);
      });
      
      this.nextStitchId = stitchId;
      console.log(`✅ Loaded ${facts.length} facts for stitch ${stitchId}`);
      
    } catch (error) {
      console.error(`❌ Failed to load facts for stitch ${stitchId}:`, error);
      throw error;
    }
  }

  /**
   * Promote next stitch to current when player starts playing
   */
  public promoteNextStitch(): void {
    if (this.nextStitchId) {
      console.log(`🔄 Promoting stitch ${this.nextStitchId} from ready to playing`);
      
      // Swap the caches
      this.currentStitchFacts = this.nextStitchFacts;
      this.currentStitchId = this.nextStitchId;
      
      // Clear next cache
      this.nextStitchFacts = new Map();
      this.nextStitchId = null;
    }
  }

  /**
   * Get a fact by ID - only looks in current stitch cache
   */
  public getFactById(factId: string): MathematicalFact {
    const fact = this.currentStitchFacts.get(factId);
    
    if (!fact) {
      // Try next stitch cache as fallback
      const nextFact = this.nextStitchFacts.get(factId);
      if (nextFact) {
        return nextFact;
      }
      
      throw new Error(`FACT_NOT_FOUND - Fact ${factId} not in current stitch cache`);
    }
    
    return fact;
  }

  /**
   * Query facts - simplified to only search current stitch
   */
  public queryFacts(query: FactQuery): MathematicalFact[] {
    const facts = Array.from(this.currentStitchFacts.values());
    
    // Apply filters
    let results = facts;
    
    if (query.operation) {
      results = results.filter(f => f.operation === query.operation);
    }
    
    if (query.difficulty) {
      const min = query.difficulty.min ?? 0;
      const max = query.difficulty.max ?? 1;
      results = results.filter(f => {
        const diff = f.difficulty || 0.5;
        return diff >= min && diff <= max;
      });
    }
    
    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 100;
    
    return results.slice(offset, offset + limit);
  }

  /**
   * Determine which facts are needed for a concept
   */
  private determineRequiredFacts(conceptType: string, conceptParams: any): string[] {
    const factIds: string[] = [];
    
    switch (conceptType) {
      case 'addition':
        const { operand1Range = [0, 10], operand2Range = [0, 10] } = conceptParams;
        for (let a = operand1Range[0]; a <= operand1Range[1]; a++) {
          for (let b = operand2Range[0]; b <= operand2Range[1]; b++) {
            factIds.push(`add-${a}-${b}`);
            // Include commutative if different
            if (a !== b) {
              factIds.push(`add-${b}-${a}`);
            }
          }
        }
        break;
        
      case 'multiplication':
        const { operand1Range: mult1Range = [0, 10], operand2Range: mult2Range = [0, 10] } = conceptParams;
        for (let a = mult1Range[0]; a <= mult1Range[1]; a++) {
          for (let b = mult2Range[0]; b <= mult2Range[1]; b++) {
            factIds.push(`mult-${a}-${b}`);
            if (a !== b) {
              factIds.push(`mult-${b}-${a}`);
            }
          }
        }
        break;
        
      case 'doubling':
        const { operand1Range: doubleRange = [1, 50] } = conceptParams;
        for (let a = doubleRange[0]; a <= doubleRange[1]; a++) {
          factIds.push(`mult-${a}-2`);
          factIds.push(`mult-2-${a}`);
        }
        break;
        
      case 'halving':
        const { operand1Range: halfRange = [2, 100] } = conceptParams;
        for (let a = halfRange[0]; a <= halfRange[1]; a += 2) {
          factIds.push(`div-${a}-2`);
        }
        break;
        
      // Add more concept types as needed
    }
    
    // Limit to reasonable number (e.g., 50 facts max per stitch)
    return factIds.slice(0, 50);
  }

  /**
   * Fetch specific facts from backend
   */
  private async fetchFactsFromBackend(factIds: string[]): Promise<MathematicalFact[]> {
    try {
      // Batch fetch by IDs
      const promises = factIds.map(async (id) => {
        const response = await fetch(`/api/admin/facts?id=${id}`);
        if (!response.ok) return null;
        
        const data = await response.json();
        if (!data || data.length === 0) return null;
        
        const backendFact = Array.isArray(data) ? data[0] : data;
        
        // Convert to MathematicalFact format
        return {
          id: backendFact.id,
          operation: backendFact.operation_type,
          operands: [backendFact.operand1 || 0, backendFact.operand2 || 0],
          result: parseInt(backendFact.answer),
          difficulty: (backendFact.difficulty_level || 1) / 5,
          relatedFactIds: [],
          tags: [backendFact.operation_type, `level-${backendFact.difficulty_level || 1}`]
        } as MathematicalFact;
      });
      
      const results = await Promise.all(promises);
      return results.filter((fact): fact is MathematicalFact => fact !== null);
      
    } catch (error) {
      console.error('Failed to fetch facts from backend:', error);
      throw error;
    }
  }

  /**
   * Preload facts for next stitch while current is playing
   * Called by LiveAidManager during the "building" phase
   */
  public async preloadNextStitch(stitchId: string, conceptType: string, conceptParams: any): Promise<void> {
    // Don't interrupt if already loading
    if (this.loadingPromise) {
      await this.loadingPromise;
    }
    
    this.loadingPromise = this.loadFactsForStitch(stitchId, conceptType, conceptParams);
    await this.loadingPromise;
    this.loadingPromise = null;
  }

  /**
   * Get memory usage stats
   */
  public getMemoryStats() {
    return {
      currentStitchFacts: this.currentStitchFacts.size,
      nextStitchFacts: this.nextStitchFacts.size,
      totalFactsInMemory: this.currentStitchFacts.size + this.nextStitchFacts.size,
      metadataCacheSize: this.factMetadataCache.size
    };
  }

  // Simplified/stubbed methods that aren't needed for lazy loading
  public getRelatedFacts(factId: string, limit?: number): MathematicalFact[] {
    // In lazy loading, we don't maintain relationships
    return [];
  }

  public getFactsByOperation(operation: string): MathematicalFact[] {
    return this.queryFacts({ operation });
  }

  public getFactCount(query?: FactQuery): number {
    if (!query) {
      return this.currentStitchFacts.size;
    }
    return this.queryFacts(query).length;
  }

  public searchFacts(searchCriteria: { operation: string; [key: string]: any }): MathematicalFact[] {
    return this.queryFacts(searchCriteria as FactQuery);
  }

  public getFactsByLearningPath(learningPathId: string): MathematicalFact[] {
    // This would need to be reimplemented to load from backend
    return Array.from(this.currentStitchFacts.values());
  }

  public factExists(factId: string): boolean {
    return this.currentStitchFacts.has(factId) || this.nextStitchFacts.has(factId);
  }

  public getQuestionTemplates(operation: string, boundaryLevel: number): string[] {
    // Keep the same templates as before
    const templates: Record<string, Record<number, string[]>> = {
      'addition': {
        1: ['What is {{operand1}} + {{operand2}}?'],
        2: ['{{operand1}} + {{operand2}} = ?', 'Add {{operand1}} and {{operand2}}'],
        3: ['Find the sum of {{operand1}} and {{operand2}}', '{{operand1}} + {{operand2}} = ?'],
        4: ['Calculate {{operand1}} + {{operand2}}', 'What is the total of {{operand1}} and {{operand2}}?'],
        5: ['Determine the sum: {{operand1}} + {{operand2}}', 'Solve: {{operand1}} + {{operand2}}']
      },
      // ... other operations
    };
    
    return templates[operation]?.[boundaryLevel] || [`Calculate {{operand1}} ${operation} {{operand2}}.`];
  }
}