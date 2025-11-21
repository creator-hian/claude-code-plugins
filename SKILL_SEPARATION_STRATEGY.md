# C# vs Unity Skill Separation Strategy

## Overview

This document defines the clear separation between C# Plugin and Unity Plugin to avoid duplication and ensure proper responsibility allocation.

## Architectural Principle

**Separation by Platform Specificity**

- **C# Plugin**: Pure .NET framework patterns applicable to ANY C# application
- **Unity Plugin**: Unity-specific implementations and Unity-optimized libraries

## Detailed Breakdown

### Async/Await Patterns

#### C# Plugin (`csharp-async-patterns` skill)

**Scope**: General .NET async/await patterns

**Topics**:
- Task and Task<T> fundamentals
- async/await keyword usage
- CancellationToken patterns
- ConfigureAwait usage
- Error handling in async code
- Task composition (WhenAll, WhenAny)
- ValueTask optimization
- TaskCompletionSource
- Async LINQ (IAsyncEnumerable)

**Example Use Cases**:
- ASP.NET Core web applications
- Console applications
- Desktop applications (WPF, WinForms)
- .NET libraries
- Blazor applications
- Azure Functions
- Any C# application outside Unity

**Code Example**:
```csharp
// Pure .NET async pattern
public async Task<Data> LoadDataAsync(CancellationToken ct = default)
{
    try
    {
        using var client = new HttpClient();
        var response = await client.GetStringAsync(url, ct);
        return JsonSerializer.Deserialize<Data>(response);
    }
    catch (OperationCanceledException)
    {
        Log.Info("Operation cancelled");
        throw;
    }
}
```

---

#### Unity Plugin (`unity-async` skill)

**Scope**: Unity-specific async patterns and constraints

**Topics**:
- Coroutines and yield instructions (Unity-specific)
- Main thread restrictions
- Unity's SynchronizationContext
- AsyncOperation (Unity's async system)
- Job System and Burst compiler
- UnityWebRequest async patterns
- Addressables async loading
- SceneManager async operations
- MonoBehaviour lifecycle integration

**Example Use Cases**:
- Unity games and applications
- Frame-based timing operations
- Unity resource loading
- Unity-specific async APIs

**Code Example**:
```csharp
// Unity coroutine (Unity-only)
IEnumerator LoadSceneCoroutine(string sceneName)
{
    AsyncOperation operation = SceneManager.LoadSceneAsync(sceneName);
    while (!operation.isDone)
    {
        float progress = operation.progress;
        yield return null; // Wait one frame
    }
}

// Unity async with main thread constraint
async Task LoadTextureAsync()
{
    // Must return to main thread for Unity API
    var request = Resources.LoadAsync<Texture2D>("texture");
    await request; // Unity's async system
    var texture = request.asset as Texture2D;
}
```

---

### Reactive Programming

#### C# Plugin (Future: `csharp-reactive-patterns` skill)

**Scope**: Rx.NET (Reactive Extensions for .NET)

**Topics**:
- IObservable<T> and IObserver<T>
- Observable creation (Create, Range, Interval)
- LINQ operators (Select, Where, GroupBy)
- Hot vs Cold observables
- Subject types
- Schedulers
- Backpressure handling
- Error handling with Catch/Retry

**Example Use Cases**:
- ASP.NET Core event streams
- Desktop application event handling
- SignalR integration
- Real-time data processing
- Any .NET application

**Code Example**:
```csharp
// Rx.NET pattern
var observable = Observable.Interval(TimeSpan.FromSeconds(1))
    .Select(i => i * 2)
    .Where(i => i % 4 == 0)
    .Take(10);

observable.Subscribe(
    value => Console.WriteLine(value),
    error => Console.WriteLine($"Error: {error}"),
    () => Console.WriteLine("Completed")
);
```

---

#### Unity Plugin (`unity-reactive-pro` agent)

**Scope**: R3 (Unity-optimized Reactive Extensions)

**Topics**:
- R3 Observable creation (Unity-specific)
- ReactiveProperty and ReactiveCollection
- Unity UI event integration (OnClickAsObservable)
- Frame-based observables (EveryUpdate, NextFrame)
- ObserveEveryValueChanged (Unity lifecycle)
- Unity-specific operators
- MVVM/MVP patterns in Unity
- AddTo(GameObject) disposal pattern
- Integration with UniTask

**Example Use Cases**:
- Unity game development only
- Unity UI reactive patterns
- Unity-specific event handling

**Code Example**:
```csharp
// R3 with Unity integration
button.OnClickAsObservable()
    .Throttle(TimeSpan.FromSeconds(1))
    .Subscribe(_ => OnButtonClicked())
    .AddTo(this); // Auto-dispose with GameObject

// Unity-specific reactive property
var health = new ReactiveProperty<int>(100);
health.Where(h => h <= 0)
      .Subscribe(_ => TriggerGameOver())
      .AddTo(this);

// Frame-based observable (Unity-only)
Observable.EveryUpdate()
    .Where(_ => Input.GetKeyDown(KeyCode.Space))
    .Subscribe(_ => Jump())
    .AddTo(this);
```

---

### Dependency Injection

#### C# Plugin (Future: `csharp-di-patterns` skill)

**Scope**: General DI concepts and Microsoft.Extensions.DependencyInjection

**Topics**:
- Dependency Inversion Principle
- Constructor injection
- Service lifetimes (Singleton, Scoped, Transient)
- IServiceProvider interface
- Microsoft.Extensions.DependencyInjection
- Generic host patterns
- Factory patterns
- Service locator (anti-pattern)

**Example Use Cases**:
- ASP.NET Core applications
- Console applications with hosting
- Worker services
- Any .NET Core/5+/6+ application

**Code Example**:
```csharp
// Microsoft.Extensions.DependencyInjection
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddSingleton<IDataService, DataService>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddTransient<IEmailService, EmailService>();
    }
}

public class UserController
{
    private readonly IUserRepository repository;

    public UserController(IUserRepository repository)
    {
        this.repository = repository;
    }
}
```

---

#### Unity Plugin (`unity-vcontainer-pro` agent)

**Scope**: VContainer (Unity-optimized DI framework)

**Topics**:
- VContainer-specific configuration
- LifetimeScope (Unity scene hierarchy)
- MonoBehaviour injection ([Inject] attribute)
- Unity-specific registration patterns
- GameObject instantiation with DI
- Entry points (IStartable, ITickable)
- Parent-child scope relationships
- Unity component registration
- Integration with Unity lifecycle

**Example Use Cases**:
- Unity game development only
- Unity scene-based architecture
- MonoBehaviour dependency injection

**Code Example**:
```csharp
// VContainer with Unity integration
public class GameLifetimeScope : LifetimeScope
{
    protected override void Configure(IContainerBuilder builder)
    {
        builder.Register<IGameService, GameService>(Lifetime.Singleton);
        builder.RegisterComponentInHierarchy<PlayerController>();
        builder.RegisterEntryPoint<GameInitializer>();
    }
}

public class PlayerController : MonoBehaviour
{
    [Inject] private readonly IGameService gameService;
    [Inject] private readonly IInputService inputService;

    void Update()
    {
        // Use injected services
    }
}
```

---

### Advanced Async Libraries

#### C# Plugin

**Not Applicable**: UniTask is Unity-specific and not part of standard .NET

---

#### Unity Plugin (`unity-unitask-pro` agent)

**Scope**: UniTask (Unity-optimized async library)

**Topics**:
- UniTask vs Task performance
- Allocation-free async patterns
- PlayerLoop-based execution
- UniTask.WhenAll/WhenAny
- AsyncReactiveProperty
- UniTask channels
- CancellationToken with MonoBehaviour lifecycle
- Integration with DOTween
- Integration with Addressables
- WebGL compatibility

**Example Use Cases**:
- Unity game development only
- Performance-critical Unity applications
- Mobile Unity games (memory constraints)

**Code Example**:
```csharp
// UniTask (Unity-only)
async UniTask LoadDataAsync(CancellationToken ct)
{
    // Zero-allocation delay
    await UniTask.Delay(1000, cancellationToken: ct);

    // Unity API integration
    await UniTask.WaitForEndOfFrame(this);

    // Addressables integration
    var handle = Addressables.LoadAssetAsync<GameObject>("key");
    var prefab = await handle.ToUniTask();

    // PlayerLoop timing control
    await UniTask.Yield(PlayerLoopTiming.PreLateUpdate);
}

// Auto-cancellation with GameObject
void Start()
{
    LoadDataAsync(this.GetCancellationTokenOnDestroy()).Forget();
}
```

---

## Decision Tree for Developers

### Question: "I need async/await help"

```
Are you using Unity?
├── NO → Use csharp-async-patterns skill
│   └── Use Task, async/await, CancellationToken
│
└── YES → Use unity-async skill
    ├── Frame-based timing? → Coroutines
    ├── Standard async? → async/await + Unity constraints
    ├── Zero-allocation critical? → unity-unitask-pro agent
    └── Parallel data processing? → Job System
```

### Question: "I need reactive programming"

```
Are you using Unity?
├── NO → Use csharp-reactive-patterns (Rx.NET)
│   └── IObservable, LINQ operators, Schedulers
│
└── YES → Use unity-reactive-pro agent (R3)
    └── ReactiveProperty, Unity events, MVVM patterns
```

### Question: "I need dependency injection"

```
Are you using Unity?
├── NO → Use csharp-di-patterns (MS.Extensions.DI)
│   └── IServiceCollection, IServiceProvider
│
└── YES → Use unity-vcontainer-pro agent
    └── LifetimeScope, MonoBehaviour injection
```

## Plugin Dependency Relationship

```
C# Plugin (Foundation)
├── csharp-async-patterns ────────┐
├── csharp-reactive-patterns ─────┤
└── csharp-di-patterns ───────────┤
                                  │
                         Unity Plugin (Specialization)
                         ├── unity-async (extends C# async)
                         ├── unity-unitask-pro (Unity-optimized async)
                         ├── unity-reactive-pro (Unity-optimized Rx)
                         ├── unity-vcontainer-pro (Unity-optimized DI)
                         ├── unity-dots
                         ├── unity-mobile
                         ├── unity-networking
                         ├── unity-performance
                         └── unity-ui
```

## Key Separation Rules

1. **C# Plugin = Platform-Agnostic**
   - Works in ANY C# application
   - Uses standard .NET libraries
   - No Unity-specific APIs or concepts

2. **Unity Plugin = Unity-Specific**
   - Only works in Unity projects
   - Uses Unity APIs and lifecycle
   - Optimized for Unity constraints

3. **No Duplication**
   - If it's pure C#, it goes in C# Plugin
   - If it requires Unity, it goes in Unity Plugin
   - Unity Plugin can reference C# Plugin concepts

4. **Clear Migration Path**
   - Start with C# Plugin for concepts
   - Move to Unity Plugin for Unity implementation
   - Unity Plugin extends, not replaces C# Plugin

## Validation Checklist

When creating a new skill or agent, ask:

- [ ] Does this require Unity to run? → Unity Plugin
- [ ] Can this run in a console app? → C# Plugin
- [ ] Does this use UnityEngine namespace? → Unity Plugin
- [ ] Does this use System.* only? → C# Plugin
- [ ] Is this a Unity-optimized version of a C# pattern? → Unity Plugin (with reference to C# Plugin)

## Example Scenarios

### Scenario 1: Web API with Async
**Decision**: C# Plugin
**Reason**: ASP.NET Core, no Unity involvement
**Use**: `csharp-async-patterns` skill

### Scenario 2: Unity Game with Coroutines
**Decision**: Unity Plugin
**Reason**: Coroutines are Unity-specific
**Use**: `unity-async` skill

### Scenario 3: Unity Game with UniTask
**Decision**: Unity Plugin
**Reason**: UniTask is Unity-only library
**Use**: `unity-unitask-pro` agent

### Scenario 4: Console App with Rx.NET
**Decision**: C# Plugin
**Reason**: Standard Rx.NET in console app
**Use**: `csharp-reactive-patterns` skill

### Scenario 5: Unity Game with R3
**Decision**: Unity Plugin
**Reason**: R3 is Unity-optimized Rx
**Use**: `unity-reactive-pro` agent

### Scenario 6: ASP.NET with DI
**Decision**: C# Plugin
**Reason**: Microsoft.Extensions.DependencyInjection
**Use**: `csharp-di-patterns` skill

### Scenario 7: Unity Game with VContainer
**Decision**: Unity Plugin
**Reason**: VContainer is Unity-specific
**Use**: `unity-vcontainer-pro` agent

## Future Expansion

### C# Plugin Roadmap
- [ ] csharp-reactive-patterns skill (Rx.NET)
- [ ] csharp-di-patterns skill (MS.Extensions.DI)
- [ ] csharp-testing-patterns skill (xUnit, NUnit, MSTest)
- [ ] csharp-linq-patterns skill (LINQ optimization)
- [ ] csharp-performance-patterns skill (Span<T>, Memory<T>)

### Unity Plugin Roadmap
- [ ] Additional Unity-specific skills as needed
- [ ] Unity 6 specific features
- [ ] Unity ECS/DOTS deep dive skills
- [ ] Unity shader and VFX skills
- [ ] Unity animation skills

## Conclusion

The separation is based on a simple principle:

**If it runs in ANY C# app → C# Plugin**
**If it requires Unity → Unity Plugin**

This ensures:
- No duplication of content
- Clear responsibility boundaries
- Easy decision-making for users
- Maintainable plugin structure
- Extensible for future growth
