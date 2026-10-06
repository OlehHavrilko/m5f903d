import { describe, expect, it } from 'vitest';
import {
  easeInOutCubic,
  framingDistance,
  interpolatePose,
  poseForLevel,
  seamBands,
} from '../../src/core/seam.js';

describe('camera framing', () => {
  it('grows with subject size and shrinks with a wider FOV', () => {
    const wide = framingDistance(5, 40, 1.6);
    const narrow = framingDistance(5, 20, 1.6);
    expect(narrow).toBeGreaterThan(wide);
    expect(framingDistance(10, 40, 1.6)).toBeCloseTo(wide * 2, 6);
  });

  it('backs off on portrait screens so the subject still fits', () => {
    const landscape = framingDistance(5, 38, 1.6);
    const portrait = framingDistance(5, 38, 0.5);
    expect(portrait).toBeGreaterThan(landscape);
  });

  it('places the camera exactly at the framing distance from the target', () => {
    const pose = poseForLevel({ fovMeters: 5, from: [3, 2, 4], to: [0, 1, 0] }, 1.6);
    const distance = pose.position.distanceTo(pose.target);
    expect(distance).toBeCloseTo(framingDistance(5, 38, 1.6), 6);
  });
});

describe('seam interpolation', () => {
  it('eases from 0 to 1', () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(1)).toBe(1);
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5, 12);
  });

  it('cross-fades monotonically', () => {
    const bands = [0, 0.25, 0.5, 0.75, 1].map(seamBands);
    expect(bands[0]!.from).toBeCloseTo(1, 12);
    expect(bands[0]!.to).toBeCloseTo(0, 12);
    expect(bands[4]!.from).toBeCloseTo(0, 12);
    expect(bands[4]!.to).toBeCloseTo(1, 12);
    for (let i = 1; i < bands.length; i += 1) {
      expect(bands[i]!.from).toBeLessThanOrEqual(bands[i - 1]!.from);
      expect(bands[i]!.to).toBeGreaterThanOrEqual(bands[i - 1]!.to);
    }
  });

  it('interpolates position, target and fov', () => {
    const a = poseForLevel({ fovMeters: 10, from: [3, 2, 4], to: [0, 0, 0] }, 1.6);
    const b = poseForLevel({ fovMeters: 1, from: [3, 2, 4], to: [1, 1, 0] }, 1.6);
    const mid = interpolatePose(a, b, 0.5);
    expect(mid.target.x).toBeCloseTo(0.5, 6);
    expect(mid.fovMeters).toBeCloseTo(5.5, 6);
    expect(Number.isFinite(mid.position.x)).toBe(true);
  });
});
