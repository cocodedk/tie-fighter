import * as THREE from 'three';
import { renderer, scene, player, camera, updateStars } from './world.js';
import { state } from './state.js';
import { updateGame } from './game.js';
import { spawnEnemy } from './enemies.js';
import { bindKeyboard } from './keyboard.js';
import { registerWebMCP } from './webmcp.js';
import { $, updateHud } from './ui.js';
import { bindTouch } from './touch.js';
import { bindCareer } from './career-ui.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

updateHud(state);
bindKeyboard();
bindTouch();
bindCareer();
registerWebMCP().catch((error) => console.warn('WebMCP registration failed:', error));
spawnEnemy(1, 3, -48);
spawnEnemy(9, 4, -70);
spawnEnemy(-6, -2, -86);
const aim = new THREE.Vector3();
const target = new THREE.Vector3();
let previousTime = 0;

function animate(time) {
  if (state.mode !== 'playing' && time - previousTime < 50) return;
  const dt = Math.min((time - previousTime) / 1000 || 0, 0.05);
  previousTime = time;
  if (state.mode === 'playing') updateGame(dt);
  if (state.mode === 'ready' && !reducedMotion.matches) {
    player.position.y = -0.8 + Math.sin(time * 0.0006) * 0.2;
    player.rotation.z = -0.12 + Math.sin(time * 0.0004) * 0.035;
  }
  if ((state.mode === 'ready' && !reducedMotion.matches) || state.mode === 'playing') {
    updateStars(dt, state.mode === 'playing' ? 28 : 3);
  }
  const tracking = state.mode === 'ready' ? 0 : 0.35;
  const smoothing = state.mode === 'ready' ? 1 - Math.exp(-5 * dt) : 1;
  const height = state.mode === 'ready' ? 4 : 2 + player.position.y * 0.6;
  camera.position.x = THREE.MathUtils.lerp(camera.position.x, player.position.x * tracking, smoothing);
  camera.position.y = THREE.MathUtils.lerp(camera.position.y, height, smoothing);
  target.set(camera.position.x, camera.position.y - 3, -35);
  camera.lookAt(target);
  camera.updateMatrixWorld();
  aim.set(player.position.x, player.position.y, -65).project(camera);
  for (const id of ['reticle', 'hit']) {
    $(id).style.left = `${(aim.x * 0.5 + 0.5) * window.innerWidth}px`;
    $(id).style.top = `${(-aim.y * 0.5 + 0.5) * window.innerHeight}px`;
  }
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
