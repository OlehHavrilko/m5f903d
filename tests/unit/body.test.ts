import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { qualityProfile } from '../../src/core/quality.js';
import { Timeline } from '../../src/core/timeline.js';
import { createStudioMaterials } from '../../src/materials/index.js';
import { countBodyPanels, createBodyStructure } from '../../src/procgen/body.js';
import { createRollingChassis } from '../../src/procgen/chassis.js';
import { buildBodyLevel, buildChassisHubLevel } from '../../src/spine/levels.js';

const profile = qualityProfile('low');
const context = { profile, timeline: new Timeline('idle', 1) };

function countMeshes(root: THREE.Object3D): number {
  let count = 0;
  root.traverse((object) => {
    if ((object as THREE.Mesh).isMesh) count += 1;
  });
  return count;
}

function allPositionsFinite(root: THREE.Object3D): boolean {
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
    mesh.geometry.computeBoundingSphere();
    if (!Number.isFinite(mesh.geometry.boundingSphere?.radius ?? Number.NaN)) finite = false;
  });
  return finite;
}

function firstPanel(root: THREE.Object3D): THREE.Mesh | undefined {
  let found: THREE.Mesh | undefined;
  root.traverse((object) => {
    if (!found && (object as THREE.Mesh).userData['explodeDir']) found = object as THREE.Mesh;
  });
  return found;
}

describe('body structure', () => {
  it('builds a load-bearing shell with bolt-on panels', () => {
    const materials = createStudioMaterials(profile);
    const body = createBodyStructure(materials, profile);
    expect(countMeshes(body)).toBeGreaterThan(25);
    expect(countBodyPanels(body)).toBeGreaterThan(10);
    expect(allPositionsFinite(body)).toBe(true);
    const box = new THREE.Box3().setFromObject(body);
    expect(box.max.x - box.min.x).toBeGreaterThan(4.5);
    expect(box.max.x - box.min.x).toBeLessThan(5.5);
    materials.dispose();
  });

  it('explodes and returns every panel deterministically', () => {
    const content = buildBodyLevel(context);
    const panel = firstPanel(content.group);
    expect(panel).toBeDefined();
    const target = panel!;
    const rest = target.position.clone();

    content.setMode?.('explode');
    for (let i = 0; i < 240; i += 1) {
      content.update(1 / 60, i / 60, context.timeline.sample());
    }
    expect(target.position.distanceTo(rest)).toBeGreaterThan(0.3);

    content.setMode?.('tour');
    for (let i = 0; i < 240; i += 1) {
      content.update(1 / 60, i / 60, context.timeline.sample());
    }
    expect(target.position.distanceTo(rest)).toBeLessThan(1e-3);
    content.dispose();
  });
});

describe('rolling chassis hub', () => {
  it('builds the drivetrain with finite geometry and flow paths', () => {
    const materials = createStudioMaterials(profile);
    const chassis = createRollingChassis(materials, profile);
    expect(countMeshes(chassis.group)).toBeGreaterThan(40);
    expect(allPositionsFinite(chassis.group)).toBe(true);
    expect(chassis.flowPaths.length).toBe(2);
    const box = new THREE.Box3().setFromObject(chassis.group);
    expect(box.max.x - box.min.x).toBeGreaterThan(4.5);
    for (const path of chassis.flowPaths) {
      expect(path.length).toBeGreaterThan(1);
      for (const point of path) expect(point.toArray().every(Number.isFinite)).toBe(true);
    }
    chassis.setFlow(true);
    chassis.update(1 / 60, 1, 50);
    chassis.setFlow(false);
    chassis.dispose();
    materials.dispose();
  });

  it('mounts as a level and reacts to flow mode', () => {
    const content = buildChassisHubLevel(context);
    expect(countMeshes(content.group)).toBeGreaterThan(40);
    content.setMode?.('flow');
    content.update(1 / 60, 1, context.timeline.sample());
    content.setMode?.('tour');
    content.update(1 / 60, 2, context.timeline.sample());
    content.dispose();
  });
});
