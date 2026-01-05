# CSharp Plugin Hooks

## csharpier-format.py

PostToolUse hook that automatically formats C# files using [CSharpier](https://csharpier.com/) after Write/Edit operations.

### Features

- **Auto-integrated**: No manual configuration required
- Triggers on `.cs` file changes (Write and Edit tools)
- Formats only the changed file (not entire project)
- Non-blocking: warnings don't stop workflow
- Graceful handling when CSharpier is not installed

### Prerequisites

Install CSharpier as a global dotnet tool:

```bash
dotnet tool install -g csharpier
```

### Setup

**No setup required!** This hook is automatically integrated when the plugin is installed.

The hook is defined in `hooks.json` and uses `${CLAUDE_PLUGIN_ROOT}` to locate the script automatically.

### Behavior

| Scenario | Action |
|----------|--------|
| `.cs` file modified | Run CSharpier on file |
| Non-`.cs` file modified | Skip silently |
| CSharpier not installed | Print warning, continue |
| Format error | Print warning, continue |
| Timeout (30s) | Print warning, continue |

### Output Examples

**Success:**
```
[CSharpier] Formatted: src/MyClass.cs
```

**CSharpier not installed:**
```
[CSharpier] Warning: CSharpier not installed. Install with: dotnet tool install -g csharpier
```

### Customization

To format the entire project instead of single files, modify `run_csharpier()`:

```python
def run_csharpier(file_path: str) -> tuple[bool, str]:
    # Change from single file to project-wide
    result = subprocess.run(
        ["dotnet", "csharpier", "format", "."],  # Format entire project
        # ...
    )
```

Note: Project-wide formatting is slower as it scans all files.
