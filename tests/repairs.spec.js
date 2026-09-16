import { test, expect } from '@playwright/test';
import { openGame, callTool, gameModuleUrls } from './helpers.js';

const fire = (page, duration_ms = 1000) => callTool(page, 'control_fighter', { fire: true, duration_ms });

test('five real kills fully repair damaged hull and reset the countdown', async ({ page }) => {
  await openGame(page);
  await callTool(page, 'start_game');
  let result = await callTool(page, 'control_fighter', { duration_ms: 3000 });
  expect(result.health).toBe(2);
  for (let i = 0; i < 12 && result.score < 400; i++) result = await fire(page);
  expect(result).toMatchObject({ health: 2, score: 400, killsUntilRepair: 1 });
  await expect(page.locator('#repair')).toHaveText('1 kill to full repair');
  for (let i = 0; i < 4 && result.score < 500; i++) result = await fire(page);
  expect(result).toMatchObject({ health: 3, score: 500, killsUntilRepair: 5 });
  await expect(page.locator('#notice')).toHaveText('Hull fully repaired.');
  await expect(page.locator('#health')).toHaveText('3 / 3');
  await expect(page.locator('#repair')).toHaveText('5 kills to full repair');
  expect((await callTool(page, 'start_game')).killsUntilRepair).toBe(5);
});

test('later repair milestones restore all health, while intervening kills do not', async ({ page }) => {
  await openGame(page);
  await callTool(page, 'start_game');
  const urls = await gameModuleUrls(page, ['state']);
  await page.evaluate(async (url) => {
    const { state } = await import(url);
    state.score = 900;
    state.runKills = 9;
    state.health = 1;
  }, urls.state);
  expect(await fire(page)).toMatchObject({ health: 3, score: 1000, killsUntilRepair: 5 });
  await page.evaluate(async (url) => { (await import(url)).state.health = 1; }, urls.state);
  expect(await fire(page, 3000)).toMatchObject({ health: 1, score: 1100, killsUntilRepair: 4 });
});
