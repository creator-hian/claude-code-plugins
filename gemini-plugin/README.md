# Gemini Plugin

Google Gemini CLI integration and dual-AI orchestration patterns for Claude Code.

## Overview

이 플러그인은 Google Gemini CLI와 Claude Code 간의 통합 및 협업 패턴을 제공합니다. 두 AI 시스템의 강점을 활용하여 코드 품질을 향상시키는 워크플로우를 구현합니다.

## Skills

### 1. gemini-cli (Foundation)

Gemini CLI 기본 사용법을 제공하는 foundation 스킬입니다.

**범위:**
- `gemini -p` 명령어 사용법 (non-interactive mode)
- 모델 선택 (`gemini-3-pro-preview`, `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.5-flash-lite`)
- Output format (`json`, `stream-json`)
- 디렉토리 관리 (`--include-directories`)
- 세션 관리 (`/chat save`, `/chat resume`)

**사용 시점:**
- Gemini CLI 명령어 실행 시
- 단독 코드 리뷰/분석 시
- 다른 오케스트레이션 스킬의 기반으로

### 2. gemini-claude-loop (Orchestration) [Planned]

Claude Code와 Gemini 간의 dual-AI 협업 루프를 오케스트레이션합니다.

**의존성:** `requires: gemini-cli`

**범위:**
- 6-Phase 워크플로우 (Plan → Validate → Feedback → Execute → Review → Iterate)
- Claude-Gemini 역할 분담 패턴
- 피드백 루프 관리
- 품질 게이트 및 종료 조건

**사용 시점:**
- 복잡한 기능 개발
- 높은 품질이 중요한 코드
- 보안/성능이 critical한 작업
- 대규모 리팩토링

## Architecture

```
gemini-plugin/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   ├── gemini-cli/                  # Level 1: CLI Foundation
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── commands.md          # 명령어 레퍼런스
│   │       ├── options.md           # 옵션 상세
│   │       └── examples.md          # 사용 예시
│   │
│   └── gemini-claude-loop/          # Level 2: Orchestration [Planned]
│       ├── SKILL.md                 # requires: gemini-cli
│       └── references/
│           └── (워크플로우 문서)
│
└── README.md
```

## Skill Dependency

```
gemini-cli (Foundation)
    ↑
    └── gemini-claude-loop (requires: gemini-cli) [Planned]
```

향후 확장 시:
```
gemini-cli
    ↑
    ├── gemini-claude-loop
    ├── gemini-security-audit (가정)
    └── gemini-performance-review (가정)
```

## Quick Start

### Gemini CLI 단독 사용

```bash
# Interactive mode (터미널)
gemini

# Non-interactive mode (Claude Code/CI)
gemini -p "Review this code for bugs"

# With JSON output
gemini -p "Analyze architecture" --output-format json

# With specific model
gemini -m gemini-2.5-pro -p "Deep security analysis"
```

### Claude Code에서 사용

```bash
# Non-interactive mode 필수
gemini -p "Review this implementation for:
- Logic errors
- Performance issues
- Security vulnerabilities"

# JSON output for parsing
gemini -p "Get code metrics" --output-format json
```

### Session Management

```bash
# Save session (interactive mode)
/chat save my-analysis

# Resume later
/chat resume my-analysis

# Export results
/chat share analysis-report.md
```

## 핵심 워크플로우

```
gemini -p "Prompt" → JSON Response → Parse & Process
```

**Claude Code Integration:**
- Claude: 모든 코드 작성 및 수정
- Gemini: 코드 리뷰 및 분석

## 언제 사용하나?

✅ **사용 권장:**
- 복잡한 기능 개발 (여러 단계 필요)
- 높은 품질이 중요한 코드
- 보안/성능이 critical한 작업
- 대규모 리팩토링
- 다른 AI 관점의 리뷰 필요시

❌ **과한 경우:**
- 간단한 일회성 수정
- 프로토타입/실험 코드
- 개인 학습용 간단한 예제

## Codex Plugin과의 비교

| Feature | Codex Plugin | Gemini Plugin |
|---------|-------------|---------------|
| CLI 도구 | `codex exec` | `gemini -p` |
| 모델 | GPT-5 Codex | Gemini 3 Pro, 2.5 Pro/Flash/Flash-Lite |
| 세션 관리 | `resume [session_id]` | `/chat save/resume` |
| Output | Text | Text, JSON, Stream-JSON |
| Sandbox | read-only, workspace-write | restrictive mode |

## 참고 문서

- [gemini-cli SKILL.md](skills/gemini-cli/SKILL.md) - CLI 기본 사용법
- [Commands Reference](skills/gemini-cli/references/commands.md) - 전체 명령어
- [Options Reference](skills/gemini-cli/references/options.md) - 옵션 상세
- [Examples](skills/gemini-cli/references/examples.md) - 사용 예시

## Future Extensions

이 플러그인 아키텍처는 다른 AI CLI 통합을 위한 패턴을 제공합니다:

```
codex-plugin/          gemini-plugin/         future-plugin/
├── codex-cli          ├── gemini-cli         ├── xxx-cli
└── codex-claude-loop  └── gemini-claude-loop └── xxx-claude-loop
```

## License

(License TBD)
