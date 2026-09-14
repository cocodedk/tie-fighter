import { test, expect } from '@playwright/test';
import { openGame, callTool } from './helpers.js';

const key = 'tie-fighter.best-score';
const fire = (page, duration_ms = 1000) => callTool(page, 'control_fighter', { fire: true, duration_ms });

async function expectBest(page, score) {
  await expect(page.locator('#best-score')).toHaveText(String(score).padStart(4, '0'));
  expect((await callTool(page, 'get_game_state')).bestScore).toBe(score);
}

test('best score survives reload, lower-scoring restarts and language changes', async ({ page }) => {
  await openGame(page);
  await callTool(page, 'start_game');
  await fire(page, 3000);
  expect((await fire(page)).score).toBe(200);
  await expectBest(page, 200);
  await page.reload();
  await expectBest(page, 200);
  expect((await callTool(page, 'start_game')).score).toBe(0);
  expect((await fire(page)).score).toBe(100);
  await expectBest(page, 200);
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe('200');
  await page.goto('/fa/');
  await expect(page.locator('[data-text=best]')).toHaveText('رکورد');
  await expectBest(page, 200);
});

test('invalid stored scores are ignored and replaced by real scores', async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, 'invalid'), key);
  await openGame(page);
  await expectBest(page, 0);
  await callTool(page, 'start_game');
  await fire(page);
  await expectBest(page, 100);
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe('100');
});

for (const failure of ['blocked access', 'full storage']) {
  test(`gameplay keeps working with ${failure}`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.addInitScript((failure) => {
      if (failure === 'blocked access') {
        Object.defineProperty(window, 'localStorage', {
          get() { throw new DOMException('Storage blocked', 'SecurityError'); },
        });
      } else {
        Storage.prototype.setItem = () => { throw new DOMException('Storage full', 'QuotaExceededError'); };
      }
    }, failure);
    await openGame(page);
    await expectBest(page, 0);
    await callTool(page, 'start_game');
    expect((await fire(page)).score).toBe(100);
    await callTool(page, 'start_game');
    await expectBest(page, 100);
    expect((await callTool(page, 'get_game_state')).career).toMatchObject({ kills: 1, bestRun: 1 });
    expect(errors).toEqual([]);
  });
}
