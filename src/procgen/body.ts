import * as THREE from 'three';
import type { QualityProfile } from '../core/quality.js';
import type { StudioMaterials } from '../materials/index.js';
import { PHYSICS_COLORS } from '../materials/index.js';

/**
 * Body-in-white plus bolt-on panels. Panels carry an explosion direction in
 * `userData`, which the `body` level animates in **Explode** mode: structure
 * stays, skin flies off. Dimensions follow the public M5 (F90) figures, but the
 * section shapes are schematic (docs/M0-design-plan.md §5.1, §11).
 */
export const BODY_DIMENSIONS = {
  length: 4.966,
  width: 1.903,
  height: 1.473,
  wheelbase: 2.982,
} as const;

function markPanel(mesh: THREE.Mesh, direction: readonly [number, number, number]): THREE.Mesh {
  mesh.userData['explodeDir'] = new THREE.Vector3(...direction);
  mesh.userData['explodeBase'] = mesh.position.clone();
  return mesh;
}

function box(
  material: THREE.Material,
  width: number,
  height: number,
  depth: number,
  position: readonly [number, number, number],
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.set(...position);
  return mesh;
}

/** Moves every marked panel out along its stored direction. Deterministic. */
export function applyBodyExplode(root: THREE.Object3D, amount: number): void {
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    const direction = mesh.userData['explodeDir'] as THREE.Vector3 | undefined;
    const base = mesh.userData['explodeBase'] as THREE.Vector3 | undefined;
    if (!direction || !base) return;
    mesh.position.copy(base).addScaledVector(direction, amount);
  });
}

/** Number of bolt-on panels, useful for tests and the honesty panel. */
export function countBodyPanels(root: THREE.Object3D): number {
  let count = 0;
  root.traverse((object) => {
    if ((object as THREE.Mesh).userData['explodeDir']) count += 1;
  });
  return count;
}

export function createBodyStructure(
  materials: StudioMaterials,
  _profile: QualityProfile,
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'body-structure';

  // --- Load-bearing structure -------------------------------------------
  group.add(
    box(materials.steel, 2.7, 0.05, 1.5, [0, 0.36, 0]), // floor pan
  );
  for (const side of [1, -1] as const) {
    group.add(box(materials.steel, 2.4, 0.13, 0.09, [0, 0.42, side * 0.8])); // sill / rocker
    group.add(box(materials.steel, 1.0, 0.1, 0.08, [1.55, 0.5, side * 0.38])); // front rail
    group.add(box(materials.steel, 1.1, 0.1, 0.08, [-1.65, 0.5, side * 0.4])); // rear rail
  }
  group.add(box(materials.steel, 0.06, 0.62, 1.5, [0.9, 0.75, 0])); // firewall
  group.add(box(materials.steel, 0.05, 0.5, 1.4, [-1.55, 0.8, 0])); // rear bulkhead
  group.add(box(materials.steel, 2.0, 0.22, 0.28, [0.1, 0.44, 0])); // transmission tunnel
  group.add(box(materials.steel, 1.7, 0.04, 1.28, [0, 1.44, 0])); // roof panel (structure)

  for (const side of [1, -1] as const) {
    // Shock towers front and rear.
    group.add(box(materials.steel, 0.18, 0.36, 0.16, [1.35, 0.92, side * 0.5]));
    group.add(box(materials.steel, 0.18, 0.3, 0.16, [-1.55, 0.88, side * 0.5]));
    // Subframes.
    group.add(box(materials.steel, 0.7, 0.1, 1.0, [1.5, 0.26, 0]));
    group.add(box(materials.steel, 0.6, 0.1, 0.92, [-1.6, 0.26, 0]));
    // A-pillars.
    const aPillar = box(materials.steel, 0.07, 0.62, 0.07, [0.78, 1.16, side * 0.72]);
    aPillar.rotation.z = -0.5;
    group.add(aPillar);
    // C-pillars.
    const cPillar = box(materials.steel, 0.07, 0.5, 0.07, [-1.2, 1.16, side * 0.72]);
    cPillar.rotation.z = 0.42;
    group.add(cPillar);
  }
  // B-pillars.
  for (const side of [1, -1] as const) {
    group.add(box(materials.steel, 0.06, 0.5, 0.06, [-0.15, 1.18, side * 0.8]));
  }

  // --- Bolt-on body panels (explode targets) -----------------------------
  group.add(markPanel(box(materials.paint, 1.15, 0.035, 1.42, [1.5, 1.05, 0]), [0.5, 1.1, 0]));
  group.add(markPanel(box(materials.paint, 0.82, 0.035, 1.4, [-1.72, 1.0, 0]), [-0.5, 1.1, 0]));

  for (const side of [1, -1] as const) {
    group.add(
      markPanel(box(materials.paint, 1.25, 0.3, 0.05, [1.5, 0.78, side * 0.92]), [
        0.15,
        0.35,
        side,
      ]),
    );
    group.add(
      markPanel(box(materials.paint, 0.92, 0.52, 0.05, [-0.12, 0.86, side * 0.94]), [
        0,
        0.15,
        side,
      ]),
    );
    group.add(
      markPanel(box(materials.paint, 0.8, 0.46, 0.05, [-1.06, 0.86, side * 0.94]), [0, 0.15, side]),
    );
    // Doors open as they leave, so the hinge side stays readable.
    group.add(
      markPanel(box(materials.paintDark, 0.06, 0.42, 0.05, [-0.6, 0.86, side * 0.9]), [
        0,
        0.1,
        side,
      ]),
    );
  }

  group.add(markPanel(box(materials.paintDark, 0.1, 0.3, 1.6, [2.46, 0.55, 0]), [1, 0.1, 0]));
  group.add(markPanel(box(materials.paintDark, 0.1, 0.3, 1.6, [-2.46, 0.55, 0]), [-1, 0.1, 0]));

  // Glazing.
  const windscreen = markPanel(box(materials.glass, 0.04, 0.6, 1.3, [0.62, 1.18, 0]), [0.35, 1, 0]);
  windscreen.rotation.z = 0.5;
  group.add(windscreen);

  const rearScreen = markPanel(
    box(materials.glass, 0.04, 0.5, 1.25, [-1.28, 1.16, 0]),
    [-0.3, 1, 0],
  );
  rearScreen.rotation.z = -0.45;
  group.add(rearScreen);

  for (const side of [1, -1] as const) {
    group.add(
      markPanel(box(materials.glass, 0.75, 0.32, 0.03, [-0.6, 1.24, side * 0.83]), [0, 0.2, side]),
    );
  }

  // Lighting, as coloured accents so the physics palette stays consistent.
  for (const side of [1, -1] as const) {
    group.add(
      markPanel(
        box(materials.accent(PHYSICS_COLORS.highVoltage), 0.06, 0.09, 0.36, [
          2.44,
          0.78,
          side * 0.6,
        ]),
        [1, 0.1, 0],
      ),
    );
    group.add(
      markPanel(
        box(materials.accent(PHYSICS_COLORS.exhaust), 0.06, 0.08, 0.4, [-2.44, 0.8, side * 0.6]),
        [-1, 0.1, 0],
      ),
    );
  }

  return group;
}
