# Keep It Simple

Concise summaries for straightforward elements. Don't over-document simple properties.

## Principle

Simple properties and fields are often self-explanatory from their names and types. Verbose documentation adds noise without value and makes code harder to scan.

## ✅ Good Examples

### Simple Property
```csharp
/// <summary>
/// Number of retry attempts
/// </summary>
public int RetryCount { get; set; }
```

### Multiple Simple Properties
```csharp
/// <summary>
/// Indicates whether the action executed successfully
/// </summary>
public bool Success { get; set; }

/// <summary>
/// Priority level of the action
/// </summary>
public int Priority { get; set; }

/// <summary>
/// Action execution timestamp
/// </summary>
public DateTime ExecutedAt { get; set; }
```

### Korean Example
```csharp
/// <summary>
/// 재시도 횟수
/// </summary>
public int RetryCount { get; set; }

/// <summary>
/// 액션 우선순위
/// </summary>
public int Priority { get; set; }
```

## ❌ Bad Examples (Over-Documented)

### Too Verbose
```csharp
/// <summary>
/// Gets or sets the number of retry attempts that have been made for this action.
/// This value is incremented each time the action is retried after a failure.
/// The initial value is 0, indicating no retries have occurred yet.
/// </summary>
/// <value>
/// An integer representing the count of retry attempts.
/// </value>
/// <remarks>
/// This property is automatically incremented by the retry mechanism.
/// The maximum number of retries is controlled by the MaxRetries configuration.
/// </remarks>
public int RetryCount { get; set; }
```

**Why it's bad**: The property name `RetryCount` already clearly indicates it's a count of retries. The type `int` tells us it's a number. All the additional information is redundant.

### Redundant Documentation
```csharp
/// <summary>
/// Gets or sets a boolean value indicating whether the action was successful or not.
/// </summary>
/// <value>
/// True if the action succeeded; false if the action failed.
/// </value>
public bool Success { get; set; }
```

**Why it's bad**: The name `Success` and type `bool` already convey all this information.

## When Simple Documentation Is Sufficient

Use concise `<summary>` only when:
- Property name clearly describes its purpose
- Type is self-explanatory
- No side effects in getter/setter
- No special validation or constraints
- Value range is obvious from context

## When to Add More Detail

Consider adding `<remarks>` if:
- Non-obvious relationship to other properties
- Special validation rules
- Performance implications
- Thread-safety concerns
- Unexpected behavior or constraints

See [Add Context Where Needed](02-add-context.md) for guidance on complex properties.

## Rationale

**Benefits of concise documentation:**
- Easier to scan code
- Less maintenance burden
- Reduces cognitive load
- IntelliSense shows essentials first
- Focuses attention on truly complex parts

**The "self-documenting code" principle:**
- Well-named properties need minimal documentation
- Type system provides information
- Let the code speak for itself when it can
- Save detailed documentation for non-obvious cases
