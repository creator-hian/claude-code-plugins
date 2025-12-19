# Document Exceptions

Use `<exception>` for exceptions that are part of the method's contract.

## Principle

Document exceptions that callers **should be aware of** and **might need to handle**. Don't document internal implementation exceptions or generic system exceptions.

## ✅ Good Examples

### Contract Exceptions
```csharp
/// <summary>
/// Loads VRM model from specified path
/// </summary>
/// <param name="path">Addressable path to VRM asset</param>
/// <returns>Loaded VRM instance</returns>
/// <exception cref="ArgumentNullException">Thrown when path is null</exception>
/// <exception cref="InvalidOperationException">Thrown when VRM context is not ready</exception>
/// <exception cref="System.IO.FileNotFoundException">Thrown when VRM asset is not found</exception>
public async UniTask<VrmInstance> LoadVRM(string path)
{
    if (path == null)
        throw new ArgumentNullException(nameof(path));

    if (!IsReady)
        throw new InvalidOperationException("VRM context is not ready");

    // Implementation that might throw FileNotFoundException
}
```

### Multiple Exceptions with Conditions
```csharp
/// <summary>
/// Executes action with retry logic
/// </summary>
/// <param name="action">Action to execute</param>
/// <param name="maxRetries">Maximum retry attempts (1-10)</param>
/// <exception cref="ArgumentNullException">Thrown when action is null</exception>
/// <exception cref="ArgumentOutOfRangeException">Thrown when maxRetries is not in range 1-10</exception>
/// <exception cref="ActionExecutionException">Thrown when all retry attempts fail</exception>
public async UniTask<ActionResult> ExecuteWithRetry(EventAction action, int maxRetries)
{
    if (action == null)
        throw new ArgumentNullException(nameof(action));

    if (maxRetries < 1 || maxRetries > 10)
        throw new ArgumentOutOfRangeException(nameof(maxRetries), "Must be between 1 and 10");

    // Implementation with retry logic
}
```

### Korean Example
```csharp
/// <summary>
/// VRM 모델을 지정된 경로에서 로드
/// </summary>
/// <param name="path">VRM 에셋의 Addressable 경로</param>
/// <returns>로드된 VRM 인스턴스</returns>
/// <exception cref="ArgumentNullException">path가 null일 때 발생</exception>
/// <exception cref="InvalidOperationException">VRM 컨텍스트가 준비되지 않았을 때 발생</exception>
/// <exception cref="System.IO.FileNotFoundException">VRM 에셋을 찾을 수 없을 때 발생</exception>
public async UniTask<VrmInstance> LoadVRM(string path)
{
    // Implementation...
}
```

## ❌ Bad Examples

### Over-Documenting Internal Exceptions
```csharp
// ❌ Bad: Documenting implementation details
/// <exception cref="NullReferenceException">Internal collection error</exception>
/// <exception cref="IndexOutOfRangeException">Internal array access error</exception>
/// <exception cref="OutOfMemoryException">System out of memory</exception>
public void ProcessData()
{
    // Implementation...
}
```

**Why it's bad**: These are internal implementation exceptions, not part of the API contract. Callers can't meaningfully handle them.

### Generic System Exceptions
```csharp
// ❌ Bad: Documenting generic system exceptions
/// <exception cref="Exception">Generic error occurred</exception>
public void DoSomething()
{
    // Implementation...
}
```

**Why it's bad**: Too generic to be useful. Document specific exceptions callers can handle.

### Missing Exception Documentation
```csharp
// ❌ Bad: Throws exceptions but doesn't document them
/// <summary>
/// Loads configuration file
/// </summary>
public void LoadConfig(string path)
{
    if (path == null)
        throw new ArgumentNullException(nameof(path));  // Not documented!

    if (!File.Exists(path))
        throw new FileNotFoundException("Config file not found");  // Not documented!

    // Implementation...
}
```

**Why it's bad**: Callers don't know they need to handle these exceptions.

## When to Document Exceptions

### ✅ DO Document

**1. Validation Exceptions:**
```csharp
/// <exception cref="ArgumentNullException">Parameter is null</exception>
/// <exception cref="ArgumentException">Parameter is invalid</exception>
/// <exception cref="ArgumentOutOfRangeException">Parameter out of valid range</exception>
```

**2. State Exceptions:**
```csharp
/// <exception cref="InvalidOperationException">Operation invalid in current state</exception>
/// <exception cref="ObjectDisposedException">Object has been disposed</exception>
```

**3. Resource Exceptions:**
```csharp
/// <exception cref="FileNotFoundException">File not found</exception>
/// <exception cref="DirectoryNotFoundException">Directory not found</exception>
/// <exception cref="UnauthorizedAccessException">Access denied</exception>
```

**4. Custom Business Exceptions:**
```csharp
/// <exception cref="ActionExecutionException">Action execution failed</exception>
/// <exception cref="ConfigurationException">Configuration invalid</exception>
```

### ❌ DON'T Document

**1. Internal Exceptions:**
- `NullReferenceException` (implementation bug)
- `IndexOutOfRangeException` (implementation bug)
- `DivideByZeroException` (implementation bug)

**2. System Exceptions:**
- `OutOfMemoryException` (can't handle)
- `StackOverflowException` (can't handle)
- `ThreadAbortException` (rare, special handling)

**3. Generic Exceptions:**
- `Exception` (too broad)
- Exceptions re-thrown as different types

## Exception Documentation Patterns

### Pattern 1: Simple Exception
```csharp
/// <exception cref="ArgumentNullException">Thrown when parameter is null</exception>
```

### Pattern 2: Exception with Condition
```csharp
/// <exception cref="ArgumentOutOfRangeException">
/// Thrown when maxRetries is not in range 1-10
/// </exception>
```

### Pattern 3: Multiple Related Exceptions
```csharp
/// <exception cref="ArgumentNullException">Thrown when action is null</exception>
/// <exception cref="InvalidOperationException">Thrown when engine is not initialized</exception>
/// <exception cref="ActionExecutionException">Thrown when execution fails after all retries</exception>
```

### Pattern 4: Exception with Recovery Guidance
```csharp
/// <exception cref="InvalidOperationException">
/// Thrown when VRM context is not ready. Call InitializeAsync first.
/// </exception>
```

## IntelliSense Display

**What developers see:**

```
LoadVRMAsync(string path)

Parameters:
  path - Addressable path to VRM asset

Returns:
  Loaded VRM instance

Exceptions:
  ArgumentNullException - Thrown when path is null
  InvalidOperationException - Thrown when VRM context is not ready
  FileNotFoundException - Thrown when VRM asset is not found
```

## Complete Example

```csharp
/// <summary>
/// Authenticates user and returns session token
/// </summary>
/// <param name="username">User's username</param>
/// <param name="password">User's password</param>
/// <returns>JWT session token valid for 24 hours</returns>
/// <exception cref="ArgumentNullException">
/// Thrown when username or password is null
/// </exception>
/// <exception cref="ArgumentException">
/// Thrown when username or password is empty or whitespace
/// </exception>
/// <exception cref="AuthenticationException">
/// Thrown when credentials are invalid
/// </exception>
/// <exception cref="InvalidOperationException">
/// Thrown when authentication service is not available
/// </exception>
public async UniTask<string> Authenticate(string username, string password)
{
    if (username == null || password == null)
        throw new ArgumentNullException(
            username == null ? nameof(username) : nameof(password));

    if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
        throw new ArgumentException("Username and password cannot be empty");

    if (!mAuthService.IsAvailable)
        throw new InvalidOperationException("Authentication service is not available");

    bool isValid = await mAuthService.ValidateCredentials(username, password);
    if (!isValid)
        throw new AuthenticationException("Invalid credentials");

    return await mAuthService.GenerateToken(username);
}
```

## Rationale

**Why document exceptions:**

**API Contract:**
- Makes exception handling expectations explicit
- Part of the method's public contract
- Helps callers write correct code

**Developer Experience:**
- IntelliSense shows exceptions during coding
- Reduces unexpected runtime errors
- Improves code review quality

**Documentation:**
- Generated API docs include exception info
- Integration guides can reference exceptions
- Error handling patterns become clear

**Why NOT document all exceptions:**

**Noise Reduction:**
- Internal exceptions are implementation details
- Too many exceptions create documentation fatigue
- Focus on actionable information

**Maintenance:**
- Internal exceptions may change with refactoring
- Only public contract exceptions are stable
- Reduces documentation burden

## Best Practices

1. **Document only contract exceptions** - Exceptions callers should handle
2. **Be specific** - Use specific exception types, not `Exception`
3. **Explain conditions** - Say when the exception is thrown
4. **Provide recovery** - Suggest how to avoid or handle
5. **Stay consistent** - Document all or none of the same exception types
6. **Update on changes** - Keep exception docs in sync with code
