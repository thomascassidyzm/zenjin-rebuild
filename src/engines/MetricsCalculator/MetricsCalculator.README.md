# MetricsCalculator Component

## Overview

The MetricsCalculator is a core component of the Zenjin Maths App that performs calculations for various performance metrics. It implements the calculation logic for session metrics, including FTCPoints, ECPoints, BasePoints, BonusMultiplier, BlinkSpeed, and Evolution, providing consistent and accurate metric calculations throughout the system.

## Component Structure

The MetricsCalculator implementation consists of:

1. **MetricsCalculator.ts**: The main TypeScript implementation file containing:
   - Data structure interfaces: `SessionData` and `MetricsResult`
   - Error handling with custom `MetricsError` class
   - The `MetricsCalculator` class implementing all calculation methods

2. **MetricsCalculator.test.ts**: A comprehensive test suite to verify correct implementation

## Interfaces

### Session Data

```typescript
interface SessionData {
  /** Session duration in milliseconds */
  duration: number;
  
  /** Number of questions answered */
  questionCount: number;
  
  /** Number of first-time correct answers */
  ftcCount: number;
  
  /** Number of eventually correct answers */
  ecCount: number;
  
  /** Number of incorrect answers */
  incorrectCount: number;
  
  /** Array of response times in milliseconds (optional) */
  responseTimeData?: number[];
}
```

### Metrics Result

```typescript
interface MetricsResult {
  /** First-time correct points */
  ftcPoints: number;
  
  /** Eventually correct points */
  ecPoints: number;
  
  /** Base points (FTC + EC) */
  basePoints: number;
  
  /** Consistency score (0.0-1.0) */
  consistency: number;
  
  /** Accuracy score (0.0-1.0) */
  accuracy: number;
  
  /** Speed score (0.0-1.0) */
  speed: number;
  
  /** Bonus multiplier */
  bonusMultiplier: number;
  
  /** Blink speed (ms per FTC answer) */
  blinkSpeed: number;
  
  /** Total points (base × bonus) */
  totalPoints: number;
}
```

## Key Features

1. **Complete Implementation of Required Methods**:
   - `calculateSessionMetrics`: Calculates all metrics for a learning session
   - `calculateFTCPoints`: Calculates First Time Correct points
   - `calculateECPoints`: Calculates Eventually Correct points
   - `calculateBonusMultiplier`: Calculates bonus multiplier
   - `calculateBlinkSpeed`: Calculates blink speed
   - `calculateEvolution`: Calculates the Evolution metric

2. **Thorough Input Validation**:
   - Validates all input parameters before performing calculations
   - Throws appropriate error codes and messages for invalid inputs

3. **Proper Handling of Edge Cases**:
   - Handles zero counts (e.g., when ftcCount is 0 for BlinkSpeed calculation)
   - Handles optional inputs (e.g., responseTimeData)
   - Ensures appropriate precision for floating-point calculations

## Calculation Formulas

### FTCPoints
```
FTCPoints = FTCCount × 5
```

### ECPoints
```
ECPoints = ECCount × 3
```

### BasePoints
```
BasePoints = FTCPoints + ECPoints
```

### Consistency
When response time data is available:
```
Consistency = 1 - (StreakBreaks / (QuestionCount - 1))
```
Where StreakBreaks is the number of times a correct answer is followed by an incorrect answer or vice versa.

When response time data is not available:
```
Consistency = (FTCCount + ECCount) / QuestionCount
```

### Accuracy
```
Accuracy = (FTCCount + ECCount) / QuestionCount
```

### Speed
When response time data is available:
```
Speed = 1 - min(1, AverageResponseTime / ExpectedResponseTime)
```
Where ExpectedResponseTime is a baseline response time (3000ms)

When response time data is not available:
```
Speed = 0.5 (default value)
```

### BonusMultiplier
```
BonusMultiplier = 1 + (Consistency × 0.1) + (Accuracy × 0.1) + (Speed × 0.1)
```

### BlinkSpeed
```
BlinkSpeed = SessionDuration / FTCCount
```
If FTCCount is 0, BlinkSpeed is set to the session duration.

### TotalPoints
```
TotalPoints = BasePoints × BonusMultiplier
```

### Evolution
```
Evolution = TotalPoints / BlinkSpeed
```
If BlinkSpeed is 0, Evolution is set to 0.

## Error Handling

The implementation uses a custom `MetricsError` class with the following error codes:

- `INVALID_SESSION_DATA`: Session data is invalid or inconsistent
- `CALCULATION_FAILED`: Failed to calculate metrics
- `INVALID_COUNT`: Count is invalid (negative or non-integer)
- `INVALID_SCORE`: Score is invalid (outside 0-1 range)
- `INVALID_DURATION`: Duration is invalid (negative)
- `DIVISION_BY_ZERO`: Cannot perform division with zero divisor
- `INVALID_POINTS`: Points value is invalid (negative)
- `INVALID_BLINK_SPEED`: Blink speed is invalid (negative)

## Usage Example

```typescript
import { MetricsCalculator } from './components/MetricsCalculator';

// Create metrics calculator
const metricsCalculator = new MetricsCalculator();

// Calculate session metrics
const sessionMetrics = metricsCalculator.calculateSessionMetrics({
  duration: 240000,
  questionCount: 20,
  ftcCount: 16,
  ecCount: 3,
  incorrectCount: 1,
  responseTimeData: [1200, 1500, 1800, 1300, 1600, 1400, 1700, 1200, 1900, 1500, 
                     1400, 1600, 1300, 1800, 1500, 1700, 1400, 1600, 1500, 1700]
});

console.log(`FTC Points: ${sessionMetrics.ftcPoints}`);
console.log(`EC Points: ${sessionMetrics.ecPoints}`);
console.log(`Base Points: ${sessionMetrics.basePoints}`);
console.log(`Consistency: ${sessionMetrics.consistency}`);
console.log(`Accuracy: ${sessionMetrics.accuracy}`);
console.log(`Speed: ${sessionMetrics.speed}`);
console.log(`Bonus Multiplier: ${sessionMetrics.bonusMultiplier}`);
console.log(`Blink Speed: ${sessionMetrics.blinkSpeed} ms`);
console.log(`Total Points: ${sessionMetrics.totalPoints}`);
```

## Validation

The implementation meets validation criterion MS-005: MetricsCalculator performs calculations with the correct formulas and precision.

This has been verified through comprehensive tests that:
1. Provide known inputs to the calculation methods
2. Verify that the outputs match the expected values based on the defined formulas
3. Check that the precision of the calculations is appropriate
4. Test edge cases such as division by zero, negative inputs, and out-of-range values
