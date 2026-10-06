import type * as THREE from 'three';
import type { QualityProfile } from './quality.js';
import type { Timeline, VehicleState } from './timeline.js';

/**
 * A level's runtime content: one object tree plus its per-frame update and a
 * dispose hook. Builders live in the branch folders and are loaded lazily, so a
 * branch that was never opened never costs bundle size (docs/M0-design-plan.md §6).
 */
export interface LevelContent {
  readonly group: THREE.Group;
  update(dt: number, elapsed: number, state: VehicleState): void;
  /** Called right before the group leaves the scene; must free GPU resources. */
  dispose(): void;
}

export interface BuildContext {
  readonly profile: QualityProfile;
  readonly timeline: Timeline;
}

export type LevelBuilder = (context: BuildContext) => LevelContent;
