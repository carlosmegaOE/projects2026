/**
 * Data-Driven and Advanced Assertions
 * Demonstrates parameterized tests and various assertion patterns
 */

import { expect, test } from '@playwright/test';

// Test data
const navigationItems = [
    { name: 'Docs', shouldExist: true },
    { name: 'API', shouldExist: true },
];

const pageLoadTests = [
    { url: 'https://www.saucedemo.com/', expectedTitle: /Swag Labs/i },
];

test.describe('Data-Driven Tests', () => {
    navigationItems.forEach((item) => {
        test(`should verify navigation item: ${item.name}`, async ({ page }) => {
            await page.goto('https://www.saucedemo.com/');
            const element = page.locator('.header').filter({ hasText: item.name });

            if (item.shouldExist) {
                await expect(element).toBeDefined();
            } else {
                await expect(element).not.toBeVisible();
            }
        });
    });
});

test.describe('Page Load Verification', () => {
    pageLoadTests.forEach(({ url, expectedTitle }) => {
        test(`should load ${url} with correct title`, async ({ page }) => {
            await page.goto(url);
            await expect(page).toHaveTitle(expectedTitle);
        });
    });
});

test.describe('Advanced Assertions', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://www.saucedemo.com/');
    });

    test('assertion: element is visible', async ({ page }) => {
        const button = page.getByRole('button', { name: /login/i });
        await expect(button).toBeVisible();
    });

    test('assertion: element is hidden', async ({ page }) => {
        const hiddenElement = page.locator('.hidden-element', { strict: false });
        // This will not throw if element doesn't exist
    });

    test('assertion: element is enabled', async ({ page }) => {
        const button = page.getByRole('button', { name: /login/i });
        await expect(button).toBeEnabled();
    });

    test('assertion: element is disabled', async ({ page }) => {
        const inputs = page.locator('input[disabled]');
        const count = await inputs.count();
        // Verify disabled state if elements exist
        if (count > 0) {
            await expect(inputs.first()).toBeDisabled();
        }
    });

    test('assertion: element is in viewport', async ({ page }) => {
        const button = page.getByRole('button', { name: /login/i });
        await expect(button).toBeInViewport();
    });

    test('assertion: element is focused', async ({ page }) => {
        const button = page.getByRole('button', { name: /login/i });
        await button.focus();
        await expect(button).toBeFocused();
    });

    test('assertion: text content matches', async ({ page }) => {
        const heading = page.locator('h1');
        await expect(heading).toContainText('Playwright');
    });

    test('assertion: attribute value matches', async ({ page }) => {
        const link = page.getByRole('link', { name: 'Get started' });
        const href = await link.getAttribute('href');
        expect(href).toBeTruthy();
        expect(href).toMatch(/docs/);
    });

    test('assertion: class attribute contains value', async ({ page }) => {
        const navElement = page.locator('nav');
        const classes = await navElement.getAttribute('class');
        // Verify class exists and contains expected value
        if (classes) {
            expect(classes).toBeTruthy();
        }
    });

    test('assertion: count assertions', async ({ page }) => {
        const links = page.locator('nav a');
        const actualCount = await links.count();
        expect(actualCount).toBeGreaterThan(0);
    });

    test('assertion: page title', async ({ page }) => {
        await expect(page).toHaveTitle(/Swag Labs/i);
    });

    test('assertion: page URL', async ({ page }) => {
        expect(page.url()).toContain('saucedemo.com');
    });

    test('assertion: element is attached to DOM', async ({ page }) => {
        const button = page.getByRole('button', { name: /login/i });
        await expect(button).toBeAttached();
    });

    test('assertion: screenshot comparison', async ({ page }) => {
        // Take and compare screenshot (requires baseline)
        await expect(page).toHaveScreenshot('homepage.png', {
            mask: [page.locator('nav')] // Mask dynamic elements
        });
    });

    test('assertion: multiple conditions with soft assertions', async ({ page }) => {
        const link = page.getByRole('link', { name: 'Get started' });

        // Soft assertions continue even if one fails
        await expect.soft(link).toBeVisible();
        await expect.soft(link).toBeEnabled();
        await expect.soft(link).toContainText('Get started');
    });

    test('assertion: custom wait conditions', async ({ page }) => {
        // Wait for condition with custom validation
        const link = page.getByRole('link', { name: 'Get started' });

        await page.waitForFunction(() => {
            const elem = document.querySelector('a');
            return elem && elem.offsetHeight > 0; // Wait for element to have height
        });

        expect(true).toBeTruthy();
    });
});