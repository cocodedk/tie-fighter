import * as THREE from 'three';
import { makeTie } from './tie.js';
import { makeInterceptor } from './interceptor.js';

export const shipTypes = ['fighter', 'interceptor'];
const storageKey = 'tie-fighter.ship.v1';
const models = new Map();
export const player = new THREE.Group();

export function selectShip(type) {
  if (!shipTypes.includes(type)) throw new Error('Choose fighter or interceptor.');
  if (!models.has(type)) models.set(type, type === 'fighter' ? makeTie() : makeInterceptor());
  player.clear();
  player.add(models.get(type));
  player.userData.shipType = type;
  player.userData.muzzles = models.get(type).userData.muzzles;
  try { localStorage.setItem(storageKey, type); } catch {
    // The current choice still works when storage is unavailable.
  }
}

let initial = 'fighter';
try {
  const saved = localStorage.getItem(storageKey);
  if (shipTypes.includes(saved)) initial = saved;
} catch {
  // Default to the classic fighter when storage is unavailable.
}
selectShip(initial);
