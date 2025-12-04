# AI Orchestration Workflow Patterns

> **Model References**: All model placeholders (e.g., `[HIGH_CAPABILITY_MODEL]`, `[MINI_MODEL]`) should be replaced with actual models from:
> - **Codex**: `codex-plugin:codex-cli` skill
> - **Gemini**: `gemini-plugin:gemini-cli` skill

## Pattern 1: Standard Full Loop

```
Claude: Plan → Codex: Validate → Gemini: Review → Claude: Synthesize → Claude: Implement → Codex+Gemini: Review → Done
```

**Use when**: Default for mission-critical features

**Phase sequence**:
1. Planning (Claude) - 5-10 min
2. Codex Validation - 5-10 min
3. Gemini Review - 5-10 min
4. Synthesis (Claude) - 5 min
5. Implementation (Claude) - Variable
6. Dual Review - 10-15 min
7. Iteration (if needed) - Variable

**Total estimated**: 30-60 min + implementation time

---

## Pattern 2: Security-First Loop

```
Claude: Plan → Codex: Security Audit → Gemini: Attack Vector Review → Claude: Harden → Codex: Re-audit → Done
```

**Use when**: Security-sensitive code (auth, encryption, data access)

**Key differences**:
- Codex uses `model_reasoning_effort=xhigh`
- Specific security prompts (OWASP, threat modeling)
- Gemini focuses on attack surface analysis
- Additional hardening phase before implementation

**Codex security prompt** (use highest-capability model from codex-cli skill):
```bash
codex exec -m [HIGH_CAPABILITY_MODEL] -c model_reasoning_effort=xhigh -s read-only \
  "Perform comprehensive security audit:
   - OWASP Top 10 vulnerability check
   - Authentication/authorization flaws
   - Input validation gaps
   - Injection vulnerabilities
   - Data exposure risks
   - Cryptographic weaknesses
   - Session management issues

   Plan: $(cat .ai-orchestration/plan.md)"
```

**Gemini attack vector prompt** (use highest-capability model from gemini-cli skill):
```bash
gemini -m [HIGH_CAPABILITY_MODEL] -p "Analyze as a security researcher:
  - Potential attack vectors
  - Social engineering opportunities
  - Supply chain risks
  - Configuration weaknesses
  - Privilege escalation paths

  Plan: $(cat .ai-orchestration/plan.md)
  Codex security findings: $(cat .ai-orchestration/phase2_codex_validation.md)"
```

---

## Pattern 3: Architecture Decision Loop

```
Claude: Options → Codex: Tradeoff Analysis → Gemini: Alternative Exploration → Claude: Decision Matrix → User: Select → Implement
```

**Use when**: Major architectural decisions with long-term impact

**Phase sequence**:
1. Claude presents 2-4 architecture options
2. Codex analyzes tradeoffs systematically
3. Gemini explores alternatives not considered
4. Claude builds decision matrix
5. User makes final selection
6. Standard implementation with dual review

**Decision matrix template**:
```markdown
| Option | Performance | Maintainability | Security | Scalability | Complexity |
|--------|-------------|-----------------|----------|-------------|------------|
| A      | ★★★★☆       | ★★★☆☆           | ★★★★★    | ★★★★☆       | ★★★☆☆      |
| B      | ★★★☆☆       | ★★★★★           | ★★★★☆    | ★★★☆☆       | ★★☆☆☆      |

Codex recommendation: Option A (rationale)
Gemini recommendation: Option B (rationale)
Consensus points: [...]
```

---

## Pattern 4: Rapid Iteration Loop

```
Claude: Quick Plan → Codex: Fast Check → Implement → Gemini: Quick Review → Fix → Done
```

**Use when**: Time-constrained but still needs multi-AI validation

**Key differences**:
- Abbreviated prompts
- Parallel validation where possible
- Lower reasoning effort
- Focus on critical issues only

**Configuration** (use fast/mini models from respective cli skills):
```
Codex: [MINI_MODEL], model_reasoning_effort=medium
Gemini: [FLASH_MODEL] (or [FLASH_LITE_MODEL] for max speed)
Timeout: 300000 (5 min per phase)
```

**Rapid validation prompt**:
```bash
codex exec -m [MINI_MODEL] -c model_reasoning_effort=medium -s read-only \
  "Quick validation - CRITICAL issues only:
   $(cat .ai-orchestration/plan.md)

   Check: Security holes, Logic errors, Breaking changes
   Skip: Style, Minor optimizations, Nice-to-haves"
```

---

## Pattern 5: Consensus-Required Loop

```
Plan → Validate (Both) → MUST AGREE → Implement → Review (Both) → MUST AGREE → Done
```

**Use when**: Zero tolerance for disagreement (compliance, safety-critical)

**Gate requirements**:
- Phase 2-3: Both AIs must agree on no Critical issues
- Phase 6: Both AIs must APPROVE
- Any disagreement → escalate to user

**Consensus check logic**:
```markdown
## Consensus Gate Check

### Validation Phase Consensus
- Codex Critical Issues: [count]
- Gemini Critical Issues: [count]
- Overlapping Issues: [list]
- Unique to Codex: [list]
- Unique to Gemini: [list]

### Gate Decision
[ ] PASS - No Critical issues from either AI
[ ] FAIL - Critical issues require resolution
[ ] ESCALATE - AIs disagree on severity

### If FAIL or ESCALATE:
Required action: [resolve before proceeding]
```

---

## Pattern 6: Expert Rotation Loop

```
Round 1: Claude → Codex → Gemini
Round 2: Claude → Gemini → Codex
```

**Use when**: Bias mitigation, fresh perspectives needed

**Rationale**: Order affects perspective. First reviewer sets context, second builds on it.

**Round 1** (Codex first): Technical accuracy emphasized
**Round 2** (Gemini first): Creative alternatives emphasized

**Comparison prompt**:
```markdown
## Round 1 vs Round 2 Comparison

### Issues Found
| Issue | Round 1 | Round 2 |
|-------|---------|---------|
| ...   | Yes/No  | Yes/No  |

### Unique to Round 1: [list]
### Unique to Round 2: [list]
### Consistent Across Rounds: [list]

### Conclusion
Order-independent issues (high confidence): [list]
Order-dependent issues (investigate further): [list]
```

---

## Pattern 7: Staged Rollout Loop

```
Plan → Validate → Implement Stage 1 → Review → Implement Stage 2 → Review → ... → Done
```

**Use when**: Large features that should be validated incrementally

**Stage gates**:
- Each stage independently validated
- Rollback point after each stage
- Cumulative context builds through stages

**Stage tracking**:
```markdown
## Stage Progress

### Stage 1: [Name]
- Implementation: ✅ Complete
- Codex Review: ✅ PASS
- Gemini Review: ✅ APPROVE
- Rollback point: commit abc123

### Stage 2: [Name]
- Implementation: 🔄 In Progress
- Codex Review: ⏳ Pending
- Gemini Review: ⏳ Pending

### Stage 3: [Name]
- Implementation: ⏳ Pending
```

---

## Workflow Selection Matrix

| Scenario | Recommended Pattern | Rationale |
|----------|---------------------|-----------|
| New feature, medium complexity | Standard Full Loop | Balanced coverage |
| Authentication/authorization | Security-First | Security focus critical |
| Database schema change | Architecture Decision | Long-term impact |
| Hotfix with time pressure | Rapid Iteration | Speed with safety |
| Compliance requirement | Consensus-Required | Zero tolerance |
| Complex refactoring | Staged Rollout | Incremental validation |
| Novel approach | Expert Rotation | Bias mitigation |

## Anti-Patterns

### ❌ Skip Phase Anti-Pattern
**Problem**: Skipping validation phases to save time
**Risk**: Critical issues discovered late, costly rework
**Solution**: Use Rapid Iteration pattern instead of skipping

### ❌ Ignore Disagreement Anti-Pattern
**Problem**: Proceeding when AIs disagree without resolution
**Risk**: Unaddressed issues, false confidence
**Solution**: Use Consensus-Required pattern or explicit escalation

### ❌ Over-Engineering Anti-Pattern
**Problem**: Using Triple-AI for simple tasks
**Risk**: Time waste, analysis paralysis
**Solution**: Match pattern to task complexity

### ❌ No Synthesis Anti-Pattern
**Problem**: Acting on individual AI feedback without synthesis
**Risk**: Contradictory changes, incomplete fixes
**Solution**: Always include synthesis phase
