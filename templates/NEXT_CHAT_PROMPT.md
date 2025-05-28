# Next Chat Prompt - Live Aid Build Issues Resolution

## Context
You are continuing work on the Zenjin Maths App rebuild following APML Framework v1.4.2. The previous session attempted Live Aid Architecture integration but encountered build failures and APML protocol violations.

## Critical Issue
The Vercel deployment is serving HTML instead of JavaScript assets, causing a MIME type error that prevents the app from loading. Additionally, Live Aid component integrations are failing with "method not found" errors.

## APML Compliance Requirement
**MANDATORY FIRST STEP**: Read the foundational documents in this exact order:
1. `/Users/tomcassidy/claude-code-experiments/APML-Projects/zenjin-rebuild/README.md`
2. `/Users/tomcassidy/claude-code-experiments/APML-Projects/zenjin-rebuild/naming.apml` 
3. `/Users/tomcassidy/claude-code-experiments/APML-Projects/zenjin-rebuild/registry.apml`

## Session Context
Read the complete handoff document: `/Users/tomcassidy/claude-code-experiments/APML-Projects/zenjin-rebuild/templates/HANDOFF_LIVE_AID_BUILD_ISSUES.apml`

## Primary Objectives
1. **Fix build/deployment issue** - Resolve MIME type error preventing app from loading
2. **Establish working question flow** - Get basic player functionality working with hard-coded first stitch
3. **Validate Live Aid status** - Determine actual implementation completeness of Live Aid components
4. **Follow APML protocols** - No implementation without proper foundational document review

## Key Technical Details
- **Build Error**: `Loading module from "https://apml-zenjin-maths-v2.vercel.app/assets/index-895a5fee.js" was blocked because of a disallowed MIME type ("text/html")`
- **Runtime Error**: `this.liveAidManager.getReadyStitch is not a function`
- **User Flow**: Anonymous user → Play button → Loading → ERROR (no questions generated)
- **Architecture**: 3-layer system (App → State → Content) with default tube configs for all new users

## Implementation Constraints
- **No local builds** - User commits via GitHub Desktop, tests on Vercel deployment only
- **No fallback questions** - Use hard-coded first stitch for new users (always the same)
- **APML compliance required** - Follow interface-first development protocols
- **Incremental approach** - Get basic functionality working before full Live Aid integration

## Success Criteria
- App loads without MIME type errors
- Anonymous user can play through hard-coded first stitch (20 doubling/halving questions)
- Questions advance properly after user answers
- No APML protocol violations in implementation approach

## User Context
The user is experienced with this codebase and expects multiple error-fixing iterations during major architectural changes. They value APML protocol compliance and systematic problem-solving over quick hacks.

---

**Start by reading the foundational documents, then proceed with systematic diagnosis and resolution.**