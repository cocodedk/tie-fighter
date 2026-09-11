import * as THREE from 'three';

export const metal = new THREE.MeshStandardMaterial({ color: 0x9aa5ad, roughness: 0.76, flatShading: true });
export const dark = new THREE.MeshStandardMaterial({ color: 0x121c28, roughness: 0.9, flatShading: true });
export const white = new THREE.MeshStandardMaterial({ color: 0xd6d1bc, roughness: 0.85, flatShading: true });
export const red = new THREE.MeshStandardMaterial({ color: 0xa24432, roughness: 0.8 });
export const glass = new THREE.MeshStandardMaterial({ color: 0x102a36, roughness: 0.25, metalness: 0.55 });
export const engine = new THREE.MeshBasicMaterial({ color: 0xff8268 });
export const laserMaterial = new THREE.MeshBasicMaterial({ color: 0x87ffac });
export const sparkMaterial = new THREE.MeshBasicMaterial({ color: 0xffc78c });
export const cube = new THREE.BoxGeometry(1, 1, 1);
export const sparkGeometry = new THREE.TetrahedronGeometry(0.28);
export const boltGeometry = new THREE.BoxGeometry(0.07, 0.07, 2.2);

export function mesh(group, geometry, material, x = 0, y = 0, z = 0) {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(x, y, z);
  group.add(object);
  return object;
}

export function box(group, material, x, y, z, sx, sy, sz) {
  const object = mesh(group, cube, material, x, y, z);
  object.scale.set(sx, sy, sz);
  return object;
}
