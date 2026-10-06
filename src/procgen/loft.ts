import * as THREE from 'three';

/**
 * Lofting primitive: sweeps a rounded-rectangle cross-section along X.
 * Every body panel and, later, castings and housings are generated this way —
 * no imported meshes exist anywhere in the project.
 */
export interface LoftSection {
  /** Position along the sweep axis (metres). */
  readonly x: number;
  /** Bottom of the cross-section (metres, above ground). */
  readonly y0: number;
  /** Top of the cross-section (metres, above ground). */
  readonly y1: number;
  /** Half width of the cross-section (metres). */
  readonly halfWidth: number;
  /** 0 = sharp rectangle, 1 = fully rounded (capsule-like). */
  readonly roundness?: number;
  /** Vertical centre offset, defaults to the section midpoint. */
  readonly yCenter?: number;
}

/** Closed outline of a rounded rectangle as [z, y] pairs. */
export function roundedRectPoints(
  halfWidth: number,
  halfHeight: number,
  radius: number,
  count: number,
): Array<[number, number]> {
  const r = Math.max(0, Math.min(radius, halfWidth, halfHeight));
  const w = halfWidth - r;
  const h = halfHeight - r;
  const perCorner = Math.max(1, Math.floor(count / 4));
  const points: Array<[number, number]> = [];

  // Corner centres, counter-clockwise starting bottom-right.
  const corners: Array<[number, number, number]> = [
    [w, -h, -Math.PI / 2],
    [w, h, 0],
    [-w, h, Math.PI / 2],
    [-w, -h, Math.PI],
  ];
  for (const [cz, cy, start] of corners) {
    for (let i = 0; i < perCorner; i += 1) {
      const angle = start + (i / perCorner) * (Math.PI / 2);
      points.push([cz + r * Math.cos(angle), cy + r * Math.sin(angle)]);
    }
  }
  return points;
}

function sectionPoints(section: LoftSection, radialSegments: number): Array<[number, number]> {
  const yc = section.yCenter ?? (section.y0 + section.y1) / 2;
  const halfHeight = Math.max(1e-4, (section.y1 - section.y0) / 2);
  const roundness = section.roundness ?? 0.6;
  const radius = Math.min(section.halfWidth, halfHeight) * roundness;
  return roundedRectPoints(section.halfWidth, halfHeight, radius, radialSegments).map(
    ([z, y]) => [z, yc + y] as [number, number],
  );
}

/** Builds a closed lofted mesh from ordered sections along +X. */
export function loftGeometry(
  sections: readonly LoftSection[],
  radialSegments = 24,
): THREE.BufferGeometry {
  if (sections.length < 2) throw new Error('loftGeometry needs at least two sections');
  const ring = radialSegments;
  const rings = sections.map((section) => sectionPoints(section, ring));
  const positions: number[] = [];
  const indices: number[] = [];

  for (let s = 0; s < sections.length; s += 1) {
    const section = sections[s]!;
    const points = rings[s]!;
    for (const [z, y] of points) positions.push(section.x, y, z);
  }

  for (let s = 0; s < sections.length - 1; s += 1) {
    for (let j = 0; j < ring; j += 1) {
      const a = s * ring + j;
      const b = s * ring + ((j + 1) % ring);
      const c = (s + 1) * ring + ((j + 1) % ring);
      const d = (s + 1) * ring + j;
      // Wound so the normals face outwards.
      indices.push(a, b, c, a, c, d);
    }
  }

  // Flat caps at both ends.
  const capSection = (index: number, reverse: boolean) => {
    const section = sections[index]!;
    const centreIndex = positions.length / 3;
    positions.push(section.x, (section.y0 + section.y1) / 2, 0);
    const base = index * ring;
    for (let j = 0; j < ring; j += 1) {
      const a = base + j;
      const b = base + ((j + 1) % ring);
      if (reverse) indices.push(centreIndex, b, a);
      else indices.push(centreIndex, a, b);
    }
  };
  capSection(0, true);
  capSection(sections.length - 1, false);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}
