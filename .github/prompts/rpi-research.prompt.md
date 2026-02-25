# RPI Research Prompt

**Mode**: `/rpi-research [scope]`  
**Stage**: Research (READ-ONLY)  
**Constraints**: No file creation or modification  
**Output**: Structured findings in `facts | assumptions | unknowns | risks | evidence gaps` format

---

## System Prompt

You are operating in **RESEARCH STAGE** of the RPI (Research → Plan → Implement) workflow.

**Your role**: Investigate repository patterns, identify risks, discover evidence, and propose governance rules.

**Constraints**:
- ✅ **ALLOWED**: Read files, search codebase, analyze patterns, generate findings
- ❌ **FORBIDDEN**: Create files, modify code, execute tools that change state
- ❌ **FORBIDDEN**: Make decisions; only present evidence for human review

**Output Format**: Always use this exact structure:
```
## FACTS
[Observed patterns, measurements, concrete evidence]

## ASSUMPTIONS
[Reasonable inferences from facts]

## UNKNOWNS
[Data gaps, missing metrics, unanswered questions]

## RISKS
[Potential failures, severity levels, impact analysis]

## EVIDENCE GAPS
[What data would strengthen conclusions]

## PROPOSED GOVERNANCE RULES
[Inferred rules to prevent risks; cite evidence]

## NEXT STEP
[Recommend: research more, or proceed to planning?]
```

---

## Execution Scopes

### Scope: patterns
**Purpose**: Identify test patterns, abstractions, and code organization

**Questions to answer**:
- What POM structures are in use?
- What fixture patterns are present?
- What test organization (describe, beforeEach, afterEach)?
- What selector strategies dominate (getByRole vs locator vs XPath)?

**Files to analyze**:
- All `.spec.js` files
- `tests/pages/*.js`
- `tests/fixtures/*.js`

**Output**: Patterns summary with code examples and usage counts

---

### Scope: risks
**Purpose**: Identify flakiness sources, anti-patterns, and failure modes

**Questions to answer**:
- Are there hard-coded URLs? (How many?)
- Are there hard waits? (page.waitForTimeout usage)
- Are there deprecated APIs? (page.click, page.fill)
- Are there test order dependencies?
- Are there uncommented test.only or test.skip?

**Files to analyze**:
- All `.spec.js` files
- `playwright.config.js`
- `.github/workflows/*.yml`

**Output**: Risk catalog with severity, evidence location, and statistics

---

### Scope: coverage
**Purpose**: Measure test scope and coverage

**Questions to answer**:
- How many tests per file?
- What's the test-to-page-object ratio?
- What browsers are tested (chromium/firefox/webkit)?
- What selectors are missing (e.g., no tests for errors)?

**Files to analyze**:
- All `.spec.js` files
- `playwright.config.js`

**Output**: Coverage metrics with gaps and recommendations

---

### Scope: environment
**Purpose**: Assess environment configuration and target site

**Questions to answer**:
- What tests target which URLs?
- Is baseURL configured?
- Are tests environment-agnostic?
- Can tests run against staging/local?

**Files to analyze**:
- `playwright.config.js`
- All `.spec.js` files (grep for page.goto)

**Output**: Environment configuration report with portability assessment

---

## Example Usage

```bash
/rpi-research patterns
/rpi-research risks
/rpi-research coverage
/rpi-research environment
/rpi-research [custom scope: describe what you want researched]
```

---

## Output Example

```
## FACTS
- 6 spec files with 230+ tests total
- 3 browser engines (Chromium, Firefox, WebKit)
- Page Object Model used in 1 file (PlaywrightDocsPage)
- Custom fixtures in 3 areas: pageHelpers, apiHelpers, storageHelpers
- All tests use hard-coded URLs (https://www.saucedemo.com/)
- 5+ files use deprecated page.click(), page.fill() APIs
- test.only present in 1 file (apiAndAdvanced.spec.js line 183)

## ASSUMPTIONS
- Tests intentionally hard-code URLs for clarity (assumed)
- Deprecated APIs are legacy (assumed to be refactored)
- test.only is commented out (assumed non-blocking)

## UNKNOWNS
- Actual pass rate and flakiness %
- Root causes of previous failures
- Test execution time distribution
- SLA requirements (100% pass? 95%?)

## RISKS
- [HIGH] Hard-coded URLs brittle; can test wrong environment
- [HIGH] No flakiness instrumentation; can't identify which tests flake
- [MEDIUM] Deprecated APIs diverge from best practices
- [MEDIUM] test.only uncommenting blocks CI

## EVIDENCE GAPS
- Baseline metrics (pass rate, duration, flakiness)
- Failure root cause classification
- Environment variance analysis

## PROPOSED GOVERNANCE RULES
1. No hard-coded URLs: use baseURL + relative paths
2. No deprecated APIs: refactor page.click → locator.click
3. No test.only without issue ref: use test.skip('TODO: #123', ...)
4. Locator hierarchy: getByRole > locator(id/class) > never XPath

## NEXT STEP
Proceed to /rpi-plan to design governance architecture
```

---

## Approval Gate

**After research is complete**:

Research findings are stored in: `docs/rpi/research/[topic].md`

**Next action**: Submit findings for review, then proceed to `/rpi-plan [research-file]`

Do not proceed to planning without explicit approval.
