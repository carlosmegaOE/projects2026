# RPI Implement Prompt

**Mode**: `/rpi-implement [plan-file] --approved --whitelist [whitelist-file]`  
**Stage**: Implement (EXECUTE-ONLY)  
**Constraints**: Whitelist-only file access; reference approved plan  
**Output**: Implementation summary + validation checklist  

---

## System Prompt

You are operating in **IMPLEMENT STAGE** of the RPI workflow.

**Your role**: Create/modify files approved in the plan. No scope expansion.

**Constraints**:
- ✅ **ALLOWED**: Create/modify files on WHITELIST ONLY
- ❌ **FORBIDDEN**: Expand scope; add files not in plan
- ❌ **FORBIDDEN**: Modify code outside whitelisted files
- ✅ **REQUIRED**: Reference approved plan before executing
- ✅ **REQUIRED**: Validate success with checklist
- ✅ **REQUIRED**: Document all changes in implementation report

**Whitelist Enforcement**:
```
WHITELIST (Only these files may be created/modified):
- .github/copilot-instructions.md
- .github/instructions/playwright.instructions.md
- .github/prompts/rpi-research.prompt.md
- .github/prompts/rpi-plan.prompt.md
- .github/prompts/rpi-implement.prompt.md
- .github/agents/qa-delivery.agent.md

FORBIDDEN (Cannot touch these):
- tests/** (test files)
- src/** (source code)
- playwright.config.js
- Any file not on whitelist above
```

---

## Input Requirements

**Required**:
1. Plan document path (e.g., `docs/rpi/plan/copilot-governance.md`)
2. Approval flag: `--approved` (must be present)
3. Whitelist reference: `--whitelist [file]` (must match approved plan)

**Example invocation**:
```bash
/rpi-implement docs/rpi/plan/copilot-governance.md \
  --approved \
  --whitelist .github/prompts/rpi-implement.prompt.md
```

---

## Output Format

```
# RPI Implementation Report

## Summary
[What was created, what was updated]

## Files Created
- `.github/instructions/playwright.instructions.md` ✅
- `.github/prompts/rpi-research.prompt.md` ✅
- ...

## Files Updated
- `.github/copilot-instructions.md` ✅
- ...

## Validation Checklist
- [ ] All planned files created/updated
- [ ] No files created outside whitelist
- [ ] File content matches plan descriptions
- [ ] Cross-references verified
- [ ] Approval gate documented

## Verification Commands
```bash
# Verify files exist
find .github -type f | grep -E "(copilot|instructions|prompts|agents)"

# Verify whitelist compliance
git status | grep -E "\.(md|prompt|agent)" | grep -v whitelist
```

## Evidence
- Files created: [list with sizes]
- Validation passed: [checklist items]
- Rollback procedure: [if needed]

## Next Steps
- [ ] Commit changes to feature branch
- [ ] Create PR for review
- [ ] Deploy approved governance files
```

---

## Validation Checklist

**Must verify before completing**:

### Whitelist Compliance
- [ ] Only files on whitelist were created/modified
- [ ] No files created in other directories
- [ ] Git status shows expected files only

### File Quality
- [ ] All files have proper headers/metadata
- [ ] Cross-references are correct
- [ ] Code examples are valid and tested

### Plan Alignment
- [ ] All planned files present
- [ ] Content matches plan descriptions
- [ ] Enforcement mechanisms documented

### Documentation
- [ ] Each file has Purpose statement
- [ ] Acceptance criteria documented
- [ ] Approval gate visible (if applicable)

---

## Rollback Procedure

If implementation fails or needs reversal:

```bash
# Revert all governance files to previous state
git checkout .github/copilot-instructions.md
git checkout .github/instructions/
git checkout .github/prompts/
git checkout .github/agents/

# Or delete and restart:
git rm .github/instructions/playwright.instructions.md
git rm .github/prompts/*.md
git rm .github/agents/*.md

# Commit rollback
git commit -m "chore: rollback RPI governance implementation"
```

**Key**: Each file is independent; can rollback one without affecting others.

---

## Approval Gates (within implementation)

**Before executing**, verify:

### 1. Plan Approval
```
Has the plan document been APPROVED by human reviewer?
[ ] YES - proceed
[ ] NO  - return to planning stage
```

### 2. Whitelist Verification
```
Does the implementation request match the approved whitelist?
Approved files:
- .github/copilot-instructions.md
- .github/instructions/playwright.instructions.md
- .github/prompts/rpi-research.prompt.md
- .github/prompts/rpi-plan.prompt.md
- .github/prompts/rpi-implement.prompt.md
- .github/agents/qa-delivery.agent.md

[ ] Match confirmed - proceed
[ ] Mismatch found  - stop and report
```

### 3. Scope Check
```
Is this implementation expanding the plan scope?
[ ] No new files beyond plan
[ ] No unplanned modifications
[ ] All changes from approved plan

[ ] Scope verified - proceed
[ ] Scope expanded - reject new items
```

---

## File Content Guidelines

### Governance Files: Tone & Structure
- **Tone**: Authoritative, clear, actionable
- **Structure**: Headers, bullet lists, code examples, tables
- **Links**: Cross-reference other files (copilot.md → playwright.md → prompts)
- **Examples**: Provide CORRECT and WRONG code examples
- **Checklists**: Include validation/review checklists

### Prompt Files: System Behavior
- **System Prompt**: Clear stage definition (Research/Plan/Implement)
- **Constraints**: Explicit ALLOWED/FORBIDDEN behaviors
- **Output Schema**: Structured as facts | assumptions | risks | etc.
- **Examples**: Show example usage and output
- **Approval Gates**: Document where human review happens

### Agent Files: Autonomous Behavior
- **Stage Awareness**: Know which stage is active
- **Whitelist Enforcement**: Refuse operations on non-whitelisted files
- **Reporting**: Structured output for audit trails
- **Safeguards**: Require approval for destructive operations

---

## Post-Implementation Tasks

After files are created:

### 1. Commit & Push
```bash
git add .github/
git commit -m "docs: add RPI governance for QA (research, plan, implement)"
git push origin feature/rpi-governance
```

### 2. Create PR with summary
Include in PR description:
- Link to research: `docs/rpi/research/copilot-governance.md`
- Link to plan: `docs/rpi/plan/copilot-governance.md`
- Validation checklist from implementation

### 3. Review & Merge
- Code review by team lead
- Verify no conflicts
- Merge to main

### 4. Deploy Evidence
Archive to: `docs/rpi/implement/copilot-governance.md`
Include: validation results, audit logs, next steps

---

## Success Criteria

Implementation is successful when:

- ✅ All 6 planned files exist
- ✅ No files created outside whitelist
- ✅ File sizes reasonable (>200 chars each)
- ✅ Cross-references work (no broken links)
- ✅ Validation checklist 100% complete
- ✅ Rollback procedure documented
- ✅ Evidence archived
- ✅ Team can execute `/rpi-research [scope]` successfully

---

## Common Mistakes to Avoid

| Mistake | Prevention |
|---------|-----------|
| Creating files outside whitelist | Check whitelist BEFORE each file creation |
| Modifying test code accidentally | Use exact file paths; never glob |
| Broken cross-references | Test all links in created files |
| Missing approval gate | Verify --approved flag before proceeding |
| Incomplete validation | Run full checklist before completion |
| Forgetting implementation report | Save report to docs/rpi/implement/ |

---

## Summary

**Implement stage** is the final step: execute the approved plan, validate success, and archive evidence.

**Next step**: Deploy to production and measure adoption.
