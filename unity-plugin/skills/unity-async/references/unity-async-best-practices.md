# Unity Async Best Practices

## Prerequisites: C# Async Fundamentals

**Important**: Before implementing Unity async patterns, ensure you understand foundational C# async/await concepts from the `csharp-async-patterns` skill:

- **Task and Task<T>**: Basic async return types and how they work
- **CancellationToken**: Proper cancellation implementation patterns
- **ConfigureAwait**: Understanding context capture (less critical in Unity due to SynchronizationContext)
- **Exception handling**: try/catch patterns in async methods
- **Task composition**: WhenAll, WhenAny for parallel operations
- **async/await keywords**: How the state machine works

**This document extends those C# patterns with Unity-specific constraints and alternatives.**

---

## When to Use Coroutines vs Async/Await

### Decision Framework

```
Need async in Unity?
├── Frame-based timing? → Coroutines
├── Unity API heavy? → Coroutines
├── WebGL build? → Coroutines
├── Standard .NET async? → Async/Await (with Unity constraints)
├── CancellationToken needed? → Async/Await
└── Complex error handling? → Async/Await
```

### Use Coroutines When:
- **Frame-based timing** is needed (yield return null, WaitForSeconds)
- **Unity API integration** is primary concern
- **WebGL compatibility** is required
- **Simple sequential operations** without complex error handling
- **MonoBehaviour lifecycle** management is straightforward

```csharp
// Coroutine for frame-based animation
IEnumerator FadeOut(CanvasGroup group)
{
    while (group.alpha > 0)
    {
        group.alpha -= Time.deltaTime;
        yield return null; // Wait one frame
    }
}
```

### Use Async/Await When:
- **Standard async operations** (network calls, file I/O)
- **Composition** of multiple async operations
- **Exception handling** is important
- **Cancellation** support is needed (CancellationToken from `csharp-async-patterns`)
- **Integration** with .NET async libraries

```csharp
// Async for network operations (C# pattern + Unity API)
async Task<string> FetchDataAsync(CancellationToken ct)
{
    try
    {
        using var request = UnityWebRequest.Get(url);
        await request.SendWebRequest();

        if (request.result == UnityWebRequest.Result.Success)
            return request.downloadHandler.text;

        throw new Exception(request.error);
    }
    catch (OperationCanceledException)
    {
        Debug.Log("Request cancelled");
        throw;
    }
}
```

## Main Thread Restrictions

### Unity APIs that MUST Run on Main Thread
- Transform, GameObject, Component manipulation
- Rendering APIs (Camera, Material, Shader)
- Physics APIs (Rigidbody, Collider)
- UI APIs (Canvas, Text, Image)
- Scene management
- Resources.Load/Instantiate

### Safe for Background Threads
- Pure C# calculations
- File I/O (with .NET APIs)
- Network operations
- Data processing
- Math operations

### Thread Marshaling Pattern
```csharp
async Task ProcessDataAsync()
{
    // Can run on background thread
    await Task.Run(() =>
    {
        // Heavy computation here
        ProcessLargeDataset();
    });

    // MUST return to main thread for Unity API
    transform.position = newPosition; // Unity API - main thread only
}
```

## Unity API Limitations in Async

### Problem: Unity APIs in Async Context
```csharp
// WRONG - Unity API may not be on main thread
async Task BadExample()
{
    await SomeAsyncOperation();
    transform.position = Vector3.zero; // May crash if not on main thread!
}
```

### Solution: Ensure Main Thread
```csharp
// CORRECT - Explicitly ensure main thread
async Task GoodExample()
{
    await SomeAsyncOperation();

    // Ensure we're on main thread
    await Task.Yield(); // Returns to Unity's sync context
    transform.position = Vector3.zero; // Safe now
}
```

## Job System Usage Patterns

### When to Use Job System
- **Data parallelization** for CPU-intensive tasks
- **Large array processing** (thousands of elements)
- **Physics calculations** outside Unity Physics
- **Mesh generation** or procedural content
- **Performance-critical** hot paths

### Job System Best Practices
```csharp
[BurstCompile]
struct VelocityUpdateJob : IJobParallelFor
{
    [ReadOnly] public NativeArray<Vector3> positions;
    [ReadOnly] public NativeArray<Vector3> velocities;
    public NativeArray<Vector3> newPositions;
    public float deltaTime;

    public void Execute(int index)
    {
        newPositions[index] = positions[index] + velocities[index] * deltaTime;
    }
}

void UpdatePositions()
{
    var job = new VelocityUpdateJob
    {
        positions = positionArray,
        velocities = velocityArray,
        newPositions = newPositionArray,
        deltaTime = Time.deltaTime
    };

    // Schedule with batch size for optimal performance
    JobHandle handle = job.Schedule(positionArray.Length, 64);

    // Complete before accessing results
    handle.Complete();

    // Now safe to use newPositionArray
}
```

## MonoBehaviour Lifecycle Integration

### Coroutine Lifecycle
```csharp
public class DataLoader : MonoBehaviour
{
    private Coroutine loadCoroutine;

    void Start() => loadCoroutine = StartCoroutine(LoadDataCoroutine());

    void OnDisable()
    {
        if (loadCoroutine != null)
        {
            StopCoroutine(loadCoroutine);
            loadCoroutine = null;
        }
    }

    IEnumerator LoadDataCoroutine()
    {
        yield return new WaitForSeconds(1f);
        // Automatically stops when MonoBehaviour destroyed
    }
}
```

### Async/Await Lifecycle
```csharp
public class DataLoader : MonoBehaviour
{
    private CancellationTokenSource cts;

    void Start()
    {
        cts = new CancellationTokenSource();
        LoadDataAsync(cts.Token).ContinueWith(task =>
        {
            if (task.IsFaulted) Debug.LogError(task.Exception);
        });
    }

    void OnDestroy()
    {
        cts?.Cancel();
        cts?.Dispose();
    }

    async Task LoadDataAsync(CancellationToken ct)
    {
        try
        {
            await Task.Delay(1000, ct);
        }
        catch (OperationCanceledException) { }
    }
}
```

## Performance Considerations

### Coroutine Overhead
- Minimal per-frame overhead
- GC allocation per `yield return new WaitForSeconds()`
- Use `WaitForSecondsRealtime` for unscaled time
- Cache `WaitForSeconds` instances to reduce GC

```csharp
// Cache WaitForSeconds to reduce GC
private WaitForSeconds oneSecond = new WaitForSeconds(1f);

IEnumerator RepeatAction()
{
    while (true)
    {
        DoAction();
        yield return oneSecond; // Reuse cached instance
    }
}
```

### Async/Await Overhead
- Task allocation for each async operation
- State machine generated by compiler
- Consider ValueTask for hot paths (but not in Unity yet)
- Use object pooling for frequent operations

## Cancellation Support

### Coroutine Cancellation
```csharp
private Coroutine currentOperation;

void StartOperation()
{
    if (currentOperation != null) StopCoroutine(currentOperation);
    currentOperation = StartCoroutine(OperationCoroutine());
}

void CancelOperation()
{
    if (currentOperation != null)
    {
        StopCoroutine(currentOperation);
        currentOperation = null;
    }
}
```

### Async Cancellation
```csharp
private CancellationTokenSource cts;

async void StartOperation()
{
    cts?.Cancel();
    cts = new CancellationTokenSource();
    try { await OperationAsync(cts.Token); }
    catch (OperationCanceledException) { Debug.Log("Cancelled"); }
}

void CancelOperation() => cts?.Cancel();

async Task OperationAsync(CancellationToken ct)
{
    for (int i = 0; i < 10; i++)
    {
        ct.ThrowIfCancellationRequested();
        await Task.Delay(100, ct);
    }
}
```

## Delegation to Specialized Agents

### When to Use unity-unitask-pro
- Zero-allocation async operations needed
- PlayerLoop integration required
- DOTween integration
- Addressables with progress reporting
- Advanced cancellation patterns

### When to Use unity-reactive-pro
- Event streams with complex transformations
- MVVM/MVP data binding
- UI event handling with throttling/debouncing
- Complex state management
- Reactive property changes
