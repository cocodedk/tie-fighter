import { state, getState } from './state.js';

export function finishControl(status) {
  const action = state.agent;
  if (!action) return;
  state.agent = null;
  action.signal?.removeEventListener('abort', action.abort);
  action.resolve({ status, ...getState() });
}

export function controlFighter({ horizontal = 0, vertical = 0,
  fire = false, duration_ms = 250 } = {}, { signal } = {}) {
  if (![horizontal, vertical].every((n) => Number.isInteger(n) && Math.abs(n) <= 1)) {
    throw new Error('horizontal and vertical must be integers from -1 to 1.');
  }
  if (typeof fire !== 'boolean' || !Number.isInteger(duration_ms)
    || duration_ms < 50 || duration_ms > 3000) {
    throw new Error('fire must be a boolean; duration_ms must be 50–3000 milliseconds.');
  }
  if (state.mode !== 'playing') throw new Error('Start or resume the game first.');
  if (state.agent) throw new Error('Another flight control is running; wait for it to finish.');
  if (signal?.aborted) throw new DOMException('Control cancelled.', 'AbortError');
  return new Promise((resolve) => {
    state.agent = {
      horizontal, vertical, fire, remaining: duration_ms / 1000, resolve, signal,
      abort: () => finishControl('aborted'),
    };
    signal?.addEventListener('abort', state.agent.abort, { once: true });
  });
}
