# Changelog

All notable changes to the git-plugin project.

## [1.2.1] - 2026-01-15

### Improved
- **Prompt Compression**: Reduced pr-enhance.md lines with better structure
  - Converted verbose explanations to tables
  - Used symbols for status indicators (✅/❌/⚠️)
  - Externalized PR body template to separate file
- **Template Externalization**: PR body template moved to `templates/pr-body-template.md`
  - Supports 6 PR types: Feature, Fix, Docs, Refactor, Chore, Default
  - Progressive disclosure - loaded only when needed
- **MCP/gh CLI Tool Selection**: Clear `$TOOL_MODE` variable determines which tool to use
  - Tool Reference table now has explicit column per mode
  - Steps 1-4 reference `$TOOL_MODE` for tool selection
- **MCP Schema Documentation**: Hybrid approach for tool schema handling
  - Critical parameter names documented inline (prevent common errors)
  - Full schema discovery via `mcp-cli info` before tool calls (mandatory)
  - Avoids schema drift while reducing prompt size
  - MCP 호출 패턴: `info` → `call` 2단계 필수

### Added
- **Step 0-0: Input Argument Parsing**: Flexible input format support
  - `$PR_NUMBER`: PR number or URL
  - `$OPTIONS`: `--dry-run`, `--force`, `--labels-only`
  - `$USER_PROMPT`: Custom instructions (e.g., `"focus on security"`, `"Korean"`)
  - Auto-detect PR from current branch when no number provided
  - Examples: `123 --dry-run focus on auth changes`
- **Step 0: Git Repository & Tool Detection**: Critical pre-flight check
  - 0-1: Git repository validation with specific error messages
  - 0-2: Tool detection sets `$TOOL_MODE` (mcp/gh)
  - 0-3: PR existence validation (404, auth, state checks)
- **Data Contract Section**: Explicit mapping from Steps 1-4 output to Step 5 template
  - Variables: `$LABELS_AVAILABLE`, `$PR_DATA`, `$ISSUE_DATA`, `$COMMIT_TYPES`, `$FILE_STATS`
  - Template placeholder mapping documented
- **Issue Detection Logic**: Pattern matching for linked issues
  - Title pattern: `#(\d+)`
  - Body patterns: `Closes #N`, `Fixes #N`, `Resolves #N`
- **Step 7 Enhancements**:
  - 7-1: Dry run preview mode
  - 7-2: Backup before modifications (`/tmp/pr-$ARGUMENTS-backup.json`)
  - 7-3: Heredoc syntax for multiline body
  - 7-4: Partial failure handling with manual fallback commands
- **Rollback Procedure**: Documented restore from backup
- **Existing Content Check**: Rule for `## Summary` overwrite confirmation

### Fixed
- **Repository Detection Bug**: Proper git remote detection with helpful error messages
- **MCP Tool Restriction**: Limited to `plugin_github_github/*` only
- **Multiline Body Issue**: Changed `--body "{BODY}"` to heredoc syntax
- **Wildcard Restriction**: `ls:*` → `ls -la` (specific, not wildcard)
- **MCP Schema Parameter Names**: Fixed inconsistent parameter naming
  - `pull_request_read`: `pullNumber` (camelCase, NOT `pull_number`)
  - `issue_read`: `issue_number` (snake_case)
  - `update_pull_request`: `pullNumber` (camelCase)
- **Non-existent MCP Tool**: `list_labels` doesn't exist in GitHub MCP plugin
  - Labels always fetched via `gh label list` regardless of `$TOOL_MODE`

### Changed
- **allowed-tools**: Read-only operations auto-approved, modifications require user confirmation
  - ✅ Auto-approved (read-only):
    - `gh pr view`, `gh issue view`, `gh label list`, `gh repo view`
    - `git remote -v`, `git remote get-url` (not `git remote:*`)
    - `mcp-cli call plugin_github_github/pull_request_read`
    - `mcp-cli call plugin_github_github/issue_read`
    - `mcp-cli call plugin_github_github/get_file_contents`
    - `mcp-cli call plugin_github_github/list_*`
  - ⚠️ Requires user confirmation (modifications):
    - `gh pr edit`, `gh issue edit`, `gh label create/delete`
    - `mcp-cli call plugin_github_github/update_pull_request`
    - `mcp-cli call plugin_github_github/issue_write`

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
