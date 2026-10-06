import * as THREE from 'three';
import type { LevelBuilder, LevelContent } from '../core/level-content.js';
import { createStudioMaterials, disposeObjectTree, PHYSICS_COLORS } from '../materials/index.js';
import { applyBodyExplode, createBodyStructure } from '../procgen/body.js';
import { createRollingChassis } from '../procgen/chassis.js';
import { createVehicleModel } from '../procgen/vehicle.js';

/**
 * SPINE level content: `studio`, `car`, `body` and `chassis-hub`. The storey
 * levels share the procedural car; `body` exposes the load-bearing structure
 * and exploding panels; the hub swaps the shell for a ghost and shows the
 * torque path, which is where the branches are chosen
 * (docs/M0-design-plan.md §5.1).
 */
function disposeGroup(
  group: THREE.Group,
  materials: ReturnType<typeof createStudioMaterials>,
): void {
  disposeObjectTree(group);
  materials.dispose();
}

/** System hotspots on the `car` level; each one routes into a branch. */
const HOTSPOTS: ReadonlyArray<{
  position: readonly [number, number, number];
  color: number;
  entry: string;
}> = [
  { position: [1.5, 1.05, 0], color: PHYSICS_COLORS.exhaust, entry: 'engine.unit' },
  { position: [0.2, 0.45, 0], color: PHYSICS_COLORS.oil, entry: 'at.unit' },
  { position: [1.49, 0.42, 0.85], color: PHYSICS_COLORS.coolant, entry: 'susp.corner' },
  { position: [-1.49, 0.42, -0.85], color: PHYSICS_COLORS.air, entry: 'brake.corner' },
];

function createVehicleContent(
  context: Parameters<LevelBuilder>[0],
  options: { turntable: boolean; hotspots: boolean },
): LevelContent {
  const materials = createStudioMaterials(context.profile);
  const group = new THREE.Group();
  const car = createVehicleModel(materials, context.profile);
  group.add(car);

  const hotspotGeometry = new THREE.SphereGeometry(0.06, 12, 8);
  const hotspotStems: THREE.Mesh[] = [];
  if (options.hotspots) {
    for (const system of HOTSPOTS) {
      const material = materials.accent(system.color);
      const marker = new THREE.Mesh(hotspotGeometry, material);
      marker.position.set(...system.position);
      marker.userData['entry'] = system.entry;
      group.add(marker);

      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.5, 8), material);
      stem.position.set(system.position[0], system.position[1] + 0.25, system.position[2]);
      stem.userData['entry'] = system.entry;
      group.add(stem);
      hotspotStems.push(stem);
    }
  }

  return {
    group,
    update(_dt, elapsed) {
      if (options.turntable) car.rotation.y = elapsed * 0.06;
      if (options.hotspots) {
        const pulse = 1 + Math.sin(elapsed * 3) * 0.12;
        for (const stem of hotspotStems) stem.scale.set(1, pulse, 1);
      }
    },
    dispose() {
      hotspotGeometry.dispose();
      disposeGroup(group, materials);
    },
  };
}

export const buildStudioLevel: LevelBuilder = (context) =>
  createVehicleContent(context, { turntable: true, hotspots: false });

export const buildCarLevel: LevelBuilder = (context) =>
  createVehicleContent(context, { turntable: false, hotspots: true });

/** Body-in-white with bolt-on panels that fly off in Explode mode. */
export const buildBodyLevel: LevelBuilder = (context): LevelContent => {
  const materials = createStudioMaterials(context.profile);
  const group = new THREE.Group();
  group.name = 'body-level';
  const structure = createBodyStructure(materials, context.profile);
  group.add(structure);

  let explode = 0;
  let target = 0;

  return {
    group,
    setMode(mode) {
      target = mode === 'explode' ? 1 : 0;
    },
    update(dt) {
      if (Math.abs(target - explode) > 1e-4) {
        // Frame-rate independent approach; deterministic for a fixed dt series.
        explode += (target - explode) * Math.min(1, dt * 2.5);
        applyBodyExplode(structure, explode);
      } else if (explode !== target) {
        explode = target;
        applyBodyExplode(structure, explode);
      }
    },
    dispose() {
      disposeGroup(group, materials);
    },
  };
};

/** Rolling chassis under a ghost shell, with the drivetrain Flow overlay. */
export const buildChassisHubLevel: LevelBuilder = (context): LevelContent => {
  const materials = createStudioMaterials(context.profile);
  const group = new THREE.Group();
  group.name = 'chassis-hub-level';
  const chassis = createRollingChassis(materials, context.profile);
  group.add(chassis.group);
  chassis.setFlow(false);

  return {
    group,
    setMode(mode) {
      chassis.setFlow(mode === 'flow');
    },
    update(dt, elapsed, state) {
      chassis.update(dt, elapsed, state.speedKph);
    },
    dispose() {
      chassis.dispose();
      materials.dispose();
    },
  };
};
