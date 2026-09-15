import { test, expect } from '@playwright/test';
import { openGame, callTool, gameModuleUrls } from './helpers.js';

const seed = (page, kills) => page.addInitScript((kills) => {
  if (!localStorage.getItem('tie-fighter.career.v1')) {
    localStorage.setItem('tie-fighter.career.v1', JSON.stringify({ kills, bestRun: 24, campaignKills: kills }));
    localStorage.setItem('tie-fighter.best-score', '2400');
  }
}, kills);

test('Darth Vader ends the game and New game restarts at Cadet while preserving records', async ({ page }) => {
  await seed(page, 249);
  await openGame(page);
  await callTool(page, 'start_game');
  const won = await callTool(page, 'control_fighter', { fire: true, duration_ms: 1000 });
  expect(won).toMatchObject({ mode: 'won', status: 'interrupted', score: 100, victory: { active: true, finale: true } });
  expect(won.career).toMatchObject({ kills: 250, campaignKills: 250, rank: { id: 'darthVader' }, nextRank: null });
  await expect(page.locator('#victory-title')).toHaveText('Darth Vader');
  await expect(page.locator('#victory-claim')).toContainText('The Rebel forces are defeated.');
  await page.waitForTimeout(250);
  const frozen = await callTool(page, 'get_game_state');
  for (const key of ['score', 'health', 'elapsedSeconds', 'enemies', 'enemyShots', 'player']) expect(frozen[key]).toEqual(won[key]);
  expect((await callTool(page, 'resume_game')).mode).toBe('won');
  await expect(callTool(page, 'control_fighter', { fire: true })).rejects.toThrow();
  await page.keyboard.press('Escape');
  expect((await callTool(page, 'get_game_state')).mode).toBe('won');
  await expect(page.locator('#start')).toHaveText('New game');
  await page.locator('#service-open').click();
  await page.locator('#victory-replay').click();
  await expect(page.locator('#victory-action')).toHaveText('Back');
  await page.locator('#victory-action').click();
  await page.locator('input[value=interceptor]').check();
  await page.locator('#start').click();
  const fresh = await callTool(page, 'get_game_state');
  expect(fresh).toMatchObject({ mode: 'playing', shipType: 'interceptor', score: 0, bestScore: 2400, victory: { active: false } });
  expect(fresh.career).toMatchObject({ kills: 250, bestRun: 24, campaignKills: 0, rank: { id: 'cadet' } });
  expect(fresh.career.medals).toEqual(won.career.medals);
  expect(fresh.career.honors).toEqual(won.career.honors);
  expect((await callTool(page, 'control_fighter', { fire: true, duration_ms: 1000 })).career.campaignKills).toBe(1);
  await page.reload();
  await expect.poll(() => page.evaluate(async () =>
    (await document.modelContext?.getTools())?.length)).toBe(5);
  await expect(page.locator('#pilot-rank')).toHaveText('Cadet');
  expect((await callTool(page, 'get_game_state')).career).toMatchObject({ kills: 251, campaignKills: 1 });
});

test('Vader is a low-poly mesh whose arm and lightsaber animate in the existing renderer', async ({ page }) => {
  await seed(page, 250);
  await openGame(page);
  const urls = gameModuleUrls(page, ['victory', 'world']);
  const inspect = () => page.evaluate(async ({ victory, world }) => {
    const { victoryScene } = await import(victory);
    const { renderer } = await import(world);
    let triangles = 0, textured = 0;
    victoryScene.vader.actor.traverse((object) => {
      if (!object.isMesh) return;
      triangles += (object.geometry.index?.count ?? object.geometry.attributes.position.count) / 3;
      if (object.material.map) textured++;
    });
    return { arm: victoryScene.vader.arms[1].rotation.z, blade: victoryScene.vader.blade.scale.y,
      triangles, textured, drawn: renderer.info.render.triangles, canvases: document.querySelectorAll('canvas').length };
  }, urls);
  const before = await inspect();
  await page.waitForTimeout(1400);
  const after = await inspect();
  expect(after.arm).toBeGreaterThan(before.arm);
  expect(after.blade).toBeGreaterThanOrEqual(before.blade);
  expect(after.triangles).toBeGreaterThan(100);
  expect(after.triangles).toBeLessThan(2500);
  expect(after).toMatchObject({ textured: 0, canvases: 1 });
  expect(after.drawn).toBeGreaterThan(0);
});
