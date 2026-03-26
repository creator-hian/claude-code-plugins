# Changelog

All notable changes to the skill-autoresearch-plugin will be documented in this file.

## [1.0.0] - 2026-03-26

### Added
- **autoresearch** skill: Autonomous SKILL.md improvement via iterative experiment loop
  - Phase 0: Initialization (target skill detection, EVAL.md validation, budget setup)
  - Phase 1: Baseline measurement (multi-run eval with assertion-level tracking)
  - Phase 2: Iterative experiment loop (mutate → validate structure → evaluate → keep/discard)
  - Phase 3: Result reporting (baseline vs final comparison, mutation history)
- Default mutation strategy (missing → ambiguous → structural → excess)
- program.md meta-layer support for user-defined research strategies
- Workspace isolation pattern for safe variant management
- Assertion-level regression detection (prevent regressions even when overall pass rate improves)
- Circuit breaker (auto-stop after N consecutive stalls or target achievement)
- Structural validation (YAML frontmatter + required sections lint after each mutation)
- Level 3 reference: program.md authoring guide with examples
