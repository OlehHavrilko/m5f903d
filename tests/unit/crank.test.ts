import { describe, expect, it } from 'vitest';
import {
  S63_FIRING_ORDER,
  bankOf,
  firingAngles,
  isEvenFiringOrder,
  pistonDisplacement,
  pistonDisplacementNormalized,
  pistonSpeed,
} from '../../src/procgen/crank.js';

const GEOMETRY = { stroke: 0.0883, rodLength: 0.143 };

describe('crank-slider kinematics', () => {
  it('sits at TDC at 0° and at BDC at 180°', () => {
    expect(pistonDisplacement(0, GEOMETRY)).toBeCloseTo(0, 12);
    expect(pistonDisplacement(180, GEOMETRY)).toBeCloseTo(GEOMETRY.stroke, 12);
    expect(pistonDisplacement(360, GEOMETRY)).toBeCloseTo(0, 12);
  });

  it('increases monotonically through the down stroke', () => {
    let previous = -1;
    for (let angle = 0; angle <= 180; angle += 10) {
      const value = pistonDisplacement(angle, GEOMETRY);
      expect(value).toBeGreaterThanOrEqual(previous);
      previous = value;
    }
  });

  it('stays normalised inside [0, 1]', () => {
    for (let angle = 0; angle <= 720; angle += 7) {
      const value = pistonDisplacementNormalized(angle, GEOMETRY);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1.0000001);
    }
  });

  it('has zero piston speed at both dead centres', () => {
    expect(pistonSpeed(0, GEOMETRY, 6000)).toBeCloseTo(0, 10);
    expect(pistonSpeed(180, GEOMETRY, 6000)).toBeCloseTo(0, 10);
  });

  it('reaches a plausible mean piston speed at 6000 rpm', () => {
    // Mean piston speed = 2 · stroke · rpm / 60.
    const mean = (2 * GEOMETRY.stroke * 6000) / 60;
    expect(mean).toBeGreaterThan(17);
    expect(mean).toBeLessThan(19);
  });
});

describe('V8 firing order', () => {
  it('uses the S63 cross-plane order', () => {
    expect(S63_FIRING_ORDER).toEqual([1, 5, 4, 8, 6, 3, 7, 2]);
  });

  it('spaces power strokes every 90° of crank rotation', () => {
    expect(isEvenFiringOrder(S63_FIRING_ORDER)).toBe(true);
    const angles = firingAngles(S63_FIRING_ORDER);
    expect(angles.get(1)).toBe(0);
    expect(angles.get(5)).toBe(90);
    expect(angles.get(2)).toBe(630);
  });

  it('rejects an order that repeats or misses a cylinder', () => {
    expect(isEvenFiringOrder([1, 1, 2, 3, 4, 5, 6, 7])).toBe(false);
    expect(isEvenFiringOrder([1, 2, 3, 4, 5, 6, 7, 9])).toBe(false);
  });

  it('splits cylinders into two banks of four', () => {
    expect(bankOf(1)).toBe('A');
    expect(bankOf(4)).toBe('A');
    expect(bankOf(5)).toBe('B');
    expect(bankOf(8)).toBe('B');
  });
});
