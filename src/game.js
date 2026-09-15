import { scene, player } from './world.js';
import { state, maxHealth } from './state.js';
import { $, updateHud, showMode, updateEffects } from './ui.js';
import { spawnEnemy, updateEnemies } from './enemies.js';
import { updateFlight } from './flight.js';
import { updateCombat } from './combat.js';
import { finishControl } from './agent-control.js';
import { updateEnemyFire } from './enemy-fire.js';
import { clearAwards } from './career-ui.js';
import { getCareer, restartCampaign } from './career.js';
import { selectShip } from './player.js';
import { showVictory, closeVictory } from './victory.js';

const previousPlayer = player.position.clone();

function setMode(mode) {
  state.mode = mode;
  state.keys.clear();
  finishControl('interrupted');
  showMode(state);
}

export function start(shipType = player.userData.shipType) {
  selectShip(shipType);
  closeVictory();
  if (getCareer().campaignKills === 250) restartCampaign();
  clearAwards();
  finishControl('interrupted');
  for (const [objects, key] of [
    [state.enemies, 'ship'], [state.shots, 'mesh'], [state.debris, 'mesh'],
    [state.enemyShots, 'mesh'],
  ]) {
    for (const object of objects) scene.remove(object[key]);
    objects.length = 0;
  }
  Object.assign(state, {
    score: 0, escapes: 0, elapsed: 0, fireCooldown: 0, victoryPending: false,
    health: maxHealth, invulnerableTime: 0, damageTime: 0,
    spawnCooldown: 2.5, noticeTime: 0, hitTime: 0,
  });
  $('notice').textContent = '';
  $('hit').style.opacity = '0';
  $('damage').style.opacity = '0';
  player.position.set(0, -1, 0);
  player.rotation.set(0, 0, 0);
  spawnEnemy(0, -1, -65);
  updateHud(state);
  setMode('playing');
  $('start').blur();
}

export function pause() {
  if (state.mode === 'playing') setMode('paused');
}

export function resume() {
  if (state.mode === 'paused') { closeVictory(); setMode('playing'); }
}

export function launchOrResume() {
  if (state.mode === 'paused') resume();
  else if (state.mode !== 'playing') start();
}

export function winGame() {
  showVictory(true);
  setMode('won');
}

export function updateGame(dt) {
  if (state.agent) dt = Math.min(dt, state.agent.remaining);
  state.elapsed += dt;
  previousPlayer.copy(player.position);
  updateFlight(dt);
  if (updateEnemies(dt)) {
    setMode('over');
    return;
  }
  updateCombat(dt);
  if (state.victoryPending) { state.victoryPending = false; winGame(); return; }
  updateEnemyFire(dt, previousPlayer);
  updateEffects(state, dt);
  if (state.health === 0) {
    setMode('over');
    return;
  }
  if (state.agent) {
    state.agent.remaining -= dt;
    if (state.agent.remaining <= 0.000001) finishControl('completed');
  }
}
