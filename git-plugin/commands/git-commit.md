---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*), Bash(git diff:*)
description: Create a git commit with Conventional Commits format
model: claude-haiku-4-5
---

# Claude Command: Git Commit

This command helps you create well-formatted commits following Conventional Commits specification.

## Usage

To create a commit, just type:
```
/git-commit
```

## What This Command Does

1. Checks which files are staged with `git status`
2. If 0 files are staged, automatically adds all modified and new files with `git add`
3. Performs a `git diff --cached` to understand what changes are being committed
4. Validates staged files for forbidden patterns (.env, *.key, credentials.json, secrets)
5. Analyzes the diff to determine if multiple distinct logical changes are present
6. If multiple distinct changes are detected, suggests breaking the commit into multiple smaller commits
7. For each commit, creates a commit message using Conventional Commits format

## Best Practices for Commits

- **Atomic commits**: Each commit should contain related changes that serve a single purpose
- **Split large changes**: If changes touch multiple concerns, split them into separate commits
- **Conventional Commits format**: Use the format `<type>[scope]: <description>` where type is one of:
  - `feat`: A new feature
  - `fix`: A bug fix
  - `docs`: Documentation changes
  - `style`: Code style changes (formatting, etc)
  - `refactor`: Code changes that neither fix bugs nor add features
  - `perf`: Performance improvements
  - `test`: Adding or fixing tests
  - `chore`: Changes to the build process, tools, etc.
  - `ci`: CI/CD configuration changes
  - `build`: Build system changes
- **Present tense, imperative mood**: Write commit messages as commands (e.g., "add feature" not "added feature")
- **Lowercase description**: Start description with lowercase letter
- **No period**: Do not end description with a period
- **Concise first line**: Keep the first line under 72 characters

## Commit Message Structure

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Breaking Changes

For breaking changes, use one of these formats:

```
feat(api)!: change response format

BREAKING CHANGE: Response now uses JSON:API specification.
```

Or just with `!`:
```
feat!: remove deprecated endpoints
```

## Guidelines for Splitting Commits

When analyzing the diff, consider splitting commits based on these criteria:

1. **Different concerns**: Changes to unrelated parts of the codebase
2. **Different types of changes**: Mixing features, fixes, refactoring, etc.
3. **File patterns**: Changes to different types of files (e.g., source code vs documentation)
4. **Logical grouping**: Changes that would be easier to understand or review separately
5. **Size**: Very large changes that would be clearer if broken down

## Examples

Good commit messages:
- feat: add user authentication system
- fix: resolve memory leak in rendering process
- docs: update API documentation with new endpoints
- refactor: simplify error handling logic in parser
- feat(auth): implement OAuth2 login flow
- fix(api): correct null pointer in user service
- chore(deps): update dependencies to latest versions
- perf(db): optimize query performance with indexing
- test(auth): add unit tests for login validation

Example of splitting commits:
- First commit: feat(auth): add OAuth2 token management
- Second commit: feat(auth): implement refresh token rotation
- Third commit: docs(auth): update authentication documentation
- Fourth commit: test(auth): add integration tests for OAuth2 flow

## Validation Rules

Before committing, the command checks for:

- **Forbidden files**: .env, .env.*, *.pem, *.key, credentials.json, secrets.yaml
- **Secret patterns**: Hardcoded API keys, passwords, tokens in code
- If validation fails, you'll be asked to fix issues before proceeding

## Important Notes

- If specific files are already staged, the command will only commit those files
- If no files are staged, it will automatically stage all modified and new files
- The commit message will be constructed based on the changes detected
- Before committing, the command will review the diff to identify if multiple commits would be more appropriate
- If suggesting multiple commits, it will help you stage and commit the changes separately
- Always reviews the commit diff to ensure the message matches the changes
