# Curriculum Management Interface Design

## Executive Summary

This document outlines the design for an intuitive admin interface that enables curriculum designers to manage the flexible Triple Helix learning system. The interface emphasizes visual clarity, drag-and-drop interactions, and real-time feedback while hiding technical complexity.

## Design Principles

1. **Visual First**: Complex relationships are shown visually, not as lists or tables
2. **Direct Manipulation**: Drag-and-drop for assignments, visual controls for priorities
3. **Immediate Feedback**: Changes reflect instantly with visual confirmation
4. **Progressive Disclosure**: Advanced features available but not overwhelming
5. **Error Prevention**: Visual warnings before problems occur

## Information Architecture

```
Content Management
├── Concept Library (Source)
│   ├── All Concepts Grid
│   ├── Search & Filter
│   └── Concept Details Panel
├── Triple Helix Manager (Destination)
│   ├── Tube 1 Container
│   ├── Tube 2 Container
│   ├── Tube 3 Container
│   └── Rotation Preview
├── Priority Manager
│   ├── Visual Priority Scale
│   ├── Conflict Resolution
│   └── Distribution Preview
└── Preview & Testing
    ├── Learner View Simulation
    ├── Content Flow Preview
    └── Balance Analysis
```

## Key Features Design

### 1. Concept-to-Tube Assignment Interface

#### Visual Layout
- **Left Panel**: Concept Library (30% width)
  - Grid view with concept cards
  - Each card shows: ID, Name, Type, Current Assignments
  - Color coding by concept type
  - Badge showing number of tube assignments

- **Center Panel**: Triple Helix Visualization (50% width)
  - Three vertical tubes with visual depth
  - Concepts appear as cards within tubes
  - Priority shown by vertical position (higher = top)
  - Visual rotation animation preview

- **Right Panel**: Details & Actions (20% width)
  - Selected concept/tube details
  - Priority slider
  - Assignment history
  - Quick actions

#### Interaction Patterns
1. **Drag to Assign**: Drag concept card from library to any tube
2. **Drag to Reorder**: Drag within tube to change priority
3. **Multi-Select**: Cmd/Ctrl+click for bulk operations
4. **Context Menu**: Right-click for quick actions

### 2. Triple Helix Visualization

```
┌─────────────────────────────────────────────┐
│            Triple Helix Manager             │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐  │
│  │ TUBE 1  │   │ TUBE 2  │   │ TUBE 3  │  │
│  │ (LIVE)  │   │ (READY) │   │ (PREP)  │  │
│  ├─────────┤   ├─────────┤   ├─────────┤  │
│  │ ●0001   │   │ ●0003   │   │ ●1001   │  │
│  │  P:100  │   │  P:100  │   │  P:100  │  │
│  ├─────────┤   ├─────────┤   ├─────────┤  │
│  │ ●0002   │   │ ●0004   │   │ ●1002   │  │
│  │  P:95   │   │  P:95   │   │  P:90   │  │
│  ├─────────┤   ├─────────┤   ├─────────┤  │
│  │ ●0005   │   │ ●0001   │   │ ●1003   │  │
│  │  P:90   │   │  P:50   │   │  P:85   │  │
│  └─────────┘   └─────────┘   └─────────┘  │
│                                             │
│  [▶ Preview Rotation]  [⚠️ Check Balance]   │
└─────────────────────────────────────────────┘
```

#### Visual Elements
- **Tube States**: Color-coded headers (Green=Live, Blue=Ready, Gray=Preparing)
- **Concept Cards**: Show ID, mini-preview, priority score
- **Rotation Arrow**: Animated preview of how content flows
- **Empty State**: Dashed outline with "Drop concepts here"
- **Warning Indicators**: Red badge for empty/unbalanced tubes

### 3. Priority Management System

#### Visual Priority Scale
```
Priority: [███████████░░░░░░░░░] 85

Distribution Preview:
High (80-100):  ████████ 12 concepts
Medium (40-79): ██████   8 concepts  
Low (0-39):     ██       3 concepts
```

#### Features
- **Slider Control**: Large, accessible slider for each assignment
- **Numeric Input**: Optional precise input
- **Visual Weight**: Card size/opacity reflects priority
- **Conflict Detection**: Highlights when same concept has different priorities
- **Auto-Balance**: Suggest optimal distribution

### 4. Curriculum Preview Mode

#### Preview Interface
```
┌────────────────────────────────────────┐
│        Curriculum Preview Mode         │
├────────────────────────────────────────┤
│ Current Student View:                  │
│ ┌────────────────────────────────────┐ │
│ │  Question 5 of 20                  │ │
│ │  Tube 1 - Concept 0001             │ │
│ │                                    │ │
│ │  What is double 4?                 │ │
│ │                                    │ │
│ │    [7]     [8]                     │ │
│ └────────────────────────────────────┘ │
│                                        │
│ Timeline: ━━━━━━●━━━━━━━━━━━━━━━      │
│           └─Tube Rotation Here         │
│                                        │
│ Next: Tube 2 - Concept 0003           │
└────────────────────────────────────────┘
```

### 5. Bulk Operations Interface

#### Import/Export Modal
```
┌─────────────────────────────────────┐
│      Bulk Operations Manager        │
├─────────────────────────────────────┤
│ ┌─────────────┬─────────────────┐   │
│ │   Import    │     Export      │   │
│ ├─────────────┼─────────────────┤   │
│ │ ⬆️ CSV File │ ⬇️ Current Config│   │
│ │ ⬆️ JSON     │ ⬇️ Template      │   │
│ │ ⬆️ From Env │ ⬇️ Backup        │   │
│ └─────────────┴─────────────────┘   │
│                                     │
│ Templates:                          │
│ ● Basic Math (K-2)                 │
│ ● Advanced Math (3-5)              │
│ ● Multiplication Focus             │
│ ● Balanced Curriculum              │
└─────────────────────────────────────┘
```

## Responsive Design

### Tablet (768px - 1024px)
- Concept library becomes collapsible drawer
- Tubes stack vertically with horizontal scroll
- Priority shown as compact badges

### Mobile (< 768px)
- Single column layout
- Tubes accessed via tabs
- Simplified drag-drop (tap to select, tap to place)

## Accessibility Features

1. **Keyboard Navigation**
   - Tab through all interactive elements
   - Arrow keys for tube navigation
   - Space/Enter for selection
   - Esc to cancel operations

2. **Screen Reader Support**
   - ARIA labels for all actions
   - Announcement of state changes
   - Descriptive alt text

3. **Visual Accessibility**
   - High contrast mode
   - Colorblind-safe palette
   - Scalable interface (up to 200%)

## Implementation Recommendations

### Technology Stack
1. **React DnD Kit**: For accessible drag-and-drop
2. **Framer Motion**: For smooth animations
3. **Tailwind CSS**: Consistent styling
4. **React Query**: Real-time data synchronization

### Component Structure
```typescript
<CurriculumManager>
  <ConceptLibrary />
  <TripleHelixVisualizer>
    <TubeContainer tubeId="tube1" />
    <TubeContainer tubeId="tube2" />
    <TubeContainer tubeId="tube3" />
  </TripleHelixVisualizer>
  <PriorityManager />
  <PreviewMode />
</CurriculumManager>
```

### State Management
```typescript
interface CurriculumState {
  concepts: Concept[]
  mappings: ConceptTubeMapping[]
  tubes: {
    tube1: TubeState
    tube2: TubeState
    tube3: TubeState
  }
  preview: {
    active: boolean
    currentPosition: number
  }
}
```

## User Flows

### Flow 1: Assign Concept to Tube
1. User sees concept in library
2. Drags concept to desired tube
3. System shows drop zone highlight
4. User drops concept
5. Priority modal appears (or auto-assigns)
6. Visual confirmation animation
7. Change saved automatically

### Flow 2: Rebalance Curriculum
1. User clicks "Check Balance"
2. System analyzes distribution
3. Warning shown for issues
4. User clicks "Auto-Balance"
5. Preview of changes shown
6. User confirms or adjusts
7. Changes applied with animation

### Flow 3: Test Curriculum
1. User clicks "Preview Mode"
2. Simulation starts from Tube 1
3. User can skip through questions
4. Rotation points highlighted
5. Issues flagged in real-time
6. User exits to make adjustments

## Success Metrics

1. **Task Completion Time**
   - Assign concept to tube: < 5 seconds
   - Reorder priorities: < 10 seconds
   - Complete curriculum setup: < 5 minutes

2. **Error Prevention**
   - Zero invalid configurations possible
   - All issues caught before save
   - Clear warning for edge cases

3. **User Satisfaction**
   - Intuitive without training
   - Enjoyable to use
   - Confidence in results

## Next Steps

1. Create interactive prototype
2. User testing with curriculum designers
3. Iterate based on feedback
4. Build production components
5. Integration with backend APIs