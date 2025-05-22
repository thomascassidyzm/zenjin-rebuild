/**
 * FactRepository Component Exports
 * 
 * This file exports the FactRepository component and its types
 * for use by other components in the application.
 */

export { FactRepository } from './FactRepository';
export { groupFactsByType } from './FactRepositoryUtils';
export type {
  FactRepositoryInterface,
  MathematicalFact,
  FactQuery
} from './FactRepositoryTypes';
export {
  MathOperation,
  DifficultyLevel,
  FactRepositoryErrorCode
} from './FactRepositoryTypes';