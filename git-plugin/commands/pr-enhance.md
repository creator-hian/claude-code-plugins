---
allowed-tools: Bash(gh pr view:*), Bash(gh issue view:*), Bash(gh label list:*), Bash(gh repo view:*), Bash(git log:*), Bash(git diff:*), Bash(git remote -v), Bash(git remote get-url:*), Bash(mcp-cli tools plugin_github_github), Bash(mcp-cli info plugin_github_github/*), Bash(mcp-cli call plugin_github_github/pull_request_read:*), Bash(mcp-cli call plugin_github_github/issue_read:*), Bash(mcp-cli call plugin_github_github/get_file_contents:*), Bash(mcp-cli call plugin_github_github/list_*), Bash(wc:*), Bash(ls -la), Read, Grep
description: Enhance PR description based on commits, files, and linked issue checklist
model: claude-sonnet-4-5
---

# PR Enhance

Enhance PR description from commits, files, and linked issue checklist.

**Input**: `$ARGUMENTS` = user input after command (various formats supported)

---

## Step 0: Pre-flight (CRITICAL)

### 0-0. Parse Input Arguments

**Parse `$ARGUMENTS` to extract `$PR_NUMBER`, `$OPTIONS`, and `$USER_PROMPT`**

| Component | Pattern | Example |
|-----------|---------|---------|
| `$PR_NUMBER` | Number or URL | `123`, `https://github.com/.../pull/123` |
| `$OPTIONS` | `--flag` patterns | `--dry-run`, `--force`, `--labels-only` |
| `$USER_PROMPT` | Remaining text | `focus on auth changes`, `summarize briefly` |

### Input Examples

| Input | Parsed |
|-------|--------|
| `123` | `$PR_NUMBER=123` |
| `123 --dry-run` | `$PR_NUMBER=123`, `$OPTIONS=--dry-run` |
| `123 focus on security` | `$PR_NUMBER=123`, `$USER_PROMPT="focus on security"` |
| `123 --force emphasize bug fix` | `$PR_NUMBER=123`, `$OPTIONS=--force`, `$USER_PROMPT="emphasize bug fix"` |
| `--dry-run` | `$PR_NUMBER=null` (detect from branch), `$OPTIONS=--dry-run` |
| `summarize briefly` | `$PR_NUMBER=null` (detect from branch), `$USER_PROMPT="summarize briefly"` |
| (empty) | `$PR_NUMBER=null` (detect from branch) |

### Parsing Rules

1. **PR Identifier**: First token that is numeric OR matches `github.com/.../pull/\d+`
2. **Options**: Tokens starting with `--` (`--dry-run`, `--force`, `--labels-only`)
3. **User Prompt**: All remaining tokens after PR identifier and options

### URL Parsing
- Extract from `github.com/{owner}/{repo}/pull/{number}`
- Validate `{owner}/{repo}` matches git remote

### Current Branch Detection (when `$PR_NUMBER=null`)
```bash
gh pr view --json number --jq '.number'
```
- If no PR for current branch → STOP: "No PR found for current branch. Specify PR number."

### Using `$USER_PROMPT`
- Apply to Step 5 (Generate PR Body) as additional guidance
- Examples:
  - `"focus on security"` → Emphasize security-related changes in Summary
  - `"summarize briefly"` → Keep Summary concise
  - `"Korean"` → Write in Korean

### 0-1. Git Repository Detection
```bash
git rev-parse --is-inside-work-tree
git remote get-url origin
```

**Parse remote URL** → Extract `$OWNER` and `$REPO`:
- HTTPS: `https://github.com/OWNER/REPO.git`
- SSH: `git@github.com:OWNER/REPO.git`

| Result | Action |
|--------|--------|
| ❌ Not git repo | STOP: "Run from a git repository" |
| ❌ No remote | STOP: "Add remote: `git remote add origin <URL>`" |
| ❌ Non-GitHub | STOP: "Only GitHub repositories supported" |
| ✅ Found | Store `$OWNER`, `$REPO` → Continue |

### 0-2. Tool Detection
```bash
mcp-cli tools plugin_github_github
```

| Result | `$TOOL_MODE` | For Steps 1-4 |
|--------|--------------|---------------|
| ✅ Tools listed | `mcp` | Use MCP commands from Tool Reference |
| ❌ Error/Empty | `gh` | Use gh CLI commands |

### 0-3. PR Existence Validation
```bash
# gh CLI
gh pr view $PR_NUMBER --json number,state

# MCP (스키마 확인 후)
mcp-cli info plugin_github_github/pull_request_read
mcp-cli call plugin_github_github/pull_request_read '{"method":"get","owner":"$OWNER","repo":"$REPO","pullNumber":$PR_NUMBER}'
```

| Result | Action |
|--------|--------|
| ❌ 404 Not Found | STOP: "PR #$PR_NUMBER does not exist" |
| ❌ 401/403 Auth | STOP: "Check permissions: `gh auth status`" |
| ⚠️ State=CLOSED/MERGED | WARN: "PR is {state}. Continue? [y/N]" |
| ✅ State=OPEN | Continue |

---

## Tool Reference (Hybrid Approach)

**`$TOOL_MODE` 기반 도구 선택** (Step 0-2에서 결정)

### 🔴 MCP 사용 시 필수 절차
```
1. mcp-cli info plugin_github_github/<tool>  ← 스키마 확인 (매번 필수)
2. 스키마 확인 후 mcp-cli call 실행
```

### ⚠️ Critical Schema Notes (오류 방지용)
| MCP Tool | Key Param | 주의사항 |
|----------|-----------|----------|
| `pull_request_read` | `pullNumber` | camelCase ❌ `pull_number` |
| `update_pull_request` | `pullNumber` | camelCase ❌ `pull_number` |
| `issue_read` | `issue_number` | snake_case ✅ |
| `list_labels` | - | **존재하지 않음** → gh CLI 사용 |

### Tool Selection Matrix

| Operation | MCP (`$TOOL_MODE=mcp`) | gh CLI (`$TOOL_MODE=gh`) |
|-----------|------------------------|--------------------------|
| PR 조회 | `pull_request_read` (method: get) | `gh pr view N --json ...` |
| PR 파일 | `pull_request_read` (method: get_files) | `gh pr view N --json files` |
| Issue 조회 | `issue_read` (method: get) | `gh issue view N --json ...` |
| Labels | ❌ **항상 gh CLI** | `gh label list --json name` |
| Commits | `list_commits` | `git log ...` |
| PR 수정 | `update_pull_request` | `gh pr edit N ...` |

### MCP 호출 패턴
```bash
# Step 1: 스키마 확인 (필수)
mcp-cli info plugin_github_github/pull_request_read

# Step 2: 확인된 스키마로 호출
mcp-cli call plugin_github_github/pull_request_read '{
  "method": "get",
  "owner": "$OWNER",
  "repo": "$REPO",
  "pullNumber": $PR_NUMBER
}'
```

---

## Steps 1-4: Gather Data

**Use Tool Reference based on `$TOOL_MODE`** (Labels는 항상 gh CLI)

| Step | Purpose | Tool Mode | Output Variable |
|------|---------|-----------|-----------------|
| 1 | Get available labels | `gh label list` (항상) | `$LABELS_AVAILABLE` |
| 2a | Get PR details (title, body, commits, files, url) | `$TOOL_MODE` | `$PR_DATA` |
| 2b | Extract issue from title (`#\d+`) → fetch if found | `$TOOL_MODE` | `$ISSUE_DATA` (nullable) |
| 3 | Analyze commit messages | `git log` (항상) | `$COMMIT_TYPES` |
| 4 | Get file statistics | `$TOOL_MODE` | `$FILE_STATS` |

### Issue Detection Logic
1. Search PR title for `#(\d+)` pattern
2. Search PR body for `Closes #N`, `Fixes #N`, `Resolves #N`
3. If found → fetch issue details
4. If not found → `$ISSUE_DATA = null`, skip issue sections in template

---

## Data Contract (Steps 0,1-4 → Step 5)

| Source | Variable | Usage |
|--------|----------|-------|
| Step 0-0 | `$USER_PROMPT` | Additional guidance for content generation |
| Step 0-0 | `$OPTIONS` | `--dry-run`, `--force`, `--labels-only` |
| Step 1 | `$LABELS_AVAILABLE` | Step 6 label validation |
| Step 2a | `$PR_DATA.title` | PR type detection, `{Brief description}` |
| Step 2a | `$PR_DATA.commits` | `{Feature point}`, `{Change}` |
| Step 2a | `$PR_DATA.files` | `{file}`, `{Directory tree}` |
| Step 2a | `$PR_DATA.url` | `{PR_URL}` |
| Step 2b | `$ISSUE_DATA.number` | `#{ISSUE_NUMBER}` |
| Step 2b | `$ISSUE_DATA.body` | Checklist items `- [x]`/`- [ ]` |
| Step 3 | `$COMMIT_TYPES` | Template selection (feat/fix/docs) |
| Step 4 | `$FILE_STATS` | Statistics table |

---

## Step 5: Generate PR Body

**Template Reference**: [PR Body Template](../templates/pr-body-template.md)

### Template Selection
| `$COMMIT_TYPES` / Title | Template |
|-------------------------|----------|
| `feat(` | Feature Template |
| `fix(` | Fix Template |
| `docs(` | Docs Template |
| `refactor(` | Refactor Template |
| `chore(`, `build:`, `ci:` | Chore Template |
| (none matched) | Default Template |

### Placeholder Syntax
| Syntax | Meaning |
|--------|---------|
| `{description text}` | Write appropriate content |
| `#{ISSUE_NUMBER}` | Replace with actual number (e.g., `#42`) |
| `{file}` | Insert from `$FILE_STATS` |

### Apply `$USER_PROMPT` (if provided)

| User Prompt | Effect |
|-------------|--------|
| `"focus on security"` | Emphasize security-related changes |
| `"summarize briefly"` | Keep Summary short (2-3 sentences) |
| `"Korean"` / `"한글로"` | Write content in Korean |
| `"detailed"` | Include more technical details |
| `"highlight breaking changes"` | Emphasize breaking changes section |

### Existing Content Check
If `$PR_DATA.body` contains `## Summary`:
- `--force` in `$OPTIONS` → Overwrite silently
- Default → Ask: "Existing Summary found. Overwrite? [y/N]"

---

## Step 6: Label Selection

| Title Pattern | Search Label |
|---------------|--------------|
| `docs(` | `documentation` |
| `feat(` | `enhancement` or `feature` |
| `fix(` | `bug` |
| `refactor(` | `refactor` |

**Scope extraction**: `feat(auth):` → search `auth` in `$LABELS_AVAILABLE`

| Condition | Action |
|-----------|--------|
| Label not in `$LABELS_AVAILABLE` | Skip (don't fail) |
| No matching labels | Proceed without labels |
| Max labels | 3-4 |

---

## Step 7: Update PR (Requires User Confirmation)

⚠️ **Write operations are NOT auto-approved** - user confirmation required.

### 7-1. Dry Run Check
If `--dry-run`:
```
📋 Preview (no changes)
Title: {current → proposed}
Labels: +{new_labels}
Body:
---
{GENERATED_BODY preview}
---
```
→ Exit without changes

### 7-2. Backup Current State
```bash
gh pr view $PR_NUMBER --json title,body,labels > /tmp/pr-$PR_NUMBER-backup.json
```

### 7-3. Apply Updates (use heredoc for multiline body)
```bash
# Body update (heredoc for multiline)
gh pr edit $PR_NUMBER --body "$(cat <<'EOF'
{GENERATED_BODY}
EOF
)"

# Labels (if any)
gh pr edit $PR_NUMBER --add-label "{LABEL1},{LABEL2}"

# Title (if needed)
gh pr edit $PR_NUMBER --title "{FIXED_TITLE}"
```

### 7-4. Partial Failure Handling
| Body | Labels | Title | Action |
|------|--------|-------|--------|
| ✅ | ❌ | - | WARN: "Labels failed. Manual: `gh pr edit $PR_NUMBER --add-label ...`" |
| ✅ | ✅ | ❌ | WARN: "Title failed. Manual: `gh pr edit $PR_NUMBER --title ...`" |
| ❌ | - | - | ERROR: Show error, suggest `gh auth refresh` |

---

## Step 8: Output

```
✅ PR #$PR_NUMBER Enhanced

📋 Updates:
  Body: ✅ updated
  Labels: ✅ {labels} / ⏭️ skipped / ⚠️ failed
  Title: ✅ fixed / ⏭️ unchanged

🔗 {PR_URL}

💾 Backup: /tmp/pr-$PR_NUMBER-backup.json
```

---

## Rollback Procedure

If update is incorrect:
```bash
# Restore from backup
backup="/tmp/pr-$PR_NUMBER-backup.json"
gh pr edit $PR_NUMBER --body "$(jq -r '.body' $backup)"
gh pr edit $PR_NUMBER --title "$(jq -r '.title' $backup)"
```

---

## Options

| Flag | Effect |
|------|--------|
| `--dry-run` | Preview changes, no updates |
| `--labels-only` | Only update labels |
| `--force` | Skip confirmation prompts |

## Rules

1. ⚠️ Labels: Validate against Step 1, NEVER assume existence
2. 📝 Existing content: Ask before overwriting `## Summary`
3. 🎯 Style: Match repository's PR conventions
4. ✅ Checklist: Mark `[x]` only if genuinely completed
5. 📄 Template: Adapt based on PR type, remove unused sections
6. 💾 Backup: Always create before modifications
