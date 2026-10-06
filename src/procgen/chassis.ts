import * as THREE from 'three';
import type { QualityProfile } from '../core/quality.js';
import type { StudioMaterials } from '../materials/index.js';
import { PHYSICS_COLORS, setObjectGhost } from '../materials/index.js';
import {
  createEngineAggregate,
  createSuspensionCorner,
  createTransmissionAggregate,
  tubeBetween,
} from './aggregates.js';
import { CAR_DIMENSIONS, createVehicleModel } from './vehicle.js';

/**
 * The rolling chassis shown at the hub level: a translucent body shell over the
 * actual torque path — engine → transmission → transfer case → propshaft →
 * differential → half-shafts → wheels. This is the level where the four
 * branches are chosen, so each aggregate is tagged with the branch it opens
 * (docs/M0-design-plan.md §4, §5.1).
 */

export interface RollingChassis {
  readonly group: THREE.Group;
  /** Drivetrain paths, in level-local metres, used by the Flow overlay. */
  readonly flowPaths: readonly (readonly THREE.Vector3[])[];
  setFlow(visible: boolean): void;
  update(dt: number, elapsed: number, speedKph: number): void;
  dispose(): void;
}

function tag(object: THREE.Object3D, entry: string): void {
  object.userData['entry'] = entry;
}

/** Ghost shell that keeps context without hiding the running gear. */
function addGhostBody(
  group: THREE.Group,
  materials: StudioMaterials,
  profile: QualityProfile,
): THREE.Object3D[] {
  const shell = createVehicleModel(materials, profile);
  const ghosted: THREE.Object3D[] = [];
  shell.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;
    const name = object.name;
    if (name === 'body-lower' || name === 'body-cabin' || name === 'glass') {
      ghosted.push(mesh);
    }
  });
  for (const mesh of ghosted) setObjectGhost(mesh, 0.1, 0x9fb6cc);
  // Panels that carry lights/bumpers stay opaque but are not the focus.
  group.add(shell);
  return ghosted;
}

export function createRollingChassis(
  materials: StudioMaterials,
  profile: QualityProfile,
): RollingChassis {
  const group = new THREE.Group();
  group.name = 'rolling-chassis';

  addGhostBody(group, materials, profile);

  // --- Powertrain along the tunnel --------------------------------------
  const engine = createEngineAggregate(materials, profile);
  engine.position.set(1.55, 0.62, 0);
  tag(engine, 'engine.unit');
  group.add(engine);

  const transmission = createTransmissionAggregate(materials, profile);
  transmission.position.set(1.02, 0.55, 0);
  tag(transmission, 'at.unit');
  group.add(transmission);

  const transfer = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.2, 0.3), materials.cast);
  transfer.position.set(0.62, 0.5, 0.14);
  transfer.name = 'transfer-case';
  group.add(transfer);

  const propshaft = tubeBetween(
    new THREE.Vector3(0.66, 0.5, 0),
    new THREE.Vector3(-1.35, 0.42, 0),
    0.032,
    materials.steel,
  );
  propshaft.name = 'propshaft';
  group.add(propshaft);

  const differential = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.11, 0.3, Math.max(10, profile.segments), 1),
    materials.cast,
  );
  differential.rotation.x = Math.PI / 2;
  differential.position.set(-1.5, 0.42, 0);
  differential.name = 'rear-differential';
  group.add(differential);

  // Half-shafts to all four wheels.
  for (const side of [1, -1] as const) {
    const rearShaft = tubeBetween(
      new THREE.Vector3(-1.5, 0.42, side * 0.14),
      new THREE.Vector3(-CAR_DIMENSIONS.wheelbase / 2, CAR_DIMENSIONS.wheelRadius, side * 0.78),
      0.024,
      materials.steel,
    );
    group.add(rearShaft);
    const frontShaft = tubeBetween(
      new THREE.Vector3(0.62, 0.5, side * 0.16),
      new THREE.Vector3(CAR_DIMENSIONS.wheelbase / 2, CAR_DIMENSIONS.wheelRadius, side * 0.78),
      0.024,
      materials.steel,
    );
    group.add(frontShaft);
  }

  // --- Suspension corners and brakes ------------------------------------
  const wheels: THREE.Group[] = [];
  for (const x of [CAR_DIMENSIONS.wheelbase / 2, -CAR_DIMENSIONS.wheelbase / 2]) {
    for (const side of [1, -1] as const) {
      const corner = new THREE.Group();
      corner.position.set(x, CAR_DIMENSIONS.wheelRadius, side * CAR_DIMENSIONS.trackHalf);
      if (side < 0) corner.rotation.y = Math.PI;
      const suspension = createSuspensionCorner(materials, profile);
      tag(suspension, 'susp.corner');
      // The inboard disc and caliper route to the brake branch on tap.
      for (const name of ['brake-disc', 'caliper']) {
        const part = suspension.getObjectByName(name);
        if (part) tag(part, 'brake.corner');
      }
      corner.add(suspension);
      const wheel = suspension.getObjectByName('wheel') as THREE.Group | undefined;
      if (wheel) wheels.push(wheel);
      group.add(corner);
    }
  }

  // Subframes, tank and exhaust complete the underside read.
  for (const x of [1.5, -1.6]) {
    const subframe = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 1.2), materials.steel);
    subframe.position.set(x, 0.3, 0);
    group.add(subframe);
  }
  const tank = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.22, 1.3), materials.paintDark);
  tank.position.set(-0.85, 0.34, 0);
  group.add(tank);

  for (const side of [1, -1] as const) {
    group.add(
      tubeBetween(
        new THREE.Vector3(1.1, 0.28, side * 0.22),
        new THREE.Vector3(-1.9, 0.26, side * 0.36),
        0.035,
        materials.accent(PHYSICS_COLORS.exhaust),
      ),
    );
    const muffler = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.16, 0.24), materials.steel);
    muffler.position.set(-1.7, 0.26, side * 0.4);
    group.add(muffler);
  }

  // --- Flow overlay ------------------------------------------------------
  const flowPaths: THREE.Vector3[][] = [
    [
      new THREE.Vector3(1.55, 0.62, 0),
      new THREE.Vector3(1.02, 0.55, 0),
      new THREE.Vector3(0.62, 0.5, 0.08),
      new THREE.Vector3(0, 0.46, 0),
      new THREE.Vector3(-1.5, 0.42, 0),
      new THREE.Vector3(-1.49, 0.343, 0.7),
    ],
    [
      new THREE.Vector3(0.62, 0.5, 0.14),
      new THREE.Vector3(1.1, 0.42, 0.4),
      new THREE.Vector3(1.49, 0.343, 0.7),
    ],
  ];
  const markerGeometry = new THREE.SphereGeometry(0.022, 8, 6);
  const markerMaterial = materials.accent(PHYSICS_COLORS.air);
  const markers: THREE.Mesh[] = [];
  for (let i = 0; i < flowPaths.length * 4; i += 1) {
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.visible = false;
    markers.push(marker);
    group.add(marker);
  }

  let flow = false;
  let cursor = 0;

  const placeMarkers = (): void => {
    let index = 0;
    for (const path of flowPaths) {
      for (let i = 0; i < 4; i += 1) {
        const marker = markers[index]!;
        const u = (cursor + i / 4) % 1;
        const scaled = u * (path.length - 1);
        const segment = Math.min(path.length - 2, Math.floor(scaled));
        const local = scaled - segment;
        marker.position.copy(path[segment]!).lerp(path[segment + 1]!, local);
        index += 1;
      }
    }
  };

  return {
    group,
    flowPaths,
    setFlow(visible: boolean) {
      flow = visible;
      for (const marker of markers) marker.visible = visible;
      if (visible) placeMarkers();
    },
    update(dt: number, _elapsed: number, speedKph: number) {
      const spin = (speedKph / 3.6) * dt * 6;
      for (const wheel of wheels) wheel.rotation.z += spin;
      if (flow) {
        cursor = (cursor + dt * 0.35) % 1;
        placeMarkers();
      }
    },
    dispose() {
      group.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.isMesh) mesh.geometry.dispose();
      });
    },
  };
}
