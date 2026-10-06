import * as THREE from 'three';
import type { LevelBuilder, LevelContent } from '../../core/level-content.js';
import { createStudioMaterials, disposeObjectTree } from '../../materials/index.js';
import { createBrakeCorner } from '../../procgen/aggregates.js';

/**
 * Branch D — entry geometry (dynamically imported). Caliper cutaway, friction
 * pair, ABS cycle and the steering rack are expanded in M5.
 */
export const buildBrakeCorner: LevelBuilder = (context): LevelContent => {
  const materials = createStudioMaterials(context.profile);
  const group = new THREE.Group();
  group.name = 'brake-corner';
  const brake = createBrakeCorner(materials, context.profile);
  group.add(brake);

  const disc = brake.getObjectByName('brake-disc');

  return {
    group,
    update(dt, _elapsed, state) {
      const spin = (state.speedKph / 3.6) * dt * 6;
      if (disc) disc.rotateY(spin);
    },
    dispose() {
      disposeObjectTree(group);
      materials.dispose();
    },
  };
};

export const builders: Record<string, LevelBuilder> = {
  'brake.corner': buildBrakeCorner,
};
