# Command Patterns & Prompts

## Table of Contents
- [Role Modes](#role-modes)
- [Phase 2: Plan Validation Prompts](#phase-2-plan-validation-prompts)
- [Phase 5: Code Review Prompts](#phase-5-code-review-prompts)
- [Context File Templates](#context-file-templates)
- [JSON Output Mode](#json-output-mode)

## Role Modes

| Mode | Description | When to Use |
|------|-------------|-------------|
| **검증/리뷰만** | Feedback only, no code suggestions | Quick validation |
| **검증+제안** | Feedback + specific code fix examples | Detailed guidance needed |

## Phase 2: Plan Validation Prompts

### 검증/리뷰만 Mode
```bash
gemini -m gemini-3-flash-preview -p "Review this implementation plan:

$(cat .gemini-loop/plan.md)

Check for:
- Logic errors and edge cases
- Architecture flaws
- Security concerns
- Missing requirements

Provide validation feedback only. Do not suggest code changes."
```

### 검증+제안 Mode
```bash
gemini -m gemini-3-flash-preview -p "Review this implementation plan:

$(cat .gemini-loop/plan.md)

Check for:
- Logic errors and edge cases
- Architecture flaws
- Security concerns
- Missing requirements

Provide:
1. Validation feedback
2. Specific improvement suggestions with code examples where applicable"
```

## Phase 5: Code Review Prompts

### 검증/리뷰만 Mode
```bash
gemini -m gemini-3-flash-preview --include-directories ./src -p "Review this implementation:

## Original Plan
$(cat .gemini-loop/plan.md)

## Implementation
$(cat .gemini-loop/implementation.md)

Check for:
- Bugs and logic errors
- Performance issues
- Security vulnerabilities
- Best practice violations

Classify issues as: Critical, Major, Minor, Info"
```

### 검증+제안 Mode
```bash
gemini -m gemini-3-flash-preview --include-directories ./src -p "Review this implementation:

## Original Plan
$(cat .gemini-loop/plan.md)

## Implementation
$(cat .gemini-loop/implementation.md)

Check for:
- Bugs and logic errors
- Performance issues
- Security vulnerabilities
- Best practice violations

For each issue:
1. Classify as: Critical, Major, Minor, Info
2. Provide specific fix suggestions with code examples"
```

## Context File Templates

### plan.md
```markdown
# Implementation Plan

## Overview
[Brief description of what will be implemented]

## Steps
1. [Step 1 description]
2. [Step 2 description]
3. [Step 3 description]

## Assumptions
- [Assumption 1]
- [Assumption 2]

## Risks
- [Risk 1 and mitigation]
- [Risk 2 and mitigation]
```

### implementation.md
```markdown
# Implementation Summary

## Files Changed
- `path/to/file1.ts` - [description]
- `path/to/file2.ts` - [description]

## Code Changes
### file1.ts
[Key changes made]

### file2.ts
[Key changes made]

## Notes
[Any implementation notes or decisions made]
```

### session.json
```json
{
  "session_id": "20251204_120000",
  "phase": 0,
  "status": "initialized",
  "model": "gemini-3-flash-preview",
  "role_mode": "review-only"
}
```

## JSON Output Mode

For structured output (future jq parsing):

```bash
result=$(gemini -m gemini-3-flash-preview -p "Review..." --output-format json)
echo "$result" > .gemini-loop/phase2_validation.json

# Future jq parsing:
# response=$(echo "$result" | jq -r '.response')
```

### JSON Response Structure
```json
{
  "response": "string",
  "stats": { "models": {}, "tools": {}, "files": {} },
  "error": { "type": "string", "message": "string", "code": 0 }
}
```

## Multi-Directory Analysis

```bash
gemini -m gemini-3-flash-preview --include-directories ./backend,./frontend -p "Review cross-service integration..."
```

## Model Recommendations

| Phase | Recommended Model | Reason |
|-------|-------------------|--------|
| Plan validation | `gemini-3-flash-preview` (default) | Standard validation |
| Code review | `gemini-3-flash-preview` | Standard review |
| Re-validation | `gemini-3-flash-preview` | Speed for iterations |
| Complex architecture | `gemini-3-pro-preview` | Deep analysis only |
