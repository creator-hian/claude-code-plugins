# PR Body Template

Generic PR description template supporting multiple PR types.

---

## Template Selection

| PR Type | Title Pattern | Template Section |
|---------|---------------|------------------|
| Feature | `feat(`, `feature:` | [Feature Template](#feature-template) |
| Bug Fix | `fix(`, `bugfix:` | [Fix Template](#fix-template) |
| Documentation | `docs(` | [Docs Template](#docs-template) |
| Refactor | `refactor(` | [Refactor Template](#refactor-template) |
| Chore | `chore(`, `build:`, `ci:` | [Chore Template](#chore-template) |
| Default | (none matched) | [Default Template](#default-template) |

---

## Feature Template

```markdown
## Summary

{Brief description of the new feature}

### ✨ What's New

- {Feature point 1}
- {Feature point 2}

### 🔧 Implementation Details

| Component | Changes |
|-----------|---------|
| {file/module} | {description} |

### 📸 Screenshots (if UI)

{Before/After screenshots or N/A}

## ✅ Checklist

- [ ] Unit tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or documented)

## 🔗 Related

- Closes #{ISSUE_NUMBER}
- Related: #{RELATED_PR}

---
🤖 Generated with [Claude Code](https://claude.ai/code)
```

---

## Fix Template

```markdown
## Summary

{Brief description of the bug fix}

### 🐛 Problem

{What was broken and how it manifested}

### 💡 Solution

{How the fix addresses the problem}

### 🔍 Root Cause

{Why the bug occurred}

### 📋 Changes

| File | Change |
|------|--------|
| {file} | {description} |

## ✅ Verification

- [ ] Bug no longer reproducible
- [ ] Regression tests added
- [ ] Related areas tested

## 🔗 Related

- Fixes #{ISSUE_NUMBER}

---
🤖 Generated with [Claude Code](https://claude.ai/code)
```

---

## Docs Template

```markdown
## Summary

{Brief description of documentation changes}

### 📁 Document Structure

```
{Directory tree of changed/added files}
```

### 📊 Statistics

| Item | Count |
|------|-------|
| Files added/modified | X |
| Total lines | X |
| Diagrams | X |

## ✅ Checklist (Issue #{ISSUE_NUMBER})

### {Section Name}
- [x] {Completed item}
- [ ] {Incomplete item}

## 🔗 Related

- Closes #{ISSUE_NUMBER}

---
🤖 Generated with [Claude Code](https://claude.ai/code)
```

---

## Refactor Template

```markdown
## Summary

{Brief description of refactoring}

### 🎯 Goal

{Why this refactoring is needed}

### 🔄 Changes

| Before | After | Reason |
|--------|-------|--------|
| {old pattern} | {new pattern} | {why} |

### 📋 Affected Files

| File | Change Type |
|------|-------------|
| {file} | {renamed/restructured/extracted} |

### ⚠️ Breaking Changes

{None / List of breaking changes}

## ✅ Verification

- [ ] All tests passing
- [ ] No functionality changed
- [ ] Performance maintained

## 🔗 Related

- Part of #{ISSUE_NUMBER}

---
🤖 Generated with [Claude Code](https://claude.ai/code)
```

---

## Chore Template

```markdown
## Summary

{Brief description of maintenance task}

### 🔧 Changes

- {Change 1}
- {Change 2}

### 📦 Dependencies (if applicable)

| Package | From | To |
|---------|------|-----|
| {name} | {old} | {new} |

## ✅ Verification

- [ ] Build succeeds
- [ ] Tests passing
- [ ] CI/CD working

---
🤖 Generated with [Claude Code](https://claude.ai/code)
```

---

## Default Template

```markdown
## Summary

{Brief description based on commits and PR title}

### 📋 Changes

| File | Description |
|------|-------------|
| {file} | {change} |

## ✅ Checklist

- [ ] Tests passing
- [ ] Code reviewed
- [ ] Documentation updated (if needed)

## 🔗 Related

- #{ISSUE_NUMBER}

---
🤖 Generated with [Claude Code](https://claude.ai/code)
```

---

## Usage Notes

1. **Select template** based on PR title prefix
2. **Fill placeholders** `{...}` with actual data
3. **Remove unused sections** - keep only relevant parts
4. **Adapt as needed** - templates are guidelines, not strict rules
