import type * as THREE from 'three';
import type { Stage } from './renderer.js';
import type { QualityProfile } from './quality.js';

/**
 * Profiler overlay. It is only constructed when `?debug` is present, so in
 * production no readPixels() call or scene traversal happens (docs §6.1).
 */
export class DebugOverlay {
  #stage: Stage;
  #element: HTMLElement;
  #profile: QualityProfile;
  #samples: number[] = [];
  #lastUpdate = 0;
  #levelId = '-';

  constructor(stage: Stage, profile: QualityProfile, container: HTMLElement) {
    this.#stage = stage;
    this.#profile = profile;
    this.#element = document.createElement('pre');
    this.#element.className = 'c2a-debug';
    this.#element.setAttribute('aria-hidden', 'true');
    container.append(this.#element);
  }

  static enabled(search: string): boolean {
    return new URLSearchParams(search).has('debug');
  }

  setLevel(id: string): void {
    this.#levelId = id;
  }

  frame(now: number, scene: THREE.Scene): void {
    if (now - this.#lastUpdate < 250) return;
    this.#lastUpdate = now;
    const fps = this.#fps();
    const info = this.#stage.renderer.info;
    let objects = 0;
    scene.traverse(() => {
      objects += 1;
    });
    this.#element.textContent = [
      `fps      ${fps.toFixed(1)}`,
      `tier     ${this.#profile.tier}`,
      `objects  ${objects}`,
      `calls    ${info.render.calls}`,
      `tris     ${info.render.triangles}`,
      `geoms    ${info.memory.geometries}`,
      `textures ${info.memory.textures}`,
      `level    ${this.#levelId}`,
      `dpr      ${this.#stage.renderer.getPixelRatio().toFixed(2)}`,
    ].join('\n');
  }

  #fps(): number {
    const now = performance.now();
    this.#samples.push(now);
    while (this.#samples.length > 0 && now - this.#samples[0]! > 1000) this.#samples.shift();
    return this.#samples.length;
  }

  destroy(): void {
    this.#element.remove();
  }
}
