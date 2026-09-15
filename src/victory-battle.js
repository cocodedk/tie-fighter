import * as THREE from 'three';
import { makeTie } from './tie.js';
import { makeInterceptor } from './interceptor.js';
import { makeXWing } from './xwing.js';
import { makeAWing } from './awing.js';
import { makeVictoryDuel } from './victory-duel.js';

export function createVictoryBattle(scene) {
  const duels = [
    makeVictoryDuel(scene, makeTie(), makeXWing(), 'fighter', 'xwing', 2.15),
    makeVictoryDuel(scene, makeInterceptor(), makeAWing(), 'interceptor', 'awing', 3.65),
  ];
  function pose(time, camera, width, height, rtl) {
    const wide = width > height * 1.15;
    const short = wide && height <= 450;
    const side = rtl ? -1 : 1;
    const left = wide ? (short ? -.92 : .04) : -.8;
    const right = wide ? (short ? -.04 : .92) : .8;
    const rows = wide ? (short ? [.68, .44] : [.72, .52]) : [.56, .29];
    const pixel = 2 * (camera.position.z + 12) * Math.tan(THREE.MathUtils.degToRad(19)) / height;
    const size = pixel * Math.min(width * .16, height * .075) / 5;
    camera.updateMatrixWorld(true);
    const position = (u, y, z) => {
      const x = THREE.MathUtils.lerp(left, right, u) * (wide ? side : 1);
      const ray = new THREE.Vector3(x, y, .5).unproject(camera).sub(camera.position);
      return camera.position.clone().addScaledVector(ray, (z - camera.position.z) / ray.z);
    };
    const departure = THREE.MathUtils.smoothstep(time, 5, 8);
    const distance = (1 - THREE.MathUtils.smoothstep(time, 0, 1)) * 38 + departure * 55;
    duels.forEach((duel, i) => {
      const pursuit = Math.min(time, 5);
      const targetTime = Math.min(time, duel.hitAt);
      const hunterU = i ? .96 - pursuit * .12 : .04 + pursuit * .12;
      const rebelU = i ? .46 - targetTime * .055 : .54 + targetTime * .1;
      const y = rows[i];
      duel.pose(time, position(hunterU, y - .025, -10 - distance),
        position(rebelU, y + Math.sin(targetTime * 1.7) * .02, -14 - distance), size, pixel, departure);
    });
  }
  return { duels, pose, getState: () => duels.map((duel) => duel.getState()) };
}
