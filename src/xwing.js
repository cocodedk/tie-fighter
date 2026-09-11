import * as THREE from 'three';
import { mesh, box, metal, white, red, glass, engine } from './parts.js';

export function makeXWing() {
  const ship = new THREE.Group();
  box(ship, white, 0, 0, 0, 0.48, 0.44, 3.2);
  const nose = mesh(ship, new THREE.ConeGeometry(0.33, 2.6, 4), white, 0, 0, 2.7);
  nose.rotation.x = Math.PI / 2;
  box(ship, glass, 0, 0.3, 0.6, 0.37, 0.25, 1.05);
  box(ship, red, 0, 0.23, 2, 0.16, 0.03, 1.5);
  for (const side of [-1, 1]) {
    for (const up of [-1, 1]) {
      const wing = new THREE.Group();
      wing.rotation.z = side * up * 0.35;
      box(wing, white, side * 1.45, 0, -0.5, 2.65, 0.12, 0.9);
      box(wing, red, side * 1.95, 0.075, -0.5, 0.38, 0.035, 0.9);
      const thruster = mesh(wing, new THREE.CylinderGeometry(0.25, 0.25, 1.6, 8), metal, side * 0.72, 0, -0.6);
      thruster.rotation.x = Math.PI / 2;
      const glow = mesh(wing, new THREE.CylinderGeometry(0.18, 0.18, 0.05, 8), engine, side * 0.72, 0, -1.43);
      glow.rotation.x = Math.PI / 2;
      box(wing, metal, side * 2.75, 0, 0.25, 0.08, 0.08, 2.7);
      ship.add(wing);
    }
  }
  ship.scale.setScalar(0.85);
  return ship;
}
