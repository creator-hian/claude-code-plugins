# program.md 작성 가이드

## 개요

`program.md`는 autoresearch 에이전트의 **연구 전략을 프로그래밍**하는 마크다운 파일이다. Karpathy의 autoresearch에서 인간의 역할이 "Python 코드 작성"에서 "program.md 작성"으로 전환된 것처럼, 여기서도 사용자의 역할은 "SKILL.md 직접 수정"에서 "mutation 전략 설계"로 전환된다.

**위치:** `{skill-name}-autoresearch/program.md`

## 구조

```markdown
# Program: {대상 스킬 이름} 개선

## 목표
{이번 autoresearch 실행에서 달성하고자 하는 구체적 목표}

## 전략
{mutation 방향 지시 — 어떤 영역을 우선 개선할지}

## 금지 사항
{변경하지 말아야 할 부분}

## 우선순위
{여러 실패 assertion 중 어떤 것을 먼저 공략할지}
```

## 메타 설정

program.md 최상단에 루프 동작을 제어하는 메타 설정을 추가할 수 있다.

```markdown
## 메타 설정

force_at_least_one_iteration: true
```

| 설정 | 기본값 | 설명 |
|------|--------|------|
| `force_at_least_one_iteration` | false | true이면 baseline이 target_pass_rate에 도달해도 정의된 전략 중 미시도 항목에 대해 최소 1회 mutation을 시도한다. eval 만점이어도 지침의 명확성을 개선할 기회를 보장한다. |

## 섹션별 가이드

### 목표 (Goal)

구체적이고 측정 가능한 목표를 서술한다. "스킬을 좋게 만든다"는 너무 모호하다.

**좋은 예:**
- "plan review eval에서 rollback_plan assertion 통과율을 100%로 올린다"
- "Fast Mode의 체크리스트 커버리지를 유지하면서 Team Mode의 에이전트 조합 정확도를 개선한다"

**나쁜 예:**
- "스킬을 개선한다"
- "pass rate를 올린다"

### 전략 (Strategy)

mutation의 방향을 구체적으로 지시한다. Default Mutation Strategy(누락→모호→구조→과잉)를 오버라이드하거나 보충한다.

**지시할 수 있는 것들:**
- 특정 섹션에 집중: "Phase 2의 에이전트 역할 정의를 개선하라"
- 특정 기법 적용: "체크리스트 항목을 질문 형태로 바꿔라"
- 우선순위 변경: "과잉 지시 제거를 누락 추가보다 먼저 시도하라"
- 구조 변경 허용: "섹션 순서 재배치를 시도해도 좋다"

### 금지 사항 (Constraints)

autoresearch가 변경하지 말아야 할 부분을 명시한다. 이것이 없으면 에이전트가 효과적이지만 원치 않는 수정을 할 수 있다.

**예시:**
- "YAML frontmatter의 description은 변경하지 마라"
- "에이전트 수를 4개 이상으로 늘리지 마라"
- "Team Framing 문구는 유지하라"
- "한국어로 작성된 부분을 영어로 바꾸지 마라"

### Mutation 금지 영역 (Exclusions)

SKILL.md 수정으로 해결할 수 없는 외부 문제(API 스키마 불일치, 서버 버그 등)를 명시하여 mutation 예산 낭비를 방지한다. "금지 사항"이 SKILL.md의 **어느 부분을 건드리지 말지** 지정하는 것이라면, "Mutation 금지 영역"은 **어떤 종류의 변경 자체를 시도하지 말지** 지정하는 것이다.

```markdown
## Mutation 금지 영역

exclusions:
  - pattern: "string → number 타입 변환 workaround"
    reason: "API 스키마 수정이 선행되어야 함"
  - pattern: "projects/resolve null 대응"
    reason: "서버 코드 수정이 선행되어야 함"
```

Phase 2-3 MUTATE에서 생성된 mutation이 exclusion 패턴과 일치하면 eval 실행 없이 즉시 폐기하고 다른 가설로 재시도한다. 외부 검증 결과(`verification-results.json`)의 `api_issues`도 자동으로 exclusions에 등록된다.

### 우선순위 (Priority)

여러 실패 assertion이 있을 때 어떤 것을 먼저 공략할지 지시한다.

**예시:**
- "CRITICAL finding 관련 assertions를 먼저 개선하라"
- "variance가 높은 assertions (때때로 통과/실패)를 먼저 안정화하라"
- "Fast Mode assertions를 Team Mode보다 우선하라"

## 예시 1: da-review 개선

```markdown
# Program: da-review 스킬 개선

## 메타 설정

force_at_least_one_iteration: true

## 목표
plan review eval에서 rollback_plan, race_condition, cache_penetration assertions 통과율 100% 달성

## 전략
1. Gap Hunter의 Attack Questions에 rollback, concurrency, cache 관련 질문을 강화하라
2. Phase 3 Verdict에서 위 3개 영역을 필수 체크 항목으로 추가하라
3. 과잉 지시가 있다면 Level 3 references로 이동하여 SKILL.md를 간결하게 유지하라

## 금지 사항
- Team Framing 문구 변경 금지
- 에이전트 역할 수를 늘리지 말 것 (현재 역할 개선에 집중)
- Fast Mode의 기존 통과 assertions에 regression을 만들지 말 것

## Mutation 금지 영역

exclusions:
  - pattern: "외부 API 호출 순서 변경"
    reason: "API 종속성 관계가 검증되지 않은 상태"

## 우선순위
1. rollback_plan (0% 통과율, 가장 큰 개선 여지)
2. race_condition (50% 통과율, variance 높음)
3. cache_penetration (50% 통과율, variance 높음)
```

## 예시 2: decide 개선

```markdown
# Program: decide 스킬 개선

## 목표
Advocate 품질 점수를 개선하여 각 옵션의 장단점이 구체적 수치/증거와 함께 제시되도록 한다

## 전략
1. Advocate 역할 프롬프트에 "구체적 벤치마크 수치, 공식 문서 인용, 실제 사용 사례"를 요구하라
2. Synthesis 단계에서 "주관적 판단" vs "객관적 근거" 비율을 추적하는 지시를 추가하라
3. 모호한 비교 표현("더 빠르다", "더 좋다")을 금지하고 수치 비교를 요구하라

## 금지 사항
- Shortcut 감지 로직을 변경하지 말 것
- constraint 검증 단계를 제거하지 말 것

## 우선순위
1. evidence_quality assertions (구체성)
2. comparison_fairness assertions (공정성)
3. confidence_calibration assertions (신뢰도)
```

## 고급 사용법

### 조건부 전략

```markdown
## 전략
- pass_rate < 0.7이면: 누락된 지시 추가에 집중
- pass_rate 0.7~0.9이면: 모호한 지시 구체화에 집중
- pass_rate > 0.9이면: 과잉 지시 제거로 간결화
```

### 실험적 전략

```markdown
## 전략
- 기존 체크리스트 형식을 질문 형식으로 변환 시도
  (예: "✓ 보안 확인" → "이 코드에서 SQL 인젝션이 가능한 경로가 있는가?")
- 이 변환이 pass_rate를 높이면 계속, 낮추면 원래 형식으로 복귀
```
