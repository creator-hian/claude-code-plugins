# Changelog

All notable changes to the git-plugin project.

## [1.2.0] - 2026-01-15

### Changed
- **Command Replacement**: `git-commit` → `pr-enhance`
  - Intelligent PR description generation from commits and file changes
  - Dynamic repository label fetching and auto-application
  - Issue checklist extraction and completion tracking
  - Structured PR body following project conventions

### Fixed
- **gh CLI Compatibility**: Replaced non-existent `gh pr diff --stat` with `gh pr view --json files`

### Removed
- `commands/git-commit.md` - Replaced by pr-enhance

### New Files
- `commands/pr-enhance.md` - PR enhancement command

## [1.1.0] - 2026-01-05

### Added
- **git-commit Command**: Automated git commit workflow
  - Conventional commit message generation
  - Staged changes analysis
  - Co-authored-by attribution

## [1.0.0] - 2025-12-01

### Added
- **Plugin Structure**: Standard claude-plugin architecture
  - `.claude-plugin/plugin.json`: Plugin metadata
  - `commands/`: Command directory
- Initial git workflow automation
