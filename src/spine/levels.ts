import * as THREE from 'three';
import type { BuildContext, LevelBuilder, LevelContent } from '../core/level-content.js';
import { createStudioMaterials, PHYSICS_COLORS } from '../materials/index.js';
import { createVehicleModel } from '../procgen/vehicle.js';

/**
 * SPINE level content for M1: `studio` and `car`.
 * Both render the same procedural car; the studio adds a slow turntable drift,
 * the car level adds system hotspots. Deeper levels are added in M2/M3.
 */
function disposeGroup(
  group: THREE.Group,
  materials: ReturnType<typeof createStudioMaterials>,
): void {
  group.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (mesh.isMesh) mesh.geometry.dispose();
  });
  materials.dispose();
}

function createVehicleContent(
  context: BuildContext,
  options: { turntable: boolean; hotspots: boolean },
): LevelContent {
  const materials = createStudioMaterials(context.profile);
  const group = new THREE.Group();
  const car = createVehicleModel(materials, context.profile);
  group.add(car);

  const hotspotGeometry = new THREE.SphereGeometry(0.06, 12, 8);
  const hotspotStems: THREE.Mesh[] = [];
  if (options.hotspots) {
    const systems: Array<{ position: [number, number, number]; color: number }> = [
      { position: [1.5, 1.05, 0], color: PHYSICS_COLORS.exhaust },
      { position: [0.2, 0.45, 0], color: PHYSICS_COLORS.oil },
      { position: [1.49, 0.42, 0.85], color: PHYSICS_COLORS.coolant },
      { position: [-1.49, 0.42, -0.85], color: PHYSICS_COLORS.air },
    ];
    for (const system of systems) {
      const material = materials.accent(system.color);
      const marker = new THREE.Mesh(hotspotGeometry, material);
      marker.position.set(...system.position);
      group.add(marker);
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.5, 8), material);
      stem.position.set(system.position[0], system.position[1] + 0.25, system.position[2]);
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
