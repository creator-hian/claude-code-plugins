# Think About Your Audience

Choose language (Korean/English/Mixed) that serves your team best.

## Principle

XML documentation language should be chosen based on your primary audience and project context. There's no single "correct" choice - optimize for clarity and accessibility for those who will use your code.

## Language Options

### Option 1: Pure Korean (한글 전용)
**Best for**: Internal Korean teams, Korean-language projects

```csharp
/// <summary>
/// 액션 실행 성공 여부
/// </summary>
public bool Success { get; set; }

/// <summary>
/// 재시도 횟수
/// </summary>
public int RetryCount { get; set; }

/// <summary>
/// 액션이 건너뛰어졌는지 여부
/// </summary>
/// <remarks>
/// 조건이 충족되지 않아 건너뛴 경우 true로 설정됩니다.
/// true인 경우, Success 값과 관계없이 액션이 실행되지 않았음을 의미합니다.
/// </remarks>
public bool Skipped { get; set; }
```

### Option 2: Pure English (영문 전용)
**Best for**: International teams, open-source projects, global companies

```csharp
/// <summary>
/// Indicates whether the action executed successfully
/// </summary>
public bool Success { get; set; }

/// <summary>
/// Number of retry attempts
/// </summary>
public int RetryCount { get; set; }

/// <summary>
/// Indicates whether the action was skipped
/// </summary>
/// <remarks>
/// Set to true when skipped due to unmet conditions.
/// If true, the action was not executed regardless of Success value.
/// </remarks>
public bool Skipped { get; set; }
```

### Option 3: Mixed Korean + English (혼용)
**Best for**: Transitioning codebases, teams with mixed language proficiency

```csharp
/// <summary>
/// 액션 실행 성공 여부
/// </summary>
/// <remarks>
/// <strong>한글:</strong> 실행이 성공하면 true, 실패하면 false를 반환합니다.<br/>
/// <strong>English:</strong> Returns true if execution succeeded, false otherwise.
/// </remarks>
public bool Success { get; set; }
```

## Context-Based Recommendations

| Context | Recommended Language | Rationale |
|---------|---------------------|-----------|
| Internal team project | Korean or Team preference | Maximum clarity for team members |
| Open source / International | English or Mixed | Broader accessibility |
| Company standard exists | Follow company policy | Consistency across projects |
| Mixed team (Korean + International) | English or Both | Accommodate all members |
| Legacy codebase | Match existing style | Maintain consistency |
| Library for public distribution | English | Widest possible audience |
| Game development (Korea) | Korean or Mixed | Target audience consideration |

## ✅ Good Examples by Context

### Internal Korean Team
```csharp
/// <summary>
/// VRM 모델 로딩 상태
/// </summary>
/// <remarks>
/// 로딩이 완료되면 true, 아직 로딩 중이거나 실패한 경우 false입니다.
/// IsReady가 true일 때만 애니메이션 재생이 가능합니다.
/// </remarks>
public bool IsReady { get; private set; }
```

### Open Source / International
```csharp
/// <summary>
/// VRM model loading state
/// </summary>
/// <remarks>
/// true when loading is complete, false if still loading or failed.
/// Animation playback is only possible when IsReady is true.
/// </remarks>
public bool IsReady { get; private set; }
```

### Mixed Team (Bilingual)
```csharp
/// <summary>
/// VRM 모델 로딩 상태 / VRM model loading state
/// </summary>
/// <remarks>
/// <para>
/// <strong>한글:</strong> 로딩이 완료되면 true, 아직 로딩 중이거나 실패한 경우 false입니다.
/// </para>
/// <para>
/// <strong>English:</strong> true when loading is complete, false if still loading or failed.
/// </para>
/// </remarks>
public bool IsReady { get; private set; }
```

## ❌ Bad Examples

### Inconsistent Language Mixing
```csharp
/// <summary>액션 실행 success 여부</summary>
public bool Success { get; set; }

/// <summary>Number of 재시도 attempts</summary>
public int RetryCount { get; set; }
```

**Why it's bad**: Random mixing within single sentences creates confusion. Choose one language or separate them clearly.

### Inconsistent Across File
```csharp
/// <summary>액션 실행 성공 여부</summary>
public bool Success { get; set; }

/// <summary>Number of retry attempts</summary>
public int RetryCount { get; set; }

/// <summary>액션 priority level</summary>
public int Priority { get; set; }
```

**Why it's bad**: Properties in the same class should use consistent language.

## Decision Framework

### Step 1: Identify Your Audience
- Who will read this code?
- What are their language capabilities?
- Is this internal or external code?

### Step 2: Consider Project Context
- Existing codebase language?
- Company/team standards?
- Target users of the software?

### Step 3: Choose Consistent Approach
- Pure Korean: All team members comfortable with Korean
- Pure English: International team or open-source
- Mixed: Transition period or truly bilingual team

### Step 4: Document Your Choice
In project README or CLAUDE.md:
```markdown
## Documentation Language

This project uses [Korean/English/Mixed] for XML documentation.

**Rationale**: [Explain your choice]

**Guidelines**:
- All public APIs must have XML documentation
- Use [chosen language] consistently within each file
- [Any additional project-specific rules]
```

## Consistency Guidelines

### Within a Single File
✅ **Consistent**: All Korean OR All English OR All Mixed
```csharp
// Option A: All Korean
/// <summary>액션 실행 성공 여부</summary>
/// <summary>재시도 횟수</summary>
/// <summary>액션 우선순위</summary>

// Option B: All English
/// <summary>Indicates whether action succeeded</summary>
/// <summary>Number of retry attempts</summary>
/// <summary>Action priority level</summary>
```

❌ **Inconsistent**: Random switching
```csharp
/// <summary>액션 실행 성공 여부</summary>
/// <summary>Number of retry attempts</summary>
/// <summary>액션 priority</summary>
```

### Across the Project
- Maintain similar strategy across similar components
- Interfaces and their implementations should match
- Related classes in the same namespace should be consistent

## IntelliSense Considerations

**Remember**: IntelliSense displays `<summary>` prominently
- Choose language that team sees in IDE most often
- Summary should be scannable and clear
- Detailed remarks can use different language if needed

## Rationale

**Why language choice matters**:
- Improves developer productivity
- Reduces misunderstandings
- Makes code review more effective
- Aids onboarding and knowledge transfer

**Why consistency matters**:
- Reduces cognitive load
- Makes documentation predictable
- Easier to maintain over time
- Professional appearance

**Why flexibility exists**:
- Different projects have different needs
- Teams evolve and change
- One size doesn't fit all
- Context matters more than dogma
