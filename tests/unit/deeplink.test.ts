import { describe, expect, it } from 'vitest';
import { parseDeepLink, serializeDeepLink } from '../../src/core/deeplink.js';

describe('deep links', () => {
  it('parses a full link', () => {
    expect(parseDeepLink('#l=engine.cylinder&p=0.42&lang=ru&mode=tour')).toEqual({
      level: 'engine.cylinder',
      progress: 0.42,
      lang: 'ru',
      mode: 'tour',
    });
  });

  it('accepts a hash without the leading #', () => {
    expect(parseDeepLink('l=car')).toEqual({ level: 'car' });
  });

  it('drops invalid values instead of throwing', () => {
    expect(parseDeepLink('#l=Engine Cylinder!!')).toEqual({});
    expect(parseDeepLink('#p=abc')).toEqual({});
    expect(parseDeepLink('#lang=de')).toEqual({});
    expect(parseDeepLink('#mode=1bad')).toEqual({});
  });

  it('clamps progress to 0…1', () => {
    expect(parseDeepLink('#p=2')?.progress).toBe(1);
    expect(parseDeepLink('#p=-3')?.progress).toBe(0);
  });

  it('round-trips through serialisation', () => {
    const state = { level: 'at.planets', progress: 0.5, lang: 'uk' as const, mode: 'explore' };
    expect(parseDeepLink(serializeDeepLink(state))).toEqual(state);
  });

  it('omits empty state', () => {
    expect(serializeDeepLink({})).toBe('');
  });
});
