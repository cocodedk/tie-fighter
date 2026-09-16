import { makeAWing } from './awing.js';
import { makeXWing } from './xwing.js';
import { scene } from './world.js';
import { state } from './state.js';
import { showEscape, showBonus, updateHud } from './ui.js';

const templates = { xwing: makeXWing(), awing: makeAWing() };
export function spawnEnemy(x = (Math.random() - 0.5) * 21,
  y = (Math.random() - 0.5) * 11, z = -115, type = 'xwing') {
  const ship = templates[type].clone();
  ship.position.set(x, y, z);
  scene.add(ship);
  state.enemies.push({
    ship, type, points: type === 'awing' ? 200 : 100, escapePenalty: type !== 'awing',
    age: 0, baseX: x, baseY: y, phase: Math.random() * Math.PI * 2,
    previous: ship.position.clone(), fireCooldown: 1.4 + Math.random() * 0.8,
  });
}

export function updateEnemies(dt) {
  const { elapsed, enemies } = state;
  state.spawnCooldown -= dt;
  if (state.spawnCooldown <= 0) {
    spawnEnemy();
    state.spawnCooldown = Math.max(1.4, 2.8 - elapsed * 0.01);
  }
  state.bonusCooldown -= dt;
  if (state.bonusCooldown <= 0) {
    spawnEnemy((Math.random() - .5) * 10, (Math.random() < .5 ? -1 : 1) * 3.5, -95, 'awing');
    state.bonusCooldown = 16;
    if (state.noticeTime === 0) { showBonus(); state.noticeTime = 2.5; }
  }
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    enemy.previous.copy(enemy.ship.position);
    enemy.age += dt;
    if (enemy.type === 'awing') {
      const weave = enemy.age * 2.4 + enemy.phase;
      enemy.ship.position.z += 30 * dt;
      enemy.ship.position.x = enemy.baseX + Math.sin(weave) * 4;
      enemy.ship.position.y = enemy.baseY + Math.sin(weave * .7) * .8;
      enemy.ship.rotation.z = -Math.cos(weave) * .45;
    } else {
      enemy.ship.position.z += (12 + Math.min(elapsed * 0.12, 10)) * dt;
      enemy.ship.position.x = enemy.baseX + Math.sin(elapsed * 0.7 + enemy.phase) * 0.85;
      enemy.ship.position.y = enemy.baseY + Math.sin(elapsed * 0.45 + enemy.phase) * 0.5;
      enemy.ship.rotation.z = Math.cos(elapsed * 0.7 + enemy.phase) * 0.12;
    }
    if (enemy.ship.position.z > 8) {
      scene.remove(enemy.ship);
      enemies.splice(i, 1);
      if (!enemy.escapePenalty) continue;
      state.escapes++;
      updateHud(state);
      showEscape(3 - state.escapes);
      state.noticeTime = 2;
      if (state.escapes >= 3) return true;
    }
  }
  return false;
}
