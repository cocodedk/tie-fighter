import * as THREE from 'three';
import { mesh, dark, metal, boltGeometry, laserMaterial } from './parts.js';

export function addCannon(ship, x, y, z) {
  const cannon = mesh(ship, new THREE.CylinderGeometry(0.09, 0.09, 0.6, 6), dark, x, y, z);
  cannon.name = 'laser-cannon';
  cannon.rotation.x = Math.PI / 2;
  const collar = mesh(cannon, new THREE.CylinderGeometry(0.13, 0.13, 0.15, 6), metal);
  collar.position.y = 0.18;
  const muzzle = new THREE.Object3D();
  muzzle.position.y = -0.3;
  cannon.add(muzzle);
  (ship.userData.muzzles ??= []).push(muzzle);
}

export function createVolley(player) {
  const group = new THREE.Group();
  const target = new THREE.Vector3(player.position.x, player.position.y, -65);
  player.updateMatrixWorld(true);
  const lasers = player.userData.muzzles.map((muzzle) => {
    const bolt = mesh(group, boltGeometry, laserMaterial);
    muzzle.getWorldPosition(bolt.position);
    const velocity = target.clone().sub(bolt.position).normalize().multiplyScalar(125);
    // Place the back of the beam at the muzzle, including the ship's current bank.
    bolt.position.addScaledVector(velocity, 1.1 / 125);
    bolt.lookAt(target);
    return { mesh: bolt, previous: bolt.position.clone(), velocity };
  });
  return { mesh: group, lasers };
}
