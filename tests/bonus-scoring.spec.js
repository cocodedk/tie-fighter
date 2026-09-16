import { test, expect } from '@playwright/test';
import { openGame, callTool } from './helpers.js';
import { isolateBonus } from './bonus-helpers.js';

const shoot = (page) => callTool(page, 'control_fighter', { fire: true, duration_ms: 500 });

test('bonus kills earn 200 points but only one kill toward repairs, medals, and ranks', async ({ page }) => {
  await openGame(page);
  await callTool(page, 'start_game');
  const urls = await isolateBonus(page, { health: 1, score: 300, runKills: 3 });
  await callTool(page, 'resume_game');
  const fourth = await shoot(page);
  expect(fourth).toMatchObject({ score: 500, runKills: 4, health: 1, killsUntilRepair: 1 });
  expect(fourth.career).toMatchObject({ kills: 4, bestRun: 4, campaignKills: 4, rank: { id: 'cadet' } });
  await expect(page.locator('#repair')).toHaveText('1 kill to full repair');
  await isolateBonus(page);
  await callTool(page, 'resume_game');
  const fifth = await shoot(page);
  expect(fifth).toMatchObject({ score: 700, bestScore: 700, runKills: 5, health: 3, killsUntilRepair: 5 });
  expect(fifth.career).toMatchObject({ kills: 5, bestRun: 5, campaignKills: 5 });
  expect(fifth.career.medals.filter((medal) => medal.earned)).toHaveLength(1);
  await expect(page.locator('#notice')).toHaveText('Hull fully repaired.');
  await callTool(page, 'pause_game');
  await page.evaluate(async (urls) => {
    const { state } = await import(urls.state);
    state.mode = 'over';
    (await import(urls.ui)).showMode(state);
  }, urls);
  await expect(page.locator('#description')).toHaveText('5 Rebel ships destroyed. 700 points. Take another flight.');
  await page.reload();
  await expect.poll(() => page.evaluate(async () => (await document.modelContext?.getTools())?.length)).toBe(5);
  const saved = await callTool(page, 'get_game_state');
  expect(saved).toMatchObject({ bestScore: 700, runKills: 0, career: { kills: 5, bestRun: 5 } });
  const fresh = await callTool(page, 'start_game');
  expect(fresh).toMatchObject({ score: 0, runKills: 0, killsUntilRepair: 5, career: { kills: 5 } });
});

test('a bonus-era best score never invents career kills when the saved career is lost', async ({ page }) => {
  await openGame(page);
  await callTool(page, 'start_game');
  await isolateBonus(page);
  await callTool(page, 'resume_game');
  expect(await shoot(page)).toMatchObject({ score: 200, runKills: 1, career: { kills: 1 } });
  await page.evaluate(() => localStorage.removeItem('tie-fighter.career.v1'));
  await page.reload();
  await expect.poll(() => page.evaluate(async () => (await document.modelContext?.getTools())?.length)).toBe(5);
  expect(await callTool(page, 'get_game_state')).toMatchObject({ bestScore: 200, career: { kills: 0, bestRun: 0 } });
  await callTool(page, 'start_game');
  const ordinary = await callTool(page, 'control_fighter', { fire: true, duration_ms: 1000 });
  expect(ordinary).toMatchObject({ score: 100, runKills: 1, bestScore: 200, career: { kills: 1 } });
});
