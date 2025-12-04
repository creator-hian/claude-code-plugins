# Gemini-Claude Loop Validation Criteria

> **Version**: 1.0 | **Updated**: 2025-12-04

## Prerequisites

| ID | Test | Command | Success |
|----|------|---------|---------|
| P-01 | Gemini CLI | `gemini --version` | Version output |
| P-02 | Non-TTY mode | `gemini -p "test"` | Response received |
| P-03 | Context dir | `mkdir -p .gemini-loop` | Directory created |

## Workflow Phases

### Phase 0-1: Pre-flight & Planning
| ID | Test | Success |
|----|------|---------|
| W-01 | AskUserQuestion for model/mode | Options presented |
| W-02 | Plan created | Structured document |
| W-03 | Plan saved | `.gemini-loop/plan.md` exists |

### Phase 2: Plan Validation
| ID | Test | Success |
|----|------|---------|
| W-04 | Gemini validation call | Response received |
| W-05 | Result saved | `.gemini-loop/phase2_validation.md` exists |
| W-06 | Feedback contains checks | Logic, security, architecture |

### Phase 3: Feedback Loop
| ID | Test | Success |
|----|------|---------|
| W-07 | Feedback summary shown | User sees issues |
| W-08 | AskUserQuestion for action | Revise/Proceed options |
| W-09 | Loop on revise | Phase 2 repeats |

### Phase 4-5: Implementation & Review
| ID | Test | Success |
|----|------|---------|
| W-10 | Code implemented | Files created/modified |
| W-11 | Summary saved | `.gemini-loop/implementation.md` exists |
| W-12 | Review call | Response received |
| W-13 | Review saved | `.gemini-loop/phase5_review.md` exists |
| W-14 | Severity classification | Critical/Major/Minor/Info |

### Phase 6: Iteration
| ID | Test | Success |
|----|------|---------|
| W-15 | Fixes applied | Code updated |
| W-16 | Re-validation | Gemini confirms |
| W-17 | Quality met | No Critical/Major issues |

## Error Handling

| ID | Scenario | Expected |
|----|----------|----------|
| E-01 | Empty output | Suggests `-p` flag |
| E-02 | Timeout | Graceful retry option |
| E-03 | Context file missing | Recovery or restart |

## Context Files

```
.gemini-loop/
├── plan.md
├── phase2_validation.md
├── implementation.md
├── phase5_review.md
└── iterations.md
```

## Scoring

| Level | Weight | Required |
|-------|--------|----------|
| Prerequisites | 10% | Yes |
| Workflow (Phase 0-6) | 60% | Yes |
| Error Handling | 15% | Recommended |
| Context Management | 15% | Yes |

**Pass**: 75+ points | **Partial**: 60-74 | **Fail**: <60

## Quick Checklist

```
[ ] P-01~03: Prerequisites pass
[ ] W-01~17: All phases complete
[ ] E-01~03: Errors handled gracefully
[ ] Context files properly maintained
```
