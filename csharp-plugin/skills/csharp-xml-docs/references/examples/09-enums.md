# Document Enums Completely

Each enum value should have clear `<summary>` describing its purpose.

## Principle

Enum values appear in IntelliSense when developers use them. Each value needs clear documentation explaining what it represents and when to use it.

## ✅ Good Examples

### Basic Enum
```csharp
/// <summary>
/// Animation system mode
/// </summary>
public enum AnimationMode
{
    /// <summary>
    /// VRM Animation using VRMA files via UniVRM
    /// </summary>
    VRMAnimation,

    /// <summary>
    /// Unity Animator Controller using Mecanim
    /// </summary>
    AnimatorController,

    /// <summary>
    /// Hybrid mode supporting runtime switching between VRM and Animator
    /// </summary>
    Hybrid
}
```

### Flags Enum
```csharp
/// <summary>
/// Action execution options
/// </summary>
[Flags]
public enum ActionFlags
{
    /// <summary>
    /// No special options
    /// </summary>
    None = 0,

    /// <summary>
    /// Skip condition evaluation
    /// </summary>
    SkipConditions = 1 << 0,

    /// <summary>
    /// Continue execution even if action fails
    /// </summary>
    ContinueOnFailure = 1 << 1,

    /// <summary>
    /// Log detailed execution information
    /// </summary>
    VerboseLogging = 1 << 2
}
```

### Enum with Explicit Values
```csharp
/// <summary>
/// Log severity level
/// </summary>
public enum LogLevel
{
    /// <summary>
    /// Trace-level debugging information (lowest severity)
    /// </summary>
    Trace = 0,

    /// <summary>
    /// Debug information for development
    /// </summary>
    Debug = 1,

    /// <summary>
    /// General information messages
    /// </summary>
    Info = 2,

    /// <summary>
    /// Warning messages for potential issues
    /// </summary>
    Warning = 3,

    /// <summary>
    /// Error messages for failures
    /// </summary>
    Error = 4,

    /// <summary>
    /// Fatal errors requiring immediate attention (highest severity)
    /// </summary>
    Fatal = 5
}
```

### Korean Example
```csharp
/// <summary>
/// 애니메이션 시스템 모드
/// </summary>
public enum AnimationMode
{
    /// <summary>
    /// UniVRM을 통한 VRMA 파일 기반 VRM 애니메이션
    /// </summary>
    VRMAnimation,

    /// <summary>
    /// Mecanim을 사용하는 Unity Animator Controller
    /// </summary>
    AnimatorController,

    /// <summary>
    /// VRM과 Animator 간 런타임 전환을 지원하는 하이브리드 모드
    /// </summary>
    Hybrid
}
```

## ❌ Bad Examples

### Missing Value Documentation
```csharp
// ❌ Bad: No documentation on values
/// <summary>
/// Animation system mode
/// </summary>
public enum AnimationMode
{
    VRMAnimation,
    AnimatorController,
    Hybrid
}
```

**Why it's bad**: Developers don't know what each value means or when to use it.

### Unclear Documentation
```csharp
// ❌ Bad: Vague descriptions
public enum AnimationMode
{
    /// <summary>First option</summary>
    VRMAnimation,

    /// <summary>Second option</summary>
    AnimatorController,

    /// <summary>Third option</summary>
    Hybrid
}
```

**Why it's bad**: Documentation doesn't explain what each option actually does.

### Inconsistent Documentation
```csharp
// ❌ Bad: Only some values documented
public enum AnimationMode
{
    /// <summary>VRM Animation using VRMA files via UniVRM</summary>
    VRMAnimation,

    AnimatorController,  // No documentation

    /// <summary>Hybrid mode</summary>
    Hybrid  // Minimal documentation
}
```

**Why it's bad**: Inconsistent documentation looks unprofessional and leaves gaps.

## When Enum Documentation Matters Most

### Public API Enums
Enums exposed in public APIs need comprehensive documentation:

```csharp
/// <summary>
/// Retry strategy for failed operations
/// </summary>
public enum RetryStrategy
{
    /// <summary>
    /// No retries - fail immediately on first error
    /// </summary>
    None,

    /// <summary>
    /// Fixed delay between retries (e.g., 1s, 1s, 1s)
    /// </summary>
    FixedDelay,

    /// <summary>
    /// Exponential backoff (e.g., 1s, 2s, 4s, 8s)
    /// </summary>
    ExponentialBackoff,

    /// <summary>
    /// Random jitter to prevent thundering herd (e.g., 1s±0.5s, 2s±1s)
    /// </summary>
    RandomJitter
}
```

### Configuration Enums
Enums used for configuration need clear guidance:

```csharp
/// <summary>
/// Texture compression quality
/// </summary>
public enum CompressionQuality
{
    /// <summary>
    /// Low quality, high compression (smallest file size, fastest loading)
    /// </summary>
    Low,

    /// <summary>
    /// Medium quality, balanced compression (recommended for most use cases)
    /// </summary>
    Medium,

    /// <summary>
    /// High quality, low compression (best visual quality, larger files)
    /// </summary>
    High,

    /// <summary>
    /// No compression (maximum quality, largest files, slowest loading)
    /// </summary>
    None
}
```

### State Machine Enums
State enums need context about transitions:

```csharp
/// <summary>
/// VRM loading state
/// </summary>
public enum LoadingState
{
    /// <summary>
    /// Not started - initial state
    /// </summary>
    NotStarted,

    /// <summary>
    /// Loading in progress - can transition to Loaded or Failed
    /// </summary>
    Loading,

    /// <summary>
    /// Successfully loaded - VRM ready to use
    /// </summary>
    Loaded,

    /// <summary>
    /// Loading failed - check ErrorMessage for details
    /// </summary>
    Failed
}
```

## Enum Documentation with Additional Context

### Enum with Remarks
```csharp
/// <summary>
/// Cache eviction strategy
/// </summary>
/// <remarks>
/// Strategy determines which items are removed when cache is full.
/// Choose based on your access patterns and performance requirements.
/// </remarks>
public enum EvictionStrategy
{
    /// <summary>
    /// Least Recently Used - removes items not accessed recently
    /// </summary>
    /// <remarks>
    /// Best for temporal locality patterns.
    /// Performance: O(1) access, O(1) eviction.
    /// </remarks>
    LRU,

    /// <summary>
    /// Least Frequently Used - removes items accessed least often
    /// </summary>
    /// <remarks>
    /// Best for frequency-based patterns.
    /// Performance: O(log n) access, O(log n) eviction.
    /// </remarks>
    LFU,

    /// <summary>
    /// First In First Out - removes oldest items first
    /// </summary>
    /// <remarks>
    /// Simplest strategy, predictable behavior.
    /// Performance: O(1) access, O(1) eviction.
    /// </remarks>
    FIFO
}
```

### Enum with Usage Examples
```csharp
/// <summary>
/// Animation wrap mode
/// </summary>
public enum WrapMode
{
    /// <summary>
    /// Play once and stop at the end
    /// </summary>
    /// <example>
    /// <code>
    /// controller.PlayAnimation("wave", WrapMode.Once);
    /// </code>
    /// </example>
    Once,

    /// <summary>
    /// Loop indefinitely until manually stopped
    /// </summary>
    /// <example>
    /// <code>
    /// controller.PlayAnimation("idle", WrapMode.Loop);
    /// </code>
    /// </example>
    Loop,

    /// <summary>
    /// Play forward then backward repeatedly (ping-pong)
    /// </summary>
    /// <example>
    /// <code>
    /// controller.PlayAnimation("breathe", WrapMode.PingPong);
    /// </code>
    /// </example>
    PingPong
}
```

## IntelliSense Experience

**What developers see when selecting an enum value:**

```
AnimationMode.VRMAnimation

VRM Animation using VRMA files via UniVRM
```

**During method call:**
```
PlayAnimation("idle", WrapMode.|)
                              ^
                              IntelliSense shows:
                              - Once (Play once and stop)
                              - Loop (Loop indefinitely)
                              - PingPong (Play forward then backward)
```

## Flags Enum Special Considerations

### Clear Bit Meanings
```csharp
/// <summary>
/// File access permissions
/// </summary>
[Flags]
public enum FilePermissions
{
    /// <summary>
    /// No permissions
    /// </summary>
    None = 0,

    /// <summary>
    /// Read permission - can view file contents
    /// </summary>
    Read = 1 << 0,  // 0001

    /// <summary>
    /// Write permission - can modify file contents
    /// </summary>
    Write = 1 << 1,  // 0010

    /// <summary>
    /// Execute permission - can run file as program
    /// </summary>
    Execute = 1 << 2,  // 0100

    /// <summary>
    /// Delete permission - can remove file
    /// </summary>
    Delete = 1 << 3,  // 1000

    /// <summary>
    /// All permissions - combination of Read, Write, Execute, and Delete
    /// </summary>
    All = Read | Write | Execute | Delete
}
```

### Combined Values
```csharp
/// <summary>
/// Common read/write permissions - equivalent to Read | Write
/// </summary>
ReadWrite = Read | Write,

/// <summary>
/// Full control - equivalent to Read | Write | Execute | Delete
/// </summary>
FullControl = All
```

## Rationale

**Why document every enum value:**

**IntelliSense Value:**
- Enum values show in dropdown during coding
- Documentation appears immediately
- Helps developers choose correct value without external reference

**Self-Documenting Code:**
- Clear enum names + documentation = self-explanatory code
- Reduces questions during code review
- Makes code maintainable

**API Contract:**
- Enum values are part of public API
- Documentation is part of the contract
- Changes to meaning should update docs

**Developer Experience:**
- No need to consult external documentation
- Faster development
- Fewer mistakes

## Best Practices

1. **Document every value** - Even if name seems obvious
2. **Explain when to use** - Help developers choose correctly
3. **Note special behaviors** - Document side effects or implications
4. **Be consistent** - Same style for all values in enum
5. **Add context if needed** - Use `<remarks>` for complex enums
6. **For flags enums** - Explain bit values and combinations
7. **Update on changes** - Keep docs in sync with code
