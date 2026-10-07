import * as THREE from 'three';
import type { LevelBuilder, LevelContent } from '../../core/level-content.js';
import { PHYSICS_COLORS, createStudioMaterials, disposeObjectTree } from '../../materials/index.js';
import { clamp } from '../../core/timeline.js';
import { createCamshaft, createValveAssembly, radialSegments } from '../../procgen/engine.js';

interface Valvetrain {
  readonly group: THREE.Group;
  readonly intakeCam: THREE.Group;
  readonly exhaustCam: THREE.Group;
  readonly valves: readonly { group: THREE.Group; phase: number; maxLift: number }[];
  readonly sprockets: readonly THREE.Mesh[];
}

/** Builds one cylinder's worth of DOHC valvetrain: cams, buckets, valves, chain. */
function createValvetrain(
  materials: ReturnType<typeof createStudioMaterials>,
  profile: Parameters<LevelBuilder>[0]['profile'],
): Valvetrain {
  const group = new THREE.Group();
  group.name = 'valvetrain';
  const segments = radialSegments(profile, 12);
  const camY = 0.2;
  const camX = 0.036;

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.09, 0.2), materials.aluminum);
  head.position.y = 0.14;
  group.add(head);

  const intakeCam = createCamshaft(materials, profile, { length: 0.2, radius: 0.008, lobes: 2 });
  intakeCam.position.set(-camX, camY, 0);
  group.add(intakeCam);

  const exhaustCam = createCamshaft(materials, profile, { length: 0.2, radius: 0.008, lobes: 2 });
  exhaustCam.position.set(camX, camY, 0);
  group.add(exhaustCam);

  const valves: { group: THREE.Group; phase: number; maxLift: number }[] = [];
  const valveXs = [-0.05, -0.022, 0.022, 0.05];
  const exhaustSide = new Set([2, 3]);
  valveXs.forEach((x, index) => {
    const pivot = new THREE.Group();
    pivot.position.set(x, 0.15, 0);
    pivot.rotation.z = x < 0 ? 0.16 : -0.16;
    const valve = createValveAssembly(materials, profile, {
      stemLength: 0.07,
      headRadius: 0.013,
      springRadius: 0.009,
    });
    pivot.add(valve.group);
    group.add(pivot);
    // Intake valves are driven by the intake cam, exhaust by the exhaust cam.
    valves.push({
      group: valve.group,
      phase: exhaustSide.has(index) ? Math.PI : 0,
      maxLift: 0.011,
    });
  });

  // Bucket tappets between each cam nose and its valve tip.
  for (const x of valveXs) {
    const bucket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.011, 0.011, 0.008, segments, 1),
      materials.steel,
    );
    bucket.position.set(x, 0.172, 0);
    group.add(bucket);
  }

  // Timing chain: a rounded loop around the two cam sprockets and the crank.
  const sprockets: THREE.Mesh[] = [];
  const sprocketGeometry = new THREE.CylinderGeometry(0.018, 0.018, 0.012, segments, 1);
  for (const x of [-camX, camX]) {
    const sprocket = new THREE.Mesh(sprocketGeometry, materials.steel);
    sprocket.rotation.x = Math.PI / 2;
    sprocket.position.set(x, camY, 0.005);
    group.add(sprocket);
    sprockets.push(sprocket);
  }
  const crankSprocket = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.012, 0.012, segments, 1),
    materials.steel,
  );
  crankSprocket.rotation.x = Math.PI / 2;
  crankSprocket.position.set(0, -0.02, 0.005);
  group.add(crankSprocket);
  sprockets.push(crankSprocket);

  const chainPath = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(-0.05, camY + 0.018, 0.005),
      new THREE.Vector3(camX + 0.05, camY + 0.018, 0.005),
      new THREE.Vector3(camX + 0.052, camY - 0.02, 0.005),
      new THREE.Vector3(0.012, -0.02, 0.005),
      new THREE.Vector3(-0.012, -0.02, 0.005),
      new THREE.Vector3(-camX - 0.052, camY - 0.02, 0.005),
    ],
    true,
    'catmullrom',
    0.2,
  );
  const chain = new THREE.Mesh(
    new THREE.TubeGeometry(chainPath, 48, 0.0035, 6, true),
    materials.accent(PHYSICS_COLORS.oil),
  );
  group.add(chain);

  // VANOS phasers on the cam noses.
  for (const x of [-camX, camX]) {
    const phaser = new THREE.Mesh(
      new THREE.CylinderGeometry(0.026, 0.026, 0.014, segments, 1),
      materials.accent(PHYSICS_COLORS.highVoltage),
    );
    phaser.rotation.x = Math.PI / 2;
    phaser.position.set(x, camY, -0.11);
    group.add(phaser);
    sprockets.push(phaser);
  }

  return { group, intakeCam, exhaustCam, valves, sprockets };
}

/**
 * `engine.valvetrain` — DOHC with variable timing and continuous lift.
 *
 * The cams turn at half crank speed. Lift amplitude grows with engine speed
 * (Valvetronic) and the intake cam's phase is advanced with rpm (VANOS), so the
 * difference between a lazy idle and a full-load cam is visible on screen.
 */
export const buildEngineValvetrain: LevelBuilder = (context): LevelContent => {
  const materials = createStudioMaterials(context.profile);
  const root = new THREE.Group();
  root.name = 'engine-valvetrain';
  const rig = createValvetrain(materials, context.profile);
  root.add(rig.group);

  return {
    group: root,
    update(_dt, _elapsed, state) {
      const speed = clamp(state.rpm / 7000, 0, 1);
      const camAngle = ((state.crankAngle / 2) * Math.PI) / 180;
      const vanosPhase = speed * 0.45;

      rig.intakeCam.rotation.z = camAngle + vanosPhase;
      rig.exhaustCam.rotation.z = camAngle + Math.PI - vanosPhase * 0.6;

      for (const valve of rig.valves) {
        const phase = valve.phase + (valve.phase === 0 ? vanosPhase : -vanosPhase * 0.6);
        const wave = Math.sin(camAngle + phase);
        const lift = wave > 0 ? wave * wave * valve.maxLift * (0.55 + 0.45 * speed) : 0;
        valve.group.position.y = -lift;
      }

      // Sprockets follow their shafts; the chain is static in this schematic.
      rig.sprockets[0]!.rotation.y = camAngle + vanosPhase;
      rig.sprockets[1]!.rotation.y = camAngle + Math.PI - vanosPhase * 0.6;
      rig.sprockets[2]!.rotation.y = state.crankAngle * (Math.PI / 180);
      rig.sprockets[3]!.rotation.y = camAngle + vanosPhase;
      rig.sprockets[4]!.rotation.y = camAngle + Math.PI - vanosPhase * 0.6;
    },
    dispose() {
      disposeObjectTree(root);
      materials.dispose();
    },
  };
};
