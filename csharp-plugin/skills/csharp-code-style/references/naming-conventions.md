# C# Naming Conventions Reference

## Complete Naming Rules

### Types

| Type | Convention | Examples |
|------|------------|----------|
| Class | PascalCase, noun | `Customer`, `OrderService`, `HttpClient` |
| Struct | PascalCase, noun | `Point`, `Rectangle`, `TimeSpan` |
| Record | PascalCase, noun | `OrderDto`, `CustomerRecord` |
| Interface | IPascalCase | `IDisposable`, `IOrderRepository` |
| Enum | PascalCase, singular | `OrderStatus`, `DayOfWeek` |
| Delegate | PascalCase, verb or EventHandler | `EventHandler`, `Func`, `Action` |
| Type Parameter | TPascalCase | `T`, `TEntity`, `TResult`, `TKey` |

### Members

| Member | Convention | Examples |
|--------|------------|----------|
| Public Method | PascalCase, verb | `GetCustomer`, `ProcessOrder`, `ValidateInput` |
| Private Method | PascalCase, verb | `CalculateTotal`, `BuildQuery` |
| Async Method | PascalCaseAsync | `GetOrderAsync`, `SaveChangesAsync` |
| Property | PascalCase | `FirstName`, `OrderDate`, `IsEnabled` |
| Event | PascalCase | `OrderCreated`, `PropertyChanged` |
| Public Field | PascalCase | `MaxValue`, `DefaultTimeout` |
| Private Field | _camelCase | `_orderRepository`, `_retryCount` |
| Constant | PascalCase | `MaxRetryCount`, `DefaultBufferSize` |
| Parameter | camelCase | `orderId`, `customerName`, `cancellationToken` |
| Local Variable | camelCase | `totalAmount`, `currentIndex`, `result` |

## Private Fields vs Parameters

```csharp
public class OrderService
{
    // Private field: underscore prefix
    private readonly IOrderRepository _orderRepository;
    private readonly ILogger _logger;
    private int _processedCount;

    // Parameters: no underscore
    public OrderService(IOrderRepository orderRepository, ILogger logger)
    {
        // Clear distinction between field and parameter
        _orderRepository = orderRepository;
        _logger = logger;
    }

    public void Process(int orderId, string customerName)
    {
        // Local variables: no underscore
        var order = _orderRepository.Find(orderId);
        var displayName = FormatName(customerName);
    }
}
```

## Boolean Naming Patterns

### Properties

```csharp
// State: Is, Has, Was, Will
public bool IsEnabled { get; set; }
public bool IsValid { get; }
public bool HasChildren { get; }
public bool WasModified { get; }

// Capability: Can, Should
public bool CanExecute { get; }
public bool CanUndo { get; }
public bool ShouldRefresh { get; }

// Existence: Contains, Exists
public bool ContainsKey { get; }
public bool Exists { get; }
```

### Methods

```csharp
// Verb form (no Is/Has prefix for methods)
public bool Validate() { }
public bool Contains(T item) { }
public bool Equals(object obj) { }

// Try pattern
public bool TryParse(string input, out int result) { }
public bool TryGetValue(TKey key, out TValue value) { }
```

## Abbreviations and Acronyms

### Two-Letter Acronyms: All Uppercase

```csharp
// Correct
public class IOHandler { }
public string GetUIElement() { }
public int DBConnectionCount { get; }

// Wrong
public class IoHandler { }
public string GetUiElement() { }
```

### Three+ Letter Acronyms: PascalCase

```csharp
// Correct
public class XmlParser { }
public string GetHtmlContent() { }
public int HttpStatusCode { get; }
public class JsonSerializer { }

// Wrong
public class XMLParser { }
public string GetHTMLContent() { }
public int HTTPStatusCode { get; }
```

### Common Abbreviations

| Full Word | Abbreviation | Usage |
|-----------|--------------|-------|
| Identifier | Id | `CustomerId`, `OrderId` |
| Information | Info | `UserInfo`, `ErrorInfo` |
| Maximum | Max | `MaxRetryCount` |
| Minimum | Min | `MinValue` |
| Number | Num, No | `NumItems`, `OrderNo` |
| Specification | Spec | `OrderSpec` |
| Synchronization | Sync | `SyncData` |
| Utility | Util | Avoid in public API |

## Async Method Naming

```csharp
// Always suffix with Async
public async Task<Order> GetOrderAsync(int id) { }
public async Task SaveAsync(Order order) { }
public async ValueTask<bool> ValidateAsync(string input) { }

// Event handlers can omit Async suffix
private async void OnButtonClick(object sender, EventArgs e) { }

// Interface methods
public interface IOrderService
{
    Task<Order> GetOrderAsync(int id, CancellationToken ct = default);
    Task SaveAsync(Order order, CancellationToken ct = default);
}
```

## Generic Type Parameters

```csharp
// Single type: T
public class List<T> { }
public T GetValue<T>() { }

// Descriptive names for specific purposes
public class Dictionary<TKey, TValue> { }
public interface IRepository<TEntity> where TEntity : class { }
public TResult Convert<TSource, TResult>(TSource source) { }

// Common conventions
// T - general type
// TEntity - entity type
// TResult - return type
// TKey, TValue - key-value pairs
// TException - exception type
// TEventArgs - event arguments
```

## Anti-Patterns

### Avoid Hungarian Notation

```csharp
// Wrong
private string strName;
private int iCount;
private bool bIsEnabled;
private List<Order> lstOrders;

// Correct
private string _name;
private int _count;
private bool _isEnabled;
private List<Order> _orders;
```

### Avoid Single-Letter Names (Except Loops)

```csharp
// Wrong
public void P(int i, string s) { }
var x = GetCustomer();

// Correct
public void Process(int orderId, string customerName) { }
var customer = GetCustomer();

// Exception: loop counters
for (int i = 0; i < count; i++) { }
items.Select((item, i) => (item, i));
```

### Avoid Abbreviations in Public API

```csharp
// Wrong
public string GetCustName() { }
public void ProcOrd(int ordNo) { }
public int CalcTot() { }

// Correct
public string GetCustomerName() { }
public void ProcessOrder(int orderNumber) { }
public int CalculateTotal() { }
```

## Namespace Conventions

```csharp
// Company.Product.Feature.SubFeature
namespace MyCompany.Orders.Services;
namespace MyCompany.Orders.Repositories;
namespace MyCompany.Common.Extensions;

// Avoid plurals except for collections
namespace MyCompany.Orders.Models;    // OK for containing multiple model classes
namespace MyCompany.Order.Model;      // Also acceptable

// Folder structure should match namespace
// src/Orders/Services/OrderService.cs
// -> namespace MyCompany.Orders.Services;
```

## Event Naming

```csharp
// Event: PascalCase, past tense or present participle
public event EventHandler OrderCreated;
public event EventHandler<OrderEventArgs> OrderProcessing;
public event PropertyChangedEventHandler PropertyChanged;

// Event handler method: On + EventName
protected virtual void OnOrderCreated(EventArgs e)
{
    OrderCreated?.Invoke(this, e);
}

// Event args class
public class OrderEventArgs : EventArgs
{
    public Order Order { get; init; }
    public DateTime Timestamp { get; init; }
}
```

## Extension Method Naming

```csharp
// Name describes the action on the extended type
public static class StringExtensions
{
    public static bool IsNullOrEmpty(this string? value) { }
    public static string ToTitleCase(this string value) { }
    public static string Truncate(this string value, int maxLength) { }
}

public static class EnumerableExtensions
{
    public static IEnumerable<T> WhereNotNull<T>(this IEnumerable<T?> source) { }
    public static void ForEach<T>(this IEnumerable<T> source, Action<T> action) { }
}
```
