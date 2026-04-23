# Anti-Patterns: Commands That Leak Credentials

Each entry shows a command, the channel through which the secret leaks, and why the leak is durable. Use this to recognize bad diagnostics in PR review, in pasted snippets, or in your own muscle memory.

## Table of contents

1. Direct echo of an env var
2. "Preview" / truncated print
3. CLI commands that print tokens by design
4. Unfiltered environment dumps
5. Dotenv / credential file reads
6. Verbose network clients
7. Shell tracing
8. Error-path leaks
9. Log capture without filtering
10. Child-process arg leaks

---

## 1. Direct echo of an env var

### Bash
```bash
echo $GH_TOKEN
printf '%s\n' "$AWS_SECRET_ACCESS_KEY"
echo "TOKEN=$OPENAI_API_KEY"
```
### PowerShell
```powershell
Write-Output $env:GH_TOKEN
"TOKEN=$env:ANTHROPIC_API_KEY"
$env:AZURE_CLIENT_SECRET
```

**Why it leaks:** The full value lands in stdout → terminal scrollback, CI artifact logs, and (when run under Claude Code) the conversation context. Also in `~/.bash_history` / PSReadLine history.

**Reliable fix:** presence check (`[[ -n "$X" ]] && echo "present"`). Never print the value itself.

---

## 2. "Preview" / truncated print

### Bash
```bash
echo "${GH_TOKEN:0:8}..."            # prints first 8 bytes
echo "$GH_TOKEN" | head -c 20        # prints first 20 bytes
echo "${GH_TOKEN:0:4}...${GH_TOKEN: -4}"   # first-4 + last-4
```

**Why it leaks:** Structured tokens have identifiable prefixes (`gho_`, `ghp_`, `AKIA`, `sk_live_`, `xoxb-`, `AIza`). The prefix alone narrows brute-force search space and often identifies the issuer/account type. Combined with a tail fragment, many tokens are trivially re-linkable to their owner via search.

**Reliable fix:** SHA-256 prefix is a cryptographic fingerprint without exposing the token:
```bash
printf '%s' "$GH_TOKEN" | sha256sum | cut -c1-8
```

---

## 3. CLI commands that print tokens by design

```bash
gh auth token
gcloud auth print-access-token
gcloud auth print-identity-token
az account get-access-token
aws configure get default.aws_secret_access_key
stripe login --api-key  # echoes the key back on success
```

**Why it leaks:** These commands' purpose is to emit the token. Anything downstream that captures stdout captures the token.

**Reliable fix:** Use the *status* command instead (`gh auth status`, `aws sts get-caller-identity`, `az account show`, `gcloud auth list`). When you genuinely need to hand the token to another process, pipe directly in-process and never touch it in the shell:
```bash
# token enters curl's process, not the shell
gh api -H "Authorization: token $(gh auth token)" user >/dev/null
# even better — let the CLI do the handoff:
gh api user
```

---

## 4. Unfiltered environment dumps

### Bash
```bash
env
printenv
set | less
```
### PowerShell
```powershell
Get-ChildItem env:
gci env:
dir env:
```

**Why it leaks:** These print every env var, which almost always includes one or more of `GH_TOKEN`, `OPENAI_API_KEY`, `AWS_SESSION_TOKEN`, `DATABASE_URL`, etc.

**Reliable fix:** Filter credential-named vars out before printing:
```bash
env | grep -viE '(TOKEN|SECRET|KEY|PASSWORD|PAT|AUTH|CREDENTIAL)'
```
```powershell
Get-ChildItem env: | Where-Object { $_.Name -notmatch 'TOKEN|SECRET|KEY|PASSWORD|PAT|AUTH|CREDENTIAL' }
```

---

## 5. Dotenv / credential file reads

```bash
cat .env
cat ~/.aws/credentials
cat ~/.config/gh/hosts.yml
Get-Content .env
```

**Why it leaks:** These files are plaintext by design. Whatever captures stdout captures every secret.

**Reliable fix:** Presence-only checks:
```bash
[[ -f .env ]] && echo present
grep -c '^GH_TOKEN=' .env          # key exists? (prints 0 or 1)
wc -l < .env                       # line count only
```

If you need to diff two dotenvs without showing values, compare sorted key lists:
```bash
comm -3 <(grep -oE '^[A-Z_]+=' a.env | sort) <(grep -oE '^[A-Z_]+=' b.env | sort)
```

---

## 6. Verbose network clients

```bash
curl -v    -H "Authorization: Bearer $TOKEN" https://api.example.com
curl --trace-ascii - -H "Authorization: Bearer $TOKEN" ...
http --verbose --auth-type=bearer --auth="$TOKEN" GET https://...
```

**Why it leaks:** `-v` / `--trace` logs request headers to stderr. The `Authorization:` header is printed verbatim.

**Reliable fix:** Debug connectivity and auth separately.
- Test reachability without auth: `curl -I https://api.example.com`
- Verify auth header *shape* with a throwaway token.
- If you truly need the verbose trace with a real token, redact:
  ```bash
  curl -v -H "Authorization: Bearer $TOKEN" https://... 2>&1 \
    | sed -E 's/(Authorization:[[:space:]]*Bearer[[:space:]]+)[^[:space:]]+/\1[REDACTED]/I'
  ```

---

## 7. Shell tracing

### Bash
```bash
set -x
gh api user -H "Authorization: token $GH_TOKEN"
# prints: + gh api user -H 'Authorization: token gho_actual_value'
```
### PowerShell
```powershell
Set-PSDebug -Trace 2
# or
$VerbosePreference = 'Continue'
```

**Why it leaks:** Trace mode expands variables before execution and writes the expanded form to stderr. Any variable containing a secret is now printed on every command that references it.

**Reliable fix:** Turn tracing off before touching a credential-bearing command:
```bash
set +x
gh api user
set -x    # only if you need it after
```

---

## 8. Error-path leaks

```bash
if ! curl -fsS -H "Authorization: Bearer $TOKEN" https://api.example.com; then
  echo "request failed with token=$TOKEN"     # don't
fi
```

**Why it leaks:** Developers often add "helpful" debug output on the error path, forgetting the error path is exactly where operators will read the log.

**Reliable fix:** On error, log the *context* (request URL, status code, response body), not the credential. If you need to distinguish between "wrong token" and "network error", log the token *fingerprint* (SHA-256 prefix), not the value.

---

## 9. Log capture without filtering

```bash
some-cli --debug > debug.log 2>&1
Invoke-RestMethod ... -Verbose 4>&1 | Out-File debug.log
```

**Why it leaks:** Verbose logging from cloud CLIs and HTTP clients frequently includes request headers or query strings carrying tokens. Once in `debug.log`, the secret has an indefinite lifetime.

**Reliable fix:** Pipe through a redaction filter before writing to disk — see "Capturing Logs and Debug Output Safely" in SKILL.md.

---

## 10. Child-process arg leaks

```bash
curl https://api.example.com?token=$TOKEN
psql "postgresql://user:$DB_PASSWORD@host/db"
mysql --password=$DB_PASSWORD   # also warns, but still leaks
```

**Why it leaks:** The command line of every running process is visible to any user on the system via `ps aux` (Linux/macOS) or `Get-Process` (PowerShell with `-IncludeUserName`). On shared CI runners this is a real exposure.

**Reliable fix:**
- Prefer env vars over argv for secrets: `PGPASSWORD="$DB_PASSWORD" psql "postgresql://user@host/db"`.
- Prefer stdin over argv: `mysql --defaults-extra-file=<(printf '[client]\npassword=%s\n' "$DB_PASSWORD")`.
- For HTTP tokens, use headers, not query strings — request URIs get logged by proxies and CDNs.
