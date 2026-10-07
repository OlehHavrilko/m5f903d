import * as THREE from 'three';
import type { LevelBuilder, LevelContent } from '../../core/level-content.js';
import { PHYSICS_COLORS, createStudioMaterials, disposeObjectTree } from '../../materials/index.js';
import { DEG, pistonDisplacement } from '../../procgen/crank.js';
import {
  CRANK_GEOMETRY,
  CRANK_RADIUS,
  S63,
  createConnectingRod,
  createFlowMarkers,
  createPistonAssembly,
  createSparkPlug,
  createValveAssembly,
  radialSegments,
} from '../../procgen/engine.js';

/** Idealised valve-lift envelope: a sine bump of `duration` degrees from `start`. */
function liftEnvelope(angleDeg: number, startDeg: number, durationDeg: number): number {
  const t = (((angleDeg - startDeg) % 720) + 720) % 720;
  if (t >= durationDeg) return 0;
  return Math.sin((Math.PI * t) / durationDeg);
}

/**
 * `engine.cylinder` — one cylinder through the full four-stroke cycle.
 *
 * The piston rides the exact crank-slider law, the rod picks up its asin()
 * slant, and the crank throw rotates behind it. Valves open on the intake
 * (360–540°) and exhaust (180–360°) strokes; a flash marks the start of
 * expansion at TDC. Convention: 0° is TDC at the start of the power stroke.
 */
export const buildEngineCylinder: LevelBuilder = (context): LevelContent => {
  const materials = createStudioMaterials(context.profile);
  const group = new THREE.Group();
  group.name = 'engine-cylinder';
  const segments = radialSegments(context.profile, 16);
  const bore = S63.bore;
  const radius = bore / 2;
  const deckY = CRANK_RADIUS + S63.rodLength + 0.048;

  const liner = new THREE.Mesh(
    new THREE.CylinderGeometry(radius + 0.004, radius + 0.004, 0.19, segments, 1, true),
    materials.glass,
  );
  liner.position.y = CRANK_RADIUS + S63.rodLength - 0.03;
  liner.name = 'liner';
  group.add(liner);

  const crank = new THREE.Group();
  crank.name = 'crank-throw';
  const web = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.09, 0.05), materials.cast);
  web.position.y = CRANK_RADIUS;
  crank.add(web);
  const pin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.019, 0.019, 0.056, segments, 1),
    materials.steel,
  );
  pin.rotation.x = Math.PI / 2; // crank pin axis along Z
  pin.position.y = CRANK_RADIUS;
  crank.add(pin);
  const counterweight = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.055), materials.cast);
  counterweight.position.y = -CRANK_RADIUS * 0.7;
  crank.add(counterweight);
  group.add(crank);

  const piston = createPistonAssembly(materials, context.profile, bore);
  group.add(piston.group);

  const rod = createConnectingRod(materials, context.profile, S63.rodLength);
  group.add(rod);

  const intakePivot = new THREE.Group();
  intakePivot.position.set(-0.02, deckY, 0);
  intakePivot.rotation.z = 0.28;
  const intake = createValveAssembly(materials, context.profile, {
    stemLength: 0.07,
    headRadius: 0.016,
    springRadius: 0.011,
  });
  intakePivot.add(intake.group);
  group.add(intakePivot);

  const exhaustPivot = new THREE.Group();
  exhaustPivot.position.set(0.02, deckY, 0);
  exhaustPivot.rotation.z = -0.28;
  const exhaust = createValveAssembly(materials, context.profile, {
    stemLength: 0.07,
    headRadius: 0.016,
    springRadius: 0.011,
  });
  exhaustPivot.add(exhaust.group);
  group.add(exhaustPivot);

  const plug = createSparkPlug(materials, context.profile);
  plug.position.set(0, deckY + 0.02, 0);
  group.add(plug);

  const flash = new THREE.Mesh(
    new THREE.SphereGeometry(0.014, segments, Math.max(10, segments / 2)),
    materials.accent(PHYSICS_COLORS.exhaust),
  );
  flash.name = 'combustion-flash';
  flash.position.set(0, deckY - 0.026, 0);
  flash.visible = false;
  group.add(flash);

  const flow = createFlowMarkers(materials, PHYSICS_COLORS.air, 8, 0.004);
  flow.group.visible = false;
  group.add(flow.group);

  let cutaway = false;
  let flowOn = false;

  return {
    group,
    setMode(mode) {
      cutaway = mode === 'cutaway' || mode === 'explore';
      flowOn = mode === 'flow';
      liner.material = cutaway ? materials.paintDark : materials.glass;
      liner.material.needsUpdate = true;
      flow.group.visible = flowOn;
    },
    update(_dt, _elapsed, state) {
      const theta = state.crankAngle;
      const displacement = pistonDisplacement(theta, CRANK_GEOMETRY);
      const pinY = CRANK_RADIUS + S63.rodLength - displacement;

      piston.group.position.set(0, pinY, 0);
      rod.position.set(0, pinY, 0);
      rod.rotation.z = Math.asin((CRANK_RADIUS * Math.sin(theta * DEG)) / S63.rodLength);
      crank.rotation.z = -theta * DEG;

      // Valve events: intake 360–540°, exhaust 180–360° (schematic envelopes).
      const intakeLift = liftEnvelope(theta, 355, 190) * 0.013;
      const exhaustLift = liftEnvelope(theta, 175, 190) * 0.013;
      intake.group.position.y = -intakeLift;
      exhaust.group.position.y = -exhaustLift;

      const burn = liftEnvelope(theta, 710, 80);
      flash.visible = burn > 0.02;
      flash.scale.setScalar(0.35 + burn * 2.1);

      if (flowOn) {
        flow.markers.forEach((marker, index) => {
          const travelling = liftEnvelope(theta, 350, 200) > 0;
          const phase = (index / flow.markers.length + (theta % 720) / 720) % 1;
          const y = travelling ? deckY - phase * 0.14 : deckY - 0.14 + phase * 0.14;
          marker.position.set(-0.02, y, 0);
        });
      }
    },
    dispose() {
      disposeObjectTree(group);
      materials.dispose();
    },
  };
};
