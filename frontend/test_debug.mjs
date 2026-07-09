import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
page.setDefaultTimeout(20000);

// Capture all API responses
const apiLogs = [];
page.on('response', async r => {
  if (r.url().includes('/api/')) {
    let body = '';
    try { body = await r.text(); } catch {}
    apiLogs.push(`${r.status()} ${r.request().method()} ${r.url().replace('http://localhost:8000','')}${body ? ' → ' + body.slice(0,200) : ''}`);
  }
});
page.on('requestfailed', r => {
  apiLogs.push(`FAIL ${r.method()} ${r.url()} → ${r.failure()?.errorText}`);
});

// Login
await page.goto('http://localhost:5173/admin/login');
await page.fill('input[type="text"]', 'admin');
await page.fill('input[type="password"]', 'admin123');
await page.click('button[type="submit"]');
await page.waitForURL('**/admin/dashboard');
await page.waitForTimeout(3000);

// Navigate to catalog via sidebar link (SPA)
await page.click('a[href="/admin/catalog"]');
await page.waitForTimeout(8000); // wait 8s for API calls

console.log('\nAPI calls logged:');
apiLogs.forEach(l => console.log(' ', l));

const state = await page.evaluate(() => ({
  url: location.href,
  spinner: !!document.querySelector('.animate-spin'),
  rows: document.querySelectorAll('table tbody tr').length,
  text: document.body.textContent?.slice(0, 300),
}));
console.log('\nPage state:', state);

await browser.close();
