import * as THREE from 'three';
import { box, mesh } from './parts.js';
import { makeVader } from './vader.js';
import { makeXWing } from './xwing.js';

export function createVictoryScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070a11);
  scene.fog = new THREE.Fog(0x070a11, 15, 40);
  const camera = new THREE.PerspectiveCamera(38, 1, .1, 60);
  const vader = makeVader();
  scene.add(vader.actor);
  scene.add(new THREE.HemisphereLight(0xabbfe2, 0x22212e, 2.5));
  const key = new THREE.DirectionalLight(0xd9e4ff, 5);
  key.position.set(-3, 6, 7); scene.add(key);
  const red = new THREE.DirectionalLight(0xff263f, 3);
  red.position.set(-4, 2, 2); scene.add(red);
  const rim = new THREE.DirectionalLight(0x779ddd, 4);
  rim.position.set(3, 5, -4); scene.add(rim);
  const metal = new THREE.MeshStandardMaterial({ color: 0x242d3c, roughness: .9, flatShading: true });
  const strip = new THREE.MeshBasicMaterial({ color: 0x8d2536 });
  const platform = mesh(scene, new THREE.CylinderGeometry(2.25, 2.45, .22, 8), metal, 0, -.6);
  box(scene, metal, 0, -.85, -2, 40, .2, 30);
  for (const x of [-9, -5, 5, 9]) {
    const beam = box(scene, metal, x, 2.8, -8, .28, 12, .35);
    beam.rotation.z = Math.sign(x) * -.22;
    box(scene, strip, x, -.7, -2, .055, .025, 16);
  }
  box(scene, metal, 0, 6.2, -8, 30, .3, .5);
  box(scene, metal, 0, -.15, -8, 30, .3, .5);
  for (let i = 0; i < 65; i++) {
    const x = ((i * 37) % 103) / 103 * 40 - 20;
    const y = ((i * 23) % 71) / 71 * 15;
    mesh(scene, new THREE.TetrahedronGeometry(.035), new THREE.MeshBasicMaterial({ color: 0x91a1bf }), x, y, -22);
  }
  const wrecks = [-1, 1].map((side) => {
    const ship = makeXWing();
    ship.scale.setScalar(.35);
    ship.position.set(side * 4.3, 2.5 + side, -10);
    scene.add(ship);
    return ship;
  });
  function pose(time, width, height, rtl) {
    const wide = width > height * 1.15;
    camera.aspect = width / height;
    camera.position.set(0, 1.7, wide ? 9.3 : 11.6);
    camera.lookAt(0, 1.55, 0);
    camera.updateProjectionMatrix();
    const span = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(19));
    vader.actor.position.x = wide ? (rtl ? 1 : -1) * span * camera.aspect * .23 : 0;
    vader.actor.position.y = wide ? 0 : .35;
    platform.position.x = vader.actor.position.x;
    platform.position.y = vader.actor.position.y - .6;
    const gesture = THREE.MathUtils.smoothstep(time, .6, 2.8);
    vader.actor.rotation.y = .25 - gesture * .32;
    vader.arms[1].rotation.z = gesture * 1.1;
    vader.forearms[1].rotation.z = gesture * 1.9;
    vader.arms[1].rotation.x = -gesture * .35;
    vader.arms[0].rotation.z = -.16;
    vader.head.rotation.y = -gesture * .08;
    vader.cape.rotation.x = time < 5 ? Math.sin(time * 1.7) * .025 : 0;
    vader.blade.scale.y = THREE.MathUtils.smoothstep(time, .1, 1);
    wrecks.forEach((ship, i) => {
      ship.position.y = 2.5 + (i ? 1 : -1) - Math.min(time, 5) * .28;
      ship.rotation.set(.3 + time * .1, .5, (i ? 1 : -1) * (.4 + Math.min(time, 5) * .25));
    });
  }
  return { scene, camera, vader, pose };
}
