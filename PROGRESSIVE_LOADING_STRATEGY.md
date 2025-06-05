# Progressive Loading Strategy for Zenjin Maths

## Overview

Smart prefetch strategy that ensures instant playability while progressively loading content for offline resilience.

## Prefetch Priority Levels

### Priority 1: LIVE Stitch (Immediate Play) 🎮
**What**: Currently playing stitch
**Needs**: Recipe + Facts + Generated Questions
**When**: On app start or stitch rotation
```typescript
{
  stitch: tubes[0].stitches[0],  // Position 1 of PLAYING tube
  recipe: ✅ loaded,
  facts: ✅ loaded (20 facts),
  questions: ✅ generated (20 questions),
  status: "READY_TO_PLAY"
}
```

### Priority 2: READY Stitch (Next Up) ⏭️
**What**: Next stitch to be played
**Needs**: Recipe + Facts + Pre-generated Questions
**When**: While player is playing current stitch
```typescript
{
  stitch: tubes[1].stitches[0],  // Position 1 of READY tube
  recipe: ✅ loaded,
  facts: ✅ loaded (20 facts),
  questions: ✅ pre-generated (20 questions),
  status: "READY_FOR_ROTATION"
}
```

### Priority 3: PREPARING Stitch (Building) 🔨
**What**: Stitch being prepared for future
**Needs**: Recipe + Facts, generate questions during play
**When**: During gameplay of current stitch
```typescript
{
  stitch: tubes[2].stitches[0],  // Position 1 of BUILDING tube
  recipe: ✅ loaded,
  facts: ✅ loading/loaded,
  questions: ⏳ generate during play,
  status: "PREPARING"
}
```

### Priority 4: Buffer Facts (First 10 per tube) 📦
**What**: Facts for next 30 stitches (10 per tube)
**Needs**: Just the facts, no questions yet
**When**: After priorities 1-3 complete
```typescript
{
  stitches: [
    ...tubes[0].stitches.slice(1, 11),  // Positions 2-11 of each tube
    ...tubes[1].stitches.slice(1, 11),
    ...tubes[2].stitches.slice(1, 11)
  ],
  recipes: ❌ not yet,
  facts: ✅ downloading,
  questions: ❌ not yet,
  purpose: "Offline buffer"
}
```

### Priority 5: Buffer Recipes (First 30 stitches) 📋
**What**: Recipe JSON for first 30 stitches
**Needs**: Just recipes (tiny ~1KB each)
**When**: After facts are cached
```typescript
{
  stitches: first_30_stitches,
  recipes: ✅ downloading (30KB total),
  facts: ✅ already cached,
  questions: ❌ generate on-demand,
  purpose: "Enable offline question generation"
}
```

## Implementation Architecture

### 1. PrefetchManager Service

```typescript
class PrefetchManager {
  private loadingQueue: PrefetchTask[] = [];
  private loadedResources: Map<string, LoadedResource> = new Map();
  
  async initializeForPlay() {
    // Priority 1: LIVE stitch
    const liveStitch = this.getLiveStitch();
    await this.loadStitchComplete(liveStitch, { generateQuestions: true });
    
    // Start background loading
    this.startBackgroundPrefetch();
  }
  
  private async startBackgroundPrefetch() {
    // Priority 2: READY stitch
    this.queueTask({
      priority: 2,
      task: () => this.loadReadyStitch()
    });
    
    // Priority 3: PREPARING stitch
    this.queueTask({
      priority: 3,
      task: () => this.loadPreparingStitch()
    });
    
    // Priority 4: Buffer facts
    this.queueTask({
      priority: 4,
      task: () => this.loadBufferFacts()
    });
    
    // Priority 5: Buffer recipes
    this.queueTask({
      priority: 5,
      task: () => this.loadBufferRecipes()
    });
    
    // Process queue
    this.processQueue();
  }
}
```

### 2. Resource Loading Methods

```typescript
// Load complete stitch (recipe + facts + questions)
async loadStitchComplete(stitchId: string, options: LoadOptions) {
  // 1. Load recipe
  const recipe = await this.loadRecipe(stitchId);
  
  // 2. Extract fact IDs from recipe
  const factIds = this.extractFactIds(recipe);
  
  // 3. Load facts
  const facts = await this.loadFacts(factIds);
  
  // 4. Generate questions if requested
  if (options.generateQuestions) {
    const questions = await this.generateQuestions(recipe, facts);
    this.cacheQuestions(stitchId, questions);
  }
  
  return { recipe, facts, questions };
}

// Extract fact IDs from recipe
extractFactIds(recipe: StitchRecipe): string[] {
  const { conceptType, conceptParams } = recipe;
  
  switch (conceptType) {
    case 'addition':
      const { operand1Range, operand2Range } = conceptParams;
      return generateAdditionFactIds(operand1Range, operand2Range);
      
    case 'multiplication':
      return generateMultiplicationFactIds(conceptParams);
      
    // ... other concept types
  }
}
```

### 3. Caching Strategy

```typescript
class OfflineCache {
  private cache: {
    recipes: Map<string, StitchRecipe>;
    facts: Map<string, MathematicalFact>;
    questions: Map<string, Question[]>;
  };
  
  // Cache with TTL and size limits
  async cacheResource(type: 'recipe' | 'fact' | 'question', id: string, data: any) {
    const cacheEntry = {
      data,
      timestamp: Date.now(),
      accessCount: 0
    };
    
    this.cache[type].set(id, cacheEntry);
    
    // Evict old entries if cache too large
    if (this.cache[type].size > this.maxSize[type]) {
      this.evictLRU(type);
    }
  }
  
  // Smart eviction - keep high priority items
  evictLRU(type: string) {
    const entries = Array.from(this.cache[type].entries());
    entries.sort((a, b) => {
      // Keep items for current 30 stitches
      if (this.isHighPriority(a[0])) return -1;
      if (this.isHighPriority(b[0])) return 1;
      
      // Otherwise evict least recently used
      return a[1].accessCount - b[1].accessCount;
    });
    
    // Remove lowest priority
    const toRemove = entries.slice(this.maxSize[type]);
    toRemove.forEach(([id]) => this.cache[type].delete(id));
  }
}
```

### 4. Network Optimization

```typescript
class BatchLoader {
  // Batch fact requests for efficiency
  async loadFactsBatch(factIds: string[]): Promise<Map<string, Fact>> {
    // Split into chunks of 50 facts
    const chunks = chunk(factIds, 50);
    
    const results = await Promise.all(
      chunks.map(chunk => 
        fetch('/api/admin/facts/batch', {
          method: 'POST',
          body: JSON.stringify({ ids: chunk })
        })
      )
    );
    
    return new Map(results.flat().map(f => [f.id, f]));
  }
  
  // Parallel recipe loading
  async loadRecipesBatch(stitchIds: string[]): Promise<Map<string, Recipe>> {
    const results = await Promise.all(
      stitchIds.map(id => 
        this.loadRecipe(id).catch(() => null)
      )
    );
    
    return new Map(
      results
        .filter(r => r !== null)
        .map(r => [r.id, r])
    );
  }
}
```

### 5. Integration with LiveAidManager

```typescript
class LiveAidManager {
  private prefetchManager: PrefetchManager;
  
  async handleRotation() {
    // Rotate tubes
    this.rotateTubes();
    
    // Ensure READY stitch is fully loaded
    const readyStitch = this.tubes[1].stitches[0];
    if (!this.prefetchManager.isFullyLoaded(readyStitch.id)) {
      console.warn('Ready stitch not pre-loaded, loading now...');
      await this.prefetchManager.loadStitchComplete(readyStitch.id, {
        generateQuestions: true
      });
    }
    
    // Start prefetching new PREPARING stitch
    const preparingStitch = this.tubes[2].stitches[0];
    this.prefetchManager.queueTask({
      priority: 3,
      task: () => this.prefetchManager.loadStitchComplete(preparingStitch.id)
    });
  }
}
```

## Benefits

### 1. **Instant Play**
- LIVE stitch always has questions ready
- Zero loading time when starting

### 2. **Smooth Rotations**
- READY stitch pre-generated during previous play
- No wait between stitches

### 3. **Offline Resilience**
- 30 stitches buffered (recipes + facts)
- Can generate questions offline for ~2 hours of play

### 4. **Efficient Loading**
- Progressive loading based on priority
- Batch requests for efficiency
- Smart caching with LRU eviction

### 5. **Minimal Memory**
- Only keep what's needed in memory
- Cache to disk for offline use
- Smart eviction of old data

## Monitoring

Track these metrics:
- Time to first question
- Rotation wait time
- Cache hit rates
- Prefetch completion rates
- Offline playability duration

## Edge Cases

1. **Slow Network**: Priorities ensure core gameplay unaffected
2. **App Backgrounded**: Resume prefetch on return
3. **Storage Full**: Gracefully degrade to online-only
4. **Rapid Rotations**: READY always pre-loaded
5. **Network Loss**: 30 stitches buffered for continuation