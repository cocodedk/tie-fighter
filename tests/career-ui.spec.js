import { test, expect } from '@playwright/test';
import { openGame, callTool } from './helpers.js';

test('service record fits English and Persian phones and desktops and keeps flight controls inactive', async ({ page }) => {
  await openGame(page);
  for (const lang of ['en', 'fa']) {
    for (const [width, height] of [[320, 640], [360, 800], [1280, 800], [800, 360]]) {
      await page.setViewportSize({ width, height });
      await page.goto(lang === 'fa' ? '/fa/' : '/');
      expect(await page.evaluate(() => document.querySelector('.intro').getBoundingClientRect().top
        >= document.querySelector('.hud').getBoundingClientRect().bottom)).toBe(true);
      await page.locator('#service-open').click();
      const dialog = page.locator('#service-record');
      await expect(dialog).toBeVisible();
      await expect(page.locator('#service-title')).toHaveText(lang === 'fa' ? 'پروندهٔ خلبان' : 'Service record');
      await expect(page.locator('[data-earned=false]')).toHaveCount(6);
      expect(await dialog.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return rect.left >= 0 && rect.right <= innerWidth && rect.top >= 0
          && rect.bottom <= innerHeight && element.scrollWidth <= element.clientWidth;
      })).toBe(true);
      await dialog.focus();
      await page.keyboard.press('ArrowUp');
      await page.keyboard.press('Enter');
      expect((await callTool(page, 'get_game_state')).mode).toBe('ready');
      await expect(dialog).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
      await expect(page.locator('#service-open')).toBeFocused();
      await callTool(page, 'start_game');
      await callTool(page, 'pause_game');
      await page.locator('#service-open').click();
      await page.keyboard.press('Escape');
      expect((await callTool(page, 'get_game_state')).mode).toBe('paused');
      await page.locator('#service-open').click();
      await callTool(page, 'resume_game');
      await expect(dialog).toBeHidden();
    }
  }
});
