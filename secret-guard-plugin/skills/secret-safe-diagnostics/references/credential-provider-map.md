# Credential Provider Map

Per-provider reference. For each major credential issuer, we list:

- **Verify state** — commands that confirm "am I authenticated / configured?" without revealing secrets.
- **Leaks** — commands that print the raw credential. Do not run these under Claude Code (the `pre-block.js` hook will deny many of them anyway).
- **Rotation** — how to rotate if you just leaked one.

Load this file only when the current task is provider-specific.

---

## GitHub (gh / GitHub API)

### Verify state
```bash
gh auth status                       # which host, which user, scopes, protocol
gh api user --jq '.login'            # confirm the token resolves to the expected user
gh config list                       # editor / protocol, no secrets
```

### Leaks (do not run)
```bash
gh auth token                        # prints the PAT
cat ~/.config/gh/hosts.yml           # contains oauth_token
gh api user --include -H "Authorization: token $(gh auth token)" -v  # verbose echoes header
```

### Fingerprint without leaking
```bash
gh auth token | tr -d '\r\n' | sha256sum | cut -c1-8
```

### Rotation
- Classic PAT: GitHub → Settings → Developer settings → Personal access tokens (classic) → Delete. Re-issue.
- Fine-grained PAT: Settings → Developer settings → Personal access tokens → Fine-grained → Revoke.
- gh OAuth: `gh auth refresh` replaces the token in place.
- After rotation, `gh auth status` should show the new scopes and expiry.

---

## AWS

### Verify state
```bash
aws sts get-caller-identity          # account, user ARN, user id — no secrets
aws configure list                   # profile / region / key *source* (env / file / sso), not values
```

### Leaks (do not run)
```bash
aws configure get default.aws_secret_access_key
aws configure get default.aws_session_token
cat ~/.aws/credentials
env | grep AWS_
```

### Rotation
- Access keys: `aws iam create-access-key` → update callers → `aws iam delete-access-key --access-key-id AKIAOLD`.
- Session tokens (STS): expire on their own; revoke with `aws sts … ` only for a specific role via trust policy change.
- SSO: `aws sso logout`; re-login via `aws sso login`.

---

## Google Cloud (gcloud)

### Verify state
```bash
gcloud auth list                     # active account, configured accounts
gcloud config list                   # project, region, zone — no tokens
gcloud config configurations list
```

### Leaks (do not run)
```bash
gcloud auth print-access-token       # prints the current OAuth access token
gcloud auth print-identity-token     # prints a signed identity token (also a credential)
cat ~/.config/gcloud/credentials.db  # SQLite; contains tokens
```

### Handoff without echoing
```bash
# access-token is consumed in-process by curl; shell never sees it:
curl -sSf -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  https://storage.googleapis.com/storage/v1/b?project=$PROJECT
```
Fine when run once at a command prompt; still avoid inside `set -x` blocks, log-captured scripts, or CI with verbose tracing.

### Rotation
- User credentials: `gcloud auth revoke <account>` then `gcloud auth login`.
- Service account key: `gcloud iam service-accounts keys delete KEY_ID --iam-account=SA` then `gcloud iam service-accounts keys create new.json --iam-account=SA`.

---

## Azure

### Verify state
```bash
az account show                      # active subscription / tenant — no tokens
az account list --output table
```

### Leaks (do not run)
```bash
az account get-access-token          # returns JWT
cat ~/.azure/accessTokens.json       # persisted tokens
cat ~/.azure/azureProfile.json       # tenant config; usually safe but check
```

### Rotation
- User: `az logout` then `az login`.
- Service principal secret: Azure Portal → App registrations → Certificates & secrets → delete old, add new.

---

## OpenAI

### Verify state
```bash
[[ -n "$OPENAI_API_KEY" ]] && echo "OPENAI_API_KEY present" || echo "missing"
openai --version                     # CLI version, no key echo
# sanity call without exposing the key on the CLI:
openai api models.list | head -5     # errors clearly if the key is invalid
```

### Leaks (do not run)
```bash
echo $OPENAI_API_KEY
env | grep OPENAI
```

### Rotation
- platform.openai.com → API keys → Revoke → Create new secret key.
- Usage/rate-limits may take a few minutes to migrate to the new key.

---

## Anthropic

### Verify state
```bash
[[ -n "$ANTHROPIC_API_KEY" ]] && echo "ANTHROPIC_API_KEY present" || echo "missing"
# sanity call (uses the key from env; does not print it):
anthropic messages create --model claude-haiku-4-5 --max-tokens 1 --prompt 'ping' >/dev/null \
  && echo "auth ok" || echo "auth FAILED"
```

### Leaks (do not run)
```bash
echo $ANTHROPIC_API_KEY
```

### Rotation
- console.anthropic.com → API Keys → Revoke → Create new key.

---

## Slack

### Verify state
```bash
# auth.test confirms the token is valid and returns team/user info — no token echo
curl -sSf -H "Authorization: Bearer $SLACK_BOT_TOKEN" https://slack.com/api/auth.test | jq '.ok, .team, .user'
```

### Leaks (do not run)
```bash
echo $SLACK_BOT_TOKEN
echo $SLACK_APP_TOKEN
cat ~/.config/slack/*                # varies by installer
```

### Rotation
- api.slack.com → Your Apps → OAuth & Permissions → Reinstall / rotate.
- For legacy `xoxp-` user tokens: revoke in Slack account settings.

---

## Stripe

### Verify state
```bash
stripe config --list                  # profile names only, not values
stripe customers list --limit 1       # will 401 fast if the key is bad
```

### Leaks (do not run)
```bash
echo $STRIPE_SECRET_KEY
cat ~/.config/stripe/config.toml
stripe login --api-key sk_live_...    # echoes the key back on confirmation
```

### Rotation
- dashboard.stripe.com → Developers → API keys → Roll key.
- For live-mode keys, rolling is an immediate security control — the old key stops working.

---

## Database Connection Strings

Database URLs (`postgresql://user:password@host/db`, `mysql://...`, `mongodb+srv://...`) carry the password in the URL itself — they leak via `ps aux`, shell history, CI logs, and error messages that echo the URL back.

### Verify state
```bash
[[ -n "$DATABASE_URL" ]] && echo "DATABASE_URL present" || echo "missing"
# host reachability, no secrets:
python -c 'import os,urllib.parse as u; p=u.urlparse(os.environ["DATABASE_URL"]); print(p.hostname, p.port, p.path)'
```

### Leaks (do not run)
```bash
echo $DATABASE_URL
env | grep DATABASE
psql "$DATABASE_URL" -c 'select 1'    # fine if DATABASE_URL is not echoed elsewhere, but many wrappers do echo on error
```

### Safer invocation
```bash
# split into parts so the password is in an env var only the client reads:
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c 'select 1'
```

### Rotation
- Provider-specific (RDS, Cloud SQL, self-hosted): roll the user's password in the DB, update the URL in the secret store, deploy.
