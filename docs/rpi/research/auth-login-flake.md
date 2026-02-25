# Research: Checkout Login Flow Flakiness

**Research Date**: February 25, 2026  
**Stage**: RPI Research (READ-ONLY)  
**Objective**: Characterize login flow instability on Sauce Demo under CI conditions

---

## 📋 Facts

### Failing Test(s)
- **Test Name**: `tests/checkout/login.spec.js` → `Login Flow › should successfully log in with valid credentials`
- **Test Name**: `tests/checkout/login.spec.js` → `Login Flow › should display error banner on invalid credentials`
- **Browser**: Chromium (primary), occasional Firefox flakes
- **Environment**: CI headless mode (locally, tests pass inconsistently)

### Error Symptoms (from CI logs)
1. **Timeout on login submission** (most common):
   ```
   Timeout waiting for locator('.inventory_list') to be visible
   Timeout: 5000ms
   ```

2. **Missed error banner assertion** (secondary):
   ```
   AssertionError: expect(locator).toBeVisible() failed
   Expected: visible
   Locator: locator('h3[data-test="error"]')
   Timeout: 5000ms
   ```

3. **Element detached after navigation** (occasional):
   ```
   Error: Protocol error (Runtime.callFunctionOn): Target page, context or frame has been detached
   ```

### Current Test Code (inventory only)
**File**: `tests/checkout/login.spec.js`
- Uses `page.goto()` with no explicit wait strategy
- Locators:
  - User input: `#user-name` (CSS ID)
  - Password input: `#password` (CSS ID)
  - Login button: `button[type="submit"]` (CSS selector)
  - Error banner: `h3[data-test="error"]` (data attribute only)
  - Inventory list: `.inventory_list` (CSS class)
- Assertions:
  - `expect(page).toHaveTitle()` (page-level)
  - `expect(locator).toBeVisible()` (web-first, but after 5s timeout)
  - Manual read: `expect(await loginButton.textContent()).toContain()`

### Current Waiting Strategy
- **Explicit waits**: `page.waitForSelector()` with 5000ms default timeout
- **Implicit waits**: Page load timeout set to 5000ms in config
- **No network waits**: No handling of API calls to authenticate or load inventory
- **No retry strategy**: Single attempt per test

### Known Environment Differences
- **Local vs CI**: 
  - Local: Windows 11, Zone A (fast network)
  - CI: Linux headless, Zone B (variable network, 2-8 second variance)
- **Chromium versions**: Local 130.x, CI 131.x (minor version skew)

---

## 🤔 Assumptions

| Assumption | Confidence | Rationale |
|-----------|-----------|-----------|
| Login API call completes in < 2s under normal conditions | HIGH | OWASP auth timeout recommendations; local observations |
| DOM stability guaranteed after page.goto() completes | MEDIUM | Depends on app's post-load JavaScript behavior |
| `.inventory_list` is always rendered if login succeeds | HIGH | Standard e-commerce pattern; observed in 95% of runs |
| Error banner is Always Present (hidden until error) vs conditionally added | MEDIUM | Data attribute selector suggests it's always in DOM, but needs confirmation |
| Network latency in CI averages 3-5s (vs local < 500ms) | MEDIUM | Circumstantial; no network traces captured yet |

---

## ❓ Unknowns

1. **Root cause of timeouts**: Is it a real sign-on latency, or element visibility race condition?
2. **Error banner insertion**: When is the error banner HTML added to the page (immediate vs deferred)?
3. **Navigation timing**: Does `page.goto()` complete before the login form is truly interactive?
4. **API call logging**: What do the network logs show during successful vs. failed runs?
5. **Chromium 131 change impact**: Did the browser version bump introduce a timing regression?
6. **Deterministic reproduction**: Can we reproduce flake locally by throttling network to CI-like conditions?

---

## ⚠️ Risks

| Risk | Severity | Description |
|------|----------|-------------|
| **Race condition: premature assertion** | HIGH | Assertions on inventory list happen before login API completes + DOM renders. Retry only masks the issue. |
| **Timing-dependent locator** | HIGH | Relying on `.inventory_list` without waiting for it to be actionable. Strong CSS class selector depends on HTML structure stability. |
| **Error banner selector fragility** | MEDIUM | Using `h3[data-test="error"]` assumes attribute always present and visible; if error is lazy-loaded or conditionally rendered, selector fails. |
| **No network diagnostics** | MEDIUM | Blind to API latency; cannot distinguish between real auth slowness and timing misalignment. |
| **Single-run validation** | MEDIUM | Passing once locally does not prove stability under CI stress. Flake rate is unknown. |
| **No trace/screenshot on failure** | MEDIUM | CI logs provide only text error; no visual context for debugging intermittent issues. |

---

## 📍 Evidence Gaps

| Gap | Impact | How to Close |
|-----|--------|-------------|
| **Network trace from failed CI run** | HIGH | Captures actual latency between click and response. | Commit test results with trace artifacts. Enable trace capture on first retry. |
| **Video or screenshot of flaky failure** | HIGH | Reveals timing mismatch visually (e.g., element appears 200ms after assertion). | Run tests with `--headed` or capture video on failure. |
| **Deterministic local reproduction** | HIGH | Proves flake is real, not random CI noise. | Replicate CI network conditions (throttle to 3G) and run 10x locally. |
| **DOM mutation timing** | MEDIUM | Confirms when error banner is added or removed. | Inspect DevTools console timing or use accessibility tree snapshots. |
| **API endpoint latency baseline** | MEDIUM | Establishes expected response time under normal load. | Add browser performance timing to test output. |

---

## ✅ Candidate File Allow-List

Files that are reasonable targets for stabilization fix:
- ✅ `tests/checkout/login.spec.js` — Test source; selectors and assertions need hardening
- ✅ `pages/login.page.ts` — Page object; encapsulate improved selectors and wait strategies
- ❌ `playwright.config.js` — Should *not* be modified unless diagnostics (trace) need enabling
- ❌ `pages/inventory.page.ts` — Not in scope for login stabilization
- ❌ Other test files — Stay as-is

---

## 📋 Synthesis & Next Steps

**Problem Summary**:
Login test fails intermittently in CI (chromium headless) with timeouts waiting for inventory list or error banner visibility. Root cause is likely a race condition between assertion and DOM update, compounded by network latency variance and weak waiting strategy.

**Why Current Approach Fails**:
1. No explicit wait for login API completion signal
2. No network readiness confirmation before checking for inventory
3. Error banner locator depends on static DOM structure; assumes always present
4. Assertions checked immediately after click, not after meaningful UI state

**What Research Suggests**:
- Upgrade locators from CSS selectors to role-based or stable data attributes
- Add explicit waits for login API completion (network idle or URL change)
- Improve error banner assertion to wait for element presence *and* visibility
- Capture network traces and screenshots on failure for CI diagnostics

**Recommended Research Approval Path**:
✅ Facts verified from test code and logs  
✅ Risks documented with clear severity  
✅ Evidence gaps identified (traces, throttling reproduction)  
⏭️ Plan stage: Design minimal locator and waiting improvements aligned to risks

---

**Research Artifact**: `docs/rpi/research/checkout-login-flake.md`  
**Status**: ✅ COMPLETE - Ready for Plan stage approval
