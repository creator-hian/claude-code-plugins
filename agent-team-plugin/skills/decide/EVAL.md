# decide Binary Evaluation Criteria

> 모든 기준은 **YES / NO**로만 판정. 부분 점수 없음.
> Edge Case 섹션은 해당 상황이 발생했을 때만 적용.

## 사용법

1. 스킬 실행 결과물을 준비
2. 각 기준을 순서대로 확인하여 YES/NO 기록
3. Edge Case 기준은 해당 상황이 발생한 경우에만 적용 (미발생 시 N/A)
4. Pass Rate = YES 수 / 적용 대상 기준 수 (N/A 제외)

---

## Phase 0: Decision Parsing (항상 적용)

| ID | 기준 | Pass 조건 | 적용 조건 |
|----|------|-----------|-----------|
| DC-P0-01 | 옵션 추출 | A와 B 두 옵션이 명시적으로 이름 지어져 있다 | 항상 |
| DC-P0-02 | 단일 옵션 거부 | 사용자가 1개 옵션만 제시했을 때, 대안이 무엇인지 질문했다 | 1개 옵션만 제시된 경우 |
| DC-P0-03 | 3+ 옵션 축소 | 3개 이상 옵션에서 2개를 선정하고, 나머지 각각에 1줄 제외 이유를 제시했다 | 3개 이상 옵션이 제시된 경우 |

---

## Phase 1: Context Gathering

| ID | 기준 | Pass 조건 | 적용 조건 |
|----|------|-----------|-----------|
| DC-P1-01 | 코드베이스 탐색 | Glob/Grep/Read 도구 사용 증거가 있거나, 코드베이스와 무관한 결정임이 명시되어 있다 | 항상 |
| DC-P1-02 | 결정 컨텍스트 | 결정 포인트(파일/함수/아키텍처 경계), 기존 코드베이스 패턴, 제약조건 중 최소 2개가 언급되어 있다 | 항상 |

---

## Phase 2: Advocate Dispatch

| ID | 기준 | Pass 조건 | 적용 조건 |
|----|------|-----------|-----------|
| DC-P2-01 | 2명 디스패치 | 두 Advocate 에이전트가 단일 응답에서 동시에 디스패치되었다 | 일반 경로 (숏컷 아님) |
| DC-P2-02 | 출력 완전성 | 각 Advocate의 출력에 Core argument / Concrete benefits / Honest costs / Implementation sketch / Success scenario 5개 섹션이 모두 포함되어 있다 | 일반 경로 (숏컷 아님) |

---

## Phase 3: Synthesis & Verdict

| ID | 기준 | Pass 조건 | 적용 조건 |
|----|------|-----------|-----------|
| DC-P3-01 | 비교 테이블 | Dimension / Option A / Option B 컬럼을 가진 비교 테이블이 존재한다 | 항상 |
| DC-P3-02 | Constraint Check | 사용자가 언급하거나 암시한 제약조건이 나열되고, 각 제약조건에 대해 어느 옵션이 더 잘 충족하는지 명시되어 있다 | 항상 |
| DC-P3-03 | 추천 + 신뢰도 | 하나의 옵션이 명확히 추천되고, Confidence가 Strong / Moderate / Weak 중 하나로 명시되어 있다 | 항상 |
| DC-P3-04 | Flip condition | "X 조건이면 다른 옵션을 선택하라"는 구체적이고 검증 가능한 조건이 존재한다 | 항상 |

---

## Edge Cases

| ID | 기준 | Pass 조건 | 적용 조건 |
|----|------|-----------|-----------|
| DC-EC-01 | 비교불가 감지 | 옵션의 추상 수준이 다를 때(라이브러리 vs 패턴 등), reframe을 제안했다 | 비교불가 옵션이 주어진 경우 |
| DC-EC-02 | 자명한 결정 숏컷 | 코드베이스 관례로 명백한 경우, Advocate 디스패치를 생략하고 코드베이스 증거와 함께 직접 추천했다 | 자명한 결정인 경우 |

---

## Logging & Pattern

| ID | 기준 | Pass 조건 | 적용 조건 |
|----|------|-----------|-----------|
| DC-LOG-01 | 이전 로그 확인 | 실행 시작 시 `.claude/agent-team/decide/logs/index.json`을 읽었다 (빈 배열이면 "이전 로그 없음" 확인) | 항상 |
| DC-LOG-02 | 패턴 조회 | 실행 시작 시 `.claude/agent-team/decide/patterns/index.json`을 읽어 기존 패턴과 현재 입력을 대조했다 | 항상 |
| DC-LOG-03 | 로그 기록 | 실행 완료 후 `.claude/agent-team/decide/logs/{timestamp}/result.json`과 `summary.md`가 작성되었다 | 항상 |
| DC-LOG-04 | 인덱스 업데이트 | `.claude/agent-team/decide/logs/index.json`에 새 entry가 추가되었고, 6개 필수 필드가 모두 존재한다 | 항상 |
| DC-LOG-05 | 패턴 승격 판단 | 워크플로우 문제가 발견+해결된 경우 패턴 승격 여부를 판단했다 (승격 또는 미승격 사유 명시) | 문제 발견+해결 시 |

---

## 요약 템플릿

| 섹션 | 적용 기준 수 | Pass | Fail | Rate |
|------|-------------|------|------|------|
| Phase 0 | 1-3 | | | |
| Phase 1 | 2 | | | |
| Phase 2 | 0 또는 2 | | | |
| Phase 3 | 4 | | | |
| Edge Cases | 0-2 | | | |
| Logging & Pattern | 4-5 | | | |
| **Total** | **11-18** | | | |
