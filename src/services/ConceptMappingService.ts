/**
 * Concept Mapping Service
 * Manages flexible concept-to-tube mappings from database
 * Implements L1 vision: any concept can be assigned to any tube
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { configurationService } from './ConfigurationService';
import { TubeId } from '../interfaces/StitchManagerInterface';

export interface ConceptTubeMapping {
  concept_code: string;
  tube_id: string;
  is_default: boolean;
  priority: number;
}

export interface ConceptMappingServiceInterface {
  /**
   * Get all tubes that a concept can appear in
   */
  getConceptTubes(conceptCode: string): Promise<Set<TubeId>>;
  
  /**
   * Get all concepts that can appear in a tube
   */
  getTubeConcepts(tubeId: TubeId): Promise<string[]>;
  
  /**
   * Check if a concept is allowed in a specific tube
   */
  isConceptAllowedInTube(conceptCode: string, tubeId: TubeId): Promise<boolean>;
  
  /**
   * Get all concept-to-tube mappings
   */
  getAllMappings(): Promise<Map<string, Set<TubeId>>>;
}

export class ConceptMappingService implements ConceptMappingServiceInterface {
  private supabase: SupabaseClient;
  private initialized: boolean = false;
  private mappingsCache: Map<string, Set<TubeId>> | null = null;

  constructor() {
    this.supabase = null as any; // Will be initialized async
  }

  /**
   * Initialize Supabase client
   */
  private async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const config = await configurationService.getConfiguration();
      this.supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
      this.initialized = true;
      console.log('✅ ConceptMappingService: Initialization complete');
    } catch (error) {
      console.error('❌ ConceptMappingService: Initialization failed:', error);
      throw new Error(`CONCEPT_MAPPING_INIT_FAILED - Failed to initialize ConceptMappingService: ${error}`);
    }
  }

  /**
   * Load all mappings from database
   */
  private async loadMappings(): Promise<Map<string, Set<TubeId>>> {
    await this.initialize();

    // Use cache if available
    if (this.mappingsCache) {
      return this.mappingsCache;
    }

    try {
      const { data, error } = await this.supabase
        .from('concept_tube_mappings')
        .select('*')
        .order('concept_code')
        .order('priority', { ascending: false });

      if (error) {
        throw new Error(`DATABASE_ERROR - Failed to fetch concept tube mappings: ${error.message}`);
      }

      // Build the mappings
      const mappings = new Map<string, Set<TubeId>>();
      
      data.forEach((mapping: ConceptTubeMapping) => {
        if (!mappings.has(mapping.concept_code)) {
          mappings.set(mapping.concept_code, new Set());
        }
        mappings.get(mapping.concept_code)!.add(mapping.tube_id as TubeId);
      });

      this.mappingsCache = mappings;
      return mappings;
    } catch (error) {
      console.error('❌ ConceptMappingService loadMappings error:', error);
      // Return empty mapping on error - allows system to continue with defaults
      return new Map();
    }
  }

  /**
   * Get all tubes that a concept can appear in
   */
  public async getConceptTubes(conceptCode: string): Promise<Set<TubeId>> {
    const mappings = await this.loadMappings();
    return mappings.get(conceptCode) || new Set();
  }

  /**
   * Get all concepts that can appear in a tube
   */
  public async getTubeConcepts(tubeId: TubeId): Promise<string[]> {
    const mappings = await this.loadMappings();
    const concepts: string[] = [];
    
    mappings.forEach((tubes, conceptCode) => {
      if (tubes.has(tubeId)) {
        concepts.push(conceptCode);
      }
    });
    
    return concepts;
  }

  /**
   * Check if a concept is allowed in a specific tube
   */
  public async isConceptAllowedInTube(conceptCode: string, tubeId: TubeId): Promise<boolean> {
    const tubes = await this.getConceptTubes(conceptCode);
    return tubes.has(tubeId);
  }

  /**
   * Get all concept-to-tube mappings
   */
  public async getAllMappings(): Promise<Map<string, Set<TubeId>>> {
    return await this.loadMappings();
  }

  /**
   * Clear cache (useful for testing or when mappings change)
   */
  public clearCache(): void {
    this.mappingsCache = null;
  }
}

// Export singleton instance
export const conceptMappingService = new ConceptMappingService();