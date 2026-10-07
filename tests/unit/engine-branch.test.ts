import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import type { BuildContext } from '../../src/core/level-content.js';
import { LevelRegistry } from '../../src/core/level-registry.js';
import { qualityProfile } from '../../src/core/quality.js';
import { Timeline, type VehicleState } from '../../src/core/timeline.js';
import { ALL_LEVELS } from '../../src/content/levels/index.js';
import {
  builders,
  buildEngineAtom,
  buildEngineCharge,
  buildEngineCombustion,
  buildEngineCylinder,
  buildEngineLongblock,
  buildEngineMetal,
  buildEngineOil,
  buildEngineValvetrain,
} from '../../src/branches/engine/index.js';

const context: BuildContext = { profile: qualityProfile('low'), timeline: new Timeline('idle', 1) };
const registry = new LevelRegistry(ALL_LEVELS);
const BASE = context.timeline.sample();

function withAngle(angle: number, overrides: Partial<VehicleState> = {}): VehicleState {
  return { ...BASE, crankAngle: angle, ...overrides };
}

function finitePositions(root: THREE.Object3D): boolean {
  let finite = true;
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;
    const attribute = mesh.geometry.getAttribute('position');
    if (!attribute) {
      finite = false;
      return;
    }
    for (let i = 0; i < attribute.count; i += 1) {
      if (
        !Number.isFinite(attribute.getX(i)) ||
        !Number.isFinite(attribute.getY(i)) ||
        !Number.isFinite(attribute.getZ(i))
      ) {
        finite = false;
      }
    }
  });
  return finite;
}

describe('engine branch data', () => {
  const expected = [
    'engine.unit',
    'engine.longblock',
    'engine.cylinder',
    'engine.valvetrain',
    'engine.charge',
    'engine.combustion',
    'engine.oil',
    'engine.metal',
    'engine.atom',
  ];

  it('descends through the documented levels, in order', () => {
    expect(registry.branch('engine').map((level) => level.id)).toEqual(expected);
    for (const level of registry.branch('engine')) {
      expect(builders[level.id]).toBeDefined();
    }
  });

  it('gets strictly smaller on every step', () => {
    const scales = registry.branch('engine').map((level) => level.scale.unitMeters);
    for (let i = 1; i < scales.length; i += 1) {
      expect(scales[i]!).toBeLessThan(scales[i - 1]!);
    }
    expect(scales[scales.length - 1]!).toBeLessThan(1e-9);
  });
});

describe('engine geometry', () => {
  const cases: ReadonlyArray<readonly [string, () => ReturnType<typeof buildEngineCylinder>]> = [
    ['engine.longblock', () => buildEngineLongblock(context)],
    ['engine.cylinder', () => buildEngineCylinder(context)],
    ['engine.valvetrain', () => buildEngineValvetrain(context)],
    ['engine.charge', () => buildEngineCharge(context)],
    ['engine.combustion', () => buildEngineCombustion(context)],
    ['engine.oil', () => buildEngineOil(context)],
    ['engine.metal', () => buildEngineMetal(context)],
    ['engine.atom', () => buildEngineAtom(context)],
  ];

  it('builds finite, non-trivial geometry that survives a full cycle', () => {
    for (const [id, build] of cases) {
      const content = build();
      expect(finitePositions(content.group), `${id} geometry`).toBe(true);
      let meshes = 0;
      content.group.traverse((object) => {
        if ((object as THREE.Mesh).isMesh) meshes += 1;
      });
      expect(meshes, `${id} mesh count`).toBeGreaterThan(5);
      for (let angle = 0; angle <= 720; angle += 45) {
        content.update(1 / 60, angle / 360, withAngle(angle));
        expect(finitePositions(content.group), `${id} at ${angle}°`).toBe(true);
      }
      content.dispose();
    }
  });

  it('moves the piston exactly one stroke between dead centres', () => {
    const content = buildEngineCylinder(context);
    const piston = content.group.getObjectByName('piston');
    expect(piston).toBeDefined();

    content.update(1 / 60, 0, withAngle(0));
    const top = piston!.position.y;
    content.update(1 / 60, 0, withAngle(180));
    const bottom = piston!.position.y;

    expect(top - bottom).toBeCloseTo(0.0883, 4);
    content.dispose();
  });

  it('shows the combustion flash only around the start of expansion', () => {
    const content = buildEngineCylinder(context);
    const flash = content.group.getObjectByName('combustion-flash');
    expect(flash).toBeDefined();

    content.update(1 / 60, 0, withAngle(300));
    expect(flash!.visible).toBe(false);
    content.update(1 / 60, 0, withAngle(720));
    expect(flash!.visible).toBe(true);
    content.dispose();
  });

  it('turns the camshaft at half crank speed', () => {
    const content = buildEngineValvetrain(context);
    const cam = content.group.getObjectByName('valvetrain')?.getObjectByName('camshaft');
    expect(cam).toBeDefined();

    const state = withAngle(0, { rpm: 7000 });
    content.update(1 / 60, 0, { ...state, crankAngle: 0 });
    const atZero = cam!.rotation.z;
    content.update(1 / 60, 0, { ...state, crankAngle: 360 });
    const atHalfCycle = cam!.rotation.z;

    expect(Math.abs(atHalfCycle - atZero - Math.PI)).toBeLessThan(1e-6);
    content.dispose();
  });

  it('orbits the atom electrons over time', () => {
    const content = buildEngineAtom(context);
    const before = content.group
      .getObjectByName('iron-atom')!
      .children.filter((child) => child.userData['orbitRadius'] !== undefined)
      .map((child) => child.position.clone());
    expect(before.length).toBeGreaterThan(0);

    content.update(1 / 60, 1, BASE);
    const after = content.group
      .getObjectByName('iron-atom')!
      .children.filter((child) => child.userData['orbitRadius'] !== undefined)
      .map((child) => child.position.clone());

    expect(after[0]!.distanceTo(before[0]!)).toBeGreaterThan(1e-4);
    content.dispose();
  });
});
