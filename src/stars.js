import * as THREE from 'three';

export function createStars(scene) {
  const positions = new Float32Array(850 * 3);
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] = (Math.random() - 0.5) * 420;
    positions[i + 1] = (Math.random() - 0.5) * 240;
    positions[i + 2] = Math.random() * -500;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0xaebfcb, size: 0.4, transparent: true, opacity: 0.75,
  });
  scene.add(new THREE.Points(geometry, material));
  return (dt, speed) => {
    for (let i = 2; i < positions.length; i += 3) {
      positions[i] += dt * speed;
      if (positions[i] > 20) positions[i] = -500;
    }
    geometry.attributes.position.needsUpdate = true;
  };
}
