# Codex CLI Examples

⚠️ **Note**: All examples use `codex exec` for non-interactive environments (Claude Code, CI, scripts).
For interactive terminal use, you can omit `exec`.

---

## Model + Reasoning Combinations

```bash
# Maximum depth: gpt-5.2-codex (best) + xhigh
codex exec -m gpt-5.2-codex -c model_reasoning_effort=xhigh -s read-only \
  "Exhaustive security audit"

# Balanced: gpt-5.2 + high
codex exec -m gpt-5.2 -c model_reasoning_effort=high -s read-only \
  "Deep API review"

# Fast: mini + low
codex exec -m gpt-5.1-codex-mini -c model_reasoning_effort=low -s read-only \
  "Quick syntax check"
```

---

## Code Review

```bash
# Basic review
codex exec -s read-only "Review for bugs: $(cat src/auth.js)"

# PR review
codex exec -s read-only "Review this diff:
$(git diff main..feature)

Check for breaking changes and missing tests"

# Architecture review
codex exec -s read-only --search "Evaluate this microservices architecture:
- API Gateway (Kong)
- Service mesh (Istio)
- Event-driven (Kafka)"
```

---

## Security Analysis

```bash
# Vulnerability scan
codex exec -m gpt-5.2-codex -c model_reasoning_effort=high -s read-only \
  "Security audit: $(cat src/auth/login.js)
   Check for: SQL injection, XSS, OWASP Top 10"

# Dependency audit
codex exec -s read-only --search "Review dependencies: $(cat package.json)
Check for vulnerabilities and outdated packages"
```

---

## Session Continuity

```bash
# Initial analysis
codex exec -s read-only "Analyze codebase structure"

# Continue session
codex exec resume "Focus on authentication module"

# Further refinement
codex exec resume "Provide prioritized recommendations"
```

---

## Image Analysis

```bash
# UI review
codex exec -i mockup.png -s read-only "Review for accessibility issues"

# Compare designs
codex exec -i before.png -i after.png -s read-only "What changed?"

# Error screenshot
codex exec -i error.png -s read-only "What's causing this?"
```

---

## Multi-Directory

```bash
# Cross-project
codex exec -C ./main-app --add-dir ../shared-lib -s read-only \
  "Review integration and coupling"

# Frontend-Backend
codex exec -C ./backend --add-dir ./frontend -s read-only \
  "Analyze API contract mismatches"
```

---

## Non-Git Directory

For directories without Git (requires user approval):

```bash
# First check Git status
git rev-parse --git-dir 2>/dev/null || echo "Not a Git repo"

# If not Git, ask user then use skip flag
codex exec --skip-git-repo-check -s read-only "Analyze code"

# Combined with other options
codex exec --skip-git-repo-check -m gpt-5.2-codex -s read-only "Review code"
```

---

## Automation

### CI/CD Integration
```bash
#!/bin/bash
for file in $(git diff --cached --name-only); do
    review=$(codex exec -s read-only "Quick review: $(cat $file)")
    if echo "$review" | grep -qi "critical\|security"; then
        echo "Issues in $file"; exit 1
    fi
done
```

### Batch Analysis
```bash
for file in src/*.js; do
    codex exec -s read-only "Review: $(cat $file)" > "reviews/$(basename $file).md"
done
```

### Full Auto
```bash
codex exec --full-auto "Run tests and fix failures"
```

### Error Handling
```bash
codex exec -s read-only "Analyze" || echo "Failed: $?"
result=$(codex exec -s read-only "List issues as JSON") && echo "$result" | jq '.'
```

### Common Error Recovery
```bash
# Handle stdin error
if ! codex exec -s read-only "Review"; then
    echo "Error occurred, check if using codex exec"
fi

# Handle Git repo error
if ! codex exec -s read-only "Review"; then
    # Ask user first, then:
    codex exec --skip-git-repo-check -s read-only "Review"
fi
```
