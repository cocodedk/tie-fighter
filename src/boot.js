import { text } from './i18n.js';

const start = document.getElementById('start');
start.disabled = true;

try {
  await Promise.race([
    document.fonts.ready,
    new Promise((resolve) => setTimeout(resolve, 1000)),
  ]);
  await new Promise((resolve) => {
    requestAnimationFrame(() => setTimeout(resolve, 0));
  });
  await import('./main.js');
  start.disabled = false;
} catch (error) {
  if (!start.hidden) {
    document.getElementById('title').textContent = text.unavailable;
    document.getElementById('description').textContent = text.loadFailed;
    document.getElementById('start-hint').hidden = true;
  }
  console.error('Game initialization failed:', error);
}
