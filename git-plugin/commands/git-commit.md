---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*), Bash(git diff:*), Bash(git log:*), Bash(git branch:*)
description: Create a git commit with Conventional Commits format
model: claude-haiku-4-5
---

# Git Commit

## Context

- Current git status: !`git status`
- Current git diff (staged and unstaged changes): !`git diff HEAD`
- Current branch: !`git branch --show-current`
- Recent commits: !`git log --oneline -10`

## Your Task

Based on the changes shown above, create a git commit following these rules:

1. **If no files are staged**: Run `git add` to stage all modified files
2. **Check for forbidden files**: Do NOT commit .env, *.key, credentials.json, secrets
3. **Analyze changes**: Determine if changes should be split into multiple commits
4. **Create commit** using Conventional Commits format: `<type>[scope]: <description>`

### Commit Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Tests
- `chore`: Build, config
- `perf`: Performance
- `ci`: CI/CD

### Rules
- Present tense, imperative mood ("add feature" not "added feature")
- Lowercase description, no period at end
- Keep first line under 72 characters
