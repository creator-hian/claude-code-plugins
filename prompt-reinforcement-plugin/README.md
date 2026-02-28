# Prompt Reinforcement Plugin for Claude Code

사용자 프롬프트를 system context로 재전달하여 지시 준수율을 높이는 Hook 플러그인.

## Overview

Claude Code는 긴 대화나 복잡한 작업 중 사용자의 원래 지시를 희석하거나 무시할 수 있다. 이 플러그인은 `UserPromptSubmit` hook을 통해 사용자 입력을 `<system-reminder>` 태그로 재주입하여, Claude가 사용자 지시에 더 높은 주의를 기울이도록 한다.

## How It Works

```
사용자 입력 "A"
  ├─ [1] User message: "A"                          (원본)
  └─ [2] <system-reminder>                           (hook 주입)
         [IMPORTANT - Re-read carefully] A
         </system-reminder>
```

동일한 프롬프트가 두 채널로 전달된다:
1. **User message** — 원본 사용자 입력
2. **System reminder** — hook이 `additionalContext`로 재주입한 복제본

Claude Code 시스템 프롬프트는 hook 출력을 사용자 발화로 취급하라고 지시하므로, 사실상 사용자 지시가 강화(reinforced)된다.

## Plugin Structure

```
prompt-reinforcement-plugin/
├── .claude-plugin/
│   └── plugin.json         # 메타데이터
└── hooks/
    ├── hooks.json           # Hook 정의
    └── reinforce-prompt.js  # 프롬프트 재전달 스크립트
```

## Hook Details

| 항목 | 값 |
|------|-----|
| Event | `UserPromptSubmit` |
| Trigger | 매 사용자 입력 시 |
| Input | stdin으로 전달되는 hook event JSON (`event.prompt`) |
| Output | `hookSpecificOutput.additionalContext`로 프롬프트 재전달 |
| Runtime | Node.js |

## Limitations

- `additionalContext`는 항상 `<system-reminder>` 태그로 래핑되어 system context 레벨로 전달된다. User message 레벨로의 동일 권한 재전달은 Claude Code hook API의 구조적 제약으로 불가능하다.
- 매 입력마다 hook이 실행되므로, 프롬프트 길이에 비례하여 컨텍스트 윈도우 사용량이 증가한다.

## Installation

1. 이 플러그인을 Claude Code plugins 폴더에 복사
2. Claude Code를 재시작하거나 플러그인을 리로드
3. 별도 설정 없이 자동 동작

## Version History

| Version | Changes |
|---------|---------|
| 1.0.0 | `UserPromptSubmit` hook을 통한 프롬프트 강화 |

## Author

**Creator Hian**
