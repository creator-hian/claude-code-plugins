---
name: unity-performance
description: Optimize Unity game performance through profiling, draw call reduction, and resource management. Masters batching, LOD, occlusion culling, and mobile optimization. Use for performance bottlenecks, frame rate issues, or optimization strategies.
---

# Unity Performance Optimization

## Overview

Performance optimization for Unity games focusing on profiling and systematic optimization.

**Core Topics**:
- Unity Profiler analysis
- Draw call reduction
- GPU instancing and SRP Batcher
- LOD (Level of Detail)
- Occlusion culling
- Object pooling
- Memory optimization

## Quick Start

```csharp
// Object pooling pattern
public class ObjectPool<T> where T : Component
{
    private readonly Queue<T> pool = new();
    private readonly T prefab;

    public ObjectPool(T prefab, int initialSize)
    {
        this.prefab = prefab;
        for (int i = 0; i < initialSize; i++)
        {
            var obj = Object.Instantiate(prefab);
            obj.gameObject.SetActive(false);
            pool.Enqueue(obj);
        }
    }

    public T Get()
    {
        if (pool.Count > 0)
        {
            var obj = pool.Dequeue();
            obj.gameObject.SetActive(true);
            return obj;
        }
        return Object.Instantiate(prefab);
    }

    public void Return(T obj)
    {
        obj.gameObject.SetActive(false);
        pool.Enqueue(obj);
    }
}
```

## Performance Targets

- **Mobile**: 30-60 FPS, <100 draw calls
- **Desktop**: 60+ FPS, <500 draw calls
- **VR**: 90 FPS minimum, <200 draw calls

## Profiling Workflow

1. **Profile first**: Identify actual bottleneck (CPU/GPU/Memory)
2. **Measure baseline**: Record before optimization
3. **Optimize bottleneck**: Focus on biggest impact
4. **Measure improvement**: Validate changes
5. **Repeat**: Until target performance reached

## Optimization Checklist

### CPU Optimization
- ✅ Reduce Update/FixedUpdate calls
- ✅ Object pooling for frequently spawned objects
- ✅ Cache component references
- ✅ Use events instead of polling

### GPU Optimization
- ✅ Static batching for static objects
- ✅ GPU instancing for identical meshes
- ✅ Reduce SetPass calls via material sharing
- ✅ LOD groups for distant objects
- ✅ Occlusion culling for large scenes

### Memory Optimization
- ✅ Texture compression
- ✅ Mesh optimization (reduce vertex count)
- ✅ Audio compression and streaming
- ✅ Asset bundle management
- ✅ Unload unused assets

## Best Practices

1. **Profile on target platform**: Editor performance differs
2. **Optimize systematically**: Measure, optimize, validate
3. **Quality settings**: Provide options for different hardware
4. **Balance visuals vs performance**: Adjust based on target
5. **Test on low-end**: Ensure minimum spec performance
