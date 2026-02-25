# Copilot QA Governance Research

**Repository**: `/Users/carlosmega/projects2026`  
**Research Date**: February 24, 2026  
**Scope**: Playwright test stack analysis for QA delivery governance

---

## FACTS

### Framework & Infrastructure
- **Framework**: Playwright @1.58.2, JavaScript, 3 browser engines (Chromium, Firefox, WebKit)
- **Test Files**: 6 spec files with 230+ tests
- **Execution Model**: 
  - Local: `fullyParallel: true`
  - CI: 1 worker, 2 retries, scheduled + push/PR triggers
- **Reporters**: HTML, blob (merge manifest), JSON results
- **Traces**: on-first-retry (debugging support)

### Test Patterns Implemented
- **Page Object Model**: PlaywrightDocsPage class encapsulating locators & interactions
- **Custom Fixtures**: 3 fixture sets (pageHelpers, apiHelpers, storageHelpers)
- **Data-Driven Tests**: forEach parameterization in Data-Driven Tests suite
- **API Testing**: Network mocking, response interception, request monitoring
- **Selector Strategies**: getByRole (primary), locator (ID/class), getByText, XPath (rare)

### Locator Usage Pattern
```javascript
// Observed hierarchy:
1. getByRole() - semantic (recommended)
2. locator() - CSS selectors (ID, class)
3. getByText() - visible text
4. getByLabel() - form labels
5. XPath - uncommon but present
```

### CI/CD Workflows
- **Smoke Tests** (`smoke.yml`): example.spec.js, Chromium only
- **Regression Tests** (`regression.yml`): all tests, 3 browsers, daily scheduled + push/PR triggered
- **Node Version**: 20 LTS
- **Environment**: ubuntu-latest

### Recent Migration Status
- **Target**: www.saucedemo.com (from Playwright docs)
- **Current State**: 39 failing tests (selector/method mismatches)
- **Incomplete**: Page Object methods reference old site (clickGetStarted, isInstallationVisible)

### Test Isolation & State
- **No Global Setup/Teardown**: Teardown depends on individual test implementations
- **beforeEach Patterns**: Observed in multiple suites (pageObjectModel, customFixtures, userInteractions)
- **State Risk**: Sauce Demo cart, filters not reset between tests
- **Parallel Safety**: No explicit localStorage/sessionStorage isolation

### Configuration Gaps
- **No baseURL**: All tests hard-code full URLs (https://www.saucedemo.com/)
- **No Web Server Startup**: Assumes target already running
- **Default Timeout**: 30 seconds (config default, no per-test overrides)
- **Retry Logic**: 2 retries on CI only

### Code Quality Observations
- **Fixture API**: Mixes deprecated (`page.click()`, `page.fill()`) with modern (`locator.*`)
- **Test Naming**: Inconsistent parameterization; forEach creates non-unique test names
- **Comments**: Includes FIXME, TODO, debug markers (page.pause commented out)
- **Error Handling**: Try/catch blocks in waitForNavigation (expected failures)

---

## ASSUMPTIONS

| Assumption | Rationale |
|-----------|-----------|
| CI environment has stable network | Failures attributed to code, not env variance |
| Sauce Demo is read-only baseline for testing | No test data cleanup required |
| Team prefers semantic locators | README emphasizes getByRole > XPath |
| Tests run locally before push | Soft expectation; no pre-commit hooks enforce this |
| Parallel execution safe | No report of concurrent test interference |
| 39 failing tests should be fixed | Migration incomplete; tests intended to pass |
| Test timeouts are acceptable at 30s | No SLA specified; default applied uniformly |
| Page Objects updated when UI changes | Maintenance model assumes reactive patching |
| Governance rules don't exist yet | README best practices suggest desired culture, not enforced policy |

---

## UNKNOWNS

### Performance & Reliability Metrics
- Actual pass rate baseline before Sauce Demo migration?
- Flakiness % per test / per browser?
- Test execution duration distribution?
- Retry rate (how many tests flake on first attempt)?

### Failure Root Causes
- Are specific tests intermittently failing?
- Network vs timing vs state failures?
- Stale selector failures per quarter?
- Environment variance impact?

### Requirements & SLAs
- Acceptance criteria: 100% pass? 95%?
- Which tests are critical path (must-pass)?
- Timeout thresholds per pattern (navigation=?, form fill=?)?
- Flakiness tolerance (1 retry = acceptable flaky?)?

### Developer Practices
- Do engineers run tests before push?
- Do they debug locally or just retry CI?
- How often do new contributors break tests?
- Time spent on test maintenance vs feature tests?

### Coverage Scope
- Mobile/tablet viewport testing enabled?
- Visual regression testing?
- Performance thresholds monitored?
- API contract testing vs E2E only?

### Environment Parity
- How different is staging from Sauce Demo?
- Proxy/VPN/firewall issues in CI?
- DNS/network delays between local vs CI?
- Any hardcoded test credentials?

### Onboarding & Maintainability
- Written QA onboarding guide?
- Who maintains test framework?
- Rotation status (bus factor)?
- Training time for new QA engineer?

---

## RISKS

### High Severity

| Risk | Impact | Evidence |
|------|--------|----------|
| **39 Failing Tests** | Blocks adoption of Sauce Demo suite; unclear pass rate | grep confirms selector/method mismatches in pageObjectModel, differentSelectors, userInteractions |
| **No Environment Abstraction** | Hard-coded URLs brittle; can test wrong environment | All tests use `page.goto('https://www.saucedemo.com/')` directly |
| **No Flakiness Instrumentation** | Can't identify flaky tests; retries masked as passes | Config: `retries: 2 on CI`, but no telemetry to identify which tests fail repeatedly |
| **State Pollution** | Parallel tests interfere; Sauce Demo cart/filters persist | No afterEach teardown; page.goto only navigates, not reset state |

### Medium Severity

| Risk | Impact | Evidence |
|------|--------|----------|
| **Deprecated APIs in Fixtures** | Diverges from Playwright best practices | customFixtures.js uses page.click(), page.fill() instead of locator.* |
| **Network Mocking Overuse** | Stub/route usage could hide real production bugs | apiAndAdvanced.spec.js: page.route('**/api/**') blocks all API calls |
| **Unchecked test.only/test.skip** | Commented code easily uncommented; blocks suite | apiAndAdvanced.spec.js line 183: `test('use test.only...` + comment `// if test.only is used` |
| **Selector Maintenance Burden** | High cost to update on UI change; XPath brittle | differentSelectors.spec.js initially used nav, a, h2 selectors from docs site |

### Low Severity

| Risk | Impact | Evidence |
|------|--------|----------|
| **Data-Driven Test Naming** | forEach parameterization doesn't create unique names | dataAndAssertions.spec.js: `test(\`should verify navigation item: ${item.name}\`)` |
| **CI/CD Single Responsibility** | Workflows hardcoded; no test filtering flexibility | smoke.yml: `npm test -- tests/example.spec.js`; regression.yml: all tests |
| **No Timeout Standardization** | Undefined per-test thresholds; reliance on default | playwright.config.js: no per-suite/per-pattern timeout override mechanism |

---

## EVIDENCE GAPS

### Critical Gaps

| Gap | Data Needed | Purpose |
|-----|------------|---------|
| **Baseline Metrics** | Historical pass rates, duration distribution, flakiness % by test | Establish SLA; identify regression; measure improvement |
| **Failure Root Cause Classification** | Categorization of failures (network, timing, state, stale selector, env) | Target root cause; prevent recurrence |
| **Selector Audit Results** | Coverage of locator strategies; count of brittle (XPath) vs semantic | Enforce locator hierarchy; schedule updates |

### Important Gaps

| Gap | Data Needed | Purpose |
|-----|------------|---------|
| **Environment Parity Report** | Comparison of failures: local vs CI vs staging | Isolate env-specific issues; validate test relevance |
| **Contributor Awareness** | Survey: % aware of best practices, naming conventions, fixture rules | Identify training gaps; scope governance rollout |
| **Flakiness History** | Past incidents: which tests flaked, root causes, fixes applied | Learn patterns; prevent recurrence; adjust SLAs |
| **Timeout Baseline Data** | Actual execution times by test; percentile distribution | Set thresholds; detect regressions |

### Nice-to-Have Gaps

| Gap | Data Needed | Purpose |
|-----|------------|---------|
| **SLA Definition** | Business requirements: % pass, which tests critical, acceptance criteria | Align test governance with product SLA |
| **Dogfooding Assessment** | Audit: % of test code using deprecated Playwright APIs | Measure framework currency |
| **Coverage Weighted by Impact** | Test count vs business criticality per feature | Prioritize test maintenance |

---

## Recommended Governance Rules

### 1. Locator Hierarchy (Enforced)
```
Priority 1 (REQUIRED):    getByRole('button', { name: 'X' })
Priority 2 (GOOD):        getByLabel('Email'), getByText('Submit')
Priority 3 (ACCEPTABLE):  locator('.class'), locator('#id')
Priority 4 (FORBIDDEN):   locator('//xpath'), page.locator('nav a')
```
**Enforcement**: Pre-commit linter

### 2. URL Configuration (Enforced)
```javascript
// FORBIDDEN:
await page.goto('https://www.saucedemo.com/');

// REQUIRED:
baseURL: 'https://www.saucedemo.com' in config
await page.goto('/');  or await page.goto('/inventory')
```
**Enforcement**: Linter + code review

### 3. Test Naming Convention (Enforced)
```javascript
// FORBIDDEN:
test(`should verify ${item.name}`, ...)

// REQUIRED:
test('should verify login button visibility', ...)
test('should display products after login', ...)
```
**Enforcement**: Pre-commit, CI validation

### 4. Fixture API Standardization (Enforced)
```javascript
// DEPRECATED (remove from fixtures):
async waitAndClick(selector) {
  await page.click(selector);  // ❌ Old API
}

// REQUIRED (refactor to):
async waitAndClick(selector) {
  await page.locator(selector).click();  // ✅ New API
}
```
**Enforcement**: Code review, deprecation warnings

### 5. Test Isolation & Cleanup (Enforced)
```javascript
// For stateful tests (login, cart, filters):
test.afterEach(async ({ page }) => {
  await page.goto('/');  // Reset to known state
  // Optional: await loginPage.logout();
});
```
**Enforcement**: PR template requirement

### 6. State Management (Enforced)
```javascript
// FORBIDDEN:
test('add to cart', ...)
test('remove from cart', ...)  // Assumes previous test passed

// REQUIRED:
test('add to cart', async ({ page, loginPage }) => {
  await loginPage.login();
  await addProductToCart('Product A');
})
```
**Enforcement**: Code review, test independence audit

### 7. Timeout Standards (Enforced)
```javascript
// Per-pattern thresholds:
Navigation:    10s
Form submit:    5s
Animation:      3s
Network API:    3s
Custom wait:    5s max
```
**Enforcement**: Test harness wrapper, linter

### 8. No test.only / test.skip in main (Enforced)
```javascript
// FORBIDDEN in pushed code:
test.only('specific test', ...)
test.skip('flaky test', ...)

// ALLOWED only with GitHub issue reference:
test.skip('flaky: https://github.com/.../issues/42', ...)
```
**Enforcement**: Pre-commit hook, CI block

### 9. Flakiness Tolerance & Root Cause SLA (Enforced)
```
- If test fails > 1x per month:  Classify as flaky, open issue
- If test flakes after retry:    Must include root cause analysis
- Accepted flaky tests:          Only with issue reference + deadline
```
**Enforcement**: Test metrics dashboard + weekly review

### 10. Quarterly Selector Audit (Process)
```
- Scan all tests for deprecated selectors (XPath, nav, generic a/button)
- Document upgrade path
- Schedule refactor per sprint
- Report to team
```
**Enforcement**: Tool-generated report, backlog item

---

## Recommended Artifacts

### Repository Files to Create

1. **`.github/qa-governance.md`**
   - Central governance doc with all rules
   - Link to this research
   - SLA definitions
   - Escalation process for flaky tests

2. **`DEVELOPER_CONVENTIONS.md`**
   - Quick reference guide for test authors
   - Locator selection flowchart
   - Test naming examples
   - Fixture usage patterns
   - Do's/don'ts checklist

3. **`tests/.patterns-guide.md`**
   - Examples of approved patterns:
     - POM structure
     - Fixture abstractions
     - Data-driven test setup
     - Wait strategies
   - Anti-patterns to avoid

4. **`tests/fixtures/base-fixtures.js`**
   - Curated "approved" fixtures only
   - Removes ad-hoc helpers
   - Enforces locator.* APIs
   - Includes state cleanup helpers

### Tools to Create

1. **`tools/selector-audit.js`**
   - Scan all tests for locator strategy usage
   - Report XPath count, CSS count, semantic count
   - Flag deprecated APIs (page.click, page.fill)
   - Export CSV for tracking

2. **`tools/flakiness-analyzer.js`**
   - Parse test-results.json
   - Identify tests failing > 1x per month
   - Categorize root causes (timeout, selector, state)
   - Suggest fixes

3. **`tools/test-validator.js`**
   - Enforce naming convention (regex)
   - Check for test.only/test.skip without issue ref
   - Validate timeout values
   - Lint fixture usage

### CI/CD Additions

1. **`.github/workflows/selector-lint.yml`**
   - Run on PR: `tools/selector-audit.js`
   - Warn if XPath detected
   - Report deprecated API usage
   - Fail if violations exceed threshold

2. **`.github/workflows/test-governance.yml`**
   - Run on PR: `tools/test-validator.js`
   - Block merge if test.only is active
   - Validate naming convention
   - Check timeout ranges

---

## Implementation Roadmap

### Phase 1: Stabilization (Week 1-2)
- [ ] Fix 39 failing Sauce Demo tests
- [ ] Establish baseline metrics (current pass rate, execution duration)
- [ ] Document existing patterns in DEVELOPER_CONVENTIONS.md
- [ ] Create qa-governance.md skeleton

### Phase 2: Enforcement (Week 3-4)
- [ ] Create linter rules (test-validator.js)
- [ ] Update fixtures to modern APIs (base-fixtures.js)
- [ ] Add pre-commit hooks for governance rules
- [ ] Create selector-audit tool

### Phase 3: Monitoring (Week 5-6)
- [ ] Deploy flakiness-analyzer into CI
- [ ] Create test metrics dashboard
- [ ] Establish weekly governance review meeting
- [ ] Document SLAs per test priority

### Phase 4: Culture (Ongoing)
- [ ] Onboard team on governance rules (1hr session)
- [ ] Publish quarterly selector audit results
- [ ] Recognize test improvements (shoutouts)
- [ ] Iterate SLAs based on observed metrics

---

## Conclusion

The Playwright test suite demonstrates solid foundational patterns (POM, fixtures, data-driven tests) but lacks:
1. **Enforced governance** (no rules, soft conventions only)
2. **Metrics visibility** (can't identify flaky tests)
3. **Environment abstraction** (hard-coded URLs)
4. **Standardized APIs** (mixed deprecated & modern approaches)

**Recommendation**: Implement phased governance rollout starting with stabilization (fix failing tests), then enforcement (linters), then monitoring (metrics). Focus on **no test.only**, **locator hierarchy**, and **state cleanup** as quick wins.

By end of Phase 3, the team will have:
- Clear QA standards documented
- Automated enforcement preventing regressions
- Visibility into flaky tests
- SLAs aligned with business needs
