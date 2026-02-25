/**
 * Page Object Model for Sauce Demo site
 * Encapsulates page interactions and locators
 */

export class PlaywrightDocsPage {
    constructor(page) {
        this.page = page;
        // Define locators for Sauce Demo
        this.usernameInput = page.locator('#user-name');
        this.passwordInput = page.locator('#password');
        this.loginButton = page.getByRole('button', { name: /login/i });
        this.inventoryContainer = page.locator('.inventory_list');
        this.productItems = page.locator('.inventory_item');
        this.pageTitle = page.locator('.login_logo');
    }

    async goto() {
        await this.page.goto('https://www.saucedemo.com/');
    }

    async login(username = 'standard_user', password = 'secret_sauce') {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }

    async searchFor(query) {
        // Sauce Demo doesn't have a search box, but you can filter by clicking product items
        return query;
    }

    async getPageTitle() {
        return await this.pageTitle.textContent();
    }

    async isInventoryVisible() {
        return await this.inventoryContainer.isVisible();
    }

    async getProductNames() {
        return await this.productItems.locator('.inventory_item_name').allTextContents();
    }

    async getProductByName(productName) {
        const product = await this.page.locator('.inventory_item', { hasText: productName });
        return product;
    }

    async addProductToCart(productName) {
        const product = await this.getProductByName(productName);
        await product.locator('button:has-text("Add to cart")').click();
    }

    async getPageUrl() {
        return this.page.url();
    }
}