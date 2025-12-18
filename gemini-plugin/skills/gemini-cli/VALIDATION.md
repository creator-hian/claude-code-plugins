# Gemini CLI Skill 검증 평가 기준

> **문서 버전**: 1.0
> **최종 수정**: 2025-12-04
> **대상**: `gemini-plugin:gemini-cli` skill

## 1. 개요

### 1.1 목적
이 문서는 Claude Code 환경에서 `gemini-cli` skill을 통해 Gemini CLI가 정상 작동하는지 판별하기 위한 체계적인 평가 기준을 정의합니다.

### 1.2 범위
```
┌─────────────────────────────────────────────────────────┐
│                    검증 범위                              │
├─────────────────────────────────────────────────────────┤
│  Level 1: Connectivity (연결성)        - 필수            │
│  Level 2: Functionality (기능성)       - 필수            │
│  Level 3: Reliability (신뢰성)         - 권장            │
│  Level 4: Integration (통합성)         - 선택            │
└─────────────────────────────────────────────────────────┘
```

### 1.3 전제 조건
| 항목 | 요구사항 |
|------|----------|
| 환경 | Claude Code (Non-TTY) |
| 명령 형식 | `gemini -p "prompt"` (Headless 모드 필수) |
| 인증 | Google OAuth 또는 `GEMINI_API_KEY` 환경변수 설정 |
| 네트워크 | Google AI API 접근 가능 |

### 1.4 Codex CLI와의 주요 차이점

| 항목 | Codex CLI | Gemini CLI |
|------|-----------|------------|
| Non-TTY 명령 | `codex exec` | `gemini -p` |
| 모델 옵션 | `-m MODEL` | `-m MODEL` 또는 `--model MODEL` |
| Sandbox | `-s read-only` | `-s restrictive` 또는 `--sandbox restrictive` |
| 출력 형식 | N/A | `--output-format json` |
| 자동 승인 | N/A | `--yolo` 또는 `-y` |
| 세션 관리 | `codex exec resume` | Interactive 전용 (테스트 제외) |
| Git 체크 | `--skip-git-repo-check` | 해당 없음 |

---

## 2. Level 1: Connectivity (연결성)

> **목적**: Gemini CLI 설치 및 기본 연결 확인

### 2.1 테스트 항목

| ID | 테스트 항목 | 명령어 | 성공 기준 |
|----|-------------|--------|-----------|
| C-01 | CLI 설치 확인 | `where gemini` (Win) / `which gemini` (Unix) | 경로 반환 |
| C-02 | 버전 확인 | `gemini --version` | 버전 문자열 출력 |
| C-03 | 기본 응답 | `gemini -p "respond OK"` | 응답 수신 |

### 2.2 판정 기준

```
PASS: 모든 C-xx 테스트 통과
PARTIAL: C-01, C-02 통과, C-03 실패 (인증 또는 네트워크 문제)
FAIL: C-01 또는 C-02 실패 (설치 문제)
```

### 2.3 에러 진단 가이드

| 증상 | 원인 | 해결책 |
|------|------|--------|
| `gemini not found` | CLI 미설치 | `npm install -g @anthropic-ai/gemini-cli` 또는 공식 설치 가이드 참조 |
| `Authentication required` | 인증 미완료 | `gemini` 대화형 모드에서 OAuth 인증 수행 또는 `GEMINI_API_KEY` 설정 |
| `No output` | `-p` 플래그 누락 | `gemini -p "prompt"` 형식 사용 |
| `Network error` | API 접근 불가 | 네트워크 연결 및 방화벽 확인 |

---

## 3. Level 2: Functionality (기능성)

> **목적**: 핵심 기능의 정확한 작동 확인

### 3.1 테스트 항목

| ID | 테스트 항목 | 설명 | 성공 기준 |
|----|-------------|------|-----------|
| F-01 | 기본 프롬프트 응답 | 단순 질문에 대한 응답 | 관련성 있는 응답 |
| F-02 | 코드 분석 | 제공된 코드 리뷰 | 문제점 식별 |
| F-03 | 보안 취약점 탐지 | SQL Injection 등 탐지 | 취약점 명시 |
| F-04 | 모델 선택 | `-m` 또는 `--model` 옵션 작동 | 지정 모델 사용 |
| F-05 | JSON 출력 | `--output-format json` 작동 | 유효한 JSON 반환 |
| F-06 | Sandbox 모드 | `-s restrictive` 옵션 작동 | 지정 모드 적용 |
| F-07 | YOLO 모드 | `--yolo` 자동 승인 작동 | 승인 프롬프트 없이 진행 |

### 3.2 테스트 케이스 상세

#### F-02: 코드 분석 테스트
```bash
gemini -p "Review this code:

function add(a, b) {
  return a + b;
}

Identify any issues or improvements."
```

**성공 기준**:
- 응답 수신
- 코드 관련 피드백 포함
- 구체적 개선 제안 (선택적)

#### F-03: 보안 취약점 탐지 테스트
```bash
gemini -p "Security review:

function getUserData(userId) {
  const query = 'SELECT * FROM users WHERE id = ' + userId;
  return db.execute(query);
}

List security vulnerabilities."
```

**성공 기준**:
- "SQL Injection" 또는 "injection" 키워드 포함
- 위험성 설명 포함
- 해결책 제안 (선택적)

#### F-04: 모델 선택 테스트
```bash
gemini -m gemini-3-flash-preview -p "What model are you using?"
```

**성공 기준**:
- 명령 정상 실행
- 모델 관련 응답 포함

#### F-05: JSON 출력 테스트
```bash
gemini -p "Say hello" --output-format json
```

**성공 기준**:
- 유효한 JSON 형식 반환
- `response` 필드 포함
- `jq` 파싱 가능

```bash
# 파싱 검증
gemini -p "Say hello" --output-format json | jq -r '.response'
```

### 3.3 판정 기준

```
PASS: F-01 ~ F-05 모두 통과
PARTIAL: 필수 항목(F-01~F-03) 통과, 옵션 항목 일부 실패
FAIL: F-01 ~ F-03 중 하나라도 실패
```

---

## 4. Level 3: Reliability (신뢰성)

> **목적**: 에러 처리 및 안정성 확인

### 4.1 테스트 항목

| ID | 테스트 항목 | 시나리오 | 성공 기준 |
|----|-------------|----------|-----------|
| R-01 | 빈 입력 처리 | 빈 프롬프트 전달 | 적절한 에러/안내 메시지 |
| R-02 | 잘못된 옵션 | 존재하지 않는 옵션 | 명확한 에러 메시지 |
| R-03 | 타임아웃 | 매우 긴 요청 | 타임아웃 후 복구 |
| R-04 | 일관성 | 동일 입력 반복 | 유사한 품질의 응답 |
| R-05 | 잘못된 모델명 | `-m invalid-model` | 에러 메시지 + 유효 모델 안내 |

### 4.2 테스트 케이스 상세

#### R-01: 빈 입력 처리
```bash
gemini -p ""
```

**성공 기준**:
- 크래시 없음
- 에러 또는 안내 메시지 출력

#### R-02: 잘못된 옵션
```bash
gemini --invalid-option "test"
```

**성공 기준**:
- Exit code != 0
- 에러 메시지에 유효한 옵션 힌트 포함

#### R-05: 잘못된 모델명
```bash
gemini -m invalid-model-name -p "test"
```

**성공 기준**:
- 에러 메시지 출력
- 유효한 모델 목록 안내 (선택적)

### 4.3 판정 기준

```
PASS: R-01 ~ R-03 통과 (에러 시 graceful 처리)
PARTIAL: 일부 에러 케이스에서 불명확한 메시지
FAIL: 크래시 또는 무한 대기 발생
```

---

## 5. Level 4: Integration (통합성)

> **목적**: Claude Code 워크플로우 내 통합 확인

### 5.1 테스트 항목

| ID | 테스트 항목 | 설명 | 성공 기준 |
|----|-------------|------|-----------|
| I-01 | Skill 호출 | `gemini-plugin:gemini-cli` skill 로드 | skill 내용 표시 |
| I-02 | JSON 출력 파싱 | Gemini 응답을 jq로 파싱 | 파싱 가능한 출력 |
| I-03 | 다중 호출 | 연속 Gemini 요청 | 각각 독립적 성공 |
| I-04 | Stdin 파이프 입력 | `cat file \| gemini -p "analyze"` | 파일 내용 분석 |
| I-05 | 디렉토리 컨텍스트 | `--include-directories` 옵션 | 추가 컨텍스트 반영 |

### 5.2 테스트 케이스 상세

#### I-02: JSON 출력 파싱
```bash
result=$(gemini -p "List 3 programming languages" --output-format json)
echo "$result" | jq -r '.response'
```

**성공 기준**:
- JSON 파싱 성공
- `.response` 필드에서 유의미한 텍스트 추출

#### I-04: Stdin 파이프 입력
```bash
echo "function test() { return 1; }" | gemini -p "Review this code"
```

**성공 기준**:
- Stdin 입력 정상 처리
- 코드에 대한 분석 결과 반환

#### I-05: 디렉토리 컨텍스트
```bash
gemini --include-directories ./src -p "Analyze project structure"
```

**성공 기준**:
- 지정 디렉토리 파일 인식
- 디렉토리 내용 기반 분석 결과

### 5.3 판정 기준

```
PASS: I-01 ~ I-03 통과
PARTIAL: 기본 통합 작동, 고급 기능 일부 제한
FAIL: Claude Code 내에서 호출 실패
```

---

## 6. 종합 평가 매트릭스

### 6.1 레벨별 가중치

| Level | 가중치 | 필수 여부 |
|-------|--------|-----------|
| Level 1: Connectivity | 30% | 필수 |
| Level 2: Functionality | 40% | 필수 |
| Level 3: Reliability | 20% | 권장 |
| Level 4: Integration | 10% | 선택 |

### 6.2 레벨별 점수 계산

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

### 6.3 오류 빈도 기록표

각 테스트 항목에 대해 시도 횟수와 오류 유형을 기록합니다.

| 테스트 ID | 시도 횟수 | 오류 유형 | 감점 |
|-----------|-----------|-----------|------|
| 예: F-05 | 2회 | JSON 파싱 오류, jq 구문 | -5점 |
| 예: I-05 | 3회 | 디렉토리 경로 오류 | -10점 |

### 6.4 오류 유형 분류

| 오류 유형 | 설명 | 책임 소재 |
|-----------|------|-----------|
| **Skill 문서 오류** | 문서의 명령어 형식이 부정확 | Skill 개선 필요 |
| **CLI 버그** | Gemini CLI 자체의 버그 | 업스트림 이슈 |
| **플랫폼 이슈** | OS별 호환성 문제 | 문서에 제한사항 명시 |
| **사용자 오류** | 잘못된 입력/옵션 | 에러 메시지 개선 필요 |
| **환경 이슈** | 인증, 네트워크 등 | 사전 조건 확인 |
| **JSON 파싱 오류** | 출력 형식 파싱 실패 | jq 구문 또는 응답 형식 확인 |

### 6.5 종합 점수 계산

```
총점 = (L1 점수 × 0.3) + (L2 점수 × 0.4) + (L3 점수 × 0.2) + (L4 점수 × 0.1)

예시:
L1: 100점 (오류 없음) × 0.3 = 30점
L2: 100 - 5 = 95점 (F-05에서 2회 시도) × 0.4 = 38점
L3: 100점 (오류 없음) × 0.2 = 20점
L4: 100 - 10 = 90점 (I-05에서 3회 시도) × 0.1 = 9점
─────────────────────────────
총점: 97점
```

### 6.6 최종 판정

| 총점 | 판정 | 의미 |
|------|------|------|
| 90-100 | **FULLY OPERATIONAL** | 모든 기능 정상 작동 |
| 70-89 | **OPERATIONAL WITH LIMITATIONS** | 핵심 기능 작동, 일부 제한 |
| 50-69 | **PARTIALLY OPERATIONAL** | 기본 기능만 작동 |
| 0-49 | **NOT OPERATIONAL** | 사용 불가 |

---

## 7. 테스트 실행 체크리스트

### 7.1 사전 준비
```
[ ] Gemini CLI 설치 확인
[ ] Google OAuth 인증 또는 GEMINI_API_KEY 환경변수 설정
[ ] 네트워크 연결 확인
[ ] Claude Code 환경 준비
[ ] jq 설치 확인 (JSON 파싱용)
```

### 7.2 Level 1 실행
```
[ ] C-01: CLI 경로 확인
[ ] C-02: 버전 확인
[ ] C-03: 기본 응답 테스트
-> Level 1 판정: [ PASS / PARTIAL / FAIL ]
```

### 7.3 Level 2 실행
```
[ ] F-01: 기본 프롬프트
[ ] F-02: 코드 분석
[ ] F-03: 보안 취약점 탐지
[ ] F-04: 모델 선택
[ ] F-05: JSON 출력
[ ] F-06: Sandbox 모드
[ ] F-07: YOLO 모드
-> Level 2 판정: [ PASS / PARTIAL / FAIL ]
```

### 7.4 Level 3 실행
```
[ ] R-01: 빈 입력 처리
[ ] R-02: 잘못된 옵션
[ ] R-03: 타임아웃
[ ] R-04: 일관성
[ ] R-05: 잘못된 모델명
-> Level 3 판정: [ PASS / PARTIAL / FAIL ]
```

### 7.5 Level 4 실행
```
[ ] I-01: Skill 호출
[ ] I-02: JSON 출력 파싱
[ ] I-03: 다중 호출
[ ] I-04: Stdin 파이프 입력
[ ] I-05: 디렉토리 컨텍스트
-> Level 4 판정: [ PASS / PARTIAL / FAIL ]
```

### 7.6 오류 빈도 기록
```
| 테스트 ID | 시도 횟수 | 오류 유형 | 감점 |
|-----------|-----------|-----------|------|
| _________ | ___회 | _________________________ | -___점 |
| _________ | ___회 | _________________________ | -___점 |
| _________ | ___회 | _________________________ | -___점 |

총 오류 감점: -___점
```

### 7.7 종합 결과
```
Level 1: 기본 ___점 - 오류 ___점 = ___점 × 0.3 = ___
Level 2: 기본 ___점 - 오류 ___점 = ___점 × 0.4 = ___
Level 3: 기본 ___점 - 오류 ___점 = ___점 × 0.2 = ___
Level 4: 기본 ___점 - 오류 ___점 = ___점 × 0.1 = ___
─────────────────────────────
총점: ___점

최종 판정: [ FULLY OPERATIONAL / OPERATIONAL WITH LIMITATIONS / PARTIALLY OPERATIONAL / NOT OPERATIONAL ]
```

### 7.8 Skill 개선 권고사항
```
[ ] 오류 유형별 Skill 문서 개선 필요 여부
[ ] 플랫폼별 제한사항 문서화 필요 여부
[ ] 에러 메시지 개선 제안
[ ] 추가 예제 필요 영역
```

---

## 8. 부록

### 8.1 유효한 모델 목록
| 모델 ID | 설명 |
|---------|------|
| `gemini-3-flash-preview` | 빠르고 효율적 (기본 권장), 표준 리뷰 및 일반 분석 |
| `gemini-3-pro-preview` | 플래그십 모델, 복잡한 아키텍처 분석 및 보안 감사에만 사용 |

### 8.2 유효한 출력 형식
| 형식 | 설명 |
|------|------|
| (기본) | 사람이 읽기 쉬운 텍스트 |
| `json` | 통계 포함 구조화 JSON |
| `stream-json` | 실시간 모니터링용 JSONL |

### 8.3 JSON 응답 스키마
```json
{
  "response": "string",
  "stats": {
    "models": { ... },
    "tools": { ... },
    "files": { ... }
  },
  "error": {
    "type": "string",
    "message": "string",
    "code": 0
  }
}
```

### 8.4 유효한 Sandbox 모드
| 모드 | 설명 |
|------|------|
| (기본) | 표준 권한 (읽기/쓰기) |
| `restrictive` | 제한된 권한 (읽기 전용) |

### 8.5 유효한 승인 모드
| 모드 | 설명 |
|------|------|
| (기본) | 각 작업마다 승인 요청 |
| `auto_edit` | 파일 편집 자동 승인 |
| `--yolo` | 모든 작업 자동 승인 (주의 필요) |

### 8.6 Exit Code 참조
| 코드 | 의미 |
|------|------|
| `0` | 성공 |
| `1` | 일반 에러 |

### 8.7 플랫폼별 참고사항

#### Windows
- 셸 모드: `powershell.exe -NoProfile -Command` 사용
- 경로: 슬래시 `/` 또는 이스케이프 백슬래시 `\\` 사용
- 클립보드: `clip` 명령 사용

#### Linux/macOS
- 셸 모드: `bash` 사용
- 클립보드: `xclip`/`xsel` (Linux) 또는 `pbcopy` (macOS) 필요

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2025-12-04 | 초기 버전 작성 |
