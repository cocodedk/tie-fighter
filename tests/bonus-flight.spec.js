import { test, expect } from '@playwright/test';
import { openGame, callTool } from './helpers.js';
import { isolateBonus } from './bonus-helpers.js';

test('occasional A-wings weave faster than X-wings and announce their optional reward', async ({ page }) => {
  await openGame(page);
  await callTool(page, 'start_game');
  const urls = await isolateBonus(page, { bonusCooldown: 10 }, null);
  const flight = await page.evaluate(async (urls) => {
    const { state } = await import(urls.state);
    const { updateEnemies } = await import(urls.enemies);
    const advance = (ticks) => { for (let i = 0; i < ticks; i++) { state.elapsed += .05; updateEnemies(.05); } };
    advance(180);
    const early = state.enemies.length;
    advance(22);
    const bonus = state.enemies.find((enemy) => enemy.type === 'awing');
    const initialZ = bonus.ship.position.z;
    const x = [];
    for (let i = 0; i < 20; i++) { advance(2); x.push(bonus.ship.position.x); }
    const distance = bonus.ship.position.z - initialZ;
    advance(240);
    const between = state.enemies.length;
    advance(80);
    return { early, x, distance, between, next: state.enemies.length, replaced: state.enemies[0]?.ship !== bonus.ship };
  }, urls);
  expect(flight).toMatchObject({ early: 0, between: 0, next: 1, replaced: true });
  expect(flight.distance).toBeCloseTo(60);
  expect(Math.min(...flight.x)).toBeLessThan(-3.5);
  expect(Math.max(...flight.x)).toBeGreaterThan(3.5);
  const current = await callTool(page, 'get_game_state');
  expect(current.enemies[0]).toMatchObject({ type: 'awing', points: 200, escapePenalty: false });
  await expect(page.locator('#notice')).toHaveText('Bonus A-wing: 200 points · Safe to miss.');
  const fresh = await callTool(page, 'start_game');
  expect(fresh.enemies[0]).toMatchObject({ type: 'xwing', points: 100, escapePenalty: true });
  expect(await page.evaluate(async (url) => (await import(url)).state.bonusCooldown, urls.state)).toBeGreaterThan(9);
});

test('ignoring A-wings never adds escapes, deals damage, or ends a patrol', async ({ page }) => {
  await openGame(page);
  await callTool(page, 'start_game');
  const urls = await isolateBonus(page, { escapes: 2, health: 1, runKills: 3, score: 300 });
  await page.evaluate(async (urls) => {
    const { state } = await import(urls.state);
    state.enemies[0].ship.position.z = -95;
    state.enemies[0].previous.copy(state.enemies[0].ship.position);
  }, urls);
  await callTool(page, 'resume_game');
  await callTool(page, 'control_fighter', { duration_ms: 3000 });
  const missed = await callTool(page, 'control_fighter', { duration_ms: 700 });
  expect(missed).toMatchObject({ mode: 'playing', score: 300, runKills: 3, escapes: 2, health: 1, enemyShots: [], enemies: [] });
  expect(missed.career.kills).toBe(3);
  await expect(page.locator('#notice')).toHaveText('');
  await callTool(page, 'pause_game');
  await page.evaluate(async (urls) => {
    const { spawnEnemy } = await import(urls.enemies);
    for (let i = 0; i < 4; i++) spawnEnemy(0, -1, 7.9, 'awing');
  }, urls);
  await callTool(page, 'resume_game');
  expect(await callTool(page, 'control_fighter', { duration_ms: 50 })).toMatchObject({ mode: 'playing', escapes: 2, health: 1 });
  await page.evaluate(async (urls) => (await import(urls.enemies)).spawnEnemy(0, -1, 7.9), urls);
  await expect.poll(async () => (await callTool(page, 'get_game_state')).mode).toBe('over');
  expect((await callTool(page, 'get_game_state')).escapes).toBe(3);
});
