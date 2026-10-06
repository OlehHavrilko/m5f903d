import { describe, expect, it } from 'vitest';
import {
  formatLength,
  fromUnit,
  lengthSymbol,
  pickLengthUnit,
  toUnit,
} from '../../src/core/units.js';

describe('length units', () => {
  it('picks a human unit for a range of metres', () => {
    expect(pickLengthUnit(5000).symbol.en).toBe('km');
    expect(pickLengthUnit(5).symbol.en).toBe('m');
    expect(pickLengthUnit(0.12).symbol.en).toBe('cm');
    expect(pickLengthUnit(0.005).symbol.en).toBe('mm');
    expect(pickLengthUnit(0.0005).symbol.en).toBe('µm');
    expect(pickLengthUnit(5e-6).symbol.en).toBe('µm');
    expect(pickLengthUnit(2.5e-10).symbol.en).toBe('nm');
  });

  it('round-trips through a unit', () => {
    const unit = pickLengthUnit(0.12);
    expect(fromUnit(toUnit(0.12, unit), unit)).toBeCloseTo(0.12, 12);
  });

  it('formats with a non-breaking space and the language symbol', () => {
    expect(formatLength(0.12, 'ru')).toBe('12,0\u00a0см');
    expect(formatLength(0.12, 'en')).toBe('12.0\u00a0cm');
    expect(lengthSymbol(2.5e-10, 'uk')).toBe('нм');
  });

  it('formats zero without throwing', () => {
    expect(formatLength(0, 'en')).toContain('0');
  });
});
