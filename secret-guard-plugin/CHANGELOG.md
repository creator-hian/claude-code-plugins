# Changelog

All notable changes to the secret-guard-plugin project.

## [1.0.0] - 2026-04-23

### Added
- **Initial release** — 3-layer defense for Bash/PowerShell credential safety. Motivated by a real incident in which a diagnostic command (`gh auth token ... | head -c 20`) echoed the first 20 bytes of a live GitHub PAT into the assistant's conversation context during a direnv debugging session.

- **Pre-block hook** (`hooks/pre-block.js`, PreToolUse on `Bash|PowerShell`): deny rules for 6 high-risk patterns, each emitting a `SUGGESTION:` line so the model can rewrite to a safe idiom instead of retrying the same pattern.
  - `echo-token-env` — `echo`/`printf`/`Write-Output`/`Write-Host` of any `$*TOKEN/SECRET/KEY/PAT/PASSWORD/AUTH/CREDENTIAL*` env var
  - `gh-auth-token-bare` — `gh auth token` with no pipe-to-filter and no redirect-to-file
  - `aws-credentials-dump` — `aws configure get …secret_access_key`, `cat/type/Get-Content ~/.aws/credentials`
  - `env-dump-wide` — unfiltered `env` / `printenv` / `Get-ChildItem env:`
  - `cat-dotenv` — `cat` / `Get-Content` family applied to `.env`
  - `curl-verbose-auth` — `curl -v` combined with an `Authorization:` header
  - Safe-guarded patterns (pipe to `sha256sum`/`wc -c`/`base64 -d`, redirect to `/dev/null`, presence test `-n "$X"`) are allow-listed to avoid blocking legitimate diagnostics.

- **Post-detect hook** (`hooks/post-detect.js`, PostToolUse on `Bash|PowerShell`): regex-scans `tool_response.{stdout,stderr,output}` for 11 credential shapes and injects an `additionalContext` warning naming the provider and the rotation action.
  - Covered: GitHub classic/OAuth (`gh[oprsu]_`), GitHub fine-grained PAT (`github_pat_`), AWS Access Key ID (`AKIA…`), Google API Key (`AIza…`), Slack (`xox[baprs]-`), JWT, Stripe live keys, OpenAI-style keys (`sk-`), Anthropic keys (`sk-ant-`), HTTP Bearer headers, PEM private-key blocks.
  - Cannot modify raw output (Claude Code hook API does not permit tool-result rewriting); prevention is the responsibility of the pre-block hook and the skill.

- **Skill** `secret-safe-diagnostics` (`skills/secret-safe-diagnostics/`): teaches Claude to reach for presence/length/hash patterns before writing any diagnostic command that touches a credential.
  - L1 description written with deliberate "pushy" recall bias — the skill should err toward firing on credential-adjacent queries rather than missing them, given that the cost of a leaked token dwarfs the cost of one surplus skill consult.
  - L2 body covers: golden rule (value never hits stdout), three safe idioms in bash + PowerShell, provider-specific safe alternatives (GitHub, AWS, GCP, Azure, OpenAI, Anthropic, Slack, Stripe), explicit mapping from each pre-block rule id to the correct safe rewrite, log-capture redaction, and common pitfalls (truncated previews, error-path leaks, `set -x`, shell history, screen-share exposure).
  - L3 references:
    - `references/anti-patterns.md` — 10 leak categories with bash + pwsh examples and the channel through which each leaks.
    - `references/safe-patterns.md` — 10 recipes indexed by developer intent (verify presence, length, fingerprint for identity comparison, diff two environments, check a key in dotenv, hand off to a child process without echo, redacted log capture, health-check an API, compare CI secret to local, detect truncated/whitespace-polluted tokens).
    - `references/credential-provider-map.md` — per-provider matrix covering verify-state vs. leaks, rotation procedures, and safe-handoff patterns.

### Documentation
- `docs/trigger-opt-experiment-2026-04-23.md` — journal of a `claude -p`-based trigger-accuracy experiment against the skill and the resulting specification for a future self-contained `trigger_opt.py` (subscription-only replacement for skill-creator's Anthropic-SDK-based `improve_description.py`). Records the harness limitation that prevented meaningful mutation in this run and the `PYTHONUTF8=1` requirement on Windows + Korean locale.
- `docs/trigger-eval-2026-04-23.json` — 20-query seed eval set (10 should-trigger + 10 should-not-trigger), reusable for future re-runs.
