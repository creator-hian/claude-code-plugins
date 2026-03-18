# Agent Team Plugin

에이전트 팀 기반 병렬 디스패치 패턴을 활용한 다관점 계획 수립 및 적대적 리뷰 플러그인.

## 개요

이 플러그인은 복잡한 작업을 여러 전문 에이전트로 구성된 **팀**에 병렬 디스패치하여 다각도 분석을 수행하는 세 가지 스킬을 제공합니다.

| Skill | 용도 | 팀 구성 |
|-------|------|---------|
| `diverse-plan` | 다관점 계획 수립 | Architect + Challenger (최대 3명) |
| `decide` | 구현 중 A vs B 빠른 결정 | A-Advocate + B-Advocate (2명) |
| `da-review` | 적대적 팀 리뷰 | Devil's Advocate Team (최대 3명) |

세 스킬은 독립적으로 동작하지만, **plan → decide → review** 파이프라인으로 결합하면 가장 효과적입니다.

## 워크플로우

```
사용자 요청
    │
    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ diverse-plan │ ──▶ │   decide    │ ──▶ │  da-review  │ ──▶ │   실행/수정   │
│ (계획 수립)   │     │ (A vs B 결정) │     │ (적대적 리뷰) │     │              │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

1. **diverse-plan**: 여러 관점의 에이전트가 병렬로 분석 → 통합 계획 생성
2. **decide**: 구현 중 기술적 갈림길에서 A-Advocate + B-Advocate 구조로 빠른 결정
3. **da-review**: 적대적 에이전트 팀이 계획/코드의 약점을 공격 → 개선점 도출
4. 리뷰 결과 반영 후 실행 (`superpowers:executing-plans`)

### Chained Workflow: diverse-plan → da-review

두 스킬은 순차적으로 결합할 때 가장 효과적입니다:

1. `diverse-plan`으로 다관점 통합 계획을 생성합니다
2. `da-review`가 생성된 계획 파일을 자동 감지하여 적대적 리뷰를 수행합니다
3. da-review 결과의 CRITICAL/HIGH 이슈를 반영하여 계획을 수정합니다
4. 수정된 계획을 `superpowers:executing-plans`로 실행합니다

`da-review`는 `diverse-plan`의 출력 파일(계획 파일)을 자동으로 감지하므로, 별도의 파일 경로 지정 없이 바로 실행할 수 있습니다.

**권장 반복 횟수:** da-review는 동일 대상에 대해 최대 **2회**까지 권장됩니다. 2회 리뷰 후에도 CRITICAL 이슈가 남아있다면, 점진적 수정보다 `diverse-plan`을 다시 실행하여 근본적으로 재설계하는 것이 효과적입니다.

### da-review 에이전트 실패 기준 (Majority Rule)

da-review의 Agent Failure Handling은 **과반수(Majority) 규칙**을 따릅니다:

| 상황 | 동작 |
|------|------|
| 1개 에이전트 실패/타임아웃 | 나머지 결과로 진행, 누락된 관점을 사용자에게 알림 |
| **과반수** 에이전트 실패 | 통합 중단, 사용자에게 재시도 여부 확인 |

"과반수"란 디스패치된 에이전트 중 절반 이상이 실패한 경우를 의미합니다. 예: 3명 중 2명 실패, 4명 중 3명 실패. 이 경우 남은 결과만으로는 신뢰할 수 있는 통합 평가가 불가능하므로 통합을 중단합니다.

## Skills 상세

### diverse-plan (다관점 계획 수립)

Architect + Challenger 구조로 복잡한 작업을 다각도로 분석하고, 제안 비교표 기반 통합 계획을 생성합니다.

**역할 풀:**
- **Architect** — 구체적 구현 제안, 의존성 순서, 기존 패턴 재사용
- **Challenger** — 구조적 대안 제시, 약점 발견, 숨겨진 요구사항 식별
- **Domain Challenger** — 도메인 모델 정합성, 비즈니스 규칙 제약
- **Performance Challenger** — 병목 예측, 확장성 한계, 대안 제안
- **Risk Challenger** — 장애 시나리오, 롤백 전략, 데이터 안전

**사용 시점:** 복잡한 다파일 기능 구현, 아키텍처 변경 계획 시

### decide (빠른 기술 결정)

A-Advocate + B-Advocate 구조로 구현 중 기술적 갈림길에서 빠른 결정을 지원합니다.

**특징:**
- 양쪽 옹호자가 독립적으로 최선의 논거를 구성 (Honest Costs 포함)
- 비교표 + 추천 + Confidence Level + Flip Condition 제공
- Constraint Check로 사용자 제약조건 누락 방지
- 명확한 우위 시 advocate 디스패치 생략 (Clear Winner 규칙)

**사용 시점:** "A vs B?", "X를 쓸까 Y를 쓸까?", 구현 중 기술적 양자택일 시

### da-review (적대적 팀 리뷰)

Devil's Advocate Team을 구성하여 계획이나 코드의 약점을 적극적으로 찾아냅니다.

**역할 풀:**
- **Feasibility Skeptic** — 기술적 실현 가능성, API 존재 여부, 코드 도달성 검증
- **Complexity Critic** — 과도한 추상화, YAGNI 위반, 더 단순한 대안
- **Gap Hunter** — 누락된 에러 처리, 미고려 엣지 케이스, 동시성/캐시 침투 리스크
- **Security Auditor** — 인증/인가 갭, 입력 검증, OWASP Top 10
- **Backwards Compatibility Checker** — API 계약 변경, 마이그레이션 경로 부재
- **Performance Analyst** — 시간/공간 복잡도, 리소스 누수, I/O 효율
- **Concurrency Auditor** — 레이스 컨디션, 데드락, TOCTOU 패턴
- **Validator** — CRITICAL 발견사항 검증, 오탐 필터링

**사용 시점:** 기존 계획, 설계, 구현 코드에 대한 약점 분석 및 개선점 도출 시

## 사용 예시

```
# 계획 수립
/diverse-plan "사용자 인증 시스템 리팩토링"

# 구현 중 기술 결정
/decide "JWT vs Session 기반 인증, 어떤 방식이 나은가?"

# 계획 리뷰
/da-review  (생성된 계획을 자동 감지하여 리뷰)

# 코드 리뷰
/da-review "src/auth/ 디렉토리의 변경사항 리뷰"
```

## 설치

이 플러그인을 Claude Code에 설치하려면:

```bash
claude plugin add <marketplace-url>/agent-team-plugin
```
