# Zenjin Maths App Rebuild

## Vision: Netflix for Maths

**A single-stream, adaptive mathematics learning platform built on distinction-based learning theory with zero decision fatigue for learners.**

This project is a complete architectural rebuild of the Zenjin Maths App using the APML Framework v1.4.2, implementing a scientifically-grounded approach to mathematical learning that adapts invisibly to each user's cognitive development.

## Core Learning Philosophy: Distinction as Primitive

### The Foundation
Learning happens through **distinction formation** - the ability to draw boundaries between "this" and "not-this." Every mathematical concept emerges from increasingly refined boundary-making capabilities under energy constraints.

### Why Traditional Math Education Fails
- **Explanation-first approach** violates how the brain actually learns
- **Cognitive overload** from trying to teach concepts through language
- **Energy inefficiency** from forcing conscious calculation over pattern recognition
- **One-size-fits-all** ignoring individual distinction formation rates

### The Zenjin Approach
- **Zero-explanation learning** through pure comparison opportunities
- **Progressive boundary refinement** from gross to subtle distinctions
- **Automatic intuition formation** through pattern recognition development
- **Energy-optimized** adaptive content generation

## Architecture: Clean Separation for Infinite Adaptability

### Three-Layer Design

**1. App Layer (Simple & Stable)**
```typescript
// App only knows: "Give me content for this stitch"
const content = await getStitchContent('t1-0007-0023');
// Gets back: Optimized questions (could be 20, 10, 5, whatever is best)
```

**2. State Layer (User's Learning Journey)**
```typescript
// Tracks WHERE user is and HOW they're progressing
interface UserLearningState {
  tubes: { tube1: PositionMap, tube2: PositionMap, tube3: PositionMap };
  activeTube: TubeId;
  stitchProgress: Record<StitchId, Progress>;
}
```

**3. Content Layer (Hidden Sophistication)**
```typescript
// All the AI/adaptation magic happens here - invisible to the app
// Same stitch ID produces different content as user evolves:
// Week 1: 20 basic questions
// Week 10: 10 optimized questions focusing on weak spots  
// Week 50: 5 maintenance questions for boundary preservation
```

### The Genius: Evolutionary Architecture
- **Ship simple, working system immediately**
- **Add infinite AI sophistication without changing the app**
- **A/B test learning algorithms without UI changes**
- **Scale from basic to world-class without rewrites**

## Triple Helix Learning System

### Live Aid Stage Model
- **3 Tubes** acting as containers with position slots
- **Live Aid rotation**: PLAYING → READY → PREPARING
- **Background preparation** ensures seamless flow
- **No decision fatigue** for learners

### Positions as First-Class Citizens
```
Tube 1: Position 1: [Stitch A], Position 4: [Stitch B], Position 15: [Stitch C]
Tube 2: Position 1: [Stitch D], Position 8: [Stitch E], Position 30: [Stitch F]
Tube 3: Position 1: [Stitch G], Position 2: [Stitch H], Position 100: [Stitch I]
```

### Spaced Repetition with Compression
- **Skip sequence**: [4, 8, 15, 30, 100, 1000] 
- **Logical positions** can exceed stitch count
- **Real-time compression** during state sync
- **Retirement at position 1000** for monthly review

## Stitch System: Atomic Learning Units

### Enhanced Stitch IDs: tX-YYYY-ZZZZ
- **X**: Tube number (1, 2, 3)
- **YYYY**: Concept code (0001-9999, tube-specific)
- **ZZZZ**: Creation order within concept (0001-9999)
- **Capacity**: 299,970,003 total possible stitches

### Parameterized Content Generation
**Not fixed containers, but adaptive recipes:**
```typescript
StitchParameters = {
  conceptId: '7x_table',
  questionCount: 20,          // Adapts: 20 → 15 → 10 → 5
  difficultyRange: [1, 20],   // Adapts: [1,20] → [5,15] → [8,12]
  boundaryLevel: 3,           // Ratchets: 1 → 2 → 3 → 4 → 5
  adaptiveBehaviors: { ... }  // Infinite customization potential
}
```

## User State: Personal Learning Journey

### Netflix-Style Personalization
```typescript
// Anonymous users: Always same default state (fast onboarding)
defaultState = {
  tube1: { 1: 't1-0001-0001', 2: 't1-0001-0002', ... }
  tube2: { 1: 't2-0001-0001', 2: 't2-0001-0002', ... }
  tube3: { 1: 't3-0001-0001', 2: 't3-0001-0002', ... }
}

// Registered users: Completely personalized based on their performance
personalizedState = {
  tube1: { 1: 't1-0007-0023', 4: 't1-0001-0001', 15: 't1-0012-0008', ... }
  // Scrambled by spaced repetition based on individual progress
}
```

### Session Flow
1. **Auth** → Load user state (tube position maps)
2. **Play** → Background preparation using Live Aid model
3. **Adapt** → Content adjusts invisibly based on distinction formation
4. **Session end** → Compress positions + sync state

## Current Implementation Status

**🎯 COMPLETED**: Tube-based architecture fully implemented - "No stitches available in learning path" error resolved

### ✅ Completed Architecture Implementation
- **Tube-based Triple Helix system** with Live Aid Stage Model (PLAYING → READY → PREPARING)
- **Enhanced Stitch IDs** in tX-YYYY-ZZZZ format with 299,970,003 stitch capacity
- **Interface-first design** following APML Framework v1.4.2 with all critical interfaces updated
- **Position compression** logic with spaced repetition sequence [4, 8, 15, 30, 100, 1000]
- **Clean separation architecture** enabling infinite future sophistication
- **EngineOrchestrator transformation** from stitches to tube-based orchestration

### ✅ Critical Interfaces Updated
- **StitchManagerInterface**: Tube position management with enhanced stitch IDs
- **TripleHelixManagerInterface**: Live Aid tube rotation and user state management
- **SpacedRepetitionSystemInterface**: Position compression and logical positioning
- **QuestionGeneratorInterface**: Clean separation assembly architecture
- **DistinctionManagerInterface**: Boundary level progression (1-5)

## Development Workflow

### 🚀 AI-Assisted Development with Vercel Deployment

**Complete Workflow:**

```bash
# 1. AI implements changes following APML interface-first principles

# 2. Local build verification
npm run build

# 3. AI prepares commit with detailed message
git add .
git commit -m "$(cat <<'EOF'
COMMIT_TITLE: Brief description of what was changed

PROBLEM: Description of the issue being solved
- Specific symptom or error
- Root cause analysis

SOLUTION: What was implemented  
- Specific changes made
- Files modified and why

RESULT: Expected outcome
- How to verify the fix works
- What user should see now

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

# 4. Human pushes via GitHub Desktop
# 5. Vercel auto-builds and deploys (usually 1-2 minutes)
# 6. Live testing on deployed version at vercel domain
```

**Git Commit Message Template:**
```
COMMIT_TITLE: Brief summary of changes

PROBLEM: [What was broken/needed]
SOLUTION: [What was implemented] 
RESULT: [Expected outcome]

🤖 Generated with [Claude Code](https://claude.ai/code)
Co-Authored-By: Claude <noreply@anthropic.com>
```

**Benefits of This Workflow:**
- ✅ **Detailed commit history** with problem-solution-result structure
- ✅ **Automatic deployment** - no manual build/deploy steps needed  
- ✅ **Live testing** ensures real-world functionality
- ✅ **GitHub Desktop** provides visual diff review before pushing
- ✅ **Claude Code attribution** tracks AI-assisted development
- ✅ **Vercel integration** provides instant preview URLs for testing

### 🧪 Testing Strategy
- **Live deployment testing** (no local dev server)
- **APMLValidationSuite** for systematic validation
- **A/B testing ready** for learning algorithm optimization
- **Real user data** for continuous adaptation improvement
- **Build verification passed** - tube-based architecture compiles successfully

## Key Project Files

### Primary Documentation
- **Project Registry**: [`/registry.apml`](./registry.apml) - Component status tracking
- **Naming Conventions**: [`/naming.apml`](./naming.apml) - Prevents 80% of development errors
- **Framework Definition**: [`/apml_framework_v1.4.2.md`](./apml_framework_v1.4.2.md) - APML methodology

### Implementation Status
- **Project Status Dashboard**: [`/status.html`](./status.html) - Visual progress tracking
- **Component Documentation**: `/src/engines/*/README.md` - Detailed component specs

## Future Possibilities

### With This Architecture, We Can:
- **Implement AI tutors** without changing the app
- **Add learning analytics** without touching the UI
- **Personalize at individual neuron level** through parameterization
- **Scale to millions of learners** with individual optimization
- **Integrate brain-computer interfaces** for direct distinction measurement
- **Achieve learning speeds** never before possible in mathematics education

### The Ultimate Vision
Educational technology that works **with** how the brain actually learns, rather than against it. By optimizing distinction formation under energy constraints, we might unlock human cognitive capabilities we've never seen before.

---

**This is not just a mathematics app - it's a platform for accelerating human learning itself.**

## Implementation Roadmap

### 🔄 Next Implementation Phase
**Live Aid Caching System Implementation**:
- **StitchPopulation system** with curriculum progression algorithms (doubling number endings, backwards multiplication)
- **Live Aid caching components** for PREPARING → READY → LIVE transitions
- **Content assembly pipeline** integrating fact selection, distractor generation, and question formatting
- **Performance optimization** for zero-wait Netflix-like streaming experience

### 🏗️ Implementation Priority
1. **StitchPopulation algorithms** following curriculum design (Tube 1: doubling/halving, Tube 2: backwards multiplication, Tube 3: division-as-algebra)
2. **Background preparation system** with boundary-appropriate distractor generation
3. **Cache management** for instant content streaming
4. **Live testing** on deployed version with real user interaction

## Quick Start

```bash
# Install dependencies
npm install

# Build project
npm run build

# Deploy to Vercel (auto-deploys on git push)
git add .
git commit -m "Implement Live Aid caching architecture"
git push origin main
```

For questions about this project, please contact the Zenjin team.