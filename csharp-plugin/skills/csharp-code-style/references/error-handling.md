# C# Error Handling Reference

## Guard Clauses

### ArgumentNullException.ThrowIfNull (C# 10+)

```csharp
public async Task<Order> CreateOrderAsync(OrderRequest request, CancellationToken ct = default)
{
    // Modern guard syntax
    ArgumentNullException.ThrowIfNull(request);
    ArgumentNullException.ThrowIfNull(request.Customer);

    // Continue with valid request
    return await ProcessOrderAsync(request, ct);
}
```

### ArgumentException Guards (C# 11+)

```csharp
public void ProcessOrder(string orderId, int quantity)
{
    // String guards
    ArgumentException.ThrowIfNullOrEmpty(orderId);
    ArgumentException.ThrowIfNullOrWhiteSpace(orderId);

    // Numeric guards
    ArgumentOutOfRangeException.ThrowIfNegative(quantity);
    ArgumentOutOfRangeException.ThrowIfZero(quantity);
    ArgumentOutOfRangeException.ThrowIfNegativeOrZero(quantity);
    ArgumentOutOfRangeException.ThrowIfGreaterThan(quantity, 1000);
    ArgumentOutOfRangeException.ThrowIfLessThan(quantity, 1);

    // Continue with validated inputs
}
```

### Custom Guard Methods

```csharp
public static class Guard
{
    public static void Against<TException>(bool condition, string message)
        where TException : Exception, new()
    {
        if (condition)
        {
            throw (TException)Activator.CreateInstance(typeof(TException), message)!;
        }
    }

    public static T NotNull<T>(T? value, string paramName) where T : class
    {
        return value ?? throw new ArgumentNullException(paramName);
    }

    public static string NotNullOrEmpty(string? value, string paramName)
    {
        if (string.IsNullOrEmpty(value))
            throw new ArgumentException("Value cannot be null or empty", paramName);
        return value;
    }
}

// Usage
public void Process(Order? order)
{
    var validOrder = Guard.NotNull(order, nameof(order));
    Guard.Against<InvalidOperationException>(validOrder.Items.Count == 0, "Order has no items");
}
```

## Exception Hierarchy Design

### Custom Exception Base

```csharp
// Base exception for your domain
public abstract class DomainException : Exception
{
    public string Code { get; }
    public DateTime Timestamp { get; } = DateTime.UtcNow;

    protected DomainException(string code, string message) : base(message)
    {
        Code = code;
    }

    protected DomainException(string code, string message, Exception inner) : base(message, inner)
    {
        Code = code;
    }
}
```

### Specific Domain Exceptions

```csharp
public class EntityNotFoundException : DomainException
{
    public string EntityType { get; }
    public object EntityId { get; }

    public EntityNotFoundException(string entityType, object entityId)
        : base("NOT_FOUND", $"{entityType} with ID {entityId} was not found")
    {
        EntityType = entityType;
        EntityId = entityId;
    }
}

public class ValidationException : DomainException
{
    public IReadOnlyList<ValidationError> Errors { get; }

    public ValidationException(IEnumerable<ValidationError> errors)
        : base("VALIDATION_FAILED", "One or more validation errors occurred")
    {
        Errors = errors.ToList();
    }
}

public class ConcurrencyException : DomainException
{
    public ConcurrencyException(string message)
        : base("CONCURRENCY_CONFLICT", message) { }
}
```

### Exception Factory

```csharp
public static class DomainErrors
{
    public static EntityNotFoundException NotFound<T>(object id)
        => new(typeof(T).Name, id);

    public static ValidationException InvalidInput(string field, string message)
        => new(new[] { new ValidationError(field, message) });

    public static InvalidOperationException InvalidState(string message)
        => new(message);
}

// Usage
throw DomainErrors.NotFound<Order>(orderId);
throw DomainErrors.InvalidInput("Email", "Invalid email format");
```

## Result Pattern

### Basic Result Type

```csharp
public readonly struct Result<T>
{
    private readonly T? _value;
    private readonly string? _error;

    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;

    public T Value => IsSuccess
        ? _value!
        : throw new InvalidOperationException($"Cannot access Value on failure: {_error}");

    public string Error => !IsSuccess
        ? _error!
        : throw new InvalidOperationException("Cannot access Error on success");

    private Result(T value)
    {
        IsSuccess = true;
        _value = value;
        _error = null;
    }

    private Result(string error)
    {
        IsSuccess = false;
        _value = default;
        _error = error;
    }

    public static Result<T> Success(T value) => new(value);
    public static Result<T> Failure(string error) => new(error);

    public static implicit operator Result<T>(T value) => Success(value);

    public TResult Match<TResult>(Func<T, TResult> onSuccess, Func<string, TResult> onFailure)
        => IsSuccess ? onSuccess(_value!) : onFailure(_error!);
}
```

### Result Extensions

```csharp
public static class ResultExtensions
{
    public static Result<TNew> Map<T, TNew>(this Result<T> result, Func<T, TNew> map)
        => result.IsSuccess
            ? Result<TNew>.Success(map(result.Value))
            : Result<TNew>.Failure(result.Error);

    public static Result<TNew> Bind<T, TNew>(this Result<T> result, Func<T, Result<TNew>> bind)
        => result.IsSuccess
            ? bind(result.Value)
            : Result<TNew>.Failure(result.Error);

    public static async Task<Result<TNew>> MapAsync<T, TNew>(
        this Task<Result<T>> resultTask,
        Func<T, TNew> map)
    {
        var result = await resultTask;
        return result.Map(map);
    }
}
```

### Usage Example

```csharp
public class OrderService
{
    public Result<Order> CreateOrder(OrderRequest request)
    {
        // Validation returns Result
        var validationResult = ValidateRequest(request);
        if (validationResult.IsFailure)
            return Result<Order>.Failure(validationResult.Error);

        // Business logic
        var order = new Order(request);

        // Repository might fail
        var saveResult = _repository.Save(order);
        if (saveResult.IsFailure)
            return Result<Order>.Failure(saveResult.Error);

        return order;
    }

    // Using Bind for cleaner chaining
    public Result<OrderConfirmation> ProcessOrder(OrderRequest request)
    {
        return ValidateRequest(request)
            .Bind(CreateOrder)
            .Bind(ApplyDiscounts)
            .Bind(CalculateShipping)
            .Map(order => new OrderConfirmation(order));
    }
}
```

## Try Pattern

```csharp
public class Parser
{
    // Standard TryParse pattern
    public bool TryParse(string input, out Order? order)
    {
        order = null;

        if (string.IsNullOrEmpty(input))
            return false;

        try
        {
            order = JsonSerializer.Deserialize<Order>(input);
            return order != null;
        }
        catch (JsonException)
        {
            return false;
        }
    }

    // Modern tuple-based alternative
    public (bool Success, Order? Order) TryParseOrder(string input)
    {
        if (string.IsNullOrEmpty(input))
            return (false, null);

        try
        {
            var order = JsonSerializer.Deserialize<Order>(input);
            return (order != null, order);
        }
        catch (JsonException)
        {
            return (false, null);
        }
    }
}
```

## Async Exception Handling

### Task Exception Handling

```csharp
public async Task ProcessOrdersAsync(IEnumerable<Order> orders, CancellationToken ct)
{
    var tasks = orders.Select(order => ProcessOrderAsync(order, ct));

    try
    {
        await Task.WhenAll(tasks);
    }
    catch (Exception)
    {
        // Task.WhenAll throws first exception only
        // Check all tasks for complete error picture
        var exceptions = tasks
            .Where(t => t.IsFaulted)
            .Select(t => t.Exception!)
            .ToList();

        if (exceptions.Count > 1)
        {
            throw new AggregateException("Multiple orders failed", exceptions);
        }

        throw; // Re-throw single exception
    }
}
```

### Cancellation Handling

```csharp
public async Task<Data> LoadDataAsync(CancellationToken ct = default)
{
    try
    {
        ct.ThrowIfCancellationRequested();

        var data = await FetchDataAsync(ct);
        return ProcessData(data);
    }
    catch (OperationCanceledException) when (ct.IsCancellationRequested)
    {
        // Expected cancellation - log and rethrow
        _logger.LogInformation("Operation was cancelled");
        throw;
    }
    catch (OperationCanceledException)
    {
        // Unexpected timeout - wrap in different exception
        throw new TimeoutException("Operation timed out");
    }
}
```

### Exception Filters

```csharp
public async Task<HttpResponseMessage> SendWithRetryAsync(HttpRequestMessage request)
{
    int attempts = 0;

    while (true)
    {
        attempts++;
        try
        {
            return await _httpClient.SendAsync(request);
        }
        catch (HttpRequestException ex) when (IsTransient(ex) && attempts < MaxRetries)
        {
            _logger.LogWarning(ex, "Transient error, attempt {Attempt}/{Max}", attempts, MaxRetries);
            await Task.Delay(TimeSpan.FromSeconds(Math.Pow(2, attempts)));
        }
        // Non-transient errors will propagate
    }
}

private static bool IsTransient(HttpRequestException ex)
{
    return ex.StatusCode is HttpStatusCode.ServiceUnavailable
        or HttpStatusCode.GatewayTimeout
        or HttpStatusCode.TooManyRequests;
}
```

## Logging Best Practices

### Structured Logging

```csharp
public class OrderService
{
    private readonly ILogger<OrderService> _logger;

    public async Task<Order> ProcessOrderAsync(int orderId, CancellationToken ct)
    {
        // Structured logging with typed parameters
        _logger.LogInformation("Processing order {OrderId}", orderId);

        try
        {
            var order = await _repository.GetAsync(orderId, ct);

            _logger.LogInformation(
                "Order {OrderId} found with {ItemCount} items, total {TotalAmount:C}",
                orderId, order.Items.Count, order.TotalAmount);

            return order;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to process order {OrderId}. Error: {ErrorMessage}",
                orderId, ex.Message);
            throw;
        }
    }
}
```

### High-Performance Logging

```csharp
// Define log messages at compile time for performance
public static partial class LogMessages
{
    [LoggerMessage(
        EventId = 1001,
        Level = LogLevel.Information,
        Message = "Processing order {OrderId} for customer {CustomerId}")]
    public static partial void ProcessingOrder(
        this ILogger logger, int orderId, string customerId);

    [LoggerMessage(
        EventId = 1002,
        Level = LogLevel.Error,
        Message = "Order {OrderId} processing failed")]
    public static partial void OrderProcessingFailed(
        this ILogger logger, int orderId, Exception ex);
}

// Usage
_logger.ProcessingOrder(order.Id, order.CustomerId);
_logger.OrderProcessingFailed(order.Id, exception);
```

## Validation Strategies

### FluentValidation Style

```csharp
public class OrderValidator
{
    private readonly List<ValidationError> _errors = new();

    public ValidationResult Validate(Order order)
    {
        _errors.Clear();

        ValidateRequired(order.CustomerId, nameof(order.CustomerId));
        ValidatePositive(order.TotalAmount, nameof(order.TotalAmount));
        ValidateNotEmpty(order.Items, nameof(order.Items));

        foreach (var item in order.Items)
        {
            ValidatePositive(item.Quantity, $"Item[{item.ProductId}].Quantity");
            ValidatePositive(item.Price, $"Item[{item.ProductId}].Price");
        }

        return new ValidationResult(_errors);
    }

    private void ValidateRequired<T>(T? value, string field) where T : class
    {
        if (value is null)
            _errors.Add(new ValidationError(field, "is required"));
    }

    private void ValidatePositive(decimal value, string field)
    {
        if (value <= 0)
            _errors.Add(new ValidationError(field, "must be positive"));
    }

    private void ValidateNotEmpty<T>(ICollection<T> collection, string field)
    {
        if (collection.Count == 0)
            _errors.Add(new ValidationError(field, "cannot be empty"));
    }
}
```

### Data Annotations

```csharp
public class OrderRequest
{
    [Required(ErrorMessage = "Customer ID is required")]
    public string CustomerId { get; init; } = "";

    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be positive")]
    public decimal TotalAmount { get; init; }

    [MinLength(1, ErrorMessage = "At least one item is required")]
    public List<OrderItem> Items { get; init; } = new();

    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string? NotificationEmail { get; init; }
}

// Validate with DataAnnotations
public static class Validator
{
    public static ValidationResult Validate<T>(T obj)
    {
        var context = new ValidationContext(obj);
        var results = new List<System.ComponentModel.DataAnnotations.ValidationResult>();

        if (System.ComponentModel.DataAnnotations.Validator.TryValidateObject(
            obj, context, results, validateAllProperties: true))
        {
            return ValidationResult.Success();
        }

        var errors = results.Select(r => new ValidationError(
            r.MemberNames.FirstOrDefault() ?? "",
            r.ErrorMessage ?? "Validation failed"));

        return ValidationResult.Failure(errors);
    }
}
```
