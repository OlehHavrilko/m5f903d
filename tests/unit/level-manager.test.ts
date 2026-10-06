import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { CameraRig } from '../../src/core/camera-rig.js';
import { LevelManager } from '../../src/core/level-manager.js';
import { LevelRegistry } from '../../src/core/level-registry.js';
import { qualityProfile } from '../../src/core/quality.js';
import { poseForLevel } from '../../src/core/seam.js';
import { Timeline } from '../../src/core/timeline.js';
import type { LevelBuilder } from '../../src/core/level-content.js';
import { SPINE_LEVELS } from '../../src/content/levels/spine.js';
import { buildCarLevel, buildStudioLevel } from '../../src/spine/levels.js';

function makeManager(): { manager: LevelManager; rig: CameraRig; scene: THREE.Scene } {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 16 / 9, 0.01, 5000);
  const registry = new LevelRegistry(SPINE_LEVELS);
  const rig = new CameraRig(camera, poseForLevel(registry.all[0]!.camera, camera.aspect));
  const profile = qualityProfile('low');
  const timeline = new Timeline('idle', 1);
  const builders = new Map<string, LevelBuilder>([
    ['studio', buildStudioLevel],
    ['car', buildCarLevel],
  ]);
  const manager = new LevelManager(scene, registry, builders, { profile, timeline }, rig);
  return { manager, rig, scene };
}

function minOpacityRatio(root: THREE.Object3D): number {
  let min = 1;
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) {
      const base = (material.userData['baseOpacity'] as number | undefined) ?? material.opacity;
      if (base > 0) min = Math.min(min, material.opacity / base);
    }
  });
  return min;
}

describe('level manager seams', () => {
  it('mounts the first level immediately', () => {
    const { manager } = makeManager();
    manager.activate('studio', { immediate: true });
    expect(manager.currentSpec?.id).toBe('studio');
    expect(manager.transitioning).toBe(false);
    manager.dispose();
  });

  it('settles on the incoming level fully opaque after a transition', () => {
    const { manager, rig } = makeManager();
    manager.activate('studio', { immediate: true });
    manager.activate('car', { duration: 1 });
    expect(manager.transitioning).toBe(true);
    for (let i = 0; i < 200 && rig.transitioning; i += 1) rig.update(1 / 60);
    expect(manager.transitioning).toBe(false);
    expect(manager.currentSpec?.id).toBe('car');
    const content = manager.currentContent;
    expect(content).not.toBeNull();
    // Regression guard: a double t=1 report used to blank the settled level.
    expect(minOpacityRatio(content!.group)).toBeGreaterThan(0.99);
    expect(content!.group.scale.x).toBeCloseTo(1, 6);
    manager.dispose();
  });

  it('replaces an in-flight transition instead of stacking levels', () => {
    const { manager, rig } = makeManager();
    manager.activate('studio', { immediate: true });
    manager.activate('car', { duration: 2 });
    rig.update(1 / 60);
    manager.activate('studio', { duration: 2 });
    for (let i = 0; i < 400 && rig.transitioning; i += 1) rig.update(1 / 60);
    expect(manager.currentSpec?.id).toBe('studio');
    expect(manager.root.children.length).toBe(1);
    manager.dispose();
  });
});
