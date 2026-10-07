import * as THREE from 'three';
import type { LevelBuilder, LevelContent } from '../../core/level-content.js';
import { createStudioMaterials, disposeObjectTree } from '../../materials/index.js';
import { createIronAtom, createLattice } from '../../procgen/engine.js';

/**
 * `engine.atom` — the floor of the dive: a BCC iron lattice and a single atom.
 *
 * This is the promised end point (and the parallel to GPU → Atom): below the
 * atom there is no car left to explain, so the descent stops there.
 */
export const buildEngineAtom: LevelBuilder = (context): LevelContent => {
  const materials = createStudioMaterials(context.profile);
  const group = new THREE.Group();
  group.name = 'engine-atom';

  const lattice = createLattice(materials, context.profile, 2, 0.07);
  lattice.group.position.set(-0.075, 0, 0);
  group.add(lattice.group);

  const atom = createIronAtom(materials, context.profile, 0.06);
  atom.group.position.set(0.085, 0, 0);
  group.add(atom.group);

  return {
    group,
    update(_dt, elapsed, _state) {
      // The lattice breathes; the atom's electrons orbit their shells.
      const breath = 1 + Math.sin(elapsed * 1.4) * 0.015;
      lattice.group.scale.setScalar(breath);
      lattice.group.rotation.y = elapsed * 0.15;
      atom.group.rotation.y = elapsed * 0.25;

      for (const electron of atom.electrons) {
        const radius = electron.userData['orbitRadius'] as number;
        const tilt = electron.userData['orbitTilt'] as number;
        const phase =
          (electron.userData['orbitPhase'] as number) + elapsed * (radius > 0.05 ? 1.6 : 2.4);
        electron.position.set(
          Math.cos(phase) * radius,
          -Math.sin(phase) * radius * Math.sin(tilt),
          Math.sin(phase) * radius * Math.cos(tilt),
        );
      }
    },
    dispose() {
      disposeObjectTree(group);
      materials.dispose();
    },
  };
};
