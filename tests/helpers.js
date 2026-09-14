import { expect } from '@playwright/test';

const modules = new WeakMap();

export async function openGame(page) {
  const urls = {};
  modules.set(page, urls);
  page.on('response', (response) => {
    const match = new URL(response.url()).pathname.match(/^\/src\/([\w-]+)\.js$/);
    if (match) urls[match[1]] = response.url();
  });
  await page.addInitScript(() => { Math.random = () => 0.5; });
  await page.goto('/');
  await expect.poll(async () => page.evaluate(async () =>
    (await document.modelContext?.getTools())?.length), { timeout: 10000 }).toBe(5);
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

export function gameModuleUrls(page, names) {
  // Use the running game's exact URLs, including Vite's hot-reload timestamps.
  return Object.fromEntries(names.map((name) => {
    const url = modules.get(page)?.[name];
    if (!url) throw new Error(`Game module not loaded: ${name}`);
    return [name, url];
  }));
}
