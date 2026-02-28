# Agent Team Plugin

에이전트 팀 기반 병렬 디스패치 패턴을 활용한 다관점 계획 수립 및 적대적 리뷰 플러그인.

## 개요

이 플러그인은 복잡한 작업을 여러 전문 에이전트로 구성된 **팀**에 병렬 디스패치하여 다각도 분석을 수행하는 두 가지 스킬을 제공합니다.

| Skill | 용도 | 팀 구성 |
|-------|------|---------|
| `diverse-plan` | 다관점 계획 수립 | Perspectives Team (최대 5명) |
| `da-review` | 적대적 팀 리뷰 | Devil's Advocate Team (최대 5명) |

두 스킬은 독립적으로 동작하지만, **plan → review** 워크플로우로 결합하면 가장 효과적입니다.

## 워크플로우

```
사용자 요청
    │
    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ diverse-plan │ ──▶ │  da-review  │ ──▶ │   실행/수정   │
│ (계획 수립)   │     │ (적대적 리뷰) │     │              │
└─────────────┘     └─────────────┘     └─────────────┘
```

1. **diverse-plan**: 여러 관점의 에이전트가 병렬로 분석 → 통합 계획 생성
2. **da-review**: 적대적 에이전트 팀이 계획/코드의 약점을 공격 → 개선점 도출
3. 리뷰 결과 반영 후 실행 (`superpowers:executing-plans`)

## Skills 상세

### diverse-plan (다관점 계획 수립)

Perspectives Team을 구성하여 복잡한 작업을 다각도로 분석하고 통합 계획을 생성합니다.

**역할 풀:**
- **Implementation Architect** — 컴포넌트 분해, 의존성 순서, 기존 패턴 재사용
- **Requirements Analyst** — 명시적/암묵적 요구사항, 엣지 케이스, 수용 기준
- **Risk Assessor** — 실패 시나리오, 영향 범위, 롤백 전략
- **Domain Expert** — 도메인 모델 정합성, 비즈니스 규칙, 용어 정확성
- **Performance Analyst** — 병목 식별, 메모리/CPU 영향, 캐싱 전략

**사용 시점:** 복잡한 다파일 기능 구현, 아키텍처 변경 계획 시

### da-review (적대적 팀 리뷰)

Devil's Advocate Team을 구성하여 계획이나 코드의 약점을 적극적으로 찾아냅니다.

**역할 풀:**
- **Feasibility Skeptic** — 기술적 실현 가능성, API 존재 여부, 의존성 오류
- **Complexity Critic** — 과도한 추상화, YAGNI 위반, 더 단순한 대안
- **Gap Hunter** — 누락된 에러 처리, 미고려 엣지 케이스, 테스트 부재
- **Security Auditor** — 인증/인가 갭, 입력 검증, 인젝션 벡터
- **Backwards Compatibility Checker** — API 계약 변경, 마이그레이션 경로 부재

**사용 시점:** 기존 계획, 설계, 구현 코드에 대한 약점 분석 및 개선점 도출 시

## 사용 예시

```
# 계획 수립
/diverse-plan "사용자 인증 시스템 리팩토링"

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
