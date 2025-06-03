# Zenjin Maths - Data Flow Diagrams

## Visual Data Flow Representations

This document provides visual diagrams for the key data flows in the Zenjin Maths system using Mermaid syntax. These can be rendered in any Markdown viewer that supports Mermaid.

## 1. User Session Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Login: User Arrives
    Login --> LoadUserState: Valid Credentials
    Login --> [*]: Invalid
    
    LoadUserState --> CheckMigration: State Loaded
    CheckMigration --> SessionInit: Up to Date
    CheckMigration --> MigrateState: Needs Update
    MigrateState --> SessionInit: Migration Complete
    
    SessionInit --> GenerateQuestions: Get Active Stitch
    GenerateQuestions --> DisplayQuestion: 20 Questions Ready
    
    DisplayQuestion --> CheckAnswer: User Answers
    CheckAnswer --> DisplayQuestion: Incorrect (Repeat)
    CheckAnswer --> NextQuestion: Correct
    NextQuestion --> DisplayQuestion: More Questions
    NextQuestion --> StitchComplete: All 20 Done
    
    StitchComplete --> UpdateProgress: Calculate Score
    UpdateProgress --> ShiftPositions: Perfect Score
    UpdateProgress --> SaveState: Imperfect Score
    ShiftPositions --> RotateHelix: Positions Updated
    RotateHelix --> SaveState: Helix Rotated
    
    SaveState --> [*]: Session End
```

## 2. Question Generation Pipeline

```mermaid
flowchart TB
    Start([Session Needs Questions]) --> GetStitch[Load Stitch Definition]
    GetStitch --> ExtractParams[Extract Concept Parameters]
    
    ExtractParams --> QueryFacts[Query Facts by Concept]
    QueryFacts --> CheckCount{Enough Facts?}
    
    CheckCount -->|Yes| ShuffleFacts[Shuffle & Select 20]
    CheckCount -->|No| Error[Error: Insufficient Facts]
    
    ShuffleFacts --> GenLoop[For Each Fact]
    
    GenLoop --> GenDistractors[Generate Distractor by Boundary Level]
    GenDistractors --> L1[Level 1: Category]
    GenDistractors --> L2[Level 2: Magnitude]
    GenDistractors --> L3[Level 3: Operation]
    GenDistractors --> L4[Level 4: Pattern]
    GenDistractors --> L5[Level 5: Conceptual]
    
    L1 --> SelectTemplate[Select Question Template]
    L2 --> SelectTemplate
    L3 --> SelectTemplate
    L4 --> SelectTemplate
    L5 --> SelectTemplate
    
    SelectTemplate --> CreateQuestion[Create Question Object]
    CreateQuestion --> AddToArray[Add to Questions Array]
    
    AddToArray --> CheckComplete{20 Questions?}
    CheckComplete -->|No| GenLoop
    CheckComplete -->|Yes| ApplySurprise[Apply 90/10 Mix]
    
    ApplySurprise --> Output([Return Questions])
```

## 3. Stitch Progression Algorithm

```mermaid
flowchart LR
    Start([Stitch Completed]) --> CheckScore{Score = 20/20?}
    
    CheckScore -->|No| ResetSkip[Reset Skip to 4]
    CheckScore -->|Yes| Progress[Progress Stitch]
    
    Progress --> RemoveP1[Remove from Position 1]
    RemoveP1 --> ShiftLoop[Shift Positions 1-SkipNumber]
    
    ShiftLoop --> P2[Position 2 → 1]
    ShiftLoop --> P3[Position 3 → 2]
    ShiftLoop --> PN[Position N → N-1]
    
    P2 --> PlaceSkip
    P3 --> PlaceSkip
    PN --> PlaceSkip[Place at Skip Position]
    
    PlaceSkip --> IncSkip[Increment Skip Number]
    IncSkip --> S1[4 → 8]
    IncSkip --> S2[8 → 15]
    IncSkip --> S3[15 → 30]
    IncSkip --> S4[30 → 100]
    IncSkip --> S5[100 → 1000]
    
    S1 --> IncBoundary
    S2 --> IncBoundary
    S3 --> IncBoundary
    S4 --> IncBoundary
    S5 --> IncBoundary[Increase Boundary Level]
    
    IncBoundary --> RotateHelix[Rotate Triple Helix]
    ResetSkip --> RotateHelix
    
    RotateHelix --> SaveState([Save User State])
```

## 4. Sparse Position Management

```mermaid
graph TB
    subgraph "Logical Positions"
        L1[Position 1: Stitch A]
        L4[Position 4: Empty]
        L8[Position 8: Stitch B]
        L15[Position 15: Empty]
        L30[Position 30: Empty]
        L100[Position 100: Stitch C]
    end
    
    subgraph "Physical Storage"
        P1["1: 'stitch-A'"]
        P2["8: 'stitch-B'"]
        P3["100: 'stitch-C'"]
    end
    
    subgraph "After Compression"
        C1["1: 'stitch-A'"]
        C2["2: 'stitch-B'"]
        C3["3: 'stitch-C'"]
    end
    
    L1 --> P1
    L8 --> P2
    L100 --> P3
    
    P1 --> C1
    P2 --> C2
    P3 --> C3
    
    Compress[Compression Process] --> Note[Gaps Removed,<br/>Positions Sequential]
```

## 5. Triple Helix Data Flow

```mermaid
flowchart TB
    subgraph "User State"
        Active[Active Tube: 1]
        T1[Tube 1: Knowledge]
        T2[Tube 2: Skills]
        T3[Tube 3: Application]
    end
    
    subgraph "Session Flow"
        Start([Session Start]) --> GetActive[Get Active Tube]
        GetActive --> LoadStitch[Load Position 1 Stitch]
        LoadStitch --> Play[Play 20 Questions]
        Play --> Complete[Complete Stitch]
    end
    
    subgraph "Rotation"
        Complete --> Rotate{Rotate Helix}
        Rotate -->|Tube 1| SetT2[Set Active = 2]
        Rotate -->|Tube 2| SetT3[Set Active = 3]
        Rotate -->|Tube 3| SetT1[Set Active = 1]
    end
    
    Active -.-> GetActive
    T1 -.-> LoadStitch
    
    SetT2 --> NextSession[Next Session]
    SetT3 --> NextSession
    SetT1 --> NextSession
```

## 6. Admin Content Deployment Flow

```mermaid
sequenceDiagram
    participant Admin
    participant System
    participant DefaultPositions
    participant UserStates
    participant Users
    
    Admin->>System: Create Stitch Group
    System->>System: Generate Stitch IDs
    System->>System: Preview Questions
    System-->>Admin: Show Preview
    
    Admin->>System: Approve & Deploy
    System->>DefaultPositions: Update Default Positions
    
    System->>UserStates: Query Affected Users
    UserStates-->>System: User List
    
    loop For Each User
        System->>UserStates: Load User State
        System->>System: Merge New Positions
        System->>System: Initialize New Progress
        System->>UserStates: Save Updated State
    end
    
    System-->>Admin: Deployment Complete
    System->>Users: New Content Available
```

## 7. Data Transformation Pipeline

```mermaid
graph LR
    subgraph "Input Layer"
        SR[Stitch Recipe]
        UL[User Level]
        FD[Fact Database]
    end
    
    subgraph "Transformation"
        QG[Question Generator]
        DG[Distractor Generator]
        TF[Template Formatter]
    end
    
    subgraph "Output Layer"
        QA[Question Array]
        SO[Shuffled Options]
        RT[Rendered Text]
    end
    
    SR --> QG
    UL --> DG
    FD --> QG
    
    QG --> TF
    DG --> SO
    TF --> RT
    
    RT --> QA
    SO --> QA
```

## 8. State Synchronization Flow

```mermaid
flowchart TB
    subgraph "Client State"
        CS[Current Session]
        CQ[Current Question]
        CP[Current Points]
    end
    
    subgraph "Server State"
        SS[Session State]
        QC[Question Cache]
        VS[Validation State]
    end
    
    subgraph "Database State"
        US[User State]
        SP[Stitch Progress]
        TP[Tube Positions]
    end
    
    CS <-->|Real-time| SS
    CQ <-->|Per Question| QC
    CP <-->|On Answer| VS
    
    SS -->|On Complete| US
    VS -->|On Complete| SP
    SS -->|On Progress| TP
    
    US -->|On Start| SS
    SP -->|On Start| CS
    TP -->|On Start| CS
```

## 9. Error Recovery Flow

```mermaid
stateDiagram-v2
    [*] --> Normal: System Operating
    
    Normal --> ErrorState: Error Detected
    
    state ErrorState {
        [*] --> IdentifyError
        IdentifyError --> NetworkError: Connection Lost
        IdentifyError --> StateError: Invalid State
        IdentifyError --> DataError: Missing Data
        
        NetworkError --> RetryConnection
        RetryConnection --> ResumeSession: Success
        RetryConnection --> OfflineMode: Failed
        
        StateError --> LoadBackup
        LoadBackup --> ValidateState
        ValidateState --> ResumeSession: Valid
        ValidateState --> ResetSession: Invalid
        
        DataError --> RegeneratData
        RegeneratData --> ResumeSession: Success
        RegeneratData --> ResetSession: Failed
    }
    
    ResumeSession --> Normal: Recovered
    ResetSession --> Normal: Fresh Start
    OfflineMode --> QueueUpdates: Store Locally
    QueueUpdates --> SyncWhenOnline: Connection Restored
    SyncWhenOnline --> Normal: Synced
```

## 10. Performance Optimization Flow

```mermaid
flowchart TB
    subgraph "Cache Layer"
        SC[Stitch Cache<br/>LRU 1000 items]
        FC[Fact Cache<br/>LRU 10000 items]
        UC[User Cache<br/>LRU 100 items]
    end
    
    subgraph "Request Flow"
        Req[Incoming Request] --> CheckCache{In Cache?}
        CheckCache -->|Hit| ReturnCached[Return Cached Data]
        CheckCache -->|Miss| LoadDB[Load from Database]
        LoadDB --> UpdateCache[Update Cache]
        UpdateCache --> ReturnFresh[Return Fresh Data]
    end
    
    subgraph "Background Jobs"
        WarmCache[Cache Warming]
        CompressPositions[Position Compression]
        CleanupOld[Cleanup Old Data]
    end
    
    SC -.-> CheckCache
    FC -.-> CheckCache
    UC -.-> CheckCache
    
    WarmCache -.-> SC
    WarmCache -.-> FC
    CompressPositions -.-> UC
```

## 11. Metrics and Points Calculation Flow

```mermaid
flowchart TB
    Start([User Answers Question]) --> Record[Record Answer]
    
    Record --> CheckCorrect{Is Correct?}
    
    CheckCorrect -->|Yes| CheckFirst{First Attempt?}
    CheckCorrect -->|No| RecordIncorrect[Record as Incorrect<br/>0 points]
    
    CheckFirst -->|Yes| RecordFTC[Record FTC<br/>3 points]
    CheckFirst -->|No| RecordEC[Record EC<br/>1 point]
    
    RecordFTC --> UpdateMetrics[Update Session Metrics]
    RecordEC --> UpdateMetrics
    RecordIncorrect --> UpdateMetrics
    
    UpdateMetrics --> CalcConsistency[Calculate Consistency]
    UpdateMetrics --> CalcAccuracy[Calculate Accuracy]
    UpdateMetrics --> CalcSpeed[Calculate Speed]
    
    CalcConsistency --> UpdateBonus[Update Bonus Multiplier]
    CalcAccuracy --> UpdateBonus
    CalcSpeed --> UpdateBonus
```

## 12. Session Summary Generation

```mermaid
flowchart LR
    Complete([Session Complete]) --> GatherData[Gather Session Data]
    
    GatherData --> CalcBase[Calculate Base Points]
    CalcBase --> FTC[FTC Count × 3]
    CalcBase --> EC[EC Count × 1]
    
    GatherData --> CalcMetrics[Calculate Performance Metrics]
    CalcMetrics --> Consistency[Consistency Score]
    CalcMetrics --> Accuracy[Accuracy Score]
    CalcMetrics --> Speed[Speed Score]
    
    Consistency --> BonusCalc[Calculate Bonus Multiplier]
    Accuracy --> BonusCalc
    Speed --> BonusCalc
    
    BonusCalc --> SelectBonus[Select Highest Bonus<br/>MAX(Consistency, Excellence, Speed)]
    SelectBonus --> FinalMultiplier[Final Multiplier<br/>Ranges from x2 to x30]
    
    FTC --> TotalCalc[Calculate Total Points]
    EC --> TotalCalc
    FinalMultiplier --> TotalCalc
    
    TotalCalc --> SessionSummary[Generate Session Summary]
    
    GatherData --> BlinkCalc[Calculate Blink Speed]
    BlinkCalc --> SessionSummary
```

## 13. Bonus Multiplier System

```mermaid
graph TB
    subgraph "Three Bonus Categories"
        C[Consistency Bonus<br/>Valid Sessions Over Time]
        A[Excellence Bonus<br/>FTC Percentage]
        S[Speed Bonus<br/>Blink Speed]
    end
    
    subgraph "Consistency Calculation"
        C --> VS[Count Valid Sessions<br/>Sessions with >100 questions]
        VS --> CT[Check Time Windows<br/>3 days, 12 days, 35 days]
        CT --> CB[Consistency Multiplier]
    end
    
    subgraph "Excellence Calculation"
        A --> FTC[Calculate FTC %<br/>in Current Session]
        FTC --> AT[Check Thresholds<br/>80%, 90%, 100%]
        AT --> AB[Excellence Multiplier]
    end
    
    subgraph "Speed Calculation"
        S --> BS[Calculate Blink Speed<br/>Total Time ÷ FTC Count]
        BS --> ST[Check Thresholds<br/><3.0s, <2.0s]
        ST --> SB[Speed Multiplier]
    end
    
    CB --> MAX[Select Maximum<br/>Bonus]
    AB --> MAX
    SB --> MAX
    
    MAX --> Final[Final Multiplier<br/>Applied to Base Points]
    
    subgraph "Easter Egg Design"
        Hidden[Thresholds Not Shown<br/>Discovery Through Play]
        Hidden -.-> MAX
    end
```

## 14. Evolution Score Calculation

```mermaid
flowchart TB
    Session([Session Ends]) --> Summary[Session Summary]
    
    Summary --> UpdateLife[Update Lifetime Metrics]
    
    UpdateLife --> Sessions[Total Sessions + 1]
    UpdateLife --> Questions[Total Questions + 20]
    UpdateLife --> Points[Total Points + Session Points]
    UpdateLife --> FTCLife[Lifetime FTC + Session FTC]
    
    Sessions --> CalcAvg[Calculate Averages]
    Questions --> CalcAvg
    Points --> CalcAvg
    FTCLife --> CalcAvg
    
    CalcAvg --> CalcEvo[Calculate Evolution]
    
    subgraph "Evolution Formula"
        CalcEvo --> GetTotal[Total Lifetime Points]
        CalcEvo --> GetBlink[Average Blink Speed]
        
        GetTotal --> Evolution[Evolution =<br/>Total Points ÷<br/>Avg Blink Speed]
        GetBlink --> Evolution
    end
    
    Evolution --> Ranking[Calculate Global Ranking]
    Ranking --> Store[Store Updated Metrics]
```

## 15. Global Ranking System

```mermaid
flowchart TB
    User([User Metrics]) --> Points[Total Points]
    User --> Evo[Evolution Score]
    User --> Activity[Recent Activity]
    
    Points --> PointRank[Points Percentile<br/>vs All Users]
    Evo --> EvoRank[Evolution Percentile<br/>vs All Users]
    Activity --> ActRank[Activity Percentile<br/>vs Active Users]
    
    PointRank --> Weight[Weighted Average<br/>Points: 40%<br/>Evolution: 40%<br/>Activity: 20%]
    EvoRank --> Weight
    ActRank --> Weight
    
    Weight --> Global[Global Ranking<br/>Percentile]
    
    Global --> Display[Display as<br/>"Top X%"]
    
    subgraph "Ranking Tiers"
        Display --> Elite[Top 1%: Elite]
        Display --> Expert[Top 5%: Expert]
        Display --> Advanced[Top 20%: Advanced]
        Display --> Intermediate[Top 50%: Intermediate]
        Display --> Beginner[Bottom 50%: Beginner]
    end
```

## Implementation Guidelines

### Using These Diagrams

1. **Technology Agnostic**: These flows work with any tech stack
2. **Atomic Operations**: Boxes in flows should be atomic operations
3. **Error Handling**: Each flow should have error paths
4. **Logging Points**: Log at each major state transition
5. **Testing Boundaries**: Test at each decision point

### Key Patterns to Implement

1. **Sparse Storage**: Use maps/dictionaries, not arrays
2. **Atomic Updates**: Use transactions for state changes
3. **Caching Strategy**: Cache immutable data aggressively
4. **Event Sourcing**: Log all state transitions
5. **Graceful Degradation**: Handle partial failures

### Performance Considerations

1. **Batch Operations**: Group database updates
2. **Lazy Loading**: Load data only when needed
3. **Optimistic Updates**: Update UI before server confirms
4. **Background Processing**: Defer non-critical updates
5. **Connection Pooling**: Reuse database connections