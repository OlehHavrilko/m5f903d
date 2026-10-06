import type { Lang } from './units.js';

/** A string translated in every supported language. No user-facing text lives in scene code. */
export type LocalizedText = Record<Lang, string>;

export type BranchId = 'spine' | 'engine' | 'at' | 'susp' | 'brake' | 'drive' | 'thermal' | 'ev';

export interface LevelCamera {
  /** Diameter, in level-local metres, of the subject the camera frames. */
  readonly fovMeters: number;
  /** Camera position in level-local metres. */
  readonly from: readonly [number, number, number];
  /** Look-at target in level-local metres. */
  readonly to: readonly [number, number, number];
  /** Optional vertical field of view in degrees (default 40). */
  readonly fovDeg?: number;
}

export interface LevelFact {
  readonly text: LocalizedText;
  /** True when the number behind the claim still needs an explicit source. */
  readonly unverified?: boolean;
}

export interface LevelCallout {
  readonly label: LocalizedText;
  /** Pre-formatted value, SI-derived; must carry a unit. */
  readonly value: string;
  /** True when we only know the order of magnitude. */
  readonly unverified?: boolean;
  /** Source id from content/sources.ts. */
  readonly source?: string;
}

export interface LevelScale {
  /** Characteristic size of the subject in metres. */
  readonly unitMeters: number;
}

export interface SeamFrame {
  /** Translation of level-local origin into world space, in metres. */
  readonly position: readonly [number, number, number];
  /** Uniform scale from level-local metres to world metres. */
  readonly scale: number;
}

/** Data-driven description of one scale level (docs/M0-design-plan.md §5, §6). */
export interface LevelSpec {
  readonly id: string;
  readonly branch: BranchId;
  readonly order: number;
  readonly title: LocalizedText;
  readonly subtitle?: LocalizedText;
  readonly scale: LevelScale;
  readonly camera: LevelCamera;
  readonly subject: LocalizedText;
  readonly geometry: LocalizedText;
  readonly animation?: LocalizedText;
  readonly facts: readonly LevelFact[];
  readonly callouts: readonly LevelCallout[];
  /** Mandatory: feeds the "How accurate is this?" panel. */
  readonly simplified: readonly LocalizedText[];
  /** Source ids; must be non-empty. */
  readonly sources: readonly string[];
  /** Placement of the level content in world space; default is identity. */
  readonly frame?: SeamFrame;
}

export interface LevelValidationIssue {
  readonly levelId: string;
  readonly message: string;
}

const ID_PATTERN = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const LANGS: readonly Lang[] = ['en', 'ru', 'uk'];

function localizedComplete(text: LocalizedText): boolean {
  return LANGS.every((lang) => typeof text[lang] === 'string' && text[lang].trim().length > 0);
}

function cameraFinite(camera: LevelCamera): boolean {
  const nums = [camera.fovMeters, ...camera.from, ...camera.to, camera.fovDeg ?? 40];
  return nums.every((n) => Number.isFinite(n));
}

/** Validates one level spec and returns all problems (empty = valid). */
export function validateLevel(spec: LevelSpec): LevelValidationIssue[] {
  const at = spec.id || '<missing-id>';
  const issues: LevelValidationIssue[] = [];
  const add = (message: string) => issues.push({ levelId: at, message });

  if (!spec.id || !ID_PATTERN.test(spec.id)) add(`invalid id: ${JSON.stringify(spec.id)}`);
  if (!localizedComplete(spec.title)) add('title must be set in en/ru/uk');
  if (!localizedComplete(spec.subject)) add('subject must be set in en/ru/uk');
  if (!localizedComplete(spec.geometry)) add('geometry must be set in en/ru/uk');
  if (!Number.isFinite(spec.scale.unitMeters) || spec.scale.unitMeters <= 0) {
    add('scale.unitMeters must be a positive number');
  }
  if (!cameraFinite(spec.camera)) add('camera must contain finite numbers');
  if (spec.camera.fovMeters <= 0) add('camera.fovMeters must be positive');
  if (spec.simplified.length === 0) add('simplified is mandatory and must not be empty');
  for (const item of spec.simplified) {
    if (!localizedComplete(item)) add('every simplified entry must be set in en/ru/uk');
  }
  if (spec.sources.length === 0) add('sources is mandatory and must not be empty');
  for (const fact of spec.facts) {
    if (!localizedComplete(fact.text)) add('every fact must be set in en/ru/uk');
  }
  for (const callout of spec.callouts) {
    if (!localizedComplete(callout.label)) add('every callout label must be set in en/ru/uk');
    if (callout.value.trim().length === 0) add('every callout needs a value');
  }
  return issues;
}

/** Ordered, validated collection of levels with deep-link lookup. */
export class LevelRegistry {
  readonly #levels: readonly LevelSpec[];
  readonly #byId: ReadonlyMap<string, LevelSpec>;

  constructor(levels: readonly LevelSpec[]) {
    const issues: LevelValidationIssue[] = [];
    const byId = new Map<string, LevelSpec>();
    for (const level of levels) {
      issues.push(...validateLevel(level));
      if (byId.has(level.id)) {
        issues.push({ levelId: level.id, message: 'duplicate level id' });
      }
      byId.set(level.id, level);
    }
    if (issues.length > 0) {
      const summary = issues.map((i) => `  - ${i.levelId}: ${i.message}`).join('\n');
      throw new Error(`Invalid level registry:\n${summary}`);
    }
    this.#levels = [...levels].sort((a, b) => a.order - b.order);
    this.#byId = byId;
  }

  get all(): readonly LevelSpec[] {
    return this.#levels;
  }

  get(id: string): LevelSpec | undefined {
    return this.#byId.get(id);
  }

  has(id: string): boolean {
    return this.#byId.has(id);
  }

  /** Resolves an unknown id to the best existing level (id → branch prefix → first). */
  resolve(id: string | undefined): LevelSpec {
    if (id && this.#byId.has(id)) return this.#byId.get(id)!;
    if (id) {
      const prefix = id.split('.')[0];
      const match = this.#levels.find((l) => l.branch === prefix);
      if (match) return match;
    }
    return this.#levels[0]!;
  }

  /** Levels belonging to one branch, in playback order. */
  branch(branch: BranchId): readonly LevelSpec[] {
    return this.#levels.filter((l) => l.branch === branch);
  }

  /** The level before/after `id` on the spine, if any. */
  neighbour(id: string, direction: 1 | -1): LevelSpec | undefined {
    const index = this.#levels.findIndex((l) => l.id === id);
    if (index < 0) return undefined;
    return this.#levels[index + direction];
  }
}
