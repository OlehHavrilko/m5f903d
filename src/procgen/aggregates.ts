import * as THREE from 'three';
import type { QualityProfile } from '../core/quality.js';
import type { StudioMaterials } from '../materials/index.js';
import { PHYSICS_COLORS } from '../materials/index.js';

/**
 * Reusable procedural sub-assemblies: engine, transmission, wheel/suspension
 * corner and brake corner. They are deliberately schematic — the point is the
 * relationship between parts, not an OEM-accurate surface
 * (docs/M0-design-plan.md §5, §11). Everything is generated from primitives.
 */

function radial(profile: QualityProfile, floor: number): number {
  return Math.max(floor, Math.round(profile.segments * 0.8));
}

/** Cylinder spanning two points, used for arms, rods and lines. */
export function tubeBetween(
  a: THREE.Vector3,
  b: THREE.Vector3,
  radius: number,
  material: THREE.Material,
  segments = 8,
): THREE.Mesh {
  const direction = b.clone().sub(a);
  const length = Math.max(1e-4, direction.length());
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, length, segments, 1),
    material,
  );
  mesh.position.copy(a).addScaledVector(direction, 0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  return mesh;
}

/** Helical coil spring along +Y, centred on the group origin. */
export function coilSpringGeometry(
  radius: number,
  height: number,
  coils: number,
  wire: number,
  segments: number,
): THREE.TubeGeometry {
  const steps = Math.max(32, Math.round(coils * 18));
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const angle = t * coils * Math.PI * 2;
    points.push(
      new THREE.Vector3(
        Math.cos(angle) * radius,
        -height / 2 + t * height,
        Math.sin(angle) * radius,
      ),
    );
  }
  return new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(points),
    steps,
    wire,
    Math.max(6, segments),
    false,
  );
}

/**
 * 90° V8 power unit: block, two banks with cams, intake in the valley, two
 * turbos, timing cover and bell housing. Crankshaft along X, front face at +X.
 */
export function createEngineAggregate(
  materials: StudioMaterials,
  profile: QualityProfile,
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'engine-aggregate';
  const segments = radial(profile, 12);
  const bank = Math.PI / 4;

  const block = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.26, 0.3), materials.cast);
  group.add(block);

  const pan = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.13, 0.24), materials.aluminum);
  pan.position.y = -0.19;
  group.add(pan);

  const timing = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.36, 0.36), materials.aluminum);
  timing.position.set(0.25, 0.02, 0);
  group.add(timing);

  const bell = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 0.09, segments, 1),
    materials.aluminum,
  );
  bell.rotation.z = Math.PI / 2;
  bell.position.set(-0.26, 0, 0);
  group.add(bell);

  for (const side of [1, -1] as const) {
    const cylinderBank = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.24, 0.16), materials.cast);
    cylinderBank.position.set(0, 0.22, side * 0.2);
    cylinderBank.rotation.x = side * bank;
    group.add(cylinderBank);

    const camCover = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.07, 0.16), materials.aluminum);
    camCover.position.set(0, 0.38, side * 0.31);
    camCover.rotation.x = side * bank;
    group.add(camCover);

    const rail = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.4, 8),
      materials.accent(PHYSICS_COLORS.fuel),
    );
    rail.rotation.z = Math.PI / 2;
    rail.position.set(0, 0.5, side * 0.33);
    group.add(rail);

    const turbo = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.065, 0.09, segments, 1),
      materials.chrome,
    );
    turbo.rotation.z = Math.PI / 2;
    turbo.position.set(0.1, 0.04, side * 0.35);
    group.add(turbo);

    const snail = new THREE.Mesh(
      new THREE.TorusGeometry(0.06, 0.03, 8, segments),
      materials.chrome,
    );
    snail.rotation.y = Math.PI / 2;
    snail.position.set(0.18, 0.04, side * 0.35);
    group.add(snail);

    const downpipe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8),
      materials.accent(PHYSICS_COLORS.exhaust),
    );
    downpipe.rotation.z = Math.PI / 0.9;
    downpipe.position.set(-0.05, -0.18, side * 0.28);
    group.add(downpipe);
  }

  const intake = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.3), materials.paintDark);
  intake.position.y = 0.45;
  group.add(intake);

  const pulley = new THREE.Mesh(
    new THREE.CylinderGeometry(0.075, 0.075, 0.04, segments, 1),
    materials.steel,
  );
  pulley.rotation.z = Math.PI / 2;
  pulley.position.set(0.3, 0, 0);
  pulley.name = 'engine-pulley';
  group.add(pulley);

  return group;
}

/**
 * 8HP-class automatic: converter bell with the turbine, main case, oil pan,
 * mechatronic sleeve and output flange. Input at +X, output at −X.
 */
export function createTransmissionAggregate(
  materials: StudioMaterials,
  profile: QualityProfile,
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'transmission-aggregate';
  const segments = radial(profile, 12);

  const bell = new THREE.Mesh(
    new THREE.CylinderGeometry(0.17, 0.15, 0.14, segments, 1),
    materials.aluminum,
  );
  bell.rotation.z = Math.PI / 2;
  bell.position.x = 0.22;
  group.add(bell);

  const converter = new THREE.Mesh(
    new THREE.TorusGeometry(0.1, 0.035, 8, segments),
    materials.steel,
  );
  converter.rotation.y = Math.PI / 2;
  converter.position.x = 0.22;
  converter.name = 'converter';
  group.add(converter);

  const housing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.12, 0.4, segments, 1),
    materials.cast,
  );
  housing.rotation.z = Math.PI / 2;
  housing.position.x = -0.05;
  group.add(housing);

  const pan = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.06, 0.22), materials.cast);
  pan.position.set(-0.05, -0.14, 0);
  group.add(pan);

  const mechatronic = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.09, 0.1), materials.paintDark);
  mechatronic.position.set(-0.05, -0.08, 0.13);
  mechatronic.name = 'mechatronic';
  group.add(mechatronic);

  const tail = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.11, 0.12, segments, 1),
    materials.aluminum,
  );
  tail.rotation.z = Math.PI / 2;
  tail.position.x = -0.3;
  group.add(tail);

  const flange = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.05, segments, 1),
    materials.steel,
  );
  flange.rotation.z = Math.PI / 2;
  flange.position.x = -0.37;
  flange.name = 'output-flange';
  group.add(flange);

  for (const side of [1, -1] as const) {
    const cooler = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.3, 8),
      materials.accent(PHYSICS_COLORS.coolant),
    );
    cooler.rotation.z = Math.PI / 2;
    cooler.position.set(0, 0.1, side * 0.12);
    group.add(cooler);
  }

  return group;
}

/** Wheel centred on the origin, axis along Z. */
export function createWheelAssembly(
  materials: StudioMaterials,
  profile: QualityProfile,
  radius = 0.343,
  width = 0.275,
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'wheel';
  const segments = radial(profile, 20);

  const tyre = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, width, segments, 1),
    materials.tire,
  );
  tyre.rotation.x = Math.PI / 2;
  tyre.castShadow = true;
  group.add(tyre);

  const rim = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.7, radius * 0.7, width + 0.01, segments, 1),
    materials.rim,
  );
  rim.rotation.x = Math.PI / 2;
  group.add(rim);

  const spokeGeometry = new THREE.BoxGeometry(radius * 0.6, width * 0.18, 0.035);
  for (let i = 0; i < 5; i += 1) {
    const angle = (i / 5) * Math.PI * 2;
    const spoke = new THREE.Mesh(spokeGeometry, materials.rim);
    spoke.position.set(Math.cos(angle) * radius * 0.34, Math.sin(angle) * radius * 0.34, 0);
    spoke.rotation.z = angle;
    group.add(spoke);
  }

  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.16, radius * 0.16, width + 0.04, segments, 1),
    materials.chrome,
  );
  hub.rotation.x = Math.PI / 2;
  group.add(hub);

  return group;
}

/**
 * Front double-wishbone corner: wheel, knuckle, lower/upper arms, tie rod and
 * an outboard damper with a coil spring. Local +X points forward, +Z outboard.
 */
export function createSuspensionCorner(
  materials: StudioMaterials,
  profile: QualityProfile,
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'suspension-corner';
  const segments = radial(profile, 12);

  group.add(createWheelAssembly(materials, profile));

  const knuckle = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.24, 0.12), materials.aluminum);
  knuckle.position.set(0, -0.02, -0.2);
  group.add(knuckle);

  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1975, 0.1975, 0.03, segments, 1),
    materials.steel,
  );
  disc.rotation.x = Math.PI / 2;
  disc.position.z = -0.16;
  disc.name = 'brake-disc';
  group.add(disc);

  const caliper = new THREE.Mesh(
    new THREE.BoxGeometry(0.13, 0.19, 0.07),
    materials.accent(0xd0342c),
  );
  caliper.position.set(0.05, 0.12, -0.16);
  caliper.name = 'caliper';
  group.add(caliper);

  const lowerFront = tubeBetween(
    new THREE.Vector3(0.12, -0.16, -0.2),
    new THREE.Vector3(0.42, -0.2, -0.58),
    0.022,
    materials.steel,
  );
  const lowerRear = tubeBetween(
    new THREE.Vector3(-0.12, -0.16, -0.2),
    new THREE.Vector3(-0.34, -0.2, -0.58),
    0.022,
    materials.steel,
  );
  const upper = tubeBetween(
    new THREE.Vector3(0, 0.16, -0.2),
    new THREE.Vector3(0.18, 0.3, -0.56),
    0.018,
    materials.steel,
  );
  const tieRod = tubeBetween(
    new THREE.Vector3(0.08, 0, -0.24),
    new THREE.Vector3(0.42, -0.02, -0.5),
    0.014,
    materials.chrome,
  );
  group.add(lowerFront, lowerRear, upper, tieRod);

  // Damper body + rod + coil spring, leaning inboard from the knuckle.
  const damperBase = new THREE.Vector3(0.02, 0.16, -0.3);
  const damperTop = new THREE.Vector3(-0.02, 0.62, -0.34);
  const damperBody = tubeBetween(damperBase, damperTop, 0.032, materials.paintDark);
  const rod = tubeBetween(
    damperTop,
    damperTop.clone().add(new THREE.Vector3(0, 0.1, 0)),
    0.014,
    materials.chrome,
  );
  group.add(damperBody, rod);
  const spring = new THREE.Mesh(
    coilSpringGeometry(0.07, 0.32, 7, 0.012, segments),
    materials.steel,
  );
  spring.position.set(0.0, 0.42, -0.32);
  spring.rotation.z = 0.08;
  group.add(spring);

  const dropLink = tubeBetween(
    new THREE.Vector3(-0.1, 0.06, -0.3),
    new THREE.Vector3(-0.3, -0.04, -0.46),
    0.012,
    materials.chrome,
  );
  group.add(dropLink);

  return group;
}

/** Ventilated disc, six-piston caliper and pads. Axis along Z. */
export function createBrakeCorner(
  materials: StudioMaterials,
  profile: QualityProfile,
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'brake-corner';
  const segments = radial(profile, 20);

  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1975, 0.1975, 0.032, segments, 1),
    materials.steel,
  );
  disc.rotation.x = Math.PI / 2;
  disc.name = 'brake-disc';
  group.add(disc);

  const hat = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.07, 0.07, segments, 1),
    materials.aluminum,
  );
  hat.rotation.x = Math.PI / 2;
  group.add(hat);

  const holeGeometry = new THREE.CylinderGeometry(0.012, 0.012, 0.05, 8);
  const holes = Math.max(8, Math.round(profile.segments * 0.7));
  for (let i = 0; i < holes; i += 1) {
    const angle = (i / holes) * Math.PI * 2;
    const hole = new THREE.Mesh(holeGeometry, materials.paintDark);
    hole.rotation.x = Math.PI / 2;
    hole.position.set(Math.cos(angle) * 0.16, Math.sin(angle) * 0.16, 0);
    group.add(hole);
  }

  const caliper = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.2, 0.08),
    materials.accent(0xd0342c),
  );
  caliper.position.set(0.02, 0.12, 0);
  caliper.name = 'caliper';
  group.add(caliper);

  const padGeometry = new THREE.BoxGeometry(0.09, 0.15, 0.014);
  for (const side of [1, -1] as const) {
    const pad = new THREE.Mesh(padGeometry, materials.copper);
    pad.position.set(0.02, 0.12, side * 0.026);
    group.add(pad);
  }

  const pistons = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.16, 0.02), materials.chrome);
  pistons.position.set(0.02, 0.12, 0.05);
  group.add(pistons);

  const hose = tubeBetween(
    new THREE.Vector3(0.1, 0.2, 0.06),
    new THREE.Vector3(0.22, 0.06, 0.14),
    0.01,
    materials.paintDark,
  );
  group.add(hose);

  return group;
}
