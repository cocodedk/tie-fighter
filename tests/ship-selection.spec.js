import { test, expect } from '@playwright/test';
import { openGame, callTool, gameModuleUrls } from './helpers.js';

const choice = (page, type) => page.locator(`input[name="ship"][value="${type}"]`);

test('ship selection works with arrow keys, launches the choice, and remembers it across languages', async ({ page }) => {
  await openGame(page);
  await expect(choice(page, 'fighter')).toBeChecked();
  await choice(page, 'fighter').focus();
  await page.keyboard.press('ArrowRight');
  await expect(choice(page, 'interceptor')).toBeChecked();
  expect((await callTool(page, 'get_game_state')).shipType).toBe('interceptor');
  expect((await callTool(page, 'get_game_state')).mode).toBe('ready');
  await page.keyboard.press('Enter');
  expect(await callTool(page, 'get_game_state')).toMatchObject({ mode: 'playing', shipType: 'interceptor' });
  await expect(page.locator('#ship-select')).toBeHidden();
  await callTool(page, 'pause_game');
  await expect(page.locator('#ship-select')).toBeHidden();
  expect((await callTool(page, 'resume_game')).shipType).toBe('interceptor');
  await page.goto('/fa/');
  await expect(page.locator('#start')).toBeEnabled();
  await expect(choice(page, 'interceptor')).toBeChecked();
  await expect(page.locator('#ship-select legend')).toHaveText('جنگنده‌ات را انتخاب کن');
  await choice(page, 'fighter').check();
  await page.reload();
  await expect(page.locator('#start')).toBeEnabled();
  await expect(choice(page, 'fighter')).toBeChecked();
});

test('WebMCP launches distinct low-poly craft with working flight and guns and rejects invalid choices', async ({ page }) => {
  await openGame(page);
  const urls = gameModuleUrls(page, ['world']);
  const lengths = [];
  for (const shipType of ['fighter', 'interceptor']) {
    expect((await callTool(page, 'start_game', { shipType })).shipType).toBe(shipType);
    lengths.push(await page.evaluate(async (url) => {
      const { player } = await import(url);
      let near = Infinity, far = -Infinity, triangles = 0;
      player.traverse((object) => {
        if (!object.isMesh) return;
        object.geometry.computeBoundingBox();
        const box = object.geometry.boundingBox.clone().applyMatrix4(object.matrix);
        near = Math.min(near, box.min.z); far = Math.max(far, box.max.z);
        triangles += (object.geometry.index?.count ?? object.geometry.attributes.position.count) / 3;
        if (object.material.map) throw new Error('Craft must use geometric low-poly models.');
      });
      if (triangles > 3000) throw new Error('Craft exceeds low-poly geometry budget.');
      return far - near;
    }, urls.world));
    const hit = await callTool(page, 'control_fighter', { fire: true, duration_ms: 1000 });
    expect(hit).toMatchObject({ shipType, score: 100, health: 3 });
    expect((await callTool(page, 'control_fighter', { horizontal: 1, duration_ms: 250 })).player.x).toBeCloseTo(6, 4);
  }
  expect(lengths[1]).toBeGreaterThan(lengths[0]);
  const before = await callTool(page, 'pause_game');
  await expect(callTool(page, 'start_game', { shipType: 'xwing' })).rejects.toThrow();
  expect(await callTool(page, 'get_game_state')).toEqual(before);
});

test('invalid saved ship choices fall back to the TIE Fighter', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('tie-fighter.ship.v1', 'xwing'));
  await openGame(page);
  expect((await callTool(page, 'get_game_state')).shipType).toBe('fighter');
  await expect(choice(page, 'fighter')).toBeChecked();
});

test('both ships remain selectable and playable when storage is blocked', async ({ page }) => {
  await page.addInitScript(() => {
    for (const method of ['getItem', 'setItem']) Storage.prototype[method] = () => { throw new Error('Blocked'); };
  });
  await openGame(page);
  await choice(page, 'interceptor').check();
  await page.locator('#start').click();
  expect(await callTool(page, 'get_game_state')).toMatchObject({ shipType: 'interceptor', mode: 'playing' });
  expect((await callTool(page, 'start_game', { shipType: 'fighter' })).shipType).toBe('fighter');
});
