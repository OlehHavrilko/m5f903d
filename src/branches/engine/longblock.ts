import * as THREE from 'three';
import type { LevelBuilder, LevelContent } from '../../core/level-content.js';
import { PHYSICS_COLORS, createStudioMaterials, disposeObjectTree } from '../../materials/index.js';
import { DEG, firingAngles, pistonDisplacement } from '../../procgen/crank.js';
import {
  CRANK_GEOMETRY,
  S63,
  createFlowMarkers,
  createPistonAssembly,
  radialSegments,
} from '../../procgen/engine.js';

/**
 * `engine.longblock` — the 90° V8 block in section.
 *
 * Both banks are tilted ±45° about the crank axis and carry four bores each.
 * The eight pistons follow the same crank-slider law as the single-cylinder
 * level, phased by the published firing order, which is what makes 1-5-4-8-6-3-7-2
 * visible rather than merely stated.
 */
export const buildEngineLongblock: LevelBuilder = (context): LevelContent => {
  const materials = createStudioMaterials(context.profile);
  const group = new THREE.Group();
  group.name = 'engine-longblock';
  const segments = radialSegments(context.profile, 12);
  const firing = firingAngles();

  const crank = new THREE.Group();
  crank.name = 'crankshaft';
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.022, 0.54, segments, 1),
    materials.steel,
  );
  shaft.rotation.z = Math.PI / 2; // crank axis along X
  crank.add(shaft);
  for (let i = 0; i < 4; i += 1) {
    const web = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.088, 0.052), materials.cast);
    web.position.x = -0.19 + i * 0.126;
    crank.add(web);
  }
  group.add(crank);

  // Structure that a cutaway removes, so the crank and bores read through it.
  const structure: THREE.Object3D[] = [];
  const block = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.34), materials.cast);
  block.position.y = -0.03;
  block.name = 'cylinder-block';
  group.add(block);
  structure.push(block);

  const sump = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.1, 0.28), materials.aluminum);
  sump.position.y = -0.15;
  sump.name = 'dry-sump';
  group.add(sump);

  const bankXs = [0.2, 0.067, -0.067, -0.2];
  const bankDefs: ReadonlyArray<{ side: 1 | -1; cylinders: readonly number[] }> = [
    { side: 1, cylinders: [1, 2, 3, 4] },
    { side: -1, cylinders: [5, 6, 7, 8] },
  ];

  interface PistonLink {
    readonly group: THREE.Group;
    readonly cylinder: number;
  }
  const pistons: PistonLink[] = [];

  for (const bankDef of bankDefs) {
    const bank = new THREE.Group();
    bank.name = `bank-${bankDef.side > 0 ? 'a' : 'b'}`;
    bank.rotation.x = bankDef.side * (S63.bankAngleDeg / 2) * DEG;

    const shell = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.22, 0.105), materials.cast);
    shell.position.y = 0.11;
    bank.add(shell);
    structure.push(shell);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.07, 0.115), materials.aluminum);
    head.position.y = 0.25;
    bank.add(head);

    bankDef.cylinders.forEach((cylinder, index) => {
      const x = bankXs[index]!;
      const liner = new THREE.Mesh(
        new THREE.CylinderGeometry(S63.bore / 2 + 0.007, S63.bore / 2 + 0.007, 0.15, segments, 1),
        materials.paintDark,
      );
      liner.position.set(x, 0.075, 0);
      bank.add(liner);

      const piston = createPistonAssembly(materials, context.profile, S63.bore);
      piston.group.position.set(x, 0.14, 0);
      bank.add(piston.group);
      pistons.push({ group: piston.group, cylinder });
    });

    group.add(bank);
  }

  // Coolant jacket hint: a single green line per bank, matching the colour code.
  for (const bankDef of bankDefs) {
    const jacket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.42, 8),
      materials.accent(PHYSICS_COLORS.coolant),
    );
    jacket.rotation.z = Math.PI / 2;
    jacket.rotation.x = bankDef.side * (S63.bankAngleDeg / 2) * DEG;
    jacket.position.set(0, 0.16, bankDef.side * 0.11);
    group.add(jacket);
  }

  const flow = createFlowMarkers(materials, PHYSICS_COLORS.oil, 10, 0.006);
  flow.group.visible = false;
  group.add(flow.group);

  let cutaway = false;
  let flowOn = false;

  function applyStructure(): void {
    for (const part of structure) part.visible = !cutaway;
  }

  return {
    group,
    setMode(mode) {
      cutaway = mode === 'cutaway';
      flowOn = mode === 'flow';
      applyStructure();
      flow.group.visible = flowOn;
    },
    update(_dt, elapsed, state) {
      crank.rotation.x = state.crankAngle * DEG;
      for (const link of pistons) {
        const offset = firing.get(link.cylinder) ?? 0;
        const local = (state.crankAngle - offset + 720) % 720;
        link.group.position.y = 0.14 - pistonDisplacement(local, CRANK_GEOMETRY);
      }
      if (flowOn) {
        flow.markers.forEach((marker, index) => {
          const phase = (elapsed * 0.25 + index / flow.markers.length) % 1;
          marker.position.set(
            -0.2 + (index % 4) * 0.13,
            0.02 + phase * 0.12,
            index % 2 === 0 ? 0.1 : -0.1,
          );
        });
      }
    },
    dispose() {
      disposeObjectTree(group);
      materials.dispose();
    },
  };
};
