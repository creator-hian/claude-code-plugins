# skill-autoresearch-plugin

Karpathy의 [autoresearch](https://github.com/karpathy/autoresearch) 기법을 Claude Code 스킬 개선에 적용한 플러그인.

## 핵심 개념

SKILL.md를 자동으로 반복 개선한다:

```
mutate SKILL.md → evaluate (assertions) → keep if improved, discard if not → repeat
```

- **Fixed-budget loop**: 최대 N iterations 내에서 실험
- **Single-metric hill-climbing**: mean_pass_rate 기준 greedy 선택
- **Assertion-level regression detection**: 전체 점수가 올라도 기존 통과 assertion 실패 시 discard
- **NEUTRAL mutation**: pass_rate 동일해도 program.md 전략 기반이면 사용자에게 diff 제시 후 판단 위임
- **Mutation exclusions**: 외부 문제(API 스키마, 서버 버그)를 mutation 대상에서 자동 배제
- **Eval levels (L1/L2/L3)**: routing → execution → quality 단계적 집중
- **program.md meta-layer**: 사용자가 mutation 전략을 마크다운으로 프로그래밍
- **Workspace isolation**: 원본 SKILL.md 안전 보장

## 사용법

```
/autoresearch agent-team-plugin/skills/da-review
```

또는 자연어로:
- "이 스킬을 autoresearch로 개선해줘"
- "da-review 스킬 품질 올려줘"
- "run autoresearch on this skill"

## 전제 조건

대상 스킬에 다음이 필요:
1. **SKILL.md** -- 개선 대상
2. **EVAL.md** -- Binary evaluation criteria (YES/NO 판정 기준)
3. **evals.json** -- 테스트 케이스 + assertions (keyword 기반 자동 grading)

## 워크플로우

| Phase | 설명 |
|-------|------|
| Phase 0 | 초기화 -- 대상 식별, eval 인프라 확인, program.md 로드, 외부 검증 결과 연동, 예산 설정 |
| Phase 1 | 베이스라인 측정 -- 현재 SKILL.md의 pass_rate 기록 |
| Phase 2 | 반복 실험 -- analyze → hypothesize → mutate → exclusion check → validate → evaluate → compare |
| Phase 3 | 결과 보고 -- baseline vs final, mutation history, assertion-level changes |

## 설정

| 파라미터 | 기본값 | 설명 |
|----------|--------|------|
| `max_iterations` | 10 | 최대 실험 횟수 |
| `target_pass_rate` | 1.0 | 목표 달성 시 조기 종료 |
| `stall_limit` | 3 | 연속 N회 무개선 시 자동 중단 |
| `eval_runs` | 2 | 각 eval 실행 횟수 (stochastic 대응) |

## program.md

사용자 정의 mutation 전략. `{skill-name}-autoresearch/program.md`에 배치.

```markdown
# Program: da-review 개선

## 메타 설정

force_at_least_one_iteration: true

## 목표
rollback_plan assertion 통과율 100%

## 전략
Gap Hunter의 Attack Questions에 rollback 관련 질문 강화

## 금지 사항
에이전트 수를 늘리지 말 것

## Mutation 금지 영역

exclusions:
  - pattern: "string → number 타입 변환 workaround"
    reason: "API 스키마 수정이 선행되어야 함"
```

상세 가이드: [`references/program-md-guide.md`](skills/autoresearch/references/program-md-guide.md)

## Eval Levels

evals.json의 각 eval에 `level` 필드를 지정하여 단계적 집중이 가능하다:

| Level | 설명 | Phase 2 집중 조건 |
|-------|------|------------------|
| `L1-routing` | 올바른 절차로 라우팅되는가 | 기본 (미지정 시 기본값) |
| `L2-execution` | 절차의 모든 단계를 실행하는가 | L1 전량 PASS 시 |
| `L3-quality` | 실행 결과의 데이터 품질이 정확한가 | L2 전량 PASS 시 |

## 외부 검증 결과 연동

`{workspace}/verification-results.json`을 배치하면 자동으로 활용한다:
- `capability_issues` → mutation 대상으로 추출
- `api_issues` → mutation_exclusions에 자동 등록 (SKILL.md 수정으로 해결 불가)

## COMPARE 판정 규칙

| 조건 | 판정 | 동작 |
|------|------|------|
| new > best, regression 없음 | **KEEP** | best 교체, stalls = 0 |
| new > best, regression 있음 | **DISCARD** | 변형 폐기 |
| new == best, program.md 기반, regression 없음 | **NEUTRAL** | 사용자에게 diff 제시 |
| new == best (기타) | **DISCARD** | 변형 폐기, stalls += 1 |
| new < best | **DISCARD** | 변형 폐기, stalls += 1 |

## Skills

| Skill | Version | Description |
|-------|---------|-------------|
| autoresearch | 1.1.0 | Autonomous SKILL.md improvement via iterative eval hill-climbing with force iteration, NEUTRAL judgment, mutation exclusions, and L1/L2/L3 eval levels |
