import { test, expect } from '@playwright/test';
import { openGame, callTool, gameModuleUrls } from './helpers.js';

test('a new campaign stays reset when storage refuses writes after a completed game', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('tie-fighter.career.v1', JSON.stringify({ kills: 250, bestRun: 25, campaignKills: 250 }));
    Storage.prototype.setItem = () => { throw new DOMException('Storage full', 'QuotaExceededError'); };
  });
  await openGame(page);
  await expect(page.locator('#victory-screen')).toBeVisible();
  await page.locator('#victory-action').click();
  const result = await callTool(page, 'control_fighter', { fire: true, duration_ms: 1000 });
  expect(result).toMatchObject({ mode: 'playing', victory: { active: false } });
  expect(result.career).toMatchObject({ kills: 251, campaignKills: 1, rank: { id: 'cadet' } });
  await callTool(page, 'start_game');
  expect((await callTool(page, 'get_game_state')).career.campaignKills).toBe(1);
});

test('simultaneous shots stop counting kills immediately when Darth Vader is reached', async ({ page }) => {
  await openGame(page);
  await callTool(page, 'start_game');
  const urls = gameModuleUrls(page, ['career', 'enemies', 'combat']);
  await page.evaluate(async (urls) => {
    const { career, careerKey } = await import(urls.career);
    const { spawnEnemy } = await import(urls.enemies);
    const { fire } = await import(urls.combat);
    Object.assign(career, { kills: 249, bestRun: 24, campaignKills: 249 });
    localStorage.setItem(careerKey, JSON.stringify(career));
    spawnEnemy(0, -1, -65);
    fire(); fire();
  }, urls);
  const result = await callTool(page, 'control_fighter', { duration_ms: 1000 });
  expect(result).toMatchObject({ mode: 'won', score: 100, career: { kills: 250, campaignKills: 250 } });
  expect(result.enemies).toHaveLength(1);
  expect(result.activeShots).toBe(1);
});

test('reduced motion presents a stable victory pose and allows a fresh game', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => localStorage.setItem('tie-fighter.career.v1',
    JSON.stringify({ kills: 250, bestRun: 25, campaignKills: 250 })));
  await openGame(page);
  await expect.poll(async () => (await callTool(page, 'get_game_state')).victory.complete).toBe(true);
  const urls = gameModuleUrls(page, ['victory']);
  const pose = () => page.evaluate(async (url) => {
    const { victoryScene } = await import(url);
    return { arm: victoryScene.vader.arms[1].rotation.z, cape: victoryScene.vader.cape.rotation.x,
      battle: victoryScene.battle.duels.map((duel) => ({ ...duel.getState(),
        hunter: duel.hunter.matrixWorld.elements, rebel: duel.rebel.visible,
        explosion: duel.explosion.group.visible, bolts: duel.bolts.map((bolt) => bolt.visible) })) };
  }, urls.victory);
  const before = await pose();
  expect(before.battle.every((duel) => duel.phase === 'destroyed' && !duel.rebel &&
    !duel.explosion && duel.bolts.every((visible) => !visible))).toBe(true);
  await page.waitForTimeout(200);
  expect(await pose()).toEqual(before);
  await page.locator('#victory-action').click();
  expect((await callTool(page, 'get_game_state')).mode).toBe('playing');
});
