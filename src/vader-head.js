import * as THREE from 'three';
import { mesh, box } from './parts.js';

export function makeVaderHead(armor, steel, black) {
  const head = new THREE.Group();
  head.name = 'Vader helmet';
  mesh(head, new THREE.SphereGeometry(0.66, 10, 6), armor, 0, 0.2, -0.04).scale.set(1, 1.1, 0.9);
  mesh(head, new THREE.CylinderGeometry(0.57, 0.85, 0.64, 8), armor, 0, -0.18, -0.1).scale.z = 0.85;
  mesh(head, new THREE.IcosahedronGeometry(0.55, 0), steel, 0, -0.06, 0.31).scale.set(1, 1, 0.67);
  for (const side of [-1, 1]) {
    const cheek = mesh(head, new THREE.ConeGeometry(0.25, 0.61, 3), armor, side * 0.4, -0.28, 0.35);
    cheek.rotation.z = side * -0.22;
    const brow = box(head, steel, side * 0.25, 0.17, 0.62, 0.45, 0.08, 0.12);
    brow.rotation.z = side * -0.13;
    const eye = box(head, black, side * 0.25, 0.08, 0.66, 0.34, 0.13, 0.055);
    eye.rotation.z = side * -0.13;
    mesh(head, new THREE.CylinderGeometry(0.095, 0.095, 0.11, 6), steel,
      side * 0.35, -0.45, 0.59).rotation.x = Math.PI / 2;
  }
  const mouth = new THREE.BufferGeometry();
  mouth.setAttribute('position', new THREE.Float32BufferAttribute([-.29, -.48, 0, .29, -.48, 0, 0, -.04, 0], 3));
  mouth.computeVertexNormals();
  mesh(head, mouth, black, 0, 0, .735);
  for (const x of [-0.15, -0.075, 0, 0.075, 0.15]) {
    box(head, steel, x, -0.36, 0.748, 0.027, 0.23 - Math.abs(x) * 0.6, 0.025);
  }
  const nose = mesh(head, new THREE.ConeGeometry(0.13, 0.35, 4), armor, 0, -0.02, 0.68);
  nose.rotation.x = Math.PI / 2;
  return head;
}
