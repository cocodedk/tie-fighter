import { state } from './state.js';
import { finishControl } from './agent-control.js';

const resets = [];
export function resetTouch() {
  resets.forEach((reset) => reset());
}

export function bindTouch() {
  document.querySelectorAll('[data-control]').forEach((button) => {
    const pointers = new Set();
    const keyboard = new Set();
    const token = button.dataset.control;
    const update = () => {
      const held = state.mode === 'playing' && (pointers.size > 0 || keyboard.size > 0);
      if (held) state.keys.add(token);
      else state.keys.delete(token);
      button.classList.toggle('held', held);
    };
    resets.push(() => {
      pointers.clear();
      keyboard.clear();
      update();
    });
    button.addEventListener('pointerdown', (event) => {
      if (state.mode !== 'playing') return;
      event.preventDefault();
      finishControl('interrupted');
      button.setPointerCapture(event.pointerId);
      pointers.add(event.pointerId);
      update();
    });
    const release = (event) => {
      pointers.delete(event.pointerId);
      update();
    };
    for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) {
      button.addEventListener(name, release);
    }
    button.addEventListener('keydown', (event) => {
      if (!['Enter', 'Space'].includes(event.code)) return;
      event.preventDefault();
      if (state.mode !== 'playing' || (event.repeat && !keyboard.has(event.code))) return;
      finishControl('interrupted');
      keyboard.add(event.code);
      update();
    });
    button.addEventListener('keyup', (event) => {
      if (!['Enter', 'Space'].includes(event.code)) return;
      event.preventDefault();
      keyboard.delete(event.code);
      update();
    });
    button.addEventListener('blur', () => {
      keyboard.clear();
      update();
    });
  });
  window.addEventListener('blur', resetTouch);
}
