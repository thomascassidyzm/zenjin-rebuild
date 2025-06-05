# Lazy Loading Integration Brief

## Overview

The new `LazyFactRepository` is designed to work seamlessly with the LiveAidManager's rotating stage model, loading only what's needed when it's needed.

## Key Advantages

1. **Memory Efficiency**: Only ~20-50 facts in memory at a time (vs thousands)
2. **Fast Startup**: No bulk loading on app initialization
3. **Perfect Timing**: Leverages the rotating stage model for background loading
4. **Database-Driven**: Always fresh from backend, no stale hardcoded data

## Integration with LiveAidManager

### The Three-Stage Model
```
[PLAYING] → [READY] → [BUILDING]
    ↑                       ↓
    └───────────────────────┘
```

### How It Works

1. **PLAYING Stage** (Stage 0)
   - Uses `currentStitchFacts` cache
   - ~20 facts in memory for active questions
   - No loading happening - just gameplay

2. **READY Stage** (Stage 1)
   - Already has `nextStitchFacts` loaded
   - Waiting to be promoted to PLAYING
   - No loading needed - facts pre-loaded

3. **BUILDING Stage** (Stage 2)
   - This is where the magic happens!
   - Calls `lazyFactRepo.preloadNextStitch()`
   - Loads facts for next stitch while player is busy
   - Plenty of time (typically 3-5 minutes per stitch)

## Implementation Changes Needed

### 1. Update LiveAidManager

```typescript
// In LiveAidManager's tube rotation logic
private async handleTubeRotation() {
  const tubes = this.getTubes();
  
  // Rotate stages
  tubes[0].stage = 'READY';      // Was PLAYING
  tubes[1].stage = 'BUILDING';    // Was READY  
  tubes[2].stage = 'PLAYING';     // Was BUILDING
  
  // Promote facts for new PLAYING tube
  this.factRepository.promoteNextStitch();
  
  // Start loading facts for new BUILDING tube
  const buildingTube = tubes[1];
  const nextStitch = buildingTube.currentStitch;
  
  if (nextStitch) {
    // Load facts in background for next rotation
    this.factRepository.preloadNextStitch(
      nextStitch.id,
      nextStitch.conceptType,
      nextStitch.conceptParams
    );
  }
}
```

### 2. Update Service Container

```typescript
// In AppServiceContainer.ts
const factRepository = LazyFactRepository.getInstance();
// No need to wait for initialization!
container.register('FactRepository', factRepository);
```

### 3. Update Question Generation

```typescript
// In QuestionGenerationService
public async generateQuestions(stitchId: string, count: number) {
  // Facts are already loaded for current stitch
  const facts = this.factRepository.queryFacts({
    limit: count
  });
  
  // Generate questions from loaded facts
  return facts.map(fact => this.createQuestion(fact));
}
```

## Migration Path

1. **Phase 1**: Add LazyFactRepository alongside existing FactRepository
2. **Phase 2**: Update LiveAidManager to use lazy loading for new sessions
3. **Phase 3**: Remove old FactRepository once stable

## Performance Expectations

- **Startup Time**: Near instant (no bulk loading)
- **Memory Usage**: ~95% reduction (50 facts vs 1000+ facts)
- **Loading Time**: ~100-200ms per stitch (during BUILDING phase)
- **User Experience**: Seamless - loading happens in background

## Error Handling

If fact loading fails during BUILDING phase:
1. Log error but don't crash
2. Retry once
3. If still failing, use minimal fallback facts
4. Alert admin dashboard of issue

## Monitoring

Track these metrics:
- Facts loaded per stitch
- Loading time per stitch  
- Cache hit/miss rates
- Memory usage over time
- Backend API response times

## Future Enhancements

1. **Predictive Loading**: Load facts for likely next paths
2. **Fact Pooling**: Reuse common facts across stitches
3. **Offline Support**: Cache recently used facts locally
4. **Smart Eviction**: Remove least-used facts when memory constrained