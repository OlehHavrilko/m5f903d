import * as THREE from 'three';
import type { LevelBuilder, LevelContent } from '../../core/level-content.js';
import { createStudioMaterials, disposeObjectTree } from '../../materials/index.js';
import { createSuspensionCorner } from '../../procgen/aggregates.js';

/**
 * Branch C — entry geometry (dynamically imported). Kinematics, damper
 * internals and the contact patch are expanded in M4.
 */
export const buildSuspCorner: LevelBuilder = (context): LevelContent => {
  const materials = createStudioMaterials(context.profile);
  const group = new THREE.Group();
  group.name = 'susp-corner';
  const corner = createSuspensionCorner(materials, context.profile);
  group.add(corner);

  const wheel = corner.getObjectByName('wheel');

  return {
    group,
    update(dt, _elapsed, state) {
      const spin = (state.speedKph / 3.6) * dt * 6;
      if (wheel) wheel.rotation.z += spin;
    },
    dispose() {
      disposeObjectTree(group);
      materials.dispose();
    },
  };
};

export const builders: Record<string, LevelBuilder> = {
  'susp.corner': buildSuspCorner,
};
