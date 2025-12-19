# Be Consistent

Follow established patterns within files and across the project.

## Principle

Consistency in language choice, formatting, and style makes code easier to read, maintain, and understand. Random variations create cognitive load and look unprofessional.

## ✅ Good Examples

### Consistent Language Within File
```csharp
/// <summary>액션 실행 성공 여부</summary>
public bool Success { get; set; }

/// <summary>재시도 횟수</summary>
public int RetryCount { get; set; }

/// <summary>액션 우선순위</summary>
public int Priority { get; set; }
```

### Consistent Formatting for Similar Members
```csharp
/// <summary>
/// Loads VRM model asynchronously
/// </summary>
public async UniTask<VrmInstance> LoadVRM(string path)
{
    // Implementation...
}

/// <summary>
/// Unloads VRM model asynchronously
/// </summary>
public async UniTask UnloadVRM()
{
    // Implementation...
}

/// <summary>
/// Plays animation asynchronously
/// </summary>
public async UniTask<bool> PlayAnimation(string path)
{
    // Implementation...
}
```

### Consistent Interface-Implementation Pattern
```csharp
// Interface
public interface IActionHandler
{
    /// <summary>Executes action asynchronously</summary>
    UniTask<ActionResult> Execute(EventAction action);
}

// Implementation 1
public class PlayerPrefsHandler : IActionHandler
{
    /// <inheritdoc/>
    /// <remarks>
    /// <strong>Parameters:</strong> operation, key, value
    /// </remarks>
    public async UniTask<ActionResult> Execute(EventAction action) { }
}

// Implementation 2
public class SceneHandler : IActionHandler
{
    /// <inheritdoc/>
    /// <remarks>
    /// <strong>Parameters:</strong> operation, sceneName, mode
    /// </remarks>
    public async UniTask<ActionResult> Execute(EventAction action) { }
}
```

## ❌ Bad Examples

### Inconsistent Language Within File
```csharp
/// <summary>액션 실행 성공 여부</summary>
public bool Success { get; set; }

/// <summary>Number of retry attempts</summary>
public int RetryCount { get; set; }

/// <summary>액션 priority level</summary>
public int Priority { get; set; }
```

**Why it's bad**: Randomly switching between Korean and English within the same class creates confusion.

### Inconsistent Formatting
```csharp
/// <summary>Loads VRM model</summary>
public async UniTask<VrmInstance> LoadVRM(string path) { }

/// <summary>
/// Unloads VRM model asynchronously from memory
/// and cleans up all associated resources
/// </summary>
public async UniTask UnloadVRM() { }

/// <summary>Plays animation</summary>
public async UniTask<bool> PlayAnimation(string path) { }
```

**Why it's bad**: Similar methods have vastly different documentation levels without good reason.

### Inconsistent Terminology
```csharp
/// <summary>Retrieves user data</summary>
public User GetUser(int id) { }

/// <summary>Fetches player information</summary>
public User GetPlayer(int id) { }

/// <summary>Loads account details</summary>
public User GetAccount(int id) { }
```

**Why it's bad**: Using different terms (retrieve/fetch/load, user/player/account) for similar operations.

## Consistency Levels

### Level 1: Within a Single File
**Rule**: Use the same language and style throughout

✅ **All Korean:**
```csharp
/// <summary>사용자 이름</summary>
public string UserName { get; set; }

/// <summary>사용자 이메일</summary>
public string Email { get; set; }

/// <summary>사용자 역할</summary>
public string Role { get; set; }
```

✅ **All English:**
```csharp
/// <summary>User name</summary>
public string UserName { get; set; }

/// <summary>User email address</summary>
public string Email { get; set; }

/// <summary>User role</summary>
public string Role { get; set; }
```

❌ **Mixed randomly:**
```csharp
/// <summary>사용자 이름</summary>
public string UserName { get; set; }

/// <summary>User email address</summary>
public string Email { get; set; }

/// <summary>User 역할</summary>
public string Role { get; set; }
```

### Level 2: Within a Class/Interface
**Rule**: Related members use the same documentation pattern

✅ **Consistent level of detail for properties:**
```csharp
/// <summary>Maximum retry attempts</summary>
public int MaxRetries { get; set; }

/// <summary>Retry delay in milliseconds</summary>
public int RetryDelay { get; set; }

/// <summary>Exponential backoff multiplier</summary>
public double BackoffMultiplier { get; set; }
```

### Level 3: Across Related Files
**Rule**: Interface and implementations match language

```csharp
// IVTuberController.cs - Korean
/// <summary>VTuber 제어 인터페이스</summary>
public interface IVTuberController { }

// VRMController.cs - Korean (matching interface)
/// <summary>VRM 기반 VTuber 제어 구현</summary>
public class VRMController : IVTuberController { }
```

### Level 4: Across the Project
**Rule**: Document and follow project standards

Create a documentation standards file:
```markdown
# Documentation Standards

## Language
This project uses **Korean** for all XML documentation.

## Formatting Rules
- Properties: Single-line `<summary>` only
- Methods: Multi-line `<summary>` with parameters
- Complex concepts: Add `<remarks>`
- Interfaces: Full documentation
- Implementations: Use `<inheritdoc/>`

## Terminology
- Use "사용자" (not "유저")
- Use "실행" (not "수행")
- Use "가져오다" (not "로드하다")
```

## Consistency Checklist

**Before committing code, verify:**
- [ ] Language is consistent within each file
- [ ] Formatting matches other similar members
- [ ] Terminology aligns with project standards
- [ ] Level of detail is appropriate and consistent
- [ ] Interface and implementation docs match
- [ ] Related classes use similar patterns

## Rationale

**Why consistency matters:**

**Readability:**
- Predictable patterns are easier to scan
- Reduces mental context switching
- Faster comprehension

**Maintainability:**
- Easier to update documentation
- Clear patterns to follow for new code
- Reduces decision fatigue

**Professionalism:**
- Looks polished and well-maintained
- Builds confidence in code quality
- Better first impression for new team members

**Team Collaboration:**
- Everyone follows the same patterns
- Reduces code review friction
- Easier to onboard new developers

## Tips for Maintaining Consistency

1. **Use a style guide** - Document your team's choices
2. **Code review checklist** - Include consistency checks
3. **EditorConfig** - Configure formatting rules
4. **Templates** - Create snippets for common patterns
5. **Regular reviews** - Periodically audit for consistency
6. **Team agreement** - Get buy-in on standards early

## Common Consistency Issues

### Issue 1: Language Switching Mid-Project
**Solution**: Choose one language at project start, document the choice, stick to it.

### Issue 2: Different Developers, Different Styles
**Solution**: Establish team standards, review for consistency, provide feedback.

### Issue 3: Copying from External Sources
**Solution**: Adapt external code to match your project's style, don't just copy-paste.

### Issue 4: Legacy Code vs New Code
**Solution**: Gradually update legacy code during changes, or run a consistency pass.
