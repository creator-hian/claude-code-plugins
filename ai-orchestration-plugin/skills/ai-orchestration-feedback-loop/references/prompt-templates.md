# AI Orchestration Prompt Templates

## Phase 2: Codex Validation Prompts

### General Validation
```
Perform exhaustive validation of this implementation plan:

$(cat .ai-orchestration/plan.md)

Analysis requirements:
1. LOGIC: Verify correctness of approach and algorithms
2. SECURITY: Identify all potential vulnerabilities (OWASP Top 10, etc.)
3. PERFORMANCE: Analyze complexity, bottlenecks, scalability
4. EDGE CASES: Enumerate all edge cases and failure modes
5. DEPENDENCIES: Check for missing or conflicting dependencies

Output format:
## Critical Issues (must fix before proceeding)
## Major Issues (should fix before proceeding)
## Minor Issues (can fix during implementation)
## Recommendations (improvements to consider)
## Questions (clarifications needed)
```

### Security-Focused Validation
```
Perform comprehensive security audit of this implementation plan:

$(cat .ai-orchestration/plan.md)

Security analysis checklist:
1. OWASP Top 10 vulnerabilities
2. Authentication/authorization flaws
3. Input validation and sanitization
4. Injection vulnerabilities (SQL, XSS, Command)
5. Data exposure and privacy risks
6. Cryptographic weaknesses
7. Session management issues
8. Access control gaps
9. Error handling information leakage
10. Third-party dependency risks

Threat model:
- Identify assets at risk
- Enumerate threat actors
- Map attack vectors
- Assess impact levels

Output format:
## Critical Security Issues (blocks deployment)
## High-Risk Vulnerabilities (urgent fix required)
## Medium-Risk Issues (fix before production)
## Low-Risk Concerns (monitor and address)
## Security Recommendations
## Required Security Tests
```

### Performance-Focused Validation
```
Analyze performance characteristics of this implementation plan:

$(cat .ai-orchestration/plan.md)

Performance analysis:
1. Time complexity analysis (Big O)
2. Space complexity analysis
3. I/O bottlenecks identification
4. Database query optimization opportunities
5. Caching opportunities
6. Concurrency and parallelization potential
7. Memory allocation patterns
8. Network latency considerations
9. Scalability limits
10. Resource consumption projections

Load scenarios to consider:
- Normal load (expected usage)
- Peak load (2-3x normal)
- Stress load (10x normal)
- Failure scenarios (degraded mode)

Output format:
## Performance Critical Issues
## Scalability Concerns
## Optimization Opportunities
## Recommended Benchmarks
## Performance Test Scenarios
```

### Architecture-Focused Validation
```
Evaluate architectural soundness of this implementation plan:

$(cat .ai-orchestration/plan.md)

Architecture analysis:
1. SOLID principles adherence
2. Design pattern appropriateness
3. Coupling and cohesion assessment
4. Dependency direction validation
5. Layer boundary enforcement
6. API design quality
7. Error handling strategy
8. State management approach
9. Extension points and flexibility
10. Technical debt introduction

Long-term considerations:
- Maintainability over 2-5 years
- Team scalability impact
- Technology evolution readiness
- Migration path clarity

Output format:
## Architectural Critical Issues
## Design Pattern Recommendations
## Coupling/Cohesion Assessment
## Long-term Maintainability Score (1-10)
## Recommended Refactoring
## Architecture Decision Records (ADRs) needed
```

---

## Phase 3: Gemini Review Prompts

### General Creative Review
```
Review this implementation plan from a creative and holistic perspective:

$(cat .ai-orchestration/plan.md)

Previous validation (Codex):
$(cat .ai-orchestration/phase2_codex_validation.md)

Analysis requirements:
1. ALTERNATIVES: Are there better approaches not considered?
2. PATTERNS: Does this follow or violate known design patterns?
3. USER IMPACT: How will this affect end users?
4. MAINTAINABILITY: How will this age over time?
5. INTEGRATION: How does this fit with the broader system?
6. BLIND SPOTS: What might the plan be missing entirely?

Build upon Codex's findings - don't repeat, complement.

Output format:
## Alternative Approaches
## Pattern Analysis
## User Impact Assessment
## Maintainability Concerns
## Integration Considerations
## Blind Spots and Missing Elements
## Agreement with Codex (key points)
## Disagreement with Codex (if any, with rationale)
```

### Innovation-Focused Review
```
Explore innovative alternatives for this implementation:

$(cat .ai-orchestration/plan.md)

Innovation exploration:
1. What emerging technologies could improve this?
2. Are there unconventional approaches worth considering?
3. How would industry leaders approach this differently?
4. What could make this 10x better, not just incrementally better?
5. Are there cross-domain patterns that could apply?

Constraints to respect:
- Current technology stack
- Team capabilities
- Timeline requirements
- Budget limitations

Output format:
## Innovative Alternatives
## Emerging Technology Opportunities
## Cross-Domain Inspirations
## 10x Improvement Possibilities
## Feasibility Assessment for Each Alternative
```

### User Experience Review
```
Analyze user experience implications:

$(cat .ai-orchestration/plan.md)

UX considerations:
1. How will this change affect user workflows?
2. What's the learning curve for new functionality?
3. Are there accessibility concerns?
4. How will errors be communicated to users?
5. What's the performance perception impact?
6. How intuitive is the proposed interface/API?

User personas to consider:
- New users (first-time experience)
- Power users (efficiency needs)
- Administrators (management needs)
- API consumers (developer experience)

Output format:
## User Workflow Impact
## Learning Curve Assessment
## Accessibility Concerns
## Error Communication Quality
## Performance Perception
## DX (Developer Experience) Assessment
## Recommended UX Improvements
```

---

## Phase 6: Code Review Prompts

### Codex Code Review
```
Review implementation against original plan and validation feedback:

## Original Plan
$(cat .ai-orchestration/plan.md)

## Synthesis (including your previous feedback)
$(cat .ai-orchestration/phase4_synthesis.md)

## Implementation
$(cat .ai-orchestration/implementation.md)

Verification checklist:
1. Were Critical issues properly addressed?
2. Were Major issues properly addressed?
3. Any new issues introduced during implementation?
4. Code quality assessment (bugs, performance, security)
5. Test coverage adequacy
6. Documentation completeness

Output format:
## Addressed Issues (confirmed fixed)
## Partially Addressed (needs more work)
## Not Addressed (still present)
## New Issues (introduced during implementation)
## Code Quality Score (1-10)
## Test Coverage Assessment
## Overall Assessment (PASS/FAIL with rationale)
```

### Gemini Code Review
```
Review final implementation quality:

## Original Plan
$(cat .ai-orchestration/plan.md)

## Your Previous Review
$(cat .ai-orchestration/phase3_gemini_review.md)

## Implementation
$(cat .ai-orchestration/implementation.md)

## Codex Review
$(cat .ai-orchestration/phase6a_codex_review.md)

Quality assessment:
1. Were your concerns addressed?
2. Code readability and clarity
3. Maintainability over time
4. Integration with existing codebase
5. Documentation and comments quality
6. Agreement/disagreement with Codex review

Output format:
## Your Concerns - Status
| Concern | Status | Notes |
|---------|--------|-------|
| ...     | Addressed/Partial/Not Addressed | ... |

## Code Quality Assessment
- Readability: ★★★★☆
- Maintainability: ★★★★☆
- Integration: ★★★★☆
- Documentation: ★★★★☆

## Agreement with Codex Review
## Points of Disagreement (if any)
## Final Recommendation (APPROVE/REQUEST CHANGES/REJECT)
## Rationale
```

---

## Synthesis Prompts

### Standard Synthesis
```
Synthesize validation feedback from both AI reviewers:

## Codex Validation
$(cat .ai-orchestration/phase2_codex_validation.md)

## Gemini Review
$(cat .ai-orchestration/phase3_gemini_review.md)

Synthesis requirements:
1. Identify consensus points (both agree)
2. Identify divergence points (disagree)
3. Prioritize issues by combined severity
4. Resolve conflicts where possible
5. Escalate unresolvable conflicts to user

Output format:
## Consensus Points
[Where both AIs agree]

## Divergence Points
| Point | Codex View | Gemini View | Resolution |
|-------|------------|-------------|------------|
| ...   | ...        | ...         | ...        |

## Prioritized Action Items
| Priority | Issue | Source | Action Required |
|----------|-------|--------|-----------------|
| 1 | ... | Both | ... |
| 2 | ... | Codex | ... |

## Unresolved Conflicts (Require User Decision)
## Revised Plan Recommendations
```

### Conflict Resolution Synthesis
```
Resolve conflicting feedback between reviewers:

## Point of Conflict
[Specific disagreement]

## Codex Position
[Codex's argument and evidence]

## Gemini Position
[Gemini's argument and evidence]

Analysis framework:
1. What evidence supports each position?
2. What assumptions underlie each position?
3. Are they actually disagreeing, or using different criteria?
4. What would happen if we followed each recommendation?
5. Is there a third option that satisfies both?

Output format:
## Evidence Analysis
## Assumption Comparison
## Risk Assessment per Option
## Proposed Resolution
## Rationale
## Confidence Level (High/Medium/Low)
```

---

## Iteration Prompts

### Codex Re-validation
```
Verify fixes for previously identified issues:

## Original Issues
$(cat .ai-orchestration/phase2_codex_validation.md | grep -A5 "Critical\|Major")

## Applied Fixes
$(cat .ai-orchestration/iteration_N.md)

For each issue:
1. Is it properly fixed?
2. Did the fix introduce new issues?
3. Is the fix complete or partial?

Output format:
## Issue Resolution Status
| Issue | Status | Notes |
|-------|--------|-------|
| ...   | Fixed/Partial/Not Fixed/Regressed | ... |

## New Issues from Fixes
## Recommendation (Proceed/More Fixes Needed)
```

### Gemini Re-review
```
Verify improvements address previous concerns:

## Your Previous Concerns
$(cat .ai-orchestration/phase3_gemini_review.md)

## Applied Changes
$(cat .ai-orchestration/iteration_N.md)

Assessment:
1. Are your key concerns addressed?
2. Quality of the improvements
3. Any new concerns from changes?

Output format:
## Concern Resolution Status
## Quality of Improvements
## New Concerns (if any)
## Updated Recommendation
```
