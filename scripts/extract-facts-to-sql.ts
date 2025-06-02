/**
 * Script to extract facts from FactRepository and generate SQL INSERT statements
 * This ensures we have exactly the same facts as the programmatic implementation
 */

import { FactRepository } from '../src/engines/FactRepository/FactRepository';
import { MathematicalFact } from '../src/engines/FactRepository/FactRepositoryTypes';
import * as fs from 'fs';
import * as path from 'path';

// Initialize the repository to get all facts
const repository = new FactRepository();
const allFacts = repository.queryFacts({});

console.log(`Found ${allFacts.length} facts in FactRepository`);

// Helper to escape SQL strings
function escapeSql(str: string): string {
  return str.replace(/'/g, "''");
}

// Helper to format operands for fact ID
function getOperandsFromId(factId: string): { operand1: number | null, operand2: number | null } {
  const parts = factId.split('-');
  if (parts.length === 3) {
    return {
      operand1: parseInt(parts[1], 10) || null,
      operand2: parseInt(parts[2], 10) || null
    };
  }
  return { operand1: null, operand2: null };
}

// Helper to generate statement text from fact
function generateStatement(fact: MathematicalFact): string {
  const [op1, op2] = fact.operands;
  switch (fact.operation) {
    case 'multiplication':
      return `${op1} × ${op2}`;
    case 'addition':
      return `${op1} + ${op2}`;
    case 'subtraction':
      return `${op1} - ${op2}`;
    case 'division':
      return `${op1} ÷ ${op2}`;
    default:
      return '';
  }
}

// Generate SQL statements
const sqlStatements: string[] = [
  '-- Facts extracted from FactRepository implementation',
  '-- This ensures exact match with programmatic generation',
  '',
  '-- Clear existing facts',
  'TRUNCATE TABLE facts CASCADE;',
  '',
  '-- Insert all facts',
  'INSERT INTO facts (id, statement, answer, operation_type, operand1, operand2, difficulty_level, metadata) VALUES'
];

const valueStatements = allFacts.map((fact, index) => {
  const { operand1, operand2 } = getOperandsFromId(fact.id);
  const statement = generateStatement(fact);
  const difficulty = Math.round((fact.difficulty || 0.5) * 5); // Convert 0-1 to 1-5
  
  // Build metadata object
  const metadata: any = {};
  if (fact.tags && fact.tags.length > 0) {
    metadata.tags = fact.tags;
  }
  if (fact.relatedFactIds && fact.relatedFactIds.length > 0) {
    metadata.relatedFactIds = fact.relatedFactIds;
  }
  
  const metadataJson = Object.keys(metadata).length > 0 
    ? `'${JSON.stringify(metadata).replace(/'/g, "''")}'::jsonb`
    : "'{}'::jsonb";
  
  const operand1Val = operand1 !== null ? operand1 : 'NULL';
  const operand2Val = operand2 !== null ? operand2 : 'NULL';
  
  const isLast = index === allFacts.length - 1;
  return `  ('${escapeSql(fact.id)}', '${escapeSql(statement)}', '${escapeSql(fact.result.toString())}', '${fact.operation}', ${operand1Val}, ${operand2Val}, ${difficulty}, ${metadataJson})${isLast ? ';' : ','}`;
});

sqlStatements.push(...valueStatements);

// Add summary
sqlStatements.push('');
sqlStatements.push('-- Summary of imported facts');
sqlStatements.push(`SELECT 'Imported ' || COUNT(*) || ' facts from FactRepository' AS status FROM facts;`);
sqlStatements.push('');
sqlStatements.push('-- Fact counts by operation');
sqlStatements.push('SELECT operation_type, COUNT(*) as count FROM facts GROUP BY operation_type ORDER BY operation_type;');

// Write to file
const outputPath = path.join(__dirname, '..', 'database-facts-from-repository.sql');
fs.writeFileSync(outputPath, sqlStatements.join('\n'));

console.log(`SQL file generated: ${outputPath}`);

// Print summary
const operationCounts = allFacts.reduce((acc, fact) => {
  acc[fact.operation] = (acc[fact.operation] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

console.log('\nFact counts by operation:');
Object.entries(operationCounts).forEach(([op, count]) => {
  console.log(`  ${op}: ${count}`);
});

console.log(`\nTotal facts: ${allFacts.length}`);