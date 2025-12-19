# Changelog

All notable changes to the codex-plugin project.

## [1.4.0] - 2025-12-19

### Changed
- **New Default Model**: `gpt-5.2-codex` is now the recommended default model
  - Latest Codex-optimized frontier model with best code analysis performance
  - Replaces `gpt-5.2` as the primary recommendation
- **Deprecated Model Removed**: `gpt-5.1-codex` has been removed from model lineup
  - Standard code reviews now handled by `gpt-5.2` or `gpt-5.2-codex`

### Updated Files
- `skills/codex-cli/SKILL.md` - Model table and example commands
- `skills/codex-cli/references/options.md` - Model selection section
- `skills/codex-cli/references/commands.md` - Model options and examples
- `skills/codex-cli/references/examples.md` - Model + Reasoning combinations
- `skills/codex-cli/VALIDATION.md` - Valid model list (8.1)
- `skills/codex-claude-loop/SKILL.md` - Model preference options
- `README.md` - Quick start examples and model list

### New Model Lineup (4 models)
| Model | Description | Best For |
|-------|-------------|----------|
| `gpt-5.2-codex` | Latest Codex-optimized frontier model (recommended) | Complex analysis, critical systems |
| `gpt-5.2` | Latest frontier model - best general performance | General AI tasks, multi-domain |
| `gpt-5.1-codex-max` | Codex-optimized flagship for deep reasoning | Security audits, architecture review |
| `gpt-5.1-codex-mini` | Cheaper, faster, less capable | Quick checks, batch operations |

## [1.2.1] - 2025-12-12

### Changed
- **Model Selection**: Updated model lineup for latest GPT models
  - Added `gpt-5.2` as the new flagship model (recommended for best performance)
  - Removed `gpt-5.1` (broad world knowledge model)
  - Retained Codex-optimized lineup: `gpt-5.1-codex-max`, `gpt-5.1-codex`, `gpt-5.1-codex-mini`
- **Default Recommendations**: `gpt-5.2` is now the default recommended model for all examples
- **Documentation**: Updated all skill files, reference docs, and validation documents

### Updated Files
- `skills/codex-cli/SKILL.md` - Model table and example commands
- `skills/codex-cli/references/options.md` - Model selection section
- `skills/codex-cli/references/commands.md` - Model options and examples
- `skills/codex-cli/references/examples.md` - Model + Reasoning combinations
- `skills/codex-cli/VALIDATION.md` - Test commands and valid model list (8.1)
- `skills/codex-claude-loop/SKILL.md` - Model preference options
- `skills/codex-claude-loop/VALIDATION.md` - Test commands
- `README.md` - Quick start examples and model list

### New Model Lineup
| Model | Description | Best For |
|-------|-------------|----------|
| `gpt-5.2` | Latest frontier model - best performance (recommended) | Complex analysis, critical systems |
| `gpt-5.1-codex-max` | Codex-optimized flagship for deep reasoning | Security audits, architecture review |
| `gpt-5.1-codex` | Optimized for codex | Standard code reviews |
| `gpt-5.1-codex-mini` | Cheaper, faster, less capable | Quick checks, batch operations |

## [1.2.0] - 2025-12-03

### Added
- **VALIDATION.md**: Comprehensive validation framework for both skills
  - `codex-cli/VALIDATION.md`: 4-level evaluation (Connectivity, Functionality, Reliability, Integration)
  - `codex-claude-loop/VALIDATION.md`: 5-level evaluation (Prerequisites, Workflow, Feedback Loop, Error Handling, Integration)
- **Error Frequency Scoring**: Test evaluation now includes retry attempt tracking and scoring deductions
- **Error Type Classification**: Systematic categorization of errors (Skill doc, CLI bug, Platform, User, Environment)

### Changed
- Enhanced documentation with timeout recommendations (600000ms / 10 minutes)
- Added Windows-specific limitations and workarounds
- Improved error handling guidance with exit code reference

## [1.1.0] - 2025-12-01

### Added
- **codex-claude-loop Skill**: Dual-AI engineering loop orchestration
  - 6-phase workflow: Plan → Validate → Feedback → Implement → Review → Iterate
  - Role separation: Claude (implementation) vs Codex (validation)
  - Feedback severity classification (Critical, Major, Minor, Info)
- **Reference Documentation**: Added `references/` folder structure
  - `codex-cli/references/commands.md`: Command reference
  - `codex-cli/references/options.md`: Options reference
  - `codex-cli/references/examples.md`: Usage examples

### Changed
- Restructured skill dependency: `codex-claude-loop` requires `codex-cli`
- Enhanced session resume syntax documentation
- Added approval mode validation (untrusted, on-failure, on-request, never)

## [1.0.0] - 2025-11-28

### Added
- **codex-cli Skill**: Foundation skill for Codex CLI fundamentals
  - `codex exec` command usage for non-TTY environments
  - Model selection (`gpt-5.1-codex-max`, `gpt-5.1-codex`, `gpt-5.1-codex-mini`, `gpt-5.1`)
  - Sandbox modes (`read-only`, `workspace-write`, `danger-full-access`)
  - Reasoning effort configuration (`low`, `medium`, `high`, `xhigh`)
  - Session management with `resume` command
- **Plugin Structure**: Standard claude-plugin architecture
  - `.claude-plugin/plugin.json`: Plugin metadata
  - `skills/`: Skill directory with YAML frontmatter
  - Progressive disclosure with `references/` folders
- **Git Repository Detection**: Automatic check with `--skip-git-repo-check` option guidance

### Technical Details
- Non-TTY environment support (Claude Code, CI pipelines, scripts)
- Cross-directory analysis with `--add-dir` option
- Image input support with `-i` option
- Web search integration with `--search` option
