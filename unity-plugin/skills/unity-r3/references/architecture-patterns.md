# Architecture Patterns

## MVVM with ReactiveProperty

### ViewModel Base

```csharp
using R3;
using System;

public abstract class ViewModelBase : IDisposable
{
    protected readonly CompositeDisposable Disposables = new();

    public void Dispose()
    {
        Disposables.Dispose();
    }
}
```

### Player ViewModel

```csharp
using R3;

public class PlayerViewModel : ViewModelBase
{
    public ReactiveProperty<int> Health { get; } = new(100);
    public ReactiveProperty<int> MaxHealth { get; } = new(100);
    public ReactiveProperty<int> Mana { get; } = new(50);
    public ReactiveProperty<string> PlayerName { get; } = new("Player");
    public ReadOnlyReactiveProperty<float> HealthRatio { get; }
    public ReadOnlyReactiveProperty<bool> IsLowHealth { get; }
    public ReadOnlyReactiveProperty<string> StatusText { get; }

    public PlayerViewModel()
    {
        HealthRatio = Health
            .CombineLatest(MaxHealth, (current, max) => max > 0 ? (float)current / max : 0f)
            .ToReadOnlyReactiveProperty();

        IsLowHealth = HealthRatio
            .Select(ratio => ratio < 0.3f)
            .ToReadOnlyReactiveProperty();

        StatusText = Health
            .CombineLatest(MaxHealth, (current, max) => $"{current}/{max}")
            .ToReadOnlyReactiveProperty();

        HealthRatio.AddTo(Disposables);
        IsLowHealth.AddTo(Disposables);
        StatusText.AddTo(Disposables);
    }

    public void TakeDamage(int amount)
    {
        Health.Value = Math.Max(0, Health.Value - amount);
    }

    public void Heal(int amount)
    {
        Health.Value = Math.Min(MaxHealth.Value, Health.Value + amount);
    }
}
```

### View Binding (MonoBehaviour)

```csharp
using R3;
using R3.Triggers;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class PlayerView : MonoBehaviour
{
    [SerializeField] private TMP_Text healthText;
    [SerializeField] private Slider healthBar;
    [SerializeField] private Image healthBarFill;
    [SerializeField] private CanvasGroup lowHealthWarning;

    private PlayerViewModel mViewModel;

    public void Bind(PlayerViewModel viewModel)
    {
        mViewModel = viewModel;

        viewModel.StatusText
            .Subscribe(text => healthText.text = text)
            .AddTo(this);

        viewModel.HealthRatio
            .Subscribe(ratio => healthBar.value = ratio)
            .AddTo(this);

        viewModel.IsLowHealth
            .Subscribe(isLow =>
            {
                healthBarFill.color = isLow ? Color.red : Color.green;
                lowHealthWarning.alpha = isLow ? 1f : 0f;
            })
            .AddTo(this);
    }
}
```

### Model-to-ViewModel Synchronization

```csharp
using R3;
using UnityEngine;

public class PlayerModel : MonoBehaviour
{
    private readonly PlayerViewModel mViewModel = new();

    public PlayerViewModel ViewModel => mViewModel;

    void OnDestroy()
    {
        mViewModel.Dispose();
    }

    public void ApplyDamage(int damage, DamageType type)
    {
        int finalDamage = type switch
        {
            DamageType.Physical => Mathf.Max(1, damage - GetArmor()),
            DamageType.Magical => damage,
            _ => damage
        };

        mViewModel.TakeDamage(finalDamage);
    }

    private int GetArmor() => 5;
}
```

## Event Aggregator Pattern

### Typed Event Aggregator

```csharp
using R3;
using System;
using System.Collections.Generic;

public class EventAggregator : IDisposable
{
    private readonly Dictionary<Type, object> mSubjects = new();
    private readonly object mLock = new();

    public void Publish<T>(T message)
    {
        if (TryGetSubject<T>(out var subject))
        {
            subject.OnNext(message);
        }
    }

    public Observable<T> Receive<T>()
    {
        return GetOrCreateSubject<T>();
    }

    private Subject<T> GetOrCreateSubject<T>()
    {
        lock (mLock)
        {
            if (!mSubjects.TryGetValue(typeof(T), out var obj))
            {
                obj = new Subject<T>();
                mSubjects[typeof(T)] = obj;
            }

            return (Subject<T>)obj;
        }
    }

    private bool TryGetSubject<T>(out Subject<T> subject)
    {
        lock (mLock)
        {
            if (mSubjects.TryGetValue(typeof(T), out var obj))
            {
                subject = (Subject<T>)obj;
                return true;
            }

            subject = null;
            return false;
        }
    }

    public void Dispose()
    {
        lock (mLock)
        {
            foreach (var subject in mSubjects.Values)
            {
                if (subject is IDisposable disposable)
                {
                    disposable.Dispose();
                }
            }

            mSubjects.Clear();
        }
    }
}
```

### Game Event Definitions

```csharp
// Define events as lightweight structs
public readonly struct EnemyKilledEvent
{
    public readonly int EnemyId;
    public readonly int ScoreValue;
    public readonly UnityEngine.Vector3 Position;

    public EnemyKilledEvent(int enemyId, int scoreValue, UnityEngine.Vector3 position)
    {
        EnemyId = enemyId;
        ScoreValue = scoreValue;
        Position = position;
    }
}

public readonly struct PlayerDamagedEvent
{
    public readonly int Damage;
    public readonly int RemainingHealth;

    public PlayerDamagedEvent(int damage, int remainingHealth)
    {
        Damage = damage;
        RemainingHealth = remainingHealth;
    }
}

public readonly struct WaveCompletedEvent
{
    public readonly int WaveNumber;
    public readonly float CompletionTime;

    public WaveCompletedEvent(int waveNumber, float completionTime)
    {
        WaveNumber = waveNumber;
        CompletionTime = completionTime;
    }
}
```

### Usage with EventAggregator

```csharp
using R3;
using UnityEngine;

public class ScoreManager : MonoBehaviour
{
    [SerializeField] private EventAggregator events;

    private readonly ReactiveProperty<int> mScore = new(0);
    public ReadOnlyReactiveProperty<int> Score => mScore;

    void Start()
    {
        events.Receive<EnemyKilledEvent>()
            .Subscribe(e => mScore.Value += e.ScoreValue)
            .AddTo(this);

        // Combo bonus: multiple kills within 2 seconds
        events.Receive<EnemyKilledEvent>()
            .Buffer(TimeSpan.FromSeconds(2))
            .Where(kills => kills.Count >= 3)
            .Subscribe(kills =>
            {
                int bonus = kills.Count * 50;
                mScore.Value += bonus;
                Debug.Log($"Combo x{kills.Count}! +{bonus} bonus");
            })
            .AddTo(this);
    }
}
```

## State Management Systems

### Reactive Finite State Machine

```csharp
using R3;
using System;

public class ReactiveStateMachine<TState> : IDisposable where TState : Enum
{
    private readonly ReactiveProperty<TState> mCurrentState;
    private readonly Subject<(TState From, TState To)> mTransitions = new();
    private readonly CompositeDisposable mDisposables = new();

    public ReadOnlyReactiveProperty<TState> CurrentState { get; }
    public Observable<(TState From, TState To)> OnTransition => mTransitions;

    public ReactiveStateMachine(TState initialState)
    {
        mCurrentState = new ReactiveProperty<TState>(initialState);
        CurrentState = mCurrentState.ToReadOnlyReactiveProperty();
        CurrentState.AddTo(mDisposables);
    }

    public bool TryTransition(TState newState)
    {
        var from = mCurrentState.Value;

        if (from.Equals(newState))
            return false;

        mCurrentState.Value = newState;
        mTransitions.OnNext((from, newState));
        return true;
    }

    public Observable<TState> OnEnter(TState state)
    {
        return mCurrentState.Where(s => s.Equals(state));
    }

    public Observable<TState> OnExit(TState state)
    {
        return mTransitions
            .Where(t => t.From.Equals(state))
            .Select(t => t.To);
    }

    public void Dispose()
    {
        mTransitions.Dispose();
        mCurrentState.Dispose();
        mDisposables.Dispose();
    }
}
```

### Enemy AI with Reactive State

```csharp
using R3;
using UnityEngine;

public enum EnemyState { Idle, Patrol, Chase, Attack, Dead }

public class EnemyAI : MonoBehaviour
{
    private ReactiveStateMachine<EnemyState> mStateMachine;

    public ReadOnlyReactiveProperty<EnemyState> State => mStateMachine.CurrentState;

    void Start()
    {
        mStateMachine = new ReactiveStateMachine<EnemyState>(EnemyState.Idle);

        mStateMachine.OnEnter(EnemyState.Chase)
            .Subscribe(_ => Debug.Log("Started chasing player"))
            .AddTo(this);

        mStateMachine.OnEnter(EnemyState.Attack)
            .Subscribe(_ => StartAttackAnimation())
            .AddTo(this);

        mStateMachine.OnEnter(EnemyState.Dead)
            .Subscribe(_ => HandleDeath())
            .AddTo(this);

        // Log all transitions for debugging
        mStateMachine.OnTransition
            .Subscribe(t => Debug.Log($"Enemy: {t.From} -> {t.To}"))
            .AddTo(this);
    }

    void OnDestroy()
    {
        mStateMachine?.Dispose();
    }

    public void OnPlayerDetected() => mStateMachine.TryTransition(EnemyState.Chase);
    public void OnPlayerInRange() => mStateMachine.TryTransition(EnemyState.Attack);
    public void OnPlayerLost() => mStateMachine.TryTransition(EnemyState.Patrol);
    public void OnKilled() => mStateMachine.TryTransition(EnemyState.Dead);

    private void StartAttackAnimation() { }
    private void HandleDeath() { }
}
```

## UI Data Binding

### Reactive Inventory UI

```csharp
using R3;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class InventorySlotView : MonoBehaviour
{
    [SerializeField] private Image icon;
    [SerializeField] private TMP_Text quantityText;
    [SerializeField] private GameObject quantityBadge;

    public void Bind(InventorySlotViewModel slot)
    {
        slot.Icon
            .Subscribe(sprite =>
            {
                icon.sprite = sprite;
                icon.enabled = sprite != null;
            })
            .AddTo(this);

        slot.Quantity
            .Subscribe(qty =>
            {
                quantityBadge.SetActive(qty > 1);
                quantityText.text = qty.ToString();
            })
            .AddTo(this);
    }
}

public class InventorySlotViewModel : ViewModelBase
{
    public ReactiveProperty<Sprite> Icon { get; } = new(null);
    public ReactiveProperty<int> Quantity { get; } = new(0);
    public ReactiveProperty<string> ItemId { get; } = new(string.Empty);

    public ReadOnlyReactiveProperty<bool> IsEmpty { get; }

    public InventorySlotViewModel()
    {
        IsEmpty = Quantity
            .Select(q => q <= 0)
            .ToReadOnlyReactiveProperty();

        IsEmpty.AddTo(Disposables);
    }
}
```

### Two-Way Binding for Settings UI

```csharp
using R3;
using UnityEngine;
using UnityEngine.UI;

public class SettingsView : MonoBehaviour
{
    [SerializeField] private Slider volumeSlider;
    [SerializeField] private Toggle muteToggle;

    private readonly ReactiveProperty<float> mVolume = new(1f);
    private readonly ReactiveProperty<bool> mIsMuted = new(false);

    void Start()
    {
        // Model -> View
        mVolume
            .Subscribe(v => volumeSlider.SetValueWithoutNotify(v))
            .AddTo(this);

        mIsMuted
            .Subscribe(m => muteToggle.SetIsOnWithoutNotify(m))
            .AddTo(this);

        // View -> Model
        volumeSlider.OnValueChangedAsObservable()
            .Subscribe(v => mVolume.Value = v)
            .AddTo(this);

        muteToggle.OnValueChangedAsObservable()
            .Subscribe(m => mIsMuted.Value = m)
            .AddTo(this);

        // Derived: effective volume
        mVolume.CombineLatest(mIsMuted, (vol, muted) => muted ? 0f : vol)
            .Subscribe(v => AudioListener.volume = v)
            .AddTo(this);
    }
}
```

## Message Broker Implementation

### Channel-Based Message Broker

```csharp
using R3;
using System;
using System.Collections.Generic;

public class MessageBroker : IDisposable
{
    private readonly Dictionary<string, object> mChannels = new();
    private readonly object mLock = new();

    public void Publish<T>(string channel, T message)
    {
        lock (mLock)
        {
            if (mChannels.TryGetValue(channel, out var obj) && obj is Subject<T> subject)
            {
                subject.OnNext(message);
            }
        }
    }

    public Observable<T> Subscribe<T>(string channel)
    {
        lock (mLock)
        {
            var key = channel;

            if (!mChannels.TryGetValue(key, out var obj))
            {
                obj = new Subject<T>();
                mChannels[key] = obj;
            }

            return ((Subject<T>)obj).AsObservable();
        }
    }

    public void Dispose()
    {
        lock (mLock)
        {
            foreach (var subject in mChannels.Values)
            {
                if (subject is IDisposable disposable)
                {
                    disposable.Dispose();
                }
            }

            mChannels.Clear();
        }
    }
}
```

### Game Systems Using Message Broker

```csharp
using R3;
using UnityEngine;

public static class Channels
{
    public const string Combat = "combat";
    public const string UI = "ui";
    public const string Audio = "audio";
}

// Combat system publishes damage events
public class CombatSystem : MonoBehaviour
{
    [SerializeField] private MessageBroker broker;

    public void ProcessHit(int targetId, int damage)
    {
        broker.Publish(Channels.Combat, new DamageEvent(targetId, damage));
        broker.Publish(Channels.Audio, new PlaySoundEvent("hit_impact"));
        broker.Publish(Channels.UI, new ShowFloatingTextEvent(damage.ToString(), Color.red));
    }
}

// Audio system listens for sound requests
public class AudioSystem : MonoBehaviour
{
    [SerializeField] private MessageBroker broker;

    void Start()
    {
        broker.Subscribe<PlaySoundEvent>(Channels.Audio)
            .ThrottleLast(TimeSpan.FromMilliseconds(50))
            .Subscribe(e => PlaySound(e.SoundId))
            .AddTo(this);
    }

    private void PlaySound(string soundId) { }
}

// Supporting event types
public readonly struct DamageEvent
{
    public readonly int TargetId;
    public readonly int Damage;

    public DamageEvent(int targetId, int damage)
    {
        TargetId = targetId;
        Damage = damage;
    }
}

public readonly struct PlaySoundEvent
{
    public readonly string SoundId;
    public PlaySoundEvent(string soundId) => SoundId = soundId;
}

public readonly struct ShowFloatingTextEvent
{
    public readonly string Text;
    public readonly Color Color;

    public ShowFloatingTextEvent(string text, Color color)
    {
        Text = text;
        Color = color;
    }
}
```
