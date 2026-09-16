import * as THREE from 'three';
import { mesh, sparkGeometry, sparkMaterial, metal } from './parts.js';
import { createVolley } from './cannons.js';
import { scene, player } from './world.js';
import { state, maxHealth, killsPerRepair } from './state.js';
import { updateHud, showRepair } from './ui.js';
import { saveBestScore } from './scores.js';
import { recordKill } from './career.js';
import { showAwards } from './career-ui.js';

const segment = new THREE.Line3();
const closest = new THREE.Vector3();

export function fire() {
  const shot = createVolley(player);
  scene.add(shot.mesh);
  state.shots.push(shot);
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
    for (const laser of shot.lasers) {
      laser.previous.copy(laser.mesh.position);
      laser.mesh.position.addScaledVector(laser.velocity, dt);
    }
    let hit = false;
    for (let j = enemies.length - 1; j >= 0; j--) {
      const enemy = enemies[j];
      // Sweep every visible beam so wing-mounted cannons hit along their actual paths.
      const intersects = shot.lasers.some((laser) => {
        segment.start.copy(laser.previous).sub(enemy.previous);
        segment.end.copy(laser.mesh.position).sub(enemy.ship.position);
        segment.closestPointToPoint(closest.set(0, 0, 0), true, closest);
        return closest.lengthSq() < 2.1 * 2.1;
      });
      if (intersects) {
        explode(enemy.ship.position);
        scene.remove(enemy.ship);
        enemies.splice(j, 1);
        state.score += enemy.points;
        state.runKills++;
        const unlocked = recordKill(state.runKills);
        state.victoryPending ||= unlocked.some(({ type, id }) => type === 'rank' && id === 'darthVader');
        showAwards(unlocked);
        if (state.runKills % killsPerRepair === 0) {
          state.health = maxHealth;
          state.damageTime = 0;
          state.noticeTime = 2;
          showRepair();
        }
        if (state.score > state.bestScore) state.bestScore = saveBestScore(state.score, state.runKills);
        updateHud(state);
        state.hitTime = 0.15;
        hit = true;
        break;
      }
    }
    if (hit || shot.lasers.every((laser) => laser.mesh.position.z < -150)) {
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
