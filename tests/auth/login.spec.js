/**
 * Login Flow Tests - Authentication Module
 * 
 * RPI Scope: Stabilization of intermittent timeouts in login flow
 * Reference: docs/rpi/plan/checkout-login-stabilization.md
 * 
 * Selectors: Role-based (getByRole) > data-test > CSS fallback
 * Assertions: Web-first (expect().toBeVisible) with explicit waits
 * Retries: None (root cause fixed, not masked with retries)
 */

import { expect, test } from '@playwright/test';
import { LoginPage } from '../../pages/auth/LoginPage.js';

// Test data - stable credentials
const VALID_USER = 'standard_user';
const VALID_PASSWORD = 'secret_sauce';
const INVALID_PASSWORD = 'wrong_password';
const LOCKED_USER = 'locked_out_user';

/**
 * Fixture: loginPage
 * Provides LoginPage instance scoped to each test
 * Ensures page is fresh for each test (isolation)
 */
test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
});

test.describe('Login Flow', () => {
    /**
     * Test: Successful login with valid credentials
     * 
     * What it tests:
     * - Username and password fields accept input
     * - Login button navigates to inventory page
     * - Inventory list is visible after successful auth
     * 
     * Why it matters:
     * - This test was timing out intermittently in CI
     * - Root cause: No explicit wait for inventory after login
     * - Fix: Wait for URL change + inventory visibility check
     * 
     * RPI Evidence: addresses "Assertion fires before login API completes" (Hypothesis #1)
     */
    test('should successfully log in with valid credentials', async ({ page }) => {
        const loginPage = new LoginPage(page);

        // Step 1: Fill credentials
        await loginPage.login(VALID_USER, VALID_PASSWORD);

        // Step 2: Wait for successful login (RPI Plan Step 2: improved assertion)
        // This now waits for URL change AND inventory visibility
        // before the test continues, eliminating the race condition
        await loginPage.waitForInventoryPage();

        // Step 3: Verify we're on inventory page
        // Web-first assertion: waits up to 5000ms for condition
        const inventoryList = page.locator('.inventory_list');
        await expect(inventoryList).toBeVisible();

        // Step 4: Additional smoke check - verify at least one product is displayed
        const productItem = page.locator('.inventory_item').first();
        await expect(productItem).toBeVisible();
    });

    /**
     * Test: Display error banner on invalid credentials
     * 
     * What it tests:
     * - Error banner display when credentials are wrong
     * - Error message is readable and visible
     * 
     * Why it matters:
     * - Secondary flake symptom: assertions missed error banner
     * - Root cause: Selector `h3[data-test="error"]` didn't wait for element presence
     * - Fix: Wait for banner to be attached to DOM, THEN check visibility (RPI Plan Step 3)
     * 
     * RPI Evidence: addresses "Error banner selector unstable" (Hypothesis #2)
     */
    test('should display error banner on invalid credentials', async ({ page }) => {
        const loginPage = new LoginPage(page);

        // Step 1: Fill with invalid credentials
        await loginPage.login(VALID_USER, INVALID_PASSWORD);

        // Step 2: Wait for error banner (RPI Plan Step 3: improved error assertion)
        // This waits for banner to be in DOM first, then checks visibility
        const errorBanner = await loginPage.waitForErrorBanner();

        // Step 3: Verify error message is displayed
        await expect(errorBanner).toBeVisible();

        // Step 4: Verify error text is readable (contains expected message)
        const errorText = await loginPage.getErrorText();
        expect(errorText).toContain('Epic sadface:');
    });

    /**
     * Test: Locked out user displays error
     * 
     * What it tests:
     * - App correctly rejects locked-out user accounts
     * - Error banner shows appropriate message
     * 
     * RPI Value:
     * - Tests error path with same improved assertion strategy
     * - Validates that error handling works across different failure modes
     */
    test('should display error for locked out user', async ({ page }) => {
        const loginPage = new LoginPage(page);

        // Attempt login with locked user
        await loginPage.login(LOCKED_USER, VALID_PASSWORD);

        // Verify error banner is displayed
        const errorBanner = await loginPage.waitForErrorBanner();
        await expect(errorBanner).toBeVisible();

        // Verify error is about locked account
        const errorText = await loginPage.getErrorText();
        expect(errorText).toContain('locked');
    });

    /**
     * Test: Login form is visible on page load
     * 
     * What it tests:
     * - Login form renders without errors on page load
     * - All required form fields are present
     * 
     * RPI Value:
     * - Smoke test to catch app-level loading issues
     * - Validates baseline form availability
     */
    test('should display login form on page load', async ({ page }) => {
        const loginPage = new LoginPage(page);

        // Verify login form elements are visible
        await expect(loginPage.getUsername()).toBeVisible();
        await expect(loginPage.getPassword()).toBeVisible();
        await expect(loginPage.getLoginButton()).toBeVisible();

        // Verify page title (smoke check for correct page)
        await expect(page).toHaveTitle(/Swag Labs/i);
    });

    /**
     * Test: Empty credentials display validation error
     * 
     * What it tests:
     * - Submitting without credentials shows error
     * 
     * RPI Value:
     * - Edge case: validates app error handling without network call
     * - Tests synchronous validation, not timing-dependent
     */
    test('should show error when submitting empty credentials', async ({ page }) => {
        const loginPage = new LoginPage(page);

        // Click login without filling any fields
        await loginPage.getLoginButton().click();

        // Verify error banner appears (no network call needed)
        const errorBanner = await loginPage.waitForErrorBanner();
        await expect(errorBanner).toBeVisible();

        // Verify error message
        const errorText = await loginPage.getErrorText();
        expect(errorText).toContain('Epic sadface:');
    });
});

/**
 * RPI Implementation Summary:
 * 
 * Step 1: Page Object Created (pages/checkout/LoginPage.js) ✅
 *  - Encapsulates selectors with role-based locators
 *  - submitLogin() waits for URL change, not just button click
 *  - waitForInventoryPage() combines URL + element visibility check
 *  - waitForErrorBanner() waits for presence THEN visibility
 * 
 * Step 2: Login Success Assertion Improved ✅
 *  - Replaced: direct element visibility check
 *  - With: URL wait + inventory visibility check (eliminates race)
 * 
 * Step 3: Error Banner Assertion Fixed ✅
 *  - Replaced: immediate visibility check on CSS selector
 *  - With: role-based wait for attachment + visibility check
 * 
 * Step 4: Trace Diagnostics Config Updated (playwright.config.js) ✅
 *  - See playwright.config.js for trace: 'on-first-retry' setup
 * 
 * Validation Evidence Required:
 *  - [ ] Run: npx playwright test tests/checkout/login.spec.js
 *  - [ ] local 10x passes (consistency check)
 *  - [ ] Report to: docs/rpi/implement/checkout-login-stabilization.md
 */
