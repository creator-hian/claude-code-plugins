# secret-safe-diagnostics — Trigger Optimization Run Log

**Purpose**: execute Option ㄴ (Claude-as-mutator, fully `claude -p`-based — no Anthropic SDK, no API key) and capture enough structured observations to later build Option ㄱ (a standalone `trigger_opt.py` script that replaces `improve_description.py`'s SDK calls with `claude -p` subprocess calls).

This file is both the run journal for today and the specification input for the ㄱ implementation.

---

## Run configuration

- **Target skill**: `C:/_dev/claude-code-plugins/secret-guard-plugin/skills/secret-safe-diagnostics`
- **Model**: `claude-opus-4-7` (Claude Code subscription, no API key)
- **Eval set**: 20 queries (10 should-trigger + 10 should-not-trigger) — see `trigger-eval.json`
- **Runs per query**: 3 (for variance-aware trigger rate)
- **Workers**: 10 (run_eval default)
- **Train/test split**: none at baseline; applied only when comparing mutations (holdout=0.4 recommended per skill-creator defaults)
- **Budget**: max 2 mutations tested. Each mutation costs one full re-eval (~5–15 min).

## Phase plan

1. **Baseline** — run `scripts/run_eval.py` on current L1 description, capture trigger rates per query.
2. **Analyze failures** — identify should-trigger queries that under-triggered and should-not-trigger queries that over-triggered.
3. **Mutation #1** — draft one focused description change, re-eval.
4. **Mutation #2 (if #1 shows promise)** — tighten further or explore a different axis.
5. **Select** — compare baseline vs. mutations on test subset. If best > baseline, apply to SKILL.md frontmatter. Otherwise keep original.
6. **Retrospective** — write the ㄱ spec section below.

---

## Baseline results (2026-04-23)

| Metric | Value |
|--------|-------|
| Overall trigger rate (should-trigger, 10 queries × 3 runs) | **0.00** |
| Overall trigger rate (should-not-trigger, 10 queries × 3 runs) | **0.00** |
| Summary | passed=10, failed=10 (all "passes" are should-not-trigger correctly not triggering; all "failures" are should-trigger not triggering) |

**Every single eval run produced 0 tool_use events.** Nothing triggered. Ever.

### Failure inventory

- **False negatives** (should-trigger but under-triggered): **10/10** — every should-trigger query.
- **False positives** (should-not-trigger but over-triggered): **0/10** — vacuously perfect.

### Root-cause analysis

`run_eval.py` does not test skill-discovery the way plugin-marketplace skills are actually discovered. It:

1. Registers the skill description as a **slash command** at `.claude/commands/<name>-skill-<uuid>.md` in the project root.
2. Runs `claude -p <query>` and streams `content_block_start` events, treating a `tool_use` with name `Skill` or `Read` as a "trigger".

Neither step models how Claude actually picks a plugin skill from its `available_skills` list during normal chat. A query that matches a skill's description perfectly can still receive a direct answer from the model (no tool_use event), because the model can handle it on its own — exactly the caveat skill-creator's own docs flag: *"Claude only consults skills for tasks it can't easily handle on its own."*

Our eval queries are all things Claude can answer inline ("tell me a safe presence-check idiom for $TOKEN"). There is no necessary tool call, so nothing triggers, so `run_eval` reports 0.

Therefore **this metric is not measuring what we wanted it to measure**. Mutating the description to change it would be hill-climbing against a dead signal.

---

## Mutation log

**Skipped.** Mutations would chase noise against an always-zero baseline. The harness cannot distinguish "good description" from "bad description" in this configuration.

---

## Final decision

- **Original description score** (under this harness): 0.00 / 0.00 (recall / FP-rate)
- **Mutation score**: not run
- **Action**: **keep original SKILL.md**. No improvement claim possible from this experiment.
- **Committed SHA**: n/a — no skill file was modified.

---

## Future ㄱ implementation spec (retrospective, populated after run)

Use this section as the spec for a standalone `trigger_opt.py` that replaces `scripts/improve_description.py`'s `anthropic.Anthropic()` calls with `claude -p` subprocess calls. Goal: reproducible, unattended trigger-accuracy optimization without an API key.

### Confirmed working building blocks
- `scripts/run_eval.py` is already `claude -p`–based and reusable as a library (`from scripts.run_eval import run_eval`).
- `scripts/utils.py::parse_skill_md` cleanly splits YAML frontmatter from body — reuse for safe description rewriting.
- `find_project_root()` walks up from cwd looking for `.claude/` — `cwd` must therefore point at a repo that has one (validated: `C:/_dev/claude-code-plugins` does).

### What needs replacing
- `scripts/improve_description.py` lines 114, 151, 219: `anthropic.Anthropic().messages.create(...)` calls. These produce `<new_description>...</new_description>` via Claude.
- Replacement: `subprocess.run(["claude", "-p", prompt, "--model", model, "--output-format", "text"], env=env_without_CLAUDECODE, timeout=300, capture_output=True, text=True)` — parse the same `<new_description>` tag out of stdout.
- Retain the ≤1024-char "shorten" retry path that improve_description.py already has; it just needs the same subprocess wrapper.

### Mutation prompt template (draft — finalized after today's run)

```
You are tuning the `description:` frontmatter field of a Claude Code skill so that
it triggers reliably on the right user queries and doesn't trigger on adjacent ones.

Current description:
<current_description>
{current}
</current_description>

Eval results (trigger rate = fraction of runs where Claude invoked the skill):

FALSE NEGATIVES (should have triggered, did not):
{list of queries with their trigger rates}

FALSE POSITIVES (should not have triggered, did):
{list of queries with their trigger rates}

Constraints (MUST PRESERVE):
- Security-domain skill; under-triggering is strictly worse than over-triggering.
- The description must stay under 1024 characters.
- Preserve the current recall bias — do not shrink the description purely to raise precision.
- Do not reference sibling hook rule ids (they are coupled to separate files).

Propose ONE improved description that addresses the specific failure patterns above.
Respond with only the new description inside <new_description>...</new_description> tags.
```

### Parsing & validation

- Regex: `<new_description>(.+?)</new_description>` with `re.DOTALL`. Strip leading/trailing whitespace.
- Reject if: empty, > 1024 chars, contains fenced code blocks, loses any of the current trigger nouns (token / credential / secret / API key / PAT / env var). Fallback to previous description on reject.

### Confirmed gotchas (from actual run)

- **Windows + Korean locale** (`cp949` default codec in Python 3.14.3): `run_eval.py` line 272 calls `Path(args.eval_set).read_text()` without specifying encoding. UTF-8 characters in the eval JSON (em-dash, quotes, …) raise `UnicodeDecodeError: 'cp949' codec can't decode byte 0xe2`. **Workaround:** set `PYTHONUTF8=1` (and `PYTHONIOENCODING=utf-8` defensively) in the subprocess env. ㄱ should either inherit these, set them itself, or pass explicit `encoding="utf-8"` when loading JSON via its own code path.
- Invocation shape that works: `cwd=<repo-with-.claude>`, `PYTHONPATH=<skill-creator-root>`, `PYTHONUTF8=1 PYTHONIOENCODING=utf-8 python -m scripts.run_eval …`.

### Harness-level limitation discovered today — ㄱ MUST address this

`scripts/run_eval.py` does not measure what we think it measures. It registers the skill description as a **project-local slash command** at `.claude/commands/<name>-skill-<uuid>.md`, then checks whether `claude -p` emits a `tool_use` event with `name=Skill` or `name=Read` for each eval query. For plugin-marketplace-installed skills, that is the wrong trigger surface:

- Plugin skills appear in Claude's `available_skills` list by a different path; they are not slash commands.
- Even when the description perfectly matches a query's intent, Claude frequently answers inline — no `Skill` or `Read` tool_use, no signal — especially for "how-to" queries the model can satisfy without consulting the skill body.
- Observed consequence today: **every one of the 20 eval runs reported `trigger_rate: 0.0`**, should-trigger and should-not-trigger alike. The metric cannot distinguish "great description" from "terrible description".

Therefore ㄱ cannot be a thin wrapper around `run_eval.py`'s current behavior. At least one of the following is required:

1. **New triggering signal.** Instead of watching for `tool_use(Skill|Read)`, inject the skill's description into `claude -p` via `--append-system-prompt` as "you have an optional skill with this description; if and only if the user's task would benefit, begin your reply with `[SKILL_CONSULTED: <name>]` on its own line". Then grep the final assistant message (not the stream) for that token. This decouples from slash-command semantics entirely and exercises the same decision the model makes when looking at `available_skills`.
2. **Harder eval queries.** Re-author queries so they actually require the skill body to answer well (e.g. multi-step tasks, file-path-bearing prompts that need the provider-specific tables in `references/credential-provider-map.md`). Even the new signal above needs queries substantive enough that ignoring the skill visibly degrades the answer.
3. **Qualitative grading fallback.** When the binary trigger signal is silent, spawn a second `claude -p` as a grader: "Given the user prompt and the assistant's answer, rate 0-1 whether this answer applied the skill's rules." Slower, but correlates with real utility.

ㄱ should ship with (1) as default and (3) available via flag. (2) is an eval-authoring guideline, not code.

### Also confirmed today

- 20 queries × 3 runs with `num_workers=10` completed in well under 5 minutes wall time — parallelism works cleanly.
- No rate-limit errors observed.
- `find_project_root()` picked up `C:/_dev/claude-code-plugins/.claude/` as expected; the temporary `.claude/commands/*-skill-*.md` files did need to be cleaned up after (check future runs whether `run_eval.py` removes them — if not, ㄱ should).

### Recommended next step (out of today's scope)

Before running any optimization loop again, build a small probe that verifies the triggering signal is actually alive against a skill known to be triggerable from a plugin-marketplace install. If even that fails, option (1) above is mandatory; ㄱ should not ship without it.
