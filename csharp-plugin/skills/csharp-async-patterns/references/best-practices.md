# Async/Await Best Practices

## Table of Contents
1. [Always Use CancellationToken](#1-always-use-cancellationtoken)
2. [Avoid async void](#2-avoid-async-void-except-event-handlers)
3. [ConfigureAwait in Library Code](#3-configureawait-in-library-code)
4. [Proper Task Composition](#4-proper-task-composition)
5. [ValueTask for Hot Paths](#5-valuetask-for-hot-paths)
6. [Timeout Patterns](#6-timeout-patterns)
7. [Retry Logic](#7-retry-logic)
8. [Proper Disposal with Async](#8-proper-disposal-with-async)
9. [Checklist](#checklist)

## 1. Always Use CancellationToken

```csharp
// ✅ Good
public async Task ProcessAsync(CancellationToken ct = default)
{
    await Task.Delay(1000, ct);
    ct.ThrowIfCancellationRequested();

    var result = await LongOperationAsync(ct);
    return result;
}

// ❌ Bad: No cancellation support
public async Task ProcessAsync()
{
    await Task.Delay(1000);
    var result = await LongOperationAsync();
}
```

## 2. Avoid async void (Except Event Handlers)

```csharp
// ❌ Bad: Exceptions unhandled
public async void LoadData()
{
    await FetchAsync();
    throw new Exception("Lost!"); // Crashes app
}

// ✅ Good: Returns Task
public async Task LoadDataAsync()
{
    await FetchAsync();
    throw new Exception("Catchable");
}

// ✅ Exception: Event handlers
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

## 3. ConfigureAwait in Library Code

```csharp
// Library code
public async Task<string> LibraryMethodAsync()
{
    // ✅ Don't capture synchronization context
    var data = await GetDataAsync().ConfigureAwait(false);
    return ProcessData(data);
}

// UI/Application code
public async Task UpdateUIAsync()
{
    // ✅ Default captures context (ConfigureAwait(true))
    var data = await GetDataAsync();
    textField.Text = data; // Safe: on UI thread
}
```

## 4. Proper Task Composition

### Parallel Execution

```csharp
// ✅ Good: Run tasks in parallel
public async Task<(Data1, Data2)> LoadMultipleAsync()
{
    var task1 = LoadData1Async();
    var task2 = LoadData2Async();

    await Task.WhenAll(task1, task2);

    return (await task1, await task2);
}
```

### Sequential with Dependency

```csharp
// ✅ Good: Sequential execution
public async Task<Result> ProcessAsync()
{
    var data = await LoadDataAsync();
    var processed = await ProcessDataAsync(data);
    return await SaveAsync(processed);
}
```

### First Wins

```csharp
// ✅ Good: Use first completed result
public async Task<string> LoadFromMultipleAsync()
{
    var task1 = LoadFromCache();
    var task2 = LoadFromNetwork();

    var completed = await Task.WhenAny(task1, task2);
    return await completed;
}
```

## 5. ValueTask for Hot Paths

```csharp
// ✅ Good: Allocation-free for cached results
public ValueTask<int> GetCachedValueAsync()
{
    if (_cache.TryGetValue(key, out var value))
        return new ValueTask<int>(value); // No allocation

    return new ValueTask<int>(FetchAsync());
}

// ❌ Bad: Task allocates even for cached values
public Task<int> GetCachedValueBad()
{
    if (_cache.TryGetValue(key, out var value))
        return Task.FromResult(value); // Allocates!

    return FetchAsync();
}
```

## 6. Timeout Patterns

```csharp
// ✅ Good: Timeout with cancellation
public async Task<Data> LoadWithTimeoutAsync(TimeSpan timeout)
{
    using var cts = new CancellationTokenSource(timeout);

    try
    {
        return await LoadDataAsync(cts.Token);
    }
    catch (OperationCanceledException) when (cts.IsCancellationRequested)
    {
        throw new TimeoutException("Operation timed out");
    }
}
```

## 7. Retry Logic

```csharp
// ✅ Good: Exponential backoff retry
public async Task<T> RetryAsync<T>(
    Func<Task<T>> operation,
    int maxAttempts = 3,
    TimeSpan? initialDelay = null)
{
    var delay = initialDelay ?? TimeSpan.FromSeconds(1);

    for (int attempt = 1; attempt <= maxAttempts; attempt++)
    {
        try
        {
            return await operation();
        }
        catch (Exception ex) when (attempt < maxAttempts)
        {
            Log.Warning($"Attempt {attempt} failed, retrying...", ex);
            await Task.Delay(delay);
            delay *= 2; // Exponential backoff
        }
    }

    return await operation(); // Final attempt
}
```

## 8. Proper Disposal with Async

```csharp
// ✅ Good: IAsyncDisposable
public class AsyncResource : IAsyncDisposable
{
    private HttpClient _client;

    public async ValueTask DisposeAsync()
    {
        if (_client != null)
        {
            await _client.DisposeAsync();
            _client = null;
        }
    }
}

// Usage with await using
await using var resource = new AsyncResource();
```

## Checklist

Before completing async implementation:

- [ ] All async methods return Task, Task<T>, ValueTask, or ValueTask<T> (not async void)
- [ ] CancellationToken parameter added to long-running operations
- [ ] CancellationToken passed through to inner async calls
- [ ] No .Result, .Wait(), or .GetAwaiter().GetResult() (deadlock risk)
- [ ] ConfigureAwait(false) used in library code
- [ ] Async operations properly tested with cancellation
- [ ] ValueTask used for hot paths where appropriate
- [ ] Timeout handling implemented for network operations
- [ ] Retry logic added for transient failures
