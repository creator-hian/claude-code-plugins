# Changelog

All notable changes to the csharp-plugin project.

## [1.4.0] - 2026-01-05

### Added
- **CSharpier Auto-Format Hook**: PostToolUse hook for automatic C# code formatting
  - Triggers on `.cs` file changes (Write and Edit tools)
  - Formats only the changed file (not entire project)
  - Non-blocking: warnings don't stop workflow
  - Graceful handling when CSharpier is not installed

### New Files
- `hooks/hooks.json` - Hook configuration
- `hooks/csharpier-format.py` - Format script
- `hooks/README.md` - Hook documentation

## [1.3.1] - 2025-12-29

### Changed
- **Documentation Style**: Replaced emoji indicators with text tags
  - Improved accessibility and compatibility
  - Consistent formatting across all skill documents

## [1.3.0] - 2025-12-20

### Added
- **csharp-xml-docs Skill**: On-demand XML documentation workflow
  - Haiku draft generation for speed
  - Expert review phase for quality
  - Final output with user language preference (Korean/English)
  - Flexible workflow: skip phases as needed

### Changed
- Standardized skill dependency declarations
- Removed L2 redundancy in skill structure

## [1.2.0] - 2025-12-19

### Changed
- **POCU Standards Integration**: Complete rewrite of code style guidelines
  - `csharp-code-style`: POCU naming conventions (mPascalCase, bBoolean, EEnum)
  - `csharp-async-patterns`: POCU-aligned async/await patterns
  - `csharp-xml-docs`: POCU documentation standards

### Updated Files
- `skills/csharp-code-style/SKILL.md` - POCU naming rules
- `skills/csharp-async-patterns/SKILL.md` - POCU async patterns
- All reference documentation aligned with POCU standards

## [1.1.0] - 2025-12-19

### Added
- **csharp-code-style Skill**: C# code style and naming conventions
  - POCU-based naming rules
  - Code organization guidelines
  - C# 9.0+ pattern recommendations

## [1.0.0] - 2025-11-21

### Added
- **csharp-async-patterns Skill**: Modern C# asynchronous programming patterns
  - async/await best practices
  - CancellationToken usage patterns
  - Task composition and coordination
  - ConfigureAwait guidance
  - ValueTask optimization
  - Error handling in async code
- **Plugin Structure**: Standard claude-plugin architecture
  - `.claude-plugin/plugin.json`: Plugin metadata
  - `skills/`: Skill directory with YAML frontmatter
  - Progressive disclosure with `references/` folders
