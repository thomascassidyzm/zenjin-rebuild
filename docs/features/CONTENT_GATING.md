# Content Gating Implementation Guide

## Overview

The Content Gating system implements a freemium model where:
- **Free Users**: Access first 10 stitches per tube, then cycle with varied distractors
- **Premium Users**: Full progression through all stitches + offline content caching

## Strategy

### Free Tier Limitations
1. **Stitch Limit**: First 10 stitches per tube
2. **Cycling Content**: After stitch 10, cycle back through stitches 1-10 with:
   - Different distractors
   - Variant question phrasings
   - Maintained learning value
3. **No Offline Access**: Must be online to learn

### Premium Tier Benefits
1. **Full Progression**: Access to all 50+ stitches per tube
2. **Advanced Content**: Higher difficulty levels and specialized topics
3. **Offline Learning**: Download content for use without internet
4. **Progress Continuity**: Seamless progression through full curriculum

## Implementation

### Core Components

#### 1. ContentGatingEngine (`src/engines/ContentGatingEngine.ts`)
```typescript
// Check content access
const accessResult = await contentGatingEngine.canAccessStitch(userId, stitchId, tubeId);

// Get upgrade prompt context
const context = await contentGatingEngine.getUpgradePromptContext(userId, 'stitch_limit');

// Get user's content summary
const summary = await contentGatingEngine.getUserContentSummary(userId);
```

**Key Methods:**
- `canAccessStitch()` - Check if user can access specific content
- `getNextAccessibleStitch()` - Get next stitch based on subscription
- `getUserContentSummary()` - Overview of accessible vs total content
- `getUpgradePromptContext()` - Contextual upgrade messaging

#### 2. OfflineContentManager (`src/engines/OfflineContentManager.ts`)
```typescript
// Check offline availability (Premium only)
const isAvailable = await offlineContentManager.isOfflineContentAvailable(userId);

// Download content for offline use
const result = await offlineContentManager.downloadContent(userId, ['t1', 't2']);

// Get offline content
const offlineStitch = await offlineContentManager.getOfflineStitch(stitchId);
```

**Features:**
- Download lessons for offline use (Premium only)
- Storage management (100MB limit)
- Progress tracking during downloads
- Storage usage breakdown by tube

#### 3. LearningEngineService Integration
Content gating is integrated at the session level:

```typescript
// In generateSessionQuestions()
// 1. Check content gating
const accessResult = await contentGatingEngine.canAccessStitch(userId, stitchId, tubeId);

// 2. Use free alternative if gated
if (!accessResult.hasAccess && accessResult.freeAlternative) {
  return await this.generateQuestionsForStitch(userId, accessResult.freeAlternative.stitchId, config);
}

// 3. Check offline content (Premium)
const offlineStitch = await offlineContentManager.getOfflineStitch(stitchId);
if (offlineStitch.isAvailable) {
  return await this.generateQuestionsFromOfflineContent(offlineStitch, config);
}
```

### UI Components

#### 1. ContentGatingPrompt (`src/components/ContentGatingPrompt.tsx`)
Shown when users hit content limits:

```typescript
<ContentGatingPrompt
  type="stitch_limit"
  context={{
    message: "You've completed the free content! 25 more lessons await.",
    benefits: ["Unlock 25 additional stitches", "Advanced progression", "Offline learning"],
    ctaText: "Unlock All Content",
    urgency: "high"
  }}
  onUpgrade={handleUpgrade}
  onContinueFree={handleContinueFree}
/>
```

#### 2. OfflineContentManager (`src/components/OfflineContentManager.tsx`)
Premium feature for offline learning:

```typescript
<OfflineContentManager onUpgradeRequired={handleUpgradeClick} />
```

**Features:**
- Download progress tracking
- Storage usage visualization
- Content management by tube
- Clear offline content

## User Experience Flow

### Free User Journey
1. **First 10 Stitches**: Normal progression through tube content
2. **Stitch 11 Attempt**: Content gating prompt appears:
   - "You've completed the free content!"
   - Shows premium benefits
   - Options: "Upgrade" or "Continue with practice variations"
3. **Continue Free**: Gets variant of stitch 1 with different distractors
4. **Cycling**: Continues through stitches 1-10 with increasing variation levels

### Premium User Journey
1. **Unlimited Access**: Full progression through all 50+ stitches
2. **Offline Option**: Can download content for offline learning
3. **Advanced Content**: Access to higher difficulty levels
4. **Seamless Experience**: No interruptions or limitations

## Technical Details

### Stitch Cycling Algorithm
```typescript
// Free users cycle through first 10 stitches
const getFreeVariantStitch = (tubeId: string, requestedPosition: number): string => {
  const cyclePosition = ((requestedPosition - 1) % 10) + 1;
  const variantLevel = Math.floor((requestedPosition - 1) / 10) + 1;
  return `${tubeId}-${String(cyclePosition).padStart(4, '0')}-v${variantLevel}`;
};

// Example:
// Position 11 -> t1-0001-v2 (stitch 1, variant 2)
// Position 21 -> t1-0001-v3 (stitch 1, variant 3)
// Position 15 -> t1-0005-v2 (stitch 5, variant 2)
```

### Offline Storage
- **Technology**: localStorage (client-side)
- **Format**: JSON serialized stitch data
- **Limit**: 100MB total storage
- **Structure**:
  ```json
  {
    "stitchId": "t1-0015-0001",
    "facts": [...],
    "metadata": {...},
    "downloadedAt": "2025-06-02T10:30:00Z"
  }
  ```

### Error Handling
```typescript
// Content gating errors
if (error.code === 'LE-GATE-001') {
  // Show upgrade prompt
  const context = await contentGatingEngine.getUpgradePromptContext(userId, 'stitch_limit');
  setContentGatingPrompt({ type: 'stitch_limit', context });
}

// Offline access errors
if (error.code === 'OFFLINE-001') {
  // Show offline upgrade prompt
  const context = await contentGatingEngine.getUpgradePromptContext(userId, 'offline_request');
  setContentGatingPrompt({ type: 'offline_request', context });
}
```

## Configuration

### Gating Parameters
```typescript
// In ContentGatingEngine
const FREE_STITCHES_PER_TUBE = 10;  // Free content limit
const MAX_STORAGE_MB = 100;         // Offline storage limit
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
```

### Subscription Integration
```typescript
// Check subscription status
const subscription = await subscriptionManager.getUserSubscription(userId);
const isPremium = subscription.tier === 'premium';

// Grant access based on tier
if (isPremium) {
  return { hasAccess: true };
}
```

## Analytics & Metrics

### Track Conversion Events
```typescript
// When users hit gating
analytics.track('content_gated', {
  userId,
  stitchId,
  position,
  tubeId,
  promptType: 'stitch_limit'
});

// When users upgrade from gating
analytics.track('gating_conversion', {
  userId,
  triggerType: 'stitch_limit',
  planSelected: 'premium-annual'
});

// When users continue free
analytics.track('gating_dismissed', {
  userId,
  chosenAction: 'continue_free'
});
```

### Key Metrics to Monitor
1. **Gating Hit Rate**: % of users who reach stitch 10
2. **Conversion Rate**: % who upgrade when gated
3. **Free Continuation**: % who choose to continue with variants
4. **Offline Usage**: % of premium users who download content
5. **Retention**: Difference in retention between free/premium

## Testing

### Test Scenarios
1. **Free User Progression**:
   - Complete stitches 1-10 normally
   - Hit gating at stitch 11
   - Continue with variant content
   - Verify cycling algorithm

2. **Premium User Experience**:
   - Access all content without gating
   - Download offline content
   - Use offline content when disconnected
   - Sync progress when reconnected

3. **Upgrade Flow**:
   - Trigger gating prompt
   - Complete upgrade process
   - Verify immediate access to premium content

### Test Commands
```bash
# Simulate free user hitting limit
setUserPosition('test-user', 't1', 11);

# Test offline download
offlineContentManager.downloadContent('premium-user', ['t1']);

# Simulate offline mode
navigator.setOffline(true);
```

## Deployment Considerations

### Environment Variables
```env
# Content gating configuration
VITE_FREE_STITCHES_PER_TUBE=10
VITE_MAX_OFFLINE_STORAGE_MB=100
VITE_CONTENT_GATING_ENABLED=true
```

### Database Considerations
- Add `current_position` tracking per tube per user
- Store offline download history
- Track gating events for analytics

### Performance
- Gating checks add <10ms to session initialization
- Offline content stored in localStorage (no server impact)
- Subscription status cached for 5 minutes

## Optimization Opportunities

### A/B Testing
- Different free stitch limits (5 vs 10 vs 15)
- Prompt messaging variations
- Timing of upgrade prompts

### Enhanced Free Experience
- Adaptive difficulty in cycling content
- Streak bonuses for continued engagement
- Social features (compare with friends)

### Premium Enhancements
- Personalized learning paths
- Advanced analytics dashboard
- Custom challenge creation

## Success Metrics

### Target KPIs
- **Conversion Rate**: 8-12% of gated users upgrade
- **Free Retention**: 60%+ continue after gating
- **Premium Retention**: 85%+ monthly retention
- **Offline Usage**: 40%+ of premium users download content

### Revenue Impact
- Each gated user who upgrades = $89.99 annual value
- Target: 1000 gated users/month × 10% conversion = $8,999 MRR

The content gating system provides a clear value proposition while maintaining educational value for free users through intelligent content cycling.