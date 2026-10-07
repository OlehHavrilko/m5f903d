import * as THREE from 'three';
import type { LevelBuilder, LevelContent } from '../../core/level-content.js';
import { createStudioMaterials, disposeObjectTree } from '../../materials/index.js';
import { createEngineAggregate } from '../../procgen/aggregates.js';
import { buildEngineAtom } from './atom.js';
import { buildEngineCharge } from './charge.js';
import { buildEngineCombustion } from './combustion.js';
import { buildEngineCylinder } from './cylinder.js';
import { buildEngineLongblock } from './longblock.js';
import { buildEngineMetal } from './metal.js';
import { buildEngineOil } from './oil.js';
import { buildEngineValvetrain } from './valvetrain.js';

/**
 * Branch A — engine geometry, dynamically imported. The branch descends from the
 * whole power unit to a single iron atom; every level is built here from
 * primitives, never loaded from a model file (docs/M0-design-plan.md §5.2).
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
  'engine.longblock': buildEngineLongblock,
  'engine.cylinder': buildEngineCylinder,
  'engine.valvetrain': buildEngineValvetrain,
  'engine.charge': buildEngineCharge,
  'engine.combustion': buildEngineCombustion,
  'engine.oil': buildEngineOil,
  'engine.metal': buildEngineMetal,
  'engine.atom': buildEngineAtom,
};

export {
  buildEngineAtom,
  buildEngineCharge,
  buildEngineCombustion,
  buildEngineCylinder,
  buildEngineLongblock,
  buildEngineMetal,
  buildEngineOil,
  buildEngineValvetrain,
};
