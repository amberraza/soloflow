import { chromium } from 'playwright';

const BASE = 'https://getsoloflow.com';
const API = 'https://empowering-acceptance-production.up.railway.app';

async function main() {
  const browser = await chromium.launch({ headless: true });

  // ── Test 1: Public Firm View endpoint ──
  console.log('1. Testing PublicFirmView endpoint...');
  // First, we need the test user's firm ID. Let's get it from login.
  const ctx = await browser.newContext();
  const loginPage = await ctx.newPage();
  await loginPage.goto(`${BASE}/login`);
  await loginPage.waitForSelector('text=Welcome Back');
  await loginPage.fill('input[placeholder="you@firm.com"]', 'amber@getsoloflow.com');
  await loginPage.fill('input[placeholder="••••••••"]', 'soloflow123');
  await loginPage.click('button:has-text("Sign In")');
  await loginPage.waitForURL('**/dashboard');

  // Get token from localStorage
  const token = await loginPage.evaluate(() => localStorage.getItem('token'));
  if (!token) {
    console.log('❌ No JWT token found - login failed');
    await browser.close();
    process.exit(1);
  }
  console.log('✅ Login successful, token obtained');

  // Decode JWT to get user info
  const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  console.log('  User ID from token:', payload.user_id);

  // Try to get firm info via the user endpoint
  const firmResp = await loginPage.evaluate(async (api) => {
    const res = await fetch(`${api}/api/v1/intake/firm/00000000-0000-0000-0000-000000000000/`);
    return { status: res.status, data: await res.json() };
  }, API);
  console.log('  Firm endpoint response:', firmResp);

  // ── Test 2: Settings page - fields should be populated ──
  console.log('\n2. Testing Settings page field persistence...');
  await loginPage.goto(`${BASE}/dashboard/settings`);
  await loginPage.waitForTimeout(1500);

  const firmNameVal = await loginPage.$eval('input[placeholder="Your Firm, P.A."]', el => el.value);
  console.log('  Firm name field value:', firmNameVal ? `"${firmNameVal}"` : '(empty)');

  if (!firmNameVal) {
    console.log('❌ ISSUE: Settings fields are empty - no data loaded from backend');
  } else {
    console.log('✅ Settings fields populated');
  }

  // ── Test 3: Embed snippet on settings page ──
  const embedSnippet = await loginPage.textContent('text=iframe');
  console.log('\n3. Embed snippet visible:', embedSnippet ? '✅' : '❌ Missing');

  // ── Test 4: Widget page loads with firm branding ──
  console.log('\n4. Testing widget page...');
  const widgetPage = await ctx.newPage();
  // Use a known UUID format
  await widgetPage.goto(`${BASE}/intake/embed/00000000-0000-0000-0000-000000000000`);
  await widgetPage.waitForTimeout(2000);

  const widgetContent = await widgetPage.textContent('body');
  const hasBranding = widgetContent.includes('SoloFlow');
  const hasError = widgetContent.includes('Unable to load');
  console.log(`  Widget shows branding: ${hasBranding ? '✅' : '❌'}`);
  console.log(`  Widget shows error: ${hasError ? '⚠️ (expected - fake firm ID)' : '✅ (graceful error handling)'}`);

  await browser.close();
  console.log('\nDone.');
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
