import * as THREE from 'three';
import type { LevelBuilder, LevelContent } from '../../core/level-content.js';
import { PHYSICS_COLORS, createStudioMaterials, disposeObjectTree } from '../../materials/index.js';
import { createFlowMarkers, createGrainField } from '../../procgen/engine.js';

/**
 * `engine.metal` — the polycrystalline microstructure of the metal.
 *
 * The scale is exaggerated by several orders of magnitude so the grain network
 * reads on screen; the point is that a "solid" part is really many crystals with
 * boundaries, and that cracks choose between them.
 */
export const buildEngineMetal: LevelBuilder = (context): LevelContent => {
  const materials = createStudioMaterials(context.profile);
  const group = new THREE.Group();
  group.name = 'engine-metal';
  const grain = createGrainField(materials, context.profile, 16, 0.12, 11);
  group.add(grain.group);

  const boundaryMaterial = grain.boundaries[0]?.material as THREE.LineBasicMaterial | undefined;
  if (boundaryMaterial) boundaryMaterial.transparent = true;

  const slip = createFlowMarkers(materials, PHYSICS_COLORS.exhaust, 6, 0.003);
  slip.group.visible = false;
  group.add(slip.group);

  let cutaway = false;
  let slipOn = false;

  return {
    group,
    setMode(mode) {
      cutaway = mode === 'cutaway';
      slipOn = mode === 'flow' || mode === 'explore';
      slip.group.visible = slipOn;
      // Cutaway dims the boundaries so the grains themselves come forward.
      if (boundaryMaterial) boundaryMaterial.opacity = cutaway ? 0.25 : 1;
    },
    update(_dt, elapsed, _state) {
      grain.group.rotation.y = elapsed * 0.12;
      grain.group.rotation.x = Math.sin(elapsed * 0.2) * 0.08;

      if (slipOn) {
        slip.markers.forEach((marker, index) => {
          const phase = (index / slip.markers.length + elapsed * 0.18) % 1;
          const angle = index * 1.9;
          marker.position.set(Math.cos(angle) * 0.14, 0.14 - phase * 0.28, Math.sin(angle) * 0.14);
        });
      }
    },
    dispose() {
      for (const line of grain.boundaries) line.geometry.dispose();
      boundaryMaterial?.dispose();
      disposeObjectTree(group);
      materials.dispose();
    },
  };
};
