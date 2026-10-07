import * as THREE from 'three';
import type { LevelBuilder, LevelContent } from '../../core/level-content.js';
import { PHYSICS_COLORS, createStudioMaterials, disposeObjectTree } from '../../materials/index.js';
import { DEG } from '../../procgen/crank.js';
import {
  createFlowMarkers,
  createInjector,
  createSparkPlug,
  createTurbocharger,
  radialSegments,
} from '../../procgen/engine.js';

/** `engine.charge` — injection, ignition and the boost circuit in one frame. */
export const buildEngineCharge: LevelBuilder = (context): LevelContent => {
  const materials = createStudioMaterials(context.profile);
  const group = new THREE.Group();
  group.name = 'engine-charge';
  const segments = radialSegments(context.profile, 14);

  const chamberX = -0.05;

  // Chamber slice: two walls and a piston crown closing the bottom.
  const wallGeometry = new THREE.BoxGeometry(0.012, 0.07, 0.09);
  for (const side of [-1, 1] as const) {
    const wall = new THREE.Mesh(wallGeometry, materials.cast);
    wall.position.set(chamberX + side * 0.05, 0.02, 0);
    group.add(wall);
  }
  const deck = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.01, 0.09), materials.aluminum);
  deck.position.set(chamberX, 0.058, 0);
  group.add(deck);
  const crown = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.02, 0.08), materials.steel);
  crown.position.set(chamberX, -0.02, 0);
  group.add(crown);

  const injector = createInjector(materials, context.profile);
  injector.position.set(chamberX - 0.028, 0.045, 0.03);
  injector.rotation.z = 0.5;
  group.add(injector);

  const spray = new THREE.Mesh(
    new THREE.ConeGeometry(0.02, 0.045, segments, 1, true),
    materials.accent(PHYSICS_COLORS.fuel),
  );
  spray.position.set(chamberX - 0.008, 0.012, 0.02);
  spray.rotation.z = 0.35;
  spray.visible = false;
  group.add(spray);

  const plug = createSparkPlug(materials, context.profile);
  plug.position.set(chamberX + 0.022, 0.05, -0.02);
  group.add(plug);

  const spark = new THREE.Mesh(new THREE.SphereGeometry(0.004, 10, 8), materials.accent(0xfff2b0));
  spark.position.set(chamberX + 0.022, 0.03, -0.02);
  spark.visible = false;
  group.add(spark);

  const flame = new THREE.Mesh(
    new THREE.SphereGeometry(0.02, segments, Math.max(10, segments / 2)),
    materials.accent(PHYSICS_COLORS.exhaust),
  );
  flame.position.set(chamberX, 0.02, 0);
  flame.visible = false;
  group.add(flame);

  const turbo = createTurbocharger(materials, context.profile, 0.032);
  turbo.group.position.set(0.085, -0.01, 0);
  group.add(turbo.group);

  const intercooler = new THREE.Group();
  intercooler.name = 'intercooler';
  const core = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.07), materials.aluminum);
  intercooler.add(core);
  const finGeometry = new THREE.BoxGeometry(0.048, 0.0025, 0.066);
  const fins = Math.max(4, Math.round(context.profile.particleScale * 7) + 3);
  for (let i = 0; i < fins; i += 1) {
    const fin = new THREE.Mesh(finGeometry, materials.accent(PHYSICS_COLORS.air));
    fin.position.y = -0.02 + (i / (fins - 1)) * 0.04;
    intercooler.add(fin);
  }
  intercooler.position.set(0.02, 0.055, -0.075);
  group.add(intercooler);

  // Charge pipe: compressor → intercooler → chamber.
  const pipePoints = [
    new THREE.Vector3(0.055, -0.01, 0),
    new THREE.Vector3(0.02, 0.03, -0.05),
    new THREE.Vector3(0.02, 0.055, -0.075),
    new THREE.Vector3(-0.02, 0.05, -0.04),
    new THREE.Vector3(chamberX, 0.05, 0.02),
  ];
  const pipe = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pipePoints), 40, 0.007, 8, false),
    materials.accent(PHYSICS_COLORS.air),
  );
  group.add(pipe);

  const flow = createFlowMarkers(materials, PHYSICS_COLORS.air, 8, 0.004);
  flow.group.visible = false;
  group.add(flow.group);

  const flowCurve = new THREE.CatmullRomCurve3(pipePoints);

  let flowOn = false;

  return {
    group,
    setMode(mode) {
      flowOn = mode === 'flow';
      flow.group.visible = flowOn;
    },
    update(_dt, _elapsed, state) {
      const theta = state.crankAngle;

      // Injection window leads the spark, as it must: fuel first, then fire.
      const injection = cabin(theta, 330, 55);
      spray.visible = injection > 0.01;
      spray.scale.setScalar(0.6 + injection * 0.7);
      spray.rotation.y = theta * DEG;

      const ignition = cabin(theta, 352, 18);
      spark.visible = ignition > 0.01;
      spark.scale.setScalar(0.7 + ignition * 0.8);

      // Flame kernel at TDC, expanding through the early power stroke.
      const burn = cabin(theta, 356, 110);
      flame.visible = burn > 0.02;
      flame.scale.setScalar(0.3 + burn * 2.4);

      // Integer multiple of 2π per 720° so the spin is continuous across the wrap.
      const spin = theta * DEG * 8;
      turbo.compressor.rotation.x = spin;
      turbo.turbine.rotation.x = -spin;

      // Wastegate cracks open once the boost target is reached.
      const open = state.rpm > 5500 ? 1 : 0;
      turbo.wastegate.rotation.z = open * 0.7;

      if (flowOn) {
        flow.markers.forEach((marker, index) => {
          const phase = (index / flow.markers.length + (theta % 720) / 720) % 1;
          marker.position.copy(flowCurve.getPoint(phase));
        });
      }
    },
    dispose() {
      disposeObjectTree(group);
      materials.dispose();
    },
  };
};

/** Tent-shaped window: 1 at `start + duration/2`, 0 outside `[start, start+duration]`. */
function cabin(angleDeg: number, startDeg: number, durationDeg: number): number {
  const t = (((angleDeg - startDeg) % 720) + 720) % 720;
  if (t >= durationDeg) return 0;
  return Math.sin((Math.PI * t) / durationDeg);
}
