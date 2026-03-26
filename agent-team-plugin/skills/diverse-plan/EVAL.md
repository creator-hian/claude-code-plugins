# diverse-plan Binary Evaluation Criteria

> 모든 기준은 **YES / NO**로만 판정. 부분 점수 없음.

## 사용법

1. 스킬 실행 결과물(구현 계획)을 준비
2. 각 기준을 순서대로 확인하여 YES/NO 기록
3. 적용 조건이 "해당 시"인 기준은 상황이 발생한 경우에만 적용 (미발생 시 N/A)
4. Pass Rate = YES 수 / 적용 대상 기준 수 (N/A 제외)

---

## Phase 0: Context Gathering (항상 적용)

| ID | 기준 | Pass 조건 | 적용 조건 |
|----|------|-----------|-----------|
| DP-P0-01 | 코드베이스 탐색 | Glob/Grep/Read 도구를 사용하여 관련 파일을 탐색한 증거가 존재한다 | 항상 |
| DP-P0-02 | Fact summary | 관련 파일 목록, 기존 패턴/유틸리티, 기술 스택 제약 중 최소 2개가 포함된 요약이 있다 | 항상 |
| DP-P0-03 | Vague Request Gate | 사용자의 요청에 명확한 범위나 성공 기준이 없을 때, 진행하지 않고 clarification을 요청했다 | 모호한 요청이 주어진 경우 |

---

## Phase 1: Agent Selection + Dispatch

| ID | 기준 | Pass 조건 | 적용 조건 |
|----|------|-----------|-----------|
| DP-P1-01 | 에이전트 수 | 2개 에이전트가 디스패치되었다 (3개는 대규모 아키텍처 변경에서만 허용) | 항상 |
| DP-P1-02 | Architect 포함 | Architect 에이전트가 디스패치 목록에 포함되어 있다 | 항상 |
| DP-P1-03 | 에이전트-태스크 매핑 | 선택된 에이전트 조합이 SKILL.md의 "Task Type" 테이블과 부합한다 (New feature→Challenger, Domain→Domain Challenger 등) | 항상 |
| DP-P1-04 | 병렬 디스패치 | 모든 에이전트가 단일 응답(하나의 메시지)에서 동시에 디스패치되었다 | 항상 |
| DP-P1-05 | 전원 완료 대기 | 모든 에이전트가 완료된 후에 합성이 시작되었다 | 항상 |

---

## Phase 2: Structured Synthesis

| ID | 기준 | Pass 조건 | 적용 조건 |
|----|------|-----------|-----------|
| DP-P2-01 | Proposal 추출 | 각 에이전트의 응답에서 실행 가능한 구체적 제안이 추출되었다 (일반적 관찰이 아닌 파일/변경/결정 수준) | 항상 |
| DP-P2-02 | 비교 테이블 | Decision / Architect's Proposal / Challenger's Proposal / Resolution 컬럼을 가진 비교 테이블이 존재한다 | 항상 |
| DP-P2-03 | 충돌 해결 | 에이전트 간 의견이 다른 각 결정 포인트에 대해 선택 + 1문장 이유가 있다 | 항상 |
| DP-P2-04 | 구현 스텝 구체성 | 각 구현 스텝에 Files / Changes / Rationale / Verify 4개 항목이 모두 존재한다 | 항상 |
| DP-P2-05 | Requirements Coverage Matrix | 사용자의 명시적/암시적 요구사항 목록이 있고, 각각을 다루는 구현 스텝이 매핑되어 있다 | 항상 |
| DP-P2-06 | Dependency 순서 | 구현 스텝이 의존성 순서로 정렬되어 있고, 후속 스텝이 선행 스텝의 미완료 작업에 의존하지 않는다 | 항상 |

---

## 출력 형식 + 완성도

| ID | 기준 | Pass 조건 | 적용 조건 |
|----|------|-----------|-----------|
| DP-OUT-01 | 플랜 형식 | Goal / Architecture / Perspectives / Key Decisions / Implementation Steps / Requirements Coverage / Trade-offs / Critical Files 섹션이 모두 존재한다 | 항상 |
| DP-OUT-02 | 다음 단계 제안 | DA review 실행 / 직접 실행 / 수정 중 옵션이 제시되어 있다 | 항상 |
| DP-OUT-03 | 언어 일치 | 출력 언어가 사용자 요청 언어와 동일하다 | 항상 |

---

## 에이전트 실패 처리

| ID | 기준 | Pass 조건 | 적용 조건 |
|----|------|-----------|-----------|
| DP-EF-01 | 단일 실패 대응 | 1개 에이전트가 실패했을 때, 누락된 관점을 명시하고 나머지 결과로 진행했다 | 에이전트 1개 실패 시 |
| DP-EF-02 | 전체 실패 대응 | 모든 에이전트가 실패했을 때, 사용자에게 재시도 여부를 물었다 | 모든 에이전트 실패 시 |

---

## Logging & Pattern

| ID | 기준 | Pass 조건 | 적용 조건 |
|----|------|-----------|-----------|
| DP-LOG-01 | 이전 로그 확인 | 실행 시작 시 `.claude/agent-team/diverse-plan/logs/index.json`을 읽었다 (빈 배열이면 "이전 로그 없음" 확인) | 항상 |
| DP-LOG-02 | 패턴 조회 | 실행 시작 시 `.claude/agent-team/diverse-plan/patterns/index.json`을 읽어 기존 패턴과 현재 입력을 대조했다 | 항상 |
| DP-LOG-03 | 로그 기록 | 실행 완료 후 `.claude/agent-team/diverse-plan/logs/{timestamp}/result.json`과 `summary.md`가 작성되었다 | 항상 |
| DP-LOG-04 | 인덱스 업데이트 | `.claude/agent-team/diverse-plan/logs/index.json`에 새 entry가 추가되었고, 6개 필수 필드가 모두 존재한다 | 항상 |
| DP-LOG-05 | 패턴 승격 판단 | 워크플로우 문제가 발견+해결된 경우 패턴 승격 여부를 판단했다 (승격 또는 미승격 사유 명시) | 문제 발견+해결 시 |

---

## 요약 템플릿

| 섹션 | 적용 기준 수 | Pass | Fail | Rate |
|------|-------------|------|------|------|
| Phase 0 | 2-3 | | | |
| Phase 1 | 5 | | | |
| Phase 2 | 6 | | | |
| 출력 | 3 | | | |
| 에이전트 실패 | 0-2 | | | |
| Logging & Pattern | 4-5 | | | |
| **Total** | **20-24** | | | |
