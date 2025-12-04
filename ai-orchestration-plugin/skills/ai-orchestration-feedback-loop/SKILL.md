---
name: ai-orchestration-feedback-loop
description: Multi-AI engineering loop orchestrating Claude, Codex, and Gemini for comprehensive validation. USE WHEN (1) mission-critical features requiring multi-perspective validation, (2) complex architectural decisions needing diverse AI viewpoints, (3) security-sensitive code requiring deep analysis, (4) user explicitly requests multi-AI review or triple-AI loop. DO NOT USE for simple features or single-file changes. MODES - Triple-AI (full coverage), Dual-AI Codex-Claude (security/logic), Dual-AI Gemini-Claude (UX/creativity).
requires:
  - gemini-plugin:gemini-cli
  - codex-plugin:codex-cli
---

# AI Orchestration Feedback Loop

## Workflow

```
Triple-AI:  Plan → Validate(AI-1) → Review(AI-2) → Synthesize → Implement → Dual Review → Done
Dual-AI:    Plan → Validate(AI) → Synthesize → Implement → Review → Done
```

| Role | Responsibility |
|------|----------------|
| **Claude** | Planning, synthesis, implementation (default) |
| **Codex** | Deep validation, security, logic verification, edge cases |
| **Gemini** | Creative review, alternatives, UX perspective, pattern analysis |

## CLI Patterns

| CLI | Command |
|-----|---------|
| Codex | `codex exec -m MODEL -c model_reasoning_effort=LEVEL -s read-only "prompt"` |
| Gemini | `gemini -m MODEL -p "prompt"` |

**Always use `timeout: 600000`** for all AI commands.

## Model & CLI References

**IMPORTANT**: For available models and CLI options, refer to the required skills:
- **Codex**: See `codex-plugin:codex-cli` skill for models, reasoning effort levels, and CLI options
- **Gemini**: See `gemini-plugin:gemini-cli` skill for models, output formats, and CLI options

When asking user for model selection in Phase 0, present options based on the current skill documentation.

## Phase 0: Pre-flight

```bash
mkdir -p .ai-orchestration
```

Ask user via `AskUserQuestion` with **4 questions**:

### Question 1: AI Participation Mode
**Header**: "Mode"
| Option | Description |
|--------|-------------|
| Triple-AI (default) | Full coverage: Claude + Codex + Gemini |
| Dual-AI: Codex-Claude | Security/logic focus |
| Dual-AI: Gemini-Claude | UX/creativity focus |

### Question 2: Role Assignment per Phase
**Header**: "Roles"
| Option | Description |
|--------|-------------|
| Standard | Claude: implement, Codex: validate, Gemini: review |
| Codex-Heavy | Claude: plan/synthesize, Codex: validate+implement review |
| Gemini-Heavy | Claude: plan/synthesize, Gemini: validate+implement review |
| Custom | User defines each phase assignment |

If **Custom** selected, ask follow-up:
| Phase | Options |
|-------|---------|
| Planning | Claude (default) / Codex / Gemini |
| First Validation | Codex / Gemini / Both (parallel) |
| Second Validation | Codex / Gemini / Skip (Dual-AI) |
| Implementation | Claude (default) / Codex-assisted / Gemini-assisted |
| Code Review | Codex / Gemini / Both (parallel) |

### Question 3: Model Selection
**Header**: "Models"

First, load the required skills to get current model lists:
1. Load `codex-plugin:codex-cli` → get Codex models and reasoning effort levels
2. Load `gemini-plugin:gemini-cli` → get Gemini models

Then present options:
| Option | Description |
|--------|-------------|
| High Power | Codex: [highest capability model] + xhigh reasoning, Gemini: [highest capability model] |
| Balanced (default) | Codex: [standard model] + high reasoning, Gemini: [stable pro model] |
| Fast | Codex: [mini model] + medium reasoning, Gemini: [flash model] |
| Custom | User specifies from available models in each skill |

### Question 4: Analysis Focus
**Header**: "Focus"
| Option | Description |
|--------|-------------|
| Balanced (default) | Equal weight to all aspects |
| Security | OWASP, auth, encryption, injection |
| Performance | Algorithms, memory, I/O, scaling |
| Architecture | Patterns, coupling, extensibility |

Save to `.ai-orchestration/config.md`:
```markdown
# AI Orchestration Config
## Mode: [selected mode]
## Roles
- Planning: [AI]
- Validation 1: [AI]
- Validation 2: [AI or Skip]
- Implementation: [AI]
- Code Review: [AI(s)]
## Models
- Codex: [model] (reasoning: [level])
- Gemini: [model]
## Focus: [focus area]
```

## Phase 1: Planning

**Executor**: Based on config (default: Claude)

Create `.ai-orchestration/plan.md`:

```markdown
# Implementation Plan
## Objective
## Approach
## Steps
## Risk Assessment
## Validation Focus Areas
```

**If Codex as planner:**
```bash
codex exec -m MODEL -c model_reasoning_effort=LEVEL -s read-only \
  "Create implementation plan for: [TASK]
   Output: Objective, Approach, Steps, Risk Assessment, Validation Focus"
```

**If Gemini as planner:**
```bash
gemini -m MODEL -p "Create implementation plan for: [TASK]
  Output: Objective, Approach, Steps, Risk Assessment, Validation Focus"
```

## Phase 2: First Validation

**Executor**: Based on config `Validation 1` setting

### If Codex validates:
```bash
codex exec -m MODEL -c model_reasoning_effort=LEVEL -s read-only \
  "Validate: $(cat .ai-orchestration/plan.md)
   Check: Logic, Security (OWASP), Performance, Edge Cases, Dependencies
   Output: Critical/Major/Minor Issues, Recommendations, Questions"
```
→ Save: `.ai-orchestration/phase2_codex_validation.md`

### If Gemini validates:
```bash
gemini -m MODEL -p "Review: $(cat .ai-orchestration/plan.md)
  Check: Alternatives, Patterns, User Impact, Maintainability, Blind Spots
  Output: Critical/Major/Minor Issues, Alternatives, Questions"
```
→ Save: `.ai-orchestration/phase2_gemini_validation.md`

### If Both validate (parallel):
Execute Codex and Gemini commands **in parallel**, save both outputs.

## Phase 3: Second Validation

**Executor**: Based on config `Validation 2` setting (Skip if Dual-AI or config says Skip)

### If Gemini reviews after Codex:
```bash
gemini -m MODEL -p "Review building on Codex:
  Plan: $(cat .ai-orchestration/plan.md)
  Codex findings: $(cat .ai-orchestration/phase2_codex_validation.md)
  Complement, don't repeat. Focus: Alternatives, User Impact, Blind Spots"
```
→ Save: `.ai-orchestration/phase3_gemini_review.md`

### If Codex reviews after Gemini:
```bash
codex exec -m MODEL -c model_reasoning_effort=LEVEL -s read-only \
  "Deep validation building on Gemini:
   Plan: $(cat .ai-orchestration/plan.md)
   Gemini findings: $(cat .ai-orchestration/phase2_gemini_validation.md)
   Validate alternatives, add Security/Edge Cases analysis"
```
→ Save: `.ai-orchestration/phase3_codex_review.md`

### If Both review (parallel after Phase 2):
Each AI reviews the plan independently, then cross-references in Phase 4.

## Phase 4: Synthesis

Read validation results. Create `.ai-orchestration/phase4_synthesis.md`:

```markdown
# Synthesis
## Consensus Points
## Divergence Analysis
## Prioritized Actions (P0/P1/P2)
## Revised Plan
## User Decisions Needed
```

For synthesis methodology: See [synthesis-guide.md](references/synthesis-guide.md)

Present to user via `AskUserQuestion`: Proceed / Address issues / Request more validation

## Phase 5: Implementation

**Executor**: Based on config `Implementation` setting (default: Claude)

### If Claude implements (default):
Claude implements per synthesized plan.

### If Codex-assisted implementation:
Use Codex for complex logic generation:
```bash
codex exec -m MODEL -c model_reasoning_effort=LEVEL -s workspace-write \
  "Implement based on synthesis:
   $(cat .ai-orchestration/phase4_synthesis.md)
   Focus: [specific component]"
```

### If Gemini-assisted implementation:
Use Gemini for creative/UX solutions:
```bash
gemini -m MODEL --approval-mode auto_edit -p \
  "Implement based on synthesis:
   $(cat .ai-orchestration/phase4_synthesis.md)
   Focus: [specific component]"
```

Save `.ai-orchestration/implementation.md`:

```markdown
# Implementation Summary
## Implemented By: [Claude/Claude+Codex/Claude+Gemini]
## Changes Made
## Issues Addressed
## Testing Notes
```

## Phase 6: Code Review

**Executor**: Based on config `Code Review` setting

| Config Setting | Reviewers |
|----------------|-----------|
| Codex | Codex only |
| Gemini | Gemini only |
| Both (parallel) | Codex + Gemini simultaneously |

### Codex Review (if configured):
```bash
codex exec -m MODEL -s read-only "Review implementation:
  Plan: $(cat .ai-orchestration/plan.md)
  Synthesis: $(cat .ai-orchestration/phase4_synthesis.md)
  Implementation: $(cat .ai-orchestration/implementation.md)
  Verify: Issues addressed? New issues? Overall PASS/FAIL"
```
→ Save: `.ai-orchestration/phase6a_codex_review.md`

### Gemini Review (if configured):
```bash
gemini -m MODEL -p "Review implementation:
  Plan: $(cat .ai-orchestration/plan.md)
  Synthesis: $(cat .ai-orchestration/phase4_synthesis.md)
  Implementation: $(cat .ai-orchestration/implementation.md)
  Verdict: APPROVE/REQUEST CHANGES/REJECT"
```
→ Save: `.ai-orchestration/phase6b_gemini_review.md`

### Both Review (parallel):
Execute both commands simultaneously, then combine verdicts.

## Phase 7: Final Assessment

- Both PASS/APPROVE → Complete
- FAIL/REJECT → Fix and re-validate
- REQUEST CHANGES → Apply and iterate

Save iterations to `.ai-orchestration/iterations.md`.

## Context Files

```
.ai-orchestration/
├── config.md
├── plan.md
├── phase2_*.md
├── phase3_*.md (Triple-AI only)
├── phase4_synthesis.md
├── implementation.md
├── phase6a_codex_review.md
├── phase6b_gemini_review.md
└── iterations.md
```

## Error Handling

| Error | Solution |
|-------|----------|
| `stdin is not a terminal` | Use `codex exec` |
| Empty Gemini output | Use `-p` flag |
| Not in Git repo | Use `--skip-git-repo-check` for Codex |

## References

- **Prompt Templates**: [prompt-templates.md](references/prompt-templates.md) - Detailed prompts for each focus area
- **Workflow Patterns**: [workflow-patterns.md](references/workflow-patterns.md) - Security-First, Architecture Decision, Rapid Iteration patterns
- **Synthesis Guide**: [synthesis-guide.md](references/synthesis-guide.md) - Divergence analysis, priority matrix, resolution patterns
