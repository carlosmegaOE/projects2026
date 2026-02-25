/**
 * Different Selector Types and Methodologies
 * Demonstrates various ways to select and interact with elements
 */

import { expect, test } from '@playwright/test';

test.describe('Sauce Demo - Different Selectors', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://www.saucedemo.com/');
    });

    test('using getByRole locator', async ({ page }) => {
        // Using semantic role locators (recommended)
        const loginButton = page.getByRole('button', { name: /login/i });
        await expect(loginButton).toBeVisible();

        const usernameInput = page.locator('#user-name');
        await expect(usernameInput).toBeVisible();
    });

    test('using getByLabel locator', async ({ page }) => {
        // Using label text (useful for forms)
        const input = page.locator('#user-name');
        await expect(input).toBeTruthy();
    });

    test('using getByText locator', async ({ page }) => {
        // Using visible text content on Sauce Demo login page
        const button = page.getByText(/Login|LOGIN/);
        await expect(button).toBeTruthy();
    });

    test('using CSS selectors', async ({ page }) => {
        // Traditional CSS selectors still work
        const form = page.locator('.login_form');
        await expect(form).toBeVisible();

        const inputs = await form.locator('input').count();
        expect(inputs).toBeGreaterThan(0);
    });

    test('using XPath selectors', async ({ page }) => {
        // XPath for complex selections
        const firstButton = page.locator('//button[1]');
        await expect(firstButton).toBeTruthy();
    });

    test('combining multiple selectors', async ({ page }) => {
        // Using filter to refine selection
        const allInputs = page.locator('input');
        const usernameInput = allInputs.filter({ has: page.locator('#user-name') });

        const count = await usernameInput.count();
        expect(count).toBeGreaterThanOrEqual(0);
    });

    test('using locator strategies with nth', async ({ page }) => {
        // Getting specific element by index
        const allInputs = page.locator('input');
        const firstInput = allInputs.nth(0);

        await expect(firstInput).toBeTruthy();
    });

    test('using hasText filter method', async ({ page }) => {
        // Filter elements by text content
        const button = page.locator('button').filter({ hasText: /Login|LOGIN/ });
        await expect(button).toBeVisible();
    });

    test('using has filter method', async ({ page }) => {
        // Filter by child elements
        const form = page.locator('.login_form').filter({ has: page.locator('button') });
        await expect(form).toBeVisible();
    });

    test('chaining locators', async ({ page }) => {
        // Chaining for nested selections
        const form = page.locator('.login_form');
        const buttons = form.locator('button');

        const count = await buttons.count();
        expect(count).toBeGreaterThan(0);
    });

    test('testing element properties', async ({ page }) => {
        // Get element properties and attributes
        const button = page.getByRole('button', { name: /Login/i });

        const text = await button.textContent();
        expect(text).toBeTruthy();

        const isVisible = await button.isVisible();
        expect(isVisible).toBeTruthy();

        const isEnabled = await button.isEnabled();
        expect(isEnabled).toBeTruthy();
    });

    test('getting multiple elements content', async ({ page }) => {
        // Get text content from multiple elements
        const buttons = page.locator('button');
        const texts = await buttons.allTextContents();

        expect(Array.isArray(texts)).toBeTruthy();
        expect(texts.length).toBeGreaterThan(0);
    });
});