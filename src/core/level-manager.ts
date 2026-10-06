import * as THREE from 'three';
import type { CameraRig } from './camera-rig.js';
import type { BuildContext, LevelBuilder, LevelContent } from './level-content.js';
import type { LevelRegistry, LevelSpec } from './level-registry.js';
import type { ViewMode } from './modes.js';
import { setObjectOpacity } from '../materials/index.js';
import { poseForLevel, seamBands } from './seam.js';

interface ActiveLevel {
  spec: LevelSpec;
  content: LevelContent;
}

export interface ActivateOptions {
  immediate?: boolean;
  duration?: number;
}

/**
 * Owns the currently mounted level and the transition between two levels.
 *
 * During a seam the outgoing and incoming content cross-fade while the rig
 * interpolates world poses; once the move settles the outgoing tree is disposed
 * so only the active level costs draw calls.
 */
export class LevelManager {
  readonly root = new THREE.Group();

  #registry: LevelRegistry;
  #builders: ReadonlyMap<string, LevelBuilder>;
  #context: BuildContext;
  #rig: CameraRig;
  #current: ActiveLevel | null = null;
  #incoming: ActiveLevel | null = null;
  #mode: ViewMode = 'tour';
  #onLevelChange: ((spec: LevelSpec) => void) | null = null;

  constructor(
    scene: THREE.Scene,
    registry: LevelRegistry,
    builders: ReadonlyMap<string, LevelBuilder>,
    context: BuildContext,
    rig: CameraRig,
  ) {
    this.#registry = registry;
    this.#builders = builders;
    this.#context = context;
    this.#rig = rig;
    this.root.name = 'levels';
    scene.add(this.root);
  }

  get currentSpec(): LevelSpec | null {
    return this.#current?.spec ?? null;
  }

  get currentContent(): LevelContent | null {
    return this.#current?.content ?? null;
  }

  get transitioning(): boolean {
    return this.#incoming !== null;
  }

  setOnLevelChange(callback: (spec: LevelSpec) => void): void {
    this.#onLevelChange = callback;
  }

  get mode(): ViewMode {
    return this.#mode;
  }

  /** Forwards a view mode to whichever level is mounted (and one mid-seam). */
  setMode(mode: ViewMode): void {
    this.#mode = mode;
    this.#current?.content.setMode?.(mode);
    this.#incoming?.content.setMode?.(mode);
  }

  /** Resolves `id`, mounts it and starts the seam. Safe to call with any id. */
  activate(id: string, options: ActivateOptions = {}): LevelSpec {
    const spec = this.#registry.resolve(id);

    if (this.#current?.spec.id === spec.id) {
      // Asking for the level we are already on cancels an in-flight seam and
      // restores the current level instead of leaving two trees mid-fade.
      if (this.#incoming) {
        this.#disposeLevel(this.#incoming);
        this.#incoming = null;
        setObjectOpacity(this.#current.content.group, 1);
        this.#current.content.group.scale.setScalar(1);
        const pose = poseForLevel(spec.camera, this.#rig.camera.aspect, spec.frame);
        this.#rig.goTo(pose, { duration: options.duration ?? 0.4 });
      }
      return spec;
    }
    if (this.#incoming?.spec.id === spec.id) return spec;

    const builder = this.#builders.get(spec.id);
    if (!builder) {
      // Levels without dedicated geometry yet fall back to an empty group.
      return spec;
    }

    if (!this.#current || options.immediate) {
      if (this.#incoming) {
        this.#disposeLevel(this.#incoming);
        this.#incoming = null;
      }
      if (this.#current) this.#disposeLevel(this.#current);
      const content = builder(this.#context);
      this.root.add(content.group);
      setObjectOpacity(content.group, 1);
      content.setMode?.(this.#mode);
      this.#current = { spec, content };
      const pose = poseForLevel(spec.camera, this.#rig.camera.aspect, spec.frame);
      this.#rig.goTo(pose, { duration: options.immediate ? 0 : (options.duration ?? 1.6) });
      this.#onLevelChange?.(spec);
      return spec;
    }

    // A transition is already running: snap the old incoming level out of the way.
    if (this.#incoming) this.#disposeLevel(this.#incoming);
    const content = builder(this.#context);
    setObjectOpacity(content.group, 0);
    content.setMode?.(this.#mode);
    this.root.add(content.group);
    this.#incoming = { spec, content };
    const pose = poseForLevel(spec.camera, this.#rig.camera.aspect, spec.frame);

    this.#rig.goTo(pose, {
      duration: options.duration ?? 1.6,
      onProgress: (t) => this.#applySeam(t),
    });
    return spec;
  }

  #applySeam(t: number): void {
    // The rig may report t=1 twice (once from the eased frame, once when it
    // finalises); after the first settle there is nothing left to fade, and
    // re-applying `from` bands would blank the freshly settled level.
    if (!this.#incoming) return;
    if (t >= 1) {
      this.#settle();
      return;
    }
    const bands = seamBands(t);
    if (this.#current) {
      setObjectOpacity(this.#current.content.group, bands.from);
      this.#current.content.group.scale.setScalar(bands.fromScale);
    }
    setObjectOpacity(this.#incoming.content.group, bands.to);
    this.#incoming.content.group.scale.setScalar(bands.toScale);
  }

  #settle(): void {
    if (!this.#incoming) return;
    const settled = this.#incoming;
    this.#incoming = null;
    if (this.#current) this.#disposeLevel(this.#current);
    setObjectOpacity(settled.content.group, 1);
    settled.content.group.scale.setScalar(1);
    this.#current = settled;
    this.#onLevelChange?.(settled.spec);
  }

  #disposeLevel(level: ActiveLevel): void {
    this.root.remove(level.content.group);
    level.content.dispose();
  }

  update(dt: number, elapsed: number, state: Parameters<LevelContent['update']>[2]): void {
    this.#current?.content.update(dt, elapsed, state);
    this.#incoming?.content.update(dt, elapsed, state);
  }

  dispose(): void {
    if (this.#current) this.#disposeLevel(this.#current);
    if (this.#incoming) this.#disposeLevel(this.#incoming);
    this.#current = null;
    this.#incoming = null;
    this.root.removeFromParent();
  }
}
