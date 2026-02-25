/**
 * Custom Fixtures and Commands Tests
 * Demonstrates using custom fixtures with helper methods
 */

import { expect, test } from './fixtures/customFixtures';

test.describe('Sauce Demo - With Custom Fixtures', () => {
    test('should use page helpers to navigate and wait for text', async ({ page, pageHelpers }) => {
        await page.goto('https://www.saucedemo.com/');

        // Use custom helper to get text content
        const title = await pageHelpers.getTextContent('h1');
        expect(title).toContain('Swag');
    });

    test('should scroll and interact with elements using helpers', async ({ page, pageHelpers }) => {
        await page.goto('https://www.saucedemo.com/');

        // Use custom helper to get all text from buttons
        const buttons = await pageHelpers.getAllText('button');
        expect(buttons.length).toBeGreaterThan(0);
    });

    test('should click login and verify page loaded', async ({ page, pageHelpers }) => {
        await page.goto('https://www.saucedemo.com/');

        const usernameInput = page.locator('#user-name');
        const passwordInput = page.locator('#password');
        await usernameInput.fill('standard_user');
        await passwordInput.fill('secret_sauce');
        const loginButton = page.getByRole('button', { name: /login/i });
        await loginButton.click();

        // Wait a moment for page to load
        await page.waitForLoadState('networkidle');

        // Verify we're on the docs site
        expect(linkCount).toBeGreaterThan(0);
    });

    test('should use storage helpers to manage localStorage', async ({ page, context, storageHelpers }) => {
        // Set some data in localStorage before navigation
        await storageHelpers.setLocalStorage('testKey', { value: 'testData' });

        await page.goto('https://www.saucedemo.com/');

        // Get the stored data
        const stored = await storageHelpers.getLocalStorage(page, 'testKey');
        expect(stored).toBeDefined();
    });
});