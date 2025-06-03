# MetricsCalculator Implementation Package

## Implementation Goal

Create a MetricsCalculator component that performs calculations for various metrics in the Zenjin Maths App. This component will implement the core calculation logic for session metrics, including FTCPoints, ECPoints, BasePoints, BonusMultiplier, BlinkSpeed, and Evolution, providing consistent and accurate metric calculations throughout the system.

## Component Context

The MetricsCalculator is a foundational component of the MetricsSystem module that implements the calculation logic for all metrics used in the Zenjin Maths App. It plays a critical role in:

1. Calculating session-based metrics from raw performance data
2. Computing derived metrics such as BonusMultiplier and Evolution
3. Ensuring consistent calculation formulas across the application
4. Supporting both session and lifetime metrics calculations

This component is essential for providing accurate and consistent performance metrics that drive the motivational and adaptive aspects of the Zenjin Maths App's learning approach.

## Interface Definition

### Data Structures

```typescript
/**
 * Session data for metrics calculation
 */
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

/**
 * Result of metrics calculation
 */
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

### Methods

```typescript
/**
 * Calculates metrics for a learning session
 * @param sessionData - Session data for calculation
 * @returns Calculated metrics
 * @throws INVALID_SESSION_DATA if the session data is invalid
 * @throws CALCULATION_FAILED if failed to calculate metrics
 */
function calculateSessionMetrics(sessionData: SessionData): MetricsResult;

/**
 * Calculates first-time correct points
 * @param ftcCount - Number of first-time correct answers
 * @returns Calculated FTC points
 * @throws INVALID_COUNT if the count is invalid
 */
function calculateFTCPoints(ftcCount: number): number;

/**
 * Calculates eventually correct points
 * @param ecCount - Number of eventually correct answers
 * @returns Calculated EC points
 * @throws INVALID_COUNT if the count is invalid
 */
function calculateECPoints(ecCount: number): number;

/**
 * Calculates bonus multiplier based on consistency, accuracy, and speed
 * @param consistency - Consistency score (0.0-1.0)
 * @param accuracy - Accuracy score (0.0-1.0)
 * @param speed - Speed score (0.0-1.0)
 * @returns Calculated bonus multiplier
 * @throws INVALID_SCORE if one or more scores are invalid
 */
function calculateBonusMultiplier(consistency: number, accuracy: number, speed: number): number;

/**
 * Calculates blink speed (ms per FTC answer)
 * @param duration - Session duration in milliseconds
 * @param ftcCount - Number of first-time correct answers
 * @returns Calculated blink speed
 * @throws INVALID_DURATION if the duration is invalid
 * @throws INVALID_COUNT if the count is invalid
 * @throws DIVISION_BY_ZERO if cannot calculate blink speed with zero FTC answers
 */
function calculateBlinkSpeed(duration: number, ftcCount: number): number;

/**
 * Calculates the Evolution metric
 * @param totalPoints - Total points
 * @param blinkSpeed - Blink speed in milliseconds
 * @returns Calculated Evolution metric
 * @throws INVALID_POINTS if the points value is invalid
 * @throws INVALID_BLINK_SPEED if the blink speed is invalid
 * @throws DIVISION_BY_ZERO if cannot calculate Evolution with zero blink speed
 */
function calculateEvolution(totalPoints: number, blinkSpeed: number): number;
```

## Module Context

The MetricsCalculator is a component of the MetricsSystem module, which calculates and manages session and lifetime metrics including FTCPoints, ECPoints, BasePoints, BonusMultipliers, BlinkSpeed, TotalPoints, Evolution, and GlobalRanking.

### Module Purpose

The MetricsSystem module is responsible for tracking, calculating, and storing all performance metrics in the Zenjin Maths App. It provides the data needed for the user interface to display progress and achievements, and for the ProgressionSystem to make decisions about learning path progression.

### Component Relationships

The MetricsCalculator has the following relationships with other components:

1. **SessionMetricsManager**: The SessionMetricsManager depends on the MetricsCalculator for calculating session metrics from raw performance data.

2. **LifetimeMetricsManager**: The LifetimeMetricsManager depends on the MetricsCalculator for calculating lifetime metrics and derived metrics such as Evolution.

3. **MetricsStorage**: The MetricsCalculator provides calculated metrics to the MetricsStorage component for persistence.

## Implementation Requirements

### Core Calculation Logic

1. **FTCPoints Calculation**: Implement the calculation of First Time Correct points as 5 points per FTC answer.

2. **ECPoints Calculation**: Implement the calculation of Eventually Correct points as 3 points per EC answer.

3. **BasePoints Calculation**: Implement the calculation of Base points as the sum of FTCPoints and ECPoints.

4. **Consistency Calculation**: Implement the calculation of Consistency score (0.0-1.0) based on the pattern of correct and incorrect answers.

5. **Accuracy Calculation**: Implement the calculation of Accuracy score (0.0-1.0) as the ratio of correct answers (FTC + EC) to total questions.

6. **Speed Calculation**: Implement the calculation of Speed score (0.0-1.0) based on average response time relative to expected response time.

7. **BonusMultiplier Calculation**: Implement the calculation of Bonus multiplier based on Consistency, Accuracy, and Speed scores.

8. **BlinkSpeed Calculation**: Implement the calculation of Blink speed as the session duration divided by the number of FTC answers.

9. **TotalPoints Calculation**: Implement the calculation of Total points as BasePoints × BonusMultiplier.

10. **Evolution Calculation**: Implement the calculation of Evolution as TotalPoints / BlinkSpeed.

### Error Handling

1. **Input Validation**: Implement thorough validation of all input parameters to ensure they meet the requirements of the calculations.

2. **Error Reporting**: Provide clear error messages for all error conditions, including invalid inputs and calculation failures.

3. **Edge Cases**: Handle edge cases such as division by zero, negative inputs, and out-of-range values.

### Performance Requirements

1. **Efficiency**: The MetricsCalculator must efficiently perform calculations, even for large datasets.

2. **Precision**: Ensure appropriate precision in calculations, especially for floating-point values.

3. **Consistency**: Ensure consistent calculation results across multiple invocations with the same inputs.

## Implementation Prompt

Implement the MetricsCalculator component according to the interface definition and requirements. The implementation should:

1. Provide accurate and consistent calculations for all metrics used in the Zenjin Maths App.

2. Implement all methods defined in the MetricsCalculatorInterface, including calculateSessionMetrics, calculateFTCPoints, calculateECPoints, calculateBonusMultiplier, calculateBlinkSpeed, and calculateEvolution.

3. Include thorough input validation and error handling for all methods.

4. Ensure appropriate precision in calculations, especially for floating-point values.

5. Handle edge cases such as division by zero, negative inputs, and out-of-range values.

6. Include comprehensive comments explaining the implementation details and the calculation formulas for each metric.

7. Ensure the implementation is testable with mock inputs.

8. Use TypeScript for type safety and implement the MetricsCalculatorInterface as defined in the MetricsSystem module.

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
```
Consistency = 1 - (StreakBreaks / (QuestionCount - 1))
```
Where StreakBreaks is the number of times a correct answer is followed by an incorrect answer or vice versa.

If responseTimeData is not available, use a default value based on the ratio of correct to total answers:
```
Consistency = (FTCCount + ECCount) / QuestionCount
```

### Accuracy
```
Accuracy = (FTCCount + ECCount) / QuestionCount
```

### Speed
```
Speed = 1 - min(1, AverageResponseTime / ExpectedResponseTime)
```
Where:
- AverageResponseTime is calculated from responseTimeData if available
- ExpectedResponseTime is a baseline response time (e.g., 3000ms)

If responseTimeData is not available, use a default value of 0.5.

### BonusMultiplier
```
BonusMultiplier = 1 + (Consistency × 0.1) + (Accuracy × 0.1) + (Speed × 0.1)
```

### BlinkSpeed
```
BlinkSpeed = SessionDuration / FTCCount
```
If FTCCount is 0, BlinkSpeed is set to a maximum value (e.g., SessionDuration).

### TotalPoints
```
TotalPoints = BasePoints × BonusMultiplier
```

### Evolution
```
Evolution = TotalPoints / BlinkSpeed
```
If BlinkSpeed is 0, Evolution is set to 0.

## Mock Inputs and Expected Outputs

### calculateSessionMetrics

**Input:**
```typescript
const sessionData = {
  duration: 240000,
  questionCount: 20,
  ftcCount: 16,
  ecCount: 3,
  incorrectCount: 1,
  responseTimeData: [1200, 1500, 1800, 1300, 1600, 1400, 1700, 1200, 1900, 1500, 
                     1400, 1600, 1300, 1800, 1500, 1700, 1400, 1600, 1500, 1700]
};
```

**Expected Output:**
```typescript
{
  ftcPoints: 80,
  ecPoints: 9,
  basePoints: 89,
  consistency: 0.85,
  accuracy: 0.95,
  speed: 0.78,
  bonusMultiplier: 1.25,
  blinkSpeed: 15000,
  totalPoints: 111.25
}
```

### calculateFTCPoints

**Input:**
```typescript
const ftcCount = 16;
```

**Expected Output:**
```typescript
80
```

### calculateECPoints

**Input:**
```typescript
const ecCount = 3;
```

**Expected Output:**
```typescript
9
```

### calculateBonusMultiplier

**Input:**
```typescript
const consistency = 0.85;
const accuracy = 0.95;
const speed = 0.78;
```

**Expected Output:**
```typescript
1.25
```

### calculateBlinkSpeed

**Input:**
```typescript
const duration = 240000;
const ftcCount = 16;
```

**Expected Output:**
```typescript
15000
```

### calculateEvolution

**Input:**
```typescript
const totalPoints = 4250;
const blinkSpeed = 12500;
```

**Expected Output:**
```typescript
0.34
```

## Validation Criteria

The MetricsCalculator implementation must satisfy the following validation criteria:

**MS-005**: MetricsCalculator must perform calculations with the correct formulas and precision.

This criterion will be tested by:
1. Providing known inputs to the calculation methods
2. Verifying that the outputs match the expected values based on the defined formulas
3. Checking that the precision of the calculations is appropriate (e.g., rounding to 2 decimal places for display)
4. Testing edge cases such as division by zero, negative inputs, and out-of-range values

## Usage Example

```typescript
// Example usage of MetricsCalculator
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

// Calculate individual metrics
const ftcPoints = metricsCalculator.calculateFTCPoints(16);
console.log(`FTC Points: ${ftcPoints}`);

const ecPoints = metricsCalculator.calculateECPoints(3);
console.log(`EC Points: ${ecPoints}`);

const bonusMultiplier = metricsCalculator.calculateBonusMultiplier(0.85, 0.95, 0.78);
console.log(`Bonus Multiplier: ${bonusMultiplier}`);

const blinkSpeed = metricsCalculator.calculateBlinkSpeed(240000, 16);
console.log(`Blink Speed: ${blinkSpeed} ms`);

const evolution = metricsCalculator.calculateEvolution(4250, 12500);
console.log(`Evolution: ${evolution}`);

// Handle edge cases
try {
  const invalidBlinkSpeed = metricsCalculator.calculateBlinkSpeed(240000, 0);
  console.log(`Invalid Blink Speed: ${invalidBlinkSpeed} ms`);
} catch (error) {
  console.error(`Error: ${error.message}`);
}

try {
  const invalidEvolution = metricsCalculator.calculateEvolution(4250, 0);
  console.log(`Invalid Evolution: ${invalidEvolution}`);
} catch (error) {
  console.error(`Error: ${error.message}`);
}
```

## Implementation Considerations

1. **Precision**: Ensure appropriate precision in calculations, especially for floating-point values like consistency, accuracy, speed, and bonusMultiplier.

2. **Error Handling**: Implement comprehensive error handling for all methods, with appropriate error codes and messages.

3. **Edge Cases**: Handle edge cases such as division by zero (e.g., when ftcCount is 0 for BlinkSpeed calculation), negative inputs, and out-of-range values.

4. **Default Values**: Provide sensible default values for optional parameters and edge cases.

5. **Performance**: Optimize calculations for performance, especially when dealing with large responseTimeData arrays.

6. **Testing**: Include unit tests for all methods, with particular focus on the validation criterion (MS-005).

7. **Documentation**: Include comprehensive documentation for all methods and calculation formulas.

8. **Extensibility**: Design the implementation to be extensible, allowing for future enhancements and modifications to the calculation formulas.

9. **Consistency**: Ensure consistent calculation results across multiple invocations with the same inputs.

10. **Rounding**: Decide on appropriate rounding strategies for display values versus internal calculation values.
