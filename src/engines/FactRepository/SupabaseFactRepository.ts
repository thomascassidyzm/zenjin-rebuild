/**
 * Supabase implementation of the FactRepository component for Zenjin Maths App
 * This file defines the FactRepository class that retrieves facts from Supabase database
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { configurationService } from '../../services/ConfigurationService';
import { FactRepositoryInterface, MathematicalFact, FactQuery } from './FactRepositoryTypes';

/**
 * Database fact structure (matches our facts table schema)
 */
interface DatabaseFact {
  id: string;
  statement: string;
  answer: string;
  operation_type: string;
  operand1: number | null;
  operand2: number | null;
  difficulty_level: number;
  metadata: any;
}

/**
 * Supabase implementation of the FactRepository that queries facts from database
 */
export class SupabaseFactRepository implements FactRepositoryInterface {
  private supabase: SupabaseClient;
  private initialized: boolean = false;

  /**
   * Creates a new instance of SupabaseFactRepository
   */
  constructor() {
    console.log('🔄 SupabaseFactRepository constructor: Starting initialization...');
    // Initialize Supabase client - will be done async in initialize()
    this.supabase = null as any; // Temporary until initialize() is called
  }

  /**
   * Initialize the Supabase client
   * Must be called before using the repository
   */
  private async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const config = await configurationService.getConfig();
      this.supabase = createClient(config.supabase.url, config.supabase.anonKey);
      this.initialized = true;
      console.log('✅ SupabaseFactRepository: Initialization complete');
    } catch (error) {
      console.error('❌ SupabaseFactRepository: Initialization failed:', error);
      throw new Error(`REPOSITORY_INIT_FAILED - Failed to initialize FactRepository: ${error}`);
    }
  }

  /**
   * Convert database fact to MathematicalFact interface
   */
  private convertToMathematicalFact(dbFact: DatabaseFact): MathematicalFact {
    const operands: number[] = [];
    if (dbFact.operand1 !== null) operands.push(dbFact.operand1);
    if (dbFact.operand2 !== null) operands.push(dbFact.operand2);

    return {
      id: dbFact.id,
      operation: dbFact.operation_type,
      operands,
      result: this.parseResult(dbFact.answer, dbFact.operation_type),
      difficulty: dbFact.difficulty_level / 5.0, // Convert 1-5 scale to 0-1
      tags: dbFact.metadata?.tags || [],
      relatedFactIds: dbFact.metadata?.related_facts || []
    };
  }

  /**
   * Parse the result based on operation type
   */
  private parseResult(answer: string, operationType: string): number {
    // For most operations, result is a number
    const numResult = parseFloat(answer);
    if (!isNaN(numResult)) {
      return numResult;
    }
    
    // Handle special cases if needed
    console.warn(`Could not parse result: ${answer} for operation: ${operationType}`);
    return 0;
  }

  /**
   * Gets a mathematical fact by its identifier
   * @param factId Fact identifier
   * @returns The mathematical fact
   * @throws Error if the fact is not found
   */
  public async getFactById(factId: string): Promise<MathematicalFact> {
    await this.initialize();

    try {
      const { data, error } = await this.supabase
        .from('facts')
        .select('*')
        .eq('id', factId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error(`FACT_NOT_FOUND - The specified fact was not found: ${factId}`);
        }
        throw new Error(`DATABASE_ERROR - Failed to retrieve fact: ${error.message}`);
      }

      return this.convertToMathematicalFact(data);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('FACT_NOT_FOUND')) {
        throw error;
      }
      console.error('❌ SupabaseFactRepository getFactById error:', error);
      throw new Error(`REPOSITORY_ERROR - Failed to get fact by ID: ${error}`);
    }
  }

  /**
   * Queries mathematical facts based on criteria
   * @param query Query criteria
   * @returns Array of matching facts
   */
  public async queryFacts(query: FactQuery = {}): Promise<MathematicalFact[]> {
    await this.initialize();

    try {
      let supabaseQuery = this.supabase.from('facts').select('*');

      // Apply filters based on query criteria
      if (query.operation) {
        supabaseQuery = supabaseQuery.eq('operation_type', query.operation);
      }

      if (query.operands && query.operands.length > 0) {
        if (query.operands.length >= 1 && query.operands[0] !== undefined) {
          supabaseQuery = supabaseQuery.eq('operand1', query.operands[0]);
        }
        if (query.operands.length >= 2 && query.operands[1] !== undefined) {
          supabaseQuery = supabaseQuery.eq('operand2', query.operands[1]);
        }
      }

      if (query.operandRange) {
        supabaseQuery = supabaseQuery
          .gte('operand1', query.operandRange.min)
          .lte('operand1', query.operandRange.max);
      }

      if (query.difficulty) {
        // Convert 0-1 difficulty to 1-5 scale
        const minLevel = Math.ceil(query.difficulty.min * 5);
        const maxLevel = Math.floor(query.difficulty.max * 5);
        supabaseQuery = supabaseQuery
          .gte('difficulty_level', minLevel)
          .lte('difficulty_level', maxLevel);
      }

      if (query.tags && query.tags.length > 0) {
        // Use JSONB contains operator for tags
        query.tags.forEach(tag => {
          supabaseQuery = supabaseQuery.contains('metadata', { tags: [tag] });
        });
      }

      if (query.limit) {
        supabaseQuery = supabaseQuery.limit(query.limit);
      }

      // Order by difficulty level, then by id for consistent results
      supabaseQuery = supabaseQuery.order('difficulty_level').order('id');

      const { data, error } = await supabaseQuery;

      if (error) {
        throw new Error(`DATABASE_ERROR - Failed to query facts: ${error.message}`);
      }

      return data.map(dbFact => this.convertToMathematicalFact(dbFact));
    } catch (error) {
      console.error('❌ SupabaseFactRepository queryFacts error:', error);
      throw new Error(`REPOSITORY_ERROR - Failed to query facts: ${error}`);
    }
  }

  /**
   * Gets all facts for a specific operation
   * @param operation Mathematical operation
   * @returns Array of facts for the operation
   * @throws Error if the operation is invalid
   */
  public async getFactsByOperation(operation: string): Promise<MathematicalFact[]> {
    return this.queryFacts({ operation });
  }

  /**
   * Gets the total count of facts in the repository
   * @param query Optional query criteria
   * @returns Number of facts matching the criteria
   */
  public async getFactCount(query?: FactQuery): Promise<number> {
    await this.initialize();

    try {
      let supabaseQuery = this.supabase.from('facts').select('id', { count: 'exact', head: true });

      // Apply same filters as queryFacts for consistency
      if (query?.operation) {
        supabaseQuery = supabaseQuery.eq('operation_type', query.operation);
      }

      if (query?.operands && query.operands.length > 0) {
        if (query.operands.length >= 1 && query.operands[0] !== undefined) {
          supabaseQuery = supabaseQuery.eq('operand1', query.operands[0]);
        }
        if (query.operands.length >= 2 && query.operands[1] !== undefined) {
          supabaseQuery = supabaseQuery.eq('operand2', query.operands[1]);
        }
      }

      if (query?.operandRange) {
        supabaseQuery = supabaseQuery
          .gte('operand1', query.operandRange.min)
          .lte('operand1', query.operandRange.max);
      }

      if (query?.difficulty) {
        const minLevel = Math.ceil(query.difficulty.min * 5);
        const maxLevel = Math.floor(query.difficulty.max * 5);
        supabaseQuery = supabaseQuery
          .gte('difficulty_level', minLevel)
          .lte('difficulty_level', maxLevel);
      }

      if (query?.tags && query.tags.length > 0) {
        query.tags.forEach(tag => {
          supabaseQuery = supabaseQuery.contains('metadata', { tags: [tag] });
        });
      }

      const { count, error } = await supabaseQuery;

      if (error) {
        throw new Error(`DATABASE_ERROR - Failed to count facts: ${error.message}`);
      }

      return count || 0;
    } catch (error) {
      console.error('❌ SupabaseFactRepository getFactCount error:', error);
      throw new Error(`REPOSITORY_ERROR - Failed to count facts: ${error}`);
    }
  }

  /**
   * Check if the repository has a specific fact
   * @param factId Fact identifier
   * @returns True if fact exists, false otherwise
   */
  public async factExists(factId: string): Promise<boolean> {
    try {
      await this.getFactById(factId);
      return true;
    } catch (error) {
      if (error instanceof Error && error.message.includes('FACT_NOT_FOUND')) {
        return false;
      }
      throw error; // Re-throw unexpected errors
    }
  }
}

// Export the class as the default FactRepository implementation
export default SupabaseFactRepository;