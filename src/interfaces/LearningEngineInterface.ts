/**
 * LearningEngineInterface.ts
 * Generated from APML Interface Definition
 * Module: LearningEngine
 */

import { FactRepositoryInterface } from './FactRepositoryInterface';
import { QuestionGeneratorInterface } from './QuestionGeneratorInterface';
import { DistractorGeneratorInterface } from './DistractorGeneratorInterface';
import { DistinctionManagerInterface } from './DistinctionManagerInterface';
import { ContentManagerInterface } from './ContentManagerInterface';

/**
 * APML-compliant interface for the LearningEngine service adapter that coordinates distinction-based
 * learning components following the External Service Integration Protocol. Provides unified access to
 * mathematical fact repositories, question generation, distractor generation, and distinction management.
 */
export interface SessionConfiguration {
  /** Maximum questions per session */
  maxQuestions?: number;
  /** Min/max difficulty range */
  difficultyRange?: [number, number];
  /** Specific focus areas for session */
  focusAreas?: string[];
  /** Whether to adjust difficulty based on performance */
  adaptiveDifficulty?: boolean;
}

export interface Question {
  /** Unique question identifier */
  id: string;
  /** Associated mathematical fact ID */
  factId: string;
  /** The question to display */
  questionText: string;
  /** The correct answer */
  correctAnswer: string;
  /** Incorrect answer options */
  distractors: string[];
  /** Distinction boundary level (1-5) */
  boundaryLevel: number;
  /** Question difficulty rating */
  difficulty: number;
  /** Additional question metadata */
  metadata?: Record<string, any>;
}

export interface QuestionRequest {
  difficulty?: number;
  focusArea?: string;
  excludeFactIds?: string[];
}

export interface UserResponse {
  /** Question identifier */
  questionId: string;
  /** User's selected answer */
  selectedAnswer: string;
  /** Response time in milliseconds */
  responseTime: number;
  /** Whether response was correct */
  isCorrect: boolean;
  /** ISO timestamp of response */
  timestamp: string;
}

export interface ResponseFeedback {
  /** Whether response was correct */
  isCorrect: boolean;
  /** The correct answer */
  correctAnswer: string;
  /** Explanation of the answer */
  explanation: string;
  /** Encouraging message for user */
  encouragement: string;
  /** Updated mastery information */
  masteryUpdate: Record<string, any>;
}

export interface UserMasteryState {
  /** User identifier */
  userId: string;
  /** Mastery data by learning path */
  learningPaths: Record<string, any>;
  /** Overall progress percentage */
  overallProgress: number;
  /** Areas of strength */
  strengths: string[];
  /** Areas needing improvement */
  improvementAreas: string[];
  /** ISO timestamp of last update */
  lastUpdated: string;
}

export interface MathematicalFact {
  id: string;
  content: string;
  difficulty: number;
  learningPathId: string;
}

export interface MathematicalFactInput {
  content: string;
  difficulty: number;
  learningPathId: string;
  metadata?: Record<string, any>;
}

export interface FactQuery {
  tags?: string[];
  excludeIds?: string[];
  limit?: number;
}

/**
 * Error codes for LearningEngineInterface
 */
export enum LearningEngineErrorCode {
  LE-001 = 'LE-001',
  LE-002 = 'LE-002',
  LE-003 = 'LE-003',
  LE-004 = 'LE-004',
  LE-005 = 'LE-005',
  LE-006 = 'LE-006',
  LE-007 = 'LE-007',
  LE-008 = 'LE-008',
  LE-009 = 'LE-009',
  LE-010 = 'LE-010',
  LE-011 = 'LE-011',
  LE-012 = 'LE-012',
  LE-013 = 'LE-013',
  LE-014 = 'LE-014',
  LE-015 = 'LE-015',
  LE-016 = 'LE-016',
  LE-017 = 'LE-017',
  LE-018 = 'LE-018',
  LE-019 = 'LE-019',
}

// Export default interface
export default LearningEngineInterface;
