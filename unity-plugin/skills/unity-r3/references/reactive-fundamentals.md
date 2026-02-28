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
// R3 uses onErrorResume (not onError) - errors don't unsubscribe
observable.Subscribe(
    onNext: value => Debug.Log($"Value: {value}"),
    onErrorResume: error => Debug.LogError($"Error: {error}"),
    onCompleted: result => Debug.Log($"Completed: {result}")
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
Observable.FromEvent(
    h => new UnityAction(h),
    h => button.onClick.AddListener(h),
    h => button.onClick.RemoveListener(h)
).Subscribe(_ => Debug.Log("Clicked"));

// Create custom
Observable.Create<int>(observer =>
{
    observer.OnNext(1);
    observer.OnNext(2);
    observer.OnCompleted(Result.Success);
    return Disposable.Empty;
});
```

### Unity-Specific Creation

```csharp
// Frame-based observables (CancellationToken ties lifetime to MonoBehaviour)
Observable.EveryUpdate(destroyCancellationToken)
    .Subscribe(_ => Debug.Log("Update"));
Observable.EveryFixedUpdate(destroyCancellationToken)
    .Subscribe(_ => Debug.Log("FixedUpdate"));
Observable.EveryLateUpdate(destroyCancellationToken)
    .Subscribe(_ => Debug.Log("LateUpdate"));

// Value change observation
Observable.EveryValueChanged(target, x => x.position)
    .Subscribe(pos => Debug.Log($"Position: {pos}"));
```

## Hot vs Cold Observables

### Cold Observable

Starts emitting when subscribed, each subscription gets independent sequence:

```csharp
Observable<long> cold = Observable.Interval(TimeSpan.FromSeconds(1)).Take(3);

cold.Subscribe(x => Debug.Log($"Sub1: {x}"));
await UniTask.Delay(1500);
cold.Subscribe(x => Debug.Log($"Sub2: {x}"));

// Sub1: 0, Sub1: 1, Sub2: 0, Sub1: 2, Sub2: 1, Sub2: 2
```

### Hot Observable

In R3, `Subject<T>` is inherently hot. It distributes values to all current subscribers immediately - no `Publish()` or `Connect()` needed:

```csharp
Subject<int> subject = new Subject<int>();

subject.Subscribe(x => Debug.Log($"Sub1: {x}"));
subject.OnNext(1);

subject.Subscribe(x => Debug.Log($"Sub2: {x}"));
subject.OnNext(2);

// Sub1: 1, Sub1: 2, Sub2: 2
```

### Sharing a Cold Observable

To share a cold observable among multiple subscribers, use `ReplaySubject` or manually bridge through a `Subject`:

```csharp
// ReplaySubject replays buffered values to late subscribers
ReplaySubject<int> replay = new ReplaySubject<int>(bufferSize: 3);

// Bridge a cold source into the replay subject
Observable.Interval(TimeSpan.FromSeconds(1))
    .Subscribe(x => replay.OnNext((int)x));

replay.Subscribe(x => Debug.Log($"Sub1: {x}"));
// Late subscriber still receives buffered values
replay.Subscribe(x => Debug.Log($"Sub2: {x}"));
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

### DisposableBag (Preferred in R3)

R3 prefers `DisposableBag` over `CompositeDisposable` for better performance when Remove is not needed:

```csharp
public class Example : MonoBehaviour
{
    private DisposableBag mDisposables;

    void Start()
    {
        observable1.Subscribe(x => {}).AddTo(ref mDisposables);
        observable2.Subscribe(x => {}).AddTo(ref mDisposables);
        observable3.Subscribe(x => {}).AddTo(ref mDisposables);
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

### FirstAsync / FirstOrDefaultAsync

Get first emitted value asynchronously:

```csharp
await Observable.Range(1, 5)
    .FirstAsync(); // Returns 1

await Observable.Empty<int>()
    .FirstOrDefaultAsync(); // Returns default(int) = 0
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

### OnErrorResume Pattern

In R3, errors flow to `OnErrorResume` and do NOT unsubscribe the observer (unlike traditional Rx):

```csharp
observable
    .Subscribe(
        onNext: x => ProcessValue(x),
        onErrorResume: ex => Debug.LogError($"Error: {ex.Message}"),
        onCompleted: result => Debug.Log($"Completed: {result}")
    );
```

### Converting Errors to Completion

Use `OnErrorResumeAsFailure()` to convert `OnErrorResume` exceptions into `OnCompleted(Result.Failure(exception))`:

```csharp
observable
    .OnErrorResumeAsFailure()
    .Subscribe(
        onNext: x => Debug.Log(x),
        onCompleted: result =>
        {
            if (result.IsFailure)
                Debug.LogError($"Failed: {result.Exception}");
        }
    );
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
    .ToReadOnlyReactiveProperty(initialValue: false);

isDead.Subscribe(dead =>
{
    if (dead) Debug.Log("Player died!");
});
```

## Best Practices

1. **Always dispose**: Use `AddTo(this)` or `DisposableBag` (prefer over `CompositeDisposable` unless Remove is needed)
2. **Understand hot/cold**: `Subject<T>` is hot; factory methods produce cold observables
3. **Use DistinctUntilChanged**: Avoid redundant processing
4. **ReactiveProperty for state**: Better than manual events
5. **Marble diagrams**: Visualize complex streams
6. **OnErrorResume != OnError**: R3 errors don't unsubscribe - handle or convert with `OnErrorResumeAsFailure()`
