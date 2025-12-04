# Gemini CLI Commands Reference

## Slash Commands (`/`)

### Session Management

| Command | Description |
|---------|-------------|
| `/chat save <tag>` | Save conversation with identifier |
| `/chat resume <tag>` | Resume saved conversation |
| `/chat list` | List saved conversations |
| `/chat delete <tag>` | Delete saved conversation |
| `/chat share <file>` | Export to Markdown/JSON |
| `/resume` | Interactive session browser |
| `/restore [id]` | Restore files to checkpoint state |

### Context Management

| Command | Description |
|---------|-------------|
| `/memory show` | Display loaded GEMINI.md content |
| `/memory refresh` | Reload GEMINI.md files |
| `/memory add <text>` | Add text to AI memory |
| `/memory list` | List loaded GEMINI.md files |
| `/directory add <path>` | Add workspace directory |
| `/directory show` | Show workspace directories |
| `/compress` | Replace context with summary |

### Configuration

| Command | Description |
|---------|-------------|
| `/model` | Change Gemini model |
| `/settings` | Open settings editor |
| `/theme` | Change visual theme |
| `/editor` | Select code editor |
| `/auth` | Change authentication method |
| `/vim` | Toggle vim mode |

### Tools & Extensions

| Command | Description |
|---------|-------------|
| `/tools` | Display available tools |
| `/tools desc` | Show tool descriptions |
| `/mcp list` | List MCP servers and tools |
| `/mcp refresh` | Restart MCP servers |
| `/mcp auth <server>` | Authenticate with OAuth server |
| `/extensions` | List active extensions |

### Utilities

| Command | Description |
|---------|-------------|
| `/clear` | Clear terminal screen (Ctrl+L) |
| `/copy` | Copy last output to clipboard |
| `/stats` | Show token usage and stats |
| `/init` | Generate GEMINI.md for project |
| `/help` | Display help |
| `/quit` | Exit Gemini CLI |

## At Commands (`@`)

Include file/directory content in prompts (interactive mode).

### Usage

```bash
# Single file
@path/to/file.txt Explain this code

# Directory (recursive)
@src/my_project/ Summarize the code

# Multiple files
What do these files do? @README.md @package.json

# Escaped spaces
@My\ Documents/file.txt Analyze this
```

### Behavior
- **Git-aware filtering**: Excludes `.git/`, `node_modules/`, `dist/`, `.env`
- **File types**: Text-based only, binary files skipped
- **Large files**: May be truncated for performance

## Shell Mode (`!`)

Execute shell commands from Gemini CLI (interactive mode).

### Usage

```bash
# Single command
!ls -la
!git status

# Toggle shell mode
!     # Enter shell mode
!     # Exit shell mode
```

### Platform Details
| Platform | Shell |
|----------|-------|
| Windows | `powershell.exe -NoProfile -Command` |
| Linux/macOS | `bash` |

**Note:** `GEMINI_CLI=1` environment variable is set in subprocess.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo last input action |
| `Ctrl+Shift+Z` | Redo |
| `Ctrl+L` | Clear screen |

## Vim Mode

Enable with `/vim` command.

| Mode | Keys |
|------|------|
| NORMAL | `h,j,k,l` navigation, `w,b,e` word jump |
| INSERT | Standard input, `Escape` to return |
| Editing | `x` delete, `c` change, `dd,cc,dw,cw` |
| Count | `3h`, `5w`, `10G` |
| Repeat | `.` repeats last edit |
