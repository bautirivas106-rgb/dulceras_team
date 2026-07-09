import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';

const SHOTS = '/tmp/screenshots_landing';
await mkdir(SHOTS, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
page.setDefaultTimeout(15000);

const consoleErrors = [];
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });

async function shot(name) {
  await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true });
  console.log(`  📸 ${name}`);
}

// ── 1. Landing — hero ─────────────────────────────────────────────────────
console.log('1. Landing page — hero');
await page.goto('http://localhost:5173/');
await page.waitForSelector('h1', { state: 'visible' });
await shot('01_hero');

// ── 2. Landing — catálogo cargado ─────────────────────────────────────────
console.log('2. Catálogo con productos');
// Product cards are in a grid inside #catalogo; use .grid button to distinguish from tab buttons
await page.waitForFunction(() => {
  const cards = document.querySelectorAll('#catalogo .grid button');
  return cards.length > 0;
}, { timeout: 10000 });
await shot('02_catalog');

// ── 3. Filtro por categoría ────────────────────────────────────────────────
console.log('3. Filtro por categoría');
// Category tabs: first button is "Todos" (dark), rest are categories (bg-white)
const catBtn = page.locator('#catalogo button.rounded-full').nth(1);
await catBtn.click();
await page.waitForTimeout(600);
await shot('03_category_filter');

// ── 4. Modal de producto ──────────────────────────────────────────────────
console.log('4. Modal de producto');
// Reset to "Todos" then click first product card (.grid button)
await page.locator('#catalogo button.rounded-full').first().click(); // "Todos"
await page.waitForFunction(() => document.querySelectorAll('#catalogo .grid button').length > 0, { timeout: 8000 });
await page.waitForTimeout(300);
await page.locator('#catalogo .grid button').first().click();
await page.waitForFunction(() =>
  [...document.querySelectorAll('button')].some(b => b.textContent?.includes('Agregar al pedido'))
, { timeout: 8000 });
await shot('04_product_modal');

// ── 5. Agregar al carrito ─────────────────────────────────────────────────
console.log('5. Agregar al carrito');
await page.locator('button', { hasText: 'Agregar al pedido' }).click();
await page.waitForTimeout(900);
await shot('05_added_to_cart');

// ── 6. Abrir carrito drawer ───────────────────────────────────────────────
console.log('6. Cart drawer');
await page.click('button[aria-label="Ver carrito"]');
await page.waitForTimeout(400);
await shot('06_cart_drawer');

// ── 7. Sección Cómo pedir ─────────────────────────────────────────────────
console.log('7. Sección Cómo pedir');
await page.goto('http://localhost:5173/');
await page.waitForTimeout(800);
await shot('07_how_to_order');

// ── 8. Sección historia de gatitos ────────────────────────────────────────
console.log('8. CatsStory + Footer');
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(500);
await shot('08_footer');

// ── 9. Mobile view ────────────────────────────────────────────────────────
console.log('9. Mobile view');
await ctx.close();
const mobileCtx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const mobilePage = await mobileCtx.newPage();
mobilePage.setDefaultTimeout(15000);
await mobilePage.goto('http://localhost:5173/');
await mobilePage.waitForSelector('h1', { state: 'visible' });
await mobilePage.screenshot({ path: `${SHOTS}/09_mobile_hero.png`, fullPage: false });
console.log('  📸 09_mobile_hero');

// scroll down to catalog
await mobilePage.waitForFunction(() => {
  const cards = document.querySelectorAll('#catalogo .grid button');
  return cards.length > 0;
}, { timeout: 10000 });
await mobilePage.evaluate(() => {
  document.querySelector('#catalogo')?.scrollIntoView({ behavior: 'instant' });
});
await mobilePage.waitForTimeout(400);
await mobilePage.screenshot({ path: `${SHOTS}/10_mobile_catalog.png`, fullPage: false });
console.log('  📸 10_mobile_catalog');

// ── 10. Checkout page ─────────────────────────────────────────────────────
console.log('10. Checkout page');
// Cart is React in-memory state — must use SPA navigation via CartDrawer button
const desktopCtx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page2 = await desktopCtx2.newPage();
page2.setDefaultTimeout(15000);
await page2.goto('http://localhost:5173/');
await page2.waitForFunction(() => document.querySelectorAll('#catalogo .grid button').length > 0, { timeout: 10000 });
// Open product modal and add to cart
await page2.locator('#catalogo .grid button').first().click();
await page2.waitForFunction(() =>
  [...document.querySelectorAll('button')].some(b => b.textContent?.includes('Agregar al pedido') && !b.disabled)
, { timeout: 8000 });
await page2.locator('button', { hasText: 'Agregar al pedido' }).click();
await page2.waitForTimeout(1200); // modal closes after 800ms
// Open cart drawer → go to checkout (SPA navigation preserves cart state)
await page2.click('button[aria-label="Ver carrito"]');
await page2.waitForTimeout(400);
await page2.locator('button:has-text("Ir al checkout")').click();
await page2.waitForSelector('text=Completá tu pedido', { state: 'visible' });
await page2.screenshot({ path: `${SHOTS}/11_checkout.png`, fullPage: true });
console.log('  📸 11_checkout');

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
