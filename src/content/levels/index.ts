import type { LevelSpec } from '../../core/level-registry.js';
import { AT_LEVELS } from './at.js';
import { BRAKE_LEVELS } from './brake.js';
import { ENGINE_LEVELS } from './engine.js';
import { SPINE_LEVELS } from './spine.js';
import { SUSP_LEVELS } from './susp.js';

/**
 * Every level the app knows about. Level *data* is tiny and stays in the main
 * bundle so deep links and the branch menu resolve instantly; only a branch's
 * *geometry builders* are loaded on demand (`core/branch-loader.ts`).
 */
export const ALL_LEVELS: readonly LevelSpec[] = [
  ...SPINE_LEVELS,
  ...ENGINE_LEVELS,
  ...AT_LEVELS,
  ...SUSP_LEVELS,
  ...BRAKE_LEVELS,
];

export { SPINE_LEVELS } from './spine.js';
