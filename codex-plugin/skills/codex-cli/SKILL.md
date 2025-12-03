---
name: codex-cli
description: OpenAI Codex CLI fundamentals for code analysis, review, and validation. Use when (1) executing codex commands for code review/analysis, (2) configuring models (gpt-5.1-codex-max/codex/codex-mini), sandbox modes (read-only/workspace-write), or reasoning effort (low/medium/high/xhigh), (3) managing Codex sessions with resume, (4) integrating Codex into automation scripts. Do NOT use for orchestration patterns (use codex-claude-loop instead).
---

# Codex CLI Skill

## ⚠️ Environment Notice

| Environment | Command Format |
|-------------|----------------|
| Interactive terminal | `codex "prompt"` |
| **Claude Code / CI / Scripts** | `codex exec "prompt"` |

**Non-TTY environments** (Claude Code, CI pipelines, scripts) require `codex exec`.

## Quick Start

```bash
# Basic code review (terminal)
codex "Review this code for bugs"

# Non-interactive mode (Claude Code/CI) - USE THIS FORMAT
codex exec "Review this code for bugs"

# With read-only sandbox (recommended)
codex exec -s read-only "Check for security issues"

# With specific model and reasoning effort
codex exec -m gpt-5.1-codex -c model_reasoning_effort=high "Deep analysis"

# With image input
codex exec -i screenshot.png "What's shown here?"

# Resume previous session
codex exec resume "Continue the analysis"

# Non-Git directory (requires user approval)
codex exec --skip-git-repo-check -s read-only "Analyze code"
```

## Reference Documentation

- **[Commands Reference](references/commands.md)** - `codex`, `resume`, `apply`, input/output patterns
- **[Options Reference](references/options.md)** - Models, sandbox, reasoning effort, approval modes
- **[Examples](references/examples.md)** - Code review, security analysis, automation scripts

## Available Models

| Model | Description | Best For |
|-------|-------------|----------|
| `gpt-5.1-codex-max` | Latest flagship for deep and fast reasoning | Complex analysis, security audits |
| `gpt-5.1-codex` | Optimized for codex (recommended) | Standard code reviews |
| `gpt-5.1-codex-mini` | Cheaper, faster, less capable | Quick checks, batch operations |
| `gpt-5.1` | Broad world knowledge | General questions, documentation |

## Reasoning Effort

| Level | Use Case |
|-------|----------|
| `low` | Simple checks, syntax review |
| `medium` | Standard code review (default) |
| `high` | Security audits, complex logic |
| `xhigh` | Critical systems, exhaustive analysis |

```bash
codex -c model_reasoning_effort=high "Deep security analysis"
```

## Sandbox Modes

| Mode | Description |
|------|-------------|
| `read-only` | Cannot modify files (safest, recommended for reviews) |
| `workspace-write` | Can modify workspace files |
| `danger-full-access` | Full system access (use sparingly) |

## Key Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--model` | `-m` | Model selection |
| `--sandbox` | `-s` | Sandbox mode |
| `--config` | `-c` | Configuration (e.g., `model_reasoning_effort=high`) |
| `--image` | `-i` | Image input (repeatable) |
| `--cd` | `-C` | Working directory |
| `--add-dir` | | Additional context directories |
| `--search` | | Enable web search |
| `--full-auto` | | Full automation mode |
| `--ask-for-approval` | `-a` | Approval mode (`untrusted`/`on-failure`/`on-request`/`never`) |
| `--skip-git-repo-check` | | Skip Git repository requirement (ask user first) |

## Common Patterns

### Code Review (Claude Code/CI)
```bash
codex exec -s read-only "Review this implementation for:
- Logic errors
- Performance issues
- Security vulnerabilities

Code:
$(cat src/auth.js)"
```

### Maximum Analysis Depth
```bash
codex exec -m gpt-5.1-codex-max -c model_reasoning_effort=xhigh -s read-only \
  "Exhaustive security audit of this authentication system"
```

### Session Continuity
```bash
# Initial analysis
codex exec -s read-only "Analyze this codebase structure"

# Continue with follow-up (inherits settings)
codex exec resume "Now check the error handling"
```

### Cross-Directory Analysis
```bash
codex exec -C ./backend --add-dir ./frontend -s read-only \
  "Review API integration between backend and frontend"
```

### Non-Git Directory (requires user approval)
```bash
# First ask user permission, then:
codex exec --skip-git-repo-check -s read-only "Analyze code"
```

## Error Handling

### Exit Codes
| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | General error (check message) |
| `2` | Invalid arguments |

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `stdin is not a terminal` | Using `codex` in non-TTY | Use `codex exec` |
| `Not inside a trusted directory` | Not in Git repo | Ask user, then use `--skip-git-repo-check` |
| `invalid value for '--ask-for-approval'` | Invalid approval value | Use: `untrusted`, `on-failure`, `on-request`, `never` |

### Error Recovery Pattern
```bash
if ! codex exec -s read-only "Review code"; then
    echo "Codex analysis failed, retrying..."
    sleep 5
    codex exec -s read-only "Review code"
fi
```

## Best Practices

1. **Use `codex exec`** in Claude Code and CI environments (non-TTY)
2. **Default to `-s read-only`** for all review tasks
3. **Match model + reasoning effort** to task complexity
4. **Use `resume`** to maintain session context
5. **Use `--add-dir`** for cross-project context
6. **Use `--full-auto`** only in controlled environments
7. **Ask user before `--skip-git-repo-check`** - explain implications
8. **Check valid approval values** - only use `untrusted`/`on-failure`/`on-request`/`never`
