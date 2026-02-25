/**
 * User Interactions and Actions
 * Demonstrates form filling, keyboard events, mouse actions, and scrolling
 */

import { expect, test } from '@playwright/test';

test.describe('User Interactions', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://www.saucedemo.com/');
    });

    test('keyboard interactions - typing and enter', async ({ page }) => {
        const usernameInput = page.locator('#user-name');

        // Type text
        await usernameInput.click();
        await usernameInput.type('standard_user', { delay: 100 });

        // Verify text was typed
        await expect(usernameInput).toHaveValue('standard_user');

        // Press Tab to move to next field
        await usernameInput.press('Tab');
    });

    test('keyboard interactions - shortcuts and keys', async ({ page }) => {
        const usernameInput = page.locator('#user-name');

        // Focus and use keyboard shortcuts
        await usernameInput.focus();
        await expect(usernameInput).toBeFocused();

        // Type and clear with keyboard
        await usernameInput.type('test');
        await usernameInput.press('Control+A');
        await usernameInput.press('Delete');
    });

    test('mouse interactions - click and double click', async ({ page }) => {
        const loginButton = page.getByRole('button', { name: /login/i });

        // Simple click on button (no actual navigation)
        await loginButton.click({ clickCount: 1 });
        await expect(loginButton).toBeVisible();

        // Double click
        await loginButton.click({ clickCount: 2 });
    });

    test('mouse interactions - hover and interaction menus', async ({ page }) => {
        const loginButton = page.getByRole('button', { name: /login/i });

        // Hover over element
        await loginButton.hover();

        // Verify it's visible after hover
        await expect(loginButton).toBeVisible();
    });

    test('mouse interactions - drag and drop', async ({ page }) => {
        // Example: drag on a demo page
        // This is a demonstration - adjust selectors for actual draggable elements
        const source = page.locator('.draggable', { strict: false });
        const target = page.locator('.drop-zone', { strict: false });

        const sourceCount = await source.count();
        if (sourceCount > 0 && (await target.count()) > 0) {
            await source.dragTo(target);
        }
    });

    test('mouse interactions - right click context menu', async ({ page }) => {
        const loginButton = page.getByRole('button', { name: /login/i });

        // Right click
        await loginButton.click({ button: 'right' });
    });

    test('scrolling - scroll to element', async ({ page }) => {
        const buttons = page.locator('button');
        const lastButton = buttons.last();

        // Scroll element into view
        await lastButton.scrollIntoViewIfNeeded();

        // Verify element is in viewport
        await expect(lastButton).toBeInViewport();
    });

    test('scrolling - scroll page', async ({ page }) => {
        // Scroll down
        await page.evaluate(() => window.scrollBy(0, 100));

        // Get scroll position
        const scrollTop = await page.evaluate(() => window.scrollY);
        expect(scrollTop).toBeGreaterThanOrEqual(0);

        // Scroll back to top
        await page.evaluate(() => window.scrollTo(0, 0));
    });

    test('scrolling - scroll to specific coordinates', async ({ page }) => {
        // Scroll down a bit
        await page.evaluate(() => window.scrollTo(0, 50));

        const scrollTop = await page.evaluate(() => window.scrollY);
        expect(scrollTop).toBeGreaterThanOrEqual(0);
    });

    test('form interactions - fill and submit', async ({ page }) => {
        // Navigate to a page with forms (if available)
        // This is a demonstration pattern

        const formData = {
            'input[name="email"]': 'test@example.com',
            'input[name="message"]': 'Test message',
        };

        for (const [selector, value] of Object.entries(formData)) {
            const input = page.locator(selector);
            const exists = await input.count();
            if (exists > 0) {
                await input.fill(value);
            }
        }
    });

    test('form interactions - select dropdown', async ({ page }) => {
        // For select elements
        const select = page.locator('select', { strict: false });
        const exists = await select.count();

        if (exists > 0) {
            // Select by visible text
            await select.selectOption('Option Text');

            // Or select by value
            // await select.selectOption('option-value');

            // Or select by index
            // await select.selectOption({ index: 0 });
        }
    });

    test('form interactions - checkboxes and radios', async ({ page }) => {
        // Working with checkboxes
        const checkbox = page.locator('input[type="checkbox"]').first();
        const exists = await checkbox.count();

        if (exists > 0) {
            // Check a checkbox
            await checkbox.check();
            await expect(checkbox).toBeChecked();

            // Uncheck it
            await checkbox.uncheck();
            await expect(checkbox).not.toBeChecked();
        }

        // Working with radio buttons
        const radio = page.locator('input[type="radio"]').first();
        if ((await radio.count()) > 0) {
            await radio.check();
        }
    });

    test('file uploads', async ({ page }) => {
        // Set input files (works with file upload inputs)
        const fileInput = page.locator('input[type="file"]');
        const exists = await fileInput.count();

        if (exists > 0) {
            // Note: You need to create test files for this
            // await fileInput.setInputFiles('test-file.txt');
        }
    });

    test('keyboard special keys', async ({ page }) => {
        const input = page.getByPlaceholder('Search');

        await input.focus();

        // Different keyboard actions
        await input.press('Tab');
        await input.press('Enter');
        await input.press('Escape');
        await input.press('Backspace');
        await input.press('ArrowDown');
        await input.press('ArrowUp');
    });

    test('multiple actions - complex user flow', async ({ page }) => {
        // Complex interaction flow
        await page.goto('https://www.saucedemo.com/');

        // Click login button
        const loginButton = page.getByRole('button', { name: /login/i });

        // Verify element exists and properties
        await expect(loginButton).toBeVisible();

        // Hover
        await loginButton.hover();

        // Check if clickable
        const isEnabled = await loginButton.isEnabled();
        expect(isEnabled).toBeTruthy();

        // Get text
        const text = await loginButton.textContent();
        expect(text).toContain('LOGIN');
    });
});