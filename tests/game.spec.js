import { test, expect, chromium } from '@playwright/test';
import { openGame, callTool, holdKey, expectMode } from './helpers.js';

test('WASD, arrow keys, Space, Escape, and loss of focus operate the game', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await openGame(page);
  await page.keyboard.press('Enter');
  for (const [rightKey, leftKey, upKey, downKey] of [
    ['d', 'a', 'w', 's'], ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'],
  ]) {
    await callTool(page, 'start_game');
    await holdKey(page, rightKey);
    const right = await callTool(page, 'get_game_state');
    expect(right.player.x).toBeGreaterThan(0);
    await holdKey(page, leftKey);
    expect((await callTool(page, 'get_game_state')).player.x).toBeLessThan(right.player.x);
    await holdKey(page, upKey);
    const up = await callTool(page, 'get_game_state');
    expect(up.player.y).toBeGreaterThan(-1);
    await holdKey(page, downKey);
    expect((await callTool(page, 'get_game_state')).player.y).toBeLessThan(up.player.y);
  }
  await callTool(page, 'start_game');
  await holdKey(page, 'Space', 1200);
  await expect(page.locator('#score')).toHaveText('0100');
  await page.keyboard.press('Escape');
  await expectMode(page, 'paused');
  await page.keyboard.press('Escape');
  await expectMode(page, 'playing');
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expectMode(page, 'paused');
  expect(errors).toHaveLength(0);
});

test('three escapes end the run and restart clears the previous run', async ({ page }) => {
  await page.clock.install();
  await openGame(page);
  await page.keyboard.press('Enter');
  for (let i = 0; i < 24; i++) {
    const key = ['ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowDown'][i % 4];
    await page.keyboard.down(key);
    await page.clock.runFor(800);
    await page.keyboard.up(key);
  }
  await expectMode(page, 'over');
  const lost = await callTool(page, 'get_game_state');
  expect(lost.escapes).toBe(3);
  await page.getByRole('button', { name: 'FLY AGAIN' }).click();
  const restarted = await callTool(page, 'get_game_state');
  expect(restarted).toMatchObject({ mode: 'playing', score: 0, escapes: 0, activeShots: 0, activeDebris: 0 });
  expect(restarted.enemies).toHaveLength(1);
});

test('keyboard gameplay also works when WebMCP is unavailable', async () => {
  const browser = await chromium.launch({ channel: 'chrome', args: [
    '--disable-features=WebMCP', '--disable-blink-features=WebMCP',
    '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
  ] });
  try {
    const page = await browser.newPage();
    await page.goto(test.info().project.use.baseURL);
    expect(await page.evaluate(() => typeof document.modelContext)).toBe('undefined');
    await page.getByRole('button', { name: 'LAUNCH FIGHTER' }).click();
    await expect(page.locator('#overlay')).toBeHidden();
    await holdKey(page, 'Space', 1500);
    await expect(page.locator('#score')).toHaveText('0100');
  } finally { await browser.close(); }
});
