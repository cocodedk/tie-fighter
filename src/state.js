import { player } from './world.js';
import { readBestScore } from './scores.js';
import { getCareer } from './career.js';
import { getVictory } from './victory.js';

export const maxHealth = 3;
export const killsPerRepair = 5;
export const killsUntilRepair = (score) => killsPerRepair - (score / 100) % killsPerRepair;

export const state = {
  mode: 'ready', score: 0, bestScore: readBestScore(), escapes: 0, elapsed: 0,
  health: maxHealth, invulnerableTime: 0, damageTime: 0, victoryPending: false,
  fireCooldown: 0, spawnCooldown: 0, noticeTime: 0, hitTime: 0,
  keys: new Set(), enemies: [], shots: [], enemyShots: [], debris: [], agent: null,
};
export const bounds = { x: 12, y: 7 };

const position = ({ x, y, z }) => ({ x, y, z });

export function getState() {
  return {
    mode: state.mode,
    shipType: player.userData.shipType,
    score: state.score,
    bestScore: state.bestScore,
    career: getCareer(),
    victory: getVictory(),
    health: state.health,
    maxHealth,
    killsUntilRepair: killsUntilRepair(state.score),
    invulnerableSeconds: state.invulnerableTime,
    escapes: state.escapes,
    escapeLimit: 3,
    elapsedSeconds: state.elapsed,
    player: position(player.position),
    bounds,
    enemies: state.enemies.map(({ ship }) => position(ship.position)),
    activeShots: state.shots.length,
    enemyShots: state.enemyShots.map(({ mesh, velocity }) => ({
      ...position(mesh.position), velocity: position(velocity),
    })),
    activeDebris: state.debris.length,
    controlActive: state.agent !== null,
    controls: 'WASD or arrow keys: fly; Space: fire; Escape: pause; Enter: launch/resume',
  };
}
