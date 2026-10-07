import * as THREE from 'three';
import type { LevelBuilder, LevelContent } from '../../core/level-content.js';
import { PHYSICS_COLORS, createStudioMaterials, disposeObjectTree } from '../../materials/index.js';
import { createSparkPlug, radialSegments } from '../../procgen/engine.js';

/**
 * `engine.combustion` — a micro-view of the flame.
 *
 * A kernel is born at the plug, a wrinkled front races across the chamber, and
 * a cooler boundary layer survives against the metal. Temperature is shown as
 * colour: chemistry is deliberately not solved.
 */
export const buildEngineCombustion: LevelBuilder = (context): LevelContent => {
  const materials = createStudioMaterials(context.profile);
  const group = new THREE.Group();
  group.name = 'engine-combustion';
  const segments = radialSegments(context.profile, 18);
  const chamberRadius = 0.024;
  const chamberHeight = 0.026;

  const wall = new THREE.Mesh(
    new THREE.CylinderGeometry(chamberRadius, chamberRadius, chamberHeight, segments, 1, true),
    materials.glass,
  );
  wall.position.y = 0.013;
  group.add(wall);

  const crown = new THREE.Mesh(
    new THREE.CylinderGeometry(chamberRadius, chamberRadius, 0.004, segments, 1),
    materials.steel,
  );
  crown.position.y = 0.002;
  group.add(crown);

  const plug = createSparkPlug(materials, context.profile);
  plug.position.set(0, chamberHeight + 0.002, 0);
  plug.scale.setScalar(0.7);
  group.add(plug);

  const kernel = new THREE.Mesh(
    new THREE.SphereGeometry(0.004, 12, 10),
    materials.accent(0xffe08a),
  );
  kernel.position.set(0, 0.02, 0);
  kernel.visible = false;
  group.add(kernel);

  const frontMaterial = materials.accent(PHYSICS_COLORS.exhaust);
  const front = new THREE.Mesh(
    new THREE.SphereGeometry(0.01, segments, Math.max(12, segments / 2)),
    frontMaterial,
  );
  front.position.set(0, 0.018, 0);
  front.visible = false;
  group.add(front);

  const boundary = new THREE.Mesh(
    new THREE.CylinderGeometry(
      chamberRadius * 0.94,
      chamberRadius * 0.94,
      chamberHeight * 0.96,
      segments,
      1,
      true,
    ),
    materials.accent(0x6fd0ff),
  );
  boundary.position.y = 0.013;
  boundary.visible = false;
  group.add(boundary);

  // Turbulent eddies: a few lumps riding the front, deterministic in angle.
  const eddies: THREE.Mesh[] = [];
  const eddyGeometry = new THREE.SphereGeometry(0.0025, 8, 6);
  const eddyMaterial = materials.accent(0xffb347);
  const eddyCount = Math.max(4, Math.round(context.profile.particleScale * 8));
  for (let i = 0; i < eddyCount; i += 1) {
    const eddy = new THREE.Mesh(eddyGeometry, eddyMaterial);
    eddy.userData['orbitPhase'] = (i / eddyCount) * Math.PI * 2;
    eddy.userData['orbitTilt'] = (i / eddyCount - 0.5) * 1.2;
    group.add(eddy);
    eddies.push(eddy);
  }

  const hot = new THREE.Color(0xffe08a);
  const cool = new THREE.Color(PHYSICS_COLORS.exhaust);

  return {
    group,
    update(_dt, _elapsed, state) {
      const theta = state.crankAngle;
      const kernelWindow = cabin(theta, 356, 34);
      const burn = cabin(theta, 356, 130);

      kernel.visible = kernelWindow > 0.02;
      kernel.scale.setScalar(0.4 + kernelWindow * 1.6);

      front.visible = burn > 0.02;
      front.scale.setScalar(0.2 + burn * 1.9);
      frontMaterial.color.copy(hot).lerp(cool, burn);

      boundary.visible = burn > 0.35;
      boundary.scale.setScalar(1 - burn * 0.03);

      for (const eddy of eddies) {
        const phase = state.crankAngle * 0.02 + (eddy.userData['orbitPhase'] as number);
        const radius = chamberRadius * (0.35 + burn * 0.55);
        const tilt = eddy.userData['orbitTilt'] as number;
        eddy.position.set(
          Math.cos(phase) * radius,
          0.013 + Math.sin(phase) * tilt * 0.01,
          Math.sin(phase) * radius,
        );
        eddy.visible = burn > 0.1;
      }
    },
    dispose() {
      disposeObjectTree(group);
      materials.dispose();
    },
  };
};

function cabin(angleDeg: number, startDeg: number, durationDeg: number): number {
  const t = (((angleDeg - startDeg) % 720) + 720) % 720;
  if (t >= durationDeg) return 0;
  return Math.sin((Math.PI * t) / durationDeg);
}
