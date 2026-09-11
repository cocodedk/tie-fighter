import * as THREE from 'three';
import { mesh, box, metal, dark, glass, engine } from './parts.js';

export function makeTie() {
  const ship = new THREE.Group();
  mesh(ship, new THREE.SphereGeometry(0.95, 12, 8), metal);
  box(ship, metal, 0, 0, 0, 4.5, 0.3, 0.4);
  for (const side of [-1, 1]) {
    const panel = mesh(ship, new THREE.CylinderGeometry(2.3, 2.3, 0.16, 6), metal, side * 2.1);
    panel.rotation.z = Math.PI / 2;
    const inset = mesh(ship, new THREE.CylinderGeometry(2.1, 2.1, 0.18, 6), dark, side * 2.1);
    inset.rotation.z = Math.PI / 2;
    for (let spoke = 0; spoke < 6; spoke++) {
      const angle = (spoke * Math.PI) / 3;
      const bar = box(ship, metal, side * 2.1, Math.cos(angle), Math.sin(angle), 0.22, 2.12, 0.055);
      bar.rotation.x = angle;
    }
    const cannon = mesh(ship, new THREE.CylinderGeometry(0.09, 0.09, 0.6, 6), dark, side * 0.42, -0.38, -0.88);
    cannon.rotation.x = Math.PI / 2;
    mesh(ship, new THREE.SphereGeometry(0.1, 6, 4), engine, side * 0.35, 0, 0.87);
  }
  const window = mesh(ship, new THREE.CylinderGeometry(0.63, 0.63, 0.06, 8), glass, 0, 0, -0.79);
  window.rotation.x = Math.PI / 2;
  const rear = mesh(ship, new THREE.CylinderGeometry(0.42, 0.42, 0.07, 8), dark, 0, 0, 0.87);
  rear.rotation.x = Math.PI / 2;
  return ship;
}
