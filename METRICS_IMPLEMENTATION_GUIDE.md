# Metrics System Implementation Guide

## Overview

This guide provides the complete implementation specification for the fixed metrics system using the correct point values (FTC=3, EC=1) and MAX() bonus calculation.

## Core Point Values

```typescript
const POINTS = {
  FIRST_TIME_CORRECT: 3,    // Changed from 10
  EVENTUALLY_CORRECT: 1,    // Changed from 3
  INCORRECT: 0
};
```

## Bonus System Implementation

### MAX() Formula (Not Weighted Average)

The bonus system uses **MAX(consistency, excellence, speed)** instead of weighted average:

```typescript
interface BonusCalculation {
  consistency: number;    // Multiplier from valid sessions
  excellence: number;     // Multiplier from FTC percentage  
  speed: number;         // Multiplier from blink speed
  final: number;         // MAX of the three above
  winner: 'consistency' | 'excellence' | 'speed';
}

function calculateBonus(metrics: SessionMetrics): BonusCalculation {
  const consistency = calculateConsistencyBonus(metrics.validSessions);
  const excellence = calculateExcellenceBonus(metrics.ftcPercentage);
  const speed = calculateSpeedBonus(metrics.blinkSpeed);
  
  // Use MAX(), not weighted average
  const final = Math.max(consistency, excellence, speed);
  
  let winner: string;
  if (final === consistency) winner = 'consistency';
  else if (final === excellence) winner = 'excellence';
  else winner = 'speed';
  
  return { consistency, excellence, speed, final, winner };
}
```

## Valid Session Tracking

### Session Qualification

A session is "valid" for consistency tracking if:
- **>100 questions answered** (not just 20)
- Session completed successfully
- Not abandoned mid-session

```typescript
function isValidSession(session: SessionData): boolean {
  return session.questionCount > 100 && 
         session.status === 'completed';
}
```

### Time Windows

Track valid sessions across three time windows:

```typescript
const TIME_WINDOWS = {
  short: 3,    // 3 days
  medium: 12,  // 12 days  
  long: 35     // 35 days
};

function getValidSessionsInWindow(
  userId: string, 
  window: 'short' | 'medium' | 'long'
): number {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - TIME_WINDOWS[window]);
  
  return validSessions.filter(session => 
    session.userId === userId &&
    session.completedAt >= cutoffDate &&
    session.questionCount > 100
  ).length;
}
```

## Easter Egg Threshold System

### Hidden Thresholds (Discovery-Based)

The exact bonus thresholds are **NOT shown in the UI**. Players discover them through play:

```typescript
// These values are configurable and hidden from players
const EASTER_EGG_THRESHOLDS = {
  excellence: [
    { ftcPercentage: 80, multiplier: 2.0 },
    { ftcPercentage: 90, multiplier: 5.0 },
    { ftcPercentage: 95, multiplier: 10.0 },
    { ftcPercentage: 100, multiplier: 30.0 }
  ],
  speed: [
    { maxBlinkSpeed: 3000, multiplier: 2.0 },  // <3s per FTC
    { maxBlinkSpeed: 2000, multiplier: 10.0 }, // <2s per FTC
    { maxBlinkSpeed: 1000, multiplier: 30.0 }  // <1s per FTC
  ],
  consistency: {
    short: [
      { sessionCount: 2, multiplier: 2.0 },   // 2 valid sessions in 3 days
      { sessionCount: 3, multiplier: 5.0 }    // 3 valid sessions in 3 days
    ],
    medium: [
      { sessionCount: 5, multiplier: 2.0 },   // 5 valid sessions in 12 days
      { sessionCount: 8, multiplier: 10.0 }   // 8 valid sessions in 12 days  
    ],
    long: [
      { sessionCount: 15, multiplier: 2.0 },  // 15 valid sessions in 35 days
      { sessionCount: 25, multiplier: 30.0 }  // 25 valid sessions in 35 days
    ]
  }
};
```

### Bonus Calculation Examples

```typescript
function calculateConsistencyBonus(validSessions: {
  short: number, 
  medium: number, 
  long: number
}): number {
  // Check each time window and return highest bonus
  let maxBonus = 1.0; // Default multiplier
  
  // Check short window (3 days)
  for (const threshold of EASTER_EGG_THRESHOLDS.consistency.short) {
    if (validSessions.short >= threshold.sessionCount) {
      maxBonus = Math.max(maxBonus, threshold.multiplier);
    }
  }
  
  // Check medium window (12 days)  
  for (const threshold of EASTER_EGG_THRESHOLDS.consistency.medium) {
    if (validSessions.medium >= threshold.sessionCount) {
      maxBonus = Math.max(maxBonus, threshold.multiplier);
    }
  }
  
  // Check long window (35 days)
  for (const threshold of EASTER_EGG_THRESHOLDS.consistency.long) {
    if (validSessions.long >= threshold.sessionCount) {
      maxBonus = Math.max(maxBonus, threshold.multiplier);
    }
  }
  
  return maxBonus;
}

function calculateExcellenceBonus(ftcPercentage: number): number {
  let bonus = 1.0;
  
  for (const threshold of EASTER_EGG_THRESHOLDS.excellence) {
    if (ftcPercentage >= threshold.ftcPercentage) {
      bonus = threshold.multiplier;
    }
  }
  
  return bonus;
}

function calculateSpeedBonus(blinkSpeed: number): number {
  let bonus = 1.0;
  
  for (const threshold of EASTER_EGG_THRESHOLDS.speed) {
    if (blinkSpeed <= threshold.maxBlinkSpeed) {
      bonus = threshold.multiplier;
    }
  }
  
  return bonus;
}
```

## Complete Session Calculation

```typescript
function calculateSessionMetrics(sessionData: SessionData): MetricsResult {
  // 1. Calculate base points with correct values
  const ftcPoints = sessionData.ftcCount * 3;  // FTC = 3 points
  const ecPoints = sessionData.ecCount * 1;    // EC = 1 point
  const basePoints = ftcPoints + ecPoints;
  
  // 2. Calculate FTC percentage for excellence bonus
  const ftcPercentage = (sessionData.ftcCount / sessionData.questionCount) * 100;
  
  // 3. Calculate blink speed for speed bonus
  const blinkSpeed = sessionData.ftcCount > 0 
    ? sessionData.duration / sessionData.ftcCount 
    : Infinity;
  
  // 4. Get valid sessions for consistency bonus
  const validSessions = {
    short: getValidSessionsInWindow(sessionData.userId, 'short'),
    medium: getValidSessionsInWindow(sessionData.userId, 'medium'),
    long: getValidSessionsInWindow(sessionData.userId, 'long')
  };
  
  // 5. Calculate individual bonuses
  const consistencyMultiplier = calculateConsistencyBonus(validSessions);
  const excellenceMultiplier = calculateExcellenceBonus(ftcPercentage);
  const speedMultiplier = calculateSpeedBonus(blinkSpeed);
  
  // 6. Apply MAX() formula
  const finalMultiplier = Math.max(
    consistencyMultiplier,
    excellenceMultiplier, 
    speedMultiplier
  );
  
  // 7. Calculate total points
  const totalPoints = basePoints * finalMultiplier;
  
  return {
    ftcPoints,
    ecPoints,
    basePoints,
    consistencyMultiplier,
    excellenceMultiplier,
    speedMultiplier,
    bonusMultiplier: finalMultiplier,
    blinkSpeed,
    totalPoints
  };
}
```

## Database Schema Updates

### Valid Sessions Table

```sql
CREATE TABLE valid_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  session_id VARCHAR NOT NULL,
  question_count INT NOT NULL CHECK (question_count > 100),
  completed_at TIMESTAMP NOT NULL,
  points INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_user_completed (user_id, completed_at),
  INDEX idx_session_lookup (session_id)
);
```

### Threshold Configuration Table

```sql
CREATE TABLE bonus_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR NOT NULL CHECK (category IN ('excellence', 'speed', 'consistency')),
  time_window VARCHAR CHECK (time_window IN ('short', 'medium', 'long')),
  threshold_value DECIMAL NOT NULL,
  multiplier DECIMAL NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_category_active (category, active)
);
```

## Implementation Checklist

### Critical Fixes Required

- [ ] **Update MetricsCalculator class**: Change FTC=3, EC=1 (currently using 10, 3)
- [ ] **Replace weighted bonus calculation**: Implement MAX() logic instead
- [ ] **Add ValidSession tracking**: Create table and tracking logic  
- [ ] **Implement time window queries**: 3-day, 12-day, 35-day lookups
- [ ] **Add Easter Egg threshold system**: Configurable hidden thresholds
- [ ] **Update session qualification**: >100 questions requirement
- [ ] **Fix bonus multiplier range**: x2 to x30 (not x1.0 to x1.5)

### Interface Dependencies

The implementation should use these APML interfaces:

1. **MetricsCalculatorInterface** (v2.0.0) - Updated with constants and MAX() logic
2. **ConsistencyTrackerInterface** (v1.0.0) - New interface for valid session tracking
3. **BonusCalculatorInterface** (v1.0.0) - New interface for Easter Egg bonus system

### Testing Requirements

```typescript
// Test cases to verify correct implementation
describe('Fixed Metrics System', () => {
  test('uses correct point values', () => {
    expect(calculateFTCPoints(5)).toBe(15);  // 5 × 3 = 15
    expect(calculateECPoints(3)).toBe(3);    // 3 × 1 = 3
  });
  
  test('applies MAX() bonus calculation', () => {
    const bonuses = { consistency: 2.0, excellence: 10.0, speed: 5.0 };
    expect(getMaxBonus(bonuses)).toBe(10.0); // MAX not weighted average
  });
  
  test('tracks valid sessions correctly', () => {
    const session = { questionCount: 150, status: 'completed' };
    expect(isValidSession(session)).toBe(true);
    
    const shortSession = { questionCount: 50, status: 'completed' };
    expect(isValidSession(shortSession)).toBe(false);
  });
  
  test('calculates time windows correctly', () => {
    // Test 3-day, 12-day, 35-day windows
  });
});
```

## Admin Tools

### Threshold Management

```typescript
// Admin interface for managing Easter Egg thresholds
interface ThresholdManagement {
  viewCurrentThresholds(): BonusThreshold[];
  updateThreshold(id: string, newValues: Partial<BonusThreshold>): boolean;
  previewBonusCalculation(sessionData: SessionData, customThresholds?: BonusThreshold[]): BonusPreview;
  exportThresholdConfig(): ThresholdConfig;
  importThresholdConfig(config: ThresholdConfig): boolean;
}
```

### Analytics Dashboard

- Show distribution of bonus categories (which wins most often)
- Track discovery rates of different Easter Egg thresholds
- Monitor session length trends (valid vs invalid sessions)
- A/B test different threshold configurations

This implementation guide ensures the metrics system works correctly with the proper point values, MAX() bonus logic, and hidden Easter Egg discovery mechanics.