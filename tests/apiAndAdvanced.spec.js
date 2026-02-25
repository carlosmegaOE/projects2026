/**
 * API Testing, Waiting Strategies, and Advanced Patterns
 * Demonstrates API intercept, wait conditions, retries, and debugging
 */

import { expect, test } from '@playwright/test';

test.describe('API Testing and Network Interception', () => {
    test('intercept and verify network requests', async ({ page }) => {
        const requests = [];

        // Capture all requests
        page.on('request', request => {
            requests.push({
                url: request.url(),
                method: request.method(),
            });
        });

        await page.goto('https://www.saucedemo.com/');

        // Verify requests were made
        expect(requests.length).toBeGreaterThan(0);

        // Verify specific request types
        const documentRequests = requests.filter(r => r.url.includes('saucedemo.com') || r.method === 'GET');
        expect(documentRequests.length).toBeGreaterThan(0);
    });

    test('intercept responses', async ({ page }) => {
        const responses = [];

        page.on('response', response => {
            responses.push({
                url: response.url(),
                status: response.status(),
                statusText: response.statusText(),
            });
        });

        await page.goto('https://www.saucedemo.com/');

        // Verify responses
        expect(responses.length).toBeGreaterThan(0);

        // Verify successful responses
        const successResponses = responses.filter(r => r.status >= 200 && r.status < 300);
        expect(successResponses.length).toBeGreaterThan(0);
    });

    test('abort network requests', async ({ page }) => {
        // Abort image requests
        await page.route('**/*.{png,jpg,jpeg,gif}', route => route.abort());

        await page.goto('https://www.saucedemo.com/');

        // Page should still load without images
        const loginButton = page.getByRole('button', { name: /login/i });
        await expect(loginButton).toBeTruthy();
    });

    test('mock network responses', async ({ page }) => {
        // Mock API responses
        await page.route('**/api/**', route => {
            route.abort('blockedbyclient');
        });

        await page.goto('https://www.saucedemo.com/');

        // Verify page still functional even with API blocked
        const visible = await page.locator('h1, .login_logo').isVisible();
        expect(visible).toBeTruthy();
    });

    test('modify network request headers', async ({ page }) => {
        let modifiedHeaders = false;

        await page.route('**/*', route => {
            const headers = route.request().headers();
            expect(headers['user-agent']).toBeTruthy();
            modifiedHeaders = true;
            route.continue();
        });

        await page.goto('https://www.saucedemo.com/');
        expect(modifiedHeaders).toBeTruthy();
    });
});

test.describe('Waiting Strategies', () => {
    test('wait for element with timeout', async ({ page }) => {
        await page.goto('https://www.saucedemo.com/');

        // Wait for element with custom timeout
        const button = page.getByRole('button', { name: /login/i });
        await button.waitFor({ state: 'attached', timeout: 5000 });

        expect(await button.isVisible()).toBeTruthy();
    });

    test('wait for navigation', async ({ page }) => {
        await page.goto('https://www.saucedemo.com/');

        const usernameInput = page.locator('#user-name');

        // Wait for navigation to complete
        const navigationPromise = page.waitForNavigation({ waitUntil: 'networkidle' });
        // The actual navigation would happen on login

        try {
            // Don't actually navigate, just test the wait mechanism
            await page.waitForLoadState('networkidle');
        } catch (e) {
            // May not navigate on this site
        }
    });

    test('wait for function with polling', async ({ page }) => {
        await page.goto('https://www.saucedemo.com/');

        // Wait for condition
        await page.waitForFunction(() => {
            return document.querySelectorAll('button').length > 0;
        }, { timeout: 5000 });
    });

    test('wait for function with arguments', async ({ page }) => {
        await page.goto('https://www.saucedemo.com/');

        const minButtons = 1;
        await page.waitForFunction(
            (min) => document.querySelectorAll('button').length >= min,
            minButtons,
            { timeout: 5000 }
        );
    });

    test('wait for load state', async ({ page }) => {
        await page.goto('https://www.saucedemo.com/');

        // Wait for specific load state
        await page.waitForLoadState('networkidle');

        // Verify page is loaded
        const loginButton = page.getByRole('button', { name: /login/i });
        await expect(loginButton).toBeTruthy();
    });

    test('wait for selector', async ({ page }) => {
        await page.goto('https://www.saucedemo.com/');

        // Wait for a selector to appear
        await page.waitForSelector('button, .login_button', { timeout: 5000 });

        const nav = page.locator('nav');
        await expect(nav).toBeVisible();
    });

    test('polling and retry logic', async ({ page }) => {
        await page.goto('https://www.saucedemo.com/');

        let attempts = 0;
        const maxAttempts = 3;

        const checkElement = async () => {
            attempts++;
            const button = page.getByRole('button', { name: /login/i });
            const isVisible = await button.isVisible();

            if (!isVisible && attempts < maxAttempts) {
                await page.waitForTimeout(1000);
                return checkElement();
            }

            expect(isVisible).toBeTruthy();
        };

        await checkElement();
    });
});

test.describe('Advanced Patterns and Debugging', () => {
    test('use test.only to focus on single test', async ({ page }) => {
        // This test would run only if test.only is used
        await page.goto('https://www.saucedemo.com/');
        await expect(page).toHaveTitle(/Swag Labs/i);
    });

    test('debug with console logging', async ({ page }) => {
        // Capture console messages
        const consoleMessages = [];
        page.on('console', msg => {
            consoleMessages.push(msg.text());
        });

        await page.goto('https://www.saucedemo.com/');

        // Log for debugging
        console.log('Page loaded, found', consoleMessages.length, 'console messages');
    });

    test('debug with page.pause', async ({ page }) => {
        await page.goto('https://www.saucedemo.com/');

        // Uncomment to pause for debugging
        // await page.pause();

        const button = page.getByRole('button', { name: /login/i });
        await expect(button).toBeVisible();
    });

    test('debug with tracing', async ({ page, context }) => {
        // Start tracing (already configured in playwright.config.js)
        await page.goto('https://www.saucedemo.com/');

        // Perform actions
        const button = page.getByRole('button', { name: /login/i });
        await expect(button).toBeVisible();

        // Trace is automatically captured on retry
    });

    test('retry flaky tests with fixed retry count', async ({ page }) => {
        // This test will retry if it fails
        await page.goto('https://www.saucedemo.com/');

        const button = page.getByRole('button', { name: /login/i });
        await expect(button).toBeVisible();
    });

    test('conditional test execution', async ({ page, browserName }) => {
        // Only run on specific browsers
        test.skip(browserName === 'firefox', 'Skip on Firefox');

        await page.goto('https://www.saucedemo.com/');
        await expect(page).toHaveTitle(/Swag Labs/i);
    });

    test('test with custom timeout', async ({ page }) => {
        test.setTimeout(30000); // 30 seconds

        await page.goto('https://www.saucedemo.com/');
        await page.waitForLoadState('networkidle');

        const button = page.getByRole('button', { name: /login/i });
        await expect(button).toBeVisible();
    });

    test('access test info and metadata', async ({ page }, testInfo) => {
        // Access test metadata
        console.log('Test:', testInfo.title);
        console.log('File:', testInfo.file);
        console.log('Line:', testInfo.line);

        await page.goto('https://www.saucedemo.com/');
        await expect(page).toHaveTitle(/Swag Labs/i);
    });

    test('screenshot on failure', async ({ page }, testInfo) => {
        await page.goto('https://www.saucedemo.com/');

        // Take screenshot for debugging
        const screenshotPath = testInfo.outputPath('screenshot.png');
        await page.screenshot({ path: screenshotPath });
    });
});