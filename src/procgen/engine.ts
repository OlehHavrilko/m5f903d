import * as THREE from 'three';
import type { QualityProfile } from '../core/quality.js';
import type { StudioMaterials } from '../materials/index.js';
import { PHYSICS_COLORS } from '../materials/index.js';
import { mulberry32 } from '../core/timeline.js';
import { coilSpringGeometry, tubeBetween } from './aggregates.js';

/**
 * Branch A shared data and procedural parts.
 *
 * Every engine level is authored around one published description of the S63B44T4
 * so a dimension is written down once and reused all the way from the long block
 * to the crystal lattice (docs/M0-design-plan.md §5.2, §7). Values that are only
 * known to the right order of magnitude are marked `unverified` and never shown
 * as a fact.
 */
export const S63 = {
  displacementCm3: 4395,
  /** Cylinder bore in metres (89.0 mm, public spec). */
  bore: 0.089,
  /** Piston stroke in metres (88.3 mm, public spec). */
  stroke: 0.0883,
  /** Connecting-rod centre distance; order of magnitude, unverified. */
  rodLength: 0.143,
  compressionRatio: 10.0,
  cylinders: 8,
  bankAngleDeg: 90,
  valvesPerCylinder: 4,
  redlineRpm: 7200,
  peakPowerPs: 625,
  peakPowerRpm: 6000,
  peakTorqueNm: 750,
  /** Cross-plane V8 order: 1-5-4-8-6-3-7-2. */
  firingOrder: [1, 5, 4, 8, 6, 3, 7, 2],
} as const;

/** Geometry object consumed by the GPU-free crank-slider kinematics. */
export const CRANK_GEOMETRY = { stroke: S63.stroke, rodLength: S63.rodLength } as const;

/** Crank radius: half the stroke, in metres. */
export const CRANK_RADIUS = S63.stroke / 2;

/** Radial segments scaled by the quality tier, with a floor for low-end devices. */
export function radialSegments(profile: QualityProfile, floor: number): number {
  return Math.max(floor, Math.round(profile.segments * 0.8));
}

/** One full four-stroke cycle spans 720° of crank rotation. */
export const CYCLE_DEG = 720;

// --- Piston and rod --------------------------------------------------------

export interface PistonAssembly {
  readonly group: THREE.Group;
  readonly rings: readonly THREE.Mesh[];
}

/** Piston centred on its pin axis; ring grooves sit near the crown. */
export function createPistonAssembly(
  materials: StudioMaterials,
  profile: QualityProfile,
  bore: number,
): PistonAssembly {
  const group = new THREE.Group();
  group.name = 'piston';
  const radius = bore / 2;
  const segments = radialSegments(profile, 20);
  const halfHeight = Math.min(0.03, bore * 0.34);

  const skirt = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius * 0.96, halfHeight * 2, segments, 1),
    materials.aluminum,
  );
  skirt.name = 'piston-body';
  group.add(skirt);

  const crown = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.99, radius * 0.99, 0.008, segments, 1),
    materials.steel,
  );
  crown.position.y = halfHeight + 0.004;
  crown.name = 'piston-crown';
  group.add(crown);

  const rings: THREE.Mesh[] = [];
  const ringGeometry = new THREE.TorusGeometry(radius * 0.985, 0.0018, 5, segments);
  for (let i = 0; i < 3; i += 1) {
    const ring = new THREE.Mesh(ringGeometry, materials.steel);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = halfHeight - 0.006 - i * 0.007;
    group.add(ring);
    rings.push(ring);
  }

  const pin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.006, 0.006, bore * 0.44, 12, 1),
    materials.chrome,
  );
  pin.rotation.x = Math.PI / 2; // pin axis along Z
  group.add(pin);

  return { group, rings };
}

/**
 * Connecting rod with its small end at the group origin, extending along −Y to
 * the big end. The piston level rotates it about Z by asin(r·sinθ / L).
 */
export function createConnectingRod(
  materials: StudioMaterials,
  profile: QualityProfile,
  length: number,
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'connecting-rod';
  const segments = radialSegments(profile, 12);
  group.add(
    tubeBetween(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, -length, 0),
      0.006,
      materials.steel,
      Math.max(8, Math.round(segments * 0.5)),
    ),
  );

  const smallEnd = new THREE.Mesh(
    new THREE.TorusGeometry(0.009, 0.004, 6, segments),
    materials.steel,
  );
  group.add(smallEnd);

  const bigEnd = new THREE.Mesh(
    new THREE.TorusGeometry(0.018, 0.006, 6, segments),
    materials.steel,
  );
  bigEnd.position.y = -length;
  bigEnd.name = 'rod-big-end';
  group.add(bigEnd);

  return group;
}

// --- Valvetrain ------------------------------------------------------------

export interface ValveAssembly {
  readonly group: THREE.Group;
  readonly stem: THREE.Mesh;
  readonly spring: THREE.Mesh;
  readonly head: THREE.Mesh;
}

/** Poppet valve with its head at the origin and the stem rising along +Y. */
export function createValveAssembly(
  materials: StudioMaterials,
  profile: QualityProfile,
  options: { stemLength: number; headRadius: number; springRadius: number },
): ValveAssembly {
  const group = new THREE.Group();
  group.name = 'valve';
  const segments = radialSegments(profile, 12);

  const head = new THREE.Mesh(
    new THREE.CylinderGeometry(options.headRadius, options.headRadius * 0.7, 0.006, segments, 1),
    materials.steel,
  );
  head.position.y = 0.003;
  group.add(head);

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0035, 0.0035, options.stemLength, 10, 1),
    materials.chrome,
  );
  stem.position.y = options.stemLength / 2 + 0.006;
  group.add(stem);

  const spring = new THREE.Mesh(
    coilSpringGeometry(options.springRadius, options.stemLength * 0.55, 6, 0.0022, segments),
    materials.steel,
  );
  spring.position.y = options.stemLength * 0.55;
  group.add(spring);

  return { group, stem, spring, head };
}

/** Camshaft along Z with `lobes` lobes; returns the shaft so a level can spin it. */
export function createCamshaft(
  materials: StudioMaterials,
  profile: QualityProfile,
  options: { length: number; radius: number; lobes: number },
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'camshaft';
  const segments = radialSegments(profile, 12);
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(options.radius, options.radius, options.length, segments, 1),
    materials.steel,
  );
  shaft.rotation.x = Math.PI / 2; // axis along Z
  group.add(shaft);

  const lobeGeometry = new THREE.SphereGeometry(
    options.radius * 1.5,
    segments,
    Math.max(8, segments / 2),
  );
  for (let i = 0; i < options.lobes; i += 1) {
    const lobe = new THREE.Mesh(lobeGeometry, materials.chrome);
    lobe.scale.set(1.15, 1.35, 0.55);
    // Eccentric to the shaft axis so spinning the cam visibly moves the nose.
    lobe.position.set(
      options.radius * 0.55,
      0,
      -options.length / 2 + ((i + 0.5) / options.lobes) * options.length,
    );
    group.add(lobe);
  }

  return group;
}

// --- Combustion hardware ---------------------------------------------------

/** Spark plug with the electrode below the origin (into the chamber). */
export function createSparkPlug(materials: StudioMaterials, profile: QualityProfile): THREE.Group {
  const group = new THREE.Group();
  group.name = 'spark-plug';
  const segments = radialSegments(profile, 10);

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.005, 0.005, 0.03, segments, 1),
    materials.chrome,
  );
  body.position.y = 0.015;
  group.add(body);

  const insulator = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.006, 0.02, segments, 1),
    materials.copper,
  );
  insulator.position.y = 0.04;
  group.add(insulator);

  const electrode = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0012, 0.0012, 0.008, 6, 1),
    materials.steel,
  );
  electrode.position.y = -0.004;
  group.add(electrode);

  return group;
}

/** Direct-injection injector with a nozzle below the origin. */
export function createInjector(materials: StudioMaterials, profile: QualityProfile): THREE.Group {
  const group = new THREE.Group();
  group.name = 'injector';
  const segments = radialSegments(profile, 10);

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.006, 0.009, 0.035, segments, 1),
    materials.chrome,
  );
  body.position.y = 0.02;
  group.add(body);

  const nozzle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0018, 0.004, 0.012, 8, 1),
    materials.steel,
  );
  nozzle.position.y = -0.002;
  group.add(nozzle);

  return group;
}

export interface Turbocharger {
  readonly group: THREE.Group;
  readonly compressor: THREE.Group;
  readonly turbine: THREE.Group;
  readonly wastegate: THREE.Mesh;
}

/** Twin-scroll turbo: compressor wheel, turbine wheel, shaft and wastegate flap. */
export function createTurbocharger(
  materials: StudioMaterials,
  profile: QualityProfile,
  radius = 0.032,
): Turbocharger {
  const group = new THREE.Group();
  group.name = 'turbocharger';
  const segments = radialSegments(profile, 14);
  const accent = materials.accent(PHYSICS_COLORS.air);

  const housing = new THREE.Mesh(
    new THREE.TorusGeometry(radius, radius * 0.42, 8, segments),
    materials.cast,
  );
  housing.rotation.y = Math.PI / 2;
  group.add(housing);

  const compressor = new THREE.Group();
  compressor.name = 'compressor-wheel';
  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.7, radius * 0.7, radius * 0.5, segments, 1),
    materials.chrome,
  );
  hub.rotation.z = Math.PI / 2; // wheel axis along X
  compressor.add(hub);
  const bladeGeometry = new THREE.BoxGeometry(radius * 0.5, radius * 0.66, radius * 0.06);
  const blades = Math.max(6, Math.round(profile.particleScale * 9) + 5);
  for (let i = 0; i < blades; i += 1) {
    const angle = (i / blades) * Math.PI * 2;
    const blade = new THREE.Mesh(bladeGeometry, accent);
    blade.rotation.x = angle;
    blade.position.set(0, Math.cos(angle) * radius * 0.35, Math.sin(angle) * radius * 0.35);
    compressor.add(blade);
  }
  compressor.position.x = -radius * 0.55;
  group.add(compressor);

  const turbine = new THREE.Group();
  turbine.name = 'turbine-wheel';
  const turbineHub = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.72, radius * 0.72, radius * 0.4, segments, 1),
    materials.steel,
  );
  turbineHub.rotation.z = Math.PI / 2;
  turbine.add(turbineHub);
  const bucketGeometry = new THREE.BoxGeometry(radius * 0.42, radius * 0.62, radius * 0.05);
  for (let i = 0; i < blades; i += 1) {
    const angle = (i / blades) * Math.PI * 2;
    const bucket = new THREE.Mesh(bucketGeometry, materials.accent(PHYSICS_COLORS.exhaust));
    bucket.rotation.x = angle;
    bucket.position.set(0, Math.cos(angle) * radius * 0.36, Math.sin(angle) * radius * 0.36);
    turbine.add(bucket);
  }
  turbine.position.x = radius * 0.55;
  group.add(turbine);

  const wastegate = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.016, 0.012), materials.steel);
  wastegate.name = 'wastegate';
  wastegate.position.set(radius * 0.4, radius * 1.05, 0);
  group.add(wastegate);

  return { group, compressor, turbine, wastegate };
}

// --- Microstructure and crystal -------------------------------------------

export interface GrainField {
  readonly group: THREE.Group;
  /** Boundary lines drawn between neighbouring grains. */
  readonly boundaries: readonly THREE.Line[];
}

/** Polycrystalline metal: deterministic jittered grains with boundary lines. */
export function createGrainField(
  materials: StudioMaterials,
  profile: QualityProfile,
  count = 14,
  spread = 0.09,
  seed = 7,
): GrainField {
  const group = new THREE.Group();
  group.name = 'grain-field';
  const rng = mulberry32(seed);
  const detail = profile.tier === 'low' ? 0 : 1;
  const geometry = new THREE.DodecahedronGeometry(spread * 0.42, detail);
  const material = materials.accent(0xb6bcc6);
  const boundaryMaterial = new THREE.LineBasicMaterial({ color: 0x59606b });
  const boundaries: THREE.Line[] = [];

  const points: THREE.Vector3[] = [];
  for (let i = 0; i < count; i += 1) {
    const point = new THREE.Vector3(
      (rng() - 0.5) * spread * 1.6,
      (rng() - 0.5) * spread * 1.6,
      (rng() - 0.5) * spread * 1.6,
    );
    points.push(point);
    const grain = new THREE.Mesh(geometry, material);
    grain.position.copy(point);
    grain.rotation.set(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI);
    grain.scale.setScalar(0.7 + rng() * 0.6);
    group.add(grain);
  }

  // Connect near neighbours so grain boundaries read as a network.
  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      if (points[i].distanceTo(points[j]) > spread * 0.75) continue;
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([points[i], points[j]]),
        boundaryMaterial,
      );
      group.add(line);
      boundaries.push(line);
    }
  }

  return { group, boundaries };
}

export interface Lattice {
  readonly group: THREE.Group;
  readonly atoms: readonly THREE.Mesh[];
}

/**
 * Body-centred cubic iron lattice: corner atoms plus a body centre, repeated on
 * a `cells`³ grid. Lattice constant is ~0.287 nm, drawn here in level-local
 * metres (docs/M0-design-plan.md §5.2).
 */
export function createLattice(
  materials: StudioMaterials,
  profile: QualityProfile,
  cells = 2,
  spacing = 0.058,
): Lattice {
  const group = new THREE.Group();
  group.name = 'bcc-lattice';
  const segments = radialSegments(profile, 10);
  const atomRadius = spacing * 0.16;
  const atomGeometry = new THREE.SphereGeometry(atomRadius, segments, Math.max(8, segments / 2));
  const atomMaterial = materials.accent(0x9aa4b2);
  const bondMaterial = materials.steel;
  const atoms: THREE.Mesh[] = [];

  const corner = (x: number, y: number, z: number): void => {
    const atom = new THREE.Mesh(atomGeometry, atomMaterial);
    atom.position.set(x * spacing, y * spacing, z * spacing);
    group.add(atom);
    atoms.push(atom);
  };

  for (let x = 0; x <= cells; x += 1) {
    for (let y = 0; y <= cells; y += 1) {
      for (let z = 0; z <= cells; z += 1) {
        corner(x - cells / 2, y - cells / 2, z - cells / 2);
      }
    }
  }

  // Body-centre atoms and their bonds to the eight corners.
  for (let x = 0; x < cells; x += 1) {
    for (let y = 0; y < cells; y += 1) {
      for (let z = 0; z < cells; z += 1) {
        const centre = new THREE.Vector3(
          (x + 0.5 - cells / 2) * spacing,
          (y + 0.5 - cells / 2) * spacing,
          (z + 0.5 - cells / 2) * spacing,
        );
        const atom = new THREE.Mesh(atomGeometry, atomMaterial);
        atom.position.copy(centre);
        group.add(atom);
        atoms.push(atom);

        for (const sx of [-1, 1]) {
          for (const sy of [-1, 1]) {
            for (const sz of [-1, 1]) {
              const target = centre
                .clone()
                .add(new THREE.Vector3(sx, sy, sz).multiplyScalar(spacing / 2));
              group.add(tubeBetween(centre, target, atomRadius * 0.16, bondMaterial, 6));
            }
          }
        }
      }
    }
  }

  return { group, atoms };
}

export interface IronAtom {
  readonly group: THREE.Group;
  readonly electrons: readonly THREE.Mesh[];
}

/** Schematic iron atom: nucleus, two electron shells and their electrons. */
export function createIronAtom(
  materials: StudioMaterials,
  profile: QualityProfile,
  radius = 0.05,
): IronAtom {
  const group = new THREE.Group();
  group.name = 'iron-atom';
  const segments = radialSegments(profile, 20);

  const nucleus = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 0.22, segments, Math.max(12, segments / 2)),
    materials.accent(0xd0342c),
  );
  group.add(nucleus);

  const shellMaterial = materials.accent(0x2f7cff);
  const electrons: THREE.Mesh[] = [];
  const electronGeometry = new THREE.SphereGeometry(radius * 0.05, 10, 8);
  const electronMaterial = materials.accent(PHYSICS_COLORS.highVoltage);

  const shells = [
    { radius: radius * 0.6, count: 2, tilt: 0 },
    { radius: radius * 0.9, count: 8, tilt: Math.PI / 3 },
  ];
  for (const shell of shells) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(shell.radius, radius * 0.006, 6, segments * 2),
      shellMaterial,
    );
    ring.rotation.x = Math.PI / 2 + shell.tilt;
    group.add(ring);

    for (let i = 0; i < shell.count; i += 1) {
      const angle = (i / shell.count) * Math.PI * 2;
      const electron = new THREE.Mesh(electronGeometry, electronMaterial);
      electron.userData['orbitRadius'] = shell.radius;
      electron.userData['orbitTilt'] = shell.tilt;
      electron.userData['orbitPhase'] = angle;
      group.add(electron);
      electrons.push(electron);
    }
  }

  return { group, electrons };
}

/** Small sphere markers used by Flow mode along a path. */
export function createFlowMarkers(
  materials: StudioMaterials,
  color: number,
  count: number,
  radius = 0.004,
): { group: THREE.Group; markers: THREE.Mesh[] } {
  const group = new THREE.Group();
  group.name = 'flow-markers';
  const geometry = new THREE.SphereGeometry(radius, 8, 6);
  const material = materials.accent(color);
  const markers: THREE.Mesh[] = [];
  for (let i = 0; i < count; i += 1) {
    const marker = new THREE.Mesh(geometry, material);
    group.add(marker);
    markers.push(marker);
  }
  return { group, markers };
}
