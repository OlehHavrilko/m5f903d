import * as THREE from 'three';
import { DEFAULT_FOV_DEG, easeInOutCubic, interpolatePose, type CameraPose } from './seam.js';

export interface RigTransitionOptions {
  duration?: number;
  /** Called every frame with eased progress 0…1 while transitioning. */
  onProgress?: (t: number) => void;
  reducedMotion?: boolean;
}

/**
 * Orbital camera with seamless level-to-level transitions.
 *
 * Free orbit is expressed as a spherical offset from the active target, so it
 * resumes cleanly after a transition. During a transition the rig interpolates
 * toward the destination pose and ignores user orbit input, which keeps the
 * "single continuous flight" promise (docs/M0-design-plan.md §4.2).
 */
export class CameraRig {
  readonly camera: THREE.PerspectiveCamera;

  #pose: CameraPose;
  #from: CameraPose;
  #to: CameraPose;
  #t = 1;
  #duration = 1.6;
  #onProgress: ((t: number) => void) | null = null;
  #reducedMotion = false;
  #yaw = 0;
  #pitch = 0;
  #radius = 1;
  #target = new THREE.Vector3();

  constructor(camera: THREE.PerspectiveCamera, initial: CameraPose) {
    this.camera = camera;
    this.#pose = clonePose(initial);
    this.#from = clonePose(initial);
    this.#to = clonePose(initial);
    this.#syncOrbitFromPose();
    this.applyToCamera();
  }

  get pose(): CameraPose {
    return this.#pose;
  }

  get transitioning(): boolean {
    return this.#t < 1;
  }

  get progress(): number {
    return this.#t;
  }

  cloneOfPose(): CameraPose {
    return clonePose(this.#pose);
  }

  setReducedMotion(reduced: boolean): void {
    this.#reducedMotion = reduced;
  }

  #syncOrbitFromPose(): void {
    this.#target.copy(this.#pose.target);
    const offset = this.#pose.position.clone().sub(this.#target);
    this.#radius = Math.max(1e-6, offset.length());
    this.#yaw = Math.atan2(offset.x, offset.z);
    this.#pitch = Math.asin(THREE.MathUtils.clamp(offset.y / this.#radius, -1, 1));
  }

  #writeOrbitToPose(): void {
    const cosPitch = Math.cos(this.#pitch);
    this.#pose.target.copy(this.#target);
    this.#pose.position.set(
      this.#target.x + this.#radius * cosPitch * Math.sin(this.#yaw),
      this.#target.y + this.#radius * Math.sin(this.#pitch),
      this.#target.z + this.#radius * cosPitch * Math.cos(this.#yaw),
    );
  }

  /** Starts (or instantly applies) a move to a new level pose. */
  goTo(pose: CameraPose, options: RigTransitionOptions = {}): void {
    this.#from = clonePose(this.#pose);
    this.#to = clonePose(pose);
    this.#t = 0;
    this.#duration = this.#reducedMotion ? 0.001 : (options.duration ?? 1.6);
    this.#onProgress = options.onProgress ?? null;
    if (this.#duration <= 0.001) this.#finishTransition();
  }

  #finishTransition(): void {
    this.#pose = clonePose(this.#to);
    this.#t = 1;
    this.#onProgress?.(1);
    this.#onProgress = null;
    this.#syncOrbitFromPose();
    this.applyToCamera();
  }

  /** Free orbit by screen-space deltas (radians). */
  orbit(deltaYaw: number, deltaPitch: number): void {
    if (this.transitioning) return;
    this.#yaw += deltaYaw;
    const limit = Math.PI / 2 - 0.02;
    this.#pitch = THREE.MathUtils.clamp(this.#pitch - deltaPitch, -limit, limit);
    this.#writeOrbitToPose();
  }

  /** Multiplicative dolly; `factor < 1` moves closer. */
  dolly(factor: number): void {
    if (this.transitioning) return;
    const next = THREE.MathUtils.clamp(this.#radius * factor, this.#pose.fovMeters * 0.35, 1e6);
    this.#radius = next;
    this.#writeOrbitToPose();
  }

  /** Moves the orbit target by a world-space delta. */
  pan(delta: THREE.Vector3): void {
    if (this.transitioning) return;
    this.#target.add(delta);
    this.#writeOrbitToPose();
  }

  update(dt: number): void {
    if (this.transitioning) {
      const step = dt / this.#duration;
      this.#t = Math.min(1, this.#t + step);
      const eased = easeInOutCubic(this.#t);
      this.#pose = interpolatePose(this.#from, this.#to, eased);
      this.#onProgress?.(eased);
      if (this.#t >= 1) this.#finishTransition();
    }
    this.applyToCamera();
  }

  applyToCamera(): void {
    this.camera.position.copy(this.#pose.position);
    this.camera.up.set(0, 1, 0);
    this.camera.lookAt(this.#pose.target);
    if (Math.abs(this.camera.fov - this.#pose.fovDeg) > 1e-4) {
      this.camera.fov = this.#pose.fovDeg || DEFAULT_FOV_DEG;
      this.camera.updateProjectionMatrix();
    }
  }
}

function clonePose(pose: CameraPose): CameraPose {
  return {
    position: pose.position.clone(),
    target: pose.target.clone(),
    fovMeters: pose.fovMeters,
    fovDeg: pose.fovDeg,
  };
}
