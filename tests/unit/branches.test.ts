import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { loadBranchBuilders } from '../../src/core/branch-loader.js';
import { LevelRegistry } from '../../src/core/level-registry.js';
import { qualityProfile } from '../../src/core/quality.js';
import { Timeline } from '../../src/core/timeline.js';
import { BRANCHES } from '../../src/content/branches.js';
import { ALL_LEVELS } from '../../src/content/levels/index.js';

const profile = qualityProfile('low');
const context = { profile, timeline: new Timeline('idle', 1) };
const registry = new LevelRegistry(ALL_LEVELS);

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
  });
  return finite;
}

describe('branch metadata', () => {
  it('points every ready branch at a registered entry level', () => {
    expect(BRANCHES.length).toBeGreaterThanOrEqual(4);
    for (const branch of BRANCHES) {
      expect(registry.get(branch.entry)).toBeDefined();
    }
  });
});

describe('dynamic branch loading', () => {
  it('loads one builder per ready branch and builds finite geometry', async () => {
    for (const branch of BRANCHES) {
      if (!branch.ready) continue;
      const builders = await loadBranchBuilders(branch.id);
      const ids = Object.keys(builders);
      expect(ids.length).toBeGreaterThan(0);
      for (const id of ids) {
        const content = builders[id]!(context);
        expect(countMeshes(content.group)).toBeGreaterThan(5);
        expect(allPositionsFinite(content.group)).toBe(true);
        content.update(1 / 60, 1, context.timeline.sample());
        content.dispose();
      }
    }
  });

  it('returns an empty record for a branch without geometry', async () => {
    const builders = await loadBranchBuilders('ev');
    expect(builders).toEqual({});
  });
});
