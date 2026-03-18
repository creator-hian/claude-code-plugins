# Prompt Reinforcement Plugin for Claude Code

사용자 프롬프트에서 LLM이 놓치기 쉬운 핵심 제약을 추출하여 구조화된 형태로 재주입하는 Hook 플러그인.

## Overview

Claude Code는 긴 대화나 복잡한 작업 중 사용자의 제약 조건(하지 말 것, 형식 지정, 수량 조건 등)을 놓칠 수 있다. 이 플러그인은 `UserPromptSubmit` hook을 통해 프롬프트에서 핵심 제약만 추출하여 `[TASK FRAME]` 구조로 재주입한다.

## How It Works — Goal + Constraint Frame

프롬프트 전체를 복사하지 않고, LLM이 가장 자주 놓치는 3가지를 구조화한다:

```
사용자 입력 (1200자 장문)
  ├─ [1] User message: 원본 전체
  └─ [2] <system-reminder>                           (hook 주입)
         [TASK FRAME]
         GOAL: 다음 9개 API에 대해 V-case 테스트를 생성해야 해:

         BOUNDARIES (violating these = failure):
           [DENY] 기존 R-case 테스트는 절대 수정하지 말 것
           [MUST] 반드시 bis. 스키마 접두사 사용
           [FORMAT] JSONPath 형식의 assertion 사용
           [AMOUNT] 각 API별로 최소 3개의 V-case 생성

         DONE-WHEN (verify before completion):
           check: null/zero 경고 없이 모든 assertion 통과 확인
         </system-reminder>
```

### 3-Frame 구조

| Frame | 역할 | LLM 인지 효과 |
|-------|------|---------------|
| **GOAL** | 핵심 목표 1줄 요약 | 방향 확인 |
| **BOUNDARIES** | 위반하면 안 되는 제약 | 실패 방지 (핵심) |
| **DONE-WHEN** | 완료 전 검증 조건 | 검증 누락 방지 |

### BOUNDARY 유형

| 태그 | 의미 | 매칭 패턴 예시 |
|------|------|---------------|
| `DENY` | 부정형 제약 | 하지 말, 절대, NEVER |
| `MUST` | 의무형 제약 | 반드시, 필수, MUST |
| `FORMAT` | 형식 지정 | JSONPath 형식, bis. 접두사 |
| `RULE` | 기술적 규칙 | 배열 안에 포함, A 대신 B |
| `AMOUNT` | 수량 조건 | 최소 3개, 이상 |
| `EXCEPT` | 범위 제한 | 이미 정상, 제외 |

### 처리 분기

| 조건 | 동작 |
|------|------|
| 슬래시 커맨드 (`/`로 시작) | SKIP |
| 시스템 메시지 (`<`로 시작) | SKIP |
| 100자 미만 | 전체 강화 `[REINFORCE] 원문` |
| 100자 이상, 제약 추출 성공 | `[TASK FRAME]` 구조 출력 |
| 100자 이상, 제약 없음 | `[GOAL] 첫 문장` |

## Performance

| 지표 | v1.0 (전체 복사) | v2.0 (Task Frame) |
|------|-----------------|-------------------|
| Recall | 100% | 93% |
| 평균 출력 크기 | 409자 | 324자 |
| 토큰 절약 | 0% | 21% |
| 제약 구조화 | 없음 | DENY/MUST/FORMAT/RULE/AMOUNT/EXCEPT |

## Plugin Structure

```
prompt-reinforcement-plugin/
├── .claude-plugin/
│   └── plugin.json         # 메타데이터
└── hooks/
    ├── hooks.json           # Hook 정의
    └── reinforce-prompt.js  # Goal+Constraint Frame 추출 스크립트
```

## Hook Details

| 항목 | 값 |
|------|-----|
| Event | `UserPromptSubmit` |
| Trigger | 매 사용자 입력 시 |
| Input | stdin으로 전달되는 hook event JSON (`event.prompt`) |
| Output | `hookSpecificOutput.additionalContext`로 Task Frame 주입 |
| Runtime | Node.js |

## Limitations

- `additionalContext`는 `<system-reminder>` 태그로 래핑되어 system context 레벨로 전달된다.
- 키워드 기반 패턴 매칭이므로, 마커 키워드 없는 암묵적 제약은 놓칠 수 있다 (scoring fallback으로 일부 보완).
- 한국어 + 영어 패턴을 지원하나, 다른 언어는 미지원.

## Installation

1. 이 플러그인을 Claude Code plugins 폴더에 복사
2. Claude Code를 재시작하거나 플러그인을 리로드
3. 별도 설정 없이 자동 동작

## Version History

| Version | Changes |
|---------|---------|
| 2.0.0 | Goal+Constraint Frame 방식으로 전면 교체. 제약 유형별 구조화, DONE-WHEN 검증 조건 추출 |
| 1.0.0 | `UserPromptSubmit` hook을 통한 프롬프트 전체 복사 강화 |

## Author

**Creator Hian**
