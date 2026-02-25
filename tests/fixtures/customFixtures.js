import { test as base } from '@playwright/test';

/**
 * Custom fixtures with helper methods and commands
 */

export const test = base.extend({
    // Custom fixture for API testing helpers
    apiHelpers: async ({ }, use) => {
        const helpers = {
            async makeRequest(url, options = {}) {
                const response = await fetch(url, options);
                return {
                    status: response.status,
                    data: await response.json(),
                    headers: Object.fromEntries(response.headers),
                };
            },
            async checkHeaderStatus(page, expectedStatus) {
                const status = page.context().headers;
                return status;
            },
        };
        await use(helpers);
    },

    // Custom fixture for common page operations
    pageHelpers: async ({ page }, use) => {
        const helpers = {
            async waitAndClick(selector) {
                await page.waitForSelector(selector);
                await page.click(selector);
            },

            async fillAndSubmit(formData) {
                for (const [selector, value] of Object.entries(formData)) {
                    await page.fill(selector, value);
                }
                const submitButton = page.locator('button[type="submit"]');
                await submitButton.click();
            },

            async getTextContent(selector) {
                return await page.textContent(selector);
            },

            async waitForText(searchText, timeout = 5000) {
                await page.waitForFunction((t) => {
                    return document.body.innerText.includes(t);
                }, searchText, { timeout });
            },

            async hoverAndClick(hoverSelector, clickSelector) {
                await page.hover(hoverSelector);
                await page.click(clickSelector);
            },

            async takeScreenshot(name) {
                await page.screenshot({ path: `./screenshots/${name}.png` });
            },

            async getElementCount(selector) {
                return await page.locator(selector).count();
            },

            async getAllText(selector) {
                return await page.locator(selector).allTextContents();
            },

            async scrollToElement(selector) {
                await page.locator(selector).scrollIntoViewIfNeeded();
            },

            async waitForNavigation(action) {
                const navigationPromise = page.waitForNavigation();
                await action();
                await navigationPromise;
            },
        };
        await use(helpers);
    },

    // Custom fixture for database/storage operations
    storageHelpers: async ({ context }, use) => {
        const helpers = {
            async setLocalStorage(key, value) {
                await context.addInitScript(({ k, v }) => {
                    window.localStorage.setItem(k, v);
                }, { k: key, v: JSON.stringify(value) });
            },

            async getLocalStorage(page, key) {
                return await page.evaluate(k => {
                    return localStorage.getItem(k);
                }, key);
            },

            async clearStorage(page) {
                await page.evaluate(() => {
                    localStorage.clear();
                    sessionStorage.clear();
                });
            },
        };
        await use(helpers);
    },
});

export { expect } from '@playwright/test';
