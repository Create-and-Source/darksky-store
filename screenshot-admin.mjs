import { chromium } from 'playwright';

const PAGES = [
  { path: '/admin', name: 'dashboard' },
  { path: '/admin/inventory', name: 'inventory' },
  { path: '/admin/receive', name: 'receive' },
  { path: '/admin/transfers', name: 'transfers' },
  { path: '/admin/purchase-orders', name: 'purchase-orders' },
  { path: '/admin/orders', name: 'orders' },
  { path: '/admin/events', name: 'events' },
  { path: '/admin/emails', name: 'emails' },
  { path: '/admin/content', name: 'content' },
  { path: '/admin/reports', name: 'reports' },
];

const WIDTH = 390;
const BASE = 'http://localhost:5200';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: 844 },
    deviceScaleFactor: 2,
  });

  // First page: dismiss tour by setting localStorage
  const setupPage = await context.newPage();
  await setupPage.goto(`${BASE}/admin`, { waitUntil: 'networkidle', timeout: 15000 });
  await setupPage.evaluate(() => {
    localStorage.setItem('darksky_admin_onboarded', 'true');
    localStorage.setItem('ds_admin_role', 'manager');
  });
  await setupPage.close();

  for (const page of PAGES) {
    const p = await context.newPage();
    await p.goto(`${BASE}${page.path}`, { waitUntil: 'networkidle', timeout: 15000 });
    await p.waitForTimeout(800);
    await p.screenshot({
      path: `/tmp/admin-mobile-${page.name}.png`,
      fullPage: true,
    });
    console.log(`✓ ${page.name} (${page.path})`);
    await p.close();
  }

  await browser.close();
  console.log(`\nDone! ${PAGES.length} screenshots saved to /tmp/admin-mobile-*.png`);
})();
