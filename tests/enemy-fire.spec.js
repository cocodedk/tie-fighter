import { test, expect } from '@playwright/test';
import { openGame, callTool, gameModuleUrls } from './helpers.js';

const fly = (page, input = {}) => callTool(page, 'control_fighter', { duration_ms: 3000, ...input });
test.beforeEach(async ({ page }) => { await openGame(page); await callTool(page, 'start_game'); });

test('incoming lasers pause, keep their aim, and can be dodged', async ({ page }) => {
  const incoming = await fly(page, { duration_ms: 2000 });
  expect(incoming.health).toBe(3);
  expect(incoming.enemyShots).toHaveLength(1);
  expect(incoming.enemyShots[0].velocity.z).toBeGreaterThan(0);
  const paused = await callTool(page, 'pause_game');
  await page.waitForTimeout(200);
  const frozen = await callTool(page, 'get_game_state');
  expect(frozen.enemyShots).toEqual(paused.enemyShots);
  expect(frozen.elapsedSeconds).toBe(paused.elapsedSeconds);
  await callTool(page, 'resume_game');
  const dodging = await fly(page, { horizontal: 1, duration_ms: 250 });
  expect(dodging.player.x).toBeCloseTo(6, 4);
  expect(dodging.enemyShots[0].velocity).toEqual(incoming.enemyShots[0].velocity);
  const safe = await fly(page, { duration_ms: 1400 });
  expect(safe.health).toBe(3);
  expect(safe.enemyShots).toHaveLength(0);
  await expect(page.locator('#health')).toHaveText('3 / 3');
});

test('three real enemy hits destroy the TIE and restart restores the hull', async ({ page }) => {
  const hit = await fly(page);
  expect(hit.health).toBe(2);
  expect(hit.invulnerableSeconds).toBeGreaterThan(0);
  await expect(page.locator('#health')).toHaveText('2 / 3');
  let result = hit;
  for (let i = 0; i < 5 && result.mode === 'playing'; i++) result = await fly(page);
  expect(result).toMatchObject({ mode: 'over', health: 0, controlActive: false, status: 'interrupted' });
  expect(result.escapes).toBeLessThan(3);
  await expect(page.locator('#title')).toHaveText('TIE destroyed.');
  await expect(page.locator('#health')).toHaveText('0 / 3');
  const reset = await callTool(page, 'start_game');
  expect(reset).toMatchObject({ health: 3, escapes: 0, score: 0, enemyShots: [], invulnerableSeconds: 0 });
  await expect(page.locator('#damage')).toHaveCSS('opacity', '0');
});

test('swept hits respect the protection window even with overlapping lasers', async ({ page }) => {
  const urls = await gameModuleUrls(page, ['state', 'world', 'parts']);
  const addLasers = (count) => page.evaluate(async ({ count, urls }) => {
    const { state } = await import(urls.state);
    const { scene, player } = await import(urls.world);
    const { mesh, enemyBoltGeometry, enemyLaserMaterial } = await import(urls.parts);
    for (let i = 0; i < count; i++) {
      const bolt = mesh(scene, enemyBoltGeometry, enemyLaserMaterial);
      bolt.position.copy(player.position);
      bolt.position.z = -2;
      state.enemyShots.push({ mesh: bolt, velocity: player.position.clone().set(0, 0, 2000) });
    }
  }, { count, urls });
  await addLasers(2);
  const hit = await fly(page, { duration_ms: 100 });
  expect(hit.health).toBe(2);
  expect(hit.enemyShots).toHaveLength(0);
  await addLasers(1);
  expect((await fly(page, { duration_ms: 100 })).health).toBe(2);
  await fly(page, { duration_ms: 1000 });
  await addLasers(1);
  expect((await fly(page, { duration_ms: 100 })).health).toBe(1);
});
