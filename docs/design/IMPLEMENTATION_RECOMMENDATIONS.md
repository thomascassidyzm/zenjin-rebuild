# Curriculum Management Implementation Recommendations

## Overview

This document provides technical recommendations for implementing the curriculum management interface design. It focuses on React/TypeScript implementation using the existing tech stack.

## Component Architecture

### 1. Core Components Structure

```typescript
// src/components/Admin/CurriculumManager/index.tsx
export const CurriculumManager: React.FC = () => {
  return (
    <DndContext>
      <div className="flex h-screen">
        <ConceptLibrary className="w-1/4" />
        <TripleHelixVisualizer className="flex-1" />
        <DetailsPanel className="w-1/4" />
      </div>
    </DndContext>
  );
};
```

### 2. State Management

```typescript
// src/hooks/useCurriculumState.ts
interface CurriculumState {
  concepts: Concept[];
  mappings: ConceptTubeMapping[];
  tubes: {
    tube1: TubeState;
    tube2: TubeState;
    tube3: TubeState;
  };
  selectedConcept: string | null;
  isDragging: boolean;
  previewMode: boolean;
}

export const useCurriculumState = () => {
  const [state, dispatch] = useReducer(curriculumReducer, initialState);
  
  // Actions
  const assignConceptToTube = useCallback((conceptId: string, tubeId: string, priority: number) => {
    dispatch({ type: 'ASSIGN_CONCEPT', payload: { conceptId, tubeId, priority } });
  }, []);
  
  const updatePriority = useCallback((mappingId: string, priority: number) => {
    dispatch({ type: 'UPDATE_PRIORITY', payload: { mappingId, priority } });
  }, []);
  
  return { state, actions: { assignConceptToTube, updatePriority } };
};
```

### 3. Drag and Drop Implementation

```typescript
// src/components/Admin/CurriculumManager/ConceptCard.tsx
import { useDraggable } from '@dnd-kit/core';

export const ConceptCard: React.FC<{ concept: Concept }> = ({ concept }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: concept.id,
    data: concept
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1
  };
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`concept-card ${isDragging ? 'dragging' : ''}`}
    >
      <div className="font-semibold">{concept.code}</div>
      <div className="text-sm text-gray-600">{concept.name}</div>
      <ConceptBadges tubeAssignments={concept.assignments} />
    </div>
  );
};
```

### 4. Tube Container with Drop Zone

```typescript
// src/components/Admin/CurriculumManager/TubeContainer.tsx
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

export const TubeContainer: React.FC<{ tubeId: string; concepts: ConceptMapping[] }> = ({ 
  tubeId, 
  concepts 
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: tubeId
  });
  
  return (
    <div
      ref={setNodeRef}
      className={`tube ${isOver ? 'drag-over' : ''}`}
    >
      <TubeHeader tubeId={tubeId} status={getTubeStatus(tubeId)} />
      
      <SortableContext items={concepts} strategy={verticalListSortingStrategy}>
        {concepts.map(concept => (
          <SortableConceptCard key={concept.id} concept={concept} />
        ))}
      </SortableContext>
      
      {concepts.length === 0 && <EmptyTubePrompt />}
    </div>
  );
};
```

### 5. Priority Management Component

```typescript
// src/components/Admin/CurriculumManager/PrioritySlider.tsx
export const PrioritySlider: React.FC<{ 
  value: number; 
  onChange: (value: number) => void;
  conceptId: string;
}> = ({ value, onChange, conceptId }) => {
  const [localValue, setLocalValue] = useState(value);
  const [showNumeric, setShowNumeric] = useState(false);
  
  const debouncedOnChange = useMemo(
    () => debounce(onChange, 300),
    [onChange]
  );
  
  const handleChange = (newValue: number) => {
    setLocalValue(newValue);
    debouncedOnChange(newValue);
  };
  
  return (
    <div className="flex items-center space-x-2">
      <span className="text-xs text-gray-500">Priority:</span>
      <div className="flex-1 relative">
        <input
          type="range"
          min={0}
          max={100}
          value={localValue}
          onChange={(e) => handleChange(parseInt(e.target.value))}
          className="w-full"
        />
        <div 
          className="absolute top-0 left-0 h-2 bg-blue-500 rounded-full pointer-events-none"
          style={{ width: `${localValue}%` }}
        />
      </div>
      {showNumeric ? (
        <input
          type="number"
          min={0}
          max={100}
          value={localValue}
          onChange={(e) => handleChange(parseInt(e.target.value))}
          className="w-12 text-xs p-1 border rounded"
        />
      ) : (
        <span 
          onClick={() => setShowNumeric(true)}
          className="text-xs font-semibold cursor-pointer"
        >
          {localValue}
        </span>
      )}
    </div>
  );
};
```

### 6. API Integration Layer

```typescript
// src/services/CurriculumService.ts
export class CurriculumService {
  async getConceptMappings(): Promise<ConceptTubeMapping[]> {
    const response = await fetch('/api/admin/concept-tube-mappings');
    if (!response.ok) throw new Error('Failed to fetch mappings');
    return response.json();
  }
  
  async updateMapping(mapping: ConceptTubeMapping): Promise<ConceptTubeMapping> {
    const response = await fetch('/api/admin/concept-tube-mappings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mapping)
    });
    if (!response.ok) throw new Error('Failed to update mapping');
    return response.json();
  }
  
  async createMapping(data: Omit<ConceptTubeMapping, 'id'>): Promise<ConceptTubeMapping> {
    const response = await fetch('/api/admin/concept-tube-mappings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create mapping');
    return response.json();
  }
  
  async deleteMapping(id: string): Promise<void> {
    const response = await fetch(`/api/admin/concept-tube-mappings/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete mapping');
  }
  
  async previewCurriculum(config: CurriculumConfig): Promise<PreviewResult> {
    const response = await fetch('/api/admin/curriculum/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    if (!response.ok) throw new Error('Failed to generate preview');
    return response.json();
  }
}
```

### 7. Real-time Synchronization

```typescript
// src/hooks/useRealtimeSync.ts
export const useRealtimeSync = (channel: string) => {
  const supabase = useSupabaseClient();
  
  useEffect(() => {
    const subscription = supabase
      .channel(channel)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'concept_tube_mappings'
      }, (payload) => {
        handleRealtimeUpdate(payload);
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [channel]);
  
  const handleRealtimeUpdate = (payload: any) => {
    switch (payload.eventType) {
      case 'INSERT':
        // Add new mapping to local state
        break;
      case 'UPDATE':
        // Update existing mapping
        break;
      case 'DELETE':
        // Remove mapping from local state
        break;
    }
  };
};
```

### 8. Accessibility Enhancements

```typescript
// src/components/Admin/CurriculumManager/AccessibleDragDrop.tsx
export const AccessibleConceptCard: React.FC<{ concept: Concept }> = ({ concept }) => {
  const [isSelected, setIsSelected] = useState(false);
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setIsSelected(!isSelected);
    } else if (isSelected) {
      // Handle arrow keys for moving
      switch (e.key) {
        case 'ArrowRight':
          moveToNextTube();
          break;
        case 'ArrowLeft':
          moveToPreviousTube();
          break;
        case 'ArrowUp':
          increasePriority();
          break;
        case 'ArrowDown':
          decreasePriority();
          break;
      }
    }
  };
  
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Concept ${concept.code}: ${concept.name}. Press space to select.`}
      onKeyDown={handleKeyDown}
      className={`concept-card ${isSelected ? 'selected' : ''}`}
    >
      {/* Card content */}
    </div>
  );
};
```

## Performance Optimizations

### 1. Virtual Scrolling for Large Concept Lists

```typescript
import { FixedSizeList } from 'react-window';

export const ConceptLibrary: React.FC = () => {
  const concepts = useConceptLibrary();
  
  const Row = ({ index, style }) => (
    <div style={style}>
      <ConceptCard concept={concepts[index]} />
    </div>
  );
  
  return (
    <FixedSizeList
      height={600}
      itemCount={concepts.length}
      itemSize={80}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
};
```

### 2. Optimistic Updates

```typescript
const useOptimisticMappings = () => {
  const queryClient = useQueryClient();
  
  const updateMapping = useMutation(
    (mapping: ConceptTubeMapping) => curriculumService.updateMapping(mapping),
    {
      onMutate: async (newMapping) => {
        await queryClient.cancelQueries(['mappings']);
        const previousMappings = queryClient.getQueryData(['mappings']);
        
        queryClient.setQueryData(['mappings'], (old: ConceptTubeMapping[]) => {
          return old.map(m => m.id === newMapping.id ? newMapping : m);
        });
        
        return { previousMappings };
      },
      onError: (err, newMapping, context) => {
        queryClient.setQueryData(['mappings'], context.previousMappings);
      },
      onSettled: () => {
        queryClient.invalidateQueries(['mappings']);
      }
    }
  );
  
  return { updateMapping };
};
```

## Testing Strategy

### 1. Component Tests

```typescript
// src/components/Admin/CurriculumManager/__tests__/TubeContainer.test.tsx
describe('TubeContainer', () => {
  it('should accept dropped concepts', async () => {
    const { getByTestId } = render(
      <DndContext>
        <TubeContainer tubeId="tube1" concepts={[]} />
      </DndContext>
    );
    
    const tube = getByTestId('tube-container-tube1');
    
    // Simulate drag and drop
    fireEvent.drop(tube, {
      dataTransfer: {
        getData: () => JSON.stringify({ id: 'concept-001' })
      }
    });
    
    await waitFor(() => {
      expect(mockOnDrop).toHaveBeenCalledWith('concept-001', 'tube1');
    });
  });
});
```

### 2. Integration Tests

```typescript
// src/components/Admin/CurriculumManager/__tests__/integration.test.tsx
describe('Curriculum Manager Integration', () => {
  it('should persist changes to the database', async () => {
    const { getByTestId, getByText } = render(<CurriculumManager />);
    
    // Drag concept to tube
    const concept = getByTestId('concept-0001');
    const tube2 = getByTestId('tube-container-tube2');
    
    dragAndDrop(concept, tube2);
    
    // Set priority
    const prioritySlider = await waitFor(() => getByTestId('priority-slider-0001'));
    fireEvent.change(prioritySlider, { target: { value: '80' } });
    
    // Verify API call
    await waitFor(() => {
      expect(mockApi.createMapping).toHaveBeenCalledWith({
        concept_code: '0001',
        tube_id: 'tube2',
        priority: 80
      });
    });
  });
});
```

## Deployment Considerations

1. **Feature Flags**: Implement feature flags to gradually roll out the new interface
2. **Migration Path**: Provide import/export tools for existing curriculum data
3. **Training Materials**: Create interactive tutorials for curriculum designers
4. **Performance Monitoring**: Add tracking for drag-drop operations and API response times
5. **Error Recovery**: Implement robust error handling with user-friendly messages

## Timeline Estimate

- **Phase 1** (2 weeks): Core drag-drop functionality and tube visualization
- **Phase 2** (2 weeks): Priority management and real-time sync
- **Phase 3** (1 week): Preview mode and bulk operations
- **Phase 4** (1 week): Polish, accessibility, and testing

Total: 6 weeks for full implementation