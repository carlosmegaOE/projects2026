# RPI Plan: Copilot QA Governance Implementation

**Plan Date**: February 24, 2026  
**Research Reference**: `docs/rpi/research/copilot-governance.md`  
**Status**: AWAITING APPROVAL

---

## Executive Summary

This plan defines 6 governance files + 1 reference architecture to enforce Copilot discipline and QA delivery standards in the Playwright repository. The implementation is **scoped, sequenced, and reversible**.

**Total Effort**: ~30 min to create + ~1 hour to validate  
**Risk Level**: LOW (additive only, no code changes)  
**Rollback Risk**: NONE (can delete files)

---

## Files to Create

### 1. `.github/copilot-instructions.md` (EXISTING, NEEDS UPDATE)
**Purpose**: Repository-level Copilot governance  
**Status**: Exists with basic project setup info; needs QA governance section  
**Action**: ADD QA-specific rules and constraints  
**Enforcement**: Copilot reads on every invocation  
**Content Areas**:
- Existing project setup (keep as-is)
- ADD: QA Testing Guidelines section  
- ADD: Forbidden patterns (test.only, hard-coded URLs, XPath)  
- ADD: Required patterns (getByRole, state cleanup, test naming)  
- ADD: File access restrictions per stage (research ≠ implement)

**Acceptance Criteria**:
- [ ] QA section present and linkable
- [ ] Forbidden patterns listed with examples
- [ ] Required patterns with code samples
- [ ] Cross-references to other governance files

---

### 2. `.github/instructions/playwright.instructions.md` (NEW)
**Purpose**: Detailed Playwright-specific guidance for Copilot  
**Scope**: Test authoring, POM patterns, fixture usage  
**Enforcement**: Include in prompts when asking Copilot to generate tests  
**Content Areas**:
- Locator strategy hierarchy (with priority numbers)
- Page Object Model structure expectations
- Fixture patterns (approved vs deprecated APIs)
- Test naming convention (regex pattern)
- State cleanup expectations
- Timeout configuration guidelines
- Anti-patterns checklist

**Acceptance Criteria**:
- [ ] Locator hierarchy with code examples
- [ ] 1 POM before/after example
- [ ] 5+ anti-patterns with explanations
- [ ] Regex test name pattern included

---

### 3. `.github/prompts/rpi-research.prompt.md` (NEW)
**Purpose**: Slash command template for Research stage  
**Trigger**: `/rpi-research [scope]`  
**Constraints**:
- READ-ONLY operations only
- No file creation/modification
- Output format structured (facts | assumptions | unknowns | risks | evidence gaps)
- Save to `docs/rpi/research/[topic].md` (approval required before execution)

**Content**:
- System prompt defining Research stage behaviors
- Scope options (patterns, risks, coverage, etc.)
- Required output schema
- Example output (from existing copilot-governance.md research)

**Acceptance Criteria**:
- [ ] Execution triggers correct behaviors
- [ ] Output schema is unambiguous
- [ ] Examples provided and valid
- [ ] Scope boundaries clear

---

### 4. `.github/prompts/rpi-plan.prompt.md` (NEW)
**Purpose**: Slash command template for Plan stage  
**Trigger**: `/rpi-plan [research-file]`  
**Constraints**:
- READ-ONLY operations (read research input)
- Output is planning document only
- No file generation yet
- Requires human approval before next stage
- Output schema: files | purpose | enforcement | risks | rollback

**Content**:
- System prompt defining Plan stage (design, no execution)
- Input: path to research document
- Required output structure
- Approval gate instructions

**Acceptance Criteria**:
- [ ] Plan reads research input correctly
- [ ] File list with paths/purposes generated
- [ ] Enforcement rules per file documented
- [ ] Approval gate is clear

---

### 5. `.github/prompts/rpi-implement.prompt.md` (NEW)
**Purpose**: Slash command template for Implement stage  
**Trigger**: `/rpi-implement [plan-file] [approved-files]`  
**Constraints**:
- **WHITELIST ONLY**: Can create/edit only listed files
- Must reference approved plan
- Output format: summary | validation | risks | rollback
- Cannot expand scope beyond plan

**Content**:
- System prompt enforcing whitelisted file access
- Validation checklist for files
- Rollback instructions
- Evidence archival requirements

**Accepted Files** (hardcoded):
```
- .github/copilot-instructions.md (update only)
- .github/instructions/playwright.instructions.md (new)
- .github/prompts/rpi-research.prompt.md (new)
- .github/prompts/rpi-plan.prompt.md (new)
- .github/prompts/rpi-implement.prompt.md (new)
- .github/agents/qa-delivery.agent.md (new)
```

**Acceptance Criteria**:
- [ ] Only whitelisted files created/modified
- [ ] Plan reference verified before execution
- [ ] Validation checklist executed
- [ ] Evidence saved to docs/rpi/implement/

---

### 6. `.github/agents/qa-delivery.agent.md` (NEW)
**Purpose**: Agent prompt for autonomous QA governance tasks  
**Scope**: Audit, analysis, governance enforcement  
**Constraints**:
- Stage-aware (knows when to READ vs WRITE)
- File access whitelist enforced
- Human approval gates for destructive ops
- Reports findings to stdout + markdown

**Content Areas**:
- Stage behavior definitions (Research → Plan → Implement)
- Whitelist enforcement logic
- Approval gate implementation
- Audit commands (selector-audit, test-validator, flakiness-analyzer)
- Reporting format

**Use Cases**:
1. `@qa-delivery research patterns` → output research findings
2. `@qa-delivery audit selectors` → scan tests, report XPath usage
3. `@qa-delivery analyze-flakiness` → parse results, classify root causes
4. `@qa-delivery validate-naming` → check test naming convention

**Acceptance Criteria**:
- [ ] Stage boundaries enforced
- [ ] Audit commands documented
- [ ] Reporting format is structured
- [ ] Approval gates working

---

## Implementation Sequence

### Phase 1: Governance Structure (Files 1-3)
**Order**:
1. Create `.github/instructions/playwright.instructions.md` (foundational)
2. Update `.github/copilot-instructions.md` (references playwright.instructions)
3. Create `.github/prompts/rpi-research.prompt.md` (references both above)

**Validation**: 
- [ ] Playwright.instructions is complete and accurate
- [ ] Copilot-instructions links to it
- [ ] Research prompt can read research files

---

### Phase 2: RPI Workflow (Files 4-5)
**Order**:
1. Create `.github/prompts/rpi-plan.prompt.md` (reads research, generates plans)
2. Create `.github/prompts/rpi-implement.prompt.md` (reads plans, creates files)

**Validation**:
- [ ] Plan prompt successfully reads research input
- [ ] Implement prompt enforces whitelist
- [ ] Both use structured output schema

---

### Phase 3: Agent Enforcement (File 6)
**Order**:
1. Create `.github/agents/qa-delivery.agent.md` (uses all above)

**Validation**:
- [ ] Agent respects stage boundaries
- [ ] Agent enforces whitelist
- [ ] Audit commands are functional

---

## Enforcement Rules (by file)

| File | Enforces | Mechanism | Owner |
|------|----------|-----------|-------|
| `.github/copilot-instructions.md` | NO test.only, NO hard-coded URLs, NO XPath | Copilot context | Dev |
| `.github/instructions/playwright.instructions.md` | Locator hierarchy, POM structure, fixture APIs | Prompt inclusion | Dev |
| `.github/prompts/rpi-research.prompt.md` | Research-only mode, structured output | Slash command | Agent |
| `.github/prompts/rpi-plan.prompt.md` | Plan-only mode, approval gate | Slash command | Agent |
| `.github/prompts/rpi-implement.prompt.md` | Whitelist-only access, no scope expansion | Slash command | Agent |
| `.github/agents/qa-delivery.agent.md` | Stage awareness, audit capabilities, reporting | Agent prompt | Agent |

---

## Acceptance Criteria (before Implement)

### Mandatory
- [ ] All 6 files have clear purpose statements
- [ ] Whitelisted files for Implement are explicitly listed
- [ ] Approval gate is documented (human sign-off required)
- [ ] Rollback procedure is defined for each file

### Important
- [ ] Output schemas are unambiguous (examples provided)
- [ ] Stage boundaries (Research ≠ Plan ≠ Implement) are enforced
- [ ] File paths are exact and referenceable
- [ ] Enforcement mechanisms are clear per file

### Nice-to-Have
- [ ] Cross-references between files documented
- [ ] Audit commands have example outputs
- [ ] Slash prompts have example invocations

---

## Rollback Criteria

If any governance file causes unintended behaviors:

1. **DELETE immediately**: `.github/agents/qa-delivery.agent.md`
2. **Revert to simple**: `.github/copilot-instructions.md` (remove QA section)
3. **Restore baseline**: All others can be deleted without impact

**Rollback Effort**: <5 minutes (files can be deleted independently)

---

## Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Copilot doesn't read instructions | LOW | Test with simple "check instructions" prompt |
| Slash commands not recognized | LOW | Verify command format in Copilot docs |
| Whitelist too restrictive | MEDIUM | Include test files in whitelist; expand if needed |
| Approval gate bypassed | MEDIUM | Require explicit "APPROVED" string in prompt |
| Files become stale | MEDIUM | Quarterly review cycle documented |

---

## Evidence & Artifacts

**After Approval**, create in `docs/rpi/implement/`:
- `copilot-governance.md` - implementation summary
- `validation-checklist.md` - proof of completion
- `audit-report.md` - selector/naming audit results

---

## Sign-Off

This plan is **AWAITING HUMAN APPROVAL** before proceeding to Step 3: Implement.

**Approval Gate**: Confirm the following:
```
I have reviewed docs/rpi/plan/copilot-governance.md and approve:
- [ ] All 6 files are necessary and scoped correctly
- [ ] Enforcement rules are clear and enforceable
- [ ] Rollback procedure is acceptable
- [ ] Whitelist files for Implement are complete

Approved by: ________________  Date: ________________
```

Once approved, run:
```bash
/rpi-implement docs/rpi/plan/copilot-governance.md \
  --approved-files all \
  --evidence-path docs/rpi/implement/
```

---

## Next Steps (Conditional on Approval)

1. **If APPROVED**: Execute Step 3 (Implement) to create 6 governance files
2. **If REVISION REQUESTED**: Update this plan and re-submit
3. **If REJECTED**: Archive plan and revisit governance strategy

---

**Plan Document**: `docs/rpi/plan/copilot-governance.md`  
**Research Reference**: `docs/rpi/research/copilot-governance.md`  
**Status**: AWAITING APPROVAL ⏳
