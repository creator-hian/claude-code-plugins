# Safe Patterns: Bash and PowerShell Recipes by Intent

Organized by what you are actually trying to find out. Pick the intent that matches the question you are asking, not the syntax you remember.

## Table of contents

1. Verify presence
2. Verify length (shape match)
3. Fingerprint for identity comparison
4. Diff two environments without revealing either
5. Check that a key exists in a dotenv file
6. Hand off a token to a child process without echoing
7. Write debug logs with credential-line redaction
8. Health-check an API endpoint without leaking auth
9. Compare a CI secret against a local secret
10. Detect truncated or whitespace-polluted tokens

---

## 1. Verify presence

### Bash
```bash
[[ -n "$GH_TOKEN" ]] && echo present || echo missing
```
### PowerShell
```powershell
if ($env:GH_TOKEN) { 'present' } else { 'missing' }
```

Use this as the default diagnostic. If `present`, move on. If `missing`, the user needs to set the variable — no value inspection needed.

---

## 2. Verify length (shape match)

### Bash
```bash
echo "len=${#GH_TOKEN}"
```
### PowerShell
```powershell
"len=$($env:GH_TOKEN.Length)"
```

Expected lengths (useful when debugging a paste that might be truncated or prefixed with a stray space):

| Token kind | Typical length |
|------------|---------------:|
| `ghp_` / `gho_` / `ghs_` GitHub PAT | 40 |
| `github_pat_` fine-grained | 93 |
| `AKIA…` AWS Access Key ID | 20 |
| AWS secret access key | 40 |
| `AIza…` Google API Key | 39 |
| `xoxb-` Slack bot token | 50–60 (variable) |
| `sk_live_` / `sk_test_` Stripe | 32+ (variable) |
| Anthropic `sk-ant-` | 108 (at time of writing — may change) |

If the length is off by one or two, suspect an accidentally appended newline (`"$(… | tr -d '\n')"`).

---

## 3. Fingerprint for identity comparison

### Bash
```bash
printf '%s' "$GH_TOKEN" | sha256sum | cut -c1-8
# or portable:
printf '%s' "$GH_TOKEN" | shasum -a 256 | cut -c1-8
```

### PowerShell
```powershell
function Get-SecretFingerprint {
    param([string]$Value)
    $sha = [System.Security.Cryptography.SHA256]::Create()
    try {
        $bytes = [Text.Encoding]::UTF8.GetBytes($Value)
        $hash = $sha.ComputeHash($bytes)
        (($hash | ForEach-Object { $_.ToString('x2') }) -join '').Substring(0,8)
    } finally { $sha.Dispose() }
}
Get-SecretFingerprint $env:GH_TOKEN
```

Eight hex characters = 32 bits of fingerprint — enough to distinguish realistic numbers of rotated tokens in practice, nowhere near enough to reverse into the secret.

---

## 4. Diff two environments without revealing either

Goal: confirm that two shells / machines / containers share the same credential.

### Bash
```bash
# in env A
printf '%s' "$GH_TOKEN" | sha256sum | cut -c1-8
# in env B
printf '%s' "$GH_TOKEN" | sha256sum | cut -c1-8
# same fingerprint → same token. Different → rotation or misconfig.
```

### PowerShell
```powershell
Get-SecretFingerprint $env:GH_TOKEN    # in each shell — compare the 8-char outputs
```

Never copy-paste the tokens themselves to compare visually; fingerprints are safer and faster.

---

## 5. Check that a key exists in a dotenv file

```bash
[[ -f .env ]] && echo "file=present" || echo "file=missing"
grep -c '^GH_TOKEN=' .env              # 0 or 1
awk -F= '/^[A-Z_]+=/{print $1}' .env   # key names only, no values
```

To compare which keys are defined between two `.env` files without revealing values:

```bash
comm -3 \
  <(grep -oE '^[A-Z_]+=' a.env | sort -u) \
  <(grep -oE '^[A-Z_]+=' b.env | sort -u)
```

Left-only keys are in `a.env`, right-only are in `b.env`. Values are never touched.

---

## 6. Hand off a token to a child process without echoing

The goal: a downstream command gets the token, but the shell never prints it.

### Bash — env var handoff (preferred)
```bash
GH_TOKEN="$GH_TOKEN" gh api user
```
The token is already in the env; this is a no-op but makes intent explicit.

### Bash — stdin handoff (when the tool supports it)
```bash
printf '%s' "$GH_TOKEN" | mycli --token-from-stdin
```

### Bash — process-substitution handoff for tools that insist on a file
```bash
mycli --token-file <(printf '%s' "$GH_TOKEN")
```

### Bash — command substitution *inside* an in-process invocation
```bash
# ok: the token is an argument to curl, not printed
curl -sf -H "Authorization: Bearer $(gh auth token)" https://api.github.com/user
# but be aware this is still visible in `ps aux` for the curl lifetime.
# Prefer the env-var form for long-running processes.
```

### PowerShell
```powershell
# env var already propagates — just call the child:
gh api user

# or pipe into a child that reads stdin:
$env:GH_TOKEN | & mycli --token-from-stdin
```

---

## 7. Write debug logs with credential-line redaction

### Bash
```bash
some-cli --debug 2>&1 \
  | grep -viE '(TOKEN|SECRET|KEY|PASSWORD|PAT|AUTH|CREDENTIAL|BEARER|AUTHORIZATION)' \
  > debug.log
```

### PowerShell
```powershell
some-cli --debug 2>&1 |
  Where-Object { $_ -notmatch '(?i)(TOKEN|SECRET|KEY|PASSWORD|PAT|AUTH|CREDENTIAL|BEARER|AUTHORIZATION)' } |
  Set-Content debug.log
```

If you need a line-preserving redact (keep the shape of the output, mask the value), use `sed`:
```bash
some-cli --debug 2>&1 \
  | sed -E 's/((TOKEN|SECRET|KEY|PASSWORD|PAT|AUTH|CREDENTIAL|BEARER|AUTHORIZATION)[^=:[:space:]]*[[:space:]]*[=:][[:space:]]*)[^[:space:]]+/\1[REDACTED]/Ig' \
  > debug.log
```

---

## 8. Health-check an API endpoint without leaking auth

```bash
# stage 1: connectivity (no auth, no secrets)
curl -sSfI https://api.example.com/v1/ping

# stage 2: auth shape (throwaway token; does not need to be valid)
curl -sS -H "Authorization: Bearer test" -o /dev/null -w "%{http_code}\n" https://api.example.com/v1/me

# stage 3: real auth (no -v, no tracing, short output)
curl -sSf -H "Authorization: Bearer $TOKEN" https://api.example.com/v1/me | jq '.id, .login'
```

Three separate invocations beat one `curl -v` with a live token.

---

## 9. Compare a CI secret against a local secret

When CI fails with "401 unauthorized" and local works, the most common cause is divergence between the CI-stored secret and the local one.

1. Locally: `printf '%s' "$GH_TOKEN" | sha256sum | cut -c1-8` → e.g. `a1b2c3d4`
2. In CI, add a step that prints the fingerprint only:
   ```yaml
   - name: Token fingerprint
     run: printf '%s' "$GH_TOKEN" | sha256sum | cut -c1-8
   ```
3. Compare the two 8-character fingerprints in the CI log.

Same fingerprint → secret is in sync; root-cause is elsewhere (scopes, URL, network). Different fingerprint → update the CI secret.

---

## 10. Detect truncated or whitespace-polluted tokens

A common subtle bug: `export GH_TOKEN=$(gh auth token)` captures a trailing newline; downstream calls then send `Bearer gho_xyz\n` and get a 401.

### Bash
```bash
echo "len=${#GH_TOKEN}  trailing_nl=$([[ "${GH_TOKEN: -1}" == $'\n' ]] && echo yes || echo no)"
```

### PowerShell
```powershell
$t = $env:GH_TOKEN
"len=$($t.Length) trailing_ws=$($t -match '\s$')"
```

If `trailing_nl=yes` or `trailing_ws=True`, the fix is to strip at capture time:
```bash
export GH_TOKEN="$(gh auth token | tr -d '\r\n')"
```
