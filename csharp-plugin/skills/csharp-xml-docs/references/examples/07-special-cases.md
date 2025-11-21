# Document Special Cases

Magic numbers, unusual behaviors, and important notes deserve explanation.

## Principle

When code behaves in non-obvious ways, has special constraints, or contains "magic numbers," document it explicitly. Future developers (including yourself) will thank you.

## ✅ Good Examples

### Magic Numbers with Explanation
```csharp
/// <summary>
/// Returns performance grade based on execution time
/// </summary>
/// <remarks>
/// <list type="table">
/// <item><term>Fast</term><description>&lt; 10ms</description></item>
/// <item><term>Normal</term><description>10-50ms</description></item>
/// <item><term>Slow</term><description>50-200ms</description></item>
/// <item><term>Critical</term><description>&gt;= 200ms</description></item>
/// </list>
/// </remarks>
public string GetPerformanceGrade()
{
    var ms = ExecutionTime.TotalMilliseconds;
    return ms switch
    {
        < 10 => "Fast",
        < 50 => "Normal",
        < 200 => "Slow",
        _ => "Critical",
    };
}
```

**Why it's good**: Thresholds (10, 50, 200) are explained and visible in documentation.

### Unusual Behavior
```csharp
/// <summary>
/// Creates skipped result
/// </summary>
/// <remarks>
/// Skipping is not considered an error, so Success is set to true.
/// </remarks>
public static ActionResult CreateSkipped(string actionType, string reason)
{
    return new ActionResult
    {
        Success = true,  // Skipping is not an error
        Skipped = true,
        ActionType = actionType,
        Message = $"{actionType} action skipped: {reason}",
        SkipReason = reason,
    };
}
```

**Why it's good**: Documents the counterintuitive behavior that Success=true for skipped actions.

### Special Constraints
```csharp
/// <summary>
/// Maximum retry attempts
/// </summary>
/// <remarks>
/// Valid range: 1-10. Values outside this range throw ArgumentOutOfRangeException.
/// Setting to 0 disables retry mechanism entirely.
/// </remarks>
public int MaxRetries
{
    get => _maxRetries;
    set
    {
        if (value < 0 || value > 10)
            throw new ArgumentOutOfRangeException(nameof(value), "Must be between 0 and 10");
        _maxRetries = value;
    }
}
```

**Why it's good**: Documents the constraint and the special case (0 = disabled).

### Performance Implications
```csharp
/// <summary>
/// All registered action handlers
/// </summary>
/// <remarks>
/// This property performs a deep clone on each access.
/// Cache the result if you need to iterate multiple times.
/// </remarks>
public Dictionary<string, IActionHandler> Handlers
{
    get => new Dictionary<string, IActionHandler>(_handlers);
}
```

**Why it's good**: Warns about performance implication of repeated access.

### Korean Example
```csharp
/// <summary>
/// 최대 재시도 횟수
/// </summary>
/// <remarks>
/// 유효 범위: 1-10. 이 범위를 벗어나면 ArgumentOutOfRangeException이 발생합니다.
/// 0으로 설정하면 재시도 메커니즘이 완전히 비활성화됩니다.
/// </remarks>
public int MaxRetries { get; set; }
```

## ❌ Bad Examples

### Undocumented Magic Numbers
```csharp
/// <summary>
/// Returns performance grade
/// </summary>
public string GetPerformanceGrade()
{
    var ms = ExecutionTime.TotalMilliseconds;
    return ms switch
    {
        < 10 => "Fast",
        < 50 => "Normal",
        < 200 => "Slow",
        _ => "Critical",
    };
}
```

**Why it's bad**: No explanation for why 10, 50, 200 were chosen as thresholds.

### Undocumented Unusual Behavior
```csharp
/// <summary>
/// Creates skipped result
/// </summary>
public static ActionResult CreateSkipped(string actionType, string reason)
{
    return new ActionResult
    {
        Success = true,  // Why true???
        Skipped = true,
    };
}
```

**Why it's bad**: Code comment asks "Why true?" - should be in XML docs, not inline comment.

### Missing Constraints
```csharp
/// <summary>
/// Maximum retry attempts
/// </summary>
public int MaxRetries { get; set; }
```

**Why it's bad**: Doesn't mention the 1-10 range constraint or that 0 disables retries.

## Types of Special Cases to Document

### 1. Magic Numbers
**When to document**: Any hard-coded number with business meaning

```csharp
/// <remarks>
/// Timeout after 30 seconds (based on average network latency + processing time).
/// </remarks>
public int TimeoutMs => 30000;
```

### 2. Unusual Return Values
**When to document**: Methods that return unexpected values in certain conditions

```csharp
/// <summary>
/// Gets current animation
/// </summary>
/// <remarks>
/// Returns null if no animation is playing OR if system is not initialized.
/// Check IsReady first to distinguish between these cases.
/// </remarks>
public Animation CurrentAnimation { get; }
```

### 3. Side Effects
**When to document**: Operations that change state beyond the obvious

```csharp
/// <summary>
/// Sets current animation mode
/// </summary>
/// <remarks>
/// Automatically stops any currently playing animation when changed.
/// Triggers OnModeChanged event.
/// </remarks>
public AnimationMode CurrentMode
{
    set
    {
        if (_currentMode != value)
        {
            StopCurrentAnimation();
            _currentMode = value;
            OnModeChanged?.Invoke(value);
        }
    }
}
```

### 4. Performance Characteristics
**When to document**: Operations with notable performance implications

```csharp
/// <summary>
/// Validates all actions in the event
/// </summary>
/// <remarks>
/// <strong>Performance Note:</strong> O(n²) complexity due to dependency checking.
/// For events with 100+ actions, consider using ValidateAsync with cancellation.
/// </remarks>
public bool ValidateAll()
{
    // Implementation with nested loops
}
```

### 5. Thread Safety
**When to document**: Concurrent access behavior

```csharp
/// <summary>
/// Registers action handler
/// </summary>
/// <remarks>
/// Thread-safe. Multiple threads can register handlers concurrently.
/// Registration changes are visible immediately to all threads.
/// </remarks>
public void RegisterHandler(string type, IActionHandler handler)
{
    _handlers.AddOrUpdate(type, handler, (k, v) => handler);
}
```

### 6. Null Handling
**When to document**: Non-standard null behavior

```csharp
/// <summary>
/// User's optional middle name
/// </summary>
/// <remarks>
/// null is valid and represents "no middle name".
/// Empty string is NOT allowed and will throw ArgumentException.
/// </remarks>
public string MiddleName
{
    get => _middleName;
    set
    {
        if (value == string.Empty)
            throw new ArgumentException("Use null for no middle name");
        _middleName = value;
    }
}
```

### 7. State Dependencies
**When to document**: Operations requiring specific state

```csharp
/// <summary>
/// Plays animation
/// </summary>
/// <remarks>
/// <strong>Precondition:</strong> IsReady must be true.
/// <strong>Throws:</strong> InvalidOperationException if called when not ready.
/// Call InitializeAsync first if IsReady is false.
/// </remarks>
public async UniTask PlayAsync(string animationPath)
{
    if (!IsReady)
        throw new InvalidOperationException("Not ready. Call InitializeAsync first.");
    // Implementation...
}
```

### 8. Data Format Requirements
**When to document**: Specific format expectations

```csharp
/// <summary>
/// Animation path
/// </summary>
/// <remarks>
/// <strong>Format:</strong> "VRMA/filename" or "State/Layer/StateName"<br/>
/// Examples: "VRMA/wave", "State/Base/Idle"
/// </remarks>
public string AnimationPath { get; set; }
```

## Documentation Patterns for Special Cases

### Pattern 1: Threshold Table
```csharp
/// <remarks>
/// <list type="table">
/// <item><term>Threshold</term><description>Meaning</description></item>
/// <item><term>&lt; 100</term><description>Low priority</description></item>
/// <item><term>100-500</term><description>Normal priority</description></item>
/// <item><term>&gt; 500</term><description>High priority</description></item>
/// </list>
/// </remarks>
```

### Pattern 2: Special Behavior Note
```csharp
/// <remarks>
/// <strong>Special Behavior:</strong> [Explanation]
/// </remarks>
```

### Pattern 3: Constraint List
```csharp
/// <remarks>
/// <strong>Constraints:</strong><br/>
/// • Must be between X and Y<br/>
/// • Cannot be null or empty<br/>
/// • Must match format [pattern]
/// </remarks>
```

### Pattern 4: Performance Warning
```csharp
/// <remarks>
/// <strong>Performance:</strong> [Implication]<br/>
/// <strong>Recommendation:</strong> [How to avoid issue]
/// </remarks>
```

## Rationale

**Why document special cases:**

**Prevents Bugs:**
- Developers understand constraints
- Edge cases are clear
- Assumptions are explicit

**Reduces Questions:**
- Code reviewers see rationale
- Team members don't need to ask
- Knowledge is preserved

**Improves Maintenance:**
- Future developers understand "why"
- Magic numbers make sense
- Unusual patterns are explained

**Aids Debugging:**
- Special behaviors are documented
- State requirements are clear
- Performance characteristics known

## When NOT to Document

### Don't document:
- **Standard behavior** (e.g., getters return values, setters set values)
- **Obvious constraints** (e.g., string can be any string)
- **Language features** (e.g., async methods are asynchronous)
- **Framework conventions** (e.g., Dispose disposes resources)

### DO document:
- **Non-standard behavior** (Success=true for skipped actions)
- **Business constraints** (MaxRetries must be 1-10)
- **Performance implications** (Deep clone on every access)
- **Magic numbers** (Timeout of 30000ms chosen because...)
