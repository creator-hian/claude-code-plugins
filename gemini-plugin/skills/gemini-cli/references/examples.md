# Gemini CLI Examples

## Headless Mode (Claude Code/CI)

### Basic Patterns

```bash
# Direct prompt
gemini -p "Explain the architecture of this codebase"

# Stdin input
echo "Explain this code" | gemini

# File input with prompt
cat README.md | gemini -p "Summarize this documentation"

# JSON output for parsing
gemini -p "Analyze code" --output-format json

# Stream JSON for real-time
gemini -p "Run tests" --output-format stream-json
```

### Code Review

```bash
# Security review
cat src/auth.py | gemini -p "Review for security issues" > review.txt

# With JSON output
result=$(cat src/auth.py | gemini -p "Security audit" --output-format json)
echo "$result" | jq -r '.response'
```

### Generate Commit Messages

```bash
result=$(git diff --cached | gemini -p "Write conventional commit message" --output-format json)
message=$(echo "$result" | jq -r '.response')
git commit -m "$message"
```

### API Documentation

```bash
result=$(cat api/routes.js | gemini -p "Generate OpenAPI spec" --output-format json)
echo "$result" | jq -r '.response' > openapi.json
```

### Batch Processing

```bash
mkdir -p reports
for file in src/*.py; do
    echo "Analyzing $file..."
    result=$(cat "$file" | gemini -p "Find bugs" --output-format json)
    echo "$result" | jq -r '.response' > "reports/$(basename "$file").md"
done
```

### Log Analysis

```bash
grep "ERROR" /var/log/app.log | tail -20 | gemini -p "Analyze and suggest fixes" > errors.txt
```

### Release Notes

```bash
result=$(git log --oneline v1.0.0..HEAD | gemini -p "Generate release notes" --output-format json)
echo "$result" | jq -r '.response' >> CHANGELOG.md
```

## CI/CD Integration

### Pre-Commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

STAGED=$(git diff --cached --name-only)
result=$(gemini -m gemini-2.5-flash -p "Quick review:
Files: $STAGED
Diff: $(git diff --cached)" --output-format json)

if echo "$result" | jq -e '.error' > /dev/null 2>&1; then
    echo "Review failed"
    exit 1
fi

response=$(echo "$result" | jq -r '.response')
if echo "$response" | grep -qi "critical\|blocker"; then
    echo "Critical issues found:"
    echo "$response"
    exit 1
fi

echo "Pre-commit review passed"
```

### PR Review Script

```bash
#!/bin/bash
# ci-review.sh

RESULT=$(gemini -p "Review changes:
$(git diff HEAD~1)" --output-format json)

if echo "$RESULT" | jq -e '.error' > /dev/null 2>&1; then
    echo "Error: $(echo "$RESULT" | jq -r '.error.message')"
    exit 1
fi

REVIEW=$(echo "$RESULT" | jq -r '.response')
echo "$REVIEW" > review-result.md

if echo "$REVIEW" | grep -qi "critical\|security"; then
    echo "Critical issues found!"
    cat review-result.md
    exit 1
fi

echo "Review passed"
```

## Usage Tracking

```bash
result=$(gemini -p "Analyze schema" --include-directories db --output-format json)

tokens=$(echo "$result" | jq -r '.stats.models // {} | to_entries | map(.value.tokens.total) | add // 0')
models=$(echo "$result" | jq -r '.stats.models // {} | keys | join(", ")')
tools=$(echo "$result" | jq -r '.stats.tools.totalCalls // 0')

echo "$(date): $tokens tokens, $tools tool calls, models: $models" >> usage.log
```

## Stream JSON Processing

### Real-Time Monitoring

```bash
gemini -p "Run tests and fix failures" --output-format stream-json | while read -r line; do
    event=$(echo "$line" | jq -r '.type')
    case $event in
        "tool_use")
            tool=$(echo "$line" | jq -r '.tool_name')
            echo "Starting: $tool"
            ;;
        "tool_result")
            status=$(echo "$line" | jq -r '.status')
            echo "Completed: $status"
            ;;
        "error")
            msg=$(echo "$line" | jq -r '.message')
            echo "Error: $msg"
            ;;
    esac
done
```

### Event Filtering

```bash
# Tool usage only
gemini -p "List files" --output-format stream-json | jq -r 'select(.type == "tool_use")'

# Messages only
gemini -p "Explain" --output-format stream-json | jq -r 'select(.type == "message")'

# Final result
gemini -p "Query" --output-format stream-json | jq -r 'select(.type == "result")'
```

## Error Handling

```bash
#!/bin/bash
result=$(gemini -p "Analyze code" --output-format json 2>&1)

# Check command failure
if [ $? -ne 0 ]; then
    echo "Command failed"
    exit 1
fi

# Check API errors
if echo "$result" | jq -e '.error' > /dev/null 2>&1; then
    error_type=$(echo "$result" | jq -r '.error.type')
    error_msg=$(echo "$result" | jq -r '.error.message')
    echo "API Error [$error_type]: $error_msg"
    exit 1
fi

# Success
echo "$result" | jq -r '.response'
```

## Cross-Directory Analysis

```bash
# Full stack review
gemini --include-directories ./backend,./frontend,./shared \
  -p "Analyze integration points"

# With specific model
gemini -m gemini-2.5-pro --include-directories ../repo1,../repo2 \
  -p "Compare architectures"
```

## Session Management (Interactive)

```bash
# In interactive mode:

# Save session
/chat save my-analysis

# Resume later
/chat resume my-analysis

# Export results
/chat share analysis.md
/chat share analysis.json
```

## Model Selection

```bash
# Complex analysis
gemini -m gemini-2.5-pro -p "Deep security audit"

# Quick checks
gemini -m gemini-2.5-flash -p "Check syntax"

# Batch processing
gemini -m gemini-2.5-flash-lite -p "Simple check"

# Cutting edge
gemini -m gemini-3-pro-preview -p "Complex architecture analysis"
```
