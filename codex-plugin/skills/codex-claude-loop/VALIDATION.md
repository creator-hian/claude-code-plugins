# Codex-Claude Loop Skill 검증 평가 기준

> **문서 버전**: 1.0
> **최종 수정**: 2025-12-03
> **대상**: `codex-plugin:codex-claude-loop` skill

## 1. 개요

### 1.1 목적
이 문서는 Claude Code 환경에서 `codex-claude-loop` skill의 듀얼 AI 엔지니어링 루프가 정상 작동하는지 판별하기 위한 체계적인 평가 기준을 정의합니다.

### 1.2 범위
```
┌─────────────────────────────────────────────────────────────┐
│                       검증 범위                              │
├─────────────────────────────────────────────────────────────┤
│  Level 1: Prerequisites (전제조건)        - 필수             │
│  Level 2: Workflow Phases (워크플로우)    - 필수             │
│  Level 3: Feedback Loop (피드백 루프)     - 필수             │
│  Level 4: Error Handling (에러 처리)      - 권장             │
│  Level 5: Integration (통합성)            - 선택             │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 워크플로우 구조
```
Plan (Claude) → Validate (Codex) → Implement (Claude) → Review (Codex) → Fix → Re-validate → Done
     │                │                  │                  │            │         │
   Phase 1         Phase 2            Phase 4            Phase 5      Phase 6   Phase 6
                     ↓
                 Phase 3 (Feedback Loop - if issues found)
```

### 1.4 전제 조건
| 항목 | 요구사항 |
|------|----------|
| 환경 | Claude Code (Non-TTY) |
| 명령 형식 | `codex exec` (필수) |
| API 키 | `OPENAI_API_KEY` 환경변수 설정 |
| 네트워크 | OpenAI API 접근 가능 |
| 의존성 | `codex-cli` skill 정상 작동 |

### 1.5 역할 분담
| AI | 역할 | 도구 |
|----|------|------|
| **Claude** | 아키텍처, 계획, 코드 구현 | Edit, Write, Read, TodoWrite |
| **Codex** | 검증, 코드 리뷰, 품질 보증 | `codex exec` (read-only) |

---

## 2. Level 1: Prerequisites (전제조건)

> **목적**: Codex-Claude Loop 실행을 위한 기본 환경 확인

### 2.1 테스트 항목

| ID | 테스트 항목 | 명령어/동작 | 성공 기준 |
|----|-------------|-------------|-----------|
| P-01 | Codex CLI 가용성 | `codex --version` | 버전 문자열 출력 |
| P-02 | Git 상태 확인 | `git rev-parse --git-dir` | "Git OK" 또는 사용자 선택 유도 |
| P-03 | Non-TTY 명령 형식 | `codex exec` 사용 | `stdin is not a terminal` 에러 없음 |
| P-04 | Skill 로드 | `Skill(codex-plugin:codex-claude-loop)` | Skill 내용 표시 |
| P-05 | codex-cli 의존성 | `codex-cli` skill 정상 작동 | Level 1-2 통과 확인 |

### 2.2 Git 저장소 처리 테스트

| ID | 시나리오 | 동작 | 성공 기준 |
|----|----------|------|-----------|
| P-02a | Git 저장소 O | 직접 진행 | 추가 질문 없음 |
| P-02b | Git 저장소 X | `AskUserQuestion` 호출 | 3개 옵션 제시 |
| P-02c | `git init` 선택 | Git 초기화 | 정상 초기화 |
| P-02d | `--skip-git-repo-check` 선택 | 플래그 적용 | 경고 없이 진행 |

### 2.3 판정 기준

```
PASS: P-01 ~ P-05 모두 통과
PARTIAL: P-01 ~ P-03 통과, P-04 또는 P-05 실패
FAIL: P-01 ~ P-03 중 하나라도 실패
```

---

## 3. Level 2: Workflow Phases (워크플로우)

> **목적**: 각 Phase의 정상 작동 확인

### 3.1 Phase 0: Pre-flight Check

| ID | 테스트 항목 | 동작 | 성공 기준 |
|----|-------------|------|-----------|
| W-00a | Git 상태 확인 수행 | Codex 명령 전 Git 확인 | 확인 로그 출력 |
| W-00b | 사용자 선택 요청 | Git 아닐 시 AskUserQuestion | 옵션 제시 |

### 3.2 Phase 1: Planning (Claude)

| ID | 테스트 항목 | 동작 | 성공 기준 |
|----|-------------|------|-----------|
| W-01a | 구현 계획 생성 | Claude가 상세 계획 작성 | 구조화된 계획 문서 |
| W-01b | 단계별 분해 | 작업을 명확한 단계로 분해 | 3+ 단계 포함 |
| W-01c | 가정 및 위험 문서화 | 가정/위험 명시 | 관련 섹션 포함 |
| W-01d | TodoWrite 사용 | 작업 목록 생성 | Todo 항목 등록 |

**테스트 시나리오**:
```
입력: "Create a utility function to validate email addresses"

기대 출력 (계획):
- Function: validateEmail(email: string): boolean
- Steps:
  1. Basic format validation with regex
  2. Domain validation
  3. Edge case handling
- Assumptions: [list]
- Risks: [list]
```

### 3.3 Phase 2: Plan Validation (Codex)

| ID | 테스트 항목 | 동작 | 성공 기준 |
|----|-------------|------|-----------|
| W-02a | 모델 선택 질문 | AskUserQuestion으로 모델 선택 | 옵션 제시 |
| W-02b | Reasoning Effort 질문 | AskUserQuestion으로 수준 선택 | 옵션 제시 |
| W-02c | Codex 검증 호출 | `codex exec -s read-only` | 응답 수신 |
| W-02d | 검증 항목 포함 | logic, edge cases, architecture, security | 관련 피드백 포함 |

**테스트 명령**:
```bash
codex exec --skip-git-repo-check -m gpt-5.1-codex -c model_reasoning_effort=medium -s read-only \
  "Review this plan: [plan content]
   Check: logic errors, edge cases, architecture flaws, security"
```

**성공 기준**:
- Exit code 0
- 계획에 대한 구체적 피드백 포함
- 개선 제안 또는 승인 의견 포함

### 3.4 Phase 4: Implementation (Claude)

| ID | 테스트 항목 | 동작 | 성공 기준 |
|----|-------------|------|-----------|
| W-04a | Edit/Write/Read 도구 사용 | 코드 구현 | 파일 생성/수정 |
| W-04b | 단계별 실행 | 계획된 단계 순차 실행 | 각 단계 완료 |
| W-04c | 에러 핸들링 | 구현 중 에러 처리 | Graceful 처리 |
| W-04d | 변경 사항 문서화 | 수정 내용 기록 | 변경 로그 출력 |
| W-04e | Codex 피드백 반영 | Phase 2 피드백 적용 | 피드백 항목 해결 |

### 3.5 Phase 5: Code Review (Codex)

| ID | 테스트 항목 | 동작 | 성공 기준 |
|----|-------------|------|-----------|
| W-05a | 구현 코드 리뷰 요청 | `codex exec -s read-only` | 리뷰 결과 수신 |
| W-05b | 버그 검토 | 버그/결함 식별 | 관련 피드백 포함 |
| W-05c | 성능 검토 | 성능 이슈 식별 | 관련 피드백 포함 |
| W-05d | 보안 검토 | 보안 취약점 식별 | 관련 피드백 포함 |
| W-05e | Best Practice 검토 | 코딩 표준 준수 확인 | 관련 피드백 포함 |

**테스트 명령**:
```bash
codex exec --skip-git-repo-check -s read-only "Review implementation:
[code content]
Check: bugs, performance, best practices, security"
```

**성공 기준**:
- Exit code 0
- 코드에 대한 구체적 분석
- 심각도 분류된 이슈 목록 (Critical/Major/Minor)

### 3.6 Phase 6: Iteration

| ID | 테스트 항목 | 동작 | 성공 기준 |
|----|-------------|------|-----------|
| W-06a | 수정 사항 적용 | Claude가 피드백 반영 | 코드 수정 완료 |
| W-06b | 재검증 수행 | 중요 변경 시 Codex 재검증 | 재검증 결과 수신 |
| W-06c | 세션 연속성 | `codex exec resume` 사용 | 컨텍스트 유지 |
| W-06d | 품질 기준 충족 | 이슈 해결 확인 | "No issues" 또는 Minor만 |

### 3.7 판정 기준

```
PASS: 모든 Phase (W-00 ~ W-06) 정상 완료
PARTIAL: Phase 1-5 완료, Phase 6 일부 제한
FAIL: Phase 1-5 중 하나라도 실패
```

---

## 4. Level 3: Feedback Loop (피드백 루프)

> **목적**: Phase 3 피드백 루프의 정상 작동 확인

### 4.1 테스트 항목

| ID | 테스트 항목 | 시나리오 | 성공 기준 |
|----|-------------|----------|-----------|
| F-01 | 피드백 요약 | Codex 피드백 수신 시 | 사용자에게 요약 제시 |
| F-02 | 계획 수정 | 이슈 발견 시 | 계획 업데이트 |
| F-03 | 사용자 선택 | 수정/진행 결정 | AskUserQuestion 호출 |
| F-04 | 재검증 루프 | 수정 선택 시 | Phase 2 반복 |
| F-05 | 진행 선택 | 진행 선택 시 | Phase 4로 이동 |

### 4.2 피드백 분류 처리

| ID | 피드백 유형 | Claude 대응 | 성공 기준 |
|----|-------------|-------------|-----------|
| F-06 | Critical 이슈 | 즉시 수정 | 자동 수정 시도 |
| F-07 | Architectural 이슈 | 사용자 논의 | AskUserQuestion 호출 |
| F-08 | Minor 이슈 | 문서화 후 진행 | 이슈 기록 |

### 4.3 테스트 시나리오

**시나리오 A: 계획 수정 필요**
```
1. Claude 계획 작성
2. Codex 검증 → "Missing input validation" 피드백
3. Claude 피드백 요약 제시
4. 사용자 "수정" 선택
5. Claude 계획 수정
6. Codex 재검증
7. 승인 → Phase 4 진행
```

**시나리오 B: 코드 수정 필요**
```
1. Claude 구현 완료
2. Codex 리뷰 → "Use Number.isSafeInteger" 피드백
3. Claude Critical로 분류 → 즉시 수정
4. Codex 재검증
5. 승인 → 완료
```

### 4.4 판정 기준

```
PASS: F-01 ~ F-08 모두 정상 작동
PARTIAL: 기본 피드백 루프 작동, 분류 처리 일부 미흡
FAIL: 피드백 수신 후 루프 미작동
```

---

## 5. Level 4: Error Handling (에러 처리)

> **목적**: 에러 상황에서의 안정성 확인

### 5.1 테스트 항목

| ID | 테스트 항목 | 시나리오 | 성공 기준 |
|----|-------------|----------|-----------|
| E-01 | Non-zero exit 처리 | Codex 에러 반환 | 워크플로우 중단 + 에러 보고 |
| E-02 | 에러 메시지 요약 | 에러 발생 시 | AskUserQuestion으로 요약 |
| E-03 | stdin 에러 | `codex` 사용 시 | 올바른 명령 안내 |
| E-04 | Git 에러 | Git 저장소 아닐 시 | 옵션 제시 |
| E-05 | 잘못된 옵션 | 유효하지 않은 옵션 | 유효 옵션 안내 |

### 5.2 Exit Code 처리 테스트

| Exit Code | 원인 | 기대 동작 |
|-----------|------|-----------|
| `0` | 성공 | 워크플로우 계속 |
| `1` | 일반 에러 | 에러 메시지 확인 + 사용자 선택 |
| `2` | 인자 오류 | 유효 옵션 안내 |

### 5.3 복구 흐름 테스트

| ID | 시나리오 | 복구 동작 | 성공 기준 |
|----|----------|-----------|-----------|
| E-06 | Codex 타임아웃 | 재시도 또는 사용자 선택 | Graceful 처리 |
| E-07 | API 키 오류 | 설정 안내 | 명확한 안내 메시지 |
| E-08 | 네트워크 오류 | 재시도 옵션 | 사용자 선택 제공 |

### 5.4 판정 기준

```
PASS: E-01 ~ E-05 모두 정상 처리 (Graceful 복구)
PARTIAL: 기본 에러 처리 작동, 일부 복구 미흡
FAIL: 에러 시 크래시 또는 무한 대기
```

---

## 6. Level 5: Integration (통합성)

> **목적**: Claude Code 워크플로우 내 통합 확인

### 6.1 테스트 항목

| ID | 테스트 항목 | 설명 | 성공 기준 |
|----|-------------|------|-----------|
| I-01 | Skill 호출 | `codex-plugin:codex-claude-loop` 로드 | Skill 내용 표시 |
| I-02 | TodoWrite 통합 | 작업 추적 | Todo 항목 정상 갱신 |
| I-03 | AskUserQuestion 통합 | 사용자 상호작용 | 질문/선택 정상 작동 |
| I-04 | 파일 도구 통합 | Read/Edit/Write | 파일 작업 정상 |
| I-05 | codex-cli 연계 | 의존성 skill 활용 | 옵션/패턴 일관성 |

### 6.2 E2E 워크플로우 테스트

| ID | 시나리오 | 단계 | 성공 기준 |
|----|----------|------|-----------|
| I-06 | 전체 루프 완료 | Phase 0 → 6 전체 | 코드 생성 + 검증 통과 |
| I-07 | 복잡한 피드백 | 다중 이슈 처리 | 모든 이슈 해결 |
| I-08 | 다중 파일 | 여러 파일 생성/수정 | 일관된 품질 |

### 6.3 테스트 시나리오: E2E 완전 루프

```
입력: "Create a TypeScript function to validate and format phone numbers"

기대 실행 흐름:
1. [Pre-flight] Git 상태 확인
2. [Phase 1] Claude 계획 작성 (함수 설계, 검증 규칙, 포맷 옵션)
3. [Phase 2] Codex 계획 검증 → 피드백 (예: "Consider international formats")
4. [Phase 3] 피드백 반영하여 계획 수정
5. [Phase 4] Claude 구현 (validatePhoneNumber.ts)
6. [Phase 5] Codex 코드 리뷰 → 피드백 (예: "Add E.164 format support")
7. [Phase 6] 수정 적용 + 재검증
8. [Complete] 최종 코드 + "No issues found" 확인
```

### 6.4 판정 기준

```
PASS: I-01 ~ I-05 모두 통과, E2E 완료
PARTIAL: 기본 통합 작동, 일부 고급 기능 제한
FAIL: 워크플로우 중단 또는 도구 통합 실패
```

---

## 7. 종합 평가 매트릭스

### 7.1 레벨별 가중치

| Level | 가중치 | 필수 여부 | 설명 |
|-------|--------|-----------|------|
| Level 1: Prerequisites | 15% | 필수 | 기본 환경 |
| Level 2: Workflow Phases | 35% | 필수 | 핵심 워크플로우 |
| Level 3: Feedback Loop | 25% | 필수 | 피드백 메커니즘 |
| Level 4: Error Handling | 15% | 권장 | 안정성 |
| Level 5: Integration | 10% | 선택 | 통합성 |

### 7.2 레벨별 점수 계산

각 레벨 점수는 **기본 점수**에서 **오류 감점**을 차감하여 계산합니다.

```
레벨 점수 = 기본 점수 - 오류 감점

기본 점수:
- PASS = 100점
- PARTIAL = 60점
- FAIL = 0점

오류 감점 (테스트 항목당):
- 1회 시도 성공: 0점 감점
- 2회 시도 후 성공: -5점
- 3회 시도 후 성공: -10점
- 4회 이상 시도 후 성공: -15점
- 환경 제한으로 생략: -5점 (플랫폼 이슈)
```

### 7.3 오류 빈도 기록표

각 테스트 항목에 대해 시도 횟수와 오류 유형을 기록합니다.

| 테스트 ID | 시도 횟수 | 오류 유형 | 감점 |
|-----------|-----------|-----------|------|
| 예: W-02c | 3회 | `codex exec` 형식 오류, `-a` 옵션 오류 | -10점 |
| 예: F-04 | 2회 | 피드백 루프 재진입 실패 | -5점 |

### 7.4 오류 유형 분류

| 오류 유형 | 설명 | 책임 소재 |
|-----------|------|-----------|
| **Skill 문서 오류** | 문서의 명령어 형식이 부정확 | Skill 개선 필요 |
| **워크플로우 오류** | Phase 간 전환 실패 | 로직 개선 필요 |
| **Codex CLI 오류** | Codex CLI 자체의 버그 또는 호출 오류 | codex-cli skill 참조 |
| **피드백 처리 오류** | 피드백 분류/반영 실패 | 피드백 로직 개선 |
| **플랫폼 이슈** | OS별 호환성 문제 | 문서에 제한사항 명시 |
| **사용자 상호작용 오류** | AskUserQuestion 호출 실패 | 상호작용 로직 개선 |
| **환경 이슈** | API 키, 네트워크, Git 등 | 사전 조건 확인 |

### 7.5 종합 점수 계산

```
총점 = (L1 점수 × 0.15) + (L2 점수 × 0.35) + (L3 점수 × 0.25) + (L4 점수 × 0.15) + (L5 점수 × 0.10)

예시:
L1: 100점 (오류 없음) × 0.15 = 15점
L2: 100 - 10 = 90점 (W-02c에서 3회 시도) × 0.35 = 31.5점
L3: 100 - 5 = 95점 (F-04에서 2회 시도) × 0.25 = 23.75점
L4: 100점 (오류 없음) × 0.15 = 15점
L5: 100점 (오류 없음) × 0.10 = 10점
─────────────────────────────
총점: 95.25점
```

### 7.6 최종 판정

| 총점 | 판정 | 의미 |
|------|------|------|
| 90-100 | **FULLY OPERATIONAL** | 모든 기능 정상 작동, 프로덕션 사용 가능 |
| 75-89 | **OPERATIONAL** | 핵심 기능 작동, 일부 제한 있음 |
| 60-74 | **PARTIALLY OPERATIONAL** | 기본 기능만 작동, 수동 개입 필요 |
| 40-59 | **LIMITED FUNCTIONALITY** | 제한적 사용, 개선 필요 |
| 0-39 | **NOT OPERATIONAL** | 사용 불가, 문제 해결 필요 |

---

## 8. 테스트 실행 체크리스트

### 8.1 사전 준비
```
[ ] Codex CLI 설치 확인 (codex --version)
[ ] OPENAI_API_KEY 환경변수 설정
[ ] 네트워크 연결 확인
[ ] Claude Code 환경 준비
[ ] codex-cli skill 검증 완료 (VALIDATION.md 참조)
```

### 8.2 Level 1: Prerequisites
```
[ ] P-01: CLI 가용성
[ ] P-02: Git 상태 확인
[ ] P-03: Non-TTY 명령 형식
[ ] P-04: Skill 로드
[ ] P-05: codex-cli 의존성
-> Level 1 판정: [ PASS / PARTIAL / FAIL ]
```

### 8.3 Level 2: Workflow Phases
```
[ ] W-00a/b: Pre-flight Check
[ ] W-01a~d: Phase 1 (Planning)
[ ] W-02a~d: Phase 2 (Plan Validation)
[ ] W-04a~e: Phase 4 (Implementation)
[ ] W-05a~e: Phase 5 (Code Review)
[ ] W-06a~d: Phase 6 (Iteration)
-> Level 2 판정: [ PASS / PARTIAL / FAIL ]
```

### 8.4 Level 3: Feedback Loop
```
[ ] F-01: 피드백 요약
[ ] F-02: 계획 수정
[ ] F-03: 사용자 선택
[ ] F-04: 재검증 루프
[ ] F-05: 진행 선택
[ ] F-06~08: 피드백 분류 처리
-> Level 3 판정: [ PASS / PARTIAL / FAIL ]
```

### 8.5 Level 4: Error Handling
```
[ ] E-01: Non-zero exit 처리
[ ] E-02: 에러 메시지 요약
[ ] E-03: stdin 에러
[ ] E-04: Git 에러
[ ] E-05: 잘못된 옵션
[ ] E-06~08: 복구 흐름
-> Level 4 판정: [ PASS / PARTIAL / FAIL ]
```

### 8.6 Level 5: Integration
```
[ ] I-01: Skill 호출
[ ] I-02: TodoWrite 통합
[ ] I-03: AskUserQuestion 통합
[ ] I-04: 파일 도구 통합
[ ] I-05: codex-cli 연계
[ ] I-06~08: E2E 워크플로우
-> Level 5 판정: [ PASS / PARTIAL / FAIL ]
```

### 8.7 오류 빈도 기록
```
| 테스트 ID | 시도 횟수 | 오류 유형 | 감점 |
|-----------|-----------|-----------|------|
| _________ | ___회 | _________________________ | -___점 |
| _________ | ___회 | _________________________ | -___점 |
| _________ | ___회 | _________________________ | -___점 |
| _________ | ___회 | _________________________ | -___점 |
| _________ | ___회 | _________________________ | -___점 |

총 오류 감점: -___점
```

### 8.8 종합 결과
```
Level 1: 기본 ___점 - 오류 ___점 = ___점 × 0.15 = ___
Level 2: 기본 ___점 - 오류 ___점 = ___점 × 0.35 = ___
Level 3: 기본 ___점 - 오류 ___점 = ___점 × 0.25 = ___
Level 4: 기본 ___점 - 오류 ___점 = ___점 × 0.15 = ___
Level 5: 기본 ___점 - 오류 ___점 = ___점 × 0.10 = ___
─────────────────────────────
총점: ___점

최종 판정: [ FULLY OPERATIONAL / OPERATIONAL / PARTIALLY OPERATIONAL / LIMITED FUNCTIONALITY / NOT OPERATIONAL ]
```

### 8.9 Skill 개선 권고사항
```
[ ] 오류 유형별 Skill 문서 개선 필요 여부
[ ] 플랫폼별 제한사항 문서화 필요 여부
[ ] 워크플로우 로직 개선 필요 영역
[ ] 피드백 처리 로직 개선 필요 영역
[ ] 에러 메시지 개선 제안
[ ] 추가 예제 필요 영역
```

---

## 9. 부록

### 9.1 워크플로우 다이어그램

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Codex-Claude Loop                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐          │
│  │ Phase 0  │───→│ Phase 1  │───→│ Phase 2  │───→│ Phase 3  │          │
│  │Pre-flight│    │ Planning │    │ Validate │    │ Feedback │          │
│  │  Check   │    │ (Claude) │    │ (Codex)  │    │   Loop   │          │
│  └──────────┘    └──────────┘    └──────────┘    └────┬─────┘          │
│                                                        │                 │
│                                          ┌────────────┴─────────────┐   │
│                                          │                          │   │
│                                          ▼                          │   │
│                                   ┌──────────┐                      │   │
│                              Yes  │  Issues  │  No                  │   │
│                       ┌───────────│  Found?  │───────────┐          │   │
│                       │           └──────────┘           │          │   │
│                       ▼                                  ▼          │   │
│                ┌──────────┐                       ┌──────────┐      │   │
│                │  Revise  │                       │ Phase 4  │      │   │
│                │   Plan   │──────────────────────→│Implement │      │   │
│                └──────────┘                       │ (Claude) │      │   │
│                       ▲                           └────┬─────┘      │   │
│                       │                                │            │   │
│                       └────────────────────────────────┼────────────┘   │
│                                                        │                 │
│                                                        ▼                 │
│                                                 ┌──────────┐            │
│                                                 │ Phase 5  │            │
│                                                 │  Review  │            │
│                                                 │ (Codex)  │            │
│                                                 └────┬─────┘            │
│                                                      │                   │
│                                         ┌────────────┴─────────────┐    │
│                                         │                          │    │
│                                         ▼                          │    │
│                                  ┌──────────┐                      │    │
│                             Yes  │  Issues  │  No                  │    │
│                      ┌───────────│  Found?  │───────────┐          │    │
│                      │           └──────────┘           │          │    │
│                      ▼                                  ▼          │    │
│               ┌──────────┐                       ┌──────────┐      │    │
│               │ Phase 6  │                       │   Done   │      │    │
│               │ Iterate  │                       │    ✓     │      │    │
│               │  & Fix   │                       └──────────┘      │    │
│               └────┬─────┘                                         │    │
│                    │                                               │    │
│                    └───────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 9.2 역할별 책임 매트릭스

| Phase | Claude 책임 | Codex 책임 | 사용자 개입 |
|-------|-------------|------------|-------------|
| 0 | Git 상태 확인 | - | 선택 (필요시) |
| 1 | 계획 작성 | - | 검토 (선택) |
| 2 | - | 계획 검증 | 모델/수준 선택 |
| 3 | 피드백 반영 | - | 수정/진행 결정 |
| 4 | 코드 구현 | - | - |
| 5 | - | 코드 리뷰 | - |
| 6 | 수정 적용 | 재검증 | 승인 (필요시) |

### 9.3 피드백 심각도 분류

| 심각도 | 정의 | Claude 대응 |
|--------|------|-------------|
| **Critical** | 보안 취약점, 데이터 손실, 크래시 유발 | 즉시 수정, 재검증 필수 |
| **Major** | 기능 오류, 성능 문제, 아키텍처 결함 | 사용자 논의 후 수정 |
| **Minor** | 코딩 스타일, 문서화, 사소한 개선 | 문서화 후 진행 가능 |
| **Info** | 참고 사항, 대안 제안 | 선택적 적용 |

### 9.4 명령어 패턴 참조

| Phase | 명령어 패턴 |
|-------|-------------|
| 계획 검증 | `codex exec -m MODEL -c model_reasoning_effort=LEVEL -s read-only "plan"` |
| 코드 리뷰 | `codex exec -s read-only "review"` |
| 세션 재개 | `codex exec resume "next step"` |
| 재검증 | `codex exec resume "verify fixes"` |
| Non-Git | `codex exec --skip-git-repo-check -s read-only "prompt"` |

### 9.5 일반 에러 및 해결책

| 에러 | 원인 | 해결책 |
|------|------|--------|
| `stdin is not a terminal` | `codex` 사용 | `codex exec` 사용 |
| `Not inside a trusted directory` | Git 저장소 아님 | `git init` 또는 `--skip-git-repo-check` |
| `invalid value for '--ask-for-approval'` | 잘못된 승인 값 | 유효 값 사용 (untrusted, on-failure, on-request, never) |
| `API key not found` | 환경변수 미설정 | `OPENAI_API_KEY` 설정 |
| `Exit code 1` | 일반 에러 | 에러 메시지 확인 |
| `Exit code 2` | 인자 오류 | 옵션 값 확인 |

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2025-12-03 | 초기 버전 작성 |
| 1.1 | 2025-12-03 | 오류 빈도 점수화 기준 추가 (7.2~7.5절), 오류 유형 분류 추가 (7.4절), 체크리스트에 오류 기록표/개선 권고사항 추가 (8.7~8.9절) |
