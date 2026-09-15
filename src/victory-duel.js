import * as THREE from 'three';
import { mesh, laserMaterial } from './parts.js';
import { makeBattleExplosion } from './battle-explosion.js';

const boltGeometry = new THREE.BoxGeometry(1, 1, 1);

export function makeVictoryDuel(scene, hunter, rebel, attacker, target, hitAt) {
  hunter.name = attacker; rebel.name = target;
  const explosion = makeBattleExplosion();
  const bolts = hunter.userData.muzzles.map(() => mesh(scene, boltGeometry, laserMaterial));
  scene.add(hunter, rebel, explosion.group);
  let phase = 'tracking';
  function pose(time, hunterPosition, rebelPosition, size, pixel, departure = 0) {
    phase = time >= hitAt ? 'destroyed' : time >= hitAt - .9 ? 'firing' : 'tracking';
    hunter.position.copy(hunterPosition);
    rebel.position.copy(rebelPosition);
    hunter.scale.setScalar(size); rebel.scale.setScalar(size * (target === 'awing' ? 1.35 : 1));
    const headingTarget = rebelPosition.clone().lerp(hunterPosition.clone().add(new THREE.Vector3(0, 0, -20)), departure);
    hunter.lookAt(headingTarget); hunter.rotateY(Math.PI);
    hunter.rotateZ(attacker === 'fighter' ? -.18 : .2);
    const heading = rebelPosition.clone().sub(hunterPosition);
    rebel.lookAt(rebelPosition.clone().add(heading));
    rebel.rotateZ((target === 'awing' ? -.7 : .2) + Math.sin(time * 2) * .12);
    rebel.visible = phase !== 'destroyed';
    hunter.updateMatrixWorld(true);
    const progress = ((Math.max(0, time - hitAt + .9)) % .45) / .45;
    bolts.forEach((bolt, i) => {
      bolt.visible = phase === 'firing';
      hunter.userData.muzzles[i].getWorldPosition(bolt.position);
      bolt.position.lerp(rebelPosition, progress);
      bolt.lookAt(rebelPosition);
      bolt.scale.set(pixel * 2, pixel * 2, pixel * 15);
    });
    explosion.group.position.copy(rebelPosition);
    explosion.group.scale.setScalar(size * 2);
    explosion.pose(time - hitAt);
  }
  const getState = () => ({ attacker, target, phase, activeLasers: phase === 'firing' ? bolts.length : 0 });
  return { hunter, rebel, bolts, explosion, hitAt, pose, getState };
}
