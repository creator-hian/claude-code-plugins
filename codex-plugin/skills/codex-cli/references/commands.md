# Codex CLI Commands Reference

## Table of Contents

- [Interactive vs Non-Interactive](#interactive-vs-non-interactive) - Environment modes
- [exec](#exec) - Execute AI-assisted code operations
- [resume](#resume) - Continue previous session
- [apply](#apply) - Apply code changes
- [Input/Output Handling](#inputoutput-handling) - Input methods, output handling
- [Other Commands](#other-commands) - sandbox, login, mcp, etc.
- [Exit Codes](#exit-codes) - Error handling

---

## Interactive vs Non-Interactive

| Environment | Command | Notes |
|-------------|---------|-------|
| Terminal (TTY) | `codex "prompt"` | Interactive mode, user can respond |
| **Claude Code / CI / Scripts** | `codex exec "prompt"` | Non-interactive, REQUIRED for non-TTY |

⚠️ **Common Error**: `stdin is not a terminal`
**Solution**: Use `codex exec` instead of `codex`

---

## exec

Execute Codex in non-interactive mode.

### Syntax
```bash
codex exec [options] [prompt]
```

**Note**: In non-TTY environments (Claude Code, CI pipelines, scripts), you MUST use `codex exec`.

### Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--model` | `-m` | Model: `gpt-5.2`, `gpt-5.1-codex-max`, `gpt-5.1-codex`, `gpt-5.1-codex-mini` |
| `--config` | `-c` | Config: `model_reasoning_effort=low\|medium\|high\|xhigh` |
| `--sandbox` | `-s` | Sandbox: `read-only`, `workspace-write`, `danger-full-access` |
| `--image` | `-i` | Image input (repeatable) |
| `--ask-for-approval` | `-a` | Approval: `untrusted`, `on-failure`, `on-request`, `never` |
| `--full-auto` | | No approvals, workspace-write sandbox |
| `--cd` | `-C` | Working directory |
| `--add-dir` | | Additional context directories |
| `--search` | | Enable web search |
| `--skip-git-repo-check` | | Skip Git repository requirement |

### Examples
```bash
# Basic (Claude Code/CI - non-interactive)
codex exec "Review this code for bugs"

# Model selection
codex exec -m gpt-5.2 "Complex security audit"
codex exec -m gpt-5.1-codex "Standard code review"
codex exec -m gpt-5.1-codex-mini "Quick syntax check"

# Reasoning effort
codex exec -c model_reasoning_effort=high "Deep analysis"
codex exec -c model_reasoning_effort=xhigh "Exhaustive review"

# Combined: model + reasoning + sandbox
codex exec -m gpt-5.2 -c model_reasoning_effort=xhigh -s read-only "Maximum depth audit"

# With image
codex exec -i screenshot.png "What's shown here?"

# Cross-directory
codex exec -C ./backend --add-dir ./frontend "Review API integration"

# Non-Git directory (ask user first)
codex exec --skip-git-repo-check -s read-only "Analyze code"
```

---

## resume

Continue a previous Codex session.

### Syntax
```bash
codex exec resume [session-id]
```

### Behavior
- Resumes with full context
- Inherits all settings from original session

### Examples
```bash
# Resume last session (Claude Code/CI)
codex exec resume

# Resume specific session
codex exec resume abc123
```

---

## apply

Apply code changes from markdown code block.

### Syntax
```bash
codex apply [options]
```

### Examples
```bash
cat changes.md | codex apply
```

---

## Input/Output Handling

### Input Methods
```bash
# Direct prompt (Claude Code/CI)
codex exec "Review this code"

# Pipe from file
cat src/auth.js | codex exec "Review:"

# Combined
codex exec -s read-only "Review: $(cat src/auth.js)"

# Here document
codex exec << 'EOF'
Review this implementation
EOF
```

### Output Handling
```bash
# Capture to variable
result=$(codex exec "Analyze code")

# Save to file
codex exec "Analyze code" > result.txt

# Parse JSON
codex exec "List issues as JSON" | jq '.issues[]'
```

---

## Other Commands

| Command | Description |
|---------|-------------|
| `codex login` | Authenticate with Codex service |
| `codex logout` | End current session |
| `codex sandbox` | Manage sandbox environments |
| `codex mcp` | MCP server operations |
| `codex completion bash/zsh` | Generate shell completions |

---

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | General error |
| `2` | Invalid arguments |

```bash
codex -s read-only "Analyze" || echo "Failed with code $?"
```
