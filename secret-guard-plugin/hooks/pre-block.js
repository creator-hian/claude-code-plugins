#!/usr/bin/env node
// PreToolUse hook for Bash/PowerShell.
// Denies commands that are highly likely to echo a credential value to stdout.
// Emits permissionDecision=deny + a reason the model can read and adapt from.

"use strict";

const { readFileSync } = require("fs");

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

// Each rule: { id, pattern, reason, suggest }
// Patterns intentionally conservative — we want *very* high precision to avoid
// false positives that break legitimate work. Allow-listed when the command
// includes an obvious safe-guard (| sha256sum, | wc -c, > file, presence test).
const SAFE_GUARDS = /\|\s*(sha256sum|sha1sum|md5sum|wc(\s+-c)?|base64\s+-d|grep\s+-c|head\s+-c\s+0|tr\s+-d\s+['"][^'"]*['"]\s*\|\s*wc)|>\s*\/dev\/null|-n\s+["']?\$/;

const RULES = [
  {
    id: "echo-token-env",
    // echo/printf/Write-Output of *TOKEN|*SECRET|*KEY|*PAT|*PASSWORD|*AUTH env vars
    pattern:
      /\b(echo|printf|Write-Output|Write-Host)\b[^|>\n]*\$(\{[^}]*\}|\w*|env:\w*)*(TOKEN|SECRET|PASSWORD|PAT|APIKEY|API_KEY|AUTH|CREDENTIAL)\w*/i,
    reason:
      "Echoing a credential-like env var to stdout leaks the value into the conversation context.",
    suggest:
      'Use a presence/length/hash check instead, e.g. `[[ -n "$GH_TOKEN" ]] && echo "present"`, `echo "len=${#GH_TOKEN}"`, or `printf "%s" "$GH_TOKEN" | sha256sum | cut -c1-8`.',
  },
  {
    id: "gh-auth-token-bare",
    // `gh auth token` with no pipe-through-filter and no redirect-to-file
    pattern: /\bgh\s+auth\s+token\b(?![^\n]*(?:\||>\s*\S))/i,
    reason:
      "`gh auth token` prints the raw PAT to stdout, which then enters the conversation context.",
    suggest:
      'Prefer `gh auth status` (never prints the token). If you must verify the token, pipe it into a hash: `gh auth token | tr -d "\\n" | sha256sum | cut -c1-8`, or write it straight to a file never read back: `gh auth token > secure.tmp`.',
  },
  {
    id: "aws-credentials-dump",
    pattern:
      /\b(aws\s+configure\s+get\s+\S*(secret_access_key|session_token)|(cat|type|Get-Content|gc)\s+[^\n|>]*\.aws[\/\\]credentials)\b/i,
    reason:
      "This prints the AWS secret access key / session token to stdout.",
    suggest:
      "Use `aws sts get-caller-identity` to verify identity without touching the secret, or reference the value inside a single command (`aws s3 ls`) without echoing it.",
  },
  {
    id: "env-dump-wide",
    // `env`, `printenv`, `Get-ChildItem env:` with no filter — likely leaks secrets
    pattern:
      /^\s*(env|printenv|Get-ChildItem\s+env:|gci\s+env:|dir\s+env:)\s*(\|\s*(?!grep\s+-v|Select-String\s+-NotMatch|findstr\s+\/v))?\s*$/im,
    reason:
      "Unfiltered environment dump commonly includes TOKEN/KEY/SECRET env vars.",
    suggest:
      'Filter out credentials before dumping: `env | grep -viE "(TOKEN|SECRET|KEY|PASSWORD|PAT|AUTH|CREDENTIAL)"` or on PowerShell `Get-ChildItem env: | Where-Object { $_.Name -notmatch "TOKEN|SECRET|KEY|PASSWORD|PAT|AUTH|CREDENTIAL" }`.',
  },
  {
    id: "cat-dotenv",
    pattern: /\b(cat|type|Get-Content|gc)\s+[^\n]*\.env(\.[a-z]+)?\b/i,
    reason: "Dotenv files typically contain plaintext secrets.",
    suggest:
      "Check presence only: `[[ -f .env ]] && echo present`. To validate a specific key without printing its value: `grep -c '^GH_TOKEN=' .env`.",
  },
  {
    id: "curl-verbose-auth",
    pattern:
      /\bcurl\b[^\n]*(-v\b|--verbose\b|--trace)[^\n]*-H\s+["'][Aa]uthorization:/,
    reason:
      "`curl -v` with an Authorization header prints the raw header (and therefore the token) to stderr.",
    suggest:
      'Drop `-v`, or redact the header from output: `curl --silent -H "Authorization: Bearer $TOKEN" ... | head -c 200`. Never combine `-v` with `Authorization:` unless the token is a throwaway.',
  },
];

function evaluate(command) {
  if (!command || typeof command !== "string") return null;
  if (SAFE_GUARDS.test(command)) return null;

  for (const rule of RULES) {
    if (rule.pattern.test(command)) {
      return rule;
    }
  }
  return null;
}

function emitDeny(rule) {
  const out = {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: `[secret-guard:${rule.id}] ${rule.reason}\n\nSUGGESTION: ${rule.suggest}`,
    },
  };
  process.stdout.write(JSON.stringify(out));
  process.exit(0);
}

function main() {
  const raw = readStdin();
  if (!raw) process.exit(0);

  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    process.exit(0);
  }

  const toolName = event.tool_name || "";
  if (toolName !== "Bash" && toolName !== "PowerShell") process.exit(0);

  const command = (event.tool_input && event.tool_input.command) || "";
  const hit = evaluate(command);
  if (hit) emitDeny(hit);

  process.exit(0);
}

main();
