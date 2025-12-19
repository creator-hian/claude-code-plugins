# Gemini Co-Implementation Guide

This guide details the handoff, generation, and integration process for Gemini auxiliary code generation.

## Overview

Co-Implementation enables Gemini to generate auxiliary code (documentation, boilerplate) while Claude focuses on core logic.

```
Claude: Core Logic → Handoff Spec → Gemini: Auxiliary Code → Claude: Integration
```

## Handoff Specification Format

Claude creates `.ai-orchestration/phase5b_handoff.md` after completing core implementation:

```markdown
# Gemini Co-Implementation Handoff

## Context
- Implementation: [link to implementation.md]
- Language: [TypeScript | Python | C# | etc.]
- Framework: [React | Next.js | Unity | etc.]

## Files Created/Modified
- `src/services/AuthService.ts` (new)
- `src/utils/validators.ts` (modified)

## Generation Tasks

### Task 1: API Documentation
**Type**: api-docs
**Target Files**: src/services/AuthService.ts
**Code Context**:
\`\`\`typescript
export class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResult> { ... }
  async logout(): Promise<void> { ... }
  async refreshToken(): Promise<string> { ... }
}
\`\`\`
**Requirements**:
- JSDoc format with @param, @returns, @throws, @example
- Include usage examples for each public method
- Document error scenarios

### Task 2: Utility Functions
**Type**: utilities
**Target Location**: src/utils/validators.ts
**Specifications**:
- `validateEmail(email: string): boolean`
- `validatePassword(password: string): ValidationResult`
- `sanitizeInput(input: string): string`
**Requirements**:
- Full implementation (no placeholders)
- Type-safe with proper TypeScript types
- Include JSDoc comments
```

## Gemini Output Format

Gemini generates code using FILE: marker system in `.ai-orchestration/phase5b_gemini_output.md`:

```markdown
# Gemini Generated Code

## Documentation

FILE: src/services/AuthService.ts
---
/**
 * AuthService - Handles user authentication and session management
 *
 * @class AuthService
 * @example
 * const auth = new AuthService(config);
 * const result = await auth.login({ email, password });
 */
export class AuthService {
  /**
   * Authenticates user with credentials
   * @param credentials - User login credentials
   * @returns Authentication result with token and user info
   * @throws {AuthError} When credentials are invalid
   * @example
   * const result = await auth.login({ email: 'user@example.com', password: 'secret' });
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> { ... }
}
---

## Boilerplate

FILE: src/utils/validators.ts
---
/**
 * Validates email format using RFC 5322 compliant regex
 * @param email - Email string to validate
 * @returns true if valid email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates password strength
 * @param password - Password to validate
 * @returns Validation result with strength score and issues
 */
export function validatePassword(password: string): ValidationResult {
  const issues: string[] = [];
  if (password.length < 8) issues.push('Must be at least 8 characters');
  if (!/[A-Z]/.test(password)) issues.push('Must contain uppercase letter');
  if (!/[0-9]/.test(password)) issues.push('Must contain number');

  return {
    valid: issues.length === 0,
    score: Math.max(0, 10 - issues.length * 2),
    issues
  };
}
---
```

## Generation Prompts

### Documentation Generation Prompt

```
Generate comprehensive documentation for the following code:

## Handoff Specification
$(cat .ai-orchestration/phase5b_handoff.md)

## Requirements
1. Generate [JSDoc/TSDoc/XML/PyDoc] documentation for all public APIs
2. Include:
   - Function/method descriptions
   - Parameter descriptions with types
   - Return value descriptions
   - Example usage
   - Thrown exceptions/errors
3. Follow project conventions
4. Generate inline comments for complex logic blocks

## Output Format
Use FILE: marker format:
\`\`\`
FILE: path/to/file.ext
---
[documented code]
---
\`\`\`
```

### Boilerplate Generation Prompt

```
Generate boilerplate/utility code based on specifications:

## Handoff Specification
$(cat .ai-orchestration/phase5b_handoff.md)

## Requirements
1. Generate functional code (no placeholders)
2. Match existing code style
3. Include necessary imports
4. Add comprehensive documentation
5. Ensure type safety

## Constraints
- No placeholder implementations
- No TODO comments
- Follow project naming conventions

## Output Format
Use FILE: marker format:
\`\`\`
FILE: path/to/file.ext
---
[complete code]
---
\`\`\`
```

### Combined Generation Prompt

```
Generate auxiliary code (documentation and boilerplate):

## Handoff Specification
$(cat .ai-orchestration/phase5b_handoff.md)

## Scope
- Documentation: [yes/no] - [scope details]
- Boilerplate: [yes/no] - [scope details]

## Output Format
Group by section:
1. DOCUMENTATION section
2. BOILERPLATE section

Use FILE: marker format for each file.
```

## Integration Process

### Step 1: Parse Gemini Output

Extract files from FILE: markers:
```
FILE: path/to/file.ext
---
[content between markers]
---
```

### Step 2: Validate

| Check | Action if Failed |
|-------|------------------|
| Syntax errors | Request revision |
| Import conflicts | Report to user |
| Duplicate names | Report conflict |
| Style mismatch | Auto-fix if minor |

### Step 3: Apply Review Mode

| Mode | Process |
|------|---------|
| Review-first (default) | Show all files to user → Ask approval → Integrate approved |
| Auto-integrate | Validate syntax → Integrate if pass → Report failures |
| Strict | Ask per file → Integrate only explicitly approved |

### Step 4: Integrate

Use Edit/Write tools to:
- Insert documentation into existing files
- Create new utility files
- Update imports if needed

### Step 5: Document

Save `.ai-orchestration/phase5c_integration.md`:
```markdown
# Integration Log

## Files Integrated
| File | Type | Status |
|------|------|--------|
| src/services/AuthService.ts | docs | Integrated |
| src/utils/validators.ts | boilerplate | Integrated |

## Review Decisions
- AuthService docs: Approved (user)
- Validators: Approved (user)

## Revisions Made
- None required

## Notes
- All Gemini output integrated successfully
```

## Revision Handling

### When to Request Revision

- Syntax errors in generated code
- Missing required elements (e.g., @param for all params)
- Type mismatches with existing code
- User rejects with specific feedback

### Revision Prompt

```
Revise the following code based on feedback:

## Original Output
$(cat .ai-orchestration/phase5b_gemini_output.md)

## Issues Found
[List specific issues]

## Required Fixes
[Specific corrections needed]

## Output Format
Same FILE: marker format
```

### Revision Limits

- Maximum 2 revision attempts
- After 2 failures: Claude generates fallback OR escalate to user

## Quality Checklist

### Documentation Quality
- [ ] All public APIs documented
- [ ] Parameters have type and description
- [ ] Return values documented
- [ ] Examples provided
- [ ] Errors/exceptions documented

### Boilerplate Quality
- [ ] No placeholder code
- [ ] All functions fully implemented
- [ ] Types properly defined
- [ ] Imports included
- [ ] Tests can run against code

### Integration Quality
- [ ] No syntax errors
- [ ] No import conflicts
- [ ] Style matches project
- [ ] Builds successfully
- [ ] Tests pass

## Error Handling

| Error | Solution |
|-------|----------|
| Gemini timeout | Retry once, then Claude fallback |
| Invalid output format | Request re-generation with format reminder |
| Persistent syntax errors | Claude generates fallback |
| User rejects all output | Continue with Claude-only implementation |
