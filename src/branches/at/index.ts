import * as THREE from 'three';
import type { LevelBuilder, LevelContent } from '../../core/level-content.js';
import { createStudioMaterials, disposeObjectTree } from '../../materials/index.js';
import { createTransmissionAggregate } from '../../procgen/aggregates.js';

/**
 * Branch B — entry geometry (dynamically imported). Converter, planetary sets,
 * clutches and mechatronics are expanded in M4.
 */
export const buildAtUnit: LevelBuilder = (context): LevelContent => {
  const materials = createStudioMaterials(context.profile);
  const group = new THREE.Group();
  group.name = 'at-unit';
  const transmission = createTransmissionAggregate(materials, context.profile);
  group.add(transmission);

  const converter = transmission.getObjectByName('converter');
  const flange = transmission.getObjectByName('output-flange');

  return {
    group,
    update(dt, _elapsed, state) {
      const rate = 0.4 + Math.min(1, state.rpm / 6000);
      // Local axis rotation keeps the torus/cylinder spinning about their own axes.
      converter?.rotateZ(dt * rate * 1.6);
      flange?.rotateY(dt * rate * 1.6);
    },
    dispose() {
      disposeObjectTree(group);
      materials.dispose();
    },
  };
};

export const builders: Record<string, LevelBuilder> = {
  'at.unit': buildAtUnit,
};
