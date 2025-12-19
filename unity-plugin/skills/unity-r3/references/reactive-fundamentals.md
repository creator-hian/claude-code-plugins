# Reactive Fundamentals

## Observable Basics

### What is an Observable?

An Observable is a push-based collection that emits values over time. Think of it as an asynchronous stream of events.

```csharp
// Observable emits values over time
Observable.Interval(TimeSpan.FromSeconds(1))
    .Subscribe(x => Debug.Log($"Tick {x}"));
// Output: Tick 0, Tick 1, Tick 2, ...
```

### Observer Pattern

```csharp
// Observer receives three types of notifications
observable.Subscribe(
    onNext: value => Debug.Log($"Value: {value}"),
    onError: error => Debug.LogError($"Error: {error}"),
    onCompleted: () => Debug.Log("Completed")
);
```

## Observable Creation

### Factory Methods

```csharp
// Create from value
Observable.Return(42).Subscribe(x => Debug.Log(x)); // 42

// Create from range
Observable.Range(1, 5).Subscribe(x => Debug.Log(x)); // 1,2,3,4,5

// Create from events
Observable.FromEvent<UnityAction>(
    h => button.onClick.AddListener(h),
    h => button.onClick.RemoveListener(h)
).Subscribe(_ => Debug.Log("Clicked"));

// Create custom
Observable.Create<int>(observer =>
{
    observer.OnNext(1);
    observer.OnNext(2);
    observer.OnCompleted();
    return Disposable.Empty;
});
```

### Unity-Specific Creation

```csharp
// Frame-based observables
Observable.EveryUpdate().Subscribe(_ => Debug.Log("Update"));
Observable.EveryFixedUpdate().Subscribe(_ => Debug.Log("FixedUpdate"));
Observable.EveryLateUpdate().Subscribe(_ => Debug.Log("LateUpdate"));

// Value change observation
Observable.EveryValueChanged(target, x => x.position)
    .Subscribe(pos => Debug.Log($"Position: {pos}"));
```

## Hot vs Cold Observables

### Cold Observable

Starts emitting when subscribed, each subscription gets independent sequence:

```csharp
IObservable<long> cold = Observable.Interval(TimeSpan.FromSeconds(1)).Take(3);

cold.Subscribe(x => Debug.Log($"Sub1: {x}"));
await UniTask.Delay(1500);
cold.Subscribe(x => Debug.Log($"Sub2: {x}"));

// Sub1: 0, Sub1: 1, Sub2: 0, Sub1: 2, Sub2: 1, Sub2: 2
```

### Hot Observable

Emits regardless of subscriptions, all subscribers share the same sequence:

```csharp
Subject<int> subject = new Subject<int>();
IConnectableObservable<int> hot = subject.Publish();
hot.Connect(); // Start emitting

hot.Subscribe(x => Debug.Log($"Sub1: {x}"));
subject.OnNext(1);

hot.Subscribe(x => Debug.Log($"Sub2: {x}"));
subject.OnNext(2);

// Sub1: 1, Sub1: 2, Sub2: 2
```

### Converting Cold to Hot

```csharp
IObservable<long> cold = Observable.Interval(TimeSpan.FromSeconds(1));
IConnectableObservable<long> hot = cold.Publish(); // Convert to hot
IDisposable connection = hot.Connect(); // Start emitting

// Later: connection.Dispose(); to stop
```

## Subscription Lifecycle

### Manual Disposal

```csharp
IDisposable subscription = observable.Subscribe(x => Debug.Log(x));

// Later
subscription.Dispose(); // Unsubscribe
```

### Automatic Disposal with MonoBehaviour

```csharp
public class Example : MonoBehaviour
{
    void Start()
    {
        // Auto-dispose when GameObject is destroyed
        observable.Subscribe(x => Debug.Log(x))
            .AddTo(this);
    }
}
```

### Composite Disposal

```csharp
public class Example : MonoBehaviour
{
    private readonly CompositeDisposable mDisposables = new CompositeDisposable();

    void Start()
    {
        observable1.Subscribe(x => {}).AddTo(mDisposables);
        observable2.Subscribe(x => {}).AddTo(mDisposables);
        observable3.Subscribe(x => {}).AddTo(mDisposables);
    }

    void OnDestroy()
    {
        mDisposables.Dispose(); // Dispose all at once
    }
}
```

## Basic Operators

### Select (Map)

Transform each emitted value:

```csharp
Observable.Range(1, 5)
    .Select(x => x * 2)
    .Subscribe(x => Debug.Log(x)); // 2, 4, 6, 8, 10
```

### Where (Filter)

Filter values by condition:

```csharp
Observable.Range(1, 10)
    .Where(x => x % 2 == 0)
    .Subscribe(x => Debug.Log(x)); // 2, 4, 6, 8, 10
```

### DistinctUntilChanged

Only emit when value changes:

```csharp
ReactiveProperty<int> property = new ReactiveProperty<int>(1);

property.DistinctUntilChanged()
    .Subscribe(x => Debug.Log(x));

property.Value = 1; // Not emitted (same value)
property.Value = 2; // Emitted
property.Value = 2; // Not emitted (same value)
property.Value = 3; // Emitted
```

### First / FirstOrDefault

Get first emitted value:

```csharp
await Observable.Range(1, 5)
    .First(); // Returns 1

await Observable.Empty<int>()
    .FirstOrDefault(); // Returns default(int) = 0
```

## Marble Diagrams

Visual representation of observable streams:

```
Source:    --1--2--3--4--5--|
                 Select(x => x * 2)
Result:    --2--4--6--8--10-|

Source:    --1--2--3--4--5--|
                 Where(x => x % 2 == 0)
Result:    -----2-----4-----|

Source:    --1--1--2--2--2--3--|
                 DistinctUntilChanged()
Result:    --1-----2--------3--|
```

Legend:
- `--`: Time passing
- Number: Emitted value
- `|`: Completion
- `X`: Error

## Error Handling Basics

### Try-Catch Pattern

```csharp
observable
    .Subscribe(
        onNext: x => ProcessValue(x),
        onError: ex => Debug.LogError($"Error: {ex.Message}"),
        onCompleted: () => Debug.Log("Completed")
    );
```

### Catch Operator

```csharp
observable
    .Catch<int, Exception>(ex =>
    {
        Debug.LogError(ex);
        return Observable.Return(-1); // Fallback value
    })
    .Subscribe(x => Debug.Log(x));
```

## ReactiveProperty Basics

### Simple Property

```csharp
ReactiveProperty<int> health = new ReactiveProperty<int>(100);

// Subscribe to changes
health.Subscribe(h => Debug.Log($"Health: {h}"))
    .AddTo(this);

// Update value
health.Value = 75; // Triggers subscription
health.Value = 50;
```

### ReadOnly Property

```csharp
public class Player : MonoBehaviour
{
    private readonly ReactiveProperty<int> mHealth = new ReactiveProperty<int>(100);

    // Expose as read-only
    public IReadOnlyReactiveProperty<int> Health => mHealth;

    public void TakeDamage(int amount)
    {
        mHealth.Value -= amount;
    }
}
```

### Derived Property

```csharp
ReactiveProperty<int> health = new ReactiveProperty<int>(100);
ReadOnlyReactiveProperty<bool> isDead = health
    .Select(h => h <= 0)
    .ToReadOnlyReactiveProperty();

isDead.Subscribe(dead =>
{
    if (dead) Debug.Log("Player died!");
});
```

## Best Practices

1. **Always dispose**: Use `AddTo(this)` or `CompositeDisposable`
2. **Understand hot/cold**: Know when work starts
3. **Use DistinctUntilChanged**: Avoid redundant processing
4. **ReactiveProperty for state**: Better than manual events
5. **Marble diagrams**: Visualize complex streams
6. **Test with TestScheduler**: Deterministic async testing
