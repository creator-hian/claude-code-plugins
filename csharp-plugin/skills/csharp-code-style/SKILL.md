---
name: csharp-code-style
description: C# code style and naming conventions based on Microsoft guidelines. Covers naming rules (PascalCase, camelCase, _privateField), code organization, modern C# patterns, nullable reference types, and error handling. Use PROACTIVELY for C# code reviews, refactoring, or establishing project standards.
---

# C# Code Style Guide

## Overview

Comprehensive C# code style guidelines based on Microsoft's official coding conventions and modern .NET best practices.

**Core Topics**:
- Naming conventions (PascalCase, camelCase, prefixes)
- Code organization and file structure
- Modern C# patterns (records, pattern matching)
- Nullable reference types
- Error handling patterns
- Collection and LINQ usage

## Naming Conventions

### Quick Reference

| Element | Convention | Example |
|---------|-----------|---------|
| Class, Struct, Record | PascalCase | `CustomerService`, `OrderResult` |
| Interface | IPascalCase | `IDisposable`, `IOrderService` |
| Method | PascalCase | `GetCustomerById`, `ProcessOrder` |
| Property | PascalCase | `FirstName`, `IsEnabled` |
| Public Field | PascalCase | `MaxRetryCount` |
| Private Field | _camelCase | `_customerRepository`, `_logger` |
| Parameter | camelCase | `customerId`, `orderDate` |
| Local Variable | camelCase | `totalAmount`, `isValid` |
| Constant | PascalCase | `DefaultTimeout`, `MaxBufferSize` |
| Enum | PascalCase | `OrderStatus`, `PaymentType` |
| Enum Value | PascalCase | `Pending`, `Completed` |
| Type Parameter | TPascalCase | `TEntity`, `TResult` |
| Async Method | PascalCaseAsync | `GetOrderAsync`, `SaveAsync` |

### Private Field Pattern

```csharp
public class OrderService
{
    // Private fields: underscore + camelCase
    private readonly IOrderRepository _orderRepository;
    private readonly ILogger<OrderService> _logger;
    private int _retryCount;

    // Constructor parameter: camelCase (no underscore)
    public OrderService(IOrderRepository orderRepository, ILogger<OrderService> logger)
    {
        _orderRepository = orderRepository;
        _logger = logger;
    }
}
```

### Boolean Naming

```csharp
// Properties: Use Is, Has, Can, Should prefixes
public bool IsEnabled { get; set; }
public bool HasPermission { get; set; }
public bool CanExecute { get; }
public bool ShouldRetry { get; }

// Methods: Use verb form
public bool Validate() { }
public bool TryParse(string input, out int result) { }
public bool Contains(string value) { }
```

## Modern C# Patterns

### Records for DTOs

```csharp
// Immutable data transfer objects
public record OrderDto(int Id, string CustomerName, decimal TotalAmount);

// With optional properties
public record CustomerDto(string Name, string Email)
{
    public string? Phone { get; init; }
}
```

### Pattern Matching

```csharp
// Switch expressions
public string GetStatusMessage(OrderStatus status) => status switch
{
    OrderStatus.Pending => "Order is pending",
    OrderStatus.Processing => "Order is being processed",
    OrderStatus.Completed => "Order completed",
    OrderStatus.Cancelled => "Order was cancelled",
    _ => throw new ArgumentOutOfRangeException(nameof(status))
};

// Property patterns
public decimal CalculateDiscount(Customer customer) => customer switch
{
    { IsPremium: true, OrderCount: > 100 } => 0.20m,
    { IsPremium: true } => 0.10m,
    { OrderCount: > 50 } => 0.05m,
    _ => 0m
};

// Type patterns with null check
public string Describe(object? obj) => obj switch
{
    null => "null",
    string s => $"String: {s}",
    int n => $"Number: {n}",
    IEnumerable<int> list => $"List with {list.Count()} items",
    _ => obj.ToString() ?? "unknown"
};
```

### Nullable Reference Types

```csharp
#nullable enable

public class CustomerService
{
    // Non-nullable: must always have value
    private readonly IRepository _repository;

    // Nullable: explicitly allow null
    private ICache? _cache;

    public Customer? FindById(int id)
    {
        return _repository.Find(id);
    }

    public string GetDisplayName(Customer? customer)
    {
        // Null-conditional and null-coalescing
        return customer?.Name ?? "Unknown";
    }

    public void ProcessCustomer(Customer customer)
    {
        // Null-forgiving operator (use sparingly, only when you know better than compiler)
        var name = customer.Name!;
    }
}
```

## Code Organization

### File Structure

```csharp
// 1. Using directives (sorted: System first, then alphabetical)
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MyCompany.Core.Entities;

// 2. Namespace
namespace MyCompany.Orders.Services;

// 3. Type declaration
public class OrderService : IOrderService
{
    // 4. Constants
    private const int MaxRetryCount = 3;

    // 5. Static fields
    private static readonly TimeSpan DefaultTimeout = TimeSpan.FromSeconds(30);

    // 6. Instance fields
    private readonly IOrderRepository _orderRepository;
    private readonly ILogger<OrderService> _logger;

    // 7. Constructors
    public OrderService(IOrderRepository orderRepository, ILogger<OrderService> logger)
    {
        _orderRepository = orderRepository ?? throw new ArgumentNullException(nameof(orderRepository));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    // 8. Properties
    public int ProcessedCount { get; private set; }

    // 9. Public methods
    public async Task<Order> GetOrderAsync(int id, CancellationToken ct = default)
    {
        // Implementation
    }

    // 10. Private methods
    private void ValidateOrder(Order order)
    {
        // Implementation
    }
}
```

### Expression-Bodied Members

```csharp
public class Point
{
    public int X { get; }
    public int Y { get; }

    // Constructor
    public Point(int x, int y) => (X, Y) = (x, y);

    // Property (read-only)
    public double Distance => Math.Sqrt(X * X + Y * Y);

    // Method
    public override string ToString() => $"({X}, {Y})";

    // Operator
    public static Point operator +(Point a, Point b) => new(a.X + b.X, a.Y + b.Y);
}
```

## Error Handling

### Guard Clauses

```csharp
public async Task<Order> CreateOrderAsync(OrderRequest request, CancellationToken ct = default)
{
    // Guard clauses at the beginning
    ArgumentNullException.ThrowIfNull(request);
    ArgumentException.ThrowIfNullOrEmpty(request.CustomerName);

    if (request.Items.Count == 0)
        throw new ArgumentException("Order must have at least one item", nameof(request));

    // Main logic after guards
    var order = new Order(request);
    await _repository.SaveAsync(order, ct);
    return order;
}
```

### Result Pattern

```csharp
// Instead of throwing exceptions for expected failures
public record Result<T>
{
    public bool IsSuccess { get; init; }
    public T? Value { get; init; }
    public string? Error { get; init; }

    public static Result<T> Success(T value) => new() { IsSuccess = true, Value = value };
    public static Result<T> Failure(string error) => new() { IsSuccess = false, Error = error };
}

// Usage
public Result<Order> ValidateOrder(Order order)
{
    if (order.Items.Count == 0)
        return Result<Order>.Failure("Order must have items");

    if (order.TotalAmount <= 0)
        return Result<Order>.Failure("Invalid total amount");

    return Result<Order>.Success(order);
}
```

## Reference Documentation

### [Naming Conventions](references/naming-conventions.md)
Complete naming rules:
- Detailed conventions for all code elements
- Abbreviations and acronyms handling
- Common naming patterns and examples
- Anti-patterns to avoid

### [Modern Patterns](references/modern-patterns.md)
Modern C# language features:
- Records and init-only properties
- Pattern matching deep dive
- Target-typed new expressions
- Global and implicit usings
- File-scoped namespaces

### [Error Handling](references/error-handling.md)
Robust error handling patterns:
- Exception hierarchy design
- Guard clause patterns
- Result/Option patterns
- Validation strategies
- Logging best practices

## Key Principles

1. **Consistency First**: Follow project conventions, fallback to Microsoft standards
2. **Explicit Over Implicit**: Use clear, descriptive names; avoid abbreviations
3. **Modern Features**: Leverage latest C# features for cleaner code
4. **Null Safety**: Enable nullable reference types and handle nulls explicitly
5. **Guard Early**: Validate inputs at method entry with guard clauses
6. **Prefer Immutability**: Use records, readonly, init-only where possible
