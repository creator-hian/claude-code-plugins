# Git Plugin for Claude Code

Git commit automation with Conventional Commits support.

## Overview

This plugin provides a `/git-commit` command for creating well-formatted commits following Conventional Commits specification.

## Features

### `/git-commit` Command

Create commits with Conventional Commits format.

**Usage:**
```bash
/git-commit
```

**What it does:**
1. Checks staged files with `git status`
2. Auto-stages all modified files if nothing is staged
3. Analyzes changes with `git diff --cached`
4. Validates for forbidden files (.env, *.key, secrets)
5. Suggests splitting if multiple logical changes detected
6. Creates commit message in Conventional Commits format

**Commit Types:**
| Type | Usage |
|------|-------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting |
| `refactor` | Code restructuring |
| `test` | Tests |
| `chore` | Build, config |
| `perf` | Performance |
| `ci` | CI/CD |

**Example Output:**
```
feat(auth): add OAuth2 login support
fix(api): resolve null pointer in user service
docs: update installation guide
```

## Installation

1. Copy this plugin to your Claude Code plugins folder
2. Restart Claude Code or reload plugins
3. Use `/git-commit` to create commits

## Version

**Version**: 1.0.0
**Author**: Creator Hian

## Future Expansion

Additional skills (git-workflow, git-pre-commit, etc.) can be added as needed.
