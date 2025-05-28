# LiveAidManager Engine

**Live Aid Architecture - System Coordination**

Coordinates PREPARING → READY → LIVE tube transitions for seamless zero-wait user experience.

## Core Responsibility

Orchestrates the complete Live Aid system following tube transition algorithms from `LIVE_AID_IMPLEMENTATION_ALGORITHMS.apml`.

## Performance Targets

- **Rotation Time**: <100ms for complete tube transitions
- **User Wait Time**: ~0ms through perfect cache coordination
- **Background Success**: >98% preparation completion rate
- **System Throughput**: 120+ questions served per minute

## Tube Transition Orchestration

### Atomic Rotation Process
1. **Validate READY content** - Ensure promotion target available
2. **Execute simultaneous transitions**:
   - LIVE → PREPARING (start new background process)
   - READY → LIVE (promote to active consumption)
   - PREPARING → READY (cache completed stitch)
3. **Update system state** - Reflect new tube assignments
4. **Start background preparation** - Queue next stitch assembly

### System Health Monitoring
- **Optimal**: All metrics within targets
- **Degraded**: Some performance issues detected
- **Critical**: Emergency measures required

## Live Aid System State

```
LiveAidSystemState {
  userId: string
  currentRotation: number (rotation counter)
  tubeStates: {
    tube1: { status: 'live|ready|preparing', ... }
    tube2: { status: 'live|ready|preparing', ... }
    tube3: { status: 'live|ready|preparing', ... }
  }
  activePreparations: background processes
  systemHealth: 'optimal|degraded|critical'
}
```

## Background Preparation Management

- **Preparation Scheduling**: Optimizes timing based on user patterns
- **Queue Management**: Prioritizes critical preparations
- **Resource Allocation**: Throttles based on system load
- **Emergency Preparation**: <3 second fallback for cache misses

## Degradation Handling

### Network Issues
- Extend cache validity periods
- Reduce background preparation frequency
- Offline-first caching strategy

### High Load
- Throttle background preparations
- Prioritize critical user requests
- Load balancing and queueing

### Cache Corruption
- Emergency cache rebuild
- Clear corrupted entries
- Trigger immediate preparations

## Integration

Coordinates between:
- **StitchCache** - Cache state management and invalidation
- **StitchPreparation** - Background assembly coordination
- **StitchPopulation** - Concept mapping for new content
- **TripleHelixManager** - Tube-based progression logic

## Key Operations

- `rotateTubes()` - **<100ms** seamless tube transitions
- `initializeLiveAidSystem()` - User onboarding with cache preload
- `requestBackgroundPreparation()` - Queue background assembly
- `emergencyPreparation()` - **<3s** fallback content generation
- `handleSystemDegradation()` - Adaptive performance optimization