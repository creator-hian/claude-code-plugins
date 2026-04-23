---
name: secret-safe-diagnostics
description: Use whenever inspecting, verifying, debugging, or passing credentials — GitHub PATs, AWS keys, GCP/Azure tokens, OpenAI/Anthropic API keys, OAuth bearers, .env/.envrc files, or any $TOKEN/$SECRET/$KEY/$PAT/$PASSWORD env var. Provides safe presence/length/hash patterns for Bash and PowerShell so raw credential values never hit stdout. Apply this skill even when the user doesn't explicitly say "don't print it" — any task involving `gh auth`, `aws sts`, `gcloud auth`, `az login`, `.envrc` inspection, Authorization headers, or "check if my token is set / verify credentials / debug auth" should pull this skill before running any diagnostic command.
---

# Secret-Safe Diagnostics

Credentials that reach stdout reach the conversation context, the terminal scrollback, shell history, CI logs, and often a screenshot. Once leaked, they must be rotated — there is no un-leak. This skill is the preventative layer of `secret-guard-plugin`. Two sibling hooks (`pre-block.js`, `post-detect.js`) are safety nets; the reliable defense is to write commands that never emit the value in the first place.

## The Golden Rule

**The raw credential value must never appear in stdout, stderr, a log file, a command argument list, or an error message.** Every diagnostic you write should answer the question *without* quoting the secret.

Three questions cover almost everything a developer actually needs to know during debugging:

| Question | What to print | Why it's safe |
|----------|---------------|---------------|
| "Is it set?" | `present` / `missing` | One bit of information. |
| "Is it the length I expect?" | The integer length. | Length leaks almost nothing about the secret. |
| "Is this the same secret I saw yesterday?" | An 8-character SHA-256 prefix. | Cryptographic hash is one-way; a short prefix is not reversible. |

If you find yourself wanting to print more than these three things, stop and reconsider the intent.

## Three Safe Idioms

Write these reflexively. They are short, cover the common cases, and compose well.

### Presence check

**Bash**
```bash
[[ -n "$GH_TOKEN" ]] && echo "present" || echo "missing"
```

**PowerShell**
```powershell
if ($env:GH_TOKEN) { "present" } else { "missing" }
```

### Length check

**Bash**
```bash
echo "len=${#GH_TOKEN}"
```

**PowerShell**
```powershell
"len=$($env:GH_TOKEN.Length)"
```

Length is useful to distinguish, e.g., a legacy `ghp_` PAT (40 chars) from a fine-grained `github_pat_` PAT (93+ chars), or to spot a truncated paste.

### Hash fingerprint (identity check without disclosure)

**Bash**
```bash
printf '%s' "$GH_TOKEN" | sha256sum | cut -c1-8
```

**PowerShell**
```powershell
$sha=[System.Security.Cryptography.SHA256]::Create()
$bytes=[Text.Encoding]::UTF8.GetBytes($env:GH_TOKEN)
([BitConverter]::ToString($sha.ComputeHash($bytes)) -replace '-','').Substring(0,8).ToLower()
```

Use this when you need to confirm two environments (CI vs local, new shell vs old shell) share the same secret, or to trace which rotation the running process picked up.

**Do not** print `${T:0:4}***${T: -4}` style "redacted" previews. Disclosing even 8 leading/trailing characters of a PAT shrinks the brute-force surface area and, for some formats, identifies the user/org that issued it. If you need a fingerprint, hash it.

## Provider-Specific Alternatives

For each provider there is a *state-verification* command that is safe and a *value-retrieval* command that is not. Always prefer the state-verification form unless you genuinely need the raw token to hand off to another process in the same command (and even then, do it without echoing — see [references/safe-patterns.md](references/safe-patterns.md#hand-off-without-echo)).

| Provider | Safe (run this) | Leaks (avoid) |
|----------|-----------------|---------------|
| GitHub (gh) | `gh auth status` | `gh auth token`, `gh api user --include-header` with verbose |
| AWS | `aws sts get-caller-identity` | `aws configure get … secret_access_key`, `cat ~/.aws/credentials` |
| Google Cloud | `gcloud auth list`, `gcloud config list` | `gcloud auth print-access-token`, `gcloud auth print-identity-token` |
| Azure | `az account show` | `az account get-access-token` (returns JWT), `cat ~/.azure/accessTokens.json` |
| OpenAI | `openai --version`; test call with a throwaway prompt | `echo $OPENAI_API_KEY`, `env \| grep OPENAI` |
| Anthropic | `anthropic --version`; call with a throwaway prompt | `echo $ANTHROPIC_API_KEY` |
| Slack | A targeted `chat.postMessage` test call | `echo $SLACK_TOKEN`, printing full bot config |
| Stripe | `stripe config --list` (names only, no secret values) | `echo $STRIPE_SECRET_KEY`, `cat ~/.stripe/config.toml` |

See [references/credential-provider-map.md](references/credential-provider-map.md) for the complete per-provider matrix.

## Coordination with the Pre-Block Hook

`secret-guard-plugin/hooks/pre-block.js` denies specific Bash/PowerShell patterns at tool-call time. When you see a deny message of the form `[secret-guard:<id>] …`, do not retry a minor variation — use the correct safe rewrite below.

| Hook rule id | What was blocked | Safe rewrite |
|--------------|------------------|--------------|
| `echo-token-env` | `echo $GH_TOKEN`, `Write-Output $env:API_KEY`, etc. | Use the presence / length / hash idioms above. |
| `gh-auth-token-bare` | `gh auth token` with no pipe-to-filter and no redirect | `gh auth status` to verify; `gh auth token \| tr -d '\n' \| sha256sum \| cut -c1-8` to fingerprint; `gh auth token > secure.tmp` if you must hand the value to a file never read back. |
| `aws-credentials-dump` | `aws configure get … secret_access_key`, `cat ~/.aws/credentials` | `aws sts get-caller-identity` to verify identity; rely on the AWS SDK's env/instance/role resolution rather than copying the key around. |
| `env-dump-wide` | Unfiltered `env`, `printenv`, `Get-ChildItem env:` | `env \| grep -viE '(TOKEN\|SECRET\|KEY\|PASSWORD\|PAT\|AUTH\|CREDENTIAL)'` or in PowerShell `Get-ChildItem env: \| Where-Object { $_.Name -notmatch 'TOKEN\|SECRET\|KEY\|PASSWORD\|PAT\|AUTH\|CREDENTIAL' }`. |
| `cat-dotenv` | `cat .env`, `Get-Content .env`, etc. | Existence: `[[ -f .env ]] && echo present`. Key presence without value: `grep -c '^GH_TOKEN=' .env`. |
| `curl-verbose-auth` | `curl -v` combined with an `Authorization:` header | Drop `-v`; if you need to see the wire, use a throwaway token in a scratch account, never the real one. Or separate the concerns: debug connectivity without auth, then add auth without `-v`. |

The hook's deny reason always includes a `SUGGESTION:` line — read it; it mirrors the rewrite above.

## Capturing Logs and Debug Output Safely

Diagnostic output from cloud CLIs, HTTP clients, or build tools can contain tokens in headers, query strings, or error bodies. Before writing any such stream to a file, filter credential-shaped lines out.

**Bash**
```bash
some-command --debug 2>&1 \
  | grep -viE '(TOKEN|SECRET|KEY|PASSWORD|PAT|AUTH|CREDENTIAL|BEARER|AUTHORIZATION)' \
  > debug.log
```

**PowerShell**
```powershell
some-command --debug 2>&1 |
  Where-Object { $_ -notmatch '(?i)(TOKEN|SECRET|KEY|PASSWORD|PAT|AUTH|CREDENTIAL|BEARER|AUTHORIZATION)' } |
  Set-Content debug.log
```

This is a backstop, not a substitute for not enabling verbose modes with real credentials in scope.

## Common Pitfalls

- **"Short preview" fallacy.** `${T:0:4}...${T: -4}`, `head -c 20`, `cut -c1-12` — all leak the first N bytes of a live token. GitHub PATs, Stripe live keys, and Slack bot tokens all have identifiable prefixes that narrow the space; the tail often encodes a checksum. Hash instead.
- **Error messages that quote the token.** Some clients log the full Authorization header on failure. If you must run an auth-failing request for debugging, swap in a throwaway credential first.
- **CI `set -x` / PowerShell `$DebugPreference = 'Continue'`.** Tracing expands variables before execution; any line that mentions `$TOKEN` now prints the value. Unset tracing around credential-bearing commands.
- **Screen-share / pair programming.** The hook cannot see the screen. If you're live-sharing, the rules above apply even more strictly.
- **Git hooks and `.bash_history`.** A one-off `echo $TOKEN` in your terminal also lands in `~/.bash_history` / `~/.local/share/PowerShell/PSReadLine/ConsoleHost_history.txt`. Presence/length/hash idioms are safe here too.

## References

For depth, consult the bundled reference files — load only the one relevant to the current task to keep context cheap.

- [references/anti-patterns.md](references/anti-patterns.md) — catalog of commands that leak and why.
- [references/safe-patterns.md](references/safe-patterns.md) — bash and PowerShell recipes organized by developer intent.
- [references/credential-provider-map.md](references/credential-provider-map.md) — full safe-vs-leaks matrix across the major cloud, API, and SaaS providers.
