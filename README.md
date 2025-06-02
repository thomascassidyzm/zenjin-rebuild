# Zenjin Maths App - Production Ready

## 🎯 Vision: Netflix for Mathematics Learning

**A zero-decision-fatigue, adaptive mathematics platform built on distinction-based learning theory with Netflix-like performance through Live Aid architecture.**

Transform mathematical learning from explanation-based confusion to intuitive pattern recognition through binary choice questions that adapt seamlessly to each learner's cognitive development.

## 🚀 **READY FOR LAUNCH** - Current Status

✅ **Core Features Complete**  
✅ **Live Aid Pipeline Integrated** (Netflix-like performance)  
✅ **Metrics System Fixed** (FTC=3 points, EC=1 point, MAX() bonus)  
✅ **Authentication Flow Working**  
✅ **Project Cleaned for Production**  
✅ **Build Successful** (ready for Vercel deployment)  

---

## Core Learning Philosophy: Distinction as Primitive

### The Foundation
Learning happens through **distinction formation** - the ability to draw boundaries between "this" and "not-this." Mathematical concepts emerge from progressively refined boundary-making capabilities under energy constraints.

### Why Traditional Math Education Fails
- **Explanation-first approach** violates natural learning patterns
- **Cognitive overload** from language-heavy concept introduction  
- **Energy inefficiency** forcing conscious calculation over intuition
- **One-size-fits-all** ignoring individual development rates

### The Zenjin Solution
- **Zero-explanation learning** through pure comparison opportunities
- **Binary choice questions** at 5 progressive boundary levels
- **Automatic intuition formation** through pattern recognition
- **Spaced repetition** with skip sequence [4, 8, 15, 30, 100, 1000]
- **Triple Helix rotation** between Knowledge, Skills, Application

---

## 🏗️ Architecture: Live Aid Performance Model

### Netflix-Like Content Streaming
```typescript
// Traditional: Generate questions synchronously (2-5 seconds)
for (let i = 0; i < 20; i++) {
  const question = await generateQuestion(); // SLOW
}

// Zenjin: Stream pre-cached questions (< 100ms)  
const questions = await liveAidManager.getReadyStitch(userId); // FAST
```

### Three-Layer Clean Separation

**1. App Layer (Simple & Stable)**
```typescript
// App only knows: "Give me content for this stitch"
const content = await getStitchContent('t1-0007-0023');
// Gets back: 20 optimized questions, pre-shuffled, ready to stream
```

**2. State Layer (User's Learning Journey)**
```typescript
interface UserLearningState {
  tubePositions: {
    tube1: { [position: number]: string }, // Sparse position storage
    tube2: { [position: number]: string },
    tube3: { [position: number]: string }
  };
  activeTube: 1 | 2 | 3; // Triple Helix rotation
  stitchProgress: Record<StitchId, Progress>;
}
```

**3. Content Layer (Hidden Sophistication)**
```typescript
// All the AI/adaptation magic happens here - invisible to app
// Same stitch ID produces different content as user evolves:
'stitch-times-6' → Level 1: 24 vs "fish"      (absurd)
                 → Level 2: 24 vs 240         (magnitude) 
                 → Level 3: 24 vs 30          (operation)
                 → Level 4: 24 vs 28          (pattern)
                 → Level 5: 24 vs 26          (conceptual)
```

---

## 🧮 Adaptive Learning Mechanics

### Boundary Level Progression (1-5)
- **Level 1 - Category**: Answer vs completely different type ("24" vs "fish")
- **Level 2 - Magnitude**: Answer vs wrong order of magnitude ("24" vs "240") 
- **Level 3 - Operation**: Answer vs different operation result ("6×4=24" vs "6+4=10")
- **Level 4 - Pattern**: Answer vs near-miss calculation error ("24" vs "28")
- **Level 5 - Conceptual**: Answer vs very subtle difference ("24" vs "26")

### Spaced Repetition Algorithm
```typescript
// Perfect score (20/20): Advance in skip sequence
[4, 8, 15, 30, 100, 1000] → Next boundary level

// Imperfect score: Reset to skip=4, same boundary level
// Ensures mastery before progression
```

### Points & Bonus System
```typescript
const POINTS = {
  FIRST_TIME_CORRECT: 3,    // Perfect understanding
  EVENTUALLY_CORRECT: 1,    // Learned through repetition  
  INCORRECT: 0              // Reset and repeat
};

// Easter Egg bonus system (hidden thresholds)
bonusMultiplier = MAX(consistencyBonus, excellenceBonus, speedBonus);
// Range: x2 to x30 multiplier for discovery-based engagement
```

---

## 🔧 Development & Deployment

### Quick Start
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production  
npm run build

# Deploy to Vercel
vercel deploy
```

### Key Technologies
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Vercel Edge Functions + Supabase
- **Architecture**: APML Framework v2.2 (YAML-native)
- **Performance**: Live Aid caching pipeline
- **State Management**: Sparse position storage

### Project Structure
```
src/
├── components/           # UI components (PlayerCard, Dashboard, etc.)
├── engines/             # Core business logic (EngineOrchestrator, etc.)
├── services/            # API services and authentication
├── interfaces/          # TypeScript interfaces (generated from APML)
└── utils/              # Utility functions

api/                     # Vercel serverless functions
database/               # Supabase schema and migrations
docs/build/apml/        # APML interface definitions (YAML)
```

---

## 🎮 User Experience Flow

### Anonymous Users (Instant Start)
1. **Land on page** → See big "Play" button
2. **Click Play** → Immediate question stream (no signup)
3. **Answer questions** → Adaptive boundary level progression
4. **Complete session** → See score, play again or register

### Registered Users (Personalized)
1. **Sign in** → Load personalized learning state
2. **Resume journey** → Continue from exact position
3. **Adaptive content** → Questions optimized for individual progress
4. **Cross-device sync** → Seamless experience anywhere

### Learning Session
- **20 questions per stitch** (one mathematical concept)
- **Binary choices** (correct answer vs boundary-appropriate distractor)
- **Immediate feedback** with visual/audio celebration
- **Automatic progression** to next stitch on completion
- **Invisible adaptation** of difficulty and content

---

## 📊 Performance Features

### Live Aid Architecture
- **Background preparation** of next stitches while user plays current
- **Netflix-like streaming** of pre-cached content
- **Zero-wait experience** for 95%+ of question requests
- **Graceful fallback** to synchronous generation on cache miss

### Metrics & Analytics
- **Real-time performance tracking** (accuracy, speed, consistency)
- **Easter Egg bonus discovery** (hidden achievement system)
- **Evolution score** combining points and speed
- **Global ranking** (percentile-based leaderboards)

---

## 🔒 Privacy & Safety

### Anonymous-First Design
- **No required registration** for core learning experience
- **Local storage** for anonymous progress (28-day retention)
- **Optional account creation** preserves all anonymous progress
- **GDPR compliant** data handling

### Content Safety
- **Mathematics-only content** (no external risks)
- **Adaptive difficulty** prevents frustration
- **Positive reinforcement** through celebration systems
- **No social features** (focus on individual learning)

---

## 🚀 Deployment Configuration

### Environment Variables (Vercel)
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key  
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### Database Setup (Supabase)
```sql
-- Run: database/schema.sql
-- Includes: users, facts, stitches, tubes, user_metrics tables
-- With proper RLS policies and authentication
```

### Build & Deploy
```bash
# Vercel deployment (automatic)
git push origin main

# Manual deployment  
npm run build && vercel deploy --prod
```

---

## 📈 Future Roadmap

### Phase 1: Launch (Current)
- ✅ Core learning platform
- ✅ Anonymous & registered user flows  
- ✅ Live Aid performance architecture
- ✅ Basic metrics and progression

### Phase 2: Enhancement
- 🔄 Machine learning for personalized difficulty
- 🔄 Additional math domains (fractions, algebra)
- 🔄 Advanced analytics dashboard
- 🔄 Teacher/parent insights

### Phase 3: Scale
- 🔄 Multi-language support
- 🔄 Curriculum customization
- 🔄 School district deployment
- 🔄 API for educational platforms

---

## 🤝 Contributing

This project follows APML Framework v2.2 conventions for AI-assisted development:

1. **Interface-first design** - All changes start with APML interface definitions
2. **Component isolation** - Each engine is independently testable  
3. **Clean separation** - App, State, and Content layers remain distinct
4. **Progressive enhancement** - Core functionality works, optimizations layer on top

### Development Guidelines
- Read `ARCHITECTURE.md` for system design principles
- Check `registry.apml` for current component status
- Follow `naming.apml` conventions for consistency
- Use `docs/build/apml/interfaces-yaml/` as the source of truth

---

**Ready for production deployment and real user testing!** 🎉

For technical details, see:
- `ARCHITECTURE.md` - Complete system design
- `METRICS_IMPLEMENTATION_GUIDE.md` - Scoring system details  
- `SYSTEM_INTERFACE_DIAGRAM.md` - Component interactions