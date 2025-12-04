# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
