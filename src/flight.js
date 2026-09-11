import * as THREE from 'three';
import { player } from './world.js';
import { bounds, state } from './state.js';
import { fire } from './combat.js';

export function updateFlight(dt) {
  const { keys, agent } = state;
  const right = keys.has('KeyD') || keys.has('ArrowRight') || keys.has('TouchRight');
  const left = keys.has('KeyA') || keys.has('ArrowLeft') || keys.has('TouchLeft');
  const up = keys.has('KeyW') || keys.has('ArrowUp') || keys.has('TouchUp');
  const down = keys.has('KeyS') || keys.has('ArrowDown') || keys.has('TouchDown');
  const dx = agent ? agent.horizontal : Number(right) - Number(left);
  const dy = agent ? agent.vertical : Number(up) - Number(down);
  const step = (14 * dt) / (dx && dy ? Math.SQRT2 : 1);
  player.position.x = THREE.MathUtils.clamp(player.position.x + dx * step, -bounds.x, bounds.x);
  player.position.y = THREE.MathUtils.clamp(player.position.y + dy * step, -bounds.y, bounds.y);
  const smoothing = 1 - Math.exp(-8 * dt);
  player.rotation.z = THREE.MathUtils.lerp(player.rotation.z, -dx * 0.3, smoothing);
  player.rotation.x = THREE.MathUtils.lerp(player.rotation.x, dy * 0.15, smoothing);
  player.rotation.y = THREE.MathUtils.lerp(player.rotation.y, -dx * 0.1, smoothing);
  state.fireCooldown -= dt;
  if ((agent ? agent.fire : keys.has('Space') || keys.has('TouchFire')) && state.fireCooldown <= 0) {
    fire();
    state.fireCooldown = 0.16;
  }
}
