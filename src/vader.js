import * as THREE from 'three';
import { mesh, box } from './parts.js';
import { makeVaderHead } from './vader-head.js';

export function makeVader() {
  const actor = new THREE.Group();
  actor.name = 'Darth Vader';
  const material = (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.62, metalness: 0.24, flatShading: true });
  const armor = material(0x151a22), steel = material(0x424956), black = material(0x050609);
  const capeMaterial = new THREE.MeshStandardMaterial({ color: 0x0b0d13, roughness: 1, side: THREE.DoubleSide, flatShading: true });
  const cape = new THREE.Group();
  cape.position.y = 2.6;
  const cloth = new THREE.BufferGeometry();
  cloth.setAttribute('position', new THREE.Float32BufferAttribute([
    -.65, 0, -.3, -1.32, -3.05, -.75, 0, -1.4, -1,
    -.65, 0, -.3, 0, -1.4, -1, .65, 0, -.3,
    .65, 0, -.3, 0, -1.4, -1, 1.32, -3.05, -.75,
    -1.32, -3.05, -.75, 0, -3.1, -1.03, 0, -1.4, -1,
    0, -1.4, -1, 0, -3.1, -1.03, 1.32, -3.05, -.75,
  ], 3));
  cloth.computeVertexNormals();
  mesh(cape, cloth, capeMaterial);
  actor.add(cape);
  mesh(actor, new THREE.CylinderGeometry(.66, .48, 1.5, 6), black, 0, 1.91).scale.z = .72;
  box(actor, armor, 0, 2.48, .12, 1.5, .25, .77);
  box(actor, steel, 0, 2.51, .52, .7, .1, .06);
  box(actor, armor, 0, 1.06, .1, 1.15, .24, .73);
  box(actor, steel, 0, 1.07, .49, .27, .15, .07);
  box(actor, armor, 0, 1.92, .48, .58, .59, .14);
  for (let i = 0; i < 3; i++) {
    const light = new THREE.MeshBasicMaterial({ color: [0xd5d9df, 0xdd333a, 0x7fafc6][i] });
    box(actor, light, -.17 + i * .17, 2.07, .565, .1, .14, .025);
    box(actor, steel, -.17 + i * .17, 1.82, .57, .08, .16, .03);
  }
  for (const side of [-1, 1]) {
    box(actor, black, side * .32, .39, .03, .43, 1.1, .47);
    box(actor, armor, side * .32, -.29, .19, .48, .38, .74);
  }
  const forearms = [];
  const arms = [-1, 1].map((side) => {
    const arm = new THREE.Group();
    arm.position.set(side * .77, 2.39, .03);
    mesh(arm, new THREE.CylinderGeometry(.21, .17, .72, 6), black, 0, -.35);
    const forearm = new THREE.Group();
    forearm.position.y = -.68;
    box(forearm, armor, 0, -.24, .08, .33, .56, .4);
    mesh(forearm, new THREE.IcosahedronGeometry(.24, 0), black, 0, -.57, .12);
    arm.add(forearm); forearms.push(forearm);
    actor.add(arm);
    return arm;
  });
  const saber = new THREE.Group();
  saber.position.set(-1.03, 1.04, .38);
  saber.rotation.z = .15;
  mesh(saber, new THREE.CylinderGeometry(.065, .065, .4, 6), steel);
  const blade = new THREE.Group();
  const red = new THREE.MeshBasicMaterial({ color: 0xff233e });
  mesh(blade, new THREE.CylinderGeometry(.047, .047, 1.85, 6), red, 0, 1.12);
  mesh(blade, new THREE.CylinderGeometry(.02, .02, 1.85, 6), new THREE.MeshBasicMaterial({ color: 0xffb4b8 }), 0, 1.12, .025);
  saber.add(blade); actor.add(saber);
  const head = makeVaderHead(armor, steel, black);
  head.position.y = 3.02; actor.add(head);
  return { actor, cape, arms, forearms, blade, head };
}
