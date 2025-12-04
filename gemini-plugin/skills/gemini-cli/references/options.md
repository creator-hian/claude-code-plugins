# Gemini CLI Options Reference

## Command Line Options

### Core Options

| Option | Alias | Description | Example |
|--------|-------|-------------|---------|
| `--prompt` | `-p` | Run in headless mode | `gemini -p "Analyze code"` |
| `--model` | `-m` | Model selection | `gemini -m gemini-2.5-flash` |
| `--output-format` | | Output format | `--output-format json` |
| `--include-directories` | | Additional directories | `--include-directories ../lib,../docs` |
| `--sandbox` | `-s` | Sandbox mode | `gemini -s restrictive` |
| `--yolo` | `-y` | Auto-approve all actions | `gemini -p "Query" --yolo` |
| `--approval-mode` | | Set approval mode | `--approval-mode auto_edit` |
| `--debug` | `-d` | Enable debug mode | `gemini -p "Query" --debug` |

## Models

| Model | Description | Best For |
|-------|-------------|----------|
| `gemini-3-pro-preview` | Latest flagship preview | Most complex analysis, cutting-edge |
| `gemini-2.5-pro` | Most capable stable | Complex analysis, architecture review |
| `gemini-2.5-flash` | Fast and efficient | Standard reviews, batch operations |
| `gemini-2.5-flash-lite` | Lightweight, fastest | Simple checks, high-volume batch |

### Model Selection Guidelines

| Task Type | Recommended Model |
|-----------|-------------------|
| Complex architecture analysis | `gemini-2.5-pro` |
| Security audits | `gemini-2.5-pro` |
| Standard code review | `gemini-2.5-flash` |
| Quick syntax checks | `gemini-2.5-flash` |
| High-volume batch processing | `gemini-2.5-flash-lite` |
| Cutting-edge capabilities | `gemini-3-pro-preview` |

## Output Formats

| Format | Description | Use Case |
|--------|-------------|----------|
| (default) | Human-readable text | Terminal output |
| `json` | Structured JSON with stats | Script parsing, automation |
| `stream-json` | JSONL events | Real-time monitoring |

### JSON Response Schema

```json
{
  "response": "string",
  "stats": {
    "models": {
      "[model-name]": {
        "api": {
          "totalRequests": 0,
          "totalErrors": 0,
          "totalLatencyMs": 0
        },
        "tokens": {
          "prompt": 0,
          "candidates": 0,
          "total": 0,
          "cached": 0,
          "thoughts": 0,
          "tool": 0
        }
      }
    },
    "tools": {
      "totalCalls": 0,
      "totalSuccess": 0,
      "totalFail": 0,
      "totalDurationMs": 0,
      "totalDecisions": {
        "accept": 0,
        "reject": 0,
        "modify": 0,
        "auto_accept": 0
      },
      "byName": {}
    },
    "files": {
      "totalLinesAdded": 0,
      "totalLinesRemoved": 0
    }
  },
  "error": {
    "type": "string",
    "message": "string",
    "code": 0
  }
}
```

### Parsing JSON with jq

```bash
# Extract response only
gemini -p "Query" --output-format json | jq -r '.response'

# Get total token usage
gemini -p "Query" --output-format json | jq '.stats.models | to_entries | map(.value.tokens.total) | add'

# Check for errors
gemini -p "Query" --output-format json | jq '.error // "No error"'

# Get tool call count
gemini -p "Query" --output-format json | jq '.stats.tools.totalCalls'
```

### Stream JSON Event Types

| Event | Description | Key Fields |
|-------|-------------|------------|
| `init` | Session starts | session_id, model, timestamp |
| `message` | User/assistant messages | role, content, delta |
| `tool_use` | Tool call requests | tool_name, tool_id, parameters |
| `tool_result` | Tool execution results | tool_id, status, output |
| `error` | Non-fatal errors | type, message |
| `result` | Final outcome | status, stats |

**Example Stream:**
```jsonl
{"type":"init","session_id":"abc123","model":"gemini-2.5-flash"}
{"type":"message","role":"user","content":"List files"}
{"type":"tool_use","tool_name":"Bash","tool_id":"bash-123","parameters":{"command":"ls -la"}}
{"type":"tool_result","tool_id":"bash-123","status":"success","output":"file1.txt\nfile2.txt"}
{"type":"message","role":"assistant","content":"Here are the files...","delta":true}
{"type":"result","status":"success","stats":{"total_tokens":250}}
```

## Approval Modes

| Mode | Description |
|------|-------------|
| (default) | Ask for approval on each action |
| `auto_edit` | Auto-approve file edits |
| `--yolo` | Auto-approve all actions (use carefully) |

## Sandbox Modes

| Mode | Description |
|------|-------------|
| `default` | Standard permissions (read/write) |
| `restrictive` | Limited permissions (read-only) |

## Directory Options

```bash
# Include additional directories
gemini --include-directories ../lib,../docs -p "Analyze"

# Multiple directory analysis
gemini --include-directories ./backend,./frontend,./shared -p "Full stack analysis"
```

## Authentication

| Method | Description |
|--------|-------------|
| OAuth | Browser-based Google authentication (default) |
| API Key | Direct API key via `GEMINI_API_KEY` env var |

## Platform Notes

### Windows
- Shell mode uses `powershell.exe -NoProfile -Command`
- Use forward slashes `/` or escaped backslashes `\\`
- Clipboard uses `clip` (pre-installed)

### Linux/macOS
- Shell mode uses `bash`
- Clipboard requires `xclip`/`xsel` (Linux) or `pbcopy` (macOS)

## Common Option Combinations

```bash
# Code Review (CI/CD)
gemini -m gemini-2.5-flash -p "Review for bugs" --output-format json

# Deep Analysis
gemini -m gemini-2.5-pro --include-directories ./src,./lib -p "Deep analysis"

# Batch Processing
gemini -m gemini-2.5-flash-lite -p "Quick check" --output-format json

# Restrictive Environment
gemini -s restrictive --include-directories ./safe-dir -p "Read-only analysis"
```
