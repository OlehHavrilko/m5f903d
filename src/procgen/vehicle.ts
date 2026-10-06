import * as THREE from 'three';
import type { QualityProfile } from '../core/quality.js';
import type { StudioMaterials } from '../materials/index.js';
import { PHYSICS_COLORS } from '../materials/index.js';
import { loftGeometry, type LoftSection } from './loft.js';

/**
 * Procedural BMW M5 (F90) silhouette: 4.97 m long, 1.90 m wide, 1.47 m tall,
 * 2.98 m wheelbase. Dimensions come from public specifications; the surface is
 * a schematic loft, not a scan (docs/M0-design-plan.md §11).
 */
export const CAR_DIMENSIONS = {
  length: 4.966,
  width: 1.903,
  height: 1.473,
  wheelbase: 2.982,
  wheelRadius: 0.343,
  wheelWidth: 0.275,
  trackHalf: 0.8,
} as const;

const LOWER_SECTIONS: readonly LoftSection[] = [
  { x: -2.45, y0: 0.46, y1: 0.94, halfWidth: 0.7, roundness: 0.95 },
  { x: -2.2, y0: 0.3, y1: 1.02, halfWidth: 0.86, roundness: 0.85 },
  { x: -1.8, y0: 0.18, y1: 1.06, halfWidth: 0.93, roundness: 0.7 },
  { x: -1.0, y0: 0.15, y1: 1.08, halfWidth: 0.95, roundness: 0.6 },
  { x: 0.0, y0: 0.14, y1: 1.05, halfWidth: 0.95, roundness: 0.6 },
  { x: 0.9, y0: 0.15, y1: 1.0, halfWidth: 0.94, roundness: 0.6 },
  { x: 1.6, y0: 0.18, y1: 0.96, halfWidth: 0.92, roundness: 0.65 },
  { x: 2.1, y0: 0.24, y1: 0.9, halfWidth: 0.88, roundness: 0.75 },
  { x: 2.45, y0: 0.4, y1: 0.82, halfWidth: 0.76, roundness: 0.95 },
];

const CABIN_SECTIONS: readonly LoftSection[] = [
  { x: -1.5, y0: 1.02, y1: 1.07, halfWidth: 0.78, roundness: 0.9 },
  { x: -1.15, y0: 1.02, y1: 1.32, halfWidth: 0.82, roundness: 0.55 },
  { x: -0.7, y0: 1.02, y1: 1.44, halfWidth: 0.84, roundness: 0.42 },
  { x: 0.0, y0: 1.02, y1: 1.47, halfWidth: 0.85, roundness: 0.42 },
  { x: 0.55, y0: 1.02, y1: 1.44, halfWidth: 0.83, roundness: 0.42 },
  { x: 0.95, y0: 1.02, y1: 1.28, halfWidth: 0.8, roundness: 0.55 },
  { x: 1.25, y0: 1.02, y1: 1.07, halfWidth: 0.74, roundness: 0.9 },
];

const GLASS_SECTIONS: readonly LoftSection[] = [
  { x: -1.36, y0: 1.1, y1: 1.2, halfWidth: 0.8, roundness: 0.6 },
  { x: -1.0, y0: 1.08, y1: 1.36, halfWidth: 0.845, roundness: 0.4 },
  { x: -0.2, y0: 1.07, y1: 1.41, halfWidth: 0.855, roundness: 0.38 },
  { x: 0.45, y0: 1.07, y1: 1.38, halfWidth: 0.845, roundness: 0.4 },
  { x: 0.95, y0: 1.08, y1: 1.22, halfWidth: 0.81, roundness: 0.6 },
];

/** One wheel: tyre, rim face and double spokes, all from primitives. */
function createWheel(materials: StudioMaterials, profile: QualityProfile): THREE.Group {
  const group = new THREE.Group();
  const radial = Math.max(12, Math.round(profile.segments * 1.5));
  const r = CAR_DIMENSIONS.wheelRadius;
  const w = CAR_DIMENSIONS.wheelWidth;

  const tyre = new THREE.Mesh(new THREE.CylinderGeometry(r, r, w, radial, 1), materials.tire);
  tyre.rotation.x = Math.PI / 2;
  tyre.castShadow = true;
  group.add(tyre);

  const rim = new THREE.Mesh(
    new THREE.CylinderGeometry(r * 0.68, r * 0.68, w + 0.01, radial, 1),
    materials.rim,
  );
  rim.rotation.x = Math.PI / 2;
  group.add(rim);

  const spokeCount = 5;
  const spokeGeometry = new THREE.BoxGeometry(r * 0.6, w * 0.18, 0.035);
  for (let i = 0; i < spokeCount; i += 1) {
    const angle = (i / spokeCount) * Math.PI * 2;
    const spoke = new THREE.Mesh(spokeGeometry, materials.rim);
    spoke.position.set(Math.cos(angle) * r * 0.34, Math.sin(angle) * r * 0.34, 0);
    spoke.rotation.z = angle;
    group.add(spoke);
  }

  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(r * 0.16, r * 0.16, w + 0.04, radial, 1),
    materials.chrome,
  );
  hub.rotation.x = Math.PI / 2;
  group.add(hub);

  return group;
}

export interface VehicleModel extends THREE.Group {
  /** Approximate world-space bounding box of the body. */
  readonly dimensions?: THREE.Vector3;
}

/**
 * Builds the whole car. Returns a group centred on the wheel contact plane
 * (y = 0), nose facing +X.
 */
export function createVehicleModel(
  materials: StudioMaterials,
  profile: QualityProfile,
): THREE.Group {
  const car = new THREE.Group();
  car.name = 'vehicle';

  const radial = profile.segments;

  const lower = new THREE.Mesh(loftGeometry(LOWER_SECTIONS, radial), materials.paint);
  lower.castShadow = true;
  lower.receiveShadow = true;
  lower.name = 'body-lower';
  car.add(lower);

  const cabin = new THREE.Mesh(loftGeometry(CABIN_SECTIONS, radial), materials.paint);
  cabin.castShadow = true;
  cabin.name = 'body-cabin';
  car.add(cabin);

  const glass = new THREE.Mesh(loftGeometry(GLASS_SECTIONS, radial), materials.glass);
  glass.renderOrder = 2;
  glass.name = 'glass';
  car.add(glass);

  const wheelGeometryPositions: Array<[number, number, number]> = [
    [CAR_DIMENSIONS.wheelbase / 2, CAR_DIMENSIONS.wheelRadius, CAR_DIMENSIONS.trackHalf],
    [CAR_DIMENSIONS.wheelbase / 2, CAR_DIMENSIONS.wheelRadius, -CAR_DIMENSIONS.trackHalf],
    [-CAR_DIMENSIONS.wheelbase / 2, CAR_DIMENSIONS.wheelRadius, CAR_DIMENSIONS.trackHalf],
    [-CAR_DIMENSIONS.wheelbase / 2, CAR_DIMENSIONS.wheelRadius, -CAR_DIMENSIONS.trackHalf],
  ];
  for (const [x, y, z] of wheelGeometryPositions) {
    const wheel = createWheel(materials, profile);
    wheel.position.set(x, y, z);
    wheel.name = 'wheel';
    car.add(wheel);
  }

  // Front and rear lighting, bumpers and mirrors.
  const lightGeometry = new THREE.BoxGeometry(0.06, 0.09, 0.36);
  for (const z of [0.6, -0.6]) {
    const headlight = new THREE.Mesh(lightGeometry, materials.chrome);
    headlight.position.set(2.46, 0.76, z);
    car.add(headlight);
  }
  const tailMaterial = materials.accent(PHYSICS_COLORS.exhaust);
  const tailGeometry = new THREE.BoxGeometry(0.06, 0.08, 0.4);
  for (const z of [0.6, -0.6]) {
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.set(-2.46, 0.8, z);
    car.add(tail);
  }

  const grille = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.22, 0.9), materials.paintDark);
  grille.position.set(2.47, 0.52, 0);
  car.add(grille);

  const mirrorGeometry = new THREE.BoxGeometry(0.22, 0.09, 0.1);
  for (const z of [0.95, -0.95]) {
    const mirror = new THREE.Mesh(mirrorGeometry, materials.paintDark);
    mirror.position.set(0.72, 1.06, z);
    car.add(mirror);
  }

  const splitter = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 1.5), materials.paintDark);
  splitter.position.set(2.36, 0.17, 0);
  car.add(splitter);

  const diffuser = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 1.3), materials.paintDark);
  diffuser.position.set(-2.36, 0.22, 0);
  car.add(diffuser);

  return car;
}
