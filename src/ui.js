import { text, localize } from './i18n.js';
import { resetTouch } from './touch.js';

export const $ = (id) => document.getElementById(id);
localize();

export function updateHud(state) {
  $('score').textContent = String(state.score).padStart(4, '0');
  $('best-score').textContent = String(state.bestScore).padStart(4, '0');
  $('escapes').innerHTML = `${state.escapes} <small>/ 3</small>`;
}

export function showMode(state) {
  const { mode, score } = state;
  const playing = mode === 'playing';
  document.body.classList.toggle('playing', playing);
  $('overlay').hidden = playing;
  $('pause').hidden = !playing;
  document.querySelector('.touch-controls').hidden = !playing;
  resetTouch();
  $('status').textContent = text[mode];
  if (mode === 'paused' || mode === 'over') {
    const paused = mode === 'paused';
    $('title').textContent = paused ? text.pausedTitle : text.overTitle;
    $('description').textContent = paused ? text.pausedDescription : text.debrief(score);
    $('start').textContent = paused ? text.resume : text.again;
    $('start-hint').textContent = paused ? text.resumeHint : text.enter;
  }
}

export function showEscape(remaining) {
  $('notice').textContent = text.escape(remaining);
}

export function updateEffects(state, dt) {
  state.noticeTime = Math.max(0, state.noticeTime - dt);
  if (state.noticeTime === 0) $('notice').textContent = '';
  state.hitTime = Math.max(0, state.hitTime - dt);
  $('hit').style.opacity = state.hitTime > 0 ? '1' : '0';
}
