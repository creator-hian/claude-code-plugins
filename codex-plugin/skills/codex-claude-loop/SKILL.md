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

1. **Check Git Repository Status**
```bash
git rev-parse --git-dir 2>/dev/null && echo "Git OK" || echo "Not a Git repo"
```

2. **If NOT in Git repository**, ask user via `AskUserQuestion`:
   - "This directory is not a Git repository. Codex requires Git by default."
   - Options:
     - "Initialize Git repository here (`git init`)"
     - "Use `--skip-git-repo-check` flag (bypass check)"
     - "Cancel operation"

3. **Apply user choice**:
```bash
# Option 1: Initialize Git
git init

# Option 2: Use skip flag
codex exec --skip-git-repo-check -s read-only "prompt"
```

## Phase 1: Planning (Claude)

1. Create detailed implementation plan
2. Break down into clear steps
3. Document assumptions and risks

## Phase 2: Plan Validation (Codex)

Ask user via `AskUserQuestion`:
- Model preference (see codex-cli for options)
- Reasoning effort level

```bash
codex exec -m gpt-5.1-codex -c model_reasoning_effort=high -s read-only \
  "Review this plan: [plan content]
   Check: logic errors, edge cases, architecture flaws, security"
```

## Phase 3: Feedback Loop

If issues found:
1. Summarize Codex feedback to user
2. Refine plan
3. Ask: "Revise and re-validate, or proceed?"
4. Repeat Phase 2 if needed

## Phase 4: Implementation (Claude)

1. Implement using Edit/Write/Read tools
2. Execute step-by-step with error handling
3. Document changes

## Phase 5: Code Review (Codex)

```bash
codex exec -s read-only "Review implementation:
[code changes]
Check: bugs, performance, best practices, security"
```

Claude decides based on feedback:
- Critical → Fix immediately
- Architectural → Discuss with user
- Minor → Document and proceed

## Phase 6: Iteration

1. Claude applies fixes
2. Significant changes → Re-validate with Codex
3. Use `codex resume` for session continuity
4. Loop until quality standards met

## Command Patterns

| Phase | Pattern |
|-------|---------|
| Validate plan | `codex exec -m MODEL -c model_reasoning_effort=LEVEL -s read-only "plan"` |
| Review code | `codex exec -s read-only "review"` |
| Continue | `codex exec resume "next step"` |
| Re-validate | `codex exec resume "verify fixes"` |
| Non-Git directory | `codex exec --skip-git-repo-check -s read-only "prompt"` |

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

## Best Practices

- **Always use `codex exec`** in Claude Code environment (non-TTY)
- **Always validate plans** before implementation
- **Never skip review** after changes
- **Default to `-s read-only`** for all reviews
- **Use `resume`** for session continuity
- **Check Git status** before first Codex command
- **Ask user permission** before using `--skip-git-repo-check`
- **Document handoffs** between AIs
