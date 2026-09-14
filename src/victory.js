import { createVictoryScene } from './victory-scene.js';
import { language } from './i18n.js';

const text = language === 'fa' ? {
  rank: 'دارث ویدر', achieved: 'بالاترین درجه کسب شد', newGame: 'بازی جدید', back: 'بازگشت',
  claim: 'نیروهای شورشی شکست خورده‌اند. پیروزی از آنِ امپراتوری است.', replay: 'نمایش دوبارهٔ پیروزی',
} : {
  rank: 'Darth Vader', achieved: 'Highest rank achieved', newGame: 'New game', back: 'Back',
  claim: 'The Rebel forces are defeated. Victory belongs to the Empire.', replay: 'Replay victory',
};
const $ = (id) => document.getElementById(id);
export const victory = { active: false, elapsed: 0, finale: false };
export let victoryScene;

export function getVictory() {
  return { active: victory.active, elapsedSeconds: victory.elapsed,
    complete: victory.elapsed >= 5, finale: victory.finale };
}

export function showVictory(finale = false) {
  victoryScene ??= createVictoryScene();
  Object.assign(victory, { active: true, elapsed: 0, finale });
  $('service-record').close();
  $('victory-action').textContent = finale ? text.newGame : text.back;
  document.body.classList.add('celebrating');
  $('victory-screen').showModal();
}

export function closeVictory() {
  victory.active = false;
  document.body.classList.remove('celebrating');
  $('victory-screen').close();
}

export function bindVictory(startNewGame) {
  document.querySelectorAll('[data-victory]').forEach((element) => {
    element.textContent = text[element.dataset.victory];
  });
  $('victory-action').addEventListener('click', () => {
    const finale = victory.finale;
    closeVictory();
    if (finale) startNewGame();
  });
  $('victory-screen').addEventListener('cancel', (event) => {
    event.preventDefault();
    closeVictory();
  });
}

export function renderVictory(renderer, dt, reducedMotion) {
  if (!victory.active) return false;
  if (!document.hidden) victory.elapsed = reducedMotion ? 5 : Math.min(5, victory.elapsed + dt);
  victoryScene.pose(victory.elapsed, window.innerWidth, window.innerHeight, language === 'fa');
  renderer.render(victoryScene.scene, victoryScene.camera);
  return true;
}
