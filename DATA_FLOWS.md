# Zenjin Maths - Complete Data Flow Architecture

## Overview

This document provides a comprehensive mapping of all data flows in the Zenjin Maths system. Each flow is described with inputs, transformations, outputs, and state changes. The flows are technology-agnostic and can be implemented with any stack.

## Data Flow Categories

1. **User Lifecycle Flows** - Registration, initialization, authentication
2. **Session Management Flows** - Starting, playing, completing sessions
3. **Content Generation Flows** - Question creation, distractor generation
4. **Progress Management Flows** - State updates, position shifts, level progression
5. **Admin Flows** - Content creation, deployment, monitoring

---

## 1. User Lifecycle Flows

### 1.1 New User Registration Flow

```
TRIGGER: User completes registration form

INPUT:
  - email: string
  - password: string
  - name: string

FLOW:
  1. Validate input data
     └─> IF invalid: Return error
  
  2. Create user record in database
     └─> Generate unique user_id
  
  3. Read default_tube_positions table
     └─> Get all tube configurations
  
  4. Initialize user_state object:
     {
       tubePositions: {
         tube1: copy from default_tube_positions where tube_id='tube1',
         tube2: copy from default_tube_positions where tube_id='tube2',
         tube3: copy from default_tube_positions where tube_id='tube3'
       },
       stitchProgress: {
         // For each stitch in tubePositions:
         [stitchId]: {
           skipNumber: 4,
           boundaryLevel: 2,
           lastCompleted: null
         }
       },
       tripleHelixState: {
         activeTube: 1
       }
     }
  
  5. Store user_state in database
  
  6. Create initial metrics record:
     {
       userId: user_id,
       totalSessions: 0,
       totalQuestions: 0,
       totalCorrect: 0,
       streakDays: 0,
       lastPlayed: null
     }

OUTPUT:
  - user_id: string
  - initial_state: UserState object
  - redirect_to: '/player'

STATE CHANGES:
  - New record in users table
  - New user_state initialized
  - New metrics record created
```

### 1.2 User Login Flow

```
TRIGGER: User submits login credentials

INPUT:
  - email: string
  - password: string

FLOW:
  1. Validate credentials
     └─> IF invalid: Return error
  
  2. Fetch user record
     └─> Extract user_id
  
  3. Load user_state from database
  
  4. Check for state migrations needed:
     - Missing tube positions?
     - Old state format?
     - Missing stitch progress entries?
     └─> IF needed: Run migration
  
  5. Update last_login timestamp

OUTPUT:
  - user_id: string
  - user_state: UserState object
  - session_token: string
  - redirect_to: '/dashboard' or '/player'

STATE CHANGES:
  - last_login timestamp updated
  - Session created
```

---

## 2. Session Management Flows

### 2.1 Start Learning Session Flow

```
TRIGGER: User clicks "Start Learning" or arrives at /player

INPUT:
  - user_id: string
  - user_state: UserState object

FLOW:
  1. Get active tube from tripleHelixState
     └─> activeTube: 1, 2, or 3
  
  2. Get tube positions for active tube
     └─> positions = user_state.tubePositions[`tube${activeTube}`]
  
  3. Find lowest logical position with a stitch
     └─> activeStitchId = positions[lowestPosition]
     └─> IF no stitch at position 1: Compress positions
  
  4. Load stitch definition
     └─> SELECT * FROM stitches WHERE id = activeStitchId
  
  5. Get user's progress for this stitch
     └─> progress = user_state.stitchProgress[activeStitchId]
     └─> boundaryLevel = progress.boundaryLevel || 2
  
  6. Generate questions (see Flow 3.1)
  
  7. Initialize session state:
     {
       sessionId: generate_uuid(),
       userId: user_id,
       stitchId: activeStitchId,
       questions: [...],
       currentQuestionIndex: 0,
       responses: [],
       startTime: now(),
       points: 0
     }

OUTPUT:
  - session_state: SessionState object
  - first_question: Question object
  - total_questions: 20

STATE CHANGES:
  - Active session created in memory/cache
  - Session start logged
```

### 2.2 Answer Question Flow

```
TRIGGER: User selects an answer

INPUT:
  - session_id: string
  - question_index: number
  - selected_answer: string
  - response_time: number

FLOW:
  1. Validate session exists and is active
     └─> IF not: Return error
  
  2. Get current question from session
     └─> question = session.questions[question_index]
  
  3. Check if answer is correct
     └─> isCorrect = (selected_answer === question.fact.answer)
  
  4. Calculate points:
     IF isCorrect AND first_attempt:
       points = 3  // First Time Correct
     ELSE IF isCorrect AND NOT first_attempt:
       points = 1  // Eventually Correct
     ELSE:
       points = 0
  
  5. Record response:
     {
       questionIndex: question_index,
       selectedAnswer: selected_answer,
       isCorrect: isCorrect,
       responseTime: response_time,
       attempts: previous_attempts + 1,
       points: points
     }
  
  6. Update session state:
     - Add response to responses array
     - Update total points
     - IF incorrect: Add question to repeat queue
  
  7. Determine next action:
     IF incorrect:
       nextQuestion = same question (immediate repeat)
     ELSE IF question_index < 19:
       nextQuestion = session.questions[question_index + 1]
     ELSE:
       GOTO Stitch Completion Flow (2.3)

OUTPUT:
  - is_correct: boolean
  - points_earned: number
  - total_points: number
  - next_question: Question object OR completion_data

STATE CHANGES:
  - Response recorded in session
  - Points updated
  - Question may be queued for repeat
```

### 2.3 Stitch Completion Flow

```
TRIGGER: User completes all 20 questions

INPUT:
  - session_id: string
  - session_state: SessionState object
  - user_state: UserState object

FLOW:
  1. Calculate final score
     └─> correctCount = responses.filter(r => r.isCorrect).length
     └─> score = correctCount / 20
  
  2. Determine progression outcome:
     IF score === 1.0 (20/20):
       shouldProgress = true
       nextSkipNumber = getNextSkipNumber(currentSkipNumber)
       nextBoundaryLevel = min(currentBoundaryLevel + 1, 5)
     ELSE:
       shouldProgress = false
       nextSkipNumber = 4  // Reset
       nextBoundaryLevel = currentBoundaryLevel  // No change
  
  3. IF shouldProgress:
     a. Get current tube positions
        └─> positions = user_state.tubePositions[`tube${activeTube}`]
     
     b. Remove stitch from position 1
        └─> delete positions[1]
     
     c. Shift positions down:
        FOR position FROM 2 TO currentSkipNumber:
          positions[position - 1] = positions[position]
          delete positions[position]
     
     d. Place completed stitch at skip position
        └─> positions[currentSkipNumber] = completedStitchId
  
  4. Update stitch progress:
     user_state.stitchProgress[completedStitchId] = {
       skipNumber: nextSkipNumber,
       boundaryLevel: nextBoundaryLevel,
       lastCompleted: now()
     }
  
  5. Rotate triple helix:
     └─> user_state.tripleHelixState.activeTube = (activeTube % 3) + 1
  
  6. Update lifetime metrics:
     - totalSessions += 1
     - totalQuestions += 20
     - totalCorrect += correctCount
     - Update streak logic
  
  7. Save updated user_state to database

OUTPUT:
  - completion_data: {
      score: number,
      points: number,
      progressed: boolean,
      nextStitchId: string,
      metrics: MetricsSummary
    }

STATE CHANGES:
  - Tube positions rearranged
  - Stitch progress updated
  - Triple helix rotated
  - User state persisted
  - Metrics updated
```

---

## 3. Content Generation Flows

### 3.1 Generate Questions Flow

```
TRIGGER: Session start or stitch preview request

INPUT:
  - stitch_id: string
  - boundary_level: number (1-5)
  - count: number (usually 20)

FLOW:
  1. Load stitch definition
     └─> SELECT * FROM stitches WHERE id = stitch_id
     └─> Extract: conceptType, conceptParams
  
  2. Query facts based on concept:
     query = {
       conceptType: stitch.conceptType,
       parameters: stitch.conceptParams
     }
     └─> facts = factRepository.queryFacts(query)
  
  3. Shuffle and select facts:
     └─> selectedFacts = shuffle(facts).slice(0, count)
  
  4. FOR EACH fact in selectedFacts:
     a. Generate distractor (see Flow 3.2)
        └─> distractor = generateDistractor(fact, boundary_level)
     
     b. Select question template:
        └─> template = getTemplate(conceptType, boundary_level)
     
     c. Create question object:
        {
          fact: fact,
          questionText: interpolate(template, fact),
          correctAnswer: fact.answer,
          distractor: distractor,
          allOptions: shuffle([fact.answer, distractor]),
          boundaryLevel: boundary_level
        }
  
  5. Apply surprise distribution:
     IF stitch.surpriseWeight > 0:
       surpriseCount = Math.floor(count * stitch.surpriseWeight)
       Replace random questions with surprise addition/subtraction

OUTPUT:
  - questions: Question[] (array of 20 questions)

STATE CHANGES:
  - None (questions are ephemeral)
```

### 3.2 Generate Distractor Flow

```
TRIGGER: Question generation needs distractor

INPUT:
  - fact: Fact object
  - boundary_level: number (1-5)

FLOW:
  1. Extract fact properties:
     └─> { answer, conceptType, parameters } = fact
  
  2. Generate distractor by boundary level:
     
     LEVEL 1 - Category Boundary:
       - Generate completely unrelated answer
       - Example: For 24, use "fish", "blue", or "cat"
     
     LEVEL 2 - Magnitude Boundary:
       - Generate order of magnitude difference
       - For 24: 240, 2.4, or 2400
     
     LEVEL 3 - Operation Boundary:
       - Use different operation on same operands
       - For 6×4=24: 10 (6+4), 2 (6-4), or 1.5 (6÷4)
     
     LEVEL 4 - Pattern Near-Miss:
       - Generate close but wrong pattern
       - For 24: 22, 26, or 28 (nearby even numbers)
     
     LEVEL 5 - Conceptual Near-Miss:
       - Very subtle difference
       - For 24: 23 or 25 (off by one)
       - Common computational error
  
  3. Ensure uniqueness:
     └─> IF distractor equals correct answer: regenerate
  
  4. Validate distractor:
     └─> Ensure appropriate for boundary level
     └─> Ensure plausible wrong answer

OUTPUT:
  - distractor: string (single distractor)

STATE CHANGES:
  - None
```

---

## 4. Progress Management Flows

### 4.1 Skip Number Progression Flow

```
TRIGGER: Stitch completed with perfect score

INPUT:
  - current_skip_number: number
  - skip_sequence: [4, 8, 15, 30, 100, 1000]

FLOW:
  1. Find current position in sequence:
     └─> currentIndex = skip_sequence.indexOf(current_skip_number)
  
  2. Calculate next skip number:
     IF currentIndex < skip_sequence.length - 1:
       nextSkipNumber = skip_sequence[currentIndex + 1]
     ELSE:
       nextSkipNumber = 1000  // Max value

OUTPUT:
  - next_skip_number: number

STATE CHANGES:
  - None (calculation only)
```

### 4.2 Position Compression Flow

```
TRIGGER: Gaps in positions exceed threshold OR manual trigger

INPUT:
  - tube_positions: SparsePositionMap
  - user_id: string

FLOW:
  1. Extract all position entries:
     └─> entries = Object.entries(tube_positions)
     └─> Sort by logical position (numerically)
  
  2. Create compressed mapping:
     compressedPositions = {}
     FOR index, [_, stitchId] in enumerate(entries):
       compressedPositions[index + 1] = stitchId
  
  3. Update stitch progress skip numbers:
     FOR each moved stitch:
       IF skipNumber > newMaxPosition:
         skipNumber = min(skipNumber, newMaxPosition)
  
  4. Validate compression:
     - Ensure position 1 exists
     - Ensure no stitches lost
     - Ensure skip numbers still valid
  
  5. Save compressed positions

OUTPUT:
  - compressed_positions: SparsePositionMap
  - compression_report: {
      original_count: number,
      compressed_count: number,
      max_gap_removed: number
    }

STATE CHANGES:
  - Tube positions updated
  - Skip numbers adjusted if needed
```

---

## 5. Admin Flows

### 5.1 Create Stitch Group Flow

```
TRIGGER: Admin creates new stitch group

INPUT:
  - group_name: string
  - concept_template: {
      conceptType: string,
      baseParams: object
    }
  - variations: Array<{paramOverrides: object}>
  - tube_assignment: string

FLOW:
  1. Validate concept template:
     - Ensure conceptType exists
     - Validate parameter schema
  
  2. Generate stitch IDs:
     FOR EACH variation:
       tube_prefix = tube_assignment.replace('tube', 't')
       group_number = getNextGroupNumber(tube_prefix)
       stitch_number = index + 1
       id = `${tube_prefix}-${group_number}-${stitch_number}`
  
  3. Create stitch definitions:
     FOR EACH variation:
       stitch = {
         id: generated_id,
         name: interpolate(group_name, variation),
         tube_id: tube_assignment,
         concept_type: concept_template.conceptType,
         concept_params: merge(baseParams, paramOverrides)
       }
  
  4. Preview generated questions:
     FOR sample stitches:
       questions = generateQuestions(stitch, level=3, count=5)
  
  5. IF approved:
     - Insert stitches into database
     - Add to stitch_groups table
     - Log creation event

OUTPUT:
  - created_stitches: Stitch[]
  - group_id: string
  - preview_questions: Question[]

STATE CHANGES:
  - New stitches in database
  - New stitch group recorded
```

### 5.2 Deploy Content Update Flow

```
TRIGGER: Admin deploys new content to users

INPUT:
  - deployment_config: {
      stitches: StitchConfig[],
      tube_positions: PositionUpdate[],
      target_users: 'all' | 'new' | user_ids[]
    }

FLOW:
  1. Create deployment record:
     {
       deployment_id: uuid,
       timestamp: now(),
       config: deployment_config,
       status: 'pending'
     }
  
  2. Update default_tube_positions:
     FOR EACH position update:
       INSERT or UPDATE position
  
  3. Determine affected users:
     IF target_users === 'all':
       Get all user IDs
     ELSE IF target_users === 'new':
       No immediate updates needed
     ELSE:
       Use provided user_ids
  
  4. FOR EACH affected user:
     a. Load current user_state
     
     b. Merge new positions:
        - Add new stitches at end positions
        - Preserve existing progress
        - Don't disrupt active positions
     
     c. Initialize progress for new stitches:
        skipNumber: 4,
        boundaryLevel: 2,
        lastCompleted: null
     
     d. Save updated state
  
  5. Update deployment status:
     - Record affected_user_count
     - Mark as 'completed'
     - Log any errors

OUTPUT:
  - deployment_result: {
      deployment_id: string,
      affected_users: number,
      new_stitches: number,
      errors: Error[]
    }

STATE CHANGES:
  - default_tube_positions updated
  - User states updated for affected users
  - Deployment record created
```

### 5.3 Content Impact Analysis Flow

```
TRIGGER: Admin previews position change impact

INPUT:
  - tube_id: string
  - position_changes: Array<{
      from: number,
      to: number,
      stitch_id: string
    }>

FLOW:
  1. Query users with affected stitches:
     FOR EACH change:
       Find users where tube has stitch at 'from' position
  
  2. Analyze impact:
     - Count unique affected users
     - Identify users currently on affected stitches
     - Calculate average progress disruption
  
  3. Generate warnings:
     IF any user active on affected stitch:
       "Warning: X users currently playing this stitch"
     IF position 1 changes:
       "Warning: This will change active stitch for Y users"
  
  4. Simulate post-change state:
     Show before/after positions
     Highlight changes

OUTPUT:
  - impact_analysis: {
      affected_users: number,
      active_disruptions: number,
      warnings: string[],
      simulation: BeforeAfterView
    }

STATE CHANGES:
  - None (preview only)
```

---

## Data Flow Visualization Summary

### System-Wide Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│   Server    │────▶│  Database   │
│  (Client)   │◀────│   (API)     │◀────│ (Supabase)  │
└─────────────┘     └─────────────┘     └─────────────┘
       │                    │                    │
       │                    │                    │
       ▼                    ▼                    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Session   │     │  Question   │     │    User     │
│    State    │     │ Generation  │     │   State     │
│  (Memory)   │     │  (Dynamic)  │     │ (Persisted) │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Critical Data Transformations

1. **Stitch Recipe → Questions**: Dynamic generation
2. **User Actions → State Updates**: Progress tracking
3. **Positions → Sparse Storage**: Efficiency optimization
4. **Skip Numbers → Position Shifts**: Spaced repetition
5. **Boundary Levels → Distractor**: Difficulty adaptation

### State Synchronization Points

1. **Session Start**: Load user state from database
2. **Question Answer**: Update session state in memory
3. **Stitch Complete**: Persist all changes to database
4. **Admin Deploy**: Propagate to affected users
5. **Compression**: Reorganize sparse positions

## Implementation Notes

1. **Atomicity**: Stitch completion must be atomic - all position shifts succeed or none do
2. **Caching**: Stitch definitions and fact queries should be cached
3. **Consistency**: User state version checking prevents conflicts
4. **Idempotency**: Position operations must be idempotent
5. **Audit Trail**: All state changes should be logged for debugging

This data flow architecture ensures that the Zenjin Maths system can scale efficiently while maintaining consistency and providing a seamless learning experience.