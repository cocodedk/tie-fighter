import * as THREE from 'three';
import { mesh, box, white, red, metal, glass, engine } from './parts.js';

export function makeAWing() {
  const ship = new THREE.Group();
  const hull = new THREE.BufferGeometry();
  hull.setAttribute('position', new THREE.Float32BufferAttribute([
    -.95, .2, -1.1, .95, .2, -1.1, .18, .1, 2, -.18, .1, 2,
    -.95, -.2, -1.1, .95, -.2, -1.1, .18, -.1, 2, -.18, -.1, 2,
  ], 3));
  hull.setIndex([0, 3, 2, 0, 2, 1, 4, 5, 6, 4, 6, 7, 0, 1, 5, 0, 5, 4,
    1, 2, 6, 1, 6, 5, 2, 3, 7, 2, 7, 6, 3, 0, 4, 3, 4, 7]);
  hull.computeVertexNormals();
  mesh(ship, hull, white);
  box(ship, red, 0, .21, .35, .34, .045, 2.6);
  const cockpit = mesh(ship, new THREE.SphereGeometry(.43, 8, 6), glass, 0, .3, -.25);
  cockpit.scale.set(.8, .65, 1.4);
  for (const side of [-1, 1]) {
    const thruster = mesh(ship, new THREE.CylinderGeometry(.26, .26, 1.5, 6), metal, side * .73, 0, -1.2);
    thruster.rotation.x = Math.PI / 2;
    const glow = mesh(ship, new THREE.CylinderGeometry(.2, .2, .05, 6), engine, side * .73, 0, -1.97);
    glow.rotation.x = Math.PI / 2;
    box(ship, red, side * .73, .35, -1.25, .07, .65, .6);
    box(ship, metal, side * 1.05, 0, .05, .09, .09, 1.5);
  }
  return ship;
}
