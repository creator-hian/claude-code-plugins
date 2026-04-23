# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.9.0] - 2026-04-23

### Added
- **secret-guard-plugin v1.0.0**: Credential leak prevention for Bash/PowerShell workflows
  - Pre-block hook (PreToolUse) with 6 deny rules — `echo-token-env`, `gh-auth-token-bare`, `aws-credentials-dump`, `env-dump-wide`, `cat-dotenv`, `curl-verbose-auth`; each deny carries a `SUGGESTION:` line so the model can rewrite to a safe idiom rather than retry the same pattern
  - Post-detect hook (PostToolUse) scanning 11 token patterns — GitHub (classic/OAuth/fine-grained PAT), AWS AKIA, Google API key, Slack, JWT, Stripe live key, OpenAI-style keys, Anthropic keys, HTTP `Authorization: Bearer` headers, PEM-encoded private keys
  - `secret-safe-diagnostics` skill with golden presence/length/hash idioms (bash + PowerShell) and per-provider safe-vs-leaks matrix across GitHub, AWS, GCP, Azure, OpenAI, Anthropic, Slack, Stripe, and database connection strings; L3 references cover anti-patterns, safe patterns by developer intent, and credential-provider map
  - Documentation of a `claude -p`-based trigger-accuracy experiment (`secret-guard-plugin/docs/trigger-opt-experiment-2026-04-23.md`, reusable eval set at `secret-guard-plugin/docs/trigger-eval-2026-04-23.json`) including the harness limitation that prevented mutation in this run and the `PYTHONUTF8=1` requirement on Windows + Korean locale; the document doubles as the spec for a future standalone `trigger_opt.py` replacement for skill-creator's SDK-based `improve_description.py`

### Changed
- **Marketplace registration**: Added `secret-guard-plugin` entry to `.claude-plugin/marketplace.json`
- **Plugin inventory**: README.md plugin summary table extended (active Skills total 20 → 21); CLAUDE.md Plugin Summary table updated with the new entry

## [0.8.1] - 2026-03-26

### Deprecated
- **codex-plugin v1.4.0**: No longer maintained — OpenAI Codex CLI integration deprecated
- **gemini-plugin v1.1.0**: No longer maintained — Google Gemini CLI integration deprecated
- **ai-orchestration-plugin v1.2.0**: No longer maintained — depends on deprecated codex-plugin and gemini-plugin

## [0.8.0] - 2026-03-26

### Added
- **skill-autoresearch-plugin v1.0.0**: Autonomous SKILL.md improvement via Karpathy autoresearch technique
  - `autoresearch` skill - iterative mutate → evaluate → keep/discard hill-climbing loop
  - Assertion-level regression detection (discard even if overall pass rate improves)
  - program.md meta-layer for user-defined mutation strategies
  - Default mutation strategy (missing → ambiguous → structural → excess)
  - Workspace isolation for safe variant management
  - Circuit breaker (auto-stop after N consecutive stalls)
  - Context window protection (grading summary only, no raw eval output)
  - L3 reference: program-md-guide.md with examples for da-review and decide

- **da-review-workspace**: Extended evals.json with 15 keyword-based assertions across 3 eval cases for automated grading support

## [0.7.0] - 2026-03-26

### Changed
- **agent-team-plugin v2.1.0**: Logging protocol, evaluation criteria, and shared infrastructure
  - Added shared protocols (`skills/_shared/`): logging-protocol.md, pattern-schema.md
  - Added Logging & Pattern Protocol sections to all 3 skills (da-review, decide, diverse-plan)
  - Added binary evaluation criteria (`EVAL.md`) for all 3 skills
  - Runtime data stored globally at `~/.claude/agent-team/{skill-name}/` for cross-project pattern reuse

## [0.6.0] - 2025-12-19

### Added
- **unity-plugin v1.2.0**: New Collection Pool skill
  - `unity-collection-pool` skill - GC-free collection management
  - ListPool, HashSetPool, DictionaryPool, CollectionPool usage
  - ObjectPool<T> for custom object pooling
  - Pool lifecycle and disposal patterns (PooledObject, using pattern)
  - Memory optimization and capacity management
  - Thread safety considerations
  - L3 references: pool-fundamentals.md, advanced-patterns.md

- **unity-plugin v1.1.0**: New TextMeshPro skill
  - `unity-textmeshpro` skill - Professional text rendering with SDF technology
  - Font asset creation and configuration (Static vs Dynamic)
  - Performance optimization patterns (SetText, batching, GC reduction)
  - Rich text formatting and material presets
  - Text animation techniques (Wave, Rainbow, Pulse)
  - Typewriter effects with sound integration
  - Link/event handling and localization integration
  - L3 references: fundamentals.md, performance-optimization.md, advanced-patterns.md

## [0.5.0] - 2025-12-18

### Changed
- **gemini-plugin v1.1.0**: Skill documentation optimization
  - `gemini-cli` SKILL.md: 224→179 lines (-20%)
  - `gemini-claude-loop` SKILL.md: 151→135 lines (-11%)
  - Korean role modes converted to English (검증/리뷰만 → Review-Only, 검증+제안 → Review+Suggest)
  - Added L3 references to reduce L2 content redundancy

- **codex-plugin v1.3.0**: Skill documentation optimization
  - `codex-cli` SKILL.md: 245→182 lines (-26%)
  - `codex-claude-loop` SKILL.md: 224→163 lines (-27%)
  - Added L3 references for detailed prompts and error handling
  - Consolidated command examples with references to options.md

- **ai-orchestration-plugin v1.1.0**: Skill documentation optimization
  - `ai-orchestration-feedback-loop` SKILL.md: 315→228 lines (-28%)
  - Added L3 references to prompt-templates.md for phases 2, 3, 6
  - Consolidated phase command examples into table format

### Technical
- All optimizations validated with Gemini CLI for functional equivalence
- 100% feature parity maintained across all skill documentation
- Progressive Disclosure (L1/L2/L3) pattern consistently applied

## [0.4.0] - 2025-12-04

### Added
- **ai-orchestration-plugin**: Multi-AI 오케스트레이션 플러그인
  - `ai-orchestration-feedback-loop` skill - Triple-AI (Claude+Codex+Gemini) 및 Dual-AI 모드 지원
  - 역할 분담: Claude(계획/구현), Codex(검증/보안), Gemini(창의적 리뷰/UX)
  - codex-plugin, gemini-plugin 의존성 통합

## [0.3.0] - 2025-12-04

### Added
- **gemini-plugin**: Google Gemini CLI 통합 플러그인
  - `gemini-cli` skill - Gemini CLI 기본 명령어, 모델 선택, 출력 포맷, 세션 관리
  - `gemini-claude-loop` skill - Claude-Gemini Dual-AI 협업 워크플로우
  - references 폴더: commands.md, options.md, examples.md
- **codex-plugin 개선**
  - `codex-claude-loop` skill에 context 파일 관리 기능 추가

### Changed
- README.md 업데이트: 5개 플러그인, 16개 Skills 반영
- 폴더 구조 문서 업데이트

## [0.2.0] - 2025-11-21

### Added
- C# Plugin with comprehensive skills and documentation
  - `csharp-async-patterns` skill for modern async/await patterns
  - `csharp-xml-docs` skill with 12 detailed documentation examples
  - C# Pro agent for expert-level C# development assistance
- Skills separation strategy documentation (SKILL_SEPARATION_STRATEGY.md)
- Plugin marketplace metadata moved to `.claude-plugin/marketplace.json`
- Comprehensive README updates with:
  - 3-Level Progressive Disclosure architecture explanation
  - Skills vs Agents/Subagents comparison
  - Plugin creation guide with `create_plugin.py` script
  - Context optimization examples
  - Best practices and development workflow

### Changed
- Moved `marketplace.json` to `.claude-plugin/marketplace.json` for better organization

## [0.1.0] - 2025-11-21

### Added
- Initial repository setup
- Plugin marketplace documentation
- Plugin template structure
- Basic project structure and organization
