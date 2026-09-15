import * as THREE from 'three';
import { mesh, sparkGeometry, sparkMaterial, metal, white } from './parts.js';

export function makeBattleExplosion() {
  const group = new THREE.Group();
  const core = mesh(group, new THREE.IcosahedronGeometry(.5, 0), sparkMaterial);
  const fragments = Array.from({ length: 10 }, (_, i) => {
    const fragment = mesh(group, sparkGeometry, i % 3 ? metal : white);
    const angle = i * Math.PI * 2 / 10;
    return { fragment, direction: new THREE.Vector3(Math.cos(angle), Math.sin(angle), (i % 3 - 1) * .4) };
  });
  function pose(age) {
    group.visible = age >= 0 && age < 1.1;
    const progress = Math.max(0, age);
    core.visible = progress < .35;
    core.scale.setScalar(.3 + progress * 4);
    for (const { fragment, direction } of fragments) {
      fragment.position.copy(direction).multiplyScalar(progress * 3);
      fragment.rotation.set(progress * 3, progress * 2, progress);
      fragment.scale.setScalar(Math.max(0, 1 - progress / 1.1));
    }
  }
  return { group, pose };
}
