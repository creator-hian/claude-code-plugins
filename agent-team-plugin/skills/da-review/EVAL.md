# da-review Binary Evaluation Criteria

> 모든 기준은 **YES / NO**로만 판정. 부분 점수 없음.
> Fast Mode와 Team Mode는 실행 경로에 따라 해당 섹션만 적용.

## 사용법

1. 스킬 실행 결과물을 준비
2. Phase 0 기준을 먼저 확인하여 실행 경로(Fast/Team) 판별
3. 해당 경로의 기준 + 공통 출력 기준을 순서대로 확인하여 YES/NO 기록
4. Pass Rate = YES 수 / 적용 대상 기준 수 (N/A 제외)

---

## Phase 0: Mode Detection (항상 적용)

| ID | 기준 | Pass 조건 | 적용 조건 |
|----|------|-----------|-----------|
| DA-P0-01 | Mode 식별 | 출력에 "Plan mode" 또는 "Code mode"가 명시적으로 선언되어 있다 | 항상 |
| DA-P0-02 | 경로 선택 | "Fast Mode" 또는 "Team Mode" 중 하나가 명시적으로 선언되어 있다 | 항상 |
| DA-P0-03 | 경로 정확성 | SKILL.md의 복잡도 규칙 4단계(명시적 요청→플랜/아키텍처→3+파일→나머지)에 부합하는 경로가 선택되었다 | 항상 |
| DA-P0-04 | 언어 일치 | 출력 언어가 사용자 요청 언어와 동일하다 | 항상 |

---

## Fast Mode 전용

| ID | 기준 | Pass 조건 | 적용 조건 |
|----|------|-----------|-----------|
| DA-FM-01 | 컨텍스트 로딩 | 대상 파일의 내용을 직접 인용한 증거(코드 스니펫, 라인 참조)가 존재한다 | Fast Mode |
| DA-FM-02 | 체크리스트 커버리지 | Feasibility Check와 Gap Check 섹션이 최소한 적용되었다. Security/Performance/Concurrency는 대상 코드에 해당할 때만 적용되며, 해당하지 않으면 명시적 생략 사유가 있다 | Fast Mode |
| DA-FM-03 | Finding 테이블 | `#` / `Severity` / `Location` / `Finding` / `Better Alternative` 컬럼을 가진 테이블이 존재한다 | Fast Mode |
| DA-FM-04 | Overall Rating | PASS / CONDITIONAL / FAIL 중 정확히 하나가 명시되어 있다 | Fast Mode |

---

## Team Mode 전용

| ID | 기준 | Pass 조건 | 적용 조건 |
|----|------|-----------|-----------|
| DA-TM-01 | 에이전트 수 | 2개 또는 3개의 DA 에이전트가 디스패치되었다 (1개 또는 4개 이상은 FAIL) | Team Mode |
| DA-TM-02 | Feasibility Skeptic 포함 | 선택된 에이전트 목록에 Feasibility Skeptic이 포함되어 있다 | Team Mode |
| DA-TM-03 | 에이전트-타겟 매핑 | 선택된 에이전트 조합이 SKILL.md의 "Target Type → Recommended Agents" 테이블과 부합한다 | Team Mode |
| DA-TM-04 | 병렬 디스패치 | 모든 에이전트가 단일 응답(하나의 메시지)에서 동시에 디스패치되었다 | Team Mode |
| DA-TM-05 | 전원 완료 대기 | 모든 에이전트가 완료된 후에 통합이 시작되었다 (부분 결과로 시작하지 않음) | Team Mode |
| DA-TM-06 | 중복 제거 | 동일한 finding이 여러 번 나열되지 않고, 중복은 병합되어 기여 에이전트가 명시되어 있다 | Team Mode |
| DA-TM-07 | Validator 조건부 실행 | CRITICAL finding이 존재하면 Validator가 실행되었고, CRITICAL이 없으면 Validator가 생략되었다 | Team Mode |

---

## 공통 출력 (Fast Mode + Team Mode 모두 적용)

| ID | 기준 | Pass 조건 | 적용 조건 |
|----|------|-----------|-----------|
| DA-OUT-01 | Severity 부여 | 모든 finding에 CRITICAL / HIGH / MEDIUM 중 하나가 지정되어 있다 | 항상 |
| DA-OUT-02 | Location 명시 | 모든 finding에 파일명:라인번호(Code mode) 또는 플랜 섹션/스텝 번호(Plan mode)가 있다 | 항상 |
| DA-OUT-03 | 대안 제시 | 모든 finding의 "Better Alternative" 컬럼이 비어있지 않다 | 항상 |

---

## Logging & Pattern

| ID | 기준 | Pass 조건 | 적용 조건 |
|----|------|-----------|-----------|
| DA-LOG-01 | 이전 로그 확인 | 실행 시작 시 `.claude/agent-team/da-review/logs/index.json`을 읽었다 (빈 배열이면 "이전 로그 없음" 확인) | 항상 |
| DA-LOG-02 | 패턴 조회 | 실행 시작 시 `.claude/agent-team/da-review/patterns/index.json`을 읽어 기존 패턴과 현재 입력을 대조했다 | 항상 |
| DA-LOG-03 | 로그 기록 | 실행 완료 후 `.claude/agent-team/da-review/logs/{timestamp}/result.json`과 `summary.md`가 작성되었다 | 항상 |
| DA-LOG-04 | 인덱스 업데이트 | `.claude/agent-team/da-review/logs/index.json`에 새 entry가 추가되었고, 6개 필수 필드가 모두 존재한다 | 항상 |
| DA-LOG-05 | 패턴 승격 판단 | 워크플로우 문제가 발견+해결된 경우 패턴 승격 여부를 판단했다 (승격 또는 미승격 사유 명시) | 문제 발견+해결 시 |

---

## 요약 템플릿

| 섹션 | 적용 기준 수 | Pass | Fail | Rate |
|------|-------------|------|------|------|
| Phase 0 | 4 | | | |
| Fast Mode / Team Mode | 4 또는 7 | | | |
| 공통 출력 | 3 | | | |
| Logging & Pattern | 4-5 | | | |
| **Total** | **15 또는 19** | | | |
