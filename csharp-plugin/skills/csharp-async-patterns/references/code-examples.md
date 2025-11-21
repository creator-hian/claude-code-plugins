# Async/Await Code Examples

## Table of Contents
1. [Basic Examples](#basic-examples)
2. [Parallel Execution](#parallel-execution)
3. [Error Handling](#error-handling)
4. [Timeout Patterns](#timeout-patterns)
5. [Progress Reporting](#progress-reporting)
6. [Advanced Patterns](#advanced-patterns)

## Basic Examples

### Simple Async Operation

```csharp
public async Task<string> FetchDataAsync()
{
    using var client = new HttpClient();
    return await client.GetStringAsync("https://api.example.com/data");
}
```

### With Cancellation

```csharp
public async Task<string> FetchDataAsync(CancellationToken ct)
{
    using var client = new HttpClient();
    var response = await client.GetAsync("https://api.example.com/data", ct);
    response.EnsureSuccessStatusCode();
    return await response.Content.ReadAsStringAsync();
}
```

## Parallel Execution

### Multiple Independent Operations

```csharp
public async Task<Summary> GetDashboardDataAsync()
{
    var usersTask = GetUsersAsync();
    var ordersTask = GetOrdersAsync();
    var statsTask = GetStatsAsync();

    await Task.WhenAll(usersTask, ordersTask, statsTask);

    return new Summary
    {
        Users = await usersTask,
        Orders = await ordersTask,
        Stats = await statsTask
    };
}
```

### Bounded Parallelism

```csharp
public async Task ProcessItemsAsync(List<Item> items, int maxConcurrency = 5)
{
    using var semaphore = new SemaphoreSlim(maxConcurrency);
    var tasks = items.Select(async item =>
    {
        await semaphore.WaitAsync();
        try
        {
            await ProcessItemAsync(item);
        }
        finally
        {
            semaphore.Release();
        }
    });

    await Task.WhenAll(tasks);
}
```

## Error Handling

### Try-Catch with Specific Exceptions

```csharp
public async Task<Data> LoadDataWithRetryAsync(CancellationToken ct)
{
    int attempts = 0;
    const int maxAttempts = 3;

    while (attempts < maxAttempts)
    {
        try
        {
            return await FetchDataAsync(ct);
        }
        catch (HttpRequestException ex) when (attempts < maxAttempts - 1)
        {
            attempts++;
            Log.Warning($"Attempt {attempts} failed: {ex.Message}");
            await Task.Delay(TimeSpan.FromSeconds(Math.Pow(2, attempts)), ct);
        }
        catch (OperationCanceledException)
        {
            Log.Info("Operation cancelled");
            throw;
        }
    }

    throw new InvalidOperationException("Max retry attempts exceeded");
}
```

### Exception Aggregation

```csharp
public async Task ProcessAllAsync(List<Item> items)
{
    var tasks = items.Select(ProcessItemAsync).ToList();

    try
    {
        await Task.WhenAll(tasks);
    }
    catch
    {
        // Collect all exceptions
        var exceptions = tasks
            .Where(t => t.IsFaulted)
            .Select(t => t.Exception)
            .ToList();

        if (exceptions.Any())
        {
            throw new AggregateException(exceptions);
        }
    }
}
```

## Timeout Patterns

### Using CancellationTokenSource

```csharp
public async Task<Data> LoadWithTimeoutAsync(TimeSpan timeout)
{
    using var cts = new CancellationTokenSource(timeout);

    try
    {
        return await LoadDataAsync(cts.Token);
    }
    catch (OperationCanceledException) when (cts.IsCancellationRequested)
    {
        throw new TimeoutException($"Operation exceeded {timeout}");
    }
}
```

### Using Task.WhenAny

```csharp
public async Task<Data> LoadWithTimeoutAsync2(TimeSpan timeout)
{
    var dataTask = LoadDataAsync();
    var timeoutTask = Task.Delay(timeout);

    var completed = await Task.WhenAny(dataTask, timeoutTask);

    if (completed == timeoutTask)
    {
        throw new TimeoutException($"Operation exceeded {timeout}");
    }

    return await dataTask;
}
```

## Progress Reporting

### IProgress<T> Pattern

```csharp
public async Task<Data> ProcessWithProgressAsync(
    IProgress<int> progress,
    CancellationToken ct)
{
    var items = await LoadItemsAsync(ct);
    int total = items.Count;

    for (int i = 0; i < total; i++)
    {
        ct.ThrowIfCancellationRequested();

        await ProcessItemAsync(items[i], ct);

        // Report progress percentage
        progress?.Report((i + 1) * 100 / total);
    }

    return CreateSummary(items);
}

// Usage
var progress = new Progress<int>(percent =>
{
    Console.WriteLine($"Progress: {percent}%");
});

await ProcessWithProgressAsync(progress, CancellationToken.None);
```

## Advanced Patterns

### Lazy Async Initialization

```csharp
public class AsyncLazy<T>
{
    private readonly Lazy<Task<T>> _instance;

    public AsyncLazy(Func<Task<T>> factory)
    {
        _instance = new Lazy<Task<T>>(factory);
    }

    public Task<T> Value => _instance.Value;
}

// Usage
private readonly AsyncLazy<Config> _config = new AsyncLazy<Config>(
    () => LoadConfigAsync());

public async Task UseConfigAsync()
{
    var config = await _config.Value; // Loads once, reuses thereafter
}
```

### Async Semaphore

```csharp
public class AsyncResource
{
    private readonly SemaphoreSlim _semaphore = new SemaphoreSlim(1, 1);

    public async Task<T> ExecuteAsync<T>(Func<Task<T>> operation)
    {
        await _semaphore.WaitAsync();
        try
        {
            return await operation();
        }
        finally
        {
            _semaphore.Release();
        }
    }
}
```

### Async Event

```csharp
public class AsyncEventHandler
{
    private readonly List<Func<Task>> _handlers = new();

    public void Subscribe(Func<Task> handler)
    {
        _handlers.Add(handler);
    }

    public async Task RaiseAsync()
    {
        var tasks = _handlers.Select(h => h()).ToList();
        await Task.WhenAll(tasks);
    }
}
```
