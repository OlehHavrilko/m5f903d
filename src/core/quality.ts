/**
 * Quality tiers: low (phone) / mid / high (desktop), autodetected and manually
 * overridable. Everything that costs GPU time reads its budget from here
 * (docs/M0-design-plan.md §6.1).
 */
export type QualityTier = 'low' | 'mid' | 'high';

export interface QualityProfile {
  readonly tier: QualityTier;
  /** Upper bound for the device pixel ratio. */
  readonly maxPixelRatio: number;
  readonly antialias: boolean;
  readonly shadowMapSize: number;
  readonly maxDrawCalls: number;
  /** Multiplier applied to particle/tube counts. */
  readonly particleScale: number;
  /** Radial segments for procedural cylinders. */
  readonly segments: number;
  /** Contact-shadow resolution. */
  readonly contactShadowSize: number;
}

export interface DeviceHints {
  readonly hardwareConcurrency?: number;
  readonly deviceMemory?: number;
  readonly coarsePointer?: boolean;
  readonly reducedMotion?: boolean;
}

export function detectQualityTier(hints: DeviceHints = {}): QualityTier {
  const cores = hints.hardwareConcurrency ?? 8;
  const memory = hints.deviceMemory ?? 8;
  const coarse = hints.coarsePointer ?? false;

  if (cores <= 4 || memory <= 3) return 'low';
  if (coarse || cores <= 6 || memory <= 6) return 'mid';
  return 'high';
}

export function qualityProfile(tier: QualityTier): QualityProfile {
  switch (tier) {
    case 'low':
      return {
        tier,
        maxPixelRatio: 1.25,
        antialias: false,
        shadowMapSize: 512,
        maxDrawCalls: 120,
        particleScale: 0.35,
        segments: 16,
        contactShadowSize: 256,
      };
    case 'mid':
      return {
        tier,
        maxPixelRatio: 1.75,
        antialias: true,
        shadowMapSize: 1024,
        maxDrawCalls: 200,
        particleScale: 0.7,
        segments: 24,
        contactShadowSize: 512,
      };
    case 'high':
      return {
        tier,
        maxPixelRatio: 2,
        antialias: true,
        shadowMapSize: 2048,
        maxDrawCalls: 300,
        particleScale: 1,
        segments: 32,
        contactShadowSize: 1024,
      };
  }
}

/** Reads the browser environment; kept separate so tests can pass plain hints. */
export function readDeviceHints(): DeviceHints {
  const nav = globalThis.navigator as Navigator & { deviceMemory?: number };
  const coarse = globalThis.matchMedia?.('(pointer: coarse)').matches ?? false;
  const reducedMotion =
    globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  return {
    hardwareConcurrency: nav?.hardwareConcurrency,
    deviceMemory: nav?.deviceMemory,
    coarsePointer: coarse,
    reducedMotion,
  };
}
