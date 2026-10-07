import * as THREE from 'three';
import type { LevelBuilder, LevelContent } from '../../core/level-content.js';
import { PHYSICS_COLORS, createStudioMaterials, disposeObjectTree } from '../../materials/index.js';
import { clamp } from '../../core/timeline.js';
import { DEG } from '../../procgen/crank.js';
import { tubeBetween } from '../../procgen/aggregates.js';
import { createFlowMarkers, radialSegments } from '../../procgen/engine.js';

/**
 * `engine.oil` — the hydrodynamic wedge in a main bearing.
 *
 * The journal drags oil into a narrowing gap; pressure builds and the shaft
 * lifts off the shell. The film is exaggerated roughly a hundredfold, otherwise
 * it would be invisible, which the level's honesty panel states outright.
 */
export const buildEngineOil: LevelBuilder = (context): LevelContent => {
  const materials = createStudioMaterials(context.profile);
  const group = new THREE.Group();
  group.name = 'engine-oil';
  const segments = radialSegments(context.profile, 24);
  const journalRadius = 0.042;

  const journalPivot = new THREE.Group();
  journalPivot.name = 'journal';
  const journal = new THREE.Mesh(
    new THREE.CylinderGeometry(journalRadius, journalRadius, 0.12, segments, 1),
    materials.chrome,
  );
  journal.rotation.x = Math.PI / 2; // journal axis along Z
  journalPivot.add(journal);
  group.add(journalPivot);

  // Bearing shells as half-rings in the XY plane (journal axis is Z).
  const lowerShell = new THREE.Mesh(
    new THREE.TorusGeometry(journalRadius + 0.006, 0.0045, 8, segments, Math.PI),
    materials.cast,
  );
  lowerShell.rotation.z = Math.PI;
  group.add(lowerShell);

  const upperShell = new THREE.Mesh(
    new THREE.TorusGeometry(journalRadius + 0.006, 0.0045, 8, segments, Math.PI),
    materials.cast,
  );
  upperShell.name = 'upper-shell';
  group.add(upperShell);

  const film = new THREE.Mesh(
    new THREE.TorusGeometry(journalRadius + 0.0025, 0.0016, 8, segments, Math.PI * 0.92),
    materials.accent(PHYSICS_COLORS.oil),
  );
  film.rotation.z = Math.PI;
  film.name = 'oil-film';
  group.add(film);

  const feed = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0035, 0.0035, 0.03, 10, 1),
    materials.accent(PHYSICS_COLORS.oil),
  );
  feed.position.set(0, journalRadius + 0.024, 0);
  group.add(feed);

  // Honing pattern: cross-hatch on a curved wall plate, hinting at the bore finish.
  const honing = new THREE.Group();
  honing.name = 'honing';
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.006), materials.paintDark);
  plate.position.set(0, 0, 0.075);
  honing.add(plate);
  for (let i = 0; i < 5; i += 1) {
    const x = -0.04 + i * 0.02;
    honing.add(
      tubeBetween(
        new THREE.Vector3(x - 0.012, -0.024, 0.079),
        new THREE.Vector3(x + 0.012, 0.024, 0.079),
        0.0007,
        materials.accent(PHYSICS_COLORS.oil),
        6,
      ),
    );
    honing.add(
      tubeBetween(
        new THREE.Vector3(x - 0.012, 0.024, 0.079),
        new THREE.Vector3(x + 0.012, -0.024, 0.079),
        0.0007,
        materials.accent(PHYSICS_COLORS.oil),
        6,
      ),
    );
  }
  group.add(honing);

  const flow = createFlowMarkers(materials, PHYSICS_COLORS.oil, 12, 0.0028);
  flow.group.visible = false;
  group.add(flow.group);

  let cutaway = false;
  let flowOn = false;

  return {
    group,
    setMode(mode) {
      cutaway = mode === 'cutaway';
      flowOn = mode === 'flow';
      upperShell.visible = !cutaway;
      honing.visible = cutaway;
      flow.group.visible = flowOn;
    },
    update(_dt, _elapsed, state) {
      const theta = state.crankAngle;
      const speed = clamp(state.rpm / 7000, 0, 1);

      // Integer multiple of 2π per 720° keeps the spin continuous across the wrap.
      journalPivot.rotation.z = theta * DEG * 4;
      journalPivot.position.y = speed * 0.0015;

      // Pressure builds with speed: the wedge thickens and the shaft lifts.
      const filmScale = 0.85 + speed * 0.4;
      film.scale.set(1, filmScale, 1);

      if (flowOn) {
        flow.markers.forEach((marker, index) => {
          const phase = (index / flow.markers.length + (theta % 720) / 720) % 1;
          const angle = Math.PI + phase * Math.PI * 0.9;
          const radius = journalRadius + 0.004 + speed * 0.002;
          marker.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
        });
      }
    },
    dispose() {
      disposeObjectTree(group);
      materials.dispose();
    },
  };
};
