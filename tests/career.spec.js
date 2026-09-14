import { test, expect } from '@playwright/test';
import { openGame, callTool } from './helpers.js';

const fire = (page) => callTool(page, 'control_fighter', { fire: true, duration_ms: 1000 });

async function record(page) {
  await expect.poll(() => page.evaluate(async () =>
    (await document.modelContext?.getTools())?.length)).toBe(5);
  return (await callTool(page, 'get_game_state')).career;
}

test('real kills earn permanent awards once across restarts, reloads, and languages', async ({ page }) => {
  await openGame(page);
  await callTool(page, 'start_game');
  const first = await fire(page);
  expect(first.career).toMatchObject({ kills: 1, bestRun: 1, nextRank: { remaining: 9 } });
  expect(first.career.medals.filter((award) => award.earned).map((award) => award.id)).toEqual(['firstVictory']);
  await expect(page.locator('#award-notice')).toHaveText('Award earned: First Victory');
  await callTool(page, 'start_game');
  expect((await fire(page)).career).toMatchObject({ kills: 2, bestRun: 1 });
  await expect(page.locator('#award-notice')).toBeHidden();
  await page.reload();
  expect(await record(page)).toMatchObject({ kills: 2, bestRun: 1 });
  await page.goto('/fa/');
  expect(await record(page)).toMatchObject({ kills: 2, bestRun: 1 });
  await page.locator('#service-open').click();
  await expect(page.locator('#service-title')).toHaveText('پروندهٔ خلبان');
  await expect(page.locator('[data-award=firstVictory]')).toHaveAttribute('data-earned', 'true');
  await expect(page.locator('[data-award=firstVictory] strong')).toHaveText('نخستین پیروزی');
  await expect(page.locator('[data-award=aceWings]')).toHaveAttribute('data-earned', 'false');
});

test('existing best scores seed known kills once without inventing previous run totals', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('tie-fighter.best-score', '1200'));
  await openGame(page);
  expect(await record(page)).toMatchObject({ kills: 12, bestRun: 12, rank: { id: 'pilot' } });
  await callTool(page, 'start_game');
  expect((await fire(page)).career).toMatchObject({ kills: 13, bestRun: 12 });
  await expect(page.locator('#award-notice')).toBeHidden();
  await page.reload();
  expect(await record(page)).toMatchObject({ kills: 13, bestRun: 12 });
});

for (const saved of ['broken JSON', '{"kills":2,"bestRun":10}']) {
  test(`corrupt career data recovers safely: ${saved}`, async ({ page }) => {
    await page.addInitScript((saved) => localStorage.setItem('tie-fighter.career.v1', saved), saved);
    await openGame(page);
    expect(await record(page)).toMatchObject({ kills: 0, bestRun: 0, rank: { id: 'cadet' } });
    await callTool(page, 'start_game');
    expect((await fire(page)).career).toMatchObject({ kills: 1, bestRun: 1 });
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('tie-fighter.career.v1'))))
      .toEqual({ kills: 1, bestRun: 1 });
  });
}
