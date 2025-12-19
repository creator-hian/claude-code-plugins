# Avoid Redundancy

Don't repeat information obvious from method names or types.

## Principle

Self-documenting code with clear names reduces the need for verbose documentation. Don't state the obvious - add value with your documentation instead.

## ✅ Good Examples

### Factory Method (Concise)
```csharp
/// <summary>
/// Creates success result
/// </summary>
public static ActionResult CreateSuccess(string actionType)
{
    return new ActionResult { Success = true, ActionType = actionType };
}

/// <summary>
/// Creates failure result
/// </summary>
public static ActionResult CreateFailure(string actionType, string message)
{
    return new ActionResult { Success = false, ActionType = actionType, Message = message };
}
```

**Why it's good**: Method names clearly indicate what they do. Documentation confirms it concisely.

### Property (Minimal)
```csharp
/// <summary>
/// User's email address
/// </summary>
public string Email { get; set; }

/// <summary>
/// Indicates whether user is active
/// </summary>
public bool IsActive { get; set; }
```

**Why it's good**: Property names are descriptive. Summary adds minimal necessary context.

### Method (Non-Redundant)
```csharp
/// <summary>
/// Validates user credentials and returns authentication token
/// </summary>
public async UniTask<string> Authenticate(string username, string password)
{
    // Implementation...
}
```

**Why it's good**: Adds information (returns auth token) not obvious from signature.

## ❌ Bad Examples (Redundant)

### Over-Explaining Factory Method
```csharp
/// <summary>
/// Creates and returns a new ActionResult instance representing a successful action execution
/// </summary>
/// <param name="actionType">The type of the action that was successful</param>
/// <returns>A new ActionResult object with Success set to true and ActionType set to the provided actionType parameter</returns>
public static ActionResult CreateSuccess(string actionType)
{
    return new ActionResult { Success = true, ActionType = actionType };
}
```

**Why it's bad**: Everything is obvious from the method name `CreateSuccess` and return type `ActionResult`.

### Redundant Property Documentation
```csharp
/// <summary>
/// Gets or sets the email address of the user
/// </summary>
/// <value>
/// A string containing the user's email address
/// </value>
public string Email { get; set; }
```

**Why it's bad**: Property name `Email` and type `string` already tell us it's the user's email address.

### Repeating Method Signature
```csharp
/// <summary>
/// Authenticates a user asynchronously
/// </summary>
/// <param name="username">The username</param>
/// <param name="password">The password</param>
/// <returns>Returns a Task of string</returns>
public async UniTask<string> Authenticate(string username, string password)
{
    // Implementation...
}
```

**Why it's bad**: Just repeats parameter names and types without adding value.

## When Information is NOT Redundant

### Add Value by Explaining:

#### 1. What's Not Obvious from the Name
```csharp
/// <summary>
/// Validates credentials and returns JWT token
/// </summary>
public async UniTask<string> Authenticate(string username, string password)
```
**Value added**: Specifies it returns a JWT token, not just any string.

#### 2. Special Behaviors or Edge Cases
```csharp
/// <summary>
/// Creates skipped result
/// </summary>
/// <remarks>
/// Skipping is not considered an error, so Success is set to true.
/// </remarks>
public static ActionResult CreateSkipped(string actionType, string reason)
```
**Value added**: Explains the non-obvious behavior that Success=true for skipped actions.

#### 3. Constraints or Validation
```csharp
/// <summary>
/// User age
/// </summary>
/// <remarks>
/// Must be between 13 and 120. Values outside this range throw ArgumentOutOfRangeException.
/// </remarks>
public int Age { get; set; }
```
**Value added**: Documents validation rules not obvious from the type.

#### 4. Units or Format
```csharp
/// <summary>
/// Request timeout in milliseconds
/// </summary>
public int Timeout { get; set; }

/// <summary>
/// File size in bytes
/// </summary>
public long FileSize { get; }
```
**Value added**: Specifies units which aren't obvious from `int` or `long`.

## Self-Documenting Code Principle

### Good Naming Reduces Documentation Need

✅ **Self-Documenting:**
```csharp
/// <summary>
/// Maximum retry attempts
/// </summary>
public int MaxRetries { get; set; }
```

❌ **Poorly Named (Needs Verbose Docs):**
```csharp
/// <summary>
/// Gets or sets the maximum number of times the system will retry a failed operation before giving up
/// </summary>
public int Max { get; set; }
```

**Better approach**: Use a clear name (`MaxRetries`) with minimal docs.

### Type System Provides Information

✅ **Type is Informative:**
```csharp
/// <summary>
/// User registration date
/// </summary>
public DateTime RegisteredAt { get; set; }
```

❌ **Redundant:**
```csharp
/// <summary>
/// Gets or sets a DateTime value representing when the user registered
/// </summary>
public DateTime RegisteredAt { get; set; }
```

## Balancing Conciseness and Clarity

### Rule of Thumb:
If removing the documentation would leave questions, keep it.
If the code is 100% clear without docs, make docs very brief.

### Questions to Ask:
1. Does the name fully explain the purpose? → Minimal docs needed
2. Are there constraints or special cases? → Document them
3. Is the return value/behavior obvious? → Don't repeat it
4. Would a new developer have questions? → Answer those questions only

## Examples of Good Balance

### Simple Property (Minimal)
```csharp
/// <summary>
/// User's display name
/// </summary>
public string DisplayName { get; set; }
```

### Property with Constraint (Added Value)
```csharp
/// <summary>
/// User's display name
/// </summary>
/// <remarks>
/// Maximum length: 50 characters. Automatically truncated if longer.
/// </remarks>
public string DisplayName { get; set; }
```

### Simple Method (Concise)
```csharp
/// <summary>
/// Sends email notification
/// </summary>
public async UniTask SendEmail(string to, string subject, string body)
{
    // Implementation...
}
```

### Method with Important Detail (Added Value)
```csharp
/// <summary>
/// Sends email notification
/// </summary>
/// <remarks>
/// Emails are queued and sent asynchronously. Method returns immediately.
/// Check SendStatus for delivery confirmation.
/// </remarks>
public async UniTask SendEmail(string to, string subject, string body)
{
    // Implementation...
}
```

## Common Redundancy Patterns to Avoid

### Pattern 1: "Gets or Sets"
❌ `/// <summary>Gets or sets the user name</summary>`
✅ `/// <summary>User name</summary>`

### Pattern 2: Repeating Type in Description
❌ `/// <summary>A boolean indicating whether...</summary>`
✅ `/// <summary>Indicates whether...</summary>`

### Pattern 3: Obvious Collections
❌ `/// <summary>List of all active users</summary>`
✅ `/// <summary>Active users</summary>`

### Pattern 4: Obvious Return Values
❌ `/// <returns>Returns true if valid, false otherwise</returns>`
✅ `/// <returns>true if valid, false otherwise</returns>`

## Rationale

**Benefits of avoiding redundancy:**

**Reduced Noise:**
- Code is easier to scan
- Important information stands out
- Less text to read and maintain

**Maintenance:**
- Less documentation to update
- Fewer opportunities for docs to get out of sync
- Changes to code less likely to invalidate docs

**Trust:**
- Developers trust concise, accurate docs
- Verbose docs often get ignored
- Quality over quantity

**Focus:**
- Documentation highlights what matters
- Edge cases and special behaviors get attention
- Obvious things don't clutter the view

## When Redundancy is Acceptable

### Public API Documentation
For libraries and frameworks distributed externally, slightly more verbose docs may be acceptable to ensure clarity for all audiences.

### Generated Documentation
If generating external API docs (like with DocFX), some redundancy ensures generated docs are complete.

### Company Standards
If your company requires specific documentation patterns, follow them even if slightly redundant.

### Educational Context
When writing code for learning/teaching, extra explanation can be valuable.

But even in these cases, avoid excessive redundancy!
