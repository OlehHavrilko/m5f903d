/**
 * Unit handling. All numbers in the codebase are SI (metres, seconds, kg, N·m).
 * Human-readable strings (м → мм → мкм → нм) are produced only at the UI edge.
 * See docs/M0-design-plan.md §7: "Перевод м→мм→мкм→нм делать явной функцией."
 */

export type Lang = 'en' | 'ru' | 'uk';

export interface LengthUnit {
  /** Scale relative to one metre. */
  readonly scale: number;
  /** Symbol per language. */
  readonly symbol: Record<Lang, string>;
  /** Number of decimals to keep when this unit is chosen. */
  readonly decimals: number;
}

/** Ordered from largest to smallest; used to pick a human-readable unit. */
export const LENGTH_UNITS: readonly LengthUnit[] = [
  { scale: 1e3, symbol: { en: 'km', ru: 'км', uk: 'км' }, decimals: 2 },
  { scale: 1, symbol: { en: 'm', ru: 'м', uk: 'м' }, decimals: 2 },
  { scale: 1e-2, symbol: { en: 'cm', ru: 'см', uk: 'см' }, decimals: 1 },
  { scale: 1e-3, symbol: { en: 'mm', ru: 'мм', uk: 'мм' }, decimals: 1 },
  { scale: 1e-6, symbol: { en: 'µm', ru: 'мкм', uk: 'мкм' }, decimals: 1 },
  { scale: 1e-9, symbol: { en: 'nm', ru: 'нм', uk: 'нм' }, decimals: 2 },
];

/** Metres → the unit that yields a mantissa in [1, 1000). */
export function pickLengthUnit(meters: number): LengthUnit {
  const abs = Math.abs(meters);
  for (const unit of LENGTH_UNITS) {
    if (abs >= unit.scale) return unit;
  }
  return LENGTH_UNITS[LENGTH_UNITS.length - 1]!;
}

/** Convert a length in metres to a numeric value in `unit`. */
export function toUnit(meters: number, unit: LengthUnit): number {
  return meters / unit.scale;
}

/** Convert a numeric value expressed in `unit` back to metres. */
export function fromUnit(value: number, unit: LengthUnit): number {
  return value * unit.scale;
}

const LOCALES: Record<Lang, string> = {
  en: 'en-US',
  ru: 'ru-RU',
  uk: 'uk-UA',
};

/** Symbol only, e.g. "мкм". */
export function lengthSymbol(meters: number, lang: Lang): string {
  return pickLengthUnit(meters).symbol[lang];
}

/**
 * Human-readable length, e.g. 0.12 → "12,0 см" (ru) / "12.0 cm" (en).
 * Uses a non-breaking space so the number and unit never wrap apart.
 */
export function formatLength(meters: number, lang: Lang): string {
  if (meters === 0) return `0 ${LENGTH_UNITS[1]!.symbol[lang]}`;
  const unit = pickLengthUnit(meters);
  const value = toUnit(meters, unit);
  const text = new Intl.NumberFormat(LOCALES[lang], {
    minimumFractionDigits: unit.decimals,
    maximumFractionDigits: unit.decimals,
  }).format(value);
  return `${text}\u00a0${unit.symbol[lang]}`;
}

/** "12 см" as a scale label for a level (see LevelSpec.scale). */
export function formatScaleLabel(meters: number, lang: Lang): string {
  return formatLength(meters, lang);
}

export interface Physical {
  readonly value: number;
  readonly unit: string;
  /** False when the value still needs an explicit source. */
  readonly verified?: boolean;
}

export function formatPhysical(p: Physical, lang: Lang): string {
  const n = new Intl.NumberFormat(LOCALES[lang], { maximumFractionDigits: 3 }).format(p.value);
  return `${n}\u00a0${p.unit}`;
}
