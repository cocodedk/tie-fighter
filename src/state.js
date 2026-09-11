import { player } from './world.js';

export const state = {
  mode: 'ready', score: 0, escapes: 0, elapsed: 0,
  fireCooldown: 0, spawnCooldown: 0, noticeTime: 0, hitTime: 0,
  keys: new Set(), enemies: [], shots: [], debris: [], agent: null,
};
export const bounds = { x: 12, y: 7 };

const position = ({ x, y, z }) => ({ x, y, z });

export function getState() {
  return {
    mode: state.mode,
    score: state.score,
    escapes: state.escapes,
    escapeLimit: 3,
    elapsedSeconds: state.elapsed,
    player: position(player.position),
    bounds,
    enemies: state.enemies.map(({ ship }) => position(ship.position)),
    activeShots: state.shots.length,
    activeDebris: state.debris.length,
    controlActive: state.agent !== null,
    controls: 'WASD or arrow keys: fly; Space: fire; Escape: pause; Enter: launch/resume',
  };
}
