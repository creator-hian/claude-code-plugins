---
name: csharp-xml-docs
description: Unity C# XML documentation standards with flexible Korean/English language support. Use when writing XML comments, documenting C# APIs, or need guidance on proper documentation patterns for properties, methods, classes, and interfaces.
---

# C# XML Documentation Guide

Comprehensive XML documentation standards for Unity C# projects with flexible language choice.

## Overview

**Core Principle**: XML documentation samples with flexible language choice
- All XML comments (`<summary>`, `<remarks>`, etc.) can be written in Korean or English
- Provides universal reference for documentation standards
- Choose the language that best serves your team and project needs

## Quick Start

```csharp
// Simple property - English
/// <summary>
/// Indicates whether the action executed successfully
/// </summary>
public bool Success { get; set; }

// Simple property - Korean
/// <summary>
/// 액션 실행 성공 여부
/// </summary>
public bool Success { get; set; }

// Complex concept with remarks
/// <summary>
/// Indicates whether the action was skipped
/// </summary>
/// <remarks>
/// Set to true when skipped due to unmet conditions.
/// If true, the action was not executed regardless of Success value.
/// </remarks>
public bool Skipped { get; set; }
```

## Language Choice Guidelines

### ✅ Acceptable Options

1. **Pure Korean** (한글 전용)
2. **Pure English** (영문 전용)
3. **Mixed Korean + English** (혼용)

### 🎯 Context-Based Recommendations

| Context | Recommended Language | Rationale |
|---------|---------------------|-----------|
| Internal team project | Korean or Team preference | Maximum clarity for team members |
| Open source / International | English or Mixed | Broader accessibility |
| Company standard exists | Follow company policy | Consistency across projects |
| Mixed team | English or Both | Accommodate all members |
| Legacy codebase | Match existing style | Maintain consistency |

### 📋 Consistency Rules

**Within a single file:**
- ✅ **Consistent**: All Korean OR All English OR All Mixed
- ❌ **Inconsistent**: Random switching between languages

**Across the project:**
- Maintain similar language strategy across similar components
- Document language choice in project README or CLAUDE.md
- Use consistent language for related interfaces and implementations

## Quick Decision Matrix

| Scenario | Summary | Remarks | Additional Tags | Example |
|----------|---------|---------|-----------------|---------|
| Simple property | Yes | No | No | `bool Success` |
| Complex concept | Yes | Yes | No | `bool Skipped` with conditions |
| Property with side effects | Yes | Optional | `<value>` | `CurrentMode` |
| Public class/struct | Yes | Yes | No | `class ActionResult` |
| Factory method | Yes | Only if special case | No | `CreateSuccess()` |
| Method with exceptions | Yes | Optional | `<exception>` per exception | `LoadVRMAsync()` |
| Internal method | Optional | No | No | `InitializeDefaults()` |
| Enum type | Yes | Optional | No | `AnimationMode` |
| Enum values | Yes (each) | No | No | `VRMAnimation`, `AnimatorController` |
| Extension method | Yes | Optional | Document `this` param | `ActivateWithConfigAsset()` |
| Interface method | Yes (full) | Yes | All applicable | `IActionHandler.ExecuteAsync()` |
| Implementation method | `<inheritdoc/>` | Implementation details only | Override if needed | `PlayerPrefsActionHandler.ExecuteAsync()` |

## Reference Documentation

### [Pattern Library](references/pattern-library.md)
Complete examples for all common scenarios:
- Simple properties and fields
- Complex concepts requiring remarks
- Classes and structs
- Methods (simple, complex, multi-step)
- Factory methods
- Enums and bit flags
- Exception documentation
- Extension methods
- Interface vs Implementation patterns

### [Formatting Guidelines](references/formatting-guidelines.md)
When to use various XML tags:
- `<br/>` vs `<list>` for structured content
- `<value>` for properties with side effects
- `<exception>` for documented exceptions
- `<para>` for multi-paragraph remarks

### [Best Practices](references/best-practices.md)
Essential principles for effective documentation:
- Keep it simple for straightforward elements
- Add context where needed
- Be consistent with language choice
- Avoid redundancy
- Document special cases

## Critical Pattern: Interface vs Implementation

**Interface: Full Documentation**
```csharp
/// <summary>
/// Interface dedicated to VTuber Animation control (ISP compliance)
/// </summary>
/// <remarks>
/// Interface for clients that only control animation playback.<br/>
/// State Query and Observable features are separated into distinct interfaces.
/// </remarks>
public interface IVTuberAnimationController
{
    /// <summary>
    /// Plays animation asynchronously
    /// </summary>
    /// <param name="animationPath">Animation path</param>
    /// <param name="wrapMode">Playback mode (Loop/Once/PingPong)</param>
    /// <returns>
    /// true: Playback start succeeded<br/>
    /// false: Playback start failed
    /// </returns>
    /// <remarks>
    /// <strong>Preconditions:</strong><br/>
    /// • Context must be ready (IsReady = true)<br/>
    /// • animationPath must not be null
    /// </remarks>
    UniTask<bool> PlayAnimationAsync(string animationPath, WrapMode wrapMode);
}
```

**Implementation: Use `<inheritdoc/>` + Implementation Details**
```csharp
public partial class VRMController : IVTuberAnimationController
{
    /// <inheritdoc/>
    /// <remarks>
    /// <strong>Implementation:</strong> Path prefix-based auto-routing ("VRMA/" → VRMAnimation, "State/{Layer}/{Identifier}" → AnimatorController)<br/>
    /// <strong>Main Failures:</strong> Unknown prefix, System activation failure, invalid Layer/Identifier<br/>
    /// <strong>Note:</strong> wrapMode ignored when using AnimatorController
    /// </remarks>
    public async UniTask<bool> PlayAnimationAsync(string animationPath, WrapMode wrapMode)
    {
        // Implementation...
    }
}
```

## Key Principles

1. **Keep it simple**: Concise summaries for straightforward elements
2. **Add context where needed**: Complex concepts deserve detailed explanations in remarks
3. **Think about your audience**: Choose language (Korean/English/Mixed) that serves your team best
4. **Be consistent**: Follow established patterns and use consistent language throughout
5. **Interface vs Implementation**: Full docs in interface, `<inheritdoc/>` + implementation specifics in class
6. **Document exceptions**: Use `<exception>` for exceptions that are part of the method's contract
7. **Property side effects**: Use `<value>` tag when getter/setter have non-obvious behavior

## IDE Experience

**IntelliSense Display:**

Simple Property:
```
Success (bool)
Indicates whether the action executed successfully
```

Complex Property with Remarks:
```
Skipped (bool)
Indicates whether the action was skipped

[Show more...] ← Click to expand remarks
```

## Common Examples

**Simple Property:**
```csharp
/// <summary>Number of retry attempts</summary>
public int RetryCount { get; set; }
```

**Method with Parameters:**
```csharp
/// <summary>
/// Retrieves output data
/// </summary>
/// <typeparam name="T">Data type to return</typeparam>
/// <param name="key">Key to retrieve</param>
/// <param name="defaultValue">Default value if key not found</param>
/// <returns>Retrieved data or default value</returns>
public T GetOutputData<T>(string key, T defaultValue = default(T))
{
    // Implementation...
}
```

**Multi-Step Process:**
```csharp
/// <summary>
/// Executes event
/// </summary>
/// <remarks>
/// <para>
/// <strong>Execution Process:</strong><br/>
/// 1. Event definition lookup<br/>
/// 2. Event-level condition evaluation<br/>
/// 3. Direct action list processing<br/>
/// 4. Execution time and metadata configuration
/// </para>
/// </remarks>
public async UniTask<EventActionResult> ExecuteEventAsync(
    string systemId, string eventId, object contextData = null)
{
    // Implementation...
}
```
