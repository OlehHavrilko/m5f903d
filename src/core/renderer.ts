import * as THREE from 'three';
import type { QualityProfile } from './quality.js';

export class WebGLUnavailableError extends Error {
  constructor(message = 'WebGL is not available in this browser') {
    super(message);
    this.name = 'WebGLUnavailableError';
  }
}

/** Probes for WebGL1 or WebGL2 without leaking the probe context. */
export function isWebGLAvailable(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ??
      canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl');
    if (!gl) return false;
    const lose = (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context');
    lose?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export interface StageCallbacks {
  onContextLost?: () => void;
  onContextRestored?: () => void;
  onResize?: (width: number, height: number) => void;
}

/**
 * Owns the WebGLRenderer, the root scene and the resize/context-loss plumbing.
 * The render loop lives here so visual baselines can drive it with a fixed dt.
 */
export class Stage {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly profile: QualityProfile;

  #canvas: HTMLCanvasElement;
  #frame = 0;
  #lastTimestamp = 0;
  #running = false;
  #dprScale = 1;
  #callbacks: StageCallbacks;
  #resizeObserver: ResizeObserver | null = null;
  #onLost: (event: Event) => void;
  #onRestored: () => void;

  constructor(canvas: HTMLCanvasElement, profile: QualityProfile, callbacks: StageCallbacks = {}) {
    this.#canvas = canvas;
    this.profile = profile;
    this.#callbacks = callbacks;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: profile.antialias,
        alpha: false,
        depth: true,
        stencil: false,
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: false,
      });
    } catch (error) {
      throw new WebGLUnavailableError(String(error));
    }
    if (!renderer.getContext()) throw new WebGLUnavailableError();

    this.renderer = renderer;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setPixelRatio(this.#effectiveDpr());
    renderer.shadowMap.enabled = profile.tier !== 'low';
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);

    this.camera = new THREE.PerspectiveCamera(38, 1, 0.01, 5000);
    this.camera.position.set(7, 3, 9);

    this.#onLost = (event: Event) => {
      event.preventDefault();
      this.#running = false;
      this.#callbacks.onContextLost?.();
    };
    this.#onRestored = () => {
      this.#callbacks.onContextRestored?.();
    };
    canvas.addEventListener('webglcontextlost', this.#onLost as EventListener, false);
    canvas.addEventListener('webglcontextrestored', this.#onRestored, false);

    this.resize();
    this.#observeResize();
  }

  #effectiveDpr(): number {
    const dpr = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;
    return Math.min(dpr, this.profile.maxPixelRatio) * this.#dprScale;
  }

  #observeResize(): void {
    const parent = this.#canvas.parentElement ?? this.#canvas;
    if (typeof ResizeObserver !== 'undefined') {
      this.#resizeObserver = new ResizeObserver(() => this.resize());
      this.#resizeObserver.observe(parent);
    }
    globalThis.addEventListener?.('resize', this.#handleWindowResize);
  }

  #handleWindowResize = (): void => {
    this.resize();
  };

  /** Recomputes size from the canvas' layout box. */
  resize(): void {
    const rect = this.#canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width || this.#canvas.clientWidth || 1));
    const height = Math.max(1, Math.round(rect.height || this.#canvas.clientHeight || 1));
    this.renderer.setPixelRatio(this.#effectiveDpr());
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.#callbacks.onResize?.(width, height);
  }

  setBackground(color: THREE.ColorRepresentation): void {
    (this.scene.background as THREE.Color).set(color);
  }

  /** Manual resolution scale (0.5…1), used by adaptive DPR. */
  setDprScale(scale: number): void {
    const next = Math.min(1, Math.max(0.5, scale));
    if (Math.abs(next - this.#dprScale) < 0.001) return;
    this.#dprScale = next;
    this.renderer.setPixelRatio(this.#effectiveDpr());
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  /** Starts a rAF loop. The update callback receives a clamped delta in seconds. */
  start(update: (dt: number, elapsed: number) => void): void {
    if (this.#running) return;
    this.#running = true;
    this.#lastTimestamp = 0;
    const tick = (timestamp: number) => {
      if (!this.#running) return;
      const dt = this.#lastTimestamp === 0 ? 1 / 60 : (timestamp - this.#lastTimestamp) / 1000;
      this.#lastTimestamp = timestamp;
      const clamped = Math.min(dt, 0.05);
      this.#frame += 1;
      update(clamped, this.#frame / 60);
      this.render();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  stop(): void {
    this.#running = false;
  }

  get running(): boolean {
    return this.#running;
  }

  dispose(): void {
    this.stop();
    this.#resizeObserver?.disconnect();
    globalThis.removeEventListener?.('resize', this.#handleWindowResize);
    this.#canvas.removeEventListener('webglcontextlost', this.#onLost as EventListener);
    this.#canvas.removeEventListener('webglcontextrestored', this.#onRestored);
    this.renderer.dispose();
  }
}
