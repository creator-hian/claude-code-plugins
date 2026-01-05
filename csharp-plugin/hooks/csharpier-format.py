#!/usr/bin/env python3
"""
PostToolUse Hook: CSharpier Auto-Format

Automatically formats C# files after Write/Edit operations using CSharpier.
Triggers on .cs file changes and applies formatting to maintain code style consistency.

Usage in .claude/settings.json:
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "python path/to/csharpier-format.py",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
"""

import json
import subprocess
import sys
import shutil
from pathlib import Path


def check_csharpier_installed() -> bool:
    """Check if CSharpier is available in PATH."""
    return shutil.which("dotnet") is not None


def run_csharpier(file_path: str) -> tuple[bool, str]:
    """
    Run CSharpier on the specified file.

    Returns:
        tuple: (success: bool, message: str)
    """
    try:
        result = subprocess.run(
            ["dotnet", "csharpier", file_path],
            capture_output=True,
            text=True,
            timeout=30
        )

        if result.returncode == 0:
            return True, f"Formatted: {file_path}"
        else:
            # CSharpier not installed or other error
            stderr = result.stderr.strip()
            if "csharpier" in stderr.lower() and "not found" in stderr.lower():
                return False, "CSharpier not installed"
            return False, f"Format failed: {stderr or result.stdout}"

    except subprocess.TimeoutExpired:
        return False, f"Timeout formatting: {file_path}"
    except FileNotFoundError:
        return False, "dotnet CLI not found"
    except Exception as e:
        return False, f"Error: {str(e)}"


def main():
    try:
        # Parse hook input from stdin
        data = json.load(sys.stdin)

        # Extract file path from tool input
        file_path = data.get("tool_input", {}).get("file_path", "")

        # Only process .cs files
        if not file_path.endswith(".cs"):
            sys.exit(0)

        # Verify file exists
        if not Path(file_path).exists():
            sys.exit(0)

        # Check dotnet availability
        if not check_csharpier_installed():
            print("[CSharpier] Warning: dotnet CLI not found. Skipping format.", file=sys.stderr)
            sys.exit(0)  # Non-blocking, continue workflow

        # Run CSharpier
        success, message = run_csharpier(file_path)

        if success:
            print(f"[CSharpier] {message}")
        else:
            if "not installed" in message.lower():
                print(f"[CSharpier] Warning: CSharpier not installed. Install with: dotnet tool install -g csharpier", file=sys.stderr)
            else:
                print(f"[CSharpier] Warning: {message}", file=sys.stderr)

        # Always exit 0 to not block workflow
        sys.exit(0)

    except json.JSONDecodeError:
        print("[CSharpier] Warning: Invalid JSON input", file=sys.stderr)
        sys.exit(0)
    except Exception as e:
        print(f"[CSharpier] Warning: {str(e)}", file=sys.stderr)
        sys.exit(0)


if __name__ == "__main__":
    main()
