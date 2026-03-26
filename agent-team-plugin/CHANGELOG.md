# Changelog

All notable changes to the agent-team-plugin will be documented in this file.

## [2.1.0] - 2026-03-26

### Added
- **Shared protocols** (`skills/_shared/`): Logging protocol and pattern schema definitions shared across all skills
- **Logging & Pattern Protocol** sections in all 3 skills (da-review, decide, diverse-plan) — each skill now reads previous execution logs/patterns at start and writes results at completion
- **Binary evaluation criteria** (`EVAL.md`) for all 3 skills — structured YES/NO evaluation guidelines for measuring skill output quality
- Runtime data stored globally at `~/.claude/agent-team/{skill-name}/` for cross-project pattern reuse

### Changed
- Logging paths updated from project-relative (`.claude/agent-team/`) to global home directory (`~/.claude/agent-team/`) across all skills and evaluation files

## [2.0.0] - 2026-03-19

### Added
- **decide** skill for quick A-vs-B technical decisions with advocate-based analysis and confidence levels
- Constraint verification and shortcut detection in decide skill

### Changed
- **da-review** skill optimized with adaptive Fast/Team mode selection and enhanced coverage
- **diverse-plan** skill improved for higher plan quality with better agent perspective diversity
- Plugin metadata author field restructured to object format

## [1.0.0] - Initial Release

### Added
- **da-review** skill: Multi-phase adversarial review with specialized agent perspectives
- **diverse-plan** skill: Multi-perspective implementation planning with parallel agent dispatch
