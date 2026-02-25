/**
 * Page Object Model Tests
 * Demonstrates using Page Objects for maintainable and reusable tests
 */

import { expect, test } from '@playwright/test';
import { PlaywrightDocsPage } from './pages/PlaywrightDocsPage';

test.describe('Sauce Demo - Page Object Model', () => {
    let docsPage;

    test.beforeEach(async ({ page }) => {
        docsPage = new PlaywrightDocsPage(page);
        await docsPage.goto();
    });

    test('should navigate and verify page title', async () => {
        const title = await docsPage.getPageTitle();
        expect(title).toContain('Swag');
    });

    test('should login and verify page', async () => {
        await docsPage.login('standard_user', 'secret_sauce');
        const isVisible = await docsPage.isInventoryVisible();
        expect(isVisible).toBeTruthy();
    });

    test('should have products available', async () => {
        const products = await docsPage.getProductNames();
        expect(products.length).toBeGreaterThan(0);
    });

    test('should add product to cart', async () => {
        const products = await docsPage.getProductNames();
        if (products.length > 0) {
            await docsPage.addProductToCart(products[0]);
        }
        const url = await docsPage.getPageUrl();
        expect(url).toContain('saucedemo.com');
    });

    test('should verify URL points to saucedemo', async ({ page }) => {
        const initialUrl = docsPage.getPageUrl();
        await docsPage.login();
        const newUrl = page.url();
        expect(newUrl).toContain('saucedemo.com');
        expect(newUrl).not.toBe(initialUrl);
    });
});