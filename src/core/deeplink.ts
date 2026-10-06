import type { Lang } from './units.js';

/**
 * Deep-link shape: `#l=<levelId>&p=<0..1>&lang=<en|ru|uk>&mode=<name>`.
 * Unknown keys are ignored; invalid values are dropped rather than throwing so a
 * hand-edited URL never breaks the app. See docs/M0-design-plan.md §4.4.
 */
export interface DeepLinkState {
  level?: string;
  progress?: number;
  lang?: Lang;
  mode?: string;
}

const LANGS: readonly Lang[] = ['en', 'ru', 'uk'];
const ID_PATTERN = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const MODE_PATTERN = /^[a-z][a-z0-9-]*$/;

function isLang(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value);
}

/** Parses a location hash (with or without the leading `#`). Never throws. */
export function parseDeepLink(hash: string): DeepLinkState {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  if (raw.length === 0) return {};
  const out: DeepLinkState = {};
  const params = new URLSearchParams(raw);
  const level = params.get('l');
  if (level && ID_PATTERN.test(level)) out.level = level;
  const progress = params.get('p');
  if (progress !== null && progress.trim() !== '') {
    const parsed = Number(progress);
    if (Number.isFinite(parsed)) out.progress = Math.min(1, Math.max(0, parsed));
  }
  const lang = params.get('lang');
  if (lang && isLang(lang)) out.lang = lang;
  const mode = params.get('mode');
  if (mode && MODE_PATTERN.test(mode)) out.mode = mode;
  return out;
}

/** Serialises state into a canonical hash. Omits defaults to keep links short. */
export function serializeDeepLink(state: DeepLinkState): string {
  const params = new URLSearchParams();
  if (state.level) params.set('l', state.level);
  if (typeof state.progress === 'number' && Number.isFinite(state.progress)) {
    const clamped = Math.min(1, Math.max(0, state.progress));
    params.set('p', clamped.toFixed(3));
  }
  if (state.lang) params.set('lang', state.lang);
  if (state.mode) params.set('mode', state.mode);
  const query = params.toString();
  return query.length > 0 ? `#${query}` : '';
}
