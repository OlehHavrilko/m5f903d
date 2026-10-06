import { describe, expect, it } from 'vitest';
import { PRESETS, Timeline, getPreset, smoothstep } from '../../src/core/timeline.js';

describe('deterministic timeline', () => {
  it('samples the same state for the same time and seed', () => {
    const preset = getPreset('launch');
    const a = preset.sample(1.234, 7);
    const b = preset.sample(1.234, 7);
    expect(a).toEqual(b);
  });

  it('keeps crank angle inside one 720° cycle', () => {
    for (const preset of PRESETS) {
      for (const t of [0, 0.5, 1, 2.5, 5, 12]) {
        const state = preset.sample(t, 3);
        expect(state.crankAngle).toBeGreaterThanOrEqual(0);
        expect(state.crankAngle).toBeLessThan(720);
      }
    }
  });

  it('produces identical playback for identical inputs', () => {
    const a = new Timeline('dyno-pull', 42);
    const b = new Timeline('dyno-pull', 42);
    for (let i = 0; i < 120; i += 1) {
      a.step(1, 1 / 60);
      b.step(1, 1 / 60);
    }
    expect(a.sample()).toEqual(b.sample());
    expect(a.time).toBeCloseTo(b.time, 12);
  });

  it('pause holds time and play resumes it', () => {
    const timeline = new Timeline('idle', 1);
    timeline.pause();
    timeline.update(1);
    expect(timeline.time).toBe(0);
    timeline.play();
    timeline.update(1);
    expect(timeline.time).toBeCloseTo(1, 12);
  });

  it('clamps playback rate to a sane range', () => {
    const timeline = new Timeline('idle', 1);
    timeline.setRate(100);
    expect(timeline.rate).toBeLessThanOrEqual(4);
    timeline.setRate(0);
    expect(timeline.rate).toBeGreaterThanOrEqual(0.05);
  });

  it('has a smoothstep that is 0, 0.5 and 1 at its edges', () => {
    expect(smoothstep(0, 1, -1)).toBe(0);
    expect(smoothstep(0, 1, 0.5)).toBeCloseTo(0.5, 12);
    expect(smoothstep(0, 1, 2)).toBe(1);
  });
});
