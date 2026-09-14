import { state } from './state.js';
import { launchOrResume, pause, resume } from './game.js';
import { finishControl } from './agent-control.js';
import { $ } from './ui.js';

export function bindKeyboard() {
  $('start').addEventListener('click', launchOrResume);
  $('pause').addEventListener('click', pause);
  const codes = [
    'KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight',
    'Space', 'Escape', 'Enter',
  ];
  window.addEventListener('keydown', (event) => {
    if ($('service-record').open) return;
    if (!codes.includes(event.code)) return;
    if (event.target.closest?.('a, button') && ['Enter', 'Space'].includes(event.code)) return;
    event.preventDefault();
    finishControl('interrupted');
    if (event.code === 'Enter' && !event.repeat) launchOrResume();
    if (event.code === 'Escape' && !event.repeat) {
      if (state.mode === 'playing') pause();
      else if (state.mode === 'paused') resume();
    }
    if (state.mode === 'playing') state.keys.add(event.code);
  });
  window.addEventListener('keyup', (event) => state.keys.delete(event.code));
  window.addEventListener('blur', pause);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause();
  });
}
