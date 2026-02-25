import { expect, test } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Swag Labs/i);
});

test('login page displayed', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');

    // Verify login form is visible
    const loginButton = page.getByRole('button', { name: /login/i });
    await expect(loginButton).toBeVisible();
});