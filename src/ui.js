import { updateShipSelector } from './ship-select.js';
import { text, localize } from './i18n.js';
import { resetTouch } from './touch.js';
import { maxHealth, killsUntilRepair } from './state.js';
import { updateCareerHud, updateAwards } from './career-ui.js';

export const $ = (id) => document.getElementById(id);
localize();

export function updateHud(state) {
  updateCareerHud();
  $('score').textContent = String(state.score).padStart(4, '0');
  $('best-score').textContent = String(state.bestScore).padStart(4, '0');
  $('escapes').innerHTML = `${state.escapes} <small>/ 3</small>`;
  $('health').textContent = `${state.health} / ${maxHealth}`;
  $('repair').textContent = text.repair(killsUntilRepair(state.score));
  $('health').dataset.low = state.health <= 1;
}

export function showMode(state) {
  const { mode, score } = state;
  updateShipSelector(mode);
  const playing = mode === 'playing';
  document.body.classList.toggle('playing', playing);
  $('overlay').hidden = playing;
  if (playing) $('service-record').close();
  $('pause').hidden = !playing;
  document.querySelector('.touch-controls').hidden = !playing;
  resetTouch();
  const destroyed = mode === 'over' && state.health === 0;
  $('status').textContent = destroyed ? text.destroyedTitle : text[mode];
  if (!playing) $('damage').style.opacity = '0';
  if (mode === 'paused' || mode === 'over') {
    const paused = mode === 'paused';
    $('title').textContent = paused ? text.pausedTitle : destroyed ? text.destroyedTitle : text.overTitle;
    $('description').textContent = paused ? text.pausedDescription : text.debrief(score);
    $('start').textContent = paused ? text.resume : text.again;
    $('start-hint').textContent = paused ? text.resumeHint : text.enter;
  }
  if (mode === 'won') {
    $('title').textContent = text.wonTitle;
    $('description').textContent = text.wonDescription;
    $('start').textContent = text.newGame;
    $('start-hint').textContent = text.enter;
  }
}

export function showEscape(remaining) {
  $('notice').textContent = text.escape(remaining);
}

export function showRepair() {
  $('notice').textContent = text.repairDone;
}

export function showDamage(health) {
  $('notice').textContent = text.damage(health);
}

export function updateEffects(state, dt) {
  updateAwards(dt);
  state.damageTime = Math.max(0, state.damageTime - dt);
  $('damage').style.opacity = Math.min(1, state.damageTime / 0.2);
  state.noticeTime = Math.max(0, state.noticeTime - dt);
  if (state.noticeTime === 0) $('notice').textContent = '';
  state.hitTime = Math.max(0, state.hitTime - dt);
  $('hit').style.opacity = state.hitTime > 0 ? '1' : '0';
}
