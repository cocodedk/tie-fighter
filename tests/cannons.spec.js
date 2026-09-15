import { test, expect } from '@playwright/test';
import { openGame, callTool, gameModuleUrls } from './helpers.js';

for (const [shipType, count] of [['fighter', 2], ['interceptor', 4]]) {
  test(`${shipType} fires ${count} aligned beams from its actual banked cannon mounts`, async ({ page }) => {
    await openGame(page);
    await callTool(page, 'start_game', { shipType });
    await callTool(page, 'pause_game');
    const urls = gameModuleUrls(page, ['world', 'state', 'combat']);
    const result = await page.evaluate(async (urls) => {
      const { player } = await import(urls.world);
      const { state } = await import(urls.state);
      const { fire, updateCombat } = await import(urls.combat);
      player.rotation.set(0.15, -0.1, -0.3);
      fire();
      const shot = state.shots[0];
      const target = player.position.clone(); target.z = -65;
      const mounts = [];
      player.traverse((object) => { if (object.name === 'laser-cannon') mounts.push(object.position.toArray()); });
      const paths = shot.lasers.map((laser, i) => {
        const origin = player.userData.muzzles[i].getWorldPosition(player.position.clone());
        const rear = laser.mesh.position.clone().addScaledVector(laser.velocity, -1.1 / 125);
        const aim = laser.mesh.position.clone().addScaledVector(laser.velocity, (-65 - laser.mesh.position.z) / laser.velocity.z);
        return { mountError: rear.distanceTo(origin), aimError: aim.distanceTo(target),
          direction: laser.mesh.getWorldDirection(target.clone()).dot(laser.velocity.clone().normalize()) };
      });
      updateCombat(0.025);
      return { mounts, paths, travel: shot.lasers.map((laser) => laser.mesh.position.distanceTo(laser.previous)) };
    }, urls);
    expect(result.mounts).toHaveLength(count);
    for (const [x, y, z] of result.mounts) {
      expect(Math.abs(x)).toBe(shipType === 'fighter' ? 0.42 : 1.45);
      expect(Math.abs(y)).toBe(shipType === 'fighter' ? 0.38 : 1.9);
      expect(z).toBe(shipType === 'fighter' ? -0.88 : -4.4);
    }
    expect(result.paths).toHaveLength(count);
    for (const path of result.paths) {
      expect(path.mountError).toBeLessThan(0.000001);
      expect(path.aimError).toBeLessThan(0.000001);
      expect(path.direction).toBeGreaterThan(0.99999);
    }
    for (const distance of result.travel) expect(distance).toBeCloseTo(3.125, 6);
    await callTool(page, 'start_game');
    const fired = await callTool(page, 'control_fighter', { fire: true, duration_ms: 50 });
    expect(fired).toMatchObject({ shipType, cannonCount: count, activeShots: 1, activeLasers: count });
  });
}

test('every Interceptor beam can hit its own path without an invisible central shot', async ({ page }) => {
  await openGame(page);
  const urls = gameModuleUrls(page, ['world', 'state', 'game', 'enemies', 'combat']);
  const results = await page.evaluate(async (urls) => {
    const { scene } = await import(urls.world);
    const { state } = await import(urls.state);
    const { start, pause } = await import(urls.game);
    const { spawnEnemy } = await import(urls.enemies);
    const { fire, updateCombat } = await import(urls.combat);
    return [[0, 0], [-1.45, -1.9], [-1.45, 1.9], [1.45, -1.9], [1.45, 1.9]].map(([x, y]) => {
      start('interceptor'); pause();
      for (const enemy of state.enemies) scene.remove(enemy.ship);
      state.enemies.length = 0;
      spawnEnemy(x, -1 + y, -7);
      fire(); updateCombat(0.02);
      return { score: state.score, enemies: state.enemies.length, volleys: state.shots.length };
    });
  }, urls);
  expect(results[0]).toEqual({ score: 0, enemies: 1, volleys: 1 });
  for (const result of results.slice(1)) expect(result).toEqual({ score: 100, enemies: 0, volleys: 0 });
});
