/**
 * Claude Context Service
 * Prepares curriculum context for Claude to understand existing content
 */

import type { StitchEssence, Fact } from '../components/Admin/ClaudeGenerationModal';

export interface ClaudeContext {
  existingStitches: string[];
  existingFacts: {
    operations: string[];
    coverage: Record<string, any>;
  };
  stitchFormat: {
    notation: string;
    examples: string[];
  };
  factFormat: {
    operations: string[];
    structure: string;
  };
  tripleHelixModel: {
    tube1: string;
    tube2: string;
    tube3: string;
  };
  gaps: string[];
}

export function prepareClaudeContext(
  stitches: StitchEssence[],
  facts: Fact[]
): ClaudeContext {
  // Analyze existing stitches
  const existingStitches = stitches.map(stitch => formatStitchForContext(stitch));
  
  // Analyze fact coverage
  const factCoverage = analyzeFacts(facts);
  
  // Identify gaps
  const gaps = identifyGaps(stitches, facts);
  
  return {
    existingStitches,
    existingFacts: {
      operations: Array.from(new Set(facts.map(f => f.operation_type))),
      coverage: factCoverage
    },
    stitchFormat: {
      notation: "Operation [min-max], e.g., 'Double [1-10]', '2x table [1-12]'",
      examples: [
        "Double [1-5]",
        "Half [2-20]",
        "2x table [1-12]",
        "Addition [1-10]",
        "Mixed operations"
      ]
    },
    factFormat: {
      operations: ['double', 'half', 'multiplication', 'addition', 'subtraction', 'division', 'square', 'cube'],
      structure: "{ statement: string, answer: string, operation_type: string, operand1: number, operand2: number, difficulty_level: 1-5 }"
    },
    tripleHelixModel: {
      tube1: "Number Sense (doubles, halves, basic operations)",
      tube2: "Times Tables (systematic multiplication practice)",
      tube3: "Mixed Practice (combination of concepts)"
    },
    gaps
  };
}

function formatStitchForContext(stitch: StitchEssence): string {
  const { conceptType, conceptParams, tubeId } = stitch;
  let display = '';
  
  if (conceptType === 'times_table' && conceptParams.operand && conceptParams.range) {
    display = `${conceptParams.operand}x table [${conceptParams.range[0]}-${conceptParams.range[1]}]`;
  } else if (conceptType === 'double' && conceptParams.range) {
    display = `Double [${conceptParams.range[0]}-${conceptParams.range[1]}]`;
  } else if (conceptType === 'half' && conceptParams.range) {
    display = `Half [${conceptParams.range[0]}-${conceptParams.range[1]}]`;
  } else if (conceptParams.range) {
    display = `${conceptType} [${conceptParams.range[0]}-${conceptParams.range[1]}]`;
  } else {
    display = conceptType;
  }
  
  const tubeName = tubeId === 'tube1' ? 'Number Sense' :
                   tubeId === 'tube2' ? 'Times Tables' :
                   tubeId === 'tube3' ? 'Mixed Practice' : tubeId;
  
  return `${display} (${tubeName})`;
}

function analyzeFacts(facts: Fact[]): Record<string, any> {
  const coverage: Record<string, any> = {};
  
  facts.forEach(fact => {
    const op = fact.operation_type;
    if (!coverage[op]) {
      coverage[op] = {
        count: 0,
        ranges: {},
        operands: new Set()
      };
    }
    
    coverage[op].count++;
    
    if (fact.operand1 !== null) {
      coverage[op].operands.add(fact.operand1);
    }
    
    // Special handling for multiplication to track tables
    if (op === 'multiplication' && fact.operand1 !== null && fact.operand2 !== null) {
      const table = fact.operand1;
      if (!coverage[op].tables) {
        coverage[op].tables = {};
      }
      if (!coverage[op].tables[table]) {
        coverage[op].tables[table] = {
          min: fact.operand2,
          max: fact.operand2
        };
      } else {
        coverage[op].tables[table].min = Math.min(coverage[op].tables[table].min, fact.operand2);
        coverage[op].tables[table].max = Math.max(coverage[op].tables[table].max, fact.operand2);
      }
    }
  });
  
  // Convert sets to arrays for serialization
  Object.keys(coverage).forEach(op => {
    if (coverage[op].operands) {
      coverage[op].operands = Array.from(coverage[op].operands).sort((a, b) => a - b);
    }
  });
  
  return coverage;
}

function identifyGaps(stitches: StitchEssence[], facts: Fact[]): string[] {
  const gaps: string[] = [];
  
  // Check for missing times tables
  const existingTables = new Set<number>();
  stitches.forEach(stitch => {
    if (stitch.conceptType === 'times_table' && stitch.conceptParams.operand) {
      existingTables.add(stitch.conceptParams.operand);
    }
  });
  
  const expectedTables = [2, 3, 4, 5, 6, 7, 8, 9, 10];
  const missingTables = expectedTables.filter(t => !existingTables.has(t));
  
  if (missingTables.length > 0) {
    gaps.push(`Missing times tables: ${missingTables.join(', ')}`);
  }
  
  // Check operation coverage
  const operationCounts: Record<string, number> = {};
  facts.forEach(fact => {
    operationCounts[fact.operation_type] = (operationCounts[fact.operation_type] || 0) + 1;
  });
  
  const expectedOperations = ['addition', 'subtraction', 'multiplication', 'division'];
  expectedOperations.forEach(op => {
    if (!operationCounts[op] || operationCounts[op] < 10) {
      gaps.push(`Limited ${op} practice (${operationCounts[op] || 0} facts)`);
    }
  });
  
  // Check for advanced concepts
  if (!stitches.some(s => s.conceptType === 'square')) {
    gaps.push('No square number practice');
  }
  
  if (!stitches.some(s => s.conceptType === 'division')) {
    gaps.push('No division practice beyond basic facts');
  }
  
  // Check tube balance
  const tubeCounts: Record<string, number> = { tube1: 0, tube2: 0, tube3: 0 };
  stitches.forEach(s => {
    tubeCounts[s.tubeId]++;
  });
  
  if (tubeCounts.tube3 < 3) {
    gaps.push('Limited mixed practice content (tube3)');
  }
  
  return gaps;
}

export function parseClaudeResponse(response: string): {
  stitches: StitchEssence[];
  facts: Fact[];
} {
  // This would parse Claude's response to extract generated content
  // For now, returning empty arrays as this will be implemented with actual Claude integration
  return {
    stitches: [],
    facts: []
  };
}