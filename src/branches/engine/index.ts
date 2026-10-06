import * as THREE from 'three';
import type { LevelBuilder, LevelContent } from '../../core/level-content.js';
import { createStudioMaterials, disposeObjectTree } from '../../materials/index.js';
import { createEngineAggregate } from '../../procgen/aggregates.js';

/**
 * Branch A — entry geometry (dynamically imported). The deeper engine levels
 * are added in M3; this module owns the whole power-unit aggregate and is the
 * deep-link target `engine.unit`.
 */
export const buildEngineUnit: LevelBuilder = (context): LevelContent => {
  const materials = createStudioMaterials(context.profile);
  const group = new THREE.Group();
  group.name = 'engine-unit';
  const engine = createEngineAggregate(materials, context.profile);
  group.add(engine);

  return {
    group,
    update(_dt, elapsed, state) {
      // Torque reaction: the block rocks very slightly around the crank axis.
      const amplitude = 0.008 * Math.min(1, state.rpm / 1600);
      engine.rotation.z = Math.sin(elapsed * 2.2) * amplitude;
    },
    dispose() {
      disposeObjectTree(group);
      materials.dispose();
    },
  };
};

export const builders: Record<string, LevelBuilder> = {
  'engine.unit': buildEngineUnit,
};
