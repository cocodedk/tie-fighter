import { test, expect } from '@playwright/test';
import { openGame, callTool } from './helpers.js';

test.beforeEach(async ({ page }) => { await openGame(page); });

test('discovers five native WebMCP tools and starts the actual game', async ({ page }) => {
  const names = await page.evaluate(async () =>
    (await document.modelContext.getTools()).map((tool) => tool.name));
  expect(names).toEqual(['control_fighter', 'get_game_state', 'pause_game', 'resume_game', 'start_game']);
  expect((await callTool(page, 'get_game_state')).mode).toBe('ready');
  const state = await callTool(page, 'start_game');
  expect(state).toMatchObject({ mode: 'playing', score: 0, escapes: 0 });
  expect(state.enemies).toHaveLength(1);
  await expect(page.locator('#overlay')).toBeHidden();
});

test('native flight uses normalized movement, releases input, and respects bounds', async ({ page }) => {
  await callTool(page, 'start_game');
  const moved = await callTool(page, 'control_fighter', {
    horizontal: 1, vertical: 1, duration_ms: 500,
  });
  expect(moved.status).toBe('completed');
  expect(Math.hypot(moved.player.x, moved.player.y + 1)).toBeCloseTo(7, 4);
  expect(moved.controlActive).toBe(false);
  const bounded = await callTool(page, 'control_fighter', { horizontal: 1, duration_ms: 1000 });
  expect(bounded.player.x).toBe(12);
  const stopped = await callTool(page, 'get_game_state');
  expect(stopped.player).toEqual(bounded.player);
});

test('native shooting destroys an X-wing and updates the visible score', async ({ page }) => {
  await callTool(page, 'start_game');
  const result = await callTool(page, 'control_fighter', { fire: true, duration_ms: 1000 });
  expect(result.score).toBe(100);
  expect(result.enemies).toHaveLength(0);
  await expect(page.locator('#score')).toHaveText('0100');
});

test('pause interrupts native input, resumes, and rejects invalid movement', async ({ page }) => {
  await callTool(page, 'start_game');
  const pending = callTool(page, 'control_fighter', { horizontal: 1, duration_ms: 3000 });
  await expect.poll(async () => (await callTool(page, 'get_game_state')).controlActive).toBe(true);
  const paused = await callTool(page, 'pause_game');
  expect(paused.mode).toBe('paused');
  expect((await pending).status).toBe('interrupted');
  expect((await callTool(page, 'resume_game')).mode).toBe('playing');
  await expect(callTool(page, 'control_fighter', { horizontal: 10 })).rejects.toThrow();
});

test('tools survive a persisted pagehide and unregister on final unload', async ({ page }) => {
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })));
  expect((await callTool(page, 'get_game_state')).mode).toBe('ready');
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: false })));
  const tools = await page.evaluate(() => document.modelContext.getTools());
  expect(tools).toHaveLength(0);
});
