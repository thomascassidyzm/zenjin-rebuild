/**
 * Curriculum Mapper Service - Triple Helix Architecture
 * 
 * Organizes learning content into the 3-tube Triple Helix system.
 * Tubes rotate 1→2→3→1→2→3... with stitches loaded by concept groupings.
 */

import { StitchLibrary, Stitch } from '../engines/StitchLibrary';
import { FactRepository } from '../engines/FactRepository/FactRepository';

export interface StitchGrouping {
  groupId: string;
  groupName: string;
  concept: string;
  stitches: Stitch[];
  targetTube: number; // 1, 2, or 3
  position: number; // Order within the tube
  prerequisites?: string[]; // Other group IDs that should be completed first
}

export interface TubeContents {
  tubeNumber: number;
  stitchGroupings: StitchGrouping[];
}

export interface UserTripleHelixPosition {
  currentTube: number; // 1, 2, or 3
  tubePositions: {
    tube1Position: number;
    tube2Position: number; 
    tube3Position: number;
  };
  completedGroupings: string[]; // Array of grouping IDs
  currentStitchInGroup?: string; // Current stitch ID within active grouping
  rotationCount: number; // How many times we've rotated through tubes
}

export class CurriculumMapper {
  private stitchLibrary: StitchLibrary;
  private factRepository: FactRepository;
  private stitchGroupings: StitchGrouping[] = [];

  constructor(factRepository?: FactRepository) {
    if (!factRepository) {
      console.warn('⚠️ CurriculumMapper: No FactRepository injected, creating fallback instance');
      factRepository = new FactRepository();
    }
    this.factRepository = factRepository;
    this.stitchLibrary = new StitchLibrary(this.factRepository);
    this.initializeStitchGroupings();
  }

  /**
   * Initialize all stitch groupings and assign them to tubes
   */
  private initializeStitchGroupings(): void {
    const additionStitches = this.stitchLibrary.createAdditionStitches();
    const multiplicationStitches = this.stitchLibrary.createMultiplicationStitches();
    const subtractionStitches = this.stitchLibrary.createSubtractionStitches();
    const divisionStitches = this.stitchLibrary.createDivisionStitches();

    this.stitchGroupings = [
      // Tube 1: Foundational concepts
      {
        groupId: 'basic-addition',
        groupName: 'Basic Addition',
        concept: 'Number bonds and basic addition facts',
        stitches: additionStitches.slice(0, 2), // add-to-5, add-to-10
        targetTube: 1,
        position: 1
      },
      {
        groupId: 'easy-multiplication',
        groupName: 'Easy Times Tables',
        concept: 'Simple multiplication patterns',
        stitches: multiplicationStitches.slice(0, 3), // 2x, 5x, 10x
        targetTube: 1,
        position: 2,
        prerequisites: ['basic-addition']
      },
      {
        groupId: 'basic-subtraction',
        groupName: 'Basic Subtraction',
        concept: 'Subtraction as inverse of addition',
        stitches: subtractionStitches.slice(0, 2),
        targetTube: 1,
        position: 3,
        prerequisites: ['basic-addition']
      },

      // Tube 2: Intermediate concepts
      {
        groupId: 'advanced-addition',
        groupName: 'Advanced Addition',
        concept: 'Bridging 10 and addition to 20',
        stitches: additionStitches.slice(2), // doubling, near-10, to-20
        targetTube: 2,
        position: 1,
        prerequisites: ['basic-addition']
      },
      {
        groupId: 'medium-multiplication',
        groupName: 'Medium Times Tables',
        concept: 'Moderately difficult multiplication',
        stitches: multiplicationStitches.slice(3, 6), // 3x, 4x, 6x
        targetTube: 2,
        position: 2,
        prerequisites: ['easy-multiplication']
      },
      {
        groupId: 'basic-division',
        groupName: 'Basic Division',
        concept: 'Division as inverse of multiplication',
        stitches: divisionStitches.slice(0, 3), // Easy division facts
        targetTube: 2,
        position: 3,
        prerequisites: ['easy-multiplication']
      },

      // Tube 3: Advanced concepts
      {
        groupId: 'hard-multiplication',
        groupName: 'Challenging Times Tables',
        concept: 'Difficult multiplication facts',
        stitches: multiplicationStitches.slice(6), // 7x, 8x, 9x
        targetTube: 3,
        position: 1,
        prerequisites: ['medium-multiplication']
      },
      {
        groupId: 'advanced-subtraction',
        groupName: 'Advanced Subtraction',
        concept: 'Complex subtraction patterns',
        stitches: subtractionStitches.slice(2),
        targetTube: 3,
        position: 2,
        prerequisites: ['basic-subtraction', 'advanced-addition']
      },
      {
        groupId: 'advanced-division',
        groupName: 'Advanced Division',
        concept: 'Complex division facts',
        stitches: divisionStitches.slice(3),
        targetTube: 3,
        position: 3,
        prerequisites: ['basic-division', 'hard-multiplication']
      }
    ];
  }

  /**
   * Get all stitch groupings for a specific tube
   */
  getTubeContents(tubeNumber: number): TubeContents {
    const groupings = this.stitchGroupings
      .filter(group => group.targetTube === tubeNumber)
      .sort((a, b) => a.position - b.position);

    return {
      tubeNumber,
      stitchGroupings: groupings
    };
  }

  /**
   * Get all three tubes with their contents
   */
  getAllTubeContents(): TubeContents[] {
    return [1, 2, 3].map(tubeNumber => this.getTubeContents(tubeNumber));
  }

  /**
   * Get default starting position for new users
   */
  getDefaultStartingPosition(): UserTripleHelixPosition {
    return {
      currentTube: 1,
      tubePositions: {
        tube1Position: 1, // Start at first grouping in tube 1
        tube2Position: 1,
        tube3Position: 1
      },
      completedGroupings: [],
      rotationCount: 0
    };
  }

  /**
   * Get the current active stitch grouping for a user
   */
  getCurrentStitchGrouping(userPosition: UserTripleHelixPosition): StitchGrouping | null {
    const tubeContents = this.getTubeContents(userPosition.currentTube);
    const currentPosition = this.getCurrentTubePosition(userPosition);
    
    // Find grouping at current position that user hasn't completed
    const availableGroupings = tubeContents.stitchGroupings.filter(group => 
      !userPosition.completedGroupings.includes(group.groupId) &&
      this.arePrerequisitesMet(group, userPosition.completedGroupings)
    );

    if (availableGroupings.length === 0) {
      return null; // All groupings in this tube completed or locked
    }

    // Return the first available grouping at or after current position
    return availableGroupings.find(group => group.position >= currentPosition) || availableGroupings[0];
  }

  /**
   * Get the current stitch to work on
   */
  getCurrentStitch(userPosition: UserTripleHelixPosition): Stitch | null {
    const currentGrouping = this.getCurrentStitchGrouping(userPosition);
    if (!currentGrouping) return null;

    // If user has a specific stitch position within the grouping
    if (userPosition.currentStitchInGroup) {
      const stitch = currentGrouping.stitches.find(s => s.id === userPosition.currentStitchInGroup);
      if (stitch) return stitch;
    }

    // Otherwise return first stitch in the grouping
    return currentGrouping.stitches[0] || null;
  }

  /**
   * Rotate to the next tube (1→2→3→1...)
   */
  rotateToNextTube(userPosition: UserTripleHelixPosition): UserTripleHelixPosition {
    const nextTube = (userPosition.currentTube % 3) + 1;
    
    return {
      ...userPosition,
      currentTube: nextTube,
      rotationCount: userPosition.rotationCount + 1
    };
  }

  /**
   * Mark a stitch grouping as completed
   */
  completeStitchGrouping(userPosition: UserTripleHelixPosition, groupingId: string): UserTripleHelixPosition {
    const updatedCompletedGroupings = [...userPosition.completedGroupings];
    if (!updatedCompletedGroupings.includes(groupingId)) {
      updatedCompletedGroupings.push(groupingId);
    }

    // Advance position in current tube
    const updatedTubePositions = { ...userPosition.tubePositions };
    const currentTubePositionKey = `tube${userPosition.currentTube}Position` as keyof typeof updatedTubePositions;
    updatedTubePositions[currentTubePositionKey]++;

    return {
      ...userPosition,
      completedGroupings: updatedCompletedGroupings,
      tubePositions: updatedTubePositions,
      currentStitchInGroup: undefined // Reset stitch position within grouping
    };
  }

  /**
   * Update position within a stitch grouping
   */
  updateStitchPosition(userPosition: UserTripleHelixPosition, stitchId: string): UserTripleHelixPosition {
    return {
      ...userPosition,
      currentStitchInGroup: stitchId
    };
  }

  /**
   * Check if prerequisites for a grouping are met
   */
  private arePrerequisitesMet(grouping: StitchGrouping, completedGroupings: string[]): boolean {
    if (!grouping.prerequisites) return true;
    
    return grouping.prerequisites.every(prereq => completedGroupings.includes(prereq));
  }

  /**
   * Get current position within the active tube
   */
  private getCurrentTubePosition(userPosition: UserTripleHelixPosition): number {
    switch (userPosition.currentTube) {
      case 1: return userPosition.tubePositions.tube1Position;
      case 2: return userPosition.tubePositions.tube2Position;
      case 3: return userPosition.tubePositions.tube3Position;
      default: return 1;
    }
  }

  /**
   * Get progress summary across all tubes
   */
  getProgressSummary(userPosition: UserTripleHelixPosition): {
    totalGroupings: number;
    completedGroupings: number;
    progressPercentage: number;
    currentTube: number;
    rotationCount: number;
  } {
    const totalGroupings = this.stitchGroupings.length;
    const completedCount = userPosition.completedGroupings.length;
    
    return {
      totalGroupings,
      completedGroupings: completedCount,
      progressPercentage: Math.round((completedCount / totalGroupings) * 100),
      currentTube: userPosition.currentTube,
      rotationCount: userPosition.rotationCount
    };
  }
}