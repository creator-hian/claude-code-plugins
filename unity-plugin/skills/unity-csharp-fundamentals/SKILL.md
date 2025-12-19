---
name: unity-csharp-fundamentals
description: Unity C# fundamental patterns including TryGetComponent, SerializeField, RequireComponent, and safe coding practices. Essential patterns for robust Unity development. Use PROACTIVELY for any Unity C# code to ensure best practices.
requires:
  - csharp-plugin:csharp-code-style
---

# Unity C# Fundamentals - Essential Coding Patterns

## Overview

Core Unity C# patterns that every Unity developer must follow. These are not optimizations but **fundamental practices** for safe, maintainable Unity code.

**Foundation Required**: C# basics, Unity MonoBehaviour lifecycle

**Core Topics**:
- Component access patterns (TryGetComponent)
- Serialization attributes
- Component requirements and dependencies
- Null-safe coding patterns
- Unity-specific C# idioms

## Component Access Patterns

### TryGetComponent (Required Pattern)

**Always use `TryGetComponent` instead of `GetComponent`** for safe component access:

```csharp
// WRONG: GetComponent can return null silently
var rb = GetComponent<Rigidbody>(); // Might be null
rb.velocity = Vector3.zero; // NullReferenceException!

// CORRECT: TryGetComponent with null-safe check
if (TryGetComponent<Rigidbody>(out var rb))
{
    rb.velocity = Vector3.zero;
}

// CORRECT: Cache in Awake with validation
private Rigidbody _rb;

void Awake()
{
    if (!TryGetComponent(out _rb))
    {
        Debug.LogError($"Missing Rigidbody on {gameObject.name}", this);
    }
}
```

### TryGetComponent Benefits

| Aspect | GetComponent | TryGetComponent |
|--------|--------------|-----------------|
| Null Safety | Returns null silently | Returns bool, forces handling |
| GC Allocation | May allocate on missing | Zero allocation |
| Code Clarity | Requires separate null check | Explicit success/failure |
| Unity Version | All versions | 2019.2+ |

### Component Access Hierarchy

```csharp
// Self - always prefer TryGetComponent
if (TryGetComponent<Enemy>(out var enemy)) { }

// Children - use GetComponentInChildren with validation
var childEnemy = GetComponentInChildren<Enemy>();
if (childEnemy != null) { }

// Parent - use GetComponentInParent with validation
var parentController = GetComponentInParent<GameController>();
if (parentController != null) { }

// Multiple components - use list overload to avoid allocation
using (ListPool<Enemy>.Get(out var enemies))
{
    GetComponentsInChildren(enemies);
    foreach (var e in enemies) { }
}
```

## Global Object Search (Unity 2023.1+)

### FindAnyObjectByType (Preferred - Fastest)

**Use when any instance is acceptable** (order doesn't matter):

```csharp
// OBSOLETE: FindObjectOfType is deprecated
// var manager = FindObjectOfType<GameManager>(); // DON'T USE

// CORRECT: FindAnyObjectByType - fastest, unordered
var manager = FindAnyObjectByType<GameManager>();
if (manager != null)
{
    manager.Initialize();
}

// With inactive objects
var inactive = FindAnyObjectByType<GameManager>(FindObjectsInactive.Include);
```

### FindFirstObjectByType (Ordered)

**Use when deterministic order matters**:

```csharp
// CORRECT: FindFirstObjectByType - ordered, direct replacement
var manager = FindFirstObjectByType<GameManager>();

// With sorting mode
var sorted = FindFirstObjectByType<GameManager>(FindObjectsSortMode.InstanceID);
```

### FindObjectsByType (Multiple Objects)

```csharp
// OBSOLETE: FindObjectsOfType is deprecated
// var enemies = FindObjectsOfType<Enemy>(); // DON'T USE

// CORRECT: FindObjectsByType - faster, explicit sorting
var enemies = FindObjectsByType<Enemy>(FindObjectsSortMode.None); // Fastest
var sorted = FindObjectsByType<Enemy>(FindObjectsSortMode.InstanceID); // Ordered

// With inactive objects
var all = FindObjectsByType<Enemy>(
    FindObjectsInactive.Include,
    FindObjectsSortMode.None);
```

### Performance Comparison

| Method | Performance | Use Case |
|--------|-------------|----------|
| `FindAnyObjectByType` | Fastest | Any instance acceptable |
| `FindFirstObjectByType` | Fast | Need deterministic first |
| `FindObjectsByType(None)` | Fast | All objects, unordered |
| `FindObjectsByType(InstanceID)` | Slower | All objects, ordered |
| `FindObjectOfType` (obsolete) | Slowest | **Don't use** |

## Serialization Patterns

### SerializeField (Required for Inspector)

```csharp
public class PlayerController : MonoBehaviour
{
    // WRONG: Public field exposes internal state
    public float speed;

    // CORRECT: SerializeField with private backing
    [SerializeField] private float _speed = 5f;

    // CORRECT: With tooltip for designer clarity
    [SerializeField, Tooltip("Movement speed in units/second")]
    private float _moveSpeed = 5f;

    // CORRECT: With range constraint
    [SerializeField, Range(0f, 100f)]
    private float _health = 100f;

    // Read-only property for external access
    public float Speed => _speed;
}
```

### Common Serialization Attributes

```csharp
[SerializeField] // Expose private field to Inspector
[HideInInspector] // Hide public field from Inspector
[Header("Movement")] // Section header in Inspector
[Tooltip("Description")] // Hover tooltip
[Range(min, max)] // Slider constraint
[Min(0)] // Minimum value constraint
[TextArea(3, 10)] // Multi-line text field
[Multiline(5)] // Simple multi-line
[Space(10)] // Vertical spacing
[FormerlySerializedAs("oldName")] // Rename without data loss
```

## Component Requirements

### RequireComponent Attribute

```csharp
// Automatically adds required components
[RequireComponent(typeof(Rigidbody))]
[RequireComponent(typeof(Collider))]
public class PhysicsObject : MonoBehaviour
{
    private Rigidbody _rb;
    private Collider _collider;

    void Awake()
    {
        // Safe to use - components are guaranteed
        TryGetComponent(out _rb);
        TryGetComponent(out _collider);
    }
}
```

### DisallowMultipleComponent

```csharp
// Prevents duplicate components
[DisallowMultipleComponent]
public class GameManager : MonoBehaviour
{
    // Only one instance per GameObject allowed
}
```

## Null-Safe Patterns

### Null Coalescing for Unity Objects

```csharp
// WRONG: C# null coalescing doesn't work correctly with Unity Objects
var target = _cachedTarget ?? FindTarget(); // Broken!

// CORRECT: Explicit null check
var target = _cachedTarget != null ? _cachedTarget : FindTarget();

// CORRECT: Or use ternary with Unity's implicit bool
var target = _cachedTarget ? _cachedTarget : FindTarget();
```

### Null Conditional with Unity Objects

```csharp
// CAUTION: ?. works but doesn't check Unity's "fake null"
_enemy?.TakeDamage(10); // May not work as expected after Destroy

// CORRECT: Explicit check
if (_enemy != null)
{
    _enemy.TakeDamage(10);
}
```

### Safe Destroy Pattern

```csharp
// Clear reference after destroy
if (_spawnedObject != null)
{
    Destroy(_spawnedObject);
    _spawnedObject = null;
}

// Or use extension method
public static class UnityExtensions
{
    public static void DestroyAndClear<T>(ref T obj) where T : Object
    {
        if (obj != null)
        {
            Object.Destroy(obj);
            obj = null;
        }
    }
}
```

## Lifecycle Best Practices

### Initialization Order

```csharp
public class Example : MonoBehaviour
{
    [SerializeField] private DependencyA _depA;
    private DependencyB _depB;

    // 1. Awake: Self-initialization, get own components
    void Awake()
    {
        TryGetComponent(out _depB);
    }

    // 2. OnEnable: Subscribe to events (pairs with OnDisable)
    void OnEnable()
    {
        GameEvents.OnPlayerDied += HandlePlayerDied;
    }

    // 3. Start: Cross-object initialization, find other objects
    void Start()
    {
        var manager = FindFirstObjectByType<GameManager>();
    }

    // 4. OnDisable: Unsubscribe from events
    void OnDisable()
    {
        GameEvents.OnPlayerDied -= HandlePlayerDied;
    }

    // 5. OnDestroy: Final cleanup
    void OnDestroy()
    {
        // Cleanup resources
    }
}
```

### Caching Pattern

```csharp
public class CachedComponents : MonoBehaviour
{
    // Cache in Awake, use throughout lifetime
    private Transform _cachedTransform;
    private Rigidbody _rb;

    void Awake()
    {
        _cachedTransform = transform; // Cache transform
        TryGetComponent(out _rb);
    }

    void Update()
    {
        // Use cached references - no repeated lookups
        _cachedTransform.position += Vector3.forward * Time.deltaTime;
    }
}
```

## Best Practices Summary

1. **Always use TryGetComponent**: Never use bare GetComponent without null handling
2. **SerializeField over public**: Keep fields private, expose via SerializeField
3. **RequireComponent for dependencies**: Guarantee required components exist
4. **Cache component references**: Get once in Awake, reuse everywhere
5. **Explicit null checks**: Unity Objects need explicit != null checks
6. **Event subscription pairs**: OnEnable/OnDisable for event management
7. **Initialize in correct lifecycle**: Awake for self, Start for cross-object

## Anti-Patterns to Avoid

```csharp
// AVOID: GetComponent in Update
void Update()
{
    GetComponent<Rigidbody>().velocity = Vector3.zero; // Bad!
}

// AVOID: Public fields for serialization
public float speed; // Exposes internal state

// AVOID: Global search in loops (even modern APIs)
void Update()
{
    var manager = FindAnyObjectByType<GameManager>(); // Still slow in Update!
}

// AVOID: Obsolete FindObjectOfType
void Start()
{
    var manager = FindObjectOfType<GameManager>(); // OBSOLETE - don't use!
}

// AVOID: Null coalescing with Unity Objects
var obj = _cached ?? FindNew(); // Doesn't work correctly!
```

## Reference Documentation

### [Component Access Patterns](references/component-access.md)
Detailed component access patterns:
- TryGetComponent variations
- GetComponentInChildren/Parent patterns
- Component caching strategies
- Performance comparisons

### [Attributes and Patterns](references/attributes-patterns.md)
Complete attribute reference:
- Serialization attributes
- Inspector customization
- Execution order control
- Conditional compilation
