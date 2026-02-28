# Claude Code Plugins Marketplace

**Creator Hian의 Claude Code 플러그인 마켓플레이스**

이 저장소는 Claude Code의 기능을 확장하기 위한 커스텀 플러그인을 개발하고 공유하는 공간입니다.

## 📋 목차

- [프로젝트 개요](#프로젝트-개요)
- [사용 가능한 플러그인](#-사용-가능한-플러그인)
- [플러그인 요약 테이블](#-플러그인-요약-테이블)
- [폴더 구조](#폴더-구조)
- [Plugin 생성 방법](#plugin-생성-방법)
- [Skills 아키텍처 이해하기](#skills-아키텍처-이해하기)
- [Plugin 개발 가이드](#plugin-개발-가이드)
- [기여 방법](#기여-방법)

---

## 프로젝트 개요

### 무엇을 하는 저장소인가요?

Claude Code는 강력한 AI 기반 개발 도구이지만, 사용자별/프로젝트별 특화 요구사항을 충족하기 위해서는 **커스텀 확장**이 필요합니다. 이 저장소는:

- ✅ **플러그인 템플릿 제공**: 빠른 시작을 위한 표준 구조
- ✅ **자동화 스크립트**: 신규 플러그인 생성 자동화 (`create_plugin.py`)
- ✅ **마켓플레이스 구조**: 여러 플러그인을 체계적으로 관리
- ✅ **문서화**: Skills, Agents, Commands, Hooks 개발 가이드

### 누가 사용하나요?

- **개발자**: 자신의 워크플로우에 맞춘 Claude Code 확장 개발
- **팀**: 팀 전체가 사용할 공통 플러그인 공유
- **커뮤니티**: 유용한 플러그인을 오픈소스로 공유

---

## 📦 사용 가능한 플러그인

현재 저장소에서 제공하는 플러그인 목록:

### 1. **csharp-plugin**
- **설명**: C# 개발을 위한 현대적인 async/await 패턴, XML 문서화, 베스트 프랙티스
- **버전**: 1.0.0
- **위치**: `./csharp-plugin`
- **Agents**: 1개 (csharp-pro)
- **Skills**: 2개
  - `csharp-async-patterns` - async/await, CancellationToken, ConfigureAwait 패턴
  - `csharp-xml-docs` - XML 문서화 표준 (한/영 지원)

### 2. **unity-plugin**
- **설명**: Unity 게임 개발을 위한 종합 플러그인 (async, 성능, 아키텍처, UI, 네트워킹)
- **버전**: 2.0.0
- **위치**: `./unity-plugin`
- **Agents**: 2개 (unity-developer, unity-dots-developer)
- **Skills**: 9개
  - `unity-async` - 코루틴, async/await, Job System, 메인 스레드 제약
  - `unity-unitask` - UniTask 제로 할당 async (Cysharp)
  - `unity-r3` - R3 모던 리액티브 프로그래밍 (Cysharp)
  - `unity-unirx` - UniRx 레거시 리액티브 패턴
  - `unity-vcontainer` - VContainer 의존성 주입
  - `unity-mobile` - iOS/Android 최적화, IL2CPP
  - `unity-networking` - Netcode, Mirror, Photon 멀티플레이어
  - `unity-performance` - 프로파일링, 드로우콜, 배칭, LOD
  - `unity-ui` - UI Toolkit, UGUI, Canvas 최적화

### 3. **codex-plugin**
- **설명**: OpenAI Codex CLI 통합 및 Claude-Codex dual-AI 오케스트레이션 패턴
- **버전**: 1.0.0
- **위치**: `./codex-plugin`
- **Agents**: 없음 (Skills 기반)
- **Skills**: 2개
  - `codex-cli` - Codex CLI 명령어 (`codex exec`, 모델 선택, sandbox 모드)
  - `codex-claude-loop` - 6-Phase dual-AI 협업 워크플로우 오케스트레이션

### 4. **gemini-plugin**
- **설명**: Google Gemini CLI 통합 및 Claude-Gemini dual-AI 오케스트레이션 패턴
- **버전**: 1.0.0
- **위치**: `./gemini-plugin`
- **Agents**: 없음 (Skills 기반)
- **Skills**: 2개
  - `gemini-cli` - Gemini CLI 명령어 (모델 선택, 출력 포맷, 세션 관리)
  - `gemini-claude-loop` - Claude-Gemini dual-AI 협업 워크플로우

### 5. **ai-orchestration-plugin**
- **설명**: Multi-AI 오케스트레이션 (Claude + Codex + Gemini) 종합 검증 패턴
- **버전**: 1.0.0
- **위치**: `./ai-orchestration-plugin`
- **Agents**: 없음 (Skills 기반)
- **Skills**: 1개
  - `ai-orchestration-feedback-loop` - Triple-AI/Dual-AI 모드, 역할 분담 (Claude=계획/구현, Codex=검증/보안, Gemini=창의적 리뷰/UX)

### 6. **git-plugin**
- **설명**: Git 커밋 자동화 (Conventional Commits 지원)
- **버전**: 1.0.0
- **위치**: `./git-plugin`
- **Commands**: 1개 (`/git-commit`)

### 7. **agent-team-plugin**
- **설명**: 에이전트 팀 기반 병렬 디스패치 (다관점 계획 수립 + 적대적 리뷰)
- **버전**: 1.0.0
- **위치**: `./agent-team-plugin`
- **Agents**: 없음 (Skills 기반)
- **Skills**: 2개
  - `diverse-plan` - 다관점 Perspectives Team 기반 계획 수립
  - `da-review` - Devil's Advocate Team 기반 적대적 리뷰

---

## 📊 플러그인 요약 테이블

| Plugin | Version | Agents | Skills | 주요 도메인 |
|--------|---------|--------|--------|------------|
| **csharp-plugin** | 1.0.0 | 1 | 2 | C# async, XML docs |
| **unity-plugin** | 2.0.0 | 2 | 9 | Unity 게임 개발 전반 |
| **codex-plugin** | 1.0.0 | 0 | 2 | Codex CLI, Claude-Codex 협업 |
| **gemini-plugin** | 1.0.0 | 0 | 2 | Gemini CLI, Claude-Gemini 협업 |
| **ai-orchestration-plugin** | 1.0.0 | 0 | 1 | Multi-AI (Triple/Dual) 오케스트레이션 |
| **git-plugin** | 1.0.0 | 0 | 0 | Git 커밋 자동화 |
| **agent-team-plugin** | 1.0.0 | 0 | 2 | 에이전트 팀 기반 계획/리뷰 |
| **총계** | - | **3** | **18** | - |

### Skills 상세 목록

| Plugin | Skill Name | 카테고리 | 설명 |
|--------|------------|----------|------|
| csharp | `csharp-async-patterns` | Programming | async/await, CancellationToken 패턴 |
| csharp | `csharp-xml-docs` | Documentation | XML 문서화 표준 |
| unity | `unity-async` | Async | Unity 비동기 패턴 기초 |
| unity | `unity-unitask` | Async | UniTask 제로 할당 async |
| unity | `unity-r3` | Reactive | R3 모던 리액티브 (Cysharp) |
| unity | `unity-unirx` | Reactive | UniRx 레거시 리액티브 |
| unity | `unity-vcontainer` | Architecture | VContainer DI |
| unity | `unity-mobile` | Platform | 모바일 최적화 |
| unity | `unity-networking` | Multiplayer | 네트워크/멀티플레이어 |
| unity | `unity-performance` | Optimization | 성능 최적화 |
| unity | `unity-ui` | UI | UI Toolkit, UGUI |
| codex | `codex-cli` | Integration | Codex CLI 기본 명령어 |
| codex | `codex-claude-loop` | Orchestration | Claude-Codex Dual-AI 워크플로우 |
| gemini | `gemini-cli` | Integration | Gemini CLI 기본 명령어 |
| gemini | `gemini-claude-loop` | Orchestration | Claude-Gemini Dual-AI 워크플로우 |
| ai-orch | `ai-orchestration-feedback-loop` | Orchestration | Triple/Dual AI 종합 검증 루프 |
| agent-team | `diverse-plan` | Orchestration | 다관점 Perspectives Team 계획 수립 |
| agent-team | `da-review` | Orchestration | Devil's Advocate Team 적대적 리뷰 |

---

## 폴더 구조

```
claude-code-plugins/
├── .claude-plugin/              # 저장소 메타데이터
├── README.md                    # 이 문서
├── CHANGELOG.md                 # 변경 이력
│
├── docs/                        # 프로젝트 문서
│   ├── architecture/            # 아키텍처 관련 문서
│   │   └── SKILL_SEPARATION_STRATEGY.md  # C# ↔ Unity 분리 전략
│   └── evaluation/              # 평가 관련 문서
│       ├── SKILL_EVALUATION_GUIDE.md     # SKILL 평가 가이드
│       └── status/              # 플러그인별 평가 상태
│           └── unity-plugin.md  # Unity Plugin 평가 상태
│
├── tools/                       # 개발 도구
│   ├── create_plugin.py         # 신규 플러그인 생성 스크립트
│   ├── TEST_SCRIPT.md           # 테스트 가이드
│   └── plugin-template/         # 플러그인 템플릿 (복사용)
│       ├── .claude-plugin/
│       │   └── plugin.json      # 플러그인 메타데이터
│       ├── agents/              # Subagent 정의
│       ├── command/             # 커스텀 슬래시 명령어
│       ├── hook/                # 라이프사이클 훅
│       ├── skills/              # Skills 정의 (핵심!)
│       └── README.md            # 템플릿 사용 가이드
│
├── csharp-plugin/               # C# 개발 플러그인
│   ├── .claude-plugin/
│   │   └── plugin.json
│   ├── agents/
│   │   └── csharp-pro.md        # C# 전문가 에이전트
│   ├── skills/
│   │   ├── csharp-async-patterns/  # async/await 스킬
│   │   │   ├── SKILL.md
│   │   │   └── references/
│   │   └── csharp-xml-docs/     # XML 문서화 스킬
│   │       ├── SKILL.md
│   │       └── references/
│   └── README.md
│
├── unity-plugin/                # Unity 게임 개발 플러그인
│   ├── .claude-plugin/
│   │   └── plugin.json
│   ├── agents/
│   │   ├── unity-developer.md   # 메인 Unity 에이전트
│   │   ├── unity-dots-developer.md  # DOTS 전문 에이전트
│   │   └── legacy/              # v1.0 레거시 에이전트
│   ├── skills/                  # 9개 전문 스킬
│   │   ├── unity-async/
│   │   ├── unity-unitask/
│   │   ├── unity-r3/
│   │   ├── unity-unirx/
│   │   ├── unity-vcontainer/
│   │   ├── unity-mobile/
│   │   ├── unity-networking/
│   │   ├── unity-performance/
│   │   └── unity-ui/
│   └── README.md
│
├── codex-plugin/                # Codex CLI 통합 플러그인
│   ├── .claude-plugin/
│   │   └── plugin.json
│   ├── skills/
│   │   ├── codex-cli/           # CLI 기본 스킬
│   │   │   ├── SKILL.md
│   │   │   └── references/
│   │   │       ├── commands.md
│   │   │       ├── options.md
│   │   │       └── examples.md
│   │   └── codex-claude-loop/   # Claude-Codex Dual-AI 스킬
│   │       └── SKILL.md
│   └── README.md
│
├── gemini-plugin/               # Gemini CLI 통합 플러그인
│   ├── .claude-plugin/
│   │   └── plugin.json
│   ├── skills/
│   │   ├── gemini-cli/          # CLI 기본 스킬
│   │   │   ├── SKILL.md
│   │   │   └── references/
│   │   │       ├── commands.md
│   │   │       ├── options.md
│   │   │       └── examples.md
│   │   └── gemini-claude-loop/  # Claude-Gemini Dual-AI 스킬
│   │       └── SKILL.md
│   └── README.md
│
├── ai-orchestration-plugin/     # Multi-AI 오케스트레이션 플러그인
│   ├── .claude-plugin/
│   │   └── plugin.json
│   ├── skills/
│   │   └── ai-orchestration-feedback-loop/  # Triple/Dual AI 통합 스킬
│   │       └── SKILL.md
│   └── README.md
│
├── agent-team-plugin/           # 에이전트 팀 기반 계획/리뷰 플러그인
│   ├── .claude-plugin/
│   │   └── plugin.json
│   ├── skills/
│   │   ├── diverse-plan/        # 다관점 계획 수립 스킬
│   │   │   └── SKILL.md
│   │   └── da-review/           # 적대적 팀 리뷰 스킬
│   │       └── SKILL.md
│   └── README.md
│
└── git-plugin/                  # Git 커밋 자동화 플러그인
    ├── .claude-plugin/
    │   └── plugin.json
    ├── command/
    │   └── git-commit.md        # /git-commit 명령어
    └── README.md
```

---

## Plugin 생성 방법

### 자동 생성 스크립트 사용 (권장)

`tools/create_plugin.py` 스크립트를 사용하면 대화형 CLI로 쉽게 플러그인을 생성할 수 있습니다.

#### 1. 스크립트 실행

```bash
python tools/create_plugin.py
```

#### 2. 대화형 입력

스크립트가 다음 정보를 요청합니다:

```
Plugin name (kebab-case, e.g., my-plugin): typescript-helper
Description: TypeScript development best practices and patterns
Author name: Your Name
Version [1.0.0]: (Enter로 기본값)
```

#### 3. 생성 확인

```
📋 Plugin Information Summary:
   Name: typescript-helper
   Description: TypeScript development best practices and patterns
   Author: Your Name
   Version: 1.0.0

Proceed with plugin creation? (y/n): y
```

#### 4. 완료

```
✅ Plugin Created Successfully!

Plugin Name: typescript-helper
Location: ./typescript-helper

📖 Next Steps:
   1. cd typescript-helper
   2. Add your custom agents, commands, hooks, or skills
   3. Update README.md with usage instructions
   4. Test your plugin with Claude Code
```

---

## Skills 아키텍처 이해하기

### Skills란?

**Skills**는 Claude Code에 **재사용 가능한 절차적 지식(procedural knowledge)**을 추가하는 모듈입니다.

#### Skills vs Agents/Subagents

| 측면 | Skills | Agents/Subagents |
|------|--------|------------------|
| **목적** | 재사용 가능한 절차적 지식 | 프로젝트별 복잡한 워크플로우 |
| **범위** | 도메인 전문성 (언어, 프레임워크) | 작업 전문화 (구현, 테스트, 리뷰) |
| **활성화** | 맥락 기반 자동 | 명시적 호출 |
| **재사용성** | 여러 프로젝트에서 공유 | 프로젝트 특화 |
| **내용** | How-to, 베스트 프랙티스 | 프로젝트 맥락, 워크플로우 |

**간단 정리:**
- **Skills**: "어떻게 하는가" (how-to) 지식 → 여러 곳에서 재사용
- **Agents/Subagents**: "무엇을 하는가" (워크플로우) → 프로젝트에 특화

---

### 3-Level Progressive Disclosure 아키텍처

Skills는 **필요한 시점에만 콘텐츠를 로드**하여 context window를 효율적으로 사용합니다.

#### Level 1: Metadata (항상 로드, ~100 tokens)

**YAML frontmatter**로 정의되며, Claude Code가 "어떤 Skills가 있는지" 인지합니다.

```yaml
---
name: csharp-core
description: C# 기본 언어, 코딩 컨벤션, .NET 프레임워크 기초
category: programming
language: csharp
---
```

**특징:**
- 시스템 프롬프트에 자동 포함
- Skill 발견(discovery)용 경량 등록
- ~100 tokens per skill

#### Level 2: Instructions (트리거시 로드, ~5,000 tokens)

**SKILL.md 파일의 본문 내용**으로, Skill이 호출될 때만 로드됩니다.

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

**특징:**
- 절차적 지식(procedural knowledge) 제공
- 워크플로우 및 베스트 프랙티스
- ~5,000 tokens 권장

#### Level 3: Resources (필요시만 로드, 무제한)

**resources/ 폴더**에 위치한 추가 자료로, 명시적으로 참조될 때만 로드됩니다.

```
skills/
└── csharp-core/
    ├── SKILL.md                 # Level 1-2
    └── resources/               # Level 3
        ├── REFERENCE.md         # 상세 API 레퍼런스
        ├── PATTERNS.md          # 디자인 패턴 모음
        ├── EXAMPLES.md          # 대량 코드 스니펫
        └── scripts/
            ├── analyze.ps1      # PowerShell (Windows)
            └── analyze.sh       # Bash (Unix/Linux/Mac)
```

**특징:**
- 로드되기 전까지 **0 tokens** 소비
- 크기 제한 없음
- 상세 레퍼런스, 스크립트, 템플릿 등

---

### Context 최적화 효과

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

**실전 예시:** Unity C# 테스트 코드 작성

```
설치된 Skills: 10개 (각 15K tokens)
- Level 1 로드: 1,000 tokens (모든 Skills 메타데이터)
- Level 2 로드: 5,000 tokens (csharp-testing skill만 활성화)
- Level 3 로드: 3,000 tokens (테스트 패턴 예시만 참조)
────────────────────────────────────────────────────────
실제 사용: 9,000 tokens
전체 로드시: 150,000 tokens
절약: 141,000 tokens (94% 절감)
```

---

### Skills 작성 가이드라인

#### Level 1 (Metadata) 작성

- ✅ **간결한 description** (1-2문장, ~100 tokens)
- ✅ **명확한 Skill 용도** 설명
- ❌ 절차, 예시, 상세 설명 포함 금지

**Good:**
```yaml
description: C# 기본 언어, 코딩 컨벤션, .NET 프레임워크 기초
```

**Bad:**
```yaml
description: |
  이 Skill은 C# 프로그래밍 언어의 모든 것을 다룹니다.
  네이밍 컨벤션부터 시작해서 PascalCase, camelCase 규칙,
  async/await 패턴, LINQ 쿼리...
  (100 tokens 초과)
```

#### Level 2 (Instructions) 작성

- ✅ **핵심 워크플로우**와 베스트 프랙티스
- ✅ **Level 3 리소스로의 링크** 제공
- ❌ 대용량 예시나 중복 설명 포함 금지

**Good:**
```markdown
## async/await 패턴
1. I/O 작업에는 항상 async 메서드 사용
2. Task 반환 타입 선택
3. ConfigureAwait(false) 고려

자세한 예시는 [PATTERNS.md](resources/PATTERNS.md) 참조
```

#### Level 3 (Resources) 작성

- ✅ **상세 레퍼런스**, 대량 예시, 스크립트
- ✅ **논리적 카테고리별** 파일 분리
- ✅ **크기 제한 없음** (사용 안 하면 0 tokens)

---

### Skills 예시

**언어/프레임워크:**
- `csharp-async-patterns` - C# async/await 패턴
- `csharp-xml-docs` - C# XML 문서화 표준
- `unity-async` - Unity 비동기 프로그래밍 패턴
- `unity-r3` - R3 리액티브 패턴 (Cysharp)

**개발 프랙티스:**
- `unity-performance` - Unity 성능 최적화
- `unity-mobile` - 모바일 플랫폼 최적화
- `codex-claude-loop` - Dual-AI 협업 오케스트레이션

---

## Plugin 개발 가이드

### 1. Plugin 구조

각 Plugin은 다음 구성 요소를 포함할 수 있습니다:

#### `.claude-plugin/plugin.json`
플러그인 메타데이터 정의

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

#### `agents/`
특정 작업을 수행하는 지능형 에이전트 정의

```yaml
---
name: implementation-agent
description: C# 코드 구현 전담 Agent
skills: csharp-core, csharp-unity  # Skills 활용
model: sonnet
---

# Implementation Agent

실제 C# 코드 작성 및 구현을 담당합니다.
```

#### `command/`
커스텀 슬래시 명령어 구현

- `/analyze-performance` - 성능 분석 자동화
- `/deploy-production` - 프로덕션 배포 프로세스
- `/generate-docs` - 문서 자동 생성

#### `hook/`
라이프사이클 이벤트 훅 정의

- `pre-write` - 파일 쓰기 전 실행
- `post-write` - 파일 쓰기 후 실행
- `pre-commit` - Git 커밋 전 실행

#### `skills/`
재사용 가능한 절차적 지식 모듈 (상세 내용은 위 섹션 참조)

### 2. 개발 워크플로우

```bash
# 1. 신규 Plugin 생성
python tools/create_plugin.py

# 2. Plugin 디렉토리로 이동
cd your-plugin-name

# 3. Skills, Agents 등 추가
# skills/ 폴더에 SKILL.md 작성
# agents/ 폴더에 agent.md 작성

# 4. README 작성
# 플러그인 사용법, 설치 방법 등 문서화

# 5. 테스트
# Claude Code에서 실제 사용해보기

# 6. Git 커밋
git add .
git commit -m "Add new plugin: your-plugin-name"
```

### 3. 베스트 프랙티스

#### 명명 규칙
- **Plugin 이름**: kebab-case (예: `typescript-helper`)
- **Skill 이름**: `domain-subdomain` 형식 (예: `csharp-async-patterns`, `unity-r3`)
- **Agent 이름**: `role-function` 형식 (예: `csharp-pro`, `unity-developer`)

#### 책임 분리
- ✅ **Skills**: 범용 how-to 지식
- ✅ **Agents**: 프로젝트 특화 워크플로우
- ✅ **명시적 선언**: Agent에서 사용할 Skills 명시

#### 문서화
각 구성 요소에 다음 포함:
- **목적**: 무엇을 위한 것인가?
- **범위**: 어디까지 담당하는가?
- **사용 예시**: 언제 활성화되는가?
- **제외 사항**: 무엇은 담당하지 않는가?

---

## 기여 방법

### 1. 이슈 등록

문제 발견 시:
- 버그 리포트
- 기능 제안
- 개선 아이디어

### 2. Pull Request

새로운 플러그인 추가:
1. Fork 저장소
2. 신규 플러그인 개발
3. 테스트 및 문서화
4. Pull Request 생성

### 3. 플러그인 공유

유용한 플러그인 개발 시:
- 커뮤니티와 공유
- 사용법 명확히 문서화
- 예시 코드 제공

---

## 라이선스

플러그인 배포 시 적절한 라이선스를 선택하고 명시하세요.

---

## 참고 자료

### 공식 문서
- [Claude Code 공식 문서](https://code.claude.com/docs)
- [Claude Code - Subagents](https://code.claude.com/docs/en/sub-agents)
- [Claude Agent Skills Overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)

### 커뮤니티 리소스
- [Understanding Claude Code's Full Stack](https://alexop.dev/posts/understanding-claude-code-full-stack/)
- [Claude Agent Skills: A First Principles Deep Dive](https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/)

---

**Happy Plugin Development!** 🚀
