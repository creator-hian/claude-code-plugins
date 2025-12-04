# AI Orchestration Feedback Loop - Validation

## Prerequisites

| Check | Command | Expected |
|-------|---------|----------|
| Codex CLI | `codex --version` | Version output |
| Gemini CLI | `gemini --version` | Version output |
| Git | `git --version` | Version output |

## Phase Validation Checklist

### Phase 0: Pre-flight
- [ ] `.ai-orchestration/` directory created
- [ ] User mode preference collected (Triple-AI / Dual-AI)
- [ ] Configuration saved to `.ai-orchestration/config.md`

### Phase 1: Planning
- [ ] Plan saved to `.ai-orchestration/plan.md`
- [ ] Includes: Objective, Approach, Steps, Risks, Validation Focus

### Phase 2-3: Validation
- [ ] Commands use `codex exec` (not bare `codex`)
- [ ] Gemini commands use `-p` flag
- [ ] Timeout set to 600000
- [ ] Outputs saved to `.ai-orchestration/phase2_*.md`, `phase3_*.md`

### Phase 4: Synthesis
- [ ] Both validations read
- [ ] Consensus/divergence identified
- [ ] User consulted on unresolved items
- [ ] Saved to `.ai-orchestration/phase4_synthesis.md`

### Phase 5-6: Implementation & Review
- [ ] Implementation summary saved
- [ ] Reviews completed per mode
- [ ] Clear PASS/FAIL or APPROVE/REJECT verdict

### Phase 7: Final
- [ ] Iteration triggered if needed
- [ ] Final report generated

## Test Scenarios

### Scenario 1: Happy Path
**Input**: Simple feature request
**Expected**: Clean execution, both AIs approve, no iteration

### Scenario 2: Security Issue Detection
**Input**: Feature with potential security flaw
**Expected**: Codex detects vulnerability, iteration triggered, resolved after fix

### Scenario 3: AI Disagreement
**Input**: Ambiguous requirement
**Expected**: Divergence detected, synthesis resolves or escalates to user

## Error Recovery

| Failure | Recovery |
|---------|----------|
| Codex timeout | Increase timeout, simplify prompt |
| Gemini empty output | Check `-p` flag, retry |
| Synthesis conflict | Escalate to user |
| Review FAIL | Iterate with fixes |

## Quality Metrics

- Consensus points identified: [count]
- Divergences analyzed: [count]
- Issues addressed: [percentage]
- Iterations needed: [count]
