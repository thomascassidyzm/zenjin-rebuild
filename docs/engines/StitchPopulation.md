# StitchPopulation Engine

**Live Aid Architecture - Content Layer Population System**

Maps mathematical curriculum concepts to specific fact selection criteria, implementing the doubling/halving multiplicative foundation with 90/10 surprise distribution.

## Core Responsibility

Translates abstract curriculum concepts into concrete FactRepository queries following algorithmic specifications from `LIVE_AID_IMPLEMENTATION_ALGORITHMS.apml`.

## Curriculum Foundation

### Tube 1: Doubling/Halving (Multiplicative Base)
- **Easy**: Numbers ending in 0,5 (concepts 0001-0007)
- **Medium**: Numbers ending in 1-4 (concepts 0008-0014)  
- **Hard**: Numbers ending in 6-9 (concepts 0015-0020)

### Tube 2: Backwards Multiplication (Confidence Building)
- **Progression**: 19× → 18× → 17× → ... → 3×
- **Psychology**: "Hard" tables feel easy with binary distinctions

### Tube 3: Division as Algebra (Algebraic Preparation)
- **Format**: "□ × 7 = 35" instead of "35 ÷ 7 = ?"
- **Purpose**: Early algebraic reasoning, inverse operation understanding

## Key Methods

- `populateStitch()` - Single stitch population with concept mapping
- `populateTube()` - Complete tube following progression strategy
- `populateCompleteCurriculum()` - All three tubes with surprise distribution
- `generateSurpriseStitches()` - 90/10 core/surprise implementation

## Integration

Works with:
- **FactRepository** - Source of mathematical facts (~40,000)
- **StitchPreparation** - Next phase in Live Aid pipeline
- **TripleHelixManager** - Tube-based progression coordination

## Performance

- **Fact Selection**: < 50ms per concept query
- **Tube Population**: ~20 stitches per tube
- **Curriculum Load**: Complete population in background
- **Memory**: Efficient concept mapping cache