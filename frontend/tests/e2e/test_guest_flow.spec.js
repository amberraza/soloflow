// tests/e2e/test_guest_flow.spec.js
const { test, expect } = require('@playwright/test');

test('Guest User can complete wizard and register', async ({ page }) => {
    // 1. Visit the Wizard
    await page.goto('http://localhost:5173/tools/financial-wizard');

    // 2. Step 1: Case Basics
    await page.fill('input[name="plaintiff"]', 'Guest Plaintiff');
    await page.selectOption('select[name="county"]', 'Charleston');
    await page.click('button:has-text("Next")');

    // 3. Step 2: Income
    await page.fill('input[name="rawAmount"]', '1000');
    await page.selectOption('select[name="frequency"]', 'WEEKLY');
    // Verify auto-calc
    await expect(page.locator('input[name="grossMonthly"]')).toHaveValue('4330.00');
    await page.click('button:has-text("Next")');

    // 4. Step 3: Deductions
    await page.click('button:has-text("Next")'); // Skip for now

    // 5. Step 4: Expenses
    await page.click('button:has-text("Next")'); // Skip for now

    // 6. Step 5: Custody
    await page.selectOption('select[name="numChildren"]', '2');
    await page.click('button:has-text("Generate Financial Declaration")');

    // 7. Verify Modal Opens
    await expect(page.locator('text=Save Your Progress')).toBeVisible();

    // 8. Register
    const uniqueEmail = `guest_${Date.now()}@example.com`;
    await page.fill('input[type="email"]', uniqueEmail);
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Create Account")');

    // 9. Verify success alert/redirect stub
    // Since we stubbed window.location.href, we might check for that navigation or alert
    // For this test, checking the alert or API call intercept is ideal.
    await expect(page.locator('text=Account created')).toBeVisible();

});
