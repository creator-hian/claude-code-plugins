# C# Plugin for Claude Code

Modern C# development plugin with comprehensive async/await patterns and best practices.

## Overview

This plugin provides specialized C# development support with a focus on modern asynchronous programming patterns applicable to any .NET application.

## Features

### Included Agents

#### 🔧 C# Pro Agent

Expert C# agent specializing in modern .NET development and enterprise-grade applications.

**Specializations:**
- Modern C# features (records, pattern matching, nullable reference types)
- .NET ecosystem (ASP.NET Core, Entity Framework, Blazor)
- SOLID principles and design patterns
- Performance optimization and memory management
- Async/await and concurrent programming
- Comprehensive testing strategies
- Enterprise patterns and microservices architecture

**Proactive Usage:**
- Automatically activated for C# refactoring tasks
- Performance optimization scenarios
- Complex .NET solution development
- Enterprise architecture implementations

**Integrated Skills:**
- Utilizes `csharp-async-patterns` skill for async/await implementations
- References best practices, code examples, and anti-patterns automatically

### Included Skills

#### = C# Async/Await Patterns

Comprehensive guidance on modern asynchronous programming in C#.

**Core Topics:**
- async/await fundamentals
- CancellationToken patterns
- ConfigureAwait usage
- Error handling in async code
- Task composition and coordination
- ValueTask optimization

**When to Use:**
- Implementing async/await in C# applications
- Need guidance on proper CancellationToken usage
- Working with Task composition and coordination
- Optimizing async code with ValueTask
- Debugging async/await issues
- Code review for async patterns

**Quick Example:**
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
        Log.Info("Operation cancelled");
        throw;
    }
}
```

## Installation

1. Copy this plugin directory to your Claude Code plugins folder
2. Restart Claude Code or reload plugins
3. The skills will be automatically available

## Usage

### Using the C# Pro Agent

The C# Pro agent can be explicitly invoked for specialized C# tasks:

```
Use the csharp-pro agent to refactor this code with modern C# features
```

The agent will automatically:
- Apply modern C# patterns (records, pattern matching, etc.)
- Reference async/await best practices from the skill library
- Implement SOLID principles and design patterns
- Optimize for performance and memory management

### Using Skills Directly

The plugin skills are automatically activated when working with C# code. You can also explicitly reference the skill:

```
Can you help me implement proper async/await patterns for this C# code?
Reference the csharp-async-patterns skill for best practices.
```

## Skill References

Each skill includes comprehensive reference documentation:

### C# Async Patterns References
- **Best Practices**: Essential patterns for async/await implementation
- **Code Examples**: Comprehensive code examples for common scenarios
- **Anti-Patterns**: Common mistakes to avoid and their solutions

## Key Principles

1. **Async All the Way**: Once you go async, stay async throughout the call stack
2. **Always Support Cancellation**: Long-running operations must accept CancellationToken
3. **ConfigureAwait in Libraries**: Use ConfigureAwait(false) in library code
4. **Proper Error Handling**: Use try-catch with specific exception types
5. **ValueTask for Hot Paths**: Use ValueTask<T> for allocation-free async

## Version

**Version**: 1.0.0
**Author**: Creator Hian

## License

See plugin marketplace documentation for license information.

## Contributing

For issues, improvements, or additional skills, please contribute through the Creator Hian Marketplace.
