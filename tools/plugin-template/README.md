# Claude Code Plugin Template

이 폴더는 **Claude Code 플러그인 생성을 위한 템플릿**입니다.

## 개요

Claude Code Plugin Template은 Claude Code의 기능을 확장하기 위한 플러그인을 개발할 때 사용하는 표준 구조입니다. 이 템플릿을 사용하여 커스텀 에이전트, 명령어, 훅, 스킬을 정의하고 Claude Code에 새로운 기능을 추가할 수 있습니다.

## 디렉토리 구조

```
plugin-template/
├── .claude-plugin/
│   └── plugin.json          # 플러그인 메타데이터 및 설정
├── agents/                   # 특화된 에이전트 정의
├── commands/                  # 커스텀 슬래시 명령어 구현
├── hook/                     # 라이프사이클 훅 및 이벤트 핸들러
├── skills/                   # 새로운 스킬 및 기능 정의
└── README.md                 # 플러그인 문서
```

### 각 디렉토리의 역할

#### `.claude-plugin/plugin.json`
플러그인의 메타데이터를 정의하는 핵심 설정 파일입니다.

```json
{
  "name": "your-plugin-name",
  "description": "플러그인 설명",
  "version": "1.0.0",
  "author": {
    "name": "작성자 이름"
  }
}
```

**필수 필드:**
- `name` - 플러그인 고유 식별자 (kebab-case 권장)
- `description` - 플러그인의 목적과 기능 설명
- `version` - 시맨틱 버저닝 (예: 1.0.0)
- `author` - 플러그인 작성자 정보

#### `agents/`
특정 작업을 수행하는 지능형 에이전트를 정의합니다.

**용도:**
- 복잡한 멀티스텝 작업을 자율적으로 처리하는 에이전트
- 특정 도메인(예: C#, Python, 데이터 분석)에 특화된 전문가 에이전트
- 기존 에이전트를 확장하거나 새로운 워크플로우 구현

#### `commands/`
사용자가 실행할 수 있는 커스텀 슬래시 명령어를 구현합니다.

**용도:**
- `/custom-command` 형태의 명령어 추가
- 반복적인 작업을 단일 명령으로 자동화
- 프로젝트별 특화 워크플로우 구현

**예시:**
- `/analyze-performance` - 성능 분석 자동화
- `/deploy-production` - 프로덕션 배포 프로세스
- `/generate-docs` - 문서 자동 생성

#### `hook/`
Claude Code의 라이프사이클 이벤트에 연결되는 훅을 정의합니다.

**용도:**
- 파일 저장 전/후 이벤트 처리
- 코드 생성 전 검증 로직 추가
- 커밋 전 자동 린팅/포맷팅
- 특정 이벤트 발생 시 알림 전송

**일반적인 훅 타입:**
- `pre-write` - 파일 쓰기 전 실행
- `post-write` - 파일 쓰기 후 실행
- `pre-commit` - Git 커밋 전 실행
- `on-error` - 에러 발생 시 실행

#### `skills/`
Claude Code에 **재사용 가능한 절차적 지식(procedural knowledge)**을 추가하는 모듈입니다.

**용도:**
- 특정 프레임워크나 라이브러리에 대한 전문 지식 제공
- 도메인별 베스트 프랙티스와 패턴 가이드
- 여러 프로젝트에서 재사용 가능한 워크플로우 정의

**Skills의 핵심 특징:**
- **맥락 인식**: 작업 맥락(task context)에 따라 자동 활성화
- **Progressive Loading**: 필요한 시점에만 콘텐츠 로드하여 context 효율화
- **모듈화**: 독립적인 파일로 정의되어 관리 용이

**Skills vs Agents/Subagents:**
- **Skills**: 재사용 가능한 "how-to" 지식 (언어, 프레임워크, 도구 사용법)
- **Agents/Subagents**: 프로젝트별 복잡한 워크플로우 및 맥락

---

##### Skills 폴더 구조

Skills는 **3-Level Progressive Disclosure** 아키텍처를 사용하여 context를 최적화합니다:

```
skills/
└── skill-name/                  # Skill 이름 (예: csharp-core, react-patterns)
    ├── SKILL.md                 # Level 1 (Metadata) + Level 2 (Instructions)
    └── resources/               # Level 3 (Resources) - 필요시만 로드
        ├── REFERENCE.md         # 상세 레퍼런스 문서
        ├── PATTERNS.md          # 디자인 패턴 및 예시 모음
        ├── EXAMPLES.md          # 대량 코드 스니펫
        └── scripts/             # 실행 가능한 유틸리티 스크립트
            ├── analyze.ps1      # PowerShell 스크립트 (Windows)
            └── analyze.sh       # Bash 스크립트 (Unix/Linux/Mac)
```

---

##### Level 1: Metadata (항상 로드, ~100 tokens)

**SKILL.md의 YAML frontmatter**로 정의되며, Claude Code가 "어떤 Skills가 있는지" 인지하는 데 사용됩니다.

**예시:**
```yaml
---
name: csharp-core
description: C# 기본 언어, 코딩 컨벤션, .NET 프레임워크 기초
category: programming
language: csharp
---
```

**포함 내용:**
- `name`: Skill 식별자 (간결하게)
- `description`: 1-2문장으로 언제 이 Skill을 사용하는지 명확히 기술
- 기타 메타데이터 (`category`, `language`, `framework` 등)

**크기 제한:** ~100 tokens 엄수 (설명은 간결하게)

---

##### Level 2: Instructions (트리거시 로드, ~5,000 tokens)

**SKILL.md 파일의 본문 내용**으로, Skill이 호출될 때만 로드됩니다.

**포함 내용:**
- 절차적 지식 (how-to)
- 워크플로우 단계
- 핵심 베스트 프랙티스
- Level 3 리소스로의 링크

**예시:**
```markdown
# C# Core Skills

## 코딩 컨벤션
- Classes, Methods: PascalCase
- Parameters, Local variables: camelCase
- Private fields: _camelCase

## 언어 기능
- async/await 패턴 활용
- LINQ 쿼리 문법
- null 안전성 (nullable reference types)

더 자세한 내용은 [REFERENCE.md](resources/REFERENCE.md) 참조
```

**크기 목표:** ~5,000 tokens 이하 권장

---

##### Level 3: Resources (필요시만 로드, 무제한)

**resources/ 폴더**에 위치한 추가 자료로, SKILL.md에서 명시적으로 참조될 때만 로드됩니다.

**포함 내용:**
- 대용량 레퍼런스 자료
- 상세 코드 예시 모음
- 실행 가능한 스크립트
- 템플릿 파일

**장점:**
- 로드되기 전까지 **0 tokens** 소비
- 필요한 순간에만 context에 포함

**리소스 참조 예시 (SKILL.md 내):**
```markdown
## 상세 레퍼런스
더 자세한 네이밍 규칙은 [REFERENCE.md](resources/REFERENCE.md)를 참조하세요.

## 코드 분석
코드 품질 분석이 필요하면 다음 스크립트를 실행하세요:

**Windows (PowerShell)**:
```bash
.claude/skills/csharp-core/resources/scripts/analyze.ps1 <file-path>
```

**Unix/Linux/Mac (Bash)**:
```bash
.claude/skills/csharp-core/resources/scripts/analyze.sh <file-path>
```
```

---

##### Context 최적화 효과

**전통적 방식 (모든 내용 항상 로드)**
```
Skills 10개 × 15,000 tokens = 150,000 tokens (항상 소비)
```

**Progressive Disclosure 방식**
```
Level 1 (항상):     10 skills × 100 tokens = 1,000 tokens
Level 2 (활성화시): 1 skill × 5,000 tokens = 5,000 tokens
Level 3 (참조시):   1 resource × 10,000 tokens = 10,000 tokens
────────────────────────────────────────────────────────
총 사용:            16,000 tokens (필요시에만)
절약:               134,000 tokens (89% 절감)
```

---

##### Skills 작성 가이드라인

**Level 1 작성:**
- ✅ 간결한 description (1-2문장, ~100 tokens)
- ✅ 언제 이 Skill을 쓰는지 명확히
- ❌ 절차, 예시, 상세 설명 포함 금지

**Level 2 작성:**
- ✅ 핵심 워크플로우와 베스트 프랙티스
- ✅ Level 3 리소스로의 링크 제공
- ❌ 대용량 예시나 중복 설명 포함 금지

**Level 3 작성:**
- ✅ 상세 레퍼런스, 대량 예시, 스크립트
- ✅ 논리적 카테고리별 파일 분리
- ✅ 크기 제한 없음 (사용 안 하면 0 tokens)

---

##### Skills 예시

**언어/프레임워크:**
- `csharp-core` - C# 언어 기본 및 코딩 컨벤션
- `csharp-unity` - Unity 게임 엔진 개발 패턴
- `react-patterns` - React 설계 패턴 및 Hooks 사용법
- `python-async` - Python 비동기 프로그래밍 패턴

**개발 프랙티스:**
- `testing-patterns` - 유닛/통합 테스트 작성 가이드
- `refactoring-techniques` - 코드 리팩터링 기법
- `api-design` - RESTful API 설계 원칙
- `security-audit` - 보안 감사 체크리스트

## 시작하기

### 1. 템플릿 복사
```bash
cp -r plugin-template my-custom-plugin
cd my-custom-plugin
```

### 2. 플러그인 메타데이터 수정
`.claude-plugin/plugin.json` 파일을 편집하여 플러그인 정보를 업데이트합니다:

```json
{
  "name": "my-custom-plugin",
  "description": "내 프로젝트를 위한 커스텀 플러그인",
  "version": "1.0.0",
  "author": {
    "name": "Your Name"
  }
}
```

### 3. 기능 구현
필요한 디렉토리에 기능을 추가합니다:
- 커스텀 에이전트 → `agents/` 디렉토리
- 슬래시 명령어 → `commands/` 디렉토리
- 이벤트 훅 → `hook/` 디렉토리
- 스킬 정의 → `skills/` 디렉토리

### 4. README 작성
플러그인 사용자를 위한 문서를 작성합니다:
- 플러그인 목적과 기능
- 설치 및 설정 방법
- 사용 예시
- 의존성 및 요구사항

## 마켓플레이스 통합

플러그인을 마켓플레이스에 등록하려면 루트의 `marketplace.json`에 추가합니다:

```json
{
  "name": "your-marketplace",
  "owner": {
    "name": "Your Name"
  },
  "plugins": [
    {
      "name": "my-custom-plugin",
      "source": "./my-custom-plugin",
      "description": "내 커스텀 플러그인 설명"
    }
  ]
}
```

## 참고 예제

실제 플러그인 구현 예시는 `csharp-plugin` 디렉토리를 참조하세요. 이 플러그인은 C# 개발을 위한 특화 기능을 제공하며, 플러그인 구조의 실용적인 예시를 보여줍니다.

## 베스트 프랙티스

1. **명확한 네이밍**: 플러그인과 명령어에 의미 있는 이름 사용
2. **문서화**: 각 기능의 목적과 사용법을 명확히 기록
3. **버전 관리**: 시맨틱 버저닝을 따라 버전 관리
4. **의존성 최소화**: 필요한 의존성만 포함
5. **에러 처리**: 명확한 에러 메시지와 복구 전략 제공
6. **테스트**: 주요 기능에 대한 테스트 작성

## 플러그인 개발 가이드라인

### 에이전트 개발
- 단일 책임 원칙: 각 에이전트는 하나의 명확한 역할
- 재사용 가능한 로직: 공통 기능은 유틸리티로 분리
- 상태 관리: 에이전트 간 상태 공유 방식 설계

### 명령어 개발
- 직관적인 인터페이스: 사용자가 쉽게 이해할 수 있는 명령어
- 인자 검증: 명령어 실행 전 입력값 검증
- 진행 상황 표시: 장시간 실행되는 명령어는 진행 상황 피드백

### 훅 개발
- 성능 고려: 훅은 빠르게 실행되어야 함
- 실패 처리: 훅 실패 시 명확한 피드백 제공
- 선택적 실행: 필요한 경우에만 활성화

### 스킬 개발
- 구조화된 지식: 체계적으로 정리된 정보 제공
- 예제 포함: 실용적인 사용 예시 제공
- 업데이트 가능: 변경사항을 쉽게 반영할 수 있는 구조

## 지원 및 기여

- **이슈 리포팅**: 문제 발생 시 자세한 정보와 함께 이슈 등록
- **기능 제안**: 새로운 기능 아이디어 공유
- **플러그인 공유**: 유용한 플러그인은 커뮤니티와 공유

## 라이선스

플러그인 배포 시 적절한 라이선스를 선택하고 명시하세요.

---

**Happy Plugin Development!** 🚀
