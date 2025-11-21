---
name: csharp-async-patterns
description: Modern C# asynchronous programming patterns using async/await, proper CancellationToken usage, and error handling in async code. Use when guidance needed on async/await best practices, Task composition and coordination, ConfigureAwait usage, ValueTask optimization, or async operation cancellation patterns. Pure .NET framework patterns applicable to any C# application.
---

# C# Async/Await Patterns

## Overview

This skill provides comprehensive guidance on modern asynchronous programming in C#, covering general .NET async patterns applicable to any C# application.

**Core Topics**:
- async/await fundamentals
- CancellationToken patterns
- ConfigureAwait usage
- Error handling in async code
- Task composition and coordination
- ValueTask optimization

## Quick Start

```csharp
// Basic async method with cancellation support
public async Task<Data> LoadDataAsync(CancellationToken ct = default)
{
    try
    {
        var data = await FetchAsync(ct);
        return ProcessData(data);
    }
    catch (OperationCanceledException)
    {
        // Expected when cancelled
        Log.Info("Operation cancelled");
        throw;
    }
}
```

## Reference Documentation

For detailed guidance, consult these reference files:

### [Best Practices](references/best-practices.md)
Essential patterns for async/await:
- When to use async/await vs synchronous code
- CancellationToken usage patterns
- ConfigureAwait guidance
- Avoiding async void
- Proper exception handling

### [Code Examples](references/code-examples.md)
Comprehensive code examples:
- Basic async operations
- Parallel execution patterns
- Sequential with dependencies
- Timeout and retry logic
- Advanced patterns

### [Anti-Patterns](references/anti-patterns.md)
Common mistakes to avoid:
- Blocking on async code (.Result, .Wait)
- Fire-and-forget without error handling
- Missing cancellation support
- Over-using async for simple operations

## Key Principles

1. **Async All the Way**: Once you go async, stay async throughout the call stack
2. **Always Support Cancellation**: Long-running operations must accept CancellationToken
3. **ConfigureAwait in Libraries**: Use ConfigureAwait(false) in library code to avoid capturing context
4. **Proper Error Handling**: Use try-catch with specific exception types
5. **ValueTask for Hot Paths**: Use ValueTask<T> for allocation-free async in performance-critical code

