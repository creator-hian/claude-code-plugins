# Git Plugin for Claude Code

Git workflow automation with PR enhancement support.

## Overview

This plugin provides `/pr-enhance` command for enhancing PR descriptions based on work history.

## Features

### `/pr-enhance` Command

Enhance PR description based on commits, file changes, and linked issue checklist.

**Usage:**
```bash
/pr-enhance <PR_NUMBER>
/pr-enhance 85
/pr-enhance 85 --dry-run
/pr-enhance 85 --labels-only
```

**Options:**
| Option | Description |
|--------|-------------|
| `--dry-run` | Preview changes without updating |
| `--labels-only` | Only add labels, don't change body |
| `--force` | Update without confirmation |

**What it does:**
1. Fetches available repository labels (dynamic detection)
2. Gathers PR information (title, body, commits, files)
3. Extracts linked issue number and checklist
4. Analyzes commits (subtask patterns, conventional commits)
5. Calculates file statistics
6. Generates structured PR body following project conventions
7. Selects appropriate labels from available labels
8. Updates PR with enhanced content

**Generated PR Body Structure:**
```markdown
## Summary
{Description based on commits}

### 📁 생성된 문서 구조
{Directory tree}

### 📊 문서 통계
{File counts, sizes, diagram counts}

## ✅ Checklist (Issue #XX)
{Extracted and marked checklist}

## 🔗 Related
- Closes #XX
- Reference: #YY
```

**Label Selection:**
- Dynamically fetches repository labels first
- Matches PR type: `docs(` → `documentation`, `feat(` → `enhancement`
- Matches system name: `docs(TouchFeedbackSystem)` → `TouchFeedbackSystem` label
- Only applies labels that exist in the repository

---

## Installation

1. Copy this plugin to your Claude Code plugins folder
2. Restart Claude Code or reload plugins
3. Use `/pr-enhance` command

## Version History

| Version | Changes |
|---------|---------|
| 1.1.0 | `/pr-enhance` command for PR description enhancement |

## Author

**Creator Hian**

## Future Expansion

Additional skills can be added:
- `/pr-review` - Automated PR review assistance
- `/pr-summary` - Generate PR summary from diff
