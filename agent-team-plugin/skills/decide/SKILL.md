---
name: decide
description: Use when a developer needs to choose between two or more approaches during implementation. Triggers on "A vs B?", "should I use X or Y?", "which approach is better?", "Redis or Memcached?", "REST or gRPC?", "single table or split?", or any binary/multi-option technical decision. Use this skill whenever the user is weighing alternatives mid-implementation — even if they don't say "decide", if they're comparing approaches, this skill applies.
---

# Quick Decision Support

Help developers make well-reasoned technical decisions fast by having two advocates argue the best case for each option, then synthesizing a fair comparison with a clear recommendation.

**Why this works:** When a developer considers "A vs B?", they tend to fixate on the first option they thought of or the one they're more familiar with. By having two independent advocates each build the strongest possible case for their side, the synthesis step gets genuinely balanced arguments to compare — not a biased pro/con list from a single perspective.

**Quality target:** Every decision must have a clear recommendation with concrete rationale tied to this specific codebase, not generic advice. The flip condition (when you'd choose differently) is as important as the recommendation itself.

## Phase 0: Parse the Decision

1. Extract the options from the user's request:
   - Clear binary: "Redis vs Memcached?" → A=Redis, B=Memcached
   - Implicit alternative: "should I use Redis here?" → A=Redis, B=ask what alternative they're considering
   - Multiple options (3+): Identify the 2 most viable candidates. Dismiss others with a 1-line reason each.

2. If the options are unclear or only one is stated, ask: "What's the alternative you're considering?" Do not proceed with a single option — the skill's value comes from contrast.

## Phase 1: Context Gathering

3. Quickly explore the relevant code (Glob, Grep, Read):
   - What does the code currently look like around the decision point?
   - Are there existing patterns in the codebase that favor one option?
   - What constraints exist (dependencies, performance requirements, team conventions)?

4. Build a **decision context** (under 800 tokens):
   - The specific decision point (file, function, or architectural boundary)
   - Existing codebase patterns relevant to this choice
   - Constraints that narrow the options

## Phase 2: Advocate Dispatch

5. **Dispatch 2 agents in a SINGLE response** using the Agent tool:

   **A-Advocate prompt:**
   > You are advocating for **[Option A]** in a technical decision. Another advocate is simultaneously arguing for the alternative. Your job is to build the **strongest possible case** for your option — not to be balanced, not to mention downsides, but to be a passionate, well-informed champion.
   >
   > **Your output must contain:**
   > 1. **Core argument** — Why this option is the right choice for THIS specific situation (not generic advantages). Reference the codebase context provided.
   > 2. **Concrete benefits** — 3-5 specific advantages, each tied to the current codebase, requirements, or constraints. Be specific: "pairs well with the existing `CacheService` in `src/services/cache.ts`" not "good performance".
   > 3. **Honest costs** — What does this option cost? (complexity, migration effort, learning curve, performance overhead, etc.) Acknowledge the real costs, then explain why they're worth paying. An advocate who hides costs is not credible — an advocate who acknowledges costs and explains why the benefits outweigh them is persuasive.
   > 4. **Implementation sketch** — How this option would look in practice. Key code patterns, file changes, or architecture decisions. Enough detail that someone could start implementing.
   > 5. **Success scenario** — What does the codebase look like 6 months from now if this option is chosen? What becomes easier?
   >
   > Do NOT critique the alternative. Focus on making the strongest case for YOUR option, including honest acknowledgment of its costs.
   >
   > You may use Read/Grep/Glob to explore the codebase. Do NOT edit any files.
   > Respond in the same language as the user's request.

   **B-Advocate prompt:** Same structure, advocating for Option B.

   Include the decision context in both prompts.

6. **Wait for both advocates to complete** before synthesis.

## Phase 3: Synthesis and Verdict

7. Read both advocate responses. Build a **comparison table** across these dimensions:

   | Dimension | Option A | Option B |
   |-----------|----------|----------|
   | Codebase fit | [how well it fits existing patterns] | [how well it fits] |
   | Implementation cost | [effort to implement] | [effort to implement] |
   | Long-term impact | [what becomes easier/harder] | [what becomes easier/harder] |
   | Risk | [what could go wrong] | [what could go wrong] |
   | [domain-specific dimension] | ... | ... |

   Add domain-specific dimensions as needed (e.g., "Latency" for a caching decision, "Type safety" for a language feature decision). Only include dimensions where the options meaningfully differ.

8. **Constraint Check** — Before making a recommendation, verify:
   - List every constraint the user mentioned or implied (performance, compatibility, team skill, deadline, etc.)
   - For each constraint, confirm which option satisfies it better
   - If any constraint is unaddressed by your analysis, investigate it before proceeding

9. **Make a recommendation:**
   - State which option you recommend and the 1-sentence core reason
   - **Confidence level:**
     - **Strong** — One option is clearly superior across most dimensions. Act on this.
     - **Moderate** — One option edges ahead, but reasonable people could disagree. The flip condition is important here.
     - **Weak** — Too close to call from available information. State what additional information would break the tie.
   - **Flip condition** — the specific circumstance under which you'd recommend the other option instead. This is not optional. Example: "Choose B instead if the dataset exceeds 10M rows, because A's in-memory approach won't scale past that."

10. **Write the verdict** in this format:

   ```
   ## Decision: [topic]

   **Recommendation:** [Option X]
   **Confidence:** [Strong / Moderate / Weak]
   **Core reason:** [1 sentence]

   | Dimension | Option A | Option B |
   |-----------|----------|----------|
   | ... | ... | ... |

   **Constraints verified:** [list each constraint + which option satisfies it]

   **Flip condition:** [When to choose the other option]

   **Implementation next step:** [The first concrete action to take]
   ```

11. Present to the user. Do not save to a file unless asked — decisions are lightweight and belong in the conversation.

## Handling Edge Cases

- **Options are not comparable** (different abstraction levels): Help the user reframe. "You're comparing a library (Redis) with a pattern (event sourcing) — these aren't alternatives. What specific problem are you solving?"
- **Clear winner from context alone**: If existing codebase patterns make one option obviously correct (e.g., the project already uses PostgreSQL everywhere, and the user asks "PostgreSQL vs MongoDB for this new table?"), skip advocate dispatch. State the recommendation directly with the codebase evidence. Reserve advocates for genuine trade-offs.
- **User provides additional context after verdict**: Update the recommendation if the new context changes the analysis. Don't re-run advocates — adjust the synthesis.
- **Neither option is good**: Say so. Propose a third option if one exists, or recommend the lesser of two evils with clear rationale.

## Logging & Pattern Protocol

> 참조: `${CLAUDE_PLUGIN_ROOT}/skills/_shared/logging-protocol.md`, `${CLAUDE_PLUGIN_ROOT}/skills/_shared/pattern-schema.md`

### 실행 시작 시
1. `.claude/agent-team/decide/logs/index.json`을 읽어 이전 실행 기록 확인 (없으면 디렉토리와 함께 `{"entries":[]}` 초기화)
2. `.claude/agent-team/decide/patterns/index.json`을 읽어 기존 패턴과 현재 입력 대조 (없으면 건너뜀)
3. 매칭 패턴이 있으면 해당 `.md`를 읽고 참고, `hitCount` +1

### 실행 완료 후
4. `.claude/agent-team/decide/logs/{timestamp}/result.json` 작성 (공통 필드 + decide 확장 필드: optionA, optionB, recommendation, confidence, shortcut)
5. `.claude/agent-team/decide/logs/{timestamp}/summary.md` 작성
6. `.claude/agent-team/decide/logs/index.json`에 entry 추가
7. 패턴 승격 조건 확인 — 워크플로우 문제(비교불가 옵션 미감지, Advocate 품질 저하 등)가 발견+해결되었으면 `.claude/agent-team/decide/patterns/`로 승격

## What This Skill Is NOT

- **Not a full implementation plan** — Use diverse-plan for that. decide answers "which approach?" not "how to build it?"
- **Not a code review** — Use da-review for that. decide evaluates options before implementation, not code after implementation.
- **Not for trivial decisions** — If the answer is obvious from codebase conventions (e.g., "tabs vs spaces" in a project with .editorconfig), just answer directly.
