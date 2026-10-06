import * as THREE from 'three';
import type { QualityProfile } from '../core/quality.js';

export type BackgroundMode = 'white' | 'gray' | 'black';

export interface StudioEnvironment {
  readonly root: THREE.Group;
  setBackground(mode: BackgroundMode): void;
  setFloorVisible(visible: boolean): void;
  update(elapsed: number): void;
  dispose(): void;
}

interface Palette {
  background: number;
  floor: number;
  wall: number;
  key: number;
  fill: number;
  rim: number;
  sky: number;
  ground: number;
}

const PALETTES: Record<BackgroundMode, Palette> = {
  white: {
    background: 0xffffff,
    floor: 0xf4f5f7,
    wall: 0xffffff,
    key: 2.3,
    fill: 0.7,
    rim: 1.6,
    sky: 0xffffff,
    ground: 0xdfe3e8,
  },
  gray: {
    background: 0x9aa0a8,
    floor: 0x8f959d,
    wall: 0x9aa0a8,
    key: 2.5,
    fill: 0.8,
    rim: 1.8,
    sky: 0xcfd4da,
    ground: 0x6f757c,
  },
  black: {
    background: 0x000000,
    floor: 0x0b0d10,
    wall: 0x000000,
    key: 2.8,
    fill: 0.9,
    rim: 2.2,
    sky: 0x1a1d22,
    ground: 0x05070a,
  },
};

/**
 * A neutral studio: seamless white cyclorama, three-point key/fill/rim lighting
 * and a cheap contact shadow. No environment map and no HDRI file are used
 * (docs/M0-design-plan.md §9).
 */
export function createStudioEnvironment(
  scene: THREE.Scene,
  profile: QualityProfile,
): StudioEnvironment {
  const root = new THREE.Group();
  root.name = 'studio-environment';
  scene.add(root);

  const palette = PALETTES.white;

  // Floor — a soft, slightly tinted plane, not a road.
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 400, 1, 1),
    new THREE.MeshStandardMaterial({ color: palette.floor, roughness: 0.9, metalness: 0 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  floor.name = 'studio-floor';
  root.add(floor);

  // Cyclorama: a huge inward-facing cylinder reads as an infinite white wall.
  const wall = new THREE.Mesh(
    new THREE.CylinderGeometry(80, 80, 90, Math.min(64, profile.segments * 2), 1, true),
    new THREE.MeshStandardMaterial({
      color: palette.wall,
      roughness: 1,
      metalness: 0,
      side: THREE.BackSide,
    }),
  );
  wall.position.y = 44;
  wall.name = 'studio-cyclorama';
  root.add(wall);

  const key = new THREE.DirectionalLight(0xffffff, palette.key);
  key.position.set(6, 9, 7);
  key.castShadow = profile.tier !== 'low';
  key.shadow.mapSize.set(profile.shadowMapSize, profile.shadowMapSize);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 40;
  key.shadow.camera.left = -8;
  key.shadow.camera.right = 8;
  key.shadow.camera.top = 8;
  key.shadow.camera.bottom = -8;
  key.shadow.bias = -0.0008;
  key.shadow.radius = profile.tier === 'high' ? 2 : 1;
  root.add(key);

  const fill = new THREE.DirectionalLight(0xdfeaff, palette.fill);
  fill.position.set(-7, 4, 4);
  root.add(fill);

  const rim = new THREE.DirectionalLight(0xffffff, palette.rim);
  rim.position.set(-4, 6, -9);
  root.add(rim);

  const hemisphere = new THREE.HemisphereLight(palette.sky, palette.ground, 0.55);
  root.add(hemisphere);

  const background = new THREE.Color(palette.background);

  const applyPalette = (next: Palette): void => {
    background.set(next.background);
    scene.background = background.clone();
    (floor.material as THREE.MeshStandardMaterial).color.set(next.floor);
    (wall.material as THREE.MeshStandardMaterial).color.set(next.wall);
    key.intensity = next.key;
    fill.intensity = next.fill;
    rim.intensity = next.rim;
    hemisphere.color.set(next.sky);
    hemisphere.groundColor.set(next.ground);
  };
  applyPalette(palette);

  scene.background = background.clone();

  return {
    root,
    setBackground(mode: BackgroundMode) {
      applyPalette(PALETTES[mode]);
    },
    setFloorVisible(visible: boolean) {
      floor.visible = visible;
      wall.visible = visible;
    },
    update(_elapsed: number) {
      // Reserved for a subtle turntable/shadow animation in M2.
    },
    dispose() {
      root.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry.dispose();
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const material of materials) material.dispose();
        }
      });
      scene.remove(root);
    },
  };
}
