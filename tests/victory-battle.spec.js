import { test, expect } from '@playwright/test';
import { openGame, callTool, gameModuleUrls } from './helpers.js';

const seed = (page) => page.addInitScript(() => localStorage.setItem('tie-fighter.career.v1',
  JSON.stringify({ kills: 250, bestRun: 25, campaignKills: 250 })));

test('the low-poly victory battle fires mounted cannons and destroys each Rebel without scoring', async ({ page }) => {
  await seed(page);
  await openGame(page);
  const before = await callTool(page, 'get_game_state');
  const { victory } = gameModuleUrls(page, ['victory']);
  const result = await page.evaluate(async (url) => {
    const { victoryScene } = await import(url);
    const frames = [0, 1.5, 2.3, 3.1, 3.8, 5].map((time) => {
      victoryScene.pose(time, innerWidth, innerHeight, false);
      return victoryScene.battle.duels.map((duel) => ({
        ...duel.getState(), hunter: duel.hunter.visible, rebel: duel.rebel.visible,
        explosion: duel.explosion.group.visible,
        visibleBolts: duel.bolts.filter((bolt) => bolt.visible).length,
        aimed: duel.bolts.every((bolt) => {
          const direction = duel.rebel.position.clone().sub(bolt.position).normalize();
          return bolt.getWorldDirection(direction.clone()).dot(direction) > .999;
        }),
      }));
    });
    let triangles = 0, textured = 0;
    for (const duel of victoryScene.battle.duels) {
      for (const ship of [duel.hunter, duel.rebel]) ship.traverse((object) => {
        if (!object.isMesh) return;
        triangles += (object.geometry.index?.count ?? object.geometry.attributes.position.count) / 3;
        if (object.material.map) textured++;
      });
    }
    return { frames, triangles, textured, canvases: document.querySelectorAll('canvas').length };
  }, victory);
  expect(result.frames[0].map(({ attacker, target }) => [attacker, target]))
    .toEqual([['fighter', 'xwing'], ['interceptor', 'awing']]);
  expect(result.frames[0].every((duel) => duel.hunter && duel.rebel && !duel.explosion)).toBe(true);
  expect(result.frames[1][0]).toMatchObject({ phase: 'firing', activeLasers: 2, visibleBolts: 2, aimed: true });
  expect(result.frames[2][0]).toMatchObject({ phase: 'destroyed', rebel: false, explosion: true });
  expect(result.frames[2][1]).toMatchObject({ phase: 'tracking', rebel: true, explosion: false });
  expect(result.frames[3][1]).toMatchObject({ phase: 'firing', activeLasers: 4, visibleBolts: 4, aimed: true });
  expect(result.frames[4][1]).toMatchObject({ phase: 'destroyed', rebel: false, explosion: true });
  expect(result.frames[5].every((duel) => duel.hunter && !duel.rebel && !duel.explosion && !duel.visibleBolts)).toBe(true);
  expect(result.triangles).toBeGreaterThan(200);
  expect(result.triangles).toBeLessThan(6000);
  expect(result).toMatchObject({ textured: 0, canvases: 1 });
  const after = await callTool(page, 'get_game_state');
  for (const key of ['score', 'career', 'health', 'enemies', 'enemyShots', 'elapsedSeconds']) expect(after[key]).toEqual(before[key]);
});

test('native WebMCP observes repeating victory battles without scoring and replay resets the pursuit', async ({ page }) => {
  await seed(page);
  await openGame(page);
  const initial = await callTool(page, 'get_game_state');
  const battle = async () => (await callTool(page, 'get_game_state')).victory.battle;
  await expect.poll(async () => (await battle())[0].phase, { intervals: [50] }).toBe('firing');
  await expect.poll(async () => (await battle())[1].phase, { intervals: [50] }).toBe('firing');
  await expect.poll(async () => (await callTool(page, 'get_game_state')).victory.complete).toBe(true);
  expect((await battle()).map((duel) => duel.phase)).toEqual(['destroyed', 'destroyed']);
  await expect.poll(async () => {
    const { victory } = await callTool(page, 'get_game_state');
    return victory.elapsedSeconds >= 8 && victory.cycleSeconds < 1;
  }, { intervals: [50] }).toBe(true);
  expect((await battle()).map((duel) => duel.phase)).toEqual(['tracking', 'tracking']);
  await expect.poll(async () => (await battle())[0].phase, { intervals: [50] }).toBe('firing');
  await expect.poll(async () => (await battle())[1].phase, { intervals: [50] }).toBe('firing');
  await expect.poll(async () => (await battle())[1].phase, { intervals: [50] }).toBe('destroyed');
  const repeated = await callTool(page, 'get_game_state');
  expect(repeated.victory.complete).toBe(true);
  for (const key of ['mode', 'score', 'career', 'health', 'enemies', 'enemyShots', 'elapsedSeconds']) expect(repeated[key]).toEqual(initial[key]);
  await page.keyboard.press('Escape');
  expect(await battle()).toEqual([]);
  await page.locator('#service-open').click();
  await page.locator('#victory-replay').click();
  expect((await battle()).map((duel) => duel.phase)).toEqual(['tracking', 'tracking']);
  const { victory } = gameModuleUrls(page, ['victory']);
  expect(await page.evaluate(async (url) => (await import(url)).victoryScene.battle.duels
    .every((duel) => duel.hunter.visible && duel.rebel.visible && !duel.explosion.group.visible), victory)).toBe(true);
  const fresh = await callTool(page, 'start_game');
  expect(fresh).toMatchObject({ mode: 'playing', victory: { active: false }, career: { campaignKills: 0, rank: { id: 'cadet' } } });
  expect(fresh.career.honors).toEqual(initial.career.honors);
});
