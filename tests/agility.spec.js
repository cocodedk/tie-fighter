import { test, expect } from '@playwright/test';
import { openGame, callTool, gameModuleUrls } from './helpers.js';

test('keyboard flight is fast, reverses immediately, and stops without camera drift', async ({ page }) => {
  await page.clock.install();
  await openGame(page);
  await page.clock.pauseAt(new Date(Date.now() + 100));
  await callTool(page, 'start_game');
  await page.keyboard.down('d');
  await page.clock.runFor(120);
  await page.keyboard.up('d');
  const moving = await callTool(page, 'get_game_state');
  expect(moving.player.x).toBeGreaterThan(2.5);
  const urls = await gameModuleUrls(page, ['world']);
  const view = () => page.evaluate(async (url) => {
    const { camera, player } = await import(url);
    return { camera: camera.position.toArray(), bank: player.rotation.z };
  }, urls.world);
  const released = await view();
  await page.clock.runFor(160);
  expect((await callTool(page, 'get_game_state')).player).toEqual(moving.player);
  const stopped = await view();
  expect(stopped.camera).toEqual(released.camera);
  expect(Math.abs(stopped.bank)).toBeLessThan(0.03);
  await page.keyboard.down('a');
  await page.clock.runFor(120);
  await page.keyboard.up('a');
  expect(Math.abs((await callTool(page, 'get_game_state')).player.x)).toBeLessThan(0.5);
});

test('the complete banked TIE stays visible at every flight corner', async ({ page }) => {
  await openGame(page);
  const urls = await gameModuleUrls(page, ['world']);
  for (const viewport of [{ width: 1280, height: 800 }, { width: 360, height: 800 }]) {
    await page.setViewportSize(viewport);
    for (const [horizontal, vertical] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
      await callTool(page, 'start_game');
      await callTool(page, 'control_fighter', { horizontal, vertical, duration_ms: 1500 });
      const visible = await page.evaluate(async (url) => {
        const { camera, player } = await import(url);
        const point = player.position.clone();
        let visible = true;
        player.updateMatrixWorld(true);
        player.traverse((object) => {
          const positions = object.geometry?.attributes.position;
          if (!positions) return;
          for (let i = 0; i < positions.count; i++) {
            point.fromBufferAttribute(positions, i).applyMatrix4(object.matrixWorld).project(camera);
            if (Math.abs(point.x) > 0.995 || Math.abs(point.y) > 0.995) visible = false;
          }
        });
        return visible;
      }, urls.world);
      expect(visible, `${viewport.width}px corner ${horizontal},${vertical}`).toBe(true);
    }
  }
});
