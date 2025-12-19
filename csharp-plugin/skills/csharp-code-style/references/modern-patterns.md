# Modern C# Patterns Reference

## Records

### Basic Records

```csharp
// Positional record (most concise)
public record OrderDto(int Id, string CustomerName, decimal TotalAmount);

// Usage
var order = new OrderDto(1, "John Doe", 99.99m);
var (id, name, amount) = order; // Deconstruction

// With-expression for immutable updates
var updated = order with { TotalAmount = 109.99m };
```

### Records with Additional Members

```csharp
public record CustomerDto(string FirstName, string LastName, string Email)
{
    // Computed property
    public string FullName => $"{FirstName} {LastName}";

    // Optional properties with init
    public string? Phone { get; init; }
    public DateTime? BirthDate { get; init; }

    // Custom method
    public bool HasValidEmail() => Email.Contains('@');
}

// Usage
var customer = new CustomerDto("John", "Doe", "john@example.com")
{
    Phone = "123-456-7890"
};
```

### Record Structs (C# 10+)

```csharp
// Value type record for performance
public readonly record struct Point(int X, int Y);
public readonly record struct Money(decimal Amount, string Currency);

// Mutable record struct (rare)
public record struct MutablePoint(int X, int Y);
```

## Pattern Matching

### Switch Expressions

```csharp
// Basic type pattern
public string Describe(object obj) => obj switch
{
    int n => $"Integer: {n}",
    string s => $"String: {s}",
    null => "null",
    _ => $"Unknown: {obj.GetType().Name}"
};

// Property pattern
public decimal CalculateShipping(Order order) => order switch
{
    { IsPriority: true, Weight: > 10 } => 25.00m,
    { IsPriority: true } => 15.00m,
    { Weight: > 20 } => 20.00m,
    { Weight: > 10 } => 12.00m,
    _ => 5.00m
};

// Tuple pattern
public string GetQuadrant(int x, int y) => (x, y) switch
{
    ( > 0, > 0) => "Q1",
    ( < 0, > 0) => "Q2",
    ( < 0, < 0) => "Q3",
    ( > 0, < 0) => "Q4",
    _ => "Origin or Axis"
};
```

### Relational and Logical Patterns

```csharp
// Relational patterns
public string GetGrade(int score) => score switch
{
    >= 90 => "A",
    >= 80 => "B",
    >= 70 => "C",
    >= 60 => "D",
    _ => "F"
};

// Logical patterns (and, or, not)
public bool IsValidAge(int age) => age is >= 0 and <= 120;

public string Categorize(int value) => value switch
{
    < 0 => "Negative",
    0 => "Zero",
    > 0 and < 10 => "Single digit",
    >= 10 and < 100 => "Double digit",
    _ => "Large"
};

// Not pattern
public bool IsNotNullOrEmpty(string? s) => s is not null and not "";
```

### List Patterns (C# 11+)

```csharp
// Match array/list structure
public string DescribeArray(int[] arr) => arr switch
{
    [] => "Empty",
    [var single] => $"Single: {single}",
    [var first, var second] => $"Pair: {first}, {second}",
    [var first, .., var last] => $"First: {first}, Last: {last}",
    _ => "Other"
};

// Slice pattern with discard
public bool StartsWithZero(int[] arr) => arr is [0, ..];
public bool EndsWithNine(int[] arr) => arr is [.., 9];
```

## Target-Typed New

```csharp
// Simplified instantiation
private readonly List<Order> _orders = new();
private readonly Dictionary<string, int> _cache = new();

// In method calls
public void AddOrder(Order order) => _orders.Add(order);
Order CreateOrder() => new(1, "Customer", DateTime.Now);

// In collections
List<Point> points = new()
{
    new(0, 0),
    new(1, 1),
    new(2, 2)
};

// With throw expressions
public Order GetOrder(int id) =>
    _orders.FirstOrDefault(o => o.Id == id)
    ?? throw new NotFoundException($"Order {id} not found");
```

## Nullable Reference Types

### Declaration Patterns

```csharp
#nullable enable

public class CustomerService
{
    // Non-nullable: compiler ensures it's never null
    private readonly IRepository _repository;

    // Nullable: explicitly can be null
    private ICache? _cache;

    public CustomerService(IRepository repository, ICache? cache = null)
    {
        _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        _cache = cache;
    }

    // Return nullable when result might not exist
    public Customer? FindById(int id) => _repository.Find(id);

    // Return non-nullable when result is guaranteed
    public Customer GetById(int id) =>
        _repository.Find(id) ?? throw new NotFoundException(id);
}
```

### Null Handling Operators

```csharp
// Null-conditional operator (?.)
string? name = customer?.Name;
int? length = customer?.Name?.Length;
customer?.Orders?.Clear();

// Null-coalescing operator (??)
string name = customer?.Name ?? "Unknown";
int retryCount = config?.RetryCount ?? 3;

// Null-coalescing assignment (??=)
_cache ??= new MemoryCache();
name ??= GetDefaultName();

// Null-forgiving operator (!) - use sparingly
// Only when you know something the compiler doesn't
string name = GetName()!; // You're certain it's not null
```

### Nullable Annotations

```csharp
public class OrderProcessor
{
    // Parameter cannot be null
    public void Process(Order order)
    {
        ArgumentNullException.ThrowIfNull(order);
        // ...
    }

    // Parameter can be null, handled internally
    public void ProcessOptional(Order? order)
    {
        if (order is null) return;
        // ...
    }

    // Return might be null
    public Order? TryGet(int id) => _repository.Find(id);

    // Return is never null
    [return: NotNull]
    public Order GetOrCreate(int id) =>
        _repository.Find(id) ?? CreateNew(id);

    // MaybeNull attribute for generics
    [return: MaybeNull]
    public T GetValueOrDefault<T>(string key) =>
        _cache.TryGetValue(key, out T value) ? value : default;
}
```

## File-Scoped Namespaces

```csharp
// Before (C# 9 and earlier)
namespace MyCompany.Orders.Services
{
    public class OrderService
    {
        // Indented code
    }
}

// After (C# 10+) - Recommended
namespace MyCompany.Orders.Services;

public class OrderService
{
    // No extra indentation
}
```

## Global and Implicit Usings

### GlobalUsings.cs

```csharp
// Create a GlobalUsings.cs file in your project
global using System;
global using System.Collections.Generic;
global using System.Linq;
global using System.Threading;
global using System.Threading.Tasks;
global using Microsoft.Extensions.Logging;

// Project-specific common types
global using MyCompany.Core.Entities;
global using MyCompany.Core.Interfaces;
```

### Implicit Usings in .csproj

```xml
<PropertyGroup>
  <ImplicitUsings>enable</ImplicitUsings>
</PropertyGroup>

<ItemGroup>
  <Using Include="MyCompany.Core.Entities" />
  <Using Remove="System.Net.Http" />
</ItemGroup>
```

## Required Members (C# 11+)

```csharp
public class Customer
{
    // Must be set during initialization
    public required string Name { get; init; }
    public required string Email { get; init; }

    // Optional
    public string? Phone { get; init; }
}

// Usage - compiler ensures required properties are set
var customer = new Customer
{
    Name = "John",
    Email = "john@example.com"
};
```

## Primary Constructors (C# 12+)

```csharp
// Class with primary constructor
public class OrderService(IOrderRepository repository, ILogger<OrderService> logger)
{
    public async Task<Order?> GetOrderAsync(int id)
    {
        logger.LogInformation("Getting order {Id}", id);
        return await repository.FindAsync(id);
    }
}

// Struct with primary constructor
public readonly struct Point(int x, int y)
{
    public int X { get; } = x;
    public int Y { get; } = y;
    public double Distance => Math.Sqrt(X * X + Y * Y);
}
```

## Collection Expressions (C# 12+)

```csharp
// Array
int[] numbers = [1, 2, 3, 4, 5];

// List
List<string> names = ["Alice", "Bob", "Charlie"];

// Spread operator
int[] first = [1, 2, 3];
int[] second = [4, 5, 6];
int[] combined = [..first, ..second]; // [1, 2, 3, 4, 5, 6]

// Empty collection
int[] empty = [];
List<Order> orders = [];
```

## Raw String Literals (C# 11+)

```csharp
// Multi-line without escaping
string json = """
    {
        "name": "John",
        "email": "john@example.com"
    }
    """;

// With interpolation (use more $ for literal braces)
string template = $$"""
    {
        "customer": "{{customerName}}",
        "total": {{total}}
    }
    """;
```
