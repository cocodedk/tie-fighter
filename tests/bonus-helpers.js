import { callTool, gameModuleUrls } from './helpers.js';

export async function isolateBonus(page, settings = {}, type = 'awing') {
  await callTool(page, 'pause_game');
  const urls = gameModuleUrls(page, ['state', 'world', 'enemies', 'career', 'ui']);
  await page.evaluate(async ({ urls, settings, type }) => {
    const { state } = await import(urls.state);
    const { scene } = await import(urls.world);
    const { spawnEnemy } = await import(urls.enemies);
    const { career, careerKey } = await import(urls.career);
    const { updateHud } = await import(urls.ui);
    for (const enemy of state.enemies) scene.remove(enemy.ship);
    for (const shot of state.enemyShots) scene.remove(shot.mesh);
    state.enemies.length = 0; state.enemyShots.length = 0;
    Object.assign(state, { spawnCooldown: 999, bonusCooldown: 999, ...settings });
    if (settings.runKills !== undefined) {
      Object.assign(career, { kills: settings.runKills, bestRun: settings.runKills, campaignKills: settings.runKills });
      localStorage.setItem(careerKey, JSON.stringify(career));
    }
    if (type) spawnEnemy(0, -1, -12, type);
    updateHud(state);
  }, { urls, settings, type });
  return urls;
}
