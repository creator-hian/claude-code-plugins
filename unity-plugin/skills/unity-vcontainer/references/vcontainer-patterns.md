# VContainer Best Practices

L3 deep reference for advanced VContainer patterns in Unity.

## LifetimeScope Hierarchies

Child scopes inherit parent registrations and can override them. Disposing a parent disposes all children.

### Root, Scene, and Local Scopes

```csharp
// Root scope: application-wide singletons, lives for the entire app lifetime
public class RootLifetimeScope : LifetimeScope
{
    protected override void Configure(IContainerBuilder builder)
    {
        builder.Register<IAnalyticsService, AnalyticsService>(Lifetime.Singleton);
        builder.Register<ISaveSystem, SaveSystem>(Lifetime.Singleton);
    }
}

// Scene scope: set Parent in Inspector or override Parent property
public class BattleSceneLifetimeScope : LifetimeScope
{
    [SerializeField] private BattleConfig mBattleConfig;

    protected override void Configure(IContainerBuilder builder)
    {
        builder.RegisterInstance(mBattleConfig);
        builder.Register<IBattleManager, BattleManager>(Lifetime.Scoped);
        builder.RegisterComponentInHierarchy<BattleUI>();
    }
}

// Local scope: runtime child for per-entity containers
public class EnemySpawner : MonoBehaviour
{
    [Inject] private LifetimeScope mParentScope;

    public void SpawnEnemy(EnemyData data)
    {
        var childScope = mParentScope.CreateChild(builder =>
        {
            builder.RegisterInstance(data);
            builder.Register<IEnemyAI, EnemyAI>(Lifetime.Scoped);
            builder.RegisterComponentOnNewGameObject<EnemyController>(
                Lifetime.Scoped, "Enemy");
        });
    }
}
```

### Parent-Child Wiring

```csharp
// 1. Inspector: drag parent LifetimeScope into the "Parent" field

// 2. Override Parent property
public class GameplayLifetimeScope : LifetimeScope
{
    protected override LifetimeScope Parent => LifetimeScope.Find<RootLifetimeScope>();
}

// 3. EnqueueParent for runtime-created scopes
using (LifetimeScope.EnqueueParent(parentScope))
{
    // Next LifetimeScope.Awake() in this frame uses parentScope
}
```

## Injection Types

### Constructor Injection (Preferred)

Use for all required dependencies on plain C# classes.

```csharp
public class WeaponSystem : IWeaponSystem
{
    private readonly IInventoryService mInventory;
    private readonly IDamageCalculator mDamageCalc;

    // VContainer picks the constructor with the most resolvable parameters
    public WeaponSystem(IInventoryService inventory, IDamageCalculator damageCalc)
    {
        mInventory = inventory;
        mDamageCalc = damageCalc;
    }
}

builder.Register<IWeaponSystem, WeaponSystem>(Lifetime.Singleton);
```

### Method Injection

Use for MonoBehaviours, which cannot have parameterized constructors.

```csharp
public class HUDController : MonoBehaviour
{
    private IScoreService mScoreService;

    [Inject]
    public void Construct(IScoreService scoreService)
    {
        mScoreService = scoreService;
    }
}

builder.RegisterComponentInHierarchy<HUDController>();
```

### Property / Field Injection

Last resort. Dependencies are less visible than constructor/method injection.

```csharp
public class DebugOverlay : MonoBehaviour
{
    [Inject] private readonly IDebugService mDebugService;
}
```

### Selection Guide

| Type | Target | Use When |
|------|--------|----------|
| Constructor | Plain C# classes | Default choice for services |
| Method `[Inject]` | MonoBehaviours | MonoBehaviours needing DI |
| Field/Property `[Inject]` | Any | Legacy code; no other option |

## Testing with Mock Registrations

### Basic Test Setup

Create a `ContainerBuilder` directly. No scene or `LifetimeScope` required.

```csharp
using NUnit.Framework;
using NSubstitute;
using VContainer;

[TestFixture]
public class WeaponSystemTests
{
    private IObjectResolver mContainer;
    private IInventoryService mMockInventory;

    [SetUp]
    public void SetUp()
    {
        mMockInventory = Substitute.For<IInventoryService>();
        var builder = new ContainerBuilder();
        builder.RegisterInstance(mMockInventory).As<IInventoryService>();
        builder.Register<IDamageCalculator, DamageCalculator>(Lifetime.Transient);
        builder.Register<IWeaponSystem, WeaponSystem>(Lifetime.Transient);
        mContainer = builder.Build();
    }

    [TearDown]
    public void TearDown() => mContainer.Dispose();

    [Test]
    public void Attack_ConsumesAmmo()
    {
        var system = mContainer.Resolve<IWeaponSystem>();
        system.Attack(new WeaponData());
        mMockInventory.Received(1).ConsumeAmmo(Arg.Any<int>());
    }
}
```

### Substituting a Single Service

Share a base builder and override only what the specific test needs.

```csharp
[Test]
public void BossMultiplier_IsApplied()
{
    // CreateBaseBuilder() registers ILogger, IConfigProvider, etc.
    var builder = TestContainerHelper.CreateBaseBuilder();

    // Override just IConfigProvider with a mock
    var mockConfig = Substitute.For<IConfigProvider>();
    mockConfig.BossDamageMultiplier.Returns(3.0f);
    builder.RegisterInstance(mockConfig).As<IConfigProvider>();
    builder.Register<IDamageCalculator, DamageCalculator>(Lifetime.Transient);

    using var container = builder.Build();
    var calc = container.Resolve<IDamageCalculator>();
    Assert.AreEqual(30f, calc.Calculate(new WeaponData { BaseDamage = 10 }));
}
```

### Testing EntryPoints

`IStartable.Start()` is called during `Build()`, so assertions work immediately.

```csharp
[Test]
public void GameInitializer_LoadsSaveOnStart()
{
    var mockSave = Substitute.For<ISaveSystem>();
    var builder = new ContainerBuilder();
    builder.RegisterInstance(mockSave).As<ISaveSystem>();
    builder.RegisterEntryPoint<GameInitializer>();

    using var container = builder.Build();
    mockSave.Received(1).LoadGame();
}
```

## Advanced Registration Patterns

### Factory Registration

Use when object creation depends on runtime parameters.

```csharp
public class CombatLifetimeScope : LifetimeScope
{
    [SerializeField] private Projectile mPrefab;

    protected override void Configure(IContainerBuilder builder)
    {
        // Func<> factory with runtime parameters
        builder.RegisterFactory<Vector3, Vector3, Projectile>(container =>
        {
            var pool = container.Resolve<IObjectPool>();
            return (pos, dir) =>
            {
                var proj = pool.Get(mPrefab);
                proj.transform.position = pos;
                proj.Launch(dir);
                return proj;
            };
        }, Lifetime.Scoped);
    }
}
```

For complex creation logic, extract a custom factory class registered via `builder.Register<IProjectileFactory, ProjectileFactory>(Lifetime.Scoped)` and use `IObjectResolver.Inject()` to inject dependencies into instantiated MonoBehaviours.

### Open Generic Registration

VContainer does not support open generic auto-resolution. Register each closed generic explicitly.

```csharp
// Given: IRepository<T> interface and Repository<T> implementation
builder.Register<IRepository<Player>, Repository<Player>>(Lifetime.Singleton);
builder.Register<IRepository<Enemy>, Repository<Enemy>>(Lifetime.Singleton);
builder.Register<IRepository<Item>, Repository<Item>>(Lifetime.Singleton);
```

### Conditional Registration

```csharp
public class PlatformLifetimeScope : LifetimeScope
{
    [SerializeField] private GameConfig mConfig;

    protected override void Configure(IContainerBuilder builder)
    {
        // Compile-time platform selection
#if UNITY_ANDROID || UNITY_IOS
        builder.Register<IFileSystem, MobileFileSystem>(Lifetime.Singleton);
#else
        builder.Register<IFileSystem, DesktopFileSystem>(Lifetime.Singleton);
#endif

        // Runtime feature flag
        if (mConfig.UseNewMatchmaking)
            builder.Register<IMatchmaker, EloMatchmaker>(Lifetime.Singleton);
        else
            builder.Register<IMatchmaker, RandomMatchmaker>(Lifetime.Singleton);
    }
}
```

### EntryPoint Patterns

Entry points replace manager MonoBehaviours. They hook into Unity's PlayerLoopSystem.

```csharp
public class GameLoopManager : IStartable, ITickable, IDisposable
{
    private readonly IInputSystem mInput;
    private readonly IPhysicsSystem mPhysics;

    public GameLoopManager(IInputSystem input, IPhysicsSystem physics)
    {
        mInput = input;
        mPhysics = physics;
    }

    public void Start() => mInput.Enable();               // called once after Build()
    public void Tick() => mPhysics.Step(Time.deltaTime);   // called every frame
    public void Dispose() => mInput.Disable();
}

// Registration
builder.RegisterEntryPoint<GameLoopManager>();
builder.RegisterEntryPoint<UIUpdateManager>();

// Entry point that is also resolvable as an interface
builder.RegisterEntryPoint<ScoreTracker>().As<IScoreTracker>();
```

Available interfaces: `IStartable`, `ITickable`, `IFixedTickable`, `ILateTickable`, `IDisposable`.
