# Multi-AI Synthesis Guide

## Purpose of Synthesis

The synthesis phase is critical to the AI Orchestration Feedback Loop. It transforms two independent AI perspectives into a coherent action plan while preserving the value of each viewpoint.

## Synthesis Principles

### 1. Preserve Distinct Value
Each AI brings unique strengths:
- **Codex**: Systematic rigor, deep reasoning, security focus
- **Gemini**: Creative alternatives, holistic view, user perspective

Don't homogenize - preserve what makes each valuable.

### 2. Prioritize by Impact
Not all feedback is equal:
```
Critical (blocks progress) > Major (should fix) > Minor (nice to have)
```

### 3. Respect Consensus
When both AIs agree, confidence is high:
- Consensus on issues → Must address
- Consensus on approach → Strong signal

### 4. Investigate Divergence
When AIs disagree:
- Understand why (different criteria? different assumptions?)
- Often both are right from their perspective
- Find higher-order solution when possible

### 5. Maintain Traceability
Every decision should trace back to:
- Which AI raised the point
- What evidence supported it
- Why the chosen resolution was selected

---

## Synthesis Process

### Step 1: Categorize Feedback

Create a unified issue list:

```markdown
## All Identified Issues

| ID | Issue | Source | Severity | Category |
|----|-------|--------|----------|----------|
| 1 | SQL injection risk in user input | Codex | Critical | Security |
| 2 | Missing error handling for API calls | Both | Major | Reliability |
| 3 | Consider caching for performance | Gemini | Minor | Performance |
| 4 | Alternative: Use message queue | Gemini | Recommendation | Architecture |
```

### Step 2: Identify Consensus Points

Find where both AIs agree:

```markdown
## Consensus Points

### Both Identified
- Issue #2: Missing error handling (Major)
- Approach: REST API is appropriate

### Agreement Through Silence
- Neither raised concerns about: [topic]
- Interpretation: Approach is sound for [topic]

### Complementary (Not Conflicting)
- Codex deep-dived security → found SQL injection
- Gemini broad-viewed UX → found accessibility gap
- Both are valid, address both
```

### Step 3: Analyze Divergence

For each disagreement:

```markdown
## Divergence Analysis: [Topic]

### Positions
- **Codex**: [Position and reasoning]
- **Gemini**: [Position and reasoning]

### Root Cause of Disagreement
- [ ] Different criteria (what's important)
- [ ] Different assumptions (about context)
- [ ] Different information (one has more data)
- [ ] Actually complementary (not conflicting)

### Evidence Comparison
| Evidence | Codex | Gemini |
|----------|-------|--------|
| [Point 1] | Supports | Contradicts |
| [Point 2] | Not mentioned | Strong support |

### Resolution Options
1. [Option A - favors Codex position]
2. [Option B - favors Gemini position]
3. [Option C - hybrid approach]

### Recommended Resolution
[Option with rationale]

### Confidence
[High/Medium/Low] because [reason]
```

### Step 4: Build Priority Matrix

Combine severity and source:

```markdown
## Priority Matrix

### P0 - Must Fix Before Implementation
- [Issues both AIs marked Critical]
- [Issues one marked Critical, other confirmed]

### P1 - Should Fix Before Implementation
- [Issues both marked Major]
- [Critical from one, not contradicted by other]

### P2 - Fix During Implementation
- [Major from one, Minor/not mentioned by other]
- [Both marked Minor]

### P3 - Consider for Future
- [Recommendations not blocking current work]
- [Nice-to-haves acknowledged by both]

### Deferred (With Rationale)
- [Issues intentionally not addressed now]
- [Reason for deferral]
```

### Step 5: Create Revised Plan

Incorporate high-priority items:

```markdown
## Revised Implementation Plan

### Original Approach
[Brief summary of original plan]

### Key Modifications
1. [Modification to address P0/P1 issue]
2. [Modification to address P0/P1 issue]

### Unchanged Elements
[What remains from original plan]

### New Steps Added
- Step X: [Security hardening per Codex]
- Step Y: [UX improvement per Gemini]

### Removed/Changed Steps
- Original Step 3 → Now Step 3a + 3b because [reason]
```

### Step 6: Document Unresolved

For issues requiring user input:

```markdown
## Unresolved - Requires User Decision

### Issue: [Description]

**Codex recommends**: [Option A]
- Pros: [list]
- Cons: [list]

**Gemini recommends**: [Option B]
- Pros: [list]
- Cons: [list]

**Claude assessment**: [Analysis of tradeoffs]

**Question for user**: [Specific decision needed]

**Default if no response**: [What we'll do if user doesn't respond]
```

---

## Common Synthesis Patterns

### Pattern: Security vs Usability

**Scenario**: Codex recommends stricter security, Gemini notes UX impact

**Resolution approach**:
1. Implement security as non-negotiable baseline
2. Add UX mitigations (better error messages, streamlined flows)
3. Document the tradeoff for future reference

**Example**:
```markdown
- Codex: "Require 2FA for all users"
- Gemini: "2FA adds friction, consider risk-based approach"
- Resolution: Require 2FA for sensitive operations, offer optional 2FA otherwise
```

### Pattern: Performance vs Maintainability

**Scenario**: Codex suggests optimization, Gemini notes complexity increase

**Resolution approach**:
1. Assess actual performance need (measure, don't assume)
2. Consider if optimization is premature
3. If needed, optimize with maintainability safeguards (comments, abstractions)

**Example**:
```markdown
- Codex: "Use custom data structure for O(1) lookup"
- Gemini: "Standard Map is O(1) and more maintainable"
- Resolution: Use standard Map, add performance test, revisit if needed
```

### Pattern: Now vs Later

**Scenario**: One AI suggests more complete solution, other prefers incremental

**Resolution approach**:
1. What's the cost of doing more now vs later?
2. Is the fuller solution speculative?
3. Can we build incrementally without painting into corner?

**Example**:
```markdown
- Codex: "Build full event sourcing system"
- Gemini: "Start with simple state, evolve if needed"
- Resolution: Build with event sourcing patterns but simpler implementation
```

### Pattern: Missing Context

**Scenario**: AIs give different advice due to incomplete information

**Resolution approach**:
1. Identify what context is missing
2. Gather the context if possible
3. Make decision explicit about assumptions

**Example**:
```markdown
- Codex: "Use synchronous calls for simplicity"
- Gemini: "Use async for scalability"
- Missing: Expected load and latency requirements
- Resolution: Ask user for requirements, default to async if unknown
```

---

## Synthesis Quality Checklist

Before finalizing synthesis:

- [ ] All Critical issues have clear resolution
- [ ] All Major issues have resolution or deferral rationale
- [ ] Divergences are analyzed, not ignored
- [ ] Consensus points are explicitly acknowledged
- [ ] Revised plan incorporates key feedback
- [ ] Unresolved items are clearly flagged for user
- [ ] Traceability maintained (can trace back to source)
- [ ] No feedback was lost or overlooked

---

## Synthesis Output Template

```markdown
# Multi-AI Synthesis Report

## Executive Summary
[2-3 sentences on key findings and recommended path forward]

## Consensus Points
### Both AIs Agree
- [Point 1]
- [Point 2]

### Complementary Findings (Not Conflicting)
- Codex: [Finding]
- Gemini: [Finding]

## Divergence Analysis
### [Topic 1]
- Codex: [Position]
- Gemini: [Position]
- Resolution: [Decision and rationale]

## Prioritized Action Items
| Priority | Issue | Source | Action |
|----------|-------|--------|--------|
| P0 | ... | ... | ... |

## Revised Plan Summary
[Key modifications to original plan]

## Unresolved - User Decision Required
1. [Question for user]

## Deferred Items
| Item | Reason | Revisit When |
|------|--------|--------------|
| ... | ... | ... |

## Confidence Assessment
Overall synthesis confidence: [High/Medium/Low]
Rationale: [Why this confidence level]
```
