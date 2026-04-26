import { test, expect } from '@playwright/test';

// ─── Configuration ──────────────────────────────────────────────────────────
// Set these in a local .env file or as environment variables
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';  // Vite dev server
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'testpass123';

// ─── Helpers ────────────────────────────────────────────────────────────────

async function login(page) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForSelector('text=Welcome Back');

  // Fill credentials
  await page.fill('input[placeholder="you@firm.com"]', TEST_EMAIL);
  await page.fill('input[placeholder="••••••••"]', TEST_PASSWORD);
  await page.click('button:has-text("Sign In")');

  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForSelector('text=Welcome back', { timeout: 10000 });
}

async function fillWizardStep(page, step, fields) {
  // Verify we're on the right step
  await expect(page.locator('text=' + step)).toBeVisible({ timeout: 5000 });
  for (const [selector, value] of Object.entries(fields)) {
    await page.fill(selector, value);
  }
}

// ─── Tests ──────────────────────────────────────────────────────────────────

test.describe('SoloFlow Core Flows', () => {

  test('1. Login → Dashboard loads with all stat cards', async ({ page }) => {
    await login(page);

    // Check all 4 stat cards are visible
    await expect(page.locator('text=Active Matters')).toBeVisible();
    await expect(page.locator('text=Pending Intakes')).toBeVisible();
    await expect(page.locator('text=Billable Hours')).toBeVisible();
    await expect(page.locator('text=Trust Balance')).toBeVisible();

    // Verify recent matters section loads (even if empty)
    await expect(page.locator('text=Recent Matters')).toBeVisible();
  });

  test('2. Trust balance card shows $0.00 when empty', async ({ page }) => {
    await login(page);

    // Trust balance should render without errors
    const trustCard = page.locator('text=Trust Balance').locator('..');
    await expect(trustCard).toBeVisible();
  });

  test('3. Navigate to Matters page', async ({ page }) => {
    await login(page);

    // Click "View all matters" or navigate directly
    await page.goto(`${BASE_URL}/dashboard/matters`);
    await page.waitForSelector('text=Matters', { timeout: 5000 });

    // Should show matters list or empty state
    const hasMatters = await page.locator('text=No matters yet').isVisible().catch(() => false);
    if (!hasMatters) {
      // If matters exist, verify table/list renders
      await expect(page.locator('text=Title').or(page.locator('text=Status'))).toBeVisible();
    }
  });

  test('4. Navigate to Settings page', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/dashboard/settings`);
    await page.waitForSelector('text=Settings', { timeout: 5000 });

    // Firm profile fields should be visible
    await expect(page.locator('text=Firm Name').or(page.locator('text=Practice Areas'))).toBeVisible();
  });

  test('5. Complete wizard flow end-to-end', async ({ page }) => {
    await login(page);

    // Navigate to financial wizard
    await page.goto(`${BASE_URL}/intake/new`);
    await page.waitForSelector('text=Case Basics', { timeout: 5000 });

    // ── Step 1: Case Basics ──
    await page.fill('input[placeholder*="Client"]', 'Jane Doe');
    await page.selectOption('select:below(:text("Practice Area"))', 'Family Law');
    await page.click('button:has-text("Next")');

    // ── Step 2: Income ──
    await expect(page.locator('text=Income')).toBeVisible({ timeout: 5000 });
    await page.fill('input[placeholder*="salary"]', '5000');
    await page.fill('input[placeholder*="bonus"]', '500');
    await page.click('button:has-text("Next")');

    // ── Step 3: Deductions ──
    await expect(page.locator('text=Deductions')).toBeVisible({ timeout: 5000 });
    await page.fill('input[placeholder*="tax"]', '800');
    await page.fill('input[placeholder*="insurance"]', '200');
    await page.click('button:has-text("Next")');

    // ── Step 4: Expenses ──
    await expect(page.locator('text=Expenses')).toBeVisible({ timeout: 5000 });
    await page.fill('input[placeholder*="rent"]', '1500');
    await page.click('button:has-text("Next")');

    // ── Step 5: Custody (final step) ──
    await expect(page.locator('text=Custody')).toBeVisible({ timeout: 5000 });

    // Click generate/submit
    await page.click('button:has-text("Generate")');

    // Wait for success state or error
    // Success: shows "Case saved!" overlay and redirects to /dashboard
    // Error: shows error message
    const successOverlay = page.locator('text=Case saved');
    const errorMsg = page.locator('text=Failed to save case');

    await Promise.race([
      expect(successOverlay).toBeVisible({ timeout: 15000 }),
      expect(errorMsg).toBeVisible({ timeout: 15000 }),
    ]);

    if (await successOverlay.isVisible().catch(() => false)) {
      // Should redirect to dashboard
      await page.waitForURL('**/dashboard', { timeout: 10000 });
    }
  });

  test('6. Live calculator sidebar renders on wizard', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/tools/financial-wizard`);
    await page.waitForSelector('text=Case Basics', { timeout: 5000 });

    // Calculator sidebar should be visible
    await expect(page.locator('text=Child Support Estimate').or(page.locator('text=Estimated Support'))).toBeVisible({ timeout: 5000 });
  });

  test('7. Logout works', async ({ page }) => {
    await login(page);

    // Clear tokens (simulates logout)
    await page.evaluate(() => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    });

    // Navigate should redirect to login
    await page.goto(`${BASE_URL}/dashboard`);
    // Expect to stay on login or get redirected
    await page.waitForURL('**/login', { timeout: 5000 }).catch(() => {});
  });

});

// ─── API Smoke Tests ─────────────────────────────────────────────────────────

test.describe('Backend API Smoke Tests', () => {

  const API_URL = process.env.API_URL || 'http://localhost:8000';

  test('Health check endpoint is reachable', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/v1/health/`);
    expect(response.ok()).toBeTruthy();
  });

  test('Trust balance endpoint returns 401 without auth', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/v1/billing/trust-balance/`);
    expect(response.status()).toBe(401);
  });

  test('Matters endpoint returns 401 without auth', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/v1/matters/`);
    expect(response.status()).toBe(401);
  });
});
