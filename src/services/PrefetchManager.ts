/**
 * PrefetchManager - Progressive Loading Orchestrator
 * 
 * Ensures instant playability through intelligent prefetching:
 * - Priority 1: LIVE stitch (playing now)
 * - Priority 2: READY stitch (next rotation)
 * - Priority 3: PREPARING stitch (future rotation)
 * - Priority 4: Buffer facts (offline resilience)
 * - Priority 5: Buffer recipes (complete offline)
 */

import { FactRepository } from '../engines/FactRepository/FactRepository';
import { StitchPreparation } from '../engines/StitchPreparation/StitchPreparation';
import type { MathematicalFact } from '../types/MathematicalFact';
import type { Question } from '../types/Question';

export interface StitchRecipe {
  id: string;
  conceptType: string;
  conceptParams: any;
  tubeId: 'tube1' | 'tube2' | 'tube3';
  position: number;
}

export interface LoadedResource {
  recipe?: StitchRecipe;
  facts?: Map<string, MathematicalFact>;
  questions?: Question[];
  status: 'loading' | 'loaded' | 'error';
  priority: number;
  timestamp: number;
}

interface PrefetchTask {
  priority: number;
  stitchId: string;
  task: () => Promise<void>;
  retries: number;
}

export class PrefetchManager {
  private loadingQueue: PrefetchTask[] = [];
  private loadedResources: Map<string, LoadedResource> = new Map();
  private isProcessing = false;
  private maxRetries = 3;
  
  // Dependencies
  private factRepository: FactRepository;
  private stitchPreparation: StitchPreparation;
  
  // Tube state reference
  private tubeStates: {
    tube1: { stitches: StitchRecipe[] };
    tube2: { stitches: StitchRecipe[] };
    tube3: { stitches: StitchRecipe[] };
  };
  
  constructor(
    factRepository: FactRepository,
    stitchPreparation: StitchPreparation
  ) {
    this.factRepository = factRepository;
    this.stitchPreparation = stitchPreparation;
    
    // Initialize empty tube states
    this.tubeStates = {
      tube1: { stitches: [] },
      tube2: { stitches: [] },
      tube3: { stitches: [] }
    };
  }
  
  /**
   * Initialize prefetching for gameplay
   * Called after user auth when we know their state
   */
  async initializeForPlay(userId: string, tubeStates: typeof this.tubeStates): Promise<void> {
    console.log('🚀 PrefetchManager: Initializing for play...');
    this.tubeStates = tubeStates;
    
    // Priority 1: Load LIVE stitch (blocking)
    const liveStitch = this.getLiveStitch();
    if (!liveStitch) {
      throw new Error('No LIVE stitch available');
    }
    
    console.log(`⚡ Loading LIVE stitch: ${liveStitch.id}`);
    await this.loadStitchComplete(liveStitch, { 
      generateQuestions: true,
      priority: 1 
    });
    
    // Start background prefetching
    this.startBackgroundPrefetch();
  }
  
  /**
   * Get the currently playing stitch (tube1, position 0)
   */
  private getLiveStitch(): StitchRecipe | null {
    return this.tubeStates.tube1.stitches[0] || null;
  }
  
  /**
   * Get the next stitch to be played (tube2, position 0)
   */
  private getReadyStitch(): StitchRecipe | null {
    return this.tubeStates.tube2.stitches[0] || null;
  }
  
  /**
   * Get the preparing stitch (tube3, position 0)
   */
  private getPreparingStitch(): StitchRecipe | null {
    return this.tubeStates.tube3.stitches[0] || null;
  }
  
  /**
   * Start background prefetching with proper priorities
   */
  private startBackgroundPrefetch(): void {
    console.log('🔄 Starting background prefetch...');
    
    // Priority 2: READY stitch
    const readyStitch = this.getReadyStitch();
    if (readyStitch) {
      this.queueTask({
        priority: 2,
        stitchId: readyStitch.id,
        task: () => this.loadStitchComplete(readyStitch, { 
          generateQuestions: true,
          priority: 2 
        }),
        retries: 0
      });
    }
    
    // Priority 3: PREPARING stitch
    const preparingStitch = this.getPreparingStitch();
    if (preparingStitch) {
      this.queueTask({
        priority: 3,
        stitchId: preparingStitch.id,
        task: () => this.loadStitchComplete(preparingStitch, {
          generateQuestions: false, // Generate during play
          priority: 3
        }),
        retries: 0
      });
    }
    
    // Priority 4: Buffer facts for next 30 stitches
    this.queueTask({
      priority: 4,
      stitchId: 'buffer-facts',
      task: () => this.loadBufferFacts(),
      retries: 0
    });
    
    // Priority 5: Buffer recipes
    this.queueTask({
      priority: 5,
      stitchId: 'buffer-recipes',
      task: () => this.loadBufferRecipes(),
      retries: 0
    });
    
    // Start processing queue
    this.processQueue();
  }
  
  /**
   * Queue a prefetch task
   */
  private queueTask(task: PrefetchTask): void {
    this.loadingQueue.push(task);
    this.loadingQueue.sort((a, b) => a.priority - b.priority);
  }
  
  /**
   * Process the prefetch queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.loadingQueue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    while (this.loadingQueue.length > 0) {
      const task = this.loadingQueue.shift()!;
      
      try {
        console.log(`📦 Processing prefetch task: ${task.stitchId} (priority ${task.priority})`);
        await task.task();
      } catch (error) {
        console.error(`❌ Prefetch failed for ${task.stitchId}:`, error);
        
        // Retry logic
        if (task.retries < this.maxRetries) {
          task.retries++;
          console.log(`🔄 Retrying ${task.stitchId} (attempt ${task.retries}/${this.maxRetries})`);
          this.loadingQueue.push(task);
        }
      }
    }
    
    this.isProcessing = false;
  }
  
  /**
   * Load a complete stitch (recipe + facts + optionally questions)
   */
  async loadStitchComplete(
    stitch: StitchRecipe, 
    options: { generateQuestions: boolean; priority: number }
  ): Promise<LoadedResource> {
    const startTime = Date.now();
    
    // Check if already loaded
    const existing = this.loadedResources.get(stitch.id);
    if (existing?.status === 'loaded' && 
        (!options.generateQuestions || existing.questions)) {
      console.log(`✅ Stitch ${stitch.id} already loaded`);
      return existing;
    }
    
    // Create loading entry
    const resource: LoadedResource = {
      status: 'loading',
      priority: options.priority,
      timestamp: Date.now()
    };
    this.loadedResources.set(stitch.id, resource);
    
    try {
      // 1. Load recipe (for now, we already have it from stitch)
      resource.recipe = stitch;
      
      // 2. Extract fact IDs needed
      const factIds = this.extractFactIds(stitch);
      console.log(`📊 Stitch ${stitch.id} needs ${factIds.length} facts`);
      
      // 3. Load facts
      const facts = await this.loadFacts(factIds);
      resource.facts = facts;
      
      // 4. Generate questions if requested
      if (options.generateQuestions) {
        const questions = await this.generateQuestions(stitch, facts);
        resource.questions = questions;
        console.log(`🎯 Generated ${questions.length} questions for ${stitch.id}`);
      }
      
      resource.status = 'loaded';
      const loadTime = Date.now() - startTime;
      console.log(`✅ Loaded stitch ${stitch.id} in ${loadTime}ms`);
      
      return resource;
    } catch (error) {
      resource.status = 'error';
      throw error;
    }
  }
  
  /**
   * Extract fact IDs needed for a stitch based on its recipe
   */
  private extractFactIds(recipe: StitchRecipe): string[] {
    const { conceptType, conceptParams } = recipe;
    const factIds: string[] = [];
    
    switch (conceptType) {
      case 'addition':
        // Generate addition fact IDs based on ranges
        const { range = [0, 10] } = conceptParams;
        for (let a = range[0]; a <= range[1]; a++) {
          for (let b = range[0]; b <= range[1]; b++) {
            factIds.push(`add-${a}-${b}`);
          }
        }
        break;
        
      case 'multiplication':
      case 'times_table':
        const { operand, range: multRange = [1, 12] } = conceptParams;
        if (operand) {
          for (let b = multRange[0]; b <= multRange[1]; b++) {
            factIds.push(`mult-${operand}-${b}`);
          }
        }
        break;
        
      case 'double':
        const { range: doubleRange = [1, 10] } = conceptParams;
        for (let a = doubleRange[0]; a <= doubleRange[1]; a++) {
          factIds.push(`mult-2-${a}`);
        }
        break;
        
      // Add more concept types as needed
    }
    
    // Limit to 20 facts for a stitch
    return factIds.slice(0, 20);
  }
  
  /**
   * Load facts (from cache or network)
   */
  private async loadFacts(factIds: string[]): Promise<Map<string, MathematicalFact>> {
    const facts = new Map<string, MathematicalFact>();
    const missingIds: string[] = [];
    
    // Check cache first
    for (const id of factIds) {
      const fact = this.factRepository.getFactById(id);
      if (fact) {
        facts.set(id, fact);
      } else {
        missingIds.push(id);
      }
    }
    
    // Load missing facts from network
    if (missingIds.length > 0) {
      console.log(`📥 Loading ${missingIds.length} facts from network...`);
      // TODO: Implement batch loading from API
      // For now, generate them dynamically
      for (const id of missingIds) {
        const fact = this.generateFactFromId(id);
        if (fact) {
          facts.set(id, fact);
        }
      }
    }
    
    return facts;
  }
  
  /**
   * Generate a fact from its ID (temporary until API is ready)
   */
  private generateFactFromId(id: string): MathematicalFact | null {
    const parts = id.split('-');
    if (parts.length < 3) return null;
    
    const [operation, op1Str, op2Str] = parts;
    const operand1 = parseInt(op1Str);
    const operand2 = parseInt(op2Str);
    
    if (isNaN(operand1) || isNaN(operand2)) return null;
    
    let result = 0;
    switch (operation) {
      case 'add':
        result = operand1 + operand2;
        break;
      case 'mult':
        result = operand1 * operand2;
        break;
      case 'sub':
        result = operand1 - operand2;
        break;
      case 'div':
        result = operand1 / operand2;
        break;
      default:
        return null;
    }
    
    return {
      id,
      operation,
      operands: [operand1, operand2],
      operand1, // For compatibility with StitchPreparation
      operand2,
      result,
      difficulty: 0.5,
      tags: [operation]
    };
  }
  
  /**
   * Generate questions for a stitch
   */
  private async generateQuestions(
    recipe: StitchRecipe, 
    facts: Map<string, MathematicalFact>
  ): Promise<Question[]> {
    const questions: Question[] = [];
    
    // Convert facts to array for StitchPreparation
    const factsArray = Array.from(facts.values());
    
    // Use StitchPreparation to generate questions
    // This is a simplified version - the real implementation would use
    // the full StitchPreparation pipeline
    for (let i = 0; i < Math.min(20, factsArray.length); i++) {
      const fact = factsArray[i];
      questions.push({
        id: `${recipe.id}_q${i + 1}_${fact.id}`,
        text: this.formatQuestionText(fact, recipe.conceptType),
        correctAnswer: fact.result.toString(),
        distractor: this.generateDistractor(fact.result).toString(),
        factId: fact.id,
        boundaryLevel: 1,
        metadata: {
          conceptType: recipe.conceptType,
          difficulty: fact.difficulty
        }
      });
    }
    
    return questions;
  }
  
  /**
   * Format question text based on fact and concept type
   */
  private formatQuestionText(fact: MathematicalFact, conceptType: string): string {
    switch (conceptType) {
      case 'addition':
        return `${fact.operand1} + ${fact.operand2}`;
      case 'multiplication':
      case 'times_table':
        return `${fact.operand1} × ${fact.operand2}`;
      case 'double':
        return `Double ${fact.operand2}`;
      case 'half':
        return `Half of ${fact.operand1 * 2}`;
      default:
        return `${fact.operand1} ? ${fact.operand2} = ${fact.result}`;
    }
  }
  
  /**
   * Generate a plausible distractor
   */
  private generateDistractor(correctAnswer: number): number {
    const offset = Math.random() > 0.5 ? 1 : -1;
    const magnitude = Math.random() > 0.5 ? 1 : 10;
    return correctAnswer + (offset * magnitude);
  }
  
  /**
   * Load buffer facts for offline resilience
   */
  private async loadBufferFacts(): Promise<void> {
    console.log('📦 Loading buffer facts for 30 stitches...');
    
    // Get next 10 stitches from each tube (positions 1-10)
    const stitchesToBuffer: StitchRecipe[] = [];
    
    for (const tubeId of ['tube1', 'tube2', 'tube3'] as const) {
      const tubeStitches = this.tubeStates[tubeId].stitches.slice(1, 11);
      stitchesToBuffer.push(...tubeStitches);
    }
    
    // Extract all fact IDs needed
    const allFactIds = new Set<string>();
    for (const stitch of stitchesToBuffer) {
      const factIds = this.extractFactIds(stitch);
      factIds.forEach(id => allFactIds.add(id));
    }
    
    console.log(`📊 Buffer needs ${allFactIds.size} unique facts`);
    
    // Load facts in batches
    const factIdArray = Array.from(allFactIds);
    await this.loadFacts(factIdArray);
    
    console.log('✅ Buffer facts loaded');
  }
  
  /**
   * Load buffer recipes for complete offline capability
   */
  private async loadBufferRecipes(): Promise<void> {
    console.log('📋 Loading buffer recipes...');
    
    // In this implementation, recipes are already part of the stitch object
    // In a real implementation, this would fetch recipe details from the API
    
    console.log('✅ Buffer recipes loaded');
  }
  
  /**
   * Check if a stitch is fully loaded and ready to play
   */
  isFullyLoaded(stitchId: string): boolean {
    const resource = this.loadedResources.get(stitchId);
    return !!(
      resource?.status === 'loaded' &&
      resource.recipe &&
      resource.facts &&
      resource.questions &&
      resource.questions.length > 0
    );
  }
  
  /**
   * Get loaded questions for a stitch
   */
  getQuestions(stitchId: string): Question[] | null {
    const resource = this.loadedResources.get(stitchId);
    return resource?.questions || null;
  }
  
  /**
   * Handle tube rotation - ensure smooth transition
   */
  async handleRotation(): Promise<void> {
    console.log('🔄 Handling tube rotation...');
    
    // The READY stitch should already be loaded
    const readyStitch = this.getReadyStitch();
    if (readyStitch && !this.isFullyLoaded(readyStitch.id)) {
      console.warn('⚠️ READY stitch not pre-loaded, emergency loading...');
      await this.loadStitchComplete(readyStitch, {
        generateQuestions: true,
        priority: 1 // Emergency priority
      });
    }
    
    // Start loading the new PREPARING stitch
    const newPreparingStitch = this.getPreparingStitch();
    if (newPreparingStitch) {
      this.queueTask({
        priority: 3,
        stitchId: newPreparingStitch.id,
        task: () => this.loadStitchComplete(newPreparingStitch, {
          generateQuestions: false,
          priority: 3
        }),
        retries: 0
      });
    }
    
    // Resume queue processing
    this.processQueue();
  }
  
  /**
   * Get loading statistics for monitoring
   */
  getStats(): {
    totalLoaded: number;
    questionsReady: number;
    queueLength: number;
    cacheSize: number;
  } {
    const loaded = Array.from(this.loadedResources.values());
    return {
      totalLoaded: loaded.filter(r => r.status === 'loaded').length,
      questionsReady: loaded.filter(r => r.questions && r.questions.length > 0).length,
      queueLength: this.loadingQueue.length,
      cacheSize: this.loadedResources.size
    };
  }
}

export default PrefetchManager;