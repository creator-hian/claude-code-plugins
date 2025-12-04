# AI Orchestration Plugin

Multi-AI orchestration patterns for Claude Code - combining multiple AI systems for comprehensive validation and review.

## Overview

이 플러그인은 여러 AI 시스템을 조합하여 복잡한 작업에 대한 다각적 검증 및 리뷰 패턴을 제공합니다. 현재 Claude, Codex, Gemini를 지원하며, 향후 다른 AI CLI도 확장 가능합니다.

## Skills

### 1. ai-orchestration-feedback-loop (Multi-AI Orchestration)

다양한 AI를 조합한 Multi-AI 엔지니어링 루프입니다. AI 참여자를 유연하게 구성할 수 있습니다.

**의존성:**
- `gemini-plugin:gemini-cli`
- `codex-plugin:codex-cli`

**범위:**
- 7-Phase 워크플로우 (Plan → Validate → Review → Synthesize → Implement → Review → Iterate)
- 유연한 AI 역할 분담 (사용자 선택 가능)
- 합의 및 갈등 해결 프로세스
- 품질 게이트 및 반복 조건

**현재 지원 AI:**
| AI | Role | Strengths |
|----|------|-----------|
| **Claude** | Architecture, planning, implementation | File operations, context awareness, execution |
| **Codex** | Deep validation, security analysis | Reasoning depth, systematic analysis |
| **Gemini** | Creative review, alternative perspectives | Broad context, creative solutions |

**사용 시점:**
- Mission-critical 기능 개발
- 복잡한 아키텍처 결정
- 보안 민감 코드
- 멀티 도메인 통합

## Architecture

```
ai-orchestration-plugin/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   └── ai-orchestration-feedback-loop/
│       ├── SKILL.md
│       ├── VALIDATION.md
│       └── references/
│           ├── workflow-patterns.md
│           ├── prompt-templates.md
│           └── synthesis-guide.md
└── README.md
```

## Skill Dependencies

```
codex-plugin                    gemini-plugin
├── codex-cli                   ├── gemini-cli
└── codex-claude-loop           └── gemini-claude-loop
         ↘                    ↙
           ai-orchestration-plugin
           └── ai-orchestration-feedback-loop
               (requires: codex-cli, gemini-cli)
```

## When to Use

### Multi-AI vs Dual-AI 선택 기준

| Scenario | Recommended |
|----------|-------------|
| Simple feature, low risk | Dual-AI (Codex-Claude OR Gemini-Claude) |
| Complex feature, medium risk | Dual-AI with senior reviewer |
| **Mission-critical, high risk** | **Multi-AI Loop** |
| **Architectural decisions** | **Multi-AI Loop** |
| **Security-sensitive code** | **Multi-AI Loop** |
| **Multi-domain integration** | **Multi-AI Loop** |

## Workflow Overview

### Orchestration Modes (사용자 선택 가능)

| Mode | Workflow | Use Case |
|------|----------|----------|
| **Multi-AI (Default)** | Claude → AI-1 → AI-2 → Claude → Dual Review | Mission-critical, 최대 커버리지 |
| **Dual-AI: Codex-Claude** | Claude → Codex → Claude → Codex Review | 보안/로직 중심, 빠른 실행 |
| **Dual-AI: Gemini-Claude** | Claude → Gemini → Claude → Gemini Review | UX/창의성 중심, 빠른 실행 |

### Validation Order (Multi-AI에서 선택 가능)

| Order | First Validator | Second Validator | Use Case |
|-------|-----------------|------------------|----------|
| **Codex-First (Default)** | Codex (체계적) | Gemini (창의적) | 보안 민감 작업 |
| **Gemini-First** | Gemini (창의적) | Codex (체계적) | 혁신/UX 중심 작업 |

### Default Flow (Multi-AI, Codex-First)
```
Plan (Claude) → Validate (Codex) → Review (Gemini) → Synthesize → Implement (Claude) → Dual Review → Fix → Done
```

### Phase Summary

1. **Phase 0: Pre-flight** - 환경 체크, **오케스트레이션 모드 선택**, 사용자 설정
2. **Phase 1: Planning** - Claude가 상세 계획 작성
3. **Phase 2: First Validation** - 선택된 첫 번째 AI가 검증
4. **Phase 3: Second Validation** - 두 번째 AI가 보완 검증 (Multi-AI만)
5. **Phase 4: Synthesis** - Claude가 AI 피드백 종합
6. **Phase 5: Implementation** - Claude가 구현
7. **Phase 6: Code Review** - 모드에 따라 Single 또는 Dual Review
8. **Phase 7: Iteration** - 필요시 반복

## Quick Start

```bash
# Activate skill
skill: "ai-orchestration-feedback-loop"

# Or invoke from ai-orchestration-plugin
skill: "ai-orchestration-plugin:ai-orchestration-feedback-loop"
```

## Workflow Patterns

플러그인은 다양한 워크플로우 패턴을 지원합니다:

1. **Standard Full Loop** - 기본 전체 루프
2. **Security-First Loop** - 보안 중심 루프
3. **Architecture Decision Loop** - 아키텍처 결정 루프
4. **Rapid Iteration Loop** - 빠른 반복 루프
5. **Consensus-Required Loop** - 합의 필수 루프
6. **Expert Rotation Loop** - 전문가 순환 루프
7. **Staged Rollout Loop** - 단계적 배포 루프

상세 내용: [references/workflow-patterns.md](skills/ai-orchestration-feedback-loop/references/workflow-patterns.md)

## Related Plugins

| Plugin | Focus | Use Case |
|--------|-------|----------|
| codex-plugin | Codex ↔ Claude | 깊은 검증, 보안 분석 |
| gemini-plugin | Gemini ↔ Claude | 창의적 리뷰, 대안 탐색 |
| **ai-orchestration-plugin** | **Multiple AIs** | **미션 크리티컬 작업** |

## Documentation

- [SKILL.md](skills/ai-orchestration-feedback-loop/SKILL.md) - 전체 스킬 문서
- [VALIDATION.md](skills/ai-orchestration-feedback-loop/VALIDATION.md) - 검증 기준 및 테스트
- [workflow-patterns.md](skills/ai-orchestration-feedback-loop/references/workflow-patterns.md) - 워크플로우 패턴
- [prompt-templates.md](skills/ai-orchestration-feedback-loop/references/prompt-templates.md) - 프롬프트 템플릿
- [synthesis-guide.md](skills/ai-orchestration-feedback-loop/references/synthesis-guide.md) - 종합 가이드

## Future Extensions

이 플러그인은 추가 AI 및 오케스트레이션 패턴을 위한 기반을 제공합니다:

```
ai-orchestration-plugin/
├── ai-orchestration-feedback-loop  # Current (Codex + Gemini)
├── parallel-validation              # Future: 병렬 검증
├── expert-panel                     # Future: 전문가 패널
└── consensus-driven                 # Future: 합의 기반

# Future AI Support
├── anthropic-cli                    # Future: Anthropic CLI
├── openai-cli                       # Future: OpenAI CLI
└── mistral-cli                      # Future: Mistral CLI
```

## License

(License TBD)
