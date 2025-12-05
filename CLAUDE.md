# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Claude Code Plugin Marketplace** - a collection of custom plugins that extend Claude Code's capabilities through Skills, Agents, Commands, and Hooks. The repository currently contains 5 plugins with 16 skills total.

## Repository Structure

```
claude-code-plugins/
├── csharp-plugin/          # C# async patterns, XML docs
├── unity-plugin/           # Unity game development (9 skills)
├── codex-plugin/           # OpenAI Codex CLI integration
├── gemini-plugin/          # Google Gemini CLI integration
├── ai-orchestration-plugin/# Multi-AI orchestration (Claude+Codex+Gemini)
├── tools/
│   ├── create_plugin.py    # Plugin creation script
│   └── plugin-template/    # Template for new plugins
└── docs/                   # Architecture documentation
```

## Plugin Architecture

Each plugin follows this structure:
```
plugin-name/
├── .claude-plugin/
│   └── plugin.json         # Metadata (name, version, author)
├── agents/                 # Specialized AI agents (*.md)
├── skills/                 # Procedural knowledge modules
│   └── skill-name/
│       ├── SKILL.md        # L1 metadata + L2 instructions
│       └── references/     # L3 detailed resources
├── command/                # Slash commands
└── hook/                   # Lifecycle hooks
```

## 3-Level Progressive Disclosure (Skills)

Skills use progressive loading to optimize context window:

- **Level 1 (Metadata)**: YAML frontmatter in SKILL.md (~100 tokens, always loaded)
- **Level 2 (Instructions)**: Main content of SKILL.md (~5,000 tokens, loaded when triggered)
- **Level 3 (Resources)**: `references/` folder (unlimited, loaded on explicit reference)

This achieves ~89% context reduction compared to loading all content upfront.

## Creating a New Plugin

```bash
python tools/create_plugin.py
```

Interactive CLI prompts for:
- Plugin name (kebab-case)
- Description
- Author
- Version

## Key Design Principles

### Skills vs Agents Separation
- **Skills**: Reusable procedural knowledge ("how-to") - shared across projects
- **Agents**: Project-specific workflows and complex multi-step operations

### C# vs Unity Separation
- **C# Plugin**: Pure .NET patterns (works in ANY C# app - ASP.NET, console, Blazor)
- **Unity Plugin**: Unity-specific APIs and optimizations (requires Unity engine)

See `docs/architecture/SKILL_SEPARATION_STRATEGY.md` for detailed decision tree.

## Plugin Summary

| Plugin | Skills | Focus |
|--------|--------|-------|
| csharp-plugin | 2 | async/await, XML docs |
| unity-plugin | 9 | Async, reactive, DI, performance, UI, mobile, networking |
| codex-plugin | 2 | Codex CLI, Claude-Codex dual-AI loop |
| gemini-plugin | 2 | Gemini CLI, Claude-Gemini dual-AI loop |
| ai-orchestration-plugin | 1 | Triple-AI (Claude+Codex+Gemini) orchestration |

## Development Workflow

1. Create plugin with `create_plugin.py` or copy `tools/plugin-template/`
2. Define skills in `skills/skill-name/SKILL.md` with YAML frontmatter
3. Add detailed references in `skills/skill-name/references/`
4. Register in `.claude-plugin/marketplace.json`
5. Update root `README.md` with plugin summary

## Writing Skills

SKILL.md format:
```markdown
---
name: skill-name
description: Brief description for discovery (~100 tokens max)
---

# Skill Title

[Level 2 content: workflows, best practices, ~5,000 tokens]

## Reference Documentation
[Links to Level 3 resources in references/ folder]
```
