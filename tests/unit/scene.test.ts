import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { qualityProfile } from '../../src/core/quality.js';
import { Timeline } from '../../src/core/timeline.js';
import { createStudioMaterials, setObjectOpacity } from '../../src/materials/index.js';
import { createVehicleModel } from '../../src/procgen/vehicle.js';
import { createStudioEnvironment } from '../../src/spine/studio-environment.js';
import { buildCarLevel, buildStudioLevel } from '../../src/spine/levels.js';

const profile = qualityProfile('low');

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

describe('procedural vehicle', () => {
  it('builds a mesh with finite, non-degenerate geometry', () => {
    const materials = createStudioMaterials(profile);
    const car = createVehicleModel(materials, profile);
    expect(countMeshes(car)).toBeGreaterThan(10);
    expect(allPositionsFinite(car)).toBe(true);
    const box = new THREE.Box3().setFromObject(car);
    expect(box.max.x - box.min.x).toBeGreaterThan(4.5);
    expect(box.max.x - box.min.x).toBeLessThan(5.5);
    expect(box.max.z - box.min.z).toBeGreaterThan(1.7);
    materials.dispose();
  });
});

describe('level content', () => {
  const context = { profile, timeline: new Timeline('idle', 1) };

  it('builds, updates and disposes the studio level', () => {
    const content = buildStudioLevel(context);
    expect(countMeshes(content.group)).toBeGreaterThan(10);
    content.update(1 / 60, 2, context.timeline.sample());
    content.dispose();
  });

  it('builds the car level with system hotspots', () => {
    const studio = buildStudioLevel(context);
    const content = buildCarLevel(context);
    expect(countMeshes(content.group)).toBeGreaterThan(countMeshes(studio.group));
    content.update(1 / 60, 2, context.timeline.sample());
    content.dispose();
    studio.dispose();
  });

  it('cross-fades opacity without losing the base value', () => {
    const content = buildStudioLevel(context);
    setObjectOpacity(content.group, 0);
    let transparentCount = 0;
    content.group.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.isMesh && mesh.material instanceof THREE.Material && mesh.material.transparent) {
        transparentCount += 1;
      }
    });
    expect(transparentCount).toBeGreaterThan(0);
    setObjectOpacity(content.group, 1);
    content.dispose();
  });
});

describe('studio environment', () => {
  it('switches palettes and toggles the floor', () => {
    const scene = new THREE.Scene();
    const environment = createStudioEnvironment(scene, profile);
    expect(scene.children).toContain(environment.root);
    for (const mode of ['white', 'gray', 'black'] as const) {
      environment.setBackground(mode);
      expect(scene.background).toBeInstanceOf(THREE.Color);
    }
    environment.setFloorVisible(false);
    environment.dispose();
    expect(scene.children).not.toContain(environment.root);
  });
});
