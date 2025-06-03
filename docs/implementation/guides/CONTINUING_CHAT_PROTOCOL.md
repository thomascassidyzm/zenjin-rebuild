# APML Continuing Chat Protocol v1.0

## Purpose

This protocol ensures seamless handoffs between AI chat sessions while maintaining APML compliance and project continuity. It standardizes how context is preserved and transferred when moving from one chat instance to another.

## Protocol Overview

### 1. Handoff Document Structure

Every chat session ending should produce a `HANDOFF_NEXT_CHAT.apml` file containing:

- **ProjectContext** - Current project state and working directory
- **RecentMajorAchievement** - What was just completed with evidence
- **CurrentModuleStatus** - All modules with current status and completion %
- **NextPriorityTasks** - Ordered list of what to work on next
- **CriticalProjectFiles** - Key files the next session needs to know about
- **APMLComplianceReminders** - Critical framework principles
- **WorkingState** - Build status, deployment status, known issues
- **HandoffInstructions** - Specific steps for the next AI to follow
- **SuccessMetrics** - How to measure success of next session

### 2. Handoff Triggers

Create a handoff document when:
- **Session approaching token limits** (proactive handoff)
- **Major milestone completed** (natural breakpoint)
- **Context switch required** (different type of work)
- **User requests handoff** (explicit transition)

### 3. Handoff Document Naming Convention

```
HANDOFF_NEXT_CHAT.apml              # Current handoff for immediate next chat
HANDOFF_ARCHIVE_YYYY-MM-DD_HH.apml  # Archived handoffs for reference
```

### 4. Next Session Startup Protocol

The new AI session should:

1. **Read handoff document first** - Before any other project files
2. **Confirm understanding** - Summarize what was accomplished and what's next
3. **Validate working state** - Check build status, deployment status
4. **Initialize todo tracking** - Use TodoWrite to capture next tasks
5. **Begin work immediately** - Start on Priority 1 task from handoff

## Implementation Template

### Handoff Creation (End of Current Session)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<HandoffDocument version="1.0.0" date="[ISO_TIMESTAMP]">
  <ProjectContext>
    <ProjectName>Project Name</ProjectName>
    <CurrentStatus>Brief description of current state</CurrentStatus>
    <APMLFrameworkVersion>1.3.2</APMLFrameworkVersion>
    <OverallCompletion>XX%</OverallCompletion>
    <WorkingDirectory>/path/to/project</WorkingDirectory>
  </ProjectContext>

  <RecentMajorAchievement>
    <Title>What was just completed</Title>
    <Date>YYYY-MM-DD</Date>
    <StatusChange>Module: old_status → new_status</StatusChange>
    <KeyDeliverables>
      <Deliverable>Specific file or feature completed</Deliverable>
    </KeyDeliverables>
    <Evidence>
      <BuildStatus>✅/❌ Build status</BuildStatus>
      <LiveDeployment>✅/❌ Deployment status</LiveDeployment>
      <SpecificEvidence>Concrete proof of functionality</SpecificEvidence>
    </Evidence>
  </RecentMajorAchievement>

  <CurrentModuleStatus>
    <Module name="ModuleName" status="phase" completion="XX%" priority="high/medium/low">
      Brief status description
    </Module>
  </CurrentModuleStatus>

  <NextPriorityTasks>
    <Task priority="1" module="ModuleName" effort="high/medium/low">
      <Title>Specific task title</Title>
      <Description>Detailed description</Description>
      <APMLRequirements>
        <Requirement>Interface-first requirement</Requirement>
      </APMLRequirements>
      <Components>
        <Component name="ComponentName" currentStatus="phase" targetStatus="phase" />
      </Components>
    </Task>
  </NextPriorityTasks>

  <CriticalProjectFiles>
    <File path="/file/path" importance="critical/high/medium">
      Why this file is important
    </File>
  </CriticalProjectFiles>

  <APMLComplianceReminders>
    <Principle>Key APML principle to remember</Principle>
  </APMLComplianceReminders>

  <WorkingState>
    <LastSuccessfulBuild>ISO_TIMESTAMP</LastSuccessfulBuild>
    <LiveDeploymentStatus>Status description</LiveDeploymentStatus>
    <KnownIssues>
      <Issue severity="high/medium/low">Issue description</Issue>
    </KnownIssues>
  </WorkingState>

  <HandoffInstructions>
    <Step>1. Specific instruction</Step>
    <Step>2. Next instruction</Step>
  </HandoffInstructions>

  <SuccessMetrics>
    <Metric>Measurable success criteria</Metric>
  </SuccessMetrics>
</HandoffDocument>
```

### Session Startup (Beginning of New Session)

**User Prompt Template:**
```
I'm continuing work on this APML project from a previous chat session. Please read the handoff document below and confirm your understanding of:

1. What was just completed
2. Current project status  
3. Next priority tasks
4. APML compliance requirements

Then begin work on the Priority 1 task following strict APML protocols.

[PASTE HANDOFF_NEXT_CHAT.apml CONTENT HERE]
```

**AI Response Protocol:**
1. **Acknowledge handoff** - "I understand this APML project handoff..."
2. **Summarize achievements** - "You just completed [X] with evidence [Y]..."
3. **Confirm current status** - "Current module status shows..."
4. **State next priority** - "Priority 1 task is [X] for [Module]..."
5. **Initialize tracking** - Use TodoWrite to capture tasks
6. **Begin work** - Start immediately on Priority 1 task

## Quality Assurance

### Handoff Document Validation

Before creating handoff, verify:
- [ ] All module statuses are current and accurate
- [ ] Evidence section contains concrete proof
- [ ] Next tasks are properly prioritized
- [ ] APML compliance principles are clear
- [ ] File paths are absolute and correct
- [ ] Success metrics are measurable

### Session Continuity Validation

New session should verify:
- [ ] Can access all critical files mentioned
- [ ] Build status is as described
- [ ] Deployment status matches description
- [ ] Todo tracking system is working
- [ ] APML framework version is available

## Anti-Patterns to Avoid

### Poor Handoffs
- ❌ **Vague descriptions** - "Working on backend stuff"
- ❌ **Missing evidence** - "Everything is working" without proof
- ❌ **Unclear priorities** - Multiple "high priority" tasks
- ❌ **Stale file references** - Pointing to deleted/moved files
- ❌ **APML violations** - Ignoring interface-first protocols

### Poor Session Starts
- ❌ **Ignoring handoff** - Starting fresh without reading context
- ❌ **No confirmation** - Beginning work without understanding
- ❌ **APML violations** - Implementing before defining interfaces
- ❌ **Poor tracking** - Not using TodoWrite for task management

## Benefits

- **Zero context loss** between sessions
- **Maintains APML compliance** across session boundaries
- **Clear accountability** for what was accomplished
- **Prioritized next steps** for immediate productivity
- **Evidence-based validation** of claimed progress
- **Consistent project tracking** regardless of AI instance

## Version History

- **v1.0** (2025-05-24) - Initial protocol based on BackendServices integration handoff

## Usage Example

See `HANDOFF_NEXT_CHAT.apml` for a real-world example of this protocol in action, documenting the successful completion of BackendServices frontend integration and setting up SubscriptionSystem as the next priority.