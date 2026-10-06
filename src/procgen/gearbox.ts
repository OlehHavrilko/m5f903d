/**
 * ZF 8HP-family planetary gearbox data and pure driveline maths.
 * These ratios are the published 8HP family values; exact market calibration is
 * flagged as unverified in the levels that show them (docs/M0-design-plan.md §5.3).
 */

/** Gear ratios 1…8 plus reverse, as used across the ZF 8HP family. */
export const ZF8HP_RATIOS: Readonly<Record<string, number>> = {
  R: -3.317,
  '1': 4.714,
  '2': 3.143,
  '3': 2.106,
  '4': 1.667,
  '5': 1.285,
  '6': 1.0,
  '7': 0.839,
  '8': 0.667,
};

/** Number of forward gears. */
export const FORWARD_GEARS = 8;

/** Typical final-drive ratio for the F90 M5; exact value needs OEM confirmation. */
export const FINAL_DRIVE = 3.15;

/** Effective rolling radius of a 275/35 R20 rear tyre, in metres. */
export const WHEEL_RADIUS_M = 0.343;

export function gearRatio(gear: number | 'R'): number {
  const key = String(gear);
  const ratio = ZF8HP_RATIOS[key];
  if (ratio === undefined) throw new Error(`Unknown gear: ${String(gear)}`);
  return ratio;
}

/** Engine rpm for a road speed, given the whole driveline ratio. */
export function engineRpm(
  speedKph: number,
  gear: number | 'R',
  finalDrive = FINAL_DRIVE,
  wheelRadius = WHEEL_RADIUS_M,
): number {
  const wheelRpm = (speedKph / 3.6 / (2 * Math.PI * wheelRadius)) * 60;
  return Math.abs(wheelRpm * finalDrive * gearRatio(gear));
}

/** Road speed (km/h) for an engine rpm in a given gear. */
export function roadSpeed(
  rpm: number,
  gear: number | 'R',
  finalDrive = FINAL_DRIVE,
  wheelRadius = WHEEL_RADIUS_M,
): number {
  const wheelRpm = rpm / (finalDrive * Math.abs(gearRatio(gear)));
  return (wheelRpm / 60) * 2 * Math.PI * wheelRadius * 3.6;
}

/** Total ratio of one gear (gearbox × final drive). */
export function totalRatio(gear: number | 'R', finalDrive = FINAL_DRIVE): number {
  return Math.abs(gearRatio(gear)) * finalDrive;
}

/** Geometric step between consecutive gears; useful for shift-point reasoning. */
export function gearSteps(): number[] {
  const steps: number[] = [];
  for (let g = 1; g < FORWARD_GEARS; g += 1) {
    steps.push(gearRatio(g) / gearRatio(g + 1));
  }
  return steps;
}

/**
 * How many planetary gear sets and shift elements the 8HP uses. The 8HP family
 * is a four-planet-set Lepelletier layout with six shift elements; shown in
 * branch B and cross-checked in tests.
 */
export const PLANETARY_SETS = 4;
export const SHIFT_ELEMENTS = 6;
