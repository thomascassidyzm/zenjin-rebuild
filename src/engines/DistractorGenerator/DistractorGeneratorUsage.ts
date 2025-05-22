/**
 * Example usage of the DistractorGenerator component
 * 
 * This file demonstrates how to use the DistractorGenerator to generate distractors
 * at different boundary levels for mathematical facts.
 */

import { DistractorGenerator } from './DistractorGenerator';

// Create an instance of the DistractorGenerator
const distractorGenerator = new DistractorGenerator();

// Example 1: Generate a distractor for multiplication fact at boundary level 5 (Near Miss)
console.log("\n=== Example 1: Generate a Near Miss Distractor (Level 5) ===");
const request1 = {
  factId: 'mult-7-8',
  boundaryLevel: 5,
  correctAnswer: '56'
};

const distractor1 = distractorGenerator.generateDistractor(request1);

console.log(`Distractor: ${distractor1.value}`);
console.log(`Boundary Level: ${distractor1.boundaryLevel}`);
console.log(`Explanation: ${distractor1.explanation}`);
console.log(`Difficulty: ${distractor1.difficulty}`);

// Example 2: Generate multiple distractors for addition fact at boundary level 3 (Operation)
console.log("\n=== Example 2: Generate Multiple Operation Distractors (Level 3) ===");
const request2 = {
  factId: 'add-24-18',
  boundaryLevel: 3,
  correctAnswer: '42',
  count: 3
};

const distractors2 = distractorGenerator.generateMultipleDistractors(request2);

distractors2.forEach((d, index) => {
  console.log(`\nDistractor ${index + 1}: ${d.value}`);
  console.log(`Explanation: ${d.explanation}`);
  console.log(`Difficulty: ${d.difficulty}`);
});

// Example 3: Get explanation for a specific distractor
console.log("\n=== Example 3: Get Explanation for a Specific Distractor ===");
const factId3 = 'mult-7-8';
const distractor3 = '54';
const boundaryLevel3 = 5;

const explanation3 = distractorGenerator.getDistractorExplanation(
  factId3,
  distractor3,
  boundaryLevel3
);

console.log(`Explanation: ${explanation3}`);

// Example 4: Validate a distractor
console.log("\n=== Example 4: Validate a Distractor ===");
const factId4 = 'mult-7-8';
const distractor4 = '54';
const boundaryLevel4 = 5;
const correctAnswer4 = '56';

const validationResult = distractorGenerator.validateDistractor(
  factId4,
  distractor4,
  boundaryLevel4,
  correctAnswer4
);

console.log(`Is valid: ${validationResult.isValid}`);
console.log(`Reason: ${validationResult.reason}`);

// Example 5: Generate distractors for all boundary levels for a specific fact
console.log("\n=== Example 5: Generate Distractors for All Boundary Levels ===");
const factId5 = 'mult-7-8';
const correctAnswer5 = '56';

for (let level = 1; level <= 5; level++) {
  const request = {
    factId: factId5,
    boundaryLevel: level,
    correctAnswer: correctAnswer5
  };
  
  const distractor = distractorGenerator.generateDistractor(request);
  
  console.log(`\nBoundary Level ${level}:`);
  console.log(`Distractor: ${distractor.value}`);
  console.log(`Explanation: ${distractor.explanation}`);
}

// Example 6: Generate distractors for different operation types
console.log("\n=== Example 6: Generate Distractors for Different Operation Types ===");

// Addition fact
const addRequest = {
  factId: 'add-15-7',
  boundaryLevel: 3,
  correctAnswer: '22'
};

const addDistractor = distractorGenerator.generateDistractor(addRequest);
console.log(`\nAddition Fact (${addRequest.factId}):`);
console.log(`Distractor: ${addDistractor.value}`);
console.log(`Explanation: ${addDistractor.explanation}`);

// Subtraction fact
const subRequest = {
  factId: 'sub-15-7',
  boundaryLevel: 3,
  correctAnswer: '8'
};

const subDistractor = distractorGenerator.generateDistractor(subRequest);
console.log(`\nSubtraction Fact (${subRequest.factId}):`);
console.log(`Distractor: ${subDistractor.value}`);
console.log(`Explanation: ${subDistractor.explanation}`);

// Multiplication fact
const multRequest = {
  factId: 'mult-15-7',
  boundaryLevel: 3,
  correctAnswer: '105'
};

const multDistractor = distractorGenerator.generateDistractor(multRequest);
console.log(`\nMultiplication Fact (${multRequest.factId}):`);
console.log(`Distractor: ${multDistractor.value}`);
console.log(`Explanation: ${multDistractor.explanation}`);

// Division fact
const divRequest = {
  factId: 'div-15-3',
  boundaryLevel: 3,
  correctAnswer: '5'
};

const divDistractor = distractorGenerator.generateDistractor(divRequest);
console.log(`\nDivision Fact (${divRequest.factId}):`);
console.log(`Distractor: ${divDistractor.value}`);
console.log(`Explanation: ${divDistractor.explanation}`);
