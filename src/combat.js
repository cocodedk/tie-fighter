import * as THREE from 'three';
import { mesh, boltGeometry, laserMaterial, sparkGeometry, sparkMaterial, metal } from './parts.js';
import { scene, player } from './world.js';
import { state, maxHealth, killsPerRepair } from './state.js';
import { updateHud, showRepair } from './ui.js';
import { saveBestScore } from './scores.js';
import { recordKill } from './career.js';
import { showAwards } from './career-ui.js';

const segment = new THREE.Line3();
const closest = new THREE.Vector3();

export function fire() {
  const bolts = new THREE.Group();
  for (const side of [-1, 1]) mesh(bolts, boltGeometry, laserMaterial, side * 0.42);
  bolts.position.copy(player.position);
  bolts.position.z -= 1.3;
  scene.add(bolts);
  state.shots.push({ mesh: bolts, previous: bolts.position.clone() });
}

function explode(position) {
  for (let i = 0; i < 16; i++) {
    const spark = mesh(scene, sparkGeometry, i % 3 ? sparkMaterial : metal);
    spark.position.copy(position);
    const velocity = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(15);
    state.debris.push({ mesh: spark, velocity, life: 0.65 + Math.random() * 0.4 });
  }
}

export function updateCombat(dt) {
  const { shots, enemies, debris } = state;
  for (let i = shots.length - 1; i >= 0; i--) {
    const shot = shots[i];
    shot.previous.copy(shot.mesh.position);
    shot.mesh.position.z -= 125 * dt;
    let hit = false;
    for (let j = enemies.length - 1; j >= 0; j--) {
      const enemy = enemies[j];
      // Sweep in the enemy's frame of reference so fast bolts cannot skip targets.
      segment.start.copy(shot.previous).sub(enemy.previous);
      segment.end.copy(shot.mesh.position).sub(enemy.ship.position);
      segment.closestPointToPoint(closest.set(0, 0, 0), true, closest);
      if (closest.lengthSq() < 2.1 * 2.1) {
        explode(enemy.ship.position);
        scene.remove(enemy.ship);
        enemies.splice(j, 1);
        state.score += 100;
        const unlocked = recordKill(state.score / 100);
        state.victoryPending ||= unlocked.some(({ type, id }) => type === 'rank' && id === 'darthVader');
        showAwards(unlocked);
        if (state.score % (killsPerRepair * 100) === 0) {
          state.health = maxHealth;
          state.damageTime = 0;
          state.noticeTime = 2;
          showRepair();
        }
        if (state.score > state.bestScore) state.bestScore = saveBestScore(state.score);
        updateHud(state);
        state.hitTime = 0.15;
        hit = true;
        break;
      }
    }
    if (hit || shot.mesh.position.z < -150) {
      scene.remove(shot.mesh);
      shots.splice(i, 1);
    }
    if (state.victoryPending) return;
  }

  for (let i = debris.length - 1; i >= 0; i--) {
    const particle = debris[i];
    particle.life -= dt;
    particle.mesh.position.addScaledVector(particle.velocity, dt);
    particle.mesh.rotation.x += dt * 3;
    particle.mesh.scale.setScalar(Math.max(0, particle.life));
    if (particle.life <= 0) { scene.remove(particle.mesh); debris.splice(i, 1); }
  }
}
