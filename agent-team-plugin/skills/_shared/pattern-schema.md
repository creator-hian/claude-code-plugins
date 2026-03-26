# Skill 패턴 관리 스키마

문제-해결 패턴의 등록, 검색, 활용 규칙. 각 SKILL.md에서 이 문서를 참조한다.

> **경로 규칙:** 런타임 데이터(logs, patterns)는 플러그인 업데이트 시 소실되지 않도록 **프로젝트의 `.claude/agent-team/{skill-name}/`** 하위에 저장한다. 프로토콜 정의 문서는 플러그인 내(`${CLAUDE_PLUGIN_ROOT}/skills/_shared/`)에 유지한다.

## patterns/index.json 스키마

```json
{
  "patterns": [
    {
      "id": "P001",
      "file": "P001-fast-mode-misroute.md",
      "title": "3+ 파일 코드 리뷰에서 Fast Mode 잘못 선택",
      "createdFrom": "2026-03-25T14-30-00",
      "symptom": "3개 파일 코드 리뷰인데 Fast Mode로 실행됨",
      "resolution": "복잡도 규칙 2번째 조건(3+ 파일)을 먼저 확인",
      "tags": ["mode-detection", "da-review"],
      "hitCount": 0
    }
  ]
}
```

### 필드 정의

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `id` | string | Y | P + 3자리 순번 (P001, P002, ...) |
| `file` | string | Y | 패턴 md 파일명 (같은 patterns/ 내) |
| `title` | string | Y | 1줄 제목 |
| `createdFrom` | string | Y | 원본 로그 디렉토리명 (추적성) |
| `symptom` | string | Y | 문제 증상 1줄 |
| `resolution` | string | Y | 해결 방법 1줄 |
| `tags` | string[] | Y | 검색용 태그 |
| `hitCount` | number | Y | 이후 실행에서 이 패턴이 적용된 횟수 |

## 패턴 .md 파일 형식

```markdown
# {title}

## 증상
{상세 증상 설명}

## 원인
{근본 원인 분석}

## 해결
{해결 방법 상세 — 워크플로우 수정, 판단 기준 변경 등}

## 사례
- 원본 로그: logs/{createdFrom}/
- 스킬: {da-review|decide|diverse-plan}
- 입력: {문제를 유발한 입력 요약}
```

## 스킬별 패턴 예시

**da-review 패턴:**
- Mode 오분류 (Fast/Team 잘못 선택)
- 에이전트 조합 부적합 (보안 코드인데 Security Auditor 미포함)
- 통합 시 중복 finding 미처리
- Validator 실행 조건 오판

**decide 패턴:**
- 비교불가 옵션 미감지 (라이브러리 vs 패턴)
- Advocate가 코드베이스 탐색 없이 일반론만 제시
- Flip condition이 검증 불가능한 조건으로 기술됨

**diverse-plan 패턴:**
- Architect와 Challenger가 동일한 접근법을 제안 (대비 부족)
- Requirements Coverage Matrix에서 암시적 요구사항 누락
- 구현 스텝의 의존성 순서 오류

## 패턴 승격 (logs/ → patterns/)

### 승격 조건 (모두 충족)
1. 실행 outcome이 `"success"` 또는 `"partial"`
2. 실행 중 스킬 워크플로우 문제가 식별되고 해결됨 (단순 실행이 아닌 문제 발견+수정 흐름)
3. 해결 패턴이 기존 patterns/에 없음 (symptom 유사도 판단)

### 승격 절차
1. 스킬 실행 완료 후, 발견한 문제가 재현 가능한 패턴인지 판단
2. 재현 가능하면 `patterns/{id}-{slug}.md` 파일 생성
3. `patterns/index.json`에 새 entry 추가
4. 해당 로그의 `result.json`에 `"promotedPattern": "P001"` 필드 추가

### 승격하지 않는 경우
- 일회성 입력 문제 (사용자가 잘못된 파일 경로 제공 등)
- 에이전트 타임아웃/인프라 문제 (재현 불가)
- 이미 동일 패턴이 존재 → 기존 패턴의 `hitCount` +1

## 패턴 활용 (실행 시작 시)

### 자기 스킬 패턴 검색
1. `.claude/agent-team/{skill-name}/patterns/index.json`을 읽는다 (없으면 건너뜀)
2. 현재 입력/상황과 `symptom`/`tags`를 대조
3. 매칭되는 패턴 .md를 읽어 참고
4. 패턴 적용 시 `hitCount` +1

### Cross-skill 패턴 검색
관련 스킬의 패턴이 필요할 때:
1. `.claude/agent-team/*/patterns/index.json`으로 전체 탐색
2. 매칭된 패턴 .md를 읽어 참고
