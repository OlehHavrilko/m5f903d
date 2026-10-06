import * as THREE from 'three';
import type { QualityProfile } from '../core/quality.js';

/**
 * The physics colour code is shared across every branch: fuel orange, charge air
 * blue, coolant green, oil amber, exhaust red, high voltage violet (§7).
 */
export const PHYSICS_COLORS = {
  fuel: 0xf28c28,
  air: 0x3fa9f5,
  coolant: 0x2ecc71,
  oil: 0xe0a020,
  exhaust: 0xe74c3c,
  highVoltage: 0x9b59b6,
} as const;

export type PhysicsColor = keyof typeof PHYSICS_COLORS;

export interface StudioMaterials {
  readonly paint: THREE.MeshStandardMaterial;
  readonly paintDark: THREE.MeshStandardMaterial;
  readonly glass: THREE.MeshStandardMaterial;
  readonly tire: THREE.MeshStandardMaterial;
  readonly rim: THREE.MeshStandardMaterial;
  readonly chrome: THREE.MeshStandardMaterial;
  readonly plastic: THREE.MeshStandardMaterial;
  readonly steel: THREE.MeshStandardMaterial;
  readonly aluminum: THREE.MeshStandardMaterial;
  readonly cast: THREE.MeshStandardMaterial;
  readonly copper: THREE.MeshStandardMaterial;
  readonly floor: THREE.MeshStandardMaterial;
  readonly wall: THREE.MeshStandardMaterial;
  readonly hotspot: THREE.MeshBasicMaterial;
  readonly accent: (color: THREE.ColorRepresentation) => THREE.MeshStandardMaterial;
  readonly all: readonly THREE.Material[];
  readonly dispose: () => void;
}

/**
 * Builds a fresh material set per level. Fresh materials matter because the seam
 * cross-fade mutates opacity; sharing them would bleed the fade across levels.
 */
export function createStudioMaterials(_profile: QualityProfile): StudioMaterials {
  const paint = new THREE.MeshStandardMaterial({
    color: 0xe9ecf1,
    metalness: 0.55,
    roughness: 0.32,
    envMapIntensity: 0.8,
  });
  const paintDark = new THREE.MeshStandardMaterial({
    color: 0x2a2f38,
    metalness: 0.5,
    roughness: 0.42,
  });
  const glass = new THREE.MeshStandardMaterial({
    color: 0x9fb6cc,
    metalness: 0.1,
    roughness: 0.08,
    transparent: true,
    opacity: 0.32,
    side: THREE.DoubleSide,
  });
  const tire = new THREE.MeshStandardMaterial({ color: 0x141518, roughness: 0.92, metalness: 0.0 });
  const rim = new THREE.MeshStandardMaterial({ color: 0xb9bec6, metalness: 0.9, roughness: 0.28 });
  const chrome = new THREE.MeshStandardMaterial({
    color: 0xdfe4ea,
    metalness: 1.0,
    roughness: 0.15,
  });
  const plastic = new THREE.MeshStandardMaterial({
    color: 0x3b4048,
    roughness: 0.75,
    metalness: 0.05,
  });
  const steel = new THREE.MeshStandardMaterial({
    color: 0x6b7280,
    metalness: 0.9,
    roughness: 0.35,
  });
  const aluminum = new THREE.MeshStandardMaterial({
    color: 0xc9ced6,
    metalness: 0.85,
    roughness: 0.28,
  });
  const cast = new THREE.MeshStandardMaterial({
    color: 0x8a9099,
    metalness: 0.55,
    roughness: 0.62,
  });
  const copper = new THREE.MeshStandardMaterial({
    color: 0xb87333,
    metalness: 0.9,
    roughness: 0.3,
  });
  const floor = new THREE.MeshStandardMaterial({
    color: 0xf4f5f7,
    roughness: 0.85,
    metalness: 0.0,
  });
  const wall = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 1.0,
    metalness: 0.0,
    side: THREE.BackSide,
  });
  const hotspot = new THREE.MeshBasicMaterial({ color: 0x2f7cff, transparent: true, opacity: 0.9 });

  const accentCache = new Map<number, THREE.MeshStandardMaterial>();
  const accent = (color: THREE.ColorRepresentation): THREE.MeshStandardMaterial => {
    const key = new THREE.Color(color).getHex();
    let material = accentCache.get(key);
    if (!material) {
      material = new THREE.MeshStandardMaterial({ color: key, metalness: 0.25, roughness: 0.5 });
      accentCache.set(key, material);
    }
    return material;
  };

  const base: THREE.Material[] = [
    paint,
    paintDark,
    glass,
    tire,
    rim,
    chrome,
    plastic,
    steel,
    aluminum,
    cast,
    copper,
    floor,
    wall,
    hotspot,
  ];

  return {
    paint,
    paintDark,
    glass,
    tire,
    rim,
    chrome,
    plastic,
    steel,
    aluminum,
    cast,
    copper,
    floor,
    wall,
    hotspot,
    accent,
    get all() {
      return [...base, ...accentCache.values()];
    },
    dispose: () => {
      for (const material of [...base, ...accentCache.values()]) material.dispose();
    },
  };
}

export interface OpacityTarget {
  readonly material: THREE.Material | THREE.Material[];
}

/**
 * Applies a cross-fade opacity to a whole subtree without leaking shared
 * materials: every touched material is transparent and its base opacity cached
 * on the material's userData the first time.
 */
export function setObjectOpacity(root: THREE.Object3D, opacity: number): void {
  const clamped = Math.min(1, Math.max(0, opacity));
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) {
      if (material.userData['baseOpacity'] === undefined) {
        material.userData['baseOpacity'] = material.opacity;
      }
      const base = material.userData['baseOpacity'] as number;
      const wasTransparent = material.transparent;
      if (clamped < 1) {
        material.transparent = true;
        material.opacity = base * clamped;
        material.depthWrite = clamped > 0.35;
      } else {
        material.opacity = base;
        material.transparent = base < 1;
        material.depthWrite = true;
      }
      // Only a change to `transparent` needs a program rebuild; opacity alone
      // is a uniform update, which keeps the cross-fade cheap.
      if (wasTransparent !== material.transparent) material.needsUpdate = true;
    }
  });
}

/**
 * Makes a subtree read as a translucent "ghost" (the body shell over the
 * chassis hub). Unlike `setObjectOpacity` this is a one-way styling pass: it
 * writes `transparent`/`opacity` directly and is not used for cross-fades.
 */
export function setObjectGhost(root: THREE.Object3D, opacity: number, color?: number): void {
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) {
      material.transparent = true;
      material.opacity = Math.max(0, Math.min(1, opacity));
      material.depthWrite = false;
      if (color !== undefined && 'color' in material) {
        (material as THREE.MeshStandardMaterial).color.set(color);
      }
      material.needsUpdate = true;
    }
  });
}

/** Frees every geometry in a subtree. Materials are disposed separately. */
export function disposeObjectTree(root: THREE.Object3D): void {
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (mesh.isMesh) mesh.geometry.dispose();
  });
}
