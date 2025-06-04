# Doubling Question Fix - Test Scenarios

## Scenarios Tested

### 1. Standard Doubling (2 × n)
- **Input**: `mult-2-4`
- **Expected**: "Double 4"
- **Result**: ✅ PASS

### 2. Reverse Doubling (n × 2)
- **Input**: `mult-4-2`
- **Expected**: "Double 4"
- **Result**: ✅ PASS

### 3. Regular Multiplication (no 2)
- **Input**: `mult-3-4`
- **Expected**: "What is 3 × 4?"
- **Result**: ✅ PASS

### 4. Edge Cases Covered
- Operand swapping when operand1 = 2
- Template detection for doubling context
- Preservation of regular multiplication questions

## Implementation Details

### Changes Made:
1. **Context-Aware Template Selection** in `getQuestionTemplate()`
   - Detects when multiplication involves operand = 2
   - Switches to 'doubling' operation for template selection

2. **Smart Operand Handling** in `formatQuestionText()`
   - Swaps operands when needed for doubling templates
   - Ensures the number being doubled appears correctly

3. **Fallback Templates** updated
   - Added proper doubling fallback: "Double {{operand1}}"

## Boundary Level Templates
The fix works across all boundary levels (1-5) with templates like:
- Level 1: "Double {{operand1}}"
- Level 2: "What is double {{operand1}}?"
- Level 3: "Find double {{operand1}}"
- Level 4: "What is twice {{operand1}}?"
- Level 5: "Determine double {{operand1}}"