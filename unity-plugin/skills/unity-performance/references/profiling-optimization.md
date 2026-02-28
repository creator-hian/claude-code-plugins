# Unity Profiling and Optimization Patterns

## Unity Profiler Usage

### Opening the Profiler

`Window > Analysis > Profiler` (or Ctrl+7 / Cmd+7).

### Key Profiler Modules

| Module | What It Measures |
|--------|-----------------|
| CPU Usage | Script execution time, rendering, physics |
| GPU Usage | Draw calls, shader complexity |
| Memory | Managed heap, native allocations, textures |
| Rendering | Batches, SetPass calls, triangles |
| Physics | Rigidbody count, contacts, solver time |

### Profiler Markers in Code

```csharp
using UnityEngine.Profiling;

void Update()
{
    Profiler.BeginSample("MySystem.Update");

    // Code to profile
    ProcessEntities();

    Profiler.EndSample();
}

// Using ProfilerMarker (preferred, lower overhead)
using Unity.Profiling;

private static readonly ProfilerMarker s_ProcessMarker =
    new ProfilerMarker("MySystem.Process");

void Process()
{
    using (s_ProcessMarker.Auto())
    {
        // Profiled code block
    }
}
```

### Deep Profiling vs Instrumentation

- **Deep Profile**: Profiles every method call. Very high overhead, use only for finding hidden bottlenecks.
- **Instrumentation (ProfilerMarker)**: Low overhead, profile specific sections. Use for production builds.

### Profiling on Device

```csharp
// Enable in Development Build settings:
// - Development Build: checked
// - Autoconnect Profiler: checked

// Or connect manually via IP in Profiler window
```

## CPU Optimization Patterns

### Reduce Update Calls

```csharp
// Bad: processing every frame when not needed
void Update()
{
    CheckEnemyDistance(); // Runs 60+ times per second
}

// Good: stagger updates
private float checkInterval = 0.5f;
private float nextCheckTime;

void Update()
{
    if (Time.time >= nextCheckTime)
    {
        nextCheckTime = Time.time + checkInterval;
        CheckEnemyDistance();
    }
}
```

### Cache Component References

```csharp
// Bad: GetComponent every frame
void Update()
{
    GetComponent<Rigidbody>().AddForce(Vector3.up);
}

// Good: cache in Awake
private Rigidbody rb;

void Awake()
{
    TryGetComponent(out rb);
}

void Update()
{
    if (rb != null)
        rb.AddForce(Vector3.up);
}
```

### Avoid Allocations in Hot Paths

```csharp
// Bad: allocates every frame
void Update()
{
    var enemies = new List<Enemy>();
    FindEnemiesInRange(enemies);
}

// Good: reuse collection
private readonly List<Enemy> enemies = new();

void Update()
{
    enemies.Clear();
    FindEnemiesInRange(enemies);
}
```

### String Operations

```csharp
// Bad: string concatenation allocates every frame
void Update()
{
    scoreText.text = "Score: " + score.ToString();
}

// Good: only update when value changes
private int lastScore = -1;

void Update()
{
    if (score != lastScore)
    {
        lastScore = score;
        scoreText.text = $"Score: {score}";
    }
}
```

## GPU Optimization Patterns

### Static Batching

Mark non-moving objects as Static in the Inspector. Unity combines their meshes at build time to reduce draw calls.

### Dynamic Batching

Automatically batches small meshes (< 300 vertices) sharing the same material. Enable in Player Settings.

### GPU Instancing

For rendering many identical meshes (trees, grass, props):

1. Enable "GPU Instancing" on the material
2. Objects must share the same mesh and material
3. Use `MaterialPropertyBlock` for per-instance variation

```csharp
private MaterialPropertyBlock propBlock;

void Start()
{
    propBlock = new MaterialPropertyBlock();
}

void SetInstanceColor(Renderer renderer, Color color)
{
    renderer.GetPropertyBlock(propBlock);
    propBlock.SetColor("_Color", color);
    renderer.SetPropertyBlock(propBlock);
}
```

### SRP Batcher (URP/HDRP)

The SRP Batcher reduces SetPass calls by caching shader properties. It works automatically with compatible shaders. Check compatibility in Frame Debugger.

### LOD (Level of Detail)

```csharp
// LOD Group configuration
// LOD0: 100-60% screen size (full detail)
// LOD1: 60-30% screen size (medium detail)
// LOD2: 30-10% screen size (low detail)
// Culled: <10% screen size (not rendered)
```

### Occlusion Culling

For large scenes with many objects hidden behind walls or terrain:

1. Mark static occluders and occludees
2. Bake occlusion data: `Window > Rendering > Occlusion Culling > Bake`
3. Unity skips rendering objects hidden behind occluders

## Memory Optimization Patterns

### Texture Memory

```
// Texture import settings for mobile
Max Size: 1024 (reduce for UI elements, increase for hero textures)
Compression: ASTC 6x6 (mobile) or DXT5 (desktop)
Generate Mip Maps: Yes (for 3D), No (for UI)
Read/Write Enabled: No (unless you need CPU access)
```

### Audio Memory

```
// Audio clip settings
Load Type: Decompress on Load (short SFX)
Load Type: Compressed in Memory (medium clips)
Load Type: Streaming (music, ambient)
Compression Format: Vorbis (quality vs size)
```

### Unloading Unused Assets

```csharp
// After scene transitions
await Resources.UnloadUnusedAssets();

// Force garbage collection (use sparingly)
System.GC.Collect();
```

## Frame Debugger

`Window > Analysis > Frame Debugger`

Use to inspect:
- Individual draw calls
- Batching effectiveness (why batches break)
- Shader properties per draw call
- Overdraw visualization

## Performance Checklist

### Before Profiling
- Build for target platform (Editor performance is not representative)
- Use Development Build with Autoconnect Profiler
- Test on lowest-spec target device

### Common Bottlenecks
- **High CPU**: Too many Update calls, physics, AI, string allocations
- **High GPU**: Too many draw calls, overdraw, complex shaders, high-res textures
- **Memory spikes**: GC collection pauses from frequent allocations
- **Loading time**: Uncompressed assets, synchronous loading
