# secret-guard-plugin

Prevent credential/token leaks in Claude Code's Bash and PowerShell workflows.

## Why

Tool output flows straight into the conversation context. Once a PAT, API key, or bearer token ends up there, it is durably exposed — and Claude Code's hook API does **not** allow modifying tool output after the fact. The only reliable defense is to **keep the value out of stdout in the first place**.

Representative incident (2026-04-23, Windows / direnv debugging):

```
gh auth token --user creator-hian 2>&1 | head -c 20
→ token_preview="gho_zitN3EHXutEhg27
```

Twenty characters of a live PAT ended up in the assistant's context because a diagnostic command printed the raw value. That specific event is what motivated this plugin.

## Three-layer defense

| Layer | Event | Role |
|-------|-------|------|
| **A. Pre-block** | `PreToolUse` on `Bash` / `PowerShell` | Deny commands that are high-likelihood leaks (`echo $TOKEN`, bare `gh auth token`, `cat .env`, unfiltered `env`/`printenv`, etc.). Claude sees the deny reason and rewrites to a safe pattern. |
| **B. Post-detect** | `PostToolUse` on `Bash` / `PowerShell` | Regex-scan tool output for known secret patterns (GitHub PAT, AWS AKIA, JWT, Stripe live, etc.). Inject a warning via `additionalContext` directing the assistant to stop echoing the value and to instruct the user to rotate. Cannot redact the already-leaked value (spec limit). |
| **C. Skill** | `secret-safe-diagnostics` | Teach Claude to write presence / length / hash checks instead of value prints. Loaded on demand when the task involves credentials. |

None of the three layers is sufficient alone. A is aggressive but has false-negatives (novel patterns). B is retrospective and can't un-leak. C is preventative but relies on Claude discovering and applying the skill.

## Files

```
secret-guard-plugin/
├── .claude-plugin/plugin.json
├── hooks/
│   ├── hooks.json            # PreToolUse + PostToolUse on Bash|PowerShell
│   ├── pre-block.js          # Layer A
│   └── post-detect.js        # Layer B
└── skills/
    └── secret-safe-diagnostics/   # Layer C
        ├── SKILL.md
        └── references/
```

## Installation

1. Add this directory to your Claude Code plugins folder (or register via a marketplace).
2. Restart Claude Code or reload plugins.
3. No configuration required — the hooks are matcher-scoped to `Bash|PowerShell` and are inert otherwise.

## Pre-block rules (Layer A)

Each rule has an id so denial reasons are grep-able across transcripts.

| id | Blocks |
|----|--------|
| `echo-token-env` | `echo`/`printf`/`Write-Output`/`Write-Host` of any `$*(TOKEN|SECRET|KEY|PAT|PASSWORD|AUTH|CREDENTIAL)*` env var |
| `gh-auth-token-bare` | `gh auth token` with no pipe-to-filter and no redirect-to-file |
| `aws-credentials-dump` | `aws configure get ...secret_access_key`, `cat ~/.aws/credentials` |
| `env-dump-wide` | Unfiltered `env` / `printenv` / `Get-ChildItem env:` |
| `cat-dotenv` | `cat .env` / `Get-Content .env` family |
| `curl-verbose-auth` | `curl -v` combined with an `Authorization:` header |

The rule engine short-circuits when a command already contains a safe-guard (pipe into `sha256sum`/`wc -c`/`base64 -d`, redirect to `/dev/null`, presence test `-n "$X"`), so legitimate diagnostics are not blocked.

## Post-detect patterns (Layer B)

| id | Pattern (shape) |
|----|-----------------|
| `github-token` | `gho_` / `ghp_` / `ghs_` / `ghu_` / `ghr_` + 36+ chars |
| `github-fine-grained-pat` | `github_pat_` + 70+ chars |
| `aws-access-key` | `AKIA` + 16 uppercase/digit |
| `gcp-api-key` | `AIza` + 35 chars |
| `slack-token` | `xox[baprs]-` + ≥10 chars |
| `jwt` | `eyJ….eyJ….…` 3-segment base64url |
| `stripe-live-key` | `sk_live_` + 24+ chars |
| `openai-key` | `sk-` + 48+ chars |
| `anthropic-key` | `sk-ant-` + 90+ chars |
| `bearer-header` | `Authorization: Bearer <token>` |
| `private-key-pem` | `-----BEGIN … PRIVATE KEY-----` |

On match, the hook emits an `additionalContext` warning naming the provider and the recommended rotation action. The raw value is not altered (spec does not permit it).

## Testing

```bash
# A PreToolUse block (expect deny with reason)
echo '{"tool_name":"Bash","tool_input":{"command":"gh auth token"}}' \
  | node hooks/pre-block.js

# A PreToolUse non-block (safe-guarded)
echo '{"tool_name":"Bash","tool_input":{"command":"gh auth token | sha256sum | cut -c1-8"}}' \
  | node hooks/pre-block.js

# A PostToolUse detection (expect additionalContext warning)
echo '{"tool_name":"Bash","tool_input":{"command":"..."},"tool_response":{"stdout":"token=gho_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"}}' \
  | node hooks/post-detect.js
```

## Limitations

- Regex-based detection has residual false negatives (e.g., truncated tokens, novel provider formats). Keep the skill active to catch what patterns miss.
- PostToolUse cannot redact the leaked value — the warning is retrospective. Prevention (Layer A + C) is where the real defense lives.
- The plugin does not persist or report leak events externally. If you need audit trails, wire `post-detect.js` to append to a log file; rotate that log carefully because it contains the leaked values.

## Version History

| Version | Changes |
|---------|---------|
| 1.0.0   | Initial release — 3-layer defense (PreToolUse block rules, PostToolUse leak detection, secret-safe-diagnostics skill). |

## Author

**Creator Hian**
