# Bonus System Internal Reference
**⚠️ INTERNAL DEVELOPMENT DOCUMENT - NOT FOR PUBLIC DOCUMENTATION**

## Complete Bonus Multiplier System

The bonus system uses a MAX() function to select the highest available bonus from three categories:

### 1. Consistency Bonus (Long-term Commitment)
Based on "Valid Sessions" (VS) where a valid session = >100 questions answered

| Valid Sessions | Time Window | Multiplier |
|----------------|-------------|------------|
| 3 sessions | within 3 days | **x3** |
| 10 sessions | within 12 days | **x10** |
| 30 sessions | within 35 days | **x30** |

**Notes:**
- Only the highest available consistency bonus applies
- Time windows are rolling (last 3 days, last 12 days, etc.)
- Sessions with <100 questions don't count as valid

### 2. Excellence Bonus (FTC Accuracy)
Based on First Time Correct percentage in the current session

| FTC Rate | Multiplier |
|----------|------------|
| >80% | **x2** |
| >90% | **x3** |
| 100% (perfect) | **x5** |

**Notes:**
- Calculated per session (not lifetime)
- Based on 20 questions per stitch

### 3. Speed Bonus (Blink Speed)
Based on average time per FTC answer (Total Session Time ÷ FTC Count)

| Blink Speed | Multiplier |
|-------------|------------|
| <3.0 seconds | **x2** |
| <2.0 seconds | **x5** |

**Notes:**
- Only FTC answers count (not EC)
- Extremely difficult to achieve <2.0s consistently

## Final Calculation

```javascript
function calculateBonus(session, userHistory) {
  // Consistency Bonus
  const validSessions = getValidSessionsInWindow(userHistory);
  let consistencyBonus = 1;
  if (validSessions.last35Days >= 30) consistencyBonus = 30;
  else if (validSessions.last12Days >= 10) consistencyBonus = 10;
  else if (validSessions.last3Days >= 3) consistencyBonus = 3;
  
  // Excellence Bonus
  const ftcPercentage = (session.ftcCount / session.totalQuestions) * 100;
  let excellenceBonus = 1;
  if (ftcPercentage === 100) excellenceBonus = 5;
  else if (ftcPercentage > 90) excellenceBonus = 3;
  else if (ftcPercentage > 80) excellenceBonus = 2;
  
  // Speed Bonus
  const blinkSpeed = session.totalTime / session.ftcCount;
  let speedBonus = 1;
  if (blinkSpeed < 2.0) speedBonus = 5;
  else if (blinkSpeed < 3.0) speedBonus = 2;
  
  // Return the maximum
  return Math.max(consistencyBonus, excellenceBonus, speedBonus);
}
```

## Points Calculation

```javascript
const basePoints = (ftcCount * 3) + (ecCount * 1);
const bonusMultiplier = calculateBonus(session, userHistory);
const totalPoints = basePoints * bonusMultiplier;
```

## UI/UX Considerations

### What Players See:
- Their total points with multiplier applied
- The multiplier value (e.g., "x10 Bonus!")
- Vague hints like "Exceptional performance!" or "Consistency pays off!"

### What Players DON'T See:
- Exact thresholds for bonuses
- Which category gave them the bonus
- How close they were to the next tier
- The specific formula

### Discovery Hints:
- "Try maintaining a streak!" (consistency hint)
- "Speed matters!" (blink speed hint)
- "Perfection has its rewards!" (100% FTC hint)

## Implementation Notes

1. **Valid Session Tracking**: Need to track session question counts and timestamps
2. **Rolling Windows**: Use date arithmetic for 3/12/35 day windows
3. **Performance**: Cache bonus calculations during session
4. **A/B Testing**: Consider testing different threshold values
5. **Analytics**: Track which bonuses players achieve most often

## Easter Egg Maintenance

To maintain the discovery aspect:
- Don't show progress bars toward bonuses
- Use celebratory but vague messaging
- Let players theorize in forums
- Consider seasonal adjustments to thresholds