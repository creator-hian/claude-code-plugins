---
allowed-tools: Bash(gh pr:*), Bash(gh issue:*), Bash(gh label:*), Bash(git log:*), Bash(git diff:*), Bash(wc:*), Bash(ls:*), Read, Grep
description: Enhance PR description based on commits, files, and linked issue checklist
model: claude-sonnet-4-5
---

# PR Enhance

Automatically enhance PR description based on work history (commits, file changes, issue checklist).

## Context

- PR number from user input: `$ARGUMENTS`

## Your Task

Given a PR number, enhance the PR description following the project's documentation PR conventions.

### Step 1: Gather Repository Labels (FIRST)

```bash
# Get all available labels in the repository
gh label list --limit 50 --json name,description
```

Store these labels for later matching. Only use labels that exist in this list.

### Step 2: Gather PR Information

```bash
# Get PR details
gh pr view $ARGUMENTS --json title,body,labels,baseRefName,headRefName,commits,files,url

# Extract linked issue number from title (pattern: #XX)
# Then fetch issue details
gh issue view {ISSUE_NUMBER} --json title,body
```

### Step 3: Analyze Commits

```bash
# Get commits in the PR
gh pr view $ARGUMENTS --json commits

# Look for subtask patterns: "auto-claude: subtask-X-X - ..."
# Or conventional commits: "feat:", "docs:", "fix:", etc.
```

### Step 4: Calculate File Statistics

```bash
# Get file change stats from PR (additions, deletions, filename)
gh pr view $ARGUMENTS --json files --jq '.files[] | "\(.additions)\t\(.deletions)\t\(.path)"'

# For documentation PRs, calculate file sizes
ls -la {changed_files}
```

### Step 5: Generate Enhanced PR Body

Follow this structure (based on existing PR conventions #79, #80):

```markdown
## Summary

{Brief description based on commits and PR title}

### 📁 생성된 문서 구조

```
{Directory tree of changed/added files}
```

### 📊 문서 통계

| 항목 | 수량 |
|------|------|
| 총 문서 파일 | X개 |
| {file1} | X bytes |
| ... | ... |
| Mermaid 다이어그램 | X+ |

## ✅ Checklist (Issue #{ISSUE_NUMBER})

{Extract checklist from issue body and mark completed items}

### {Section Name}
- [x] {Completed item}
- [x] {Completed item}
- [ ] {Incomplete item}

## 🔗 Related

- Closes #{ISSUE_NUMBER}
- Reference: #{related_PRs}

---

🤖 Generated with [Claude Code](https://claude.ai/code)
```

### Step 6: Select Labels from Available Labels

From the labels fetched in Step 1, select appropriate labels by matching:

1. **PR Type Detection**:
   - Title starts with `docs(` → look for `documentation` label
   - Title starts with `feat(` → look for `enhancement` or `feature` label
   - Title starts with `fix(` → look for `bug` label
   - Title starts with `refactor(` → look for `refactor` label (if exists)

2. **System Name Detection**:
   - Extract system name from title: `docs(TouchFeedbackSystem):` → `TouchFeedbackSystem`
   - Search for matching label in available labels (case-insensitive)
   - Common patterns: `{SystemName}`, `{systemname}`, `system:{name}`

3. **Label Selection Rules**:
   - ONLY select labels that exist in the repository (from Step 1)
   - Skip if no matching label found (don't fail)
   - Maximum 3-4 labels to avoid over-tagging

### Step 7: Update PR

```bash
# Update body
gh pr edit $ARGUMENTS --body "{GENERATED_BODY}"

# Add labels (only existing labels from Step 1)
gh pr edit $ARGUMENTS --add-label "{SELECTED_LABELS}"

# Fix title if needed (remove extra spaces)
gh pr edit $ARGUMENTS --title "{FIXED_TITLE}"
```

### Step 8: Output Result

```
✅ PR #$ARGUMENTS Enhanced

📋 Updates:
- Title: {fixed/unchanged}
- Body: {updated with structured content}
- Labels: {added labels} (from available: {total_labels})

🔗 URL: {PR_URL}
```

## Options

User can provide options after PR number:
- `--dry-run`: Show preview without updating
- `--labels-only`: Only add labels, don't change body
- `--force`: Update without confirmation

## Rules

1. **Labels**: NEVER assume labels exist - always check Step 1 results first
2. Always preserve existing body content if `## Summary` already exists (ask before overwriting)
3. Match the PR convention style of the repository (check recent merged PRs)
4. Extract issue checklist accurately - mark as [x] only if genuinely completed
5. For non-documentation PRs, adapt the template appropriately
