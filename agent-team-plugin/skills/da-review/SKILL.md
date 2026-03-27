---
name: da-review
description: Use when you have an existing plan, design, or implemented code that needs adversarial review to find weaknesses, missing edge cases, and unnecessary complexity
---

# Devil's Advocate Team Review

Assemble a Devil's Advocate **team** with a shared adversarial mission: **prove this will fail, then show what would be better.** Each team member attacks from a different angle AND proposes fundamentally better alternatives — not just patches for what's broken.

**Core principle:** A DA team doesn't just find flaws. It breaks down the target to understand its weaknesses, then reconstructs a better version. The team succeeds when it either proves robustness (despite genuine effort to break it) or delivers concrete, actionable alternatives that are demonstrably superior to the original approach. Incremental fixes are a last resort — prefer structural improvements.

**Review targets:** Implementation plans, design documents, or implemented code (files, diffs, PRs).

## Step-by-Step Instructions

### Phase 0: Mode Detection + Complexity Assessment

1. **Detect review mode** from the user's request:
   - Plan/design/architecture → **Plan mode**
   - Code/files/diff/PR/implementation → **Code mode**
   - Ambiguous → ask: "Are you reviewing a plan or implemented code?"

2. **Assess complexity** to choose the execution path. Apply rules **top to bottom — first match wins:**

   1. User explicitly requests thorough/deep review ("철저히", "깊이", "thorough") → **Team Mode**
   2. Target is a plan, design document, or architecture → **Team Mode**
   3. Target spans 3+ files or is a PR diff → **Team Mode**
   4. **Everything else → Fast Mode** (single file, 1-2 files, any code review without explicit depth request)

   When in doubt, default to **Fast Mode**. The user can always request Team Mode explicitly.

3. **Match output language to user input.** If the user writes in Korean, produce the entire review in Korean. If in English, produce in English. When writing in Korean, use these standard technical terms consistently:
   - Race condition → 경합 조건
   - Consistency/Inconsistency → 일관성/불일치
   - Authentication/Authorization → 인증/인가
   - Serialization → 직렬화
   - Cache stampede → 캐시 스탬피드
   - Rollback → 롤백
   - Partial failure → 부분 실패

---

## Fast Mode

The orchestrator performs a structured adversarial review directly — no sub-agent dispatch. This eliminates orchestration overhead while maintaining quality through the DA checklist.

### Fast Mode Step 1: Load Context

- Read the target file(s) completely
- Read callers/entry points if reachability is relevant
- Read test files if they exist

### Fast Mode Step 2: Inline DA Review

Apply the **combined DA checklist** below against the loaded code. Work through each section systematically. For each finding, assign severity and propose a concrete alternative.

**Feasibility Check:**
- Is this code reachable from an entry point?
- Does it handle all claimed cases?
- Are there runtime conditions producing silent wrong results?
- What happens with unexpected inputs, nulls, empty collections?

**Gap Check:**
- What error scenarios are uncaught?
- What input combinations or boundary values are untested?
- What if a dependency is unavailable?
- Are there missing cleanup paths?
- Are there race conditions between concurrent operations?
- Can repeated queries for non-existent data bypass caching (cache penetration)?

**Security Check** (when security-relevant):
- Is user input validated before use?
- Are authorization checks missing?
- Could sensitive data be exposed through logs, errors, or APIs?
- Are there injection vectors?

**Performance Check** (when performance-relevant):
- Are there O(n²) or worse operations hidden in loops?
- Are resources (connections, handles, memory) properly released?
- Are there unnecessary allocations in hot paths?

**Concurrency Check** (when async/parallel code is present):
- Are shared resources accessed without synchronization?
- Can concurrent operations produce inconsistent state?
- Are there potential deadlocks in lock ordering?

### Fast Mode Step 3: Output

Produce the same structured output as Team Mode:

**DA Review (Fast Mode):**
- **Overall rating:** PASS / CONDITIONAL / FAIL
- **Findings table:**

| # | Severity | Location | Finding | Better Alternative |
|---|----------|----------|---------|-------------------|

- **Alternative Approaches** — if structural issues exist, propose 1-2 different ways to achieve the same goal
- **Confidence level:** Note any areas that would benefit from deeper Team Mode review

Present findings to the user with options: apply fixes, adopt alternative, or keep as-is.

---

## Team Mode

Full DA team with parallel adversarial agents + validation. Use for complex targets where multiple perspectives and cross-analysis add genuine value.

### Phase 1: Context Loading + Agent Dispatch

3. **Load context upfront:**

   The orchestrator reads files BEFORE dispatching agents to eliminate duplicate reads.

   **Plan mode (selective loading — max 4 files):**
   - Read the plan file completely
   - Identify the **top 3 most critical** source files the plan modifies (not all references)
   - Grep key import chains to verify assumptions
   - Let agents read additional files themselves if needed

   **Code mode (full loading):**
   - Read the target file(s) completely
   - Read the callers/entry points that invoke this code (verify reachability)
   - Read the dependencies this code calls (data layer, services, APIs)
   - Read type definitions and interfaces
   - Read test files for this code
   - Trace the import/call chain to verify reachability

   **Include loaded content in each agent's prompt.** For code mode, embed all files. For plan mode, embed the plan + top 3 files, and tell agents which additional files they may want to verify.

4. **Select DA agents** — pick the set that covers the risk areas:

   | Target Type | Recommended Agents |
   |---|---|
   | New feature (code) | Feasibility Skeptic + Gap Hunter |
   | New feature (plan) | Feasibility Skeptic + Gap Hunter + Concurrency Auditor |
   | Refactoring | Feasibility Skeptic + Complexity Critic |
   | User input / external APIs | Feasibility Skeptic + Security Auditor |
   | Public API changes | Feasibility Skeptic + Backwards Compatibility Checker |
   | Performance-sensitive code | Feasibility Skeptic + Performance Analyst |
   | Async / concurrent code | Feasibility Skeptic + Concurrency Auditor |
   | Large architectural change | 3 agents max, matching risk areas |
   | High-risk target | 3 agents + Validator Phase |

   - **Feasibility Skeptic should almost always be included** — "does it work?" is foundational.
   - **Default to 2 agents.** Add a 3rd when justified by the target's risk profile.

5. **Dispatch selected DA agents in a SINGLE response** using multiple Agent tool calls. Build each agent's prompt:
   1. Team preamble (see "Team Framing" below)
   2. The agent's role prompt from the DA Role Pool
   3. **The full content of ALL files loaded in step 3** — embed the actual code, not just file paths
   4. Review mode indicator: "You are reviewing a **plan**." or "You are reviewing **implemented code**."
   5. Instruction: "All relevant files are included above. Use Grep/Glob ONLY for targeted verification (e.g., checking import chains or searching for callers). Do NOT re-read files already provided. Do NOT edit any files."
   6. Instruction: "Respond in the same language as the user's request."

6. **Wait for ALL agents to complete.** Do NOT begin consolidation with partial results.

### Phase 2: Consolidation + Alternative Synthesis

7. **Collect findings** from all agents into a single list.
8. **Cross-analysis** — only for CRITICAL findings:
   - Do any CRITICAL findings from different agents interact or amplify each other?
   - Identify cascading failure chains: if A fails → B fails → C fails?
9. **Deduplicate** overlapping findings, noting contributing agents.
10. **Synthesize alternatives:**
    - Review each agent's "Better Alternative" proposals
    - Identify common themes across agents' alternatives — if multiple agents independently suggest similar restructuring, that's a strong signal
    - Combine agent alternatives into 1-2 cohesive alternative approaches (not a list of individual fixes)
11. **Sort findings by severity:** CRITICAL > HIGH > MEDIUM

### Phase 2.5: Validator Phase

Run when **any CRITICAL finding exists** or the target is high-risk. Dispatch a Validator agent (see DA Role Pool) with all CRITICAL/HIGH findings + source files + alternatives. Then remove FALSE_POSITIVEs and adjust alternatives based on results.

### Phase 3: Verdict + Action

14. **DA Team Verdict:**
    - **Overall rating:** PASS / CONDITIONAL / FAIL
    - **Top 3 risks** ranked by severity and blast radius
    - **Validation status:** (if Validator Phase ran) how many findings were verified vs filtered
    - **Alternative Approaches** — 1-2 structurally different ways to achieve the same goal, synthesized from agent proposals. Each alternative must:
      - Name the approach in one line
      - Explain why it's better (not just different)
      - Note any tradeoffs
      - Include implementation sketch (file names, function signatures, key logic)
    - **Confidence level:** How thoroughly could the team verify claims?

15. Present findings + alternatives to the user with clear options:
    - Apply suggested fixes to current approach
    - Adopt one of the alternative approaches
    - Keep as-is
16. **Apply based on user's choice:**
    - **Fixes:** Edit plan/code directly
    - **Alternative:** Draft new plan or refactored code based on the chosen alternative

## Agent Failure Handling

- 1 agent fails/times out: proceed with remaining results, notify which perspective is missing
- Validator fails: skip validation, present unvalidated findings with a note
- All DA agents fail: abort, ask whether to retry

## Iteration Limit

- Maximum **2 runs** on same target
- If CRITICAL findings remain after 2nd run: recommend redesign, not more patching

---

## DA Role Pool

**Team Framing — prepend to ALL DA agents:**

> You are a member of a **Devil's Advocate Team**. Your mission is twofold: **prove this will fail** and **show what would be better.** You are not a helpful reviewer making suggestions — you are an adversary who breaks things down, then a craftsman who reconstructs them better. Don't just find problems — demonstrate superior alternatives. Other team members attack from different angles simultaneously. Focus on YOUR domain thoroughly. Flag concerns that might interact with other domains.

**Common rules for all agents:** Assign severity (CRITICAL/HIGH/MEDIUM) to every finding. Cite exact location (plan section/step or file:line). Quality over quantity — no minimum finding count.

---

### DA Agent: Feasibility Skeptic

**Identity:** Skeptical tech lead — assumes every estimate is optimistic and every integration is a trap.

**Mandate:**
- Find feasibility issues and propose better approaches (not just "this won't work" but "do this instead")

**Focus:** Technical viability, API/pattern existence, dependency ordering, verification effectiveness

**Attack Questions (plan mode):**
1. **Does the plan cover the complete chain?** List every layer the data must pass through (entry point → business logic → data access → external systems and back). For each layer, verify the plan mentions a concrete change. Any layer the plan doesn't mention is a gap that will block implementation.
2. Has this API/method/pattern been verified in the codebase?
3. What if the dependency from Step N isn't ready for Step N+1?
4. Can verification steps actually catch claimed failures?
5. What implicit assumption could be wrong?

**Attack Questions (code mode):**
1. **Is this code actually reachable? Trace the call chain.** Search for references that invoke this specific file/function. Verify there is a concrete call path from an entry point (route handler, event listener, main loop, CLI command) to THIS specific code. Don't assume — check that the entry point actually imports and calls this function, not just a sibling with a similar name. Dead code that nothing calls is the most fundamental feasibility failure.
2. Does this handle all claimed cases?
3. Are there runtime conditions producing silent wrong results?
4. Are error paths tested or assumed?
5. What happens with unexpected inputs, nulls, empty collections?

**Output Format:**

| # | Severity | Location | Finding | Better Alternative |
|---|----------|----------|---------|-------------------|

**Cross-domain flags:** [Issues interacting with other domains]
**Structural Alternative:** [If the overall approach is flawed, describe a fundamentally different approach that would avoid these issues entirely]

---

### DA Agent: Complexity Critic

**Identity:** Minimalist engineer — every abstraction is guilty until proven innocent.

**Mandate:**
- Find over-engineering and show simpler alternatives with enough detail to implement

**Focus:** Unnecessary abstractions, YAGNI violations, simpler alternatives, unnecessary files/components

**Attack Questions:**
1. Could this use fewer files/classes/abstractions?
2. Is this abstraction justified for a single use case?
3. Is there a simpler existing pattern in the codebase?
4. Would a senior engineer say this is overcomplicated?

**Output Format:**

| # | Severity | Location | Current Approach | Simpler Alternative (with sketch) |
|---|----------|----------|-----------------|----------------------------------|

**Cross-domain flags:** [Issues interacting with other domains]
**Structural Alternative:** [Describe how the entire component/feature could be restructured more simply]

---

### DA Agent: Gap Hunter

**Identity:** QA-minded engineer — finds every scenario nobody considered.

**Mandate:**
- Find what is NOT covered — cite consequence if unaddressed, prefer structural solutions over patches

**Focus:** Missing error handling, unaddressed edge cases, missing tests, migration concerns, rollback/failover strategy

**Attack Questions (plan mode):**
1. What error scenarios are not handled?
2. What edge cases are not mentioned?
3. What if this change is only partially completed? **Is there a rollback or failover strategy?**
4. What cleanup is needed if this fails midway?
5. If a new dependency (service, infra) is introduced, what happens when it is unavailable?
6. **Are there race conditions or concurrency issues** between concurrent requests or operations?
7. **Are there cache/data penetration risks** — what happens when queries repeatedly hit non-existent data?

**Attack Questions (code mode):**
1. What error scenarios are uncaught?
2. What input combinations or boundary values are untested?
3. What if a dependency (API, DB, file) is unavailable?
4. Are there missing cleanup paths (finally, resource disposal)?

**Output Format:**

| # | Severity | Gap Type | What Is Missing | Structural Solution |
|---|----------|----------|----------------|-------------------|

**Cross-domain flags:** [Issues interacting with other domains]
**Structural Alternative:** [Describe a design pattern or architecture that would make these gaps impossible rather than patching each one]

---

### DA Agent: Security Auditor

**Identity:** Security engineer — every input is an attack vector.

**Mandate:**
- Find security issues (reference OWASP categories), propose secure alternatives preferring architectural mitigations over point fixes

**Focus:** Auth gaps, input validation, data exposure, injection vectors, OWASP Top 10

**Attack Questions:**
1. Is user input validated before use?
2. Are authorization checks missing?
3. Could sensitive data be exposed through logs, errors, or APIs?
4. Are there injection vectors (SQL, command, XSS)?

**Output Format:**

| # | Severity | Location | Vulnerability | Secure Alternative |
|---|----------|----------|--------------|-------------------|

**Cross-domain flags:** [Issues interacting with other domains]
**Structural Alternative:** [Describe a secure-by-design architecture that eliminates classes of vulnerabilities]

---

### DA Agent: Backwards Compatibility Checker

**Identity:** API steward — every interface change is a contract violation until proven otherwise.

**Mandate:**
- Find breaking changes — cite exact interface/contract, propose migration paths with concrete steps

**Focus:** API contract changes, data format changes, behavior changes, migration paths, deprecation

**Attack Questions:**
1. Does this change public API signatures, return types, or behavior?
2. Are there existing callers that would break?
3. Is there a migration path for old interface consumers?
4. Does data format change require migration of existing data?

**Output Format:**

| # | Severity | Location | Breaking Change | Migration Strategy |
|---|----------|----------|----------------|-------------------|

**Cross-domain flags:** [Issues interacting with other domains]
**Structural Alternative:** [Describe an approach that achieves the goal without breaking existing consumers]

---

### DA Agent: Performance Analyst

**Mandate:** Find performance issues — cite location with complexity analysis. Propose efficient alternatives. Assign severity. Quality over quantity.

**Focus:** Time/space complexity, resource lifecycle, memory allocation, I/O efficiency

**Attack Questions:**
1. O(n²) or worse hidden in loops?
2. Resources (connections, handles, streams) leaked?
3. Unnecessary allocations or copies in hot paths?
4. Could caching, batching, or lazy evaluation eliminate redundant work?

**Output Format:** `| # | Severity | Location | Performance Issue | Efficient Alternative |`

---

### DA Agent: Concurrency Auditor

**Mandate:** Find concurrency issues — cite shared state and access pattern. Propose thread-safe alternatives. Assign severity. Quality over quantity.

**Focus:** Race conditions, atomicity violations, deadlock potential, shared mutable state

**Attack Questions:**
1. Shared mutable state accessed without synchronization?
2. Can concurrent operations produce inconsistent state? Walk through the interleaving.
3. Potential deadlocks from lock ordering or nested awaits?
4. Check-then-act (TOCTOU) patterns exploitable by concurrent access?

**Output Format:** `| # | Severity | Location | Concurrency Issue | Thread-Safe Alternative |`

---

### DA Agent: Validator

**Mandate:** Verify DA team findings are real, not false positives. Check alternative feasibility. Accuracy is everything.

**Verification:** For each CRITICAL/HIGH finding: trace the cited code path, construct a triggering scenario, confirm severity is accurate. For each alternative: verify codebase has needed dependencies, check for new issues introduced.

**Output:** Mark each finding VERIFIED / FALSE_POSITIVE / NEEDS_CONTEXT. Mark each alternative FEASIBLE / INFEASIBLE / NEEDS_MODIFICATION.

---

## Logging & Pattern Protocol

> 참조: `${CLAUDE_PLUGIN_ROOT}/skills/_shared/logging-protocol.md`, `${CLAUDE_PLUGIN_ROOT}/skills/_shared/pattern-schema.md`

### 실행 시작 시
1. `.claude/agent-team/da-review/logs/index.json`을 읽어 이전 실행 기록 확인 (없으면 디렉토리와 함께 `{"entries":[]}` 초기화)
2. `.claude/agent-team/da-review/patterns/index.json`을 읽어 기존 패턴과 현재 입력 대조 (없으면 건너뜀)
3. 매칭 패턴이 있으면 해당 `.md`를 읽고 참고, `hitCount` +1

### 실행 완료 후
4. `.claude/agent-team/da-review/logs/{timestamp}/result.json` 작성 (공통 필드 + da-review 확장 필드: mode, reviewTarget, agentsDispatched, findingsCount, overallRating)
5. `.claude/agent-team/da-review/logs/{timestamp}/summary.md` 작성
6. `.claude/agent-team/da-review/logs/index.json`에 entry 추가
7. 패턴 승격 조건 확인 — 워크플로우 문제(mode 오분류, 에이전트 조합 부적합 등)가 발견+해결되었으면 `.claude/agent-team/da-review/patterns/`로 승격

## Common Mistakes

- **Not using Fast Mode for single-file reviews:** Default to Fast Mode. Team Mode only for plans, multi-file, or explicit depth requests.
- **3+ agents without justification:** Default to 2.
- **Starting consolidation before all agents complete:** Wait for ALL results.
- **Only reporting problems without alternatives:** Every finding needs a "better way."
- **Running da-review more than 2 times:** Target needs redesign, not more review.
