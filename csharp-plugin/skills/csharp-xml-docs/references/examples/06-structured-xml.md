# Use Structured XML

Leverage XML tags (`<para>`, `<br/>`, `<list>`) for complex documentation.

## Principle

For complex documentation with multiple topics, structured XML tags improve readability and scannability. Don't rely on plain text alone.

## Key Structured Tags

### `<para>` - Paragraph Separation
Creates visual breaks between topics

### `<br/>` - Line Breaks
Compact formatting for steps and lists

### `<list>` - Structured Lists
Tables and formal lists

### `<code>` - Code Examples
Inline code samples

## ✅ Good Examples

### Multi-Step Process with `<br/>`
```csharp
/// <summary>
/// Executes event with full workflow
/// </summary>
/// <remarks>
/// <para>
/// <strong>Execution Process:</strong><br/>
/// 1. Event definition lookup<br/>
/// 2. Event-level condition evaluation<br/>
/// 3. Direct action list processing<br/>
/// 4. Execution time and metadata configuration
/// </para>
/// </remarks>
public async UniTask<EventActionResult> ExecuteEvent(string eventId)
{
    // Implementation...
}
```

### Feature List with `<br/>`
```csharp
/// <summary>
/// Action execution engine
/// </summary>
/// <remarks>
/// <para>
/// <strong>Key Features:</strong><br/>
/// • Thread-safe action handler management<br/>
/// • Event definition caching and updates<br/>
/// • Condition-based action filtering<br/>
/// • Performance measurement and result aggregation
/// </para>
/// </remarks>
public class ActionExecutionEngine
{
    // Implementation...
}
```

### Table with `<list type="table">`
```csharp
/// <summary>
/// Returns performance grade based on execution time
/// </summary>
/// <remarks>
/// <list type="table">
/// <item><term>Fast</term><description>&lt; 10ms</description></item>
/// <item><term>Normal</term><description>10-50ms</description></item>
/// <item><term>Slow</term><description>50-200ms</description></item>
/// <item><term>Critical</term><description>&gt;= 200ms</description></item>
/// </list>
/// </remarks>
public string GetPerformanceGrade()
{
    double ms = ExecutionTime.TotalMilliseconds;
    return ms switch
    {
        < 10 => "Fast",
        < 50 => "Normal",
        < 200 => "Slow",
        _ => "Critical",
    };
}
```

### Multi-Topic with `<para>`
```csharp
/// <summary>
/// Advanced event execution with retry logic
/// </summary>
/// <remarks>
/// <para>
/// <strong>Execution Process:</strong><br/>
/// 1. Validate event definition<br/>
/// 2. Evaluate preconditions<br/>
/// 3. Execute actions with retry
/// </para>
/// <para>
/// <strong>Retry Behavior:</strong><br/>
/// Failed actions are retried up to MaxRetries times with exponential backoff.
/// Total timeout applies across all retry attempts.
/// </para>
/// <para>
/// <strong>Error Handling:</strong><br/>
/// Individual action failures don't stop execution unless configured otherwise.
/// All errors are collected in the result's Errors collection.
/// </para>
/// </remarks>
public async UniTask<EventActionResult> ExecuteWithRetry(string eventId)
{
    // Implementation...
}
```

### Code Example
```csharp
/// <summary>
/// Registers custom action handler
/// </summary>
/// <remarks>
/// <para>
/// <strong>Usage Example:</strong>
/// <code>
/// ActionExecutionEngine engine = new ActionExecutionEngine();
/// engine.RegisterHandler("CustomAction", new CustomActionHandler());
///
/// ActionResult result = await engine.Execute(eventAction);
/// if (result.Success)
/// {
///     Console.WriteLine("Action executed successfully");
/// }
/// </code>
/// </para>
/// </remarks>
public void RegisterHandler(string actionType, IActionHandler handler)
{
    // Implementation...
}
```

## ❌ Bad Examples (Unstructured)

### Wall of Text
```csharp
/// <summary>
/// Executes event with full workflow
/// </summary>
/// <remarks>
/// First looks up the event definition from the cache or loads it if not cached. Then evaluates event-level conditions for performance optimization. After that processes the direct action list in sequence. Finally configures execution time and metadata for the result.
/// </remarks>
public async UniTask<EventActionResult> ExecuteEvent(string eventId)
{
    // Implementation...
}
```

**Why it's bad**: Hard to scan, no visual structure, difficult to find specific information.

### Comma-Separated Features
```csharp
/// <summary>
/// Action execution engine
/// </summary>
/// <remarks>
/// Key features: thread-safe action handler management, event definition caching and updates, condition-based action filtering, performance measurement and result aggregation.
/// </remarks>
public class ActionExecutionEngine { }
```

**Why it's bad**: Features run together, hard to count or scan individually.

## When to Use Each Tag

### Use `<br/>` When:
- **Sequential steps** (3+ steps in a process)
- **Feature lists** (3+ bullet points)
- **Compact information** (don't need table formatting)
- **Simple line separation** (one item per line)

**Example scenarios:**
- Execution workflow steps
- Key features or capabilities
- Prerequisites or requirements
- Quick reference lists

### Use `<list type="table">` When:
- **Key-value pairs** (term and description)
- **Thresholds or ranges** (condition and value)
- **Structured reference data** (needs tabular view)
- **Formal documentation** (generating external docs)

**Example scenarios:**
- Performance grade thresholds
- Configuration option mappings
- Status code meanings
- Enum value details

### Use `<para>` When:
- **Multiple topics** (3+ distinct subjects)
- **Logical grouping** (separate concerns)
- **Visual separation** (break up long remarks)
- **Topic headers** (with `<strong>` tags)

**Example scenarios:**
- Multi-part documentation (process + behavior + errors)
- Separate sections (usage + performance + notes)
- Different audience segments (developers + administrators)

### Use `<code>` When:
- **Usage examples** (show how to use API)
- **Code snippets** (demonstrate patterns)
- **Sample values** (illustrate formats)
- **Template code** (copy-paste examples)

**Example scenarios:**
- API usage patterns
- Configuration examples
- Input/output format samples
- Integration code

## Comparison: `<br/>` vs `<list>`

### `<br/>` Advantages:
- ✅ Compact, single-spaced display
- ✅ Minimal markup overhead
- ✅ Better IDE compatibility
- ✅ Clean bilingual structure
- ✅ Recommended for Unity projects

### `<list>` Advantages:
- ✅ Formal documentation structure
- ✅ Better for generated API docs
- ✅ Standard XML format
- ✅ Table display for key-value pairs

### Comparison Table:

| Aspect | `<br/>` | `<list>` |
|--------|---------|----------|
| Compactness | Single-spaced | Extra spacing |
| Markup | Minimal | Verbose |
| IDE Display | Excellent | Good |
| Doc Generators | Good | Excellent |
| Use For | Steps, features | Tables, terms |

## Korean Examples

### Sequential Steps with `<br/>`
```csharp
/// <summary>
/// 이벤트를 전체 워크플로우로 실행
/// </summary>
/// <remarks>
/// <para>
/// <strong>실행 프로세스:</strong><br/>
/// 1. 이벤트 정의 조회<br/>
/// 2. 이벤트 레벨 조건 평가<br/>
/// 3. 직접 액션 목록 처리<br/>
/// 4. 실행 시간 및 메타데이터 구성
/// </para>
/// </remarks>
```

### Feature List with `<br/>`
```csharp
/// <summary>
/// 액션 실행 엔진
/// </summary>
/// <remarks>
/// <para>
/// <strong>주요 기능:</strong><br/>
/// • 스레드 안전 액션 핸들러 관리<br/>
/// • 이벤트 정의 캐싱 및 업데이트<br/>
/// • 조건 기반 액션 필터링<br/>
/// • 성능 측정 및 결과 집계
/// </para>
/// </remarks>
```

## Bilingual Structured Documentation

### Pattern: Separate Paragraphs
```csharp
/// <summary>
/// 고급 이벤트 실행
/// </summary>
/// <remarks>
/// <para>
/// <strong>한글 - 실행 프로세스:</strong><br/>
/// 1. 이벤트 정의 검증<br/>
/// 2. 사전 조건 평가<br/>
/// 3. 재시도 로직으로 액션 실행
/// </para>
/// <para>
/// <strong>English - Execution Process:</strong><br/>
/// 1. Validate event definition<br/>
/// 2. Evaluate preconditions<br/>
/// 3. Execute actions with retry logic
/// </para>
/// </remarks>
```

## Best Practices

### 1. Use Headers with `<strong>`
```csharp
<strong>Execution Process:</strong><br/>
<strong>Key Features:</strong><br/>
<strong>Performance Notes:</strong><br/>
```

### 2. Combine Tags Effectively
```csharp
/// <remarks>
/// <para>
/// <strong>Process:</strong><br/>
/// [steps with <br/>]
/// </para>
/// <para>
/// <strong>Configuration:</strong>
/// <list type="table">
/// [config options]
/// </list>
/// </para>
/// </remarks>
```

### 3. Keep It Scannable
- Use bullets (•) or numbers (1, 2, 3)
- One item per line
- Group related items
- Use clear headers

### 4. Balance Structure and Simplicity
- Don't over-structure simple information
- Use structure when it adds clarity
- Consider the audience and context

## Rationale

**Why structure matters:**

**Readability:**
- Visual breaks improve scanning
- Topics are clearly separated
- Information hierarchy is obvious

**Maintenance:**
- Easier to update specific sections
- Changes don't affect other parts
- Structure enforces organization

**Professionalism:**
- Well-formatted docs look polished
- Shows attention to detail
- Improves developer experience

**IntelliSense:**
- Structured docs render better
- `<br/>` creates line breaks
- `<strong>` creates emphasis
- `<para>` separates sections
