import { chromium } from '@playwright/test';

const url = process.argv[2] || 'http://localhost:5173/';
const browser = await chromium.launch({ channel: 'chrome', args: [
  '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
] });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1, reducedMotion: 'reduce' });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: '.credits, .status, .stats { visibility: hidden; }' });
  await page.screenshot({ path: 'public/og.png' });
} finally {
  await browser.close();
}
