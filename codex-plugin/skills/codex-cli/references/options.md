# Codex CLI Options Reference

## Model Selection (-m, --model)

| Model | Description | Best For |
|-------|-------------|----------|
| `gpt-5.2-codex` | Latest Codex-optimized frontier model (recommended) | Complex analysis, critical systems |
| `gpt-5.2` | Latest frontier model - best general performance | General AI tasks, multi-domain |
| `gpt-5.1-codex-max` | Codex-optimized flagship for deep reasoning | Security audits, architecture review |
| `gpt-5.1-codex-mini` | Cheaper, faster, less capable | Quick checks, batch operations |

```bash
codex -m gpt-5.2-codex "Deep security audit"
codex -m gpt-5.2 "General analysis"
codex -m gpt-5.1-codex-mini "Quick syntax check"
```

---

## Reasoning Effort

Set via `-c model_reasoning_effort=LEVEL`

| Level | Use Case |
|-------|----------|
| `low` | Syntax checks, quick validation |
| `medium` | Standard review (default) |
| `high` | Security audits, complex logic |
| `xhigh` | Critical systems, exhaustive analysis |

```bash
codex -c model_reasoning_effort=low "Quick check"
codex -c model_reasoning_effort=xhigh "Exhaustive security audit"

# Combine with model
codex -m gpt-5.2-codex -c model_reasoning_effort=xhigh "Maximum depth analysis"
```

---

## Sandbox Modes (-s, --sandbox)

| Mode | Description |
|------|-------------|
| `read-only` | Cannot modify files (recommended for reviews) |
| `workspace-write` | Can modify workspace files |
| `danger-full-access` | Full system access (dangerous) |

```bash
codex -s read-only "Review code"
codex -s workspace-write "Refactor this function"
```

---

## Approval Mode (-a, --ask-for-approval)

| Mode | Description |
|------|-------------|
| `untrusted` | Treat all operations as untrusted (safest) |
| `on-failure` | Ask only when operation fails |
| `on-request` | Ask when explicitly requested |
| `never` | Never ask (dangerous) |

⚠️ **Invalid values**: `auto-edit`, `always`, `unless-allow-listed` are NOT supported.

```bash
codex exec -a untrusted "Make changes"
codex exec -a on-failure "Automated task with failure fallback"
codex exec --full-auto "Automated task"  # No approvals, workspace-write
```

---

## Image Input (-i, --image)

```bash
# Single image
codex -i screenshot.png "What's shown?"

# Multiple images
codex -i before.png -i after.png "Compare these"
```

Supports: PNG, JPG, JPEG, GIF, WebP

---

## Directory Options

### Working Directory (-C, --cd)
```bash
codex -C /path/to/project "Analyze codebase"
```

### Additional Directories (--add-dir)
```bash
codex --add-dir ../shared-lib "Review integration"
codex -C ./backend --add-dir ./frontend "Review API"
```

---

## Git Repository Check

Codex requires a Git repository by default. For non-Git directories:

```bash
# Skip Git check (ask user permission first)
codex exec --skip-git-repo-check -s read-only "Analyze code"
```

**Error**: `Not inside a trusted directory and --skip-git-repo-check was not specified`
**Solution**: Ask user, then add `--skip-git-repo-check`

---

## Other Options

| Option | Description |
|--------|-------------|
| `--search` | Enable web search |
| `--full-auto` | No approvals + workspace-write |
| `--profile` / `-p` | Use specific profile |
| `--oss` | Use OSS model (Ollama) |
| `--enable` / `--disable` | Toggle features |
| `--skip-git-repo-check` | Skip Git repository requirement |

---

## Quick Reference

| Option | Alias | Description |
|--------|-------|-------------|
| `--model` | `-m` | Model selection |
| `--sandbox` | `-s` | Sandbox mode |
| `--config` | `-c` | Configuration settings |
| `--image` | `-i` | Image input (repeatable) |
| `--ask-for-approval` | `-a` | Approval mode (`untrusted`/`on-failure`/`on-request`/`never`) |
| `--cd` | `-C` | Working directory |
| `--add-dir` | | Additional directories |
| `--search` | | Enable web search |
| `--full-auto` | | Full automation |
| `--profile` | `-p` | User profile |
| `--skip-git-repo-check` | | Skip Git repository check |
