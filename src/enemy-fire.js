import * as THREE from 'three';
import { scene, player } from './world.js';
import { state } from './state.js';
import { mesh, enemyBoltGeometry, enemyLaserMaterial } from './parts.js';
import { showDamage, updateHud } from './ui.js';

const segment = new THREE.Line3();
const origin = new THREE.Vector3();
const closest = new THREE.Vector3();

function fireAtPlayer(enemy) {
  const bolt = mesh(scene, enemyBoltGeometry, enemyLaserMaterial);
  bolt.position.copy(enemy.ship.position);
  bolt.position.z += 1.5;
  // Aim once: moving after the shot is fired lets the pilot dodge it.
  const velocity = player.position.clone().sub(bolt.position).normalize().multiplyScalar(40);
  bolt.lookAt(player.position);
  state.enemyShots.push({ mesh: bolt, velocity });
}

export function updateEnemyFire(dt, previousPlayer) {
  state.invulnerableTime = Math.max(0, state.invulnerableTime - dt);
  for (const enemy of state.enemies) {
    enemy.fireCooldown -= dt;
    const z = enemy.ship.position.z;
    // No point-blank shots; even the nearest shot gives time to react.
    if (enemy.fireCooldown <= 0 && z < -26 && z > -105) {
      fireAtPlayer(enemy);
      enemy.fireCooldown = 2.8 + Math.random() * 0.8;
    }
  }
  for (let i = state.enemyShots.length - 1; i >= 0; i--) {
    const shot = state.enemyShots[i];
    segment.start.copy(shot.mesh.position).sub(previousPlayer);
    shot.mesh.position.addScaledVector(shot.velocity, dt);
    segment.end.copy(shot.mesh.position).sub(player.position);
    segment.closestPointToPoint(origin, true, closest);
    // Sweep relative to the moving TIE, with a forgiving cockpit hitbox.
    const hit = closest.lengthSq() < 1;
    if (hit && state.invulnerableTime === 0) {
      state.health = Math.max(0, state.health - 1);
      state.invulnerableTime = 0.85;
      state.damageTime = 0.3;
      state.noticeTime = 1.2;
      showDamage(state.health);
      updateHud(state);
    }
    if (hit || shot.mesh.position.z > 20) {
      scene.remove(shot.mesh);
      state.enemyShots.splice(i, 1);
    }
  }
}
