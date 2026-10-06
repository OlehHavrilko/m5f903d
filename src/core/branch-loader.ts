import type { LevelBuilder } from './level-content.js';
import type { BranchId } from './level-registry.js';

/**
 * Dynamic branch loading. Level *data* for every branch lives in the main
 * bundle, but a branch's geometry builders are only fetched when the branch is
 * first opened, so a visitor who never leaves the spine never downloads them
 * (docs/M0-design-plan.md §6.1, §11).
 */
export interface BranchModule {
  readonly builders: Readonly<Record<string, LevelBuilder>>;
}

type Loader = () => Promise<BranchModule>;

const LOADERS: Partial<Record<BranchId, Loader>> = {
  engine: () => import('../branches/engine/index.js'),
  at: () => import('../branches/at/index.js'),
  susp: () => import('../branches/susp/index.js'),
  brake: () => import('../branches/brake/index.js'),
};

export function hasBranchModule(id: BranchId): boolean {
  return id in LOADERS;
}

/** Loads and flattens a branch module's builders; `{}` for branches without one. */
export async function loadBranchBuilders(id: BranchId): Promise<Record<string, LevelBuilder>> {
  const loader = LOADERS[id];
  if (!loader) return {};
  const module = await loader();
  return { ...module.builders };
}
