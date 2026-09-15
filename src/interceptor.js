import * as THREE from 'three';
import { addCannon } from './cannons.js';
import { makeCockpit } from './tie.js';
import { mesh, metal, dark } from './parts.js';

const panelMaterial = dark.clone();
panelMaterial.side = THREE.DoubleSide;

function panel(ship, points) {
  const vertices = points.flatMap((point) => point.toArray());
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex([0, 1, 2, 0, 2, 3]);
  geometry.computeVertexNormals();
  mesh(ship, geometry, panelMaterial);
  points.forEach((from, i) => {
    const to = points[(i + 1) % points.length];
    const direction = to.clone().sub(from);
    const rail = mesh(ship, new THREE.CylinderGeometry(0.055, 0.055, direction.length(), 5), metal);
    rail.position.copy(from).add(to).multiplyScalar(0.5);
    rail.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  });
}

export function makeInterceptor() {
  const ship = makeCockpit();
  for (const side of [-1, 1]) {
    panel(ship, [[2.1, -0.4, 1.3], [2.1, 0.4, 1.3], [2.1, 0.4, -0.9], [2.1, -0.4, -0.9]]
      .map(([x, y, z]) => new THREE.Vector3(x * side, y, z)));
    for (const top of [-1, 1]) {
      addCannon(ship, side * 1.45, top * 1.9, -4.4);
      panel(ship, [[2.1, 0.4, 1.3], [1.45, 1.9, 0.8], [1.45, 1.9, -4.2], [2.1, 0.4, -0.9]]
        .map(([x, y, z]) => new THREE.Vector3(x * side, y * top, z)));
    }
  }
  return ship;
}
