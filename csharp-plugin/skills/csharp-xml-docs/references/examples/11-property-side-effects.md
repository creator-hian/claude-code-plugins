# Property Side Effects: Use `<value>` Tag

Use `<value>` when getter/setter have non-obvious behavior.

## Principle

Most properties are simple getters and setters. When a property has side effects, non-obvious behavior, or triggers actions, use the `<value>` tag to document this clearly.

## ✅ Good Examples

### Property with Side Effects
```csharp
/// <summary>
/// Current animation mode
/// </summary>
/// <value>
/// Gets or sets the animation mode. Setting this value automatically switches
/// the underlying animation system. Returns null if no system is active.
/// </value>
public AnimationMode? CurrentMode
{
    get => _currentSystem?.Mode;
    set
    {
        if (value.HasValue)
            ActivateAnimationSystemAsync(value.Value).Forget();
    }
}
```

**Why it's good**: Documents that setting the property triggers system switching, and getter can return null.

### Property with Validation
```csharp
/// <summary>
/// Maximum retry attempts
/// </summary>
/// <value>
/// Gets or sets the maximum retry count. Setting this property validates
/// the value is between 1 and 10, throwing ArgumentOutOfRangeException
/// if outside this range.
/// </value>
public int MaxRetries
{
    get => _maxRetries;
    set
    {
        if (value < 1 || value > 10)
            throw new ArgumentOutOfRangeException(nameof(value), "Must be between 1 and 10");
        _maxRetries = value;
    }
}
```

### Property Triggering Events
```csharp
/// <summary>
/// User's display name
/// </summary>
/// <value>
/// Gets or sets the display name. Setting this property triggers
/// the OnDisplayNameChanged event if the value actually changes.
/// Maximum length is 50 characters; longer values are automatically truncated.
/// </value>
public string DisplayName
{
    get => _displayName;
    set
    {
        var truncated = value?.Length > 50 ? value.Substring(0, 50) : value;
        if (_displayName != truncated)
        {
            var oldValue = _displayName;
            _displayName = truncated;
            OnDisplayNameChanged?.Invoke(oldValue, truncated);
        }
    }
}
```

### Property with Lazy Initialization
```csharp
/// <summary>
/// Configuration manager instance
/// </summary>
/// <value>
/// Gets the configuration manager, initializing it on first access if not already initialized.
/// Subsequent accesses return the cached instance. Thread-safe.
/// </value>
public ConfigurationManager Config
{
    get
    {
        if (_config == null)
        {
            lock (_lock)
            {
                if (_config == null)
                    _config = new ConfigurationManager();
            }
        }
        return _config;
    }
}
```

### Korean Example
```csharp
/// <summary>
/// 현재 애니메이션 모드
/// </summary>
/// <value>
/// 애니메이션 모드를 가져오거나 설정합니다. 값을 설정하면 자동으로
/// 기본 애니메이션 시스템이 전환됩니다. 활성화된 시스템이 없으면 null을 반환합니다.
/// </value>
public AnimationMode? CurrentMode
{
    get => _currentSystem?.Mode;
    set
    {
        if (value.HasValue)
            ActivateAnimationSystemAsync(value.Value).Forget();
    }
}
```

## ❌ Bad Examples (When `<value>` is NOT Needed)

### Simple Auto-Property
```csharp
// ❌ Bad: Unnecessary <value> tag
/// <summary>
/// User's email address
/// </summary>
/// <value>
/// Gets or sets the user's email address.
/// </value>
public string Email { get; set; }
```

**Why it's bad**: Auto-property with obvious behavior doesn't need `<value>`.

**Better:**
```csharp
/// <summary>
/// User's email address
/// </summary>
public string Email { get; set; }
```

### Simple Computed Property
```csharp
// ❌ Bad: Obvious behavior
/// <summary>
/// Number of active users
/// </summary>
/// <value>
/// Returns the count of users in the Users collection.
/// </value>
public int UserCount => Users.Count;
```

**Why it's bad**: The computation is obvious from the code.

**Better:**
```csharp
/// <summary>
/// Number of active users
/// </summary>
public int UserCount => Users.Count;
```

### Read-Only Property
```csharp
// ❌ Bad: Redundant
/// <summary>
/// Indicates whether the model is loaded
/// </summary>
/// <value>
/// Returns true if the model is loaded, false otherwise.
/// </value>
public bool IsModelLoaded { get; private set; }
```

**Why it's bad**: Simple boolean flag doesn't need `<value>`.

**Better:**
```csharp
/// <summary>
/// Indicates whether the model is loaded
/// </summary>
public bool IsModelLoaded { get; private set; }
```

## When to Use `<value>`

### ✅ Use `<value>` When:

**1. Side Effects:**
```csharp
/// <value>
/// Setting this property saves changes to disk immediately.
/// </value>
public string ConfigValue
{
    get => _value;
    set
    {
        _value = value;
        SaveToDisk();  // Side effect!
    }
}
```

**2. Triggers Events:**
```csharp
/// <value>
/// Setting triggers OnPropertyChanged event.
/// </value>
public int Priority
{
    get => _priority;
    set
    {
        if (_priority != value)
        {
            _priority = value;
            OnPropertyChanged?.Invoke();  // Event!
        }
    }
}
```

**3. Validation/Transformation:**
```csharp
/// <value>
/// Setting automatically clamps value to range 0-100.
/// </value>
public int Percentage
{
    get => _percentage;
    set => _percentage = Math.Clamp(value, 0, 100);  // Transformation!
}
```

**4. Lazy Initialization:**
```csharp
/// <value>
/// Initializes the service on first access if not already initialized.
/// </value>
public IService Service
{
    get
    {
        if (_service == null)
            _service = ServiceFactory.Create();  // Lazy init!
        return _service;
    }
}
```

**5. Non-Obvious Getter Behavior:**
```csharp
/// <value>
/// Returns a deep clone of the internal collection.
/// Changes to returned collection don't affect internal state.
/// </value>
public List<Item> Items => new List<Item>(_items);  // Clone!
```

**6. Complex Computation:**
```csharp
/// <value>
/// Calculates total by summing all item values and applying tax.
/// Recalculated on each access; consider caching if accessed frequently.
/// </value>
public decimal Total => Items.Sum(i => i.Price) * (1 + TaxRate);  // Complex calc!
```

### ❌ Don't Use `<value>` When:

**1. Simple Auto-Properties:**
```csharp
public string Name { get; set; }
public int Age { get; set; }
public bool IsActive { get; set; }
```

**2. Obvious Computations:**
```csharp
public int Count => _list.Count;
public bool IsEmpty => Count == 0;
public string FullName => $"{FirstName} {LastName}";
```

**3. Simple Read-Only Properties:**
```csharp
public DateTime CreatedAt { get; private set; }
public string Id { get; }
```

## `<value>` Documentation Patterns

### Pattern 1: Side Effect Description
```csharp
/// <value>
/// Gets or sets the [property purpose].
/// Setting this property [side effect description].
/// Returns [special return behavior] if [condition].
/// </value>
```

### Pattern 2: Validation Description
```csharp
/// <value>
/// Gets or sets [property purpose].
/// Valid range: [min] to [max]. Values outside this range [what happens].
/// </value>
```

### Pattern 3: Performance Warning
```csharp
/// <value>
/// Gets [description]. [Expensive operation warning].
/// Cache the result if accessing multiple times.
/// </value>
```

### Pattern 4: Null Behavior
```csharp
/// <value>
/// Gets [description]. Returns null when [condition].
/// Check [related property] to determine if null is expected.
/// </value>
```

## Complete Examples

### Property with Multiple Side Effects
```csharp
/// <summary>
/// Active animation clip
/// </summary>
/// <value>
/// Gets or sets the active animation clip. Setting this property:
/// • Stops any currently playing animation
/// • Loads the new clip if not already loaded
/// • Triggers OnAnimationChanged event
/// • Returns null if no animation is active
/// </value>
public AnimationClip ActiveClip
{
    get => _activeClip;
    set
    {
        if (_activeClip != null)
            StopAnimation(_activeClip);

        _activeClip = value;

        if (value != null && !IsLoaded(value))
            LoadClip(value);

        OnAnimationChanged?.Invoke(value);
    }
}
```

### Property with Complex Getter
```csharp
/// <summary>
/// All registered handlers
/// </summary>
/// <value>
/// Returns a shallow copy of the handler dictionary.
/// Changes to the returned dictionary do not affect the internal registry.
/// This operation is O(n) where n is the number of registered handlers.
/// </value>
public Dictionary<string, IActionHandler> Handlers
{
    get => new Dictionary<string, IActionHandler>(_handlers);
}
```

## Rationale

**Why use `<value>` for non-obvious behavior:**

**Prevents Surprises:**
- Developers know property has side effects
- Unexpected behavior is documented
- Reduces debugging time

**Improves API Usability:**
- Clear documentation of property behavior
- Performance implications are visible
- Validation rules are explicit

**Enhances IntelliSense:**
- `<value>` content appears in IntelliSense
- Developers see behavior during coding
- Reduces need to read source code

**Documents Contracts:**
- Property behavior is part of API contract
- Side effects are explicit
- Callers can write correct code

**When NOT to use:**

**Reduces Noise:**
- Simple properties stay simple
- Documentation focuses on what's important
- Obvious behavior isn't repeated

**Best Practices:**

1. **Use `<value>` sparingly** - Only for non-obvious behavior
2. **Be specific** - Exactly what side effects occur?
3. **Mention null** - If property can return null unexpectedly
4. **Warn about performance** - If getter is expensive
5. **Document validation** - If setter validates or transforms
6. **Explain events** - If property triggers events
7. **Note thread-safety** - If concurrent access has special behavior
