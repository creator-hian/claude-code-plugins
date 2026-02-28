# Reactive Operators

## Filtering Operators

### Where

Filters elements based on a predicate.

```csharp
damageStream
    .Where(dmg => dmg.IsCritical)
    .Subscribe(dmg => ShowCriticalHitVFX(dmg.Position))
    .AddTo(this);
```

### Throttle (ThrottleFirst / ThrottleLast)

Suppresses emissions within a time window. `ThrottleFirst` takes the first value then ignores for the duration. `ThrottleLast` waits for silence then emits the last value.

```
Source:   --a-b-c-------d-e--|    ThrottleFirst(3)  =>  --a-----------d--|
Source:   --a-b-c-------d-e--|    ThrottleLast(3)   =>  --------c---------e--|
```

```csharp
// Prevent button spam: accept first click, ignore for 1 second
button.OnClickAsObservable()
    .ThrottleFirst(TimeSpan.FromSeconds(1))
    .Subscribe(_ => FireWeapon())
    .AddTo(this);
```

### Debounce

Emits only after a specified quiet period with no new emissions. Resets the timer on each new value.

```
Source:   --a-b-c----------d--e--|    Debounce(3)  =>  ----------c-----------e--|
```

```csharp
// Wait for player to stop typing before running search
searchInputField.OnValueChangedAsObservable()
    .Debounce(TimeSpan.FromMilliseconds(400))
    .Subscribe(query => ExecuteSearch(query))
    .AddTo(this);
```

### Take / TakeUntil

`Take(n)` emits the first N values then completes. `TakeUntil` emits until another observable fires.

```csharp
// Listen for the first 3 collisions only
collisionStream
    .Take(3)
    .Subscribe(col => ApplyImpactDamage(col))
    .AddTo(this);

// Track mouse position until the player releases the button
Observable.EveryUpdate()
    .Select(_ => Input.mousePosition)
    .TakeUntil(mouseUpStream)
    .Subscribe(pos => UpdateDragPreview(pos))
    .AddTo(this);
```

---

## Transformation Operators

### Select

Projects each element into a new form.

```csharp
touchStream
    .Select(touch => Camera.main.ScreenToWorldPoint(touch.position))
    .Subscribe(worldPos => MovePlayerTo(worldPos))
    .AddTo(this);
```

### SelectMany

Projects each element into an observable, then flattens all inner observables into one stream. Use this instead of nested subscriptions.

```
Source:     --A---------B---------|
inner(A):    --a1--a2--|
inner(B):              --b1--b2--|
Result:     ----a1--a2----b1--b2--|
```

```csharp
// Each click triggers an async load; flatten results into one stream
button.OnClickAsObservable()
    .SelectMany(_ => Observable.FromAsync(ct => LoadNextLevelAsync(ct)))
    .Subscribe(level => InitializeLevel(level))
    .AddTo(this);
```

### Buffer

Collects emitted values into bundles based on count or time windows.

```csharp
// Batch damage numbers: sum hits over 0.5s and show one combined number
damageStream
    .Buffer(TimeSpan.FromSeconds(0.5f))
    .Where(batch => batch.Count > 0)
    .Subscribe(batch =>
    {
        int totalDamage = batch.Sum(d => d.Amount);
        ShowDamageNumber(totalDamage);
    })
    .AddTo(this);
```

---

## Combination Operators

### CombineLatest

When any source emits, combines the latest value from each source. Requires all sources to have emitted at least once.

```
A:       --1-----3---------|    CombineLatest((a,b) => a+b)
B:       ----2-------4-----|    =>  ----3---5---7-----|
```

```csharp
// Enable "Start" button only when both name and class are selected
Observable.CombineLatest(
    playerNameProp.Select(n => !string.IsNullOrEmpty(n)),
    selectedClassProp.Select(c => c != null),
    (hasName, hasClass) => hasName && hasClass
)
.DistinctUntilChanged()
.Subscribe(interactable => startButton.interactable = interactable)
.AddTo(this);
```

### Merge

Combines multiple observables into one, forwarding values from all sources in arrival order.

```
A:       --1---3---5--|    Merge
B:       ----2---4----|    =>  --1-2-3-4-5--|
```

```csharp
// Unified input stream from keyboard, gamepad, and touch
Observable.Merge(
    keyboardInputStream,
    gamepadInputStream,
    touchInputStream
)
.Subscribe(input => ProcessInput(input))
.AddTo(this);
```

### Zip

Pairs elements from multiple sources by index. Waits until all sources have a value at position N before emitting.

```
A:       --1-----3---5--|    Zip((a,b) => a+b)
B:       ----2-------4--|    =>  ----3-------7--|
```

```csharp
Observable.Zip(
    requestStream,
    responseStream,
    (req, res) => new { Request = req, Response = res }
)
.Subscribe(pair => ValidateResponse(pair.Request, pair.Response))
.AddTo(this);
```

---

## Time Operators

### Delay

Shifts each emission forward in time by a specified duration.

```csharp
// Show damage number, then remove it after a delay
damageEventStream
    .Delay(TimeSpan.FromSeconds(2))
    .Subscribe(dmg => HideDamageNumber(dmg.Id))
    .AddTo(this);
```

### Timeout

Raises a `TimeoutException` if the source does not emit within the specified duration.

```csharp
serverResponseStream
    .Timeout(TimeSpan.FromSeconds(10))
    .Catch<ServerResponse, TimeoutException>(_ =>
    {
        Debug.LogWarning("Server response timed out");
        return Observable.Return(ServerResponse.TimedOut);
    })
    .Subscribe(response => HandleResponse(response))
    .AddTo(this);
```

### Sample

At regular intervals, emits the most recent value from the source if a new value arrived since the last sample.

```
Source:   --a-b-c-d-e-f-g--|    Sample(every 3)  =>  ------c-----f----|
```

```csharp
// Send position updates to network at a fixed 10Hz rate
Observable.EveryUpdate()
    .Select(_ => transform.position)
    .Sample(TimeSpan.FromMilliseconds(100))
    .DistinctUntilChanged()
    .Subscribe(pos => SendPositionToServer(pos))
    .AddTo(this);
```

---

## Error Handling Operators

### Catch

Intercepts an error and replaces the failed observable with a recovery observable.

```csharp
networkDataStream
    .Catch<GameData, HttpRequestException>(ex =>
    {
        Debug.LogWarning($"Network failed: {ex.Message}, using cache");
        return Observable.Return(LoadCachedData());
    })
    .Subscribe(data => ApplyGameData(data))
    .AddTo(this);
```

### Retry

Resubscribes to the source on error, up to a specified number of times.

```csharp
connectionStream
    .Retry(3)
    .Catch<ConnectionResult, Exception>(ex =>
    {
        Debug.LogError($"Connection failed after retries: {ex.Message}");
        return Observable.Return(ConnectionResult.Failed);
    })
    .Subscribe(result => OnConnectionResult(result))
    .AddTo(this);
```

---

## Composition Patterns

### Drag-and-Drop (SelectMany + TakeUntil)

```csharp
mouseDownStream
    .SelectMany(_ =>
        Observable.EveryUpdate()
            .Select(_ => Input.mousePosition)
            .DistinctUntilChanged()
            .TakeUntil(mouseUpStream)
    )
    .Subscribe(pos => UpdateDragPosition(pos))
    .AddTo(this);
```

### Double-Click Detection (Buffer + Debounce)

```csharp
button.OnClickAsObservable()
    .Buffer(button.OnClickAsObservable().Debounce(TimeSpan.FromMilliseconds(250)))
    .Where(clicks => clicks.Count >= 2)
    .Subscribe(_ => OnDoubleClick())
    .AddTo(this);
```

### Combo Counter (Scan + Merge)

```csharp
// Increment on hit within window, reset on timeout
hitStream
    .Select(_ => true)
    .Merge(
        hitStream.Debounce(TimeSpan.FromSeconds(2)).Select(_ => false)
    )
    .Scan(0, (combo, isHit) => isHit ? combo + 1 : 0)
    .Subscribe(combo => UpdateComboUI(combo))
    .AddTo(this);
```
