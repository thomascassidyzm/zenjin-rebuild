# Curriculum Management User Flows

## Primary User Flows

### Flow 1: First-Time Curriculum Setup

```mermaid
flowchart TD
    A[Admin enters Curriculum Management] --> B[See empty Triple Helix visualization]
    B --> C[View Concept Library on left]
    C --> D{Choose setup method}
    D -->|Manual| E[Drag first concept to Tube 1]
    D -->|Template| F[Select curriculum template]
    D -->|Import| G[Upload existing configuration]
    
    E --> H[Priority dialog appears]
    H --> I[Set priority value]
    I --> J[Concept appears in tube]
    J --> K[Continue adding concepts]
    K --> L{All tubes have content?}
    L -->|No| E
    L -->|Yes| M[Check balance indicator]
    M --> N{Balance OK?}
    N -->|No| O[Use auto-balance feature]
    N -->|Yes| P[Preview curriculum flow]
    O --> P
    P --> Q[Save configuration]
    
    F --> R[Template loads with defaults]
    R --> S[Review and adjust]
    S --> M
    
    G --> T[System validates import]
    T --> U{Valid?}
    U -->|Yes| S
    U -->|No| V[Show error, return to C]
```

### Flow 2: Modifying Existing Curriculum

```mermaid
flowchart TD
    A[Admin enters with existing config] --> B[See current tube assignments]
    B --> C{What to modify?}
    
    C -->|Add concept| D[Find concept in library]
    D --> E[Drag to target tube]
    E --> F[Set priority]
    F --> G[Update complete]
    
    C -->|Remove concept| H[Click X on concept card]
    H --> I[Confirm removal]
    I --> G
    
    C -->|Change priority| J[Click on concept in tube]
    J --> K[Adjust priority slider]
    K --> L[See real-time reordering]
    L --> G
    
    C -->|Move between tubes| M[Drag concept from tube to tube]
    M --> N[Maintain or update priority]
    N --> G
    
    G --> O[Changes auto-saved]
    O --> P{Continue editing?}
    P -->|Yes| C
    P -->|No| Q[Exit or preview]
```

### Flow 3: Using Priority Management

```mermaid
flowchart TD
    A[Select concept with multiple assignments] --> B[See all tube assignments]
    B --> C[View priority conflicts]
    C --> D{Resolution method?}
    
    D -->|Manual| E[Adjust each priority individually]
    E --> F[See visual feedback]
    F --> G[Priorities updated]
    
    D -->|Auto-resolve| H[Click resolve conflicts]
    H --> I[System suggests priorities]
    I --> J{Accept suggestions?}
    J -->|Yes| G
    J -->|No| K[Modify suggestions]
    K --> G
    
    G --> L[Check distribution graph]
    L --> M{Distribution balanced?}
    M -->|No| N[Rebalance priorities]
    M -->|Yes| O[Complete]
    N --> L
```

### Flow 4: Preview Mode Testing

```mermaid
flowchart TD
    A[Click Preview Mode] --> B[Simulation interface opens]
    B --> C[Start as student would]
    C --> D[See first question from Tube 1]
    D --> E[Answer questions]
    E --> F{20 questions complete?}
    F -->|No| E
    F -->|Yes| G[See tube rotation animation]
    G --> H[Continue with Tube 2 active]
    H --> I{Issues detected?}
    I -->|Yes| J[Flag issue in preview]
    I -->|No| K[Continue testing]
    J --> L[Exit preview to fix]
    K --> M{Test complete?}
    M -->|No| E
    M -->|Yes| N[Review test summary]
    N --> O[Return to editor]
    L --> O
```

### Flow 5: Bulk Operations

```mermaid
flowchart TD
    A[Click Import/Export] --> B[Modal opens]
    B --> C{Choose operation}
    
    C -->|Import| D[Select file or source]
    D --> E[Upload/Select]
    E --> F[Preview import changes]
    F --> G{Confirm?}
    G -->|Yes| H[Apply changes]
    G -->|No| I[Cancel, return to editor]
    
    C -->|Export| J[Choose format]
    J --> K[Select items to export]
    K --> L[Generate export]
    L --> M[Download file]
    
    C -->|Template| N[Browse templates]
    N --> O[Preview template]
    O --> P{Use this template?}
    P -->|Yes| Q[Load template]
    P -->|No| N
    Q --> R[Customize if needed]
    
    H --> S[Show success message]
    M --> S
    R --> S
```

## Error Handling Flows

### Error Flow 1: Invalid Assignment Attempt

```mermaid
flowchart TD
    A[Drag incompatible concept] --> B[Drop zone shows warning]
    B --> C[Drop action prevented]
    C --> D[Error message appears]
    D --> E[Suggestion provided]
    E --> F[User acknowledges]
    F --> G[Return to normal state]
```

### Error Flow 2: Unbalanced Curriculum Detection

```mermaid
flowchart TD
    A[System detects imbalance] --> B[Warning indicator appears]
    B --> C[User clicks warning]
    C --> D[Detailed issue explanation]
    D --> E{User choice}
    E -->|Fix manually| F[Guided to problem areas]
    E -->|Auto-fix| G[System rebalances]
    E -->|Ignore| H[Warning remains visible]
    F --> I[User makes changes]
    G --> J[Review auto-fix]
    I --> K[Recheck balance]
    J --> K
    K --> L{Fixed?}
    L -->|No| D
    L -->|Yes| M[Warning cleared]
```

## Accessibility Flows

### Keyboard Navigation Flow

```mermaid
flowchart TD
    A[User tabs to concept] --> B[Concept highlighted]
    B --> C[Press Space to select]
    C --> D[Concept selected state]
    D --> E{Navigate with arrows}
    E -->|Left/Right| F[Move between tubes]
    E -->|Up/Down| G[Adjust priority]
    F --> H[Press Enter to confirm]
    G --> I[Hear priority announced]
    H --> J[Assignment complete]
    I --> J
    J --> K[Focus returns to concept]
```

## Mobile/Tablet Flows

### Touch-Based Assignment Flow

```mermaid
flowchart TD
    A[Tap concept in library] --> B[Concept selected]
    B --> C[Tube drop zones highlight]
    C --> D[Tap target tube]
    D --> E[Priority picker appears]
    E --> F[Use slider or number pad]
    F --> G[Tap confirm]
    G --> H[Concept assigned]
    H --> I[Can drag to reorder]
    I --> J[Long press for options]
    J --> K[Context menu appears]
```

## Performance Considerations

1. **Loading States**: Show skeleton screens while data loads
2. **Optimistic Updates**: Apply changes immediately, revert on error
3. **Debounced Saves**: Auto-save after 500ms of inactivity
4. **Progressive Loading**: Load concepts in batches for large datasets
5. **Cached Previews**: Store preview results for quick access

## Success Metrics

- **Time to first assignment**: < 10 seconds
- **Complete curriculum setup**: < 5 minutes
- **Error recovery**: < 30 seconds
- **Preview generation**: < 2 seconds
- **Bulk import processing**: < 5 seconds for 1000 concepts