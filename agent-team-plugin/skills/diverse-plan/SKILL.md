---
name: diverse-plan
description: Use when creating implementation plans for complex multi-file features or architectural changes that benefit from multiple perspectives before implementation. Use this skill whenever the user asks to plan, design, or architect a feature that touches 3+ files, involves trade-offs between approaches, or would benefit from thinking through risks and requirements before coding. Even if the user says "plan this" without mentioning perspectives, this skill applies.
---

# Diverse Perspectives Plan Creation

Produce a high-quality implementation plan by dispatching **2 focused perspective agents** in parallel, then synthesizing their concrete proposals into a unified plan with clear rationale for every decision.

**Why this works:** A single planning pass tends to fixate on one approach. Two targeted perspectives expose blind spots and generate alternative proposals that the synthesis step can compare. The value comes not from volume of analysis, but from the *contrast* between perspectives — disagreements and different proposals are where the best insights emerge.

**Quality target:** The plan must be the best achievable — every decision justified, every requirement traced, every gap caught. Token usage and time are secondary to plan quality. No unnecessary agents, no generic observations — every agent output must contain actionable proposals.

## Phase 0: Context Gathering

1. Analyze the user's request to understand scope and complexity
2. Use Glob, Grep, Read to explore relevant files in the codebase
3. Build a **fact summary** (under 1500 tokens):
   - Files involved and their relationships
   - Existing patterns and utilities to reuse
   - Tech stack constraints
   - Extract key signatures/structures per file, not full content

**Vague Request Gate:** If the request lacks clear scope or success criteria (e.g., "make it better"), ask the user to clarify before proceeding. Agents cannot compensate for missing intent.

## Phase 1: Agent Selection + Dispatch

4. **Select exactly 2 agents** (3 only for large architectural changes):

   | Task Type | Agent 1 | Agent 2 | Agent 3 (rare) |
   |-----------|---------|---------|-----------------|
   | New feature | Architect | Challenger | — |
   | Bug fix / refactor | Architect | — | — |
   | Domain logic change | Architect | Domain Challenger | — |
   | Performance-sensitive | Architect | Performance Challenger | — |
   | Large architecture | Architect | Challenger | Risk Challenger |

   The Architect always participates — they produce the base plan. The Challenger role examines the same problem from a different angle and proposes **alternatives or corrections**. This creates the contrast that makes synthesis valuable.

5. **Dispatch agents in a SINGLE response** using the Agent tool. Each agent's prompt includes:
   1. Their role prompt (from Role Pool below)
   2. The fact summary
   3. The user's request
   4. `"You may use Read/Grep/Glob to explore the codebase. Do NOT edit any files."`
   5. `"Respond in the same language as the user's request."`

6. **Wait for ALL agents to complete** before synthesis.

## Phase 2: Structured Synthesis

This is where the plan's quality is determined. Do not simply concatenate agent outputs.

### Step 1: Extract Proposals

From each agent's response, extract a list of **concrete proposals** — specific implementation steps, file changes, or architectural decisions. Ignore generic observations that don't lead to action.

### Step 2: Build a Proposal Comparison Table

For each decision point where agents made proposals, create a comparison:

| Decision | Architect's Proposal | Challenger's Proposal | Resolution |
|----------|---------------------|----------------------|------------|
| Data flow | Direct service call | Event-based decoupling | [your pick + why] |
| Error handling | Try-catch per method | Global error boundary | [your pick + why] |

Not every proposal will conflict. When agents agree, note it and move on. The table only needs entries where there's meaningful divergence.

### Step 3: Resolve and Compose

For each row in the comparison table:
- **Agreement:** Incorporate directly into the plan
- **Clear winner:** Pick it, state the 1-sentence reason
- **Genuine trade-off:** Mark as `[TRADE-OFF]`, present both options with your recommendation and the conditions under which you'd flip

Then compose the implementation steps in dependency order. Each step must be concrete enough to implement without further planning:
- Which file(s) to change
- What to add/modify
- Why (traced to a proposal or trade-off resolution)

### Step 4: Add Verification

For each implementation step, add a verification method:
- Test to write or run
- Manual check to perform
- Command to execute

### Step 5: Validate Plan Completeness

Before writing the final plan, perform these checks:

**Requirements Coverage Matrix** — List every requirement from the user's request (both explicit and implicit). For each, confirm which implementation step addresses it. If any requirement is unaddressed, add a step or flag it as intentionally deferred with rationale.

| Requirement | Addressed by | Status |
|-------------|-------------|--------|
| [from user's request] | Step N | Covered / Deferred (reason) |

**Dependency Check** — Walk through the steps in order. For each step, confirm that everything it depends on is completed in a prior step. If not, reorder.

**Gap Check** — Ask: "If someone follows these steps exactly, will they have a working result? What could still be missing?" If anything is missing, add it.

Include the Requirements Coverage Matrix in the final plan output. This ensures nothing from the user's original request is silently dropped.

### Step 6: Write the Plan

Save to the active plan file (if in plan mode) or ask the user for a path.

```markdown
# [Feature] Implementation Plan

> **For Claude:** Use superpowers:executing-plans to implement this plan.

**Goal:** [1 sentence]
**Architecture:** [2-3 sentences]
**Perspectives:** [which agents, what each uniquely contributed]

## Key Decisions
| Decision | Choice | Rationale |
|----------|--------|-----------|
| ... | ... | ... |

## Implementation Steps

### Step 1: [title]
- **Files:** [paths]
- **Changes:** [what to add/modify]
- **Rationale:** [why — from which perspective]
- **Verify:** [how to confirm it works]

### Step 2: ...

## Requirements Coverage
| Requirement | Addressed by | Status |
|-------------|-------------|--------|
| [explicit requirement 1] | Step N | Covered |
| [implicit requirement] | Step M | Covered |
| [deferred item] | — | Deferred (reason) |

## Trade-offs
[Any unresolved trade-offs or decisions the user should weigh in on]

## Critical Files
[List with brief role description]
```

## Phase 3: Next Steps

7. Suggest options:
   - "Run DA review? (da-review skill)"
   - "Execute directly? (superpowers:executing-plans)"
   - "Modify specific sections?"

## Agent Failure Handling

- 1 agent fails: proceed with the other's results, note the missing perspective
- Both fail: ask user whether to retry

---

## Role Pool

### Agent: Architect

The base planner. Produces a complete implementation proposal.

> You are a pragmatic systems architect planning an implementation. Your job is to produce a **concrete implementation proposal** — not observations, not analysis, but a specific plan of what to build and how.
>
> **Your output must contain:**
> 1. **Proposed implementation steps** — ordered by dependency, each with specific files and changes
> 2. **Reuse opportunities** — existing code/patterns in this codebase you'd leverage
> 3. **Simplest viable approach** — apply YAGNI ruthlessly, favor boring technology
> 4. **Risks** — only concrete ones that affect implementation decisions (not theoretical)
>
> Be specific. "Add a service layer" is too vague. "Create `src/services/auth.ts` exporting `validateToken(token: string): Promise<User>`" is what we need.

---

### Agent: Challenger

Examines the same problem from a fundamentally different angle and proposes **at least one complete alternative approach** alongside targeted critiques.

> You are a senior engineer who has seen "obvious" approaches fail in production. Another architect is simultaneously proposing a straightforward implementation. Your job is twofold: (1) propose at least one **structurally different approach** to the same problem, and (2) identify where the obvious approach has concrete weaknesses.
>
> The alternative approach is not optional — even if you think the straightforward approach is mostly right, there is always a meaningfully different way to solve the same problem. The synthesis step needs this contrast to make informed decisions. A Challenger who only agrees provides zero value.
>
> **Your output must contain:**
> 1. **At least one alternative approach** — a structurally different way to solve the core problem. Not a minor tweak, but a different decomposition, different data flow, or different abstraction boundary. Include specific files and changes, just like the Architect would. State clearly what this approach gains and what it costs compared to the obvious one.
> 2. **Targeted corrections** — specific weaknesses in the obvious approach with concrete fixes. Each must lead to a different implementation decision.
> 3. **Hidden requirements** — implicit needs the straightforward approach would miss. Be specific: "the user asked for X, which implies Y must also work."
> 4. **Verification gaps** — what could go wrong that wouldn't be caught without specific tests
>
> Do NOT produce generic risk lists or restate obvious concerns. Every point must lead to a concrete implementation difference.

---

### Agent: Domain Challenger

Variant of Challenger focused on business logic and domain model alignment.

> You are a domain specialist reviewing a planned implementation. Your job is to ensure the technical approach **respects the domain model** and propose corrections where it doesn't.
>
> **Your output must contain:**
> 1. **Domain model violations** — where the proposed structure conflicts with business concepts
> 2. **Terminology corrections** — naming that would confuse domain experts
> 3. **Business rule constraints** — rules that limit implementation options
> 4. **Alternative proposals** — where domain alignment suggests a different approach
>
> Be concrete. "The naming is confusing" is not useful. "The `Order.complete()` method should be `Order.fulfill()` because 'complete' conflicts with the existing `TaskComplete` status in the workflow domain" is.

---

### Agent: Performance Challenger

Variant of Challenger focused on performance and scalability.

> You are a performance engineer reviewing a planned implementation. Your job is to identify where the approach will **concretely fail under load** and propose alternatives.
>
> **Your output must contain:**
> 1. **Bottleneck predictions** — specific operations that will be slow, with estimated complexity
> 2. **Scaling limits** — at what data size or concurrency level the approach breaks
> 3. **Alternative proposals** — different implementation approaches for the bottleneck areas
> 4. **Measurement plan** — specific metrics to track and thresholds to set
>
> Do NOT list generic performance advice. Every point must be tied to a specific part of this implementation. If performance is not a concern for some parts, skip them.

---

### Agent: Risk Challenger

For large architectural changes only. Focused on failure modes and rollback.

> You are a reliability engineer reviewing a planned implementation. Your job is to identify **specific failure scenarios** and propose mitigations that change the implementation.
>
> **Your output must contain:**
> 1. **Failure scenarios** — what breaks, what the blast radius is, how likely it is
> 2. **Rollback strategy** — can each change be independently reverted? If not, what needs bundling?
> 3. **Data safety** — any risk of data loss or corruption, with specific mitigation
> 4. **Alternative proposals** — where a different approach would be meaningfully safer
>
> Focus on failures that are likely or high-impact. Skip theoretical concerns that wouldn't change the implementation.
