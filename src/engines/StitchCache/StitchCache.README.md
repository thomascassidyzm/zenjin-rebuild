# StitchCache Engine

**Live Aid Architecture - High-Performance Caching System**

Manages pre-assembled, ready-to-stream stitch content for zero-wait performance with >95% cache hit rate and seamless invalidation.

## Core Responsibility

Instant ReadyStitch delivery following cache management algorithms from `LIVE_AID_IMPLEMENTATION_ALGORITHMS.apml`.

## Performance Targets

- **Cache Hit Rate**: >95% for optimal user experience
- **Retrieval Time**: <10ms for ReadyStitch access
- **Background Success**: >98% preparation completion rate
- **Zero-Wait Experience**: Users never wait for content during normal operation

## Cache State Management

### PREPARING → READY → LIVE States
- **PREPARING**: Background assembly in progress
- **READY**: Complete ReadyStitch cached and validated
- **LIVE**: Currently being consumed by user

### Cache Invalidation Triggers
- **Boundary Level Changes**: User mastery advancement (invalidates ALL content)
- **Temporal Expiry**: 24-hour base + boundary level multiplier
- **Progression Milestones**: Major learning achievements
- **Manual Refresh**: Force cache refresh for testing

## Live Aid Cache Architecture

```
LiveAidCacheState {
  userId: string
  tube1: TubeCacheState
  tube2: TubeCacheState  
  tube3: TubeCacheState
  activeTubeId: current LIVE tube
}
```

Each tube maintains:
- `readyStitch`: Complete 20-question content
- `preparationProgress`: 0.0-1.0 background assembly status
- `cacheValidUntil`: Expiry timestamp
- `lastCacheTime`: Cache creation timestamp

## Quality Assurance

- **Completeness Validation**: All questions have required fields
- **Expiry Checking**: Automatic invalidation on timeout
- **Performance Monitoring**: Hit/miss ratio tracking
- **Emergency Warming**: Critical scenario cache population

## Integration

Works with:
- **StitchPreparation** - Receives ReadyStitch objects from background assembly
- **LiveAidManager** - Coordinates cache state with tube transitions
- **DistinctionManager** - Triggers invalidation on boundary level changes
- **PlayerCard** - Serves instant content for streaming playback

## Cache Operations

- `getReadyStitch()` - **<10ms** instant retrieval for streaming
- `cacheReadyStitch()` - Store complete assembled content
- `invalidateCache()` - Smart invalidation based on user progression
- `preloadUserCache()` - Initialize cache state for new users
- `getCacheMetrics()` - Performance monitoring and optimization