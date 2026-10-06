/**
 * Crank-slider kinematics, pure and GPU-free.
 * Used by the engine branch and covered by unit tests (docs/M0-design-plan.md §6.2).
 */

export interface CrankGeometry {
  /** Full piston stroke in metres (S63B44T4: 88.3 mm). */
  readonly stroke: number;
  /** Connecting-rod centre-to-centre length in metres. */
  readonly rodLength: number;
}

export const DEG = Math.PI / 180;

/**
 * Piston displacement from top dead centre, in metres.
 * s(θ) = r(1 − cosθ) + L(1 − √(1 − (r/L)² sin²θ))
 * At θ=0 it is 0 (TDC); at θ=180° it is the full stroke (BDC).
 */
export function pistonDisplacement(angleDeg: number, geometry: CrankGeometry): number {
  const r = geometry.stroke / 2;
  const l = geometry.rodLength;
  const theta = angleDeg * DEG;
  const ratio = r / l;
  const sin = Math.sin(theta);
  return r * (1 - Math.cos(theta)) + l * (1 - Math.sqrt(1 - ratio * ratio * sin * sin));
}

/** Piston displacement normalised to 0…1 across the stroke. */
export function pistonDisplacementNormalized(angleDeg: number, geometry: CrankGeometry): number {
  return pistonDisplacement(angleDeg, geometry) / geometry.stroke;
}

/**
 * Piston speed along the bore, in m/s, for a crank turning at `rpm`.
 * v(θ) = −r·ω·[ sinθ + (r/(2L))·sin2θ / √(1 − (r/L)²sin²θ) ] approximated to
 * the standard first-order form below.
 */
export function pistonSpeed(angleDeg: number, geometry: CrankGeometry, rpm: number): number {
  const r = geometry.stroke / 2;
  const l = geometry.rodLength;
  const omega = (rpm / 60) * 2 * Math.PI;
  const theta = angleDeg * DEG;
  return -r * omega * (Math.sin(theta) + (r / (2 * l)) * Math.sin(2 * theta));
}

/** Standard V8 cross-plane firing order for the S63B44T4. */
export const S63_FIRING_ORDER: readonly number[] = [1, 5, 4, 8, 6, 3, 7, 2];

/**
 * Crank angle (0…720°) at which each cylinder starts its power stroke.
 * A cross-plane V8 fires every 90° of crank rotation.
 */
export function firingAngles(order: readonly number[] = S63_FIRING_ORDER): Map<number, number> {
  const interval = 720 / order.length;
  const map = new Map<number, number>();
  order.forEach((cylinder, index) => {
    map.set(cylinder, (index * interval) % 720);
  });
  return map;
}

/** Cylinders per bank for a 90° V8: 1–4 bank A, 5–8 bank B (BMW convention). */
export function bankOf(cylinder: number): 'A' | 'B' {
  return cylinder <= 4 ? 'A' : 'B';
}

/** Bank angle between the two cylinder rows, in degrees. */
export const V8_BANK_ANGLE_DEG = 90;

/** Even spacing check: a valid firing order spreads all cylinders across 720°. */
export function isEvenFiringOrder(order: readonly number[]): boolean {
  const expected = new Set(Array.from({ length: order.length }, (_, i) => i + 1));
  if (order.length !== 8 || new Set(order).size !== 8) return false;
  for (const c of order) if (!expected.has(c)) return false;
  const map = firingAngles(order);
  const sorted = [...map.values()].sort((a, b) => a - b);
  return sorted.every((angle, i) => Math.abs(angle - i * 90) < 1e-9);
}
