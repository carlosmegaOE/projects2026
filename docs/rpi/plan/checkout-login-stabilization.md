# Plan: Checkout Login Stabilization

**Plan Date**: February 25, 2026  
**Stage**: RPI Plan (DESIGN-ONLY, no code generation)  
**Input Research**: `docs/rpi/research/checkout-login-flake.md`  
**Objective**: Design a minimal, reversible stabilization strategy for intermittent login timeout/assertion failures

---

## 🎯 Scope Statement

### In Scope
- ✅ Improve login success path assertion timing
- ✅ Harden selectors for role-based or data-attribute locators
- ✅ Add network readiness wait after login submission
- ✅ Fix error banner assertion to wait for presence + visibility
- ✅ Enable trace capture on test failure (playwright.config.js diagnostics only)

### Out of Scope
- ❌ Add explicit retries (mask symptom; root cause must be fixed)
- ❌ Modify authentication API or backend behavior
- ❌ Change test data or environment setup
- ❌ Create new test cases (focus on stabilization, not coverage expansion)
- ❌ Refactor unrelated tests or page objects

---

## 📊 File Impact Matrix

| File | Action | Justification | Risk |
|------|--------|---------------|------|
| `tests/checkout/login.spec.js` | **MODIFY** | Update selectors to role-based; improve assertion waits (5-8 changes) | LOW — selectors align with app HTML |
| `pages/login.page.ts` | **CREATE** | Encapsulate login selectors and actions with proper wait strategy | LOW — page object reduces brittle selector duplication |
| `playwright.config.js` | **MODIFY** | Enable trace only on first retry in CI (diagnostics, not behavior change) | LOW — config change; no test logic affected |
| Other test files | **NO CHANGE** | Out of scope; focus on login stability only | N/A |

**Total Impact**: 2 files created/modified, ~50 lines of new code, ~15 lines modified.

---

## 🔍 Root-Cause Hypotheses (Ranked by Evidence)

| Rank | Hypothesis | Evidence | Likelihood | Fix Strategy |
|------|-----------|----------|-----------|--------------|
| **1** | **Assertion fires before login API completes + page renders** | Research identified no explicit wait for API completion; timeout occurs waiting for `.inventory_list`. Local network is 10x faster than CI. | **VERY HIGH** (95%) | Wait for URL change OR stable selector emergence after login submit |
| **2** | **Error banner selector unstable (not always in DOM)** | Error banner uses `h3[data-test="error"]`; may be conditionally rendered or lazy-loaded | **MEDIUM** (60%) | Switch to `getByRole('alert')` or wait for element presence before visibility check |
| **3** | **Chromium 131 timing regression** | Version skew between local (130) and CI (131) observed | **LOW** (15%) | Version lock or skip if fixes #1 and #2 resolve |
| **4** | **Race condition in test framework** | Rare; Playwright 1.58.2 is stable | **VERY LOW** (< 5%) | Not addressed; monitor after fix |

---

## 📋 Ordered Implementation Steps

### Step 1: Create Page Object with Stable Selectors
**File**: `pages/login.page.ts` (NEW)  
**Changes**:
- Define login locators using `getByRole()` and `getByLabel()` (Playwright best practice)
- Encapsulate login form interaction (fill username, password, submit)
- Encapsulate post-login assertion (wait for inventory or error)

**Acceptance Criteria**:
- [ ] Selectors use role-based locators where possible
- [ ] No inline `page.locator()` calls in test file
- [ ] `loginPage.submitLogin()` waits for either success (URL change) or error (banner visible)

**Risk**: None (page object is encapsulation only; behavior unchanged).

---

### Step 2: Improve Login Success Path Assertion
**File**: `tests/checkout/login.spec.js` (MODIFY)  
**Changes**:
- Replace direct `.inventory_list` selector check with `page.waitForURL()`
- Wait for URL to contain `/inventory` before checking for element visibility
- Use `expect().toBeVisible()` (web-first assertion; waits up to timeout)

**Acceptance Criteria**:
- [ ] Test waits for URL change after login submit (not just element visibility)
- [ ] Element visibility assertion still present as secondary check
- [ ] No manual sleeps or arbitrary waits

**Risk**: LOW — URL change is more reliable than element check alone.

---

### Step 3: Fix Error Banner Assertion
**File**: `tests/checkout/login.spec.js` (MODIFY)  
**Changes**:
- Switch from CSS selector `h3[data-test="error"]` to `getByRole('alert')`
- Add `waitForSelector()` before visibility check (ensure banner is in DOM first)
- Verify error text content is correct (e.g., "Epic sadface:")

**Acceptance Criteria**:
- [ ] Error banner assertion uses role-based locator
- [ ] Assertion waits for presence before checking visibility
- [ ] Error text is verified

**Risk**: LOW — Role-based locators are more stable.

---

### Step 4: Enable Trace Diagnostics on Failure (CI only)
**File**: `playwright.config.js` (MODIFY)  
**Changes**:
- Add `trace: 'on-first-retry'` to Chromium project config
- Ensures traces are captured only on first retry attempt (minimal CI overhead)

**Acceptance Criteria**:
- [ ] Trace enabled for Chromium only in CI
- [ ] Traces capture to `test-results/` directory
- [ ] No performance impact on passing tests

**Risk**: MINIMAL — Trace capture is non-blocking diagnostic.

---

## ✅ Acceptance Criteria (Validation Gates)

### Local Validation
- [ ] Tests run 10x consecutive locally without failure
- [ ] Tests pass under `--headed` and `--headed --slow-mo=500` (simulates slower network)
- [ ] Network throttle (3G) reproduces flake, stabilized changes eliminate it

### CI Validation
- [ ] Tests pass on first attempt in CI (Chromium headless)
- [ ] No timeout failures in logs
- [ ] No assertion failures on error banner
- [ ] Traces render correctly and show login flow progression

### Code Quality
- [ ] Page object selectors match Playwright best practices
- [ ] No magic numbers (sleeps); all waits are explicit
- [ ] Test code is more readable after POM refactor

---

## 🔄 Rollback Criteria

If stabilization causes **new regressions**:

| Scenario | Rollback Action | Effort |
|----------|-----------------|--------|
| Page object breaks other tests | Revert `pages/login.page.ts` + test selectors | < 5 min |
| URL wait misses edge cases | Revert Step 2; keep role-based selectors | < 5 min |
| Error banner no longer found | Revert to data-test selector; add presence wait | < 5 min |
| Trace overhead too high | Remove `trace: 'on-first-retry'` from config | < 2 min |

**Rollback is non-cascading**: Each step can be reverted independently.

---

## 🧪 Validation Commands & Evidence Requirements

### Command 1: Local Baseline (Before Implementation)
```bash
npx playwright test tests/checkout/login.spec.js --project=chromium
# Expected: Intermittent failures (document the failure rate in evidence)
```

### Command 2: Local Stabilization (After Implementation)
```bash
npx playwright test tests/checkout/login.spec.js --project=chromium
# Expected: Consistent pass (100% over 10 runs)
```

### Command 3: Network Throttle Reproduction (Proof of Fix)
```bash
# Open DevTools > Network tab, set to "Slow 3G"
npx playwright test tests/checkout/login.spec.js --headed
# Expected: Tests still pass under degraded network
```

### Command 4: CI Simulation (Headless)
```bash
npx playwright test tests/checkout/login.spec.js --project=chromium --trace on
# Expected: Pass; trace available in test-results/
```

### Command 5: Trace Analysis (Visual Proof)
```bash
npx playwright show-report
# Navigate to failed test (if any) and inspect trace timeline
# Expected: Login flow progresses without timeout gaps
```

### Required Evidence Outputs
- [ ] Local test run summary (pass count, duration)
- [ ] Network throttle run screenshot or log
- [ ] Playwright HTML report (showing test duration and status)
- [ ] Trace screenshot or summary (if failure occurs)
- [ ] Diff of changes made

---

## ⚠️ Residual Risks & Follow-ups

### Accepted Risks
1. **Chromium version variance** (LOW impact)
   - If CI upgrades to 131+, monitor for new timing issues
   - Mitigation: Version-lock in package.json if needed

2. **App HTML structure changes** (MEDIUM impact, external)
   - Role-based locators are more resilient, but still vulnerable to major refactors
   - Mitigation: Test should alert maintainers if error banner role changes

### Follow-up Opportunities (Not in This Plan)
- [ ] Add additional error cases (locked account, rate limit) — separate RPI cycle
- [ ] Extend to Firefox/WebKit flakiness — parallel RPI cycle
- [ ] Add login performance metrics — stretch goal if time permits
- [ ] Parameterize credentials for multi-user scenarios — future enhancement

---

## 📝 Summary & Approval Gate

**Implementation Scope**:
- 2 files modified/created
- ~50 lines of new code (page object)
- ~15 lines modified (test selectors and assertions)
- 1 config change

**Total Effort**: 1-2 hours (implementation + validation)

**Quality Bar**:
- ✅ Hypothesis-driven (addresses root causes #1 and #2)
- ✅ Reversible (each step rollbackable independently)
- ✅ Testable (validation commands defined and repeatable)
- ✅ Auditable (changes map to plan steps)

**Approval Status**: ⏳ READY FOR HUMAN APPROVAL

**Approver Sign-off Required**: YES  
- [ ] Plan is scoped correctly
- [ ] Risks are acceptable
- [ ] Validation strategy is comprehensive
- [ ] File allow-list is appropriate

---

**Plan Artifact**: `docs/rpi/plan/checkout-login-stabilization.md`  
**Status**: ✅ COMPLETE - Awaiting approval before Implement stage
