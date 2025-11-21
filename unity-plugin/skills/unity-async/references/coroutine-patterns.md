# Coroutine Patterns

## Prerequisites

Basic understanding of C# methods, IEnumerator pattern, and iterator blocks.

For async/await fundamentals and general .NET async patterns, see `csharp-async-patterns` skill.

**This guide focuses on Unity's coroutine-specific patterns.**

---

## Yield Return Variations

### Basic Yield Instructions

```csharp
yield return null;                              // Wait one frame
yield return new WaitForEndOfFrame();           // After rendering
yield return new WaitForFixedUpdate();          // Physics step
yield return new WaitForSeconds(1.5f);          // Scaled time
yield return new WaitForSecondsRealtime(1.5f);  // Unscaled time
yield return new WaitUntil(() => condition);    // Until true
yield return new WaitWhile(() => condition);    // While true
```

### AsyncOperation Patterns

```csharp
// Scene loading with progress
IEnumerator LoadSceneAsync(string sceneName)
{
    AsyncOperation operation = SceneManager.LoadSceneAsync(sceneName);
    operation.allowSceneActivation = false;

    while (operation.progress < 0.9f)
    {
        UpdateLoadingBar(operation.progress / 0.9f);
        yield return null;
    }

    operation.allowSceneActivation = true;
}

// Resource loading
IEnumerator LoadResourceAsync<T>(string path) where T : Object
{
    ResourceRequest request = Resources.LoadAsync<T>(path);
    yield return request;
    T asset = request.asset as T;
    ProcessAsset(asset);
}
```

## Coroutine Composition

### Sequential and Parallel Execution

```csharp
// Sequential - execute in order
IEnumerator Sequential()
{
    yield return Step1();
    yield return Step2();
    yield return Step3();
}

// Parallel - start all, wait for completion
IEnumerator Parallel()
{
    Coroutine c1 = StartCoroutine(Task1());
    Coroutine c2 = StartCoroutine(Task2());
    Coroutine c3 = StartCoroutine(Task3());

    yield return c1;
    yield return c2;
    yield return c3;
}

// Conditional execution
IEnumerator Conditional()
{
    yield return LoadData();
    yield return dataValid ? ProcessData() : HandleError();
    yield return Cleanup();
}
```

## Custom Yield Instructions

### Custom Wait Conditions

```csharp
public class WaitForCondition : CustomYieldInstruction
{
    private Func<bool> condition;

    public WaitForCondition(Func<bool> condition) => this.condition = condition;
    public override bool keepWaiting => !condition();
}

// Usage
yield return new WaitForCondition(() => enemiesDefeated >= 10);
```

### Custom Timed Wait

```csharp
public class WaitForFrames : CustomYieldInstruction
{
    private int targetFrame;

    public WaitForFrames(int frameCount)
    {
        targetFrame = Time.frameCount + frameCount;
    }

    public override bool keepWaiting => Time.frameCount < targetFrame;
}

// Usage
yield return new WaitForFrames(10);
```

## Lifecycle Management

### Starting and Stopping

```csharp
public class CoroutineController : MonoBehaviour
{
    private Coroutine operation;

    void StartOperation()
    {
        // Store reference for control
        operation = StartCoroutine(LongOperation());
    }

    void CancelOperation()
    {
        if (operation != null)
        {
            StopCoroutine(operation);
            operation = null;
        }
    }

    void OnDestroy()
    {
        // Coroutines auto-stop when MonoBehaviour destroyed
        // Cleanup any resources here
        CleanupResources();
    }

    IEnumerator LongOperation()
    {
        for (int i = 0; i < 100; i++)
        {
            yield return new WaitForSeconds(0.1f);
        }
    }
}
```

## Performance Optimization

### Caching Yield Instructions

```csharp
public class OptimizedCoroutines : MonoBehaviour
{
    // Cache commonly used yield instructions
    private WaitForSeconds oneSecond = new WaitForSeconds(1f);
    private WaitForSeconds halfSecond = new WaitForSeconds(0.5f);
    private WaitForEndOfFrame endOfFrame = new WaitForEndOfFrame();
    private WaitForFixedUpdate fixedUpdate = new WaitForFixedUpdate();

    IEnumerator OptimizedRepeat()
    {
        while (true)
        {
            DoAction();
            yield return oneSecond; // Reuse cached instance
        }
    }
}
```

### Pooling Pattern

```csharp
public class CoroutinePool : MonoBehaviour
{
    private Dictionary<float, WaitForSeconds> waitCache = new Dictionary<float, WaitForSeconds>();

    public WaitForSeconds GetWait(float seconds)
    {
        if (!waitCache.TryGetValue(seconds, out var wait))
        {
            wait = new WaitForSeconds(seconds);
            waitCache[seconds] = wait;
        }
        return wait;
    }
}
```

## Common Patterns

### Interpolation Over Time

```csharp
// Fade effect
IEnumerator FadeOut(CanvasGroup group, float duration)
{
    float elapsed = 0f;
    float startAlpha = group.alpha;

    while (elapsed < duration)
    {
        elapsed += Time.deltaTime;
        group.alpha = Mathf.Lerp(startAlpha, 0f, elapsed / duration);
        yield return null;
    }

    group.alpha = 0f;
}

// Movement
IEnumerator MoveToPosition(Transform target, Vector3 destination, float duration)
{
    float elapsed = 0f;
    Vector3 startPos = target.position;

    while (elapsed < duration)
    {
        elapsed += Time.deltaTime;
        target.position = Vector3.Lerp(startPos, destination, elapsed / duration);
        yield return null;
    }

    target.position = destination;
}
```

### Delayed Callback

```csharp
IEnumerator DelayedCallback(float delay, Action callback)
{
    yield return new WaitForSeconds(delay);
    callback?.Invoke();
}

// Usage
StartCoroutine(DelayedCallback(2f, () => Debug.Log("Called after 2 seconds")));
```

### Retry Pattern

```csharp
IEnumerator RetryOperation(Func<bool> operation, int maxAttempts, float delayBetweenAttempts)
{
    for (int attempt = 0; attempt < maxAttempts; attempt++)
    {
        if (operation())
        {
            Debug.Log("Operation succeeded");
            yield break;
        }

        Debug.Log($"Attempt {attempt + 1} failed, retrying...");
        yield return new WaitForSeconds(delayBetweenAttempts);
    }

    Debug.LogError("Operation failed after all attempts");
}
```

### Polling Pattern

```csharp
IEnumerator PollForCondition(Func<bool> condition, float interval, float timeout)
{
    float elapsed = 0f;

    while (elapsed < timeout)
    {
        if (condition())
        {
            Debug.Log("Condition met");
            yield break;
        }

        yield return new WaitForSeconds(interval);
        elapsed += interval;
    }

    Debug.LogWarning("Condition not met within timeout");
}
```

## Error Handling

### Try-Catch in Coroutines

```csharp
IEnumerator SafeOperation()
{
    try
    {
        yield return RiskyOperation();
    }
    catch (Exception e)
    {
        Debug.LogError($"Coroutine error: {e.Message}");
    }
    finally
    {
        CleanupResources();
    }
}
```

### Completion Callback

```csharp
IEnumerator OperationWithCallback(Action<bool> onComplete)
{
    bool success = true;

    try
    {
        yield return PerformOperation();
    }
    catch (Exception e)
    {
        Debug.LogError(e);
        success = false;
    }
    finally
    {
        onComplete?.Invoke(success);
    }
}

// Usage
StartCoroutine(OperationWithCallback(success =>
{
    Debug.Log(success ? "Success" : "Failed");
}));
```
