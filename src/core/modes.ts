/**
 * View modes live in `core` so both level content and the HUD can depend on them
 * without the scene layer importing UI code. A level advertises the modes it
 * supports; the HUD enables exactly those and disables the rest
 * (docs/M0-design-plan.md §10).
 */
export type ViewMode =
  'tour' | 'explore' | 'cutaway' | 'explode' | 'flow' | 'slowmo' | 'compare' | 'dyno';

export const VIEW_MODES: readonly ViewMode[] = [
  'tour',
  'explore',
  'cutaway',
  'explode',
  'flow',
  'slowmo',
  'compare',
  'dyno',
];

/** Modes every level can do, so a level only lists what it adds. */
export const DEFAULT_LEVEL_MODES: readonly ViewMode[] = ['tour', 'explore'];

/** Studio backdrop presets (docs/M0-design-plan.md §9). */
export type BackgroundMode = 'white' | 'gray' | 'black';

const MODE_SET: ReadonlySet<string> = new Set(VIEW_MODES);

export function isViewMode(value: unknown): value is ViewMode {
  return typeof value === 'string' && MODE_SET.has(value);
}

/** Resolves the effective mode list for a level, defaulting to tour/explore. */
export function levelModes(modes: readonly ViewMode[] | undefined): readonly ViewMode[] {
  return modes && modes.length > 0 ? modes : DEFAULT_LEVEL_MODES;
}
