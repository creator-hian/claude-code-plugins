---
name: gemini-claude-loop
description: Dual-AI engineering loop orchestrating Claude Code (planning/implementation) and Gemini (validation/review). Use when (1) complex feature development requiring validation, (2) high-quality code with security/performance concerns, (3) large-scale refactoring, (4) user requests gemini-claude loop or dual-AI review. Do NOT use for simple one-off fixes or prototypes.
requires:
  - gemini-plugin:gemini-cli
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

> **Non-TTY environment**: See [gemini-cli SKILL](../gemini-cli/SKILL.md#-environment-notice) for CLI fundamentals.
> **Key rule**: Always use `gemini -p "prompt"` (headless mode required)

## Phase 0: Pre-flight Check

1. **Create context directory**:
```bash
mkdir -p .gemini-loop
```
Add `.gemini-loop/` to your project's `.gitignore` to avoid committing session artifacts.

2. **Ask user via `AskUserQuestion`**:
   - Model preference (gemini-3-flash-preview (default), gemini-3.1-pro-preview (complex only))
   - Role mode preference (Review-Only OR Review+Suggest)

## Phase 1: Planning (Claude)

1. Create detailed implementation plan
2. Break down into clear steps
3. Document assumptions and risks
4. Save to `.gemini-loop/plan.md`

## Phase 2: Plan Validation (Gemini)

Ask user for role mode, then execute with `timeout: 600000`:

```bash
gemini -m gemini-3-flash-preview -p "Review this plan: $(cat .gemini-loop/plan.md) ..."
```

> **Full prompts by role mode**: See [commands.md](references/commands.md#phase-2-plan-validation-prompts)

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

Execute with `timeout: 600000`:

```bash
gemini -m gemini-3-flash-preview --include-directories ./src -p "Review: $(cat .gemini-loop/plan.md) $(cat .gemini-loop/implementation.md) ..."
```

> **Full prompts by role mode**: See [commands.md](references/commands.md#phase-5-code-review-prompts)

Save result: `> .gemini-loop/phase5_review.md`

Claude response by severity:
- Critical → Fix immediately
- Architectural → Discuss with user
- Minor → Document and proceed

## Phase 6: Iteration

1. Apply fixes from `.gemini-loop/phase5_review.md`
2. Significant changes → Re-validate with Gemini
3. Loop until quality standards met

## Session Management

- Each loop run uses the `.gemini-loop/` directory for all context files
- Overwrite context files on each new run (plan.md, phase2_validation.md, etc.)
- Append iteration history to `.gemini-loop/iterations.md` for traceability
- If resuming a previous session, read existing context files before proceeding

## Context Files

```
.gemini-loop/
├── plan.md               # Implementation plan
├── phase2_validation.md  # Plan validation result
├── implementation.md     # Implementation summary
├── phase5_review.md      # Code review result
└── iterations.md         # Iteration history
```

## Error Handling

> **Full error reference**: See [gemini-cli SKILL](../gemini-cli/SKILL.md) for Gemini CLI error details.

**Error Recovery Flow**:
1. Non-zero exit or empty output → Stop and report error message
2. Summarize error via `AskUserQuestion`
3. Common issues:
   - Empty output → Ensure `-p` flag is used (headless mode)
   - Authentication failure → Check `gemini auth status`
   - Model unavailable → Fall back to `gemini-3-flash-preview`

## Quick Reference

**Always use `timeout: 600000` (10 min)** for all Gemini commands.

## Best Practices

- **Always use `gemini -p`** in Claude Code environment (non-TTY, headless mode)
- **Always create `.gemini-loop/`** directory at start
- **Always save outputs** to context files for traceability
- **Always validate plans** before implementation
- **Never skip review** after changes
- **Default to Review-Only** role mode unless user requests suggestions
- **Check model availability** before first Gemini command
- **Set 10-minute timeout** for all Gemini commands (`timeout: 600000`)

## References

- **Command patterns & prompts**: See [references/commands.md](references/commands.md)
- **Gemini CLI fundamentals**: See [gemini-cli SKILL](../gemini-cli/SKILL.md) (models, options, error handling, timeout, JSON output)
