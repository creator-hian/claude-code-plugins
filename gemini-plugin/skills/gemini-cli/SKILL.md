---
name: gemini-cli
description: Google Gemini CLI fundamentals for code analysis, review, and validation. Use when (1) executing gemini commands for code review/analysis, (2) configuring models (gemini-3-pro-preview/2.5-pro/flash/flash-lite), output formats (text/json/stream-json), or sandbox modes, (3) managing Gemini sessions with /chat save/resume, (4) integrating Gemini into automation scripts and CI/CD pipelines. Do NOT use for orchestration patterns (use gemini-claude-loop instead).
---

# Gemini CLI Skill

## ⚠️ Environment Notice

| Environment | Command Format |
|-------------|----------------|
| Interactive terminal | `gemini` (enters interactive mode) |
| **Claude Code / CI** | `gemini -p "prompt"` (headless mode) |
| **Scripting with JSON** | `gemini -p "prompt" --output-format json` |
| **Stdin input** | `echo "prompt" \| gemini` or `cat file \| gemini -p "analyze"` |

**Non-TTY environments** (Claude Code, CI pipelines) require `-p` flag or stdin input.

## Quick Start

### Headless Mode (Claude Code/CI)
```bash
# Basic review
gemini -p "Review this code for bugs"

# With JSON output for parsing
gemini -p "Analyze this code" --output-format json

# With specific model and directories
gemini -m gemini-2.5-pro --include-directories ./src,./lib -p "Deep analysis"

# Stdin input with prompt
cat src/auth.py | gemini -p "Review for security issues"
```

### JSON Output Parsing
```bash
result=$(gemini -p "Query" --output-format json)
response=$(echo "$result" | jq -r '.response')
```

## Reference Documentation

- **[Commands Reference](references/commands.md)** - Slash commands, @ commands, shell mode
- **[Options Reference](references/options.md)** - Models, output formats, directories, JSON schema
- **[Examples](references/examples.md)** - Code review, CI/CD integration, automation scripts

## Available Models

| Model | Description | Best For |
|-------|-------------|----------|
| `gemini-3-pro-preview` | Latest flagship preview | Most complex analysis, cutting-edge |
| `gemini-2.5-pro` | Most capable stable | Complex analysis, deep reasoning |
| `gemini-2.5-flash` | Fast and efficient | Quick reviews, batch operations |
| `gemini-2.5-flash-lite` | Lightweight, fastest | Simple checks, high-volume batch |

## Output Formats

| Format | Description | Use Case |
|--------|-------------|----------|
| (default) | Human-readable text | Terminal output |
| `json` | Structured with stats | Script parsing, automation |
| `stream-json` | JSONL events | Real-time monitoring |

### JSON Response Structure
```json
{
  "response": "string",
  "stats": { "models": {}, "tools": {}, "files": {} },
  "error": { "type": "string", "message": "string", "code": 0 }
}
```
> Full schema details: See [Options Reference](references/options.md)

## Key Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--prompt` | `-p` | Run in headless mode with prompt |
| `--model` | `-m` | Model selection |
| `--output-format` | | Output format (`json`, `stream-json`) |
| `--include-directories` | | Additional context directories (comma-separated) |
| `--yolo` | `-y` | Auto-approve all actions |
| `--sandbox` | `-s` | Sandbox mode (`restrictive`) |
| `--approval-mode` | | Set approval mode (`auto_edit`) |

## Common Patterns

### Code Review (Claude Code/CI)
```bash
cat src/auth.py | gemini -p "Review for security issues" > review.txt
```

### JSON Output with jq Parsing
```bash
result=$(cat api/routes.js | gemini -p "Generate OpenAPI spec" --output-format json)
echo "$result" | jq -r '.response' > openapi.json

# Error handling
if echo "$result" | jq -e '.error' > /dev/null 2>&1; then
    echo "Error: $(echo "$result" | jq -r '.error.message')"
    exit 1
fi
```

### Batch Processing
```bash
for file in src/*.py; do
    result=$(cat "$file" | gemini -p "Find bugs" --output-format json)
    echo "$result" | jq -r '.response' > "reports/$(basename "$file").md"
done
```

### Generate Commit Messages
```bash
result=$(git diff --cached | gemini -p "Write conventional commit message" --output-format json)
echo "$result" | jq -r '.response'
```

### Cross-Directory Analysis
```bash
gemini --include-directories ./backend,./frontend -p "Review API integration"
```

## Timeout Configuration

| Task Type | Recommended Timeout | Bash Parameter |
|-----------|---------------------|----------------|
| Quick checks | 2 minutes | `timeout: 120000` |
| Standard review | 5 minutes | `timeout: 300000` |
| Deep analysis | **10 minutes** | `timeout: 600000` |

**Recommendation**: Use `timeout: 600000` for complex analysis with `gemini-2.5-pro`.

## Error Handling

### Exit Codes
| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | General error |

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| No output | Missing `-p` flag | Use `gemini -p "prompt"` |
| Empty response | No stdin/prompt | Provide via `-p` or stdin |
| Context too large | Too many files | Use specific paths |
| Permission denied | Sandbox restrictions | Use `--yolo` carefully |

## Best Practices

1. **Use `-p` flag** in Claude Code and CI environments
2. **Use `--output-format json`** for script parsing
3. **Parse with `jq`** for reliable extraction
4. **Check `.error`** in JSON response for error handling
5. **Use `--include-directories`** for multi-directory context
6. **Match model to task**: `gemini-2.5-pro` for complex, `flash-lite` for batch
7. **Set 10-minute timeout** for deep analysis (`timeout: 600000`)
