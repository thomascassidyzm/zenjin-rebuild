# Chat Handoff Prompt Template

## Instructions for LLM:
Copy and paste this entire prompt (including the XML document below) when ending a chat session. Fill in all the {PLACEHOLDER} values with actual information from the current session. This creates a comprehensive handoff document for the next LLM or developer.

---

## CHAT HANDOFF PROMPT:

I need to create a comprehensive chat handoff document for this development session. Please analyze the work completed in this conversation and create a detailed handoff document using the template below.

**Fill in ALL {PLACEHOLDER} values with actual information from our session:**

- Replace {PROJECT_NAME} with the actual project name
- Replace {FRAMEWORK_VERSION} with the current framework version
- Replace {CURRENT_STATUS_SUMMARY} with actual status
- Replace {LAST_MILESTONE_DATE} with actual date
- Replace {MILESTONE_DESCRIPTION} with actual milestone
- Fill in all the detailed sections with real information from our conversation
- Add actual file paths, not placeholder paths
- Include real changes, issues, and decisions made
- Add specific next steps based on our conversation

**Focus on:**
1. **Major breakthroughs or achievements** in this session
2. **Specific files changed** and why
3. **Exact next steps** the next LLM should take
4. **Context boundaries** and important constraints
5. **Real testing results** and validation status

**Save the completed document as:** `HANDOFF_NEXT_CHAT.apml`

---

## HANDOFF DOCUMENT TEMPLATE:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ProjectHandoff version="1.0" date="YYYY-MM-DD">
  <Purpose>
    {HANDOFF_PURPOSE_DESCRIPTION - What is this handoff capturing and why is it important}
  </Purpose>
  
  <ProjectOverview>
    <Name>{PROJECT_NAME}</Name>
    <Framework>{FRAMEWORK_VERSION}</Framework>
    <Status>{CURRENT_STATUS_SUMMARY}</Status>
    <LastMajorMilestone>{LAST_MILESTONE_DATE}: {MILESTONE_DESCRIPTION}</LastMajorMilestone>
    <Architecture>{ARCHITECTURE_DESCRIPTION}</Architecture>
    <DeploymentTarget>{DEPLOYMENT_INFO}</DeploymentTarget>
  </ProjectOverview>
  
  <CriticalContext>
    <RecentBreakthrough>
      <Achievement>{MAJOR_ACHIEVEMENT_NAME}</Achievement>
      <Date>{ACHIEVEMENT_DATE}</Date>
      <Impact>{DETAILED_IMPACT_DESCRIPTION}</Impact>
      <ValidationStatus>{VALIDATION_STATUS_SUMMARY}</ValidationStatus>
    </RecentBreakthrough>
    
    <CurrentWorkingFeatures>
      <Feature name="{FEATURE_NAME}" status="{STATUS}">{FEATURE_DESCRIPTION}</Feature>
      <!-- Add more features as needed -->
    </CurrentWorkingFeatures>
  </CriticalContext>
  
  <ProjectState>
    <StatusTrackingSystem>
      <Levels>
        <Level name="not-started" symbol="🔴" description="Not implemented at all" />
        <Level name="scaffolded" symbol="🟡" description="Basic structure exists but not functional" />
        <Level name="functional" symbol="🟠" description="Basic functionality works but not polished" />
        <Level name="integrated" symbol="🟢" description="Works with other components properly" />
        <Level name="tested" symbol="🔵" description="Has comprehensive tests" />
        <Level name="optimized" symbol="⭐" description="Performance optimized and production-ready" />
      </Levels>
    </StatusTrackingSystem>
    
    <ModuleCompletionStatus>
      <Module name="{MODULE_NAME}" status="{STATUS}" completion="{PERCENTAGE}%" priority="{PRIORITY}">{MODULE_DESCRIPTION}</Module>
      <!-- Add all modules -->
    </ModuleCompletionStatus>
  </ProjectState>
  
  <CriticalFiles>
    <SingleSourceOfTruth>
      <File path="{FILE_PATH}" purpose="{FILE_PURPOSE}" criticality="{CRITICALITY_LEVEL}" />
      <!-- Add essential files -->
    </SingleSourceOfTruth>
    
    <CategoryFiles>
      <File path="{FILE_PATH}" purpose="{FILE_PURPOSE}" criticality="{CRITICALITY_LEVEL}" />
      <!-- Add category-specific files -->
    </CategoryFiles>
  </CriticalFiles>
  
  <NextPrioritySteps>
    <HighPriority>
      <Step id="{STEP_ID}" module="{MODULE_NAME}" task="{TASK_NAME}">
        <Description>{TASK_DESCRIPTION}</Description>
        <Context>{TASK_CONTEXT}</Context>
        <ApproachSuggestion>{APPROACH_SUGGESTION}</ApproachSuggestion>
        <ValidationCriteria>{VALIDATION_CRITERIA}</ValidationCriteria>
        <Status>{TASK_STATUS}</Status>
      </Step>
      <!-- Add more high priority steps -->
    </HighPriority>
    
    <MediumPriority>
      <!-- Medium priority steps using same format -->
    </MediumPriority>
    
    <LowPriority>
      <!-- Low priority steps using same format -->
    </LowPriority>
  </NextPrioritySteps>
  
  <RecentChanges>
    <Change date="{CHANGE_DATE}" type="{CHANGE_TYPE}" impact="{IMPACT_LEVEL}">
      <Summary>{CHANGE_SUMMARY}</Summary>
      <Details>
        {DETAILED_CHANGE_DESCRIPTION}
      </Details>
      <ValidationResults>{VALIDATION_RESULTS}</ValidationResults>
    </Change>
    <!-- Add more recent changes -->
  </RecentChanges>
  
  <KnownIssues>
    <Issue severity="{SEVERITY}" module="{MODULE}">
      <Description>{ISSUE_DESCRIPTION}</Description>
      <Impact>{ISSUE_IMPACT}</Impact>
      <Resolution>{RESOLUTION_APPROACH}</Resolution>
    </Issue>
    <!-- Add more known issues -->
  </KnownIssues>
  
  <DevelopmentEnvironment>
    <Setup>
      <Requirement>{REQUIREMENT_DESCRIPTION}</Requirement>
      <!-- Add more requirements -->
    </Setup>
    
    <QuickStart>
      <Command>{COMMAND}</Command>
      <!-- Add more commands -->
      <TestingApproach>{TESTING_APPROACH}</TestingApproach>
      <ValidationInspection>{VALIDATION_INSPECTION}</ValidationInspection>
    </QuickStart>
    
    <KeyTestingScenarios>
      <Scenario name="{SCENARIO_NAME}">
        <Steps>
          {STEP_BY_STEP_INSTRUCTIONS}
        </Steps>
        <ExpectedResult>{EXPECTED_OUTCOME}</ExpectedResult>
      </Scenario>
      <!-- Add more scenarios -->
    </KeyTestingScenarios>
  </DevelopmentEnvironment>
  
  <ArchitecturalDecisions>
    <Decision topic="{DECISION_TOPIC}">
      <Context>{DECISION_CONTEXT}</Context>
      <Resolution>{DECISION_RESOLUTION}</Resolution>
      <Rationale>{DECISION_RATIONALE}</Rationale>
      <Impact>{DECISION_IMPACT}</Impact>
    </Decision>
    <!-- Add more decisions -->
  </ArchitecturalDecisions>
  
  <HandoffInstructions>
    <ImmediateActions>
      <Action priority="{PRIORITY_NUMBER}">{ACTION_DESCRIPTION}</Action>
      <!-- Add more immediate actions -->
    </ImmediateActions>
    
    <ContextBoundaries>
      <Boundary name="{BOUNDARY_NAME}">{BOUNDARY_DESCRIPTION}</Boundary>
      <!-- Add more boundaries -->
    </ContextBoundaries>
    
    <CommunicationGuidelines>
      <Guideline>{GUIDELINE_DESCRIPTION}</Guideline>
      <!-- Add more guidelines -->
    </CommunicationGuidelines>
  </HandoffInstructions>
  
  <FrameworkStatus>
    <ComponentStatus>
      <Component name="{COMPONENT_NAME}" status="{STATUS}" description="{DESCRIPTION}">
        <Coverage>{COVERAGE_INFO}</Coverage>
        <ExecutionType>{EXECUTION_TYPE}</ExecutionType>
        <Priority>{PRIORITY_INFO}</Priority>
      </Component>
      <!-- Add more components -->
    </ComponentStatus>
    
    <SystemStatus>
      <System>{SYSTEM_DESCRIPTION}</System>
      <!-- Add more systems -->
    </SystemStatus>
  </FrameworkStatus>
</ProjectHandoff>
```

**After completing the document, provide a brief summary of:**
1. **Major accomplishments** in this session
2. **Critical next steps** for the next LLM
3. **Key context** that must be preserved