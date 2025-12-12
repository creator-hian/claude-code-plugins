---
name: codex-claude-loop
description: Dual-AI engineering loop orchestrating Claude Code (planning/implementation) and Codex (validation/review). Use when (1) complex feature development requiring validation, (2) high-quality code with security/performance concerns, (3) large-scale refactoring, (4) user requests codex-claude loop or dual-AI review. Do NOT use for simple one-off fixes or prototypes.
requires:
  - codex-cli
---

# Codex-Claude Engineering Loop

## Workflow Overview

```
Plan (Claude) → Validate (Codex) → Implement (Claude) → Review (Codex) → Fix → Re-validate → Done
```

| Role | Responsibility |
|------|----------------|
| **Claude** | Architecture, planning, code implementation (Edit/Write/Read) |
| **Codex** | Validation, code review, quality assurance |

## ⚠️ Important: Non-Interactive Execution

Claude Code runs in a **non-TTY environment**. You MUST use `codex exec` for all Codex commands.

| Environment | Command |
|-------------|---------|
| Terminal (interactive) | `codex "prompt"` |
| Claude Code / CI / Scripts | `codex exec "prompt"` |

**Common Error**: `stdin is not a terminal` → Use `codex exec` instead of `codex`

## Phase 0: Pre-flight Check

Before executing any Codex command:

1. **Create context directory**:
```bash
mkdir -p .codex-loop
```

2. **Check Git Repository Status**
```bash
git rev-parse --git-dir 2>/dev/null && echo "Git OK" || echo "Not a Git repo"
```

3. **If NOT in Git repository**, ask user via `AskUserQuestion`:
   - "This directory is not a Git repository. Codex requires Git by default."
   - Options:
     - "Initialize Git repository here (`git init`)"
     - "Use `--skip-git-repo-check` flag (bypass check)"
     - "Cancel operation"

4. **Apply user choice**:
```bash
# Option 1: Initialize Git
git init

# Option 2: Use skip flag
codex exec --skip-git-repo-check -s read-only "prompt"
```

5. **Ask user via `AskUserQuestion`**:
   - Model preference (gpt-5.2, gpt-5.1-codex-max, gpt-5.1-codex, gpt-5.1-codex-mini)
   - Reasoning effort level (low, medium, high, xhigh)

## Phase 1: Planning (Claude)

1. Create detailed implementation plan
2. Break down into clear steps
3. Document assumptions and risks
4. Save to `.codex-loop/plan.md`

## Phase 2: Plan Validation (Codex)

```bash
Bash(timeout: 600000): codex exec -m MODEL -c model_reasoning_effort=LEVEL -s read-only \
  "Review this plan:
$(cat .codex-loop/plan.md)
Check: logic errors, edge cases, architecture flaws, security"
```

Save result: `> .codex-loop/phase2_validation.md`

## Phase 3: Feedback Loop

If issues found in `.codex-loop/phase2_validation.md`:
1. Summarize Codex feedback to user
2. Ask via `AskUserQuestion`: "Revise and re-validate, or proceed?"
3. If revise → Update `.codex-loop/plan.md` → Repeat Phase 2

## Phase 4: Implementation (Claude)

1. Implement using Edit/Write/Read tools
2. Execute step-by-step with error handling
3. Save summary to `.codex-loop/implementation.md`

## Phase 5: Code Review (Codex)

```bash
Bash(timeout: 600000): codex exec -m MODEL -s read-only "Review:
## Plan
$(cat .codex-loop/plan.md)
## Implementation
$(cat .codex-loop/implementation.md)
Check: bugs, performance, security, best practices
Classify: Critical, Major, Minor, Info"
```

Save result: `> .codex-loop/phase5_review.md`

Claude response by severity:
- Critical → Fix immediately
- Architectural → Discuss with user
- Minor → Document and proceed

## Phase 6: Iteration

1. Apply fixes from `.codex-loop/phase5_review.md`
2. Significant changes → Re-validate with Codex
3. Use `codex exec resume` for session continuity
4. Loop until quality standards met

## Context Files

```
.codex-loop/
├── plan.md               # Implementation plan
├── phase2_validation.md  # Plan validation result
├── implementation.md     # Implementation summary
├── phase5_review.md      # Code review result
└── iterations.md         # Iteration history
```

## Command Quick Reference

| Phase | Pattern |
|-------|---------|
| Validate | `codex exec -m MODEL -c model_reasoning_effort=LEVEL -s read-only "$(cat .codex-loop/plan.md)"` |
| Review | `codex exec -m MODEL -s read-only "$(cat .codex-loop/implementation.md)"` |
| Continue | `codex exec resume "next step"` |
| Re-validate | `codex exec resume "verify fixes"` |
| Non-Git | `codex exec --skip-git-repo-check -s read-only "prompt"` |

**Always use `timeout: 600000` (10 min)** for all Codex commands.

**Note**: For model selection, reasoning effort, and advanced options, see [codex-cli SKILL](../codex-cli/SKILL.md).

## Error Handling

### Exit Codes
| Code | Meaning | Action |
|------|---------|--------|
| `0` | Success | Continue workflow |
| `1` | General error | Check error message, may need `--skip-git-repo-check` |
| `2` | Invalid arguments | Check option values (see below) |

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `stdin is not a terminal` | Using `codex` instead of `codex exec` | Use `codex exec` |
| `Not inside a trusted directory` | Not in Git repo | Ask user: init Git or use `--skip-git-repo-check` |
| `invalid value for '--ask-for-approval'` | Wrong approval value | Use valid values (see below) |

### Error Recovery Flow
1. Non-zero exit → Stop and report error message
2. Summarize error via `AskUserQuestion`
3. Confirm with user before:
   - Architectural changes
   - Multi-file modifications
   - Breaking changes
   - Using `--skip-git-repo-check`

## Approval Modes

**Valid values for `-a` / `--ask-for-approval`**:

| Value | Description |
|-------|-------------|
| `untrusted` | Treat all operations as untrusted |
| `on-failure` | Ask only when operation fails |
| `on-request` | Ask when explicitly requested |
| `never` | Never ask for approval (dangerous) |

⚠️ **Note**: Values like `auto-edit`, `always`, `unless-allow-listed` are NOT valid.

## Timeout Configuration

Codex validation and review operations require extended timeout to complete properly.

| Phase | Recommended Timeout | Bash Parameter |
|-------|---------------------|----------------|
| Plan validation | **10 minutes** | `timeout: 600000` |
| Code review | **10 minutes** | `timeout: 600000` |
| Re-validation | **10 minutes** | `timeout: 600000` |

**Always use `timeout: 600000` (10 minutes)** for all Codex exec commands in this workflow:

```bash
# Example: Plan validation with 10-minute timeout
Bash(timeout: 600000): codex exec -m gpt-5.2 -c model_reasoning_effort=high -s read-only "Review this plan..."

# Example: Code review with 10-minute timeout
Bash(timeout: 600000): codex exec -s read-only "Review implementation..."
```

This prevents repeated timeout → wait → extend cycles during complex analysis.

## Best Practices

- **Always use `codex exec`** in Claude Code environment (non-TTY)
- **Always create `.codex-loop/`** directory at start
- **Always save outputs** to context files for traceability
- **Always validate plans** before implementation
- **Never skip review** after changes
- **Default to `-s read-only`** for all reviews
- **Use `resume`** for session continuity
- **Check Git status** before first Codex command
- **Ask user permission** before using `--skip-git-repo-check`
- **Set 10-minute timeout** for all Codex exec commands (`timeout: 600000`)

## References

- **Codex CLI fundamentals**: See [codex-cli SKILL](../codex-cli/SKILL.md) (models, options, error handling)
