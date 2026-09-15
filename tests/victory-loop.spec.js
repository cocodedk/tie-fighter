import { test, expect } from '@playwright/test';
import { openGame, gameModuleUrls } from './helpers.js';

test('victory loop joins smoothly with ships hidden in the distance across layouts', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('tie-fighter.career.v1',
    JSON.stringify({ kills: 250, bestRun: 25, campaignKills: 250 })));
  await openGame(page);
  const { victory } = gameModuleUrls(page, ['victory']);
  const results = await page.evaluate(async (url) => {
    const { victoryScene } = await import(url);
    const { scene, camera, vader, battle } = victoryScene;
    const count = () => { let total = 0; scene.traverse(() => total++); return total; };
    const objects = count();
    return [false, true].flatMap((rtl) => [[320, 640], [960, 640], [800, 360]].map(([width, height]) => {
      const snapshot = (time) => {
        victoryScene.pose(time, width, height, rtl);
        scene.updateMatrixWorld(true);
        const transforms = [];
        vader.actor.traverse((object) => transforms.push(...object.matrixWorld.elements));
        const ships = battle.duels.flatMap((duel) => [duel.hunter, duel.rebel]);
        return { transforms, ships: ships.map((ship) => ({
          depth: -ship.position.clone().applyMatrix4(camera.matrixWorldInverse).z,
          screen: ship.position.clone().project(camera).toArray(),
        })) };
      };
      const end = snapshot(7.999), start = snapshot(0), visible = snapshot(1.5);
      const returned = snapshot(5);
      for (let cycle = 0; cycle < 10; cycle++) { snapshot(0); snapshot(5); }
      return {
        delta: Math.max(...end.transforms.map((value, i) => Math.abs(value - start.transforms[i]))),
        hidden: [...start.ships, ...end.ships].every((ship) => ship.depth > scene.fog.far),
        framed: visible.ships.every(({ screen, depth }) => depth < scene.fog.far && Math.abs(screen[0]) < 1 && Math.abs(screen[1]) < 1),
        gesturesDiffer: returned.transforms.some((value, i) => Math.abs(value - start.transforms[i]) > .1),
        reused: count() === objects,
      };
    }));
  }, victory);
  expect(results).toHaveLength(6);
  for (const result of results) {
    expect(result.delta).toBeLessThan(.001);
    expect(result).toMatchObject({ hidden: true, framed: true, gesturesDiffer: true, reused: true });
  }
});
