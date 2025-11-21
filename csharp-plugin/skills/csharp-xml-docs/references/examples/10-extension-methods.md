# Extension Methods: Document the Extended Type

Always document the extended type in the `this` parameter.

## Principle

Extension methods add functionality to existing types. Documentation should make it clear what type is being extended and how the extension adds value.

## ✅ Good Examples

### Basic Extension Method
```csharp
/// <summary>
/// VRMController extension methods for animation configuration
/// </summary>
public static class VRMAnimationExtensions
{
    /// <summary>
    /// Activates animation system using ConfigAsset
    /// </summary>
    /// <param name="controller">VRMController instance</param>
    /// <param name="configAsset">Configuration asset to apply</param>
    /// <returns>
    /// true: Activation succeeded<br/>
    /// false: Activation failed
    /// </returns>
    public static async UniTask<bool> ActivateWithConfigAsset(
        this VRMController controller,
        VRMAnimationConfigAsset configAsset)
    {
        // Implementation...
    }
}
```

### Extension with Validation
```csharp
/// <summary>
/// Safely activates animation system with validation
/// </summary>
/// <param name="controller">VRMController instance to extend</param>
/// <param name="configAsset">Configuration asset to validate and apply</param>
/// <returns>
/// Tuple containing success status and descriptive message
/// </returns>
/// <exception cref="ArgumentNullException">
/// Thrown when controller or configAsset is null
/// </exception>
public static async UniTask<(bool success, string message)> SafeActivateWithConfigAsset(
    this VRMController controller,
    VRMAnimationConfigAsset configAsset)
{
    if (controller == null)
        throw new ArgumentNullException(nameof(controller));

    if (configAsset == null)
        throw new ArgumentNullException(nameof(configAsset));

    // Validation and activation...
}
```

### Extension Class Documentation
```csharp
/// <summary>
/// Extension methods for IEnumerable&lt;T&gt; providing additional LINQ-like operations
/// </summary>
/// <remarks>
/// These extensions complement the standard LINQ operators with
/// domain-specific query operations for event action processing.
/// </remarks>
public static class EnumerableExtensions
{
    /// <summary>
    /// Filters actions by type
    /// </summary>
    /// <typeparam name="T">Action type</typeparam>
    /// <param name="source">Source collection</param>
    /// <param name="actionType">Action type to filter by</param>
    /// <returns>Filtered collection</returns>
    public static IEnumerable<T> OfActionType<T>(
        this IEnumerable<T> source,
        string actionType) where T : EventAction
    {
        return source.Where(x => x.ActionType == actionType);
    }
}
```

### Korean Example
```csharp
/// <summary>
/// VRMController 애니메이션 구성을 위한 확장 메서드
/// </summary>
public static class VRMAnimationExtensions
{
    /// <summary>
    /// ConfigAsset을 사용하여 애니메이션 시스템 활성화
    /// </summary>
    /// <param name="controller">VRMController 인스턴스</param>
    /// <param name="configAsset">적용할 구성 에셋</param>
    /// <returns>
    /// true: 활성화 성공<br/>
    /// false: 활성화 실패
    /// </returns>
    public static async UniTask<bool> ActivateWithConfigAsset(
        this VRMController controller,
        VRMAnimationConfigAsset configAsset)
    {
        // Implementation...
    }
}
```

## ❌ Bad Examples

### Missing `this` Parameter Documentation
```csharp
// ❌ Bad: Doesn't document what type is being extended
/// <summary>
/// Activates animation system using ConfigAsset
/// </summary>
/// <param name="configAsset">Configuration asset to apply</param>
public static async UniTask<bool> ActivateWithConfigAsset(
    this VRMController controller,  // Not documented!
    VRMAnimationConfigAsset configAsset)
{
    // Implementation...
}
```

**Why it's bad**: Users don't know what type is being extended or what the parameter represents.

### Generic "this" Documentation
```csharp
// ❌ Bad: Vague documentation
/// <summary>
/// Activates with config
/// </summary>
/// <param name="controller">The controller</param>
/// <param name="configAsset">The config</param>
public static async UniTask<bool> ActivateWithConfigAsset(
    this VRMController controller,
    VRMAnimationConfigAsset configAsset)
{
    // Implementation...
}
```

**Why it's bad**: Doesn't clarify the extension's purpose or value added to the base type.

### Undocumented Extension Class
```csharp
// ❌ Bad: No class-level documentation
public static class VRMAnimationExtensions
{
    /// <summary>Activates animation system</summary>
    public static async UniTask<bool> ActivateWithConfigAsset(
        this VRMController controller,
        VRMAnimationConfigAsset configAsset)
    {
        // Implementation...
    }
}
```

**Why it's bad**: Doesn't explain the overall purpose of the extension class.

## Extension Method Patterns

### Pattern 1: Convenience Wrapper
```csharp
/// <summary>
/// Loads and plays animation in one call
/// </summary>
/// <param name="controller">VRMController instance</param>
/// <param name="path">Animation path</param>
/// <returns>true if loaded and playing successfully</returns>
/// <remarks>
/// Convenience method combining LoadAnimationAsync and PlayAnimationAsync.
/// </remarks>
public static async UniTask<bool> LoadAndPlayAsync(
    this VRMController controller,
    string path)
{
    if (!await controller.LoadAnimationAsync(path))
        return false;

    return await controller.PlayAnimationAsync(path, WrapMode.Loop);
}
```

### Pattern 2: Fluent Interface
```csharp
/// <summary>
/// String extension methods for fluent validation
/// </summary>
public static class StringExtensions
{
    /// <summary>
    /// Validates that string is not null or empty
    /// </summary>
    /// <param name="value">String to validate</param>
    /// <param name="paramName">Parameter name for exception message</param>
    /// <returns>The validated string for chaining</returns>
    /// <exception cref="ArgumentNullException">Thrown when value is null or empty</exception>
    public static string ThrowIfNullOrEmpty(
        this string value,
        string paramName)
    {
        if (string.IsNullOrEmpty(value))
            throw new ArgumentNullException(paramName);

        return value;
    }

    /// <summary>
    /// Validates that string matches a pattern
    /// </summary>
    /// <param name="value">String to validate</param>
    /// <param name="pattern">Regex pattern to match</param>
    /// <param name="paramName">Parameter name for exception message</param>
    /// <returns>The validated string for chaining</returns>
    public static string ThrowIfNotMatches(
        this string value,
        string pattern,
        string paramName)
    {
        if (!Regex.IsMatch(value, pattern))
            throw new ArgumentException($"Must match pattern {pattern}", paramName);

        return value;
    }
}

// Usage (fluent):
// username.ThrowIfNullOrEmpty(nameof(username))
//         .ThrowIfNotMatches(@"^[a-zA-Z0-9]+$", nameof(username));
```

### Pattern 3: Domain-Specific Operations
```csharp
/// <summary>
/// Event action collection extensions for filtering and processing
/// </summary>
public static class EventActionCollectionExtensions
{
    /// <summary>
    /// Filters actions that are currently skipped
    /// </summary>
    /// <param name="actions">Action collection</param>
    /// <returns>Collection of skipped actions</returns>
    public static IEnumerable<EventAction> WhereSkipped(
        this IEnumerable<EventAction> actions)
    {
        return actions.Where(a => a.Skipped);
    }

    /// <summary>
    /// Filters actions that failed execution
    /// </summary>
    /// <param name="actions">Action collection</param>
    /// <returns>Collection of failed actions</returns>
    public static IEnumerable<EventAction> WhereFailed(
        this IEnumerable<EventAction> actions)
    {
        return actions.Where(a => !a.Success && !a.Skipped);
    }
}
```

## Class-Level Documentation

### Extension Class with Clear Purpose
```csharp
/// <summary>
/// Extension methods for Unity Transform providing VRM-specific operations
/// </summary>
/// <remarks>
/// <para>
/// <strong>Key Features:</strong><br/>
/// • Bone hierarchy navigation for VRM models<br/>
/// • Humanoid bone lookups compatible with UniVRM<br/>
/// • Transform manipulation with VRM constraints
/// </para>
/// <para>
/// These extensions are designed specifically for VRM models and may not
/// work correctly with non-VRM character rigs.
/// </para>
/// </remarks>
public static class TransformVRMExtensions
{
    // Extension methods...
}
```

### Extension Class Grouping Multiple Types
```csharp
/// <summary>
/// Extension methods for common Unity types used in VTuber system
/// </summary>
/// <remarks>
/// Provides VTuber-specific extensions for:
/// • GameObject - VRM component access
/// • Transform - Bone manipulation
/// • Animator - VRM-compatible animation control
/// </remarks>
public static class VTuberExtensions
{
    /// <summary>
    /// Gets VRM controller from GameObject
    /// </summary>
    public static VRMController GetVRMController(this GameObject gameObject)
    {
        // Implementation...
    }

    /// <summary>
    /// Finds bone by name in VRM hierarchy
    /// </summary>
    public static Transform FindVRMBone(this Transform transform, string boneName)
    {
        // Implementation...
    }

    /// <summary>
    /// Plays VRM animation on Animator
    /// </summary>
    public static void PlayVRMAnimation(this Animator animator, string animationName)
    {
        // Implementation...
    }
}
```

## When to Create Extension Methods

### ✅ Good Use Cases:

**1. Add convenience to third-party types:**
```csharp
/// <summary>Extensions for UniTask adding retry capabilities</summary>
public static class UniTaskExtensions
{
    /// <summary>Executes UniTask with exponential backoff retry</summary>
    public static async UniTask<T> WithRetry<T>(
        this UniTask<T> task,
        int maxRetries = 3)
    {
        // Implementation...
    }
}
```

**2. Domain-specific operations:**
```csharp
/// <summary>Extensions for List&lt;EventAction&gt; with event processing operations</summary>
public static class EventActionListExtensions
{
    /// <summary>Executes all actions in sequence</summary>
    public static async UniTask<List<ActionResult>> ExecuteAllAsync(
        this List<EventAction> actions)
    {
        // Implementation...
    }
}
```

**3. Fluent interfaces:**
```csharp
/// <summary>Extensions for building fluent validation chains</summary>
public static class ValidationExtensions
{
    /// <summary>Validates and returns self for chaining</summary>
    public static T Validate<T>(this T obj, Action<T> validator)
    {
        validator(obj);
        return obj;
    }
}
```

### ❌ When NOT to Use Extension Methods:

- When you control the original type (just add to the class)
- For complex operations that need multiple private helpers
- When it's not intuitive that the operation belongs on that type
- For operations that significantly change type behavior

## Rationale

**Why document the extended type:**

**Discoverability:**
- Developers need to know what type gains the functionality
- IntelliSense shows extensions when using the type
- Documentation appears with the extended type

**Clarity:**
- Makes the extension's purpose clear
- Shows relationship to base type
- Helps developers understand when to use it

**API Contract:**
- Extension parameter is part of the public API
- Callers need to know what they're calling it on
- Documentation completes the contract

**Best Practices:**

1. **Always document the `this` parameter** - Name and type being extended
2. **Explain the value added** - What does extension add to base type?
3. **Document the extension class** - Overall purpose of the extension set
4. **Group related extensions** - Keep related extensions in one class
5. **Consider namespace** - Put in namespace that makes sense for discoverability
6. **Follow naming conventions** - Use clear, descriptive extension method names
