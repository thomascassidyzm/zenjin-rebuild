# StitchPreparation Engine

**Live Aid Architecture - Background Assembly System**

Handles background assembly of complete, ready-to-stream stitch content with boundary-appropriate distractors and optimized question shuffling.

## Core Responsibility

Transforms fact selections into complete ReadyStitch objects following the 7-step background assembly pipeline from `LIVE_AID_IMPLEMENTATION_ALGORITHMS.apml`.

## 7-Step Assembly Pipeline

1. **FACT SELECTION PHASE** - Query FactRepository with concept criteria
2. **BOUNDARY LEVEL ASSESSMENT** - Get user's current distinction boundary
3. **QUESTION FORMATTING PHASE** - Apply minimal reading paradigms  
4. **DISTRACTOR GENERATION PHASE** - Create boundary-appropriate wrong answers
5. **QUESTION ASSEMBLY PHASE** - Combine into complete ReadyQuestion objects
6. **SHUFFLE PHASE** - Quality randomization with adjacency validation
7. **READY STITCH ASSEMBLY** - Package 20 questions into ReadyStitch

## Boundary-Appropriate Distractors

- **Level 1 (Beginner)**: ±1-3 from correct answer
- **Level 2**: ±2-5, operation confusion (addition instead of multiplication)
- **Level 3**: Common mistake patterns (1.5x instead of 2x for doubling)
- **Level 4**: Off-by-one table errors, careful calculation required
- **Level 5 (Advanced)**: Sophisticated near-misses, percentage variances

## Quality Assurance

- **Shuffle Validation**: No adjacent questions with similar answers
- **Distractor Quality**: Plausible but clearly incorrect answers
- **Minimal Reading**: "Double 13", "19 × 4", "□ × 7 = 35"
- **Performance**: < 2 seconds for complete stitch assembly

## Integration

Works with:
- **StitchPopulation** - Receives concept mappings and fact selections
- **DistinctionManager** - Gets user boundary levels for appropriate difficulty
- **DistractorGenerator** - Creates contextually appropriate wrong answers
- **StitchCache** - Delivers ReadyStitch objects for instant streaming

## Performance Targets

- **Assembly Time**: < 150ms per question
- **Quality Score**: > 0.8 for distractor appropriateness
- **Cache Readiness**: > 88% of stitches ready when needed
- **Background Success**: > 98% preparation completion rate