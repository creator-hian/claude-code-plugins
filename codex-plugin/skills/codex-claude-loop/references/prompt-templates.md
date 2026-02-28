# Codex Prompt Templates

> Replace `MODEL` with your chosen model (e.g., `gpt-5.3-codex`) and `LEVEL` with reasoning effort (`low`, `medium`, `high`).

## Phase 2: Plan Validation Prompts

### Standard Validation
```bash
codex exec -m MODEL -c model_reasoning_effort=LEVEL -s read-only \
  "Review this implementation plan:

$(cat .codex-loop/plan.md)

Check for:
- Logic errors and edge cases
- Architecture flaws
- Security concerns
- Missing requirements
- Dependency ordering issues

Classify issues as: Critical, Major, Minor, Info
For each issue, cite the specific plan section."
```

### Security-Focused Validation
```bash
codex exec -m MODEL -c model_reasoning_effort=xhigh -s read-only \
  "Security review of this plan:

$(cat .codex-loop/plan.md)

Focus on:
- Authentication/authorization gaps
- Input validation coverage
- Data exposure risks
- Injection vectors (SQL, command, XSS)
- OWASP Top 10 relevance

Classify each finding with severity and affected plan section."
```

## Phase 5: Code Review Prompts

### Standard Code Review
```bash
codex exec -m MODEL -c model_reasoning_effort=LEVEL -s read-only \
  "Review this implementation against the plan:

## Original Plan
$(cat .codex-loop/plan.md)

## Implementation Summary
$(cat .codex-loop/implementation.md)

Check for:
- Bugs and logic errors
- Performance issues
- Security vulnerabilities
- Plan deviations

Classify issues as: Critical, Major, Minor, Info"
```

### Performance-Focused Review
```bash
codex exec -m MODEL -c model_reasoning_effort=high -s read-only \
  "Performance review of this implementation:

$(cat .codex-loop/implementation.md)

Focus on:
- Algorithm complexity (time and space)
- N+1 queries or unbounded loops
- Memory allocation patterns
- I/O bottlenecks
- Caching opportunities

Classify each finding with severity."
```

## Session Continuity

### Resume Prompt (Phase 6)
```bash
codex exec -m MODEL -c model_reasoning_effort=LEVEL -s read-only resume \
  "Continue review with these fixes applied:

## Previous Review
$(cat .codex-loop/phase5_review.md)

## Applied Fixes
$(cat .codex-loop/iterations.md)

Verify fixes address the original issues. Check for regressions."
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
