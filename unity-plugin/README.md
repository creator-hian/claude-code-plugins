# Unity Plugin for Claude Code

Modern Unity game development plugin with specialized agents and skills for comprehensive Unity development.

## Overview

This plugin provides expert-level Unity development support with **2 main agents** and **10 specialized skills** covering all aspects of Unity game development, from async programming to DOTS, mobile optimization, testing, and UI systems.

## Architecture

### Main Agents (2)

**unity-developer** - General Unity development agent
- Uses 9 skills: unity-async, unity-unitask, unity-r3, unity-unirx, unity-vcontainer, unity-mobile, unity-networking, unity-performance, unity-ui
- Handles gameplay systems, UI, asset management, cross-platform development
- Optimized for typical Unity game development workflows

**unity-dots-developer** - DOTS specialized agent
- Uses unity-async skill for foundation
- Entity Component System (ECS) expert
- Burst compiler and Job System optimization
- High-performance massive-scale simulations

### Skills (10)

| Skill | Library/Focus | Description | Key Topics |
|-------|---------------|-------------|------------|
| **unity-async** | Unity Core | Unity async patterns | Coroutines, async/await, Job System, main thread constraints |
| **unity-unitask** | UniTask (Cysharp) | High-performance async | Zero-allocation, PlayerLoop integration, memory optimization |
| **unity-r3** | R3 (Cysharp) | Modern reactive programming | Observables, ReactiveProperty, MVVM, async enumerable |
| **unity-unirx** | UniRx (Legacy) | Legacy reactive programming | UniRx patterns, MessageBroker, ReactiveCommand |
| **unity-vcontainer** | VContainer | Dependency injection | IoC container, service lifetimes, testable architecture |
| **unity-testrunner** | Test Framework | Test automation | CLI execution, NUnit, EditMode/PlayMode, CI/CD, TDD |
| **unity-mobile** | Platform | Mobile optimization | iOS/Android, IL2CPP, battery life, platform-specific code |
| **unity-networking** | Multiplayer | Multiplayer development | Netcode, Mirror, Photon, state sync, lag compensation |
| **unity-performance** | Optimization | Performance optimization | Profiling, draw calls, batching, LOD, object pooling |
| **unity-ui** | UI Systems | User interfaces | UI Toolkit, UGUI, responsive layouts, Canvas optimization |

### Library-Specific Skills

**Modern Stack (Recommended for new projects):**
- `unity-r3` - Modern reactive extensions by Cysharp
- `unity-unitask` - Zero-allocation async by Cysharp
- `unity-vcontainer` - High-performance DI

**Legacy Stack (For existing projects):**
- `unity-unirx` - Original UniRx (pre-R3)

## Installation

1. Copy this plugin directory to your Claude Code plugins folder:
   ```
   ~/.claude/plugins/unity-plugin/
   # or
   %USERPROFILE%\.claude\plugins\unity-plugin\
   ```

2. Restart Claude Code or reload plugins

3. Agents and skills will be automatically available

## Usage

### Using Main Agents

Invoke agents directly for specialized Unity tasks:

```
Use the unity-developer agent to implement this gameplay system

Use the unity-dots-developer agent to convert this to ECS
```

Agents automatically:
- Apply Unity best practices
- Reference relevant skills (defined in frontmatter)
- Implement platform-aware optimizations
- Coordinate with specialized skills

### Using Skills Directly

Skills activate automatically when working with relevant code:

```
Help me implement async patterns for Unity
Reference the unity-unitask skill for zero-allocation async
Show me MVVM patterns using the unity-r3 skill
Use unity-unirx for this legacy project
```

## Skill Relationships

### Foundation Hierarchy

```
csharp-async-patterns (C# Plugin - foundation)
├─→ unity-async (Unity context + coroutines + Job System)
    ├─→ unity-unitask (UniTask performance optimization)
    ├─→ unity-r3 (R3 reactive patterns - modern)
    └─→ unity-unirx (UniRx reactive patterns - legacy)

unity-async provides Unity-specific foundation for:
- unity-unitask: UniTask library specialization
- unity-r3: Modern R3 reactive extensions
- unity-unirx: Legacy UniRx support
```

### Learning Path

**Async Programming:**
```
1. csharp-async-patterns → Task, async/await, CancellationToken
2. unity-async → Coroutines, Unity constraints, Job System
3. unity-unitask → Zero-allocation optimization
```

**Reactive Programming (Modern):**
```
1. unity-async → Basic patterns
2. unity-r3 → Modern reactive extensions (R3)
3. unity-vcontainer → DI integration
```

**Reactive Programming (Legacy):**
```
1. unity-async → Basic patterns
2. unity-unirx → Legacy UniRx patterns
3. unity-vcontainer → DI integration
```

**Architecture:**
```
1. unity-async → Basic patterns
2. unity-vcontainer → Dependency injection with VContainer
3. unity-r3 OR unity-unirx → MVVM/MVP implementation
```

## Library Selection Guide

### When to Use R3 vs UniRx

**Use unity-r3 (Modern):**
- ✅ New projects (Unity 2022+)
- ✅ Better performance needed
- ✅ Async enumerable support
- ✅ Modern C# features
- ✅ Active development

**Use unity-unirx (Legacy):**
- ✅ Existing UniRx projects
- ✅ Unity 2019-2021 LTS
- ✅ Large UniRx codebase
- ✅ Team UniRx expertise

### When to Use UniTask

**Use unity-unitask:**
- ✅ Performance-critical async
- ✅ Mobile platforms (GC pressure)
- ✅ Zero-allocation required
- ✅ PlayerLoop timing control

## Agent Selection Guide

| Task | Primary Agent | Skills Used |
|------|--------------|-------------|
| General Unity development | unity-developer | unity-async, unity-ui, unity-performance |
| Async operations | unity-developer | unity-async, unity-unitask |
| Reactive architecture (modern) | unity-developer | unity-r3, unity-vcontainer |
| Reactive architecture (legacy) | unity-developer | unity-unirx, unity-vcontainer |
| Mobile game | unity-developer | unity-mobile, unity-performance |
| Multiplayer game | unity-developer | unity-networking, unity-vcontainer |
| Massive-scale simulation | unity-dots-developer | unity-async |
| Performance-critical systems | unity-dots-developer | - |

## Common Workflows

### New Unity Project Setup (Modern Stack)
```
1. Request unity-developer to set up project architecture
2. Uses unity-vcontainer for dependency injection
3. Uses unity-async for async patterns
4. Uses unity-r3 for reactive patterns
5. Uses unity-ui for UI systems
```

### Legacy Project Maintenance
```
1. Request unity-developer for legacy project
2. Uses unity-unirx for existing reactive code
3. Uses unity-async for async patterns
4. Uses unity-vcontainer for new services
```

### Mobile Game Optimization
```
1. Request unity-developer to optimize for mobile
2. Uses unity-mobile for platform-specific optimization
3. Uses unity-performance for profiling and optimization
4. Uses unity-unitask to reduce GC allocations
```

### Multiplayer Implementation
```
1. Request unity-developer to implement multiplayer
2. Uses unity-networking for network architecture
3. Uses unity-vcontainer for service layer
4. Uses unity-r3 for network event handling
```

### High-Performance System
```
1. Request unity-dots-developer for ECS conversion
2. Implements data-oriented design
3. Uses Burst compiler and Job System
4. Achieves massive-scale performance
```

## Skill Details

### unity-async
**Foundation**: `csharp-async-patterns` from C# Plugin

**Core Topics:**
- Coroutines and yield instructions
- async/await with Unity constraints
- Job System and Burst compiler
- Main thread restrictions
- Thread safety patterns

### unity-unitask
**Library**: UniTask by Cysharp
**Foundation**: `unity-async`

**Core Topics:**
- Zero-allocation async/await
- PlayerLoop integration
- Memory pool management
- Cancellation and timeout
- DOTween, Addressables integration

### unity-r3
**Library**: R3 by Cysharp (Modern)
**Foundation**: `csharp-async-patterns`, `unity-async`

**Core Topics:**
- Observable sequences
- ReactiveProperty
- MVVM/MVP architecture
- Async enumerable integration
- Event-driven design

### unity-unirx
**Library**: UniRx by neuecc (Legacy)
**Foundation**: `csharp-async-patterns`, `unity-async`
**Status**: ⚠️ Maintained but not actively developed

**Core Topics:**
- Observable sequences
- ReactiveProperty and ReactiveCommand
- MessageBroker pattern
- MainThreadDispatcher
- Legacy project maintenance

### unity-vcontainer
**Library**: VContainer

**Core Topics:**
- IoC container configuration
- Service registration (Singleton, Transient, Scoped)
- Constructor/method injection
- LifetimeScope hierarchies
- Factory patterns

### unity-testrunner
**Focus**: Unity Test Framework CLI automation

**Core Topics:**
- CLI batchmode execution (EditMode/PlayMode)
- NUnit assertions and test attributes
- Test assembly configuration (asmdef)
- Result parsing and CI/CD integration
- TDD workflow support

### unity-mobile, unity-networking, unity-performance, unity-ui
Focused skills with SKILL.md containing quick reference patterns and best practices.

## Relationship with C# Plugin

**C# Plugin (Foundation):**
- `csharp-async-patterns` → Platform-agnostic async/await

**Unity Plugin (Extends):**
- `unity-async` → Unity-specific async + coroutines + Job System
- `unity-unitask` → UniTask optimization
- `unity-r3` → R3 reactive patterns (modern)
- `unity-unirx` → UniRx reactive patterns (legacy)
- `unity-vcontainer` → VContainer DI

**Key Principle:**
- C# Plugin = Platform-agnostic patterns (works in ANY C# application)
- Unity Plugin = Unity-specific implementation (Unity projects only)

## Platform Considerations

- **WebGL**: No threading, coroutines primary, Job System unavailable
- **Mobile**: Battery optimization, memory pressure, IL2CPP required
- **Desktop**: Full threading, higher performance budgets
- **Consoles**: Platform-specific requirements, certification

## Version

**Version**: 2.0.0 (Skill-based architecture)
**Author**: Creator Hian

**Unity Version Support**: 2020.3 LTS and above

**Optional Dependencies:**
- UniTask (for unity-unitask skill) - Cysharp
- R3 (for unity-r3 skill) - Cysharp
- UniRx (for unity-unirx skill) - neuecc (legacy)
- VContainer (for unity-vcontainer skill)

## Migration from 1.0

**v1.0 (Agent-based):**
- 9 specialized agents
- 1 skill (unity-async)

**v2.0 (Skill-based):**
- 2 main agents (unity-developer, unity-dots-developer)
- 9 skills (all domain expertise)
- Library-specific naming (unity-r3, unity-unirx, unity-vcontainer)

**Legacy agents** moved to `agents/legacy/` for reference.

## Changelog

### v2.0.0
- ✅ Restructured to skill-based architecture
- ✅ Separated unity-reactive → unity-r3 + unity-unirx
- ✅ Renamed unity-di → unity-vcontainer (library-specific)
- ✅ Added 10 specialized skills
- ✅ Reduced to 2 main coordinating agents
- ✅ Improved library clarity and selection guidance

## License

See plugin marketplace documentation for license information.

## Support

For Unity-specific questions:
- Reference included skills for detailed guidance
- Use specialized agents for complex scenarios
- Consult Unity documentation for API references
- Profile on target platforms for validation
- Choose appropriate library (R3 vs UniRx, etc.)
