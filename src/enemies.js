import { makeXWing } from './xwing.js';
import { scene } from './world.js';
import { state } from './state.js';
import { showEscape, updateHud } from './ui.js';

const template = makeXWing();
export function spawnEnemy(x = (Math.random() - 0.5) * 21,
  y = (Math.random() - 0.5) * 11, z = -115) {
  const ship = template.clone();
  ship.position.set(x, y, z);
  scene.add(ship);
  state.enemies.push({
    ship, baseX: x, baseY: y, phase: Math.random() * Math.PI * 2,
    previous: ship.position.clone(),
  });
}

export function updateEnemies(dt) {
  const { elapsed, enemies } = state;
  state.spawnCooldown -= dt;
  if (state.spawnCooldown <= 0) {
    spawnEnemy();
    state.spawnCooldown = Math.max(1.4, 2.8 - elapsed * 0.01);
  }
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    enemy.previous.copy(enemy.ship.position);
    enemy.ship.position.z += (12 + Math.min(elapsed * 0.12, 10)) * dt;
    enemy.ship.position.x = enemy.baseX + Math.sin(elapsed * 0.7 + enemy.phase) * 0.85;
    enemy.ship.position.y = enemy.baseY + Math.sin(elapsed * 0.45 + enemy.phase) * 0.5;
    enemy.ship.rotation.z = Math.cos(elapsed * 0.7 + enemy.phase) * 0.12;
    if (enemy.ship.position.z > 8) {
      scene.remove(enemy.ship);
      enemies.splice(i, 1);
      state.escapes++;
      updateHud(state);
      showEscape(3 - state.escapes);
      state.noticeTime = 2;
      if (state.escapes >= 3) return true;
    }
  }
  return false;
}
