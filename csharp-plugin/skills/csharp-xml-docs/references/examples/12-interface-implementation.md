# Interface vs Implementation

Full documentation in interface, `<inheritdoc/>` in implementation.

## Principle

**CRITICAL PATTERN**: Interfaces define the API contract with full documentation. Implementation classes use `<inheritdoc/>` to inherit that documentation and add only implementation-specific details.

This is the most important best practice for maintaining clean, DRY documentation.

## 3-Level Documentation Strategy

### Level 1: Interface (API Contract)
Document the "what" - method purpose, parameters, return semantics, preconditions

### Level 2/3: Implementation (Specific Details)
Use `<inheritdoc/>` + add only implementation-specific "how" details

##✅ Good Examples

### Interface: Full Documentation
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
    /// false: Playback start failed (Context not ready, invalid path, animation not found, etc.)
    /// </returns>
    /// <remarks>
    /// <strong>Preconditions:</strong><br/>
    /// • Context must be ready (IsReady = true)<br/>
    /// • animationPath must not be null and must be valid format
    /// </remarks>
    UniTask<bool> PlayAnimationAsync(string animationPath, WrapMode wrapMode);
}
```

### Implementation: `<inheritdoc/>` + Specifics
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

### Multiple Implementations
```csharp
// Interface
public interface IActionHandler
{
    /// <summary>
    /// Executes individual action asynchronously
    /// </summary>
    /// <param name="action">Action definition to execute</param>
    /// <returns>Action execution result</returns>
    UniTask<ActionResult> ExecuteAsync(EventAction action);
}

// Implementation 1
public class PlayerPrefsActionHandler : IActionHandler
{
    /// <inheritdoc/>
    /// <remarks>
    /// <strong>PlayerPrefs parameters:</strong><br/>
    /// • operation: "save" | "merge" | "load"<br/>
    /// • key: PlayerPrefs key (template: "Player_{id}")
    /// </remarks>
    public async UniTask<ActionResult> ExecuteAsync(EventAction action)
    {
        // PlayerPrefs-specific implementation
    }
}

// Implementation 2
public class SceneActionHandler : IActionHandler
{
    /// <inheritdoc/>
    /// <remarks>
    /// <strong>Scene parameters:</strong><br/>
    /// • operation: "load" | "unload" | "activate"<br/>
    /// • sceneName: Unity scene name or path
    /// </remarks>
    public async UniTask<ActionResult> ExecuteAsync(EventAction action)
    {
        // Scene-specific implementation
    }
}
```

## ❌ Bad Examples

### Anti-Pattern 1: Implementation Details in Interface
```csharp
// ❌ Bad: Interface has implementation details
public interface IVTuberAnimationController
{
    /// <summary>Plays animation asynchronously</summary>
    /// <remarks>
    /// <strong>Smart Routing:</strong><br/>
    /// • "VRMA/" → VRMAnimationSystem (UniVRM-based)<br/>
    /// • "State/" → AnimatorControllerSystem (Mecanim)<br/><br/>
    /// <strong>Failure conditions (returns false):</strong><br/>
    /// • VTuber Context not ready (IsReady = false)<br/>
    /// • VRM Model not loaded<br/>
    /// • animationPath is null or empty string<br/>
    /// • Unknown Animation Path prefix (other than VRMA/, State/)<br/>
    /// • AnimatorController Path format error (Layer segment missing)<br/>
    /// • AnimatorController Layer parsing failure<br/>
    /// • Animation System activation failure<br/>
    /// • Specified Animation not found
    /// </remarks>
    UniTask<bool> PlayAnimationAsync(string animationPath, WrapMode wrapMode);
}
```

**Why it's bad**: Implementation details like routing logic, specific prefixes, and detailed failure modes belong in the implementation class, not the interface.

### Anti-Pattern 2: Verbose Implementation Details
```csharp
// ❌ Bad: Too much detail in implementation
public partial class VRMController : IVTuberAnimationController
{
    /// <inheritdoc/>
    /// <remarks>
    /// <strong>Smart Routing behavior:</strong><br/>
    /// 1. Split Animation Path by "/" character<br/>
    /// 2. Determine first segment as prefix<br/>
    /// 3. Select VRMAnimationSystem when "VRMA/" prefix detected<br/>
    /// 4. Select AnimatorControllerSystem when "State/" prefix detected<br/>
    /// 5. Return false for unknown prefix<br/><br/>
    /// <strong>VRMAnimation processing:</strong><br/>
    /// • Check VRMAnimationConfig existence<br/>
    /// • Auto-load if Animation not loaded<br/>
    /// • Apply WrapMode for playback<br/><br/>
    /// <strong>AnimatorController processing:</strong><br/>
    /// • Parse "State/{Layer}/{Identifier}" format<br/>
    /// • Validate Layer name (exists in AnimatorController)<br/>
    /// • Play with CrossFadeInFixedTime<br/>
    /// • WrapMode ignored (due to Mecanim characteristics)
    /// </remarks>
    public async UniTask<bool> PlayAnimationAsync(string animationPath, WrapMode wrapMode)
    {
        // Implementation...
    }
}
```

**Why it's bad**: Too much detail. Implementation remarks should be scannable and concise - key points only.

### Anti-Pattern 3: Missing `<inheritdoc/>`
```csharp
// ❌ Bad: Duplicating interface documentation
public partial class VRMController : IVTuberAnimationController
{
    /// <summary>
    /// Plays animation asynchronously
    /// </summary>
    /// <param name="animationPath">Animation path</param>
    /// <param name="wrapMode">Playback mode</param>
    /// <returns>true if succeeded, false otherwise</returns>
    /// <remarks>
    /// [... Implementation details ...]
    /// </remarks>
    public async UniTask<bool> PlayAnimationAsync(string animationPath, WrapMode wrapMode)
    {
        // Implementation...
    }
}
```

**Why it's bad**: Duplicates documentation from interface. Use `<inheritdoc/>` to stay DRY (Don't Repeat Yourself).

## What to Include Where

### Interface Documentation Should Include:
- ✅ Method purpose and responsibility
- ✅ Parameter meanings (generic)
- ✅ Return value semantics (generic)
- ✅ Generic preconditions and postconditions
- ✅ Expected behavior and guarantees
- ✅ Exceptions that are part of the contract

### Interface Documentation Should NOT Include:
- ❌ Implementation details or algorithms
- ❌ Specific routing or processing logic
- ❌ Internal data structures used
- ❌ Performance characteristics of specific implementation
- ❌ Implementation-specific failure modes

### Implementation Documentation Should Include:
- ✅ `<inheritdoc/>` to inherit interface documentation
- ✅ Implementation-specific parameter formats
- ✅ Main failure scenarios (concise)
- ✅ Important implementation notes (concise)
- ✅ Performance characteristics if relevant

### Implementation Documentation Should NOT Include:
- ❌ Duplication of interface documentation
- ❌ Step-by-step algorithm details
- ❌ Verbose internal processing descriptions
- ❌ Everything the code already shows

## Conciseness in Implementation Remarks

### ✅ Good: Scannable with `<strong>` Tags (1-3 Points)
```csharp
/// <inheritdoc/>
/// <remarks>
/// <strong>Implementation:</strong> Path prefix routing ("VRMA/" or "State/{Layer}/{State}")<br/>
/// <strong>Main Failures:</strong> Unknown prefix, activation failure, invalid layer<br/>
/// <strong>Note:</strong> wrapMode ignored for AnimatorController
/// </remarks>
```

### ❌ Bad: Too Verbose
```csharp
/// <inheritdoc/>
/// <remarks>
/// This implementation uses a sophisticated path-based routing mechanism.
/// First, it analyzes the animation path to determine which system should
/// handle the request. If the path starts with "VRMA/", it routes to the
/// VRMAnimationSystem. If it starts with "State/", it routes to the
/// AnimatorControllerSystem. The VRMAnimation system respects the wrapMode
/// parameter, but the AnimatorController system does not because Mecanim
/// has its own internal loop handling...
/// </remarks>
```

## Korean Examples

### Interface
```csharp
/// <summary>
/// VTuber 애니메이션 제어 전용 인터페이스
/// </summary>
/// <remarks>
/// 애니메이션 재생만 제어하는 클라이언트를 위한 인터페이스.<br/>
/// 상태 조회 및 Observable 기능은 별도 인터페이스로 분리됨 (ISP 준수).
/// </remarks>
public interface IVTuberAnimationController
{
    /// <summary>
    /// 애니메이션을 비동기로 재생
    /// </summary>
    /// <param name="animationPath">애니메이션 경로</param>
    /// <param name="wrapMode">재생 모드 (Loop/Once/PingPong)</param>
    /// <returns>
    /// true: 재생 시작 성공<br/>
    /// false: 재생 시작 실패
    /// </returns>
    UniTask<bool> PlayAnimationAsync(string animationPath, WrapMode wrapMode);
}
```

### Implementation
```csharp
public partial class VRMController : IVTuberAnimationController
{
    /// <inheritdoc/>
    /// <remarks>
    /// <strong>구현 방식:</strong> 경로 prefix 기반 자동 라우팅 ("VRMA/" → VRMAnimation, "State/{Layer}/{Identifier}" → AnimatorController)<br/>
    /// <strong>주요 실패 사유:</strong> 알 수 없는 prefix, System 활성화 실패, 잘못된 Layer/Identifier<br/>
    /// <strong>참고:</strong> AnimatorController 사용 시 wrapMode 무시됨
    /// </remarks>
    public async UniTask<bool> PlayAnimationAsync(string animationPath, WrapMode wrapMode)
    {
        // Implementation...
    }
}
```

## Benefits of This Pattern

**For API Users:**
- See complete contract in interface
- Understand what's guaranteed vs implementation-specific
- IntelliSense shows interface documentation

**For Implementers:**
- Don't repeat yourself (DRY)
- Focus on implementation specifics
- Easier to maintain documentation

**For Code Reviewers:**
- Clear separation of contract vs implementation
- Easy to spot contract violations
- Implementation details in one place

## Rationale

**Why separate interface and implementation docs?**
- Interfaces define contracts - these rarely change
- Implementations may vary - details belong with specific implementation
- Multiple implementations of same interface need different details
- Reduces duplication and maintenance burden
- Makes documentation more accurate and useful

**Why keep implementation docs concise?**
- Code already shows the "how"
- Developers can read implementation
- Verbose docs get outdated quickly
- Focus on non-obvious aspects only
- Use bullet points with `<strong>` for scannability
