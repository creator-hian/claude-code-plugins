---
name: gemini-claude-loop
description: Dual-AI engineering loop orchestrating Claude Code (planning/implementation) and Gemini (validation/review). Use when (1) complex feature development requiring validation, (2) high-quality code with security/performance concerns, (3) large-scale refactoring, (4) user requests gemini-claude loop or dual-AI review. Do NOT use for simple one-off fixes or prototypes.
requires:
  - gemini-cli
---

# Gemini-Claude Engineering Loop

## Workflow Overview

```
Plan (Claude) → Validate (Gemini) → Implement (Claude) → Review (Gemini) → Fix → Re-validate → Done
```

| Role | Responsibility |
|------|----------------|
| **Claude** | Architecture, planning, code implementation (Edit/Write/Read) |
| **Gemini** | Validation, code review, quality assurance |

## Environment Notice

Claude Code runs in a **non-TTY environment**. Always use `-p` flag:

```bash
gemini -p "prompt"  # Correct
gemini              # Wrong - empty output
```

## Phase 0: Pre-flight Check

1. Create context directory: `mkdir -p .gemini-loop`
2. Ask user via `AskUserQuestion`:
   - Model preference (gemini-3-flash-preview (default), gemini-3-pro-preview (complex only))
   - Role mode preference (검증/리뷰만 OR 검증+제안)

## Phase 1: Planning (Claude)

1. Create detailed implementation plan
2. Break down into clear steps
3. Document assumptions and risks
4. Save to `.gemini-loop/plan.md`

## Phase 2: Plan Validation (Gemini)

Ask user for role mode, then execute:

```bash
Bash(timeout: 600000): gemini -m gemini-3-flash-preview -p "Review this plan:
$(cat .gemini-loop/plan.md)
Check: logic errors, edge cases, architecture flaws, security
[Add 'Provide fix suggestions with code examples' for 검증+제안 mode]"
```

Save result: `> .gemini-loop/phase2_validation.md`

## Phase 3: Feedback Loop

If issues found:
1. Summarize Gemini feedback to user
2. Ask via `AskUserQuestion`: "Revise and re-validate, or proceed?"
3. If revise → Update plan → Repeat Phase 2

## Phase 4: Implementation (Claude)

1. Implement using Edit/Write/Read tools
2. Execute step-by-step with error handling
3. Save summary to `.gemini-loop/implementation.md`

## Phase 5: Code Review (Gemini)

```bash
Bash(timeout: 600000): gemini -m gemini-3-flash-preview --include-directories ./src -p "Review:
## Plan
$(cat .gemini-loop/plan.md)
## Implementation
$(cat .gemini-loop/implementation.md)
Check: bugs, performance, security, best practices
Classify: Critical, Major, Minor, Info"
```

Save result: `> .gemini-loop/phase5_review.md`

Claude response by severity:
- Critical → Fix immediately
- Architectural → Discuss with user
- Minor → Document and proceed

## Phase 6: Iteration

1. Apply fixes from `.gemini-loop/phase5_review.md`
2. Significant changes → Re-validate with Gemini
3. Loop until quality standards met

## Context Files

```
.gemini-loop/
├── plan.md               # Implementation plan
├── phase2_validation.md  # Plan validation result
├── implementation.md     # Implementation summary
├── phase5_review.md      # Code review result
└── iterations.md         # Iteration history
```

## Command Quick Reference

| Phase | Pattern |
|-------|---------|
| Validate | `gemini -m gemini-3-flash-preview -p "review plan..."` |
| Review | `gemini -m gemini-3-flash-preview --include-directories ./src -p "review..."` |
| JSON output | `gemini -m gemini-3-flash-preview -p "..." --output-format json` |

**Always use `timeout: 600000` (10 min)** for all Gemini commands.

## References

- **Command patterns & prompts**: See [references/commands.md](references/commands.md)
- **Gemini CLI fundamentals**: See [gemini-cli SKILL](../gemini-cli/SKILL.md) (models, options, error handling, timeout)
