# VContainer Integration Patterns

## MVVM with Reactive Properties

VContainer pairs naturally with reactive libraries for MVVM architecture.

### Registration

```csharp
public class UILifetimeScope : LifetimeScope
{
    protected override void Configure(IContainerBuilder builder)
    {
        builder.Register<InventoryViewModel>(Lifetime.Scoped);
        builder.RegisterComponentInHierarchy<InventoryView>();
    }
}
```

### ViewModel

```csharp
public class InventoryViewModel
{
    public ReactiveCollection<ItemData> Items { get; }
    public ReactiveProperty<ItemData> SelectedItem { get; }

    [Inject]
    public InventoryViewModel(IInventoryService inventoryService)
    {
        Items = new ReactiveCollection<ItemData>(inventoryService.GetItems());
        SelectedItem = new ReactiveProperty<ItemData>();
    }
}
```

### View

```csharp
public class InventoryView : MonoBehaviour
{
    [Inject] private readonly InventoryViewModel viewModel;

    private void Start()
    {
        viewModel.Items.Subscribe(UpdateUI).AddTo(this);
        viewModel.SelectedItem.Subscribe(OnItemSelected).AddTo(this);
    }
}
```

## Service Layer with UniTask

Async services registered in VContainer use constructor injection for dependencies.

```csharp
public interface IGameService
{
    UniTask<GameState> LoadGameAsync(string saveId);
    UniTask SaveGameAsync(GameState state);
}

public class GameService : IGameService
{
    private readonly ISaveDataRepository repository;
    private readonly ICloudSyncService cloudSync;

    [Inject]
    public GameService(ISaveDataRepository repository, ICloudSyncService cloudSync)
    {
        this.repository = repository;
        this.cloudSync = cloudSync;
    }

    public async UniTask<GameState> LoadGameAsync(string saveId)
    {
        var localData = await repository.LoadAsync(saveId);
        var cloudData = await cloudSync.GetSaveDataAsync(saveId);
        return MergeSaveData(localData, cloudData);
    }
}
```

## Event Aggregator with DI

```csharp
public interface IEventAggregator
{
    void Publish<T>(T eventData);
    IDisposable Subscribe<T>(Action<T> handler);
}

// Registration
builder.Register<IEventAggregator, EventAggregator>(Lifetime.Singleton);

// Usage in injected service
public class ScoreService
{
    [Inject] private readonly IEventAggregator events;

    public void AddScore(int points)
    {
        score += points;
        events.Publish(new ScoreChangedEvent { NewScore = score });
    }
}
```

## Multi-Scene Architecture

### Root Scope (Persistent)

```csharp
public class RootLifetimeScope : LifetimeScope
{
    protected override void Configure(IContainerBuilder builder)
    {
        builder.Register<INetworkService, NetworkService>(Lifetime.Singleton);
        builder.Register<IAuthService, AuthService>(Lifetime.Singleton);
        builder.Register<IAudioManager, AudioManager>(Lifetime.Singleton);
    }
}
```

### Scene-Specific Scope

```csharp
public class BattleSceneScope : LifetimeScope
{
    protected override void Configure(IContainerBuilder builder)
    {
        builder.Register<IBattleService, BattleService>(Lifetime.Scoped);
        builder.Register<IEnemySpawner, EnemySpawner>(Lifetime.Scoped);
        builder.RegisterComponentInHierarchy<BattleUIController>();
    }
}
```

## Source Generator Support

VContainer supports compile-time code generation to reduce reflection overhead.

```csharp
// Add VContainer.SourceGenerator package

[VContainerGenerate] // Opt-in for specific types
public partial class ServiceA
{
    [Inject] private readonly IDependency dependency;
}
```

## Circular Dependency Detection

VContainer automatically detects circular dependencies at container build time and throws an exception with a clear dependency chain.

```csharp
// This will be caught at Build() time, not at runtime
public class ServiceA
{
    public ServiceA(ServiceB b) { }
}

public class ServiceB
{
    public ServiceB(ServiceA a) { } // Circular dependency detected
}
```

## Performance Profiling

```csharp
#if UNITY_EDITOR
[RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
static void EnableDiagnostics()
{
    VContainerSettings.Instance.EnableDiagnostics = true;
}
#endif
```

## Registration Best Practices

- Prefer generic registration (`Register<IService, Service>()`) over type-based for compile-time safety
- Use `RegisterBuildCallback` for complex post-container initialization
- Avoid resolving in Update loops; cache resolved instances
- Use appropriate lifetimes: Singleton for app-wide, Scoped for scene-specific, Transient for short-lived
