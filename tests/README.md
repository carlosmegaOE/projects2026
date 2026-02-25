# Playwright Test Examples

This directory contains comprehensive examples of different testing patterns, methodologies, and best practices using Playwright with JavaScript.

## Project Structure

```
tests/
├── pages/
│   └── PlaywrightDocsPage.js       # Page Object Model
├── fixtures/
│   └── customFixtures.js           # Custom fixtures with helpers
├── example.spec.js                 # Original example tests
├── pageObjectModel.spec.js         # Page Object Model pattern
├── customFixturesTests.spec.js     # Custom fixtures and commands
├── differentSelectors.spec.js      # Various selector strategies
├── dataAndAssertions.spec.js       # Data-driven tests and assertions
├── userInteractions.spec.js        # User actions and interactions
└── apiAndAdvanced.spec.js          # API testing and advanced patterns
```

## Test Files Overview

### 1. **pageObjectModel.spec.js** - Page Object Pattern
Demonstrates the Page Object Model (POM) pattern for maintainable and reusable tests.

**Key Features:**
- Encapsulates page interactions in a `PlaywrightDocsPage` class
- Separates selectors from test logic
- Reusable methods like `clickGetStarted()`, `searchFor()`, etc.
- Easier to maintain when UI changes

**Run:**
```bash
npm test pageObjectModel
```

### 2. **customFixturesTests.spec.js** - Custom Fixtures & Commands
Uses custom Playwright fixtures to add helper methods and commands.

**Key Features:**
- `pageHelpers` - Common page operations (click, fill, screenshot)
- `apiHelpers` - API request utilities
- `storageHelpers` - localStorage and sessionStorage management
- Reusable across multiple tests

**Run:**
```bash
npm test customFixturesTests
```

### 3. **differentSelectors.spec.js** - Selector Strategies
Demonstrates various ways to select and interact with elements.

**Key Features:**
- `getByRole()` - Semantic role locators (recommended)
- `getByLabel()` - Label-based selection
- `getByText()` - Text-based selection
- CSS selectors and XPath
- Filter methods (`hasText`, `has`)
- Element attribute and property testing

**Run:**
```bash
npm test differentSelectors
```

### 4. **dataAndAssertions.spec.js** - Data-Driven Tests
Demonstrates parameterized tests and comprehensive assertion patterns.

**Key Features:**
- Data-driven test loops
- Soft assertions (continue after failure)
- State assertions (visible, enabled, focused, etc.)
- Content assertions (title, URL, text)
- Screenshot comparisons

**Run:**
```bash
npm test dataAndAssertions
```

### 5. **userInteractions.spec.js** - User Actions
Demonstrates realistic user interactions with web applications.

**Key Features:**
- Keyboard interactions (typing, shortcuts, special keys)
- Mouse actions (click, double-click, right-click, hover)
- Drag and drop
- Form filling and submission
- File uploads
- Checkbox and radio interactions
- Scrolling (element and page)
- Complex user flows

**Run:**
```bash
npm test userInteractions
```

### 6. **apiAndAdvanced.spec.js** - Advanced Testing
Advanced patterns including API testing, waiting strategies, and debugging.

**Key Features:**
- Network request interception and verification
- Response mocking and modification
- Network request aborting
- Custom timeout configurations
- Multiple waiting strategies
- Console message capture
- Test pausing for debugging
- Conditional test execution
- Custom retry logic
- Test metadata access

**Run:**
```bash
npm test apiAndAdvanced
```

## Key Testing Patterns

### Page Object Model (POM)

```javascript
// Location: tests/pages/PlaywrightDocsPage.js
import { PlaywrightDocsPage } from './pages/PlaywrightDocsPage';

const docsPage = new PlaywrightDocsPage(page);
await docsPage.goto();
await docsPage.clickGetStarted();
```

**Benefits:**
- Centralized element locators
- Improved maintainability
- Reduced duplication
- Easier refactoring

### Custom Fixtures

```javascript
// Location: tests/fixtures/customFixtures.js
import { test, expect } from './fixtures/customFixtures';

test('example', async ({ page, pageHelpers }) => {
  await pageHelpers.waitForNavigation(async () => {
    await page.click('a');
  });
});
```

**Benefits:**
- Reusable helper methods
- Cleaner test code
- Shared setup/teardown logic
- Custom test context

### Selector Best Practices

```javascript
// Recommended: Semantic role locators
const button = page.getByRole('button', { name: 'Submit' });

// Good: Label-based
const input = page.getByLabel('Email');

// Good: Text-based (exact match)
const link = page.getByText('Click here');

// Acceptable: CSS selectors
const element = page.locator('.my-class');

// Last resort: XPath
const element = page.locator('//div[@id="main"]');
```

### Data-Driven Tests

```javascript
const testData = [
  { input: 'value1', expected: 'result1' },
  { input: 'value2', expected: 'result2' },
];

testData.forEach(({ input, expected }) => {
  test(`test with ${input}`, async ({ page }) => {
    // Your test using input and expected
  });
});
```

### Assertions

```javascript
// Visibility
await expect(element).toBeVisible();
await expect(element).toBeHidden();

// State
await expect(element).toBeEnabled();
await expect(element).toBeDisabled();
await expect(element).toBeChecked();
await expect(element).toBeFocused();

// Content
await expect(element).toHaveText('Text');
await expect(element).toContainText('Partial');
await expect(page).toHaveTitle(/Regex/);

// Attributes
await expect(element).toHaveAttribute('href', '/path');
await expect(element).toHaveClass('my-class');

// Count
await expect(elements).toHaveCount(5);

// Custom matchers
await expect(page).toHaveScreenshot('name.png');
```

### User Interactions

```javascript
// Keyboard
await input.type('text');
await input.press('Enter');
await input.press('Tab');

// Mouse
await element.click();
await element.dblclick();
await element.click({ button: 'right' });
await element.hover();

// Scrolling
await element.scrollIntoViewIfNeeded();
await page.evaluate(() => window.scrollBy(0, 500));

// Forms
await input.fill('value');
await select.selectOption('option-value');
await checkbox.check();
```

### Network Interception

```javascript
// Intercept requests
page.on('request', request => {
  console.log('Request:', request.url());
});

// Intercept responses
page.on('response', response => {
  console.log('Response status:', response.status());
});

// Abort requests
await page.route('**/*.png', route => route.abort());

// Mock responses
await page.route('**/api/**', route => {
  route.abort('blockedbyclient');
});
```

### Waiting Strategies

```javascript
// Wait for element
await element.waitFor({ state: 'visible', timeout: 5000 });

// Wait for navigation
const navigationPromise = page.waitForNavigation();
await page.click('a');
await navigationPromise;

// Wait for function
await page.waitForFunction(() => {
  return document.querySelectorAll('a').length > 5;
});

// Wait for load state
await page.waitForLoadState('networkidle');
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in headed mode (visible browser)
npm run test:headed

# Run tests with UI (Playwright Inspector)
npm run test:ui

# Run specific test file
npm test pageObjectModel

# Run tests with a specific browser
npm test -- --project=chromium

# Run tests in debug mode
npm test -- --debug

# Generate and view HTML report
npm test
npx playwright show-report
```

## Configuration

Edit `playwright.config.js` to:
- Set `baseURL` for tests
- Configure browsers and devices
- Set up web server
- Adjust timeouts
- Configure reporters

### Example: Set Base URL

```javascript
export default defineConfig({
  use: {
    baseURL: 'http://localhost:3000',
  },
  // ...
});
```

### Example: Add Mobile Testing

```javascript
projects: [
  {
    name: 'Mobile Chrome',
    use: { ...devices['Pixel 5'] },
  },
  {
    name: 'Mobile Safari',
    use: { ...devices['iPhone 12'] },
  },
  // ... other browsers
],
```

## Best Practices

1. **Use semantic role locators** - `getByRole()` is most reliable
2. **Implement Page Object Model** - Reduces maintenance overhead
3. **Avoid hard waits** - Use proper wait strategies
4. **Keep tests focused** - One action per test when possible
5. **Use soft assertions** - For multiple checks in a test
6. **Organize tests** - Group related tests with `test.describe()`
7. **Create fixtures** - For shared test utilities
8. **Mock external services** - Keep tests fast and reliable
9. **Capture screenshots** - For debugging failures
10. **Use meaningful test names** - Describe what is being tested

## Documentation

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Locators Guide](https://playwright.dev/docs/locators)
- [Assertions Guide](https://playwright.dev/docs/assertions)
- [Test API](https://playwright.dev/docs/api/class-test)

## Troubleshooting

### Tests are flaky
- Use proper wait conditions instead of `page.waitForTimeout()`
- Check for race conditions in test setup
- Use `test.slow()` for slower tests

### Element not found
- Use Playwright Inspector: `npm test -- --debug`
- Check if element is in viewport: `element.scrollIntoViewIfNeeded()`
- Verify element exists before interaction: `await element.count()`

### Tests timeout
- Increase timeout in test: `test.setTimeout(60000)`
- Check network conditions: `await page.waitForLoadState('networkidle')`
- Verify application is responsive

## Contributing

When adding new test examples:
1. Add to appropriate test file or create new one
2. Document the pattern in this README
3. Include comments explaining the approach
4. Verify tests pass: `npm test`
5. Check code quality: clean, maintainable, well-organized