import { describe, expect, it } from 'vitest';
import { LevelRegistry } from '../../src/core/level-registry.js';
import { SPINE_LEVELS } from '../../src/content/levels/spine.js';
import { getSource } from '../../src/content/sources.js';

const registry = new LevelRegistry(SPINE_LEVELS);

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
