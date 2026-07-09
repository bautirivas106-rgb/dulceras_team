import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';

const SHOTS = '/tmp/screenshots5';
await mkdir(SHOTS, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
page.setDefaultTimeout(20000);

const consoleErrors = [];
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });

async function shot(name) {
  await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true });
  console.log(`  📸 ${name}`);
}

async function closeModal() {
  await page.locator('form ~ div button:has-text("Cancelar"), .flex.gap-3 button:has-text("Cancelar")').first().click();
  await page.waitForTimeout(300);
}

// ── 1. Login ─────────────────────────────────────────────────────────────
console.log('1. Login page');
await page.goto('http://localhost:5173/admin/login');
await page.waitForSelector('input[type="text"]');
await shot('01_login');

await page.fill('input[type="text"]', 'admin');
await page.fill('input[type="password"]', 'admin123');
await page.click('button[type="submit"]');
await page.waitForURL('**/admin/dashboard');

// ── 2. Dashboard ──────────────────────────────────────────────────────────
console.log('2. Dashboard');
await page.waitForFunction(() =>
  [...document.querySelectorAll('p.text-3xl')].some(el => (el.textContent ?? '').trim() !== '0')
, { timeout: 10000 }).catch(() => {});
await shot('02_dashboard');

// ── 3. Orders list ────────────────────────────────────────────────────────
console.log('3. Orders list');
await page.click('a[href="/admin/orders"]');
await page.waitForSelector('td.font-mono', { state: 'visible', timeout: 10000 });
await shot('03_orders');

// ── 4. Order detail + status update ──────────────────────────────────────
console.log('4. Order detail');
await page.locator('a:has-text("Ver")').first().click();
await page.waitForSelector('text=Resumen de pago', { state: 'visible' });
await shot('04_order_detail_top');
// Scroll to status update section
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(300);
await shot('04_order_detail_status');
await page.goBack();
await page.waitForSelector('td.font-mono', { state: 'visible' });

// ── 5. Customers ──────────────────────────────────────────────────────────
console.log('5. Customers');
await page.click('a[href="/admin/customers"]');
await page.waitForFunction(() =>
  document.querySelector('table tbody tr') !== null || document.body.textContent?.includes('Sin clientes')
, { timeout: 10000 }).catch(() => {});
await shot('05_customers');

// ── 6. Catalog — Products ─────────────────────────────────────────────────
console.log('6. Catalog - products tab');
await page.goto('http://localhost:5173/admin/catalog');
await page.waitForFunction(() => {
  const rows = document.querySelectorAll('table tbody tr');
  return rows.length > 0 && !document.querySelector('.animate-spin');
}, { timeout: 15000 });
await shot('06_catalog_products');

// ── 7. Product edit modal ─────────────────────────────────────────────────
console.log('7. Product modal (edit)');
const firstRow = page.locator('table tbody tr').first();
await firstRow.hover();
await page.waitForTimeout(400);
await firstRow.locator('button').first().click();
await page.waitForSelector('text=Editar producto', { state: 'visible' });
await shot('07_product_modal');
// Scroll inside modal to show variants
await page.evaluate(() => {
  const scroller = document.querySelector('.overflow-y-auto');
  if (scroller) scroller.scrollTop = 400;
});
await page.waitForTimeout(200);
await shot('07_product_modal_variants');
await closeModal();

// ── 8. New product modal ──────────────────────────────────────────────────
console.log('8. New product modal');
await page.locator('button:has-text("Nuevo producto")').click();
await page.waitForSelector('text=Nuevo producto', { state: 'visible' });
await shot('08_new_product_modal');
await closeModal();

// ── 9. Categories tab ─────────────────────────────────────────────────────
console.log('9. Categories tab');
await page.locator('button:has-text("Categor")').click();
await page.waitForFunction(() => {
  const rows = document.querySelectorAll('table tbody tr');
  return rows.length > 0 && !document.querySelector('.animate-spin');
}, { timeout: 10000 });
await shot('09_categories');

// ── 10. New category modal ────────────────────────────────────────────────
console.log('10. New category modal');
await page.locator('button:has-text("Nueva")').click();
await page.waitForSelector('text=Nueva categor', { state: 'visible' });
await shot('10_category_modal_empty');
// Type a name to see slug auto-generate
await page.locator('input[type="text"]').first().type('Alfajores');
await page.waitForTimeout(600);
await shot('10_category_modal_filled');
await closeModal();

// ── 11. Notification bell ─────────────────────────────────────────────────
console.log('11. Notification bell');
await page.click('a[href="/admin/dashboard"]');
await page.waitForFunction(() =>
  [...document.querySelectorAll('p.text-3xl')].some(el => (el.textContent ?? '').trim() !== '0')
, { timeout: 10000 }).catch(() => {});
await page.click('button[aria-label="Notificaciones"]');
await page.waitForTimeout(600);
await shot('11_notification_bell');

// ── Summary ───────────────────────────────────────────────────────────────
console.log('');
if (consoleErrors.length) {
  console.log('⚠ JS errors:');
  consoleErrors.forEach(e => console.log(' ', e));
} else {
  console.log('✓ No JS console errors');
}
await browser.close();
console.log(`✓ All done — ${SHOTS}/`);
