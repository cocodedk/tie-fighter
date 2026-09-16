import { test, expect } from '@playwright/test';
import { openGame, callTool, gameModuleUrls } from './helpers.js';

test('every promotion boundary unlocks correctly alongside medals, honors, and full repairs', async ({ page }) => {
  await openGame(page);
  const urls = gameModuleUrls(page, ['career', 'state', 'ui']);
  const promotions = [[10, 'pilot', 1], [25, 'lieutenant', 1], [50, 'captain', 10],
    [100, 'commander', 1], [250, 'darthVader', 25]];
  for (const [kills, rank, run] of promotions) {
    await callTool(page, 'start_game');
    await page.evaluate(async ({ urls, kills, run }) => {
      const { career, careerKey } = await import(urls.career);
      const { state } = await import(urls.state);
      const { updateHud } = await import(urls.ui);
      Object.assign(career, { kills: kills - 1, bestRun: run - 1, campaignKills: kills - 1 });
      localStorage.setItem(careerKey, JSON.stringify(career));
      state.score = (run - 1) * 100;
      state.runKills = run - 1;
      state.health = 1;
      updateHud(state);
    }, { urls, kills, run });
    const before = (await callTool(page, 'get_game_state')).career;
    expect(before.nextRank).toMatchObject({ id: rank, remaining: 1 });
    expect(before.rank.id).not.toBe(rank);
    const result = await callTool(page, 'control_fighter', { fire: true, duration_ms: 1000 });
    expect(result.career).toMatchObject({ kills, bestRun: run, rank: { id: rank } });
    if (rank === 'darthVader') await page.keyboard.press('Escape');
    await expect(page.locator('#award-notice')).toContainText('Promoted to');
    expect(result.career.honors.filter((award) => award.earned).length)
      .toBe([50, 100, 250].filter((target) => kills >= target).length);
    if (run >= 10) {
      expect(result.health).toBe(3);
      expect(result.killsUntilRepair).toBe(5);
      await expect(page.locator('#notice')).toHaveText('Hull fully repaired.');
      expect(result.career.medals.filter((award) => award.earned).length).toBe(run === 25 ? 3 : 2);
    }
  }
  await callTool(page, 'pause_game');
  await page.locator('#service-open').click();
  await expect(page.locator('#career-rank')).toHaveText('Darth Vader');
  await expect(page.locator('#career-next')).toHaveText('Highest rank achieved');
  await expect(page.locator('#rank-progress')).toHaveAttribute('value', '1');
  await expect(page.locator('[data-earned=true]')).toHaveCount(6);
  await page.reload();
  await expect(page.locator('#victory-screen')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#pilot-rank')).toHaveText('Darth Vader');
  expect((await callTool(page, 'get_game_state')).career.nextRank).toBeNull();
});
