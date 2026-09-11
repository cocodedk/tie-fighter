import * as THREE from 'three';
import { makeTie } from './tie.js';
import { createStars } from './stars.js';
import { text } from './i18n.js';

export let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('game'), antialias: true,
  });
} catch {
  document.getElementById('title').textContent = text.unavailable;
  document.getElementById('description').textContent =
    text.webgl;
  document.getElementById('start').hidden = true;
  document.getElementById('start-hint').hidden = true;
  throw new Error('WebGL2 is unavailable.');
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x080c13);
renderer.outputColorSpace = THREE.SRGBColorSpace;
export const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x080c13, 0.0025);
export const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 700);
camera.position.set(0, 4, 15);
scene.add(new THREE.HemisphereLight(0xc8dcff, 0x262733, 2.1));
const sun = new THREE.DirectionalLight(0xffdfb5, 3.4);
sun.position.set(-20, 30, 15);
scene.add(sun);
const rim = new THREE.DirectionalLight(0x567fad, 2.5);
rim.position.set(20, 5, -30);
scene.add(rim);
export const player = makeTie();
player.position.set(6, -0.8, -1);
player.rotation.set(0.12, -0.35, -0.12);
scene.add(player);
export const updateStars = createStars(scene);
const planet = new THREE.Mesh(
  new THREE.IcosahedronGeometry(55, 2),
  new THREE.MeshStandardMaterial({ color: 0x27343d, roughness: 1, flatShading: true }),
);
planet.position.set(-135, 48, -230);
planet.rotation.z = 0.3;
scene.add(planet);

function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  const angle = THREE.MathUtils.degToRad(29);
  camera.fov = THREE.MathUtils.radToDeg(
    2 * Math.atan(Math.tan(angle) / Math.min(1, camera.aspect / 1.45)),
  );
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();
