# Playwright Test Governance Instructions

**Scope**: Guidance for Copilot when generating or reviewing Playwright tests  
**Audience**: QA engineers, developers, Copilot agents  
**Authority**: Repository-level standard  

---

## Locator Strategy Hierarchy

**Use in this order. Do not skip levels.**

### Priority 1: REQUIRED (Semantic Locators)
```javascript
// Best: Role-based
page.getByRole('button', { name: 'Login' })
page.getByRole('link', { name: 'Documentation' })
page.getByRole('heading', { level: 1 })

// Good: Label-based
page.getByLabel('Email Address')
page.getByLabel('Password')

// Good: Text-based (exact match)
page.getByText('Submit')
page.getByText('Click here')
```

### Priority 2: ACCEPTABLE (CSS/ID Selectors)
```javascript
// CSS class (when role/label unavailable)
page.locator('.login-button')
page.locator('.form-input')

// ID selector (specific, fast)
page.locator('#user-name')
page.locator('#password')
```

### Priority 3: FORBIDDEN (Anti-Patterns)
```javascript
// ❌ NEVER: XPath (brittle, slow, hard to maintain)
page.locator('//div[@class="login"]')
page.locator('//button[text()="Submit"]')

// ❌ NEVER: Generic selectors (fragile)
page.locator('nav a')  // which link?
page.locator('div > button')  // which button?

// ❌ NEVER: Deprecated APIs (old Playwright)
page.click(selector)  // use: locator.click()
page.fill(selector)   // use: locator.fill()
page.type(selector)   // use: locator.type()
```

---

## Page Object Model (POM) Structure

### Approved Pattern
```javascript
/**
 * Page Object for Sauce Demo Login
 * Purpose: Encapsulate login interactions and selectors
 */
export class LoginPage {
  constructor(page) {
    this.page = page;
    // Define locators ONCE
    this.usernameInput = page.locator('#user-name');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.getByRole('button', { name: /login/i });
    this.errorMessage = page.locator('[data-test="error"]');
  }

  async navigate() {
    await this.page.goto('/');
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getErrorText() {
    return await this.errorMessage.textContent();
  }
}
```

### Anti-Patterns
```javascript
// ❌ WRONG: Inline selectors
async login(page, username, password) {
  await page.click('#user-name');  // inline selector
  await page.fill('#user-name', username);  // repeated
}

// ❌ WRONG: Generic methods
async clickButton() {
  await page.click('button');  // which button?
}

// ❌ WRONG: No encapsulation
// Selectors exposed everywhere, hard to maintain
await page.click('nav a.profile');
```

---

## Fixture API Standards

### Required: Use Modern Playwright APIs

```javascript
// ✅ CORRECT
await locator.click();
await locator.fill('text');
await locator.type('text', { delay: 100 });
await locator.check();  // for checkboxes
await locator.select('option');
await locator.scrollIntoViewIfNeeded();

// ❌ DEPRECATED (remove from all fixtures)
await page.click(selector);
await page.fill(selector, text);
await page.type(selector, text);
await page.check(selector);
```

### Approved Fixture Pattern

```javascript
import { test as base } from '@playwright/test';

export const test = base.extend({
  pageHelpers: async ({ page }, use) => {
    const helpers = {
      async waitAndClick(selector) {
        // Modern API
        await page.locator(selector).waitFor({ state: 'visible' });
        await page.locator(selector).click();
      },
      
      async fillForm(formData) {
        for (const [selector, value] of Object.entries(formData)) {
          await page.locator(selector).fill(value);
        }
      },
    };
    await use(helpers);
  },
});

export { expect } from '@playwright/test';
```

---

## Test Naming Convention

### Required Format
```
test('should [action on element] [expected result]', async ({ page }) => {
  // Test body
});
```

### Approved Examples
```javascript
// ✅ CORRECT
test('should login with valid credentials', async ({ page }) => {})
test('should display error on invalid username', async ({ page }) => {})
test('should add product to cart and verify count', async ({ page }) => {})
test('should logout and redirect to login page', async ({ page }) => {})

// ❌ WRONG: Parameterized names (no forEach)
test(`should verify ${item.name}`, async ({ page }) => {})  // ❌ Not unique

// ❌ WRONG: Too vague
test('login test', async ({ page }) => {})
test('happy path', async ({ page }) => {})
```

### Data-Driven Tests (Correct Format)
```javascript
// ✅ CORRECT: Unique test names
const credentials = [
  { username: 'standard_user', password: 'secret_sauce', label: 'standard' },
  { username: 'locked_out_user', password: 'secret_sauce', label: 'locked' },
];

credentials.forEach(({ username, password, label }) => {
  test(`should handle ${label} user login`, async ({ page }) => {
    // Test body
  });
});
```

---

## State Management & Cleanup

### Required: Explicit State Reset

```javascript
// ✅ CORRECT: Each test is independent
test.describe('Shopping Cart', () => {
  test('should add product to cart', async ({ page, loginPage }) => {
    await loginPage.login('standard_user', 'secret_sauce');
    await addProductToCart('Sauce Labs Backpack');
    // Cleanup: implicit through navigation reset
  });

  test('should remove product from cart', async ({ page, loginPage }) => {
    // Must re-login, not depend on previous test
    await loginPage.login('standard_user', 'secret_sauce');
    await addProductToCart('Sauce Labs Backpack');
    await removeProductFromCart('Sauce Labs Backpack');
  });

  test.afterEach(async ({ page }) => {
    // Reset state after each test
    await page.goto('/');  // Navigate to known state
  });
});
```

### Forbidden: Shared State
```javascript
// ❌ WRONG: Tests depend on execution order
test('add product', async ({ page }) => {
  // This test must run first
});

test('remove product', async ({ page }) => {
  // This assumes previous test passed and data exists
  // BREAKS if run in different order
});
```

---

## Timeout Configuration

### Accepted Patterns

```javascript
// Pattern 1: Navigation (10 seconds)
await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 });

// Pattern 2: Form Submission (5 seconds)
await expect(submitButton).toBeEnabled();  // default 5s timeout
await submitButton.click();

// Pattern 3: API Wait (3 seconds)
await page.waitForFunction(
  () => window.fetchComplete === true,
  { timeout: 3000 }
);

// Pattern 4: Custom wait with reasonable timeout
await page.waitForLoadState('networkidle');  // uses config default (30s)
```

### Forbidden Patterns
```javascript
// ❌ WRONG: Hard waits (flaky, slow, unpredictable)
await page.waitForTimeout(5000);  // arbitrary sleep

// ❌ WRONG: Excessive timeouts (hides performance issues)
await page.waitForNavigation({ timeout: 60000 });  // 60s is too long
```

---

## Test Isolation & Fixtures

### Required: Setup/Teardown
```javascript
test.describe('User Management', () => {
  let userId;

  test.beforeEach(async ({ page, loginPage }) => {
    await loginPage.login('admin', 'password');
    userId = await createTestUser(page);
  });

  test.afterEach(async ({ page }) => {
    // Cleanup EVERY test
    if (userId) {
      await deleteTestUser(page, userId);
    }
    // Reset to known state
    await page.goto('/logout');
  });

  test('should display user profile', async ({ page }) => {
    // Test body; setup and teardown are guaranteed
  });
});
```

---

## Assertions Best Practices

### Soft Assertions (for multiple checks)
```javascript
// ✅ CORRECT: Multiple assertions don't stop on first failure
test('should display login form correctly', async ({ page }) => {
  const form = page.locator('.login-form');
  
  await expect.soft(page).toHaveTitle(/Sauce Labs/);
  await expect.soft(form.locator('#user-name')).toBeVisible();
  await expect.soft(form.locator('#password')).toBeVisible();
  await expect.soft(form.getByRole('button', { name: 'Login' })).toBeEnabled();
  
  // All 4 assertions run; report all failures
});
```

### Hard Assertions (stop on first failure)
```javascript
// ✅ CORRECT: Stop immediately on critical check
test('should redirect after login', async ({ page }) => {
  await loginPage.login('standard_user', 'secret_sauce');
  
  // Critical: fail fast if not logged in
  await expect(page).toHaveURL('/inventory');  // hard assertion
  
  // Only continue if URL check passed
  const heading = page.getByRole('heading', { level: 1 });
  await expect(heading).toContainText('Products');
});
```

---

## Anti-Patterns Checklist

**FORBIDDEN in all Playwright tests:**

| Anti-Pattern | Why | Alternative |
|---|---|---|
| `test.only`, `test.skip` (without issue ref) | Blocks CI; hides failures | Use `test.skip(condition, 'TODO: #123')` |
| Hard-coded URLs | Brittle; can test wrong env | Use `page.goto('/path')` + baseURL config |
| XPath locators | Slow, fragile, hard to maintain | Use getByRole, getByLabel, locator(id/class) |
| `page.click()`, `page.fill()` | Deprecated APIs | Use `locator.click()`, `locator.fill()` |
| Parameterized test names | Not unique; can't isolate failures | Use label variables, not test name params |
| Shared test state | Order-dependent; breaks on re-run | Use beforeEach setup for each test |
| `page.waitForTimeout(ms)` | Flaky; slow; hides bugs | Use waitForSelector, waitForFunction, waitForNavigation |
| Global fixture state | Side effects across tests | Reset in afterEach or use test-scoped fixtures |

---

## Review Checklist for Copilot

When Copilot generates or reviews test code, verify:

- [ ] **Locators**: Only getByRole, getByLabel, getByText, or locator(id/class)?
- [ ] **POM**: Selectors encapsulated? Methods descriptive?
- [ ] **Naming**: Each test has unique, descriptive name?
- [ ] **State**: Each test independent? afterEach cleanup present?
- [ ] **APIs**: No deprecated methods (page.click, page.fill)?
- [ ] **Fixtures**: Using approved base-fixtures, not ad-hoc helpers?
- [ ] **Fixtures**: Using modern locator.* APIs?
- [ ] **Timeouts**: Reasonable per-pattern thresholds?
- [ ] **test.only/skip**: Only with GitHub issue reference?
- [ ] **URLs**: No hard-coded URLs? Using baseURL + relative paths?

---

## Quick Reference

| Concept | REQUIRED | ACCEPTABLE | FORBIDDEN |
|---------|----------|-----------|-----------|
| **Locator** | getByRole | locator(id/class) | XPath, nav a, div > btn |
| **API** | locator.click() | page.waitForNavigation() | page.click() |
| **Fixture** | base-fixtures | custom (modern API) | custom (deprecated API) |
| **State** | Independent tests | beforeEach/afterEach | Shared state |
| **Naming** | Descriptive, unique | Data-driven with labels | Parameterized names |
| **URL** | Relative (/path) | - | Hard-coded (https://...) |
| **Wait** | Selector/function waits | Navigation waits | waitForTimeout |

---

## Questions?

Reference: `.github/copilot-instructions.md` for repository governance  
Research: `docs/rpi/research/copilot-governance.md` for rationale
