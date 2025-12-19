# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
