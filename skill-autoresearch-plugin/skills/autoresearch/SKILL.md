---
name: autoresearch
description: Use when you want to autonomously improve a SKILL.md's quality by running iterative experiments. Triggers on "autoresearch 돌려줘", "스킬 품질 올려줘", "이 스킬을 자동으로 개선해줘", "run autoresearch on this skill", or any request to automatically improve a skill's eval pass rate through repeated experimentation. Applies Karpathy's autoresearch technique - fixed-budget iterative loop with single-metric hill-climbing and automatic keep/discard decisions.
---

# Autoresearch: Autonomous Skill Improvement

Karpathy의 autoresearch 기법을 SKILL.md 개선에 적용한다. 고정 예산 내에서 반복 실험(mutate → evaluate → keep/discard)을 자율 실행하여 스킬 품질을 자동으로 향상한다.

**핵심 원리:**
- 한 번에 하나의 변경만 (원인 추적 가능)
- 단일 메트릭 hill-climbing (mean_pass_rate)
- Assertion-level regression 감지 (전체 점수가 올라도 기존 통과 assertion 실패 시 discard)
- Workspace isolation (원본 안전 보장)
- Context window 보호 (eval 출력은 파일로, grading summary만 읽기)

## Phase 0: 초기화

### 0-1. 대상 스킬 식별

사용자가 스킬 경로를 지정하면 해당 경로를 사용한다. 지정하지 않으면:
1. 현재 대화에서 언급된 스킬 경로를 탐지
2. 없으면 사용자에게 대상 스킬 경로를 요청

**필요한 파일 확인:**
- `{skill-path}/SKILL.md` — 개선 대상 (필수, 없으면 중단)
- `{skill-path}/EVAL.md` — 평가 기준 (필수, 없으면 중단 + "EVAL.md를 먼저 작성하세요" 안내)

### 0-2. Workspace 초기화

```
{repo-root}/{skill-name}-autoresearch/
  autoresearch-log.json    # 전체 실험 메타데이터
  iteration-0/             # 베이스라인 (Phase 1에서 생성)
  iteration-N/             # 각 실험 결과
```

Workspace 디렉토리가 이미 존재하면 이전 실행의 `autoresearch-log.json`을 읽어 상태를 확인한다. 이전 실행이 완료된 상태라면 새 실행을 시작한다.

### 0-3. Eval 인프라 확인

`{skill-name}-workspace/evals/evals.json`을 찾는다. 없으면:
1. EVAL.md의 binary criteria를 기반으로 evals.json 생성을 제안
2. 사용자가 evals.json을 직접 제공할 때까지 대기

**evals.json 필수 스키마:**
```json
{
  "skill_name": "target-skill",
  "evals": [
    {
      "id": 1,
      "name": "eval-case-name",
      "level": "L1-routing",
      "prompt": "eval 실행 프롬프트",
      "files": ["test-targets/file.py"],
      "expected_output": "자연어 기대 결과 서술",
      "assertions": [
        {
          "id": "assertion_id",
          "description": "이 assertion이 검증하는 것",
          "check": "keyword",
          "keywords": ["keyword1", "keyword2"]
        }
      ]
    }
  ]
}
```

`assertions` 배열이 없으면 `expected_output`을 LLM-judge로 평가한다 (정확도 낮음, 경고 표시).

`level` 필드는 선택적이며, 미지정 시 기본값은 `L1-routing`이다:

| 레벨 | 설명 | 활용 |
|------|------|------|
| `L1-routing` | 올바른 절차로 라우팅되는가 | 기본 |
| `L2-execution` | 절차의 모든 단계를 실행하는가 | Phase 2에서 L1 전량 PASS 시 집중 |
| `L3-quality` | 실행 결과의 데이터 품질이 정확한가 | Phase 2에서 L2 전량 PASS 시 집중 |

Phase 2-1 ANALYZE에서 레벨별 pass_rate를 분리 집계하고, L1이 모두 PASS이면 L2에, L2가 모두 PASS이면 L3에 집중하여 mutation 가설을 수립한다.

### 0-4. program.md 확인

`{workspace}/program.md`를 찾는다. 있으면 로드하여 mutation 전략으로 사용한다. 없으면 아래 "Default Mutation Strategy"를 사용한다.

program.md에 `force_at_least_one_iteration: true`가 설정되어 있으면,
baseline이 target_pass_rate에 도달해도 정의된 전략 중 미시도 항목에 대해
최소 1회 mutation을 시도한다. 이는 eval 만점이어도 지침의 명확성을 개선할 수 있는 기회를 보장한다.

program.md에 `mutation_exclusions`가 정의되어 있으면 로드한다:
```markdown
exclusions:
  - pattern: "string → number 타입 변환 workaround"
    reason: "API 스키마 수정이 선행되어야 함"
```
exclusion 패턴과 일치하는 mutation은 Phase 2-3 MUTATE 후 eval 실행 없이 즉시 폐기하고, 다른 가설로 2-2부터 재시도한다. 이렇게 하면 SKILL.md 수정으로 해결할 수 없는 외부 문제(API 스키마, 서버 버그 등)에 mutation 예산을 낭비하지 않는다.

### 0-5. 외부 검증 결과 참조 (선택)

`{workspace}/verification-results.json`이 있으면 로드한다.
- `capability_issues` 배열에서 mutation 대상을 추출하여 Phase 2의 가설 수립에 활용한다
- `api_issues` 배열은 mutation 대상에서 제외한다 (mutation_exclusions로 자동 등록). API 스키마 불일치나 서버 오류는 SKILL.md 수정으로 해결할 수 없기 때문이다.
- 없으면 건너뜀 (기존 동작 유지)

### 0-6. 예산 설정

사용자가 지정하지 않은 값은 기본값을 사용:

| 파라미터 | 기본값 | 설명 |
|----------|--------|------|
| `max_iterations` | 10 | 최대 실험 횟수 |
| `target_pass_rate` | 1.0 | 이 pass_rate 달성 시 조기 종료 |
| `stall_limit` | 3 | 연속 N회 DISCARD 시 자동 중단 |
| `eval_runs` | 2 | 각 eval의 실행 횟수 (불일치 시 +1) |

사용자에게 설정을 확인한다:
```
Autoresearch 설정:
- 대상: {skill-path}/SKILL.md
- Eval: {evals-count}개 케이스, {assertions-count}개 assertions
- 예산: max {max_iterations} iterations
- 목표: pass_rate ≥ {target_pass_rate}
- 전략: {program.md 또는 Default}

시작하시겠습니까?
```

---

## Phase 1: 베이스라인 측정

### 1-1. SKILL.md 백업

현재 SKILL.md를 `{workspace}/iteration-0/SKILL.md.bak`에 복사한다.

### 1-2. 베이스라인 Eval 실행

각 eval 케이스에 대해:

1. **Agent 디스패치** — eval 실행을 격리된 Agent에서 수행
   - Agent 프롬프트: 대상 스킬의 SKILL.md 전문 + eval의 `prompt` + `files` 내용
   - Agent 지시: "이 스킬의 지시에 따라 주어진 프롬프트를 수행하라. 결과만 출력하라."
   - Agent 출력을 `{workspace}/iteration-0/eval-{name}/output.md`에 Write

2. **Grading** — 출력물을 assertions와 대조
   - `check: "keyword"`: keywords 중 하나라도 출력에 포함되면 pass
   - `check: "llm_judge"` (또는 assertions 없을 때): expected_output 기준으로 LLM 판정
   - 결과를 `{workspace}/iteration-0/eval-{name}/grading.json`에 저장:
     ```json
     {
       "eval_id": 1,
       "eval_name": "eval-case-name",
       "run": 1,
       "assertions": [
         { "id": "assertion_id", "passed": true, "evidence": "매칭된 텍스트 발췌" }
       ],
       "pass_rate": 0.85
     }
     ```

3. **Multi-run** — `eval_runs`회 반복 실행
   - 2회 실행 결과가 일치하면 (동일 assertions pass/fail) 확정
   - 불일치하면 3회째 실행, 다수결(2/3)로 판정

### 1-3. 베이스라인 기록

`{workspace}/iteration-0/benchmark.json` 생성:
```json
{
  "iteration": 0,
  "type": "baseline",
  "mean_pass_rate": 0.85,
  "per_eval": [
    { "name": "eval-case-name", "pass_rate": 0.85, "runs": 2 }
  ],
  "assertion_baseline": {
    "eval-case-name": {
      "assertion_id_1": true,
      "assertion_id_2": false
    }
  }
}
```

사용자에게 베이스라인 결과를 보고:
```
베이스라인 측정 완료:
- Mean pass rate: {mean_pass_rate}
- 실패한 assertions: {list}
- Phase 2 반복 실험을 시작합니다.
```

---

## Phase 2: 반복 실험 루프

```
best_pass_rate = baseline_pass_rate
best_assertions = baseline_assertions
consecutive_stalls = 0

for iteration in 1..max_iterations:
```

### 2-1. ANALYZE — 실패 분석

이전 iteration의 grading 결과에서:
- 실패한 assertions의 `id`, `description`, `evidence` 추출
- **컨텍스트 관리:** grading.json의 assertions 목록만 읽기. 전체 eval output은 읽지 않음.
- 이전에 시도했다가 DISCARD된 mutation의 hypothesis.md 목록을 `autoresearch-log.json`에서 확인 (같은 방향 반복 방지)

### 2-2. HYPOTHESIZE — 가설 수립

program.md의 전략을 따른다 (없으면 Default Mutation Strategy 사용).

가설을 `{workspace}/iteration-N/hypothesis.md`에 기록:
```markdown
# Iteration {N} 가설

**대상 assertion:** {실패한 assertion id + description}
**분석:** {왜 실패했는지 — SKILL.md의 어느 부분이 부족한지}
**변경 계획:** {구체적으로 SKILL.md의 어떤 부분을 어떻게 수정할지}
**전략 유형:** {누락 / 모호 / 구조 / 과잉}
```

### 2-3. MUTATE — SKILL.md 수정

1. 현재 best SKILL.md를 읽는다
2. 가설에 따라 **하나의 측면만** 수정한다
   - 여러 변경을 동시에 하지 않는다 (어떤 변경이 효과적이었는지 추적 불가)
3. mutation_exclusions가 정의되어 있으면, 생성된 mutation이 exclusion 패턴과 일치하는지 확인한다. 일치하면 즉시 폐기하고 2-2로 돌아가 다른 가설을 수립한다 (최대 2회 재시도).
4. 수정된 SKILL.md를 `{workspace}/iteration-N/SKILL.md`에 저장

### 2-4. VALIDATE STRUCTURE — 구조 검증

mutation 직후, 수정된 SKILL.md의 구조를 검증:

1. **YAML frontmatter** — `---`로 감싸진 YAML 블록이 파싱 가능한가
2. **필수 필드** — `name`, `description` 필드가 존재하는가
3. **섹션 구조** — 원본 SKILL.md의 H2 헤딩이 모두 보존되었는가
4. **참조 무결성** — `${CLAUDE_PLUGIN_ROOT}` 등 변수 참조가 깨지지 않았는가

**검증 실패 시:** mutation을 폐기하고 다른 가설로 2-2부터 재시도 (최대 2회 재시도).

### 2-5. EVALUATE — Eval 실행

Phase 1과 동일한 방식으로 eval suite를 실행한다. 단, 변형된 SKILL.md를 사용:

1. 원본 SKILL.md를 임시 백업
2. 변형된 SKILL.md를 원본 위치에 복사
3. 각 eval 케이스 실행 (Agent 디스패치 + Grading)
4. 원본 SKILL.md를 복원
5. 결과를 `{workspace}/iteration-N/benchmark.json`에 저장

### 2-6. COMPARE — 판정

**Step A: Pass rate 비교**
- `new_pass_rate` vs `best_pass_rate` 계산

**Step B: Assertion-level regression 감지**
- 이전에 통과하던 assertion이 새로 실패했는지 확인:
  ```
  regressions = [a for a in best_assertions if best_assertions[a] == true and new_assertions[a] == false]
  ```

**Step C: 판정**

| 조건 | 판정 | 동작 |
|------|------|------|
| new > best AND regressions 없음 | **KEEP** | best = new, SKILL.md 교체, consecutive_stalls = 0 |
| new > best AND regressions 있음 | **DISCARD** | regression은 허용하지 않음. 변형 폐기, regression 내용을 autoresearch-log.json에 기록, consecutive_stalls += 1 |
| new == best AND program.md 전략 기반 AND regression 없음 | **NEUTRAL** | diff를 사용자에게 제시. 사용자 승인 시 KEEP (consecutive_stalls 미증가), 거부 시 DISCARD |
| new == best (기타) | **DISCARD** | 변형 폐기, consecutive_stalls += 1 |
| new < best | **DISCARD** | 변형 폐기, consecutive_stalls += 1 |

**`autoresearch-log.json`에 iteration 기록:**
```json
{
  "iteration": 1,
  "hypothesis": "Fast Mode 라우팅 규칙에 '단일 파일 = Fast Mode' 명시",
  "strategy_type": "missing",
  "pass_rate": 0.92,
  "delta": "+0.07",
  "outcome": "kept",
  "regressions": [],
  "kept_assertions_gained": ["assertion_id_3"],
  "timestamp": "2026-03-26T10:15:00"
}
```

### 2-7. CIRCUIT BREAKER

루프 종료 조건 확인:

| 조건 | 동작 |
|------|------|
| `consecutive_stalls >= stall_limit` | 자동 중단 — "연속 {stall_limit}회 개선 없음. 다른 전략이 필요합니다." |
| `best_pass_rate >= target_pass_rate AND force 미설정` | 성공 종료 — "목표 pass_rate {target_pass_rate} 달성!" |
| `best_pass_rate >= target_pass_rate AND force 설정 AND 모든 전략 시도 완료` | 성공 종료 — 모든 program.md 전략을 시도한 후 종료 |
| `iteration >= max_iterations` | 예산 소진 — "최대 iteration 수 도달." |

어느 조건에도 해당하지 않으면 다음 iteration으로 진행 (2-1로 돌아감).

---

## Phase 3: 결과 보고

### 3-1. 최종 보고서 생성

`{workspace}/report.md`에 작성:

```markdown
# Autoresearch Report: {skill-name}

**실행 일시:** {started_at} ~ {completed_at}
**종료 사유:** {target 달성 / stall 중단 / 예산 소진}

## 결과 요약

| 메트릭 | Baseline | Final | Delta |
|--------|----------|-------|-------|
| Mean Pass Rate | {baseline} | {final} | {delta} |
| 총 Iterations | — | {total} | — |
| Kept | — | {kept_count} | — |
| Discarded | — | {discarded_count} | — |

## 효과적이었던 Mutations

| Iteration | 전략 | 가설 | Delta |
|-----------|------|------|-------|
| {N} | {type} | {hypothesis summary} | {delta} |

## Assertion-Level 변화

| Assertion | Baseline | Final | Changed in |
|-----------|----------|-------|------------|
| {id} | FAIL | PASS | Iteration {N} |

## 실패한 Mutations (참고용)

| Iteration | 가설 | 실패 사유 |
|-----------|------|-----------|
| {N} | {hypothesis} | {pass_rate delta or regression} |
```

### 3-2. SKILL.md 반영

사용자에게 최종 확인을 요청:
```
Autoresearch 완료:
- Pass rate: {baseline} → {final} ({delta})
- {kept_count}개 mutation 적용, {discarded_count}개 폐기

최종 SKILL.md를 원본에 반영하시겠습니까?
- Yes: 원본 SKILL.md를 교체하고 git commit
- No: workspace에만 보관 (원본 변경 없음)
- Diff: 변경 내용을 먼저 확인
```

### 3-3. 실행 로그 기록

기존 logging-protocol.md에 따라:
- `~/.claude/agent-team/autoresearch/logs/{timestamp}/result.json` 작성
- `~/.claude/agent-team/autoresearch/logs/{timestamp}/summary.md` 작성
- `~/.claude/agent-team/autoresearch/logs/index.json` 업데이트

**result.json 확장 필드:**
```json
{
  "skillName": "da-review",
  "skillPath": "agent-team-plugin/skills/da-review/SKILL.md",
  "baselinePassRate": 0.85,
  "finalPassRate": 1.0,
  "totalIterations": 7,
  "keptMutations": 4,
  "discardedMutations": 3,
  "terminationReason": "target_achieved"
}
```

---

## Default Mutation Strategy

program.md가 없을 때 사용하는 기본 전략. 실패한 assertions를 분석하고 다음 순서로 수정을 시도한다:

### 1. 누락된 지시 (Missing Instruction)

실패한 assertion이 요구하는 행동이 SKILL.md에 아예 언급되지 않은 경우.

**진단:** assertion의 `description`과 `keywords`를 SKILL.md에서 검색. 관련 내용이 없으면 "누락"으로 분류.

**수정:** 해당 행동을 적절한 Phase/Step의 체크리스트, 공격 질문, 또는 에이전트 역할에 추가.

**예시:** assertion "rollback_plan 포함"이 실패 → SKILL.md의 Verdict 섹션에 "rollback strategy 필수 항목" 추가.

### 2. 모호한 지시 (Ambiguous Instruction)

관련 내용이 있지만 충분히 구체적이지 않아 LLM이 놓치는 경우.

**진단:** assertion의 keywords가 SKILL.md에 유사하게 존재하지만, eval 출력에서 해당 영역의 depth가 부족.

**수정:** 일반적 표현을 구체적 표현으로 교체.

**예시:** "보안 확인" → "SQL 인젝션, XSS, SSRF, 인증 우회 벡터를 각각 확인"

### 3. 구조적 문제 (Structural Issue)

지시가 있지만 워크플로우 순서상 놓치기 쉬운 위치에 있는 경우.

**진단:** SKILL.md에 관련 내용이 존재하고, 일부 eval run에서는 통과하지만 variance가 높은 경우.

**수정:** 해당 지시를 더 앞 Phase로 이동하거나, 필수 체크 항목으로 격상.

### 4. 과잉 지시 (Excess Instruction)

불필요한 내용이 핵심 지시를 희석하여 LLM이 중요한 부분을 놓치는 경우.

**진단:** SKILL.md의 특정 섹션이 과도하게 길고, 해당 섹션 근처의 다른 assertion도 함께 실패.

**수정:** 불필요한 부분을 제거하거나 Level 3 references로 이동하여 신호 대 잡음 비율 개선.

---

## autoresearch-log.json 스키마

전체 실험 실행의 메타데이터를 기록한다.

```json
{
  "skill_name": "da-review",
  "skill_path": "agent-team-plugin/skills/da-review/SKILL.md",
  "started_at": "2026-03-26T10:00:00",
  "completed_at": "2026-03-26T11:30:00",
  "config": {
    "max_iterations": 10,
    "target_pass_rate": 1.0,
    "stall_limit": 3,
    "eval_runs": 2
  },
  "baseline_pass_rate": 0.85,
  "final_pass_rate": 1.0,
  "total_iterations": 7,
  "kept_mutations": 4,
  "discarded_mutations": 3,
  "termination_reason": "target_achieved",
  "iterations": [
    {
      "iteration": 1,
      "hypothesis": "Fast Mode 라우팅 규칙에 '단일 파일 = Fast Mode' 명시",
      "strategy_type": "missing",
      "pass_rate": 0.92,
      "delta": "+0.07",
      "outcome": "kept",
      "regressions": [],
      "timestamp": "2026-03-26T10:15:00"
    }
  ],
  "program_md_used": false
}
```

---

## Common Mistakes

- **여러 변경을 동시에 하기:** 한 iteration에 하나의 변경만. 여러 변경을 하면 어떤 변경이 효과적이었는지 알 수 없다.
- **Eval 출력 전체를 컨텍스트에 넣기:** grading.json의 summary만 읽을 것. 전체 output은 컨텍스트를 소진시킨다.
- **Regression 무시:** 전체 pass_rate가 올라도 개별 assertion regression이 있으면 검토가 필요하다.
- **원본 SKILL.md 직접 수정:** 항상 workspace에 복사본을 만들고 작업할 것. 원본은 최종 확인 후에만 교체.
- **구조 검증 생략:** mutation 후 YAML frontmatter, 필수 섹션을 반드시 검증. LLM이 구조를 깨트릴 수 있다.

## Reference Documentation

- [`references/program-md-guide.md`](references/program-md-guide.md) — program.md 작성 가이드 (전략 설계, 예시)
