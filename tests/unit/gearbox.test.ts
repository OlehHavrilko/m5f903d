import { describe, expect, it } from 'vitest';
import {
  FORWARD_GEARS,
  PLANETARY_SETS,
  SHIFT_ELEMENTS,
  ZF8HP_RATIOS,
  engineRpm,
  gearRatio,
  gearSteps,
  roadSpeed,
  totalRatio,
} from '../../src/procgen/gearbox.js';

describe('ZF 8HP gearbox', () => {
  it('has eight forward gears plus reverse', () => {
    expect(FORWARD_GEARS).toBe(8);
    for (let gear = 1; gear <= 8; gear += 1) expect(gearRatio(gear)).toBeGreaterThan(0);
    expect(gearRatio('R')).toBeLessThan(0);
  });

  it('rejects an unknown gear', () => {
    expect(() => gearRatio(9)).toThrow();
  });

  it('has strictly decreasing forward ratios', () => {
    for (let gear = 1; gear < 8; gear += 1) {
      expect(gearRatio(gear)).toBeGreaterThan(gearRatio(gear + 1));
    }
    for (const step of gearSteps()) expect(step).toBeGreaterThan(1);
  });

  it('round-trips rpm and road speed', () => {
    const rpm = engineRpm(100, 8);
    expect(rpm).toBeGreaterThan(1200);
    expect(rpm).toBeLessThan(2200);
    expect(roadSpeed(rpm, 8)).toBeCloseTo(100, 6);
  });

  it('uses a plausible top-gear total ratio', () => {
    expect(totalRatio(8)).toBeCloseTo(ZF8HP_RATIOS['8']! * 3.15, 6);
  });

  it('documents the four-planet-set, six-element layout', () => {
    expect(PLANETARY_SETS).toBe(4);
    expect(SHIFT_ELEMENTS).toBe(6);
  });
});
