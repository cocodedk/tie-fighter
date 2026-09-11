import { expect } from '@playwright/test';

export async function openGame(page) {
  await page.addInitScript(() => { Math.random = () => 0.5; });
  await page.goto('/');
  await page.waitForFunction(async () =>
    (await document.modelContext?.getTools())?.length === 5);
}

export async function callTool(page, name, input = {}) {
  return page.evaluate(async ({ toolName, arguments: args }) => {
    const context = document.modelContext;
    const tool = (await context.getTools()).find((entry) => entry.name === toolName);
    return JSON.parse(await context.executeTool(tool, JSON.stringify(args)));
  }, { toolName: name, arguments: input });
}

export async function holdKey(page, key, duration = 350) {
  await page.keyboard.down(key);
  await page.waitForTimeout(duration);
  await page.keyboard.up(key);
}

export async function expectMode(page, mode) {
  expect((await callTool(page, 'get_game_state')).mode).toBe(mode);
}
