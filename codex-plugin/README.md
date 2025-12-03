# Codex Plugin

OpenAI Codex CLI integration and dual-AI orchestration patterns for Claude Code.

## Overview

이 플러그인은 OpenAI Codex CLI와 Claude Code 간의 통합 및 협업 패턴을 제공합니다. 두 AI 시스템의 강점을 활용하여 코드 품질을 향상시키는 워크플로우를 구현합니다.

## Skills

### 1. codex-cli (Foundation)

Codex CLI 기본 사용법을 제공하는 foundation 스킬입니다.

**범위:**
- `codex exec` 명령어 사용법
- 모델 선택 (`gpt-5`, `gpt-5-codex`)
- Reasoning effort 설정 (`low`, `medium`, `high`)
- Sandbox 모드 (`read-only`, `write`, `network`)
- 세션 관리 (`resume --last`)

**사용 시점:**
- Codex CLI 명령어 실행 시
- 단독 코드 리뷰/분석 시
- 다른 오케스트레이션 스킬의 기반으로

### 2. codex-claude-loop (Orchestration)

Claude Code와 Codex 간의 dual-AI 협업 루프를 오케스트레이션합니다.

**의존성:** `requires: codex-cli`

**범위:**
- 6-Phase 워크플로우 (Plan → Validate → Feedback → Execute → Review → Iterate)
- Claude-Codex 역할 분담 패턴
- 피드백 루프 관리
- 품질 게이트 및 종료 조건

**사용 시점:**
- 복잡한 기능 개발
- 높은 품질이 중요한 코드
- 보안/성능이 critical한 작업
- 대규모 리팩토링

## Architecture

```
codex-plugin/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   ├── codex-cli/                  # Level 1: CLI Foundation
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── commands.md         # 명령어 레퍼런스
│   │       ├── options.md          # 옵션 상세
│   │       └── examples.md         # 사용 예시
│   │
│   └── codex-claude-loop/          # Level 2: Orchestration
│       ├── SKILL.md                # requires: codex-cli
│       └── references/
│           └── (워크플로우 문서)
│
└── README.md
```

## Skill Dependency

```
codex-cli (Foundation)
    ↑
    └── codex-claude-loop (requires: codex-cli)
```

향후 확장 시:
```
codex-cli
    ↑
    ├── codex-claude-loop
    ├── codex-security-audit (가정)
    └── codex-performance-review (가정)
```

## Quick Start

### Codex CLI 단독 사용
```bash
# 코드 리뷰
echo "Review this code" | codex exec -m gpt-5-codex --sandbox read-only

# 세션 이어가기
echo "Check error handling" | codex exec resume --last
```

### Claude-Codex Loop 사용
```
1. Claude가 계획 수립
2. Codex로 계획 검증 (codex exec)
3. Claude가 구현
4. Codex로 코드 리뷰 (codex exec)
5. Claude가 수정
6. Codex로 재검증 (codex exec resume)
7. 반복 until 완료
```

## 핵심 워크플로우

```
Plan (Claude) → Validate Plan (Codex) → Feedback →
Implement (Claude) → Review Code (Codex) →
Fix Issues (Claude) → Re-validate (Codex) → Repeat until perfect
```

**역할 분담:**
- **Claude**: 모든 코드 작성 및 수정
- **Codex**: 모든 검증 및 리뷰

## 언제 사용하나?

✅ **사용 권장:**
- 복잡한 기능 개발 (여러 단계 필요)
- 높은 품질이 중요한 코드
- 보안/성능이 critical한 작업
- 대규모 리팩토링

❌ **과한 경우:**
- 간단한 일회성 수정
- 프로토타입/실험 코드
- 개인 학습용 간단한 예제

## 참고 문서

- [codex-cli SKILL.md](skills/codex-cli/SKILL.md) - CLI 기본 사용법
- [codex-claude-loop SKILL.md](skills/codex-claude-loop/SKILL.md) - 오케스트레이션 워크플로우

## Future Extensions

이 플러그인 아키텍처는 다른 AI CLI 통합을 위한 패턴을 제공합니다:

```
codex-plugin/          gemini-plugin/         openai-plugin/
├── codex-cli          ├── gemini-cli         ├── openai-cli
└── codex-claude-loop  └── gemini-claude-loop └── ...
```

## License

(License TBD)
