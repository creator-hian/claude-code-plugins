# UniRx Advanced Patterns

## MVVM Architecture with ReactiveProperty

UniRx provides first-class MVVM support through ReactiveProperty and ReactiveCommand.

### ViewModel with ReactiveProperty

```csharp
public class PlayerViewModel : IDisposable
{
    private readonly CompositeDisposable disposables = new();

    public ReactiveProperty<int> Health { get; } = new(100);
    public ReactiveProperty<string> Name { get; } = new("Player");
    public ReadOnlyReactiveProperty<bool> IsDead { get; }

    public PlayerViewModel()
    {
        IsDead = Health.Select(h => h <= 0).ToReadOnlyReactiveProperty();

        Health.Where(h => h <= 0)
              .Subscribe(_ => TriggerDeathSequence())
              .AddTo(disposables);
    }

    public void Dispose() => disposables.Dispose();
}
```

### View Binding

```csharp
public class PlayerView : MonoBehaviour
{
    [SerializeField] private Text healthText;
    [SerializeField] private Text statusText;

    private PlayerViewModel viewModel;

    void Start()
    {
        viewModel = new PlayerViewModel();

        viewModel.Health
            .Subscribe(h => healthText.text = $"HP: {h}")
            .AddTo(this);

        viewModel.IsDead
            .Where(dead => dead)
            .Subscribe(_ => ShowDeathScreen())
            .AddTo(this);
    }

    void OnDestroy() => viewModel?.Dispose();
}
```

## Event Aggregator Pattern

A decoupled event system using Subject as an event bus.

```csharp
public class GameEventStream : IDisposable
{
    private readonly Subject<GameEvent> eventSubject = new();

    public IObservable<T> GetEvent<T>() where T : GameEvent
        => eventSubject.OfType<T>();

    public void Publish<T>(T gameEvent) where T : GameEvent
        => eventSubject.OnNext(gameEvent);

    public void Dispose() => eventSubject.Dispose();
}

// Usage
gameEvents.GetEvent<PlayerDeathEvent>()
          .Subscribe(evt => HandlePlayerDeath(evt))
          .AddTo(this);
```

## State Management with ReactiveProperty

```csharp
public class GameStateManager : MonoBehaviour
{
    private readonly ReactiveProperty<GameState> currentState = new(GameState.Menu);

    public IReadOnlyReactiveProperty<GameState> CurrentState => currentState;

    void Start()
    {
        currentState.Where(state => state == GameState.Playing)
                   .Subscribe(_ => StartGameplay())
                   .AddTo(this);

        currentState.Where(state => state == GameState.GameOver)
                   .Subscribe(_ => ShowGameOverScreen())
                   .AddTo(this);
    }

    public void ChangeState(GameState newState) => currentState.Value = newState;
}
```

## Custom Operator Creation

```csharp
public static class CustomObservableExtensions
{
    public static IObservable<IList<T>> BufferWithTimeout<T>(
        this IObservable<T> source,
        int count,
        TimeSpan timeout)
    {
        return source.Publish(shared =>
            shared.Buffer(count)
                  .Merge(shared.Buffer(timeout))
                  .Where(buffer => buffer.Count > 0)
        );
    }
}
```

## Complex Data Flow Composition

Combining multiple observable sources into a single stream.

```csharp
// Multi-source data combination
var playerData = Observable.CombineLatest(
    playerPosition.DistinctUntilChanged(),
    playerHealth.Where(h => h > 0),
    playerInventory.Select(inv => inv.Count),
    (pos, health, itemCount) => new PlayerData(pos, health, itemCount)
);

playerData.Throttle(TimeSpan.FromSeconds(0.1))
          .Subscribe(data => UpdateUI(data))
          .AddTo(this);
```

## Hot vs Cold Observable Management

```csharp
// Convert cold to hot observable
var hotObservable = coldObservable.Publish();
hotObservable.Connect(); // Start emitting

// Share expensive operations across multiple subscribers
var sharedObservable = expensiveOperation.Share();
```

## Backpressure Handling

```csharp
// Handle fast producers with sampling
fastProducer.Sample(TimeSpan.FromSeconds(0.1))
            .Subscribe(value => HandleValue(value))
            .AddTo(this);

// Buffer overflow protection
source.Buffer(100)
      .Where(buffer => buffer.Count > 0)
      .Subscribe(batch => ProcessBatch(batch))
      .AddTo(this);
```

## Subscription Lifecycle Management

```csharp
// CompositeDisposable for grouped disposal
private readonly CompositeDisposable disposables = new();

void Start()
{
    someObservable.Subscribe(HandleValue).AddTo(disposables);
    // MonoBehaviour extension for auto-disposal on Destroy
    anotherObservable.Subscribe(HandleOther).AddTo(this);
}

void OnDestroy() => disposables.Dispose();
```

## Error Handling Strategies

### Resilient Streams

```csharp
dataStream.Catch<Data, Exception>(ex =>
{
    Debug.LogError($"Stream error: {ex.Message}");
    return Observable.Return(Data.Default);
})
.Retry(3)
.Subscribe(data => ProcessData(data))
.AddTo(this);
```

### Error Isolation

Prevent one error from terminating the entire stream.

```csharp
userInputs.Select(input =>
    Observable.FromAsync(() => ProcessInputAsync(input))
              .Catch<Result, Exception>(ex => Observable.Return(Result.Error))
)
.Merge()
.Subscribe(result => HandleResult(result))
.AddTo(this);
```

## Testing Reactive Code

### Test Schedulers

```csharp
[Test]
public void TestObservableSequence()
{
    var scheduler = new TestScheduler();
    var observer = scheduler.CreateObserver<int>();

    Observable.Interval(TimeSpan.FromSeconds(1), scheduler)
              .Take(3)
              .Subscribe(observer);

    scheduler.AdvanceBy(TimeSpan.FromSeconds(3).Ticks);

    Assert.AreEqual(3, observer.Messages.Count);
}
```

## Best Practices Summary

1. **Always dispose subscriptions**: Use CompositeDisposable or AddTo()
2. **Understand hot vs cold**: Know when observables start producing values
3. **Use appropriate operators**: Choose the right operator for data transformation
4. **Handle errors gracefully**: Implement proper error recovery strategies
5. **Optimize with Share()**: For expensive operations consumed by multiple subscribers
6. **Use reactive properties**: For data binding and state management
7. **Avoid nested subscriptions**: Flatten with operators like SelectMany
