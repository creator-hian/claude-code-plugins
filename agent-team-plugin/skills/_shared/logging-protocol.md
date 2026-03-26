# Skill 실행 로깅 프로토콜

모든 스킬이 참조하는 공통 로깅 절차. 각 SKILL.md에서 이 문서를 참조한다.

> **경로 규칙:** 런타임 데이터(logs, patterns)는 플러그인 업데이트 시 소실되지 않도록 **프로젝트의 `.claude/agent-team/{skill-name}/`** 하위에 저장한다. 프로토콜 정의 문서는 플러그인 내(`${CLAUDE_PLUGIN_ROOT}/skills/_shared/`)에 유지한다.

## logs/index.json 스키마

```json
{
  "entries": [
    {
      "logDir": "2026-03-25T14-30-00",
      "timestamp": "2026-03-25T14:30:00",
      "accessCount": 0,
      "outcome": "success",
      "summary": "1줄 실행 요약",
      "protected": false
    }
  ]
}
```

### 필드 정의

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `logDir` | string | Y | 타임스탬프 디렉토리명 (YYYY-MM-DDTHH-MM-SS) |
| `timestamp` | string | Y | ISO 형식 타임스탬프 |
| `accessCount` | number | Y | 이후 실행에서 참조된 횟수 |
| `outcome` | string | Y | `"success"` / `"failure"` / `"partial"` |
| `summary` | string | Y | 1줄 요약 (사람이 읽는 용도) |
| `protected` | boolean | Y | true이면 prune 대상 제외 |

스킬별 확장 필드는 자유롭게 추가 가능하다. 위 6개만 공통 필수.

## 개별 로그 디렉토리 구조

```
logs/
  index.json
  YYYY-MM-DDTHH-MM-SS/
    result.json    # 구조화된 실행 결과 (스킬별 스키마)
    summary.md     # 사람이 읽는 실행 요약
```

### result.json 공통 필드

```json
{
  "timestamp": "2026-03-25T14:30:00",
  "outcome": "success",
  "arguments": "$ARGUMENTS 원문",
  "duration": "약 5분",
  "artifacts": [
    "생성/수정한 파일 경로 목록"
  ]
}
```

### result.json 스킬별 확장 필드

**da-review:**
```json
{
  "mode": "fast|team",
  "reviewTarget": "plan|code",
  "agentsDispatched": ["Feasibility Skeptic", "Gap Hunter"],
  "findingsCount": { "critical": 0, "high": 2, "medium": 1 },
  "overallRating": "PASS|CONDITIONAL|FAIL"
}
```

**decide:**
```json
{
  "optionA": "Redis",
  "optionB": "Memcached",
  "recommendation": "A|B",
  "confidence": "Strong|Moderate|Weak",
  "shortcut": false
}
```

**diverse-plan:**
```json
{
  "agentsDispatched": ["Architect", "Challenger"],
  "stepsCount": 5,
  "requirementsCovered": 8,
  "requirementsDeferred": 0,
  "tradeoffsCount": 2
}
```

나머지 필드는 스킬별로 자유 확장한다.

### summary.md 형식

```markdown
# {스킬명} 실행 결과 — {날짜}

**입력:** {$ARGUMENTS 요약}
**결과:** {outcome}
**소요:** {duration}

## 요약
{실행 내용 2-3줄}

## 산출물
- {파일 경로 목록}
```

## 로깅 절차 (5단계)

### 1. 시작 시 — 이전 로그 확인
`.claude/agent-team/{skill-name}/logs/index.json`을 읽는다 (없으면 디렉토리와 함께 `{"entries":[]}` 초기화).
현재 입력과 관련된 이전 로그가 있으면 참고한다.

### 2. 타임스탬프 생성
`date +%Y-%m-%dT%H-%M-%S` 형식으로 디렉토리명 생성.

### 3. 실행 완료 후 — 로그 디렉토리 생성
`.claude/agent-team/{skill-name}/logs/{timestamp}/` 디렉토리를 생성한다.

### 4. 파일 작성
- `result.json`: 구조화된 실행 데이터
- `summary.md`: 사람이 읽는 요약

### 5. 인덱스 업데이트
`index.json`의 `entries` 배열에 새 entry를 추가한다.
이전 로그를 참조했다면 해당 entry의 `accessCount`를 +1한다.

## Prune 정책

로그가 누적될 때 다음 기준으로 정리한다:

**보존 조건** (하나라도 해당하면 보존):
- 최근 7일 이내
- `accessCount >= 3`
- `protected = true`
- `outcome = "failure"` (패턴 승격 후보)

**삭제 조건** (모두 해당할 때):
- 30일 이전
- `accessCount < 3`
- `protected = false`
- `outcome != "failure"`
