import { describe, expect, it } from 'vitest';
import { LevelRegistry } from '../../src/core/level-registry.js';
import type { ViewMode } from '../../src/core/modes.js';
import { ALL_LEVELS } from '../../src/content/levels/index.js';
import { SPINE_LEVELS } from '../../src/content/levels/spine.js';
import { getSource } from '../../src/content/sources.js';

const registry = new LevelRegistry(ALL_LEVELS);

describe('level registry', () => {
  it('accepts the shipped spine levels', () => {
    expect(registry.all.length).toBeGreaterThanOrEqual(2);
    expect(registry.all[0]!.id).toBe('studio');
  });

  it('gives every level a title, subject and source in all languages', () => {
    for (const level of registry.all) {
      for (const lang of ['en', 'ru', 'uk'] as const) {
        expect(level.title[lang].length).toBeGreaterThan(0);
        expect(level.subject[lang].length).toBeGreaterThan(0);
        expect(level.simplified.length).toBeGreaterThan(0);
      }
      for (const id of level.sources) expect(getSource(id)).toBeDefined();
    }
  });

  it('resolves exact, prefix and unknown ids', () => {
    expect(registry.resolve('car').id).toBe('car');
    expect(registry.resolve('nope').id).toBe('studio');
  });

  it('walks neighbours along the spine', () => {
    expect(registry.neighbour('studio', 1)?.id).toBe('car');
    expect(registry.neighbour('studio', -1)).toBeUndefined();
  });

  it('keeps the spine contiguous and each branch contiguous', () => {
    const ids = registry.all.map((level) => level.id);
    expect(ids.slice(0, 4)).toEqual(['studio', 'car', 'body', 'chassis-hub']);
    expect(registry.neighbour('chassis-hub', 1)?.id).toBe('engine.unit');
    expect(registry.neighbour('engine.unit', 1)?.id).toBe('engine.longblock');
    expect(registry.neighbour('engine.atom', 1)?.id).toBe('at.unit');
  });

  it('marks exactly one hub level and publishes per-level modes', () => {
    expect(registry.all.filter((level) => level.hub).map((level) => level.id)).toEqual([
      'chassis-hub',
    ]);
    expect(registry.get('body')?.modes).toContain('explode');
    expect(registry.get('chassis-hub')?.modes).toContain('flow');
  });

  it('rejects unknown or duplicate view modes', () => {
    const base = SPINE_LEVELS[0]!;
    expect(
      () => new LevelRegistry([{ ...base, modes: ['nope'] as unknown as ViewMode[] }]),
    ).toThrow(/unknown view mode/);
    expect(() => new LevelRegistry([{ ...base, modes: ['tour', 'tour'] }])).toThrow(
      /duplicate view mode/,
    );
  });

  it('rejects malformed specs', () => {
    expect(
      () =>
        new LevelRegistry([
          {
            ...SPINE_LEVELS[0]!,
            id: 'Bad Id',
            sources: [],
            simplified: [],
          },
        ]),
    ).toThrow(/invalid id/);
  });
});
