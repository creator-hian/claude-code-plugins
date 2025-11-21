# Async Anti-Patterns

## Table of Contents
1. [Blocking on Async Code](#1-blocking-on-async-code)
2. [Async Void (Outside Event Handlers)](#2-async-void-outside-event-handlers)
3. [Fire-and-Forget Without Error Handling](#3-fire-and-forget-without-error-handling)
4. [Missing Cancellation Support](#4-missing-cancellation-support)
5. [Over-Using Async](#5-over-using-async)
6. [Not Passing CancellationToken Through](#6-not-passing-cancellationtoken-through)
7. [Capturing Modified Variables in Async Loops](#7-capturing-modified-variables-in-async-loops)
8. [Async in Constructors](#8-async-in-constructors)
9. [Ignoring Task Results](#9-ignoring-task-results)
10. [Mixing Sync and Async Code Poorly](#10-mixing-sync-and-async-code-poorly)

## 1. Blocking on Async Code

### ❌ The Problem

```csharp
public void SyncMethod()
{
    // DEADLOCK RISK!
    var result = AsyncMethod().Result;
    var result2 = AsyncMethod().GetAwaiter().GetResult();
    AsyncMethod().Wait();
}
```

**Why it's bad**: Can cause deadlocks, especially in UI applications with synchronization context.

### ✅ The Solution

```csharp
public async Task AsyncMethodProper()
{
    var result = await AsyncMethod();
}

// If you must have sync entry point (not recommended):
public void SyncEntryPoint()
{
    AsyncMethod().GetAwaiter().GetResult(); // Use with extreme caution
}
```

## 2. Async Void (Outside Event Handlers)

### ❌ The Problem

```csharp
// BAD: Exceptions are lost!
public async void LoadData()
{
    await Task.Delay(1000);
    throw new Exception("This crashes the app!");
}
```

**Why it's bad**: Exceptions cannot be caught by caller, leading to application crashes.

### ✅ The Solution

```csharp
// Good: Returns Task
public async Task LoadDataAsync()
{
    await Task.Delay(1000);
    throw new Exception("Can be caught by caller");
}

// Exception: Event handlers MUST be async void
private async void OnButtonClick(object sender, EventArgs e)
{
    try
    {
        await LoadDataAsync();
    }
    catch (Exception ex)
    {
        LogError(ex);
    }
}
```

## 3. Fire-and-Forget Without Error Handling

### ❌ The Problem

```csharp
public void StartOperation()
{
    _ = LongRunningAsync(); // Exceptions disappear!
}
```

**Why it's bad**: Exceptions are silently swallowed, making debugging impossible.

### ✅ The Solution

```csharp
public void StartOperation()
{
    _ = SafeFireAndForgetAsync();
}

private async Task SafeFireAndForgetAsync()
{
    try
    {
        await LongRunningAsync();
    }
    catch (Exception ex)
    {
        LogError(ex);
        // Optionally: notify user, retry, etc.
    }
}
```

## 4. Missing Cancellation Support

### ❌ The Problem

```csharp
// BAD: No way to cancel
public async Task LongProcessAsync()
{
    for (int i = 0; i < 1000; i++)
    {
        await ProcessItemAsync(i);
    }
}
```

**Why it's bad**: User cannot stop long-running operations, wastes resources.

### ✅ The Solution

```csharp
// Good: Cancellable
public async Task LongProcessAsync(CancellationToken ct)
{
    for (int i = 0; i < 1000; i++)
    {
        ct.ThrowIfCancellationRequested();
        await ProcessItemAsync(i, ct);
    }
}
```

## 5. Over-Using Async

### ❌ The Problem

```csharp
// BAD: Unnecessary async overhead
public async Task<int> GetValueAsync()
{
    return await Task.FromResult(42);
}

public async Task<string> GetNameAsync()
{
    return await Task.FromResult("John");
}
```

**Why it's bad**: Async machinery adds overhead for synchronous operations.

### ✅ The Solution

```csharp
// Good: Return Task directly or use sync method
public Task<int> GetValueAsync()
{
    return Task.FromResult(42);
}

// Or better: Just use synchronous method
public int GetValue() => 42;
public string GetName() => "John";
```

## 6. Not Passing CancellationToken Through

### ❌ The Problem

```csharp
public async Task ProcessAsync(CancellationToken ct)
{
    // BAD: Not passing ct to inner calls
    await Step1Async();
    await Step2Async();
    await Step3Async();
}
```

**Why it's bad**: Cancellation doesn't propagate, operations continue unnecessarily.

### ✅ The Solution

```csharp
public async Task ProcessAsync(CancellationToken ct)
{
    // Good: Pass ct through
    await Step1Async(ct);
    await Step2Async(ct);
    await Step3Async(ct);
}
```

## 7. Capturing Modified Variables in Async Loops

### ❌ The Problem

```csharp
// BAD: Variable capture issue
for (int i = 0; i < 10; i++)
{
    tasks.Add(Task.Run(async () =>
    {
        await Task.Delay(100);
        Console.WriteLine(i); // All print 10!
    }));
}
```

**Why it's bad**: Loop variable is captured by reference, all tasks see final value.

### ✅ The Solution

```csharp
// Good: Capture loop variable properly
for (int i = 0; i < 10; i++)
{
    int index = i; // Copy to local variable
    tasks.Add(Task.Run(async () =>
    {
        await Task.Delay(100);
        Console.WriteLine(index); // Prints 0-9
    }));
}
```

## 8. Async in Constructors

### ❌ The Problem

```csharp
// BAD: Cannot await in constructor
public class BadService
{
    public BadService()
    {
        // Cannot use async/await here!
        InitializeAsync().Wait(); // DEADLOCK RISK
    }
}
```

**Why it's bad**: Constructors cannot be async, blocking causes deadlocks.

### ✅ The Solution

```csharp
// Good: Factory pattern or async initialization method
public class GoodService
{
    private GoodService() { }

    public static async Task<GoodService> CreateAsync()
    {
        var service = new GoodService();
        await service.InitializeAsync();
        return service;
    }

    private async Task InitializeAsync()
    {
        await LoadConfigAsync();
    }
}

// Or: Lazy initialization
public class LazyService
{
    private Task _initTask;

    public LazyService()
    {
        _initTask = InitializeAsync();
    }

    public async Task EnsureInitializedAsync()
    {
        await _initTask;
    }
}
```

## 9. Ignoring Task Results

### ❌ The Problem

```csharp
public async Task ProcessAsync()
{
    Task.Run(() => BackgroundWork()); // Task ignored!
    await OtherWorkAsync();
}
```

**Why it's bad**: Background task exceptions are lost, no way to track completion.

### ✅ The Solution

```csharp
public async Task ProcessAsync()
{
    var backgroundTask = Task.Run(() => BackgroundWork());

    await OtherWorkAsync();

    // Wait for background work
    await backgroundTask;
}

// Or if truly fire-and-forget:
_ = SafeFireAndForgetAsync();
```

## 10. Mixing Sync and Async Code Poorly

### ❌ The Problem

```csharp
// BAD: Mixed sync/async
public void ProcessData()
{
    var data = LoadDataAsync().Result; // Blocking!
    SaveData(data); // Sync
}
```

**Why it's bad**: Loses benefits of async, introduces deadlock risks.

### ✅ The Solution

```csharp
// Good: Async all the way
public async Task ProcessDataAsync()
{
    var data = await LoadDataAsync();
    await SaveDataAsync(data);
}

// Or: Sync all the way
public void ProcessData()
{
    var data = LoadDataSync();
    SaveDataSync(data);
}
```

## Summary Checklist

Avoid these anti-patterns:

- [ ] No blocking on async code (.Result, .Wait)
- [ ] No async void (except event handlers)
- [ ] Fire-and-forget has error handling
- [ ] All long operations accept CancellationToken
- [ ] CancellationToken passed through call chain
- [ ] Async only when truly needed (I/O-bound)
- [ ] Loop variables captured correctly in async
- [ ] No async in constructors
- [ ] Task results not ignored
- [ ] Consistent sync or async throughout call chain
