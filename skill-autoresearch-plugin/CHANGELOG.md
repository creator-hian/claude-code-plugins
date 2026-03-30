# Changelog

All notable changes to the skill-autoresearch-plugin will be documented in this file.

## [1.1.0] - 2026-03-27

### Added
- **force_at_least_one_iteration** flag in program.md — baseline이 target에 도달해도 미시도 전략에 대해 최소 1회 mutation 시도 보장
- **NEUTRAL mutation 판정** — pass_rate 동일 + program.md 전략 기반 + regression 없음일 때 사용자에게 diff 제시 후 승인/거부 결정 위임
- **mutation_exclusions 스키마** — program.md에 exclusion 패턴 정의로 외부 문제(API 스키마, 서버 버그)에 mutation 예산 낭비 방지
- **eval 레벨 분류 (L1/L2/L3)** — L1-routing → L2-execution → L3-quality 단계적 집중으로 개선 효율 향상
- **외부 검증 결과 연동 (Phase 0-5)** — verification-results.json의 capability_issues를 mutation 대상으로, api_issues를 자동 exclusion으로 분류
- **force 종료 조건 분기** — Circuit breaker에 force 설정 시 '모든 전략 시도 완료' 조건 추가

### Changed
- Phase 2-3 MUTATE에 exclusion 패턴 매칭 사전 필터링 단계 추가
- Phase 2-6 COMPARE 판정 테이블에 NEUTRAL 행 추가 (KEEP/DISCARD 외 3번째 판정)
- Phase 2-7 CIRCUIT BREAKER 종료 조건 테이블 확장 (force 설정 분기)
- evals.json 스키마에 선택적 `level` 필드 추가 (기본값: L1-routing)
- program-md-guide.md에 메타 설정 및 Mutation 금지 영역 섹션 추가

### Verified
- 14개 eval (6 core + 8 edge case) 전량 PASS
- Baseline mean_pass_rate 0.22 → 1.0 (+0.78)
- Edge cases: stall_limit > force 우선순위, NEUTRAL 승인/거부 경로 분리, exclusion 불일치 시 정상 진행 등

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
