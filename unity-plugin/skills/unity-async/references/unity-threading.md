# Unity Threading Guide

## Prerequisites

**C# Threading Basics**: Understanding of Thread, Task, lock, and volatile keywords (from `csharp-async-patterns` skill).

**This guide extends those concepts with Unity-specific constraints and the Job System.**

---

## Unity's Threading Model

Unity uses a **single-threaded** model for most APIs. The main thread executes all MonoBehaviour callbacks and Unity API calls.

```
Main Thread (Unity Thread)
├── Update/FixedUpdate/LateUpdate
├── Unity API calls (Transform, GameObject, etc.)
├── Rendering
└── Physics

Background Threads
├── Task.Run()
├── ThreadPool
├── Custom Thread
└── async/await (may switch threads)
```

## Unity API Thread Restrictions

### Main Thread Only

```csharp
// Transform and GameObject
transform.position = Vector3.zero;
GameObject.Instantiate(prefab);
Destroy(gameObject);

// Rendering
material.color = Color.red;
Camera.main.fieldOfView = 60f;

// Physics
Physics.Raycast(ray, out hit);
rigidbody.AddForce(force);

// UI
text.text = "Hello";
button.onClick.AddListener(OnClick);

// Scene/Resources
SceneManager.LoadScene("Scene");
Resources.Load<Texture>("texture");
```

### Safe for Background Threads

```csharp
// Pure C# calculations
int result = Calculate(a, b);
List<int> sorted = data.OrderBy(x => x).ToList();

// File I/O
File.WriteAllText(path, content);
string data = File.ReadAllText(path);

// Network operations
HttpClient client = new HttpClient();
string response = await client.GetStringAsync(url);

// Data processing
ProcessLargeDataset(data);
```

## Thread Marshaling

### Manual Dispatcher Pattern

```csharp
public class UnityMainThreadDispatcher : MonoBehaviour
{
    private static UnityMainThreadDispatcher instance;
    private Queue<Action> actionQueue = new Queue<Action>();

    void Awake()
    {
        if (instance == null)
        {
            instance = this;
            DontDestroyOnLoad(gameObject);
        }
    }

    void Update()
    {
        lock (actionQueue)
        {
            while (actionQueue.Count > 0)
                actionQueue.Dequeue()?.Invoke();
        }
    }

    public static void RunOnMainThread(Action action)
    {
        lock (instance.actionQueue)
        {
            instance.actionQueue.Enqueue(action);
        }
    }
}

// Usage
Task.Run(() =>
{
    ProcessData();
    UnityMainThreadDispatcher.RunOnMainThread(() =>
    {
        transform.position = newPosition;
    });
});
```

### Async/Await Context Switching

```csharp
async Task BackgroundWorkThenMainThread()
{
    Debug.Log($"Start: {Thread.CurrentThread.ManagedThreadId}");

    // Background thread
    await Task.Run(() =>
    {
        ProcessLargeDataset();
    });

    // Automatically back on main thread (Unity's SynchronizationContext)
    transform.position = newPosition; // Safe now
}
```

## Job System and Burst Compiler

### IJob - Single Threaded Job

```csharp
using Unity.Jobs;
using Unity.Collections;

[BurstCompile]
struct MyJob : IJob
{
    public float a;
    public float b;
    public NativeArray<float> result;

    public void Execute()
    {
        result[0] = a + b;
    }
}

void RunJob()
{
    var result = new NativeArray<float>(1, Allocator.TempJob);
    var job = new MyJob { a = 10, b = 20, result = result };

    JobHandle handle = job.Schedule();
    handle.Complete();

    Debug.Log(result[0]); // 30
    result.Dispose();
}
```

### IJobParallelFor - Parallel Processing

```csharp
[BurstCompile]
struct VelocityJob : IJobParallelFor
{
    [ReadOnly] public NativeArray<Vector3> velocities;
    public NativeArray<Vector3> positions;
    public float deltaTime;

    public void Execute(int index)
    {
        positions[index] += velocities[index] * deltaTime;
    }
}

void UpdatePositions()
{
    int count = 10000;
    var positions = new NativeArray<Vector3>(count, Allocator.TempJob);
    var velocities = new NativeArray<Vector3>(count, Allocator.TempJob);

    var job = new VelocityJob
    {
        positions = positions,
        velocities = velocities,
        deltaTime = Time.deltaTime
    };

    // Schedule with batch size
    JobHandle handle = job.Schedule(count, 64);
    handle.Complete();

    positions.Dispose();
    velocities.Dispose();
}
```

### Job Dependencies

```csharp
void RunDependentJobs()
{
    var data = new NativeArray<float>(100, Allocator.TempJob);

    var job1 = new Job1 { data = data };
    JobHandle handle1 = job1.Schedule();

    // Job2 depends on Job1 completing
    var job2 = new Job2 { data = data };
    JobHandle handle2 = job2.Schedule(handle1);

    handle2.Complete();
    data.Dispose();
}
```

## Thread-Safe Data Structures

### NativeArray

```csharp
// Thread-safe array for use in jobs
using var data = new NativeArray<float>(100, Allocator.TempJob);

// Or manual disposal
NativeArray<float> data = new NativeArray<float>(100, Allocator.TempJob);
data.Dispose();
```

### NativeContainer Attributes

```csharp
struct MyJob : IJobParallelFor
{
    [ReadOnly] public NativeArray<float> input;   // Read-only
    [WriteOnly] public NativeArray<float> output; // Write-only
    public NativeArray<float> readWrite;          // Read-write

    public void Execute(int index)
    {
        output[index] = input[index] * 2;
    }
}
```

### NativeHashMap and NativeQueue

```csharp
// NativeHashMap
using var map = new NativeHashMap<int, float>(10, Allocator.TempJob);
map.TryAdd(1, 10.5f);
map.TryGetValue(1, out float value);

// NativeQueue
using var queue = new NativeQueue<int>(Allocator.TempJob);
queue.Enqueue(42);
queue.TryDequeue(out int result);
```

## Burst Compiler

### Supported Types
- Primitive types (int, float, bool, etc.)
- Structs containing supported types
- NativeContainer types
- Pointers (unsafe context)

### NOT Supported
- Managed types (class, string, arrays)
- Delegates and lambdas
- Virtual methods
- Boxing/unboxing

```csharp
[BurstCompile]
struct BurstCompatibleJob : IJob
{
    public float value;
    public NativeArray<float> results;

    public void Execute()
    {
        // OK - primitive math
        results[0] = value * 2;

        // NOT OK - would fail compilation
        // string text = "hello";
        // List<int> list = new List<int>();
    }
}
```

## Thread Safety Best Practices

### Race Conditions

```csharp
// WRONG - Race condition
private int counter;
void IncrementFromMultipleThreads()
{
    Task.Run(() => counter++); // Not thread-safe
    Task.Run(() => counter++);
}

// CORRECT - Use Interlocked
private int counter;
void SafeIncrement()
{
    Task.Run(() => Interlocked.Increment(ref counter));
    Task.Run(() => Interlocked.Increment(ref counter));
}
```

### Lock Synchronization

```csharp
private readonly object lockObject = new object();
private List<int> sharedData = new List<int>();

void AddDataThreadSafe(int value)
{
    lock (lockObject)
    {
        sharedData.Add(value);
    }
}
```

### Concurrent Collections

```csharp
using System.Collections.Concurrent;

private ConcurrentQueue<int> threadSafeQueue = new ConcurrentQueue<int>();

void EnqueueFromAnyThread(int value)
{
    threadSafeQueue.Enqueue(value); // Thread-safe
}

void Update()
{
    while (threadSafeQueue.TryDequeue(out int value))
    {
        ProcessOnMainThread(value);
    }
}
```

## Platform-Specific Threading

### WebGL Limitations

```csharp
void WebGLSafeCode()
{
#if UNITY_WEBGL && !UNITY_EDITOR
    // No threading in WebGL
    ProcessDataSynchronously();
#else
    // Use threading on other platforms
    await Task.Run(() => ProcessDataAsync());
#endif
}
```

### Mobile Considerations

```csharp
void MobileThreading()
{
    // Limit thread count on mobile
    int maxThreads = Mathf.Min(SystemInfo.processorCount, 4);

    ParallelOptions options = new ParallelOptions
    {
        MaxDegreeOfParallelism = maxThreads
    };

    Parallel.For(0, data.Length, options, i =>
    {
        ProcessData(i);
    });
}
```

## Performance Considerations

### When to Use Background Threads
- Heavy computation (> 10ms)
- I/O operations
- Data processing
- Image/mesh generation

### When to Stay on Main Thread
- Frame-based logic
- Simple calculations (< 1ms)
- Frequent Unity API calls
- UI updates

### Profiling

```csharp
void ProfiledAsyncOperation()
{
    Profiler.BeginSample("Background Work");
    Task.Run(() =>
    {
        Profiler.BeginThreadProfiling("Background", "Worker Thread");
        ProcessData();
        Profiler.EndThreadProfiling();
    });
    Profiler.EndSample();
}
```
