#!/usr/bin/env node
// PostToolUse hook for Bash/PowerShell.
// Scans tool_response.{stdout,stderr} for known secret patterns.
// Cannot modify the output (Claude Code spec limitation), but injects an
// additionalContext warning so the assistant flags the leak and instructs
// the user to rotate the credential.

"use strict";

const { readFileSync } = require("fs");

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

// Pattern set tuned for very low false-positive rate on typical dev output.
// Each entry: { id, pattern, provider, action }
const PATTERNS = [
  {
    id: "github-token",
    pattern: /\bgh[oprsu]_[A-Za-z0-9]{36,}\b/g,
    provider: "GitHub PAT / OAuth token",
    action: "Revoke and rotate via `gh auth refresh` or GitHub Settings → Developer settings → Personal access tokens.",
  },
  {
    id: "github-fine-grained-pat",
    pattern: /\bgithub_pat_[A-Za-z0-9_]{70,}\b/g,
    provider: "GitHub fine-grained PAT",
    action: "Revoke in GitHub Settings → Developer settings → Personal access tokens (fine-grained).",
  },
  {
    id: "aws-access-key",
    pattern: /\bAKIA[0-9A-Z]{16}\b/g,
    provider: "AWS Access Key ID",
    action: "Disable/delete via IAM console or `aws iam delete-access-key`; rotate paired secret.",
  },
  {
    id: "gcp-api-key",
    pattern: /\bAIza[A-Za-z0-9_\-]{35}\b/g,
    provider: "Google API Key",
    action: "Regenerate in Google Cloud Console → APIs & Services → Credentials.",
  },
  {
    id: "slack-token",
    pattern: /\bxox[baprs]-[A-Za-z0-9\-]{10,}\b/g,
    provider: "Slack token",
    action: "Revoke in Slack admin → Apps; rotate the integration.",
  },
  {
    id: "jwt",
    pattern: /\beyJ[A-Za-z0-9_\-]{10,}\.eyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\b/g,
    provider: "JSON Web Token",
    action: "If this is a bearer auth token, invalidate the session / rotate the signing key; treat the JWT as compromised.",
  },
  {
    id: "stripe-live-key",
    pattern: /\bsk_live_[A-Za-z0-9]{24,}\b/g,
    provider: "Stripe live secret key",
    action: "Immediately roll the key in Stripe Dashboard → Developers → API keys.",
  },
  {
    id: "openai-key",
    pattern: /\bsk-[A-Za-z0-9]{48,}\b/g,
    provider: "OpenAI-style API key",
    action: "Revoke and regenerate in the provider's API keys page (OpenAI / compatible).",
  },
  {
    id: "anthropic-key",
    pattern: /\bsk-ant-[A-Za-z0-9_\-]{90,}\b/g,
    provider: "Anthropic API key",
    action: "Revoke and regenerate in console.anthropic.com → API Keys.",
  },
  {
    id: "bearer-header",
    pattern: /\b[Aa]uthorization:\s*[Bb]earer\s+[A-Za-z0-9._\-]{20,}/g,
    provider: "HTTP Bearer Authorization header",
    action: "Treat the bearer value as compromised; rotate the upstream credential.",
  },
  {
    id: "private-key-pem",
    pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g,
    provider: "PEM-encoded private key",
    action: "Destroy the exposed key material and regenerate the key pair.",
  },
];

function scan(text) {
  const hits = [];
  if (!text) return hits;
  for (const p of PATTERNS) {
    const matches = text.match(p.pattern);
    if (matches && matches.length > 0) {
      hits.push({ id: p.id, provider: p.provider, action: p.action, count: matches.length });
    }
  }
  return hits;
}

function dedupe(hits) {
  const byId = new Map();
  for (const h of hits) {
    if (byId.has(h.id)) {
      byId.get(h.id).count += h.count;
    } else {
      byId.set(h.id, { ...h });
    }
  }
  return Array.from(byId.values());
}

function formatWarning(hits) {
  const lines = [
    "⚠️ secret-guard: CREDENTIAL LEAK DETECTED in tool output.",
    "The raw value has already entered this conversation context and cannot be redacted after the fact.",
    "",
    "Detected:",
  ];
  for (const h of hits) {
    lines.push(`  - ${h.provider} (${h.id}) × ${h.count}`);
    lines.push(`      action: ${h.action}`);
  }
  lines.push("");
  lines.push(
    "Next steps for the assistant: (1) stop echoing this value in any future message; (2) instruct the user to rotate the credential above; (3) review the command that produced this output and replace it with a presence/length/hash check going forward (see secret-safe-diagnostics skill).",
  );
  return lines.join("\n");
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

  const resp = event.tool_response || {};
  const combined = [resp.stdout, resp.stderr, resp.output]
    .filter((s) => typeof s === "string")
    .join("\n");

  const hits = dedupe(scan(combined));
  if (hits.length === 0) process.exit(0);

  const out = {
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      additionalContext: formatWarning(hits),
    },
  };
  process.stdout.write(JSON.stringify(out));
  process.exit(0);
}

main();
