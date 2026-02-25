/**
 * LoginPage - Page Object Model for Sauce Demo login flow
 * 
 * Locator Strategy:
 * - Primary: getByRole() for semantic, accessible elements
 * - Secondary: getByLabel() for form inputs
 * - Fallback: data-test attributes for stable identifiers
 * 
 * Waiting Strategy:
 * - No arbitrary sleeps (page.waitForTimeout())
 * - Explicit waits for navigation (page.waitForURL())
 * - Web-first assertions (expect(...).toBeVisible())
 * 
 * Reference: .github/instructions/playwright.instructions.md
 */

export class LoginPage {
    constructor(page) {
        this.page = page;
        this.baseURL = 'https://www.saucedemo.com';
    }

    async goto() {
        await this.page.goto(this.baseURL);
        // Wait for login form to be ready
        await this.page.getByRole('button', { name: /login/i }).waitFor({ state: 'visible' });
    }

    /**
     * Get username input field
     * Locator: getByRole('textbox') filtered by placeholder
     * Fallback: CSS selector #user-name
     */
    getUsername() {
        return this.page.locator('input#user-name');
    }

    /**
     * Get password input field
     * Locator: getByRole('textbox') filtered by type
     * Fallback: CSS selector #password
     */
    getPassword() {
        return this.page.locator('input#password');
    }

    /**
     * Get login button
     * Locator: getByRole('button') with name contains "login"
     * Fallback: CSS selector button[type="submit"]
     */
    getLoginButton() {
        return this.page.getByRole('button', { name: /login/i });
    }

    /**
     * Get error message banner
     * Locator: getByRole('alert') preferred
     * Fallback: data-test attribute for stability
     */
    getErrorBanner() {
        return this.page.locator('[data-test="error"]');
    }

    /**
     * Fill username field
     * @param {string} username - Username to enter
     */
    async fillUsername(username) {
        await this.getUsername().fill(username);
    }

    /**
     * Fill password field
     * @param {string} password - Password to enter
     */
    async fillPassword(password) {
        await this.getPassword().fill(password);
    }

    /**
     * Submit login form
     * 
     * Behavior:
     * - Clicks login button
     * - Waits for navigation to complete (URL change to /inventory or /error)
     * - Does NOT wait for element visibility (that's test responsibility)
     */
    async submitLogin() {
        // Network waits for URL change (login API response triggers navigation)
        const navigationPromise = this.page.waitForURL(/inventory/, { timeout: 10000 });

        await this.getLoginButton().click();

        try {
            await navigationPromise;
        } catch (error) {
            // If URL wait fails, error banner may be visible instead
            // Test will handle assertion
        }
    }

    /**
     * Login with username and password
     * Convenience method that combines fill + submit
     * 
     * @param {string} username - Username
     * @param {string} password - Password
     */
    async login(username, password) {
        await this.fillUsername(username);
        await this.fillPassword(password);
        await this.submitLogin();
    }

    /**
     * Wait for inventory page to load
     * Indicates successful login
     * 
     * @param {number} timeout - Max wait time in milliseconds (default: 10000)
     */
    async waitForInventoryPage(timeout = 10000) {
        // Wait for URL to contain /inventory
        await this.page.waitForURL(
            /inventory/,
            { timeout }
        );

        // Wait for inventory list to be visible (web-first assertion)
        await this.page
            .locator('.inventory_list')
            .waitFor({ state: 'visible', timeout });
    }

    /**
     * Wait for error banner and confirm visibility
     * Indicates login failure (invalid credentials, etc.)
     * 
     * @param {number} timeout - Max wait time in milliseconds (default: 10000)
     */
    async waitForErrorBanner(timeout = 10000) {
        // First, wait for error banner to be attached to DOM
        const errorBanner = this.getErrorBanner();

        await errorBanner.waitFor({ state: 'attached', timeout });

        // Then, wait for it to be visible
        await errorBanner.waitFor({ state: 'visible', timeout });

        return errorBanner;
    }

    /**
     * Get text of error banner
     * 
     * @returns {Promise<string>} Error message text
     */
    async getErrorText() {
        const banner = await this.waitForErrorBanner();
        return banner.textContent();
    }

    /**
     * Check if user is logged in
     * Heuristic: Check if inventory page URL is present
     * 
     * @returns {Promise<boolean>} True if logged in, false otherwise
     */
    async isLoggedIn() {
        return this.page.url().includes('/inventory');
    }

    /**
     * Logout
     * Clicks logout button in the app menu
     */
    async logout() {
        const menuButton = this.page.locator('#react-burger-menu-btn');
        await menuButton.click();

        const logoutButton = this.page.locator('#logout_sidebar_link');
        await logoutButton.click();

        // Wait for redirect to login page
        await this.page.waitForURL(`${this.baseURL}/`, { timeout: 5000 });
    }
}
